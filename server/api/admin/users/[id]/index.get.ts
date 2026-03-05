export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    const userData = await getUserById(id);

    if (!userData) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    return jsonResponse(userData);
  },
  ["admin"],
);
