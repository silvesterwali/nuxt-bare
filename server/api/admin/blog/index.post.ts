export default defineAuthHandler(
  async (event, { user, language }) => {
    try {
      const {
        slug,
        title,
        shortDescription,
        content,
        status,
        categoryIds,
        tagIds,
        featuredImageId,
      } = await readValidatedBody(event, CreatePostBodySchema.parse);

      const newPost = await postRepository.create({
        slug: normalize(slug, language),
        title: normalize(title, language),
        shortDescription: normalize(shortDescription, language),
        content: normalize(content, language),
        userId: user.id,
        status,
        featuredImageId,
      });

      if (!newPost) {
        throw new Error("Failed to create blog post");
      }

      // Add categories if provided
      if (categoryIds && categoryIds.length > 0) {
        await updatePostCategories(newPost.id, categoryIds);
      }

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        await updatePostTags(newPost.id, tagIds);
      }

      // Return post with categories and tags
      const postWithRelations = await getPostById(newPost.id, language);
      return jsonResponse(postWithRelations, "Blog post created successfully");
    } catch (error) {
      if (error instanceof H3Error) {
        throw createError({
          statusCode: error.statusCode,
          statusMessage: error.statusMessage,
          data: JSON.parse(error.data.message),
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        data:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? { message: error.message, stack: error.stack }
            : undefined,
      });
    }
  },
  ["admin"],
);
