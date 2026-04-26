import type { Lang } from './tools/types';
import { ACTIVE_LANGUAGES } from './hreflang';

/**
 * Tool-ID ↔ Slug mapping per language.
 * Phase 1: 'de' slots only. Phase 3: 'en' slots added (this file).
 *
 * Shape: { [toolId]: { [lang]: slug } }. Partial per-lang record — a tool
 * may not yet have all active-language slugs filled.
 *
 * `getSlug()` is defensive and `hreflang.ts` filters by `ACTIVE_LANGUAGES`,
 * so missing slots never 404.
 */
export const slugMap: Record<string, Partial<Record<Lang, string>>> = {
  // ── Length ──────────────────────────────────────────────────────────────
  'meter-to-feet':       { de: 'meter-zu-fuss',                    en: 'meter-to-feet' },
  'foot-to-meter':       { de: 'fuss-zu-meter',                    en: 'feet-to-meters' },
  'cm-to-inch':          { de: 'zentimeter-zu-zoll',               en: 'cm-to-inches' },
  'inch-to-cm':          { de: 'zoll-zu-zentimeter',               en: 'inches-to-cm' },
  'km-to-mile':          { de: 'kilometer-zu-meilen',              en: 'km-to-miles' },
  'mm-to-inch':          { de: 'millimeter-zu-zoll',               en: 'mm-to-inches' },
  'nautical-mile-to-km': { de: 'seemeile-zu-kilometer',            en: 'nautical-miles-to-km' },
  'yard-to-meter':       { de: 'yard-zu-meter',                    en: 'yards-to-meters' },

  // ── Weight ──────────────────────────────────────────────────────────────
  'kg-to-lb':            { de: 'kilogramm-zu-pfund',               en: 'kg-to-lbs' },
  'lb-to-kg':            { de: 'pfund-zu-kilogramm',               en: 'lbs-to-kg' },
  'gram-to-ounce':       { de: 'gramm-zu-unzen',                   en: 'grams-to-ounces' },
  'stone-to-kg':         { de: 'stone-zu-kilogramm',               en: 'stone-to-kg' },
  'tonne-to-pound':      { de: 'tonne-zu-pfund',                   en: 'metric-tons-to-pounds' },

  // ── Area ─────────────────────────────────────────────────────────────────
  'sqm-to-sqft':         { de: 'quadratmeter-zu-quadratfuss',      en: 'sqm-to-sqft' },
  'hectare-to-acre':     { de: 'hektar-zu-acre',                   en: 'hectares-to-acres' },
  'km2-to-mi2':          { de: 'quadratkilometer-zu-quadratmeile', en: 'square-km-to-square-miles' },

  // ── Volume ───────────────────────────────────────────────────────────────
  'liter-to-gallon':     { de: 'liter-zu-gallonen',                en: 'liters-to-gallons' },
  'ml-to-floz':          { de: 'milliliter-zu-unzen',              en: 'ml-to-fluid-ounces' },

  // ── Temperature ──────────────────────────────────────────────────────────
  'celsius-to-fahrenheit': { de: 'celsius-zu-fahrenheit',          en: 'celsius-to-fahrenheit' },

  // ── Image ────────────────────────────────────────────────────────────────
  'png-jpg-to-webp':     { de: 'webp-konverter',                   en: 'webp-converter' },
  'remove-background':   { de: 'hintergrund-entfernen',            en: 'background-remover' },
  'image-diff':          { de: 'bild-diff',                        en: 'image-diff' },
  'qr-code-generator':   { de: 'qr-code-generator',               en: 'qr-code-generator' },
  'webcam-blur':         { de: 'webcam-hintergrund-unschaerfe',    en: 'webcam-background-blur' },

  // ── Video ────────────────────────────────────────────────────────────────
  'hevc-to-h264':        { de: 'hevc-zu-h264',                    en: 'hevc-to-h264' },
  'video-bg-remove':     { de: 'video-hintergrund-entfernen',      en: 'video-background-remover' },

  // ── Text ─────────────────────────────────────────────────────────────────
  'character-counter':   { de: 'zeichenzaehler',                   en: 'character-counter' },
  'roman-numerals':      { de: 'roemische-zahlen',                 en: 'roman-numeral-converter' },
  'lorem-ipsum-generator': { de: 'lorem-ipsum-generator',         en: 'lorem-ipsum-generator' },
  'text-diff':           { de: 'text-diff',                        en: 'text-diff' },
  'speech-enhancer':     { de: 'sprache-verbessern',               en: 'speech-enhancer' },
  'audio-transkription': { de: 'audio-transkription',              en: 'audio-transcription' },
  'image-to-text':       { de: 'bild-zu-text',                    en: 'image-to-text' },
  'ki-text-detektor':    { de: 'ki-text-detektor',                en: 'ai-text-detector' },
  'ki-bild-detektor':    { de: 'ki-bild-detektor',                en: 'ai-image-detector' },

  // ── Developer ────────────────────────────────────────────────────────────
  'password-generator':  { de: 'passwort-generator',               en: 'password-generator' },
  'uuid-generator':      { de: 'uuid-generator',                   en: 'uuid-generator' },
  'json-formatter':      { de: 'json-formatter',                   en: 'json-formatter' },
  'regex-tester':        { de: 'regex-tester',                     en: 'regex-tester' },
  'base64-encoder':      { de: 'base64-encoder',                   en: 'base64-encoder' },
  'url-encoder-decoder': { de: 'url-encoder-decoder',              en: 'url-encoder-decoder' },
  'hash-generator':      { de: 'hash-generator',                   en: 'hash-generator' },
  'sql-formatter':       { de: 'sql-formatter',                    en: 'sql-formatter' },
  'xml-formatter':       { de: 'xml-formatter',                    en: 'xml-formatter' },
  'css-formatter':       { de: 'css-formatter',                    en: 'css-formatter' },
  'jwt-decoder':         { de: 'jwt-decoder',                      en: 'jwt-decoder' },
  'json-diff':           { de: 'json-diff',                        en: 'json-diff' },
  'json-to-csv':         { de: 'json-zu-csv',                      en: 'json-to-csv' },

  // ── Color ────────────────────────────────────────────────────────────────
  'hex-to-rgb':          { de: 'hex-rgb-konverter',                en: 'hex-to-rgb' },
  'contrast-checker':    { de: 'kontrast-pruefer',                 en: 'contrast-checker' },

  // ── Time ─────────────────────────────────────────────────────────────────
  'unix-timestamp':      { de: 'unix-timestamp',                   en: 'unix-timestamp-converter' },
  'timezone-converter':  { de: 'zeitzonen-rechner',                en: 'timezone-converter' },

  // ── Nature ───────────────────────────────────────────────────────────────
  'moon-phase':          { de: 'mondphasen-rechner',               en: 'moon-phase-calculator' },

  // ── Finance ──────────────────────────────────────────────────────────────
  'vat-calculator':              { de: 'mehrwertsteuer-rechner',   en: 'vat-calculator' },
  'discount-calculator':         { de: 'rabatt-rechner',           en: 'discount-calculator' },
  'interest-calculator':         { de: 'zinsrechner',              en: 'interest-calculator' },
  'loan-calculator':             { de: 'kreditrechner',            en: 'loan-calculator' },
  'hourly-to-annual':            { de: 'stundenlohn-jahresgehalt', en: 'hourly-to-annual-salary' },
  'compound-interest-calculator':{ de: 'zinseszins-rechner',       en: 'compound-interest-calculator' },
  'gross-net-calculator':        { de: 'brutto-netto-rechner',     en: 'gross-to-net-calculator' },
  'amortization-calculator':     { de: 'tilgungsplan-rechner',     en: 'amortization-calculator' },
  'cash-discount-calculator':    { de: 'skonto-rechner',           en: 'cash-discount-calculator' },
  'roi-calculator':              { de: 'roi-rechner',              en: 'roi-calculator' },
  'cash-flow-calculator':        { de: 'cashflow-rechner',         en: 'cash-flow-calculator' },
  'kgv-calculator':              { de: 'kgv-rechner',              en: 'pe-ratio-calculator' },
  'leasing-factor-calculator':   { de: 'leasing-faktor-rechner',  en: 'lease-factor-calculator' },
  'inheritance-tax-calculator':  { de: 'erbschaftsteuer-rechner',  en: 'inheritance-tax-calculator' },

  // ── Document ─────────────────────────────────────────────────────────────
  'jpg-to-pdf':  { de: 'jpg-zu-pdf',           en: 'jpg-to-pdf' },
  'pdf-merge':   { de: 'pdf-zusammenfuehren',  en: 'pdf-merger' },
  'pdf-split':   { de: 'pdf-aufteilen',         en: 'pdf-splitter' },
  'pdf-compress':{ de: 'pdf-komprimieren',      en: 'pdf-compressor' },
  'pdf-to-jpg':  { de: 'pdf-zu-jpg',            en: 'pdf-to-jpg' },
  'pdf-password':{ de: 'pdf-passwort',          en: 'pdf-password-remover' },
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
