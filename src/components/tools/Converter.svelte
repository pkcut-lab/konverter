<script lang="ts">
  import type { ConverterConfig } from '../../lib/tools/schemas';
  import { computeConversion, type Direction } from '../../lib/tools/compute';

  interface Props {
    config: ConverterConfig;
  }
  type CopyState = 'idle' | 'copied';

  let { config }: Props = $props();

  let inputValue = $state<number>(config.examples[0] ?? 1);
  let direction = $state<Direction>('forward');
  let copyState = $state<CopyState>('idle');

  const fromLabel = $derived(
    direction === 'forward' ? config.units.from.label : config.units.to.label,
  );
  const toLabel = $derived(
    direction === 'forward' ? config.units.to.label : config.units.from.label,
  );
  const fromUnit = $derived(
    direction === 'forward' ? config.units.from.id : config.units.to.id,
  );
  const toUnit = $derived(
    direction === 'forward' ? config.units.to.id : config.units.from.id,
  );

  function formatDecimal(n: number, decimals: number): string {
    if (!Number.isFinite(n)) return '–';
    return n.toLocaleString('de-DE', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
      useGrouping: false,
    });
  }

  const outputValue = $derived(computeConversion(config.formula, inputValue, direction));
  const outputFormatted = $derived(formatDecimal(outputValue, config.decimals));

  function onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const v = target.valueAsNumber;
    if (Number.isFinite(v) && v >= 0) inputValue = v;
  }

  function onSwap() {
    direction = direction === 'forward' ? 'inverse' : 'forward';
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(outputFormatted);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      // Clipboard rejection (permission denied) — fail silent
    }
  }

  function onQuickValue(n: number) {
    inputValue = n;
  }
</script>

<div class="converter">
  <div class="panel">
    <label class="panel__label" for="converter-input" data-testid="converter-label-from">
      <span class="panel__label-text">{fromLabel}</span>
      <span class="panel__label-unit" translate="no">({fromUnit})</span>
    </label>
    <input
      class="panel__field panel__field--input"
      id="converter-input"
      name="converter-input"
      type="number"
      inputmode="decimal"
      step="any"
      min="0"
      autocomplete="off"
      value={inputValue}
      oninput={onInput}
    />
  </div>

  <div class="divider">
    <button
      type="button"
      class="swap"
      data-testid="converter-swap"
      onclick={onSwap}
      aria-label="Richtung tauschen"
      aria-pressed={direction === 'inverse'}
    >
      <svg class="swap__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M7 4v14M7 18l-3-3M7 18l3-3M17 20V6M17 6l-3 3M17 6l3 3"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="swap__text">Tauschen</span>
    </button>
  </div>

  <div class="panel">
    <span class="panel__label" data-testid="converter-label-to">
      <span class="panel__label-text">{toLabel}</span>
      <span class="panel__label-unit" translate="no">({toUnit})</span>
    </span>
    <div class="panel__output-row">
      <output
        class="panel__field panel__field--output"
        data-testid="converter-output"
        aria-live="polite">{outputFormatted}</output>
      <button
        type="button"
        class="copy"
        class:copy--copied={copyState === 'copied'}
        data-testid="converter-copy"
        onclick={onCopy}
        aria-label="Ergebnis kopieren"
      >
        <svg class="copy__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect
            x="9"
            y="9"
            width="11"
            height="11"
            rx="2"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
          />
          <path
            d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="copy__text">{copyState === 'copied' ? 'Kopiert' : 'Kopieren'}</span>
      </button>
    </div>
  </div>
</div>

{#if config.examples.length > 0}
  <div class="quick">
    <span class="quick__label">Häufige Werte</span>
    <div class="quick__list">
      {#each config.examples as ex (ex)}
        <button
          type="button"
          class="chip"
          class:chip--active={ex === inputValue}
          onclick={() => onQuickValue(ex)}>{ex}</button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .converter {
    display: flex;
    flex-direction: column;
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-sm);
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4) 0;
  }

  .panel__label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.01em;
  }
  .panel__label-unit {
    font-family: var(--font-family-mono);
    color: var(--color-text-subtle);
    font-weight: 400;
  }

  .panel__field {
    width: 100%;
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-h1);
    line-height: var(--font-lh-h1);
    font-variant-numeric: tabular-nums;
    font-weight: 400;
  }

  .panel__field--input {
    padding: 0 0 var(--space-2) 0;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
    appearance: textfield;
    -moz-appearance: textfield;
    touch-action: manipulation;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .panel__field--input::-webkit-outer-spin-button,
  .panel__field--input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .panel__field--input:hover {
    border-bottom-color: var(--color-text-subtle);
  }
  .panel__field--input:focus {
    outline: none;
    border-bottom-color: var(--color-accent);
  }
  .panel__field--input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-radius: var(--r-sm);
    border-bottom-color: transparent;
  }

  .panel__field--output {
    display: block;
    flex: 1 1 auto;
    min-width: 0;
    padding: 0;
  }

  .panel__output-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .divider {
    position: relative;
    height: 1px;
    background: var(--color-border);
    margin: var(--space-4) 0;
  }

  .swap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    background: var(--color-bg);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font: inherit;
    font-size: var(--font-size-small);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .swap:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .swap:active {
    transform: translate(-50%, -50%) scale(0.98);
  }
  .swap:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .swap__icon {
    width: 14px;
    height: 14px;
    transition: transform var(--dur-med) var(--ease-out);
  }
  .swap[aria-pressed='true'] .swap__icon {
    transform: rotate(180deg);
  }

  .copy {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font: inherit;
    font-size: var(--font-size-small);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .copy:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .copy:active {
    transform: scale(0.98);
  }
  .copy:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .copy--copied,
  .copy--copied:hover {
    color: var(--color-success);
    border-color: var(--color-success);
  }

  .copy__icon {
    width: 14px;
    height: 14px;
  }

  .quick {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .quick__label {
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.01em;
  }

  .quick__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    padding: var(--space-1) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font: inherit;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  .chip:hover {
    color: var(--color-text);
    background: var(--color-surface);
  }
  .chip:active {
    transform: scale(0.98);
  }
  .chip:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .chip--active {
    color: var(--color-text);
    border-color: var(--color-accent);
  }

  @media (max-width: 40rem) {
    .converter {
      padding: var(--space-6);
    }
    .panel__field {
      font-size: 1.875rem;
    }
  }
</style>
