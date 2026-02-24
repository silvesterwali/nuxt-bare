import { z } from "zod";
import { useValidatedBody } from "h3-zod";

const TranslationSchema = z.record(z.string(), z.string());

// Accept either a full translation record or a single string for the
// currently selected language.
const BodySchema = z.object({
  slug: z.union([TranslationSchema, z.string()]),
  title: z.union([TranslationSchema, z.string()]),
  shortDescription: z.union([TranslationSchema, z.string()]).optional(),
  content: z.union([TranslationSchema, z.string()]),
  status: z
    .enum(["draft", "published", "archived"])
    .optional()
    .default("draft"),
});

export default defineAuthHandler(
  async (event, { user, language }) => {
    try {
      const { slug, title, shortDescription, content, status } =
        await useValidatedBody(event, BodySchema);

      function normalize(val: any): Record<string, string> {
        if (typeof val === "string") {
          return { [language]: val };
        }
        return val || {}; // assume valid record
      }

      const newPost = await postRepository.create({
        slug: normalize(slug),
        title: normalize(title),
        shortDescription: normalize(shortDescription),
        content: normalize(content),
        userId: user.id,
        status,
      });

      return jsonResponse(newPost, "Blog post created successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage:
          error instanceof Error ? error.message : "Invalid post data",
      });
    }
  },
  ["admin"],
);
