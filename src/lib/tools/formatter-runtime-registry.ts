/**
 * Client-side lookup for formatter `format` / `inverse` functions.
 *
 * Astro serializes island props to JSON on hydration and drops function-valued
 * config fields to null — the Formatter-family components therefore look up
 * their implementation here by `config.id`.
 *
 * Lazy-load contract: every formatter module lives behind `() => import()` so
 * Rollup splits each into its own chunk. A tool page only downloads its own
 * formatter, not all 17. Static imports in this file are FORBIDDEN — they
 * collapse the split back into a single shared bundle that scales O(n) with
 * the tool count.
 *
 * Adding a new formatter requires two edits here:
 *   1. Append a `[config.id]: () => import('./<file>').then((m) => m.<name>)`
 *      entry to the `loaders` map below.
 *   2. Nothing else — the registry exports only `loadFormatter`, which is
 *      consumed by the generic Formatter / ColorConverter / (future) specialised
 *      components.
 */

export type FormatFn = (input: string) => string;

export interface FormatterEntry {
  id: string;
  format: FormatFn;
  inverse?: FormatFn;
}

const loaders: Record<string, () => Promise<FormatterEntry>> = {
  'base64-encoder': () => import('./base64-encoder').then((m) => m.base64Encoder),
  'image-diff': () => import('./bild-diff').then((m) => m.bildDiff),
  'css-formatter': () => import('./css-formatter').then((m) => m.cssFormatter),
  'hash-generator': () => import('./hash-generator').then((m) => m.hashGenerator),
  'hex-to-rgb': () => import('./hex-rgb-konverter').then((m) => m.hexRgbKonverter),
  'json-formatter': () => import('./json-formatter').then((m) => m.jsonFormatter),
  'json-to-csv': () => import('./json-zu-csv').then((m) => m.jsonZuCsv),
  'jwt-decoder': () => import('./jwt-decoder').then((m) => m.jwtDecoder),
  'contrast-checker': () => import('./kontrast-pruefer').then((m) => m.kontrastPruefer),
  'lorem-ipsum-generator': () =>
    import('./lorem-ipsum-generator').then((m) => m.loremIpsumGenerator),
  'qr-code-generator': () => import('./qr-code-generator').then((m) => m.qrCodeGenerator),
  'roman-numerals': () => import('./roemische-zahlen').then((m) => m.roemischeZahlen),
  'sql-formatter': () => import('./sql-formatter').then((m) => m.sqlFormatter),
  'unix-timestamp': () => import('./unix-timestamp').then((m) => m.unixTimestamp),
  'url-encoder-decoder': () =>
    import('./url-encoder-decoder').then((m) => m.urlEncoderDecoder),
  'xml-formatter': () => import('./xml-formatter').then((m) => m.xmlFormatter),
  'timezone-converter': () => import('./zeitzonen-rechner').then((m) => m.zeitzonenRechner),
};

export function hasFormatter(toolId: string): boolean {
  return toolId in loaders;
}

export async function loadFormatter(toolId: string): Promise<FormatterEntry | undefined> {
  const loader = loaders[toolId];
  if (!loader) return undefined;
  return loader();
}
