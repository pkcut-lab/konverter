import type { ToolConfig } from './tools/schemas';

/**
 * Single source of truth for tool configurations.
 *
 * Lazy-load contract: every entry is `() => import('./tools/<file>')`. Static
 * imports in this file are FORBIDDEN — they would collapse 44 (and eventually
 * 1000+) tool modules into a single static graph that Vite must resolve for
 * every page render during SSG, producing non-linear build-time degradation.
 * With lazy loaders each page frontmatter only resolves the one tool config it
 * actually needs.
 *
 * Adding a new tool requires two edits:
 *   1. Add an entry to the `loaders` map below (`toolId` → `() => import(...)`)
 *   2. Add matching entries to `src/lib/slug-map.ts` for every language
 *
 * The dynamic route at `src/pages/[lang]/[slug].astro` awaits `getToolConfig`
 * at build time to resolve `toolId` → runtime config.
 */

type ToolLoader = () => Promise<ToolConfig>;

const loaders: Record<string, ToolLoader> = {
  'meter-to-feet': () => import('./tools/meter-zu-fuss').then((m) => m.meterZuFuss),
  'foot-to-meter': () => import('./tools/fuss-zu-meter').then((m) => m.fussZuMeter),
  'png-jpg-to-webp': () => import('./tools/png-jpg-to-webp').then((m) => m.pngJpgToWebp),
  'remove-background': () =>
    import('./tools/hintergrund-entferner').then((m) => m.hintergrundEntferner),
  'cm-to-inch': () => import('./tools/zentimeter-zu-zoll').then((m) => m.zentimeterZuZoll),
  'km-to-mile': () => import('./tools/kilometer-zu-meilen').then((m) => m.kilometerZuMeilen),
  'kg-to-lb': () => import('./tools/kilogramm-zu-pfund').then((m) => m.kilogrammZuPfund),
  'celsius-to-fahrenheit': () =>
    import('./tools/celsius-zu-fahrenheit').then((m) => m.celsiusZuFahrenheit),
  'sqm-to-sqft': () =>
    import('./tools/quadratmeter-zu-quadratfuss').then((m) => m.quadratmeterZuQuadratfuss),
  'hevc-to-h264': () => import('./tools/hevc-zu-h264').then((m) => m.hevcZuH264),
  'inch-to-cm': () => import('./tools/zoll-zu-zentimeter').then((m) => m.zollZuZentimeter),
  'hex-to-rgb': () => import('./tools/hex-rgb-konverter').then((m) => m.hexRgbKonverter),
  'uuid-generator': () => import('./tools/uuid-generator').then((m) => m.uuidGenerator),
  'password-generator': () =>
    import('./tools/passwort-generator').then((m) => m.passwortGenerator),
  'json-formatter': () => import('./tools/json-formatter').then((m) => m.jsonFormatter),
  'character-counter': () =>
    import('./tools/character-counter').then((m) => m.characterCounter),
  'regex-tester': () => import('./tools/regex-tester').then((m) => m.regexTester),
  'text-diff': () => import('./tools/text-diff').then((m) => m.textDiff),
  'unix-timestamp': () => import('./tools/unix-timestamp').then((m) => m.unixTimestamp),
  'base64-encoder': () => import('./tools/base64-encoder').then((m) => m.base64Encoder),
  'url-encoder-decoder': () =>
    import('./tools/url-encoder-decoder').then((m) => m.urlEncoderDecoder),
  'roman-numerals': () => import('./tools/roemische-zahlen').then((m) => m.roemischeZahlen),
  'lorem-ipsum-generator': () =>
    import('./tools/lorem-ipsum-generator').then((m) => m.loremIpsumGenerator),
  'timezone-converter': () =>
    import('./tools/zeitzonen-rechner').then((m) => m.zeitzonenRechner),
  'hash-generator': () => import('./tools/hash-generator').then((m) => m.hashGenerator),
  'qr-code-generator': () =>
    import('./tools/qr-code-generator').then((m) => m.qrCodeGenerator),
  'sql-formatter': () => import('./tools/sql-formatter').then((m) => m.sqlFormatter),
  'xml-formatter': () => import('./tools/xml-formatter').then((m) => m.xmlFormatter),
  'css-formatter': () => import('./tools/css-formatter').then((m) => m.cssFormatter),
  'jwt-decoder': () => import('./tools/jwt-decoder').then((m) => m.jwtDecoder),
  'contrast-checker': () => import('./tools/kontrast-pruefer').then((m) => m.kontrastPruefer),
  'json-diff': () => import('./tools/json-diff').then((m) => m.jsonDiff),
  'json-to-csv': () => import('./tools/json-zu-csv').then((m) => m.jsonZuCsv),
  'image-diff': () => import('./tools/bild-diff').then((m) => m.bildDiff),
  'yard-to-meter': () => import('./tools/yard-zu-meter').then((m) => m.yardZuMeter),
  'mm-to-inch': () => import('./tools/millimeter-zu-zoll').then((m) => m.millimeterZuZoll),
  'nautical-mile-to-km': () =>
    import('./tools/seemeile-zu-kilometer').then((m) => m.seemeileZuKilometer),
  'gram-to-ounce': () => import('./tools/gramm-zu-unzen').then((m) => m.grammZuUnzen),
  'lb-to-kg': () => import('./tools/pfund-zu-kilogramm').then((m) => m.pfundZuKilogramm),
  'stone-to-kg': () => import('./tools/stone-zu-kilogramm').then((m) => m.stoneZuKilogramm),
  'tonne-to-pound': () => import('./tools/tonne-zu-pfund').then((m) => m.tonneZuPfund),
  'hectare-to-acre': () => import('./tools/hektar-zu-acre').then((m) => m.hektarZuAcre),
  'km2-to-mi2': () =>
    import('./tools/quadratkilometer-zu-quadratmeile').then(
      (m) => m.quadratkilometerZuQuadratmeile,
    ),
  'liter-to-gallon': () => import('./tools/liter-zu-gallonen').then((m) => m.literZuGallonen),
  'ml-to-floz': () =>
    import('./tools/milliliter-zu-unzen').then((m) => m.milliliterZuUnzen),
  'vat-calculator': () =>
    import('./tools/mehrwertsteuer-rechner').then((m) => m.mehrwertsteuerRechner),
  'discount-calculator': () =>
    import('./tools/rabatt-rechner').then((m) => m.rabattRechner),
  'interest-calculator': () => import('./tools/zinsrechner').then((m) => m.zinsrechner),
  'loan-calculator': () => import('./tools/kreditrechner').then((m) => m.kreditrechner),
  'hourly-to-annual': () =>
    import('./tools/stundenlohn-jahresgehalt').then((m) => m.stundenlohnJahresgehalt),
  'compound-interest-calculator': () =>
    import('./tools/zinseszins-rechner').then((m) => m.zinseszinsRechner),
  'gross-net-calculator': () =>
    import('./tools/brutto-netto-rechner').then((m) => m.bruttoNettoRechner),
  'amortization-calculator': () =>
    import('./tools/tilgungsplan-rechner').then((m) => m.tilgungsplanRechner),
  'cash-discount-calculator': () =>
    import('./tools/skonto-rechner').then((m) => m.skontoRechner),
  'webcam-blur': () =>
    import('./tools/webcam-blur').then((m) => m.webcamHintergrundUnschaerfe),
  'video-bg-remove': () =>
    import('./tools/video-hintergrund-entfernen').then((m) => m.videoBgRemove),
  'speech-enhancer': () =>
    import('./tools/sprache-verbessern').then((m) => m.spracheVerbessern),
  'image-to-text': () =>
    import('./tools/bild-zu-text').then((m) => m.bildZuText),
  'ki-text-detektor': () =>
    import('./tools/ki-text-detektor-config').then((m) => m.kiTextDetektor),
  'ki-bild-detektor': () =>
    import('./tools/ki-bild-detektor-config').then((m) => m.kiBildDetektor),
  'audio-transkription': () =>
    import('./tools/audio-transkription-config').then((m) => m.audioTranskriptionConfig),
  'roi-calculator': () => import('./tools/roi-rechner').then((m) => m.roiRechner),
  'cash-flow-calculator': () =>
    import('./tools/cash-flow-calculator').then((m) => m.cashflowRechner),
  'kgv-calculator': () => import('./tools/kgv-rechner').then((m) => m.kgvRechner),
  'leasing-factor-calculator': () =>
    import('./tools/leasing-faktor-rechner').then((m) => m.leasingFaktorRechner),
  'inheritance-tax-calculator': () =>
    import('./tools/erbschaftsteuer-rechner').then((m) => m.erbschaftsteuerRechner),
  'jpg-to-pdf': () =>
    import('./tools/jpg-zu-pdf').then((m) => m.jpgZuPdf),
  'pdf-merge': () =>
    import('./tools/pdf-zusammenfuehren').then((m) => m.pdfZusammenfuehren),
  'pdf-split': () =>
    import('./tools/pdf-aufteilen').then((m) => m.pdfAufteilen),
  'pdf-compress': () =>
    import('./tools/pdf-komprimieren').then((m) => m.pdfKomprimieren),
};

/** Lightweight existence check — no module load. Use for filtering before
 *  you commit to awaiting the config (e.g. inside getStaticPaths filter). */
export function hasTool(toolId: string): boolean {
  return toolId in loaders;
}

/** List every registered tool id without resolving any module. */
export function getRegisteredToolIds(): string[] {
  return Object.keys(loaders);
}

export async function getToolConfig(toolId: string): Promise<ToolConfig | undefined> {
  const loader = loaders[toolId];
  if (!loader) return undefined;
  return loader();
}
