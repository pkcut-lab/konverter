import { z } from 'zod';
import type { Lang } from './lang';
import { DEFAULT_LANGUAGE } from './lang';

/**
 * A user-visible string available in every active language.
 *
 * MUST contain a non-empty value for every entry in `ACTIVE_LANGUAGES`.
 * Adding a new language to `ACTIVE_LANGUAGES` makes every existing
 * `LocalizedString` literal a TypeScript compile-error until the new
 * key is filled in — that is the whole point.
 */
export type LocalizedString = Record<Lang, string>;

/**
 * Zod schema mirror of `LocalizedString`. The `satisfies` clause makes TS
 * complain if the schema and the TS type drift apart — when adding a new
 * language, you MUST update both this file and `lang.ts`.
 */
export const localizedStringSchema = z.object({
  de: z.string().min(1),
  en: z.string().min(1),
}) satisfies z.ZodType<LocalizedString>;

/**
 * Resolve a `LocalizedString` to a single string for the given language.
 * Falls back to the default language if the requested key is missing
 * (should never happen with strict `LocalizedString`, but defensive).
 */
export function resolveLocalized(
  value: LocalizedString,
  lang: Lang,
): string {
  return value[lang] ?? value[DEFAULT_LANGUAGE];
}

/**
 * Convenience constructor for inline localized strings.
 *
 * @example
 *   label: L({ de: 'Brutto', en: 'Gross' })
 */
export const L = <T extends LocalizedString>(value: T): T => value;
