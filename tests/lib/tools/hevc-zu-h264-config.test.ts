import { describe, it, expect } from 'vitest';
import { hevcZuH264 } from '../../../src/lib/tools/hevc-zu-h264';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { toolRegistry } from '../../../src/lib/tool-registry';
import { slugMap } from '../../../src/lib/slug-map';
import { getRuntime } from '../../../src/lib/tools/tool-runtime-registry';

describe('hevc-zu-h264 config + registry', () => {
  it('config validates against fileToolSchema', () => {
    const r = parseToolConfig(hevcZuH264);
    expect(r.ok).toBe(true);
  });

  it('id is hevc-to-h264', () => {
    expect(hevcZuH264.id).toBe('hevc-to-h264');
  });

  it('categoryId is video', () => {
    expect(hevcZuH264.categoryId).toBe('video');
  });

  it('accepts video/quicktime, video/mp4, video/hevc, video/h265', () => {
    expect(hevcZuH264.accept).toEqual(
      expect.arrayContaining(['video/quicktime', 'video/mp4', 'video/hevc', 'video/h265']),
    );
  });

  it('maxSizeMb is 500', () => {
    expect(hevcZuH264.maxSizeMb).toBe(500);
  });

  it('defaultFormat is mp4', () => {
    expect(hevcZuH264.defaultFormat).toBe('mp4');
  });

  it('filenameSuffix is _h264', () => {
    expect(hevcZuH264.filenameSuffix).toBe('_h264');
  });

  it('showQuality is false (preset buttons instead of slider)', () => {
    expect(hevcZuH264.showQuality).toBe(false);
  });

  it('config.process is a placeholder that throws — runtime handles real logic', () => {
    expect(() => hevcZuH264.process(new Uint8Array([0]))).toThrow();
  });

  it('is registered in tool-registry', () => {
    expect(toolRegistry['hevc-to-h264']).toBe(hevcZuH264);
  });

  it('is registered in slug-map for de as hevc-zu-h264', () => {
    expect(slugMap['hevc-to-h264']?.de).toBe('hevc-zu-h264');
  });

  it('is registered in tool-runtime-registry with process + preflightCheck (no prepare)', () => {
    const r = getRuntime('hevc-to-h264');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(typeof r?.preflightCheck).toBe('function');
    expect(r?.prepare).toBeUndefined();
  });

  it('preflightCheck returns error string when WebCodecs missing', () => {
    const r = getRuntime('hevc-to-h264');
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

  it('preflightCheck returns null when both VideoEncoder and VideoDecoder are present', () => {
    const r = getRuntime('hevc-to-h264');
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
