export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    try {
      const existing = await getTagById(id);
      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Tag not found",
        });
      }

      await deleteTag(id);
      return jsonResponse({ success: true }, "Tag deleted successfully");
    } catch (error) {
      if (error instanceof H3Error) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to delete tag",
      });
    }
  },
  ["admin"],
);
