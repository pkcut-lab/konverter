<script lang="ts">
  import type { ConverterConfig } from '../../lib/tools/schemas';
  import { computeConversion, type Direction } from '../../lib/tools/compute';

  let { config } = $props<{ config: ConverterConfig }>();

  let inputValue = $state(config.examples[0] ?? 1);
  let direction = $state('forward');
  let copyState = $state('idle');

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
  function formatDecimal(n, decimals) {
    if (!Number.isFinite(n)) return '–';
    return n.toLocaleString('de-DE', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
      useGrouping: false,
    });
  }

  const outputValue = $derived(
    computeConversion(config.formula, inputValue, direction as Direction),
  );
  const outputFormatted = $derived(formatDecimal(outputValue, config.decimals));

  function onInput(e) {
    const v = e.target.valueAsNumber;
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

  function onQuickValue(n) {
    inputValue = n;
  }
</script>

<div class="converter">
  <div class="row">
    <label for="converter-input" data-testid="converter-label-from">
      {fromLabel} ({fromUnit})
    </label>
    <input
      id="converter-input"
      type="number"
      inputmode="decimal"
      step="any"
      min="0"
      value={inputValue}
      oninput={onInput}
    />
  </div>

  <button
    type="button"
    class="swap"
    data-testid="converter-swap"
    onclick={onSwap}
    aria-label="Richtung tauschen"
    aria-pressed={direction === 'inverse'}
  >
    ⇅ Tauschen
  </button>

  <div class="row">
    <span data-testid="converter-label-to">{toLabel} ({toUnit})</span>
    <output
      data-testid="converter-output"
      aria-live="polite"
    >{outputFormatted}</output>
    <button
      type="button"
      data-testid="converter-copy"
      onclick={onCopy}
      aria-label="Ergebnis kopieren"
    >
      {copyState === 'copied' ? '✓ Kopiert' : '📋 Kopieren'}
    </button>
  </div>

  {#if config.examples.length > 0}
    <div class="quick">
      <span class="quick-label">Häufige Werte:</span>
      {#each config.examples as ex (ex)}
        <button
          type="button"
          onclick={() => onQuickValue(ex)}
        >{ex}</button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .converter {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .row label,
  .row span {
    font-weight: 500;
    color: var(--color-text);
    min-width: 8ch;
  }
  .row input {
    flex: 1 1 auto;
    padding: var(--space-2) var(--space-3);
    font: inherit;
    font-variant-numeric: tabular-nums;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    color: var(--color-text);
  }
  .row input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .row output {
    flex: 1 1 auto;
    padding: var(--space-2) var(--space-3);
    font-variant-numeric: tabular-nums;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text);
  }
  .swap {
    align-self: center;
    padding: var(--space-2) var(--space-4);
    font: inherit;
    font-size: var(--font-size-small);
    background: var(--color-bg);
    color: var(--color-accent);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .swap:hover {
    background: var(--color-surface);
  }
  .swap:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  button[data-testid='converter-copy'] {
    padding: var(--space-2) var(--space-3);
    font: inherit;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    cursor: pointer;
  }
  button[data-testid='converter-copy']:hover {
    color: var(--color-text);
  }
  .quick {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .quick-label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .quick button {
    padding: var(--space-1) var(--space-3);
    font: inherit;
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
  }
  .quick button:hover {
    background: var(--color-surface);
  }
</style>
