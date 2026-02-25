import { useValidatedParams } from "h3-zod";

export default defineAuthHandler(
  async (event) => {
    const { id } = await useValidatedParams(event, paramsIdSchema);

    try {
      const existing = await getTagById(id);
      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Tag not found",
        });
      }

      await deleteTag(id);
      return jsonResponse({ success: true }, "Tag deleted successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Failed to delete tag",
      });
    }
  },
  ["admin"],
);
