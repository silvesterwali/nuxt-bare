import { useValidatedBody } from "h3-zod";
import { PublicCreatePostBodySchema } from "../../utils/post/schema.ts";

export default defineAuthHandler(async (event) => {
  try {
    const { title, content, userId, published } = await useValidatedBody(
      event,
      PublicCreatePostBodySchema,
    );

    // Using PostRepository
    const newPost = await postRepository.create({
      title,
      content,
      userId,
      status: published ? "published" : "draft",
    });

    return jsonResponse(newPost, "Post created");
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : "Invalid post data",
    });
  }
});
