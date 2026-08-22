import { tokenRepository } from "../../../../utils/auth/token.repository";
import { sendVerificationEmail } from "../../../../utils/common/email";

/**
 * POST /api/admin/users/:id/resend-verification
 *
 * Admin-only endpoint to resend an email verification link.
 * Creates a fresh token and sends the email. Rate-limited to prevent abuse.
 */
export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    // Fetch the user
    const user = await userRepository.findById(id);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    if (user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: "User email is already verified",
      });
    }

    // Create a fresh verification token (replaces any existing one)
    const token = await tokenRepository.create(user.id, "email_verification");

    if (!token?.token) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create verification token",
      });
    }

    // Send the verification email
    await sendVerificationEmail(user.email, token.token);

    return jsonResponse(null, `Verification email sent to ${user.email}`);
  },
  {
    role: ["admin"],
    permissions: ["users"],
  },
);
