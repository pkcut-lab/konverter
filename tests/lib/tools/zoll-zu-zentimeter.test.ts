import { describe, it, expect } from 'vitest';
import { zollZuZentimeter } from '../../../src/lib/tools/zoll-zu-zentimeter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('zollZuZentimeter config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(zollZuZentimeter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(zollZuZentimeter.id).toBe('inch-to-cm');
    expect(zollZuZentimeter.type).toBe('converter');
    expect(zollZuZentimeter.categoryId).toBe('laengen');
    expect(zollZuZentimeter.units.from.id).toBe('in');
    expect(zollZuZentimeter.units.to.id).toBe('cm');
    expect(zollZuZentimeter.decimals).toBe(4);
    expect(zollZuZentimeter.examples).toEqual([1, 5, 10, 55]);
  });

  it('formula is linear with exact factor 2.54', () => {
    expect(zollZuZentimeter.formula).toEqual({ type: 'linear', factor: 2.54 });
  });

  it('rejects invalid modification', () => {
    const broken = { ...zollZuZentimeter, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('converts 1 inch to 2.54 cm exactly', () => {
    const factor = zollZuZentimeter.formula.type === 'linear'
      ? zollZuZentimeter.formula.factor
      : NaN;
    expect(1 * factor).toBe(2.54);
  });

  it('converts 55 inches to 139.7 cm (common TV size)', () => {
    const factor = zollZuZentimeter.formula.type === 'linear'
      ? zollZuZentimeter.formula.factor
      : NaN;
    expect(55 * factor).toBeCloseTo(139.7, 1);
  });
});
