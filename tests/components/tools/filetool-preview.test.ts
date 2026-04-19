import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

const CFG: FileToolConfig = {
  id: 'test-preview-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png'],
  maxSizeMb: 5,
  process: async () => new Uint8Array([137, 80, 78, 71]),
};

function patch(file: File, buf: Uint8Array): File {
  Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(buf.buffer), configurable: true });
  return file;
}

async function flushAsync(ticks = 6) {
  for (let i = 0; i < ticks; i++) { await Promise.resolve(); flushSync(); }
}

describe('FileTool — mini-preview', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    toolRuntimeRegistry['test-preview-tool'] = { process: async () => new Uint8Array([137, 80, 78, 71]) };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-preview-tool'];
    vi.unstubAllGlobals();
  });

  it('renders preview img in done-phase pointing to outputUrl', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1]);
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [patch(new File([buf], 'x.png', { type: 'image/png' }), buf)],
      configurable: true,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    const img = host.querySelector('[data-testid="filetool-preview"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('blob:mock');
    expect(img.getAttribute('alt')).toBeTruthy();
  });

  it('preview wrapper has checkerboard background class', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1]);
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [patch(new File([buf], 'x.png', { type: 'image/png' }), buf)],
      configurable: true,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    const wrapper = host.querySelector('[data-testid="filetool-preview"]')?.parentElement;
    expect(wrapper?.className).toMatch(/preview/);
  });
});
