export default defineAuthHandler(async (_event, { user }) => {
  return jsonResponse(user);
});
