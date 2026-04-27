<script lang="ts">
  import { t } from '../lib/i18n/strings';
  import type { Lang } from '../lib/i18n/lang';

  type Mode = 'auto' | 'light' | 'dark';

  interface Props {
    lang: Lang;
  }
  const { lang }: Props = $props();
  const strings = $derived(t(lang));

  let mql: MediaQueryList | undefined;

  function readInitialMode(): Mode {
    if (typeof localStorage === 'undefined') return 'auto';
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  }

  let mode = $state<Mode>(readInitialMode());

  function systemTheme(): 'dark' | 'light' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(next: Mode) {
    mode = next;
    if (next === 'auto') {
      localStorage.removeItem('theme');
      document.documentElement.dataset.theme = systemTheme();
    } else {
      localStorage.setItem('theme', next);
      document.documentElement.dataset.theme = next;
    }
  }

  $effect(() => {
    mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (mode === 'auto') {
        document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
      }
    };
    mql.addEventListener('change', onChange);
    return () => {
      mql?.removeEventListener('change', onChange);
    };
  });
</script>

<div
  class="theme-toggle"
  role="group"
  aria-label={strings.themeToggle.groupLabel}
>
  <button
    type="button"
    aria-pressed={mode === 'auto'}
    onclick={() => apply('auto')}
  >{strings.themeToggle.auto}</button>
  <button
    type="button"
    aria-pressed={mode === 'light'}
    onclick={() => apply('light')}
  >{strings.themeToggle.light}</button>
  <button
    type="button"
    aria-pressed={mode === 'dark'}
    onclick={() => apply('dark')}
  >{strings.themeToggle.dark}</button>
</div>

<style>
  .theme-toggle {
    display: inline-flex;
    gap: var(--space-1);
    padding: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }
  .theme-toggle button {
    font: inherit;
    font-size: var(--font-size-small);
    padding: var(--space-1) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 0;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .theme-toggle button:hover {
    color: var(--color-text);
  }
  .theme-toggle button[aria-pressed='true'] {
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
  }
  .theme-toggle button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
