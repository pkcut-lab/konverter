import type { FormatterConfig } from '../schemas';
import {
  computeInterest,
  type InterestParams,
  type InterestKind,
  type CompoundFrequency,
} from './interest-calculator-runtime';

/**
 * interest-calculator (EN-region-aware) — Simple/Compound across US (APR-aware,
 * federal-income-tax-on-interest at user's marginal rate) and UK (basic/higher/
 * additional rate OR ISA tax-free).
 *
 * The DE side keeps Zinseszins + Abgeltungssteuer at /de/zinsrechner; the EN
 * page mounts this calculator with region-aware tax presets.
 */

interface ParsedInput {
  principal: number;
  rate: number;
  years: number;
  kind: InterestKind;
  freq: CompoundFrequency;
  taxRate: number;
}

function parseFallback(input: string): ParsedInput | string {
  const parts = input.split('|').map((s) => s.trim());
  if (parts.length < 3) {
    return 'Format: principal|rate|years[|kind|freq|tax%]   e.g. 10000|5|10|compound|monthly|22';
  }
  const principal = Number(parts[0]);
  const rate = Number(parts[1]);
  const years = Number(parts[2]);
  const kind = (parts[3] === 'simple' ? 'simple' : 'compound') as InterestKind;
  const freq = (parts[4] as CompoundFrequency) ?? 'annually';
  const taxRate = Number(parts[5] ?? '0');
  if (!Number.isFinite(principal) || principal < 0)
    return 'Error: principal must be non-negative.';
  if (!Number.isFinite(rate)) return 'Error: rate must be a number.';
  if (!Number.isFinite(years) || years < 0)
    return 'Error: years must be non-negative.';
  return { principal, rate, years, kind, freq, taxRate };
}

function formatInterest(input: string): string {
  const parsed = parseFallback(input);
  if (typeof parsed === 'string') return parsed;
  const params: InterestParams = {
    principal: parsed.principal,
    annualRatePct: parsed.rate,
    years: parsed.years,
    kind: parsed.kind,
    compoundFrequency: parsed.freq,
    taxRatePct: parsed.taxRate,
  };
  const r = computeInterest(params);
  return [
    `Principal:        ${r.finalAmount.toFixed(2)} − interest = ${parsed.principal.toFixed(2)}`,
    `Final amount:     ${r.finalAmount.toFixed(2)}`,
    `Total interest:   ${r.totalInterest.toFixed(2)}`,
    `Tax on interest:  ${r.taxOnInterest.toFixed(2)} (${parsed.taxRate.toFixed(2)} %)`,
    `Net interest:     ${r.netInterest.toFixed(2)}`,
    `Net final:        ${r.netFinalAmount.toFixed(2)}`,
    `APY:              ${r.apy.toFixed(4)} %`,
    `Daily accrual t0: ${r.dailyAccrualAtT0.toFixed(4)}`,
  ].join('\n');
}

export const interestCalculatorEn: FormatterConfig = {
  id: 'interest-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatInterest,
  placeholder: '10000|5|10|compound|monthly|22   (principal|rate|years|kind|freq|tax%)',
};

export { computeInterest };
export type { InterestKind, CompoundFrequency, InterestParams };
