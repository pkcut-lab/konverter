import type { CalculatorConfig } from './schemas';

/**
 * Zinseszins-Rechner — monatlicher Sparplan mit Steuer, Inflation und TER.
 *
 * Differenzierung (Dossier §9):
 * H1 — 100 % clientseitig + vollständige Steuerberechnung (Abgeltungssteuer +
 *      Sparerpauschbetrag) ohne Email-Gate oder Lead-Capture.
 * H2 — Drei-Szenarien-Output: nominal / nach Steuer / real (Kaufkraft).
 *
 * Formeln:
 *   Monatlicher Zinsfaktor: r = (1 + p_eff/100)^(1/12) − 1
 *   Sparplan-Simulation:    K_{m+1} = K_m × (1 + r) + sparrate
 *   Steuer (jährlich):      max(0, Jahreserträge − 1.000 €) × 0,26375
 *   Realkaufkraft (Fisher): Kn_real = Kn_netto / (1 + i/100)^n
 */

/** Sparerpauschbetrag Alleinstehend, Stand 2026 (§ 20 Abs. 9 EStG). */
const SPARERPAUSCHBETRAG = 1000;

/**
 * Effektivsatz Abgeltungssteuer inkl. Solidaritätszuschlag:
 * 25 % KapESt + 5,5 % × 25 % Soli = 26,375 %.
 */
const ABGELTUNGSTEUER = 0.26375;

export interface ZinseszinsResult {
  endkapital_nominal: number;
  endkapital_netto: number;
  endkapital_real: number;
  gesamteinzahlungen: number;
  zinsen_brutto: number;
  steuern_gesamt: number;
}

/**
 * Kernberechnung — monatliche Simulation mit jährlicher Steuerabrechnung.
 *
 * @param anfangskapital  Startkapital in € (≥ 0)
 * @param sparrate        Monatliche Einzahlung in € (≥ 0)
 * @param zinssatz        Jahreszinssatz in % (kann negativ sein: Strafzins)
 * @param laufzeit        Laufzeit in Jahren, wird auf [1, 80] geklemmt
 * @param inflationsrate  Inflationsrate in % p. a. (≥ 0, Standard 2)
 * @param ter             Jährliche Kostenquote/TER in % (≥ 0, mindert Zinssatz)
 */
export function computeZinseszinsCalc(
  anfangskapital: number,
  sparrate: number,
  zinssatz: number,
  laufzeit: number,
  inflationsrate: number,
  ter: number,
): ZinseszinsResult {
  const n = Math.round(Math.max(1, Math.min(80, laufzeit)));

  // Effektiver Netto-Jahreszins nach Kosten
  const effectiveAnnualRate = zinssatz - ter;

  // Monatlicher Zinsfaktor (exakte Umrechnung aus Jahreszinssatz)
  const r = (1 + effectiveAnnualRate / 100) ** (1 / 12) - 1;

  let capital = anfangskapital;
  let totalInterest = 0;
  let totalTax = 0;

  for (let y = 0; y < n; y++) {
    let yearlyInterest = 0;

    for (let m = 0; m < 12; m++) {
      const interest = capital * r;
      capital += interest + sparrate;
      yearlyInterest += interest;
    }

    // Abgeltungssteuer: 26,375 % auf Jahreserträge über Sparerpauschbetrag
    const taxable = Math.max(0, yearlyInterest - SPARERPAUSCHBETRAG);
    totalTax += taxable * ABGELTUNGSTEUER;
    totalInterest += yearlyInterest;
  }

  const gesamteinzahlungen = anfangskapital + sparrate * n * 12;
  const endkapital_nominal = capital;

  // Steuer wird vom nominalen Endwert abgezogen (vereinfacht: kumuliert, nicht re-investiert)
  const endkapital_netto = Math.max(0, endkapital_nominal - totalTax);

  // Reale Kaufkraft: Fisher-Gleichung (nicht naive Subtraktion)
  const inflationFactor = (1 + inflationsrate / 100) ** n;
  const endkapital_real = endkapital_netto / (inflationFactor > 0 ? inflationFactor : 1);

  return {
    endkapital_nominal: round2(endkapital_nominal),
    endkapital_netto: round2(endkapital_netto),
    endkapital_real: round2(endkapital_real),
    gesamteinzahlungen: round2(gesamteinzahlungen),
    zinsen_brutto: round2(totalInterest),
    steuern_gesamt: round2(totalTax),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function compute(inputs: Record<string, number>): Record<string, number> {
  const r = computeZinseszinsCalc(
    Math.max(0, inputs['anfangskapital'] ?? 0),
    Math.max(0, inputs['sparrate'] ?? 0),
    inputs['zinssatz'] ?? 5,
    inputs['laufzeit'] ?? 10,
    Math.max(0, inputs['inflationsrate'] ?? 2),
    Math.max(0, inputs['ter'] ?? 0),
  );
  return {
    endkapital_nominal: r.endkapital_nominal,
    endkapital_netto: r.endkapital_netto,
    endkapital_real: r.endkapital_real,
    gesamteinzahlungen: r.gesamteinzahlungen,
    zinsen_brutto: r.zinsen_brutto,
    steuern_gesamt: r.steuern_gesamt,
  };
}

export const zinseszinsRechner: CalculatorConfig = {
  id: 'compound-interest-calculator',
  type: 'calculator',
  categoryId: 'finance',
  inputs: [
    { id: 'anfangskapital', label: 'Anfangskapital (€)' },
    { id: 'sparrate', label: 'Monatliche Sparrate (€)' },
    { id: 'zinssatz', label: 'Zinssatz (% p.\u00A0a.)' },
    { id: 'laufzeit', label: 'Laufzeit (Jahre)' },
    { id: 'inflationsrate', label: 'Inflationsrate (%)' },
    { id: 'ter', label: 'Kosten\u00A0/\u00A0TER (% p.\u00A0a.)' },
  ],
  outputs: [
    { id: 'endkapital_nominal', label: 'Endkapital nominal (€)' },
    { id: 'endkapital_netto', label: 'Endkapital nach Steuer (€)' },
    { id: 'endkapital_real', label: 'Endkapital real\u00A0/\u00A0Kaufkraft (€)' },
    { id: 'gesamteinzahlungen', label: 'Gesamte Einzahlungen (€)' },
    { id: 'zinsen_brutto', label: 'Zinsertr\u00E4ge brutto (€)' },
    { id: 'steuern_gesamt', label: 'Steuern gesamt (€)' },
  ],
  compute,
};
