/**
 * Lang-aware slugs for static (non-tool) pages.
 *
 * Mirrors the philosophy of `slug-map.ts`: a single source of truth so each
 * page can have a localised URL (e.g. /de/werkzeuge vs /en/tools) without
 * scattering hardcoded paths across components and pages.
 *
 * Phase 3: only the tools-index page is localised here. Legal pages (`datenschutz`/
 * `privacy`, `impressum`/`imprint`, `ueber`/`about`) are still authored as separate
 * Astro files under `src/pages/{lang}/` because each language has different legal
 * copy and structure — duplicating their slug into this map would be premature
 * abstraction (YAGNI).
 */
import type { ActiveLanguage } from './hreflang';

export type StaticPageId = 'tools';

const STATIC_PAGE_SLUGS: Record<StaticPageId, Record<ActiveLanguage, string>> = {
  tools: {
    de: 'werkzeuge',
    en: 'tools',
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
