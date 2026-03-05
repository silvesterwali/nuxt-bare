export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    const existing = await postRepository.findById(id);
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: "Post not found" });
    }

    await postRepository.destroy(id);

    return jsonResponse({ success: true }, "Post deleted successfully");
  },
  ["admin"],
);
