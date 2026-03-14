export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    try {
      const existing = await getCategoryById(id);
      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Category not found",
        });
      }

      await deleteCategory(id);
      return jsonResponse({ success: true }, "Category deleted successfully");
    } catch (error) {
      if (error instanceof H3Error) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to delete category",
      });
    }
  },
  ["admin"],
);
