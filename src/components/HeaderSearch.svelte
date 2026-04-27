<script lang="ts">
  import { t } from '../lib/i18n/strings';
  import type { Lang } from '../lib/i18n/lang';

  interface Props {
    lang: Lang;
    placeholder: string;
  }

  const { lang, placeholder }: Props = $props();
  const strings = $derived(t(lang));

  let host: HTMLDivElement;
  let ready = $state(false);
  let unavailable = $state(false);
  let initialized = false;

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
      const pf = t(lang);
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
        translations: {
          placeholder,
          clear_search: pf.search.pagefind.clearSearch,
          load_more: pf.search.pagefind.loadMore,
          search_label: pf.search.pagefind.searchLabel,
          filters_label: pf.search.pagefind.filtersLabel,
          zero_results: pf.search.pagefind.zeroResults,
          many_results: pf.search.pagefind.manyResults,
          one_result: pf.search.pagefind.oneResult,
          alt_search: pf.search.pagefind.altSearch,
          search_suggestion: pf.search.pagefind.searchSuggestion,
          searching: pf.search.pagefind.searching,
        },
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

<div class="search-host" role="search" aria-label={strings.search.hostAria}>
  <div bind:this={host} class:is-ready={ready}></div>

  {#if unavailable}
    <input
      type="search"
      class="search-fallback"
      placeholder={strings.search.fallbackPlaceholder}
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
