import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes);
  const file = new File([buf], name, { type });
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.resolve(buf.buffer),
    configurable: true,
  });
  return file;
}

const FORMATS_CFG: FileToolConfig = {
  id: 'test-format-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png'],
  maxSizeMb: 5,
  defaultFormat: 'png',
  process: async () => new Uint8Array([137, 80, 78, 71]),
};

describe('FileTool — dynamic format + format-chooser', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    toolRuntimeRegistry['test-format-tool'] = {
      process: async () => new Uint8Array([137, 80, 78, 71]),
      reencode: vi.fn(async (fmt: string) => {
        if (fmt === 'webp') return new Uint8Array([0x52, 0x49, 0x46, 0x46]);
        if (fmt === 'jpg') return new Uint8Array([0xFF, 0xD8]);
        return new Uint8Array([137, 80, 78, 71]);
      }),
    };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-format-tool'];
    vi.unstubAllGlobals();
  });

  async function flushAsync(ticks = 6) {
    for (let i = 0; i < ticks; i++) {
      await Promise.resolve();
      flushSync();
    }
  }

  it('uses defaultFormat from config for download extension', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl.getAttribute('download')).toMatch(/\.png$/);
  });

  it('renders format-chooser in done-phase when runtime has reencode', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-format-chooser"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-format-png"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-format-webp"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-format-jpg"]')).not.toBeNull();
  });

  it('format switch triggers reencode + updates download extension', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    const webpRadio = host.querySelector('[data-testid="filetool-format-webp"]') as HTMLInputElement;
    webpRadio.checked = true;
    webpRadio.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    const reencode = toolRuntimeRegistry['test-format-tool'].reencode as ReturnType<typeof vi.fn>;
    expect(reencode).toHaveBeenCalledWith('webp');
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl.getAttribute('download')).toMatch(/\.webp$/);
  });

  it('omits format-chooser when runtime has no reencode', async () => {
    delete toolRuntimeRegistry['test-format-tool'].reencode;
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-format-chooser"]')).toBeNull();
  });

  it('applies filenameSuffix to download name when set', async () => {
    const suffixCfg: FileToolConfig = { ...FORMATS_CFG, filenameSuffix: '_no-bg' };
    cmp = mount(FileTool, { target: host, props: { config: suffixCfg } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl.getAttribute('download')).toBe('photo_no-bg.png');
  });

  it('hides quality slider when showQuality is false', async () => {
    const noQCfg: FileToolConfig = { ...FORMATS_CFG, showQuality: false };
    cmp = mount(FileTool, { target: host, props: { config: noQCfg } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-quality"]')).toBeNull();
  });

  it('renders quality slider by default (showQuality omitted)', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-quality"]')).not.toBeNull();
  });
});
