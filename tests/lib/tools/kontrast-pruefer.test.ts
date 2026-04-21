import { describe, it, expect } from 'vitest';
import {
  kontrastPruefer,
  normalizeHex,
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  round2,
  evaluateContrast,
  parseColors,
} from '../../../src/lib/tools/kontrast-pruefer';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('kontrastPruefer config', () => {
  it('is a valid FormatterConfig per S4 schema', () => {
    const r = parseToolConfig(kontrastPruefer);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(kontrastPruefer.id).toBe('contrast-checker');
    expect(kontrastPruefer.type).toBe('formatter');
    expect(kontrastPruefer.categoryId).toBe('farben');
    expect(kontrastPruefer.mode).toBe('custom');
  });
});

describe('normalizeHex', () => {
  it('normalizes 3-digit shorthand', () => {
    expect(normalizeHex('#FFF')).toBe('FFFFFF');
    expect(normalizeHex('#000')).toBe('000000');
    expect(normalizeHex('#F0A')).toBe('FF00AA');
  });

  it('passes through 6-digit hex', () => {
    expect(normalizeHex('#333333')).toBe('333333');
    expect(normalizeHex('FFFFFF')).toBe('FFFFFF');
  });

  it('returns null for invalid input', () => {
    expect(normalizeHex('#GGG')).toBeNull();
    expect(normalizeHex('')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex('#1234')).toBeNull();
  });
});

describe('hexToRgb', () => {
  it('converts 000000 to black', () => {
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts FFFFFF to white', () => {
    expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance(0, 0, 0)).toBe(0);
  });

  it('returns 1 for white', () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 4);
  });

  it('returns correct value for mid-gray #808080', () => {
    const lum = relativeLuminance(128, 128, 128);
    expect(lum).toBeGreaterThan(0.2);
    expect(lum).toBeLessThan(0.25);
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    const lumBlack = relativeLuminance(0, 0, 0);
    const lumWhite = relativeLuminance(255, 255, 255);
    expect(round2(contrastRatio(lumBlack, lumWhite))).toBe(21);
  });

  it('returns 1 for same color', () => {
    const lum = relativeLuminance(128, 128, 128);
    expect(round2(contrastRatio(lum, lum))).toBe(1);
  });
});

describe('evaluateContrast', () => {
  it('21:1 passes all checks', () => {
    const result = evaluateContrast(21);
    expect(result.aa.normalText).toBe(true);
    expect(result.aa.largeText).toBe(true);
    expect(result.aaa.normalText).toBe(true);
    expect(result.aaa.largeText).toBe(true);
  });

  it('1:1 fails all checks', () => {
    const result = evaluateContrast(1);
    expect(result.aa.normalText).toBe(false);
    expect(result.aa.largeText).toBe(false);
    expect(result.aaa.normalText).toBe(false);
    expect(result.aaa.largeText).toBe(false);
  });

  it('4.5:1 passes AA normal but not AAA normal', () => {
    const result = evaluateContrast(4.5);
    expect(result.aa.normalText).toBe(true);
    expect(result.aa.largeText).toBe(true);
    expect(result.aaa.normalText).toBe(false);
    expect(result.aaa.largeText).toBe(true);
  });

  it('3:1 passes only AA large text', () => {
    const result = evaluateContrast(3);
    expect(result.aa.normalText).toBe(false);
    expect(result.aa.largeText).toBe(true);
    expect(result.aaa.normalText).toBe(false);
    expect(result.aaa.largeText).toBe(false);
  });

  it('7:1 passes all checks', () => {
    const result = evaluateContrast(7);
    expect(result.aa.normalText).toBe(true);
    expect(result.aa.largeText).toBe(true);
    expect(result.aaa.normalText).toBe(true);
    expect(result.aaa.largeText).toBe(true);
  });
});

describe('parseColors', () => {
  it('parses space-separated hex colors', () => {
    expect(parseColors('#333333 #FFFFFF')).toEqual({ fg: '333333', bg: 'FFFFFF' });
  });

  it('parses comma-separated hex colors', () => {
    expect(parseColors('#333,#FFF')).toEqual({ fg: '333333', bg: 'FFFFFF' });
  });

  it('parses newline-separated hex colors', () => {
    expect(parseColors('#000000\n#FFFFFF')).toEqual({ fg: '000000', bg: 'FFFFFF' });
  });

  it('handles missing hash', () => {
    expect(parseColors('333333 FFFFFF')).toEqual({ fg: '333333', bg: 'FFFFFF' });
  });

  it('returns null for single color', () => {
    expect(parseColors('#333333')).toBeNull();
  });

  it('returns null for invalid hex', () => {
    expect(parseColors('#ZZZZZZ #FFFFFF')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseColors('')).toBeNull();
  });
});

describe('format function (integration)', () => {
  it('reports 21:1 for black on white', () => {
    const result = kontrastPruefer.format('#000000 #FFFFFF');
    expect(result).toContain('21.00:1');
    expect(result).toContain('\u2705'); // pass emoji
    expect(result).not.toContain('\u274C'); // no fail emoji
  });

  it('reports 1:1 for white on white', () => {
    const result = kontrastPruefer.format('#FFFFFF #FFFFFF');
    expect(result).toContain('1.00:1');
    expect(result).not.toContain('\u2705'); // no pass emoji
    expect(result).toContain('\u274C'); // fail emoji
  });

  it('handles 3-digit hex shorthand', () => {
    const result = kontrastPruefer.format('#000 #FFF');
    expect(result).toContain('21.00:1');
  });

  it('returns empty string for invalid input', () => {
    expect(kontrastPruefer.format('')).toBe('');
    expect(kontrastPruefer.format('#ZZZ #FFF')).toBe('');
    expect(kontrastPruefer.format('#333')).toBe('');
  });

  it('displays foreground and background labels', () => {
    const result = kontrastPruefer.format('#333333 #FFFFFF');
    expect(result).toContain('Vordergrund: #333333');
    expect(result).toContain('Hintergrund: #FFFFFF');
  });

  it('shows correct WCAG sections', () => {
    const result = kontrastPruefer.format('#333333 #FFFFFF');
    expect(result).toContain('WCAG AA');
    expect(result).toContain('WCAG AAA');
  });

  it('computes known ratio for #767676 on #FFFFFF (4.54:1)', () => {
    // #767676 is the famous AA boundary color on white
    const result = kontrastPruefer.format('#767676 #FFFFFF');
    expect(result).toContain('4.54:1');
  });
});
