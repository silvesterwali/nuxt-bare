export default defineEventHandler(async (event) => {
  return jsonResponse({ message: "Hello from API!" });
});
