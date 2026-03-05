export default defineAuthHandler(
  async (event, { language }) => {
    try {
      const filters = await getValidatedQuery(
        event,
        adminBlogQuerySchema.parse,
      );
      return await getPosts(
        {
          search: filters.search,
          language,
        },
        {
          page: filters.page,
          limit: filters.limit,
        },
      );
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch blogs",
      });
    }
  },
  ["admin"],
);
