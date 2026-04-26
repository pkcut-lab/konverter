/**
 * Lang-aware slugs for static (non-tool) pages.
 *
 * Mirrors the philosophy of `slug-map.ts`: a single source of truth so each
 * page can have a localised URL (e.g. /de/werkzeuge vs /en/tools) without
 * scattering hardcoded paths across components and pages.
 *
 * Even pages whose CONTENT lives in separate per-language Astro files (legal
 * pages with country-specific copy) MUST register their slugs here so that
 * BaseLayout's hreflang can map between localised URLs. Without this map,
 * /de/impressum would emit a hreflang for /en/impressum (a 404 — the EN
 * page lives at /en/imprint).
 */
import type { ActiveLanguage } from './hreflang';

export type StaticPageId = 'tools' | 'imprint' | 'privacy';

const STATIC_PAGE_SLUGS: Record<StaticPageId, Record<ActiveLanguage, string>> = {
  tools: {
    de: 'werkzeuge',
    en: 'tools',
  },
  imprint: {
    de: 'impressum',
    en: 'imprint',
  },
  privacy: {
    de: 'datenschutz',
    en: 'privacy',
  },
};

/** Returns the localised slug for a static page, e.g. 'werkzeuge' for ('tools','de'). */
export function getStaticPageSlug(page: StaticPageId, lang: ActiveLanguage): string {
  return STATIC_PAGE_SLUGS[page][lang];
}

/** Returns the full localised path including language prefix, e.g. '/en/tools'. */
export function getStaticPagePath(page: StaticPageId, lang: ActiveLanguage): string {
  return `/${lang}/${getStaticPageSlug(page, lang)}`;
}

/**
 * Returns a per-language record of paths suitable for BaseLayout's `pathWithoutLang`
 * prop, e.g. `{ de: '/impressum', en: '/imprint' }`. Use this on every static page
 * whose slug differs per language so hreflang/switcher routes to the correct URL.
 */
export function getStaticPagePathRecord(
  page: StaticPageId,
): Record<ActiveLanguage, string> {
  const slugs = STATIC_PAGE_SLUGS[page];
  const entries = (Object.entries(slugs) as Array<[ActiveLanguage, string]>).map(
    ([lang, slug]) => [lang, `/${slug}`] as const,
  );
  return Object.fromEntries(entries) as Record<ActiveLanguage, string>;
}
