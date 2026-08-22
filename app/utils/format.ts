import { format as fnsFormat } from "date-fns";
import { enUS, id } from "date-fns/locale";

const localeMap = { en: enUS, id } as const;

/**
 * Format a date string/object for display using date-fns.
 *
 * @example
 * formatDate("2026-01-05")            // "Jan 5, 2026"
 * formatDate("2026-01-05", "id")      // "5 Jan 2026"
 * formatDate(new Date(), "en", "PPP") // "January 5th, 2026"
 */
export function formatDate(
  date: string | Date | number,
  locale: keyof typeof localeMap = "en",
  fmt = "PPP",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return fnsFormat(d, fmt, { locale: localeMap[locale] });
}
