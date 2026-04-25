import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * Leasing-Faktor-Rechner — berechnet Leasingfaktor mit Sonderzahlung-Bereinigung.
 *
 * Primärformel:
 *   Leasingfaktor = (monatliche Rate / Bruttolistenpreis) × 100
 *
 * Bereinigte Formel (mit Sonderzahlung):
 *   Leasingfaktor = (Rate + Sonderzahlung / Laufzeit) / Listenpreis × 100
 *
 * Bewertungsskala (leasingmarkt.de-Standard, 5-stufig):
 *   < 0,50  → Spitzenangebot
 *   0,50–0,69 → Sehr gut
 *   0,70–0,89 → Gut
 *   0,90–1,00 → Durchschnittlich
 *   > 1,00  → Wenig attraktiv
 *
 * Markt-Benchmark 2024: Durchschnitt 0,63 (Quelle: leasingmarkt.de)
 *
 * Differenzierung (Dossier §9):
 *   H1 — Sonderzahlung-Bereinigung (1-Click): optionales 3. Feld → kein Competitor macht das interaktiv
 *   H2 — Benchmark-Gauge: visueller Balken mit Marktkontext (0,63 Durchschnitt)
 *   H3 — Copy-Button für berechneten Faktor
 *
 * Pure client-side, kein Server-Submit.
 */

// ---------------------------------------------------------------------------
// Bewertungsskala
// ---------------------------------------------------------------------------

export type FaktorBewertung =
  | 'spitzenangebot'
  | 'sehr-gut'
  | 'gut'
  | 'durchschnittlich'
  | 'wenig-attraktiv';

/** Markt-Benchmark (leasingmarkt.de, 2024): Durchschnitt aller PKW-Leasing-Angebote. */
export const MARKT_DURCHSCHNITT = 0.63;

/** Skala-Grenzen nach leasingmarkt.de-Standard */
const SKALA: Array<{ max: number; bewertung: FaktorBewertung }> = [
  { max: 0.5, bewertung: 'spitzenangebot' },
  { max: 0.7, bewertung: 'sehr-gut' },
  { max: 0.9, bewertung: 'gut' },
  { max: 1.0, bewertung: 'durchschnittlich' },
  { max: Infinity, bewertung: 'wenig-attraktiv' },
];

