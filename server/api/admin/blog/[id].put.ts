export default defineAuthHandler(
  async (event, { language }) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    try {
      const data = await readValidatedBody(event, UpdatePostBodySchema.parse);
      const { categoryIds, tagIds, featuredImageId, ...postData } = data;

      // Check if post exists
      const existing = await postRepository.findById(id);
      if (!existing) {
        throw createError({ statusCode: 404, statusMessage: "Post not found" });
      }

      // Merge with existing translations rather than overwrite entire object
      const merged: any = {};
      if (postData.slug) {
        merged.slug = {
          ...existing.slug,
          ...normalize(postData.slug, language),
        };
      }
      if (postData.title) {
        merged.title = {
          ...existing.title,
          ...normalize(postData.title, language),
        };
      }
      if (postData.shortDescription) {
        merged.shortDescription = {
          ...existing.shortDescription,
          ...normalize(postData.shortDescription, language),
        };
      }
      if (postData.content) {
        merged.content = {
          ...existing.content,
          ...normalize(postData.content, language),
        };
      }
      if (postData.status) {
        merged.status = postData.status;
      }

      if (featuredImageId !== undefined) {
        merged.featuredImageId = featuredImageId;
      }

      const updated = await postRepository.update(id, merged);

      // Update categories if provided
      if (categoryIds !== undefined) {
        await updatePostCategories(id, categoryIds);
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        await updatePostTags(id, tagIds);
      }

      // Return post with categories and tags
      const postWithRelations = await getPostById(id, language);
      return jsonResponse(postWithRelations, "Post updated successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Invalid post update data",
      });
    }
  },
  ["admin"],
);
