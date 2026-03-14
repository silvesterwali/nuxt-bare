export default defineAuthHandler(async (_event, { user }) => {
  const permissions = await permissionRepository.findByUserId(user.id);
  return jsonResponse(permissions, "User permissions retrieved");
});
