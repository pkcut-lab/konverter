import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * Cashflow-Rechner — drei Methoden in einem Tool.
 *
 * Differenzierung laut Dossier §9:
 * H1 — Einziger DE-Rechner mit direkter + indirekter Methode kombiniert.
 *       Tab-Wechsel, live Formel-Aufschlüsselung, Methoden-Erklärung.
 * H2 — Gewinn-vs-Liquiditäts-Lernmoment: "Dein Unternehmen macht X € Gewinn,
 *       hat aber nur Y € Cashflow — weil Abschreibungen und Working Capital
 *       nicht zahlungswirksam sind." Aktiv erklärt, nicht nur Zahl ausgegeben.
 * H3 — Free-Cashflow-Modus (OCF − CapEx) — lückenloser DE-Markt.
 *
 * Formeln:
 * Direkt:   CF = Einzahlungen − Auszahlungen
 * Indirekt: OCF = Jahresüberschuss + AfA + ΔRückstellungen − ΔForderungen − ΔVorräte + ΔVerbindlichkeiten
 * Freier CF: FCF = OCF − CapEx
 *
 * Security: Ausgabe ausschließlich via textContent (kein innerHTML). Inputs
 * werden normalisiert (DE-Dezimalkomma → JS-Float) vor jeder Arithmetik.
 */

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type CashflowStatus = 'positiv' | 'negativ' | 'null';

export interface DirectResult {
  cashflow: number;
  einzahlungen: number;
  auszahlungen: number;
  status: CashflowStatus;
  formelText: string;
}

export interface IndirectResult {
  ocf: number;
  jahresueberschuss: number;
  afa: number;
  rueckstellungenDelta: number;
  forderungenDelta: number;
  vorräteDelta: number;
  verbindlichkeitenDelta: number;
  status: CashflowStatus;
  formelText: string;
  /** true wenn AfA/WC-Korrekturen den Cashflow gegenüber JU wesentlich verändern */
  hatLernmoment: boolean;
}

export interface FreeCfResult {
  ocf: number;
  capex: number;
  freeCf: number;
  status: CashflowStatus;
  formelText: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  try {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return n.toFixed(2);
  }
}

function toStatus(cf: number): CashflowStatus {
  if (cf > 0) return 'positiv';
  if (cf < 0) return 'negativ';
  return 'null';
}

// ---------------------------------------------------------------------------
// Mode 1 — Direkte Methode
// ---------------------------------------------------------------------------

/**
 * Direkte Methode: CF = Einzahlungen − Auszahlungen
 *
 * @param einzahlungen  Einzahlungen in € (≥ 0)
 * @param auszahlungen  Auszahlungen in € (≥ 0)
 */
export function computeCashflowDirekt(
  einzahlungen: number,
  auszahlungen: number,
): DirectResult {
  const cashflow = round2(einzahlungen - auszahlungen);
  const status = toStatus(cashflow);
  const formelText =
    `${formatEuro(einzahlungen)} − ${formatEuro(auszahlungen)} = ${formatEuro(cashflow)} €`;
  return { cashflow, einzahlungen, auszahlungen, status, formelText };
}

// ---------------------------------------------------------------------------
// Mode 2 — Indirekte Methode
// ---------------------------------------------------------------------------

/**
 * Indirekte Methode (HGB/IFRS-Standard):
 * OCF = Jahresüberschuss + AfA + ΔRückstellungen − ΔForderungen − ΔVorräte + ΔVerbindlichkeiten
 *
 * Vorzeichen-Konvention (positiver Wert = verbessert Cashflow):
 * - AfA:                immer positiv (nicht zahlungswirksamer Aufwand)
 * - ΔRückstellungen:    + = Rückstellungen gestiegen (erhöht OCF), − = gesunken
 * - ΔForderungen:       + = Forderungen gestiegen → verschlechtert OCF → intern negiert
 * - ΔVorräte:           + = Vorräte gestiegen → verschlechtert OCF → intern negiert
 * - ΔVerbindlichkeiten: + = Verbindlichkeiten gestiegen (erhöht OCF)
 *
 * @param jahresueberschuss  Jahresüberschuss (darf negativ sein — Verlustjahr)
 * @param afa                Abschreibungen (≥ 0)
 * @param rueckstellungenDelta  Änderung Rückstellungen (+ = gestiegen)
 * @param forderungenDelta   Änderung Forderungen (+ = gestiegen, verschlechtert OCF)
 * @param vorräteDelta      Änderung Vorräte (+ = gestiegen, verschlechtert OCF)
 * @param verbindlichkeitenDelta  Änderung Verbindlichkeiten (+ = gestiegen, verbessert OCF)
 */
