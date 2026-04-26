<script lang="ts">
  interface Props {
    lang: string;
    placeholder: string;
  }

  const { lang, placeholder }: Props = $props();

  let host: HTMLDivElement;
  let ready = $state(false);
  let unavailable = $state(false);
  let initialized = false;

  const translations: Record<string, Record<string, string>> = {
    de: {
      placeholder,
      clear_search: 'Zurücksetzen',
      load_more: 'Mehr laden',
      search_label: 'Tools durchsuchen',
      filters_label: 'Filter',
      zero_results: 'Nichts gefunden zu [SEARCH_TERM]',
      many_results: '[COUNT] Ergebnisse zu [SEARCH_TERM]',
      one_result: '[COUNT] Ergebnis zu [SEARCH_TERM]',
      alt_search: 'Nichts gefunden zu [SEARCH_TERM] — [DISPLAY_QUERY] anzeigen',
      search_suggestion: 'Nichts gefunden zu [SEARCH_TERM] — andere Suche: [DISPLAY_QUERY]',
      searching: 'Suche [SEARCH_TERM]…',
    },
    en: {
      placeholder,
      clear_search: 'Clear',
      load_more: 'Load more',
      search_label: 'Search tools',
      filters_label: 'Filters',
      zero_results: 'No results for [SEARCH_TERM]',
      many_results: '[COUNT] results for [SEARCH_TERM]',
      one_result: '[COUNT] result for [SEARCH_TERM]',
      alt_search: 'No results for [SEARCH_TERM] — showing [DISPLAY_QUERY]',
      search_suggestion: 'No results for [SEARCH_TERM] — try [DISPLAY_QUERY]',
      searching: 'Searching [SEARCH_TERM]…',
    },
  };

  async function initPagefind() {
    if (initialized || !host) return;
    initialized = true;
    try {
      // The /pagefind/ bundle is emitted by the `pagefind --site dist`
      // build step. In `astro dev` it doesn't exist, so the dynamic
      // import fails and we render the disabled fallback.
      if (!document.querySelector('link[data-pagefind-ui]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/pagefind/pagefind-ui.css';
        link.dataset.pagefindUi = '';
        document.head.appendChild(link);
      }
      const bundleUrl = '/pagefind/pagefind-ui.js';
      const mod = await import(/* @vite-ignore */ bundleUrl);
      new mod.PagefindUI({
        element: host,
        bundlePath: '/pagefind/',
        showImages: false,
        showSubResults: false,
        pageSize: 8,
        resetStyles: false,
        autofocus: false,
        translations: translations[lang] ?? translations.en,
      });
      ready = true;
    } catch {
      initialized = false;
      unavailable = true;
    }
  }

  $effect(() => {
    if (!host) return;
    // Load pagefind only on first user interaction to avoid blocking
    // the main thread with WASM init on page load (saves ~7 s TBT on
    // the /werkzeuge page which has a large pagefind index).
    const container = host.closest('.search-host') as HTMLElement | null;
    const target = container ?? host;
    const handler = () => initPagefind();
    target.addEventListener('focusin', handler, { once: true });
    target.addEventListener('pointerdown', handler, { once: true });
    return () => {
      target.removeEventListener('focusin', handler);
      target.removeEventListener('pointerdown', handler);
    };
  });
</script>

<div class="search-host" role="search" aria-label="Tool-Suche">
  <div bind:this={host} class:is-ready={ready}></div>

  {#if unavailable}
    <input
      type="search"
      class="search-fallback"
      placeholder="{placeholder} (nur im Produktions-Build)"
      disabled
      aria-hidden="true"
    />
  {/if}
</div>

<style>
  .search-host {
    width: 100%;
  }
  .search-fallback {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text-muted);
    font: inherit;
    font-size: var(--font-size-small);
  }
</style>
