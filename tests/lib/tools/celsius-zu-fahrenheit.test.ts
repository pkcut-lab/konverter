import { describe, it, expect } from 'vitest';
import { celsiusZuFahrenheit } from '../../../src/lib/tools/celsius-zu-fahrenheit';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('celsiusZuFahrenheit config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(celsiusZuFahrenheit);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(celsiusZuFahrenheit.id).toBe('celsius-to-fahrenheit');
    expect(celsiusZuFahrenheit.type).toBe('converter');
    expect(celsiusZuFahrenheit.categoryId).toBe('temperatur');
    expect(celsiusZuFahrenheit.units.from.id).toBe('c');
    expect(celsiusZuFahrenheit.units.to.id).toBe('f');
    expect(celsiusZuFahrenheit.decimals).toBe(2);
    expect(celsiusZuFahrenheit.examples).toEqual([-40, 0, 20, 37, 100]);
  });

  it('formula is affine — required for temperature offset', () => {
    expect(celsiusZuFahrenheit.formula).toEqual({ type: 'affine', factor: 1.8, offset: 32 });
  });
});
