import { z } from "zod";
import { useValidatedBody, useValidatedParams } from "h3-zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export default defineProtectedHandler({ roles: ["admin"] }, async (event) => {
  const session = await getUserSession(event);
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Prevent admin from changing their own role
  if (id === session!.user!.id) {
    throw createError({ statusCode: 400, statusMessage: "Cannot change your own role" });
  }

  const body = await useValidatedBody(event, updateRoleSchema);

  const updatedUser = await updateUserRole(id, body.role);

  // Use jsonResponse (was singleResponse)
  return jsonResponse(updatedUser, "User role updated successfully");
});
