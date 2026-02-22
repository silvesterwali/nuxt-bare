import { useValidatedBody, useValidatedParams } from "h3-zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "../../../../db";
import type { UserRole } from "~/types/db";
import { paramsIdSchema } from "../../../../utils/common/params";
import { getUserById, updateUserRole } from "../../../../utils/admin/service";
import { jsonResponse } from "../../../../utils/common/response";

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["admin", "user", "moderator"]).optional(),
  name: z.string().optional(), // Allow name but ignore it
});

export default defineProtectedHandler({ roles: ["admin"] }, async (event) => {
  const { id } = await useValidatedParams(event, paramsIdSchema);
  const body = await useValidatedBody(event, updateUserSchema);

  // Update user role if provided
  if (body.role) {
    await updateUserRole(id, body.role as UserRole);
  }

  // Update profile if provided
  if (body.firstName || body.lastName) {
    // Check if profile exists
    const user = await getUserById(id);
    if (user && user.profile) {
      await db
        .update(schema.userProfiles)
        .set({
          ...(body.firstName ? { firstName: body.firstName } : {}),
          ...(body.lastName ? { lastName: body.lastName } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.userProfiles.userId, id));
    } else {
      // Create profile if it doesn't exist? Or throw?
      // For now, assume profile exists as per registration flow.
    }
  }

  const updatedUser = await getUserById(id);
  return jsonResponse(updatedUser, "User updated successfully");
});
