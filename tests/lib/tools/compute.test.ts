import { describe, it, expect } from 'vitest';
import { computeConversion } from '../../../src/lib/tools/compute';

describe('computeConversion — linear', () => {
  const m2ft = { type: 'linear', factor: 3.28084 } as const;

  it('forward: meters → feet', () => {
    expect(computeConversion(m2ft, 1, 'forward')).toBeCloseTo(3.28084, 5);
    expect(computeConversion(m2ft, 2, 'forward')).toBeCloseTo(6.56168, 5);
  });

  it('inverse: feet → meters', () => {
    expect(computeConversion(m2ft, 3.28084, 'inverse')).toBeCloseTo(1, 5);
    expect(computeConversion(m2ft, 1, 'inverse')).toBeCloseTo(0.3048, 4);
  });

  it('round-trip: forward then inverse returns original', () => {
    const original = 42.5;
    const fwd = computeConversion(m2ft, original, 'forward');
    const back = computeConversion(m2ft, fwd, 'inverse');
    expect(back).toBeCloseTo(original, 10);
  });
});

describe('computeConversion — affine', () => {
  const c2f = { type: 'affine', factor: 1.8, offset: 32 } as const;

  it('forward: °C → °F (0 → 32, 100 → 212)', () => {
    expect(computeConversion(c2f, 0, 'forward')).toBe(32);
    expect(computeConversion(c2f, 100, 'forward')).toBe(212);
  });

  it('inverse: °F → °C (32 → 0, 212 → 100)', () => {
    expect(computeConversion(c2f, 32, 'inverse')).toBe(0);
    expect(computeConversion(c2f, 212, 'inverse')).toBe(100);
  });

  it('round-trip: forward then inverse returns original', () => {
    const original = 20.5;
    const fwd = computeConversion(c2f, original, 'forward');
    const back = computeConversion(c2f, fwd, 'inverse');
    expect(back).toBeCloseTo(original, 10);
  });
});
