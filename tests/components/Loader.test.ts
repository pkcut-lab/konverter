import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Loader from '../../src/components/Loader.svelte';

describe('Loader', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
  });

  it('spinner variant renders SVG arc with role=status', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'spinner' } });
    flushSync();
    const el = host.querySelector('[data-testid="loader-spinner"]');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('role')).toBe('status');
    expect(host.querySelector('svg')).not.toBeNull();
  });

  it('spinner variant uses ariaLabel prop', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'spinner', ariaLabel: 'Verarbeitet' } });
    flushSync();
    expect(host.querySelector('[data-testid="loader-spinner"]')?.getAttribute('aria-label')).toBe('Verarbeitet');
  });

  it('progress variant renders progressbar with aria-valuenow', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 0.42 } });
    flushSync();
    const el = host.querySelector('[data-testid="loader-progress"]');
    expect(el?.getAttribute('role')).toBe('progressbar');
    expect(el?.getAttribute('aria-valuenow')).toBe('42');
    expect(el?.getAttribute('aria-valuemin')).toBe('0');
    expect(el?.getAttribute('aria-valuemax')).toBe('100');
  });

  it('progress variant clamps value to [0,1]', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 1.5 } });
    flushSync();
    expect(host.querySelector('[data-testid="loader-progress"]')?.getAttribute('aria-valuenow')).toBe('100');
    unmount(cmp);
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: -0.5 } });
    flushSync();
    expect(host.querySelector('[data-testid="loader-progress"]')?.getAttribute('aria-valuenow')).toBe('0');
  });

  it('progress variant renders label with NBSP', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 0.42, label: '46\u00A0/\u00A0110\u00A0MB' } });
    flushSync();
    const labelEl = host.querySelector('[data-testid="loader-progress-label"]');
    expect(labelEl?.textContent).toContain('\u00A0');
    expect(labelEl?.textContent).toContain('46');
  });

  it('progress variant fill width matches value', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 0.42 } });
    flushSync();
    const fill = host.querySelector('[data-testid="loader-progress-fill"]') as HTMLElement | null;
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe('42%');
  });
});
