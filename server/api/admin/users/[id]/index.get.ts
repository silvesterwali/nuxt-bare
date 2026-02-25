import { useValidatedParams } from "h3-zod";

export default defineAuthHandler(
  async (event) => {
    const { id } = await useValidatedParams(event, paramsIdSchema);

    const userData = await getUserById(id);

    if (!userData) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    return jsonResponse(userData);
  },
  ["admin"],
);
