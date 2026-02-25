import { useValidatedBody } from "h3-zod";

export default defineAuthHandler(
  async (event, { language }) => {
    try {
      const {
        name,
        slug: inputSlug,
        description,
        color,
      } = await useValidatedBody(event, CreateCategoryBodySchema);

      // Generate slug from name if not provided
      const slug = inputSlug || generateSlugFromInput(name);

      const result = await createCategory({
        name: normalize(name, language),
        slug: normalize(slug, language),
        description: description ? normalize(description, language) : undefined,
        color,
      });

      return jsonResponse(result[0], "Category created successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Failed to create category",
      });
    }
  },
  ["admin"],
);
