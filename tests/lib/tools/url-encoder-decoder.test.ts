import { describe, it, expect } from 'vitest';
import {
  urlEncoderDecoder,
  decodeUrl,
  hasPercentEncoding,
} from '../../../src/lib/tools/url-encoder-decoder';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('urlEncoderDecoder config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(urlEncoderDecoder);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(urlEncoderDecoder.id).toBe('url-encoder-decoder');
    expect(urlEncoderDecoder.type).toBe('formatter');
    expect(urlEncoderDecoder.categoryId).toBe('dev');
    expect(urlEncoderDecoder.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...urlEncoderDecoder, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('urlEncoderDecoder format (encode)', () => {
  it('encodes a simple string with spaces', () => {
    expect(urlEncoderDecoder.format('Hallo Welt')).toBe('Hallo%20Welt');
  });

  it('encodes special URL characters', () => {
    expect(urlEncoderDecoder.format('key=wert&mehr=ja')).toBe('key%3Dwert%26mehr%3Dja');
  });

  it('encodes German umlauts', () => {
    expect(urlEncoderDecoder.format('münchen')).toBe('m%C3%BCnchen');
  });

  it('encodes a percent sign', () => {
    expect(urlEncoderDecoder.format('100%')).toBe('100%25');
  });

  it('handles emoji (multi-byte UTF-8)', () => {
    expect(urlEncoderDecoder.format('😀')).toBe('%F0%9F%98%80');
  });

  it('leaves unreserved characters untouched', () => {
    expect(urlEncoderDecoder.format('Hello-World_test.file~v2')).toBe(
      'Hello-World_test.file~v2',
    );
  });

  it('trims surrounding whitespace before encoding', () => {
    expect(urlEncoderDecoder.format('  test  ')).toBe('test');
  });

  it('throws on empty input', () => {
    expect(() => urlEncoderDecoder.format('')).toThrow('Bitte Text eingeben');
    expect(() => urlEncoderDecoder.format('   ')).toThrow('Bitte Text eingeben');
  });

  it('encodes a full URL when used as parameter value', () => {
    expect(urlEncoderDecoder.format('https://example.com/pfad?q=test')).toBe(
      'https%3A%2F%2Fexample.com%2Fpfad%3Fq%3Dtest',
    );
  });
});

describe('decodeUrl', () => {
  it('decodes a simple percent-encoded string', () => {
    expect(decodeUrl('Hallo%20Welt')).toBe('Hallo Welt');
  });

  it('decodes German umlauts', () => {
    expect(decodeUrl('m%C3%BCnchen')).toBe('münchen');
  });

  it('decodes emoji', () => {
    expect(decodeUrl('%F0%9F%98%80')).toBe('😀');
  });

  it('decodes a full encoded URL', () => {
    expect(decodeUrl('https%3A%2F%2Fexample.com%2Fpfad%3Fq%3Dtest')).toBe(
      'https://example.com/pfad?q=test',
    );
  });

  it('throws on empty input', () => {
    expect(() => decodeUrl('')).toThrow('Bitte Text eingeben');
    expect(() => decodeUrl('   ')).toThrow('Bitte Text eingeben');
  });

  it('throws on malformed percent sequence', () => {
    expect(() => decodeUrl('%2G')).toThrow('Ungültige Percent-Encoding-Sequenz');
  });

  it('throws on incomplete percent sequence', () => {
    expect(() => decodeUrl('%')).toThrow('Ungültige Percent-Encoding-Sequenz');
  });
});

describe('hasPercentEncoding', () => {
  it('returns true for input with valid percent sequences', () => {
    expect(hasPercentEncoding('hello%20world')).toBe(true);
    expect(hasPercentEncoding('%C3%A4')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(hasPercentEncoding('hello world')).toBe(false);
    expect(hasPercentEncoding('no encoding here')).toBe(false);
  });

  it('returns false for incomplete percent sequences', () => {
    expect(hasPercentEncoding('100% done')).toBe(false);
    expect(hasPercentEncoding('%2G invalid')).toBe(false);
  });
});
