import { z } from "zod";

/**
 * Request body schema for uploading media files.
 *
 * Fields:
 * - `type`: Media type (image, document) - required
 * - `privacy`: Privacy level (private, public) - optional, defaults to private
 * - `description`: Optional description of the media
 *
 * @example
 * {
 *   type: "image",
 *   privacy: "public",
 *   description: "Profile picture"
 * }
 */
export const uploadSchema = z.object({
  type: z.enum(["image", "document"]),
  alt: z.string().optional(),
  privacy: z.enum(["private", "public"]).optional().default("public"),
  description: z.string().max(255).optional(),
});

/**
 * Query schema for media list endpoint.
 *
 * Allows filtering and pagination of media resources.
 *
 * Fields:
 * - `type`: Filter by media type (image, document)
 * - `privacy`: Filter by privacy level (private, public)
 * - `page`: Page number for pagination (optional)
 * - `limit`: Items per page (optional)
 *
 * @example
 * // Filter images that are public:
 * GET /api/media?type=image&privacy=public&page=1&limit=20
 */
export const MediaQuerySchema = z.object({
  type: z.enum(["image", "document"]).optional(),
  privacy: z.enum(["private", "public"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Type exports for TypeScript usage
export type UploadMedia = z.infer<typeof uploadSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
