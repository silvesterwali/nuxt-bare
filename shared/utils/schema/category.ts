import { z } from "zod";

export const CreateCategoryBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().min(1, "Description is required").nullable().optional(),
  color: z.string().nullable().optional(),
});

// `null` explicitly clears a field; a missing key leaves it unchanged
export const UpdateCategoryBodySchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty"),
    slug: z.string().min(1, "Slug cannot be empty"),
    description: z.string().min(1, "Description cannot be empty").nullable(),
    color: z.string().nullable(),
  })
  .partial();

export type CreateCategoryBody = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBodySchema>;
