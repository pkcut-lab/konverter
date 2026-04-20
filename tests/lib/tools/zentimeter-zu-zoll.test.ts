import { describe, it, expect } from 'vitest';
import { zentimeterZuZoll } from '../../../src/lib/tools/zentimeter-zu-zoll';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('zentimeterZuZoll config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(zentimeterZuZoll);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(zentimeterZuZoll.id).toBe('cm-to-inch');
    expect(zentimeterZuZoll.type).toBe('converter');
    expect(zentimeterZuZoll.categoryId).toBe('laengen');
    expect(zentimeterZuZoll.units.from.id).toBe('cm');
    expect(zentimeterZuZoll.units.to.id).toBe('in');
    expect(zentimeterZuZoll.decimals).toBe(4);
    expect(zentimeterZuZoll.examples).toEqual([1, 10, 30, 100]);
  });

  it('formula is linear with the exact inverse-of-2.54 factor', () => {
    expect(zentimeterZuZoll.formula).toEqual({ type: 'linear', factor: 0.3937007874 });
  });
});
