import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * Brutto-Netto-Rechner 2026 — Lohnsteuer + Sozialversicherung (DE).
 * Formeln: §32a EStG 2026, SGB IV §20 (Midijob-Gleitzone), BBG 2026.
 * Differenzierung per Dossier §9: Transparenz-Layer, Privacy-Kontrast,
 * Beschäftigungsart-Navigation (Vollzeit / Midijob / Minijob).
 * Pure client-side, kein Server-Submit.
 */

// ───────────────────────────────────────────────
// Beitragssätze 2026 (Arbeitnehmer-Anteil)
// ───────────────────────────────────────────────

const RV_RATE = 0.093;           // 9,30 % Rentenversicherung
const AV_RATE = 0.013;           // 1,30 % Arbeitslosenversicherung
const KV_BASE_RATE = 0.073;      // 7,30 % Krankenversicherung
const KV_ZUSATZ_RATE = 0.00725;  // ½ × 1,45 % Ø-Zusatzbeitrag
const PV_RATE_MIT_KIND = 0.018;  // 1,80 % Pflegeversicherung (mit Kind)
const PV_RATE_KINDERLOS = 0.024; // 2,40 % Pflegeversicherung (kinderlos ≥23)
const PV_SACHSEN_AN = 0.023;     // 2,30 % Sachsen-Sonderregel AN

// Beitragsbemessungsgrenzen (€/Monat)
const BBG_KV = 5812.5;           // KV + PV
const BBG_RV = 8450.0;           // RV + AV

// Minijob / Midijob (§8, §20 SGB IV 2026)
const MINIJOB_GRENZE = 603.0;
const MIDIJOB_GRENZE = 2000.0;
const MIDIJOB_F_FAKTOR = 0.6619;

// Steuerliche Größen 2026
const AN_PAUSCHBETRAG = 1230;    // €/Jahr Arbeitnehmer-Pauschbetrag
const GRUNDFREIBETRAG = 12348;   // €/Jahr Grundfreibetrag 2026

// Bundesländer mit Kirchensteuer-Satz 8 % (alle anderen: 9 %)
const KIST_8_PROZENT = new Set(['BY', 'BW']);

// ───────────────────────────────────────────────
// Öffentliche Typen
// ───────────────────────────────────────────────

export type Steuerklasse = 1 | 2 | 3 | 4 | 5 | 6;
export type Beschaeftigungsart = 'vollzeit' | 'midijob' | 'minijob';

export interface BruttoNettoParams {
  brutto: number;
  steuerklasse: Steuerklasse;
  bundesland: string;
  kirchensteuer: boolean;
  beschaeftigungsart: Beschaeftigungsart;
  pkv: boolean;
  pkvBeitragMonatlich: number;
  kinderlos: boolean;
}

export interface BruttoNettoResult {
  rentenversicherung: number;
  krankenversicherung: number;
  pflegeversicherung: number;
  arbeitslosenversicherung: number;
  lohnsteuer: number;
  soli: number;
  kirchensteuerBetrag: number;
  gesamtAbzuege: number;
  netto: number;
  jahresNetto: number;
  warnungen: string[];
}

// ───────────────────────────────────────────────
// Hilfsfunktionen
// ───────────────────────────────────────────────

/** Kirchensteuer-Satz nach Bundesland. BY/BW: 8 %, sonst 9 %. */
export function kirchensteuerSatz(bundesland: string): number {
  return KIST_8_PROZENT.has(bundesland) ? 0.08 : 0.09;
}

/** Sachsen-Sonderregel Pflegeversicherung: AN-Anteil 2,30 % (statt 1,80 %). */
export function isSachsen(bundesland: string): boolean {
  return bundesland === 'SN';
}

/** Rundet kaufmännisch auf 2 Nachkommastellen. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formatiert einen Eurobetrag im deutschen Locale (z. B. 1.234,56). */
export function formatEuro(n: number): string {
  if (!Number.isFinite(n)) return '';
  // try/catch: toLocaleString kann in seltenen Umgebungen werfen (z. B. fehlende ICU-Daten)
  try {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return n.toFixed(2);
  }
}

// ───────────────────────────────────────────────
// §32a EStG 2026 — Einkommensteuertarif
// ───────────────────────────────────────────────

/**
 * §32a EStG 2026 Jahressteuertarif (gerundet auf volle Euro).
 * Grundfreibetrag: 12.348 €; Progressionszonen BMF 2026.
 * Eingabe: zu versteuerndes Einkommen in €/Jahr.
 */
export function eStTarif2026(zvE: number): number {
  if (zvE <= 0) return 0;
  if (zvE <= GRUNDFREIBETRAG) return 0;
  if (zvE <= 17005) {
    const y = (zvE - GRUNDFREIBETRAG) / 10000;
    return Math.floor((922.98 * y + 1400) * y);
  }
  if (zvE <= 66760) {
    const y = (zvE - 17005) / 10000;
    return Math.floor((181.19 * y + 2397) * y + 1025.38);
  }
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10602.13);
  }
  return Math.floor(0.45 * zvE - 18936.88);
}

