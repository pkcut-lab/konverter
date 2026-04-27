import { describe, it, expect } from 'vitest';
import {
  computeUsPaycheck,
  computeUkPaycheck,
} from '../../../../src/lib/tools/en/gross-net-runtime';
import {
  US_2025_BRACKETS,
  US_2025_STD_DEDUCTION,
  UK_2025_PERSONAL_ALLOWANCE,
} from '../../../../src/lib/tools/en/gross-net-data';

describe('gross-net runtime — US paycheck', () => {
  it('zero gross: no tax, net == gross == 0', () => {
    const r = computeUsPaycheck(0, 'single');
    expect(r.totalTax).toBe(0);
    expect(r.netAnnual).toBe(0);
  });

  it('single $50,000: standard deduction → taxable $35,000', () => {
    const r = computeUsPaycheck(50000, 'single');
    expect(r.standardDeduction).toBe(15000);
    expect(r.taxableIncome).toBe(35000);
  });

  it('single $50,000: federal income tax matches manual bracket calc', () => {
    // 10% on first $11,925 = $1,192.50
    // 12% on $11,925 → $35,000 = 12% × $23,075 = $2,769
    // total = $3,961.50
    const r = computeUsPaycheck(50000, 'single');
    expect(r.federalIncomeTax).toBeCloseTo(3961.5, 2);
  });

  it('single $50,000: Social Security $3,100 (6.2% × 50k)', () => {
    const r = computeUsPaycheck(50000, 'single');
    expect(r.socialSecurityTax).toBeCloseTo(3100, 2);
  });

  it('single $50,000: Medicare $725 (1.45% × 50k)', () => {
    const r = computeUsPaycheck(50000, 'single');
    expect(r.medicareTax).toBeCloseTo(725, 2);
  });

  it('single $50,000: no Additional Medicare (under $200k threshold)', () => {
    const r = computeUsPaycheck(50000, 'single');
    expect(r.additionalMedicareTax).toBe(0);
  });

  it('single $250,000: triggers Additional Medicare on $50k above threshold', () => {
    const r = computeUsPaycheck(250000, 'single');
    // 0.9% × ($250,000 − $200,000) = $450
    expect(r.additionalMedicareTax).toBeCloseTo(450, 2);
  });

  it('single $300,000: SS tax capped at wage base $176,100', () => {
    const r = computeUsPaycheck(300000, 'single');
    // 6.2% × $176,100 = $10,918.20
    expect(r.socialSecurityTax).toBeCloseTo(10918.2, 1);
  });

  it('single $50,000: marginal bracket is 12%', () => {
    const r = computeUsPaycheck(50000, 'single');
    expect(r.marginalBracket).toBe(0.12);
  });

  it('mfj $200,000: standard deduction $30,000, top bracket 22%', () => {
    const r = computeUsPaycheck(200000, 'mfj');
    expect(r.standardDeduction).toBe(30000);
    expect(r.marginalBracket).toBe(0.22);
  });

  it('hoh $50,000: standard deduction $22,500', () => {
    const r = computeUsPaycheck(50000, 'hoh');
    expect(r.standardDeduction).toBe(22500);
  });

  it('throws on negative gross', () => {
    expect(() => computeUsPaycheck(-1, 'single')).toThrow();
  });

  it('throws on NaN gross', () => {
    expect(() => computeUsPaycheck(NaN, 'single')).toThrow();
  });
});

describe('gross-net runtime — UK paycheck', () => {
  it('zero gross: no tax, no NI', () => {
    const r = computeUkPaycheck(0);
    expect(r.totalTax).toBe(0);
    expect(r.netAnnual).toBe(0);
  });

  it('£12,570 (= Personal Allowance): zero income tax, zero NI', () => {
    const r = computeUkPaycheck(12570);
    expect(r.incomeTax).toBe(0);
    expect(r.nationalInsurance).toBe(0);
  });

  it('£25,000: basic-rate income tax + Class-1 NI', () => {
    const r = computeUkPaycheck(25000);
    // PA = 12,570; taxable = 12,430
    // Income tax: 20% × 12,430 = 2,486
    expect(r.taxableIncome).toBe(12430);
    expect(r.incomeTax).toBeCloseTo(2486, 1);
    // NI: 8% × (25,000 − 12,570) = 8% × 12,430 = 994.40
    expect(r.nationalInsurance).toBeCloseTo(994.4, 1);
  });

  it('£60,000: enters higher-rate band', () => {
    const r = computeUkPaycheck(60000);
    // PA = 12,570; taxable = 47,430
    // 20% × 37,700 = 7,540
    // 40% × (47,430 − 37,700) = 40% × 9,730 = 3,892
    // total = 11,432
    expect(r.incomeTax).toBeCloseTo(11432, 1);
    expect(r.marginalBracket).toBe(0.40);
  });

  it('£100,000: PA still full (taper starts ABOVE 100k)', () => {
    const r = computeUkPaycheck(100000);
    expect(r.personalAllowance).toBe(UK_2025_PERSONAL_ALLOWANCE);
  });

  it('£110,000: PA tapered by half of (110k − 100k) = 5,000', () => {
    const r = computeUkPaycheck(110000);
    expect(r.personalAllowance).toBe(UK_2025_PERSONAL_ALLOWANCE - 5000);
  });

  it('£125,140: PA fully eroded to 0', () => {
    const r = computeUkPaycheck(125140);
    expect(r.personalAllowance).toBe(0);
  });

  it('£200,000: enters additional-rate 45% band', () => {
    const r = computeUkPaycheck(200000);
    expect(r.marginalBracket).toBe(0.45);
    expect(r.personalAllowance).toBe(0);
  });

  it('NI: above UEL applies 2% on excess', () => {
    const r = computeUkPaycheck(100000);
    // PT-to-UEL: 8% × (50,270 − 12,570) = 8% × 37,700 = 3,016
    // Above UEL: 2% × (100,000 − 50,270) = 2% × 49,730 = 994.60
    // Total NI = 4,010.60
    expect(r.nationalInsurance).toBeCloseTo(4010.6, 1);
  });

  it('throws on negative gross', () => {
    expect(() => computeUkPaycheck(-1)).toThrow();
  });
});

describe('gross-net data — sanity', () => {
  it('US single brackets are in ascending order', () => {
    const b = US_2025_BRACKETS.single;
    for (let i = 1; i < b.length; i++) {
      expect(b[i]!.min).toBeGreaterThan(b[i - 1]!.min);
    }
  });

  it('US single 7-band schedule (10/12/22/24/32/35/37%)', () => {
    expect(US_2025_BRACKETS.single.map((x) => x.rate)).toEqual([
      0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37,
    ]);
  });

  it('US standard deduction 15k single, 30k mfj, 22.5k hoh', () => {
    expect(US_2025_STD_DEDUCTION.single).toBe(15000);
    expect(US_2025_STD_DEDUCTION.mfj).toBe(30000);
    expect(US_2025_STD_DEDUCTION.hoh).toBe(22500);
  });
});
