import { useValidatedParams } from "h3-zod";
import { readFile } from "fs/promises";

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Get current user (may be null for public media)
  const session = await getUserSession(event);
  const userId = session?.user?.id;

  // Get media record (this checks permissions)
  const media = await getMediaById(id, userId);

  // Read the file
  const filePath = getMediaPath(media.filename);

  try {
    const fileBuffer = await readFile(filePath);

    // Set appropriate headers
    setHeader(event, "Content-Type", media.mimeType);
    setHeader(event, "Content-Length", media.size);
    setHeader(
      event,
      "Content-Disposition",
      `inline; filename="${media.originalName}"`,
    );

    // Cache headers for public media
    if (media.privacy === "public") {
      setHeader(event, "Cache-Control", "public, max-age=31536000"); // 1 year
    }

    return fileBuffer;
  } catch (error) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }
});
