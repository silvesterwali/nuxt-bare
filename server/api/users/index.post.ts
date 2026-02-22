import { z } from "zod";
import { useValidatedBody } from "h3-zod";

const BodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
});

export default defineEventHandler(async (event) => {
  try {
    const { name, email } = await useValidatedBody(event, BodySchema);

    // Using UserRepository from Domain Layer
    const newUser = await userRepository.create({
      name,
      email,
    });

    return jsonResponse(newUser, "User created");
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : "Invalid user data",
    });
  }
});
