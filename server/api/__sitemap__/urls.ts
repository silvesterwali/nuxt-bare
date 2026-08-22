import type { SitemapUrlInput } from "#sitemap/types";
import { desc, eq } from "drizzle-orm";

const LOCALES = ["en", "id"] as const;

/**
 * Dynamic sitemap URL source consumed by @nuxtjs/sitemap.
 * Returns published blog posts, categories, and tags with hreflang alternates.
 *
 * Pattern: https://nuxtseo.com/docs/sitemap/guides/dynamic-urls
 */
export default defineSitemapEventHandler(async () => {
  // ── Posts (published only) ─────────────────────────────────────────────────
  const posts = await useDb
    .select({
      id: schema.posts.id,
      slug: schema.posts.slug,
      updatedAt: schema.posts.updatedAt,
    })
    .from(schema.posts)
    .where(eq(schema.posts.status, "published"))
    .orderBy(desc(schema.posts.updatedAt));

  const urls: SitemapUrlInput[] = [];

  // Blog posts — one canonical URL per primary (en) slug
  for (const post of posts) {
    const slugEn =
      (post.slug as Record<string, string>)?.en ||
      Object.values(post.slug as Record<string, string>)[0];

    if (!slugEn) continue;

    const alternates = LOCALES.flatMap((locale) => {
      const localizedSlug =
        (post.slug as Record<string, string>)?.[locale] || slugEn;
      return [{ hreflang: locale, href: `/blog/${localizedSlug}` }];
    });

    urls.push({
      loc: `/blog/${slugEn}`,
      lastmod: post.updatedAt,
      changefreq: "weekly",
      priority: 0.8,
      alternatives: alternates,
    });
  }

  return urls;
});
