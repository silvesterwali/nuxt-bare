import { useValidatedParams } from "h3-zod";

export default defineProtectedHandler({ roles: ["admin"] }, async (event) => {
  const { id } = await useValidatedParams(event, paramsIdSchema);

  const user = await getUserById(id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return jsonResponse(user);
});
