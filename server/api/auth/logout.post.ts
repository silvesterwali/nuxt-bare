export default defineAuthHandler(async (event) => {
  // Clear user session
  await clearUserSession(event);

  return jsonResponse(undefined, "Logged out successfully");
});
