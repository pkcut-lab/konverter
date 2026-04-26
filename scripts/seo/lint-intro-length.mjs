#!/usr/bin/env node
// Warns when intro frontmatter exceeds 70 words (target: 40-60 words).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../../', import.meta.url);
const CONTENT_DIR = new URL('src/content/tools/', ROOT);
const WARN_THRESHOLD = 70;

function getAllMdFiles(dir) {
  const files = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) getAllMdFiles(p).forEach(f => files.push(f));
    else if (e.name.endsWith('.md')) files.push(p);
  }
  return files;
}

function extractIntro(content) {
  // Extract intro: value from frontmatter (handles multi-line quoted strings)
  const introMatch = content.match(/^intro:\s*["']?([\s\S]*?)["']?\n(?=[a-z]|\-\-\-)/m);
  if (!introMatch) return null;
  // Simple single-line extraction
  const simpleMatch = content.match(/^intro:\s*["'](.+?)["']\s*$/m);
  if (simpleMatch) return simpleMatch[1];
  const unquotedMatch = content.match(/^intro:\s*([^"'\n].+)\s*$/m);
  if (unquotedMatch) return unquotedMatch[1];
  return null;
}

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

const files = getAllMdFiles(fileURLToPath(CONTENT_DIR));
const warnings = [];

for (const f of files) {
  const content = readFileSync(f, 'utf-8');
  const intro = extractIntro(content);
  if (!intro) continue;
  const count = countWords(intro);
  if (count > WARN_THRESHOLD) {
    warnings.push({ file: f.replace(fileURLToPath(ROOT), ''), words: count });
  }
}

if (warnings.length > 0) {
  console.warn(`\n⚠ lint-intro-length: ${warnings.length} intro(s) exceed ${WARN_THRESHOLD} words:`);
  for (const w of warnings) {
    console.warn(`  ${w.words} words: ${w.file}`);
  }
  console.warn(`\nTarget: 40-60 words per intro. Max allowed: ${WARN_THRESHOLD} words.\n`);
  process.exit(0);
} else {
  console.log(`✓ lint-intro-length: all ${files.length} intros within ${WARN_THRESHOLD}-word limit`);
}
