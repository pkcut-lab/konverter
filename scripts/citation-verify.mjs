#!/usr/bin/env node
// citation-verify.mjs — Dossier Citation-Verify-Pass (§5.5)
//
// INVOCATION-ORDER (hart, 2 Stellen):
//   1. Nach jedem Dossier-Write (Tool ODER Category-Root) — verifiziert
//      jede Quelle ist erreichbar und jedes wörtliche Zitat existiert im
//      gefetchten Quelltext.
//   2. Bei Category-Root-Dossiers: MUSS passen, BEVOR der erste Child
//      davon erben darf (Inheritance-Integrity-Gate, siehe DOSSIER_REPORT.md).
//      CEO-Gate blockt tool-build-Dispatch mit `parent_dossier`-Ref, wenn
//      parent.citation_verify_passed !== true.
//
// Verifikation-Reihenfolge pro Zitat:
//   1. Normalisierten Substring-Check (lowercase, whitespace-collapse).
//      Pass → done.
//   2. Bigram-Jaccard-Score ≥ 0.8 auf Quelltext (Fallback für dynamischen
//      Content, Rendered-JS-Unterschiede, HTML-Entity-Varianten).
//      Pass → done, marked as 'warned'.
//   3. Levenshtein ≤ 15 % der Zitat-Länge (letzter Fallback).
//      Pass → marked as 'warned'. Sonst → 'failed'.
//
// Exit-Codes:
//   0 = all citations verified (verdict: pass)
//   1 = ≥1 failed (verdict: citation_fail, CEO bekommt Ticket)
//   2 = input error

import { readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

const JACCARD_THRESHOLD = 0.8;
const LEVENSHTEIN_FACTOR = 0.15;

/**
 * Extrahiert alle (Zitat, URL)-Paare aus dem Dossier-Body.
 * Zitate sind Blockquotes oder Inline-`"…"` über Substring-Heuristik;
 * pro Zitat wird die nächstgelegene "fetched $url"-Zeile als Quelle gemappt.
 * Für Batch-3-MVP: wir prüfen Blockquote-Zitate (`> "…"` oder `> „…"`).
 *
 * @param {string} markdown
 * @returns {Array<{ quote: string, sourceUrl: string | null }>}
 */
export function extractQuotes(markdown) {
  const quotes = [];
  const lines = markdown.split(/\r?\n/);

  // Quellen-Block: "- [Title](url) — gefetcht …"  (first URL wins per line)
  const sourceUrls = new Set();
  for (const line of lines) {
    const m = line.match(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/);
    if (m) sourceUrls.add(m[1]);
  }

  const blockquoteRe = /^>\s*[„"](.+?)["""]/;
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(blockquoteRe);
    if (!m) continue;
    const quote = m[1].trim();
    // Look-ahead for inline attribution URL
    const ctx = lines.slice(i, i + 3).join(' ');
    const urlMatch = ctx.match(/\(https?:\/\/[^\s)]+\)/);
    const sourceUrl = urlMatch ? urlMatch[0].slice(1, -1) : null;
    quotes.push({ quote, sourceUrl });
  }
  return quotes;
}

export function normalize(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').trim();
}

export function bigramJaccard(a, b) {
  const toBigrams = (s) => {
    const n = normalize(s);
    const set = new Set();
    for (let i = 0; i < n.length - 1; i += 1) set.add(n.slice(i, i + 2));
    return set;
  };
  const A = toBigrams(a);
  const B = toBigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return inter / union;
}

export function levenshtein(a, b) {
  const na = a.length;
  const nb = b.length;
  if (na === 0) return nb;
  if (nb === 0) return na;
  // Windowed search: find best alignment of a within b.
  // For MVP we return classical Levenshtein of min(a, substring of b of same length).
  let best = Infinity;
  const window = na;
  for (let start = 0; start + window <= nb; start += 1) {
    const slice = b.slice(start, start + window);
    const d = classicalLevenshtein(a, slice);
    if (d < best) best = d;
    if (best === 0) return 0;
  }
  return best === Infinity ? classicalLevenshtein(a, b) : best;
}

function classicalLevenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

/**
 * Prüft ein einzelnes Zitat gegen einen Quelltext.
 * @returns {{ status: 'pass' | 'warned' | 'failed', method: string, score?: number }}
 */
export function verifyQuote(quote, sourceText) {
  const q = normalize(quote);
  const s = normalize(sourceText);
  if (s.includes(q)) return { status: 'pass', method: 'substring' };

  const j = bigramJaccard(quote, sourceText);
  if (j >= JACCARD_THRESHOLD) return { status: 'warned', method: 'jaccard', score: j };

  const d = levenshtein(q, s);
  const tol = Math.floor(quote.length * LEVENSHTEIN_FACTOR);
  if (d <= tol) return { status: 'warned', method: 'levenshtein', score: d };

  return { status: 'failed', method: 'none', score: j };
}

/**
 * Haupt-Entry: liest Dossier, fetcht Quellen, verifiziert alle Zitate.
 * Gibt Aggregat-Result zurück + aktualisiert NICHT die Frontmatter
 * (das macht der Caller, damit wir hier pure bleiben und testbar).
 *
 * @param {string} dossierPath
 * @param {Object} [opts]
 * @param {(url: string) => Promise<string>} [opts.fetchFn] — Injectable für Tests
 */
export async function verifyDossier(dossierPath, { fetchFn = defaultFetch } = {}) {
  if (!existsSync(dossierPath)) {
    return { ok: false, error: `file not found: ${dossierPath}`, results: [] };
  }
  const parsed = matter(readFileSync(dossierPath, 'utf8'));
  const quotes = extractQuotes(parsed.content);
  const sourceCache = new Map();

  const results = [];
  for (const { quote, sourceUrl } of quotes) {
    if (!sourceUrl) {
      results.push({ quote, sourceUrl, status: 'failed', method: 'no-url' });
      continue;
    }
    let sourceText = sourceCache.get(sourceUrl);
    if (sourceText == null) {
      try {
        sourceText = await fetchFn(sourceUrl);
        sourceCache.set(sourceUrl, sourceText);
      } catch (err) {
        results.push({ quote, sourceUrl, status: 'failed', method: 'fetch-error', error: err.message });
        continue;
      }
    }
    const v = verifyQuote(quote, sourceText);
    results.push({ quote, sourceUrl, ...v });
  }

  const counts = {
    total: results.length,
    pass: results.filter((r) => r.status === 'pass').length,
    warned: results.filter((r) => r.status === 'warned').length,
    failed: results.filter((r) => r.status === 'failed').length,
  };

  return { ok: counts.failed === 0, counts, results };
}

async function defaultFetch(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// CLI
if (process.argv[1]?.endsWith('citation-verify.mjs')) {
  const dossierPath = process.argv[2];
  if (!dossierPath) {
    console.error('Usage: node scripts/citation-verify.mjs <dossier>');
    process.exit(2);
  }
  verifyDossier(dossierPath).then((res) => {
    if (res.error) {
      console.error(`ERROR: ${res.error}`);
      process.exit(2);
    }
    console.log(
      `citation-verify: ${res.counts.pass}/${res.counts.total} pass, ` +
      `${res.counts.warned} warned, ${res.counts.failed} failed`,
    );
    if (!res.ok) {
      for (const r of res.results.filter((x) => x.status === 'failed')) {
        console.error(`  FAIL: "${r.quote.slice(0, 60)}…" (${r.method})`);
      }
      process.exit(1);
    }
    process.exit(0);
  });
}
