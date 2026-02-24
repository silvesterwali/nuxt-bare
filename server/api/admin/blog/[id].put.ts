import { z } from "zod";
import { useValidatedBody } from "h3-zod";

const TranslationSchema = z.record(z.string(), z.string());

// Update schema accepts either translation record or string per locale
const BodySchema = z.object({
  slug: z.union([TranslationSchema, z.string()]).optional(),
  title: z.union([TranslationSchema, z.string()]).optional(),
  shortDescription: z.union([TranslationSchema, z.string()]).optional(),
  content: z.union([TranslationSchema, z.string()]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export default defineAuthHandler(
  async (event, { user, language }) => {
    const id = Number(getRouterParam(event, "id"));
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
    }

    try {
      const data = await useValidatedBody(event, BodySchema);

      // Check if post exists
      const existing = await postRepository.findById(id);
      if (!existing) {
        throw createError({ statusCode: 404, statusMessage: "Post not found" });
      }

      function normalize(val: any): Record<string, string> {
        if (typeof val === "string") {
          return { [language]: val };
        }
        return val || {};
      }

      // Merge with existing translations rather than overwrite entire object
      const merged: any = {};
      if (data.slug) {
        merged.slug = { ...existing.slug, ...normalize(data.slug) };
      }
      if (data.title) {
        merged.title = { ...existing.title, ...normalize(data.title) };
      }
      if (data.shortDescription) {
        merged.shortDescription = {
          ...existing.shortDescription,
          ...normalize(data.shortDescription),
        };
      }
      if (data.content) {
        merged.content = { ...existing.content, ...normalize(data.content) };
      }
      if (data.status) {
        merged.status = data.status;
      }

      const updated = await postRepository.update(id, merged);
      return jsonResponse(updated, "Post updated successfully");
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error instanceof Error ? error.message : "Invalid post update data",
      });
    }
  },
  ["admin"]
);
