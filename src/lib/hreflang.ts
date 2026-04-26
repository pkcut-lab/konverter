import { SITE_URL } from './site';

/**
 * Active languages — single source of truth.
 * Phase 0: de only. Phase 3: de, en, es, fr, pt-br.
 * Imported by astro.config.mjs so i18n.locales stays in sync.
 */
export const ACTIVE_LANGUAGES = ['de', 'en'] as const;

export type ActiveLanguage = (typeof ACTIVE_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: ActiveLanguage = 'de';

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * Build hreflang + x-default alternate link entries for a page.
 *
 * @param pathWithoutLang - Path without language prefix. Either a single string
 *                         shared across all languages (e.g. "/" or "/styleguide")
 *                         OR a per-language record like `{ de: '/werkzeuge', en: '/tools' }`
 *                         when the slug differs per language. Leading and trailing
 *                         slashes are normalised.
 */
export function buildHreflangLinks(
  { pathWithoutLang }: { pathWithoutLang: string | Partial<Record<ActiveLanguage, string>> },
): HreflangLink[] {
  const pathFor = (lang: ActiveLanguage): string => {
    if (typeof pathWithoutLang === 'string') return normalisePath(pathWithoutLang);
    const langPath = pathWithoutLang[lang];
    // Fall back to default-language path so a missing per-lang slot never crashes.
    const fallback = pathWithoutLang[DEFAULT_LANGUAGE] ?? '/';
    return normalisePath(langPath ?? fallback);
  };

  const perLanguage: HreflangLink[] = ACTIVE_LANGUAGES.map((lang) => ({
    hreflang: lang,
    href: `${SITE_URL}/${lang}${pathFor(lang)}`,
  }));

  const xDefault: HreflangLink = {
    hreflang: 'x-default',
    href: `${SITE_URL}/${DEFAULT_LANGUAGE}${pathFor(DEFAULT_LANGUAGE)}`,
  };

  return [...perLanguage, xDefault];
}

/**
 * Strips trailing slash (Astro config `trailingSlash: 'never'`).
 * Root "/" becomes "" so href ends at `/{lang}`.
 */
function normalisePath(path: string): string {
  if (path === '' || path === '/') return '';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  return withLeading.endsWith('/') ? withLeading.slice(0, -1) : withLeading;
}
