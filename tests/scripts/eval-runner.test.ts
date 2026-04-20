import { describe, it, expect } from 'vitest';
// @ts-expect-error — .mjs import without types is fine here
import { evaluateFixture, fixtureVerdict, computeF1, parseAnnotations, CHECK_IDS } from '../../scripts/eval-runner.mjs';

const GOOD_FM = [
  '---',
  'toolId: "example_tool"',
  'language: "de"',
  'title: "Example"',
  'headingHtml: "Example <em>Tool</em>"',
  'metaDescription: "Example tool for testing."',
  'tagline: "Tag line here."',
  'intro: "Intro paragraph."',
  'category: "length"',
  'contentVersion: 1',
  '---',
  '',
].join('\n');

const GOOD_BODY_300_WORDS = [
  '## Section One',
  '',
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor '.repeat(8),
  '',
  '## Section Two',
  '',
  'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut '.repeat(8),
  '',
  '## Section Three',
  '',
  'Duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore '.repeat(8),
  '',
  '## Verwandte Längen-Tools',
  '',
  'Weitere Tools der Kategorie:',
  '',
  '- [A](/de/a)',
  '- [B](/de/b)',
  '- [C](/de/c)',
  '',
].join('\n');

describe('eval-runner — evaluateFixture (pass case)', () => {
  it('flags no checks for a well-formed fixture', () => {
    const res = evaluateFixture(GOOD_FM + GOOD_BODY_300_WORDS);
    expect(res.failing_checks).toEqual([]);
    expect(fixtureVerdict(res.failing_checks)).toBe('pass');
  });
});

describe('eval-runner — evaluateFixture (fail cases)', () => {
  it('detects missing required frontmatter fields (c-meta)', () => {
    const fm = GOOD_FM.replace(/category: "length"\n/, '');
    const res = evaluateFixture(fm + GOOD_BODY_300_WORDS);
    expect(res.failing_checks).toContain('c-meta');
    expect(res.details['c-meta']).toMatch(/category/);
  });

  it('detects hex color in body (c3-hex)', () => {
    const body = GOOD_BODY_300_WORDS.replace('## Section Two', 'Accent: #ff0000\n\n## Section Two');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).toContain('c3-hex');
  });

  it('ignores hex inside inline code spans', () => {
    const body = GOOD_BODY_300_WORDS.replace('## Section Two', 'Token-Beispiel: `#FF0000` ist nur Beispiel-Code.\n\n## Section Two');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).not.toContain('c3-hex');
  });

  it('detects arbitrary-px in body (c4-arb-px)', () => {
    const body = GOOD_BODY_300_WORDS.replace('## Section Two', 'Spacing `p-[24px]` direkt gesetzt.\n\n## Section Two');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).toContain('c4-arb-px');
  });

  it('detects missing related-closer (c7-related)', () => {
    const body = GOOD_BODY_300_WORDS.replace('## Verwandte Längen-Tools', '## Andere Sektion');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).toContain('c7-related');
  });

  it('detects wrong bullet count in related-closer (c7-related)', () => {
    const body = GOOD_BODY_300_WORDS
      .replace('- [A](/de/a)\n- [B](/de/b)\n- [C](/de/c)', '- [A](/de/a)\n- [B](/de/b)');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).toContain('c7-related');
    expect(res.details['c7-related']).toMatch(/2 bullets/);
  });

  it('detects word-count below 300 (c8-words)', () => {
    const shortBody = '## Only\n\nKurzer Inhalt.\n\n## Verwandte Längen-Tools\n\n- [A](/de/a)\n- [B](/de/b)\n- [C](/de/c)\n';
    const res = evaluateFixture(GOOD_FM + shortBody);
    expect(res.failing_checks).toContain('c8-words');
    expect(res.details['c8-words']).toMatch(/\d+ words/);
  });

  it('detects regular-space between number and unit (c11-nbsp)', () => {
    const body = GOOD_BODY_300_WORDS.replace('## Section Two', 'Beispiel: 5 kg ohne NBSP.\n\n## Section Two');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).toContain('c11-nbsp');
  });

  it('accepts NBSP between number and unit', () => {
    const body = GOOD_BODY_300_WORDS.replace('## Section Two', 'Beispiel: 5\u00A0kg mit NBSP.\n\n## Section Two');
    const res = evaluateFixture(GOOD_FM + body);
    expect(res.failing_checks).not.toContain('c11-nbsp');
  });
});

