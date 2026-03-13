export default defineAuthHandler(
  async (event, { language }) => {
    try {
      const {
        name,
        slug: inputSlug,
        description,
        color,
      } = await readValidatedBody(event, CreateCategoryBodySchema.parse);
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
