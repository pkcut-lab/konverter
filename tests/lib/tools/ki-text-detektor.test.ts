import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { kiTextDetektor } from '../../../src/lib/tools/ki-text-detektor-config';

describe('kiTextDetektor config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(kiTextDetektor);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(kiTextDetektor.id).toBe('ki-text-detektor');
    expect(kiTextDetektor.type).toBe('formatter');
    expect(kiTextDetektor.categoryId).toBe('text');
    expect(kiTextDetektor.mode).toBe('custom');
  });

  it('format is callable (no-op stub — processing in custom component)', () => {
    expect(typeof kiTextDetektor.format).toBe('function');
  });

  it('format identity for empty string', () => {
    expect(kiTextDetektor.format('')).toBe('');
  });

  it('format identity for typical text', () => {
    const text = 'Dies ist ein Beispieltext zur Prüfung.';
    expect(kiTextDetektor.format(text)).toBe(text);
  });

  it('format preserves multiline input', () => {
    const text = 'Zeile 1\nZeile 2\nZeile 3';
    expect(kiTextDetektor.format(text)).toBe(text);
  });

  it('format preserves Unicode (umlaute, ß)', () => {
    const text = 'Schöne Grüße aus Köln, ß ÄÖÜ';
    expect(kiTextDetektor.format(text)).toBe(text);
  });

  it('rejects modification with empty id', () => {
    const broken = { ...kiTextDetektor, id: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with invalid type', () => {
    const broken = { ...kiTextDetektor, type: 'invalid' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with empty categoryId', () => {
    const broken = { ...kiTextDetektor, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with invalid mode', () => {
    const broken = { ...kiTextDetektor, mode: 'invalid' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('Tool-ID matcht slug-map convention (kebab-case)', () => {
    expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(kiTextDetektor.id)).toBe(true);
  });

  it('mode "custom" signalisiert dass die Implementation in der Custom-Component liegt', () => {
    expect(kiTextDetektor.mode).toBe('custom');
  });

  it('hat keinen inverse-Handler (Detector ist Read-Only)', () => {
    expect(kiTextDetektor.inverse).toBeUndefined();
  });

  it('hat keine Placeholder-Konfig (Component-eigene UI)', () => {
    expect(kiTextDetektor.placeholder).toBeUndefined();
  });
});
