import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export default defineAuthHandler(
  async (event, { user }) => {
    const session = user;
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    // Prevent admin from changing their own role
    if (id === session.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot change your own role",
      });
    }

    const body = await readValidatedBody(event, updateRoleSchema.parse);

    const updatedUser = await updateUserRole(id, body.role);

    // Use jsonResponse (was singleResponse)
    return jsonResponse(updatedUser, "User role updated successfully");
  },
  ["admin"],
);
