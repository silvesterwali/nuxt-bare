import { useValidatedParams } from "h3-zod";

export default defineProtectedHandler(async (event) => {
  const session = await getUserSession(event);
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Delete the media
  const deletedMedia = await deleteMedia(id, session!.user!.id);

  return jsonResponse(deletedMedia, "Media deleted successfully");
});
