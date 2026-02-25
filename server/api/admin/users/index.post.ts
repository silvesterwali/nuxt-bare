import { useValidatedBody } from "h3-zod";
import type { UserRole } from "~/types/db";

export default defineAuthHandler(
  async (event) => {
    const body = await useValidatedBody(event, createUserSchema);

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
  },
  ["admin"],
);