// ───────────────────────────────────────────────
// Sozialversicherungs-Berechnung
// ───────────────────────────────────────────────

/**
 * Berechnet die monatlichen SV-Beiträge (AN-Anteil).
 * Warnungen: 'minijob', 'midijob', 'bbg-kv', 'bbg-rv'.
 */
export function berechneSV(
  brutto: number,
  bundesland: string,
  kinderlos: boolean,
  pkv: boolean,
  pkvBeitragMonatlich: number,
  beschaeftigungsart: Beschaeftigungsart,
): { rv: number; kv: number; pv: number; av: number; warnungen: string[] } {
  const warnungen: string[] = [];

  // Minijob: AN trägt keine SV-Beiträge
  if (beschaeftigungsart === 'minijob' || brutto <= MINIJOB_GRENZE) {
    return { rv: 0, kv: 0, pv: 0, av: 0, warnungen: ['minijob'] };
  }

  // Midijob-Gleitzonenformel: SV-Basis linear interpoliert
  let svBasis = brutto;
  if (beschaeftigungsart === 'midijob' || (brutto > MINIJOB_GRENZE && brutto <= MIDIJOB_GRENZE)) {
    const anteil = (brutto - MINIJOB_GRENZE) / (MIDIJOB_GRENZE - MINIJOB_GRENZE);
    const faktor = MIDIJOB_F_FAKTOR + (1 - MIDIJOB_F_FAKTOR) * anteil;
    svBasis = round2(brutto * faktor);
    warnungen.push('midijob');
  }

  // BBG-Kappung
  const rvBasis = Math.min(svBasis, BBG_RV);
  const kvBasis = Math.min(svBasis, BBG_KV);
  if (brutto > BBG_KV) warnungen.push('bbg-kv');
  if (brutto > BBG_RV) warnungen.push('bbg-rv');

  const rv = round2(rvBasis * RV_RATE);
  const av = round2(rvBasis * AV_RATE);

  // Krankenversicherung: gesetzlich oder privat
  const kv = pkv
    ? round2(Math.max(0, pkvBeitragMonatlich))
    : round2(kvBasis * (KV_BASE_RATE + KV_ZUSATZ_RATE));

  // Pflegeversicherung: Sachsen-Sonderregel hat Vorrang
  const pvRate = isSachsen(bundesland)
    ? PV_SACHSEN_AN
    : kinderlos
      ? PV_RATE_KINDERLOS
      : PV_RATE_MIT_KIND;
  const pv = round2(kvBasis * pvRate);

  return { rv, kv, pv, av, warnungen };
}

// ───────────────────────────────────────────────
// Lohnsteuer (vereinfacht nach §32a EStG 2026)
// ───────────────────────────────────────────────

/**
 * Monatliche Lohnsteuer nach Steuerklasse.
 * Präzision: ±10–20 € systembedingt (Rundungsmethoden §32a EStG).
 */
export function berechneLohnsteuer(brutto: number, steuerklasse: Steuerklasse): number {
  if (brutto <= 0) return 0;
  const jahresbrutto = brutto * 12;
  let jahresESt: number;

  switch (steuerklasse) {
    case 1:
    case 4: {
      const zvE = Math.max(0, jahresbrutto - AN_PAUSCHBETRAG - 36);
      jahresESt = eStTarif2026(zvE);
      break;
    }
    case 2: {
      // Entlastungsbetrag Alleinerziehende ~4.260 €/Jahr
      const zvE = Math.max(0, jahresbrutto - AN_PAUSCHBETRAG - 36 - 4260);
      jahresESt = eStTarif2026(zvE);
      break;
    }
    case 3: {
      // Ehegattensplitting: Tarif auf Hälfte, dann × 2
      const zvE = Math.max(0, jahresbrutto - AN_PAUSCHBETRAG - 36);
      jahresESt = eStTarif2026(zvE / 2) * 2;
      break;
    }
    case 5: {
      // Kein Grundfreibetrag: zvE nach oben verschoben
      const zvE = Math.max(0, jahresbrutto - AN_PAUSCHBETRAG - 36 + GRUNDFREIBETRAG);
      jahresESt = eStTarif2026(zvE);
      break;
    }
    case 6: {
      // Kein Grundfreibetrag, kein AN-Pauschbetrag
      const zvE = Math.max(0, jahresbrutto + GRUNDFREIBETRAG);
      jahresESt = eStTarif2026(zvE);
      break;
    }
    default:
      return 0;
  }

  return round2(jahresESt / 12);
}

// ───────────────────────────────────────────────
// Solidaritätszuschlag
// ───────────────────────────────────────────────

/**
 * Monatlicher Solidaritätszuschlag.
 * Freigrenze 2026: Jahres-LSt ≤ 18.130 € → kein Soli.
 * Gleitzone: 11,9 % × (LSt − Freigrenze), gedeckelt bei 5,5 % × LSt.
 */
