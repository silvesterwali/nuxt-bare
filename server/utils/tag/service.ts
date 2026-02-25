import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

export interface CreateTagInput {
  name: Record<string, string>;
  slug: Record<string, string>;
  color?: string;
}

export interface UpdateTagInput {
  name?: Record<string, string>;
  slug?: Record<string, string>;
  color?: string;
}

export async function getAllTags(language = "en") {
  const allTags = await db.query.tags.findMany({
    orderBy: (tags, { asc }) => asc(tags.id),
  });

  // Localize to the requested language and include available languages
  return allTags.map((tag: any) => {
    return {
      ...tag,
      language,
      name:
        typeof tag.name === "object"
          ? tag.name[language] || Object.values(tag.name)[0]
          : tag.name,
      slug:
        typeof tag.slug === "object"
          ? tag.slug[language] || Object.values(tag.slug)[0]
          : tag.slug,
    };
  });
}

/**
 * Get raw tag data with translation objects (for update operations)
 */
export async function getTagByIdRaw(id: number) {
  return db.query.tags.findFirst({
    where: eq(schema.tags.id, id),
  });
}

export async function getTagById(id: number, language = "en") {
  const tag = await db.query.tags.findFirst({
    where: eq(schema.tags.id, id),
  });

  if (!tag) return null;

  const languages =
    typeof tag.name === "object"
      ? Object.keys(tag.name).filter((lang) => tag.name[lang])
      : [];
  return {
    ...tag,
    languages,
    name:
      typeof tag.name === "object"
        ? tag.name[language] || Object.values(tag.name)[0]
        : tag.name,
    slug:
      typeof tag.slug === "object"
        ? tag.slug[language] || Object.values(tag.slug)[0]
        : tag.slug,
  };
}

export async function createTag(data: CreateTagInput) {
  const now = new Date();
  return db
    .insert(schema.tags)
    .values({
      name: data.name,
      slug: data.slug,
      color: data.color || "#06b6d4",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
}

export async function updateTag(id: number, data: UpdateTagInput) {
  const now = new Date();
  return db
    .update(schema.tags)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(schema.tags.id, id))
    .returning();
}

export async function deleteTag(id: number) {
  return db.delete(schema.tags).where(eq(schema.tags.id, id)).returning();
}
