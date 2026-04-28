import { processWebp } from './process-webp';
import { ML_VARIANTS, type VariantId, type MlVariant } from './ml-variants';
import type { DeviceProbe } from './ml-device-detect';

/**
 * Client-side runtime registry for FileTools.
 *
 * Astro serializes island props to JSON during SSR. Functions on the tool
 * config (`process`, `prepare`) are dropped to `null` on the client. The
 * FileTool component therefore looks up its runtime by `config.id` from
 * this table — plain ES-module imports the bundler can include.
 *
 * Each entry holds the dispatchers for ONE tool:
 *   - `process` — required, the actual conversion
 *   - `prepare` — optional, lazy-load step (e.g. ML model download)
 *
 * Heavy dependencies (ML pipelines, WASM codecs, >100 KB libs) MUST be
 * dynamic-imported inside the entry thunks, never at module top. Static
 * imports in this file fan out to every FileTool page regardless of whether
 * that page uses the dependency. See `remove-background` and `hevc-to-h264`
 * below for the lazy-load + sync-shim pattern.
 *
 * Adding a new file-tool requires three edits:
 *   1. Pure module(s) under `src/lib/tools/`
 *   2. Tool config in `src/lib/tool-registry.ts`
 *   3. Runtime entry below
 */

// Lazy singleton for speech-enhancer. `onnxruntime-web` (transitive dep of
// @huggingface/transformers) is ~1 MB of WASM + JS — keep it out of the shared
// bundle and off every page that doesn't use audio enhancement.
type SpeechEnhancerModule = typeof import('./speech-enhancer');
let speechEnhancerModulePromise: Promise<SpeechEnhancerModule> | null = null;
let speechEnhancerModule: SpeechEnhancerModule | null = null;
function loadSpeechEnhancer(): Promise<SpeechEnhancerModule> {
  if (!speechEnhancerModulePromise) {
    speechEnhancerModulePromise = import('./speech-enhancer').then((m) => {
      speechEnhancerModule = m;
      return m;
    });
  }
  return speechEnhancerModulePromise;
}

// Lazy singleton for remove-background. `@huggingface/transformers` is ~1 MB
// of ONNX runtime scaffolding — we must keep it out of the shared bundle and
// off /de/png-jpg-zu-webp (which doesn't use ML at all). Load the first time
// the user actually invokes the background-remover.
type RemoveBgModule = typeof import('./remove-background');
let removeBgModulePromise: Promise<RemoveBgModule> | null = null;
let removeBgModule: RemoveBgModule | null = null;
function loadRemoveBg(): Promise<RemoveBgModule> {
  if (!removeBgModulePromise) {
    removeBgModulePromise = import('./remove-background').then((m) => {
      removeBgModule = m;
      return m;
    });
  }
  return removeBgModulePromise;
}

// Lazy singleton for video-bg-remove. Heavier than remove-background
// (Mediabunny ~70 KB + transformers ~1 MB + worker file). Worker is owned
// by the process module — this thunk only loads the main-thread shim.
type VideoBgRemoveModule = typeof import('./process-video-bg-remove');
let videoBgRemoveModulePromise: Promise<VideoBgRemoveModule> | null = null;
let videoBgRemoveModule: VideoBgRemoveModule | null = null;
function loadVideoBgRemove(): Promise<VideoBgRemoveModule> {
  if (!videoBgRemoveModulePromise) {
    videoBgRemoveModulePromise = import('./process-video-bg-remove').then((m) => {
      videoBgRemoveModule = m;
      return m;
    });
  }
  return videoBgRemoveModulePromise;
}

export type ProgressCallback = (progress: number) => void;

export type ProcessFn = (
  input: Uint8Array,
  config?: Record<string, unknown>,
  onProgress?: ProgressCallback,
) => Uint8Array | Promise<Uint8Array>;

/**
 * Mobile-aware preparation options. Existing tools that don't care about
 * variants can ignore `opts` entirely — the second arg is optional. New
 * mobile-aware tools read `opts.variant` to pick a model and
 * `opts.stallTimeoutMs` to size the watchdog (typically 240s mobile / 60s
 * desktop, derived via `pickStallTimeout(probe)`).
 */
export interface PrepareOpts {
  variant?: VariantId;
  stallTimeoutMs?: number;
}

export type PrepareFn = (
  onProgress: (e: { loaded: number; total: number }) => void,
  opts?: PrepareOpts,
) => Promise<void>;

export type ReencodeFn = (format: string) => Promise<Uint8Array>;

