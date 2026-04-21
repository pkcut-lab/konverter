import { describe, it, expect } from 'vitest';
import {
  hexRgbKonverter,
  normalizeHex,
  hexToRgb,
  rgbToHsl,
  rgbToOklch,
} from '../../../src/lib/tools/hex-rgb-konverter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('hexRgbKonverter config', () => {
  it('is a valid FormatterConfig per S4 schema', () => {
    const r = parseToolConfig(hexRgbKonverter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(hexRgbKonverter.id).toBe('hex-to-rgb');
    expect(hexRgbKonverter.type).toBe('formatter');
    expect(hexRgbKonverter.categoryId).toBe('farben');
    expect(hexRgbKonverter.mode).toBe('custom');
  });
});

describe('normalizeHex', () => {
  it('strips hash and normalizes 3-digit shorthand', () => {
    expect(normalizeHex('#F0A')).toBe('FF00AA');
  });

  it('normalizes 4-digit shorthand with alpha', () => {
    expect(normalizeHex('#F0A8')).toBe('FF00AA88');
  });

  it('passes through 6-digit hex', () => {
    expect(normalizeHex('#FF5733')).toBe('FF5733');
  });

  it('passes through 8-digit hex', () => {
    expect(normalizeHex('#FF573380')).toBe('FF573380');
  });

  it('handles input without hash', () => {
    expect(normalizeHex('ff5733')).toBe('ff5733');
  });

  it('strips whitespace silently', () => {
    expect(normalizeHex(' #FF 5733 ')).toBe('FF5733');
  });

  it('returns null for invalid characters', () => {
    expect(normalizeHex('#GG0000')).toBeNull();
  });

  it('returns null for invalid length (5 chars)', () => {
    expect(normalizeHex('#12345')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeHex('')).toBeNull();
  });
});

describe('hexToRgb', () => {
  it('converts #000000 to rgb(0, 0, 0)', () => {
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts #FFFFFF to rgb(255, 255, 255)', () => {
    expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts #FF0000 to rgb(255, 0, 0)', () => {
    expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts #FF5733 correctly', () => {
    expect(hexToRgb('FF5733')).toEqual({ r: 255, g: 87, b: 51 });
  });
});

describe('rgbToHsl', () => {
  it('converts pure red to hsl(0, 100%, 50%)', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('converts white to hsl(0, 0%, 100%)', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts black to hsl(0, 0%, 0%)', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });
});

describe('rgbToOklch', () => {
  it('converts black to L=0', () => {
    const result = rgbToOklch(0, 0, 0);
    expect(result.L).toBe(0);
    expect(result.C).toBe(0);
  });

  it('converts white to L≈1', () => {
    const result = rgbToOklch(255, 255, 255);
    expect(result.L).toBeCloseTo(1, 1);
    expect(result.C).toBeCloseTo(0, 2);
  });

  it('converts pure red to expected OKLCH range', () => {
    const result = rgbToOklch(255, 0, 0);
    expect(result.L).toBeGreaterThan(0.5);
    expect(result.C).toBeGreaterThan(0.2);
    expect(result.h).toBeGreaterThan(20);
    expect(result.h).toBeLessThan(30);
  });
});

describe('format function (integration)', () => {
  it('formats 6-digit hex to RGB + HSL + OKLCH', () => {
    const result = hexRgbKonverter.format('#FF0000');
    const lines = result.split('\n');
    expect(lines[0]).toBe('rgb(255, 0, 0)');
    expect(lines[1]).toBe('hsl(0, 100%, 50%)');
    expect(lines[2]).toMatch(/^oklch\(/);
  });

  it('formats 8-digit hex with alpha to RGBA', () => {
    const result = hexRgbKonverter.format('#FF000080');
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^rgba\(255, 0, 0, 0\.5/);
  });

  it('returns empty string for invalid input', () => {
    expect(hexRgbKonverter.format('#ZZZ')).toBe('');
    expect(hexRgbKonverter.format('')).toBe('');
  });

  it('handles 3-digit shorthand', () => {
    const result = hexRgbKonverter.format('#F00');
    expect(result.split('\n')[0]).toBe('rgb(255, 0, 0)');
  });
});
