import type { MediaType, MediaPrivacy } from "~/types/db";
import { uploadFile } from "~~/server/utils/media/service";
import { z } from "zod";

export default defineAuthHandler(async (event, { user }) => {
  const form = await readFormData(event);

  const file = form.get("file") as File;
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "No file provided" });
  }

  const payload = {
    type: form.get("type") as string as MediaType,
    privacy: form.get("privacy") as string as MediaPrivacy,
    description: (form.get("description") as string | null) ?? "",
    folderName:
      (form.get("folderName") as string) ||
      (form.get("folder") as string) ||
      "",
    alt:
      (form.get("alt") as string) ||
      (form.get("altText") as string) ||
      (form.get("alt_text") as string) ||
      "",
  };

  try {
    const { type, privacy, description, folderName } =
      uploadSchema.parse(payload);

    const media = await uploadFile(
      file,
      user.id,
      type,
      privacy,
      description,
      folderName,
    );

    if (!media) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to upload file",
      });
    }

    return jsonResponse({ ...media }, "File uploaded successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input",
        data: JSON.parse(err.message),
      });
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: "An unexpected error occurred",
      });
    }
  }
});
