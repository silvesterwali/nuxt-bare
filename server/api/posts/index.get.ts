export default defineEventHandler(async (event) => {
  try {
    const posts = await postRepository.findAll();

    // Wrap in standard list response; no pagination meta available yet
    return listResponse(posts, posts.length);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch posts",
    });
  }
});
