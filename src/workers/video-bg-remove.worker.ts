/**
 * video-bg-remove worker.
 *
 * §10 MLFileTool-Template (CONVENTIONS.md): runs the entire ML pipeline
 * (model load + per-frame inference + Mediabunny mux) off the main thread.
 *
 * Pipeline:
 *   1. Lazy-import @huggingface/transformers + mediabunny (worker-scope).
 *   2. Detect WebGPU; fall back to wasm.
 *   3. pipeline('image-segmentation', <model>) with progress_callback.
 *   4. Decode input via mediabunny CanvasSink (alpha:true).
 *   5. For each frame: run inference → mask → composite into output canvas
 *      → encode via CanvasSource (codec:'vp9', alpha:'keep' for transparent).
 *   6. finalize() → post Uint8Array back.
 *
 * Worker-Abort-Pattern: main posts `{ type: 'abort' }`; worker checks the
 * `aborted` flag inside the frame loop and bails.
 *
 * V1 scope (CEO-Decisions-Log 2026-04-26 — autonom):
 *   - Output modes: `transparent` (WebM+VP9+Alpha) + `solid` (Mp4+H.264).
 *   - Image-/Video-BG modes deferred to Phase 2 (avoids extra image-decode +
 *     video-loop pipeline; surgical V1).
 *   - Audio passthrough deferred to Phase 2 (AAC→Opus re-encode complexity;
 *     content FAQ updated to honest "video-only V1" expectation).
 *   - PNG-Sequence-Export deferred to Phase 2 (ZIP encoder + memory pressure).
 */

/// <reference lib="webworker" />

const MODEL_BY_KEY = {
  quality: 'onnx-community/BiRefNet_lite-ONNX',
  speed: 'Xenova/modnet',
} as const;

type ModelKey = keyof typeof MODEL_BY_KEY;
type OutputMode = 'transparent' | 'solid';

export type WorkerInbound =
  | {
      type: 'process';
      payload: {
        input: Uint8Array;
        modelKey: ModelKey;
        outputMode: OutputMode;
        bgColor?: string;
      };
    }
  | { type: 'prepare'; payload: { modelKey: ModelKey } }
  | { type: 'abort' };

export type WorkerOutbound =
  | { type: 'progress'; phase: 'model'; loaded: number; total: number }
  | { type: 'progress'; phase: 'frame'; frameIdx: number; totalFrames: number }
  | { type: 'done'; output: Uint8Array; mime: string }
  | { type: 'prepared' }
  | { type: 'aborted' }
  | { type: 'error'; message: string };

let aborted = false;

type MaskImage = { data: Uint8Array | Uint8ClampedArray; width: number; height: number };
type SegmentationResult = Array<{ mask: MaskImage }>;
type Pipe = (input: unknown, opts?: unknown) => Promise<SegmentationResult>;

let pipelinePromise: Promise<Pipe> | null = null;
let pipelineModelKey: ModelKey | null = null;

async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  try {
    const gpu = (self as unknown as { navigator?: { gpu?: { requestAdapter: () => Promise<unknown> } } })
      .navigator?.gpu;
    if (!gpu) return 'wasm';
    const adapter = await gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}

async function loadPipeline(modelKey: ModelKey, onProgress: (loaded: number, total: number) => void): Promise<Pipe> {
  if (pipelinePromise && pipelineModelKey === modelKey) return pipelinePromise;
  pipelineModelKey = modelKey;
  const { pipeline } = await import('@huggingface/transformers');
  const device = await detectDevice();
  pipelinePromise = (async () => {
    const pipe = await pipeline('image-segmentation', MODEL_BY_KEY[modelKey], {
      device,
      progress_callback: ((info: { loaded?: number; total?: number }) => {
        if (typeof info.loaded === 'number' && typeof info.total === 'number') {
          onProgress(info.loaded, info.total);
        }
      }) as unknown as (info: unknown) => void,
    });
    return pipe as unknown as Pipe;
  })();
  return pipelinePromise;
}

