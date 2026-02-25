import { useValidatedParams } from "h3-zod";

export default defineAuthHandler(async (event, { user }) => {
  const session = user;
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Delete the media
  const deletedMedia = await deleteMedia(id, session.id);

  return jsonResponse(deletedMedia, "Media deleted successfully");
});
