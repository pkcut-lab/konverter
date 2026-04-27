/**
 * Pure compute layer for the EN region-aware VAT/Sales-Tax calculator.
 * No DOM, no I18n — call from a Svelte component or directly from a test.
 */

export type CalcMode = 'add' | 'extract';

export interface SalesTaxResult {
  /** The pre-tax amount (also called net / subtotal). */
  netAmount: number;
  /** Tax owed in absolute currency units. */
  taxAmount: number;
  /** Final amount the customer pays (net + tax). */
  grossAmount: number;
  /** The rate the result was calculated with, as a percent number. */
  appliedRate: number;
}

/**
 * Round to 2 decimal places using banker's rounding's safer cousin
 * (commercial rounding) — Math.round is half-up which matches what
 * end-users expect on a receipt.
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute sales tax / VAT for a given amount.
 *
 * @param amount The amount entered by the user.
 * @param ratePct Tax rate in percent (e.g. 7.25 for California, 20 for UK).
 * @param mode 'add'     — `amount` is net/pre-tax, returned `taxAmount` is added on top.
 *             'extract' — `amount` is gross/tax-inclusive, returned `taxAmount` is the
 *             portion attributable to tax.
 */
export function computeSalesTax(
  amount: number,
  ratePct: number,
  mode: CalcMode,
): SalesTaxResult {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('amount must be a non-negative finite number');
  }
  if (!Number.isFinite(ratePct) || ratePct < 0) {
    throw new Error('ratePct must be a non-negative finite number');
  }

  const rate = ratePct / 100;

  if (mode === 'add') {
    const netAmount = r2(amount);
    const taxAmount = r2(amount * rate);
    const grossAmount = r2(netAmount + taxAmount);
    return { netAmount, taxAmount, grossAmount, appliedRate: ratePct };
  }

  // extract: amount is gross.
  const grossAmount = r2(amount);
  const netAmount = r2(amount / (1 + rate));
  const taxAmount = r2(grossAmount - netAmount);
  return { netAmount, taxAmount, grossAmount, appliedRate: ratePct };
}
