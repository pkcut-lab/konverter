/**
 * tests/audit/all-tools-functional.test.ts — Stage A2 functional smoke for every tool.
 *
 * Per slug-map tool-id:
 *   1. Resolve the source file via the manual `idToFile` map (built from a
 *      grep of `id: '<id>'` exports across `src/lib/tools/*.ts`).
 *   2. Dynamically import the module — catches Module-load errors per-tool.
 *   3. Find the exported config object (the one with `.id === toolId`).
 *   4. Type-specific sanity invocation:
 *        - converter: computeConversion(formula, 1, 'forward'/'inverse'); finite
 *        - generator: config.generate() returns truthy
 *        - validator: config.validate('sample') returns boolean
 *        - diff/comparer: config.diff('a','b') returns defined
 *        - formatter with format(): invoked on safe input, errors swallowed
 *        - calculator: pure compute*() functions invoked separately
 *        - file-tool / ml-tool / custom: import-only (no model-load smoke here)
 */

import { describe, it, expect } from 'vitest';
import { slugMap } from '../../src/lib/slug-map';
import { computeConversion } from '../../src/lib/tools/compute';

const idToFile: Record<string, string> = {
  'meter-to-feet': 'meter-zu-fuss',
  'foot-to-meter': 'fuss-zu-meter',
  'png-jpg-to-webp': 'png-jpg-to-webp',
  'remove-background': 'hintergrund-entferner',
  'cm-to-inch': 'zentimeter-zu-zoll',
  'km-to-mile': 'kilometer-zu-meilen',
  'kg-to-lb': 'kilogramm-zu-pfund',
  'celsius-to-fahrenheit': 'celsius-zu-fahrenheit',
  'sqm-to-sqft': 'quadratmeter-zu-quadratfuss',
  'hevc-to-h264': 'hevc-zu-h264',
  'inch-to-cm': 'zoll-zu-zentimeter',
  'password-generator': 'passwort-generator',
  'hex-to-rgb': 'hex-rgb-konverter',
  'uuid-generator': 'uuid-generator',
  'json-formatter': 'json-formatter',
  'character-counter': 'character-counter',
  'regex-tester': 'regex-tester',
  'text-diff': 'text-diff',
  'unix-timestamp': 'unix-timestamp',
  'base64-encoder': 'base64-encoder',
  'url-encoder-decoder': 'url-encoder-decoder',
  'roman-numerals': 'roemische-zahlen',
  'lorem-ipsum-generator': 'lorem-ipsum-generator',
  'timezone-converter': 'zeitzonen-rechner',
  'hash-generator': 'hash-generator',
  'qr-code-generator': 'qr-code-generator',
  'sql-formatter': 'sql-formatter',
  'xml-formatter': 'xml-formatter',
  'css-formatter': 'css-formatter',
  'jwt-decoder': 'jwt-decoder',
  'contrast-checker': 'kontrast-pruefer',
  'json-diff': 'json-diff',
  'json-to-csv': 'json-zu-csv',
  'image-diff': 'bild-diff',
  'yard-to-meter': 'yard-zu-meter',
  'mm-to-inch': 'millimeter-zu-zoll',
  'nautical-mile-to-km': 'seemeile-zu-kilometer',
  'gram-to-ounce': 'gramm-zu-unzen',
  'lb-to-kg': 'pfund-zu-kilogramm',
  'stone-to-kg': 'stone-zu-kilogramm',
  'tonne-to-pound': 'tonne-zu-pfund',
  'hectare-to-acre': 'hektar-zu-acre',
  'km2-to-mi2': 'quadratkilometer-zu-quadratmeile',
  'liter-to-gallon': 'liter-zu-gallonen',
  'ml-to-floz': 'milliliter-zu-unzen',
  'vat-calculator': 'mehrwertsteuer-rechner',
  'discount-calculator': 'rabatt-rechner',
  'interest-calculator': 'zinsrechner',
  'loan-calculator': 'kreditrechner',
  'hourly-to-annual': 'stundenlohn-jahresgehalt',
  'compound-interest-calculator': 'zinseszins-rechner',
  'gross-net-calculator': 'brutto-netto-rechner',
  'amortization-calculator': 'tilgungsplan-rechner',
  'cash-discount-calculator': 'skonto-rechner',
  'webcam-blur': 'webcam-blur',
  'video-bg-remove': 'video-hintergrund-entfernen',
  'speech-enhancer': 'sprache-verbessern',
  'image-to-text': 'bild-zu-text',
  'ki-text-detektor': 'ki-text-detektor-config',
  'ki-bild-detektor': 'ki-bild-detektor-config',
  'audio-transkription': 'audio-transkription-config',
  'roi-calculator': 'roi-rechner',
  'cash-flow-calculator': 'cash-flow-calculator',
  'kgv-calculator': 'kgv-rechner',
  'leasing-factor-calculator': 'leasing-faktor-rechner',
  'inheritance-tax-calculator': 'erbschaftsteuer-rechner',
  'jpg-to-pdf': 'jpg-zu-pdf',
  'pdf-merge': 'pdf-zusammenfuehren',
  'pdf-split': 'pdf-aufteilen',
  'pdf-compress': 'pdf-komprimieren',
  'pdf-to-jpg': 'pdf-zu-jpg',
  'pdf-password': 'pdf-passwort',
  'moon-phase': 'mondphasen-rechner',
};

