import { eq } from "drizzle-orm";

export interface CreateCategoryInput {
  name: Record<string, string>;
  slug: Record<string, string>;
  description?: Record<string, string> | null;
  color?: string | null;
}

export interface UpdateCategoryInput {
  name?: Record<string, string>;
  slug?: Record<string, string>;
  description?: Record<string, string> | null;
  color?: string | null;
}

export async function getAllCategories(language = "en") {
  const allCategories = await useDb.query.categories.findMany({
    orderBy: (categories, { asc }) => asc(categories.id),
  });

  // Localize to the requested language and include available languages
  return allCategories.map((cat: any) => {
    return {
      ...cat,
      language,
      name:
        typeof cat.name === "object"
          ? cat.name[language] || Object.values(cat.name)[0]
          : cat.name,
      slug:
        typeof cat.slug === "object"
          ? cat.slug[language] || Object.values(cat.slug)[0]
          : cat.slug,
      description:
        cat.description && typeof cat.description === "object"
          ? cat.description[language] || Object.values(cat.description)[0]
          : cat.description,
    };
  });
}

/**
 * Get raw category data with translation objects (for update operations)
 */
export async function getCategoryByIdRaw(id: number) {
  return useDb.query.categories.findFirst({
    where: eq(schema.categories.id, id),
  });
}

export async function getCategoryById(id: number, language = "en") {
  const cat = await useDb.query.categories.findFirst({
    where: eq(schema.categories.id, id),
  });

  if (!cat) return null;

  const languages =
    typeof cat.name === "object"
      ? Object.keys(cat.name).filter((lang) => cat.name[lang])
      : [];
  return {
    ...cat,
    languages,
    name:
      typeof cat.name === "object"
        ? cat.name[language] || Object.values(cat.name)[0]
        : cat.name,
    slug:
      typeof cat.slug === "object"
        ? cat.slug[language] || Object.values(cat.slug)[0]
        : cat.slug,
    description:
      cat.description && typeof cat.description === "object"
        ? cat.description[language] || Object.values(cat.description)[0]
        : cat.description,
  };
}

export async function createCategory(data: CreateCategoryInput) {
  const now = new Date();
  return useDb
    .insert(schema.categories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color || "#3b82f6",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
}

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  const now = new Date();
  return useDb
    .update(schema.categories)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(schema.categories.id, id))
    .returning();
}

export async function deleteCategory(id: number) {
  return useDb
    .delete(schema.categories)
    .where(eq(schema.categories.id, id))
    .returning();
}
