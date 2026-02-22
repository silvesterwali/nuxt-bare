import { z } from "zod";
import { useValidatedBody } from "h3-zod";
// import { findUserByEmail, createUserToken } from "../../utils/auth";

const resetRequestSchema = z.object({
  email: z.email(),
});

export default defineEventHandler(async (event) => {
  const clientIP = getClientIP(event);

  // Rate limiting
  await checkRateLimit(
    `password-reset:${clientIP}`,
    RATE_LIMITS.PASSWORD_RESET,
  );

  const body = await useValidatedBody(event, resetRequestSchema); // Note: Missing semicolon in original

  // Use AuthService
  const result = await authService.requestPasswordReset(body.email);

  if (typeof result !== "boolean") {
    // Send reset email
    try {
      await sendPasswordResetEmail(body.email, result?.token ?? "");
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  // Always return success to prevent email enumeration
  return jsonResponse(
    undefined,
    "If an account with this email exists, you will receive a password reset link shortly.",
  );
});
