<script lang="ts">
  import { getRegion, setRegionPersisted, subscribeRegion } from '../../lib/i18n/region.svelte';
  import { REGIONS, regionLabel, type Region } from '../../lib/i18n/region';

  /**
   * Visual region toggle for the 3 region-adaptive calculator tools
   * (vat-calculator, gross-net-calculator, interest-calculator on EN
   * pages). Renders as a refined-minimalism radio-pair: graphite border,
   * orange-accent only on focus + active. Emits the choice through the
   * shared region store, so every region-aware island reacts together.
   */

  let current = $state<Region>(getRegion());

  $effect(() => {
    const off = subscribeRegion((r) => {
      current = r;
    });
    return off;
  });

  function pick(r: Region) {
    if (current === r) return;
    current = r;
    setRegionPersisted(r);
  }

  function onKey(e: KeyboardEvent, r: Region) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = REGIONS.indexOf(r);
      const next = REGIONS[(idx + (e.key === 'ArrowRight' ? 1 : REGIONS.length - 1)) % REGIONS.length]!;
      pick(next);
      const target = document.querySelector(
        `[data-region-pill="${next}"]`,
      ) as HTMLButtonElement | null;
      target?.focus();
    }
  }
</script>

<fieldset class="region" role="radiogroup" aria-label="Region for tax calculations">
  <legend class="region__legend">Region</legend>
  <div class="region__pills">
    {#each REGIONS as r (r)}
      <button
        type="button"
        role="radio"
        aria-checked={current === r}
        data-region-pill={r}
        class="region__pill"
        class:is-active={current === r}
        tabindex={current === r ? 0 : -1}
        onclick={() => pick(r)}
        onkeydown={(e) => onKey(e, r)}
      >
        <span class="region__flag" aria-hidden="true">
          {#if r === 'us'}
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="18" height="13" rx="1.5" fill="#B22234"/>
              <rect y="1" width="18" height="1" fill="#FFFFFF"/>
              <rect y="3" width="18" height="1" fill="#FFFFFF"/>
              <rect y="5" width="18" height="1" fill="#FFFFFF"/>
              <rect y="7" width="18" height="1" fill="#FFFFFF"/>
              <rect y="9" width="18" height="1" fill="#FFFFFF"/>
              <rect y="11" width="18" height="1" fill="#FFFFFF"/>
              <rect width="8" height="7" fill="#3C3B6E"/>
            </svg>
          {:else}
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="18" height="13" rx="1.5" fill="#012169"/>
              <path d="M0 0L18 13M18 0L0 13" stroke="#FFFFFF" stroke-width="2"/>
              <path d="M0 0L18 13M18 0L0 13" stroke="#C8102E" stroke-width="1"/>
              <path d="M9 0V13M0 6.5H18" stroke="#FFFFFF" stroke-width="3"/>
              <path d="M9 0V13M0 6.5H18" stroke="#C8102E" stroke-width="1.5"/>
            </svg>
          {/if}
        </span>
        <span class="region__label">{regionLabel(r)}</span>
      </button>
    {/each}
  </div>
</fieldset>

<style>
  .region {
    border: none;
    margin: 0 0 var(--space-4);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .region__legend {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
    padding: 0;
  }

  .region__pills {
    display: inline-flex;
    gap: var(--space-2);
    align-items: stretch;
  }

  .region__pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-small);
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }

  .region__pill:hover {
    border-color: var(--color-text-muted);
    color: var(--color-text);
  }

  .region__pill:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .region__pill.is-active {
    background: var(--color-text);
    color: var(--color-surface);
    border-color: var(--color-text);
  }

  .region__flag {
    display: inline-flex;
    border-radius: 2px;
    overflow: hidden;
    line-height: 0;
  }

  .region__label {
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .region__pill { transition: none; }
  }
</style>
