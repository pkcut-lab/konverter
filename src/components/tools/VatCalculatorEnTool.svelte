<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    computeSalesTax,
    US_STATE_RATES,
    UK_VAT_RATES,
    type CalcMode,
  } from '../../lib/tools/en/vat-calculator';
  import { getRegion, subscribeRegion } from '../../lib/i18n/region.svelte';
  import { regionCurrency, type Region } from '../../lib/i18n/region';
  import RegionSelector from './RegionSelector.svelte';

  /**
   * EN region-aware VAT / Sales-Tax Calculator.
   *
   * The shared `RegionSelector` toggles between United States (default —
   * 50-state sales-tax matrix) and United Kingdom (HMRC VAT bands). The
   * calculator below renders region-appropriate inputs, runs the same
   * pure compute, and labels currency from `regionCurrency(region)`.
   */

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  let region = $state<Region>(getRegion());
  $effect(() => {
    const off = subscribeRegion((r) => { region = r; });
    return off;
  });
  const currency = $derived(regionCurrency(region));

  // ── US controls ────────────────────────────────────────────────────────────
  let usStateCode = $state<string>('CA');
  let usUseCustom = $state<boolean>(false);
  let usCustomRateStr = $state<string>('');

  const usStateNote = $derived(US_STATE_RATES.find((s) => s.code === usStateCode)?.note);

  const usRate = $derived.by<number>(() => {
    if (usUseCustom) {
      const n = parseFloat(usCustomRateStr);
      return Number.isFinite(n) && n >= 0 ? n : NaN;
    }
    return US_STATE_RATES.find((s) => s.code === usStateCode)?.rate ?? 0;
  });

  // ── UK controls ────────────────────────────────────────────────────────────
  type UkBand = 'standard' | 'reduced' | 'zero' | 'exempt';
  let ukBand = $state<UkBand>('standard');
  const ukRate = $derived(UK_VAT_RATES.find((b) => b.band === ukBand)?.rate ?? 0);

  // ── Shared input ──────────────────────────────────────────────────────────
  let amountStr = $state<string>('100');
  let mode = $state<CalcMode>('add');

  const activeRate = $derived(region === 'us' ? usRate : ukRate);

  const result = $derived.by(() => {
    const amount = parseFloat(amountStr);
    if (!Number.isFinite(amount) || amount < 0) return null;
    if (!Number.isFinite(activeRate)) return null;
    return computeSalesTax(amount, activeRate, mode);
  });

  function fmtMoney(n: number): string {
    try {
      return new Intl.NumberFormat(region === 'uk' ? 'en-GB' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      return `${currency} ${n.toFixed(2)}`;
    }
  }
</script>

<div class="vat-tool">
  <RegionSelector />

  <div class="vat-tool__panel">
    <div class="vat-tool__row">
      <label class="vat-tool__field">
        <span class="vat-tool__label">Amount</span>
        <input
          type="number"
          inputmode="decimal"
          step="0.01"
          min="0"
          bind:value={amountStr}
          aria-label="Amount in {currency}"
        />
      </label>

      <fieldset class="vat-tool__field vat-tool__mode" role="radiogroup" aria-label="Calculation mode">
        <legend class="vat-tool__label">Mode</legend>
        <label class="vat-tool__mode-pill">
          <input type="radio" name="vat-mode" value="add" bind:group={mode} />
          <span>Add tax to net</span>
        </label>
        <label class="vat-tool__mode-pill">
          <input type="radio" name="vat-mode" value="extract" bind:group={mode} />
          <span>Extract tax from gross</span>
        </label>
      </fieldset>
    </div>

    {#if region === 'us'}
      <div class="vat-tool__row">
        <label class="vat-tool__field">
          <span class="vat-tool__label">State (US)</span>
          <select bind:value={usStateCode} disabled={usUseCustom} aria-label="US state for sales-tax rate">
            {#each US_STATE_RATES as s (s.code)}
              <option value={s.code}>{s.name} — {s.rate.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}%</option>
            {/each}
          </select>
          {#if usStateNote}
            <span class="vat-tool__hint">{usStateNote}</span>
          {/if}
        </label>

        <label class="vat-tool__field vat-tool__custom">
          <span class="vat-tool__label">Custom rate</span>
          <span class="vat-tool__custom-row">
            <input
              type="checkbox"
              bind:checked={usUseCustom}
              aria-label="Use custom sales-tax rate instead of state default"
            />
            <input
              type="number"
              inputmode="decimal"
              step="0.01"
              min="0"
              max="20"
              placeholder="e.g. 8.875 for NYC combined"
              bind:value={usCustomRateStr}
              disabled={!usUseCustom}
              aria-label="Custom rate in percent"
            />
            <span class="vat-tool__pct" aria-hidden="true">%</span>
          </span>
          <span class="vat-tool__hint">
            State rate only — add city/county for combined sales-tax.
          </span>
        </label>
      </div>
    {:else}
      <div class="vat-tool__row">
        <fieldset class="vat-tool__field vat-tool__bands" role="radiogroup" aria-label="UK VAT band">
          <legend class="vat-tool__label">VAT band (UK)</legend>
          {#each UK_VAT_RATES as band (band.band)}
            <label class="vat-tool__band">
              <input type="radio" name="uk-vat-band" value={band.band} bind:group={ukBand} />
              <span class="vat-tool__band-label">{band.label}</span>
              <span class="vat-tool__band-examples">{band.examples}</span>
            </label>
          {/each}
        </fieldset>
      </div>
    {/if}
  </div>

  {#if result}
    <dl class="vat-tool__result" aria-live="polite">
      <div class="vat-tool__result-row">
        <dt>Net amount</dt>
        <dd data-testid="vat-net">{fmtMoney(result.netAmount)}</dd>
      </div>
      <div class="vat-tool__result-row vat-tool__result-row--tax">
        <dt>{region === 'us' ? 'Sales tax' : 'VAT'} ({result.appliedRate.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}%)</dt>
        <dd data-testid="vat-tax">{fmtMoney(result.taxAmount)}</dd>
      </div>
      <div class="vat-tool__result-row vat-tool__result-row--gross">
        <dt>Gross amount</dt>
        <dd data-testid="vat-gross">{fmtMoney(result.grossAmount)}</dd>
      </div>
    </dl>
  {:else}
    <p class="vat-tool__empty">Enter an amount above to see the result.</p>
  {/if}

  <p class="vat-tool__disclaimer">
    {#if region === 'us'}
      Rates shown are state-level only — many U.S. cities and counties add
      local sales tax on top. For exact NYC, LA, Chicago etc. combined
      rates, switch to <em>Custom rate</em> and enter the combined value.
      Rates verified against state revenue-department publications,
      effective 2026.
    {:else}
      Rates published by HMRC, effective 2026. Standard 20%, reduced 5%
      (domestic energy, mobility aids), zero-rated 0% (most food, books,
      children\'s clothing, exports), exempt (insurance, postage stamps,
      health services).
    {/if}
    Calculation runs entirely in your browser — no server, no tracking.
  </p>
</div>

<style>
  .vat-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .vat-tool__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
  }

  .vat-tool__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
  }
  @media (max-width: 40rem) {
    .vat-tool__row {
      grid-template-columns: 1fr;
    }
  }

  .vat-tool__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border: none;
    margin: 0;
    padding: 0;
  }

  .vat-tool__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
    padding: 0;
  }

  .vat-tool__field input[type="number"],
  .vat-tool__field select {
    appearance: none;
    width: 100%;
    padding: var(--space-3);
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-body);
    line-height: 1.4;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .vat-tool__field input[type="number"]:focus-visible,
  .vat-tool__field select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .vat-tool__field input[type="number"]:disabled,
  .vat-tool__field select:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .vat-tool__hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.4;
  }

  .vat-tool__mode {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .vat-tool__mode-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }
  .vat-tool__mode-pill input[type="radio"] {
    accent-color: var(--color-accent);
  }

  .vat-tool__custom-row {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }
  .vat-tool__custom-row input[type="checkbox"] {
    accent-color: var(--color-accent);
  }
  .vat-tool__pct {
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }

  .vat-tool__bands {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    grid-column: 1 / -1;
  }
  .vat-tool__band {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: var(--space-3);
    align-items: baseline;
    cursor: pointer;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .vat-tool__band:hover {
    border-color: var(--color-text-muted);
  }
  .vat-tool__band:has(input:checked) {
    border-color: var(--color-text);
  }
  .vat-tool__band input[type="radio"] {
    grid-row: 1 / 3;
    accent-color: var(--color-accent);
  }
  .vat-tool__band-label {
    font-weight: 600;
  }
  .vat-tool__band-examples {
    grid-column: 2;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .vat-tool__result {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-5);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
  }
  .vat-tool__result-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .vat-tool__result-row:last-child {
    border-bottom: none;
  }
  .vat-tool__result-row dt {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin: 0;
  }
  .vat-tool__result-row dd {
    margin: 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
  }
  .vat-tool__result-row--gross dd {
    font-weight: 600;
    font-size: 1.125rem;
  }

  .vat-tool__empty {
    padding: var(--space-5);
    margin: 0;
    background: var(--color-bg);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text-subtle);
    text-align: center;
    font-size: var(--font-size-small);
  }

  .vat-tool__disclaimer {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .vat-tool__field input,
    .vat-tool__field select,
    .vat-tool__band {
      transition: none;
    }
  }
</style>
