import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
// @ts-expect-error — .mjs import without types is fine here
import { checkBudget, loadLimits, readCurrentCount, DEFAULT_LIMITS } from '../../scripts/budget-guard.mjs';

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

  it('falls back to DEFAULT_LIMITS when yaml missing', () => {
    const lim = loadLimits(`${TMP_DIR}/missing.yaml`);
    expect(lim).toEqual(DEFAULT_LIMITS);
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
