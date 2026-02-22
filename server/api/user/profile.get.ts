export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const user = await userRepository.findByIdWithProfile(session.user.id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  // Don't return password hash
  // Using destructuring to exclude password
  const { password, ...userWithoutPassword } = user;

  return jsonResponse(userWithoutPassword);
});
