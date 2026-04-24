import { describe, it, expect } from 'vitest';
import { videoBgRemove } from '../../../src/lib/tools/video-hintergrund-entfernen';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { getToolConfig, hasTool } from '../../../src/lib/tool-registry';
import { slugMap } from '../../../src/lib/slug-map';
import { getRuntime } from '../../../src/lib/tools/tool-runtime-registry';

describe('video-hintergrund-entfernen config + registry', () => {
  it('config validates against fileToolSchema', () => {
    const r = parseToolConfig(videoBgRemove);
    expect(r.ok).toBe(true);
  });

  it('id is video-bg-remove', () => {
    expect(videoBgRemove.id).toBe('video-bg-remove');
  });

  it('categoryId is video', () => {
    expect(videoBgRemove.categoryId).toBe('video');
  });

  it('accepts video/mp4, video/quicktime, video/webm', () => {
    expect(videoBgRemove.accept).toEqual(
      expect.arrayContaining(['video/mp4', 'video/quicktime', 'video/webm']),
    );
  });

  it('maxSizeMb is 500', () => {
    expect(videoBgRemove.maxSizeMb).toBe(500);
  });

  it('filenameSuffix is _no_bg', () => {
    expect(videoBgRemove.filenameSuffix).toBe('_no_bg');
  });

  it('defaultFormat is webm (VP9+Alpha)', () => {
    expect(videoBgRemove.defaultFormat).toBe('webm');
  });

  it('showQuality is false (model-preset toggle instead)', () => {
    expect(videoBgRemove.showQuality).toBe(false);
  });

  it('has quality/speed model presets with correct ids', () => {
    expect(videoBgRemove.presets?.id).toBe('model');
    const ids = videoBgRemove.presets?.options.map((o) => o.id);
    expect(ids).toContain('quality');
    expect(ids).toContain('speed');
    expect(videoBgRemove.presets?.default).toBe('quality');
  });

  it('config.process is a placeholder that throws — runtime handles real logic', () => {
    expect(() => videoBgRemove.process(new Uint8Array([0]))).toThrow();
  });

  it('is registered in tool-registry', async () => {
    expect(hasTool('video-bg-remove')).toBe(true);
    expect(await getToolConfig('video-bg-remove')).toBe(videoBgRemove);
  });

  it('is registered in slug-map for de as video-hintergrund-entfernen', () => {
    expect(slugMap['video-bg-remove']?.de).toBe('video-hintergrund-entfernen');
  });

  it('is registered in tool-runtime-registry with process + prepare + isPrepared + clearLastResult + preflightCheck', () => {
    const r = getRuntime('video-bg-remove');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(typeof r?.prepare).toBe('function');
    expect(typeof r?.isPrepared).toBe('function');
    expect(typeof r?.clearLastResult).toBe('function');
    expect(typeof r?.preflightCheck).toBe('function');
  });

  it('isPrepared returns false before any pipeline load', () => {
    const r = getRuntime('video-bg-remove');
    expect(r?.isPrepared?.()).toBe(false);
  });

  it('preflightCheck returns error string when WebCodecs missing', () => {
    const r = getRuntime('video-bg-remove');
    const originalEnc = (globalThis as Record<string, unknown>).VideoEncoder;
    const originalDec = (globalThis as Record<string, unknown>).VideoDecoder;
    delete (globalThis as Record<string, unknown>).VideoEncoder;
    delete (globalThis as Record<string, unknown>).VideoDecoder;
    try {
      const msg = r?.preflightCheck?.();
      expect(typeof msg).toBe('string');
      expect(msg).toContain('WebCodecs');
    } finally {
      if (originalEnc !== undefined) (globalThis as Record<string, unknown>).VideoEncoder = originalEnc;
      if (originalDec !== undefined) (globalThis as Record<string, unknown>).VideoDecoder = originalDec;
    }
  });

  it('preflightCheck returns null when WebCodecs are present', () => {
    const r = getRuntime('video-bg-remove');
    const originalEnc = (globalThis as Record<string, unknown>).VideoEncoder;
    const originalDec = (globalThis as Record<string, unknown>).VideoDecoder;
    (globalThis as Record<string, unknown>).VideoEncoder = class {};
    (globalThis as Record<string, unknown>).VideoDecoder = class {};
    try {
      expect(r?.preflightCheck?.()).toBeNull();
    } finally {
      if (originalEnc === undefined) delete (globalThis as Record<string, unknown>).VideoEncoder;
      else (globalThis as Record<string, unknown>).VideoEncoder = originalEnc;
      if (originalDec === undefined) delete (globalThis as Record<string, unknown>).VideoDecoder;
      else (globalThis as Record<string, unknown>).VideoDecoder = originalDec;
    }
  });
});
