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
 * Fail-secure sentinel — thrown by `loadLimits` wenn `tasks/budgets.yaml`
 * fehlt. §7.16 ist hard-bound: kein Permissiv-Fallback, keine Default-
 * Limits, kein stilles Durchwinken. CLI + Pre-Tool-Call-Wrapper fangen den
 * Error und verweigern ALLE kostenpflichtigen Calls.
 */
export class BudgetConfigMissingError extends Error {
  constructor(path) {
    super(`Fail-secure: ${path} missing — all budgeted calls blocked until config is restored`);
    this.name = 'BudgetConfigMissingError';
    this.path = path;
  }
}

function parseScalar(rawVal) {
  const val = rawVal.trim();
  const numericStr = val.replace(/_/g, '');
  const num = Number(numericStr);
  return Number.isFinite(num) && /^[0-9.eE+-]+$/.test(numericStr)
    ? num
    : val.replace(/^["']|["']$/g, '');
}

/**
 * Minimal YAML parser für budgets.yaml Schema v1.0. Unterstützt:
 *   - flat `key: value` (scalar)
 *   - `per_role:` mit einer Ebene Indent + inline-flow-style
 *     `<role>: { heartbeats_max: N, reworks_max: M }`
 *   - Kommentare (# …) und Blank-Lines ignoriert
 *
 * Deeper nesting → require js-yaml als Dep. Bisher nicht nötig.
 */
function parseBudgetsYaml(src) {
  const out = {};
  let inPerRole = false;
  for (const rawLine of src.split(/\r?\n/)) {
    const noComment = rawLine.replace(/#.*$/, '');
    if (!noComment.trim()) continue;

    // Top-level key: no leading whitespace
    if (!/^\s/.test(noComment)) {
      inPerRole = false;
      const m = noComment.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!m) continue;
      const [, key, rawVal] = m;
      if (key === 'per_role' && !rawVal.trim()) {
        out.per_role = {};
        inPerRole = true;
        continue;
      }
      out[key] = parseScalar(rawVal);
      continue;
    }

    // Indented — only meaningful inside per_role block
    if (!inPerRole) continue;
    const m = noComment.match(/^\s+([A-Za-z0-9_-]+):\s*\{\s*(.+?)\s*\}\s*$/);
    if (!m) continue;
    const [, role, inner] = m;
    const roleObj = {};
    for (const pair of inner.split(',')) {
      const pm = pair.trim().match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
      if (!pm) continue;
      roleObj[pm[1]] = parseScalar(pm[2]);
    }
    out.per_role[role] = roleObj;
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
 * Liest tasks/budgets.yaml. FAIL-SECURE: wirft BudgetConfigMissingError wenn
 * die Datei fehlt. Caller (CLI, Pre-Tool-Call-Wrapper) müssen den Error
 * fangen und den Call blockieren. §7.16 ist hard-bound — kein Permissiv-
 * Fallback zu DEFAULT_LIMITS.
 *
 * Merge-Semantik bei Success: `{ ...DEFAULT_LIMITS, ...parsed }` — die in
 * DEFAULT_LIMITS gelisteten per-scope-Caps (firecrawl_per_ticket etc.)
 * bleiben erhalten, wenn die YAML sie nicht überschreibt. Neue Schema-
 * Felder (daily_tokens_cap, per_role, …) werden mit-gemerged.
 */
export function loadLimits(path = 'tasks/budgets.yaml') {
  if (!existsSync(path)) {
    throw new BudgetConfigMissingError(path);
  }
  const raw = readFileSync(path, 'utf8');
  const parsed = parseBudgetsYaml(raw);
  return { ...DEFAULT_LIMITS, ...parsed };
}

/**
 * Per-Role Heartbeat-/Rework-Ceiling-Check. Liest `per_role.<role>.<metric>_max`
 * aus den Limits. Ohne Config oder ohne passenden Entry → block (fail-secure).
 *
 * @param {Object} params
 * @param {string} params.role — 'ceo' | 'tool-builder' | 'tool-dossier-researcher' | 'merged-critic'
 * @param {'heartbeats'|'reworks'} params.metric
 * @param {number} params.current
 * @param {Object} params.limits — aus loadLimits()
 * @returns {{ allowed: boolean, reason: string | null, remaining: number }}
 */
export function checkRoleLimit({ role, metric, current, limits }) {
  const cap = limits?.per_role?.[role]?.[`${metric}_max`];
  if (cap == null) {
    return {
      allowed: false,
      reason: `per_role.${role}.${metric}_max missing — fail-secure block`,
      remaining: 0,
    };
  }
  if (current >= cap) {
    return {
      allowed: false,
      reason: `per_role.${role}.${metric}_max reached: ${current} >= ${cap}`,
      remaining: 0,
    };
  }
  return { allowed: true, reason: null, remaining: cap - current };
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
  let limits;
  try {
    limits = loadLimits();
  } catch (err) {
    if (err instanceof BudgetConfigMissingError) {
      console.error(`BLOCKED: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
  const current = readCurrentCount(action, scope, ticketId);
  const result = checkBudget({ scope, action, current, limits });
  if (!result.allowed) {
    console.error(`BLOCKED: ${result.reason}`);
    process.exit(1);
  }
  console.log(`OK remaining=${result.remaining}`);
  process.exit(0);
}
