import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * Erbschaftsteuer-Rechner 2026 — DE.
 * Rechtsgrundlage: ErbStG §§ 13, 13d, 14, 15, 16, 17, 19, 24.
 * Steuerklassen, Freibeträge und Steuersätze gemäß aktuellem Stand (2026).
 * Erbfallkostenpauschale 15.000 EUR (seit 2025, vorher 10.300 EUR).
 *
 * Differenzierung per Dossier §9:
 * B — Berater-Export / Copy-Button: strukturierter Plaintext aller Eingaben + Ergebnis.
 * Bewusste Lücken: Betriebsvermögen §§13a/13b, internationale Erbschaften,
 * Vor-/Nacherbschaft → Hinweis im Ergebnis.
 *
 * Security: keine eval-Pfade, alle Ausgaben via textContent (Svelte-Standard).
 * Inputs werden via parseDE zu Float normalisiert; negative/NaN → Fehler.
 * Pure client-side, kein Server-Submit.
 */

// ─────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────

export type Verwandtschaftsgrad =
  | 'ehepartner'
  | 'kind'
  | 'enkel-eltern-verstorben'
  | 'enkel-eltern-leben'
  | 'eltern-grosseltern'
  | 'geschwister'
  | 'nichten-neffen'
  | 'schwiegereltern-stiefeltern'
  | 'sonstiges';

export type Steuerklasse = 1 | 2 | 3;

// ─────────────────────────────────────────────
// Konstanten
// ─────────────────────────────────────────────

const ERBFALLKOSTENPAUSCHALE = 15_000; // §10 Abs. 5 Nr. 3 ErbStG, seit 2025
const HAUSRAT_STKL_I = 41_000;         // §13 Abs. 1 Nr. 1 ErbStG, StKl I
const HAUSRAT_STKL_II_III = 12_000;    // StKl II/III

type BandEntry = { limit: number; rate: number };

const BANDS: Record<Steuerklasse, BandEntry[]> = {
  1: [
    { limit: 75_000, rate: 0.07 },
    { limit: 300_000, rate: 0.11 },
    { limit: 600_000, rate: 0.15 },
    { limit: 6_000_000, rate: 0.19 },
    { limit: 13_000_000, rate: 0.23 },
    { limit: 26_000_000, rate: 0.27 },
    { limit: Infinity, rate: 0.30 },
  ],
  2: [
    { limit: 75_000, rate: 0.15 },
    { limit: 300_000, rate: 0.20 },
    { limit: 600_000, rate: 0.25 },
    { limit: 6_000_000, rate: 0.30 },
    { limit: 13_000_000, rate: 0.35 },
    { limit: 26_000_000, rate: 0.40 },
    { limit: Infinity, rate: 0.43 },
  ],
  3: [
    { limit: 6_000_000, rate: 0.30 },
    { limit: Infinity, rate: 0.50 },
  ],
};

// Persönlicher Freibetrag §16 ErbStG
const FREIBETRAG: Record<Verwandtschaftsgrad, number> = {
  ehepartner: 500_000,
  kind: 400_000,
  'enkel-eltern-verstorben': 400_000,
  'enkel-eltern-leben': 200_000,
  'eltern-grosseltern': 100_000,
  geschwister: 20_000,
  'nichten-neffen': 20_000,
  'schwiegereltern-stiefeltern': 20_000,
  sonstiges: 20_000,
};

// Steuerklasse per Verwandtschaftsgrad §15 ErbStG
const STKL: Record<Verwandtschaftsgrad, Steuerklasse> = {
  ehepartner: 1,
  kind: 1,
  'enkel-eltern-verstorben': 1,
  'enkel-eltern-leben': 1,
  'eltern-grosseltern': 1,
  geschwister: 2,
  'nichten-neffen': 2,
  'schwiegereltern-stiefeltern': 2,
  sonstiges: 3,
};

// ─────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────

/** Versorgungsfreibetrag §17 ErbStG für Kinder nach Alter (0–27 J.). */
export function versorgungsfreibetragKind(alterJahre: number): number {
  if (alterJahre <= 5) return 52_000;
  if (alterJahre <= 10) return 41_000;
  if (alterJahre <= 15) return 30_700;
  if (alterJahre <= 20) return 20_500;
  if (alterJahre <= 27) return 10_300;
  return 0;
}

