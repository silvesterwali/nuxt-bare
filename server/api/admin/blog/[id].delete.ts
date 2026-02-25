import { useValidatedParams } from "h3-zod";

export default defineAuthHandler(
  async (event) => {
    const { id } = await useValidatedParams(event, paramsIdSchema);

    const existing = await postRepository.findById(id);
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: "Post not found" });
    }

    await postRepository.destroy(id);

    return jsonResponse({ success: true }, "Post deleted successfully");
  },
  ["admin"],
);
