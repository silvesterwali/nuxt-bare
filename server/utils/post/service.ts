import { desc, eq, and } from "drizzle-orm";
import { db, schema } from "../../db";

export interface PostFilters {
  search?: string;
  language?: string;
}

export interface PublicPostFilters {
  search?: string;
  language?: string;
  categorySlug?: string;
  tagSlug?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Fetch media for post rendering without privacy checks.
 * Published posts' featured images must be visible to all readers
 * regardless of the media's privacy setting.
 */
async function getMediaForPost(mediaId: number) {
  const [media] = await db
    .select({
      id: schema.media.id,
      filename: schema.media.filename,
      full_path: schema.media.full_path,
      path: schema.media.path,
      type: schema.media.type,
      width: schema.media.width,
      height: schema.media.height,
    })
    .from(schema.media)
    .where(eq(schema.media.id, mediaId))
    .limit(1);

  if (!media) return null;

  const [thumbnail] = await db
    .select({ id: schema.media.id, full_path: schema.media.full_path })
    .from(schema.media)
    .where(eq(schema.media.parentId, mediaId))
    .limit(1);

  return { ...media, thumbnail: thumbnail ?? null };
}

export async function getLocalizedCategories(postId: number, language: string) {
  const postCats = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      description: schema.categories.description,
      color: schema.categories.color,
    })
    .from(schema.postCategories)
    .leftJoin(
      schema.categories,
      eq(schema.postCategories.categoryId, schema.categories.id),
    )
    .where(eq(schema.postCategories.postId, postId));

  return postCats.map((cat: any) => ({
    id: cat.id,
    name:
      cat.name?.[language] ||
      cat.name?.en ||
      Object.values(cat.name || {})[0] ||
      "",
    slug:
      cat.slug?.[language] ||
      cat.slug?.en ||
      Object.values(cat.slug || {})[0] ||
      "",
    description:
      cat.description?.[language] ||
      cat.description?.en ||
      Object.values(cat.description || {})[0] ||
      "",
    color: cat.color,
  }));
}

export async function getLocalizedTags(postId: number, language: string) {
  const postTgs = await db
    .select({
      id: schema.tags.id,
      name: schema.tags.name,
      slug: schema.tags.slug,
      color: schema.tags.color,
    })
    .from(schema.postTags)
    .leftJoin(schema.tags, eq(schema.postTags.tagId, schema.tags.id))
    .where(eq(schema.postTags.postId, postId));

  return postTgs.map((tag: any) => ({
    id: tag.id,
    name:
      tag.name?.[language] ||
      tag.name?.en ||
      Object.values(tag.name || {})[0] ||
      "",
    slug:
      tag.slug?.[language] ||
      tag.slug?.en ||
      Object.values(tag.slug || {})[0] ||
      "",
    color: tag.color,
  }));
}

/**
 * Add a category to a post
 */
export async function addCategoryToPost(postId: number, categoryId: number) {
  // Check if already exists to avoid duplicates
  const existing = await db
    .select()
    .from(schema.postCategories)
    .where(
      and(
        eq(schema.postCategories.postId, postId),
        eq(schema.postCategories.categoryId, categoryId),
      ),
    );

  if (existing.length === 0) {
    return db
      .insert(schema.postCategories)
      .values({
        postId,
        categoryId,
        createdAt: new Date(),
      })
      .returning();
  }
  return existing;
}

/**
 * Remove a category from a post
 */
export async function removeCategoryFromPost(
  postId: number,
  categoryId: number,
) {
  return db
    .delete(schema.postCategories)
    .where(
      and(
        eq(schema.postCategories.postId, postId),
        eq(schema.postCategories.categoryId, categoryId),
      ),
    )
    .returning();
}

/**
 * Update all categories for a post (replaces existing)
 */
export async function updatePostCategories(
  postId: number,
  categoryIds: number[],
) {
  // Delete existing categories
  await db
    .delete(schema.postCategories)
    .where(eq(schema.postCategories.postId, postId));

  // Add new categories
  if (categoryIds.length > 0) {
    return db
      .insert(schema.postCategories)
      .values(
        categoryIds.map((categoryId) => ({
          postId,
          categoryId,
          createdAt: new Date(),
        })),
      )
      .returning();
  }
}

