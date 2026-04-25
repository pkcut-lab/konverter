import type { FormatterConfig } from './schemas';
import { parseDE } from './parse-de';

/**
 * KGV-Rechner — Kurs-Gewinn-Verhältnis mit Kontext.
 *
 * Differenzierung laut Dossier §9:
 * B1 — Gewinnrendite als automatische Zusatz-Ausgabe (kein Konkurrent berechnet das).
 * B2 — Historischer Kontext-Badge vs. DAX-Ø (~14,6) und S&P-Ø (~17,5).
 * B3 — Klarer Hinweis bei negativem EPS statt negativem Zahlenwert.
 * B4 — EPS-Quelle-Hilfe (Tooltip-Text eingebaut).
 *
 * Formeln:
 * KGV                = Aktienkurs / Gewinn je Aktie (EPS)
 * Gewinnrendite (%)  = (1 / KGV) × 100
 *
 * Edge-Cases:
 * EPS = 0  → Division by zero
 * EPS < 0  → Negatives KGV nicht interpretierbar
 * Kurs ≤ 0 → Physikalisch unmöglich
 * KGV < 5  → Mögliche Value-Trap (non-blocking badge)
 * KGV > 60 → Hohes Wachstumspremium (non-blocking badge)
 *
 * Security: Keine innerHTML-Injektion. Inputs werden via parseDE normalisiert
 * (DE-Dezimalkomma → JS-Float) vor jeder Arithmetik.
 */

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** Semantische Einordnung des KGV gegen historischen Markt-Durchschnitt. */
export type KgvAmpel = 'guenstig' | 'moderat' | 'teuer';

/** Optionaler non-blocking Warn-Badge. */
export type KgvWarnBadge = 'value-trap' | 'growth-premium' | null;

export interface KgvResult {
  /** KGV-Wert (2 Nachkomma-Stellen) */
  kgv: number;
  /** Gewinnrendite in % (1/KGV × 100, 2 NKS) */
  gewinnrendite: number;
  /** Ampel-Status vs. historischen Marktdurchschnitt */
  ampel: KgvAmpel;
  /** Optionaler Warn-Badge bei extremen Werten (non-blocking) */
  warnBadge: KgvWarnBadge;
  /** Lesbare Formel-Aufschlüsselung */
  formelText: string;
}

export interface KgvError {
  kind: 'eps-zero' | 'eps-negativ' | 'kurs-invalid';
  message: string;
}

export type KgvOutput = { ok: true; result: KgvResult } | { ok: false; error: KgvError };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatDE(n: number, decimals = 2): string {
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

function ampelFuerKgv(kgv: number): KgvAmpel {
  // DAX historisch ~14,6 / S&P historisch ~17,5 → Schwellen aus Dossier §1
  if (kgv < 15) return 'guenstig';
  if (kgv <= 22) return 'moderat';
  return 'teuer';
}

function warnBadgeFuerKgv(kgv: number): KgvWarnBadge {
  if (kgv < 5) return 'value-trap';
  if (kgv > 60) return 'growth-premium';
  return null;
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Berechnet KGV und Gewinnrendite aus Aktienkurs und EPS.
 *
 * @param kurs  Aktienkurs in € (muss > 0 sein)
 * @param eps   Gewinn je Aktie in € (≠ 0, ≥ 0 für sinnvolles KGV)
 */
export function computeKgv(kurs: number, eps: number): KgvOutput {
  if (!Number.isFinite(kurs) || kurs <= 0) {
    return {
      ok: false,
      error: { kind: 'kurs-invalid', message: 'Aktienkurs muss größer als 0 sein.' },
    };
  }

  if (eps === 0) {
    return {
      ok: false,
      error: { kind: 'eps-zero', message: 'Gewinn je Aktie darf nicht 0 sein.' },
    };
  }

  if (eps < 0) {
    return {
      ok: false,
      error: {
        kind: 'eps-negativ',
        message:
          'Das Unternehmen schreibt Verluste — KGV ist kein valider Bewertungsmaßstab. Alternativ: KUV oder KBV nutzen.',
      },
    };
  }

  const kgvRaw = kurs / eps;
  const kgv = round2(kgvRaw);
  const gewinnrendite = round2((1 / kgvRaw) * 100);
  const ampel = ampelFuerKgv(kgv);
  const warnBadge = warnBadgeFuerKgv(kgv);
  const formelText = `${formatDE(kurs)} € ÷ ${formatDE(eps)} € = ${formatDE(kgv)}`;

  return { ok: true, result: { kgv, gewinnrendite, ampel, warnBadge, formelText } };
}

// ---------------------------------------------------------------------------
// Fallback text formatter (für Formatter-Shell)
// ---------------------------------------------------------------------------

/**
 * Text-Fallback für die generische Formatter-Komponente.
 * Input-Format: "kurs;eps" (z.B. "120;6,50")
 */
function formatKgv(input: string): string {
  try {
    const parts = input.split(';').map((s) => s.trim());
    const kurs = parseDE(parts[0] ?? '');
    const eps = parseDE(parts[1] ?? '');

    const out = computeKgv(kurs, eps);
    if (!out.ok) return `Fehler: ${out.error.message}`;

    const { kgv, gewinnrendite, ampel } = out.result;
    return [
      `KGV: ${formatDE(kgv)}`,
      `Gewinnrendite: ${formatDE(gewinnrendite)} %`,
      `Einordnung: ${ampel === 'guenstig' ? 'günstig' : ampel === 'moderat' ? 'moderat' : 'teuer'} (vs. historischer Marktdurchschnitt)`,
    ].join('\n');
  } catch {
    return input;
  }
}

export const kgvRechner: FormatterConfig = {
  id: 'kgv-calculator',
  type: 'formatter',
  categoryId: 'finance',
  mode: 'custom',
  format: formatKgv,
  placeholder: '120;6,50  (Aktienkurs;Gewinn je Aktie in €)',
};
