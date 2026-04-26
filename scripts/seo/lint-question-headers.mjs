#!/usr/bin/env node
/**
 * scripts/seo/lint-question-headers.mjs
 *
 * Checks that every H2 in src/content/tools/**\/*.md either:
 *   (a) ends with "?", OR
 *   (b) starts with a known question word
 *
 * Exits with code 1 if any violations are found (CI-safe).
 * Runs without any npm deps.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../../');
const TOOLS_DIR = join(ROOT, 'src/content/tools');

const QUESTION_WORDS = [
  'Was', 'Wie', 'Warum', 'Wann', 'Wo', 'Welche', 'Welcher', 'Welches',
  'Wer', 'Wessen', 'Wem', 'Wen',
  'How', 'What', 'Why', 'When', 'Where', 'Which', 'Who', 'Whose',
];

// H2 texts that are explicitly allowed to be non-question form.
// Match is substring-based (heading text includes any of these).
const IGNORE_SUBSTRINGS = [
  'Datenschutz',
  'Impressum',
  'Über kittokit',
  'About kittokit',
  'Frequently Asked Questions',
  'Häufige Fragen',
];

function isAllowed(heading) {
  if (heading.endsWith('?')) return true;
  const firstWord = heading.split(/\s+/)[0];
  if (QUESTION_WORDS.includes(firstWord)) return true;
  if (IGNORE_SUBSTRINGS.some((s) => heading.includes(s))) return true;
  return false;
}

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
const violations = [];

for (const filePath of allFiles) {
  const content = readFileSync(filePath, 'utf8');

  // Strip YAML frontmatter before scanning
  const withoutFrontmatter = content.startsWith('---')
    ? content.replace(/^---[\s\S]*?---\n/, '')
    : content;

  const lines = withoutFrontmatter.split('\n');
  lines.forEach((line, idx) => {
    if (!line.startsWith('## ')) return;
    const heading = line.slice(3).trim();
    if (!isAllowed(heading)) {
      violations.push({
        file: filePath.replace(ROOT, '').replace(/\\/g, '/'),
        line: idx + 1,
        heading,
      });
    }
  });
}

if (violations.length === 0) {
  console.log('✓ All H2 headers are in question form or explicitly allowed.');
  process.exit(0);
}

console.error(`✗ ${violations.length} H2 header(s) need question form:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  →  "${v.heading}"`);
}
process.exit(1);
