import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

// Hoisted module-level mock so the dynamic import inside FileTool.svelte
// is intercepted when the HEIC test activates the spy via the shared ref.
// vi.doMock without resetModules cannot intercept already-resolved ESM.
// The spy is held on a plain object so the hoisted factory closure captures
// the object reference (stable) rather than a let-binding (not yet initialised
// at hoist time in some bundler transform orders).
const _heicSpy = { fn: null as (ReturnType<typeof vi.fn>) | null };
vi.mock('../../../src/lib/tools/heic-decode', () => ({
  decodeHeicIfNeeded: async (bytes: Uint8Array, mime: string) => {
    if (_heicSpy.fn) return _heicSpy.fn(bytes, mime);
    // Pass-through: not a HEIC mime, return unchanged
    return { bytes, mime };
  },
}));

const CFG: FileToolConfig = {
  id: 'test-input-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png', 'image/jpeg', 'image/heic'],
  maxSizeMb: 5,
  process: async () => new Uint8Array([1]),
};

function patch(file: File, buf: Uint8Array): File {
  Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(buf.buffer), configurable: true });
  return file;
}

async function flushAsync(ticks = 6) {
  for (let i = 0; i < ticks; i++) { await Promise.resolve(); flushSync(); }
}

describe('FileTool — input methods', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    toolRuntimeRegistry['test-input-tool'] = { process: async () => new Uint8Array([1]) };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-input-tool'];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('clipboard paste with image File item triggers process', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1, 2, 3]);
    const file = patch(new File([buf], 'pasted.png', { type: 'image/png' }), buf);
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as unknown as DataTransferItem;
    const ev = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev);
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-download"]')).not.toBeNull();
  });

  it('clipboard paste without image item is silently ignored', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const item = { kind: 'string', type: 'text/plain', getAsFile: () => null } as unknown as DataTransferItem;
    const ev = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev);
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-download"]')).toBeNull();
    expect(host.querySelector('[data-testid="filetool-error"]')).toBeNull();
  });

  it('clipboard paste in non-idle phase is ignored', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1]);
    const file = patch(new File([buf], 'a.png', { type: 'image/png' }), buf);
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as unknown as DataTransferItem;
    const ev1 = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev1, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev1);
    await flushAsync();
    const callsAfterFirst = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls.length;
    const ev2 = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev2, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev2);
    await flushAsync();
    // Done state creates Object URLs for both source + output preview. A second
    // paste during done-phase must NOT run the pipeline again.
    expect((URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst);
  });

  it('camera-capture button is rendered when cameraCapture is not false', () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    expect(host.querySelector('[data-testid="filetool-camera-input"]')).not.toBeNull();
  });

  it('camera-capture button is omitted when cameraCapture is false', () => {
    cmp = mount(FileTool, { target: host, props: { config: { ...CFG, cameraCapture: false } } });
    flushSync();
    expect(host.querySelector('[data-testid="filetool-camera-input"]')).toBeNull();
  });

  it('clipboard paste with unnamed File synthesizes pasted-image-<ts>.png', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1, 2, 3]);
    const file = patch(new File([buf], '', { type: 'image/png' }), buf);
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as unknown as DataTransferItem;
    const ev = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev);
    await flushAsync();
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl).not.toBeNull();
    expect(dl.getAttribute('download')).toMatch(/^pasted-image-\d+\.webp$/);
  });

  it('HEIC upload triggers heic-decode lazy-load before process', async () => {
    // vi.doMock without resetModules cannot intercept already-resolved ESM modules.
    // Use the module-level vi.mock shim with a shared spy ref instead.
    const decodeSpy = vi.fn(async (bytes: Uint8Array, _mime: string) => ({ bytes, mime: 'image/png' }));
    _heicSpy.fn = decodeSpy;
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1, 2]);
    const file = patch(new File([buf], 'x.heic', { type: 'image/heic' }), buf);
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    _heicSpy.fn = null;
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  });
});
