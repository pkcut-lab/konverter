import type { FormatterConfig } from './schemas';

/**
 * WCAG 2.1 Contrast Checker.
 * Pure client-side. Takes two hex colors, computes contrast ratio,
 * reports AA/AAA pass/fail for normal and large text.
 *
 * Hex values here are TOOL DATA (input/output), not visual colors —
 * allowed per CONVENTIONS.md Data-Layer exception.
 */

/** Normalize a hex string: strip #, expand 3-digit to 6-digit. Returns null on invalid. */
function normalizeHex(input: string): string | null {
  const cleaned = input.trim().replace(/^#/, '');
  if (!/^[0-9A-Fa-f]+$/.test(cleaned)) return null;

  switch (cleaned.length) {
    case 3:
      return cleaned
        .split('')
        .map((c) => c + c)
        .join('');
    case 6:
      return cleaned;
    default:
      return null;
  }
}

/** Parse 6-digit hex to {r, g, b} 0-255. */
function hexToRgb(hex6: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex6.slice(0, 2), 16),
    g: parseInt(hex6.slice(2, 4), 16),
    b: parseInt(hex6.slice(4, 6), 16),
  };
}

/**
 * Relative luminance per WCAG 2.1 definition.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Contrast ratio per WCAG 2.1. Returns value between 1 and 21. */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Round to 2 decimal places. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface WcagResult {
  ratio: number;
  aa: { normalText: boolean; largeText: boolean };
  aaa: { normalText: boolean; largeText: boolean };
}

function evaluateContrast(ratio: number): WcagResult {
  return {
    ratio,
    aa: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
    },
    aaa: {
      normalText: ratio >= 7,
      largeText: ratio >= 4.5,
    },
  };
}

/** Parse two hex colors from input string. Accepts space, comma, or newline as separator. */
function parseColors(input: string): { fg: string; bg: string } | null {
  // Split on comma, newline, or whitespace (after trimming)
  const parts = input
    .trim()
    .split(/[,\n]+/)
    .flatMap((p) => p.trim().split(/\s+/))
    .filter((p) => p.length > 0);

  if (parts.length < 2) return null;

  const fg = normalizeHex(parts[0] as string);
  const bg = normalizeHex(parts[1] as string);

  if (!fg || !bg) return null;
  return { fg, bg };
}

function formatContrastReport(input: string): string {
  const parsed = parseColors(input);
  if (!parsed) return '';

  const { fg, bg } = parsed;
  const rgbFg = hexToRgb(fg);
  const rgbBg = hexToRgb(bg);

  const lumFg = relativeLuminance(rgbFg.r, rgbFg.g, rgbFg.b);
  const lumBg = relativeLuminance(rgbBg.r, rgbBg.g, rgbBg.b);

  const ratio = round2(contrastRatio(lumFg, lumBg));
  const result = evaluateContrast(ratio);

  const pass = 'bestanden';
  const fail = 'nicht bestanden';

  const lines: string[] = [];
  lines.push(`Vordergrund: #${fg.toUpperCase()}`);
  lines.push(`Hintergrund: #${bg.toUpperCase()}`);
  lines.push('');
  lines.push(`Kontrastverhältnis: ${ratio.toFixed(2)}:1`);
  lines.push('');
  lines.push('WCAG AA');
  lines.push(`  Normaler Text (≥4,5:1): ${result.aa.normalText ? pass : fail}`);
  lines.push(`  Großer Text   (≥3:1):   ${result.aa.largeText ? pass : fail}`);
  lines.push('');
  lines.push('WCAG AAA');
  lines.push(`  Normaler Text (≥7:1):   ${result.aaa.normalText ? pass : fail}`);
  lines.push(`  Großer Text   (≥4,5:1): ${result.aaa.largeText ? pass : fail}`);

  return lines.join('\n');
}

export {
  normalizeHex,
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  round2,
  evaluateContrast,
  parseColors,
};

/**
 * Structured evaluation for the live UI. Returns null for invalid hex input
 * so the component can gate preview rendering.
 */
export function evaluatePair(
  fgHex: string,
  bgHex: string,
): { ratio: number; fg: string; bg: string; result: WcagResult } | null {
  const fg = normalizeHex(fgHex);
  const bg = normalizeHex(bgHex);
  if (!fg || !bg) return null;

  const rgbFg = hexToRgb(fg);
  const rgbBg = hexToRgb(bg);
  const lumFg = relativeLuminance(rgbFg.r, rgbFg.g, rgbFg.b);
  const lumBg = relativeLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
  const ratio = round2(contrastRatio(lumFg, lumBg));
  return { ratio, fg, bg, result: evaluateContrast(ratio) };
}

export const kontrastPruefer: FormatterConfig = {
  id: 'contrast-checker',
  type: 'formatter',
  categoryId: 'farben',
  mode: 'custom',
  format: formatContrastReport,
};
