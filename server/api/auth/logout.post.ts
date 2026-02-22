export default defineEventHandler(async (event) => {
  // Clear user session
  await clearUserSession(event);

  return jsonResponse(undefined, "Logged out successfully");
});