export const BEWERTUNG_LABEL: Record<FaktorBewertung, string> = {
  'spitzenangebot': 'Spitzenangebot',
  'sehr-gut': 'Sehr gut',
  'gut': 'Gut',
  'durchschnittlich': 'Durchschnittlich',
  'wenig-attraktiv': 'Wenig attraktiv',
};

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface LeasingFaktorResult {
  /** Berechneter Leasingfaktor (bereinigt, wenn Sonderzahlung > 0) */
  faktor: number;
  /** Ob die bereinigte Formel verwendet wurde (Sonderzahlung > 0) */
  bereinigt: boolean;
  /** Bewertung nach leasingmarkt.de-Skala */
  bewertung: FaktorBewertung;
  /** Lesbare Formel-Aufschlüsselung */
  formelText: string;
  /** Anteilige Sonderzahlung pro Monat (nur bei bereinigt) */
  sonderzahlungProMonat?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rundet auf 2 Nachkommastellen. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Rundet auf 4 Nachkommastellen (für Faktor-Präzision). */
export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Formatiert Geldbetrag DE-Locale (z.B. 1.234,56). */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formatiert Leasingfaktor auf 2 Dezimalstellen DE-Locale. */
export function formatFaktor(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Gibt die Bewertung für einen Leasingfaktor zurück.
 * Faktor 0 (kostenloser Promotion-Deal) gilt als Spitzenangebot.
 */
export function getBewertung(faktor: number): FaktorBewertung {
  for (const { max, bewertung } of SKALA) {
    if (faktor < max) return bewertung;
  }
  return 'wenig-attraktiv';
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Berechnet den Leasingfaktor.
 *
 * @param monatlicheRate   Monatliche Leasingrate in € (> 0)
 * @param listenpreis      Bruttolistenpreis in € (> 0)
 * @param sonderzahlung    Einmalige Sonderzahlung in € (≥ 0, Default 0)
 * @param laufzeit         Laufzeit in Monaten (> 0, nur relevant wenn sonderzahlung > 0)
 */
export function computeLeasingFaktor(
  monatlicheRate: number,
  listenpreis: number,
  sonderzahlung = 0,
  laufzeit = 36,
): LeasingFaktorResult {
  const bereinigt = sonderzahlung > 0;
  let effektiveRate: number;
  let sonderzahlungProMonat: number | undefined;

  if (bereinigt) {
    sonderzahlungProMonat = round2(sonderzahlung / laufzeit);
    effektiveRate = monatlicheRate + sonderzahlungProMonat;
  } else {
    effektiveRate = monatlicheRate;
  }

  const faktor = round4((effektiveRate / listenpreis) * 100);
  const bewertung = getBewertung(faktor);

  let formelText: string;
  if (bereinigt) {
    formelText =
      `(${formatEuro(monatlicheRate)} + ${formatEuro(sonderzahlung!)} / ${laufzeit}) / ${formatEuro(listenpreis)} × 100 = ${formatFaktor(faktor)}`;
  } else {
    formelText =
      `${formatEuro(monatlicheRate)} / ${formatEuro(listenpreis)} × 100 = ${formatFaktor(faktor)}`;
  }

  return {
    faktor,
    bereinigt,
    bewertung,
    formelText,
    ...(bereinigt ? { sonderzahlungProMonat } : {}),
  };
}

// ---------------------------------------------------------------------------
// Fallback text formatter (für Formatter-Shell)
// ---------------------------------------------------------------------------

/**
 * Text-Fallback für die generische Formatter-Komponente.
 * Input-Format: "rate;listenpreis" oder "rate;listenpreis;sonderzahlung;laufzeit"
 * Beispiel: "250;33850" → Leasingfaktor für 250 € Rate, 33.850 € Listenpreis
 */
function formatLeasingFaktor(input: string): string {
  try {
    const parts = input.split(';').map((s) => s.trim());
    const rate = parseDE(parts[0] ?? '');
    const listenpreis = parseDE(parts[1] ?? '');

    if (!Number.isFinite(rate) || rate < 0) return 'Fehler: Bitte eine gültige monatliche Rate eingeben.';
    if (!Number.isFinite(listenpreis) || listenpreis <= 0) return 'Fehler: Listenpreis muss > 0 sein.';

    const sonderzahlung = parts[2] ? parseDE(parts[2]) : 0;
    const laufzeit = parts[3] ? parseDE(parts[3]) : 36;

    if (!Number.isFinite(sonderzahlung) || sonderzahlung < 0) return 'Fehler: Sonderzahlung muss ≥ 0 sein.';
    if (!Number.isFinite(laufzeit) || laufzeit <= 0) return 'Fehler: Laufzeit muss > 0 Monate sein.';

    const r = computeLeasingFaktor(rate, listenpreis, sonderzahlung, laufzeit);
    const lines = [
      `Leasingfaktor: ${formatFaktor(r.faktor)}`,
      `Bewertung: ${BEWERTUNG_LABEL[r.bewertung]}`,
      `Formel: ${r.formelText}`,
    ];
    if (r.bereinigt && r.sonderzahlungProMonat !== undefined) {
      lines.push(`Anteilige Sonderzahlung: ${formatEuro(r.sonderzahlungProMonat)} €/Monat`);
    }
    return lines.join('\n');
  } catch {
    return input;
  }
}

export const leasingFaktorRechner: FormatterConfig = {
  id: 'leasing-factor-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatLeasingFaktor,
  placeholder: '250;33850  (Rate;Listenpreis in €, optional ;Sonderzahlung;Laufzeit)',
};
