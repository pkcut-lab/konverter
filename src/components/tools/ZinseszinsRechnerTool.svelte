<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { computeZinseszinsCalc } from '../../lib/tools/zinseszins-rechner';
  import { parseDE } from '../../lib/tools/parse-de';
  import { dispatchToolUsed } from '../../lib/tracking';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;
  const strings = $derived(t(lang));
  const T = $derived(strings.tools.compoundInterestCalculator);

  // ---- Formatierung ----
  function fmt(n: number, decimals = 2): string {
    if (!Number.isFinite(n)) return '—';
    // try/catch: toLocaleString kann in seltenen Umgebungen werfen (z. B. fehlende ICU-Daten)
    try {
      return n.toLocaleString('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch {
      return n.toFixed(decimals);
    }
  }

  // ---- Eingabe-States (mit sinnvollen ETF-Sparplan-Defaults) ----
  let anfangskapitalStr = $state('0');
  let sparrateStr = $state('200');
  let zinssatzStr = $state('7');
  let laufzeitStr = $state('20');
  let inflationsrateStr = $state('2');
  let terStr = $state('0,2');

  // ---- Geparste Werte ----
  const anfangskapital = $derived(parseDE(anfangskapitalStr));
  const sparrate = $derived(parseDE(sparrateStr));
  const zinssatz = $derived(parseDE(zinssatzStr));
  const laufzeit = $derived(parseDE(laufzeitStr));
  const inflationsrate = $derived(parseDE(inflationsrateStr));
  const ter = $derived(parseDE(terStr));

  // ---- Validierung ----
  const anfangskapitalError = $derived.by<string | null>(() => {
    if (anfangskapitalStr.trim() === '') return null;
    if (!Number.isFinite(anfangskapital)) return T.errEnterNumber;
    if (anfangskapital < 0) return T.errInitialNegative;
    if (anfangskapital > 100_000_000) return T.errInitialMax;
    return null;
  });

  const sparrateError = $derived.by<string | null>(() => {
    if (sparrateStr.trim() === '') return null;
    if (!Number.isFinite(sparrate)) return T.errEnterNumber;
    if (sparrate < 0) return T.errContribNegative;
    if (sparrate > 1_000_000) return T.errContribMax;
    return null;
  });

  const zinssatzError = $derived.by<string | null>(() => {
    if (!Number.isFinite(zinssatz)) return T.errInterestRequired;
    if (zinssatz < -20) return T.errInterestMin;
    if (zinssatz > 50) return T.errInterestMax;
    return null;
  });

  const laufzeitError = $derived.by<string | null>(() => {
    if (!Number.isFinite(laufzeit)) return T.errTermRequired;
    if (laufzeit < 1) return T.errTermMin;
    if (laufzeit > 80) return T.errTermMax;
    return null;
  });

  const inflationsrateError = $derived.by<string | null>(() => {
    if (inflationsrateStr.trim() === '') return null;
    if (!Number.isFinite(inflationsrate)) return T.errEnterNumber;
    if (inflationsrate < 0) return T.errInflationNegative;
    if (inflationsrate > 30) return T.errInflationMax;
    return null;
  });

  const terError = $derived.by<string | null>(() => {
    if (terStr.trim() === '') return null;
    if (!Number.isFinite(ter)) return T.errEnterNumber;
    if (ter < 0) return T.errTerNegative;
    if (ter > 5) return T.errTerMax;
    return null;
  });

  const hasErrors = $derived(
    anfangskapitalError !== null ||
    sparrateError !== null ||
    zinssatzError !== null ||
    laufzeitError !== null ||
    inflationsrateError !== null ||
    terError !== null,
  );

  // ---- Berechnung ----
  // Synchronous — requestIdleCallback gate removed (R3 fix): it caused LCP
  // regression (+171%) under CPU-throttled Lighthouse (P1/P6, KON-300).
  const result = $derived.by(() => {
    if (hasErrors) return null;
    const k0 = Number.isFinite(anfangskapital) ? anfangskapital : 0;
    const r = Number.isFinite(sparrate) ? sparrate : 0;
    const i = Number.isFinite(inflationsrate) ? inflationsrate : 2;
    const t = Number.isFinite(ter) ? ter : 0;
    if (!Number.isFinite(zinssatz) || !Number.isFinite(laufzeit)) return null;
    return computeZinseszinsCalc(k0, r, zinssatz, laufzeit, i, t);
  });

  // Track first result for AdSense conversion attribution (Phase 2).
  let _firstResult = false;
  $effect(() => {
    if (!_firstResult && result !== null) {
      _firstResult = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: lang });
    }
  });

  // ---- Copy-States ----
  type CopyState = 'idle' | 'copied';
  let copyNominal = $state<CopyState>('idle');
  let copyNetto = $state<CopyState>('idle');
  let copyReal = $state<CopyState>('idle');

  async function copyValue(raw: number, which: 'nominal' | 'netto' | 'real') {
    if (!Number.isFinite(raw)) return;
    const text = fmt(raw);
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'nominal') { copyNominal = 'copied'; setTimeout(() => (copyNominal = 'idle'), 1500); }
      if (which === 'netto')   { copyNetto   = 'copied'; setTimeout(() => (copyNetto   = 'idle'), 1500); }
      if (which === 'real')    { copyReal    = 'copied'; setTimeout(() => (copyReal    = 'idle'), 1500); }
    } catch { /* clipboard denied */ }
  }

  // ---- Gesamteinzahlungen-Berechnung für Anzeige im leeren Zustand ----
  const gesamteinzahlungenRaw = $derived.by<number>(() => {
    if (!result) return NaN;
    return result.gesamteinzahlungen;
  });
