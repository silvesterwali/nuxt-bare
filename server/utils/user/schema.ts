import { z } from "zod";

/**
 * Request body schema for creating a user (public registration).
 *
 * Fields:
 * - `name`: User's display name (required, 1-100 chars)
 * - `email`: User's email address (required, must be valid email)
 *
 * @example
 * {
 *   name: "John Doe",
 *   email: "john@example.com"
 * }
 */
export const CreateUserBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
});

// Type exports for TypeScript usage
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
