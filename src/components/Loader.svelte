<script lang="ts">
  interface Props {
    variant: 'spinner' | 'progress';
    value?: number;
    label?: string;
    ariaLabel?: string;
  }

  let { variant, value = 0, label, ariaLabel = 'Lädt' }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(1, value)));
  const pct = $derived(Math.round(clamped * 100));
</script>

{#if variant === 'spinner'}
  <span
    class="spinner"
    role="status"
    aria-label={ariaLabel}
    data-testid="loader-spinner"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.2" />
      <path d="M12 2 a 10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </span>
{:else}
  <span class="progress">
    <span
      class="progress__track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={ariaLabel}
      data-testid="loader-progress"
    >
      <span
        class="progress__fill"
        style="width: {pct}%"
        data-testid="loader-progress-fill"
      ></span>
    </span>
    {#if label}
      <span class="progress__label" data-testid="loader-progress-label">{label}</span>
    {/if}
  </span>
{/if}

<style>
  .spinner {
    display: inline-flex;
    width: 24px;
    height: 24px;
    color: var(--color-text-subtle);
  }
  .spinner svg {
    width: 100%;
    height: 100%;
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
  }
  .progress__track {
    flex: 1 1 auto;
    display: block;
    height: 1px;
    background: var(--color-border);
    border-radius: var(--r-sm);
    overflow: hidden;
  }
  .progress__fill {
    display: block;
    height: 100%;
    background: var(--color-text);
    transition: width var(--dur-med) var(--ease-out);
  }
  .progress__label {
    flex: 0 0 auto;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner svg {
      animation-duration: 0s;
    }
    .progress__fill {
      transition: none;
    }
  }
</style>
