export default defineEventHandler(async (event) => {
  // Get current user session
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }

  return jsonResponse(session.user);
});
