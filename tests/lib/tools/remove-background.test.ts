import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Transformers.js v4 image-segmentation returns an array with RawImage masks
// (data is Uint8Array/Uint8ClampedArray in 0..255 range).
const mockMaskData = new Uint8Array(64 * 64).fill(204);
const mockPipe = vi.fn(async () => [
  { label: 'foreground', score: 1, mask: { data: mockMaskData, width: 64, height: 64 } },
]);
const pipelineSpy = vi.fn(async (_task: string, _model: string, _opts: unknown) => mockPipe);

vi.mock('@huggingface/transformers', () => ({
  pipeline: pipelineSpy,
  RawImage: {
    fromBlob: vi.fn(async () => ({ data: new Uint8Array(64 * 64 * 4), width: 64, height: 64, channels: 4 })),
  },
  env: { remoteHost: 'https://huggingface.co' },
}));

function makeImageBytes(): Uint8Array {
  // Minimal PNG header so createImageBitmap doesn't reject in jsdom mocks.
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
}

let canvasInstances = 0;

describe('remove-background pure module', () => {
  beforeEach(() => {
    vi.resetModules();
    pipelineSpy.mockClear();
    mockPipe.mockClear();
    canvasInstances = 0;
    // Stub createImageBitmap (jsdom 25 lacks it)
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({
      width: 64, height: 64, close: vi.fn(),
    })));
    // Stub OffscreenCanvas
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(64 * 64 * 4).fill(255), width: 64, height: 64 })),
      putImageData: vi.fn(),
      fillRect: vi.fn(),
      set fillStyle(_v: string) { /* no-op */ },
      set globalCompositeOperation(_v: string) { /* no-op */ },
    };
    class FakeOffscreenCanvas {
      width: number; height: number;
      constructor(w: number, h: number) { this.width = w; this.height = h; canvasInstances++; }
      getContext() { return ctx; }
      async convertToBlob(opts?: { type?: string }) {
        const type = opts?.type ?? 'image/png';
        const bytes =
          type === 'image/png' ? new Uint8Array([137, 80, 78, 71]) :
          type === 'image/webp' ? new Uint8Array([0x52, 0x49, 0x46, 0x46]) :
          new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
        return new Blob([bytes as BlobPart], { type });
      }
    }
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
    // Default: WebGPU adapter is available. Tests that exercise the no-WebGPU
    // branch (`WebGpuRequiredError`) re-stub navigator with `gpu: undefined`
    // inside their own body. Defaulting to "available" matches the production
    // happy path on modern Chrome / Edge / Android — the FP16 variants are
    // designed for that environment.
    //
    // The adapter must satisfy the hardened probe: NOT a fallback adapter +
    // exposes the `shader-f16` feature. Earlier tests stubbed `{}` which
    // was enough for the looser `adapter !== null` check but silently fails
    // the new shader-f16 gate. Use a realistic adapter shape.
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      gpu: {
        requestAdapter: vi.fn(async () => ({
          isFallbackAdapter: false,
          features: new Set(['shader-f16']),
          // Apple Metal / Linux Vulkan default — well above the 17-buffer
          // floor BiRefNet_lite needs. Windows ANGLE adapters (16) are
          // covered by a dedicated "no-WebGPU" branch test elsewhere.
          limits: { maxStorageBuffersPerShaderStage: 32 },
        })),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('prepareBackgroundRemovalModel calls pipeline once on first invocation', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    expect(pipelineSpy).toHaveBeenCalledTimes(1);
  });

  it('prepareBackgroundRemovalModel is idempotent on second invocation', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    await m.prepareBackgroundRemovalModel(() => undefined);
    expect(pipelineSpy).toHaveBeenCalledTimes(1);
  });

  it('prepareBackgroundRemovalModel forwards progress events to onProgress', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    const onProgress = vi.fn();
    // Intercept the pipeline call to synchronously fire a progress event from the callback.
    pipelineSpy.mockImplementationOnce(async (_t, _m, opts) => {
      const cb = (opts as { progress_callback: (e: ProgressEvent) => void }).progress_callback;
      cb({ loaded: 42, total: 100 });
      return mockPipe;
    });
    await m.prepareBackgroundRemovalModel(onProgress);
    expect(onProgress).toHaveBeenCalledWith({ loaded: 42, total: 100 });
    const opts = pipelineSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(typeof opts.progress_callback).toBe('function');
  });

  it('removeBackground throws when not prepared', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(m.removeBackground(makeImageBytes(), { format: 'png' })).rejects.toThrow(/prepare/i);
  });

  it('removeBackground returns PNG bytes after prepare', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    const out = await m.removeBackground(makeImageBytes(), { format: 'png' });
    expect(out[0]).toBe(137);
    expect(out[1]).toBe(80);
  });

  it('removeBackground returns WebP bytes when format=webp', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    const out = await m.removeBackground(makeImageBytes(), { format: 'webp' });
    expect(out[0]).toBe(0x52); // 'R'
    expect(out[1]).toBe(0x49); // 'I'
  });

  it('removeBackground returns JPG bytes when format=jpg', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    const out = await m.removeBackground(makeImageBytes(), { format: 'jpg' });
    expect(out[0]).toBe(0xFF);
    expect(out[1]).toBe(0xD8);
  });

  it('reencodeLastResult re-encodes without re-running inference', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    await m.removeBackground(makeImageBytes(), { format: 'png' });
    expect(mockPipe).toHaveBeenCalledTimes(1);
    const out = await m.reencodeLastResult('webp');
    expect(mockPipe).toHaveBeenCalledTimes(1); // still 1
    expect(out[0]).toBe(0x52);
  });

  it('encoding JPG does not mutate the cached result (re-encode to webp stays transparent)', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    // First run creates exactly one canvas (the cached result).
    await m.removeBackground(makeImageBytes(), { format: 'png' });
    const afterInitial = canvasInstances;
    // Re-encoding to JPG must allocate a throwaway canvas so the cached one
    // stays alpha-correct — regression for the "webp after jpg keeps white
    // background" bug found in live testing.
    const jpgOut = await m.reencodeLastResult('jpg');
    expect(jpgOut[0]).toBe(0xFF);
    expect(canvasInstances).toBe(afterInitial + 1);
    // A subsequent WebP re-encode uses the still-pristine cached canvas and
    // must not allocate another.
    const webpOut = await m.reencodeLastResult('webp');
    expect(webpOut[0]).toBe(0x52);
    expect(canvasInstances).toBe(afterInitial + 1);
  });

  it('reencodeLastResult throws when no result is cached', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(m.reencodeLastResult('png')).rejects.toThrow(/no.*result/i);
  });

  it('clearLastResult removes the cached canvas', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    await m.removeBackground(makeImageBytes(), { format: 'png' });
    m.clearLastResult();
    await expect(m.reencodeLastResult('png')).rejects.toThrow(/no.*result/i);
  });

  it('isPrepared returns false before prepare and true after', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    expect(m.isPrepared()).toBe(false);
    await m.prepareBackgroundRemovalModel(() => undefined);
    expect(m.isPrepared()).toBe(true);
  });

  it('prepareBackgroundRemovalModel rejects with StallError when no progress for stallTimeoutMs', async () => {
    vi.useFakeTimers();
    // Replace pipelineSpy with one that hangs and never calls onProgress
    pipelineSpy.mockImplementationOnce(
      () => new Promise(() => undefined) as Promise<typeof mockPipe>,
    );
    const m = await import('../../../src/lib/tools/remove-background');
    const p = m.prepareBackgroundRemovalModel(() => undefined, { stallTimeoutMs: 1000 });
    // Attach a catch handler synchronously so the watchdog-driven rejection
    // (fired under fake timers inside advanceTimersByTimeAsync) never looks
    // transiently unhandled to Node between tick and awaiter microtask.
    p.catch(() => undefined);
    await vi.advanceTimersByTimeAsync(1100);
    await expect(p).rejects.toThrow(/stall/i);
    vi.useRealTimers();
  });

  it('prepareBackgroundRemovalModel routes the configured variant to pipeline()', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'fast' });
    expect(pipelineSpy.mock.calls[0][1]).toBe('Xenova/modnet');
    const opts = pipelineSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(opts.dtype).toBe('q8');
    // fast forces wasm even if WebGPU is available.
    expect(opts.device).toBe('wasm');
  });

  it('prepareBackgroundRemovalModel quality variant uses BiRefNet_lite-FP16', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'quality' });
    expect(pipelineSpy.mock.calls[0][1]).toBe('onnx-community/BiRefNet_lite-ONNX');
    const opts = pipelineSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(opts.dtype).toBe('fp16');
  });

  it('prepareBackgroundRemovalModel pro variant uses BEN2-FP16', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'pro' });
    expect(pipelineSpy.mock.calls[0][1]).toBe('onnx-community/BEN2-ONNX');
  });

  it('isPreparedFor distinguishes variants', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    expect(m.isPreparedFor('fast')).toBe(false);
    expect(m.isPreparedFor('quality')).toBe(false);
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'fast' });
    expect(m.isPreparedFor('fast')).toBe(true);
    expect(m.isPreparedFor('quality')).toBe(false);
    expect(m.getActiveVariant()).toBe('fast');
  });

  it('switching variant loads a new pipeline instance', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'fast' });
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'quality' });
    expect(pipelineSpy).toHaveBeenCalledTimes(2);
    expect(m.isPreparedFor('fast')).toBe(true);
    expect(m.isPreparedFor('quality')).toBe(true);
  });

  it('clearVariantCache drops the named variant only', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'fast' });
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'quality' });
    m.clearVariantCache('fast');
    expect(m.isPreparedFor('fast')).toBe(false);
    expect(m.isPreparedFor('quality')).toBe(true);
  });

  it('clearVariantCache() with no arg drops all variants', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'fast' });
    await m.prepareBackgroundRemovalModel(() => undefined, { variant: 'quality' });
    m.clearVariantCache();
    expect(m.isPreparedFor('fast')).toBe(false);
    expect(m.isPreparedFor('quality')).toBe(false);
    expect(m.getActiveVariant()).toBe(null);
  });

  it('quality variant throws WebGpuRequiredError when no WebGPU adapter', async () => {
    // Regression: BiRefNet_lite-FP16 (115 MB) crashes ONNX-WASM inference with
    // `std::bad_alloc`. The `requiresWebGPU` flag plus this fail-fast guard
    // prevent the user from waiting for a 115 MB download that ends in OOM.
    vi.stubGlobal('navigator', { ...globalThis.navigator, gpu: undefined });
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(
      m.prepareBackgroundRemovalModel(() => undefined, { variant: 'quality' }),
    ).rejects.toMatchObject({ name: 'WebGpuRequiredError' });
    // pipeline() must NOT have been invoked — the guard fires before download.
    expect(pipelineSpy).not.toHaveBeenCalled();
  });

  it('pro variant throws WebGpuRequiredError when no WebGPU adapter', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, gpu: undefined });
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(
      m.prepareBackgroundRemovalModel(() => undefined, { variant: 'pro' }),
    ).rejects.toMatchObject({ name: 'WebGpuRequiredError' });
  });

  it('fast variant succeeds without WebGPU (Q8 MODNet runs in WASM)', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, gpu: undefined });
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(
      m.prepareBackgroundRemovalModel(() => undefined, { variant: 'fast' }),
    ).resolves.toBeUndefined();
    expect(pipelineSpy).toHaveBeenCalledTimes(1);
  });

  it('progress events reset the stall watchdog', async () => {
    vi.useFakeTimers();
    let onProgressCb: ((e: ProgressEvent) => void) | undefined;
    pipelineSpy.mockImplementationOnce(async (_t, _m, opts) => {
      onProgressCb = (opts as { progress_callback: (e: ProgressEvent) => void }).progress_callback;
      // Resolve only after we get a tick
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (onProgressCb) onProgressCb({ loaded: 50, total: 100 });
        }, 500);
        setTimeout(() => { clearInterval(interval); resolve(); }, 2500);
      });
      return mockPipe;
    });
    const m = await import('../../../src/lib/tools/remove-background');
    const onProgress = vi.fn();
    const p = m.prepareBackgroundRemovalModel(onProgress, { stallTimeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(3000);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

type ProgressEvent = { loaded: number; total: number };
