import { SITE_URL } from './site';

/**
 * Active languages — single source of truth.
 * Phase 0: de only. Phase 3: de, en, es, fr, pt-br.
 * Imported by astro.config.mjs so i18n.locales stays in sync.
 */
export const ACTIVE_LANGUAGES = ['de'] as const;

export type ActiveLanguage = (typeof ACTIVE_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: ActiveLanguage = 'de';

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * Build hreflang + x-default alternate link entries for a page.
 *
 * @param pathWithoutLang - Path without language prefix, e.g. "/" or "/styleguide/".
 *                         Leading and trailing slashes are normalised.
 */
export function buildHreflangLinks(
  { pathWithoutLang }: { pathWithoutLang: string },
): HreflangLink[] {
  const normalised = normalisePath(pathWithoutLang);

  const perLanguage: HreflangLink[] = ACTIVE_LANGUAGES.map((lang) => ({
    hreflang: lang,
    href: `${SITE_URL}/${lang}${normalised}`,
  }));

  const xDefault: HreflangLink = {
    hreflang: 'x-default',
    href: `${SITE_URL}/${DEFAULT_LANGUAGE}${normalised}`,
  };

  return [...perLanguage, xDefault];
}

function normalisePath(path: string): string {
  if (path === '' || path === '/') return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  const withBoth = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return withBoth;
}
