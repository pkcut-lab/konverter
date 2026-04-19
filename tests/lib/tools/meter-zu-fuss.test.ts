import { describe, it, expect } from 'vitest';
import { meterZuFuss } from '../../../src/lib/tools/meter-zu-fuss';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('meterZuFuss config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(meterZuFuss);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(meterZuFuss.id).toBe('meter-to-feet');
    expect(meterZuFuss.type).toBe('converter');
    expect(meterZuFuss.categoryId).toBe('laengen');
    expect(meterZuFuss.units.from.id).toBe('m');
    expect(meterZuFuss.units.to.id).toBe('ft');
    expect(meterZuFuss.decimals).toBe(4);
    expect(meterZuFuss.examples).toEqual([1, 10, 100, 1000]);
  });

  it('formula is linear with factor 3.28084', () => {
    expect(meterZuFuss.formula).toEqual({ type: 'linear', factor: 3.28084 });
  });

  it('exposes an iconPrompt string', () => {
    expect(typeof meterZuFuss.iconPrompt).toBe('string');
    expect((meterZuFuss.iconPrompt ?? '').length).toBeGreaterThan(40);
  });
});
