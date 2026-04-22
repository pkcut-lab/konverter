import { describe, it, expect } from 'vitest';
import { unixTimestamp, parseTimestampInput } from '../../../src/lib/tools/unix-timestamp';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('unixTimestamp config', () => {
  it('parses as valid FormatterConfig', () => {
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
    expect(unixTimestamp.type).toBe('formatter');
    expect(unixTimestamp.categoryId).toBe('time');
    expect(unixTimestamp.mode).toBe('custom');
  });

  it('ships a placeholder', () => {
    expect(unixTimestamp.placeholder).toBeTruthy();
    expect(unixTimestamp.placeholder).toContain('1700000000');
  });
});

describe('parseTimestampInput', () => {
  it('parses a 10-digit string as Unix seconds', () => {
    const { date, interpretedAs } = parseTimestampInput('1700000000');
    expect(date.getTime()).toBe(1700000000 * 1000);
    expect(interpretedAs).toContain('Sekunden');
  });

  it('parses a 13-digit string as Unix milliseconds', () => {
    const { date, interpretedAs } = parseTimestampInput('1700000000000');
    expect(date.getTime()).toBe(1700000000000);
    expect(interpretedAs).toContain('Millisekunden');
  });

  it('parses an ISO-8601 string as Date', () => {
    const { date, interpretedAs } = parseTimestampInput('2024-03-15T12:00:00Z');
    expect(date.toISOString()).toBe('2024-03-15T12:00:00.000Z');
    expect(interpretedAs).toContain('Datum');
  });

  it('parses epoch zero as 1970', () => {
    const { date } = parseTimestampInput('0');
    expect(date.getTime()).toBe(0);
  });

  it('throws on empty input', () => {
    expect(() => parseTimestampInput('')).toThrow();
  });

  it('throws on unrecognised input', () => {
    expect(() => parseTimestampInput('not a timestamp or date')).toThrow();
  });
});

describe('unixTimestamp.format', () => {
  it('produces a multi-line report with UTC, ISO and Unix lines', () => {
    const out = unixTimestamp.format('1700000000');
    expect(out).toContain('UTC:');
    expect(out).toContain('ISO 8601:');
    expect(out).toContain('Unix (s):    1700000000');
    expect(out).toContain('Unix (ms):   1700000000000');
  });
});
