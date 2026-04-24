import { describe, it, expect } from 'vitest';
import { parseDE } from '../../../src/lib/tools/parse-de';

describe('parseDE — B-LOCALE-01 test matrix', () => {
  it('plain integer 3000', () => expect(parseDE('3000')).toBe(3000));
  it('DE thousands "3.000" → 3000 (was the bug)', () => expect(parseDE('3.000')).toBe(3000));
  it('DE decimal comma "3,00" → 3', () => expect(parseDE('3,00')).toBeCloseTo(3.0));
  it('DE full "3.000,50" → 3000.5', () => expect(parseDE('3.000,50')).toBeCloseTo(3000.5));
  it('EN decimal "3.5" → 3.5', () => expect(parseDE('3.5')).toBeCloseTo(3.5));
  it('EN decimal "3.50" → 3.5', () => expect(parseDE('3.50')).toBeCloseTo(3.5));
  it('DE thousands "3.500" → 3500', () => expect(parseDE('3.500')).toBe(3500));

  // Additional edge cases
  it('multi-thousands "1.000.000" → 1000000', () => expect(parseDE('1.000.000')).toBe(1000000));
  it('DE full multi "1.000.000,99" → 1000000.99', () =>
    expect(parseDE('1.000.000,99')).toBeCloseTo(1000000.99));
  it('empty string → NaN', () => expect(parseDE('')).toBeNaN());
  it('plain "-" → NaN', () => expect(parseDE('-')).toBeNaN());
  it('plain "0" → 0', () => expect(parseDE('0')).toBe(0));
  it('"0,00" → 0', () => expect(parseDE('0,00')).toBe(0));
  it('whitespace trimmed " 3.000 " → 3000', () => expect(parseDE(' 3.000 ')).toBe(3000));

  // Finance-relevant amounts
  it('"200.000" (Kreditbetrag) → 200000', () => expect(parseDE('200.000')).toBe(200000));
  it('"4.500" (Gehalt) → 4500', () => expect(parseDE('4.500')).toBe(4500));
  it('"3,80" (Zinssatz) → 3.8', () => expect(parseDE('3,80')).toBeCloseTo(3.8));
});
