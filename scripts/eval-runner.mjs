#!/usr/bin/env node
// eval-runner.mjs — Merged-Critic Eval-Harness (§2.8 Rubber-Stamping-Guard)
//
// INVOCATION-ORDER: Pre-Review-Pflicht. Vor jedem echten Review läuft
// `run-smoke.sh` (5 random pass + 5 random fail). F1 < 0.85 → Critic
// self-disabled, CEO wird eskaliert.
//
// Scope Batch 4 (MVP): 5 File-Level-Checks auf Tool-Content-Dateien:
//   - c-meta       : 9 Frontmatter-Pflichtfelder vorhanden
//   - c3-hex       : kein Hex im Body (Tokens-only-Regel)
//   - c4-arb-px    : keine arbitrary-px `[<N>px]` im Body
//   - c7-related   : letztes H2 = "## Verwandte …-Tools" + 3 Bullets
//   - c8-words     : Body ≥ 300 Wörter
//   - c11-nbsp     : Einheiten mit NBSP, nicht mit Space
//
// Runtime-Checks (Vitest, Lighthouse, axe-core, etc.) sind explizit
// NICHT in diesem Harness — die laufen im echten Critic-Flow, nicht
// im Pre-Review-Smoke. Harness-Zweck: Rubric-Detection-Fähigkeit
// messen, nicht Build-Ergebnis.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const REQUIRED_FIELDS = [
  'toolId', 'language', 'title', 'headingHtml', 'metaDescription',
  'tagline', 'intro', 'category', 'contentVersion',
];

const UNIT_WORDS = [
  'm', 'ft', 'km', 'kg', 'cm', 'mm', 'g', 'ml', 'l',
  'inch', 'zoll', 'meter', 'fuß', 'pfund', 'kilogramm', 'liter',
];

export const CHECK_IDS = ['c-meta', 'c3-hex', 'c4-arb-px', 'c7-related', 'c8-words', 'c11-nbsp'];

/**
 * @param {string} markdown — full file content (frontmatter + body)
 * @returns {{ failing_checks: string[], details: Record<string, string> }}
 */
export function evaluateFixture(markdown) {
  const parsed = matter(markdown);
  const body = parsed.content;
  const data = parsed.data;

  const failing = [];
  const details = {};

  // c-meta: required frontmatter fields
  const missing = REQUIRED_FIELDS.filter((f) => data[f] == null || data[f] === '');
  if (missing.length) {
    failing.push('c-meta');
    details['c-meta'] = `missing: ${missing.join(', ')}`;
  }

  // c3-hex: hex colors in body (nicht in inline-code spans)
  const bodyNoCode = stripCodeSpans(body);
  const hexMatch = bodyNoCode.match(/#[0-9A-Fa-f]{3,8}\b/);
  if (hexMatch) {
    failing.push('c3-hex');
    details['c3-hex'] = `hex color: ${hexMatch[0]}`;
  }

  // c4-arb-px: arbitrary pixel values
  const arbPxMatch = body.match(/\[\s*\d+(?:\.\d+)?\s*px\s*\]/);
  if (arbPxMatch) {
    failing.push('c4-arb-px');
    details['c4-arb-px'] = `arbitrary-px: ${arbPxMatch[0]}`;
  }

  // c7-related: last H2 = "## Verwandte <Kat>-Tools" + exactly 3 bullets
  const c7 = checkRelatedCloser(body);
  if (!c7.ok) {
    failing.push('c7-related');
    details['c7-related'] = c7.reason;
  }

  // c8-words: body word-count ≥ 300
  const words = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 300) {
    failing.push('c8-words');
    details['c8-words'] = `${words.length} words (need ≥300)`;
  }

  // c11-nbsp: `\d+ <unit>` with regular space
  const nbspRe = new RegExp(`(?<=\\d) (?=(${UNIT_WORDS.join('|')})\\b)`, 'i');
  const nbspMatch = body.match(nbspRe);
  if (nbspMatch) {
    const ctx = body.slice(Math.max(0, nbspMatch.index - 10), nbspMatch.index + 15);
    failing.push('c11-nbsp');
    details['c11-nbsp'] = `regular-space before unit: "${ctx.replace(/\s+/g, ' ')}"`;
  }

  return { failing_checks: failing, details };
}

function stripCodeSpans(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
}

function checkRelatedCloser(body) {
  const lines = body.split(/\r?\n/);
  // Find all H2 headings with line indices
  const h2s = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) h2s.push({ i, text: lines[i] });
  }
  if (h2s.length === 0) return { ok: false, reason: 'no H2 headings in body' };

  const last = h2s[h2s.length - 1];
  if (!/^##\s+Verwandte\s+[\p{L}-]+-Tools\s*$/u.test(last.text)) {
    return { ok: false, reason: `last H2 "${last.text.trim()}" not "## Verwandte <Kat>-Tools"` };
  }

  // Count `- ` bullets in the last H2 section
  const tail = lines.slice(last.i + 1);
  let bullets = 0;
  for (const ln of tail) {
    if (/^[-*]\s+/.test(ln)) bullets += 1;
  }
  if (bullets !== 3) return { ok: false, reason: `${bullets} bullets in related-closer (need exactly 3)` };

  return { ok: true };
}

