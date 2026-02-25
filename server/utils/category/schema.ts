import { z } from "zod";

/**
 * Request body schema for creating a category.
 *
 * Fields:
 * - `name`: Category display name (required, multilingual)
 * - `slug`: URL-friendly identifier (required, multilingual)
 * - `description`: Category description (optional, multilingual)
 * - `color`: Hex color code for UI (optional)
 *
 * @example
 * {
 *   name: "Technology",
 *   slug: "technology",
 *   description: "Tech-related posts",
 *   color: "#0066cc"
 * }
 */
export const CreateCategoryBodySchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

/**
 * Request body schema for updating a category.
 * All fields are optional for partial updates while preserving other languages.
 */
export const UpdateCategoryBodySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

// Type exports for TypeScript usage
export type CreateCategoryBody = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBodySchema>;
