export default defineAuthHandler(
  async (event, { user }) => {
    const session = user;
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    // Prevent admin from deactivating themselves
    if (id === session.id) {
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
  },
  {
    role: ["admin"],
    permissions: ["users"],
  },
);
