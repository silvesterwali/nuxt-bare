import { useValidatedBody } from "h3-zod";
import { CreateUserBodySchema } from "../../utils/user/schema.ts";

export default defineEventHandler(async (event) => {
  try {
    const { name, email } = await useValidatedBody(event, CreateUserBodySchema);

    // Using UserRepository from Domain Layer
    const newUser = await userRepository.create({
      name,
      email,
    });

    return jsonResponse(newUser, "User created");
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : "Invalid user data",
    });
  }
});
