export default defineAuthHandler(async (event, { user }) => {
  const session = user;
  const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

  // Delete the media
  const deletedMedia = await deleteMedia(id, session.id);

  return jsonResponse(deletedMedia, "Media deleted successfully");
});
