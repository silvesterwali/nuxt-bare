import { z } from "zod";

/**
 * Multi-language content schema — keys are language codes, values are strings.
 * @example { en: "Hello", id: "Halo" }
 */
export const TranslationSchema = z.record(z.string(), z.string());
export type Translation = z.infer<typeof TranslationSchema>;

export const paramsIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export type ParamsId = z.infer<typeof paramsIdSchema>;
