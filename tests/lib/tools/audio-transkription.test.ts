import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { audioTranskriptionConfig } from '../../../src/lib/tools/audio-transkription-config';

describe('audioTranskriptionConfig config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(audioTranskriptionConfig);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(audioTranskriptionConfig.id).toBe('audio-transkription');
    expect(audioTranskriptionConfig.type).toBe('formatter');
    expect(audioTranskriptionConfig.mode).toBe('custom');
  });

  it('categoryId ist sinnvoll für Audio-Tool', () => {
    expect(typeof audioTranskriptionConfig.categoryId).toBe('string');
    expect(audioTranskriptionConfig.categoryId.length).toBeGreaterThan(0);
  });

  it('format is callable (no-op stub — processing in custom component)', () => {
    expect(typeof audioTranskriptionConfig.format).toBe('function');
  });

  it('format identity (Stub-Behavior)', () => {
    expect(audioTranskriptionConfig.format('test')).toBe('test');
  });

  it('rejects modification with empty id', () => {
    const broken = { ...audioTranskriptionConfig, id: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with invalid type', () => {
    const broken = { ...audioTranskriptionConfig, type: 'invalid' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with empty categoryId', () => {
    const broken = { ...audioTranskriptionConfig, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with invalid mode', () => {
    const broken = { ...audioTranskriptionConfig, mode: 'invalid' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('Tool-ID matcht slug-map convention (kebab-case)', () => {
    expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(audioTranskriptionConfig.id)).toBe(true);
  });

  it('mode "custom" signalisiert Implementation in Custom-Component', () => {
    expect(audioTranskriptionConfig.mode).toBe('custom');
  });

  it('hat keinen inverse-Handler (Transcription ist eine Richtung)', () => {
    expect(audioTranskriptionConfig.inverse).toBeUndefined();
  });

  it('hat keine Placeholder-Konfig (Component-eigene UI)', () => {
    expect(audioTranskriptionConfig.placeholder).toBeUndefined();
  });

  it('format identity preserves Unicode', () => {
    expect(audioTranskriptionConfig.format('Schöne Grüße ÄÖÜ ß'))
      .toBe('Schöne Grüße ÄÖÜ ß');
  });

  it('format identity for empty input', () => {
    expect(audioTranskriptionConfig.format('')).toBe('');
  });

  it('format identity for multiline transcript', () => {
    const transcript = 'Hallo, das ist Zeile 1.\nUnd das ist Zeile 2.';
    expect(audioTranskriptionConfig.format(transcript)).toBe(transcript);
  });
});
