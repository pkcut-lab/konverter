import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  processVideoBgRemove,
  prepareVideoBgRemoveModel,
  isVideoBgRemovePrepared,
  clearVideoBgRemoveLastResult,
  abortVideoBgRemove,
  getLastVideoBgRemoveResult,
  __resetVideoBgRemoveForTests,
} from '../../../src/lib/tools/process-video-bg-remove';

/**
 * Worker-mock harness.
 *
 * The process-video-bg-remove module spawns a real Worker via
 * `new Worker(new URL(..., import.meta.url), { type: 'module' })`. jsdom 25
 * doesn't ship a Worker; we install a controllable stub that records posted
 * messages and lets each test script the responses.
 */
type Listener = (e: MessageEvent) => void;
const workerInstances: MockWorker[] = [];

class MockWorker {
  postedMessages: unknown[] = [];
  listeners = new Set<Listener>();
  scriptUrl: string;
  terminated = false;
  constructor(url: string | URL) {
    this.scriptUrl = String(url);
    workerInstances.push(this);
  }
  postMessage(msg: unknown): void {
    this.postedMessages.push(msg);
  }
  addEventListener(type: string, listener: Listener): void {
    if (type === 'message') this.listeners.add(listener);
  }
  removeEventListener(type: string, listener: Listener): void {
    if (type === 'message') this.listeners.delete(listener);
  }
  terminate(): void {
    this.terminated = true;
  }
  emit(data: unknown): void {
    for (const l of this.listeners) l({ data } as MessageEvent);
  }
}

beforeEach(() => {
  workerInstances.length = 0;
  (globalThis as Record<string, unknown>).Worker = MockWorker;
  __resetVideoBgRemoveForTests();
});

afterEach(() => {
  __resetVideoBgRemoveForTests();
  delete (globalThis as Record<string, unknown>).Worker;
  vi.unstubAllGlobals();
});

describe('process-video-bg-remove main-thread shim', () => {
  it('isVideoBgRemovePrepared() returns false before any pipeline run', () => {
    expect(isVideoBgRemovePrepared()).toBe(false);
  });

  it('clearVideoBgRemoveLastResult() does not throw before any result', () => {
    expect(() => clearVideoBgRemoveLastResult()).not.toThrow();
  });

  it('prepareVideoBgRemoveModel forwards model progress and resolves on prepared', async () => {
    const events: Array<{ loaded: number; total: number }> = [];
    const promise = prepareVideoBgRemoveModel((e) => events.push(e));
    const w = workerInstances[0]!;
    expect(w.postedMessages[0]).toMatchObject({ type: 'prepare', payload: { modelKey: 'quality' } });

    w.emit({ type: 'progress', phase: 'model', loaded: 5, total: 10 });
    w.emit({ type: 'progress', phase: 'model', loaded: 10, total: 10 });
    w.emit({ type: 'prepared' });

    await promise;
    expect(events).toEqual([
      { loaded: 5, total: 10 },
      { loaded: 10, total: 10 },
    ]);
    expect(isVideoBgRemovePrepared()).toBe(true);
  });

  it('processVideoBgRemove resolves with output Uint8Array on done', async () => {
    const out = new Uint8Array([1, 2, 3]);
    const progressEvents: unknown[] = [];
    const promise = processVideoBgRemove(
      new Uint8Array([0]),
      { modelKey: 'quality', outputMode: 'transparent' },
      (e) => progressEvents.push(e),
    );
    const w = workerInstances[0]!;
    expect(w.postedMessages[0]).toMatchObject({
      type: 'process',
      payload: { modelKey: 'quality', outputMode: 'transparent' },
    });

    w.emit({ type: 'progress', phase: 'frame', frameIdx: 1, totalFrames: 5 });
    w.emit({ type: 'done', output: out, mime: 'video/webm' });

    const result = await promise;
    expect(result.output).toBe(out);
    expect(result.mime).toBe('video/webm');
    expect(progressEvents).toContainEqual({ phase: 'frame', frameIdx: 1, totalFrames: 5 });
    expect(getLastVideoBgRemoveResult()).toEqual({ output: out, mime: 'video/webm' });
    expect(isVideoBgRemovePrepared()).toBe(true);
  });

  it('processVideoBgRemove rejects with the worker error message', async () => {
    const promise = processVideoBgRemove(
      new Uint8Array([0]),
      { modelKey: 'quality', outputMode: 'transparent' },
      () => {},
    );
    const w = workerInstances[0]!;
    w.emit({ type: 'error', message: 'Modell fehlt' });
    await expect(promise).rejects.toThrow('Modell fehlt');
  });

  it('abortVideoBgRemove posts abort and rejects with AbortError', async () => {
    const promise = processVideoBgRemove(
      new Uint8Array([0]),
      { modelKey: 'speed', outputMode: 'solid', bgColor: '#ff8800' },
      () => {},
    );
    const w = workerInstances[0]!;
    abortVideoBgRemove();
    expect(w.postedMessages.at(-1)).toEqual({ type: 'abort' });

    w.emit({ type: 'aborted' });
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('clearVideoBgRemoveLastResult drops cached result', async () => {
    const out = new Uint8Array([9]);
    const promise = processVideoBgRemove(
      new Uint8Array([0]),
      { modelKey: 'quality', outputMode: 'transparent' },
      () => {},
    );
    const w = workerInstances[0]!;
    w.emit({ type: 'done', output: out, mime: 'video/webm' });
    await promise;
    expect(getLastVideoBgRemoveResult()).not.toBeNull();
    clearVideoBgRemoveLastResult();
    expect(getLastVideoBgRemoveResult()).toBeNull();
  });

  it('singleton worker is reused across calls', async () => {
    const first = processVideoBgRemove(
      new Uint8Array([0]),
      { modelKey: 'quality', outputMode: 'transparent' },
      () => {},
    );
    const w = workerInstances[0]!;
    w.emit({ type: 'done', output: new Uint8Array([1]), mime: 'video/webm' });
    await first;

    const second = processVideoBgRemove(
      new Uint8Array([2]),
      { modelKey: 'quality', outputMode: 'transparent' },
      () => {},
    );
    expect(workerInstances.length).toBe(1);
    w.emit({ type: 'done', output: new Uint8Array([3]), mime: 'video/webm' });
    await second;
  });

  it('process forwards custom solid bgColor + speed model to the worker', async () => {
    const promise = processVideoBgRemove(
      new Uint8Array([42]),
      { modelKey: 'speed', outputMode: 'solid', bgColor: '#112233' },
      () => {},
    );
    const w = workerInstances[0]!;
    expect(w.postedMessages[0]).toMatchObject({
      type: 'process',
      payload: { modelKey: 'speed', outputMode: 'solid', bgColor: '#112233' },
    });
    w.emit({ type: 'done', output: new Uint8Array([0]), mime: 'video/mp4' });
    const r = await promise;
    expect(r.mime).toBe('video/mp4');
  });
});
