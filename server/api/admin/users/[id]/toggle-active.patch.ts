import { useValidatedParams } from "h3-zod";

export default defineAuthHandler(
  async (event, { user }) => {
    const session = user;
    const { id } = await useValidatedParams(event, paramsIdSchema);

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
  ["admin"],
);
