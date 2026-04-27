<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    computeUsPaycheck,
    computeUkPaycheck,
    type UsFilingStatus,
  } from '../../lib/tools/en/gross-net-calculator';
  import { getRegion, subscribeRegion } from '../../lib/i18n/region.svelte';
  import { regionCurrency, type Region } from '../../lib/i18n/region';
  import RegionSelector from './RegionSelector.svelte';

  /**
   * EN region-aware Gross-to-Net (paycheck) calculator.
   * US: FICA (Social Security + Medicare + Additional Medicare) + federal
   *     income tax with standard deduction across 4 filing statuses.
   * UK: Income Tax (Personal Allowance + 3 bands incl. taper) + Class-1
   *     employee National Insurance.
   *
   * State income tax is intentionally out of scope — too many states with
   * varying brackets, would require its own data file. Disclaimer in UI.
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

  let grossStr = $state<string>('75000');
  let filingStatus = $state<UsFilingStatus>('single');

  const usResult = $derived.by(() => {
    if (region !== 'us') return null;
    const gross = parseFloat(grossStr);
    if (!Number.isFinite(gross) || gross < 0) return null;
    return computeUsPaycheck(gross, filingStatus);
  });
  const ukResult = $derived.by(() => {
    if (region !== 'uk') return null;
    const gross = parseFloat(grossStr);
    if (!Number.isFinite(gross) || gross < 0) return null;
    return computeUkPaycheck(gross);
  });

  function fmtMoney(n: number): string {
    try {
      return new Intl.NumberFormat(region === 'uk' ? 'en-GB' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${currency} ${n.toFixed(0)}`;
    }
  }

  function fmtMoneyDecimals(n: number): string {
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

  function fmtPct(decimal: number, digits = 2): string {
    return `${(decimal * 100).toFixed(digits)}%`;
  }
</script>

<div class="gn-tool">
  <RegionSelector />

  <div class="gn-tool__panel">
    <div class="gn-tool__row">
      <label class="gn-tool__field">
        <span class="gn-tool__label">Gross annual salary ({currency})</span>
        <input
          type="number"
          inputmode="decimal"
          step="500"
          min="0"
          bind:value={grossStr}
          aria-label="Annual gross salary in {currency}"
        />
      </label>

      {#if region === 'us'}
        <label class="gn-tool__field">
          <span class="gn-tool__label">Filing status</span>
          <select bind:value={filingStatus} aria-label="IRS filing status">
            <option value="single">Single</option>
            <option value="mfj">Married filing jointly</option>
            <option value="hoh">Head of household</option>
            <option value="mfs">Married filing separately</option>
          </select>
        </label>
      {:else}
        <div class="gn-tool__hint-block">
          <span class="gn-tool__label">Tax year</span>
          <p class="gn-tool__hint-large">
            UK 2025/26 — England, Wales, Northern Ireland (rUK).
            Scotland uses different bands.
          </p>
        </div>
      {/if}
    </div>
  </div>

  {#if region === 'us' && usResult}
    <div class="gn-tool__result" aria-live="polite">
      <div class="gn-tool__hero">
        <div class="gn-tool__hero-row">
          <span class="gn-tool__hero-label">Take-home (annual)</span>
          <span class="gn-tool__hero-value" data-testid="gn-net-annual">
            {fmtMoney(usResult.netAnnual)}
          </span>
        </div>
        <div class="gn-tool__hero-row gn-tool__hero-row--secondary">
          <span class="gn-tool__hero-label">Per month</span>
          <span class="gn-tool__hero-value" data-testid="gn-net-monthly">
            {fmtMoney(usResult.netMonthly)}
          </span>
        </div>
        <div class="gn-tool__hero-row gn-tool__hero-row--secondary">
          <span class="gn-tool__hero-label">Effective tax rate</span>
          <span class="gn-tool__hero-value">{fmtPct(usResult.effectiveRate)}</span>
        </div>
      </div>

      <dl class="gn-tool__breakdown">
        <h3 class="gn-tool__bd-heading">Breakdown</h3>
        <div class="gn-tool__bd-row">
          <dt>Gross annual</dt>
          <dd>{fmtMoneyDecimals(usResult.grossAnnual)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Standard deduction ({filingStatus.toUpperCase()})</dt>
          <dd>−{fmtMoneyDecimals(usResult.standardDeduction)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Taxable income</dt>
          <dd>{fmtMoneyDecimals(usResult.taxableIncome)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Federal income tax (top bracket {fmtPct(usResult.marginalBracket, 0)})</dt>
          <dd>−{fmtMoneyDecimals(usResult.federalIncomeTax)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Social Security (6.2% to {fmtMoney(176100)})</dt>
          <dd>−{fmtMoneyDecimals(usResult.socialSecurityTax)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Medicare (1.45%)</dt>
          <dd>−{fmtMoneyDecimals(usResult.medicareTax)}</dd>
        </div>
        {#if usResult.additionalMedicareTax > 0}
          <div class="gn-tool__bd-row">
            <dt>Additional Medicare (0.9%)</dt>
            <dd>−{fmtMoneyDecimals(usResult.additionalMedicareTax)}</dd>
          </div>
        {/if}
        <div class="gn-tool__bd-row gn-tool__bd-row--total">
          <dt>Total tax</dt>
          <dd>−{fmtMoneyDecimals(usResult.totalTax)}</dd>
        </div>
      </dl>
    </div>
  {/if}

  {#if region === 'uk' && ukResult}
    <div class="gn-tool__result" aria-live="polite">
      <div class="gn-tool__hero">
        <div class="gn-tool__hero-row">
          <span class="gn-tool__hero-label">Take-home (annual)</span>
          <span class="gn-tool__hero-value" data-testid="gn-net-annual">
            {fmtMoney(ukResult.netAnnual)}
          </span>
        </div>
        <div class="gn-tool__hero-row gn-tool__hero-row--secondary">
          <span class="gn-tool__hero-label">Per month</span>
          <span class="gn-tool__hero-value" data-testid="gn-net-monthly">
            {fmtMoney(ukResult.netMonthly)}
          </span>
        </div>
        <div class="gn-tool__hero-row gn-tool__hero-row--secondary">
          <span class="gn-tool__hero-label">Effective tax rate</span>
          <span class="gn-tool__hero-value">{fmtPct(ukResult.effectiveRate)}</span>
        </div>
      </div>

      <dl class="gn-tool__breakdown">
        <h3 class="gn-tool__bd-heading">Breakdown</h3>
        <div class="gn-tool__bd-row">
          <dt>Gross annual</dt>
          <dd>{fmtMoneyDecimals(ukResult.grossAnnual)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Personal Allowance</dt>
          <dd>−{fmtMoneyDecimals(ukResult.personalAllowance)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Taxable income</dt>
          <dd>{fmtMoneyDecimals(ukResult.taxableIncome)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>Income Tax (top band {fmtPct(ukResult.marginalBracket, 0)})</dt>
          <dd>−{fmtMoneyDecimals(ukResult.incomeTax)}</dd>
        </div>
        <div class="gn-tool__bd-row">
          <dt>National Insurance (Class-1 employee)</dt>
          <dd>−{fmtMoneyDecimals(ukResult.nationalInsurance)}</dd>
        </div>
        <div class="gn-tool__bd-row gn-tool__bd-row--total">
          <dt>Total tax</dt>
          <dd>−{fmtMoneyDecimals(ukResult.totalTax)}</dd>
        </div>
      </dl>
    </div>
  {/if}

  <p class="gn-tool__disclaimer">
    {#if region === 'us'}
      US calculation uses 2025 federal income-tax brackets, 2025 standard
      deduction, and 2025 FICA rates (Social Security 6.2% up to $176,100,
      Medicare 1.45%, Additional Medicare 0.9% above the filing-status
      threshold). State, city, and local income tax are not included —
      they vary too widely to ship in a one-shot calculator.
    {:else}
      UK calculation uses 2025/26 tax-year rates for England, Wales, and
      Northern Ireland: Personal Allowance £12,570 (tapered above £100,000),
      Income Tax bands 20%/40%/45%, Class-1 employee NI 8%/2% above the
      Primary Threshold. Scottish income-tax rates are not modelled — they
      have their own 6-band structure.
    {/if}
    Calculation runs entirely in your browser — no salary or filing data
    is sent anywhere.
  </p>
</div>

<style>
  .gn-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .gn-tool__panel {
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
  }
  .gn-tool__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
  }
  @media (max-width: 40rem) {
    .gn-tool__row { grid-template-columns: 1fr; }
  }

  .gn-tool__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .gn-tool__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .gn-tool__field input,
  .gn-tool__field select {
    appearance: none;
    width: 100%;
    padding: var(--space-3);
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-body);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .gn-tool__field input:focus-visible,
  .gn-tool__field select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .gn-tool__hint-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-self: end;
  }
  .gn-tool__hint-large {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    line-height: 1.5;
  }

  .gn-tool__result {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .gn-tool__hero {
    padding: var(--space-6) var(--space-5);
    background: var(--color-text);
    color: var(--color-bg);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .gn-tool__hero-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
  }
  .gn-tool__hero-label {
    font-size: var(--font-size-small);
    color: var(--color-bg);
    opacity: 0.7;
  }
  .gn-tool__hero-value {
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .gn-tool__hero-row--secondary .gn-tool__hero-value {
    font-size: 1.125rem;
    font-weight: 500;
  }

  .gn-tool__breakdown {
    margin: 0;
    padding: var(--space-5);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .gn-tool__bd-heading {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin: 0 0 var(--space-2);
  }
  .gn-tool__bd-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .gn-tool__bd-row:last-child {
    border-bottom: none;
  }
  .gn-tool__bd-row dt {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin: 0;
  }
  .gn-tool__bd-row dd {
    margin: 0;
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
    font-size: var(--font-size-small);
  }
  .gn-tool__bd-row--total {
    margin-top: var(--space-2);
    padding-top: var(--space-3);
    border-top: 2px solid var(--color-text);
  }
  .gn-tool__bd-row--total dt,
  .gn-tool__bd-row--total dd {
    font-weight: 600;
    color: var(--color-text);
    font-size: var(--font-size-body);
  }

  .gn-tool__disclaimer {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .gn-tool__field input,
    .gn-tool__field select {
      transition: none;
    }
  }
</style>
