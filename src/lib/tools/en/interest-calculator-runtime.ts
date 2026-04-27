/**
 * Pure compute layer for the EN region-aware interest calculator.
 * No DOM, no I18n. Implements both simple and compound interest with
 * region-specific tax-treatment toggles (US: federal-income-tax-on-
 * interest, UK: ISA tax-free wrapper).
 */

export type CompoundFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'daily';

export type InterestKind = 'simple' | 'compound';

const FREQ_TO_PERIODS_PER_YEAR: Record<CompoundFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function r4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export interface InterestResult {
  /** Final balance after the term (gross of tax). */
  finalAmount: number;
  /** Interest earned (or paid) over the term, gross. */
  totalInterest: number;
  /** Tax owed on the interest (US: federal income tax at marginal rate;
   *  UK: 0 if ISA, otherwise income tax band; positive = paid). */
  taxOnInterest: number;
  /** Interest after tax. */
  netInterest: number;
  /** Final balance after tax. */
  netFinalAmount: number;
  /** Effective Annual Rate / APY — the rate that, compounded annually,
   *  produces the same final amount in 1 year. */
  apy: number;
  /** Daily interest accrual at t=0 (useful for loan / per-day cost). */
  dailyAccrualAtT0: number;
}

export interface InterestParams {
  principal: number;
  annualRatePct: number;
  years: number;
  kind: InterestKind;
  compoundFrequency: CompoundFrequency;
  /**
   * Tax rate applied to interest earned (only relevant for savings, not
   * loans). 0 = tax-free (ISA / Roth). For US: pass user's marginal
   * federal rate (10/12/22/24/32/35/37). For UK non-ISA: 0/20/40/45.
   */
  taxRatePct?: number;
}

/**
 * Compute interest for a given principal/rate/term.
 *
 * Simple interest: I = P × r × t
 * Compound interest: A = P × (1 + r/n)^(n×t)  where n = compounds/year
 *
 * APY (Annual Percentage Yield) for compound = (1 + r/n)^n − 1
 * APY for simple = r exactly (no compounding, so the AER equals nominal).
 */
export function computeInterest(p: InterestParams): InterestResult {
  const { principal, annualRatePct, years, kind, compoundFrequency } = p;

  if (!Number.isFinite(principal) || principal < 0) {
    throw new Error('principal must be a non-negative finite number');
  }
  if (!Number.isFinite(annualRatePct)) {
    throw new Error('annualRatePct must be a finite number');
  }
  if (!Number.isFinite(years) || years < 0) {
    throw new Error('years must be a non-negative finite number');
  }

  const r = annualRatePct / 100;
  const n = FREQ_TO_PERIODS_PER_YEAR[compoundFrequency];

  let finalAmount: number;
  let apy: number;

  if (kind === 'simple') {
    finalAmount = principal * (1 + r * years);
    apy = r;
  } else {
    finalAmount = principal * Math.pow(1 + r / n, n * years);
    apy = Math.pow(1 + r / n, n) - 1;
  }

  const totalInterest = finalAmount - principal;

  const taxRate = (p.taxRatePct ?? 0) / 100;
  const taxOnInterest = totalInterest > 0 ? totalInterest * taxRate : 0;
  const netInterest = totalInterest - taxOnInterest;
  const netFinalAmount = principal + netInterest;

  // Daily accrual at t=0: derivative of compound formula at t=0 is P × r,
  // for simple it's also P × r → divide by 365 for daily.
  const dailyAccrualAtT0 = (principal * r) / 365;

  return {
    finalAmount: r2(finalAmount),
    totalInterest: r2(totalInterest),
    taxOnInterest: r2(taxOnInterest),
    netInterest: r2(netInterest),
    netFinalAmount: r2(netFinalAmount),
    apy: r4(apy * 100),
    dailyAccrualAtT0: Math.round(dailyAccrualAtT0 * 10000) / 10000,
  };
}
