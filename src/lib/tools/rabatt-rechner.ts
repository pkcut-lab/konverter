import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * Rabatt-Rechner — bidirektionale Rabattberechnung (3 Modi + Kettenrabatt).
 *
 * Formeln:
 *   Standard:    E = P × (1 − R/100)
 *   Rückrechnung Ursprungspreis: P = E / (1 − R/100)
 *   Rückrechnung Rabatt%: R = (1 − E/P) × 100
 *   Kettenrabatt: E = P × (1 − R1/100) × (1 − R2/100)  →  Gesamt% = (1 − E/P) × 100
 *
 * Pure client-side, kein Server-Submit.
 */

export interface RabattResult {
  endpreis: number;
  ursprungspreis: number;
  rabattProzent: number;
  rabattBetrag: number;
  /** Nur bei Kettenrabatt gesetzt: berechneter Gesamtrabatt in %. */
  gesamtRabattProzent?: number;
}


/**
 * Format a monetary value to 2 decimal places, German locale (e.g. 1.234,56).
 */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format a percent value to up to 4 decimal places, German locale. */
export function formatProzent(n: number): string {
  if (!Number.isFinite(n)) return '';
  // Strip trailing zeros beyond 2 places, keep at most 4
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/** Round to 2 decimal places (kaufmännisch). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Standard: Endpreis aus Ursprungspreis + Rabatt%.
 * Fehler: P <= 0, R < 0, R > 100.
 */
export function computeEndpreis(ursprungspreis: number, rabattProzent: number): RabattResult {
  const e = round2(ursprungspreis * (1 - rabattProzent / 100));
  const rabattBetrag = round2(ursprungspreis - e);
  return {
    endpreis: e,
    ursprungspreis: round2(ursprungspreis),
    rabattProzent: round2(rabattProzent),
    rabattBetrag,
  };
}

/**
 * Rückrechnung Ursprungspreis aus Endpreis + Rabatt%.
 * Fehler: R >= 100 (Division durch 0 / negativer Preis).
 */
export function computeUrsprungspreis(endpreis: number, rabattProzent: number): RabattResult {
  const p = round2(endpreis / (1 - rabattProzent / 100));
  const rabattBetrag = round2(p - endpreis);
  return {
    endpreis: round2(endpreis),
    ursprungspreis: p,
    rabattProzent: round2(rabattProzent),
    rabattBetrag,
  };
}

/**
 * Rückrechnung Rabatt% aus Ursprungspreis + Endpreis.
 * Fehler: P <= 0, E > P.
 */
export function computeRabattProzent(ursprungspreis: number, endpreis: number): RabattResult {
  const r = (1 - endpreis / ursprungspreis) * 100;
  const rabattBetrag = round2(ursprungspreis - endpreis);
  return {
    endpreis: round2(endpreis),
    ursprungspreis: round2(ursprungspreis),
    rabattProzent: round2(r * 100) / 100,
    rabattBetrag,
  };
}

/**
 * Kettenrabatt: zwei Rabattsätze hintereinander.
 * Korrekt: E = P × (1 − R1/100) × (1 − R2/100)
 * Nicht-additiv: R_gesamt ≠ R1 + R2
 */
export function computeKettenrabatt(
  ursprungspreis: number,
  rabatt1Prozent: number,
  rabatt2Prozent: number,
): RabattResult {
  const factor1 = 1 - rabatt1Prozent / 100;
  const factor2 = 1 - rabatt2Prozent / 100;
  const e = round2(ursprungspreis * factor1 * factor2);
  const gesamtRabattProzent = round2((1 - factor1 * factor2) * 100 * 100) / 100;
  const rabattBetrag = round2(ursprungspreis - e);
  return {
    endpreis: e,
    ursprungspreis: round2(ursprungspreis),
    rabattProzent: round2(rabatt1Prozent + rabatt2Prozent), // naive sum for display comparison
    rabattBetrag,
    gesamtRabattProzent,
  };
}

/**
 * Fallback text formatter for the FormatterConfig shell.
 * Interprets input as "Ursprungspreis Rabatt%" (space-separated, e.g. "100 20").
 * The custom RabattRechner.svelte component calls computeEndpreis/computeUrsprungspreis
 * directly and does not rely on this function.
 */
function formatRabatt(input: string): string {
  const parts = input.trim().split(/[\s,;]+/);
  const p = parseDE(parts[0] ?? '');
  const r = parseDE(parts[1] ?? '');
  if (!Number.isFinite(p) || p <= 0) return '';
  if (!Number.isFinite(r) || r < 0 || r > 100) return '';
  const res = computeEndpreis(p, r);
  return [
    `Ursprungspreis: ${formatEuro(res.ursprungspreis)} €`,
    `Rabatt (${formatProzent(res.rabattProzent)} %): −${formatEuro(res.rabattBetrag)} €`,
    `Endpreis: ${formatEuro(res.endpreis)} €`,
  ].join('\n');
}

export const rabattRechner: FormatterConfig = {
  id: 'discount-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatRabatt,
  placeholder: 'Ursprungspreis und Rabatt% eingeben (z.B. 100 20)',
};
