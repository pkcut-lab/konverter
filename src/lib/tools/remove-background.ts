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

import { pipeline } from '@huggingface/transformers';

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

type Pipe = (input: unknown, opts?: unknown) => Promise<{ mask: Float32Array; width?: number; height?: number }>;

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
  // JPG: composite white background under any alpha pixels before encoding.
  if (format === 'jpg') {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Cast: ctx is OffscreenCanvasRenderingContext2D in real browsers.
      const c = ctx as unknown as CanvasRenderingContext2D;
      c.globalCompositeOperation = 'destination-over';
      c.fillStyle = 'white';
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.globalCompositeOperation = 'source-over';
    }
  }
  const blob = await canvas.convertToBlob({ type: formatToMime(format), quality: 0.92 });
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

  const segmentation = await pipe(bitmap);
  const mask = segmentation.mask;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  // Apply mask to alpha channel. Mask is 0..1 float, stored row-major matching image.
  for (let i = 0; i < mask.length; i++) {
    const alpha = mask[i] ?? 0;
    img.data[i * 4 + 3] = Math.round(alpha * 255);
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
