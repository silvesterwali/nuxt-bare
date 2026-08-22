import { eq } from "drizzle-orm";

export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);
    const body = await readValidatedBody(event, updateUserSchema.parse);

    // Update user role if provided
    if (body.role) {
      await updateUserRole(id, body.role as UserRole);
    }

    // Update profile if provided
    if (body.firstName || body.lastName) {
      // Check if profile exists
      const userData = await getUserById(id);
      if (userData && userData.profile) {
        await useDb
          .update(schema.userProfiles)
          .set({
            ...(body.firstName ? { firstName: body.firstName } : {}),
            ...(body.lastName ? { lastName: body.lastName } : {}),
            updatedAt: new Date(),
          })
          .where(eq(schema.userProfiles.userId, id));
      }
    }

    const updatedUser = await getUserById(id);
    return jsonResponse(updatedUser, "User updated successfully");
  },
  {
    role: ["admin"],
    permissions: ["users"],
  },
);
