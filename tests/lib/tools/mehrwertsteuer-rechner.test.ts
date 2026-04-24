import { describe, it, expect } from 'vitest';
import {
  mehrwertsteuerRechner,
  parseDE,
  formatEuro,
  computeFromNetto,
  computeFromBrutto,
  computeFromMwst,
} from '../../../src/lib/tools/mehrwertsteuer-rechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('mehrwertsteuerRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(mehrwertsteuerRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(mehrwertsteuerRechner.id).toBe('vat-calculator');
    expect(mehrwertsteuerRechner.type).toBe('formatter');
    expect(mehrwertsteuerRechner.categoryId).toBe('finance');
    expect(mehrwertsteuerRechner.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...mehrwertsteuerRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('parseDE', () => {
  it('parses integer string', () => expect(parseDE('100')).toBe(100));
  it('parses German decimal comma', () => expect(parseDE('1,99')).toBeCloseTo(1.99));
  it('parses English decimal dot', () => expect(parseDE('1.99')).toBeCloseTo(1.99));
  it('strips German thousands separator', () => expect(parseDE('1.000,99')).toBeCloseTo(1000.99));
  it('strips English thousands separator', () => expect(parseDE('1,000.99')).toBeCloseTo(1000.99));
  it('returns NaN for empty string', () => expect(parseDE('')).toBeNaN());
  it('returns NaN for non-numeric string', () => expect(parseDE('abc')).toBeNaN());
  it('parses zero', () => expect(parseDE('0')).toBe(0));
  it('parses 0,01', () => expect(parseDE('0,01')).toBeCloseTo(0.01));
  it('strips whitespace', () => expect(parseDE('  100  ')).toBe(100));
});

describe('formatEuro', () => {
  it('formats 100 → "100,00"', () => expect(formatEuro(100)).toBe('100,00'));
  it('formats 1234.56 with thousands dot', () => expect(formatEuro(1234.56)).toBe('1.234,56'));
  it('formats 0.01 → "0,01"', () => expect(formatEuro(0.01)).toBe('0,01'));
  it('returns empty string for NaN', () => expect(formatEuro(NaN)).toBe(''));
  it('returns empty string for Infinity', () => expect(formatEuro(Infinity)).toBe(''));
});

describe('computeFromNetto — 19%', () => {
  const r = computeFromNetto(100, 19);
  it('netto = 100', () => expect(r.netto).toBe(100));
  it('brutto = 119', () => expect(r.brutto).toBe(119));
  it('mwst = 19', () => expect(r.mwst).toBe(19));
});

describe('computeFromNetto — 7%', () => {
  const r = computeFromNetto(100, 7);
  it('brutto = 107', () => expect(r.brutto).toBe(107));
  it('mwst = 7', () => expect(r.mwst).toBe(7));
});

describe('computeFromNetto — 0%', () => {
  const r = computeFromNetto(100, 0);
  it('brutto = netto when rate is 0%', () => expect(r.brutto).toBe(100));
  it('mwst = 0 when rate is 0%', () => expect(r.mwst).toBe(0));
});

describe('computeFromBrutto — 19%', () => {
  const r = computeFromBrutto(119, 19);
  it('netto = 100', () => expect(r.netto).toBe(100));
  it('mwst = 19', () => expect(r.mwst).toBe(19));
  it('brutto = 119', () => expect(r.brutto).toBe(119));
});

describe('computeFromBrutto — classical Divisor-Fehler guard', () => {
  // Brutto × 0.19 ≠ enthaltene MwSt (häufigster Fehler laut Dossier §1)
  const r = computeFromBrutto(119, 19);
  it('mwst is 19 not 22.61', () => expect(r.mwst).toBeCloseTo(19));
});

describe('computeFromMwst — 19%', () => {
  const r = computeFromMwst(19, 19);
  it('netto = 100', () => expect(r.netto).toBe(100));
  it('brutto = 119', () => expect(r.brutto).toBe(119));
});

describe('computeFromMwst — 0% edge case', () => {
  const r = computeFromMwst(10, 0);
  it('netto is NaN when rate 0%', () => expect(r.netto).toBeNaN());
  it('brutto is NaN when rate 0%', () => expect(r.brutto).toBeNaN());
  it('mwst value preserved', () => expect(r.mwst).toBe(10));
});

describe('boundary values', () => {
  it('netto 0 → all fields 0 at 19%', () => {
    const r = computeFromNetto(0, 19);
    expect(r.netto).toBe(0);
    expect(r.mwst).toBe(0);
    expect(r.brutto).toBe(0);
  });

  it('large value 99999999.99 from netto at 19%', () => {
    const r = computeFromNetto(99_999_999.99, 19);
    expect(r.brutto).toBeCloseTo(99_999_999.99 * 1.19, 0);
  });

  it('cent precision: netto 0.01 → brutto 0.01 at 0%', () => {
    const r = computeFromNetto(0.01, 0);
    expect(r.brutto).toBe(0.01);
    expect(r.mwst).toBe(0);
  });
});