</script>

<div class="zins-tool">

  <!-- Eingabefelder -->
  <fieldset class="input-grid">
    <legend class="sr-only">{T.legend}</legend>

    <!-- Anfangskapital -->
    <div class="field" class:field--error={anfangskapitalError !== null}>
      <label class="field__label" for="zins-anfangskapital">{T.initialCapitalLabel}</label>
      <div class="field__input-wrap" class:field__input-wrap--error={anfangskapitalError !== null}>
        <input
          id="zins-anfangskapital"
          type="text"
          inputmode="decimal"
          class="field__input"
          bind:value={anfangskapitalStr}
          placeholder={T.initialCapitalPlaceholder}
          aria-label={T.initialCapitalAria}
          aria-invalid={anfangskapitalError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">€</span>
      </div>
      {#if anfangskapitalError}
        <p class="field-error" role="alert">{anfangskapitalError}</p>
      {/if}
    </div>

    <!-- Monatliche Sparrate -->
    <div class="field" class:field--error={sparrateError !== null}>
      <label class="field__label" for="zins-sparrate">{T.monthlyContributionLabel}</label>
      <div class="field__input-wrap" class:field__input-wrap--error={sparrateError !== null}>
        <input
          id="zins-sparrate"
          type="text"
          inputmode="decimal"
          class="field__input"
          bind:value={sparrateStr}
          placeholder={T.monthlyContributionPlaceholder}
          aria-label={T.monthlyContributionAria}
          aria-invalid={sparrateError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">{T.unitEuroPerMonth}</span>
      </div>
      {#if sparrateError}
        <p class="field-error" role="alert">{sparrateError}</p>
      {/if}
    </div>

    <!-- Zinssatz -->
    <div class="field" class:field--error={zinssatzError !== null}>
      <label class="field__label" for="zins-zinssatz">{T.interestRateLabel}</label>
      <div class="field__input-wrap" class:field__input-wrap--error={zinssatzError !== null}>
        <input
          id="zins-zinssatz"
          type="text"
          inputmode="decimal"
          class="field__input"
          bind:value={zinssatzStr}
          placeholder={T.interestRatePlaceholder}
          aria-label={T.interestRateAria}
          aria-invalid={zinssatzError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">%</span>
      </div>
      {#if zinssatzError}
        <p class="field-error" role="alert">{zinssatzError}</p>
      {/if}
    </div>

    <!-- Laufzeit -->
    <div class="field" class:field--error={laufzeitError !== null}>
      <label class="field__label" for="zins-laufzeit">{T.termLabel}</label>
      <div class="field__input-wrap" class:field__input-wrap--error={laufzeitError !== null}>
        <input
          id="zins-laufzeit"
          type="text"
          inputmode="numeric"
          class="field__input"
          bind:value={laufzeitStr}
          placeholder={T.termPlaceholder}
          aria-label={T.termAria}
          aria-invalid={laufzeitError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">{T.unitYears}</span>
      </div>
      {#if laufzeitError}
        <p class="field-error" role="alert">{laufzeitError}</p>
      {/if}
    </div>

    <!-- Inflationsrate (optional) -->
    <div class="field" class:field--error={inflationsrateError !== null}>
      <label class="field__label" for="zins-inflation">
        {T.inflationLabel}
        <span class="field__optional">{T.optionalBadge}</span>
      </label>
      <div class="field__input-wrap" class:field__input-wrap--error={inflationsrateError !== null}>
        <input
          id="zins-inflation"
          type="text"
          inputmode="decimal"
          class="field__input"
          bind:value={inflationsrateStr}
          placeholder={T.inflationPlaceholder}
          aria-label={T.inflationAria}
          aria-invalid={inflationsrateError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">%</span>
      </div>
      {#if inflationsrateError}
        <p class="field-error" role="alert">{inflationsrateError}</p>
      {/if}
    </div>

    <!-- TER (optional) -->
    <div class="field" class:field--error={terError !== null}>
      <label class="field__label" for="zins-ter">
        {T.terLabel}
        <span class="field__optional">{T.optionalBadge}</span>
      </label>
      <div class="field__input-wrap" class:field__input-wrap--error={terError !== null}>
        <input
          id="zins-ter"
          type="text"
          inputmode="decimal"
          class="field__input"
          bind:value={terStr}
          placeholder={T.terPlaceholder}
          aria-label={T.terAria}
          aria-invalid={terError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">{T.unitPctPerYear}</span>
      </div>
      {#if terError}
        <p class="field-error" role="alert">{terError}</p>
      {/if}
    </div>
  </fieldset>

  <!-- Ergebnis-Karten -->
  {#if result && !hasErrors}
    <div class="results" aria-live="polite" aria-label={T.resultsAria}>

      <!-- Drei Szenarien -->
      <div class="scenario-grid">
        <!-- Nominal -->
        <div class="scenario-card">
          <div class="scenario-card__header">
            <span class="scenario-card__label">{T.cardNominalLabel}</span>
            <button
              type="button"
              class="copy-btn"
              class:copy-btn--copied={copyNominal === 'copied'}
              aria-label={copyNominal === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
              onclick={() => copyValue(result.endkapital_nominal, 'nominal')}
            >
              {#if copyNominal === 'copied'}
                {strings.toolsCommon.copied}
              {:else}
                <span aria-hidden="true">⧉</span> {strings.toolsCommon.copy}
              {/if}
            </button>
          </div>
          <div class="scenario-card__value" aria-label={T.cardNominalAria.replace('{amount}', fmt(result.endkapital_nominal))}>
            {fmt(result.endkapital_nominal)}&nbsp;€
          </div>
          <p class="scenario-card__desc">{T.cardNominalDesc}</p>
        </div>

        <!-- Nach Steuer -->
        <div class="scenario-card scenario-card--primary">
          <div class="scenario-card__header">
            <span class="scenario-card__label">{T.cardAfterTaxLabel}</span>
            <button
              type="button"
              class="copy-btn"
              class:copy-btn--copied={copyNetto === 'copied'}
              aria-label={copyNetto === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
              onclick={() => copyValue(result.endkapital_netto, 'netto')}
            >
              {#if copyNetto === 'copied'}
                {strings.toolsCommon.copied}
              {:else}
                <span aria-hidden="true">⧉</span> {strings.toolsCommon.copy}
              {/if}
            </button>
          </div>
          <div class="scenario-card__value" aria-label={T.cardAfterTaxAria.replace('{amount}', fmt(result.endkapital_netto))}>
            {fmt(result.endkapital_netto)}&nbsp;€
          </div>
          <p class="scenario-card__desc">{T.cardAfterTaxDesc}</p>
        </div>

        <!-- Real / Kaufkraft -->
        <div class="scenario-card">
          <div class="scenario-card__header">
            <span class="scenario-card__label">{T.cardRealLabel}</span>
            <button
              type="button"
              class="copy-btn"
              class:copy-btn--copied={copyReal === 'copied'}
              aria-label={copyReal === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
              onclick={() => copyValue(result.endkapital_real, 'real')}
            >
              {#if copyReal === 'copied'}
                {strings.toolsCommon.copied}
              {:else}
                <span aria-hidden="true">⧉</span> {strings.toolsCommon.copy}
              {/if}
            </button>
          </div>
          <div class="scenario-card__value" aria-label={T.cardRealAria.replace('{amount}', fmt(result.endkapital_real))}>
            {fmt(result.endkapital_real)}&nbsp;€
          </div>
          <p class="scenario-card__desc">{T.cardRealDescTemplate.replace('{inflation}', fmt(inflationsrate, 1))}</p>
        </div>
      </div>

      <!-- Detail-Strip -->
      <dl class="detail-strip">
        <div class="detail-item">
          <dt class="detail-item__label">{T.detailContributions}</dt>
          <dd class="detail-item__value">{fmt(result.gesamteinzahlungen)}&nbsp;€</dd>
        </div>
        <div class="detail-item">
          <dt class="detail-item__label">{T.detailGrossInterest}</dt>
          <dd class="detail-item__value">{fmt(result.zinsen_brutto)}&nbsp;€</dd>
        </div>
        <div class="detail-item">
          <dt class="detail-item__label">{T.detailTaxesTotal}</dt>
          <dd class="detail-item__value">{fmt(result.steuern_gesamt)}&nbsp;€</dd>
        </div>
      </dl>
    </div>
  {/if}

  {#if hasErrors}
    <p class="calc-hint" role="status">{T.hintFillCorrectly}</p>
  {/if}

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    {T.privacyBadge}
  </div>
</div>

<style>
  .zins-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ---- Eingabe-Raster ---- */
  .input-grid {
    border: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  @media (max-width: 520px) {
    .input-grid {
      grid-template-columns: 1fr;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .field__optional {
    font-size: 0.625rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text);
    font-weight: 400;
  }

  .field__input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    padding: 0 var(--space-3);
    transition: border-color var(--dur-fast) var(--ease-out),
                box-shadow var(--dur-fast) var(--ease-out);
  }
  .field__input-wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }
  .field__input-wrap--error {
    border-color: var(--color-error);
  }

  .field__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1rem;
    font-family: var(--font-family-mono);
    padding: var(--space-3) 0;
    min-width: 0;
  }

  .field__unit {
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    color: var(--color-text-subtle);
    flex-shrink: 0;
    white-space: nowrap;
  }

  .field-error {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-error);
    line-height: 1.4;
  }

  /* ---- Ergebnis ---- */
  .results {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* Drei Szenario-Karten */
  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  @media (max-width: 680px) {
    .scenario-grid {
      grid-template-columns: 1fr;
    }
  }

  .scenario-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .scenario-card--primary {
    border-color: var(--color-text);
    background: var(--color-surface-raised);
  }

  .scenario-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .scenario-card__label {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .scenario-card--primary .scenario-card__label {
    color: var(--color-text);
  }

  .scenario-card__value {
    font-family: var(--font-family-mono);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .scenario-card__desc {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  /* Copy button */
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0 var(--space-2);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out),
                color var(--dur-fast) var(--ease-out);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .copy-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }
  .copy-btn--copied {
    border-color: var(--color-success);
    color: var(--color-text);
  }

  /* Detail-Strip */
  .detail-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    margin: 0;
  }

  @media (max-width: 680px) {
    .detail-strip {
      grid-template-columns: 1fr;
    }
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-item__label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .detail-item__value {
    font-family: var(--font-family-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .calc-hint {
    margin: 0;
    text-align: center;
    font-size: var(--font-size-small);
    color: var(--color-text);
    padding: var(--space-4) 0;
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-align: center;
    padding-top: var(--space-2);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .field__input-wrap,
    .copy-btn {
      transition: none;
    }
  }
</style>
