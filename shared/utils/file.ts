export const FILE_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function convertToWebp(file: File): Promise<File> {
  // Placeholder: implement actual conversion as needed.
  return Promise.resolve(file);
}

function reduceImageSize(file: File): Promise<File> {
  // Placeholder: implement actual resizing as needed.
  return Promise.resolve(file);
}