/**
 * Add a tag to a post
 */
export async function addTagToPost(postId: number, tagId: number) {
  // Check if already exists to avoid duplicates
  const existing = await db
    .select()
    .from(schema.postTags)
    .where(
      and(eq(schema.postTags.postId, postId), eq(schema.postTags.tagId, tagId)),
    );

  if (existing.length === 0) {
    return db
      .insert(schema.postTags)
      .values({
        postId,
        tagId,
        createdAt: new Date(),
      })
      .returning();
  }
  return existing;
}

/**
 * Remove a tag from a post
 */
export async function removeTagFromPost(postId: number, tagId: number) {
  return db
    .delete(schema.postTags)
    .where(
      and(eq(schema.postTags.postId, postId), eq(schema.postTags.tagId, tagId)),
    )
    .returning();
}

/**
 * Update all tags for a post (replaces existing)
 */
export async function updatePostTags(postId: number, tagIds: number[]) {
  // Delete existing tags
  await db.delete(schema.postTags).where(eq(schema.postTags.postId, postId));

  // Add new tags
  if (tagIds.length > 0) {
    return db
      .insert(schema.postTags)
      .values(
        tagIds.map((tagId) => ({
          postId,
          tagId,
          createdAt: new Date(),
        })),
      )
      .returning();
  }
}

export async function getPosts(
  filters: PostFilters = {},
  paginationParams?: Partial<PaginationParams>,
) {
  const { page, limit } = validatePaginationParams(paginationParams || {});
  const language = filters.language || "en";

  // Fetch all posts (need to localize before filtering/paginating)
  const allPosts = await db
    .select({
      id: schema.posts.id,
      slug: schema.posts.slug,
      title: schema.posts.title,
      shortDescription: schema.posts.shortDescription,
      content: schema.posts.content,
      status: schema.posts.status,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      author: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      },
    })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .orderBy(desc(schema.posts.createdAt));

  // Flatten translations to the requested language and fetch categories/tags
  const localized = await Promise.all(
    allPosts.map(async (p: any) => {
      const slug =
        p.slug?.[language] ||
        p.slug?.en ||
        Object.values(p.slug || {})[0] ||
        "";
      const title =
        p.title?.[language] ||
        p.title?.en ||
        Object.values(p.title || {})[0] ||
        "";
      const shortDescription =
        p.shortDescription?.[language] ||
        p.shortDescription?.en ||
        Object.values(p.shortDescription || {})[0] ||
        "";
      const content =
        p.content?.[language] ||
        p.content?.en ||
        Object.values(p.content || {})[0] ||
        "";

      const categories = await getLocalizedCategories(p.id, language);
      const tags = await getLocalizedTags(p.id, language);

      return {
        ...p,
        slug,
        title,
        shortDescription,
        content,
        language,
        categories,
        tags,
      };
    }),
  );

  // Filter by language availability
  const filtered = localized.filter((p: any) => {
    return (p.slug && p.slug !== "") || (p.title && p.title !== "");
  });

  // Apply search filter
  let results = filtered;
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    results = filtered.filter((p: any) => {
      return (
        p.title.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower) ||
        p.shortDescription.toLowerCase().includes(searchLower)
      );
    });
  }

  // Apply pagination
  const totalCount = results.length;
  const offset = (page - 1) * limit;
  const data = results.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
    },
  };
}

