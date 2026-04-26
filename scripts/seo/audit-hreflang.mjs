#!/usr/bin/env node
/**
 * scripts/seo/audit-hreflang.mjs
 *
 * Post-build hreflang auditor for Phase 3 (DE + EN).
 * Scans dist/ HTML, verifies every tool page has:
 *   - hreflang="de"  → correct DE slug URL
 *   - hreflang="en"  → correct EN slug URL
 *   - hreflang="x-default"
 * Plus bidirectionality: DE page's EN href == EN page's selfDe href.
 *
 * Usage:
 *   node scripts/seo/audit-hreflang.mjs [--dist=dist] [--site=https://kittokit.com]
 *
 * Exit 0 = all clear, 1 = findings present.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }),
);

const DIST = resolve(ROOT, args.dist ?? 'dist');
const SITE = (args.site ?? 'https://kittokit.com').replace(/\/$/, '');
const ACTIVE_LANGS = ['de', 'en'];

/**
 * Extract hreflang links from an HTML file.
 * @returns {Array<{hreflang:string, href:string}>}
 */
function extractHreflangs(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const nodes = dom.window.document.querySelectorAll('link[rel="alternate"][hreflang]');
  return Array.from(nodes).map((n) => ({
    hreflang: n.getAttribute('hreflang') ?? '',
    href: n.getAttribute('href') ?? '',
  }));
}

/**
 * Recursively find HTML files in a directory.
 */
function findHtmlFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findHtmlFiles(full));
    } else if (entry.name === 'index.html') {
      out.push(full);
    }
  }
  return out;
}

/**
 * Derive the URL path from a dist/ file path.
 * dist/de/meter-zu-fuss/index.html → /de/meter-zu-fuss
 */
function distPathToUrl(filePath) {
  return '/' + filePath
    .slice(DIST.length + 1)
    .replace(/[\\/]index\.html$/, '')
    .replace(/\\/g, '/');
}

function run() {
  const findings = [];
  let checked = 0;

  // Map: URL → hreflang links (for bidirectionality check)
  const pageLinks = new Map();

  for (const lang of ACTIVE_LANGS) {
    const langDir = join(DIST, lang);
    const htmlFiles = findHtmlFiles(langDir);

    for (const htmlFile of htmlFiles) {
      const urlPath = distPathToUrl(htmlFile);
      // Skip index pages (home, werkzeuge/tools listing)
      const segments = urlPath.split('/').filter(Boolean);
      if (segments.length < 2) continue;

      const links = extractHreflangs(htmlFile);
      pageLinks.set(urlPath, links);
      checked++;

      const byHreflang = Object.fromEntries(links.map((l) => [l.hreflang, l.href]));

      // 1. Must have hreflang for current lang
      if (!byHreflang[lang]) {
        findings.push({ page: urlPath, issue: `missing hreflang="${lang}"` });
      }

      // 2. Must have all active langs
      for (const activeLang of ACTIVE_LANGS) {
        if (!byHreflang[activeLang]) {
          findings.push({ page: urlPath, issue: `missing hreflang="${activeLang}"` });
        }
      }

      // 3. Must have x-default
      if (!byHreflang['x-default']) {
        findings.push({ page: urlPath, issue: 'missing hreflang="x-default"' });
      }

      // 4. Self-hreflang must match page URL
      const selfHref = byHreflang[lang];
      if (selfHref && selfHref !== `${SITE}${urlPath}`) {
        findings.push({
          page: urlPath,
          issue: `hreflang="${lang}" href mismatch: expected ${SITE}${urlPath}, got ${selfHref}`,
        });
      }
    }
  }

  // 5. Bidirectionality: for each DE page, check EN href points to a real EN page
  for (const [urlPath, links] of pageLinks.entries()) {
    const lang = urlPath.split('/')[1];
    if (lang !== 'de') continue;

    const byHreflang = Object.fromEntries(links.map((l) => [l.hreflang, l.href]));
    const enHref = byHreflang['en'];
    if (!enHref) continue;

    const enPath = enHref.replace(SITE, '');
    const enLinks = pageLinks.get(enPath);
    if (!enLinks) {
      findings.push({ page: urlPath, issue: `hreflang="en" points to ${enPath} which has no hreflang data in dist/` });
      continue;
    }
    const enByHreflang = Object.fromEntries(enLinks.map((l) => [l.hreflang, l.href]));
    const enDeHref = enByHreflang['de'];
    const deHref = byHreflang['de'];
    if (enDeHref && deHref && enDeHref !== deHref) {
      findings.push({
        page: urlPath,
        issue: `hreflang bidirectionality broken: DE self=${deHref} but EN page points DE→${enDeHref}`,
      });
    }
  }

  // Report
  if (findings.length === 0) {
    console.log(`✓ hreflang audit PASS — ${checked} pages checked, 0 findings`);
    process.exit(0);
  }

  console.error(`✗ hreflang audit FAIL — ${findings.length} findings across ${checked} pages\n`);
  for (const f of findings) {
    console.error(`  [${f.page}] ${f.issue}`);
  }
  process.exit(1);
}

run();
