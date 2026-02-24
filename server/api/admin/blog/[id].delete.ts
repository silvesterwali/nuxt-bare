export default defineAuthHandler(
  async (event, { user }) => {
    const id = Number(getRouterParam(event, "id"));
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
    }

    const existing = await postRepository.findById(id);
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: "Post not found" });
    }

    await postRepository.destroy(id);

    return jsonResponse({ success: true }, "Post deleted successfully");
  },
  ["admin"]
);
