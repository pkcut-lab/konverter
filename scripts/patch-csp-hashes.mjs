#!/usr/bin/env node
/**
 * Post-build: extracts SHA-256 hashes from all inline <script> tags in
 * dist/ and replaces the __CSP_SCRIPT_HASHES__ placeholder in public/_headers.
 * Run after `astro build` so hashes always match the actual output.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');
const HEADERS = join(__dirname, '../public/_headers');
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

const hashes = new Set();
const inlineScriptRe = /<script>([\s\S]*?)<\/script>/g;

for (const file of walkHtml(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const [, content] of html.matchAll(inlineScriptRe)) {
    hashes.add(`'sha256-${sha256(content)}'`);
  }
}

const hashList = [...hashes].join(' ');
const headers = readFileSync(HEADERS, 'utf8');

if (!headers.includes(PLACEHOLDER)) {
  console.log('[patch-csp] Placeholder not found — hashes may already be set.');
  process.exit(0);
}

const updated = headers.replace(PLACEHOLDER, hashList);
writeFileSync(HEADERS, updated, 'utf8');
console.log(`[patch-csp] Replaced ${PLACEHOLDER} with ${hashes.size} hashes.`);
