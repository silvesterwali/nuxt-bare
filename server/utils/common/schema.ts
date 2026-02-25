import { z } from "zod";

/**
 * Reusable translation schema for multi-language content.
 * Stores strings in a record keyed by language codes (e.g., "en", "id-ID").
 *
 * Used across all entities (posts, categories, tags) to validate
 * multilingual content in database and API requests.
 *
 * @example
 * // Valid values:
 * { "en": "Hello", "id": "Halo" }
 * { "en": "Single language" }
 */
export const TranslationSchema = z.record(z.string(), z.string());

// Type exports
export type Translation = z.infer<typeof TranslationSchema>;
