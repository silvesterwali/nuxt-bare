export default defineAuthHandler(async (_event, { user }) => {
  const _user = await userRepository.findByIdWithProfile(user.id);

  if (!_user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const { password, ...userWithoutPassword } = _user;

  return jsonResponse(userWithoutPassword);
});
