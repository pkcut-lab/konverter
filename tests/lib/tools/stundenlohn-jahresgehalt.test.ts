import { describe, it, expect } from 'vitest';
import {
  stundenlohnJahresgehalt,
  parseWage,
  formatEuroFull,
  computeSchnell,
  computeExakt,
  BUNDESLAENDER,
  MINDESTLOHN_2026,
  MINDESTLOHN_2027,
} from '../../../src/lib/tools/stundenlohn-jahresgehalt';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('stundenlohnJahresgehalt config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(stundenlohnJahresgehalt);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(stundenlohnJahresgehalt.id).toBe('hourly-to-annual');
    expect(stundenlohnJahresgehalt.type).toBe('formatter');
    expect(stundenlohnJahresgehalt.categoryId).toBe('finance');
    expect(stundenlohnJahresgehalt.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...stundenlohnJahresgehalt, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('parseWage', () => {
  it('parses integer', () => expect(parseWage('15')).toBe(15));
  it('parses German decimal comma', () => expect(parseWage('15,50')).toBeCloseTo(15.5));
  it('parses English decimal dot', () => expect(parseWage('15.50')).toBeCloseTo(15.5));
  it('strips whitespace', () => expect(parseWage('  20  ')).toBe(20));
  it('returns null for empty string', () => expect(parseWage('')).toBeNull());
  it('returns null for negative', () => expect(parseWage('-5')).toBeNull());
  it('returns null for NaN', () => expect(parseWage('abc')).toBeNull());
  it('returns null for > 99999', () => expect(parseWage('100000')).toBeNull());
  it('accepts boundary max 99999', () => expect(parseWage('99999')).toBe(99999));
  it('accepts 0.01', () => expect(parseWage('0,01')).toBeCloseTo(0.01));
});

describe('formatEuroFull', () => {
  it('formats 50000 as German locale', () => expect(formatEuroFull(50000)).toBe('50.000,00'));
  it('formats 15.5 correctly', () => expect(formatEuroFull(15.5)).toBe('15,50'));
  it('formats 0', () => expect(formatEuroFull(0)).toBe('0,00'));
  it('returns empty string for NaN', () => expect(formatEuroFull(NaN)).toBe(''));
  it('returns empty string for Infinity', () => expect(formatEuroFull(Infinity)).toBe(''));
});

describe('computeSchnell — Stundenlohn → periods', () => {
  // 15 €/h × 40 h/Woche × 52 Wochen = 31.200 €/Jahr
  const result = computeSchnell({ stundenlohn: 15, wochenstunden: 40 });

  it('Jahresgehalt = 31200', () => expect(result.jahresgehalt).toBeCloseTo(31200));
  it('Monatsgehalt = 31200 / 12 = 2600', () => expect(result.monatsgehalt).toBeCloseTo(2600));
  it('Wochengehalt = 15 × 40 = 600', () => expect(result.wochengehalt).toBeCloseTo(600));
  it('Tagesgehalt = 600 / 5 = 120', () => expect(result.tagesgehalt).toBeCloseTo(120));
  it('stundenlohn round-trip = 15', () => expect(result.stundenlohn).toBeCloseTo(15));
});

describe('computeSchnell — Jahresgehalt → Stundenlohn', () => {
  // 31200 / 52 / 40 = 15 €/h
  const result = computeSchnell({ jahresgehalt: 31200, wochenstunden: 40 });

  it('stundenlohn = 15', () => expect(result.stundenlohn).toBeCloseTo(15));
  it('monatsgehalt = 2600', () => expect(result.monatsgehalt).toBeCloseTo(2600));
});

describe('computeSchnell — 4-Tage-Woche 32h', () => {
  // 20 €/h × 32 h/Woche × 52 Wochen = 33.280 €/Jahr
  const result = computeSchnell({ stundenlohn: 20, wochenstunden: 32 });
  it('Jahresgehalt = 33280', () => expect(result.jahresgehalt).toBeCloseTo(33280));
});

describe('computeSchnell — Mindestlohn 2026 edge', () => {
  // 13.90 €/h × 40h × 52 = 28912 €/Jahr
  const result = computeSchnell({ stundenlohn: MINDESTLOHN_2026, wochenstunden: 40 });
  it('Jahresgehalt at Mindestlohn = 28912', () => expect(result.jahresgehalt).toBeCloseTo(28912));
});

describe('computeExakt — Stundenlohn → periods', () => {
  // 15 €/h, 40h/Woche, 30 Urlaubstage, 10 Feiertage
  // Arbeitstage = 260 - 30 - 10 = 220; Tagesstunden = 40/5 = 8h
  // Jahresgehalt = 15 × 220 × 8 = 26400
  const result = computeExakt({
    stundenlohn: 15,
    wochenstunden: 40,
    urlaubstage: 30,
    feiertage: 10,
  });

  it('Jahresgehalt = 26400', () => expect(result.jahresgehalt).toBeCloseTo(26400));
  it('Monatsgehalt = 26400 / 12 = 2200', () => expect(result.monatsgehalt).toBeCloseTo(2200));
  it('Arbeitstage = 220', () => expect(result.arbeitstage).toBe(220));
  it('stundenlohn round-trip = 15', () => expect(result.stundenlohn).toBeCloseTo(15));
});

describe('computeExakt — Jahresgehalt → Stundenlohn', () => {
  // 26400 / (220 × 8) = 15 €/h
  const result = computeExakt({
    jahresgehalt: 26400,
    wochenstunden: 40,
    urlaubstage: 30,
    feiertage: 10,
  });

  it('stundenlohn = 15', () => expect(result.stundenlohn).toBeCloseTo(15));
  it('arbeitstage = 220', () => expect(result.arbeitstage).toBe(220));
});

describe('computeExakt — 3 Tage Woche', () => {
  // 3-Tage-Woche: 24h/Woche, Tagesstunden = 24/3? No — Tagesstunden = wochenstunden/5 even for partial weeks
  // Actually for 3-day week: worker works 3 days × 8h = 24h. But the "days per week" in Arbeitstage model is always 5.
  // Let's test: 40h/5 = 8h; 32h/5 = 6.4h; 24h/5 = 4.8h (part-time standard)
  const result = computeExakt({ stundenlohn: 10, wochenstunden: 20, urlaubstage: 20, feiertage: 9 });
  it('arbeitstage = 260 - 20 - 9 = 231', () => expect(result.arbeitstage).toBe(231));
  it('tagesstunden = 4', () => expect(result.tagesstunden).toBeCloseTo(4));
});

describe('computeExakt — zero edge', () => {
  const result = computeExakt({ stundenlohn: 0, wochenstunden: 40, urlaubstage: 0, feiertage: 0 });
  it('jahresgehalt = 0', () => expect(result.jahresgehalt).toBe(0));
});

describe('BUNDESLAENDER', () => {
  it('has 16 entries', () => expect(BUNDESLAENDER.length).toBe(16));
  it('Bayern has 13 holidays', () => {
    const by = BUNDESLAENDER.find((b) => b.id === 'BY');
    expect(by?.feiertage).toBe(13);
  });
  it('all entries have id, label, feiertage', () => {
    for (const b of BUNDESLAENDER) {
      expect(b.id).toBeTruthy();
      expect(b.label).toBeTruthy();
      expect(typeof b.feiertage).toBe('number');
      expect(b.feiertage).toBeGreaterThanOrEqual(9);
      expect(b.feiertage).toBeLessThanOrEqual(14);
    }
  });
});

describe('constants', () => {
  it('MINDESTLOHN_2026 = 13.90', () => expect(MINDESTLOHN_2026).toBeCloseTo(13.9));
  it('MINDESTLOHN_2027 = 14.60', () => expect(MINDESTLOHN_2027).toBeCloseTo(14.6));
});
