import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "user", "moderator"]).optional().default("user"),
});

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "user"]).optional(),
  isActive: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  emailVerified: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
