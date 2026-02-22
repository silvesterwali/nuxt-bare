export default defineEventHandler(async (event) => {
  const clientIP = getClientIP(event);

  // Rate limiting
  await checkRateLimit(`registration:${clientIP}`, RATE_LIMITS.REGISTRATION);

  const body = registerSchema.parse(await readBody(event));

  // Use AuthService
  const { user, token } = await authService.register({
    email: body.email,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
  });

  // Send verification email
  try {
    await sendVerificationEmail(user.email, token!.token);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't fail registration if email fails
  }

  return jsonResponse(
    {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    "Registration successful. Please check your email to verify your account.",
  );
});
