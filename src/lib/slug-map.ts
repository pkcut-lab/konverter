import type { Lang } from './tools/types';
import { ACTIVE_LANGUAGES } from './hreflang';

/**
 * Tool-ID ↔ Slug mapping per language.
 * Phase 0: empty. Session 5 adds 'meter-to-feet'. Session 7 adds 'webp-konverter'. Session 9 adds 'remove-background'.
 * Phase-1 Session 2 adds the first Batch-1 converters (cm↔in, km↔mi, kg↔lb, °C↔°F, m²↔ft²).
 *
 * Shape: { [toolId]: { [lang]: slug } }. Partial per-lang record — a tool
 * may not yet have all active-language slugs filled.
 *
 * Phase 1 is DE-only by design: each entry has a `de:` slot and no others.
 * `getSlug()` is defensive and `hreflang.ts` filters by `ACTIVE_LANGUAGES`,
 * so missing slots never 404. Phase 3 fills `en`/`es`/`fr`/`pt-BR` slots
 * as translations land (see docs/superpowers/specs/2026-04-17-konverter-
 * webseite-design.md §6).
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
  'hevc-to-h264': { de: 'hevc-zu-h264' },
  'inch-to-cm': { de: 'zoll-zu-zentimeter' },
  'password-generator': { de: 'passwort-generator' },
  'hex-to-rgb': { de: 'hex-rgb-konverter' },
  'uuid-generator': { de: 'uuid-generator' },
  'json-formatter': { de: 'json-formatter' },
  'character-counter': { de: 'zeichenzaehler' },
  'regex-tester': { de: 'regex-tester' },
  'text-diff': { de: 'text-diff' },
  'unix-timestamp': { de: 'unix-timestamp' },
  'base64-encoder': { de: 'base64-encoder' },
  'url-encoder-decoder': { de: 'url-encoder-decoder' },
  'roman-numerals': { de: 'roemische-zahlen' },
  'lorem-ipsum-generator': { de: 'lorem-ipsum-generator' },
  'timezone-converter': { de: 'zeitzonen-rechner' },
  'hash-generator': { de: 'hash-generator' },
  'qr-code-generator': { de: 'qr-code-generator' },
  'sql-formatter': { de: 'sql-formatter' },
  'xml-formatter': { de: 'xml-formatter' },
  'css-formatter': { de: 'css-formatter' },
  'jwt-decoder': { de: 'jwt-decoder' },
  'contrast-checker': { de: 'kontrast-pruefer' },
  'json-diff': { de: 'json-diff' },
  'json-to-csv': { de: 'json-zu-csv' },
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
