import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
// @ts-expect-error — .mjs import without types is fine here
import {
  checkBudget,
  checkRoleLimit,
  loadLimits,
  readCurrentCount,
  DEFAULT_LIMITS,
  BudgetConfigMissingError,
} from '../../scripts/budget-guard.mjs';

const TMP_DIR = 'tests/.tmp-budget';
const TMP_YAML = `${TMP_DIR}/budgets.yaml`;
const TMP_METRICS = `${TMP_DIR}/metrics.jsonl`;

describe('budget-guard — checkBudget', () => {
  it('allows when current < cap and reports remaining', () => {
    const res = checkBudget({ scope: 'ticket', action: 'firecrawl', current: 1 });
    expect(res.allowed).toBe(true);
    expect(res.reason).toBeNull();
    expect(res.remaining).toBe(DEFAULT_LIMITS.firecrawl_per_ticket - 1);
  });

  it('blocks when current >= cap and names the cap in reason', () => {
    const res = checkBudget({ scope: 'ticket', action: 'firecrawl', current: 3 });
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.reason).toMatch(/firecrawl_per_ticket/);
    expect(res.reason).toMatch(/3 >= 3/);
  });

  it('allows with Infinity remaining when no cap configured', () => {
    const res = checkBudget({ scope: 'year', action: 'unknown', current: 9999 });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(Infinity);
  });

  it('respects custom limits override', () => {
    const res = checkBudget({
      scope: 'ticket',
      action: 'firecrawl',
      current: 5,
      limits: { firecrawl_per_ticket: 10 },
    });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(5);
  });

  it('exports DEFAULT_LIMITS with expected Kostenlos-Constraint values', () => {
    expect(DEFAULT_LIMITS.firecrawl_per_ticket).toBe(3);
    expect(DEFAULT_LIMITS.firecrawl_per_day).toBe(30);
    expect(DEFAULT_LIMITS.tokens_per_day_in).toBe(2_000_000);
  });
});

describe('budget-guard — loadLimits', () => {
  beforeEach(() => {
    mkdirSync(TMP_DIR, { recursive: true });
  });
  afterEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('throws BudgetConfigMissingError when yaml missing — fail-secure, not permissive fallback', () => {
    // §7.16 hard-bound: wenn tasks/budgets.yaml fehlt, MÜSSEN alle gebudgetierten
    // Calls blockiert werden. Kein stiller Fallback zu DEFAULT_LIMITS mehr.
    const missingPath = `${TMP_DIR}/missing.yaml`;
    expect(() => loadLimits(missingPath)).toThrow(BudgetConfigMissingError);
    expect(() => loadLimits(missingPath)).toThrow(/missing/);
  });

  it('attaches path to BudgetConfigMissingError for caller diagnostics', () => {
    const missingPath = `${TMP_DIR}/nope.yaml`;
    try {
      loadLimits(missingPath);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BudgetConfigMissingError);
      expect((err as BudgetConfigMissingError).path).toBe(missingPath);
    }
  });

  it('merges yaml overrides into defaults', () => {
    writeFileSync(TMP_YAML, 'firecrawl_per_ticket: 5\ntokens_per_day_in: 1_000_000\n');
    const lim = loadLimits(TMP_YAML);
    expect(lim.firecrawl_per_ticket).toBe(5);
    expect(lim.tokens_per_day_in).toBe(1_000_000);
    // Default-Werte fuer nicht-ueberschriebene Keys
    expect(lim.firecrawl_per_day).toBe(DEFAULT_LIMITS.firecrawl_per_day);
  });

  it('ignores comments and blank lines in yaml', () => {
    writeFileSync(
      TMP_YAML,
      '# top comment\n\nfirecrawl_per_ticket: 7  # inline\n\n# bottom\n',
    );
    const lim = loadLimits(TMP_YAML);
    expect(lim.firecrawl_per_ticket).toBe(7);
  });

  it('parses per_role block with inline flow-style entries', () => {
    writeFileSync(
      TMP_YAML,
      [
        'daily_tokens_cap: 1_500_000',
        'firecrawl_monthly_usd_cap: 0',
        'per_role:',
        '  ceo:          { heartbeats_max: 48, reworks_max: 0 }',
        '  tool-builder: { heartbeats_max: 4,  reworks_max: 2 }',
        '',
      ].join('\n'),
    );
    const lim = loadLimits(TMP_YAML);
    expect(lim.daily_tokens_cap).toBe(1_500_000);
    expect(lim.firecrawl_monthly_usd_cap).toBe(0);
    expect(lim.per_role.ceo).toEqual({ heartbeats_max: 48, reworks_max: 0 });
    expect(lim.per_role['tool-builder']).toEqual({ heartbeats_max: 4, reworks_max: 2 });
  });
});

