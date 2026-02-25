/**
 * Generates a URL-friendly slug from text by converting to lowercase,
 * replacing spaces and special characters with hyphens, and removing duplicates.
 *
 * @param text - The text to convert to a slug
 * @returns The generated slug
 *
 * @example
 * generateSlug("Hello World") // "hello-world"
 * generateSlug("Tech & Code") // "tech-code"
 * generateSlug("What's New?") // "whats-new"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates slugs for a translation record by applying slug generation to each language value.
 *
 * @param translations - Record of language codes to text values
 * @returns Record of language codes to generated slugs
 *
 * @example
 * generateSlugTranslations({ en: "Hello World", fr: "Bonjour Monde" })
 * // { en: "hello-world", fr: "bonjour-monde" }
 */
export function generateSlugTranslations(
  translations: Record<string, string>,
): Record<string, string> {
  const slugs: Record<string, string> = {};
  for (const [lang, text] of Object.entries(translations)) {
    slugs[lang] = generateSlug(text);
  }
  return slugs;
}

/**
 * Generates a slug from either a string or translation record.
 * If input is a string, returns its slug. If input is a translation record,
 * generates slugs for all language values.
 *
 * @param input - String or translation record to convert to slug(s)
 * @returns Either a string slug or a record of language slugs
 *
 * @example
 * // String input
 * generateSlugFromInput("Hello World") // "hello-world"
 *
 * // Translation input
 * generateSlugFromInput({ en: "English", fr: "Français" })
 * // { en: "english", fr: "francais" }
 */
export function generateSlugFromInput(
  input: string | Record<string, string>,
): string | Record<string, string> {
  if (typeof input === "string") {
    return generateSlug(input);
  }
  return generateSlugTranslations(input);
}
