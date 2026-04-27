import type { Lang } from './lang';

/**
 * Locale maps — single source of truth for language → locale-code translations
 * used in HTML attributes, OpenGraph meta, and Intl APIs.
 *
 * MUST contain an entry for every value in `ACTIVE_LANGUAGES`. The
 * `Record<Lang, string>` type makes adding a new language without
 * filling these out a TypeScript compile-error.
 *
 * When adding a new language (e.g. `pt-br`), update the `Lang` union in
 * `lang.ts`, then TypeScript errors here will tell you exactly which
 * map needs a new entry.
 */

/** OpenGraph `og:locale` (underscore-separated, region-suffixed). */
export const OG_LOCALE_MAP: Record<Lang, string> = {
  de: 'de_DE',
  en: 'en_US',
};

/** BCP-47 locale tag for `Intl.NumberFormat`, `Intl.DateTimeFormat`, etc. */
export const INTL_LOCALE_MAP: Record<Lang, string> = {
  de: 'de-DE',
  en: 'en-US',
};

/** HTML `lang` attribute — usually identical to the language code itself,
 *  but kept here so future regional variants (`pt-br` → `pt-BR`) flow through. */
export const HTML_LANG_MAP: Record<Lang, string> = {
  de: 'de',
  en: 'en',
};