export function computeCashflowIndirekt(
  jahresueberschuss: number,
  afa: number,
  rueckstellungenDelta: number,
  forderungenDelta: number,
  vorräteDelta: number,
  verbindlichkeitenDelta: number,
): IndirectResult {
  const ocf = round2(
    jahresueberschuss +
      afa +
      rueckstellungenDelta -
      forderungenDelta -
      vorräteDelta +
      verbindlichkeitenDelta,
  );
  const status = toStatus(ocf);

  // Lernmoment: Cashflow weicht signifikant vom Jahresüberschuss ab
  const hatLernmoment =
    Math.abs(ocf - jahresueberschuss) > 500 ||
    (jahresueberschuss !== 0 && Math.sign(ocf) !== Math.sign(jahresueberschuss));

  return {
    ocf,
    jahresueberschuss,
    afa,
    rueckstellungenDelta,
    forderungenDelta,
    vorräteDelta,
    verbindlichkeitenDelta,
    status,
    formelText: buildIndirectFormelText(
        jahresueberschuss, afa, rueckstellungenDelta, forderungenDelta, vorräteDelta, verbindlichkeitenDelta, ocf,
      ),
    hatLernmoment,
  };
}


function buildIndirectFormelText(
  ju: number,
  afa: number,
  rueckst: number,
  ford: number,
  vorr: number,
  verb: number,
  ocf: number,
): string {
  return `JÜ ${formatEuro(ju)} + AfA ${formatEuro(afa)} + ΔRückst. ${formatEuro(rueckst)} − ΔFord. ${formatEuro(ford)} − ΔVorr. ${formatEuro(vorr)} + ΔVerb. ${formatEuro(verb)} = ${formatEuro(ocf)} €`;
}

// ---------------------------------------------------------------------------
// Mode 3 — Free Cashflow
// ---------------------------------------------------------------------------

/**
 * Free Cashflow: FCF = OCF − CapEx
 *
 * @param ocf    Operativer Cashflow in € (aus Modus 2 oder direkt eingegeben)
 * @param capex  Investitionsauszahlungen (Capital Expenditures) in € (≥ 0)
 */
export function computeFreeCashflow(ocf: number, capex: number): FreeCfResult {
  const freeCf = round2(ocf - capex);
  const status = toStatus(freeCf);
  const formelText =
    `${formatEuro(ocf)} − ${formatEuro(capex)} = ${formatEuro(freeCf)} €`;
  return { ocf, capex, freeCf, status, formelText };
}

// ---------------------------------------------------------------------------
// Fallback text formatter (für Formatter-Shell)
// ---------------------------------------------------------------------------

/**
 * Text-Fallback für die generische Formatter-Komponente.
 * Input-Format: "Einzahlungen;Auszahlungen" (Direkte Methode)
 */
function formatCashflow(input: string): string {
  try {
    const parts = input.split(';').map((s) => s.trim());
    const einz = parseDE(parts[0] ?? '');
    const ausz = parseDE(parts[1] ?? '');

    if (!Number.isFinite(einz) || einz < 0) {
      return 'Fehler: Bitte gültige Einzahlungen eingeben.';
    }
    if (!Number.isFinite(ausz) || ausz < 0) {
      return 'Fehler: Bitte gültige Auszahlungen eingeben.';
    }

    const r = computeCashflowDirekt(einz, ausz);
    const statusText =
      r.status === 'positiv' ? 'Positiv (Liquiditätszufluss)'
      : r.status === 'negativ' ? 'Negativ (Liquiditätsrisiko)'
      : 'Null (Break-Even)';
    return [
      `Cashflow: ${formatEuro(r.cashflow)} €`,
      `Status: ${statusText}`,
      `Formel: ${r.formelText}`,
    ].join('\n');
  } catch {
    return input;
  }
}

export const cashflowRechner: FormatterConfig = {
  id: 'cash-flow-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatCashflow,
  placeholder: 'Einzahlungen;Auszahlungen in € (z.B. 85000;72000)',
};
