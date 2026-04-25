import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { kiBildDetektor } from '../../../src/lib/tools/ki-bild-detektor-config';

describe('kiBildDetektor config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(kiBildDetektor);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(kiBildDetektor.id).toBe('ki-bild-detektor');
    expect(kiBildDetektor.type).toBe('formatter');
    expect(kiBildDetektor.mode).toBe('custom');
  });

  it('categoryId ist sinnvoll für Bild-AI-Tool', () => {
    expect(typeof kiBildDetektor.categoryId).toBe('string');
    expect(kiBildDetektor.categoryId.length).toBeGreaterThan(0);
  });

  it('format is callable (no-op stub — processing in custom component)', () => {
    expect(typeof kiBildDetektor.format).toBe('function');
  });

  it('format identity (Stub-Behavior)', () => {
    expect(kiBildDetektor.format('test')).toBe('test');
  });

  it('rejects modification with empty id', () => {
    const broken = { ...kiBildDetektor, id: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with invalid type', () => {
    const broken = { ...kiBildDetektor, type: 'invalid' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with empty categoryId', () => {
    const broken = { ...kiBildDetektor, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with invalid mode', () => {
    const broken = { ...kiBildDetektor, mode: 'invalid' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('Tool-ID matcht slug-map convention (kebab-case)', () => {
    expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(kiBildDetektor.id)).toBe(true);
  });

  it('mode "custom" signalisiert dass die Implementation in der Custom-Component liegt', () => {
    expect(kiBildDetektor.mode).toBe('custom');
  });

  it('hat keinen inverse-Handler (Detector ist Read-Only)', () => {
    expect(kiBildDetektor.inverse).toBeUndefined();
  });

  it('hat keine Placeholder-Konfig (Component-eigene UI)', () => {
    expect(kiBildDetektor.placeholder).toBeUndefined();
  });

  it('format identity preserves Unicode', () => {
    expect(kiBildDetektor.format('Schöne Grüße ÄÖÜ ß')).toBe('Schöne Grüße ÄÖÜ ß');
  });

  it('format identity for empty input', () => {
    expect(kiBildDetektor.format('')).toBe('');
  });
});
