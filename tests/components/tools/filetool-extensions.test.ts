import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';

const TEST_ID = 'test-file-tool-ext';

// Mediabunny probe mock. Per-test override via `probeRef.current`.
// vi.hoisted is required because vi.mock is hoisted above imports, so any
// plain `let` at module scope is uninitialised when the factory closes over it.
const { probeRef } = vi.hoisted(() => ({
  probeRef: { current: { width: 1920, height: 1080 } as { width: number; height: number } | null },
}));
vi.mock('mediabunny', () => ({
  BufferSource: vi.fn(),
  Input: vi.fn().mockImplementation(() => ({
    getPrimaryVideoTrack: vi.fn().mockImplementation(async () => probeRef.current),
  })),
  ALL_FORMATS: {},
}));

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes);
  const file = new File([buf], name, { type });
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.resolve(buf.buffer),
    configurable: true,
  });
  return file;
}

function render(config: FileToolConfig) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const cmp = mount(FileTool, { target, props: { config } });
  flushSync();
  return { target, cmp };
}

async function flushAsync(ticks = 10) {
  for (let i = 0; i < ticks; i++) {
    await Promise.resolve();
    flushSync();
  }
}

function baseConfig(overrides: Partial<FileToolConfig> = {}): FileToolConfig {
  return {
    id: TEST_ID,
    type: 'file-tool',
    categoryId: 'video',
    accept: ['video/mp4'],
    maxSizeMb: 500,
    showQuality: false,
    process: vi.fn(async () => new Uint8Array([1, 2, 3])),
    ...overrides,
  };
}

describe('FileTool.svelte — preflightCheck', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    delete toolRuntimeRegistry[TEST_ID];
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('renders initial error state when preflightCheck returns a string', () => {
    const process = vi.fn();
    toolRuntimeRegistry[TEST_ID] = {
      process,
      preflightCheck: () => 'WebCodecs nicht unterstützt.',
    };
    const { target, cmp } = render(baseConfig({ process }));
    const err = target.querySelector('[data-testid="filetool-error"]');
    expect(err).toBeTruthy();
    expect(err?.textContent).toContain('WebCodecs');
    // Dropzone is suppressed when preflight fails.
    const dropzone = target.querySelector('[data-testid="filetool-dropzone"]');
    expect(dropzone).toBeNull();
    unmount(cmp);
  });

  it('renders dropzone normally when preflightCheck returns null', () => {
    toolRuntimeRegistry[TEST_ID] = {
      process: vi.fn(async () => new Uint8Array([1])),
      preflightCheck: () => null,
    };
    const { target, cmp } = render(baseConfig());
    expect(target.querySelector('[data-testid="filetool-dropzone"]')).toBeTruthy();
    expect(target.querySelector('[data-testid="filetool-error"]')).toBeNull();
    unmount(cmp);
  });
});

describe('FileTool.svelte — presets', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    delete toolRuntimeRegistry[TEST_ID];
    probeRef.current = { width: 1920, height: 1080 };
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('renders all preset radios with default checked', () => {
    const process = vi.fn(async () => new Uint8Array([1]));
    toolRuntimeRegistry[TEST_ID] = { process };
    const cfg = baseConfig({
      process,
      presets: {
        id: 'preset',
        options: [
          { id: 'original', label: 'Original-Qualität' },
          { id: 'balanced', label: 'Balanced' },
          { id: 'small', label: 'Klein' },
        ],
        default: 'balanced',
      },
    });
    const { target, cmp } = render(cfg);
    const balanced = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-preset-balanced"]',
    );
    const original = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-preset-original"]',
    );
    const small = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-preset-small"]',
    );
    expect(balanced?.checked).toBe(true);
    expect(original?.checked).toBe(false);
    expect(small?.checked).toBe(false);
    unmount(cmp);
  });

  it('passes chosen preset value to processor under the presets.id key', async () => {
    const process = vi.fn(async () => new Uint8Array([1]));
    toolRuntimeRegistry[TEST_ID] = { process };
    const cfg = baseConfig({
      process,
      presets: {
        id: 'preset',
        options: [
          { id: 'original', label: 'Original-Qualität' },
          { id: 'balanced', label: 'Balanced' },
          { id: 'small', label: 'Klein' },
        ],
        default: 'balanced',
      },
    });
    const { target, cmp } = render(cfg);
    // Switch to "small"
    const small = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-preset-small"]',
    )!;
    small.checked = true;
    small.dispatchEvent(new Event('change', { bubbles: true }));
    flushSync();

    const input = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-input"]',
    )!;
    const file = makeFile('video.mp4', 'video/mp4', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    expect(process).toHaveBeenCalledTimes(1);
    const args = process.mock.calls[0];
    expect(args[1]).toMatchObject({ preset: 'small' });
    unmount(cmp);
  });
});

