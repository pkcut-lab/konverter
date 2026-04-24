import { describe, it, expect } from 'vitest';
import {
  zinsrechner,
  parseDE,
  formatEuro,
  formatProzent,
  computeZins,
} from '../../../src/lib/tools/zinsrechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

describe('zinsrechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(zinsrechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(zinsrechner.id).toBe('interest-calculator');
    expect(zinsrechner.type).toBe('formatter');
    expect(zinsrechner.categoryId).toBe('finance');
    expect(zinsrechner.mode).toBe('custom');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...zinsrechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseDE — DE/EN decimal normalization
// ---------------------------------------------------------------------------

describe('parseDE', () => {
  it('parses integer string', () => expect(parseDE('10000')).toBe(10000));
  it('parses German decimal comma', () => expect(parseDE('3,5')).toBeCloseTo(3.5));
  it('parses English decimal dot', () => expect(parseDE('3.5')).toBeCloseTo(3.5));
  it('strips German thousands separator', () => expect(parseDE('10.000,50')).toBeCloseTo(10000.5));
  it('strips English thousands separator', () => expect(parseDE('10,000.50')).toBeCloseTo(10000.5));
  it('returns NaN for empty string', () => expect(parseDE('')).toBeNaN());
  it('returns NaN for non-numeric', () => expect(parseDE('abc')).toBeNaN());
  it('parses zero', () => expect(parseDE('0')).toBe(0));
  it('strips whitespace', () => expect(parseDE('  500  ')).toBe(500));
  it('parses negative zero-point (e.g. negative interest)', () =>
    expect(parseDE('-0,5')).toBeCloseTo(-0.5));
});

// ---------------------------------------------------------------------------
// formatEuro
// ---------------------------------------------------------------------------

describe('formatEuro', () => {
  it('formats 13439.16 with thousands dot', () =>
    expect(formatEuro(13439.16)).toBe('13.439,16'));
  it('formats 0 → "0,00"', () => expect(formatEuro(0)).toBe('0,00'));
  it('returns empty string for NaN', () => expect(formatEuro(NaN)).toBe(''));
  it('returns empty string for Infinity', () => expect(formatEuro(Infinity)).toBe(''));
});

// ---------------------------------------------------------------------------
// formatProzent
// ---------------------------------------------------------------------------

describe('formatProzent', () => {
  it('formats 3 with 2 decimals → "3,00"', () => expect(formatProzent(3, 2)).toBe('3,00'));
  it('formats 4.39 with 2 decimals → "4,39"', () => expect(formatProzent(4.39, 2)).toBe('4,39'));
  it('returns empty string for NaN', () => expect(formatProzent(NaN)).toBe(''));
});

// ---------------------------------------------------------------------------
// computeZins — Zinseszins (Boundary values from Dossier §8)
// ---------------------------------------------------------------------------

describe('computeZins — Boundary: K0=0', () => {
  const r = computeZins(0, 5, 10);
  it('kn = 0', () => expect(r.kn).toBe(0));
  it('zinsen = 0', () => expect(r.zinsen).toBe(0));
  it('knNetto = 0', () => expect(r.knNetto).toBe(0));
});

describe('computeZins — Boundary: Zinssatz=0', () => {
  const r = computeZins(10000, 0, 10);
  it('kn = K0 (no growth)', () => expect(r.kn).toBe(10000));
  it('zinsen = 0', () => expect(r.zinsen).toBe(0));
  it('steuer = 0', () => expect(r.steuer).toBe(0));
});

describe('computeZins — Boundary: K0=1, p=100, n=1', () => {
  const r = computeZins(1, 100, 1);
  it('kn = 2', () => expect(r.kn).toBe(2));
  it('zinsen = 1', () => expect(r.zinsen).toBe(1));
});

describe('computeZins — Classic example: 10.000 € × 3% × 10 Jahre', () => {
  // Expected: Kn = 10000 × 1.03^10 ≈ 13.439,16
  const r = computeZins(10000, 3, 10);
  it('kn ≈ 13.439,16', () => expect(r.kn).toBeCloseTo(13439.16, 0));
  it('zinsen ≈ 3.439,16', () => expect(r.zinsen).toBeCloseTo(3439.16, 0));
});

// ---------------------------------------------------------------------------
// computeZins — Abgeltungssteuer (Dossier §1)
// ---------------------------------------------------------------------------

describe('computeZins — Steuer: Zinsen unterhalb Freibetrag', () => {
  // 500 € Zinsen < 1000 € Freibetrag → Steuer = 0
  const r = computeZins(10000, 5, 1, 26.375, 1000);
  it('zinsen ≈ 500', () => expect(r.zinsen).toBeCloseTo(500, 0));
  it('steuer = 0 (unter Freibetrag)', () => expect(r.steuer).toBe(0));
  it('zinsenNetto = zinsen (kein Abzug)', () => expect(r.zinsenNetto).toBe(r.zinsen));
});

describe('computeZins — Steuer: Zinsen über Freibetrag', () => {
  // 3.439 € Zinsen - 1.000 € Freibetrag = 2.439 € × 26,375 % ≈ 643,64 €
  const r = computeZins(10000, 3, 10, 26.375, 1000);
  it('steuer > 0', () => expect(r.steuer).toBeGreaterThan(0));
  it('knNetto < kn', () => expect(r.knNetto).toBeLessThan(r.kn));
  it('zinsenNetto = zinsen - steuer', () =>
    expect(r.zinsenNetto).toBeCloseTo(r.zinsen - r.steuer, 1));
});

// ---------------------------------------------------------------------------
// computeZins — Realrendite via Fisher (Dossier §1 + §4 User-Pain)
// ---------------------------------------------------------------------------

describe('computeZins — Fisher Realrendite', () => {
  // 7 % nominal, 2,5 % Inflation → korrekt: (1,07/1,025) - 1 ≈ 4,39 %
  // naive Subtraktion 7 - 2,5 = 4,5 % ist FALSCH (User-Pain Dossier §4)
  const r = computeZins(10000, 7, 1, 26.375, 1000, 2.5);
  it('realrendite ≈ 4,39 % (Fisher, nicht 4,5 %)', () =>
    expect(r.realrendite).toBeCloseTo(4.39, 1));
  it('realrendite < nominal - inflation (kein naiver Abzug)', () =>
    expect(r.realrendite).toBeLessThan(7 - 2.5));
});

describe('computeZins — knReal < kn (Inflation reduziert Kaufkraft)', () => {
  const r = computeZins(10000, 3, 10, 26.375, 1000, 2.5);
  it('knReal < kn', () => expect(r.knReal).toBeLessThan(r.kn));
});

// ---------------------------------------------------------------------------
// computeZins — Negative Zinssätze (Tagesgeld 2020–2022, Dossier §8)
// ---------------------------------------------------------------------------

describe('computeZins — Negativer Zinssatz (-0.5 %)', () => {
  const r = computeZins(10000, -0.5, 2);
  it('kn < K0 (Kapitalverlust)', () => expect(r.kn).toBeLessThan(10000));
  it('zinsen < 0', () => expect(r.zinsen).toBeLessThan(0));
});

// ---------------------------------------------------------------------------
// computeZins — Laufzeit 100 Jahre (kein Overflow, Dossier §8)
// ---------------------------------------------------------------------------

describe('computeZins — Laufzeit 100 Jahre', () => {
  const r = computeZins(1000, 3, 100);
  it('kn is finite (no IEEE 754 overflow)', () => expect(Number.isFinite(r.kn)).toBe(true));
  it('kn > 0', () => expect(r.kn).toBeGreaterThan(0));
});

// ---------------------------------------------------------------------------
// Formatter (fallback text output)
// ---------------------------------------------------------------------------

describe('zinsrechner.format — valid input', () => {
  const out = zinsrechner.format('10000;3;10');
  it('includes Brutto-Endkapital line', () => expect(out).toContain('Brutto-Endkapital'));
  it('includes Netto-Endkapital line', () => expect(out).toContain('Netto-Endkapital'));
  it('includes Real-Endkapital line', () => expect(out).toContain('Real-Endkapital'));
  it('includes Realrendite line', () => expect(out).toContain('Realrendite'));
});

describe('zinsrechner.format — invalid input', () => {
  it('returns error for negative Kapital', () =>
    expect(zinsrechner.format('-1;3;10')).toContain('Fehler'));
  it('returns error for Zinssatz > 100', () =>
    expect(zinsrechner.format('10000;150;10')).toContain('Fehler'));
  it('returns error for Laufzeit 0', () =>
    expect(zinsrechner.format('10000;3;0')).toContain('Fehler'));
  it('returns error for Laufzeit > 100', () =>
    expect(zinsrechner.format('10000;3;101')).toContain('Fehler'));
});
