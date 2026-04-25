import { describe, it, expect } from 'vitest';
import { webcamHintergrundUnschaerfe } from '../../../src/lib/tools/webcam-blur';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { getToolConfig, hasTool } from '../../../src/lib/tool-registry';
import { slugMap } from '../../../src/lib/slug-map';
import { getRuntime } from '../../../src/lib/tools/tool-runtime-registry';

describe('webcam-hintergrund-unschaerfe config + registry', () => {
  it('config validates against interactiveSchema', () => {
    const r = parseToolConfig(webcamHintergrundUnschaerfe);
    expect(r.ok).toBe(true);
  });

  it('id is webcam-blur', () => {
    expect(webcamHintergrundUnschaerfe.id).toBe('webcam-blur');
  });

  it('type is interactive', () => {
    expect(webcamHintergrundUnschaerfe.type).toBe('interactive');
  });

  it('categoryId is video', () => {
    expect(webcamHintergrundUnschaerfe.categoryId).toBe('video');
  });

  it('canvasKind is canvas', () => {
    expect(webcamHintergrundUnschaerfe.canvasKind).toBe('canvas');
  });

  it('exportFormats is non-empty', () => {
    expect(webcamHintergrundUnschaerfe.exportFormats.length).toBeGreaterThan(0);
  });

  it('is registered in tool-registry', async () => {
    expect(hasTool('webcam-blur')).toBe(true);
    expect(await getToolConfig('webcam-blur')).toBe(webcamHintergrundUnschaerfe);
  });

  it('is registered in slug-map for de as webcam-hintergrund-unschaerfe', () => {
    expect(slugMap['webcam-blur']?.de).toBe('webcam-hintergrund-unschaerfe');
  });

  it('is registered in tool-runtime-registry with process + preflightCheck', () => {
    const r = getRuntime('webcam-blur');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(typeof r?.preflightCheck).toBe('function');
  });

  it('runtime process throws — live stream handled by WebcamBlurTool.svelte', async () => {
    const r = getRuntime('webcam-blur');
    await expect(r?.process(new Uint8Array([0]))).rejects.toThrow('webcam-blur');
  });

  it('preflightCheck returns null when mediaDevices.getUserMedia is present', () => {
    const r = getRuntime('webcam-blur');
    const original = (globalThis as Record<string, unknown>).navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: { mediaDevices: { getUserMedia: () => Promise.resolve() } },
      configurable: true,
      writable: true,
    });
    try {
      expect(r?.preflightCheck?.()).toBeNull();
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });

  it('preflightCheck returns error string when mediaDevices missing', () => {
    const r = getRuntime('webcam-blur');
    const original = (globalThis as Record<string, unknown>).navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });
    try {
      const msg = r?.preflightCheck?.();
      expect(typeof msg).toBe('string');
      expect(msg).toContain('Kamerazugriff');
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });
});
