export default defineAuthHandler(
  async (_event, { language }) => {
    try {
      const tags = await getAllTags(language);
      return jsonResponse(tags, "Tags retrieved successfully");
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch tags",
      });
    }
  },
  ["admin"],
);
