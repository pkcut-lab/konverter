import { describe, it, expect } from 'vitest';
import { kilogrammZuPfund } from '../../../src/lib/tools/kilogramm-zu-pfund';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('kilogrammZuPfund config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(kilogrammZuPfund);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(kilogrammZuPfund.id).toBe('kg-to-lb');
    expect(kilogrammZuPfund.type).toBe('converter');
    expect(kilogrammZuPfund.categoryId).toBe('gewicht');
    expect(kilogrammZuPfund.units.from.id).toBe('kg');
    expect(kilogrammZuPfund.units.to.id).toBe('lb');
    expect(kilogrammZuPfund.decimals).toBe(4);
    expect(kilogrammZuPfund.examples).toEqual([1, 5, 70, 100]);
  });

  it('formula is linear with the exact inverse-of-0.45359237 factor', () => {
    expect(kilogrammZuPfund.formula).toEqual({ type: 'linear', factor: 2.2046226218 });
  });
});
