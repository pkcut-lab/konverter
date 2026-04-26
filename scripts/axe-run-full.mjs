/**
 * axe-run-full.mjs — Full WCAG 2.2 AAA scan for kittokit
 * Usage: node /tmp/axe-run-full.mjs
 * Requires: dist/ served on port 4173
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:4173';

// Key pages + all DE tool slugs
const PAGES = [
  '/',
  '/de',
  '/de/werkzeuge',
  '/de/datenschutz',
  '/de/impressum',
  '/de/meter-zu-fuss',
  '/de/passwort-generator',
  '/de/zinsrechner',
  '/de/webp-konverter',
  '/de/kilogramm-zu-pfund',
  '/de/zentimeter-zu-zoll',
  '/de/zoll-zu-zentimeter',
  '/de/mehrwertsteuer-rechner',
  '/de/rabatt-rechner',
  '/de/kreditrechner',
  '/de/brutto-netto-rechner',
  '/de/zinseszins-rechner',
  '/de/roi-rechner',
  '/de/stundenlohn-jahresgehalt',
  '/de/skonto-rechner',
  '/de/leasing-faktor-rechner',
  '/de/tilgungsplan-rechner',
  '/de/erbschaftsteuer-rechner',
  '/de/cashflow-rechner',
  '/de/kgv-rechner',
  '/de/hash-generator',
  '/de/base64-encoder',
  '/de/url-encoder-decoder',
  '/de/uuid-generator',
  '/de/passwort-generator',
  '/de/json-formatter',
  '/de/json-diff',
  '/de/json-zu-csv',
  '/de/xml-formatter',
  '/de/css-formatter',
  '/de/sql-formatter',
  '/de/regex-tester',
  '/de/jwt-decoder',
  '/de/hex-rgb-konverter',
  '/de/roemische-zahlen',
  '/de/unix-timestamp',
  '/de/zeitzonen-rechner',
  '/de/lorem-ipsum-generator',
  '/de/zeichenzaehler',
  '/de/text-diff',
  '/de/kontrast-pruefer',
  '/de/qr-code-generator',
  '/de/pdf-komprimieren',
  '/de/pdf-aufteilen',
  '/de/pdf-zusammenfuehren',
  '/de/pdf-zu-jpg',
  '/de/jpg-zu-pdf',
  '/de/pdf-passwort',
  '/de/webp-konverter',
  '/de/bild-diff',
  '/de/sprache-verbessern',
  '/de/video-hintergrund-entfernen',
  '/de/webcam-hintergrund-unschaerfe',
  '/de/hintergrund-entfernen',
  '/de/fuss-zu-meter',
  '/de/gramm-zu-unzen',
  '/de/hektar-zu-acre',
  '/de/kilometer-zu-meilen',
  '/de/millimeter-zu-zoll',
  '/de/pfund-zu-kilogramm',
  '/de/quadratmeter-zu-quadratfuss',
  '/de/seemeile-zu-kilometer',
  '/de/stone-zu-kilogramm',
  '/de/tonne-zu-pfund',
  '/de/yard-zu-meter',
  '/de/quadratkilometer-zu-quadratmeile',
  '/de/celsius-zu-fahrenheit',
  '/de/liter-zu-gallonen',
  '/de/milliliter-zu-unzen',
];

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const results = [];
let totalViolations = 0;

for (const url of PAGES) {
  const fullUrl = BASE + url;
  process.stderr.write(`Scanning ${url} ... `);
  try {
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    const v = r.violations;
    totalViolations += v.length;
    process.stderr.write(`${v.length} violation(s)\n`);
    results.push({
      url,
      violations: v.map(vio => ({
        id: vio.id,
        impact: vio.impact,
        description: vio.description,
        help: vio.help,
        helpUrl: vio.helpUrl,
        nodes: vio.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      })),
    });
  } catch (err) {
    process.stderr.write(`ERROR: ${err.message}\n`);
    results.push({ url, error: err.message, violations: [] });
  }
}

await browser.close();

const output = { scannedAt: new Date().toISOString(), totalPages: PAGES.length, totalViolations, results };
writeFileSync('/tmp/axe-results-full.json', JSON.stringify(output, null, 2));
process.stderr.write(`\nDone. Total violations: ${totalViolations} across ${PAGES.length} pages.\n`);
process.stdout.write(JSON.stringify({ totalViolations, totalPages: PAGES.length }, null, 2) + '\n');
