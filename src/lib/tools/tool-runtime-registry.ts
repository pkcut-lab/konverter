import { processWebp } from './process-webp';
import {
  removeBackground,
  prepareBackgroundRemovalModel,
  reencodeLastResult,
  clearLastResult,
  isPrepared,
} from './remove-background';

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
 * Adding a new file-tool requires three edits:
 *   1. Pure module(s) under `src/lib/tools/`
 *   2. Tool config in `src/lib/tool-registry.ts`
 *   3. Runtime entry below
 */

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
  'png-jpg-to-webp': {
    process: (input, config) =>
      processWebp(input, {
        quality: typeof config?.quality === 'number' ? config.quality : 85,
      }),
  },
  'remove-background': {
    process: (input, config) =>
      removeBackground(input, {
        format:
          typeof config?.format === 'string' &&
          (config.format === 'png' || config.format === 'webp' || config.format === 'jpg')
            ? config.format
            : 'png',
      }),
    prepare: (onProgress) => prepareBackgroundRemovalModel(onProgress),
    reencode: (format) => reencodeLastResult(format as 'png' | 'webp' | 'jpg'),
    isPrepared: () => isPrepared(),
    clearLastResult: () => clearLastResult(),
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
};

export function getRuntime(toolId: string): ToolRuntime | undefined {
  return toolRuntimeRegistry[toolId];
}