export interface ToolRuntime {
  process: ProcessFn;
  prepare?: PrepareFn;
  reencode?: ReencodeFn;
  isPrepared?: () => boolean;
  /** Variant-aware cache check. Optional — only for mobile-aware tools. */
  isPreparedFor?: (variant: VariantId) => boolean;
  /** Drop a cached pipeline so a subsequent prepare() actually re-fetches. */
  clearVariantCache?: (variant?: VariantId) => void;
  clearLastResult?: () => void;
  preflightCheck?: () => string | null;
  /**
   * Mobile-aware variant matrix. When present, the FileTool component shows
   * the variant-switcher banner and routes the user-picked variant through
   * `prepare(onProgress, { variant })`. When absent, the tool is treated as
   * single-variant (the prepare path receives no `opts.variant`).
   */
  variants?: MlVariant[];
  /**
   * Per-tool override for default-variant selection. Falls back to
   * `pickDefaultVariant(toolId, probe)` when omitted.
   */
  pickDefaultVariant?: (probe: DeviceProbe) => VariantId;
}

export const toolRuntimeRegistry: Record<string, ToolRuntime> = {
  'speech-enhancer': {
    process: async (input, config) => {
      const m = await loadSpeechEnhancer();
      const attenLimDb =
        typeof config?.strength === 'string' ? parseInt(config.strength, 10) : 20;
      return m.enhanceSpeech(input, { attenLimDb });
    },
    prepare: async (onProgress) => {
      const m = await loadSpeechEnhancer();
      return m.prepareSpeechEnhancementModel(onProgress);
    },
    isPrepared: () => speechEnhancerModule?.isPrepared() ?? false,
    clearLastResult: () => speechEnhancerModule?.clearLastResult(),
    variants: ML_VARIANTS['speech-enhancer']!,
  },
  'png-jpg-to-webp': {
    process: (input, config) =>
      processWebp(input, {
        quality: typeof config?.quality === 'number' ? config.quality : 85,
      }),
  },
  'remove-background': {
    process: async (input, config) => {
      const m = await loadRemoveBg();
      const format =
        typeof config?.format === 'string' &&
        (config.format === 'png' || config.format === 'webp' || config.format === 'jpg')
          ? config.format
          : 'png';
      const removeOpts: { format: 'png' | 'webp' | 'jpg'; variant?: VariantId } = { format };
      if (
        typeof config?.mlVariant === 'string' &&
        (config.mlVariant === 'fast' || config.mlVariant === 'quality' || config.mlVariant === 'pro')
      ) {
        removeOpts.variant = config.mlVariant as VariantId;
      }
      return m.removeBackground(input, removeOpts);
    },
    prepare: async (onProgress, opts) => {
      const m = await loadRemoveBg();
      const prepOpts: { variant?: VariantId; stallTimeoutMs?: number } = {};
      if (opts?.variant) prepOpts.variant = opts.variant;
      if (opts?.stallTimeoutMs !== undefined) prepOpts.stallTimeoutMs = opts.stallTimeoutMs;
      return m.prepareBackgroundRemovalModel(onProgress, prepOpts);
    },
    reencode: async (format) => {
      const m = await loadRemoveBg();
      return m.reencodeLastResult(format as 'png' | 'webp' | 'jpg');
    },
    // isPrepared + clearLastResult stay sync so FileTool.svelte can call them
    // in its `$derived` / reset path without turning them into effects. Before
    // the first process/prepare call the module isn't loaded yet, so isPrepared
    // is `false` (correct: no model in memory) and clearLastResult is a no-op
    // (correct: no cached bitmap yet).
    isPrepared: () => removeBgModule?.isPrepared() ?? false,
    isPreparedFor: (variant) => removeBgModule?.isPreparedFor(variant) ?? false,
    clearVariantCache: (variant) => removeBgModule?.clearVariantCache(variant),
    clearLastResult: () => removeBgModule?.clearLastResult(),
    variants: ML_VARIANTS['remove-background']!,
  },
  'hevc-to-h264': {
    process: async (input, config, onProgress) => {
      const { processHevcToH264 } = await import('./process-hevc-to-h264');
      const preset =
        typeof config?.preset === 'string' &&
        (config.preset === 'original' || config.preset === 'balanced' || config.preset === 'small')
          ? config.preset
          : 'balanced';
      const downscaleTo1080p = config?.downscaleTo1080p === true;
      return processHevcToH264(input, { preset, downscaleTo1080p }, onProgress);
    },
    preflightCheck: () => {
      if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') {
        return 'Dein Browser unterstützt kein WebCodecs. Nutze Desktop-Chrome/Firefox/Edge oder iOS 26 / Safari 26+.';
      }
      return null;
    },
  },
  // video-bg-remove: ML video pipeline (BiRefNet_lite or MODNet via @huggingface/
  // transformers + Mediabunny VP9+Alpha mux). Worker-based per CONVENTIONS.md §10
  // (MLFileTool-Template). The component reads typed `phase: 'model' | 'frame'`
  // progress directly from `process-video-bg-remove` to drive its dual-progress
  // UI; the registry's narrow ProgressCallback is satisfied by mapping the frame
  // ratio through. `isPrepared` and `clearLastResult` are sync façades over the
  // module singleton so the FileTool reset path stays effect-free.
  'video-bg-remove': {
    process: async (input, config, onProgress) => {
      const m = await loadVideoBgRemove();
      const modelKey = (config?.modelKey === 'speed' ? 'speed' : 'quality') as 'quality' | 'speed';
      const outputMode = (config?.outputMode === 'solid' ? 'solid' : 'transparent') as 'transparent' | 'solid';
      const bgColor = typeof config?.bgColor === 'string' ? config.bgColor : '#ffffff';
      const result = await m.processVideoBgRemove(
        input,
        { modelKey, outputMode, bgColor },
        (e) => {
          if (onProgress && e.phase === 'frame' && e.totalFrames > 0) {
            onProgress(e.frameIdx / e.totalFrames);
          }
        },
      );
      return result.output;
    },
    prepare: async (onProgress) => {
      const m = await loadVideoBgRemove();
      await m.prepareVideoBgRemoveModel(onProgress, 'quality');
    },
    isPrepared: () => videoBgRemoveModule?.isVideoBgRemovePrepared() ?? false,
    clearLastResult: () => videoBgRemoveModule?.clearVideoBgRemoveLastResult(),
    preflightCheck: () => {
      // iOS Safari ≤25 lacks `VideoEncoder` (only Decoder partial since 16.4) —
      // VP9+Alpha-Encoding via Mediabunny needs both, so the tool is hard-blocked
      // there. iOS 26+ (Sept 2025) ships full WebCodecs. Audit:
      // inbox/to-claude/2026-04-28-mobile-ml-tools-audit.md §1.3.
      if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') {
        return 'Dein Browser unterstützt kein WebCodecs. Auf dem iPhone benötigst du iOS 26 (Safari 26) oder neuer; auf dem Desktop Chrome, Firefox oder Edge.';
      }
      return null;
    },
    variants: ML_VARIANTS['video-bg-remove']!,
  },
  'image-to-text': {
    process: async (input, config, onProgress) => {
      const m = await import('./bild-zu-text');
      return m.bildZuText.process(input, config, onProgress);
    },
    prepare: async (onProgress, opts) => {
      const m = await import('./bild-zu-text');
      const prepareFn = m.bildZuText.prepare as
        | ((cb: (e: { loaded: number; total: number }) => void, opts?: { variant?: string }) => Promise<void>)
        | undefined;
      if (prepareFn) {
        const passOpts: { variant?: string } = {};
        if (opts?.variant) passOpts.variant = opts.variant;
        return prepareFn(onProgress, passOpts);
      }
    },
    variants: ML_VARIANTS['image-to-text']!,
  },
  'jpg-to-pdf': {
    process: async (input, config) => {
      const { processJpgToPdf } = await import('./jpg-zu-pdf-runtime');
      return processJpgToPdf(input, config);
    },
  },
  // pdf-compress: Lossless PDF structural optimisation via pdf-lib (MIT).
  // pdf-lib (~500 KB) is lazily imported inside the runtime module on first call
  // per Performance-Mandate §9.2. No heavy ML dep — just deflate + metadata strip.
  'pdf-compress': {
    process: async (input) => {
      const { processPdfKomprimieren } = await import('./pdf-komprimieren-runtime');
      return processPdfKomprimieren(input);
    },
    isPrepared: () => true,
  },
  // webcam-blur: live camera tool — no file-upload pipeline, no ML model.
  // getUserMedia + Canvas 2D compositing handled entirely in WebcamBlurTool.svelte.
  // Runtime entry exists so FileTool/interactive pages can safely call getRuntime()
  // without crashing; process is not invoked for interactive tools.
  'webcam-blur': {
    process: async () => {
      throw new Error(
        'webcam-blur: no file-pipeline — live stream handled by WebcamBlurTool.svelte.',
      );
    },
    preflightCheck: () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return 'Dein Browser unterstützt keinen Kamerazugriff. Bitte Chrome, Firefox oder Edge verwenden.';
      }
      return null;
    },
  },
};

export function getRuntime(toolId: string): ToolRuntime | undefined {
  return toolRuntimeRegistry[toolId];
}
