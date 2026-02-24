import { z } from "zod";
import { useValidatedQuery } from "h3-zod";

const QuerySchema = z.object({});

export default defineAuthHandler(
  async (event, { user, language }) => {
    try {
      await useValidatedQuery(event, QuerySchema);

      const posts = await postRepository.findAll();

      // Flatten translations to the requested language and add language info
      const localized = posts
        .map((p: any) => {
          const slug = p.slug?.[language] || p.slug?.en || Object.values(p.slug || {})[0] || "";
          const title =
            p.title?.[language] || p.title?.en || Object.values(p.title || {})[0] || "";
          const shortDescription =
            p.shortDescription?.[language] ||
            p.shortDescription?.en ||
            Object.values(p.shortDescription || {})[0] ||
            "";
          const content =
            p.content?.[language] || p.content?.en || Object.values(p.content || {})[0] || "";

          return {
            ...p,
            slug,
            title,
            shortDescription,
            content,
            language,
          };
        })
        // Act as tenant: only show posts that actually have data for this language
        .filter((p: any) => {
          // Require at least a slug or title for the requested language
          return (
            (p.slug && p.slug !== "") ||
            (p.title && p.title !== "")
          );
        });

      return listResponse(localized, localized.length);
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch blogs",
      });
    }
  },
  ["admin"]
);
