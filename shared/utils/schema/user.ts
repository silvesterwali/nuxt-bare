import { z } from "zod";

/** Public registration (minimal) */
export const CreateUserBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
});

/** Admin: create new user */
export const createUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "user", "moderator"]).optional().default("user"),
});

/** Admin: edit user form — no password field */
export const editUserSchema = z.object({
  email: z.email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "user", "moderator"]),
});

/** Admin: PATCH endpoint — all fields optional */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["admin", "user", "moderator"]).optional(),
  name: z.string().optional(), // accepted but ignored by server
});

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "user"]).optional(),
  isActive: z
    .string()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    )
    .optional(),
  emailVerified: z
    .string()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    )
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;
