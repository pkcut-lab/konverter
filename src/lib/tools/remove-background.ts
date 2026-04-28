/**
 * BG-Remover pure module — three-tier mobile-aware model switch.
 *
 * Variants (declared in `ml-variants.ts`):
 * - `fast`   — Xenova/modnet (Q8, 6.6 MB, Apache-2.0) — mobile-default.
 * - `quality`— onnx-community/BiRefNet_lite-ONNX (FP16, 115 MB, MIT) —
 *              desktop-default + capable-mobile with WebGPU.
 * - `pro`    — onnx-community/BEN2-ONNX (FP16, 219 MB, MIT) —
 *              desktop-only opt-in for maximum hair/edge quality.
 *
 * Pipeline-cache is per-variant: switching variants loads a new pipeline
 * (idempotent within the same variant). `isPreparedFor(variant)` answers
 * the variant-specific cache state synchronously so the FileTool component
 * can skip the `preparing`-phase on revisit.
 *
 * Entry-points are dynamic-imported by `tool-runtime-registry.ts` so
 * `@huggingface/transformers` splits into its own chunk and never ships
 * to pages that don't use background-removal.
 *
 * Mobile WebGPU policy: `fast` variant forces `device: 'wasm'` because the
 * Q8 model is small enough that WebGPU buys nothing and iOS Safari WebGPU
 * remains fragile under memory pressure. `quality` and `pro` use WebGPU
 * when available, WASM otherwise (matches CONVENTIONS §10.7).
 *
 * Mirror policy: `applyMlMirrorIfConfigured(env)` is called once before the
 * first `pipeline()` call, switching `env.remoteHost` to a Cloudflare R2
 * mirror when `PUBLIC_ML_MIRROR_HOST` (build-time) or
 * `window.__KITTOKIT_ML_MIRROR_HOST__` (runtime) is set.
 */

import { pipeline, RawImage, env } from '@huggingface/transformers';
import { applyMlMirrorIfConfigured } from './ml-mirror';
import { getVariant, type VariantId } from './ml-variants';

export type RemoveBackgroundFormat = 'png' | 'webp' | 'jpg';

export interface RemoveBackgroundOpts {
  format: RemoveBackgroundFormat;
  /**
   * Variant to use for the inference. If omitted, the variant of the most
   * recently prepared model is used. Throws if no model is prepared.
   */
  variant?: VariantId;
}

export interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface PrepareOpts {
  /** Which model variant to load. Default `'quality'`. */
  variant?: VariantId;
  /**
   * Watchdog timeout in ms. If no progress event arrives within this window
   * the pipeline-promise rejects with `StallError`. Defaults to 120 000.
   * Mobile callers should use `pickStallTimeout(probe)` from `ml-device-detect`.
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
 * Thrown when a variant declares `requiresWebGPU` but the browser exposes no
 * WebGPU adapter. The FP16 segmentation models (BiRefNet_lite, BEN2) crash with
 * `std::bad_alloc` during ONNX-WASM inference, so we fail fast at prepare-time
 * with a specific name the FileTool can branch on (auto-fallback to `fast`)
 * instead of letting the user wait for a 115 MB download that ends in OOM.
 */
export class WebGpuRequiredError extends Error {
  variant: VariantId;
  constructor(variant: VariantId) {
    super(`Variant "${variant}" needs WebGPU but no adapter is available.`);
    this.name = 'WebGpuRequiredError';
    this.variant = variant;
  }
}

/**
 * image-segmentation pipeline output shape per Transformers.js v4 docs:
 * `Array<{ label: string; score: number | null; mask: RawImage }>`.
 * For BEN2 / MODNet / BiRefNet the array has at least one entry where
 * `mask.data` is `Uint8Array | Uint8ClampedArray` in 0..255 range.
 */
type MaskImage = { data: Uint8Array | Uint8ClampedArray; width: number; height: number };
type SegmentationResult = Array<{ mask: MaskImage }>;
type Pipe = (input: unknown, opts?: unknown) => Promise<SegmentationResult>;

const pipelineCache = new Map<VariantId, Promise<Pipe>>();
const readyVariants = new Set<VariantId>();
let activeVariant: VariantId | null = null;
let lastResultCanvas: OffscreenCanvas | null = null;
let mirrorApplied = false;

async function detectDevice(allowWebGpu: boolean): Promise<'webgpu' | 'wasm'> {
  if (!allowWebGpu) return 'wasm';
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return 'wasm';
    const adapter = await gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}

/** True if any variant is prepared. Kept for backward-compat with existing callers. */
export function isPrepared(): boolean {
  return readyVariants.size > 0;
}

/** True if the specific variant is prepared (cache-hit on revisit). */
export function isPreparedFor(variant: VariantId): boolean {
  return readyVariants.has(variant);
}

/** Variant of the most recently prepared model, or null. */
export function getActiveVariant(): VariantId | null {
  return activeVariant;
}

export async function prepareBackgroundRemovalModel(
  onProgress: (e: ProgressEvent) => void,
  opts: PrepareOpts = {},
): Promise<void> {
  // Default to `fast` (MODNet-Q8, 6.6 MB, runs in WASM everywhere). Callers
  // that have a `DeviceProbe` should pass the result of `pickDefaultVariant`
  // explicitly — the FileTool component does so. Defaulting to `quality` here
  // would crash any caller that forgot to forward the variant on a browser
  // without WebGPU (the exact regression `WebGpuRequiredError` defends).
  const variant: VariantId = opts.variant ?? 'fast';
  const spec = getVariant('remove-background', variant);
  if (!spec) {
    throw new Error(`Unknown variant for remove-background: "${variant}"`);
  }

  // Cache-hit: this exact variant is already loaded.
  if (readyVariants.has(variant)) {
    activeVariant = variant;
    return;
  }

  // In-flight load for this variant: await it and exit.
  const inflight = pipelineCache.get(variant);
  if (inflight) {
    await inflight;
    activeVariant = variant;
    return;
  }

  if (!mirrorApplied) {
    applyMlMirrorIfConfigured(env as unknown as { remoteHost: string });
    mirrorApplied = true;
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

  // Start the watchdog before the first progress event arrives.
  watchdog = setTimeout(fireStall, stallTimeoutMs);

  // Mobile-fast (Q8 MODNet) forces WASM — WebGPU on iOS Safari adds
  // memory-pressure failure modes for no quality gain at this size.
  const allowWebGpu = variant !== 'fast';

  const promise = new Promise<Pipe>((resolve, reject) => {
    stallReject = (err) => {
      if (watchdog) clearTimeout(watchdog);
      reject(err);
    };
    (async () => {
      const device = await detectDevice(allowWebGpu);
      // Fail-fast guard: FP16 variants need WebGPU. Falling through to WASM
      // crashes inference with `std::bad_alloc` AFTER the 115/219 MB download
      // completes — which is the worst-case UX (long wait, then opaque error).
      // Throwing here costs the user nothing and lets the FileTool auto-switch
      // to `fast` before any bytes are downloaded. The defensive complement to
      // the FileTool's `variants` filter (which already hides the switcher
      // button), in case the probe and the actual adapter disagree.
      if (spec.requiresWebGPU && device !== 'webgpu') {
        throw new WebGpuRequiredError(variant);
      }
      const pipelineOpts: Record<string, unknown> = {
        progress_callback: wrappedProgress as unknown as (info: unknown) => void,
        device,
      };
      if (spec.dtype) pipelineOpts.dtype = spec.dtype;
      const pipe = await pipeline(
        'image-segmentation',
        spec.modelId,
        pipelineOpts,
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
  promise.catch(() => { /* silent — re-thrown in the awaiter below */ });

  pipelineCache.set(variant, promise);

  try {
    await promise;
    readyVariants.add(variant);
    activeVariant = variant;
  } catch (err) {
    // Reset so a subsequent retry actually retries.
    pipelineCache.delete(variant);
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
  const variant = opts.variant ?? activeVariant;
  if (!variant) {
    throw new Error('Pipeline not prepared — prepareBackgroundRemovalModel() must run first.');
  }
  const inflight = pipelineCache.get(variant);
  if (!inflight) {
    throw new Error(`Pipeline not prepared for variant "${variant}".`);
  }
  const pipe = await inflight;

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
  // BEN2 / BiRefNet_lite return a binary-ish mask; MODNet returns a continuous
  // alpha matte. Both fit the same alpha-channel write since they share the
  // 0..255 range and image-resolution shape.
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

/**
 * Drop the in-memory pipeline for a specific variant. Used by the FileTool
 * retry-after-stall path so a subsequent prepare() call actually re-fetches
 * instead of resolving against a half-broken cached promise. Also useful in
 * tests to reset state between cases.
 */
export function clearVariantCache(variant?: VariantId): void {
  if (variant) {
    pipelineCache.delete(variant);
    readyVariants.delete(variant);
    if (activeVariant === variant) activeVariant = null;
    return;
  }
  pipelineCache.clear();
  readyVariants.clear();
  activeVariant = null;
}
