export default defineAuthHandler(
  async (event, { user, language }) => {
    const id = Number(getRouterParam(event, "id"));
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
    }

    const post = await postRepository.findById(id);
    if (!post) {
      throw createError({ statusCode: 404, statusMessage: "Post not found" });
    }

    // Return full post with multi-language data for editing
    return jsonResponse(post, "Post retrieved");
  },
  ["admin"]
);