export function berechneSoli(monatlicheLohnsteuer: number): number {
  const jahresLSt = monatlicheLohnsteuer * 12;
  const freigrenze = 18130;
  if (jahresLSt <= freigrenze) return 0;
  const voll = 0.055 * jahresLSt;
  const gleit = 0.119 * (jahresLSt - freigrenze);
  return round2(Math.min(voll, gleit) / 12);
}

// ───────────────────────────────────────────────
// Kirchensteuer
// ───────────────────────────────────────────────

/**
 * Monatliche Kirchensteuer auf Basis der Lohnsteuer.
 * BY/BW: 8 %, alle anderen Bundesländer: 9 %.
 */
export function berechneKirchensteuer(monatlicheLohnsteuer: number, bundesland: string): number {
  return round2(monatlicheLohnsteuer * kirchensteuerSatz(bundesland));
}

// ───────────────────────────────────────────────
// Haupt-Berechnung
// ───────────────────────────────────────────────

/** Vollständige Brutto-Netto-Berechnung für einen Monat. */
export function berechne(params: BruttoNettoParams): BruttoNettoResult {
  const {
    brutto,
    steuerklasse,
    bundesland,
    kirchensteuer,
    beschaeftigungsart,
    pkv,
    pkvBeitragMonatlich,
    kinderlos,
  } = params;

  if (brutto < 0) {
    return {
      rentenversicherung: 0,
      krankenversicherung: 0,
      pflegeversicherung: 0,
      arbeitslosenversicherung: 0,
      lohnsteuer: 0,
      soli: 0,
      kirchensteuerBetrag: 0,
      gesamtAbzuege: 0,
      netto: 0,
      jahresNetto: 0,
      warnungen: ['negativ'],
    };
  }

  const { rv, kv, pv, av, warnungen } = berechneSV(
    brutto,
    bundesland,
    kinderlos,
    pkv,
    pkvBeitragMonatlich,
    beschaeftigungsart,
  );

  // Lohnsteuer: Minijob → keine, sonst nach §32a
  const isMinijob = beschaeftigungsart === 'minijob' || brutto <= MINIJOB_GRENZE;
  const lst = isMinijob ? 0 : berechneLohnsteuer(brutto, steuerklasse);
  const soli = isMinijob ? 0 : berechneSoli(lst);
  const kist = isMinijob || !kirchensteuer ? 0 : berechneKirchensteuer(lst, bundesland);

  const gesamtAbzuege = round2(rv + kv + pv + av + lst + soli + kist);
  const netto = round2(brutto - gesamtAbzuege);

  return {
    rentenversicherung: rv,
    krankenversicherung: kv,
    pflegeversicherung: pv,
    arbeitslosenversicherung: av,
    lohnsteuer: lst,
    soli,
    kirchensteuerBetrag: kist,
    gesamtAbzuege,
    netto,
    jahresNetto: round2(netto * 12),
    warnungen,
  };
}

// ───────────────────────────────────────────────
// Tool-Config (FormatterConfig, mode: 'custom')
// ───────────────────────────────────────────────

/**
 * Fallback-Formatter: nimmt monatliches Bruttogehalt (Zahl oder DE-String),
 * berechnet Netto mit Standard-Annahmen (SK I, NW, keine KiSt, Vollzeit).
 * Wird von der Custom-Svelte-Komponente nicht aufgerufen — dient als Fallback
 * wenn das Tool ohne Komponente gerendert wird.
 */
function fallbackFormat(input: string): string {
  // Defense-in-depth: try/catch fängt unerwartete Fehler in berechne() oder formatEuro() ab.
  try {
    const brutto = parseDE(input);
    if (!Number.isFinite(brutto) || brutto < 0) return '';
    const r = berechne({
      brutto,
      steuerklasse: 1,
      bundesland: 'NW',
      kirchensteuer: false,
      beschaeftigungsart: 'vollzeit',
      pkv: false,
      pkvBeitragMonatlich: 0,
      kinderlos: false,
    });
    return (
      `Netto: ${formatEuro(r.netto)} €\n` +
      `Jahres-Netto: ${formatEuro(r.jahresNetto)} €\n` +
      `Lohnsteuer: ${formatEuro(r.lohnsteuer)} €\n` +
      `Rentenversicherung: ${formatEuro(r.rentenversicherung)} €\n` +
      `Krankenversicherung: ${formatEuro(r.krankenversicherung)} €\n` +
      `Pflegeversicherung: ${formatEuro(r.pflegeversicherung)} €\n` +
      `Arbeitslosenversicherung: ${formatEuro(r.arbeitslosenversicherung)} €`
    );
  } catch {
    return input;
  }
}

export const bruttoNettoRechner: FormatterConfig = {
  id: 'gross-net-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: fallbackFormat,
  placeholder: 'Bruttogehalt eingeben (z. B. 3500)',
};
