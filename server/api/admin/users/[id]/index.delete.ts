import { useValidatedParams } from "h3-zod";

export default defineAuthHandler(
  async (event, { user }) => {
    const session = user;
    const { id } = await useValidatedParams(event, paramsIdSchema);

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
  ["admin"],
);
