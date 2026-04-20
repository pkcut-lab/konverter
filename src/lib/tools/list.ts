import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCollection } from 'astro:content';
import { getSlug } from '../slug-map';
import type { Lang } from './types';
import type { ToolCategory } from './categories';

export type ToolListItem = {
  toolId: string;
  title: string;
  /**
   * Kurz-Variante des Titels für kompakte Kontexte (Related-Bar, You-Might-Strip).
   * Schneidet alles nach dem ersten „ – " / „ — " / „ - " (Gedankenstrich + Spaces) ab.
   * Beispiel: „PNG und JPG in WebP umwandeln – ohne Upload" → „PNG und JPG in WebP umwandeln".
   * SEO-Suffixe gehören nicht in navigierbare Tabs — siehe DESIGN.md §4 Related-Bar.
   */
  shortTitle: string;
  tagline: string;
  href: string;
  iconRel: string;
  hasIcon: boolean;
  /** Flache Kategorie aus dem Frontmatter; `undefined` bis Task 7 schema-tightenet. */
  category: ToolCategory | undefined;
};

/** Strippt SEO-Suffix nach Gedankenstrich-mit-Spaces. Leerer Eingang → leerer Ausgang. */
function computeShortTitle(title: string): string {
  return title.split(/\s+[–—-]\s+/)[0]!.trim();
}

/**
 * Enumerates all content entries for a language, resolved to render-ready items.
 * Silently drops entries whose toolId has no slug-map registration for `lang`.
 * Sorted alphabetically by title using the language's locale.
 */
export async function listToolsForLang(lang: Lang): Promise<ToolListItem[]> {
  const entries = await getCollection('tools', (e: { data: { language: Lang } }) => e.data.language === lang);
  const projectRoot = process.cwd();

  return entries
    .map((entry: { data: { toolId: string; title: string; tagline: string; category?: ToolCategory } }): ToolListItem | null => {
      const slug = getSlug(entry.data.toolId, lang);
      if (!slug) return null;
      const iconRel = `/icons/tools/${entry.data.toolId}.webp`;
      return {
        toolId: entry.data.toolId,
        title: entry.data.title,
        shortTitle: computeShortTitle(entry.data.title),
        tagline: entry.data.tagline,
        href: `/${lang}/${slug}`,
        iconRel,
        hasIcon: existsSync(resolve(projectRoot, 'public', iconRel.replace(/^\//, ''))),
        category: entry.data.category,
      };
    })
    .filter((t: ToolListItem | null): t is ToolListItem => t !== null)
    .sort((a: ToolListItem, b: ToolListItem) => a.title.localeCompare(b.title, lang));
}

/**
 * Resolves an array of LOCALIZED SLUGS (not toolIds) to ToolListItems.
 * Forward-looking references (slugs without slug-map or content entry) are dropped silently.
 * Preserves input order — used by RelatedTools to respect content-author ordering.
 */
export async function resolveRelatedTools(
  lang: Lang,
  localizedSlugs: readonly string[],
): Promise<ToolListItem[]> {
  const all = await listToolsForLang(lang);
  const bySlugSuffix = new Map(all.map((t) => [t.href.split('/').pop()!, t]));
  const out: ToolListItem[] = [];
  for (const slug of localizedSlugs) {
    const hit = bySlugSuffix.get(slug);
    if (hit) out.push(hit);
  }
  return out;
}

/**
 * Resolvt explicit-relatedTools zuerst und füllt — falls das Ergebnis unter
 * `minCount` liegt — mit alphabetisch sortierten Same-Category-Geschwistern auf.
 * Own-Slug wird aus dem Fallback ausgeschlossen. Duplikate werden still
 * übersprungen. Explicit-Ordering wird bewahrt; Fallback-Items kommen danach.
 *
 * Wenn das Tool keine category hat oder keine Geschwister existieren, wird
 * das Ergebnis auf der Länge belassen, die explicit lieferte.
 */
export async function resolveRelatedToolsWithFallback(
  lang: Lang,
  ownSlug: string,
  explicitSlugs: readonly string[],
  minCount: number,
): Promise<ToolListItem[]> {
  const all = await listToolsForLang(lang);
  const bySlugSuffix = new Map(all.map((t) => [t.href.split('/').pop()!, t]));

  const seen = new Set<string>();
  const out: ToolListItem[] = [];

  for (const slug of explicitSlugs) {
    if (slug === ownSlug) continue;
    const hit = bySlugSuffix.get(slug);
    if (hit && !seen.has(slug)) {
      out.push(hit);
      seen.add(slug);
    }
  }

  if (out.length >= minCount) return out;

  const own = bySlugSuffix.get(ownSlug);
  if (!own?.category) return out;

  const siblings = all.filter(
    (t) => t.category === own.category && !seen.has(t.href.split('/').pop()!) && t.toolId !== own.toolId,
  );

  for (const sibling of siblings) {
    if (out.length >= minCount) break;
    out.push(sibling);
    seen.add(sibling.href.split('/').pop()!);
  }

  return out;
}
