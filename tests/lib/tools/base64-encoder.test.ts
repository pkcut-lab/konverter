import { describe, it, expect } from 'vitest';
import { base64Encoder } from '../../../src/lib/tools/base64-encoder';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('base64Encoder config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(base64Encoder);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(base64Encoder.id).toBe('base64-encoder');
    expect(base64Encoder.type).toBe('formatter');
    expect(base64Encoder.categoryId).toBe('dev');
    expect(base64Encoder.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...base64Encoder, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('base64Encoder format', () => {
  it('encodes a simple ASCII string', () => {
    expect(base64Encoder.format('Hallo')).toBe('SGFsbG8=');
  });

  it('encodes an empty-padded string correctly', () => {
    expect(base64Encoder.format('Hi')).toBe('SGk=');
  });

  it('encodes a string with no padding needed', () => {
    expect(base64Encoder.format('abc')).toBe('YWJj');
  });

  it('handles UTF-8 umlauts', () => {
    const result = base64Encoder.format('ä');
    // ä = UTF-8 bytes 0xC3 0xA4 → Base64 'w6Q='
    expect(result).toBe('w6Q=');
  });

  it('handles emoji (multi-byte UTF-8)', () => {
    const result = base64Encoder.format('😀');
    // 😀 = UTF-8 bytes 0xF0 0x9F 0x98 0x80 → Base64 '8J+YgA=='
    expect(result).toBe('8J+YgA==');
  });

  it('handles mixed ASCII and unicode', () => {
    const result = base64Encoder.format('Ü');
    expect(result).toBe('w5w=');
  });

  it('trims surrounding whitespace before encoding', () => {
    const result = base64Encoder.format('  Hallo  ');
    expect(result).toBe('SGFsbG8=');
  });

  it('throws on empty input', () => {
    expect(() => base64Encoder.format('')).toThrow('Bitte Text eingeben');
    expect(() => base64Encoder.format('   ')).toThrow('Bitte Text eingeben');
  });

  it('encodes JSON payload correctly', () => {
    const input = '{"user":"admin"}';
    expect(base64Encoder.format(input)).toBe('eyJ1c2VyIjoiYWRtaW4ifQ==');
  });

  it('encodes Basic Auth string correctly', () => {
    const input = 'username:password';
    expect(base64Encoder.format(input)).toBe('dXNlcm5hbWU6cGFzc3dvcmQ=');
  });
});
