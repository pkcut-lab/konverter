import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * ROI-Rechner — Return on Investment in drei Modi.
 *
 * Differenzierung laut Dossier §9:
 * H1 — Annualisierter ROI (AROI) via Zinseszins-Formel — einziger DE-Rechner mit echter AROI.
 * H2 — Formel-Transparenz: Live-Aufschlüsselung der Berechnung neben dem Ergebnis.
 * H3 — Drei Modi: Basis (2 Felder), Erweitert (+ Laufzeit + Betriebskosten), DuPont (3 Felder).
 *
 * Formeln:
 * Basis:     ROI (%) = (Ertrag − Investition) / Investition × 100
 * Erweitert: ROI (%) = (Ertrag − Investition − BK × n) / Investition × 100
 *            AROI (%) = [(Ertrag / Investition)^(1/n) − 1] × 100
 *            Amortisation = Investition × n / (Ertrag − BK × n)  [falls > 0]
 * DuPont:    Umsatzrendite = Gewinn / Nettoumsatz × 100
 *            Kapitalumschlag = Nettoumsatz / Gesamtkapital
 *            ROI = Umsatzrendite × Kapitalumschlag
 *
 * Security: Alle Ausgaben nur via textContent (kein innerHTML). Inputs werden
 * normalisiert (DE-Dezimalkomma → JS-Float) vor jeder Arithmetik.
 */

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type RoiStatus = 'gewinn' | 'verlust' | 'breakeven';

export interface RoiBasisResult {
  /** ROI in % */
  roi: number;
  /** Absoluter Gewinn/Verlust in € */
  gewinn: number;
  /** Semantischer Status */
  status: RoiStatus;
  /** Lesbare Formel-Aufschlüsselung */
  formelText: string;
}

export interface RoiErweitertResult extends RoiBasisResult {
  /** Annualisierter ROI in % (Zinseszins-Formel) */
  aroi: number;
  /** Gesamte Betriebskosten über Laufzeit */
  gesamtBetriebskosten: number;
  /** Amortisationsdauer in Jahren — null wenn niemals amortisiert */
  amortisation: number | null;
  /** Formel-Text für annualisierten ROI */
  aroiFormelText: string;
}

export interface RoiDupontResult {
  /** ROI in % (Umsatzrendite × Kapitalumschlag) */
  roi: number;
  /** Umsatzrendite in % */
  umsatzrendite: number;
  /** Kapitalumschlag (dimensionslos) */
  kapitalumschlag: number;
  /** Semantischer Status */
  status: RoiStatus;
  /** Formel-Aufschlüsselung */
  formelText: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  try {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return n.toFixed(2);
  }
}

