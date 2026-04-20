#!/usr/bin/env node
// pii-scrub.mjs — DSGVO Pseudonymisierung (§7.12)
//
// INVOCATION-ORDER (hart): VOR dem Dossier-Write.
// Pipeline: Fetch → Scrub (in-memory) → Write to disk.
// NIEMALS Scrub-nach-Write — das bedeutet PII liegt kurzzeitig auf Disk,
// was den Zweck des Scrubs aushebelt. Dossier-Researcher MUSS jeden
// raw-fetched Text durch scrub() leiten, bevor er in einen String-Buffer
// kommt, der später als File geschrieben wird.
//
// Exit-Codes (CLI-Mode):
//   0 = scrub completed
//   1 = invalid input
//
// Module-Export: scrub(text, opts?) → { text, counts }

import { readFileSync } from 'node:fs';

export const PII_SCRUB_VERSION = '1.0';

/**
 * PII-Patterns. Reihenfolge wichtig: spezifische Patterns zuerst,
 * damit ein "u/user@host.de"-Case nicht als E-Mail geflaggt wird.
 */
export const PATTERNS = [
  {
    name: 'reddit-user',
    regex: /\bu\/[A-Za-z0-9_-]{2,32}\b/g,
    replace: '[reddit-user]',
  },
  {
    name: 'hn-user',
    regex: /(?:(?<=by\s)|(?<=—\s))[a-z][a-z0-9_]{2,20}(?=\s|$|\|)/g,
    replace: '[hn-user]',
  },
  {
    name: 'email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replace: '[email]',
  },
  {
    name: 'phone-de',
    regex: /(?:\+49|0049|0)\s?[1-9][0-9\s/-]{6,14}/g,
    replace: '[phone]',
  },
  {
    name: 'trustpilot-signature',
    regex: /(posted by|reviewed by|von)\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]*\.?)?/g,
    replace: '$1 [author]',
  },
  {
    name: 'url-profile',
    regex: /https?:\/\/(?:www\.)?(?:reddit\.com\/u|twitter\.com|x\.com|github\.com|linkedin\.com\/in)\/[A-Za-z0-9_-]+/g,
    replace: '[profile-url]',
  },
];

/**
 * Scrubs PII from raw text. Non-mutating — returns new string.
 * @param {string} text
 * @returns {{ text: string, counts: Record<string, number> }}
 */
export function scrub(text) {
  if (typeof text !== 'string') {
    throw new TypeError('scrub: expected string input');
  }
  const counts = {};
  let out = text;
  for (const pattern of PATTERNS) {
    let matched = 0;
    out = out.replace(pattern.regex, (...args) => {
      matched += 1;
      // Support $1 backrefs by calling String.prototype.replace with a function
      return typeof pattern.replace === 'string'
        ? applyBackrefs(pattern.replace, args)
        : pattern.replace(...args);
    });
    counts[pattern.name] = matched;
  }
  return { text: out, counts };
}

function applyBackrefs(template, args) {
  // Last two args are offset + full-string; between name groups + numbered groups
  const groups = args.slice(1, -2);
  return template.replace(/\$(\d+)/g, (_, n) => groups[Number(n) - 1] ?? '');
}

/**
 * Total PII hits across all patterns.
 * @param {Record<string, number>} counts
 */
export function totalHits(counts) {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

// CLI: node scripts/pii-scrub.mjs <file>
// Liest File, scrubt, schreibt auf stdout. Exit 0 = OK.
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
    process.argv[1]?.endsWith('pii-scrub.mjs')) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/pii-scrub.mjs <file>');
    process.exit(1);
  }
  try {
    const raw = readFileSync(file, 'utf8');
    const result = scrub(raw);
    process.stdout.write(result.text);
    process.stderr.write(`pii-scrub v${PII_SCRUB_VERSION}: ${totalHits(result.counts)} hits — ${JSON.stringify(result.counts)}\n`);
    process.exit(0);
  } catch (err) {
    console.error(`pii-scrub error: ${err.message}`);
    process.exit(1);
  }
}
