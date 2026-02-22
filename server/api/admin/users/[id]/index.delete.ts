import { useValidatedParams } from "h3-zod";

export default defineProtectedHandler({ roles: ["admin"] }, async (event) => {
  const session = await getUserSession(event);
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Prevent admin from deleting themselves
  if (id === session!.user!.id) {
    throw createError({ statusCode: 400, statusMessage: "Cannot delete your own account" });
  }

  const deletedUser = await deleteUser(id);

  return jsonResponse(deletedUser, "User deleted successfully");
});
