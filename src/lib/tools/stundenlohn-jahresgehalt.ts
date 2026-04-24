import type { FormatterConfig } from './schemas';

/**
 * Stundenlohn zu Jahresgehalt Rechner — bidirektional, zwei Formel-Modi.
 *
 * Modus "Schnell":  Jahresgehalt = Stundenlohn × Wochenstunden × 52
 * Modus "Exakt":   Jahresgehalt = Stundenlohn × Arbeitstage × Tagesstunden
 *                  Arbeitstage  = 260 − Urlaubstage − Feiertage (Bundesland)
 *                  Tagesstunden = Wochenstunden ÷ 5
 *
 * Regulatorische Werte 2026/2027:
 *   Mindestlohn 2026: €13,90/h
 *   Mindestlohn 2027: €14,60/h (geplant)
 *   Minijob-Grenze 2026: €603/Monat
 *
 * Pure client-side — kein fetch(), kein eval(), kein Server-Upload.
 */

export const MINDESTLOHN_2026 = 13.9;
export const MINDESTLOHN_2027 = 14.6;
export const MINIJOB_GRENZE_2026 = 603;

/** 16 Bundesländer mit Anzahl gesetzlicher Feiertage 2026 (Werktags-Feiertage). */
export interface Bundesland {
  id: string;
  label: string;
  /** Anzahl gesetzlicher Feiertage 2026 (auf Werktage fallend). */
  feiertage: number;
}

export const BUNDESLAENDER: Bundesland[] = [
  { id: 'BW', label: 'Baden-Württemberg', feiertage: 12 },
  { id: 'BY', label: 'Bayern', feiertage: 13 },
  { id: 'BE', label: 'Berlin', feiertage: 10 },
  { id: 'BB', label: 'Brandenburg', feiertage: 11 },
  { id: 'HB', label: 'Bremen', feiertage: 10 },
  { id: 'HH', label: 'Hamburg', feiertage: 10 },
  { id: 'HE', label: 'Hessen', feiertage: 11 },
  { id: 'MV', label: 'Mecklenburg-Vorpommern', feiertage: 13 },
  { id: 'NI', label: 'Niedersachsen', feiertage: 10 },
  { id: 'NW', label: 'Nordrhein-Westfalen', feiertage: 11 },
  { id: 'RP', label: 'Rheinland-Pfalz', feiertage: 12 },
  { id: 'SL', label: 'Saarland', feiertage: 13 },
  { id: 'SN', label: 'Sachsen', feiertage: 11 },
  { id: 'ST', label: 'Sachsen-Anhalt', feiertage: 12 },
  { id: 'SH', label: 'Schleswig-Holstein', feiertage: 10 },
  { id: 'TH', label: 'Thüringen', feiertage: 11 },
];

export interface PeriodResult {
  stundenlohn: number;
  jahresgehalt: number;
  monatsgehalt: number;
  wochengehalt: number;
  tagesgehalt: number;
}

export interface SchnellInput {
  stundenlohn?: number;
  jahresgehalt?: number;
  wochenstunden: number;
}

export interface ExaktResult extends PeriodResult {
  arbeitstage: number;
  tagesstunden: number;
}

export interface ExaktInput {
  stundenlohn?: number;
  jahresgehalt?: number;
  wochenstunden: number;
  urlaubstage: number;
  feiertage: number;
}

/**
 * Parse German/English decimal string to number.
 * Returns null for invalid, negative, or out-of-range values.
 * Accepts both comma and dot as decimal separator.
 */
export function parseWage(raw: string): number | null {
  const s = raw.trim().replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n < 0 || n > 99999) return null;
  return n;
}

/**
 * Format number to German locale with 2 decimal places.
 * Returns '' for non-finite values.
 */
export function formatEuroFull(n: number): string {
  if (!Number.isFinite(n)) return '';
  // try/catch: toLocaleString kann in seltenen Umgebungen werfen (z. B. fehlende ICU-Daten)
  try {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return n.toFixed(2);
  }
}

