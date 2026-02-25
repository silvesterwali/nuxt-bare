export default defineAuthHandler(
  async (_event, { language }) => {
    try {
      const categories = await getAllCategories(language);
      return jsonResponse(categories, "Categories retrieved successfully");
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch categories",
      });
    }
  },
  ["admin"],
);
