import { useValidatedQuery } from "h3-zod";
export default defineAuthHandler(
  async (event, { language }) => {
    try {
      const filters = await useValidatedQuery(event, adminBlogQuerySchema);
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