/**
 * Binary verdict: pass if no checks failed.
 */
export function fixtureVerdict(failing) {
  return failing.length === 0 ? 'pass' : 'fail';
}

function safeF1(tp, fp, fn) {
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}

/**
 * Aggregiert Runner-Output gegen Erwartungen aus annotations.yaml.
 *
 * Liefert drei Metriken:
 *   - binary:  pass-vs-fail per verdict (grobmaschig; fängt Total-Detection-Failure).
 *   - micro:   per-check TP/FP/FN summiert über alle Checks + Fixtures (eine globale F1).
 *   - macro:   Durchschnitt der per-Check-F1-Werte (sensibel für Single-Check-Drift).
 *
 * Macro-F1 ist das wichtigere Rubber-Stamp-Guard-Kriterium, weil es Erosion
 * eines einzelnen Checks (z.B. c11-nbsp bricht silent) sichtbar macht, auch
 * wenn andere Checks weiterhin trippen und der binäre verdict stimmt.
 *
 * Legacy-Felder (precision/recall/f1/correct/total) bleiben erhalten =
 * Alias auf binary — existing consumers brechen nicht.
 *
 * @param {Array<{fixture: string, expected: {verdict: string, failing_checks?: string[]}, actual: {failing_checks: string[]}}>} rows
 */
export function computeF1(rows) {
  // --- Binary (pass vs fail per verdict) ---
  let bTp = 0;
  let bFp = 0;
  let bFn = 0;
  let correct = 0;
  for (const r of rows) {
    const expectFail = r.expected.verdict === 'fail';
    const actualFail = r.actual.failing_checks.length > 0;
    if (expectFail && actualFail) bTp += 1;
    else if (!expectFail && actualFail) bFp += 1;
    else if (expectFail && !actualFail) bFn += 1;
    if (expectFail === actualFail) correct += 1;
  }
  const binary = { ...safeF1(bTp, bFp, bFn), tp: bTp, fp: bFp, fn: bFn, correct, total: rows.length };

  // --- Per-check (micro + macro) ---
  const perCheck = {};
  let microTp = 0;
  let microFp = 0;
  let microFn = 0;
  for (const cid of CHECK_IDS) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    for (const r of rows) {
      const expectedArr = Array.isArray(r.expected.failing_checks) ? r.expected.failing_checks : [];
      const actualArr = Array.isArray(r.actual.failing_checks) ? r.actual.failing_checks : [];
      const inE = expectedArr.includes(cid);
      const inA = actualArr.includes(cid);
      if (inE && inA) tp += 1;
      else if (!inE && inA) fp += 1;
      else if (inE && !inA) fn += 1;
    }
    const support = tp + fn;
    perCheck[cid] = { ...safeF1(tp, fp, fn), tp, fp, fn, support };
    microTp += tp;
    microFp += fp;
    microFn += fn;
  }
  const micro = { ...safeF1(microTp, microFp, microFn), tp: microTp, fp: microFp, fn: microFn };

  // Macro-F1: Durchschnitt über Checks mit support > 0. Checks ohne support
  // (in keinem Fixture-expected enthalten) werden exkludiert, damit sie nicht
  // künstlich den Durchschnitt hochziehen.
  const withSupport = Object.values(perCheck).filter((m) => m.support > 0);
  const macroF1 = withSupport.length === 0
    ? 1
    : withSupport.reduce((acc, m) => acc + m.f1, 0) / withSupport.length;
  const macro = { f1: macroF1, per_check: perCheck };

  return {
    // Legacy-Alias: top-level = binary
    precision: binary.precision,
    recall: binary.recall,
    f1: binary.f1,
    correct,
    total: rows.length,
    // Strukturierte neue Felder
    binary,
    micro,
    macro,
  };
}

function readFixtureDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({
    id: f.replace(/\.md$/, ''),
    path: join(dir, f),
  }));
}

/**
 * @param {Object} opts
 * @param {string} opts.fixturesDir
 * @param {string} opts.annotationsPath
 * @param {string[]} [opts.ids] — Subset
 */
export function runEvalSuite({ fixturesDir, annotationsPath, ids }) {
  const annotations = parseAnnotations(readFileSync(annotationsPath, 'utf8'));
  const all = [
    ...readFixtureDir(join(fixturesDir, 'pass')).map((x) => ({ ...x, bucket: 'pass' })),
    ...readFixtureDir(join(fixturesDir, 'fail')).map((x) => ({ ...x, bucket: 'fail' })),
  ];
  const selected = ids ? all.filter((x) => ids.includes(x.id)) : all;

  const rows = [];
  for (const fx of selected) {
    const expected = annotations[fx.id];
    if (!expected) {
      rows.push({
        fixture: fx.id,
        expected: { verdict: fx.bucket },
        actual: { failing_checks: ['missing-annotation'] },
      });
      continue;
    }
    const md = readFileSync(fx.path, 'utf8');
    const actual = evaluateFixture(md);
    rows.push({ fixture: fx.id, expected, actual });
  }

  return { rows, metrics: computeF1(rows) };
}

