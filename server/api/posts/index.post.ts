import { z } from "zod";
import { useValidatedBody } from "h3-zod";

const BodySchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  userId: z.number().int().positive(),
  published: z.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
  try {
    const { title, content, userId, published } = await useValidatedBody(event, BodySchema);

    // Using PostRepository
    const newPost = await postRepository.create({
      title,
      content,
      userId,
      published,
    });

    return jsonResponse(newPost, "Post created");
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : "Invalid post data",
    });
  }
});
