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

/** Convert calendar date to Julian Day Number (noon UT). */
function toJulian(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    B -
    1524.5
  );
}

/** Known new moon: Jan 6 2000 18:14 UT → JD 2451550.26 */
const KNOWN_NEW_MOON_JD = 2451550.26;

export function computeMoonPhase(date: Date): MoonPhaseResult {
  const jd = toJulian(date) + 0.5; // use noon of the given day
  const daysSinceNew =
    ((jd - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH + SYNODIC_MONTH) % SYNODIC_MONTH;
  const age = daysSinceNew;

  // Illumination: 0 at new moon, 1 at full moon
  const illumination = 0.5 * (1 - Math.cos((age / SYNODIC_MONTH) * 2 * Math.PI));

  // Phase index (0=New, 1=Waxing Crescent, 2=First Quarter, 3=Waxing Gibbous,
  //              4=Full, 5=Waning Gibbous, 6=Last Quarter, 7=Waning Crescent)
  const phaseIndex =
    age < 1.85  ? 0 :
    age < 7.38  ? 1 :
    age < 9.22  ? 2 :
    age < 14.77 ? 3 :
    age < 16.61 ? 4 :
    age < 22.15 ? 5 :
    age < 23.99 ? 6 : 7;

  const waxing = age < SYNODIC_MONTH / 2;

  const daysToFull =
    age <= SYNODIC_MONTH / 2
      ? SYNODIC_MONTH / 2 - age
      : SYNODIC_MONTH * 1.5 - age;

  const daysToNew = SYNODIC_MONTH - age;

  const nextFull = new Date(date.getTime() + daysToFull * 86_400_000);
  const nextNew  = new Date(date.getTime() + daysToNew  * 86_400_000);

  return { age, illumination, phaseIndex, waxing, daysToFull, daysToNew, nextFull, nextNew };
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