describe('eval-runner — computeF1', () => {
  it('returns F1=1 on perfect detection', () => {
    const rows = [
      { fixture: 'a', expected: { verdict: 'pass' }, actual: { failing_checks: [] } },
      { fixture: 'b', expected: { verdict: 'fail' }, actual: { failing_checks: ['c-meta'] } },
      { fixture: 'c', expected: { verdict: 'fail' }, actual: { failing_checks: ['c3-hex'] } },
    ];
    const m = computeF1(rows);
    expect(m.precision).toBe(1);
    expect(m.recall).toBe(1);
    expect(m.f1).toBe(1);
    expect(m.correct).toBe(3);
  });

  it('penalises false-negatives (recall < 1)', () => {
    const rows = [
      { fixture: 'a', expected: { verdict: 'fail' }, actual: { failing_checks: [] } },
      { fixture: 'b', expected: { verdict: 'fail' }, actual: { failing_checks: ['c3-hex'] } },
    ];
    const m = computeF1(rows);
    expect(m.recall).toBe(0.5);
    expect(m.f1).toBeLessThan(1);
  });

  it('penalises false-positives (precision < 1)', () => {
    const rows = [
      { fixture: 'a', expected: { verdict: 'pass' }, actual: { failing_checks: ['c3-hex'] } },
      { fixture: 'b', expected: { verdict: 'fail' }, actual: { failing_checks: ['c3-hex'] } },
    ];
    const m = computeF1(rows);
    expect(m.precision).toBe(0.5);
    expect(m.f1).toBeLessThan(1);
  });
});

describe('eval-runner — parseAnnotations', () => {
  it('parses the fixture-id → verdict + failing_checks mapping', () => {
    const yaml = [
      '# comment',
      '',
      'pass-01:',
      '  verdict: pass',
      '  failing_checks: []',
      '',
      'fail-01:',
      '  verdict: fail',
      '  failing_checks:',
      '    - c-meta',
      '    - c3-hex',
      '',
    ].join('\n');
    const parsed = parseAnnotations(yaml);
    expect(parsed['pass-01'].verdict).toBe('pass');
    expect(parsed['fail-01'].verdict).toBe('fail');
    expect(parsed['fail-01'].failing_checks).toEqual(['c-meta', 'c3-hex']);
  });

  it('parses inline empty-array notation `failing_checks: []` as empty array', () => {
    const yaml = [
      'pass-01:',
      '  verdict: pass',
      '  failing_checks: []',
      '',
    ].join('\n');
    const parsed = parseAnnotations(yaml);
    expect(Array.isArray(parsed['pass-01'].failing_checks)).toBe(true);
    expect(parsed['pass-01'].failing_checks).toEqual([]);
  });
});

describe('eval-runner — computeF1 per-check (binary vs macro sensitivity)', () => {
  it('binary_f1=1.0 hides single-check drift; macro_f1 catches it', () => {
    // Szenario: Runner erkennt c-meta korrekt, aber verschweigt c11-nbsp
    // auf einem Fixture, das BEIDE Checks als fail annotiert hat. Binary
    // verdict bleibt fail → binary_f1=1.0. Aber c11-nbsp wird als FN gewertet
    // → per-check-F1 für c11-nbsp < 1 → macro_f1 < 1.
    const rows = [
      { fixture: 'a', expected: { verdict: 'pass', failing_checks: [] },
        actual: { failing_checks: [] } },
      { fixture: 'b', expected: { verdict: 'fail', failing_checks: ['c-meta', 'c11-nbsp'] },
        actual: { failing_checks: ['c-meta'] } }, // c11-nbsp verschwiegen
      { fixture: 'c', expected: { verdict: 'fail', failing_checks: ['c3-hex'] },
        actual: { failing_checks: ['c3-hex'] } },
    ];
    const m = computeF1(rows);
    // Binary ist blind für Single-Check-Miss solange ein anderer Check trippt
    expect(m.binary.f1).toBe(1);
    // Macro fängt es: c11-nbsp hat recall=0 → F1=0 → Durchschnitt sinkt
    expect(m.macro.f1).toBeLessThan(1);
    expect(m.macro.per_check['c11-nbsp'].recall).toBe(0);
    expect(m.macro.per_check['c11-nbsp'].f1).toBe(0);
  });

  it('both metrics = 1.0 when runner detects every check per fixture', () => {
    const rows = [
      { fixture: 'a', expected: { verdict: 'pass', failing_checks: [] },
        actual: { failing_checks: [] } },
      { fixture: 'b', expected: { verdict: 'fail', failing_checks: ['c-meta', 'c7-related'] },
        actual: { failing_checks: ['c-meta', 'c7-related'] } },
      { fixture: 'c', expected: { verdict: 'fail', failing_checks: ['c11-nbsp'] },
        actual: { failing_checks: ['c11-nbsp'] } },
    ];
    const m = computeF1(rows);
    expect(m.binary.f1).toBe(1);
    expect(m.micro.f1).toBe(1);
    expect(m.macro.f1).toBe(1);
  });
});

describe('eval-runner — exports', () => {
  it('exposes all six check IDs', () => {
    expect(CHECK_IDS).toEqual(['c-meta', 'c3-hex', 'c4-arb-px', 'c7-related', 'c8-words', 'c11-nbsp']);
  });
});
