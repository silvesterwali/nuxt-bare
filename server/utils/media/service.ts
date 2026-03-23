import { randomBytes } from "crypto";
import sharp from "sharp";
import { and, asc, count, desc, eq, inArray, isNull, like } from "drizzle-orm";
import { db, schema } from "../../db";
import type { MediaType, MediaPrivacy } from "~/types/db";

export interface UploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const MEDIA_CONFIG = {
  IMAGE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    quality: 85,
    maxWidth: 2048,
    maxHeight: 2048,
    thumbnail: {
      maxWidth: 300,
      maxHeight: 300,
      quality: 70,
    },
  },
  DOCUMENT: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
} as const;

export function generateFilename(originalName: string, userId: number): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");
  const extension = originalName.split(".").pop() || "";
  return `${userId}_${timestamp}_${random}.${extension}`;
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
  const processedBuffer = await image
    .webp({ quality: config.quality || 85 })
    .toBuffer();

  const finalMetadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    width: finalMetadata.width || width,
    height: finalMetadata.height || height,
  };
}

export async function saveFile(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const storage = useStorage("file");
  // Use raw methods to avoid UTF-8 text encoding (which corrupts binary data)
  await storage.setItemRaw(filename, buffer);
  return filename;
}

export async function deleteFile(filename: string): Promise<void> {
  const storage = useStorage("file");
  await storage.removeItem(filename);
}

export async function createMediaRecord(data: {
  userId: number;
  folderId?: number | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  privacy: MediaPrivacy;
  width?: number;
  height?: number;
  description?: string;
  parentId?: number;
}) {
  const path = `/assets/${data.filename}`;
  const result = (await db
    .insert(schema.media)
    .values({
      ...data,
      path,
      full_path: path,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()) as any[];

  if (result.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create media record",
    });
  }

  return result[0];
}

