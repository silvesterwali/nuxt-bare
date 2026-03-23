export default defineAuthHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const folders = await getUserMediaFolders(user.id);

  return jsonResponse(folders, "Media folders retrieved successfully");
});
