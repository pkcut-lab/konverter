import { describe, it, expect } from 'vitest';
import { unixTimestamp } from '../../../src/lib/tools/unix-timestamp';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('unixTimestamp config', () => {
  it('parses as valid ConverterConfig', () => {
    const r = parseToolConfig(unixTimestamp);
    expect(r.ok).toBe(true);
  });

  it('rejects invalid modification', () => {
    const broken = { ...unixTimestamp, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('has the expected identity fields', () => {
    expect(unixTimestamp.id).toBe('unix-timestamp');
    expect(unixTimestamp.type).toBe('converter');
    expect(unixTimestamp.categoryId).toBe('time');
    expect(unixTimestamp.units.from.id).toBe('s');
    expect(unixTimestamp.units.to.id).toBe('ms');
    expect(unixTimestamp.decimals).toBe(0);
  });

  it('formula is linear with factor 1000', () => {
    expect(unixTimestamp.formula).toEqual({ type: 'linear', factor: 1000 });
  });

  it('converts 0 seconds to 0 milliseconds (epoch)', () => {
    const factor = unixTimestamp.formula.type === 'linear' ? unixTimestamp.formula.factor : NaN;
    expect(0 * factor).toBe(0);
  });

  it('converts 86400 seconds to 86400000 milliseconds (1 day)', () => {
    const factor = unixTimestamp.formula.type === 'linear' ? unixTimestamp.formula.factor : NaN;
    expect(86400 * factor).toBe(86_400_000);
  });

  it('examples include epoch, 1-day, current-era and Y2038 boundary', () => {
    expect(unixTimestamp.examples).toEqual([0, 86400, 1745230000, 2147483647]);
  });
});
