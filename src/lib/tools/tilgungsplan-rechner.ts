import type { FormatterConfig } from './schemas';

/**
 * Tilgungsplan-Rechner — Annuitätendarlehen-Berechnung.
 * Formel: A = K × (q^n × i) / (q^n − 1)
 * K = Darlehensbetrag, i = Monatszins, q = 1+i, n = Laufzeit in Monaten.
 * Pure client-side, kein Server-Submit.
 */


/** Format monetary value to 2 decimal places, German locale (e.g. 1.234,56). */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format percentage to 2 decimal places, German locale. */
export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Monatliche Annuität given Darlehensbetrag K, Sollzins p.a. in %, Laufzeit in Monaten.
 * Zinssatz = 0%: simple division. Returns NaN for invalid inputs. */
export function computeMonatsrate(K: number, iJahrPct: number, nMonate: number): number {
  if (K <= 0 || nMonate <= 0) return NaN;
  const i = iJahrPct / 100 / 12;
  if (i === 0) return round2(K / nMonate);
  const q = 1 + i;
  const qn = Math.pow(q, nMonate);
  return round2((K * qn * i) / (qn - 1));
}

/** Monatliche Rate from Darlehensbetrag, Sollzins p.a., Anfangstilgung p.a. (all in %). */
export function computeMonatsrateFromAnfangstilgung(
  K: number,
  iJahrPct: number,
  anfangstilgungPct: number,
): number {
  return round2((K * (iJahrPct / 100 + anfangstilgungPct / 100)) / 12);
}

/** Laufzeit in Monaten given K, Monatsrate A, Sollzins p.a.
 * Returns Infinity if rate <= monthly interest (loan never paid off). */
export function computeLaufzeit(K: number, A: number, iJahrPct: number): number {
  const i = iJahrPct / 100 / 12;
  if (i === 0) {
    if (A <= 0) return Infinity;
    return Math.ceil(K / A);
  }
  const monthlyInterest = K * i;
  if (A <= monthlyInterest + 0.000001) return Infinity;
  const n = -Math.log(1 - (K * i) / A) / Math.log(1 + i);
  return Math.ceil(n);
}

/** Anfangstilgung p.a. in % derived from K, Monatsrate, Sollzins p.a. */
export function computeAnfangstilgungPct(K: number, A: number, iJahrPct: number): number {
  if (K <= 0) return NaN;
  return round2(((A * 12) / K - iJahrPct / 100) * 100);
}

export interface TilgungsplanJahrRow {
  jahr: number;
  rateJahr: number;          // Summe der Annuitätszahlungen im Jahr
  zinsenJahr: number;        // Zinsanteil kumuliert im Jahr
  tilgungJahr: number;       // Tilgungsanteil kumuliert im Jahr
  sondertilgungJahr: number; // Sondertilgung im Jahr
  restschuld: number;        // Restschuld nach Jahresende (inkl. Sondertilgung)
  isZinsbindungsende: boolean;
}

export interface TilgungsplanResult {
  monatsrate: number;
  anfangstilgungPct: number;
  gesamtZinsen: number;
  restschuldNachZinsbindung: number;
  laufzeitMonate: number;
  laufzeitJahre: number;
  rows: TilgungsplanJahrRow[];
  paradoxWarning: boolean;          // Anfangstilgung < 1,5% bei Zins > 3%
  sondertilgungEinsparungZinsen: number;
  sondertilgungVerkürzungMonate: number;
}

export interface TilgungsplanInput {
  betrag: number;
  zinssatzJahrPct: number;  // Sollzinssatz p.a. in %
  monatsrate: number;
  zinsbindungJahre: number;
  sondertilgungPA: number;  // Jährliche Sondertilgung in €
}

