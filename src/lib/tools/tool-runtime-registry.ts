import { processWebp } from './process-webp';

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

export type ProgressCallback = (progress: number) => void;

export type ProcessFn = (
  input: Uint8Array,
  config?: Record<string, unknown>,
  onProgress?: ProgressCallback,
) => Uint8Array | Promise<Uint8Array>;

export type PrepareFn = (
  onProgress: (e: { loaded: number; total: number }) => void,
) => Promise<void>;

export type ReencodeFn = (format: string) => Promise<Uint8Array>;

export interface ToolRuntime {
  process: ProcessFn;
  prepare?: PrepareFn;
  reencode?: ReencodeFn;
  isPrepared?: () => boolean;
  clearLastResult?: () => void;
  preflightCheck?: () => string | null;
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
      return m.removeBackground(input, {
        format:
          typeof config?.format === 'string' &&
          (config.format === 'png' || config.format === 'webp' || config.format === 'jpg')
            ? config.format
            : 'png',
      });
    },
    prepare: async (onProgress) => {
      const m = await loadRemoveBg();
      return m.prepareBackgroundRemovalModel(onProgress);
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
    clearLastResult: () => removeBgModule?.clearLastResult(),
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
        return 'Dein Browser unterstützt kein WebCodecs. Nutze Desktop-Chrome/Firefox/Edge oder Safari 16+.';
      }
      return null;
    },
  },
  // video-bg-remove: ML pipeline stub. Full implementation requires spike tasks
  // documented in docs/superpowers/specs/2026-04-22-video-hintergrund-entfernen-design.md §9
  // (Mediabunny VP9+Alpha mux + onnxruntime-web BiRefNet_lite ONNX worker).
  'video-bg-remove': {
    process: async () => {
      throw new Error(
        'video-bg-remove: ML pipeline not yet implemented — spike tasks required (see design spec §9).',
      );
    },
    prepare: async () => {
      throw new Error(
        'video-bg-remove: model loading not yet implemented — spike tasks required.',
      );
    },
    isPrepared: () => false,
    clearLastResult: () => { /* no-op until pipeline is implemented */ },
    preflightCheck: () => {
      if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') {
        return 'Dein Browser unterstützt kein WebCodecs. Nutze Desktop-Chrome/Firefox/Edge oder Safari 16+.';
      }
      return null;
    },
  },
};

export function getRuntime(toolId: string): ToolRuntime | undefined {
  return toolRuntimeRegistry[toolId];
}
