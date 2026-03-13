import { extname } from "node:path";

const MIME_MAP: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".json": "application/json",
};

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Missing file name" });
  }

  const storage = useStorage("file");
  const fileData = await storage.getItemRaw(name);

  if (!fileData) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }

  const buffer =
    Buffer.isBuffer(fileData) || fileData instanceof Uint8Array
      ? Buffer.from(fileData as Uint8Array)
      : Buffer.from(fileData as string);

  const ext = extname(name).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";

  setHeader(event, "Content-Type", contentType);
  setHeader(event, "Content-Disposition", `inline; filename="${name}"`);
  setHeader(event, "Content-Length", buffer.length);

  // Stream the file back
  return sendStream(
    event,
    new ReadableStream({
      start(controller) {
        controller.enqueue(buffer);
        controller.close();
      },
    }),
  );
});
