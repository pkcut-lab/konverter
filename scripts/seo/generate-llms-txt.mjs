#!/usr/bin/env node
/**
 * scripts/seo/generate-llms-txt.mjs
 *
 * Generates public/llms.txt and public/llms-full.txt from:
 *   - src/lib/slug-map.ts  (tool IDs + per-language slugs)
 *   - src/content/tools/<slug>/de.md  (titles, taglines, metaDescription)
 *
 * Hooked as a pre-build step in package.json ("prebuild": "node scripts/seo/generate-llms-txt.mjs").
 *
 * Why not import slug-map.ts directly?
 * This script runs in plain Node.js (no tsx/ts-node). We parse the TS source
 * with a light regex that matches the well-structured slug-map.ts format.
 * Gray-matter handles frontmatter parsing of the .md content files.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE = 'https://kittokit.com';

// ── Parse slug-map.ts ────────────────────────────────────────────────────────
const slugMapSource = readFileSync(join(ROOT, 'src/lib/slug-map.ts'), 'utf8');

// Matches: 'tool-id': { de: 'de-slug', en: 'en-slug' },
// or partial: 'tool-id': { de: 'de-slug' },
const ENTRY_RE = /'([^']+)':\s*\{([^}]+)\}/g;
const LANG_SLOT_RE = /(\w+):\s*'([^']+)'/g;

/** @type {Map<string, {de?: string, en?: string}>} */
const slugMap = new Map();

for (const match of slugMapSource.matchAll(ENTRY_RE)) {
  const toolId = match[1];
  const slots = match[2];
  const langs = {};
  for (const slotMatch of slots.matchAll(LANG_SLOT_RE)) {
    langs[slotMatch[1]] = slotMatch[2];
  }
  if (toolId && (langs.de || langs.en)) {
    slugMap.set(toolId, langs);
  }
}

// ── Read content files ───────────────────────────────────────────────────────
const CONTENT_BASE = join(ROOT, 'src/content/tools');

/**
 * @param {string} deSlug
 * @returns {{ title: string, tagline: string, metaDescription: string } | null}
 */
function readDeMeta(deSlug) {
  const mdPath = join(CONTENT_BASE, deSlug, 'de.md');
  if (!existsSync(mdPath)) return null;
  try {
    const { data } = matter(readFileSync(mdPath, 'utf8'));
    return {
      title: data.title ?? deSlug,
      tagline: data.tagline ?? '',
      metaDescription: data.metaDescription ?? data.tagline ?? '',
    };
  } catch {
    return null;
  }
}

// ── Build tool inventory ─────────────────────────────────────────────────────
/** @type {Array<{toolId:string, deSlug:string, enSlug:string|undefined, title:string, tagline:string, desc:string}>} */
const tools = [];

for (const [toolId, langs] of slugMap.entries()) {
  if (!langs.de) continue;
  const meta = readDeMeta(langs.de);
  if (!meta) continue;
  tools.push({
    toolId,
    deSlug: langs.de,
    enSlug: langs.en,
    title: meta.title,
    tagline: meta.tagline,
    desc: meta.metaDescription,
  });
}

// Sort alphabetically by DE slug for stable diffs
tools.sort((a, b) => a.deSlug.localeCompare(b.deSlug));

// Group by category implied by title patterns (simplistic; good enough for LLMs context)
const CATEGORY_SLUGS = {
  length: ['fuss', 'meter', 'zentimeter', 'zoll', 'kilometer', 'meilen', 'millimeter', 'seemeile', 'yard'],
  weight: ['kilogramm', 'pfund', 'gramm', 'unzen', 'stone', 'tonne'],
  area: ['quadrat', 'hektar'],
  volume: ['liter', 'milliliter'],
  temperature: ['celsius', 'fahrenheit'],
  image: ['webp', 'hintergrund', 'bild', 'qr', 'webcam'],
  video: ['hevc', 'video'],
  text: ['zeichen', 'roemisch', 'lorem', 'diff', 'sprache', 'audio', 'bild-zu', 'ki-text', 'ki-bild'],
  dev: ['passwort', 'uuid', 'json', 'regex', 'base64', 'url', 'hash', 'sql', 'xml', 'css', 'jwt'],
  color: ['hex', 'kontrast'],
  time: ['unix', 'zeitzonen'],
  finance: ['steuer', 'rechner', 'rechner', 'cashflow', 'kgv', 'leasing', 'roi', 'skonto', 'zins', 'tilgung', 'kredit', 'brutto', 'rabatt', 'stundenlohn'],
  document: ['pdf', 'jpg-zu-pdf'],
};

