import { useValidatedBody } from "h3-zod";
import type { MediaType, MediaPrivacy } from "~/types/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  // Parse multipart form data
  const form = await readMultipartFormData(event);
  if (!form) {
    throw createError({
      statusCode: 400,
      statusMessage: "No form data provided",
    });
  }

  // Find the file and metadata
  const fileData = form.find((item) => item.name === "file");
  const typeData = form.find((item) => item.name === "type")?.data?.toString();
  const privacyData = form
    .find((item) => item.name === "privacy")
    ?.data?.toString();
  const descriptionData = form
    .find((item) => item.name === "description")
    ?.data?.toString();

  if (!fileData || !fileData.filename || !fileData.data) {
    throw createError({ statusCode: 400, statusMessage: "File is required" });
  }

  // Validate metadata
  const metadata = await useValidatedBody(event, uploadSchema, {
    // pass object manually
    body: {
      type: typeData,
      privacy: privacyData,
      description: descriptionData,
    },
  });

  // Create File object from form data
  const file = new File([new Uint8Array(fileData.data)], fileData.filename, {
    type: fileData.type || "application/octet-stream",
  });

  // Upload the file
  const mediaRecord = await uploadFile(
    file,
    session.user.id,
    metadata.type as MediaType,
    metadata.privacy as MediaPrivacy,
    metadata.description,
  );

  return jsonResponse(mediaRecord, "File uploaded successfully");
});
