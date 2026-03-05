export default defineAuthHandler(
  async (event, { language }) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);

    try {
      const { name, color } = await readValidatedBody(
        event,
        UpdateTagBodySchema.parse,
      );

      if (!name && color === undefined) {
        throw createError({
          statusCode: 400,
          statusMessage: "At least one field (name or color) must be provided",
        });
      }

      const existing = await getTagByIdRaw(id);
      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Tag not found",
        });
      }

      const merged: any = {};
      if (name) {
        merged.name = { ...existing.name, ...normalize(name, language) };
      }

      const slug = generateSlugFromInput(name ?? "-");

      merged.slug = { ...existing.slug, ...normalize(slug, language) };

      if (color !== undefined) {
        merged.color = color;
      }

      const result = await updateTag(id, merged);
      return jsonResponse(result[0], "Tag updated successfully");
    } catch (error) {
      if (error instanceof H3Error) {
        throw createError({
          statusCode: error.statusCode,
          statusMessage: error.statusMessage,
          data: JSON.parse(error.data.message),
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        data:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? { message: error.message, stack: error.stack }
            : undefined,
      });
    }
  },
  ["admin"],
);
