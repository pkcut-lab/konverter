import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import ThemeToggle from '../../src/components/ThemeToggle.svelte';

function setupDom() {
  document.documentElement.dataset.theme = 'light';
  localStorage.clear();
}

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
    dispatchEvent: () => true,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    fireChange(newMatches: boolean) {
      (mql as any).matches = newMatches;
      listeners.forEach((cb) =>
        cb({ matches: newMatches } as MediaQueryListEvent),
      );
    },
  };
}

describe('ThemeToggle', () => {
  beforeEach(setupDom);

  it('renders three buttons labelled Auto / Hell / Dunkel', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const labels = Array.from(target.querySelectorAll('button')).map(
      (b) => b.textContent?.trim(),
    );
    expect(labels).toEqual(['Auto', 'Hell', 'Dunkel']);
    unmount(cmp);
  });

  it('click on Hell stores theme=light and sets dataset', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const hell = target.querySelectorAll('button')[1] as HTMLButtonElement;
    hell.click();
    flushSync();
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount(cmp);
  });

  it('click on Dunkel stores theme=dark and sets dataset', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const dunkel = target.querySelectorAll('button')[2] as HTMLButtonElement;
    dunkel.click();
    flushSync();
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    unmount(cmp);
  });

  it('click on Auto removes theme key and mirrors system preference', () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const auto = target.querySelectorAll('button')[0] as HTMLButtonElement;
    auto.click();
    flushSync();
    expect(localStorage.getItem('theme')).toBeNull();
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount(cmp);
  });

  it('in auto mode, responds to system-scheme change', () => {
    const mm = mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    mm.fireChange(true);
    flushSync();
    expect(document.documentElement.dataset.theme).toBe('dark');
    unmount(cmp);
  });

  it('aria-pressed reflects current mode after click', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const buttons = target.querySelectorAll('button');
    const auto = buttons[0];
    const hell = buttons[1] as HTMLButtonElement;
    const dunkel = buttons[2];
    hell.click();
    flushSync();
    expect(auto?.getAttribute('aria-pressed')).toBe('false');
    expect(hell.getAttribute('aria-pressed')).toBe('true');
    expect(dunkel?.getAttribute('aria-pressed')).toBe('false');
    unmount(cmp);
  });
});