describe('budget-guard — checkRoleLimit', () => {
  const limitsFixture = {
    per_role: {
      ceo: { heartbeats_max: 48, reworks_max: 0 },
      'tool-builder': { heartbeats_max: 4, reworks_max: 2 },
    },
  };

  it('allows when current < per_role cap and reports remaining', () => {
    const res = checkRoleLimit({
      role: 'tool-builder',
      metric: 'heartbeats',
      current: 2,
      limits: limitsFixture,
    });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(2);
  });

  it('blocks when current >= per_role cap', () => {
    const res = checkRoleLimit({
      role: 'tool-builder',
      metric: 'reworks',
      current: 2,
      limits: limitsFixture,
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toMatch(/per_role\.tool-builder\.reworks_max reached/);
  });

  it('fail-secure blocks when role missing from config (not ignore)', () => {
    const res = checkRoleLimit({
      role: 'unknown-agent',
      metric: 'heartbeats',
      current: 0,
      limits: limitsFixture,
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toMatch(/missing — fail-secure block/);
  });

  it('fail-secure blocks when limits object is empty', () => {
    const res = checkRoleLimit({
      role: 'ceo',
      metric: 'heartbeats',
      current: 0,
      limits: {},
    });
    expect(res.allowed).toBe(false);
  });
});

describe('budget-guard — readCurrentCount', () => {
  beforeEach(() => {
    mkdirSync(TMP_DIR, { recursive: true });
  });
  afterEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('returns 0 when metrics file missing', () => {
    expect(readCurrentCount('firecrawl', 'day', null, `${TMP_DIR}/missing.jsonl`)).toBe(0);
  });

  it('sums today-scoped records for the day scope', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const lines = [
      JSON.stringify({ timestamp: `${today}T10:00:00Z`, firecrawl: 2 }),
      JSON.stringify({ timestamp: `${today}T11:00:00Z`, firecrawl: 1 }),
      JSON.stringify({ timestamp: `${yesterday}T09:00:00Z`, firecrawl: 99 }),
      JSON.stringify({ timestamp: `${today}T12:00:00Z`, firecrawl: 0 }),
    ];
    writeFileSync(TMP_METRICS, lines.join('\n') + '\n');
    expect(readCurrentCount('firecrawl', 'day', null, TMP_METRICS)).toBe(3);
  });

  it('filters by ticket_id for ticket scope', () => {
    const lines = [
      JSON.stringify({ ticket_id: 'T-1', firecrawl: 2 }),
      JSON.stringify({ ticket_id: 'T-2', firecrawl: 5 }),
      JSON.stringify({ ticket_id: 'T-1', firecrawl: 1 }),
    ];
    writeFileSync(TMP_METRICS, lines.join('\n') + '\n');
    expect(readCurrentCount('firecrawl', 'ticket', 'T-1', TMP_METRICS)).toBe(3);
    expect(readCurrentCount('firecrawl', 'ticket', 'T-2', TMP_METRICS)).toBe(5);
  });

  it('skips malformed jsonl lines', () => {
    const today = new Date().toISOString().slice(0, 10);
    const lines = [
      'not-json',
      JSON.stringify({ timestamp: `${today}T10:00:00Z`, firecrawl: 4 }),
      '{incomplete',
    ];
    writeFileSync(TMP_METRICS, lines.join('\n') + '\n');
    expect(readCurrentCount('firecrawl', 'day', null, TMP_METRICS)).toBe(4);
  });
});
