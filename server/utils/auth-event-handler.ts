import { createError, defineEventHandler, H3Event } from "h3";
interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
}
/**
 * A helper to define authenticated API handlers with optional role-based permissions.
 * It checks for a valid user session and verifies permissions before executing the handler.
 *
 * @param handler - The main logic of the API endpoint, which receives the event and user context.
 * @param permissions - An optional array of roles that are allowed to access this endpoint.
 * @returns A wrapped event handler that enforces authentication and authorization.
 */
export const defineAuthHandler = <T>(
  handler: (event: H3Event, context: { user: User }) => T | Promise<T>,
  permissions?: string[],
) => {
  return defineEventHandler(async (event) => {
    const { user } = await getUserSession(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    if (permissions && !permissions.includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }

    return handler(event, { user });
  });
};
