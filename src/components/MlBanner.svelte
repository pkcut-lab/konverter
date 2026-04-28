<script lang="ts">
  /**
   * Mobile-aware ML download banner.
   *
   * Shows the active variant's download size + (optional) variant-switcher
   * buttons + (optional) stall-recovery actions. Single source-of-truth so
   * `FileTool.svelte` and the three Custom-Components (`AudioTranskriptionTool`,
   * `KiTextDetektorTool`, `KiBildDetektorTool`) stay visually consistent.
   *
   * Refined-Minimalism: no emoji, no exclamation marks, mono-tabular sizes,
   * direct numerics. CSS lives next to the markup so visual drift across
   * tools is a one-file edit.
   *
   * Single-variant tools pass `variants` of length 1 → only the size message
   * renders, no switcher buttons. Tools that don't expose retry/fallback
   * leave `onRetry` / `onFallbackToFast` undefined → those buttons hide.
   */
  import { formatVariantSize, type MlVariant, type VariantId } from '../lib/tools/ml-variants';
  import { t } from '../lib/i18n/strings';
  import type { Lang } from '../lib/i18n/lang';

  interface Props {
    lang: Lang;
    variants: MlVariant[];
    selectedVariantId?: VariantId | null;
    onSwitch?: (id: VariantId) => void;
    /** Set true after a StallError; renders the recovery row. */
    showStall?: boolean;
    onRetry?: () => void;
    onFallbackToFast?: () => void;
  }
  let {
    lang,
    variants,
    selectedVariantId = null,
    onSwitch,
    showStall = false,
    onRetry,
    onFallbackToFast,
  }: Props = $props();

  const strings = $derived(t(lang));

  const activeVariant = $derived<MlVariant | undefined>(
    selectedVariantId
      ? variants.find((v) => v.id === selectedVariantId)
      : variants[0],
  );

  const switchableVariants = $derived.by<MlVariant[]>(() => {
    if (!activeVariant) return [];
    return variants.filter((v) => v.id !== activeVariant.id);
  });

  const fastVariant = $derived<MlVariant | undefined>(
    variants.find((v) => v.id === 'fast'),
  );

  function switchLabel(v: MlVariant): string {
    const size = formatVariantSize(v.sizeBytes);
    if (v.id === 'fast') return strings.fileTool.mlBannerSwitchFast.replace('{size}', size);
    if (v.id === 'pro') return strings.fileTool.mlBannerSwitchPro.replace('{size}', size);
    return strings.fileTool.mlBannerSwitchQuality.replace('{size}', size);
  }
</script>

{#if activeVariant}
  <aside class="ml-banner" data-testid="ml-banner" aria-live="polite">
    <p class="ml-banner__msg">
      {strings.fileTool.mlBannerOneTime.replace('{size}', formatVariantSize(activeVariant.sizeBytes))}
    </p>
    {#if onSwitch && switchableVariants.length > 0}
      <div class="ml-banner__actions">
        {#each switchableVariants as v (v.id)}
          <button
            type="button"
            class="ml-banner__switch"
            data-testid="ml-banner-switch-{v.id}"
            onclick={() => onSwitch?.(v.id)}
          >{switchLabel(v)}</button>
        {/each}
      </div>
    {/if}
  </aside>

  {#if showStall}
    <div class="stall-recovery" data-testid="ml-banner-stall">
      <p class="stall-recovery__title">{strings.fileTool.mlStalledTitle}</p>
      <div class="stall-recovery__actions">
        {#if onRetry}
          <button
            type="button"
            class="stall-btn stall-btn--ghost"
            data-testid="ml-banner-stall-retry"
            onclick={onRetry}
          >{strings.fileTool.mlStalledRetry}</button>
        {/if}
        {#if onFallbackToFast && fastVariant && activeVariant.id !== 'fast'}
          <button
            type="button"
            class="stall-btn stall-btn--primary"
            data-testid="ml-banner-stall-fallback"
            onclick={onFallbackToFast}
          >{strings.fileTool.mlStalledFallback}</button>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .ml-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface-sunk);
  }
  .ml-banner__msg {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.5;
  }
  .ml-banner__actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  .ml-banner__switch {
    appearance: none;
    background: transparent;
    border: 0;
    padding: 0;
    font: inherit;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    letter-spacing: 0.01em;
  }
  .ml-banner__switch:hover {
    color: var(--color-text);
  }
  .ml-banner__switch:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
    border-radius: 2px;
  }

  .stall-recovery {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) 0 0;
  }
  .stall-recovery__title {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .stall-recovery__actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .stall-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 2.75rem;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--r-sm);
    font: inherit;
    font-size: var(--font-size-small);
    font-weight: 450;
    letter-spacing: -0.005em;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      background var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out);
  }
  .stall-btn--ghost {
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }
  .stall-btn--ghost:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .stall-btn--primary {
    background: var(--color-text);
    color: var(--color-bg);
    border: 1px solid var(--color-text);
    padding: var(--space-2) var(--space-5);
  }
  .stall-btn--primary:hover {
    background: var(--color-text-muted);
    border-color: var(--color-text-muted);
  }
  .stall-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
