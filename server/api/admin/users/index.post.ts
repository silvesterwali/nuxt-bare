import type { UserRole } from "~/types/db";

export default defineAuthHandler(
  async (event) => {
    try {
      const body = await readValidatedBody(event, createUserSchema.parse);

      // Use authService to ensure consistent creation logic
      const result = await authService.register({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role as UserRole,
      });

      // Send verification/welcome email
      if (result.token) {
        try {
          await sendVerificationEmail(result.user.email, result.token.token);
        } catch (error) {
          console.error("Failed to send verification email:", error);
        }
      }

      return jsonResponse(result.user, "User created successfully");
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
