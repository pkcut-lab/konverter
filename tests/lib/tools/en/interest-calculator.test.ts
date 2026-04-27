import { describe, it, expect } from 'vitest';
import { computeInterest } from '../../../../src/lib/tools/en/interest-calculator-runtime';

describe('interest-calculator runtime — simple interest', () => {
  it('I = P × r × t', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 5,
      years: 10,
      kind: 'simple',
      compoundFrequency: 'annually',
    });
    expect(r.totalInterest).toBeCloseTo(500, 2);
    expect(r.finalAmount).toBeCloseTo(1500, 2);
  });

  it('zero rate → zero interest', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 0,
      years: 10,
      kind: 'simple',
      compoundFrequency: 'annually',
    });
    expect(r.totalInterest).toBe(0);
    expect(r.finalAmount).toBe(1000);
  });

  it('zero years → zero interest', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 5,
      years: 0,
      kind: 'simple',
      compoundFrequency: 'annually',
    });
    expect(r.totalInterest).toBe(0);
    expect(r.finalAmount).toBe(1000);
  });

  it('APY for simple interest equals nominal rate', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 7,
      years: 10,
      kind: 'simple',
      compoundFrequency: 'annually',
    });
    // APY field is in percent
    expect(r.apy).toBeCloseTo(7, 4);
  });
});

describe('interest-calculator runtime — compound interest', () => {
  it('annual compounding: A = P × (1 + r)^t', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 5,
      years: 10,
      kind: 'compound',
      compoundFrequency: 'annually',
    });
    // 1000 × 1.05^10 = 1628.894627
    expect(r.finalAmount).toBeCloseTo(1628.89, 2);
  });

  it('monthly compounding produces more interest than annual at same nominal rate', () => {
    const annual = computeInterest({
      principal: 1000, annualRatePct: 5, years: 10,
      kind: 'compound', compoundFrequency: 'annually',
    });
    const monthly = computeInterest({
      principal: 1000, annualRatePct: 5, years: 10,
      kind: 'compound', compoundFrequency: 'monthly',
    });
    expect(monthly.finalAmount).toBeGreaterThan(annual.finalAmount);
  });

  it('APY for monthly 5% nominal ≈ 5.116%', () => {
    const r = computeInterest({
      principal: 1000, annualRatePct: 5, years: 1,
      kind: 'compound', compoundFrequency: 'monthly',
    });
    expect(r.apy).toBeCloseTo(5.1162, 3);
  });

  it('APY for daily 5% nominal ≈ 5.127%', () => {
    const r = computeInterest({
      principal: 1000, annualRatePct: 5, years: 1,
      kind: 'compound', compoundFrequency: 'daily',
    });
    expect(r.apy).toBeCloseTo(5.1267, 3);
  });
});

describe('interest-calculator runtime — tax handling', () => {
  it('22% federal tax on $500 interest = $110 tax, net $390', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 5,
      years: 10,
      kind: 'simple',
      compoundFrequency: 'annually',
      taxRatePct: 22,
    });
    expect(r.totalInterest).toBeCloseTo(500, 2);
    expect(r.taxOnInterest).toBeCloseTo(110, 2);
    expect(r.netInterest).toBeCloseTo(390, 2);
    expect(r.netFinalAmount).toBeCloseTo(1390, 2);
  });

  it('ISA tax-free (taxRatePct=0) → tax=0, net=gross', () => {
    const r = computeInterest({
      principal: 1000,
      annualRatePct: 5,
      years: 10,
      kind: 'compound',
      compoundFrequency: 'monthly',
      taxRatePct: 0,
    });
    expect(r.taxOnInterest).toBe(0);
    expect(r.netInterest).toBeCloseTo(r.totalInterest, 2);
    expect(r.netFinalAmount).toBeCloseTo(r.finalAmount, 2);
  });

  it('UK additional rate 45% on interest', () => {
    const r = computeInterest({
      principal: 10000,
      annualRatePct: 5,
      years: 10,
      kind: 'compound',
      compoundFrequency: 'annually',
      taxRatePct: 45,
    });
    // Gross interest ≈ 6,288.95; tax ≈ 2,830.03; net ≈ 3,458.92
    expect(r.taxOnInterest).toBeCloseTo(r.totalInterest * 0.45, 2);
  });
});

describe('interest-calculator runtime — daily accrual + edge cases', () => {
  it('daily accrual at t=0 = P × r ÷ 365', () => {
    const r = computeInterest({
      principal: 100000,
      annualRatePct: 7.5,
      years: 5,
      kind: 'compound',
      compoundFrequency: 'monthly',
    });
    // 100,000 × 0.075 / 365 ≈ 20.5479
    expect(r.dailyAccrualAtT0).toBeCloseTo(20.5479, 3);
  });

  it('throws on negative principal', () => {
    expect(() =>
      computeInterest({
        principal: -1, annualRatePct: 5, years: 1,
        kind: 'simple', compoundFrequency: 'annually',
      }),
    ).toThrow();
  });

  it('throws on negative years', () => {
    expect(() =>
      computeInterest({
        principal: 1000, annualRatePct: 5, years: -1,
        kind: 'simple', compoundFrequency: 'annually',
      }),
    ).toThrow();
  });

  it('NaN rate throws', () => {
    expect(() =>
      computeInterest({
        principal: 1000, annualRatePct: NaN, years: 10,
        kind: 'simple', compoundFrequency: 'annually',
      }),
    ).toThrow();
  });
});