/**
 * Steuerbetrag für einen steuerpflichtigen Erwerb unter Anwendung des
 * Härtteausgleichs §24 ErbStG.
 *
 * §24: Übersteigt die Steuer auf Erwerb E nach Rate r_high den Betrag
 * [Steuer(T_lower) + 0,5 × (E − T_lower)], so wird letzterer angewendet.
 * Dies verhindert, dass ein leichter Bandübertritt zu massiv höherer Steuer führt.
 */
export function berechneRohsteuer(erwerb: number, stkl: Steuerklasse): number {
  if (erwerb <= 0) return 0;
  const bands = BANDS[stkl];
  const idx = bands.findIndex((b) => erwerb <= b.limit);
  const bandIdx = idx === -1 ? bands.length - 1 : idx;
  const band = bands[bandIdx]!;
  const regularTax = round2(erwerb * band.rate);
  if (bandIdx === 0) return regularTax; // erstes Band → kein Härtteausgleich
  const lowerBand = bands[bandIdx - 1]!;
  const taxAtLower = berechneRohsteuer(lowerBand.limit, stkl); // rekursiv, terminiert
  const haerteTax = round2(taxAtLower + 0.5 * (erwerb - lowerBand.limit));
  return Math.min(regularTax, haerteTax);
}

/** Rundet auf 2 Nachkommastellen (kaufmännisch). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formatiert einen Eurobetrag im deutschen Format (z.B. 1.234,00). */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  try {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return n.toFixed(2);
  }
}

/** Formatiert einen Eurobetrag als gerundete ganze Zahl (1.234). */
export function formatEuroRound(n: number): string {
  if (!Number.isFinite(n)) return '';
  try {
    return Math.round(n).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  } catch {
    return Math.round(n).toString();
  }
}

/** Formatiert einen Steuersatz als Prozentzahl (z.B. 11 %). */
export function formatProzent(rate: number): string {
  return `${Math.round(rate * 100)} %`;
}

// ─────────────────────────────────────────────
// Ergebnis-Typen
// ─────────────────────────────────────────────

export interface ErbschaftsteuerParams {
  verwandtschaftsgrad: Verwandtschaftsgrad;
  nachlasswert: number;        // Brutto-Nachlass
  schulden: number;            // Verbindlichkeiten, ≥ 0
  familienheimWert: number;    // §13 Befreiung, 0 = nicht anwendbar
  mietwohnAbschlag: boolean;   // §13d 10%-Abschlag auf Mietwohngrundstücke
  mietwohnWert: number;        // Wert der Mietwohnimmobilie für §13d, 0 wenn n/a
  vorschenkungen: number;      // §14 Vorschenkungen letzte 10 Jahre, ≥ 0
  kindesalter: number;         // Alter des Kindes in Jahren, nur für 'kind'
}

export interface ErbschaftsteuerResult {
  // Bemessungsgrundlage — Aufschlüsselung
  nachlasswertBrutto: number;
  schulden: number;
  erbfallkostenpauschale: number;
  hausratPauschale: number;
  familienheimAbzug: number;      // §13-Abzug
  mietwohnAbzug: number;          // §13d 10%-Abschlag
  stpflErwerbVorFreibetrag: number;
  freibetrag: number;
  versorgungsfreibetrag: number;
  vorschenkungen: number;
  stpflErwerbNetto: number;      // finaler Erwerb nach allen Abzügen + Vorschenkungen
  // Steuer
  steuerklasse: Steuerklasse;
  angewandterSatz: number;       // effektiver Steuersatz auf stpflErwerbNetto
  erbschaftsteuer: number;       // Steuerbetrag nach §14-Anrechnung
  // Zusammenfassung
  nettoErbe: number;             // Nachlasswert brutto − Schulden − Erbschaftsteuer
}

// ─────────────────────────────────────────────
// Hauptberechnung
// ─────────────────────────────────────────────

