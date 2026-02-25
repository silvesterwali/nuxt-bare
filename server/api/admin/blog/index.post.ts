import { useValidatedBody } from "h3-zod";

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
      } = await useValidatedBody(event, CreatePostBodySchema);

      const newPost = await postRepository.create({
        slug: normalize(slug, language),
        title: normalize(title, language),
        shortDescription: normalize(shortDescription, language),
        content: normalize(content, language),
        userId: user.id,
        status,
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
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Invalid post data",
      });
    }
  },
  ["admin"],
);
