export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug is required" });
  }

  const acceptLanguage =
    getRequestHeader(event, "accept-language")?.split(",")[0] || "en";
  const query = getQuery(event);
  const language = (query.lang as string) || acceptLanguage;

  const post = await getPublicPostBySlug(slug, language);
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Post not found" });
  }

  return jsonResponse(post, "Post retrieved");
});
