import { z } from "zod";

/**
 * Request body schema for creating a blog post.
 * Accepts fields in admin panel as either strings (single language) or full translation records.
 *
 * Fields:
 * - `slug`: URL-friendly identifier (required, multilingual)
 * - `title`: Post headline (required, multilingual)
 * - `shortDescription`: Excerpt for listings (optional, multilingual)
 * - `content`: Full post body (required, multilingual)
 * - `status`: Publication status (draft, published, archived) - defaults to draft
 * - `categoryIds`: Array of category IDs to assign (optional)
 * - `tagIds`: Array of tag IDs to assign (optional)
 *
 * @example
 * // String input (current language only):
 * {
 *   slug: "hello-world",
 *   title: "Hello World",
 *   content: "...",
 *   status: "published",
 *   categoryIds: [1, 2],
 *   tagIds: [1, 3, 5]
 * }
 */
export const CreatePostBodySchema = z.object({
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string().optional(),
  content: z.string(),
  status: z
    .enum(["draft", "published", "archived"])
    .optional()
    .default("draft"),
  categoryIds: z.array(z.number().int().positive()).optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
  featuredImageId: z.number().int().positive().optional(),
});

/**
 * Request body schema for updating a blog post.
 * All fields are optional - only provided fields are updated.
 * Uses same translation pattern as create, but allows partial updates.
 * Also supports updating categories and tags.
 */
export const UpdatePostBodySchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  shortDescription: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
  featuredImageId: z.number().int().positive().optional(),
});

/**
 * Request body schema for creating a public blog post.
 * Simpler than admin schema - expects single title and content strings.
 */
export const PublicCreatePostBodySchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  userId: z.number().int().positive(),
  published: z.boolean().optional().default(false),
});

// Type exports for TypeScript usage
export type CreatePostBody = z.infer<typeof CreatePostBodySchema>;
export type UpdatePostBody = z.infer<typeof UpdatePostBodySchema>;
export type PublicCreatePostBody = z.infer<typeof PublicCreatePostBodySchema>;