function guessCategory(deSlug) {
  for (const [cat, keywords] of Object.entries(CATEGORY_SLUGS)) {
    if (keywords.some((kw) => deSlug.includes(kw))) return cat;
  }
  return 'other';
}

// ── Generate llms.txt (brief) ────────────────────────────────────────────────
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const llmsTxt = `# kittokit

> kittokit is a multilingual platform of fast browser-based tools — converters, calculators, file utilities. Every tool runs fully on the user's device: no upload, no sign-in, no tracking, no ads in Phase 1.

## About

- Domain: ${SITE}
- Languages: German (live). English (Phase 3, live).
- Tech stack: Astro 5 SSG + Svelte 5 + Tailwind. Pure-client compute (WebCodecs, transformers.js worker fallback for ML tools).
- Privacy posture: zero server-side processing for user input. No analytics without explicit consent. No third-party fonts or scripts on critical path.
- License of content: tool descriptions and how-to articles are CC-BY 4.0 unless otherwise marked. Cite the canonical URL.
- Generated: ${BUILD_DATE}

## Tool categories

${[...new Set(tools.map((t) => guessCategory(t.deSlug)))].sort().map((cat) => {
  const count = tools.filter((t) => guessCategory(t.deSlug) === cat).length;
  return `- ${cat} (${count} tools)`;
}).join('\n')}

## Sitemap

- [Sitemap Index](${SITE}/sitemap-index.xml)
- [Tool Index (German)](${SITE}/de/werkzeuge)
- [Tool Index (English)](${SITE}/en/tools)
- [LLMs Full](${SITE}/llms-full.txt): expanded inventory with per-tool URLs and one-line descriptions.
`;

// ── Generate llms-full.txt (detailed) ───────────────────────────────────────
const grouped = {};
for (const tool of tools) {
  const cat = guessCategory(tool.deSlug);
  if (!grouped[cat]) grouped[cat] = [];
  grouped[cat].push(tool);
}

let llmsFullTxt = `# kittokit — full inventory

> Multilingual platform of fast, browser-based tools. Every tool runs fully on the user's device — no upload, no sign-in, no tracking. German and English are live; more languages in Phase 3+.

## Site

- Home (German): ${SITE}/de
- Home (English): ${SITE}/en
- Sitemap index: ${SITE}/sitemap-index.xml
- Brand spelling: kittokit (lowercase, one word).
- Generated: ${BUILD_DATE}

## Privacy & licensing

- All compute happens client-side. ML tools load model weights from a public model CDN once and cache them in the browser; the user's data never leaves the device.
- No analytics in Phase 1. Phase 2 introduces consented, privacy-respecting analytics.
- Tool descriptions and how-to articles: CC-BY 4.0 unless otherwise marked. Cite the canonical URL.

`;

for (const [cat, catTools] of Object.entries(grouped).sort()) {
  llmsFullTxt += `## Tools — ${cat}\n\n`;
  for (const tool of catTools) {
    const deUrl = `${SITE}/de/${tool.deSlug}`;
    const enUrl = tool.enSlug ? `${SITE}/en/${tool.enSlug}` : null;
    const langs = enUrl ? `[DE](${deUrl}) · [EN](${enUrl})` : `[DE](${deUrl})`;
    llmsFullTxt += `- **${tool.title}** (${langs}): ${tool.desc || tool.tagline}\n`;
  }
  llmsFullTxt += '\n';
}

// ── Write output ─────────────────────────────────────────────────────────────
writeFileSync(join(ROOT, 'public/llms.txt'), llmsTxt, 'utf8');
writeFileSync(join(ROOT, 'public/llms-full.txt'), llmsFullTxt, 'utf8');

console.log(`✓ llms.txt generated (${tools.length} tools)`);
console.log(`✓ llms-full.txt generated (${tools.length} tools)`);