/** Round to 2 decimal places. */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Schnell-Methode: Jahresgehalt = Stundenlohn × Wochenstunden × 52.
 * Accepts either stundenlohn or jahresgehalt as the driving value.
 */
export function computeSchnell(input: SchnellInput): PeriodResult {
  const { wochenstunden } = input;

  let stundenlohn: number;
  let jahresgehalt: number;

  if (typeof input.stundenlohn === 'number') {
    stundenlohn = input.stundenlohn;
    jahresgehalt = r2(stundenlohn * wochenstunden * 52);
  } else if (typeof input.jahresgehalt === 'number') {
    jahresgehalt = input.jahresgehalt;
    stundenlohn = wochenstunden > 0 ? r2(jahresgehalt / (wochenstunden * 52)) : 0;
  } else {
    return { stundenlohn: 0, jahresgehalt: 0, monatsgehalt: 0, wochengehalt: 0, tagesgehalt: 0 };
  }

  const monatsgehalt = r2(jahresgehalt / 12);
  const wochengehalt = r2(stundenlohn * wochenstunden);
  const tagesstunden = wochenstunden / 5;
  const tagesgehalt = r2(stundenlohn * tagesstunden);

  return { stundenlohn, jahresgehalt, monatsgehalt, wochengehalt, tagesgehalt };
}

/**
 * Exakt-Methode: Jahresgehalt = Stundenlohn × Arbeitstage × Tagesstunden.
 * Arbeitstage = 260 − Urlaubstage − Feiertage.
 * Tagesstunden = Wochenstunden ÷ 5.
 */
export function computeExakt(input: ExaktInput): ExaktResult {
  const { wochenstunden, urlaubstage, feiertage } = input;
  const arbeitstage = Math.max(0, 260 - urlaubstage - feiertage);
  const tagesstunden = r2(wochenstunden / 5);

  let stundenlohn: number;
  let jahresgehalt: number;

  if (typeof input.stundenlohn === 'number') {
    stundenlohn = input.stundenlohn;
    jahresgehalt = r2(stundenlohn * arbeitstage * tagesstunden);
  } else if (typeof input.jahresgehalt === 'number') {
    jahresgehalt = input.jahresgehalt;
    const divisor = arbeitstage * tagesstunden;
    stundenlohn = divisor > 0 ? r2(jahresgehalt / divisor) : 0;
  } else {
    return {
      stundenlohn: 0,
      jahresgehalt: 0,
      monatsgehalt: 0,
      wochengehalt: 0,
      tagesgehalt: 0,
      arbeitstage,
      tagesstunden,
    };
  }

  const monatsgehalt = r2(jahresgehalt / 12);
  const wochengehalt = r2(stundenlohn * wochenstunden);
  const tagesgehalt = r2(stundenlohn * tagesstunden);

  return { stundenlohn, jahresgehalt, monatsgehalt, wochengehalt, tagesgehalt, arbeitstage, tagesstunden };
}

/**
 * Fallback text formatter (the Svelte component handles real UI;
 * this satisfies the FormatterConfig interface).
 */
function formatStundenlohn(input: string): string {
  // Defense-in-depth: try/catch fängt unerwartete Fehler in computeSchnell() oder formatEuroFull() ab.
  try {
    const n = parseWage(input);
    if (n === null) return '';
    const r = computeSchnell({ stundenlohn: n, wochenstunden: 40 });
    return [
      `Stundenlohn: ${formatEuroFull(r.stundenlohn)} €/h`,
      `Jahresgehalt: ${formatEuroFull(r.jahresgehalt)} €/Jahr`,
      `Monatsgehalt: ${formatEuroFull(r.monatsgehalt)} €/Monat`,
      `Wochengehalt: ${formatEuroFull(r.wochengehalt)} €/Woche`,
      `Tagesgehalt: ${formatEuroFull(r.tagesgehalt)} €/Tag`,
    ].join('\n');
  } catch {
    return input;
  }
}

export const stundenlohnJahresgehalt: FormatterConfig = {
  id: 'hourly-to-annual',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatStundenlohn,
  placeholder: 'Stundenlohn eingeben (z.B. 15,50)',
};
