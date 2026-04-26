import type { FormatterConfig } from './schemas';

export interface MoonPhaseResult {
  /** 0–29.53: lunar age in days */
  age: number;
  /** 0–1: fraction illuminated */
  illumination: number;
  /** Phase name index 0–7 */
  phaseIndex: number;
  /** true = waxing, false = waning */
  waxing: boolean;
  /** Days until next full moon */
  daysToFull: number;
  /** Days until next new moon */
  daysToNew: number;
  /** Date of next full moon */
  nextFull: Date;
  /** Date of next new moon */
  nextNew: Date;
}

const SYNODIC_MONTH = 29.530588853;

/**
 * Convert calendar date (UTC) to Julian Day Number.
 * Handles January/February as months 13/14 of previous year (Meeus convention).
 */
function toJulian(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours();
  const min = date.getUTCMinutes();

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    B -
    1524.5 +
    (h + min / 60) / 24
  );
}

const DEG = Math.PI / 180;

/**
 * Compute Sun-Earth-Moon phase angle (degrees, 0–180) and mean elongation.
 * Uses Meeus Astronomical Algorithms eq 47.2/47.3/47.4 + 48.4.
 * Accuracy: ~minutes for the phase event timing.
 */
function meeusPhase(jd: number): { i: number; D: number } {
  const T = (jd - 2451545.0) / 36525;

  // Mean elongation of Moon from Sun (Meeus 47.2)
  let D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868;

  // Sun's mean anomaly (47.3)
  let Msun =
    357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;

  // Moon's mean anomaly (47.4)
  let Mmoon =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699;

  D = ((D % 360) + 360) % 360;
  Msun = ((Msun % 360) + 360) % 360;
  Mmoon = ((Mmoon % 360) + 360) % 360;

  const Dr = D * DEG;
  const Msunr = Msun * DEG;
  const Mmoonr = Mmoon * DEG;

  // Phase angle (Meeus 48.4) — Sun-Moon-Earth angle, degrees
  let i =
    180 -
    D -
    6.289 * Math.sin(Mmoonr) +
    2.1 * Math.sin(Msunr) -
    1.274 * Math.sin(2 * Dr - Mmoonr) -
    0.658 * Math.sin(2 * Dr) -
    0.214 * Math.sin(2 * Mmoonr) -
    0.11 * Math.sin(Dr);

  // Normalise to 0–360 then fold to 0–180 for illumination
  i = ((i % 360) + 360) % 360;
  if (i > 180) i = 360 - i;

  return { i, D };
}

export function computeMoonPhase(date: Date): MoonPhaseResult {
  const jd = toJulian(date);
  const { i, D } = meeusPhase(jd);

  // Illumination (Meeus 48.1)
  const illumination = (1 + Math.cos(i * DEG)) / 2;

  // Waxing while elongation D is in 0–180; waning in 180–360.
  const waxing = D < 180;

  // Lunar age in days, derived from phase angle:
  //   waxing: 0 (new) → SYNODIC/2 (full)  as i goes 180 → 0
  //   waning: SYNODIC/2 (full) → SYNODIC (new)  as i goes 0 → 180
  const half = SYNODIC_MONTH / 2;
  const age = waxing
    ? ((180 - i) / 180) * half
    : half + (i / 180) * half;

  // Phase index — windows centred on the four cardinal points (new, Q1, full, Q3),
  // each ±0.92 days wide. Crescent / gibbous fill the gaps. Full Moon at
  // age=14.77 must land squarely in phaseIndex=4.
  const phaseIndex =
    age < 0.92  ? 0 :   // New
    age < 6.46  ? 1 :   // Waxing Crescent
    age < 8.30  ? 2 :   // First Quarter
    age < 13.85 ? 3 :   // Waxing Gibbous
    age < 15.69 ? 4 :   // Full
    age < 21.23 ? 5 :   // Waning Gibbous
    age < 23.07 ? 6 :   // Last Quarter
    age < 28.61 ? 7 :   // Waning Crescent
                  0;    // New (late wrap, age 28.61–29.53)

  // Find next exact full / new moon by iterating in 0.05-day steps until
  // the phase angle crosses 0 (full) or 180 (new). Bound to ±35 days.
  const nextFull = findNextEvent(jd, 'full');
  const nextNew  = findNextEvent(jd, 'new');

  const daysToFull = (nextFull.getTime() - date.getTime()) / 86_400_000;
  const daysToNew  = (nextNew.getTime()  - date.getTime()) / 86_400_000;

  return { age, illumination, phaseIndex, waxing, daysToFull, daysToNew, nextFull, nextNew };
}

