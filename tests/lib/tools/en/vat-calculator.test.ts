import { describe, it, expect } from 'vitest';
import { computeSalesTax } from '../../../../src/lib/tools/en/vat-calculator-runtime';
import {
  US_STATE_RATES,
  UK_VAT_RATES,
} from '../../../../src/lib/tools/en/vat-calculator-data';

describe('vat-calculator runtime — computeSalesTax', () => {
  it('add mode: $100 at 7.25% (CA) → tax $7.25, gross $107.25', () => {
    const r = computeSalesTax(100, 7.25, 'add');
    expect(r.netAmount).toBe(100);
    expect(r.taxAmount).toBe(7.25);
    expect(r.grossAmount).toBe(107.25);
    expect(r.appliedRate).toBe(7.25);
  });

  it('add mode: £200 at 20% (UK standard) → VAT £40, gross £240', () => {
    const r = computeSalesTax(200, 20, 'add');
    expect(r.netAmount).toBe(200);
    expect(r.taxAmount).toBe(40);
    expect(r.grossAmount).toBe(240);
  });

  it('add mode: zero rate → tax 0, gross == net', () => {
    const r = computeSalesTax(50, 0, 'add');
    expect(r.taxAmount).toBe(0);
    expect(r.netAmount).toBe(50);
    expect(r.grossAmount).toBe(50);
  });

  it('extract mode: gross £120 at 20% → net £100, VAT £20', () => {
    const r = computeSalesTax(120, 20, 'extract');
    expect(r.grossAmount).toBe(120);
    expect(r.netAmount).toBe(100);
    expect(r.taxAmount).toBe(20);
  });

  it('extract mode: gross $107.25 at 7.25% → net $100, tax $7.25', () => {
    const r = computeSalesTax(107.25, 7.25, 'extract');
    expect(r.grossAmount).toBe(107.25);
    expect(r.netAmount).toBe(100);
    expect(r.taxAmount).toBe(7.25);
  });

  it('extract mode: rounding within 0.02 of net + tax = gross', () => {
    const r = computeSalesTax(123.45, 6.875, 'extract');
    expect(Math.abs(r.netAmount + r.taxAmount - r.grossAmount)).toBeLessThan(0.02);
  });

  it('throws on negative amount', () => {
    expect(() => computeSalesTax(-1, 20, 'add')).toThrow();
  });

  it('throws on negative rate', () => {
    expect(() => computeSalesTax(100, -5, 'add')).toThrow();
  });

  it('throws on NaN amount', () => {
    expect(() => computeSalesTax(NaN, 20, 'add')).toThrow();
  });
});

describe('vat-calculator data — US state rates', () => {
  it('contains 50 states + DC = 51 entries', () => {
    expect(US_STATE_RATES).toHaveLength(51);
  });

  it('has 5 states with zero state-level rate (AK, DE, MT, NH, OR)', () => {
    const zeroes = US_STATE_RATES.filter((s) => s.rate === 0);
    expect(zeroes.map((s) => s.code).sort()).toEqual(['AK', 'DE', 'MT', 'NH', 'OR']);
  });

  it('California rate is 7.25%', () => {
    expect(US_STATE_RATES.find((s) => s.code === 'CA')?.rate).toBe(7.25);
  });

  it('New York state rate is 4% (NOT NYC combined)', () => {
    expect(US_STATE_RATES.find((s) => s.code === 'NY')?.rate).toBe(4.0);
  });

  it('all rates are non-negative percent under 12 (sanity guard)', () => {
    for (const s of US_STATE_RATES) {
      expect(s.rate).toBeGreaterThanOrEqual(0);
      expect(s.rate).toBeLessThan(12);
    }
  });

  it('every entry has a 2-letter code, name, and numeric rate', () => {
    for (const s of US_STATE_RATES) {
      expect(s.code).toMatch(/^[A-Z]{2}$/);
      expect(s.name.length).toBeGreaterThan(0);
      expect(typeof s.rate).toBe('number');
    }
  });
});

describe('vat-calculator data — UK VAT bands', () => {
  it('contains the four official bands (standard, reduced, zero, exempt)', () => {
    const bands = UK_VAT_RATES.map((b) => b.band).sort();
    expect(bands).toEqual(['exempt', 'reduced', 'standard', 'zero']);
  });

  it('standard rate is 20%', () => {
    expect(UK_VAT_RATES.find((b) => b.band === 'standard')?.rate).toBe(20);
  });

  it('reduced rate is 5%', () => {
    expect(UK_VAT_RATES.find((b) => b.band === 'reduced')?.rate).toBe(5);
  });

  it('zero rate is 0%', () => {
    expect(UK_VAT_RATES.find((b) => b.band === 'zero')?.rate).toBe(0);
  });
});
