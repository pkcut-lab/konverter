<script lang="ts">
  type Mode = 'auto' | 'light' | 'dark';

  let mql;

  function readInitialMode() {
    if (typeof localStorage === 'undefined') return 'auto';
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  }

  let mode = $state(readInitialMode());

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function apply(next) {
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
    const onChange = (e) => {
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
  aria-label="Farbschema auswählen"
>
  <button
    type="button"
    aria-pressed={mode === 'auto'}
    onclick={() => apply('auto')}
  >Auto</button>
  <button
    type="button"
    aria-pressed={mode === 'light'}
    onclick={() => apply('light')}
  >Hell</button>
  <button
    type="button"
    aria-pressed={mode === 'dark'}
    onclick={() => apply('dark')}
  >Dunkel</button>
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
