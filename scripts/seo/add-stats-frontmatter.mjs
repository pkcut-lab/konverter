/**
 * One-shot migration: inserts `stats:` block into tool MDX frontmatter
 * before the `contentVersion` field. Safe to re-run (skips if stats already present).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../../');

const TOOL_STATS = {
  'meter-zu-fuss': {
    de: [
      { label: 'Genauigkeit', value: '5', unit: 'Dezimalstellen' },
      { label: 'Verarbeitung', value: '<1', unit: 'ms' },
      { label: 'Datenschutz', value: 'lokal' },
    ],
    en: [
      { label: 'Precision', value: '5', unit: 'decimals' },
      { label: 'Processing', value: '<1', unit: 'ms' },
      { label: 'Privacy', value: 'local' },
    ],
  },
  'webp-konverter': {
    de: [
      { label: 'Max. Dateigröße', value: '50', unit: 'MB' },
      { label: 'Ausgabeformate', value: '3' },
      { label: 'Verarbeitung', value: 'im Browser' },
    ],
    en: [
      { label: 'Max file size', value: '50', unit: 'MB' },
      { label: 'Output formats', value: '3' },
      { label: 'Processing', value: 'in browser' },
    ],
  },
  'passwort-generator': {
    de: [
      { label: 'Zeichensatz', value: '94', unit: 'Zeichen' },
      { label: 'Max. Entropie', value: '512', unit: 'bit' },
      { label: 'Sicherheit', value: 'kryptografisch' },
    ],
    en: [
      { label: 'Charset', value: '94', unit: 'chars' },
      { label: 'Max entropy', value: '512', unit: 'bit' },
      { label: 'Security', value: 'cryptographic' },
    ],
  },
  'json-formatter': {
    de: [
      { label: 'Max. Eingabe', value: '10', unit: 'MB' },
      { label: 'Verarbeitung', value: '<50', unit: 'ms' },
      { label: 'Datenschutz', value: 'lokal' },
    ],
    en: [
      { label: 'Max input', value: '10', unit: 'MB' },
      { label: 'Processing', value: '<50', unit: 'ms' },
      { label: 'Privacy', value: 'local' },
    ],
  },
  'hevc-zu-h264': {
    de: [
      { label: 'Max. Dateigröße', value: '4', unit: 'GB' },
      { label: 'Video-API', value: 'WebCodecs' },
      { label: 'Qualität', value: 'konfigurierbar' },
    ],
    en: [
      { label: 'Max file size', value: '4', unit: 'GB' },
      { label: 'Video API', value: 'WebCodecs' },
      { label: 'Quality', value: 'configurable' },
    ],
  },
  'brutto-netto-rechner': {
    de: [
      { label: 'Steuerklassen', value: '6' },
      { label: 'Bundesländer', value: '16' },
      { label: 'Genauigkeit', value: '±0,01', unit: 'EUR' },
    ],
    en: [
      { label: 'Tax classes', value: '6' },
      { label: 'Federal states', value: '16' },
      { label: 'Precision', value: '±0.01', unit: 'EUR' },
    ],
  },
  'zinsrechner': {
    de: [
      { label: 'Zinsintervalle', value: '4' },
      { label: 'Genauigkeit', value: '±0,01', unit: 'EUR' },
      { label: 'Verarbeitung', value: 'Echtzeit' },
    ],
    en: [
      { label: 'Compounding', value: '4', unit: 'intervals' },
      { label: 'Precision', value: '±0.01', unit: 'EUR' },
      { label: 'Processing', value: 'real-time' },
    ],
  },
  'hex-rgb-konverter': {
    de: [
      { label: 'Farbformate', value: '5' },
      { label: 'Konvertierung', value: 'Echtzeit' },
      { label: 'Farbraum', value: 'sRGB' },
    ],
    en: [
      { label: 'Color formats', value: '5' },
      { label: 'Conversion', value: 'real-time' },
      { label: 'Color space', value: 'sRGB' },
    ],
  },
  'qr-code-generator': {
    de: [
      { label: 'Fehlerkorrektur', value: '4', unit: 'Stufen' },
      { label: 'Max. Daten', value: '4296', unit: 'Zeichen' },
      { label: 'Ausgabe', value: 'SVG + PNG' },
    ],
    en: [
      { label: 'Error correction', value: '4', unit: 'levels' },
      { label: 'Max data', value: '4296', unit: 'chars' },
      { label: 'Output', value: 'SVG + PNG' },
    ],
  },
  'hash-generator': {
    de: [
      { label: 'Algorithmen', value: '5' },
      { label: 'Max. Eingabe', value: 'unbegrenzt' },
      { label: 'Verarbeitung', value: 'lokal' },
    ],
    en: [
      { label: 'Algorithms', value: '5' },
      { label: 'Max input', value: 'unlimited' },
      { label: 'Processing', value: 'local' },
    ],
  },
};

function buildStatsYaml(stats) {
  const lines = ['stats:'];
  for (const s of stats) {
    lines.push(`  - label: "${s.label}"`);
    lines.push(`    value: "${s.value}"`);
    if (s.unit) lines.push(`    unit: "${s.unit}"`);
  }
  return lines.join('\n');
}

let modified = 0;
let skipped = 0;

for (const [toolSlug, langStats] of Object.entries(TOOL_STATS)) {
  for (const [lang, stats] of Object.entries(langStats)) {
    const filePath = join(ROOT, 'src/content/tools', toolSlug, `${lang}.md`);
    const content = readFileSync(filePath, 'utf8');

    if (content.includes('stats:')) {
      console.log(`SKIP  ${toolSlug}/${lang}.md (already has stats)`);
      skipped++;
      continue;
    }

    const statsYaml = buildStatsYaml(stats);
    const updated = content.replace(/^(contentVersion:)/m, `${statsYaml}\n$1`);

    if (updated === content) {
      console.warn(`WARN  ${toolSlug}/${lang}.md — contentVersion not found, skipping`);
      skipped++;
      continue;
    }

    writeFileSync(filePath, updated, 'utf8');
    console.log(`OK    ${toolSlug}/${lang}.md`);
    modified++;
  }
}

console.log(`\nDone: ${modified} modified, ${skipped} skipped`);
