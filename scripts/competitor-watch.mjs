#!/usr/bin/env node
// competitor-watch.mjs — §7.9 P3 Competitor-Watch-List (Kategorie-weiter Diff-Check)
//
// INVOCATION-ORDER: Monatlich (manuell ODER via Cron in Batch 5 operationalisiert,
// Runner-Wiring ist NICHT Teil dieses Scripts). Pro Kategorie:
//   - Watchlist in tasks/competitor-watch/<category>.txt (zeile = URL)
//   - Vorherige Content-Hashes in tasks/competitor-watch/_state.json
//   - WebFetch pro URL, sha256 über normalisierten Body (strip whitespace + time)
//   - Diff gegen letzten Hash → bei Change: Eintrag in daily-digest
//
// Bewusst minimal (Batch 3 = Operationalisierung §7.9 P3). Batch-5-Wiring
// (Cron-Runner, Digest-Anchor, Override-Trigger-Invocation) kommt später.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const WATCH_DIR = 'tasks/competitor-watch';
const STATE_FILE = `${WATCH_DIR}/_state.json`;
const DIGEST_DIR = 'inbox/daily-digest';

function normalizeHash(body) {
  // Strip whitespace-Varianz + ISO-Timestamps (change-noise killer)
  const stripped = body
    .replace(/\s+/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, '<TS>')
    .trim();
  return createHash('sha256').update(stripped).digest('hex').slice(0, 16);
}

export async function checkCategory(category, { fetchFn = defaultFetch } = {}) {
  const listFile = `${WATCH_DIR}/${category}.txt`;
  if (!existsSync(listFile)) {
    return { category, changes: [], error: 'no-watchlist' };
  }
  const urls = readFileSync(listFile, 'utf8')
    .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

  let state = {};
  if (existsSync(STATE_FILE)) {
    try { state = JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { state = {}; }
  }
  state[category] ??= {};

  const changes = [];
  for (const url of urls) {
    let body;
    try { body = await fetchFn(url); } catch (err) {
      changes.push({ url, status: 'fetch-error', error: err.message });
      continue;
    }
    const hash = normalizeHash(body);
    const prev = state[category][url];
    if (prev && prev !== hash) {
      changes.push({ url, status: 'changed', prev: prev.slice(0, 8), next: hash.slice(0, 8) });
    } else if (!prev) {
      changes.push({ url, status: 'new-baseline', hash: hash.slice(0, 8) });
    }
    state[category][url] = hash;
  }

  mkdirSync(WATCH_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');

  return { category, changes };
}

async function defaultFetch(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function writeDigest(categoryResults) {
  const today = new Date().toISOString().slice(0, 10);
  mkdirSync(DIGEST_DIR, { recursive: true });
  const digestFile = `${DIGEST_DIR}/${today}.md`;
  const header = existsSync(digestFile) ? '' : `# Daily-Digest — ${today}\n\n`;
  let body = '\n## Competitor-Watch\n';
  for (const r of categoryResults) {
    body += `\n### ${r.category}\n`;
    if (!r.changes.length) { body += '- Keine Änderungen.\n'; continue; }
    for (const c of r.changes) {
      if (c.status === 'changed') body += `- **CHANGED** ${c.url} (${c.prev} → ${c.next})\n`;
      else if (c.status === 'new-baseline') body += `- new-baseline ${c.url} (${c.hash})\n`;
      else body += `- ${c.status} ${c.url}${c.error ? ` — ${c.error}` : ''}\n`;
    }
  }
  writeFileSync(digestFile, header + (existsSync(digestFile) ? readFileSync(digestFile, 'utf8') : '') + body);
}

// CLI
if (process.argv[1]?.endsWith('competitor-watch.mjs')) {
  const categories = process.argv.slice(2);
  if (!categories.length) {
    // Alle Watchlists scannen
    if (!existsSync(WATCH_DIR)) {
      console.error(`No watch-dir: ${WATCH_DIR}`);
      process.exit(0);
    }
    const files = readdirSync(WATCH_DIR).filter((f) => f.endsWith('.txt'));
    categories.push(...files.map((f) => f.replace(/\.txt$/, '')));
  }
  (async () => {
    const results = [];
    for (const cat of categories) results.push(await checkCategory(cat));
    writeDigest(results);
    const total = results.reduce((a, r) => a + r.changes.filter((c) => c.status === 'changed').length, 0);
    console.log(`competitor-watch: ${total} changes across ${results.length} categories`);
    process.exit(0);
  })();
}
