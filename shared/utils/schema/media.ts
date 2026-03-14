import { z } from "zod";

export const uploadSchema = z.object({
  type: z.enum(["image", "document"]),
  alt: z.string().optional(),
  privacy: z.enum(["private", "public"]).optional().default("public"),
  description: z.string().min(2).max(255).optional(),
});

export const MediaQuerySchema = z.object({
  type: z.enum(["image", "document"]).optional(),
  privacy: z.enum(["private", "public"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type UploadMedia = z.infer<typeof uploadSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
