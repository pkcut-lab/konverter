import { describe, it, expect } from 'vitest';
import { kilometerZuMeilen } from '../../../src/lib/tools/kilometer-zu-meilen';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('kilometerZuMeilen config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(kilometerZuMeilen);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(kilometerZuMeilen.id).toBe('km-to-mile');
    expect(kilometerZuMeilen.type).toBe('converter');
    expect(kilometerZuMeilen.categoryId).toBe('laengen');
    expect(kilometerZuMeilen.units.from.id).toBe('km');
    expect(kilometerZuMeilen.units.to.id).toBe('mi');
    expect(kilometerZuMeilen.decimals).toBe(4);
    expect(kilometerZuMeilen.examples).toEqual([1, 5, 42.195, 100]);
  });

  it('formula is linear with the exact inverse-of-1.609344 factor', () => {
    expect(kilometerZuMeilen.formula).toEqual({ type: 'linear', factor: 0.6213711922 });
  });

  it('exposes an iconPrompt string', () => {
    expect(typeof kilometerZuMeilen.iconPrompt).toBe('string');
    expect((kilometerZuMeilen.iconPrompt ?? '').length).toBeGreaterThan(40);
  });
});
