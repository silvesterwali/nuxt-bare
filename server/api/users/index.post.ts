export default defineAuthHandler(
  async (event) => {
    try {
      const { name, email } = await readValidatedBody(
        event,
        CreateUserBodySchema.parse,
      );

      const newUser = await userRepository.create({
        name,
        email,
      });

      return jsonResponse(newUser, "User created");
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
