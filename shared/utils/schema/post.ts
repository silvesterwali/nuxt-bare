import { z } from "zod";

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

export const PublicCreatePostBodySchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  userId: z.number().int().positive(),
  published: z.boolean().optional().default(false),
});

export const adminBlogQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const publicBlogQuerySchema = z.object({
  search: z.string().optional(),
  lang: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type CreatePostBody = z.infer<typeof CreatePostBodySchema>;
export type UpdatePostBody = z.infer<typeof UpdatePostBodySchema>;
export type PublicCreatePostBody = z.infer<typeof PublicCreatePostBodySchema>;
export type AdminBlogQuery = z.infer<typeof adminBlogQuerySchema>;
export type PublicBlogQuery = z.infer<typeof publicBlogQuerySchema>;
