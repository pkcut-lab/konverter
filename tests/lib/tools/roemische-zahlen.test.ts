import { describe, it, expect } from 'vitest';
import {
  roemischeZahlen,
  arabicToRoman,
  romanToArabic,
  getBreakdown,
} from '../../../src/lib/tools/roemische-zahlen';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('roemischeZahlen config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(roemischeZahlen);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(roemischeZahlen.id).toBe('roman-numerals');
    expect(roemischeZahlen.type).toBe('formatter');
    expect(roemischeZahlen.categoryId).toBe('text');
    expect(roemischeZahlen.mode).toBe('custom');
  });
});

describe('arabicToRoman', () => {
  it.each([
    [1, 'I'],
    [4, 'IV'],
    [9, 'IX'],
    [14, 'XIV'],
    [49, 'XLIX'],
    [99, 'XCIX'],
    [490, 'CDXC'],
    [999, 'CMXCIX'],
    [1984, 'MCMLXXXIV'],
    [2026, 'MMXXVI'],
    [3999, 'MMMCMXCIX'],
  ])('converts %i to %s', (input, expected) => {
    expect(arabicToRoman(input)).toBe(expected);
  });

  it('throws on zero', () => {
    expect(() => arabicToRoman(0)).toThrow('Null');
  });

  it('throws on negative numbers', () => {
    expect(() => arabicToRoman(-5)).toThrow('Negative');
  });

  it('throws on numbers above 3999', () => {
    expect(() => arabicToRoman(4000)).toThrow('3999');
  });

  it('throws on decimal numbers', () => {
    expect(() => arabicToRoman(3.5)).toThrow('Ganzzahlen');
  });
});

describe('romanToArabic', () => {
  it.each([
    ['I', 1],
    ['IV', 4],
    ['IX', 9],
    ['XLIX', 49],
    ['XCIX', 99],
    ['CDXC', 490],
    ['CMXCIX', 999],
    ['MCMXCIX', 1999],
    ['MMXXVI', 2026],
    ['MMMCMXCIX', 3999],
  ])('converts %s to %i', (input, expected) => {
    expect(romanToArabic(input)).toBe(expected);
  });

  it('handles lowercase input', () => {
    expect(romanToArabic('iv')).toBe(4);
    expect(romanToArabic('mcmxcix')).toBe(1999);
  });

  it('handles mixed case', () => {
    expect(romanToArabic('iV')).toBe(4);
  });

  it('strips whitespace', () => {
    expect(romanToArabic('X X I')).toBe(21);
  });

  it('tolerates IIII (clock notation) and returns 4', () => {
    expect(romanToArabic('IIII')).toBe(4);
  });

  it('throws on empty input', () => {
    expect(() => romanToArabic('')).toThrow('Bitte');
  });

  it('throws on IC (invalid subtraction)', () => {
    expect(() => romanToArabic('IC')).toThrow('I darf nur vor V oder X');
  });

  it('throws on VX (V before larger)', () => {
    expect(() => romanToArabic('VX')).toThrow('V darf nie');
  });

  it('throws on XD (invalid subtraction)', () => {
    expect(() => romanToArabic('XD')).toThrow('X darf nur vor L oder C');
  });

  it('throws on invalid characters', () => {
    expect(() => romanToArabic('ABC')).toThrow('Ungültige Zeichen');
  });
});

describe('getBreakdown', () => {
  it('breaks down 1999 into M + CM + XC + IX', () => {
    const steps = getBreakdown(1999);
    expect(steps).toEqual([
      { symbol: 'M', value: 1000 },
      { symbol: 'CM', value: 900 },
      { symbol: 'XC', value: 90 },
      { symbol: 'IX', value: 9 },
    ]);
  });

  it('breaks down 2026 into MM + XX + VI', () => {
    const steps = getBreakdown(2026);
    expect(steps).toEqual([
      { symbol: 'M', value: 1000 },
      { symbol: 'M', value: 1000 },
      { symbol: 'X', value: 10 },
      { symbol: 'X', value: 10 },
      { symbol: 'V', value: 5 },
      { symbol: 'I', value: 1 },
    ]);
  });
});

describe('format function (auto-detect)', () => {
  it('converts Arabic input and includes breakdown', () => {
    const result = roemischeZahlen.format('1999');
    expect(result).toContain('MCMXCIX');
    expect(result).toContain('M=1000');
  });

  it('converts Roman input to Arabic', () => {
    const result = roemischeZahlen.format('MMXXVI');
    expect(result).toContain('2026');
  });

  it('adds clock notation hint for IIII', () => {
    const result = roemischeZahlen.format('IIII');
    expect(result).toContain('4');
    expect(result).toContain('Uhrmacher');
  });

  it('throws on empty input', () => {
    expect(() => roemischeZahlen.format('')).toThrow('Bitte');
    expect(() => roemischeZahlen.format('   ')).toThrow('Bitte');
  });

  it('throws on negative number string', () => {
    expect(() => roemischeZahlen.format('-5')).toThrow('Negative');
  });

  it('throws on decimal number string', () => {
    expect(() => roemischeZahlen.format('3.5')).toThrow('Ganzzahlen');
  });

  it('throws on unrecognised input', () => {
    expect(() => roemischeZahlen.format('hello')).toThrow('Eingabe nicht erkannt');
  });
});
