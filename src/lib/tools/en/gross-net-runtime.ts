/**
 * Pure compute layer for the EN region-aware gross-to-net (paycheck)
 * calculator. No DOM, no I18n.
 */
import {
  US_2025_BRACKETS,
  US_2025_STD_DEDUCTION,
  US_2025_FICA,
  UK_2025_PERSONAL_ALLOWANCE,
  UK_2025_PA_TAPER_START,
  UK_2025_PA_TAPER_FULL,
  UK_2025_INCOME_TAX,
  UK_2025_NI,
  type UsFilingStatus,
} from './gross-net-data';

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── United States ─────────────────────────────────────────────────────────

export interface UsResult {
  grossAnnual: number;
  filingStatus: UsFilingStatus;
  standardDeduction: number;
  taxableIncome: number;
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  ficaTotal: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number; // total tax / gross
  marginalBracket: number; // top bracket the user lands in (decimal)
}

/**
 * Compute federal income tax owed against a stack of marginal brackets.
 * Brackets are sorted ascending by `min` and the last bracket has no
 * upper bound.
 */
function computeFederalTax(
  taxableIncome: number,
  brackets: typeof US_2025_BRACKETS.single,
): { tax: number; topRate: number } {
  if (taxableIncome <= 0) return { tax: 0, topRate: brackets[0]!.rate };
  let tax = 0;
  let topRate = brackets[0]!.rate;
  for (let i = 0; i < brackets.length; i++) {
    const cur = brackets[i]!;
    const next = brackets[i + 1];
    const upper = next ? next.min : Infinity;
    if (taxableIncome <= cur.min) break;
    const slice = Math.min(taxableIncome, upper) - cur.min;
    tax += slice * cur.rate;
    topRate = cur.rate;
    if (taxableIncome <= upper) break;
  }
  return { tax, topRate };
}

export function computeUsPaycheck(
  grossAnnual: number,
  filingStatus: UsFilingStatus,
): UsResult {
  if (!Number.isFinite(grossAnnual) || grossAnnual < 0) {
    throw new Error('grossAnnual must be a non-negative number');
  }
  const stdDed = US_2025_STD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, grossAnnual - stdDed);

  const { tax: federalIncomeTax, topRate: marginalBracket } = computeFederalTax(
    taxableIncome,
    US_2025_BRACKETS[filingStatus],
  );

  // Social Security only on wage base.
  const ssWageCount = Math.min(grossAnnual, US_2025_FICA.socialSecurityWageBase);
  const socialSecurityTax = ssWageCount * US_2025_FICA.socialSecurityRate;

  // Medicare on all wages.
  const medicareTax = grossAnnual * US_2025_FICA.medicareRate;

  // Additional Medicare on wages above filing-status threshold.
  const addlThreshold =
    US_2025_FICA.additionalMedicareThreshold[filingStatus];
  const addlBase = Math.max(0, grossAnnual - addlThreshold);
  const additionalMedicareTax =
    addlBase * US_2025_FICA.additionalMedicareRate;

  const ficaTotal = socialSecurityTax + medicareTax + additionalMedicareTax;
  const totalTax = federalIncomeTax + ficaTotal;
  const netAnnual = grossAnnual - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveRate = grossAnnual > 0 ? totalTax / grossAnnual : 0;

  return {
    grossAnnual: r2(grossAnnual),
    filingStatus,
    standardDeduction: r2(stdDed),
    taxableIncome: r2(taxableIncome),
    federalIncomeTax: r2(federalIncomeTax),
    socialSecurityTax: r2(socialSecurityTax),
    medicareTax: r2(medicareTax),
    additionalMedicareTax: r2(additionalMedicareTax),
    ficaTotal: r2(ficaTotal),
    totalTax: r2(totalTax),
    netAnnual: r2(netAnnual),
    netMonthly: r2(netMonthly),
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    marginalBracket,
  };
}

// ── United Kingdom ────────────────────────────────────────────────────────

export interface UkResult {
  grossAnnual: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
  marginalBracket: number;
}

function ukPersonalAllowance(gross: number): number {
  if (gross <= UK_2025_PA_TAPER_START) return UK_2025_PERSONAL_ALLOWANCE;
  if (gross >= UK_2025_PA_TAPER_FULL) return 0;
  const reduction = (gross - UK_2025_PA_TAPER_START) / 2;
  return Math.max(0, UK_2025_PERSONAL_ALLOWANCE - reduction);
}

function computeUkIncomeTax(taxable: number): { tax: number; topRate: number } {
  if (taxable <= 0) return { tax: 0, topRate: UK_2025_INCOME_TAX[0]!.rate };
  let tax = 0;
  let topRate = UK_2025_INCOME_TAX[0]!.rate;
  for (let i = 0; i < UK_2025_INCOME_TAX.length; i++) {
    const cur = UK_2025_INCOME_TAX[i]!;
    const next = UK_2025_INCOME_TAX[i + 1];
    const upper = next ? next.min : Infinity;
    if (taxable <= cur.min) break;
    const slice = Math.min(taxable, upper) - cur.min;
    tax += slice * cur.rate;
    topRate = cur.rate;
    if (taxable <= upper) break;
  }
  return { tax, topRate };
}

function computeUkNi(gross: number): number {
  if (gross <= UK_2025_NI.primaryThreshold) return 0;
  const ptToUelBase = Math.max(
    0,
    Math.min(gross, UK_2025_NI.upperEarningsLimit) - UK_2025_NI.primaryThreshold,
  );
  const aboveUelBase = Math.max(0, gross - UK_2025_NI.upperEarningsLimit);
  return ptToUelBase * UK_2025_NI.ratePT_to_UEL + aboveUelBase * UK_2025_NI.rateAboveUEL;
}

export function computeUkPaycheck(grossAnnual: number): UkResult {
  if (!Number.isFinite(grossAnnual) || grossAnnual < 0) {
    throw new Error('grossAnnual must be a non-negative number');
  }
  const personalAllowance = ukPersonalAllowance(grossAnnual);
  const taxableIncome = Math.max(0, grossAnnual - personalAllowance);
  const { tax: incomeTax, topRate: marginalBracket } = computeUkIncomeTax(taxableIncome);
  const nationalInsurance = computeUkNi(grossAnnual);
  const totalTax = incomeTax + nationalInsurance;
  const netAnnual = grossAnnual - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveRate = grossAnnual > 0 ? totalTax / grossAnnual : 0;

  return {
    grossAnnual: r2(grossAnnual),
    personalAllowance: r2(personalAllowance),
    taxableIncome: r2(taxableIncome),
    incomeTax: r2(incomeTax),
    nationalInsurance: r2(nationalInsurance),
    totalTax: r2(totalTax),
    netAnnual: r2(netAnnual),
    netMonthly: r2(netMonthly),
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    marginalBracket,
  };
}