export function berechneErbschaftsteuer(p: ErbschaftsteuerParams): ErbschaftsteuerResult {
  const stkl = STKL[p.verwandtschaftsgrad];
  const fb = FREIBETRAG[p.verwandtschaftsgrad];

  // Versorgungsfreibetrag (nur Ehepartner und Kinder)
  let vfb = 0;
  if (p.verwandtschaftsgrad === 'ehepartner') {
    vfb = 256_000;
  } else if (p.verwandtschaftsgrad === 'kind') {
    vfb = versorgungsfreibetragKind(Math.max(0, Math.floor(p.kindesalter)));
  }

  const hausratPauschale = stkl === 1 ? HAUSRAT_STKL_I : HAUSRAT_STKL_II_III;

  // §13d: 10 %-Abschlag auf Mietwohngrundstücke (berechnet auf Mietwohnwert)
  const mietwohnAbzug =
    p.mietwohnAbschlag && p.mietwohnWert > 0
      ? round2(p.mietwohnWert * 0.1)
      : 0;

  // Steuerpflichtiger Erwerb vor Freibeträgen
  const stpflBrutto = Math.max(
    0,
    p.nachlasswert
      - p.schulden
      - ERBFALLKOSTENPAUSCHALE
      - hausratPauschale
      - p.familienheimWert
      - mietwohnAbzug,
  );

  // Steuerpflichtiger Erwerb nach Freibeträgen (ohne Vorschenkungen)
  const stpflNachFreibetrag = Math.max(0, stpflBrutto - fb - vfb);

  // §14 Vorschenkungen: Gesamterwerb = aktuell + Vorschenkungen
  // Steuer auf Gesamterwerb minus Steuer auf Vorschenkungen-Anteil
  const gesamterwerb = stpflNachFreibetrag + p.vorschenkungen;
  const steuerGesamt = round2(berechneRohsteuer(gesamterwerb, stkl));
  const steuerVorschenk = round2(berechneRohsteuer(p.vorschenkungen, stkl));
  const erbschaftsteuer = Math.max(0, round2(steuerGesamt - steuerVorschenk));

  // Effektiver Steuersatz (auf steuerpflichtigen Netto-Erwerb)
  const stpflNetto = stpflNachFreibetrag;
  const angewandterSatz = stpflNetto > 0 ? erbschaftsteuer / stpflNetto : 0;

  // Netto-Erbe: was der Erbe tatsächlich behält
  const nettoErbe = round2(
    Math.max(0, p.nachlasswert - p.schulden) - erbschaftsteuer,
  );

  return {
    nachlasswertBrutto: p.nachlasswert,
    schulden: p.schulden,
    erbfallkostenpauschale: ERBFALLKOSTENPAUSCHALE,
    hausratPauschale,
    familienheimAbzug: p.familienheimWert,
    mietwohnAbzug,
    stpflErwerbVorFreibetrag: stpflBrutto,
    freibetrag: fb,
    versorgungsfreibetrag: vfb,
    vorschenkungen: p.vorschenkungen,
    stpflErwerbNetto: stpflNetto,
    steuerklasse: stkl,
    angewandterSatz: round2(angewandterSatz),
    erbschaftsteuer,
    nettoErbe,
  };
}

// ─────────────────────────────────────────────
// Text-Fallback (Formatter-Shell)
// ─────────────────────────────────────────────

function formatErbschaftsteuer(input: string): string {
  // Minimal text-fallback: "nachlasswert;verwandtschaft"
  // z.B. "500000;ehepartner"
  try {
    const parts = input.split(';').map((s) => s.trim());
    const nachlasswert = parseDE(parts[0] ?? '');
    const vg = (parts[1] ?? 'sonstiges') as Verwandtschaftsgrad;
    if (!Number.isFinite(nachlasswert) || nachlasswert < 0) return '';
    if (!(vg in FREIBETRAG)) return '';
    const r = berechneErbschaftsteuer({
      verwandtschaftsgrad: vg,
      nachlasswert,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 0,
    });
    return [
      `Erbschaftsteuer: ${formatEuroRound(r.erbschaftsteuer)} €`,
      `Steuersatz: ${formatProzent(r.angewandterSatz)}`,
      `Netto-Erbe: ${formatEuroRound(r.nettoErbe)} €`,
    ].join('\n');
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────
// Config-Export
// ─────────────────────────────────────────────

export const erbschaftsteuerRechner: FormatterConfig = {
  id: 'inheritance-tax-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatErbschaftsteuer,
  placeholder: '500000;ehepartner  (Nachlasswert;Verwandtschaft)',
};
