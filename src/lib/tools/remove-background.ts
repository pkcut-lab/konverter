/**
 * BG-Remover pure module.
 *
 * Singleton-cached pipeline (Transformers.js v4 + onnx-community/BEN2-ONNX).
 * Module is dynamic-imported by the FileTool runtime so the Hauptbundle
 * stays under 100 KB gzip — this file itself is fine to import statically.
 * We use a static import for `@huggingface/transformers` here: by the time
 * this module is loaded, the FileTool has already decided to use it, so
 * deferring transformers.js further doesn't save bytes (the chunk split
 * happens at the consumer).
 *
 * Cache lifetime: pipeline + lastResultCanvas live at module scope. The
 * FileTool component calls `clearLastResult()` on its reset path to avoid
 * leaking large bitmaps when the user starts over.
 */

import { pipeline, RawImage } from '@huggingface/transformers';

export type RemoveBackgroundFormat = 'png' | 'webp' | 'jpg';

export interface RemoveBackgroundOpts {
  format: RemoveBackgroundFormat;
}

export interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface PrepareOpts {
  /**
   * Watchdog timeout in ms. If no progress event arrives within this window
   * the pipeline-promise rejects with `StallError`. Defaults to 120_000.
   * Spec §10.
   */
  stallTimeoutMs?: number;
}

export class StallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StallError';
  }
}

/**
 * image-segmentation pipeline output shape per Transformers.js v4 docs:
 * `Array<{ label: string; score: number | null; mask: RawImage }>`.
 * For BEN2 (binary foreground seg) the array has exactly one entry.
 * RawImage.data is `Uint8Array | Uint8ClampedArray` in the 0..255 range.
 */
type MaskImage = { data: Uint8Array | Uint8ClampedArray; width: number; height: number };
type SegmentationResult = Array<{ mask: MaskImage }>;
type Pipe = (input: unknown, opts?: unknown) => Promise<SegmentationResult>;

let pipelinePromise: Promise<Pipe> | null = null;
let pipelineReady = false;
let lastResultCanvas: OffscreenCanvas | null = null;

async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return 'wasm';
    const adapter = await gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}

export function isPrepared(): boolean {
  return pipelineReady;
}

export async function prepareBackgroundRemovalModel(
  onProgress: (e: ProgressEvent) => void,
  opts: PrepareOpts = {},
): Promise<void> {
  if (pipelinePromise) {
    await pipelinePromise;
    return;
  }
  const stallTimeoutMs = opts.stallTimeoutMs ?? 120_000;

  let watchdog: ReturnType<typeof setTimeout> | null = null;
  let stallReject: ((err: Error) => void) | null = null;
  let settled = false;

  const fireStall = () => {
    if (settled) return;
    settled = true;
    stallReject?.(new StallError(
      `Model download stalled — no progress for ${stallTimeoutMs}ms.`,
    ));
  };

  const wrappedProgress = (e: ProgressEvent) => {
    if (watchdog) clearTimeout(watchdog);
    watchdog = setTimeout(fireStall, stallTimeoutMs);
    onProgress(e);
  };

  // Start the watchdog before the first progress event arrives — matches
  // spec §10 (no-progress-within-window fires the stall).
  watchdog = setTimeout(fireStall, stallTimeoutMs);

  pipelinePromise = new Promise<Pipe>((resolve, reject) => {
    stallReject = (err) => {
      if (watchdog) clearTimeout(watchdog);
      reject(err);
    };
    (async () => {
      const device = await detectDevice();
      const pipe = await pipeline(
        'image-segmentation',
        'onnx-community/BEN2-ONNX',
        // Cast: transformers.js's ProgressInfo is a superset (includes phase
        // tags like 'initiate' / 'download' / 'progress'). We surface only
        // the loaded/total fields to the consumer of our module — ProgressInfo
        // forwards compatibly at runtime, so a cast is safe here.
        {
          progress_callback: wrappedProgress as unknown as (info: unknown) => void,
          device,
        },
      );
      if (!settled) {
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        resolve(pipe as unknown as Pipe);
      }
    })().catch((err) => {
      if (!settled) {
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        reject(err);
      }
    });
  });
  // Silent handler attached synchronously — without it, a watchdog that fires
  // before any awaiter microtask runs can be flagged as a transient
  // unhandled-rejection by Node (observed under vitest fake timers).
  pipelinePromise.catch(() => { /* silent — re-thrown in the awaiter below */ });

  try {
    await pipelinePromise;
    pipelineReady = true;
  } catch (err) {
    // Reset so a subsequent retry actually retries.
    pipelinePromise = null;
    pipelineReady = false;
    throw err;
  }
}

function formatToMime(format: RemoveBackgroundFormat): string {
  switch (format) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'jpg': return 'image/jpeg';
  }
}

/** Reads a Blob to Uint8Array, with FileReader fallback for jsdom/older envs. */
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === 'function') {
    return new Uint8Array(await blob.arrayBuffer());
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function encodeCanvas(canvas: OffscreenCanvas, format: RemoveBackgroundFormat): Promise<Uint8Array> {
  // JPG can't carry an alpha channel. Composite the transparent cut-out over
  // white on a THROWAWAY canvas — writing into `canvas` directly would bake
  // the white background into the cached result, so a subsequent re-encode
  // to png/webp would still carry the white fill (observed in the wild).
  let target = canvas;
  if (format === 'jpg') {
    const copy = new OffscreenCanvas(canvas.width, canvas.height);
    const cctx = copy.getContext('2d') as unknown as CanvasRenderingContext2D | null;
    if (cctx) {
      cctx.fillStyle = 'white';
      cctx.fillRect(0, 0, copy.width, copy.height);
      cctx.drawImage(canvas as unknown as CanvasImageSource, 0, 0);
    }
    target = copy;
  }
  const blob = await target.convertToBlob({ type: formatToMime(format), quality: 0.92 });
  return blobToUint8Array(blob);
}

export async function removeBackground(
  input: Uint8Array,
  opts: RemoveBackgroundOpts,
): Promise<Uint8Array> {
  if (!pipelinePromise) {
    throw new Error('Pipeline not prepared — prepareBackgroundRemovalModel() must run first.');
  }
  const pipe = await pipelinePromise;

  const blob = new Blob([input as BlobPart]);
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable.');
  ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0);

  const rawImage = await RawImage.fromBlob(blob);
  const segmentation = await pipe(rawImage);
  const maskImage = segmentation[0]?.mask;
  if (!maskImage) throw new Error('Pipeline returned no mask.');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Mask data is a Uint8Array in 0..255 range, row-major matching the image.
  // BEN2 returns the mask at the input resolution, so length === w*h.
  for (let i = 0; i < maskImage.data.length; i++) {
    img.data[i * 4 + 3] = maskImage.data[i] ?? 0;
  }
  ctx.putImageData(img, 0, 0);

  lastResultCanvas = canvas;
  return encodeCanvas(canvas, opts.format);
}

export async function reencodeLastResult(
  format: RemoveBackgroundFormat,
): Promise<Uint8Array> {
  if (!lastResultCanvas) {
    throw new Error('No cached result to re-encode.');
  }
  return encodeCanvas(lastResultCanvas, format);
}

export function clearLastResult(): void {
  lastResultCanvas = null;
}
