/**
 * Localization utilities for handling multi-language content across API endpoints.
 * These utilities help normalize and process translation data consistently.
 */

/**
 * Normalizes input data to a translation record for the given language.
 *
 * This function accepts either:
 * - A string: converts it to { [language]: value }
 * - A translation record: returns it as-is
 *
 * This is useful when accepting input that can be either a simple string
 * (for updating a single language version) or a full translation object
 * (for bulk updates across languages).
 *
 * @param {any} value - The value to normalize. Can be a string or translation record.
 * @param {string} language - The current language code (e.g., 'en', 'fr')
 * @returns {Record<string, string>} A translation record with language keys
 *
 * @example
 * // With a string input:
 * normalize("Hello World", "en")
 * // Returns: { en: "Hello World" }
 *
 * @example
 * // With a translation record:
 * normalize({ en: "Hello", fr: "Bonjour" }, "en")
 * // Returns: { en: "Hello", fr: "Bonjour" }
 *
 * @example
 * // With undefined/null:
 * normalize(undefined, "en")
 * // Returns: {}
 */
export function normalize(
  value: any,
  language: string,
): Record<string, string> {
  if (typeof value === "string") {
    return { [language]: value };
  }
  return value || {};
}

/**
 * Merges a new translation value with existing translations, preserving other languages.
 *
 * This function is critical for updates - it ensures that when updating a translation
 * for one language, other language versions are preserved. Without this merge,
 * you would lose translations in other languages.
 *
 * @param {Record<string, string>} existing - The existing translation record
 * @param {any} newValue - The new value (string or translation record)
 * @param {string} language - The current language code
 * @returns {Record<string, string>} Merged translation record
 *
 * @example
 * const existing = { en: "Hello", fr: "Bonjour" };
 * const merged = mergeTranslations(existing, "Hola", "es");
 * // Returns: { en: "Hello", fr: "Bonjour", es: "Hola" }
 *
 * @example
 * // Updating an existing language:
 * const existing = { en: "Hello", fr: "Bonjour" };
 * const merged = mergeTranslations(existing, "Hi", "en");
 * // Returns: { en: "Hi", fr: "Bonjour" }
 */
export function mergeTranslations(
  existing: Record<string, string>,
  newValue: any,
  language: string,
): Record<string, string> {
  return {
    ...existing,
    ...normalize(newValue, language),
  };
}

/**
 * Retrieves the localized version of a translation record for a specific language.
 *
 * This function attempts to find the translation in order:
 * 1. The exact language requested
 * 2. The default 'en' variant
 * 3. The 'en' language
 * 4. The first available language (any value)
 * 5. An empty string if no translations exist
 *
 * This provides a fallback chain to ensure content is always returned when possible,
 * even if the exact language isn't available.
 *
 * @param {Record<string, string>} translations - The translation record
 * @param {string} language - The desired language code
 * @returns {string} The localized string value
 *
 * @example
 * const translations = { en: "Hello", fr: "Bonjour" };
 * localizeField(translations, "fr")
 * // Returns: "Bonjour"
 *
 * @example
 * // With fallback to English:
 * const translations = { en: "Hello", "en": "Hi" };
 * localizeField(translations, "es")
 * // Returns: "Hello" (fallback to 'en')
 *
 * @example
 * // With fallback to first available:
 * const translations = { fr: "Bonjour", de: "Hallo" };
 * localizeField(translations, "es")
 * // Returns: "Bonjour" (first available value)
 */
export function localizeField(
  translations: Record<string, string>,
  language: string,
): string {
  return (
    translations?.[language] ||
    translations?.["en"] ||
    Object.values(translations || {})[0] ||
    ""
  );
}