export async function getPostById(postId: number, language: string = "en") {
  const post = await db
    .select({
      id: schema.posts.id,
      slug: schema.posts.slug,
      title: schema.posts.title,
      shortDescription: schema.posts.shortDescription,
      content: schema.posts.content,
      status: schema.posts.status,
      featuredImageId: schema.posts.featuredImageId,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      author: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      },
    })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .where(eq(schema.posts.id, postId))
    .then((rows) => rows[0]);

  if (!post) {
    return null;
  }

  const slug =
    post.slug?.[language] ||
    post.slug?.en ||
    Object.values(post.slug || {})[0] ||
    "";
  const title =
    post.title?.[language] ||
    post.title?.en ||
    Object.values(post.title || {})[0] ||
    "";
  const shortDescription =
    post.shortDescription?.[language] ||
    post.shortDescription?.en ||
    Object.values(post.shortDescription || {})[0] ||
    "";
  const content =
    post.content?.[language] ||
    post.content?.en ||
    Object.values(post.content || {})[0] ||
    "";

  const categories = await getLocalizedCategories(post.id, language);
  const tags = await getLocalizedTags(post.id, language);

  let featuredImage = null;
  if (post.featuredImageId) {
    featuredImage = await getMediaForPost(post.featuredImageId);
  }

  return {
    ...post,
    slug,
    title,
    shortDescription,
    content,
    language,
    categories,
    tags,
    featuredImage,
  };
}

/**
 * Fetch published posts for the public blog listing.
 * Supports filtering by language, category slug, tag slug, and search.
 */
export async function getPublicPosts(
  filters: PublicPostFilters = {},
  paginationParams?: Partial<PaginationParams>,
) {
  const { page, limit } = validatePaginationParams(paginationParams || {});
  const language = filters.language || "en";

  const allPosts = await db
    .select({
      id: schema.posts.id,
      slug: schema.posts.slug,
      title: schema.posts.title,
      shortDescription: schema.posts.shortDescription,
      featuredImageId: schema.posts.featuredImageId,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      author: {
        id: schema.users.id,
        name: schema.users.name,
      },
    })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .where(eq(schema.posts.status, "published"))
    .orderBy(desc(schema.posts.createdAt));

  const localized = await Promise.all(
    (allPosts as any[]).map(async (p) => {
      const slug =
        p.slug?.[language] ||
        p.slug?.en ||
        Object.values(p.slug || {})[0] ||
        "";
      const title =
        p.title?.[language] ||
        p.title?.en ||
        Object.values(p.title || {})[0] ||
        "";
      const shortDescription =
        p.shortDescription?.[language] ||
        p.shortDescription?.en ||
        Object.values(p.shortDescription || {})[0] ||
        "";
      const categories = await getLocalizedCategories(p.id, language);
      const tags = await getLocalizedTags(p.id, language);
      return { ...p, slug, title, shortDescription, language, categories, tags };
    }),
  );

  let results = localized.filter((p) => p.slug && p.slug !== "");

  if (filters.categorySlug) {
    const catSlug = filters.categorySlug;
    results = results.filter((p) =>
      p.categories.some((c: any) => c.slug === catSlug),
    );
  }

  if (filters.tagSlug) {
    const tagSlug = filters.tagSlug;
    results = results.filter((p) =>
      p.tags.some((t: any) => t.slug === tagSlug),
    );
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q),
    );
  }

  const totalCount = results.length;
  const offset = (page - 1) * limit;
  const pageSlice = results.slice(offset, offset + limit);

  const data = await Promise.all(
    pageSlice.map(async (p) => {
      let featuredImage = null;
      if (p.featuredImageId) {
        featuredImage = await getMediaForPost(p.featuredImageId);
      }
      return { ...p, featuredImage };
    }),
  );

  return createPaginationResponse(data, totalCount, page, limit, "Posts retrieved");
}

/**
 * Fetch a single published post by its localized slug.
 */
export async function getPublicPostBySlug(
  slug: string,
  language: string = "en",
) {
  const allPosts = await db
    .select({ id: schema.posts.id, slug: schema.posts.slug })
    .from(schema.posts)
    .where(eq(schema.posts.status, "published"));

  const match = (allPosts as any[]).find((p) => {
    const localizedSlug =
      p.slug?.[language] ||
      p.slug?.en ||
      Object.values(p.slug || {})[0] ||
      "";
    return localizedSlug === slug;
  });

  if (!match) return null;

  return getPostById(match.id, language);
}

