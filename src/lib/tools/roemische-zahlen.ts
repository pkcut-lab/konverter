import type { FormatterConfig } from './schemas';

/**
 * Römische Zahlen Konverter — bidirectional Arabic ↔ Roman numeral conversion.
 * Pure client-side, no server contact. Standard range 1–3999.
 *
 * Auto-detects input type:
 * - Digits → Arabic-to-Roman conversion
 * - Letters (I, V, X, L, C, D, M) → Roman-to-Arabic conversion
 *
 * Validation rules enforced:
 * - Subtraction rule: I before V/X only, X before L/C only, C before D/M only
 * - Max 3 consecutive identical characters (except tolerating IIII as clock notation)
 * - Range: 1–3999
 * - Zero and negative numbers rejected with explanation
 */

const ROMAN_VALUES: [string, number][] = [
  ['M', 1000],
  ['CM', 900],
  ['D', 500],
  ['CD', 400],
  ['C', 100],
  ['XC', 90],
  ['L', 50],
  ['XL', 40],
  ['X', 10],
  ['IX', 9],
  ['V', 5],
  ['IV', 4],
  ['I', 1],
];

/** Valid Roman numeral pattern (standard notation). */
const VALID_ROMAN_RE =
  /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

/** Detect if input looks like a Roman numeral (letters only). */
function isRomanInput(input: string): boolean {
  return /^[IVXLCDM]+$/i.test(input);
}

/** Convert Arabic number (1–3999) to Roman numeral string. */
export function arabicToRoman(num: number): string {
  if (!Number.isInteger(num)) {
    throw new Error('Nur Ganzzahlen können in römische Zahlen umgewandelt werden.');
  }
  if (num <= 0) {
    throw new Error(
      num === 0
        ? 'Die Zahl 0 (Null) existiert nicht in römischen Zahlen. Die Römer kannten kein Konzept der Null.'
        : 'Negative Zahlen existieren nicht in römischen Zahlen.',
    );
  }
  if (num > 3999) {
    throw new Error('Die größte darstellbare Zahl ist 3999 (MMMCMXCIX).');
  }

  let result = '';
  let remaining = num;
  for (const [symbol, value] of ROMAN_VALUES) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

/** Convert Roman numeral string to Arabic number. */
export function romanToArabic(roman: string): number {
  const upper = roman.toUpperCase().replace(/\s/g, '');

  if (upper === '') {
    throw new Error('Bitte eine Zahl oder römische Ziffern eingeben.');
  }

  // Check for invalid characters
  if (!/^[IVXLCDM]+$/.test(upper)) {
    throw new Error(
      `Ungültige Zeichen: nur I, V, X, L, C, D und M sind erlaubt.`,
    );
  }

  // Tolerate IIII (clock notation) — convert to IV equivalent for validation
  const isClockFour = upper === 'IIII';

  if (!isClockFour && !VALID_ROMAN_RE.test(upper)) {
    // Try to give a didactic error message
    const hint = getDiagnosticHint(upper);
    throw new Error(hint || `Ungültige römische Zahl: „${upper}".`);
  }

  // Calculate value
  const SINGLE_VALUES: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const current = SINGLE_VALUES[upper[i]];
    const next = i + 1 < upper.length ? SINGLE_VALUES[upper[i + 1]] : 0;
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }

  return total;
}

/** Provide didactic error hints for common mistakes. */
function getDiagnosticHint(upper: string): string | null {
  // Check for invalid subtraction patterns
  const invalidSubtractions: [RegExp, string][] = [
    [/IL/, 'I darf nur vor V oder X stehen. 49 = XLIX (nicht IL).'],
    [/IC/, 'I darf nur vor V oder X stehen. 99 = XCIX (nicht IC).'],
    [/ID/, 'I darf nur vor V oder X stehen.'],
    [/IM/, 'I darf nur vor V oder X stehen. 999 = CMXCIX (nicht IM).'],
    [/XD/, 'X darf nur vor L oder C stehen. 490 = CDXC (nicht XD).'],
    [/XM/, 'X darf nur vor L oder C stehen.'],
    [/VX/, 'V darf nie vor einem größeren Zeichen stehen.'],
    [/VL/, 'V darf nie vor einem größeren Zeichen stehen.'],
    [/VC/, 'V darf nie vor einem größeren Zeichen stehen.'],
    [/VD/, 'V darf nie vor einem größeren Zeichen stehen.'],
    [/VM/, 'V darf nie vor einem größeren Zeichen stehen.'],
    [/LC/, 'L darf nie vor einem größeren Zeichen stehen.'],
    [/LD/, 'L darf nie vor einem größeren Zeichen stehen.'],
    [/LM/, 'L darf nie vor einem größeren Zeichen stehen.'],
    [/DM/, 'D darf nie vor einem größeren Zeichen stehen.'],
  ];

  for (const [pattern, msg] of invalidSubtractions) {
    if (pattern.test(upper)) {
      return `Ungültige römische Zahl: „${upper}". ${msg}`;
    }
  }

  // Check for too many consecutive characters
  if (/(.)\1{3,}/.test(upper) && upper !== 'IIII') {
    const match = upper.match(/(.)\1{3,}/);
    if (match) {
      return `Ein Zeichen darf maximal dreimal hintereinander stehen. „${match[0]}" ist ungültig.`;
    }
  }

  return null;
}

/** Generate step-by-step breakdown for Arabic → Roman conversion. */
export function getBreakdown(num: number): { symbol: string; value: number }[] {
  const steps: { symbol: string; value: number }[] = [];
  let remaining = num;
  for (const [symbol, value] of ROMAN_VALUES) {
    while (remaining >= value) {
      steps.push({ symbol, value });
      remaining -= value;
    }
  }
  return steps;
}

/**
 * Format function for FormatterConfig.
 * Auto-detects input: digits → Arabic-to-Roman, letters → Roman-to-Arabic.
 */
function convertRomanNumerals(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte eine Zahl oder römische Ziffern eingeben.');
  }

  // Check for negative numbers
  if (/^-\d/.test(trimmed)) {
    throw new Error('Negative Zahlen existieren nicht in römischen Zahlen.');
  }

  // Check for decimal numbers
  if (/^\d+[.,]\d+$/.test(trimmed)) {
    throw new Error('Nur Ganzzahlen können in römische Zahlen umgewandelt werden.');
  }

  // Arabic → Roman
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    const roman = arabicToRoman(num);
    const breakdown = getBreakdown(num);
    const breakdownStr = breakdown.map((s) => `${s.symbol}=${s.value}`).join(' + ');
    return `${roman} (${breakdownStr})`;
  }

  // Roman → Arabic
  if (isRomanInput(trimmed)) {
    const num = romanToArabic(trimmed);
    const upper = trimmed.toUpperCase().replace(/\s/g, '');
    const isClockFour = upper === 'IIII';
    let result = String(num);
    if (isClockFour) {
      result += ' (Hinweis: IIII ist Uhrmacher-Notation. Standard: IV)';
    }
    return result;
  }

  throw new Error(
    'Eingabe nicht erkannt. Bitte eine arabische Zahl (1–3999) oder römische Ziffern (I, V, X, L, C, D, M) eingeben.',
  );
}

export const roemischeZahlen: FormatterConfig = {
  id: 'roman-numerals',
  type: 'formatter',
  categoryId: 'text',
  mode: 'custom',
  format: convertRomanNumerals,
};
