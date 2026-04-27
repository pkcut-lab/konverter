import type { FormatterConfig } from '../schemas';
import {
  computeSalesTax,
  type CalcMode,
} from './vat-calculator-runtime';
import { US_STATE_RATES, UK_VAT_RATES } from './vat-calculator-data';

/**
 * vat-calculator (EN-region-aware) — VAT / Sales-Tax for US and UK.
 *
 * On the EN page the user picks a region (US or UK) via the global
 * RegionSelector. State-rate matrix for US (50 + DC) and the four UK VAT
 * bands. Output is a triple of (net, tax, gross). Region-aware currency
 * symbol comes from the consuming Svelte component, not from this config.
 *
 * The fallback `format()` provides a CLI-style text output for the legacy
 * Formatter shell — pipe-separated input "amount|rate|mode[|currency]".
 */

const DEFAULT_REGION_TAG = 'us';

interface ParsedInput {
  amount: number;
  rate: number;
  mode: CalcMode;
  currency: string;
}

function parseFallback(input: string): ParsedInput | string {
  const parts = input.split('|').map((s) => s.trim());
  if (parts.length < 3) {
    return 'Format: amount|rate|mode[|currency]   e.g. 100|7.25|add|USD';
  }
  const amount = Number(parts[0]);
  const rate = Number(parts[1]);
  const mode = (parts[2] === 'extract' ? 'extract' : 'add') as CalcMode;
  const currency = parts[3] || 'USD';
  if (!Number.isFinite(amount) || amount < 0) {
    return 'Error: amount must be a non-negative number.';
  }
  if (!Number.isFinite(rate) || rate < 0) {
    return 'Error: rate must be a non-negative percent.';
  }
  return { amount, rate, mode, currency };
}

function formatVatCalculator(input: string): string {
  const parsed = parseFallback(input);
  if (typeof parsed === 'string') return parsed;
  const { amount, rate, mode, currency } = parsed;
  const result = computeSalesTax(amount, rate, mode);
  return [
    `Region tag:    ${DEFAULT_REGION_TAG}`,
    `Mode:          ${mode === 'add' ? 'Add tax to net' : 'Extract tax from gross'}`,
    `Rate applied:  ${result.appliedRate.toFixed(3)} %`,
    `Net amount:    ${result.netAmount.toFixed(2)} ${currency}`,
    `Tax amount:    ${result.taxAmount.toFixed(2)} ${currency}`,
    `Gross amount:  ${result.grossAmount.toFixed(2)} ${currency}`,
  ].join('\n');
}

export const vatCalculatorEn: FormatterConfig = {
  id: 'vat-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatVatCalculator,
  placeholder: '100|7.25|add|USD   (amount|rate%|add|extract|currency)',
};

// Re-export the data + runtime so the component imports them from the same
// barrel — keeps the component file slimmer.
export { US_STATE_RATES, UK_VAT_RATES };
export { computeSalesTax };
export type { CalcMode };
