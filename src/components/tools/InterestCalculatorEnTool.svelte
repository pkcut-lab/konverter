<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    computeInterest,
    type InterestKind,
    type CompoundFrequency,
  } from '../../lib/tools/en/interest-calculator';
  import { getRegion, subscribeRegion } from '../../lib/i18n/region.svelte';
  import { regionCurrency, type Region } from '../../lib/i18n/region';
  import RegionSelector from './RegionSelector.svelte';

  /**
   * EN region-aware Interest Calculator.
   * US: simple vs compound + APR-aware presets, federal-income-tax-on-
   *     interest using user's marginal-rate dropdown (10/12/22/24/32/35/37%).
   * UK: simple vs compound + ISA-tax-free toggle (when on, taxRate = 0%);
   *     non-ISA falls back to a band picker (basic 20% / higher 40% /
   *     additional 45%).
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

  // ── Common inputs ─────────────────────────────────────────────────────────
  let principalStr = $state<string>('10000');
  let rateStr = $state<string>('5');
  let yearsStr = $state<string>('10');
  let kind = $state<InterestKind>('compound');
  let freq = $state<CompoundFrequency>('monthly');

  // ── US tax controls ───────────────────────────────────────────────────────
  let usMarginalBracket = $state<number>(22); // typical middle-class bracket

  // ── UK tax controls ───────────────────────────────────────────────────────
  let ukIsa = $state<boolean>(true);
  let ukBand = $state<number>(20); // basic-rate default

  const taxRate = $derived(
    region === 'us'
      ? usMarginalBracket
      : ukIsa
        ? 0
        : ukBand,
  );

  const result = $derived.by(() => {
    const principal = parseFloat(principalStr);
    const annualRatePct = parseFloat(rateStr);
    const years = parseFloat(yearsStr);
    if (!Number.isFinite(principal) || principal < 0) return null;
    if (!Number.isFinite(annualRatePct)) return null;
    if (!Number.isFinite(years) || years < 0) return null;
    return computeInterest({
      principal,
      annualRatePct,
      years,
      kind,
      compoundFrequency: freq,
      taxRatePct: taxRate,
    });
  });

  function fmtMoney(n: number, decimals = 2): string {
    try {
      return new Intl.NumberFormat(region === 'uk' ? 'en-GB' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n);
    } catch {
      return `${currency} ${n.toFixed(decimals)}`;
    }
  }

  function fmtPct(n: number, digits = 2): string {
    return `${n.toFixed(digits)}%`;
  }
</script>

<div class="i-tool">
  <RegionSelector />

  <div class="i-tool__panel">
    <div class="i-tool__row">
      <label class="i-tool__field">
        <span class="i-tool__label">Principal ({currency})</span>
        <input type="number" inputmode="decimal" step="100" min="0"
          bind:value={principalStr}
          aria-label="Principal amount in {currency}" />
      </label>

      <label class="i-tool__field">
        <span class="i-tool__label">Annual rate (%)</span>
        <input type="number" inputmode="decimal" step="0.05" min="0" max="100"
          bind:value={rateStr}
          aria-label="Annual interest rate in percent" />
      </label>

      <label class="i-tool__field">
        <span class="i-tool__label">Term (years)</span>
        <input type="number" inputmode="decimal" step="1" min="0" max="100"
          bind:value={yearsStr}
          aria-label="Term in years" />
      </label>
    </div>

    <div class="i-tool__row">
      <fieldset class="i-tool__field" role="radiogroup" aria-label="Interest kind">
        <legend class="i-tool__label">Interest kind</legend>
        <label class="i-tool__pill">
          <input type="radio" name="i-kind" value="simple" bind:group={kind} />
          <span>Simple (I = P × r × t)</span>
        </label>
        <label class="i-tool__pill">
          <input type="radio" name="i-kind" value="compound" bind:group={kind} />
          <span>Compound</span>
        </label>
      </fieldset>

      {#if kind === 'compound'}
        <label class="i-tool__field">
          <span class="i-tool__label">Compounding frequency</span>
          <select bind:value={freq} aria-label="Compounding frequency">
            <option value="annually">Annually (1×/year)</option>
            <option value="semiannually">Semiannually (2×/year)</option>
            <option value="quarterly">Quarterly (4×/year)</option>
            <option value="monthly">Monthly (12×/year)</option>
            <option value="daily">Daily (365×/year)</option>
          </select>
        </label>
      {:else}
        <div class="i-tool__field">
          <span class="i-tool__label">Compounding frequency</span>
          <p class="i-tool__hint">Not applicable for simple interest.</p>
        </div>
      {/if}
    </div>

    {#if region === 'us'}
      <label class="i-tool__field">
        <span class="i-tool__label">Federal marginal tax bracket on interest income</span>
        <select bind:value={usMarginalBracket} aria-label="Federal marginal tax bracket">
          <option value={0}>0% (tax-deferred / Roth IRA / 401(k))</option>
          <option value={10}>10% (lowest bracket)</option>
          <option value={12}>12%</option>
          <option value={22}>22% (typical middle-class)</option>
          <option value={24}>24%</option>
          <option value={32}>32%</option>
          <option value={35}>35%</option>
          <option value={37}>37% (top bracket)</option>
        </select>
        <span class="i-tool__hint">
          Interest from a regular bank/brokerage account is taxed at your
          ordinary federal income-tax rate. Roth and tax-deferred accounts
          → 0%.
        </span>
      </label>
    {:else}
      <fieldset class="i-tool__field" role="radiogroup" aria-label="UK tax wrapper">
        <legend class="i-tool__label">UK tax treatment</legend>
        <label class="i-tool__pill">
          <input type="checkbox" bind:checked={ukIsa} />
          <span>Inside an ISA (tax-free)</span>
        </label>
        {#if !ukIsa}
          <label class="i-tool__pill i-tool__pill--narrow">
            <span class="i-tool__sublabel">Income-tax band:</span>
            <select bind:value={ukBand} aria-label="UK income-tax band">
              <option value={0}>0% (Personal Savings Allowance covers it)</option>
              <option value={20}>20% (basic rate)</option>
              <option value={40}>40% (higher rate)</option>
              <option value={45}>45% (additional rate)</option>
            </select>
          </label>
        {/if}
        <span class="i-tool__hint">
          Cash ISA / Stocks &amp; Shares ISA → tax-free. Outside an ISA, the
          first £1,000 of interest is covered by the Personal Savings
          Allowance for basic-rate taxpayers (£500 for higher-rate, £0 for
          additional-rate).
        </span>
      </fieldset>
    {/if}
  </div>

  {#if result}
    <div class="i-tool__result" aria-live="polite">
      <div class="i-tool__hero">
        <div class="i-tool__hero-row">
          <span class="i-tool__hero-label">Net final amount (after tax)</span>
          <span class="i-tool__hero-value" data-testid="i-net-final">
            {fmtMoney(result.netFinalAmount)}
          </span>
        </div>
        <div class="i-tool__hero-row i-tool__hero-row--secondary">
          <span class="i-tool__hero-label">Net interest earned</span>
          <span class="i-tool__hero-value">{fmtMoney(result.netInterest)}</span>
        </div>
        <div class="i-tool__hero-row i-tool__hero-row--secondary">
          <span class="i-tool__hero-label">APY (effective annual rate)</span>
          <span class="i-tool__hero-value">{fmtPct(result.apy, 4)}</span>
        </div>
      </div>

      <dl class="i-tool__breakdown">
        <h3 class="i-tool__bd-heading">Breakdown</h3>
        <div class="i-tool__bd-row">
          <dt>Final amount (gross of tax)</dt>
          <dd>{fmtMoney(result.finalAmount)}</dd>
        </div>
        <div class="i-tool__bd-row">
          <dt>Total interest (gross of tax)</dt>
          <dd>{fmtMoney(result.totalInterest)}</dd>
        </div>
        <div class="i-tool__bd-row">
          <dt>Tax on interest ({fmtPct(taxRate, 0)})</dt>
          <dd>−{fmtMoney(result.taxOnInterest)}</dd>
        </div>
        <div class="i-tool__bd-row i-tool__bd-row--total">
          <dt>Net interest</dt>
          <dd>{fmtMoney(result.netInterest)}</dd>
        </div>
        <div class="i-tool__bd-row">
          <dt>Daily accrual at t = 0 (loan-day-cost)</dt>
          <dd>{fmtMoney(result.dailyAccrualAtT0, 4)}</dd>
        </div>
      </dl>
    </div>
  {/if}

  <p class="i-tool__disclaimer">
    {#if region === 'us'}
      US calculation taxes interest at your selected federal marginal
      bracket. State income tax on interest is not included — varies by
      state. For tax-deferred accounts (Traditional IRA, 401(k), HSA)
      pick 0% to reflect deferral; the eventual distribution is taxed at
      withdrawal.
    {:else}
      UK calculation treats ISA as fully tax-free. Outside an ISA, the
      Personal Savings Allowance (£1,000 basic / £500 higher / £0
      additional rate) covers the first slice of interest before income
      tax applies. Pick the relevant band; 0% emulates the PSA-covered
      slice.
    {/if}
    Calculation runs entirely in your browser.
  </p>
</div>

<style>
  .i-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .i-tool__panel {
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }
  .i-tool__row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-5);
  }
  @media (max-width: 56rem) {
    .i-tool__row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 32rem) {
    .i-tool__row { grid-template-columns: 1fr; }
  }
  .i-tool__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border: none;
    margin: 0;
    padding: 0;
  }
  .i-tool__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .i-tool__sublabel {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin-right: var(--space-2);
  }
  .i-tool__field input[type="number"],
  .i-tool__field select {
    appearance: none;
    width: 100%;
    padding: var(--space-3);
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .i-tool__field input[type="number"]:focus-visible,
  .i-tool__field select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .i-tool__pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }
  .i-tool__pill--narrow {
    margin-top: var(--space-2);
  }
  .i-tool__pill input[type="radio"],
  .i-tool__pill input[type="checkbox"] {
    accent-color: var(--color-accent);
  }
  .i-tool__hint {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.4;
  }

  .i-tool__result {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }
  .i-tool__hero {
    padding: var(--space-6) var(--space-5);
    background: var(--color-text);
    color: var(--color-bg);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .i-tool__hero-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
  }
  .i-tool__hero-label {
    font-size: var(--font-size-small);
    color: var(--color-bg);
    opacity: 0.7;
  }
  .i-tool__hero-value {
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .i-tool__hero-row--secondary .i-tool__hero-value {
    font-size: 1.125rem;
    font-weight: 500;
  }

  .i-tool__breakdown {
    margin: 0;
    padding: var(--space-5);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .i-tool__bd-heading {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin: 0 0 var(--space-2);
  }
  .i-tool__bd-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .i-tool__bd-row:last-child { border-bottom: none; }
  .i-tool__bd-row dt {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin: 0;
  }
  .i-tool__bd-row dd {
    margin: 0;
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
    font-size: var(--font-size-small);
  }
  .i-tool__bd-row--total {
    margin-top: var(--space-2);
    padding-top: var(--space-3);
    border-top: 2px solid var(--color-text);
  }
  .i-tool__bd-row--total dt,
  .i-tool__bd-row--total dd {
    font-weight: 600;
    color: var(--color-text);
    font-size: var(--font-size-body);
  }

  .i-tool__disclaimer {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .i-tool__field input,
    .i-tool__field select { transition: none; }
  }
</style>
