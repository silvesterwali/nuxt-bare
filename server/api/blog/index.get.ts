export default defineEventHandler(async (event) => {
  const acceptLanguage =
    getRequestHeader(event, "accept-language")?.split(",")[0] || "en";

  const filters = await getValidatedQuery(event, publicBlogQuerySchema.parse);
  const language = filters.lang || acceptLanguage;

  return getPublicPosts(
    {
      search: filters.search,
      language,
      categorySlug: filters.category,
      tagSlug: filters.tag,
    },
    {
      page: filters.page,
      limit: filters.limit,
    },
  );
});
