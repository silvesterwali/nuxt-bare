import { z } from "zod";

export const uploadSchema = z.object({
  type: z.enum(["image", "document"]),
  privacy: z.enum(["private", "public"]).optional().default("private"),
  description: z.string().optional(),
});
