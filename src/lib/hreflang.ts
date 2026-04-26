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
  // Omit langs whose translation does not exist (record case with missing slot).
  // Fabricating a fallback URL like /en/<de-slug> creates broken hreflang links
  // that point at 404s — Google penalises this and the visual switcher would
  // render a dead button. The Header's switcher reads this same array, so
  // omission cascades correctly into UI.
  const perLanguage: HreflangLink[] = ACTIVE_LANGUAGES.flatMap((lang) => {
    if (typeof pathWithoutLang === 'string') {
      return [{
        hreflang: lang,
        href: `${SITE_URL}/${lang}${normalisePath(pathWithoutLang)}`,
      }];
    }
    const langPath = pathWithoutLang[lang];
    if (langPath === undefined) return [];
    return [{
      hreflang: lang,
      href: `${SITE_URL}/${lang}${normalisePath(langPath)}`,
    }];
  });

  // x-default points at the default language only when that translation exists.
  const defaultPath: string | undefined =
    typeof pathWithoutLang === 'string'
      ? pathWithoutLang
      : pathWithoutLang[DEFAULT_LANGUAGE];

  if (defaultPath === undefined) return perLanguage;

  return [
    ...perLanguage,
    {
      hreflang: 'x-default',
      href: `${SITE_URL}/${DEFAULT_LANGUAGE}${normalisePath(defaultPath)}`,
    },
  ];
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
