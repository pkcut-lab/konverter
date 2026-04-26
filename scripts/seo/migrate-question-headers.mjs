/**
 * scripts/seo/migrate-question-headers.mjs
 *
 * Rewrites H2 headings in src/content/tools/**\/\*.md to question form.
 * Uses an explicit mapping table — no AI, no guessing.
 * Safe to re-run (idempotent via lint check).
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../../');
const TOOLS_DIR = join(ROOT, 'src/content/tools');

/** Exact heading → question-form replacement. Covers all 132 unique violations. */
const REPLACEMENTS = new Map([
  // ── DE: Formulas ────────────────────────────────────────────────────────────
  ['Umrechnungsformel',                        'Was ist die Umrechnungsformel?'],
  ['Umrechnungsformeln',                       'Welche Umrechnungsformeln gibt es?'],
  ['Berechnungsformel',                        'Was ist die Berechnungsformel?'],
  ['Berechnungsformeln',                       'Welche Berechnungsformeln gibt es?'],
  ['Annuitäten-Formel',                        'Was ist die Annuitäten-Formel?'],
  ['Annuitätenformel',                         'Was ist die Annuitätenformel?'],
  ['Leasingfaktor-Formel',                     'Was ist die Leasingfaktor-Formel?'],
  ['Rechenbeispiele',                          'Welche Rechenbeispiele gibt es?'],
  ['Konvertierungsalgorithmus',                'Wie funktioniert der Konvertierungsalgorithmus?'],

  // ── DE: Use cases & examples ─────────────────────────────────────────────
  ['Anwendungsbeispiele',                      'Welche Anwendungsbeispiele gibt es?'],
  ['Häufige Einsatzgebiete',                   'Welche Einsatzgebiete gibt es?'],
  ['Haeufige Einsatzgebiete',                  'Welche Einsatzgebiete gibt es?'],
  ['Typische Einsatzgebiete',                  'Welche typischen Einsatzgebiete gibt es?'],

  // ── DE: FAQ variants ─────────────────────────────────────────────────────
  ['FAQ',                                      'Häufige Fragen?'],
  ['Haeufige Fragen',                          'Häufige Fragen?'],
  ['FAQ Expansion',                            'Häufige Fragen?'],

  // ── DE: Related tools ────────────────────────────────────────────────────
  ['Verwandte Audio-Tools',                    'Welche Audio-Tools sind verwandt?'],
  ['Verwandte Bild-Tools',                     'Welche Bild-Tools sind verwandt?'],
  ['Verwandte Dokumenten-Tools',               'Welche Dokumenten-Tools sind verwandt?'],
  ['Verwandte Entwickler-Tools',               'Welche Entwickler-Tools sind verwandt?'],
  ['Verwandte Farb-Tools',                     'Welche Farb-Tools sind verwandt?'],
  ['Verwandte Finanz-Tools',                   'Welche Finanz-Tools sind verwandt?'],
  ['Verwandte Flächen-Tools',                  'Welche Flächen-Tools sind verwandt?'],
  ['Verwandte Gewichts-Tools',                 'Welche Gewichts-Tools sind verwandt?'],
  ['Verwandte Längen-Tools',                   'Welche Längen-Tools sind verwandt?'],
  ['Verwandte Temperatur-Tools',               'Welche Temperatur-Tools sind verwandt?'],
  ['Verwandte Text-Tools',                     'Welche Text-Tools sind verwandt?'],
  ['Verwandte Video-Tools',                    'Welche Video-Tools sind verwandt?'],
  ['Verwandte Volumen-Tools',                  'Welche Volumen-Tools sind verwandt?'],
  ['Verwandte Zeit-Tools',                     'Welche Zeit-Tools sind verwandt?'],

  // ── DE: Tips / hints ─────────────────────────────────────────────────────
  ['Tipps für optimale Ergebnisse',            'Wie erhalte ich optimale Ergebnisse?'],
  ['Tipps für zuverlässigere Ergebnisse',      'Wie erhalte ich zuverlässigere Ergebnisse?'],
  ['Häufige Stolperfallen',                    'Welche Stolperfallen gibt es?'],
  ['Typische Stolperfallen',                   'Welche typischen Stolperfallen gibt es?'],
  ['Grenzen des Tools',                        'Welche Grenzen hat das Tool?'],
  ['Grenzen dieses Tools',                     'Welche Grenzen hat dieses Tool?'],
  ['Sicherheitshinweise',                      'Welche Sicherheitshinweise gibt es?'],
  ['Technische Hinweise',                      'Welche technischen Hinweise gibt es?'],
  ['Bewertungsskala',                          'Welche Bewertungsskala wird verwendet?'],
  ['Stärke-Einstellungen',                     'Welche Stärke-Einstellungen gibt es?'],

  // ── DE: Instructional (So → Wie) ─────────────────────────────────────────
  ['So entfernst du einen Hintergrund',        'Wie entfernst du einen Hintergrund?'],
  ['So führst du PDFs zusammen',               'Wie führst du PDFs zusammen?'],
  ['So teilst du ein PDF auf',                 'Wie teilst du ein PDF auf?'],
  ['Hintergrund unscharf machen — Schritt für Schritt', 'Wie macht man den Hintergrund unscharf?'],
  ['Seiten-Auswahl per Vorschau-Grid',         'Wie wählst du Seiten per Vorschau-Grid aus?'],
  ['Modell-Wahl: Qualität oder Schnell',       'Wie wähle ich das richtige Modell?'],
  ['DPI-Einstellungen erklärt',                'Wie funktionieren DPI-Einstellungen?'],

  // ── DE: Comparison / overview headings ───────────────────────────────────
  ['Die drei Berechnungsmethoden im Überblick', 'Welche drei Berechnungsmethoden gibt es?'],
  ['Zeilen-Diff vs. Wort-Diff vs. Zeichen-Diff', 'Was ist der Unterschied zwischen Zeilen-, Wort- und Zeichen-Diff?'],
  ['JSON vs. JSON5 vs. JSONC',                 'Was ist der Unterschied zwischen JSON, JSON5 und JSONC?'],
  ['UUID vs. Alternativen',                    'Was sind UUID-Alternativen?'],
  ['UUID-Versionen im Vergleich',              'Welche UUID-Versionen gibt es im Vergleich?'],
  ['Aufbau einer UUID',                        'Wie ist eine UUID aufgebaut?'],
  ['Regex-Flags im Überblick',                 'Welche Regex-Flags gibt es?'],
  ['Capture Groups und Backreferences',        'Wie funktionieren Capture Groups und Backreferences?'],
  ['ES2024/2025-Features',                     'Welche ES2024/2025-Features werden unterstützt?'],
  ['SMS: GSM-7 vs. Unicode',                   'Was ist der Unterschied zwischen GSM-7 und Unicode?'],
  ['Plattform-Limits auf einen Blick',         'Welche Plattform-Limits gibt es?'],
  ['Browser-Kompatibilität und Hardware',      'Welche Browser-Kompatibilität und Hardware wird benötigt?'],

  // ── DE: Finance-specific ─────────────────────────────────────────────────
  ['Brutto oder Netto — die häufigste Frage',  'Brutto oder Netto — die häufigste Frage?'],
  ['Effektiver Jahreszins — der versteckte Hochzins', 'Was ist der effektive Jahreszins?'],
  ['Anschlussfinanzierung verstehen',          'Was ist Anschlussfinanzierung?'],
  ['Steuerklasse und persönlicher Freibetrag', 'Welche Steuerklassen und Freibeträge gibt es?'],
  ['Versorgungsfreibetrag und Härteausgleich', 'Was sind Versorgungsfreibetrag und Härteausgleich?'],
  ['Familienheim und Mietwohnimmobilien',      'Wie werden Familienheim und Mietwohnimmobilien behandelt?'],
  ['ROI-Benchmarks nach Investitionstyp (DE-Kontext)', 'Welche ROI-Benchmarks gibt es nach Investitionstyp?'],

  // ── DE: PDF-specific ─────────────────────────────────────────────────────
  ['Lossless JPEG-Einbettung — der technische Unterschied', 'Was ist Lossless JPEG-Einbettung?'],

  // ── EN: Formula headings ─────────────────────────────────────────────────
  ['Formula / How It Works',                   'How Does It Work?'],
  ['Formula or How It Works',                  'How Does It Work?'],
  ['Formula: How Lease Payments Are Calculated', 'How Are Lease Payments Calculated?'],
  ['Formula: How Monthly Payments Are Calculated', 'How Are Monthly Payments Calculated?'],
  ['Formula: Liters to US Gallons',            'How Do You Convert Liters to US Gallons?'],
  ['Formula: Meters to Feet',                  'How Do You Convert Meters to Feet?'],
  ['Formula: Milliliters to US Fluid Ounces',  'How Do You Convert Milliliters to US Fluid Ounces?'],
  ['Formula: Millimeters to Inches',           'How Do You Convert Millimeters to Inches?'],
  ['Formulas',                                 'What Are the Formulas?'],

  // ── EN: Use cases ─────────────────────────────────────────────────────────
  ['Common Use Cases',                         'What Are Common Use Cases?'],
  ['Common Use Cases (US-Centric)',             'What Are Common Use Cases?'],

  // ── EN: Reference tables ─────────────────────────────────────────────────
  ['Reference Table — Acres to Hectares',      'How Do You Convert Acres to Hectares?'],
  ['Reference Table — Feet to Meters',         'How Do You Convert Feet to Meters?'],
  ['Reference Table — Grams to Ounces',        'How Do You Convert Grams to Ounces?'],
  ['Reference Table — Hectares to Acres',      'How Do You Convert Hectares to Acres?'],
  ['Reference Table — Meters to Feet',         'How Do You Convert Meters to Feet?'],
  ['Reference Table — Ounces to Grams',        'How Do You Convert Ounces to Grams?'],
  ['Meters to Feet Conversion Table',          'How Do You Convert Meters to Feet?'],
  ['Conversion Reference Table',               'What Are the Conversion Reference Values?'],
  ['Quick Reference Table',                    'What Are the Quick Reference Values?'],
  ['Common Centimeter-to-Inch Reference Values', 'What Are Common Centimeter-to-Inch Values?'],
  ['Common Encodings Reference',               'What Are Common Encodings?'],
  ['Common Inch-to-Centimeter Reference Values', 'What Are Common Inch-to-Centimeter Values?'],
  ['Common Screen Size Reference',             'What Are Common Screen Sizes?'],
  ['Common Sizes Reference Table',             'What Are Common Reference Sizes?'],
  ['Common US Wage Benchmarks (2025)',          'What Are Common US Wage Benchmarks?'],
  ['Common US Web Design Use Cases',           'What Are Common US Web Design Use Cases?'],
  ['Common Volume Reference Table',            'What Are Common Volume Reference Values?'],
  ['Common XML Formats by Industry',           'What Are Common XML Formats by Industry?'],
  ['Common Yard-to-Meter Reference Values',    'What Are Common Yard-to-Meter Values?'],
  ['Character Set Reference',                  'What Characters Are Supported?'],
  ['Color Format Reference',                   'What Color Formats Are Supported?'],
  ['Format Reference',                         'What Formats Are Supported?'],
  ['Fractional Inch Reference',                'What Are Common Fractional Inch Values?'],
  ['Platform Character Limits Reference',      'What Are the Platform Character Limits?'],
  ['Tire Width Reference',                     'What Are Common Tire Width Values?'],
  ['US Cooking Temperature Reference',         'What Are US Cooking Temperature Values?'],
  ['US State Sales Tax Quick Reference',       'What Are US State Sales Tax Rates?'],
  ['US Time Zone Quick Reference',             'What Are the US Time Zones?'],
  ['2024 Federal Tax Brackets Reference',      'What Are the 2024 Federal Tax Brackets?'],
  ['2024 State Estate Tax Reference',          'What Are the 2024 State Estate Tax Rates?'],
  ['2024 State Inheritance Tax Rates by Beneficiary', 'What Are the 2024 State Inheritance Tax Rates?'],

  // ── EN: Comparison ────────────────────────────────────────────────────────
  ['Blur Type Comparison',                     'How Do the Blur Types Compare?'],
  ['Compounding Frequency Comparison',         'How Does Compounding Frequency Affect Results?'],
  ['Format Comparison',                        'How Do the Formats Compare?'],
  ['Minify Comparison',                        'How Does Minify Compare to Beautify?'],
  ['Simple vs Compound Interest Comparison',   'How Does Simple Interest Compare to Compound Interest?'],
  ['UUID Versions Comparison',                 'How Do UUID Versions Compare?'],
  ['Operating vs. Investing vs. Financing',    'What Is the Difference Between Operating, Investing, and Financing?'],
  ['US Gallon vs. Imperial Gallon: When It Matters', 'When Does the US vs. Imperial Gallon Difference Matter?'],
  ['US Sales Tax vs. International VAT: Key Differences', 'What Are the Differences Between US Sales Tax and VAT?'],
  ['US vs. Imperial: When the Difference Matters', 'When Does the US vs. Imperial Units Difference Matter?'],
  ['US vs. International Context',             'How Does the US Context Differ Internationally?'],
  ['JSON vs. JSON5 vs. JSONC',                 'What Are the Differences Between JSON, JSON5, and JSONC?'],

  // ── EN: Output/Format ─────────────────────────────────────────────────────
  ['Beautify Output Format',                   'What Does the Beautify Output Look Like?'],
  ['Encoding Modes Explained',                 'How Do Encoding Modes Work?'],
  ['Flag Reference',                           'What Regex Flags Are Available?'],
  ['Output Format Options',                    'What Output Format Options Are Available?'],
  ['Output Formats',                           'What Output Formats Are Available?'],
  ['Output Modes Explained',                   'How Do Output Modes Work?'],
  ['Output Options',                           'What Output Options Are Available?'],

  // ── EN: Explanations ─────────────────────────────────────────────────────
  ['Language Detection',                       'How Does Language Detection Work?'],
  ['DPI and Resolution Guide',                 'How Does DPI Affect Image Quality?'],
  ['Sensitivity Threshold Guide',              'How Does the Sensitivity Threshold Work?'],
  ['Password Entropy Explained',               'What Is Password Entropy?'],
  ['Password Security Best Practices',         'What Are Password Security Best Practices?'],
  ['Key Lease Terms Explained',                'What Are Key Lease Terms?'],
  ['Money Factor to APR Conversion',           'How Do You Convert Money Factor to APR?'],
  ['Cash Flow Health Indicators',              'What Are Cash Flow Health Indicators?'],
  ['Drill Bit Size Conversion',                'How Do You Convert Drill Bit Sizes?'],

  // ── EN: US-specific ───────────────────────────────────────────────────────
  ['States with No Income Tax (2024)',         'Which States Have No Income Tax?'],
  ['Common US Web Design Use Cases',           'What Are Common US Web Design Use Cases?'],

  // ── EN: How-to ────────────────────────────────────────────────────────────
  ['Setting Up with OBS (Recommended)',        'How Do You Set Up with OBS?'],
  ['Reading the Schedule',                     'How Do You Read the Amortization Schedule?'],
  ['Tips for Getting a Better Rate',           'How Do You Get a Better Rate?'],
  ['Tips for Working with Placeholder Text',   'How Do You Work with Placeholder Text?'],
  ['The Classic Opening',                      'What Is the Classic Opening?'],

  // ── EN: Misc ──────────────────────────────────────────────────────────────
  ['SMS: GSM-7 vs. Unicode',                   'What Is the Difference Between GSM-7 and Unicode?'],
]);

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkDir(full, files);
    } else if (['.md', '.mdx'].includes(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walkDir(TOOLS_DIR);
let modified = 0;
let unchanged = 0;
let unmapped = new Set();

for (const filePath of allFiles) {
  let content = readFileSync(filePath, 'utf8');
  let changed = false;

  // Strip frontmatter to avoid matching YAML values
  const fmMatch = content.match(/^---[\s\S]*?---\n/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  let body = fmMatch ? content.slice(frontmatter.length) : content;

  body = body.replace(/^## (.+)$/gm, (_match, heading) => {
    const replacement = REPLACEMENTS.get(heading.trim());
    if (replacement) {
      changed = true;
      return `## ${replacement}`;
    }
    // Track unmapped violations for review
    const needsFix = !heading.endsWith('?') &&
      !['Was', 'Wie', 'Warum', 'Wann', 'Wo', 'Welche', 'Welcher', 'Welches',
        'Wer', 'Wessen', 'Wem', 'Wen',
        'How', 'What', 'Why', 'When', 'Where', 'Which', 'Who', 'Whose']
        .includes(heading.split(/\s+/)[0]) &&
      !['Datenschutz', 'Impressum', 'Über kittokit', 'About kittokit',
        'Frequently Asked Questions', 'Häufige Fragen']
        .some((s) => heading.includes(s));
    if (needsFix) unmapped.add(heading);
    return _match;
  });

  if (changed) {
    writeFileSync(filePath, frontmatter + body, 'utf8');
    modified++;
  } else {
    unchanged++;
  }
}

console.log(`\nMigration done: ${modified} files changed, ${unchanged} unchanged`);
if (unmapped.size > 0) {
  console.warn(`\n⚠  ${unmapped.size} heading(s) still need manual mapping:`);
  for (const h of [...unmapped].sort()) {
    console.warn(`   "${h}"`);
  }
} else {
  console.log('✓ All violations mapped.');
}
