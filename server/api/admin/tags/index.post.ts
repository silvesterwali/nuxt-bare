import { useValidatedBody } from "h3-zod";

export default defineAuthHandler(
  async (event, { language }) => {
    try {
      const {
        name,
        slug: inputSlug,
        color,
      } = await useValidatedBody(event, CreateTagBodySchema);

      // Generate slug from name if not provided
      const slug = inputSlug || generateSlugFromInput(name);

      const result = await createTag({
        name: normalize(name, language),
        slug: normalize(slug, language),
        color,
      });

      return jsonResponse(result[0], "Tag created successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Failed to create tag",
      });
    }
  },
  ["admin"],
);