// Tools where module import requires browser/WebGL/transformers.js — we still
// import them, but skip type-based invocation (they live behind worker boundaries
// and have no synchronous compute path).
const IMPORT_ONLY = new Set([
  'remove-background',
  'webcam-blur',
  'video-bg-remove',
  'speech-enhancer',
  'image-to-text',
  'ki-text-detektor',
  'ki-bild-detektor',
  'audio-transkription',
  'hevc-to-h264',
  'png-jpg-to-webp',
  'jpg-to-pdf',
  'pdf-merge',
  'pdf-split',
  'pdf-compress',
  'pdf-to-jpg',
  'pdf-password',
  'qr-code-generator',
  'contrast-checker',
  'image-diff',
]);

const TOOL_IDS = Object.keys(slugMap);

describe('Functional smoke — every tool in slug-map (72)', () => {
  it('all tool-ids are mapped to a file', () => {
    const missing = TOOL_IDS.filter((id) => !idToFile[id]);
    expect(missing, `unmapped tool-ids: ${missing.join(', ')}`).toEqual([]);
  });

  for (const id of TOOL_IDS) {
    it(`${id}`, async () => {
      const file = idToFile[id];
      expect(file, `id-to-file mapping for ${id}`).toBeDefined();

      // 1. Module import must succeed.
      const mod = await import(`../../src/lib/tools/${file}.ts`);
      expect(mod, `module load for ${file}.ts`).toBeDefined();

      // 2. Find the config export with matching id.
      const cfg = Object.values(mod).find(
        (v): v is Record<string, unknown> =>
          v != null && typeof v === 'object' && (v as Record<string, unknown>).id === id,
      );
      expect(cfg, `config export with id="${id}" in ${file}.ts`).toBeDefined();
      expect(typeof (cfg as Record<string, unknown>).type, `type field for ${id}`).toBe('string');

      if (IMPORT_ONLY.has(id)) return; // import + config-existence is enough

      const c = cfg as Record<string, unknown>;
      const type = c.type as string;

      // 3. Type-specific functional smoke.
      if (type === 'converter') {
        const formula = c.formula as { type: string; factor: number; offset?: number };
        expect(formula, 'formula present').toBeDefined();
        expect(Number.isFinite(formula.factor), 'finite factor').toBe(true);
        const fwd = computeConversion(formula, 1, 'forward');
        const inv = computeConversion(formula, fwd, 'inverse');
        expect(Number.isFinite(fwd), `fwd finite for ${id}`).toBe(true);
        expect(inv).toBeCloseTo(1, 4);
        return;
      }

      if (typeof c.generate === 'function') {
        const out = (c.generate as () => unknown)();
        expect(out, `generate() output for ${id}`).toBeTruthy();
        return;
      }

      if (typeof c.diff === 'function') {
        // json-diff requires valid JSON inputs; text-diff accepts plain strings.
        const [a, b] = id === 'json-diff' ? ['{"x":1}', '{"x":2}'] : ['foo', 'bar'];
        const out = (c.diff as (a: string, b: string) => unknown)(a, b);
        expect(out, `diff() output for ${id}`).toBeDefined();
        return;
      }

      if (typeof c.validate === 'function') {
        const out = (c.validate as (s: string) => unknown)('test');
        expect(typeof out, `validate() returns boolean for ${id}`).toBe('boolean');
        return;
      }

      if (typeof c.format === 'function') {
        // Formatters need varied inputs — just verify the function exists +
        // is callable (most tolerate empty string OR throw a controlled error).
        try {
          (c.format as (s: string) => unknown)('');
        } catch {
          /* acceptable — many formatters reject empty input by design */
        }
        return;
      }

      // Calculator/Analyzer with no top-level config-bound function:
      // sanity on label fields only.
      expect(typeof c.id, 'id is string').toBe('string');
    });
  }
});
