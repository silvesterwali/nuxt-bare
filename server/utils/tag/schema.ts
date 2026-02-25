import { z } from "zod";

/**
 * Request body schema for creating a tag.
 *
 * Fields:
 * - `name`: Tag display name (required, multilingual)
 * - `slug`: URL-friendly identifier (required, multilingual)
 * - `color`: Hex color code for UI (optional)
 *
 * @example
 * {
 *   name: "JavaScript",
 *   slug: "javascript",
 *   color: "#f7df1e"
 * }
 */
export const CreateTagBodySchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  color: z.string().optional(),
});

/**
 * Request body schema for updating a tag.
 * All fields are optional for partial updates while preserving other languages.
 */
export const UpdateTagBodySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  color: z.string().optional(),
});

// Type exports for TypeScript usage
export type CreateTagBody = z.infer<typeof CreateTagBodySchema>;
export type UpdateTagBody = z.infer<typeof UpdateTagBodySchema>;
