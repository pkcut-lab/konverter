import type { FormatterConfig } from './schemas';

/**
 * HEX → RGB color converter.
 * Pure client-side, supports 3/4/6/8-digit hex with optional hash.
 * Returns multi-format output: RGB, RGBA (if alpha), HSL, OKLCH.
 */

function normalizeHex(input: string): string | null {
  const cleaned = input.replace(/\s/g, '').replace(/^#/, '');
  if (!/^[0-9A-Fa-f]+$/.test(cleaned)) return null;

  switch (cleaned.length) {
    case 3:
      return cleaned
        .split('')
        .map((c) => c + c)
        .join('');
    case 4:
      return cleaned
        .split('')
        .map((c) => c + c)
        .join('');
    case 6:
    case 8:
      return cleaned;
    default:
      return null;
  }
}

function hexToRgb(hex6: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex6.slice(0, 2), 16),
    g: parseInt(hex6.slice(2, 4), 16),
    b: parseInt(hex6.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToOklch(r: number, g: number, b: number): { L: number; C: number; h: number } {
  // sRGB → linear RGB
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Linear RGB → OKLab (via LMS)
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bOk * bOk);
  let h = (Math.atan2(bOk, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return {
    L: Math.round(L * 100) / 100,
    C: Math.round(C * 1000) / 1000,
    h: Math.round(h),
  };
}

function formatHexToRgb(input: string): string {
  const normalized = normalizeHex(input);
  if (!normalized) return '';

  const hasAlpha = normalized.length === 8;
  const hex6 = normalized.slice(0, 6);
  const { r, g, b } = hexToRgb(hex6);
  const alpha = hasAlpha ? parseInt(normalized.slice(6, 8), 16) / 255 : undefined;

  const hsl = rgbToHsl(r, g, b);
  const oklch = rgbToOklch(r, g, b);

  const lines: string[] = [];

  if (hasAlpha) {
    const a = Math.round(alpha! * 100) / 100;
    lines.push(`rgba(${r}, ${g}, ${b}, ${a})`);
  } else {
    lines.push(`rgb(${r}, ${g}, ${b})`);
  }

  lines.push(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
  lines.push(`oklch(${oklch.L} ${oklch.C} ${oklch.h})`);

  return lines.join('\n');
}

export { normalizeHex, hexToRgb, rgbToHsl, rgbToOklch };

export const hexRgbKonverter: FormatterConfig = {
  id: 'hex-to-rgb',
  type: 'formatter',
  categoryId: 'farben',
  mode: 'custom',
  format: formatHexToRgb,
};
