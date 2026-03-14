export default defineAuthHandler(
  async (event, { user }) => {
    const session = user;
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    // Prevent admin from deleting themselves
    if (id === session.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete your own account",
      });
    }

    const deletedUser = await deleteUser(id);

    return jsonResponse(deletedUser, "User deleted successfully");
  },
  {
    role: ["admin"],
    permissions: ["users"],
  },
);