function applyAlphaMask(
  ctx: OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  mask: MaskImage,
  outputMode: OutputMode,
  bgColor?: string,
): void {
  const img = ctx.getImageData(0, 0, width, height);
  const m = mask.data;
  const sameSize = mask.width === width && mask.height === height;
  if (outputMode === 'transparent') {
    if (sameSize) {
      for (let i = 0; i < m.length; i++) {
        img.data[i * 4 + 3] = m[i] ?? 0;
      }
    } else {
      // Nearest-neighbor scale mask onto image — pipelines often emit at
      // model-input resolution rather than display resolution.
      const sx = mask.width / width;
      const sy = mask.height / height;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const mx = Math.min(mask.width - 1, Math.floor(x * sx));
          const my = Math.min(mask.height - 1, Math.floor(y * sy));
          img.data[(y * width + x) * 4 + 3] = m[my * mask.width + mx] ?? 0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    return;
  }
  // solid mode: composite over bgColor using alpha mask as foreground weight.
  const [br, bg, bb] = parseHexColor(bgColor ?? '#ffffff');
  if (sameSize) {
    for (let i = 0; i < m.length; i++) {
      const a = (m[i] ?? 0) / 255;
      const o = i * 4;
      img.data[o] = Math.round((img.data[o] ?? 0) * a + br * (1 - a));
      img.data[o + 1] = Math.round((img.data[o + 1] ?? 0) * a + bg * (1 - a));
      img.data[o + 2] = Math.round((img.data[o + 2] ?? 0) * a + bb * (1 - a));
      img.data[o + 3] = 255;
    }
  } else {
    const sx = mask.width / width;
    const sy = mask.height / height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const mx = Math.min(mask.width - 1, Math.floor(x * sx));
        const my = Math.min(mask.height - 1, Math.floor(y * sy));
        const a = (m[my * mask.width + mx] ?? 0) / 255;
        const o = (y * width + x) * 4;
        img.data[o] = Math.round((img.data[o] ?? 0) * a + br * (1 - a));
        img.data[o + 1] = Math.round((img.data[o + 1] ?? 0) * a + bg * (1 - a));
        img.data[o + 2] = Math.round((img.data[o + 2] ?? 0) * a + bb * (1 - a));
        img.data[o + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function parseHexColor(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const norm = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(norm, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

async function runProcess(payload: {
  input: Uint8Array;
  modelKey: ModelKey;
  outputMode: OutputMode;
  bgColor?: string;
}): Promise<void> {
  aborted = false;
  const post = (msg: WorkerOutbound) => self.postMessage(msg);

  const pipe = await loadPipeline(payload.modelKey, (loaded, total) =>
    post({ type: 'progress', phase: 'model', loaded, total }),
  );

  // mediabunny exports lack complete TS surface; we cast the named exports
  // through `unknown` and treat them as runtime constructors. Same pattern
  // as src/lib/tools/process-hevc-to-h264.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mb = await import('mediabunny') as unknown as Record<string, any>;
  const inputFile: { getPrimaryVideoTrack: () => Promise<unknown> } = new mb.Input({
    source: new mb.BufferSource(payload.input),
    formats: mb.ALL_FORMATS,
  });
  const videoTrack = (await inputFile.getPrimaryVideoTrack()) as {
    displayWidth: number;
    displayHeight: number;
    computeDuration: () => Promise<number>;
    computePacketStats: (n?: number) => Promise<{ packetCount: number; averagePacketRate?: number }>;
    getFirstTimestamp?: () => Promise<number>;
  };
  if (!videoTrack) throw new Error('Kein Video-Track im Input gefunden.');
  const width = videoTrack.displayWidth;
  const height = videoTrack.displayHeight;
  const duration = await videoTrack.computeDuration();
  const stats = await videoTrack.computePacketStats(50);
  const totalFrames = Math.max(1, stats.packetCount);
  const fps = stats.averagePacketRate ?? totalFrames / Math.max(0.001, duration);

  const sink = new mb.CanvasSink(videoTrack, {
    alpha: payload.outputMode === 'transparent',
    poolSize: 2,
  }) as { canvases: () => AsyncGenerator<{ canvas: OffscreenCanvas; timestamp: number; duration: number }> };

  const outputCanvas = new OffscreenCanvas(width, height);
  const outCtx = outputCanvas.getContext('2d', { willReadFrequently: false });
  if (!outCtx) throw new Error('OffscreenCanvas 2d context unavailable.');

  const isTransparent = payload.outputMode === 'transparent';
  const format = isTransparent ? new mb.WebMOutputFormat() : new mb.Mp4OutputFormat();
  const target = new mb.BufferTarget() as { buffer: Uint8Array };
  const output = new mb.Output({ target, format }) as {
    addVideoTrack: (source: unknown, meta?: unknown) => void;
    start: () => Promise<void>;
    finalize: () => Promise<void>;
    cancel: () => Promise<void>;
  };

  const codec = isTransparent ? 'vp9' : 'avc';
  const bitrate = estimateBitrate(width, height);
  const canvasSource = new mb.CanvasSource(outputCanvas, {
    codec,
    bitrate,
    alpha: isTransparent ? 'keep' : 'discard',
  }) as { add: (timestamp: number, duration: number) => Promise<void> };
  output.addVideoTrack(canvasSource, { frameRate: Math.round(fps) || 30 });
  await output.start();

  let frameIdx = 0;
  let lastReportTs = 0;
  const transformers = await import('@huggingface/transformers');
  // RawImage's runtime constructor accepts (data, width, height, channels) — its
  // exported TS type is more restrictive than the runtime; cast through unknown.
  const RawImageCtor = transformers.RawImage as unknown as new (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    ch: number,
  ) => unknown;
  for await (const wrapped of sink.canvases()) {
    if (aborted) {
      await output.cancel();
      self.postMessage({ type: 'aborted' } as WorkerOutbound);
      return;
    }
    const srcCanvas = wrapped.canvas;
    // Build RawImage from canvas pixels for the segmentation pipeline.
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!;
    const srcImg = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const rawImage = new RawImageCtor(srcImg.data, srcCanvas.width, srcCanvas.height, 4);
    const segmentation = await pipe(rawImage);
    const mask = segmentation[0]?.mask;
    if (!mask) throw new Error('Pipeline lieferte keine Segmentation-Mask.');

    // Draw source into output canvas, then apply mask.
    outCtx.clearRect(0, 0, width, height);
    outCtx.drawImage(srcCanvas as unknown as CanvasImageSource, 0, 0, width, height);
    applyAlphaMask(outCtx, width, height, mask, payload.outputMode, payload.bgColor);

    await canvasSource.add(wrapped.timestamp, wrapped.duration);
    frameIdx++;
    const now = Date.now();
    if (now - lastReportTs > 100 || frameIdx === totalFrames) {
      lastReportTs = now;
      post({ type: 'progress', phase: 'frame', frameIdx, totalFrames });
    }
  }

  await output.finalize();
  const buffer = target.buffer;
  const mime = isTransparent ? 'video/webm' : 'video/mp4';
  post({ type: 'done', output: buffer, mime });
}

function estimateBitrate(w: number, h: number): number {
  const px = w * h;
  if (px >= 1920 * 1080) return 8_000_000;
  if (px >= 1280 * 720) return 4_000_000;
  return 2_000_000;
}

self.onmessage = async (event: MessageEvent<WorkerInbound>) => {
  const msg = event.data;
  try {
    if (msg.type === 'process') {
      await runProcess(msg.payload);
    } else if (msg.type === 'prepare') {
      const post = (m: WorkerOutbound) => self.postMessage(m);
      await loadPipeline(msg.payload.modelKey, (loaded, total) =>
        post({ type: 'progress', phase: 'model', loaded, total }),
      );
      post({ type: 'prepared' });
    } else if (msg.type === 'abort') {
      aborted = true;
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    } as WorkerOutbound);
  }
};
