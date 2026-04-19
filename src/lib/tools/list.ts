import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCollection } from 'astro:content';
import { getSlug } from '../slug-map';
import type { Lang } from './types';

export type ToolListItem = {
  toolId: string;
  title: string;
  tagline: string;
  href: string;
  iconRel: string;
  hasIcon: boolean;
};

/**
 * Enumerates all content entries for a language, resolved to render-ready items.
 * Silently drops entries whose toolId has no slug-map registration for `lang`.
 * Sorted alphabetically by title using the language's locale.
 */
export async function listToolsForLang(lang: Lang): Promise<ToolListItem[]> {
  const entries = await getCollection('tools', (e: { data: { language: Lang } }) => e.data.language === lang);
  const projectRoot = process.cwd();

  return entries
    .map((entry: { data: { toolId: string; title: string; tagline: string } }): ToolListItem | null => {
      const slug = getSlug(entry.data.toolId, lang);
      if (!slug) return null;
      const iconRel = `/icons/tools/${entry.data.toolId}.webp`;
      return {
        toolId: entry.data.toolId,
        title: entry.data.title,
        tagline: entry.data.tagline,
        href: `/${lang}/${slug}`,
        iconRel,
        hasIcon: existsSync(resolve(projectRoot, 'public', iconRel.replace(/^\//, ''))),
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
