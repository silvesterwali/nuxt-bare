import { z } from "zod";

export const CreateTagBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
});

export const UpdateTagBodySchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty"),
    color: z.string().optional(),
  })
  .partial();

export type CreateTagBody = z.infer<typeof CreateTagBodySchema>;
export type UpdateTagBody = z.infer<typeof UpdateTagBodySchema>;
