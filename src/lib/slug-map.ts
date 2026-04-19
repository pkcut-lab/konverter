import type { Lang } from './tools/types';
import { ACTIVE_LANGUAGES } from './hreflang';

/**
 * Tool-ID ↔ Slug mapping per language.
 * Phase 0: empty. Session 5 adds 'meter-to-feet'. Session 7 adds 'webp-konverter'. Session 9 adds 'remove-background'.
 * Phase-1 Session 2 adds the first Batch-1 converters (cm↔in, km↔mi, kg↔lb, °C↔°F, m²↔ft²).
 *
 * Shape: { [toolId]: { [lang]: slug } }. Partial per-lang record — a tool
 * may not yet have all active-language slugs filled.
 */
export const slugMap: Record<string, Partial<Record<Lang, string>>> = {
  'meter-to-feet': { de: 'meter-zu-fuss' },
  'png-jpg-to-webp': { de: 'webp-konverter' },
  'remove-background': { de: 'hintergrund-entfernen' },
  'cm-to-inch': { de: 'zentimeter-zu-zoll' },
  'km-to-mile': { de: 'kilometer-zu-meilen' },
  'kg-to-lb': { de: 'kilogramm-zu-pfund' },
  'celsius-to-fahrenheit': { de: 'celsius-zu-fahrenheit' },
  'sqm-to-sqft': { de: 'quadratmeter-zu-quadratfuss' },
};

export function getSlug(toolId: string, lang: Lang): string | undefined {
  return slugMap[toolId]?.[lang];
}

export function getToolId(lang: Lang, slug: string): string | undefined {
  for (const [toolId, perLang] of Object.entries(slugMap)) {
    if (perLang[lang] === slug) return toolId;
  }
  return undefined;
}

export function getSupportedLangs(toolId: string): Lang[] {
  const perLang = slugMap[toolId];
  if (!perLang) return [];
  return ACTIVE_LANGUAGES.filter((l) => perLang[l] !== undefined);
}
