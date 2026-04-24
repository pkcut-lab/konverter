import type { FormatterConfig } from './schemas';

/**
 * Zinsrechner — Zinseszins, Abgeltungssteuer, Realrendite (Fisher-Gleichung).
 *
 * Differenzierung laut Dossier §9:
 * H1 — Drei Ergebnis-Zeilen im Default: Brutto | Netto (nach Steuer) | Real (nach Inflation).
 *       Defaults: Abgeltungssteuer 26,375 %, Sparerpauschbetrag 1.000 €, Inflation 2,5 %.
 * H3 — Privacy-First: reines Client-Side-JavaScript, kein Server-Submit, kein Tracking.
 *
 * Formel Zinseszins: Kn = K0 × (1 + p/100)^n
 * Formel Realrendite (Fisher): r_real = (1 + r_nominal) / (1 + r_inflation) - 1
 *
 * Security: Ausgabe ausschließlich via textContent (kein innerHTML). Inputs werden
 * normalisiert (DE-Dezimalkomma → JS-Float) bevor jede Arithmetik stattfindet.
 */

export interface ZinsResult {
  /** Brutto-Endkapital (Zinseszins, nominal) */
  kn: number;
  /** Zinsertrag nominal (brutto) */
  zinsen: number;
  /** Effektiver Jahreszinssatz in % (identisch zu nominal bei jährlicher Gutschrift) */
  effektivzins: number;
  /** Abgeführte Abgeltungssteuer in € */
  steuer: number;
  /** Netto-Zinsertrag nach Abgeltungssteuer + Sparerpauschbetrag */
  zinsenNetto: number;
  /** Netto-Endkapital (K0 + zinsenNetto) */
  knNetto: number;
  /** Realrendite p.a. in % (Fisher-Gleichung) */
  realrendite: number;
  /** Real-Endkapital nach Inflationsbereinigung */
  knReal: number;
}

/**
 * Parse German-locale decimal string to number.
 * "1.000,99" → 1000.99  |  "1000.99" → 1000.99  |  "1,99" → 1.99
 * Returns NaN for empty or non-numeric input.
 */
export function parseDE(raw: string): number {
  const s = raw.trim();
  if (s === '' || s === '-') return NaN;
  const cleaned = s.replace(/[^\d,.\-]/g, '');
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, '');
  } else {
    normalized = cleaned.replace(',', '.');
  }
  return parseFloat(normalized);
}

/** Round to 2 decimal places (kaufmännisch). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Round to 4 decimal places. */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Berechne Zinseszins, Abgeltungssteuer und Realrendite (Fisher).
 *
 * @param k0         Anfangskapital in €
 * @param pNominal   Nominaler Zinssatz in % p.a. (darf negativ sein)
 * @param n          Laufzeit in Jahren
 * @param steuersatz Abgeltungssteuer in % (Default: 26.375 = 25 % + SolZ 5,5 %)
 * @param freibetrag Sparerpauschbetrag in € (Default: 1.000 € Einzelperson 2026)
 * @param inflation  Inflationsrate in % p.a. (Default: 2.5)
 */
export function computeZins(
  k0: number,
  pNominal: number,
  n: number,
  steuersatz: number = 26.375,
  freibetrag: number = 1000,
  inflation: number = 2.5,
): ZinsResult {
  const r = pNominal / 100;

  // Zinseszins: Kn = K0 × (1 + r)^n
  const kn = round2(k0 * Math.pow(1 + r, n));
  const zinsen = round2(kn - k0);

  // Effektivzinssatz (jährliche Gutschrift = nominell)
  const effektivzins = round4(pNominal);

  // Abgeltungssteuer: nur auf den Betrag über dem Sparerpauschbetrag
  const steuerpflichtiger = Math.max(0, zinsen - freibetrag);
  const steuer = round2(steuerpflichtiger * (steuersatz / 100));
  const zinsenNetto = round2(zinsen - steuer);
  const knNetto = round2(k0 + zinsenNetto);

  // Realrendite via Fisher-Gleichung (korrekt, nicht naive Subtraktion)
  // r_real = (1 + r_nominal) / (1 + r_inflation) - 1
  const rInfl = inflation / 100;
  const realrenditeRaw = (1 + r) / (1 + rInfl) - 1;
  const realrendite = round4(realrenditeRaw * 100);
  const knReal = round2(k0 * Math.pow(1 + realrenditeRaw, n));

  return { kn, zinsen, effektivzins, steuer, zinsenNetto, knNetto, realrendite, knReal };
}

/**
 * Format a monetary value to 2 decimal places, German locale (e.g. 1.234,56).
 */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format a percent value, German locale.
 */
export function formatProzent(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Fallback text formatter for the Formatter component shell.
 * Real UI: eigene ZinsrechnerTool.svelte-Komponente (nutzt exportierte Compute-Funktionen).
 * Input-Format: "K0;Zinssatz;Laufzeit" (Semikolon-getrennt, DE-Dezimal erlaubt).
 * Beispiel: "10000;3;10" → Zinseszins 10.000 € × 3 % × 10 Jahre
 */
function formatZins(input: string): string {
  const parts = input.split(';').map((s) => s.trim());
  const k0 = parseDE(parts[0] ?? '');
  const p = parseDE(parts[1] ?? '');
  const n = parseDE(parts[2] ?? '');

  if (!Number.isFinite(k0) || k0 < 0) {
    return 'Fehler: Bitte einen gültigen Kapitalbetrag eingeben.';
  }
  if (!Number.isFinite(p) || p < -10 || p > 100) {
    return 'Fehler: Zinssatz muss zwischen −10 und 100 liegen.';
  }
  if (!Number.isFinite(n) || n <= 0 || n > 100) {
    return 'Fehler: Laufzeit muss zwischen 0 und 100 Jahren liegen.';
  }

  const r = computeZins(k0, p, n);
  return [
    `Brutto-Endkapital: ${formatEuro(r.kn)} €`,
    `Zinsertrag (brutto): ${formatEuro(r.zinsen)} €`,
    `Abgeltungssteuer: ${formatEuro(r.steuer)} €`,
    `Netto-Endkapital: ${formatEuro(r.knNetto)} €`,
    `Real-Endkapital (nach 2,50 % Inflation): ${formatEuro(r.knReal)} €`,
    `Realrendite p.a.: ${formatProzent(r.realrendite, 2)} %`,
  ].join('\n');
}

export const zinsrechner: FormatterConfig = {
  id: 'interest-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatZins,
  placeholder: '10000;3;10  (Kapital;Zinssatz %;Laufzeit Jahre)',
};