describe('FileTool.svelte — toggles (conditional visibility)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    delete toolRuntimeRegistry[TEST_ID];
    probeRef.current = { width: 1920, height: 1080 };
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('toggle with visibleIf=source-gt-1080p is hidden before any drop (no probe yet)', () => {
    toolRuntimeRegistry[TEST_ID] = { process: vi.fn(async () => new Uint8Array([1])) };
    const cfg = baseConfig({
      toggles: [{ id: 'downscaleTo1080p', label: 'Auf 1080p verkleinern', visibleIf: 'source-gt-1080p' }],
    });
    const { target, cmp } = render(cfg);
    expect(
      target.querySelector('[data-testid="filetool-toggle-downscaleTo1080p"]'),
    ).toBeNull();
    unmount(cmp);
  });

  it('toggle stays hidden after a 1080p probe (≤1920×1080)', async () => {
    probeRef.current = { width: 1920, height: 1080 };
    const process = vi.fn(async () => new Uint8Array([1]));
    toolRuntimeRegistry[TEST_ID] = { process };
    const cfg = baseConfig({
      process,
      toggles: [{ id: 'downscaleTo1080p', label: 'Auf 1080p verkleinern', visibleIf: 'source-gt-1080p' }],
    });
    const { target, cmp } = render(cfg);
    const input = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-input"]',
    )!;
    const file = makeFile('video.mp4', 'video/mp4', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    // After done: reset to check the idle-state toggle visibility
    const reset = target.querySelector<HTMLButtonElement>('[data-testid="filetool-reset"]');
    reset?.click();
    flushSync();
    expect(
      target.querySelector('[data-testid="filetool-toggle-downscaleTo1080p"]'),
    ).toBeNull();
    unmount(cmp);
  });

  it('toggle is shown after a >1080p probe (e.g. 3840×2160)', async () => {
    probeRef.current = { width: 3840, height: 2160 };
    const process = vi.fn(async () => new Uint8Array([1]));
    toolRuntimeRegistry[TEST_ID] = { process };
    const cfg = baseConfig({
      process,
      toggles: [{ id: 'downscaleTo1080p', label: 'Auf 1080p verkleinern', visibleIf: 'source-gt-1080p' }],
    });
    const { target, cmp } = render(cfg);
    const input = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-input"]',
    )!;
    const file = makeFile('4k.mp4', 'video/mp4', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync(30);
    const reset = target.querySelector<HTMLButtonElement>('[data-testid="filetool-reset"]');
    reset?.click();
    flushSync();
    expect(
      target.querySelector('[data-testid="filetool-toggle-downscaleTo1080p"]'),
    ).toBeTruthy();
    unmount(cmp);
  });

  it('toggle value is merged into the config arg passed to processor', async () => {
    probeRef.current = { width: 3840, height: 2160 };
    const process = vi.fn(async () => new Uint8Array([1]));
    toolRuntimeRegistry[TEST_ID] = { process };
    const cfg = baseConfig({
      process,
      toggles: [{ id: 'downscaleTo1080p', label: 'Auf 1080p verkleinern', visibleIf: 'source-gt-1080p' }],
    });
    const { target, cmp } = render(cfg);

    // First drop to populate sourceDims
    const input = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-input"]',
    )!;
    const file1 = makeFile('4k-a.mp4', 'video/mp4', 2048);
    Object.defineProperty(input, 'files', { value: [file1], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync(30);

    // Reset to idle, where toggle is now visible
    target.querySelector<HTMLButtonElement>('[data-testid="filetool-reset"]')?.click();
    flushSync();

    const toggle = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-toggle-downscaleTo1080p"]',
    )!;
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    flushSync();

    // Second drop with toggle set
    const input2 = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-input"]',
    )!;
    const file2 = makeFile('4k-b.mp4', 'video/mp4', 2048);
    Object.defineProperty(input2, 'files', { value: [file2], configurable: true });
    input2.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    // Second call should carry the toggle value
    const call2 = process.mock.calls[1];
    expect(call2[1]).toMatchObject({ downscaleTo1080p: true });
    unmount(cmp);
  });
});

describe('FileTool.svelte — progress + ETA', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    delete toolRuntimeRegistry[TEST_ID];
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('renders percent from onProgress callback during converting', async () => {
    let resolveProcess!: (bytes: Uint8Array) => void;
    const process = vi.fn((_bytes: Uint8Array, _cfg: unknown, onProgress?: (p: number) => void) => {
      return new Promise<Uint8Array>((resolve) => {
        // Fire progress early so the component renders the percent text.
        queueMicrotask(() => onProgress?.(0.42));
        resolveProcess = resolve;
      });
    });
    toolRuntimeRegistry[TEST_ID] = { process };
    const cfg = baseConfig({ process });
    const { target, cmp } = render(cfg);

    const input = target.querySelector<HTMLInputElement>(
      '[data-testid="filetool-input"]',
    )!;
    const file = makeFile('v.mp4', 'video/mp4', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await flushAsync(20);
    const prog = target.querySelector('[data-testid="filetool-progress"]');
    expect(prog?.textContent ?? '').toMatch(/42\s*%/);

    // Complete the promise so unmount is clean.
    resolveProcess(new Uint8Array([1]));
    await flushAsync(10);
    unmount(cmp);
  });
});
