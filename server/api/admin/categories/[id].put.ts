import { useValidatedBody, useValidatedParams } from "h3-zod";

export default defineAuthHandler(
  async (event, { language }) => {
    const { id } = await useValidatedParams(event, paramsIdSchema);

    try {
      const data = await useValidatedBody(event, UpdateCategoryBodySchema);

      const existing = await getCategoryByIdRaw(id);
      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Category not found",
        });
      }

      const merged: any = {};
      if (data.name) {
        merged.name = { ...existing.name, ...normalize(data.name, language) };
      }
      if (data.slug) {
        merged.slug = { ...existing.slug, ...normalize(data.slug, language) };
      }
      if (data.description) {
        merged.description = {
          ...existing.description,
          ...normalize(data.description, language),
        };
      }
      if (data.color !== undefined) {
        merged.color = data.color;
      }

      const result = await updateCategory(id, merged);
      return jsonResponse(result[0], "Category updated successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Failed to update category",
      });
    }
  },
  ["admin"],
);
