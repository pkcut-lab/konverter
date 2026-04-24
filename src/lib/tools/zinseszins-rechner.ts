import type { FormatterConfig } from './schemas';

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

function format(_input: string): string {
  // Custom UI in ZinseszinsRechnerTool.svelte — format() not used at runtime.
  return '';
}

export const zinseszinsRechner: FormatterConfig = {
  id: 'compound-interest-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format,
  placeholder: '',
};