/**
 * Find the next time (UTC) when the moon reaches the requested event.
 *   - 'full' means phase angle i = 0
 *   - 'new'  means phase angle i = 180 (D crosses 0/360)
 *
 * Coarse scan in 0.5-day steps, then bisection to ~1 minute precision.
 */
function findNextEvent(startJd: number, event: 'full' | 'new'): Date {
  // Signed metric: full → cos(i) = 1, new → cos(i) = -1.
  // For 'full' we look for cos(i) crossing +1 from below (max),
  // for 'new' we look for cos(i) crossing -1 from above (min).
  // Easier: track illumination derivative or use D for new (D mod 360 ≈ 0)
  // and search for D ≈ 180 for full.
  //
  // Simpler approach: scan illumination over time and find local max (full)
  // or local min (new) within the next 30 days.

  const horizon = startJd + 35;
  const step = 0.25; // 6-hour steps for coarse scan

  let prev = (1 + Math.cos(meeusPhase(startJd).i * DEG)) / 2;
  let prev2 = prev;
  let bestJd = startJd + (event === 'full' ? 14 : 29); // fallback

  for (let jd = startJd + step; jd <= horizon; jd += step) {
    const cur = (1 + Math.cos(meeusPhase(jd).i * DEG)) / 2;
    if (event === 'full') {
      // Local max: prev > prev2 and prev > cur
      if (prev > prev2 && prev > cur && prev > 0.95) {
        bestJd = jd - step;
        break;
      }
    } else {
      // Local min: prev < prev2 and prev < cur
      if (prev < prev2 && prev < cur && prev < 0.05) {
        bestJd = jd - step;
        break;
      }
    }
    prev2 = prev;
    prev = cur;
  }

  // Bisection refinement around bestJd ±0.5 day, search for extremum to minute precision
  let lo = bestJd - 0.5;
  let hi = bestJd + 0.5;
  for (let iter = 0; iter < 25; iter++) {
    const mid = (lo + hi) / 2;
    const epsilon = 0.001; // ~1.5 min
    const fMid    = (1 + Math.cos(meeusPhase(mid).i * DEG)) / 2;
    const fPlus   = (1 + Math.cos(meeusPhase(mid + epsilon).i * DEG)) / 2;
    // Derivative sign tells us which side the extremum lies.
    const slope = fPlus - fMid;
    if (event === 'full') {
      if (slope > 0) lo = mid; else hi = mid;
    } else {
      if (slope < 0) lo = mid; else hi = mid;
    }
  }

  const finalJd = (lo + hi) / 2;
  return jdToDate(finalJd);
}

/** Convert a Julian Day Number back to a JS Date (UTC). */
function jdToDate(jd: number): Date {
  // JD 2440587.5 = 1970-01-01 00:00 UTC (Unix epoch)
  const unixMs = (jd - 2440587.5) * 86_400_000;
  return new Date(unixMs);
}

export const PHASE_NAMES_DE = [
  'Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond',
  'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel',
] as const;

export const PHASE_NAMES_EN = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
] as const;

function formatMoonPhase(input: string): string {
  const dateStr = input.trim();
  const d = new Date(dateStr + 'T12:00:00Z');
  if (isNaN(d.getTime())) return 'Ungültiges Datum. Bitte im Format YYYY-MM-DD eingeben.';
  const r = computeMoonPhase(d);
  return [
    PHASE_NAMES_DE[r.phaseIndex],
    `Beleuchtung: ${Math.round(r.illumination * 100)} %`,
    `Mondalter: ${r.age.toFixed(1)} Tage`,
  ].join(' · ');
}

export const mondphasenRechner: FormatterConfig = {
  id: 'moon-phase',
  type: 'formatter',
  categoryId: 'nature',
  mode: 'custom',
  format: formatMoonPhase,
  placeholder: '2026-04-26',
};
