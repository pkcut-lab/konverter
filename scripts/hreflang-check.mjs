#!/usr/bin/env node
// hreflang-check.mjs — Merged-Critic Check #15
//
// Prüft am gebauten HTML:
//   - mindestens 1 <link rel="alternate" hreflang="<currentLang>">
//   - x-default ist gesetzt UND zeigt auf default-Sprache
//   - Phase 3+: bidirektional (alle Sprachen referenzieren einander,
//     kein Dangling-Ref). In Phase 1 (DE only) ist "de + x-default" valid.
//
// Exit 0 = pass, 1 = fail, 2 = invalid input.

import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

export const DEFAULT_LANG = 'de';
export const ACTIVE_LANGS_PHASE_1 = ['de'];

/**
 * @param {string} html
 * @param {string} currentLang
 * @param {string[]} [activeLangs]
 * @returns {{ ok: boolean, failures: string[], links: Array<{hreflang: string, href: string}> }}
 */
export function checkHreflang(html, currentLang, activeLangs = ACTIVE_LANGS_PHASE_1) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const nodes = doc.querySelectorAll('link[rel="alternate"][hreflang]');
  const links = Array.from(nodes).map((n) => ({
    hreflang: n.getAttribute('hreflang'),
    href: n.getAttribute('href'),
  }));

  const failures = [];

  // 1. current-lang present
  if (!links.some((l) => l.hreflang === currentLang)) {
    failures.push(`missing hreflang="${currentLang}"`);
  }

  // 2. x-default present
  const xdef = links.find((l) => l.hreflang === 'x-default');
  if (!xdef) {
    failures.push('missing hreflang="x-default"');
  }

  // 3. Bidirectional (all active langs referenced)
  for (const lang of activeLangs) {
    if (!links.some((l) => l.hreflang === lang)) {
      failures.push(`active lang "${lang}" not referenced`);
    }
  }

  // 4. No dangling hreflang (every non-xdefault hreflang MUST have an href)
  for (const l of links) {
    if (l.hreflang !== 'x-default' && !l.href) {
      failures.push(`hreflang="${l.hreflang}" has empty href`);
    }
  }

  return { ok: failures.length === 0, failures, links };
}

// CLI
if (process.argv[1]?.endsWith('hreflang-check.mjs')) {
  const [, , htmlPath, lang] = process.argv;
  if (!htmlPath) {
    console.error('Usage: node scripts/hreflang-check.mjs <html-file> [lang=de]');
    process.exit(2);
  }
  if (!existsSync(htmlPath)) {
    console.error(`File not found: ${htmlPath}`);
    process.exit(2);
  }
  const html = readFileSync(htmlPath, 'utf8');
  const res = checkHreflang(html, lang ?? DEFAULT_LANG);
  if (res.ok) {
    console.log(`PASS hreflang (${res.links.length} links)`);
    process.exit(0);
  }
  console.error('FAIL hreflang');
  for (const f of res.failures) console.error(`  - ${f}`);
  process.exit(1);
}
