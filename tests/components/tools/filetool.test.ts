import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

function makeConfig(
  process: FileToolConfig['process'] = vi.fn(async () => new Uint8Array([1, 2, 3])),
): FileToolConfig {
  return {
    id: 'png-jpg-to-webp',
    type: 'file-tool',
    categoryId: 'bilder',
    iconPrompt: 'pencil sketch',
    accept: ['image/png', 'image/jpeg'],
    maxSizeMb: 10,
    process,
  };
}

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes);
  const file = new File([buf], name, { type });
  // jsdom 25 doesn't implement Blob/File.prototype.arrayBuffer — patch per-instance
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.resolve(buf.buffer),
    configurable: true,
  });
  return file;
}

function render(config: FileToolConfig = makeConfig()) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const cmp = mount(FileTool, { target, props: { config } });
  flushSync();
  return { target, cmp };
}

async function flushAsync(ticks = 6) {
  for (let i = 0; i < ticks; i++) {
    await Promise.resolve();
    flushSync();
  }
}

describe('FileTool.svelte — png-jpg-to-webp', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('renders file input with accept matching config.accept', () => {
    const { target, cmp } = render();
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute('accept')).toBe('image/png,image/jpeg');
    unmount(cmp);
  });

  it('renders quality slider with default value 85', () => {
    const { target, cmp } = render();
    const slider = target.querySelector(
      '[data-testid="filetool-quality"]',
    ) as HTMLInputElement;
    expect(slider).toBeTruthy();
    expect(slider.value).toBe('85');
    unmount(cmp);
  });

  it('shows max-size hint (10 MB) in the dropzone meta', () => {
    const { target, cmp } = render();
    const meta = target.querySelector('[data-testid="filetool-meta"]');
    expect(meta?.textContent).toMatch(/10\s*MB/);
    unmount(cmp);
  });

  it('rejects oversized file with error message and does not call process', async () => {
    const process = vi.fn();
    const { target, cmp } = render(makeConfig(process));
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const big = makeFile('huge.png', 'image/png', 11 * 1024 * 1024);
    Object.defineProperty(input, 'files', { value: [big], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    flushSync();
    await Promise.resolve();
    flushSync();
    const err = target.querySelector('[data-testid="filetool-error"]');
    expect(err?.textContent).toMatch(/10\s*MB/);
    expect(process).not.toHaveBeenCalled();
    unmount(cmp);
  });

  it('rejects unsupported MIME type with error message', async () => {
    const process = vi.fn();
    const { target, cmp } = render(makeConfig(process));
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const wrong = makeFile('doc.pdf', 'application/pdf', 1024);
    Object.defineProperty(input, 'files', { value: [wrong], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    flushSync();
    await Promise.resolve();
    flushSync();
    const err = target.querySelector('[data-testid="filetool-error"]');
    expect(err).toBeTruthy();
    expect(process).not.toHaveBeenCalled();
    unmount(cmp);
  });

  it('on valid file: calls process with config.quality from slider', async () => {
    const process = vi.fn(async () => new Uint8Array([9, 9, 9]));
    const { target, cmp } = render(makeConfig(process));

    const slider = target.querySelector(
      '[data-testid="filetool-quality"]',
    ) as HTMLInputElement;
    slider.value = '70';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();

    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const file = makeFile('photo.jpg', 'image/jpeg', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    expect(process).toHaveBeenCalledTimes(1);
    const callArgs = process.mock.calls[0];
    expect(callArgs[0]).toBeInstanceOf(Uint8Array);
    expect(callArgs[1]).toEqual({ quality: 70 });
    unmount(cmp);
  });

  it('after success: shows download link with .webp filename', async () => {
    const { target, cmp } = render();
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const file = makeFile('photo.jpg', 'image/jpeg', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    const dl = target.querySelector(
      '[data-testid="filetool-download"]',
    ) as HTMLAnchorElement;
    expect(dl).toBeTruthy();
    expect(dl.getAttribute('download')).toBe('photo.webp');
    expect(dl.getAttribute('href')).toBe('blob:mock-url');
    unmount(cmp);
  });

  it('reset button returns from done state to idle', async () => {
    const { target, cmp } = render();
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const file = makeFile('photo.jpg', 'image/jpeg', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    const reset = target.querySelector(
      '[data-testid="filetool-reset"]',
    ) as HTMLButtonElement;
    reset.click();
    flushSync();

    const dl = target.querySelector('[data-testid="filetool-download"]');
    expect(dl).toBeNull();
    const dropzone = target.querySelector('[data-testid="filetool-dropzone"]');
    expect(dropzone).toBeTruthy();
    unmount(cmp);
  });

  it('result region has aria-live="polite" for screen readers', async () => {
    const { target, cmp } = render();
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const file = makeFile('photo.jpg', 'image/jpeg', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();
    const result = target.querySelector('[data-testid="filetool-result"]');
    expect(result?.getAttribute('aria-live')).toBe('polite');
    unmount(cmp);
  });

  it('on process failure: shows error and does not show download', async () => {
    const process = vi.fn(async () => {
      throw new Error('decode failed');
    });
    const { target, cmp } = render(makeConfig(process));
    const input = target.querySelector(
      '[data-testid="filetool-input"]',
    ) as HTMLInputElement;
    const file = makeFile('bad.png', 'image/png', 2048);
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    const err = target.querySelector('[data-testid="filetool-error"]');
    expect(err).toBeTruthy();
    const dl = target.querySelector('[data-testid="filetool-download"]');
    expect(dl).toBeNull();
    unmount(cmp);
  });
});
