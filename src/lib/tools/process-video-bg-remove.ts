/**
 * video-bg-remove main-thread shim.
 *
 * Bridges the FileTool runtime-registry to the Web Worker that runs the
 * actual ML pipeline (BiRefNet_lite or MODNet via @huggingface/transformers
 * + Mediabunny VP9+Alpha mux). Uses a lazy-initialized singleton Worker so
 * model weights can persist across calls (the worker keeps the pipeline
 * promise alive in module scope).
 *
 * §10 MLFileTool-Template (CONVENTIONS.md): isPrepared() is sync (source-
 * of-truth is a module-scope flag flipped on `prepared` / `done` worker
 * messages — components shouldn't need an effect to await it).
 *
 * AbortError-pattern: abortVideoBgRemove() posts `{ type: 'abort' }` to
 * the worker; the in-flight processVideoBgRemove() promise rejects with a
 * DOMException-like error of name `AbortError`. Components catch that
 * specifically and return to `idle` rather than `error`.
 */

export type VideoBgRemoveModelKey = 'quality' | 'speed';
export type VideoBgRemoveOutputMode = 'transparent' | 'solid';

export interface VideoBgRemoveConfig {
  modelKey: VideoBgRemoveModelKey;
  outputMode: VideoBgRemoveOutputMode;
  bgColor?: string;
}

export interface VideoBgRemoveResult {
  output: Uint8Array;
  mime: string;
}

export type ProgressEvent =
  | { phase: 'model'; loaded: number; total: number }
  | { phase: 'frame'; frameIdx: number; totalFrames: number };

let workerInstance: Worker | null = null;
let prepared = false;
let lastResult: VideoBgRemoveResult | null = null;

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('../../workers/video-bg-remove.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return workerInstance;
}

class AbortError extends Error {
  constructor() {
    super('Verarbeitung abgebrochen.');
    this.name = 'AbortError';
  }
}

type WorkerOutbound =
  | { type: 'progress'; phase: 'model'; loaded: number; total: number }
  | { type: 'progress'; phase: 'frame'; frameIdx: number; totalFrames: number }
  | { type: 'done'; output: Uint8Array; mime: string }
  | { type: 'prepared' }
  | { type: 'aborted' }
  | { type: 'error'; message: string };

export async function prepareVideoBgRemoveModel(
  onProgress: (e: { loaded: number; total: number }) => void,
  modelKey: VideoBgRemoveModelKey = 'quality',
): Promise<void> {
  const worker = getWorker();
  return new Promise<void>((resolve, reject) => {
    const handler = (event: MessageEvent<WorkerOutbound>) => {
      const msg = event.data;
      if (msg.type === 'progress' && msg.phase === 'model') {
        onProgress({ loaded: msg.loaded, total: msg.total });
      } else if (msg.type === 'prepared') {
        prepared = true;
        worker.removeEventListener('message', handler);
        resolve();
      } else if (msg.type === 'error') {
        worker.removeEventListener('message', handler);
        reject(new Error(msg.message));
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'prepare', payload: { modelKey } });
  });
}

export async function processVideoBgRemove(
  input: Uint8Array,
  config: VideoBgRemoveConfig,
  onProgress: (e: ProgressEvent) => void,
): Promise<VideoBgRemoveResult> {
  const worker = getWorker();
  return new Promise<VideoBgRemoveResult>((resolve, reject) => {
    const handler = (event: MessageEvent<WorkerOutbound>) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        onProgress(
          msg.phase === 'model'
            ? { phase: 'model', loaded: msg.loaded, total: msg.total }
            : { phase: 'frame', frameIdx: msg.frameIdx, totalFrames: msg.totalFrames },
        );
      } else if (msg.type === 'done') {
        prepared = true;
        lastResult = { output: msg.output, mime: msg.mime };
        worker.removeEventListener('message', handler);
        resolve(lastResult);
      } else if (msg.type === 'aborted') {
        worker.removeEventListener('message', handler);
        reject(new AbortError());
      } else if (msg.type === 'error') {
        worker.removeEventListener('message', handler);
        reject(new Error(msg.message));
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'process',
      payload: {
        input,
        modelKey: config.modelKey,
        outputMode: config.outputMode,
        bgColor: config.bgColor,
      },
    });
  });
}

export function abortVideoBgRemove(): void {
  workerInstance?.postMessage({ type: 'abort' });
}

export function isVideoBgRemovePrepared(): boolean {
  return prepared;
}

export function clearVideoBgRemoveLastResult(): void {
  lastResult = null;
}

export function getLastVideoBgRemoveResult(): VideoBgRemoveResult | null {
  return lastResult;
}

/** Test-only reset hook — production code should never need this. */
export function __resetVideoBgRemoveForTests(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
  prepared = false;
  lastResult = null;
}
