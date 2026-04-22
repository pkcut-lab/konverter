import { describe, it, expect } from 'vitest';
import { hintergrundEntferner } from '../../../src/lib/tools/hintergrund-entferner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { getToolConfig, hasTool } from '../../../src/lib/tool-registry';
import { slugMap } from '../../../src/lib/slug-map';
import { getRuntime } from '../../../src/lib/tools/tool-runtime-registry';

describe('hintergrund-entferner config + registry', () => {
  it('config validates against fileToolSchema', () => {
    const r = parseToolConfig(hintergrundEntferner);
    expect(r.ok).toBe(true);
  });

  it('id is remove-background', () => {
    expect(hintergrundEntferner.id).toBe('remove-background');
  });

  it('accepts PNG, JPG, WebP, AVIF, HEIC, HEIF', () => {
    expect(hintergrundEntferner.accept).toEqual(
      expect.arrayContaining(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/heic', 'image/heif'])
    );
  });

  it('maxSizeMb is 15', () => {
    expect(hintergrundEntferner.maxSizeMb).toBe(15);
  });

  it('defaultFormat is png', () => {
    expect(hintergrundEntferner.defaultFormat).toBe('png');
  });

  it('filenameSuffix is _no-bg', () => {
    expect(hintergrundEntferner.filenameSuffix).toBe('_no-bg');
  });

  it('showQuality is false (quality slider hidden)', () => {
    expect(hintergrundEntferner.showQuality).toBe(false);
  });

  it('exposes prepare function', () => {
    expect(typeof hintergrundEntferner.prepare).toBe('function');
  });

  it('is registered in tool-registry', async () => {
    expect(hasTool('remove-background')).toBe(true);
    expect(await getToolConfig('remove-background')).toBe(hintergrundEntferner);
  });

  it('is registered in slug-map for de', () => {
    expect(slugMap['remove-background']?.de).toBe('hintergrund-entfernen');
  });

  it('is registered in tool-runtime-registry with process + prepare + reencode + isPrepared + clearLastResult', () => {
    const r = getRuntime('remove-background');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(typeof r?.prepare).toBe('function');
    expect(typeof r?.reencode).toBe('function');
    expect(typeof r?.isPrepared).toBe('function');
    expect(typeof r?.clearLastResult).toBe('function');
  });
});