export function normalizeMediaFolderName(folderName: string): string {
  return folderName.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function resolveMediaFolder(userId: number, folderName?: string) {
  const trimmedFolderName = folderName?.trim();
  if (!trimmedFolderName) {
    return null;
  }

  const normalizedName = normalizeMediaFolderName(trimmedFolderName);
  const existingFolder = (
    await db
      .select()
      .from(schema.mediaFolders)
      .where(
        and(
          eq(schema.mediaFolders.userId, userId),
          eq(schema.mediaFolders.normalizedName, normalizedName),
        ),
      )
      .limit(1)
  )[0];

  if (existingFolder) {
    const updates = {
      name: trimmedFolderName,
      updatedAt: new Date(),
    };

    await db
      .update(schema.mediaFolders)
      .set(updates)
      .where(eq(schema.mediaFolders.id, existingFolder.id));

    return {
      ...existingFolder,
      ...updates,
    };
  }

  const [createdFolder] = await db
    .insert(schema.mediaFolders)
    .values({
      userId,
      name: trimmedFolderName,
      normalizedName,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return createdFolder;
}

export async function uploadFile(
  file: File,
  userId: number,
  type: MediaType,
  privacy: MediaPrivacy = "private",
  description?: string,
  folderName?: string,
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

  // Save file to unstorage-backed filesystem
  await saveFile(processedBuffer, finalFilename);

  const folder = await resolveMediaFolder(userId, folderName);

  // Create database record for the main file
  const mediaRecord = await createMediaRecord({
    userId,
    folderId: folder?.id ?? null,
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

  // If we uploaded an image, also generate a thumbnail record
  let thumbnailRecord: ReturnType<typeof createMediaRecord> | null = null;

  if (type === "image") {
    const thumbnailBuffer = await sharp(processedBuffer)
      .resize({
        width: MEDIA_CONFIG.IMAGE.thumbnail.maxWidth,
        height: MEDIA_CONFIG.IMAGE.thumbnail.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: MEDIA_CONFIG.IMAGE.thumbnail.quality })
      .toBuffer();

    const thumbnailFilename = finalFilename.replace(
      /\.[^.]+$/,
      (match) => `_thumb${match}`,
    );

    await saveFile(thumbnailBuffer, thumbnailFilename);

    thumbnailRecord = await createMediaRecord({
      userId,
      folderId: folder?.id ?? null,
      filename: thumbnailFilename,
      originalName: file.name,
      mimeType: "image/webp",
      size: thumbnailBuffer.length,
      type,
      privacy,
      width: Math.min(width ?? 0, MEDIA_CONFIG.IMAGE.thumbnail.maxWidth),
      height: Math.min(height ?? 0, MEDIA_CONFIG.IMAGE.thumbnail.maxHeight),
      description,
      parentId: mediaRecord.id,
    });
  }

  return {
    ...mediaRecord,
    folder,
    folderName: folder?.name ?? null,
    thumbnail: thumbnailRecord,
  };
}

export async function getMediaById(id: number, userId?: number) {
  const mediaQuery = db
    .select({
      media: schema.media,
      folder: schema.mediaFolders,
    })
    .from(schema.media)
    .leftJoin(
      schema.mediaFolders,
      eq(schema.media.folderId, schema.mediaFolders.id),
    )
    .where(eq(schema.media.id, id))
    .limit(1);

  const media = (await mediaQuery)[0];

  if (!media) {
    throw createError({ statusCode: 404, statusMessage: "Media not found" });
  }

  const mediaRecord = {
    ...media.media,
    folder_name: media.folder?.name ?? null,
    folder: media.folder,
  };

  // Check access permissions
  if (mediaRecord.privacy === "private" && mediaRecord.userId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }

  // If this is a thumbnail, include the original media record too
  if (mediaRecord.parentId) {
    const original = (
      await db
        .select()
        .from(schema.media)
        .where(eq(schema.media.id, mediaRecord.parentId))
        .limit(1)
    )[0];

    return {
      ...mediaRecord,
      original,
    };
  }

  // Otherwise, include the thumbnail (if any)
  const thumbnail = (
    await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.parentId, mediaRecord.id))
      .limit(1)
  )[0];

  return {
    ...mediaRecord,
    thumbnail,
  };
}

export async function deleteMedia(id: number, userId: number) {
  const media = await getMediaById(id, userId);

  if (media.userId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }

  const thumbnailFilenames =
    media.parentId == null
      ? (
          await db
            .select({ filename: schema.media.filename })
            .from(schema.media)
            .where(eq(schema.media.parentId, id))
        ).map((thumbnail) => thumbnail.filename)
      : [];

  // Delete from database
  await db.delete(schema.media).where(eq(schema.media.id, id));

  // Delete file from storage
  try {
    await deleteFile(media.filename);
  } catch (error) {
    // File might not exist, but don't fail the operation
    console.warn("Failed to delete file:", media.filename, error);
  }

  // If this media has thumbnails, delete their files too.
  try {
    await Promise.all(
      thumbnailFilenames.map(async (thumbnailFilename) => {
        await deleteFile(thumbnailFilename);
      }),
    );
  } catch (error) {
    console.warn("Failed to delete thumbnail files for media:", id, error);
  }

  return media;
}

export async function getUserMedia(
  type?: MediaType,
  privacy?: MediaPrivacy,
  page = 1,
  limit = 20,
  userId?: number,
  folderName?: string,
) {
  const offset = (page - 1) * limit;
  const conditions = [isNull(schema.media.parentId)];

  if (userId) {
    conditions.push(eq(schema.media.userId, userId));
  }

  if (type) {
    conditions.push(eq(schema.media.type, type));
  }

  if (privacy) {
    conditions.push(eq(schema.media.privacy, privacy));
  }

  const normalizedFolderName = folderName?.trim().toLowerCase();
  if (normalizedFolderName) {
    conditions.push(
      like(schema.mediaFolders.normalizedName, `%${normalizedFolderName}%`),
    );
  }

  const whereClause = and(...conditions);
  const media = await db
    .select({
      media: schema.media,
      folder: schema.mediaFolders,
    })
    .from(schema.media)
    .leftJoin(
      schema.mediaFolders,
      eq(schema.media.folderId, schema.mediaFolders.id),
    )
    .where(whereClause)
    .orderBy(desc(schema.media.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ totalCount: count() })
    .from(schema.media)
    .leftJoin(
      schema.mediaFolders,
      eq(schema.media.folderId, schema.mediaFolders.id),
    )
    .where(whereClause);
  const totalCount = Number(countResult[0]?.totalCount ?? 0);

  // Attach thumbnails for each media item (if any)
  const mediaIds = media.map((item) => item.media.id);
  if (mediaIds.length === 0) {
    return {
      data: [],
      totalCount,
    };
  }

  const thumbnails = await db
    .select()
    .from(schema.media)
    .where(inArray(schema.media.parentId, mediaIds));

  const thumbnailsByParent = thumbnails.reduce(
    (acc, thumb) => {
      if (thumb.parentId) acc[thumb.parentId] = thumb;
      return acc;
    },
    {} as Record<number, (typeof thumbnails)[number]>,
  );

  return {
    data: media.map((item) => ({
      ...item.media,
      folder: item.folder,
      folderName: item.folder?.name ?? null,
      thumbnail: thumbnailsByParent[item.media.id] ?? null,
    })),
    totalCount,
  };
}

export async function getUserMediaFolders(userId: number) {
  return db
    .select()
    .from(schema.mediaFolders)
    .where(eq(schema.mediaFolders.userId, userId))
    .orderBy(asc(schema.mediaFolders.name));
}
