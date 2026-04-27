import type { FormatterConfig } from '../schemas';
import {
  computeUsPaycheck,
  computeUkPaycheck,
} from './gross-net-runtime';
import {
  US_2025_BRACKETS,
  US_2025_STD_DEDUCTION,
  US_2025_FICA,
  UK_2025_PERSONAL_ALLOWANCE,
  UK_2025_INCOME_TAX,
  UK_2025_NI,
  type UsFilingStatus,
} from './gross-net-data';

/**
 * gross-net-calculator (EN-region-aware) — paycheck math for US (FICA +
 * federal brackets) and UK (PAYE + NI + Personal Allowance).
 *
 * Region toggle inside the EN page; DE keeps its own §32a Lohnsteuer +
 * Sozialversicherung tool at /de/brutto-netto-rechner.
 */

interface ParsedInput {
  region: 'us' | 'uk';
  gross: number;
  filingStatus: UsFilingStatus;
}

function parseFallback(input: string): ParsedInput | string {
  const parts = input.split('|').map((s) => s.trim());
  if (parts.length < 2) {
    return 'Format: region|gross[|filingStatus]   e.g. us|75000|single';
  }
  const region = parts[0] === 'uk' ? 'uk' : 'us';
  const gross = Number(parts[1]);
  const filingStatus = (parts[2] as UsFilingStatus) ?? 'single';
  if (!Number.isFinite(gross) || gross < 0) {
    return 'Error: gross must be a non-negative number.';
  }
  return { region, gross, filingStatus };
}

function formatGrossNet(input: string): string {
  const parsed = parseFallback(input);
  if (typeof parsed === 'string') return parsed;
  if (parsed.region === 'us') {
    const r = computeUsPaycheck(parsed.gross, parsed.filingStatus);
    return [
      `Region:           United States (2025)`,
      `Filing status:    ${parsed.filingStatus}`,
      `Gross annual:     $${r.grossAnnual.toFixed(2)}`,
      `Std deduction:    $${r.standardDeduction.toFixed(2)}`,
      `Taxable income:   $${r.taxableIncome.toFixed(2)}`,
      `Federal income:   $${r.federalIncomeTax.toFixed(2)}`,
      `FICA total:       $${r.ficaTotal.toFixed(2)}`,
      `Total tax:        $${r.totalTax.toFixed(2)}`,
      `Net annual:       $${r.netAnnual.toFixed(2)}`,
      `Net monthly:      $${r.netMonthly.toFixed(2)}`,
      `Effective rate:   ${(r.effectiveRate * 100).toFixed(2)} %`,
    ].join('\n');
  }
  const r = computeUkPaycheck(parsed.gross);
  return [
    `Region:           United Kingdom (2025/26)`,
    `Gross annual:     £${r.grossAnnual.toFixed(2)}`,
    `Personal allow.:  £${r.personalAllowance.toFixed(2)}`,
    `Taxable income:   £${r.taxableIncome.toFixed(2)}`,
    `Income tax:       £${r.incomeTax.toFixed(2)}`,
    `National Insur.:  £${r.nationalInsurance.toFixed(2)}`,
    `Total tax:        £${r.totalTax.toFixed(2)}`,
    `Net annual:       £${r.netAnnual.toFixed(2)}`,
    `Net monthly:      £${r.netMonthly.toFixed(2)}`,
    `Effective rate:   ${(r.effectiveRate * 100).toFixed(2)} %`,
  ].join('\n');
}

export const grossNetCalculatorEn: FormatterConfig = {
  id: 'gross-net-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatGrossNet,
  placeholder: 'us|75000|single   (region|gross[|filingStatus])',
};

// Re-export so the component imports from the same barrel.
export { computeUsPaycheck, computeUkPaycheck };
export {
  US_2025_BRACKETS,
  US_2025_STD_DEDUCTION,
  US_2025_FICA,
  UK_2025_PERSONAL_ALLOWANCE,
  UK_2025_INCOME_TAX,
  UK_2025_NI,
};
export type { UsFilingStatus };
