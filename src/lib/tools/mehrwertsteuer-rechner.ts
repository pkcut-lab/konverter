import type { FormatterConfig } from './schemas';

/**
 * Mehrwertsteuer-Rechner — bidirektionale MwSt-Berechnung (Netto / MwSt / Brutto).
 * Formeln: Brutto = Netto × (1 + r) | Netto = Brutto ÷ (1 + r) | MwSt = Brutto − Netto
 * Steuersätze DE 2026: 19% (Regel), 7% (ermäßigt, inkl. Restaurantspeisen ab Jan 2026), 0% (PV).
 * Pure client-side, kein Server-Submit.
 */

export interface MwStResult {
  netto: number;
  mwst: number;
  brutto: number;
}

/**
 * Parse German-locale decimal string to number.
 * Accepts "1.000,99" (DE thousands+decimal) and "1000.99" (EN) and "1000,99".
 * Returns NaN for invalid input.
 */
export function parseDE(raw: string): number {
  const s = raw.trim();
  if (s === '' || s === '-') return NaN;
  // Strip illegal chars except digits, comma, dot, sign
  const cleaned = s.replace(/[^\d,.\-]/g, '');
  // Detect format: if both comma and dot present, rightmost is decimal separator
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;
  if (lastComma > lastDot) {
    // DE format: 1.000,99 → strip dots, replace comma with dot
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // EN format: 1,000.99 → strip commas
    normalized = cleaned.replace(/,/g, '');
  } else {
    // Only one separator type or none
    normalized = cleaned.replace(',', '.');
  }
  const n = parseFloat(normalized);
  return n;
}

/**
 * Format a monetary value to 2 decimal places, German locale (e.g. 1.234,56).
 */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Compute from netto. Returns NaN fields if rate is invalid. */
export function computeFromNetto(netto: number, ratePct: number): MwStResult {
  const r = ratePct / 100;
  const brutto = round2(netto * (1 + r));
  const mwst = round2(brutto - netto);
  return { netto: round2(netto), mwst, brutto };
}

/** Compute from brutto. Returns NaN fields if rate is invalid. */
export function computeFromBrutto(brutto: number, ratePct: number): MwStResult {
  const r = ratePct / 100;
  const netto = round2(brutto / (1 + r));
  const mwst = round2(brutto - netto);
  return { netto, mwst, brutto: round2(brutto) };
}

/**
 * Compute from mwst-betrag. Returns NaN fields if rate is 0% (undefined netto).
 */
export function computeFromMwst(mwst: number, ratePct: number): MwStResult {
  if (ratePct === 0) return { netto: NaN, mwst: round2(mwst), brutto: NaN };
  const r = ratePct / 100;
  const netto = round2(mwst / r);
  const brutto = round2(netto + mwst);
  return { netto, mwst: round2(mwst), brutto };
}

/** Round to 2 decimal places (kaufmännisch). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Fallback text formatter (used when tool is rendered without the custom component).
 * Standard formatter interface requirement — the MehrwertsteuerRechnerTool.svelte
 * component does not call this; it uses the exported compute functions directly.
 */
function formatMwSt(input: string): string {
  const n = parseDE(input);
  if (!Number.isFinite(n) || n < 0) return '';
  const r = computeFromNetto(n, 19);
  return `Netto: ${formatEuro(r.netto)} €\nMwSt (19%): ${formatEuro(r.mwst)} €\nBrutto: ${formatEuro(r.brutto)} €`;
}

export const mehrwertsteuerRechner: FormatterConfig = {
  id: 'vat-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatMwSt,
  placeholder: 'Nettobetrag eingeben (z.B. 100)',
};
