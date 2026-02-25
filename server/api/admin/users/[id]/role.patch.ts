import { z } from "zod";
import { useValidatedBody, useValidatedParams } from "h3-zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export default defineAuthHandler(
  async (event, { user }) => {
    const session = user;
    const { id } = await useValidatedParams(event, paramsIdSchema);

    // Prevent admin from changing their own role
    if (id === session.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot change your own role",
      });
    }

    const body = await useValidatedBody(event, updateRoleSchema);

    const updatedUser = await updateUserRole(id, body.role);

    // Use jsonResponse (was singleResponse)
    return jsonResponse(updatedUser, "User role updated successfully");
  },
  ["admin"],
);
