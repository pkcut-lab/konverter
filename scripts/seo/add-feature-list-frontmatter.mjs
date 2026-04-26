/**
 * One-shot migration: adds featureList to generator tools.
 * Safe to re-run (skips if featureList already present).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../../');

const TOOL_FEATURE_LISTS = {
  'passwort-generator': {
    de: [
      'Kryptografisch sicherer Zufallsgenerator',
      'Konfigurierbare Zeichensätze (Groß/Klein/Ziffern/Sonderzeichen)',
      'Passwortlänge 4–128 Zeichen',
      'Entropie-Anzeige in Bit',
      'Keine Übertragung — alles bleibt im Browser',
    ],
    en: [
      'Cryptographically secure random generator',
      'Configurable character sets (upper/lower/digits/symbols)',
      'Password length 4–128 characters',
      'Entropy display in bits',
      'No transmission — everything stays in the browser',
    ],
  },
  'qr-code-generator': {
    de: [
      'Vier Fehlerkorrektur-Stufen (L/M/Q/H)',
      'Ausgabe als SVG und PNG',
      'Anpassbare Größe und Randbreite',
      'Unterstützt URLs, Text, E-Mail, WLAN, vCard',
      'Keine Server-Übertragung — clientseitig generiert',
    ],
    en: [
      'Four error correction levels (L/M/Q/H)',
      'Output as SVG and PNG',
      'Customizable size and border width',
      'Supports URLs, text, email, Wi-Fi, vCard',
      'No server upload — generated client-side',
    ],
  },
  'hash-generator': {
    de: [
      'SHA-256, SHA-512, SHA-1, MD5, SHA-3 Algorithmen',
      'Echtzeit-Hashing während der Eingabe',
      'Große Eingaben bis zu mehreren MB unterstützt',
      'Hex- und Base64-Ausgabe',
      'Keine Übertragung — vollständig clientseitig',
    ],
    en: [
      'SHA-256, SHA-512, SHA-1, MD5, SHA-3 algorithms',
      'Real-time hashing while typing',
      'Large inputs up to several MB supported',
      'Hex and Base64 output',
      'No upload — fully client-side',
    ],
  },
};

function buildFeatureListYaml(features) {
  const lines = ['featureList:'];
  for (const f of features) {
    lines.push(`  - "${f}"`);
  }
  return lines.join('\n');
}

let modified = 0;
let skipped = 0;

for (const [toolSlug, langFeatures] of Object.entries(TOOL_FEATURE_LISTS)) {
  for (const [lang, features] of Object.entries(langFeatures)) {
    const filePath = join(ROOT, 'src/content/tools', toolSlug, `${lang}.md`);
    const content = readFileSync(filePath, 'utf8');

    if (content.includes('featureList:')) {
      console.log(`SKIP  ${toolSlug}/${lang}.md (already has featureList)`);
      skipped++;
      continue;
    }

    const yaml = buildFeatureListYaml(features);
    const updated = content.replace(/^(contentVersion:)/m, `${yaml}\n$1`);

    if (updated === content) {
      console.warn(`WARN  ${toolSlug}/${lang}.md — contentVersion not found`);
      skipped++;
      continue;
    }

    writeFileSync(filePath, updated, 'utf8');
    console.log(`OK    ${toolSlug}/${lang}.md`);
    modified++;
  }
}

console.log(`\nDone: ${modified} modified, ${skipped} skipped`);
