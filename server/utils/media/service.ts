import { createWriteStream, existsSync, mkdirSync, unlink } from "fs";
import { promisify } from "util";
import { join } from "path";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "../../db";
import type { MediaType, MediaPrivacy } from "~/types/db";

const unlinkAsync = promisify(unlink);

export interface UploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const MEDIA_CONFIG = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    quality: 85,
    maxWidth: 2048,
    maxHeight: 2048,
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
} as const;

export function generateFilename(originalName: string, userId: number): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");
  const extension = originalName.split(".").pop() || "";
  return `${userId}_${timestamp}_${random}.${extension}`;
}

export function getMediaPath(filename: string): string {
  const uploadDir = join(process.cwd(), "uploads");
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  return join(uploadDir, filename);
}

export async function processImage(
  buffer: Buffer,
  config: UploadConfig,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let image = sharp(buffer);

  const metadata = await image.metadata();
  const { width = 0, height = 0 } = metadata;

  // Resize if needed
  if (config.maxWidth || config.maxHeight) {
    image = image.resize({
      width: config.maxWidth,
      height: config.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to WebP for better compression
  const processedBuffer = await image.webp({ quality: config.quality || 85 }).toBuffer();

  const finalMetadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    width: finalMetadata.width || width,
    height: finalMetadata.height || height,
  };
}

export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  const filePath = getMediaPath(filename);

  return new Promise((resolve, reject) => {
    const stream = createWriteStream(filePath);
    stream.write(buffer);
    stream.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

export async function createMediaRecord(data: {
  userId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  privacy: MediaPrivacy;
  width?: number;
  height?: number;
  description?: string;
}) {
  const result = await db
    .insert(schema.media)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (result.length === 0) {
    throw createError({ statusCode: 500, statusMessage: "Failed to create media record" });
  }

  return result[0];
}

export async function uploadFile(
  file: File,
  userId: number,
  type: MediaType,
  privacy: MediaPrivacy = "private",
  description?: string,
) {
  // Validate file type and size
  const config = type === "image" ? MEDIA_CONFIG.IMAGE : MEDIA_CONFIG.DOCUMENT;

  if (!(config.allowedTypes as readonly string[]).includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `File type ${file.type} is not allowed`,
    });
  }

  if (file.size > config.maxSize) {
    throw createError({
      statusCode: 400,
      statusMessage: `File size exceeds maximum allowed size of ${config.maxSize / 1024 / 1024}MB`,
    });
  }

  // Generate filename and get buffer
  const filename = generateFilename(file.name, userId);
  const buffer = Buffer.from(await file.arrayBuffer());

  let processedBuffer = buffer;
  let width: number | undefined;
  let height: number | undefined;
  let finalFilename = filename;

  // Process images
  if (type === "image") {
    const processed = await processImage(buffer, config as any);
    processedBuffer = Buffer.from(processed.buffer);
    width = processed.width;
    height = processed.height;

    // Update filename extension to .webp
    finalFilename = filename.replace(/\.[^.]+$/, ".webp");
  }

  // Save file
  await saveFile(processedBuffer, finalFilename);

  // Create database record
  const mediaRecord = await createMediaRecord({
    userId,
    filename: finalFilename,
    originalName: file.name,
    mimeType: type === "image" ? "image/webp" : file.type,
    size: processedBuffer.length,
    type,
    privacy,
    width,
    height,
    description,
  });

  return mediaRecord;
}

export async function getMediaById(id: number, userId?: number) {
  const mediaQuery = db
    .select({
      id: schema.media.id,
      filename: schema.media.filename,
      originalName: schema.media.originalName,
      mimeType: schema.media.mimeType,
      size: schema.media.size,
      type: schema.media.type,
      privacy: schema.media.privacy,
      width: schema.media.width,
      height: schema.media.height,
      description: schema.media.description,
      userId: schema.media.userId,
      createdAt: schema.media.createdAt,
    })
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);

  const media = (await mediaQuery)[0];

  if (!media) {
    throw createError({ statusCode: 404, statusMessage: "Media not found" });
  }

  // Check access permissions
  if (media.privacy === "private" && media.userId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }

  return media;
}

export async function deleteMedia(id: number, userId: number) {
  const media = await getMediaById(id, userId);

  if (media.userId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }

  // Delete from database
  await db.delete(schema.media).where(eq(schema.media.id, id));

  // Delete file from filesystem
  const filePath = getMediaPath(media.filename);
  try {
    await unlinkAsync(filePath);
  } catch (error) {
    // File might not exist, but don't fail the operation
    console.warn("Failed to delete file:", filePath, error);
  }

  return media;
}

export async function getUserMedia(
  userId: number,
  type?: MediaType,
  privacy?: MediaPrivacy,
  page = 1,
  limit = 20,
) {
  const conditions = [eq(schema.media.userId, userId)];

  if (type) {
    conditions.push(eq(schema.media.type, type));
  }

  if (privacy) {
    conditions.push(eq(schema.media.privacy, privacy));
  }

  const offset = (page - 1) * limit;
  const media = await db
    .select()
    .from(schema.media)
    .where(and(...conditions))
    .orderBy(desc(schema.media.createdAt))
    .limit(limit)
    .offset(offset);

  return media;
}
