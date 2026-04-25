import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * Skonto-Rechner — Skontobetrag, Zahlbetrag und effektiver Jahreszins.
 *
 * Formeln:
 *   Skontobetrag   = Rechnungsbetrag × (Skontosatz / 100)
 *   Zahlbetrag     = Rechnungsbetrag − Skontobetrag
 *
 *   Effektiver Jahreszins (kaufmännisch, 360 Tage):
 *     EJZ = (Skontosatz / (100 − Skontosatz)) × (360 / (Zahlungsziel − Skontofrist)) × 100
 *
 *   Netto-Variante (bei Brutto-Eingabe + MwSt-Satz):
 *     Netto_nach_Skonto   = Netto_vor_Skonto × (1 − Skontosatz/100)
 *     MwSt_nach_Skonto    = Netto_nach_Skonto × (MwStSatz/100)
 *     Brutto_nach_Skonto  = Netto_nach_Skonto + MwSt_nach_Skonto
 *
 * Differenzierung:
 *   H1 — Privacy-First Brutto/Netto-Toggle (Dossier §9 H1)
 *   H2 — Effektiver Jahreszins als Haupt-Insight mit Ampel-Empfehlung (Dossier §9 H2)
 *   + Live-on-Typing, Copy-Buttons — kein Konkurrent hat beides (Dossier §5)
 *
 * Pure client-side, kein Server-Submit.
 */

export interface SkontoResult {
  skontoBetrag: number;
  zahlBetrag: number;
  effJahreszins: number | null; // null wenn Division-by-Zero
  /** Nur bei Netto-Modus mit MwSt: aufgeschlüsselte Beträge */
  nettoBasis?: {
    nettoVorSkonto: number;
    nettoNachSkonto: number;
    mwstNachSkonto: number;
    bruttoNachSkonto: number;
  };
}

export type AmpelStatus = 'gruen' | 'gelb' | 'rot' | null;

/** Rundet auf 2 Nachkommastellen (kaufmännisch). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Rundet auf 2 Nachkommastellen für Jahreszins-Anzeige. */
export function round2Dec(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formatiert Geldbetrag auf 2 Dezimalstellen, DE-Lokale (z.B. 1.234,56). */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formatiert Prozentwert auf 1–2 Dezimalstellen, DE-Lokale. */
export function formatProzent(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Berechnet Skontobetrag, Zahlbetrag und effektiven Jahreszins.
 * @param rechnungsBetrag  Rechnungsbetrag (Brutto oder Netto), > 0
 * @param skontosatz       Skontosatz in %, 0 < satz < 100
 * @param skontofrist      Skontofrist in Tagen, ≥ 0
 * @param zahlungsziel     Zahlungsziel in Tagen, > skontofrist
 * @param mwstSatz         Optionaler MwSt-Satz (%) wenn Netto-Modus aktiv, ≥ 0
 */
export function computeSkonto(
  rechnungsBetrag: number,
  skontosatz: number,
  skontofrist: number,
  zahlungsziel: number,
  mwstSatz?: number,
): SkontoResult {
  const skontoBetrag = round2(rechnungsBetrag * (skontosatz / 100));
  const zahlBetrag = round2(rechnungsBetrag - skontoBetrag);

  const fristen_diff = zahlungsziel - skontofrist;
  let effJahreszins: number | null = null;
  if (fristen_diff > 0) {
    effJahreszins = round2Dec((skontosatz / (100 - skontosatz)) * (360 / fristen_diff) * 100);
  }

  if (mwstSatz !== undefined && mwstSatz >= 0) {
    // Netto-Modus: rechnungsBetrag ist Nettobetrag
    const nettoVorSkonto = rechnungsBetrag;
    const nettoNachSkonto = round2(nettoVorSkonto * (1 - skontosatz / 100));
    const mwstNachSkonto = round2(nettoNachSkonto * (mwstSatz / 100));
    const bruttoNachSkonto = round2(nettoNachSkonto + mwstNachSkonto);
    return {
      skontoBetrag,
      zahlBetrag,
      effJahreszins,
      nettoBasis: { nettoVorSkonto, nettoNachSkonto, mwstNachSkonto, bruttoNachSkonto },
    };
  }

  return { skontoBetrag, zahlBetrag, effJahreszins };
}

/**
 * Ampel-Status für Effektiven Jahreszins:
 * - gruen:  EJZ > 10 % (Skonto lohnt sich fast immer)
 * - gelb:   EJZ 5–10 % (abhängig vom eigenen Finanzierungszins)
 * - rot:    EJZ < 5 % (selten — kein Skonto nötig)
 * - null:   kein Jahreszins berechnet
 */
export function getAmpelStatus(effJahreszins: number | null): AmpelStatus {
  if (effJahreszins === null || !Number.isFinite(effJahreszins)) return null;
  if (effJahreszins > 10) return 'gruen';
  if (effJahreszins >= 5) return 'gelb';
  return 'rot';
}

/**
 * Fallback-Text-Formatter für die FormatterConfig-Shell.
 * Erwartet: "Betrag Satz Skontofrist Zahlungsziel" (leerzeichen-getrennt).
 * Die Custom-Komponente SkontoRechnerTool.svelte ruft computeSkonto() direkt auf.
 */
function formatSkonto(input: string): string {
  const parts = input.trim().split(/[\s,;]+/);
  const betrag = parseDE(parts[0] ?? '');
  const satz = parseDE(parts[1] ?? '');
  const skontofrist = parseDE(parts[2] ?? '10');
  const zahlungsziel = parseDE(parts[3] ?? '30');
  if (!Number.isFinite(betrag) || betrag <= 0) return '';
  if (!Number.isFinite(satz) || satz <= 0 || satz >= 100) return '';
  if (!Number.isFinite(skontofrist) || skontofrist < 0) return '';
  if (!Number.isFinite(zahlungsziel) || zahlungsziel <= skontofrist) return '';
  const r = computeSkonto(betrag, satz, skontofrist, zahlungsziel);
  const lines = [
    `Skontobetrag: ${formatEuro(r.skontoBetrag)} €`,
    `Zahlbetrag: ${formatEuro(r.zahlBetrag)} €`,
  ];
  if (r.effJahreszins !== null) {
    lines.push(`Effektiver Jahreszins: ${formatProzent(r.effJahreszins)} %`);
  }
  return lines.join('\n');
}

export const skontoRechner: FormatterConfig = {
  id: 'cash-discount-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatSkonto,
  placeholder: 'Betrag Skontosatz% Skontofrist Zahlungsziel (z.B. 1000 2 10 30)',
};
