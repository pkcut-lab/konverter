import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('heic-decode', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns input unchanged when MIME is not HEIC/HEIF', async () => {
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([1, 2, 3]);
    const result = await decodeHeicIfNeeded(buf, 'image/png');
    expect(result.bytes).toBe(buf);
    expect(result.mime).toBe('image/png');
  });

  it('returns input unchanged in Safari (native HEIC decode)', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Safari/605.1.15 Version/17.0' });
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([1, 2, 3]);
    const result = await decodeHeicIfNeeded(buf, 'image/heic');
    expect(result.bytes).toBe(buf);
    expect(result.mime).toBe('image/heic');
  });

  it('lazy-loads heic2any and converts HEIC to PNG in non-Safari', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 Chrome/120' });
    const heic2anySpy = vi.fn(async () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }));
    vi.doMock('heic2any', () => ({ default: heic2anySpy }));
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
    const result = await decodeHeicIfNeeded(buf, 'image/heic');
    expect(heic2anySpy).toHaveBeenCalledTimes(1);
    expect(result.mime).toBe('image/png');
    expect(result.bytes[0]).toBe(137);
    expect(result.bytes[1]).toBe(80);
  });

  it('handles image/heif MIME type the same as image/heic', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 Chrome/120' });
    const heic2anySpy = vi.fn(async () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }));
    vi.doMock('heic2any', () => ({ default: heic2anySpy }));
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([1, 2, 3]);
    const result = await decodeHeicIfNeeded(buf, 'image/heif');
    expect(heic2anySpy).toHaveBeenCalledTimes(1);
    expect(result.mime).toBe('image/png');
  });

  it('rejects with descriptive error when heic2any fails', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 Chrome/120' });
    vi.doMock('heic2any', () => ({ default: vi.fn().mockRejectedValue(new Error('corrupt')) }));
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    await expect(decodeHeicIfNeeded(new Uint8Array([1]), 'image/heic')).rejects.toThrow(/HEIC/i);
  });
});