export function formatProzent(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '';
  try {
    return n.toLocaleString('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    return n.toFixed(decimals);
  }
}

function toStatus(roi: number): RoiStatus {
  if (roi > 0) return 'gewinn';
  if (roi < 0) return 'verlust';
  return 'breakeven';
}

// ---------------------------------------------------------------------------
// Mode 1 — Basis
// ---------------------------------------------------------------------------

/**
 * Basisberechnung: ROI = (Ertrag − Investition) / Investition × 100
 *
 * @param investition  Anfangsinvestition in € (muss > 0 sein)
 * @param ertrag       Gesamtertrag / Endwert in €
 */
export function computeRoiBasis(investition: number, ertrag: number): RoiBasisResult {
  const gewinn = round2(ertrag - investition);
  const roi = round4((gewinn / investition) * 100);
  const status = toStatus(roi);
  const formelText =
    `(${formatEuro(ertrag)} − ${formatEuro(investition)}) / ${formatEuro(investition)} × 100 = ${formatProzent(roi, 2)} %`;
  return { roi, gewinn, status, formelText };
}

// ---------------------------------------------------------------------------
// Mode 2 — Erweitert (+ Laufzeit + Betriebskosten → annualisierter ROI)
// ---------------------------------------------------------------------------

/**
 * Erweiterte Berechnung mit jährlichen Betriebskosten, annualisiertem ROI und
 * Amortisationsdauer.
 *
 * @param investition     Anfangsinvestition in € (> 0)
 * @param ertrag          Gesamtertrag am Ende der Laufzeit in €
 * @param laufzeit        Laufzeit in Jahren (> 0)
 * @param betriebskosten  Jährliche Betriebskosten in € (≥ 0, Default 0)
 */
export function computeRoiErweitert(
  investition: number,
  ertrag: number,
  laufzeit: number,
  betriebskosten = 0,
): RoiErweitertResult {
  const gesamtBetriebskosten = round2(betriebskosten * laufzeit);
  const gewinn = round2(ertrag - investition - gesamtBetriebskosten);
  const roi = round4((gewinn / investition) * 100);
  const status = toStatus(roi);

  // Annualisierter ROI: AROI = [(Ertrag / Investition)^(1/n) − 1] × 100
  // Basis: Anfangsinvestition ohne Betriebskosten (vergleichbar mit Standard-AROI-Definitionen)
  const aroiRaw = Math.pow(ertrag / investition, 1 / laufzeit) - 1;
  const aroi = round4(aroiRaw * 100);

  // Amortisation: Investition / (jährlicher Nettogewinn)
  // Jährlicher Nettogewinn = (Ertrag − Betriebskosten × Laufzeit) / Laufzeit
  const jährlicherNetto = (ertrag - gesamtBetriebskosten) / laufzeit;
  let amortisation: number | null = null;
  if (jährlicherNetto > 0) {
    amortisation = round2(investition / jährlicherNetto);
  }

  const formelText =
    `(${formatEuro(ertrag)} − ${formatEuro(investition)} − ${formatEuro(gesamtBetriebskosten)}) / ${formatEuro(investition)} × 100 = ${formatProzent(roi, 2)} %`;
  const aroiFormelText =
    `(${formatEuro(ertrag)} / ${formatEuro(investition)})^(1/${laufzeit}) − 1 = ${formatProzent(aroi, 2)} % p.a.`;

  return { roi, gewinn, status, formelText, aroi, gesamtBetriebskosten, amortisation, aroiFormelText };
}

// ---------------------------------------------------------------------------
// Mode 3 — DuPont-Schema
// ---------------------------------------------------------------------------

/**
 * DuPont-Berechnung: ROI = Umsatzrendite × Kapitalumschlag
 *
 * @param gewinn          Betriebsgewinn/Jahresüberschuss in €
 * @param nettoumsatz     Nettoumsatz in € (> 0)
 * @param gesamtkapital   Gesamtkapital / investiertes Kapital in € (> 0)
 */
export function computeRoiDupont(
  gewinn: number,
  nettoumsatz: number,
  gesamtkapital: number,
): RoiDupontResult {
  const umsatzrenditeRaw = (gewinn / nettoumsatz) * 100;
  const kapitalumschlagRaw = nettoumsatz / gesamtkapital;
  const roiRaw = umsatzrenditeRaw * kapitalumschlagRaw; // = gewinn/gesamtkapital × 100

  const umsatzrendite = round4(umsatzrenditeRaw);
  const kapitalumschlag = round4(kapitalumschlagRaw);
  const roi = round4(roiRaw);
  const status = toStatus(roi);

  const formelText =
    `Umsatzrendite ${formatProzent(umsatzrendite, 2)} % × Kapitalumschlag ${kapitalumschlag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${formatProzent(roi, 2)} %`;

  return { roi, umsatzrendite, kapitalumschlag, status, formelText };
}

// ---------------------------------------------------------------------------
// Fallback text formatter (für Formatter-Shell)
// ---------------------------------------------------------------------------

/**
 * Text-Fallback für die generische Formatter-Komponente.
 * Input-Format: "investition;ertrag" (Basis-Modus)
 * Beispiel: "50000;63400" → ROI für 50.000 € Investition, 63.400 € Ertrag
 */
function formatRoi(input: string): string {
  try {
    const parts = input.split(';').map((s) => s.trim());
    const investition = parseDE(parts[0] ?? '');
    const ertrag = parseDE(parts[1] ?? '');

    if (!Number.isFinite(investition) || investition <= 0) {
      return 'Fehler: Investition muss eine positive Zahl sein.';
    }
    if (!Number.isFinite(ertrag)) {
      return 'Fehler: Bitte einen gültigen Ertrag eingeben.';
    }

    const r = computeRoiBasis(investition, ertrag);
    return [
      `ROI: ${formatProzent(r.roi, 2)} %`,
      `Gewinn/Verlust: ${formatEuro(r.gewinn)} €`,
      `Status: ${r.status === 'gewinn' ? 'Gewinn' : r.status === 'verlust' ? 'Verlust' : 'Break-Even'}`,
      `Formel: ${r.formelText}`,
    ].join('\n');
  } catch {
    return input;
  }
}

export const roiRechner: FormatterConfig = {
  id: 'roi-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatRoi,
  placeholder: '50000;63400  (Investition;Ertrag in €)',
};
