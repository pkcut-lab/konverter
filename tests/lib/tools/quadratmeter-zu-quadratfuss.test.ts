import { describe, it, expect } from 'vitest';
import { quadratmeterZuQuadratfuss } from '../../../src/lib/tools/quadratmeter-zu-quadratfuss';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('quadratmeterZuQuadratfuss config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(quadratmeterZuQuadratfuss);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(quadratmeterZuQuadratfuss.id).toBe('sqm-to-sqft');
    expect(quadratmeterZuQuadratfuss.type).toBe('converter');
    expect(quadratmeterZuQuadratfuss.categoryId).toBe('flaeche');
    expect(quadratmeterZuQuadratfuss.units.from.id).toBe('m2');
    expect(quadratmeterZuQuadratfuss.units.to.id).toBe('ft2');
    expect(quadratmeterZuQuadratfuss.decimals).toBe(4);
    expect(quadratmeterZuQuadratfuss.examples).toEqual([1, 10, 50, 100]);
  });

  it('formula is linear with pre-squared factor (3.28084²)', () => {
    expect(quadratmeterZuQuadratfuss.formula).toEqual({ type: 'linear', factor: 10.7639104 });
  });
});
