import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes);
  const file = new File([buf], name, { type });
  Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(buf.buffer), configurable: true });
  return file;
}

let prepareCalls = 0;
let prepareImpl: () => Promise<void> = async () => undefined;

const PREP_CFG: FileToolConfig = {
  id: 'test-prepare-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png'],
  maxSizeMb: 5,
  prepare: async () => undefined,
  process: async () => new Uint8Array([1]),
};

describe('FileTool — preparing phase', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    prepareCalls = 0;
    prepareImpl = async () => undefined;
    let preparedFlag = false;
    toolRuntimeRegistry['test-prepare-tool'] = {
      process: async () => new Uint8Array([1]),
      prepare: async (onProgress) => {
        prepareCalls++;
        onProgress({ loaded: 50, total: 110 });
        await prepareImpl();
        preparedFlag = true;
      },
      isPrepared: () => preparedFlag,
      clearLastResult: () => undefined,
    };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-prepare-tool'];
    vi.unstubAllGlobals();
  });

  async function flushAsync(ticks = 8) {
    for (let i = 0; i < ticks; i++) {
      await Promise.resolve();
      flushSync();
    }
  }

  it('phase passes idle -> preparing -> converting -> done on first upload', async () => {
    let resolveImpl: () => void = () => undefined;
    prepareImpl = () => new Promise<void>((res) => { resolveImpl = res; });
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-preparing"]')).not.toBeNull();
    resolveImpl();
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-status"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-download"]')).not.toBeNull();
  });

  it('skips preparing on second upload (cache path)', async () => {
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    let input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(prepareCalls).toBe(1);

    // Reset and upload again
    (host.querySelector('[data-testid="filetool-reset"]') as HTMLButtonElement).click();
    await flushAsync();
    input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('b.png', 'image/png', 10)], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(prepareCalls).toBe(1); // not called again
  });

  it('renders progress label inside preparing state', async () => {
    let resolveImpl: () => void = () => undefined;
    prepareImpl = () => new Promise<void>((res) => { resolveImpl = res; });
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    const label = host.querySelector('[data-testid="loader-progress-label"]');
    expect(label?.textContent).toMatch(/MB|%/);
    resolveImpl();
    await flushAsync();
  });

  it('prepare reject -> error phase with retry button', async () => {
    prepareImpl = async () => { throw new Error('Netz weg'); };
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-error"]')).not.toBeNull();
  });

  it('configs without prepare go straight from idle to converting (no preparing UI)', async () => {
    delete toolRuntimeRegistry['test-prepare-tool'].prepare;
    cmp = mount(FileTool, { target: host, props: { config: { ...PREP_CFG, prepare: undefined } } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-preparing"]')).toBeNull();
    expect(host.querySelector('[data-testid="filetool-download"]')).not.toBeNull();
  });
});
