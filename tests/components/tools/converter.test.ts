import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Converter from '../../../src/components/tools/Converter.svelte';
import { meterZuFuss } from '../../../src/lib/tools/meter-zu-fuss';

function render() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const cmp = mount(Converter, { target, props: { config: meterZuFuss } });
  flushSync();
  return { target, cmp };
}

describe('Converter.svelte — meter-zu-fuss', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders labels "Meter" (from) and "Fuß" (to) by default', () => {
    const { target, cmp } = render();
    expect(target.textContent).toContain('Meter');
    expect(target.textContent).toContain('Fuß');
    unmount(cmp);
  });

  it('initial input is first example (1) and output shows "3,2808"', () => {
    const { target, cmp } = render();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input.value).toBe('1');
    const output = target.querySelector('[data-testid="converter-output"]');
    // decimals: 4 + useGrouping: false → 3.28084 rounded to 4 FD → "3,2808"
    expect(output?.textContent?.trim()).toBe('3,2808');
    unmount(cmp);
  });

  it('typing "2" into input updates output to "6,5617"', () => {
    const { target, cmp } = render();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    input.value = '2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    const output = target.querySelector('[data-testid="converter-output"]');
    // 2 * 3.28084 = 6.56168 → rounded to 4 FD → "6,5617"
    expect(output?.textContent?.trim()).toBe('6,5617');
    unmount(cmp);
  });

  it('swap button flips labels to Fuß (from) and Meter (to)', () => {
    const { target, cmp } = render();
    const swap = target.querySelector('[data-testid="converter-swap"]') as HTMLButtonElement;
    swap.click();
    flushSync();
    const labels = target.querySelectorAll('[data-testid^="converter-label-"]');
    expect(labels[0]?.textContent).toContain('Fuß');
    expect(labels[1]?.textContent).toContain('Meter');
    unmount(cmp);
  });

  it('swap + input=1 yields inverse value "0,3048"', () => {
    const { target, cmp } = render();
    (target.querySelector('[data-testid="converter-swap"]') as HTMLButtonElement).click();
    flushSync();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    const output = target.querySelector('[data-testid="converter-output"]');
    expect(output?.textContent?.trim()).toBe('0,3048');
    unmount(cmp);
  });

  it('quick-value buttons [1,10,100,1000] set input and output', () => {
    const { target, cmp } = render();
    const btn100 = Array.from(target.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === '100',
    ) as HTMLButtonElement;
    btn100.click();
    flushSync();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input.value).toBe('100');
    const output = target.querySelector('[data-testid="converter-output"]');
    expect(output?.textContent?.trim()).toBe('328,084');
    unmount(cmp);
  });

  it('copy button writes output to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const { target, cmp } = render();
    const copy = target.querySelector('[data-testid="converter-copy"]') as HTMLButtonElement;
    copy.click();
    flushSync();
    expect(writeText).toHaveBeenCalledWith('3,2808');
    unmount(cmp);
  });

  it('output aria-live="polite" for screen readers', () => {
    const { target, cmp } = render();
    const output = target.querySelector('[data-testid="converter-output"]');
    expect(output?.getAttribute('aria-live')).toBe('polite');
    unmount(cmp);
  });
});
