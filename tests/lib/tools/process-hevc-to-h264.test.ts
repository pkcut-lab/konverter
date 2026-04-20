import { describe, it, expect, beforeEach, vi } from 'vitest';

const conversionMock = {
  execute: vi.fn().mockResolvedValue(undefined),
  onProgress: undefined as undefined | ((p: number) => void),
};

const initMock = vi.fn().mockImplementation(async (opts: unknown) => {
  conversionMock.execute.mockClear();
  (conversionMock as any).__lastOpts = opts;
  return conversionMock;
});

const inputMock = {
  getPrimaryVideoTrack: vi.fn().mockResolvedValue({ width: 1920, height: 1080, bitrate: 8_000_000 }),
  getPrimaryAudioTrack: vi.fn().mockResolvedValue({ codec: 'aac', bitrate: 128_000 }),
};

vi.mock('mediabunny', () => ({
  BufferSource: vi.fn(),
  BufferTarget: vi.fn().mockImplementation(() => ({ buffer: new Uint8Array([1, 2, 3]) })),
  Input: vi.fn().mockImplementation(() => inputMock),
  Output: vi.fn(),
  Mp4OutputFormat: vi.fn(),
  ALL_FORMATS: {},
  Conversion: { init: initMock },
}));

import { processHevcToH264 } from '../../../src/lib/tools/process-hevc-to-h264';

describe('processHevcToH264', () => {
  beforeEach(() => {
    initMock.mockClear();
    conversionMock.execute.mockReset().mockResolvedValue(undefined);
    conversionMock.onProgress = undefined;
    inputMock.getPrimaryVideoTrack.mockResolvedValue({ width: 1920, height: 1080, bitrate: 8_000_000 });
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'aac', bitrate: 128_000 });
  });

  it('returns the buffer from BufferTarget', async () => {
    const out = await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    expect(out).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('preset=balanced passes 0.6x source bitrate', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(Math.round(8_000_000 * 0.6));
  });

  it('preset=small passes 0.35x source bitrate', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'small' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(Math.round(8_000_000 * 0.35));
  });

  it('preset=original passes source bitrate unchanged', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'original' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(8_000_000);
  });

  it('estimates bitrate when source has no bitrate field', async () => {
    inputMock.getPrimaryVideoTrack.mockResolvedValue({ width: 1920, height: 1080 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'original' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(8_000_000);
  });

  it('aac audio ≤192k → copy: true', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'aac', bitrate: 128_000 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toEqual({ copy: true });
  });

  it('aac audio >192k → re-encode', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'aac', bitrate: 256_000 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toEqual({ codec: 'aac', bitrate: 128_000 });
  });

  it('non-aac audio → re-encode to aac', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'opus', bitrate: 128_000 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toEqual({ codec: 'aac', bitrate: 128_000 });
  });

  it('no audio track → audio option undefined', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue(null);
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toBeUndefined();
  });

  it('downscaleTo1080p=true passes width=1920, height=1080, fit=contain', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced', downscaleTo1080p: true });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.width).toBe(1920);
    expect(opts.video.height).toBe(1080);
    expect(opts.video.fit).toBe('contain');
  });

  it('downscaleTo1080p=false (default) does NOT set width/height — 4K passthrough', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.width).toBeUndefined();
    expect(opts.video.height).toBeUndefined();
  });

  it('uses codec="h264" (not "avc")', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.codec).toBe('h264');
  });

  it('passes tags as a function that preserves input tags', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(typeof opts.tags).toBe('function');
    const sample = { creationDate: '2025-01-01', rotation: 90 };
    expect(opts.tags(sample)).toEqual(sample);
  });

  it('onProgress callback receives raw 0–1 number from Mediabunny', async () => {
    const onProgress = vi.fn();
    // Hold execute so we can fire progress between init and execute resolution
    let resolveExecute!: () => void;
    conversionMock.execute.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        resolveExecute = resolve;
      }),
    );
    const promise = processHevcToH264(new Uint8Array([0]), { preset: 'balanced' }, onProgress);
    // Wait until impl has assigned the callback post-init
    await vi.waitFor(() => {
      expect(conversionMock.onProgress).toBeDefined();
    });
    conversionMock.onProgress!(0.42);
    resolveExecute();
    await promise;
    expect(onProgress).toHaveBeenCalledWith(0.42);
  });

  it('throws when Conversion.init rejects', async () => {
    initMock.mockRejectedValueOnce(new Error('bad'));
    await expect(processHevcToH264(new Uint8Array([0]), { preset: 'balanced' })).rejects.toThrow();
  });

  it('throws when execute rejects', async () => {
    conversionMock.execute.mockRejectedValueOnce(new Error('encode-fail'));
    await expect(processHevcToH264(new Uint8Array([0]), { preset: 'balanced' })).rejects.toThrow();
  });
});
