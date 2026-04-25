import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { bildZuText } from '../../../src/lib/tools/bild-zu-text';

describe('bildZuText config', () => {
  it('parses as valid FileToolConfig', () => {
    const r = parseToolConfig(bildZuText);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(bildZuText.id).toBe('image-to-text');
    expect(bildZuText.type).toBe('file-tool');
    expect(bildZuText.categoryId).toBe('bilder');
  });

  it('accepts standard image MIME types', () => {
    expect(bildZuText.accept).toContain('image/png');
    expect(bildZuText.accept).toContain('image/jpeg');
    expect(bildZuText.accept).toContain('image/webp');
  });

  it('accepts HEIC/HEIF (iPhone format)', () => {
    expect(bildZuText.accept).toContain('image/heic');
    expect(bildZuText.accept).toContain('image/heif');
  });

  it('accepts AVIF (modern format)', () => {
    expect(bildZuText.accept).toContain('image/avif');
  });

  it('has reasonable maxSizeMb (10 MB für typische Scans/Screenshots)', () => {
    expect(bildZuText.maxSizeMb).toBeGreaterThan(0);
    expect(bildZuText.maxSizeMb).toBeLessThanOrEqual(15);
  });

  it('has filenameSuffix _text', () => {
    expect(bildZuText.filenameSuffix).toBe('_text');
  });

  it('defaultFormat ist .txt', () => {
    expect(bildZuText.defaultFormat).toBe('txt');
  });

  it('showQuality false (Text-Output hat keine Qualitäts-Slider-Logik)', () => {
    expect(bildZuText.showQuality).toBe(false);
  });

  it('process is callable', () => {
    expect(typeof bildZuText.process).toBe('function');
  });

  it('prepare is callable (lazy ML model load)', () => {
    expect(typeof bildZuText.prepare).toBe('function');
  });

  it('rejects modification with empty categoryId', () => {
    const broken = { ...bildZuText, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with maxSizeMb 0', () => {
    const broken = { ...bildZuText, maxSizeMb: 0 };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with empty accept array', () => {
    const broken = { ...bildZuText, accept: [] };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('Tool-ID matcht slug-map convention (kebab-case)', () => {
    expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bildZuText.id)).toBe(true);
  });

  it('FileToolConfig accept-list ist ASCII-only', () => {
    for (const mime of bildZuText.accept) {
      expect(/^[\x20-\x7E]+$/.test(mime)).toBe(true);
    }
  });
});
