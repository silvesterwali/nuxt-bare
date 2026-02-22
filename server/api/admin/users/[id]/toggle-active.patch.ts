import { useValidatedParams } from "h3-zod";

export default defineProtectedHandler({ roles: ["admin"] }, async (event) => {
  const session = await getUserSession(event);
  const { id } = await useValidatedParams(event, paramsIdSchema);

  // Prevent admin from deactivating themselves
  if (id === session!.user!.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot toggle your own account status",
    });
  }

  const updatedUser = await toggleUserActive(id);

  return jsonResponse(
    updatedUser,
    `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
  );
});
