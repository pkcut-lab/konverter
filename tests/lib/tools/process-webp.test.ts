import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processWebp } from '../../../src/lib/tools/process-webp';

function mockCanvasPipeline(outputBytes: Uint8Array) {
  const fakeBitmap = { width: 1, height: 1, close: vi.fn() };
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(fakeBitmap));
  // jsdom 25 does not implement Blob.prototype.arrayBuffer, so we hand-roll
  // the minimum Blob-like the production code touches.
  const fakeBlob = {
    type: 'image/webp',
    size: outputBytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(outputBytes.buffer),
  };
  const convertToBlob = vi.fn().mockResolvedValue(fakeBlob);
  vi.stubGlobal(
    'OffscreenCanvas',
    vi.fn().mockImplementation(() => ({
      getContext: () => ({ drawImage: vi.fn() }),
      convertToBlob,
    })),
  );
  return { convertToBlob, fakeBitmap, fakeBlob };
}

describe('processWebp', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('returns Uint8Array produced by convertToBlob', async () => {
    const out = new Uint8Array([1, 2, 3]);
    mockCanvasPipeline(out);
    const result = await processWebp(new Uint8Array([0]), { quality: 85 });
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([1, 2, 3]);
  });

  it('passes quality/100 to convertToBlob', async () => {
    const { convertToBlob } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: 50 });
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/webp', quality: 0.5 });
  });

  it('clamps quality > 100 to 1.0', async () => {
    const { convertToBlob } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: 150 });
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/webp', quality: 1 });
  });

  it('clamps quality < 0 to 0', async () => {
    const { convertToBlob } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: -10 });
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/webp', quality: 0 });
  });

  it('closes ImageBitmap after drawing', async () => {
    const { fakeBitmap } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: 85 });
    expect(fakeBitmap.close).toHaveBeenCalled();
  });

  it('throws decode-fail when createImageBitmap rejects', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bad')));
    await expect(processWebp(new Uint8Array(), { quality: 85 })).rejects.toThrow();
  });

  it('throws canvas-context-unavailable when getContext returns null', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 1, height: 1, close: vi.fn() }),
    );
    vi.stubGlobal(
      'OffscreenCanvas',
      vi.fn().mockImplementation(() => ({ getContext: () => null })),
    );
    await expect(processWebp(new Uint8Array(), { quality: 85 })).rejects.toThrow(
      /canvas-context-unavailable/,
    );
  });
});
