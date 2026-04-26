#!/usr/bin/env node
/**
 * X.9 — Trailing-Slash Consistency Linter
 *
 * Astro is configured with trailingSlash: 'never'. Internal hrefs must NOT
 * end with a slash (except bare language roots like "/de" or "/en" which
 * are handled by the router).
 *
 * Scans src/components/, src/pages/, src/layouts/ for href="..." or
 * href={`...`} patterns ending with "/" and reports violations.
 *
 * Allowed exceptions:
 *   - href="/"               (absolute root)
 *   - href="/de"  href="/en" (bare language roots — no trailing slash either,
 *                             but the pattern /{lang} has no slash so OK)
 *   - External URLs          (https://..., http://...)
 *   - Template-literal paths that end with a variable (cannot statically check)
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const SCAN_DIRS = ['src/components', 'src/pages', 'src/layouts'];
const EXTENSIONS = new Set(['.astro', '.svelte', '.ts', '.tsx']);

// Matches href=".../" or href='.../' (static strings ending with slash)
const STATIC_HREF_RE = /href=["']([^"']+\/)["']/g;
// Matches href={`...`} template literals — we only flag obviously-static endings
const TEMPLATE_HREF_RE = /href=\{`([^`]+\/)`\}/g;

const ALLOWED = new Set(['/', 'https://', 'http://']);

function isAllowed(path) {
  if (path === '/') return true;
  if (path.startsWith('https://') || path.startsWith('http://')) return true;
  if (path.startsWith('mailto:') || path.startsWith('tel:')) return true;
  // template-literal paths with ${} expressions: skip static check
  if (path.includes('${')) return true;
  return false;
}

async function* walkDir(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else if (EXTENSIONS.has(extname(entry.name))) {
      yield full;
    }
  }
}

let violations = 0;

for (const scanDir of SCAN_DIRS) {
  const absDir = join(ROOT, scanDir);
  for await (const filePath of walkDir(absDir)) {
    const src = await readFile(filePath, 'utf8');
    const rel = filePath.replace(ROOT, '').replace(/\\/g, '/');

    for (const re of [STATIC_HREF_RE, TEMPLATE_HREF_RE]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src)) !== null) {
        const href = m[1];
        if (!isAllowed(href)) {
          const line = src.slice(0, m.index).split('\n').length;
          console.error(`TRAILING SLASH: ${rel}:${line}  href="${href}"`);
          violations++;
        }
      }
    }
  }
}

if (violations > 0) {
  console.error(`\n${violations} trailing-slash violation(s) found. Fix or add to allowlist.`);
  process.exit(1);
} else {
  console.log('✓ No trailing-slash violations found.');
}
