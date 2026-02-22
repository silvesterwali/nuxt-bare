import { useValidatedParams } from "h3-zod";

export default defineEventHandler(async (event) => {
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Get current user (may be null for public media)
  const session = await getUserSession(event);
  const userId = session?.user?.id;

  // Get media record
  const media = await getMediaById(id, userId);

  return jsonResponse(media);
});
