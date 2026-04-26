#!/usr/bin/env node
/**
 * T12 — Per-tool OG card generator (1200×630 WebP).
 *
 * Reads every src/content/tools/<de-slug>/de.md, extracts the display name
 * and category from frontmatter, generates a branded SVG card, and converts
 * it to WebP via sharp.
 *
 * Output: public/og/tools/<de-slug>.webp
 *
 * Usage:
 *   node scripts/generate-og-cards.mjs
 *
 * The Astro route [slug].astro picks up /og/tools/<slug>.webp and falls back
 * to /og-image.png when the file is absent.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');

// ─── Brand tokens (dark OG theme) ────────────────────────────────────────────
const BG      = '#1A1917';
const TEXT    = '#FAFAF9';
const ACCENT  = '#F0A066';
const MUTED   = '#9C998F';
const SUBTLE  = '#3A3835'; // slightly lighter than BG for borders/dividers

// ─── Category labels (shown as uppercase eyebrow) ────────────────────────────
const CAT_LABEL = {
  length:      'Länge',
  weight:      'Gewicht',
  area:        'Fläche',
  volume:      'Volumen',
  distance:    'Entfernung',
  temperature: 'Temperatur',
  image:       'Bild',
  video:       'Video',
  audio:       'Audio',
  document:    'Dokument',
  text:        'Text',
  dev:         'Developer',
  color:       'Farbe',
  time:        'Zeit',
  finance:     'Finanzen',
  construction:'Konstruktion',
  math:        'Mathematik',
  health:      'Gesundheit',
  science:     'Wissenschaft',
  engineering: 'Technik',
  sport:       'Sport',
  automotive:  'Fahrzeug',
  education:   'Bildung',
  agriculture: 'Landwirtschaft',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** XML-escape for SVG text content */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip HTML tags (for headingHtml → plain text) */
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '');
}

/**
 * Parse YAML frontmatter from Markdown.
 * Handles double-quoted string values and bare values.
 */
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const result = {};
  for (const line of m[1].split('\n')) {
    // key: "quoted value"
    let r = line.match(/^(\w+):\s*"((?:[^"\\]|\\.)*)"$/);
    if (r) { result[r[1]] = r[2]; continue; }
    // key: bare value (single-line, no leading -)
    r = line.match(/^(\w+):\s+([^[\{].*?)$/);
    if (r) result[r[1]] = r[2].trim();
  }
  return result;
}

/** Derive a short display name for the OG card */
function displayName(fm) {
  if (fm.headingHtml) return stripHtml(fm.headingHtml).trim();
  const title = fm.title || '';
  // Strip SEO suffix after ` – ` or ` | `
  return title.split(' – ')[0].split(' | ')[0].trim();
}

/**
 * Split `text` into lines not exceeding `maxChars` each.
 * Tries to break at word boundaries.
 */
function wordWrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (candidate.length <= maxChars) {
      cur = candidate;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Build the SVG string for one tool card */
function buildSvg({ name, category, slug, interB64, monoB64 }) {
  const catLabel = (CAT_LABEL[category] || category).toUpperCase();
  const url = `kittokit.com/de/${slug}`;

  // ── Font-size & wrapping ──────────────────────────────────────────────────
  let fontSize;
  let lines;
  if (name.length <= 20) {
    fontSize = 72;
    lines = [name];
  } else if (name.length <= 30) {
    fontSize = 60;
    lines = wordWrap(name, 26);
    if (lines.length === 1) fontSize = 68;
  } else {
    fontSize = 52;
    lines = wordWrap(name, 32);
  }
  const lineH = Math.round(fontSize * 1.22);

  // ── Vertical layout (content area: y 130 → 545) ──────────────────────────
  const contentMid = 337;
  const textBlockH = lines.length * lineH;
  const eyebrowOffset = -60;
  const textStartY = Math.round(contentMid - textBlockH / 2 + fontSize * 0.78);
  const eyebrowY = textStartY + eyebrowOffset;

  // ── SVG text elements ─────────────────────────────────────────────────────
  const nameElements = lines
    .map(
      (line, i) =>
        `  <text x="80" y="${textStartY + i * lineH}" ` +
        `fill="${TEXT}" font-family="Inter, Arial, sans-serif" ` +
        `font-size="${fontSize}" font-weight="600" letter-spacing="-1.2">${esc(line)}</text>`,
    )
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <style>
      @font-face {
        font-family: 'Inter';
        src: url('data:font/woff2;base64,${interB64}') format('woff2');
        font-weight: 100 900;
      }
      @font-face {
        font-family: 'JetBrains Mono';
        src: url('data:font/woff2;base64,${monoB64}') format('woff2');
        font-weight: 100 800;
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="${BG}"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="4" height="630" fill="${ACCENT}" opacity="0.6"/>

  <!-- Logo mark: white badge + inverted icon -->
  <rect x="80" y="60" width="52" height="52" rx="9" fill="${TEXT}"/>
  <!-- icon.svg content scaled 52/512 = 0.101563 into the badge -->
  <g transform="translate(80,60) scale(0.101563)">
    <polyline points="171,149 85,256 171,363"
      stroke="${BG}" stroke-width="36" fill="none"
      stroke-linejoin="round" stroke-linecap="round"/>
    <line x1="256" y1="149" x2="256" y2="363"
      stroke="#8F3A0C" stroke-width="64" stroke-linecap="round"/>
    <polyline points="427,149 341,256 427,363"
      stroke="${BG}" stroke-width="36" fill="none"
      stroke-linejoin="round" stroke-linecap="round"/>
  </g>

  <!-- Wordmark -->
  <text x="146" y="97" fill="${TEXT}"
    font-family="Inter, Arial, sans-serif"
    font-size="26" font-weight="600" letter-spacing="-0.4">kitt<tspan fill="${ACCENT}">o</tspan>kit</text>

  <!-- Category eyebrow -->
  <text x="80" y="${eyebrowY}"
    fill="${MUTED}"
    font-family="JetBrains Mono, Courier New, monospace"
    font-size="19" letter-spacing="2.5">${esc(catLabel)}</text>

  <!-- Tool name -->
${nameElements}

  <!-- Divider -->
  <line x1="80" y1="550" x2="1120" y2="550" stroke="${SUBTLE}" stroke-width="1"/>

  <!-- Footer URL -->
  <text x="80" y="587"
    fill="${MUTED}"
    font-family="JetBrains Mono, Courier New, monospace"
    font-size="18">${esc(url)}</text>
</svg>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const toolsDir = join(ROOT, 'src/content/tools');
const outDir   = join(ROOT, 'public/og/tools');

// Load fonts once
console.log('Loading fonts…');
const interB64 = (await readFile(join(ROOT, 'public/fonts/Inter-Variable.woff2'))).toString('base64');
const monoB64  = (await readFile(join(ROOT, 'public/fonts/JetBrainsMono-Variable.woff2'))).toString('base64');

await mkdir(outDir, { recursive: true });

const slugDirs = await readdir(toolsDir);
let generated = 0;
let skipped = 0;
const results = [];

for (const slug of slugDirs.sort()) {
  const deMdPath = join(toolsDir, slug, 'de.md');
  if (!existsSync(deMdPath)) {
    skipped++;
    continue;
  }

  const md = await readFile(deMdPath, 'utf8');
  const fm = parseFrontmatter(md);
  const name = displayName(fm);
  const category = fm.category || 'dev';

  if (!name) {
    console.warn(`  SKIP ${slug} — could not derive display name`);
    skipped++;
    continue;
  }

  const svg = buildSvg({ name, category, slug, interB64, monoB64 });
  const buf = Buffer.from(svg);

  await sharp(buf).webp({ quality: 90 }).toFile(join(outDir, `${slug}.webp`));
  await sharp(buf).avif({ quality: 80 }).toFile(join(outDir, `${slug}.avif`));

  results.push({ slug, name, category });
  generated++;
  process.stdout.write(`  ✓ ${slug}\n`);
}

console.log(`\nDone: ${generated} cards generated, ${skipped} skipped → ${outDir}`);
if (results.length) {
  console.log('\nTool inventory:');
  for (const r of results) {
    console.log(`  ${r.slug.padEnd(40)} ${r.category.padEnd(14)} "${r.name}"`);
  }
}
