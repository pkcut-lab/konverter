#!/usr/bin/env node
/**
 * Post-build: hashes every inline <script> in dist/ HTML and replaces
 * __CSP_SCRIPT_HASHES__ in dist/_headers.
 *
 * Why we patch dist/_headers (not public/_headers):
 *   astro build copies public/_headers → dist/_headers BEFORE this script
 *   runs. public/_headers stays the source-of-truth template (with the
 *   placeholder intact); dist/_headers is the per-build deploy artefact.
 *   Patching public would freeze hashes after the first run — every later
 *   build would bake stale hashes in and the script would no-op because
 *   the placeholder is gone.
 *
 * Why bare <script>:
 *   Astro renders `<script is:inline>` as bare `<script>` (no attrs).
 *   Scripts with attributes are either non-executable (`type="application
 *   /ld+json"`, exempt from script-src) or external (`src="…"`, matched
 *   by the host allow-list — no hash needed).
 *
 * Failure mode:
 *   Missing placeholder → exit 1. Loud failure beats silent CSP staleness.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const HEADERS = join(DIST, '_headers');
const PLACEHOLDER = '__CSP_SCRIPT_HASHES__';

function walkHtml(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walkHtml(full));
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

function sha256(content) {
  return createHash('sha256').update(content, 'utf8').digest('base64');
}

const inlineScriptRe = /<script>([\s\S]*?)<\/script>/g;

const hashes = new Set();
for (const file of walkHtml(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const [, content] of html.matchAll(inlineScriptRe)) {
    hashes.add(`'sha256-${sha256(content)}'`);
  }
}

// Sort for deterministic output — Set insertion order depends on filesystem
// walk order which varies by OS / CI runner. Sorted output keeps git diffs
// minimal across machines (only changes when an actual hash changes).
const hashList = [...hashes].sort().join(' ');

const headers = readFileSync(HEADERS, 'utf8');
const occurrences = headers.split(PLACEHOLDER).length - 1;

if (occurrences === 0) {
  console.error(`[patch-csp] FATAL: '${PLACEHOLDER}' not found in ${HEADERS}.`);
  console.error('[patch-csp] public/_headers must contain the placeholder verbatim in the CSP line.');
  process.exit(1);
}
if (occurrences > 1) {
  console.error(`[patch-csp] FATAL: '${PLACEHOLDER}' appears ${occurrences}× in ${HEADERS}; expected exactly 1 (CSP line only).`);
  console.error('[patch-csp] Remove the extra occurrences from public/_headers (e.g. comment text mentioning the token).');
  process.exit(1);
}

writeFileSync(HEADERS, headers.replace(PLACEHOLDER, hashList), 'utf8');
console.log(`[patch-csp] Wrote ${hashes.size} script hash${hashes.size === 1 ? '' : 'es'} to dist/_headers.`);
