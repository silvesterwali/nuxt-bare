import { useValidatedBody } from "h3-zod";

export default defineEventHandler(async (event) => {
  const clientIP = getClientIP(event);

  // Rate limiting
  await checkRateLimit(`login:${clientIP}`, RATE_LIMITS.LOGIN);

  const body = await useValidatedBody(event, loginSchema);

  // Use AuthService (Application Layer)
  const user = await authService.login(body);

  // Set user session (using nuxt-auth-utils)
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role as "admin" | "user" | "moderator",
      emailVerified: user.emailVerified,
    },
  });

  return jsonResponse(
    {
      id: user.id,
      email: user.email,
      role: user.role as "admin" | "user" | "moderator",
      emailVerified: user.emailVerified,
    },
    "Login successful",
  );
});
