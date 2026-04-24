import type { FormatterConfig } from './schemas';

/**
 * Kreditrechner — Annuitätendarlehen + Sondertilgungs-Sparrechner.
 *
 * Formeln:
 *   q = 1 + (sollzins_pa / 100 / 12)                  — monatlicher Zinsfaktor
 *   Monatsrate = K × (q^n × (q−1)) / (q^n − 1)        — Annuitätenformel
 *   Restschuld_t = Restschuld_{t-1} − (Rate − Zins_t)  — Tilgungsplan
 *
 * Floating-Point-Strategie: round2() nach jeder Rechenschritt — vermeidet
 * 0.1+0.2-Fehler ohne externe Bibliothek. Alle Ausgaben kaufmännisch gerundet
 * auf 2 Dezimalstellen.
 *
 * Pure client-side, kein Server-Submit, keine externen Abhängigkeiten.
 */

/** Kaufmännisch auf 2 Dezimalstellen runden. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Berechnet die monatliche Annuitätenrate.
 * Gibt NaN zurück bei ungültigen Parametern (kreditbetrag ≤ 0, sollzins ≤ 0, laufzeit < 1).
 */
export function computeMonatsrate(
  kreditbetrag: number,
  sollzinsPa: number,
  laufzeitMonate: number,
): number {
  if (
    !Number.isFinite(kreditbetrag) ||
    kreditbetrag <= 0 ||
    !Number.isFinite(sollzinsPa) ||
    sollzinsPa <= 0 ||
    !Number.isFinite(laufzeitMonate) ||
    laufzeitMonate < 1
  ) {
    return NaN;
  }
  const n = Math.round(laufzeitMonate);
  const q = 1 + sollzinsPa / 100 / 12;
  const qn = Math.pow(q, n);
  return round2((kreditbetrag * (qn * (q - 1))) / (qn - 1));
}

export interface TilgungsplanZeile {
  monat: number;
  zinsanteil: number;
  tilgungsanteil: number;
  sondertilgung: number;
  restschuld: number;
}

/**
 * Erstellt den monatlichen Tilgungsplan.
 * Jährliche Sondertilgung wird am Ende jedes 12. Monats von der Restschuld abgezogen.
 * Die Monatsrate bleibt konstant; Sondertilgungen verkürzen die Laufzeit.
 * Gibt [] zurück bei ungültigen Parametern.
 */
export function buildTilgungsplan(
  kreditbetrag: number,
  sollzinsPa: number,
  laufzeitMonate: number,
  sondertilgungPa: number = 0,
): TilgungsplanZeile[] {
  const monatsrate = computeMonatsrate(kreditbetrag, sollzinsPa, Math.round(laufzeitMonate));
  if (!Number.isFinite(monatsrate)) return [];

  const monatszins = sollzinsPa / 100 / 12;
  const zeilen: TilgungsplanZeile[] = [];
  let restschuld = kreditbetrag;
  const maxMonate = Math.round(laufzeitMonate);

  for (let t = 1; t <= maxMonate && restschuld > 0.005; t++) {
    const zinsanteil = round2(restschuld * monatszins);
    // Im letzten Monat Rate auf verbleibende Restschuld begrenzen
    const tilgungRaw = monatsrate - zinsanteil;
    const tilgungsanteil = round2(Math.min(tilgungRaw, restschuld));

    restschuld = round2(restschuld - tilgungsanteil);

    // Jährliche Sondertilgung am Ende jedes 12. Monats
    let st = 0;
    if (sondertilgungPa > 0 && t % 12 === 0 && restschuld > 0.005) {
      st = round2(Math.min(sondertilgungPa, restschuld));
      restschuld = round2(restschuld - st);
    }

    zeilen.push({
      monat: t,
      zinsanteil,
      tilgungsanteil,
      sondertilgung: st,
      restschuld: Math.max(0, restschuld),
    });

    if (restschuld <= 0.005) break;
  }

  return zeilen;
}

/**
 * Berechnet Kernergebnisse inkl. Sondertilgungs-Delta-Anzeige.
 * Differenzierung H2: Delta-Darstellung für Sondertilgung (Ersparnis in € + Monate).
 */
export function computeKreditErgebnis(
  kreditbetrag: number,
  sollzinsPa: number,
  laufzeitMonate: number,
  sondertilgungPa: number = 0,
): {
  monatsrate: number;
  gesamtzinsen: number;
  gesamtkosten: number;
  ersparnis_zinsen: number;
  ersparnis_monate: number;
} {
  const n = Math.round(laufzeitMonate);
  const monatsrate = computeMonatsrate(kreditbetrag, sollzinsPa, n);

  if (!Number.isFinite(monatsrate)) {
    return { monatsrate: NaN, gesamtzinsen: NaN, gesamtkosten: NaN, ersparnis_zinsen: 0, ersparnis_monate: 0 };
  }

  // Baseline: ohne Sondertilgung
  const planOhne = buildTilgungsplan(kreditbetrag, sollzinsPa, n, 0);
  const gesamtzinsenOhne = round2(planOhne.reduce((s, z) => s + z.zinsanteil, 0));

  if (sondertilgungPa <= 0) {
    return {
      monatsrate,
      gesamtzinsen: gesamtzinsenOhne,
      gesamtkosten: round2(kreditbetrag + gesamtzinsenOhne),
      ersparnis_zinsen: 0,
      ersparnis_monate: 0,
    };
  }

  // Mit Sondertilgung
  const planMit = buildTilgungsplan(kreditbetrag, sollzinsPa, n, sondertilgungPa);
  const gesamtzinsenMit = round2(planMit.reduce((s, z) => s + z.zinsanteil, 0));
  const gesamtkosten = round2(kreditbetrag + gesamtzinsenMit);

  return {
    monatsrate,
    gesamtzinsen: gesamtzinsenMit,
    gesamtkosten,
    ersparnis_zinsen: round2(gesamtzinsenOhne - gesamtzinsenMit),
    ersparnis_monate: planOhne.length - planMit.length,
  };
}

export const kreditrechner: FormatterConfig = {
  id: 'loan-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  // format() is a required FormatterConfig field; the custom KreditrechnerTool
  // UI handles all logic directly via computeKreditErgebnis / buildTilgungsplan.
  format: (input: string) => input,
};
