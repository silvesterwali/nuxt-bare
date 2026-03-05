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
  name: z.string().min(1, "Name is required"),
  // slug and description are optional on the request; we generate slug and
  // accept an empty description if needed
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  color: z.string().optional(),
});

/**
 * Request body schema for updating a category.
 * All fields are optional for partial updates while preserving other languages.
 */
export const UpdateCategoryBodySchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty"),
    slug: z.string().min(1, "Slug cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    color: z.string().optional(),
  })
  .partial(); // all fields optional for patch semantics

// Type exports for TypeScript usage
export type CreateCategoryBody = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBodySchema>;
