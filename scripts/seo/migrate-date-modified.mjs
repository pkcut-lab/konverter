#!/usr/bin/env node
// Usage: node scripts/seo/migrate-date-modified.mjs
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../../', import.meta.url);
const CONTENT_DIR = new URL('src/content/tools/', ROOT);

function getDateFromGit(filePath, mode) {
  // mode: 'first' = oldest commit, 'last' = newest commit
  const format = mode === 'first'
    ? `git log --follow --format=%aI --diff-filter=A -- "${filePath}" | tail -1`
    : `git log --follow --format=%aI -- "${filePath}" | head -1`;
  try {
    const out = execSync(format, { cwd: fileURLToPath(ROOT), encoding: 'utf-8' }).trim();
    if (!out) return null;
    return out.substring(0, 10); // ISO date YYYY-MM-DD
  } catch {
    return null;
  }
}

function processDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fullPath = join(dir, e.name);
    if (e.isDirectory()) {
      processDir(fullPath);
    } else if (e.name.endsWith('.md')) {
      processMdFile(fullPath);
    }
  }
}

function processMdFile(filePath) {
  const rel = relative(fileURLToPath(ROOT), filePath);
  let content = readFileSync(filePath, 'utf-8');

  // Already has both dates? skip
  if (content.includes('dateModified:') && content.includes('datePublished:')) {
    console.log(`  skip (already dated): ${rel}`);
    return;
  }

  const datePublished = getDateFromGit(rel, 'first') ?? '2026-04-18';
  const dateModified = getDateFromGit(rel, 'last') ?? '2026-04-26';

  // Insert after the first `---` frontmatter block opener
  // Find the closing --- and insert before it
  const fmEnd = content.indexOf('\n---', 4);
  if (fmEnd === -1) {
    console.warn(`  WARN: no frontmatter found in ${rel}`);
    return;
  }

  // Remove existing datePublished/dateModified lines if present
  let fm = content.substring(0, fmEnd);
  const rest = content.substring(fmEnd);

  fm = fm.replace(/^datePublished:.*$/m, '').replace(/^dateModified:.*$/m, '');

  const dateLinesBlock = `datePublished: '${datePublished}'\ndateModified: '${dateModified}'`;

  // Insert just before closing --- (at end of fm)
  const newContent = fm.trimEnd() + '\n' + dateLinesBlock + '\n' + rest;
  writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  ✓ ${rel}  published=${datePublished}  modified=${dateModified}`);
}

console.log('Migrating datePublished + dateModified for all tool content files...');
processDir(fileURLToPath(CONTENT_DIR));
console.log('Done.');
