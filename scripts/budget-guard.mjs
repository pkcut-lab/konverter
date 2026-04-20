#!/usr/bin/env node
// budget-guard.mjs — Kostenlos-Constraint §7.16
//
// INVOCATION-ORDER (hart): Pre-Tool-Call-Wrapper, NICHT Post-hoc-Audit.
// Jeder Agent ruft checkBudget(scope) VOR einem kostenpflichtigen Tool-Call
// (Firecrawl, Claude-API, WebFetch wenn auch gebudgetiert). Exit !== 0 →
// Call wird nicht ausgeführt. Post-hoc wäre wertlos: das Token-Budget ist
// dann schon verbrannt.
//
// Module-Exports:
//   checkBudget({ scope, action, current, limits }) → { allowed, reason }
//   incrementCounter(scope, action, n) — in-Memory-State (wird per HB geflusht
//     nach tasks/metrics.jsonl)
//
// CLI: node scripts/budget-guard.mjs check <scope> <action>
//       Exit 0 = allowed, Exit 1 = blocked

import { readFileSync, existsSync } from 'node:fs';

/**
 * Minimal flat-YAML parser — only supports `key: value` lines (value = number
 * or string). Comments (# …) and blank lines ignored. Kein verschachtelter
 * Support — wenn wir das brauchen, js-yaml als Dep klären.
 */
function parseFlatYaml(src) {
  const out = {};
  for (const line of src.split(/\r?\n/)) {
    const trimmed = line.replace(/#.*$/, '').trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    const val = rawVal.trim();
    const numericStr = val.replace(/_/g, '');
    const num = Number(numericStr);
    out[key] = Number.isFinite(num) && /^[0-9.eE+-]+$/.test(numericStr)
      ? num
      : val.replace(/^["']|["']$/g, '');
  }
  return out;
}

export const DEFAULT_LIMITS = {
  firecrawl_per_ticket: 3,
  firecrawl_per_day: 30,
  tokens_per_day_in: 2_000_000,
  tokens_per_day_out: 400_000,
  webfetch_per_ticket: 200,
};

/**
 * @param {Object} params
 * @param {string} params.scope — 'ticket' | 'day' | 'heartbeat'
 * @param {string} params.action — 'firecrawl' | 'tokens_in' | 'tokens_out' | 'webfetch'
 * @param {number} params.current — Zähler vor diesem Call
 * @param {Object} [params.limits] — Override (sonst DEFAULT_LIMITS)
 * @returns {{ allowed: boolean, reason: string | null, remaining: number }}
 */
export function checkBudget({ scope, action, current, limits = DEFAULT_LIMITS }) {
  const key = `${action}_per_${scope}`;
  const cap = limits[key];
  if (cap == null) {
    // Kein Cap konfiguriert → allow mit Warnung
    return { allowed: true, reason: null, remaining: Infinity };
  }
  if (current >= cap) {
    return {
      allowed: false,
      reason: `${key} cap reached: ${current} >= ${cap}`,
      remaining: 0,
    };
  }
  return {
    allowed: true,
    reason: null,
    remaining: cap - current,
  };
}

/**
 * Liest tasks/budgets.yaml wenn vorhanden, sonst DEFAULT_LIMITS.
 */
export function loadLimits(path = 'tasks/budgets.yaml') {
  if (!existsSync(path)) return DEFAULT_LIMITS;
  const raw = readFileSync(path, 'utf8');
  const parsed = parseFlatYaml(raw);
  return { ...DEFAULT_LIMITS, ...parsed };
}

/**
 * Aggregiert Zähler aus tasks/metrics.jsonl für heute (Zeile-basiert).
 * @param {string} action
 * @param {string} scope — 'day' | 'ticket'
 * @param {string} [ticketId] — erforderlich wenn scope='ticket'
 */
export function readCurrentCount(action, scope, ticketId, path = 'tasks/metrics.jsonl') {
  if (!existsSync(path)) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
  let sum = 0;
  for (const line of lines) {
    let rec;
    try { rec = JSON.parse(line); } catch { continue; }
    if (scope === 'day' && !rec.timestamp?.startsWith(today)) continue;
    if (scope === 'ticket' && rec.ticket_id !== ticketId) continue;
    sum += rec[action] ?? 0;
  }
  return sum;
}

// CLI
if (process.argv[1]?.endsWith('budget-guard.mjs')) {
  const [, , cmd, scope, action, ticketId] = process.argv;
  if (cmd !== 'check' || !scope || !action) {
    console.error('Usage: node scripts/budget-guard.mjs check <scope> <action> [ticketId]');
    process.exit(2);
  }
  const limits = loadLimits();
  const current = readCurrentCount(action, scope, ticketId);
  const result = checkBudget({ scope, action, current, limits });
  if (!result.allowed) {
    console.error(`BLOCKED: ${result.reason}`);
    process.exit(1);
  }
  console.log(`OK remaining=${result.remaining}`);
  process.exit(0);
}