/**
 * Mini-YAML-Parser: block mappings (2-level), list items with `- `.
 * Ausreichend für annotations.yaml-Format:
 *   fixture-id:
 *     verdict: pass|fail
 *     failing_checks:
 *       - c-meta
 */
export function parseAnnotations(src) {
  const out = {};
  const lines = src.split(/\r?\n/);
  let currentFixture = null;
  let currentArray = null;
  let currentArrayKey = null;
  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '');
    if (!line.trim()) continue;

    const topMatch = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (topMatch && !line.startsWith(' ')) {
      currentFixture = topMatch[1];
      out[currentFixture] = {};
      currentArray = null;
      currentArrayKey = null;
      continue;
    }

    const kvMatch = line.match(/^\s{2}([A-Za-z_]+):\s*(.*)$/);
    if (kvMatch && currentFixture) {
      const [, key, val] = kvMatch;
      if (val === '') {
        currentArray = [];
        currentArrayKey = key;
        out[currentFixture][key] = currentArray;
      } else if (val === '[]') {
        // Inline empty-array notation: `failing_checks: []`
        out[currentFixture][key] = [];
        currentArray = null;
        currentArrayKey = null;
      } else {
        out[currentFixture][key] = val.replace(/^["']|["']$/g, '');
        currentArray = null;
        currentArrayKey = null;
      }
      continue;
    }

    const liMatch = line.match(/^\s{4}-\s+(.+)$/);
    if (liMatch && currentArray) {
      currentArray.push(liMatch[1].replace(/^["']|["']$/g, ''));
    }
  }
  return out;
}

// Rubber-Stamp-Guard-Schwellen (§2.8).
// binary fängt Total-Detection-Failure (kata­strophal, Runner erkennt nichts).
// macro fängt Single-Check-Drift (einzelner Check silent broken, andere tripfen).
// Macro ist strenger (0.90) weil Single-Check-Erosion statistisch wahrscheinlicher
// ist als Total-Ausfall und früher sichtbar sein muss.
export const THRESHOLDS = Object.freeze({
  binary_min: 0.85,
  macro_min: 0.90,
});

function passesThresholds(metrics) {
  return metrics.binary.f1 >= THRESHOLDS.binary_min && metrics.macro.f1 >= THRESHOLDS.macro_min;
}

// CLI
if (process.argv[1]?.endsWith('eval-runner.mjs')) {
  const [, , cmd, ...rest] = process.argv;
  if (cmd === 'suite') {
    const fixturesDir = rest[0] ?? 'evals/merged-critic/fixtures';
    const annotationsPath = rest[1] ?? 'evals/merged-critic/annotations.yaml';
    const { rows, metrics } = runEvalSuite({ fixturesDir, annotationsPath });
    console.log(JSON.stringify({ metrics, thresholds: THRESHOLDS, rows: rows.map((r) => ({
      fixture: r.fixture,
      expected: r.expected.verdict,
      expected_failing: Array.isArray(r.expected.failing_checks) ? r.expected.failing_checks : [],
      actual: r.actual.failing_checks.length ? 'fail' : 'pass',
      actual_failing: r.actual.failing_checks,
      source: r.expected.source ?? null,
    })) }, null, 2));
    process.exit(passesThresholds(metrics) ? 0 : 1);
  }
  if (cmd === 'smoke') {
    const fixturesDir = rest[0] ?? 'evals/merged-critic/fixtures';
    const annotationsPath = rest[1] ?? 'evals/merged-critic/annotations.yaml';
    const nPerBucket = Number(rest[2] ?? 5);
    const pass = readFixtureDir(join(fixturesDir, 'pass')).map((x) => x.id);
    const fail = readFixtureDir(join(fixturesDir, 'fail')).map((x) => x.id);
    const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const ids = [...pick(pass, nPerBucket), ...pick(fail, nPerBucket)];
    const { rows, metrics } = runEvalSuite({ fixturesDir, annotationsPath, ids });
    const out = { metrics, thresholds: THRESHOLDS, rows: rows.length, picked: ids };
    console.log(JSON.stringify(out, null, 2));
    process.exit(passesThresholds(metrics) ? 0 : 1);
  }
  if (cmd === 'one') {
    const path = rest[0];
    if (!path) {
      console.error('Usage: eval-runner.mjs one <file.md>');
      process.exit(2);
    }
    const result = evaluateFixture(readFileSync(path, 'utf8'));
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  console.error('Usage: eval-runner.mjs <suite|smoke|one> [args]');
  process.exit(2);
}
