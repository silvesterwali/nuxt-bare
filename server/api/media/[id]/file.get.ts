export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

  // Get current user (may be null for public media)
  const session = await getUserSession(event);
  const userId = session?.user?.id;

  // Get media record (this checks permissions)
  const media = await getMediaById(id, userId);

  // Read the file from Nitro storage (binary)
  const storage = useStorage("file");
  const item = await storage.getItemRaw(media.filename);

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }

  let fileBuffer: Buffer;

  if (Buffer.isBuffer(item)) {
    fileBuffer = item;
  } else if (typeof item === "string") {
    // Previously stored values may have been JSON-serialized (Buffer -> {type:'Buffer', data:[...]})
    try {
      const parsed = JSON.parse(item);
      if (
        parsed?.type === "Buffer" &&
        Array.isArray(parsed.data) &&
        parsed.data.every((n: any) => typeof n === "number")
      ) {
        fileBuffer = Buffer.from(parsed.data);
      } else {
        fileBuffer = Buffer.from(item);
      }
    } catch {
      fileBuffer = Buffer.from(item);
    }
  } else {
    fileBuffer = Buffer.from(item as Uint8Array);
  }

  // Set appropriate headers
  setHeader(event, "Content-Type", media.mimeType);
  setHeader(event, "Content-Length", fileBuffer.length);
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
});