function runSimulation(
  betrag: number,
  zinssatzJahrPct: number,
  monatsrate: number,
  zinsbindungJahre: number,
  sondertilgungPA: number,
): {
  gesamtZinsen: number;
  laufzeitMonate: number;
  restschuldNachZinsbindung: number;
  rows: TilgungsplanJahrRow[];
} {
  const i = zinssatzJahrPct / 100 / 12;
  const A = monatsrate;
  const zinsbindungMonate = zinsbindungJahre * 12;
  const MAX_MONTHS = 600; // 50-Jahr Hard-Cap

  let rs = betrag;
  let monat = 0;
  let gesamtZinsen = 0;
  let restschuldNachZinsbindung = betrag;

  let yearZinsen = 0;
  let yearTilgung = 0;
  let yearSondertilgung = 0;
  let yearRate = 0;
  const rows: TilgungsplanJahrRow[] = [];

  while (rs > 0.005 && monat < MAX_MONTHS) {
    monat++;
    const monthInYear = ((monat - 1) % 12) + 1;
    const year = Math.ceil(monat / 12);

    const z = round2(rs * i);
    let t = round2(A - z);
    if (t < 0) t = 0;
    if (t > rs) t = rs;

    const actualPayment = round2(z + t);
    yearZinsen += z;
    yearTilgung += t;
    yearRate += actualPayment;
    gesamtZinsen = round2(gesamtZinsen + z);
    rs = round2(rs - t);

    if (monat === zinsbindungMonate) {
      restschuldNachZinsbindung = rs;
    }

    // Sondertilgung am Jahresende (Monat 12, 24, 36, ...)
    if (sondertilgungPA > 0 && monthInYear === 12 && rs > 0.005) {
      const st = Math.min(sondertilgungPA, rs);
      rs = round2(rs - st);
      yearSondertilgung += st;
    }

    // Jahreszeile pushen: am Ende des Jahres oder wenn Kredit abbezahlt
    if (monthInYear === 12 || rs <= 0.005) {
      rows.push({
        jahr: year,
        rateJahr: round2(yearRate),
        zinsenJahr: round2(yearZinsen),
        tilgungJahr: round2(yearTilgung),
        sondertilgungJahr: round2(yearSondertilgung),
        restschuld: round2(rs),
        isZinsbindungsende: year === zinsbindungJahre,
      });
      yearZinsen = 0;
      yearTilgung = 0;
      yearSondertilgung = 0;
      yearRate = 0;
    }
  }

  // Wenn Zinsbindung >= Gesamtlaufzeit: keine Restschuld nach Zinsbindung
  if (zinsbindungMonate >= monat) {
    restschuldNachZinsbindung = 0;
  }

  return {
    gesamtZinsen: round2(gesamtZinsen),
    laufzeitMonate: monat,
    restschuldNachZinsbindung: round2(restschuldNachZinsbindung),
    rows,
  };
}

export function computeTilgungsplan(input: TilgungsplanInput): TilgungsplanResult {
  const { betrag, zinssatzJahrPct, monatsrate, zinsbindungJahre, sondertilgungPA } = input;

  const withS = runSimulation(betrag, zinssatzJahrPct, monatsrate, zinsbindungJahre, sondertilgungPA);

  let sondertilgungEinsparungZinsen = 0;
  let sondertilgungVerkürzungMonate = 0;

  if (sondertilgungPA > 0) {
    const withoutS = runSimulation(betrag, zinssatzJahrPct, monatsrate, zinsbindungJahre, 0);
    sondertilgungEinsparungZinsen = round2(withoutS.gesamtZinsen - withS.gesamtZinsen);
    sondertilgungVerkürzungMonate = Math.max(0, withoutS.laufzeitMonate - withS.laufzeitMonate);
  }

  const anfangstilgungPct = computeAnfangstilgungPct(betrag, monatsrate, zinssatzJahrPct);
  // Tilgungsparadoxon: Anfangstilgung < 1,5% und Zinssatz > 3%
  const paradoxWarning = anfangstilgungPct < 1.5 && zinssatzJahrPct > 3;

  return {
    monatsrate,
    anfangstilgungPct,
    gesamtZinsen: withS.gesamtZinsen,
    restschuldNachZinsbindung: withS.restschuldNachZinsbindung,
    laufzeitMonate: withS.laufzeitMonate,
    laufzeitJahre: Math.ceil(withS.laufzeitMonate / 12),
    rows: withS.rows,
    paradoxWarning,
    sondertilgungEinsparungZinsen,
    sondertilgungVerkürzungMonate,
  };
}

function _formatPlaceholder(_input: string): string {
  return '';
}

export const tilgungsplanRechner: FormatterConfig = {
  id: 'amortization-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: _formatPlaceholder,
};
