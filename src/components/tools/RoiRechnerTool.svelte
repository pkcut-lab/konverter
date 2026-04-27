<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    computeRoiBasis,
    computeRoiErweitert,
    computeRoiDupont,
    formatEuro,
    formatProzent,
  } from '../../lib/tools/roi-rechner';
  import { t } from '../../lib/i18n/strings';
  import { INTL_LOCALE_MAP } from '../../lib/i18n/locale-maps';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;
  const strings = $derived(t(lang));

  type Mode = 'basis' | 'erweitert' | 'dupont';
  let mode = $state<Mode>('basis');

  // ---- Basis-Felder ----
  let investitionStr = $state('50.000');
  let ertragStr = $state('63.400');

  // ---- Erweitert-Felder ----
  let laufzeitStr = $state('3');
  let betriebskostenStr = $state('0');

  // ---- DuPont-Felder ----
  let gewinnStr = $state('13.400');
  let nettoumsatzStr = $state('200.000');
  let gesamtkapitalStr = $state('100.000');

  // ---- Copy-Button ----
  type CopyState = 'idle' | 'copied' | 'error';
  let copyState = $state<CopyState>('idle');
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  // ---- Parsed ----
  const investition = $derived(parseDE(investitionStr));
  const ertrag = $derived(parseDE(ertragStr));
  const laufzeit = $derived(parseDE(laufzeitStr));
  const betriebskosten = $derived(parseDE(betriebskostenStr));
  const gewinn = $derived(parseDE(gewinnStr));
  const nettoumsatz = $derived(parseDE(nettoumsatzStr));
  const gesamtkapital = $derived(parseDE(gesamtkapitalStr));

  // ---- Validierung: Basis ----
  const investitionError = $derived.by<string | null>(() => {
    if (!Number.isFinite(investition)) return 'Bitte eine gültige Zahl eingeben.';
    if (investition <= 0) return 'Investitionsbetrag muss größer als 0 sein.';
    return null;
  });

  const ertragError = $derived.by<string | null>(() => {
    if (!Number.isFinite(ertrag)) return 'Bitte einen gültigen Ertrag eingeben.';
    return null;
  });

  // ---- Validierung: Erweitert ----
  const laufzeitError = $derived.by<string | null>(() => {
    if (mode !== 'erweitert') return null;
    if (!Number.isFinite(laufzeit)) return 'Bitte eine gültige Laufzeit eingeben.';
    if (laufzeit <= 0) return 'Laufzeit muss mindestens 0,01 Jahre betragen.';
    if (laufzeit > 100) return 'Sehr lange Laufzeit — annualisierter ROI nähert sich 0 %.';
    return null;
  });

  const betriebskostenError = $derived.by<string | null>(() => {
    if (mode !== 'erweitert') return null;
    if (!Number.isFinite(betriebskosten)) return 'Bitte einen gültigen Betrag eingeben.';
    if (betriebskosten < 0) return 'Betriebskosten müssen ≥ 0 € sein.';
    return null;
  });

  // ---- Validierung: DuPont ----
  const gewinnError = $derived.by<string | null>(() => {
    if (mode !== 'dupont') return null;
    if (!Number.isFinite(gewinn)) return 'Bitte einen gültigen Gewinn eingeben.';
    return null;
  });

  const nettoumsatzError = $derived.by<string | null>(() => {
    if (mode !== 'dupont') return null;
    if (!Number.isFinite(nettoumsatz)) return 'Bitte eine gültige Zahl eingeben.';
    if (nettoumsatz <= 0) return 'Nettoumsatz muss größer als 0 sein.';
    return null;
  });

  const gesamtkapitalError = $derived.by<string | null>(() => {
    if (mode !== 'dupont') return null;
    if (!Number.isFinite(gesamtkapital)) return 'Bitte eine gültige Zahl eingeben.';
    if (gesamtkapital <= 0) return 'Gesamtkapital muss größer als 0 sein.';
    return null;
  });

  // ---- Ergebnis ----
  const basisResult = $derived.by(() => {
    if (mode !== 'basis') return null;
    if (investitionError !== null || ertragError !== null) return null;
    if (!Number.isFinite(investition) || !Number.isFinite(ertrag)) return null;
    return computeRoiBasis(investition, ertrag);
  });

  const erweiterterResult = $derived.by(() => {
    if (mode !== 'erweitert') return null;
    if (
      investitionError !== null ||
      ertragError !== null ||
      laufzeitError !== null ||
      betriebskostenError !== null
    ) return null;
    if (
      !Number.isFinite(investition) ||
      !Number.isFinite(ertrag) ||
      !Number.isFinite(laufzeit) ||
      !Number.isFinite(betriebskosten)
    ) return null;
    return computeRoiErweitert(investition, ertrag, laufzeit, betriebskosten);
  });

  const dupontResult = $derived.by(() => {
    if (mode !== 'dupont') return null;
    if (gewinnError !== null || nettoumsatzError !== null || gesamtkapitalError !== null) return null;
    if (
      !Number.isFinite(gewinn) ||
      !Number.isFinite(nettoumsatz) ||
      !Number.isFinite(gesamtkapital)
    ) return null;
    return computeRoiDupont(gewinn, nettoumsatz, gesamtkapital);
  });

  const activeResult = $derived(basisResult ?? erweiterterResult ?? dupontResult);

  // ---- Copy ----
  async function copyRoi() {
    const result = activeResult;
    if (!result) return;
    const text = `ROI: ${formatProzent(result.roi, 2)} %`;
    try {
      await navigator.clipboard.writeText(text);
      copyState = 'copied';
    } catch {
      copyState = 'error';
    }
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyState = 'idle'; }, 2000);
  }

  // ---- Reset ----
  function handleReset() {
    investitionStr = '50.000';
    ertragStr = '63.400';
    laufzeitStr = '3';
    betriebskostenStr = '0';
    gewinnStr = '13.400';
    nettoumsatzStr = '200.000';
    gesamtkapitalStr = '100.000';
    copyState = 'idle';
  }
</script>

<div class="roi-tool" aria-label="ROI-Rechner">

  <!-- Modus-Switcher -->
  <div class="mode-switcher" role="tablist" aria-label="Berechnungsmodus">
    <button
      role="tab"
      class="mode-btn"
      class:mode-btn--active={mode === 'basis'}
      aria-selected={mode === 'basis'}
      onclick={() => { mode = 'basis'; }}
    >Einfach</button>
    <button
      role="tab"
      class="mode-btn"
      class:mode-btn--active={mode === 'erweitert'}
      aria-selected={mode === 'erweitert'}
      onclick={() => { mode = 'erweitert'; }}
    >Erweitert</button>
    <button
      role="tab"
      class="mode-btn"
      class:mode-btn--active={mode === 'dupont'}
      aria-selected={mode === 'dupont'}
      onclick={() => { mode = 'dupont'; }}
    >DuPont</button>
  </div>

  <!-- Eingaben: Basis + Erweitert teilen Investition/Ertrag -->
  {#if mode === 'basis' || mode === 'erweitert'}
    <div class="inputs-grid">

      <div class="input-field">
        <label class="input-field__label" for="inp-investition">Investition</label>
        <div class="input-field__wrap" class:input-field__wrap--error={investitionError !== null}>
          <input
            id="inp-investition"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 50.000"
            bind:value={investitionStr}
            aria-label="Anfangsinvestition in Euro"
            aria-invalid={investitionError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if investitionError}
          <p class="field-error" role="alert">{investitionError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-ertrag">Gesamtertrag</label>
        <div class="input-field__wrap" class:input-field__wrap--error={ertragError !== null}>
          <input
            id="inp-ertrag"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 63.400"
            bind:value={ertragStr}
            aria-label="Gesamtertrag oder Endwert in Euro"
            aria-invalid={ertragError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if ertragError}
          <p class="field-error" role="alert">{ertragError}</p>
        {/if}
      </div>

      {#if mode === 'erweitert'}
        <div class="input-field">
          <label class="input-field__label" for="inp-laufzeit">Laufzeit</label>
          <div class="input-field__wrap" class:input-field__wrap--error={laufzeitError !== null}>
            <input
              id="inp-laufzeit"
              type="text"
              inputmode="decimal"
              class="input-field__input"
              placeholder="z.B. 3"
              bind:value={laufzeitStr}
              aria-label="Laufzeit in Jahren"
              aria-invalid={laufzeitError !== null}
              autocomplete="off"
            />
            <span class="input-field__unit" aria-hidden="true">Jahre</span>
          </div>
          {#if laufzeitError}
            <p class="field-error" role="alert">{laufzeitError}</p>
          {/if}
        </div>

        <div class="input-field">
          <label class="input-field__label" for="inp-betriebskosten">
            Betriebskosten/Jahr
            <span class="default-badge">optional</span>
          </label>
          <div class="input-field__wrap" class:input-field__wrap--error={betriebskostenError !== null}>
            <input
              id="inp-betriebskosten"
              type="text"
              inputmode="decimal"
              class="input-field__input"
              placeholder="z.B. 0"
              bind:value={betriebskostenStr}
              aria-label="Jährliche Betriebskosten in Euro"
              aria-invalid={betriebskostenError !== null}
              autocomplete="off"
            />
            <span class="input-field__unit" aria-hidden="true">€/Jahr</span>
          </div>
          {#if betriebskostenError}
            <p class="field-error" role="alert">{betriebskostenError}</p>
          {/if}
        </div>
      {/if}

    </div>
  {/if}

  <!-- Eingaben: DuPont -->
  {#if mode === 'dupont'}
    <div class="inputs-grid">

      <div class="input-field">
        <label class="input-field__label" for="inp-gewinn">Betriebsgewinn</label>
        <div class="input-field__wrap" class:input-field__wrap--error={gewinnError !== null}>
          <input
            id="inp-gewinn"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 13.400"
            bind:value={gewinnStr}
            aria-label="Betriebsgewinn in Euro"
            aria-invalid={gewinnError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if gewinnError}
          <p class="field-error" role="alert">{gewinnError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-nettoumsatz">Nettoumsatz</label>
        <div class="input-field__wrap" class:input-field__wrap--error={nettoumsatzError !== null}>
          <input
            id="inp-nettoumsatz"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 200.000"
            bind:value={nettoumsatzStr}
            aria-label="Nettoumsatz in Euro"
            aria-invalid={nettoumsatzError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if nettoumsatzError}
          <p class="field-error" role="alert">{nettoumsatzError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-gesamtkapital">Gesamtkapital</label>
        <div class="input-field__wrap" class:input-field__wrap--error={gesamtkapitalError !== null}>
          <input
            id="inp-gesamtkapital"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 100.000"
            bind:value={gesamtkapitalStr}
            aria-label="Gesamtkapital oder investiertes Kapital in Euro"
            aria-invalid={gesamtkapitalError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if gesamtkapitalError}
          <p class="field-error" role="alert">{gesamtkapitalError}</p>
        {/if}
      </div>

    </div>
  {/if}

  <!-- Ergebnis -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">

    {#if basisResult}
      <div class="results-grid">

        <div class="result-card result-card--primary">
          <span class="result-card__label">Return on Investment</span>
          <span class="result-card__value">
            {formatProzent(basisResult.roi, 2)}<span class="result-card__unit"> %</span>
          </span>
          <span
            class="status-badge"
            class:status-badge--gewinn={basisResult.status === 'gewinn'}
            class:status-badge--verlust={basisResult.status === 'verlust'}
            class:status-badge--breakeven={basisResult.status === 'breakeven'}
          >
            {basisResult.status === 'gewinn' ? 'Gewinn' : basisResult.status === 'verlust' ? 'Verlust' : 'Break-Even'}
          </span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Gewinn / Verlust</span>
          <span class="result-card__value">
            {formatEuro(basisResult.gewinn)}<span class="result-card__unit"> €</span>
          </span>
          <span class="result-card__sub">Ertrag − Investition</span>
        </div>

      </div>

      <div class="formel-row" aria-label="Formel-Aufschlüsselung">
        <span class="formel-label">Formel</span>
        <span class="formel-text">{basisResult.formelText}</span>
      </div>

    {/if}

    {#if erweiterterResult}
      <div class="results-grid">

        <div class="result-card result-card--primary">
          <span class="result-card__label">ROI gesamt</span>
          <span class="result-card__value">
            {formatProzent(erweiterterResult.roi, 2)}<span class="result-card__unit"> %</span>
          </span>
          <span
            class="status-badge"
            class:status-badge--gewinn={erweiterterResult.status === 'gewinn'}
            class:status-badge--verlust={erweiterterResult.status === 'verlust'}
            class:status-badge--breakeven={erweiterterResult.status === 'breakeven'}
          >
            {erweiterterResult.status === 'gewinn' ? 'Gewinn' : erweiterterResult.status === 'verlust' ? 'Verlust' : 'Break-Even'}
          </span>
        </div>

        <div class="result-card result-card--highlight">
          <span class="result-card__label">Annualisierter ROI</span>
          <span class="result-card__value">
            {formatProzent(erweiterterResult.aroi, 2)}<span class="result-card__unit"> % p.a.</span>
          </span>
          <span class="result-card__sub">Zinseszins-Formel</span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Gewinn / Verlust</span>
          <span class="result-card__value">
            {formatEuro(erweiterterResult.gewinn)}<span class="result-card__unit"> €</span>
          </span>
          {#if erweiterterResult.gesamtBetriebskosten > 0}
            <span class="result-card__sub">
              inkl. {formatEuro(erweiterterResult.gesamtBetriebskosten)}&nbsp;€ Betriebskosten
            </span>
          {:else}
            <span class="result-card__sub">Ertrag − Investition</span>
          {/if}
        </div>

        {#if erweiterterResult.amortisation !== null}
          <div class="result-card">
            <span class="result-card__label">Amortisation</span>
            <span class="result-card__value">
              {formatProzent(erweiterterResult.amortisation, 1)}<span class="result-card__unit"> Jahre</span>
            </span>
            <span class="result-card__sub">bis zur Kostendeckung</span>
          </div>
        {:else}
          <div class="result-card result-card--muted">
            <span class="result-card__label">Amortisation</span>
            <span class="result-card__value result-card__value--muted">—</span>
            <span class="result-card__sub">kein positiver Ertrag</span>
          </div>
        {/if}

      </div>

      <div class="formel-row" aria-label="Formel-Aufschlüsselung ROI">
        <span class="formel-label">ROI-Formel</span>
        <span class="formel-text">{erweiterterResult.formelText}</span>
      </div>
      <div class="formel-row" aria-label="Formel-Aufschlüsselung annualisierter ROI">
        <span class="formel-label">AROI-Formel</span>
        <span class="formel-text">{erweiterterResult.aroiFormelText}</span>
      </div>

    {/if}

    {#if dupontResult}
      <div class="results-grid">

        <div class="result-card result-card--primary">
          <span class="result-card__label">ROI (DuPont)</span>
          <span class="result-card__value">
            {formatProzent(dupontResult.roi, 2)}<span class="result-card__unit"> %</span>
          </span>
          <span
            class="status-badge"
            class:status-badge--gewinn={dupontResult.status === 'gewinn'}
            class:status-badge--verlust={dupontResult.status === 'verlust'}
            class:status-badge--breakeven={dupontResult.status === 'breakeven'}
          >
            {dupontResult.status === 'gewinn' ? 'Gewinn' : dupontResult.status === 'verlust' ? 'Verlust' : 'Break-Even'}
          </span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Umsatzrendite</span>
          <span class="result-card__value">
            {formatProzent(dupontResult.umsatzrendite, 2)}<span class="result-card__unit"> %</span>
          </span>
          <span class="result-card__sub">Gewinn / Nettoumsatz</span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Kapitalumschlag</span>
          <span class="result-card__value">
            {dupontResult.kapitalumschlag.toLocaleString(INTL_LOCALE_MAP[lang], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span class="result-card__sub">Nettoumsatz / Gesamtkapital</span>
        </div>

      </div>

      <div class="formel-row" aria-label="DuPont-Formel">
        <span class="formel-label">DuPont</span>
        <span class="formel-text">{dupontResult.formelText}</span>
      </div>

    {/if}

    <!-- Copy-Button -->
    {#if activeResult}
      <div class="actions-bar">
        <button
          type="button"
          class="copy-btn"
          class:copy-btn--copied={copyState === 'copied'}
          onclick={copyRoi}
          aria-label="ROI-Ergebnis in die Zwischenablage kopieren"
        >
          {copyState === 'copied' ? strings.toolsCommon.copied : copyState === 'error' ? 'Fehler' : strings.toolsCommon.copy}
        </button>
        <button type="button" class="reset-btn" onclick={handleReset}>{strings.toolsCommon.reset}</button>
      </div>
    {:else}
      <div class="actions-bar">
        <button type="button" class="reset-btn" onclick={handleReset}>{strings.toolsCommon.reset}</button>
      </div>
    {/if}

  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">
    Diese Berechnung dient ausschließlich zur unverbindlichen Information.
    Tatsächliche Renditen können abweichen. Kein Ersatz für Fachberatung.
  </p>

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser
  </div>

</div>

<style>
  .roi-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Mode switcher */
  .mode-switcher {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    width: fit-content;
  }

  .mode-btn {
    padding: var(--space-2) var(--space-4);
    min-height: 2.25rem;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    font-weight: 500;
    border-radius: calc(var(--r-md) - 2px);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    white-space: nowrap;
  }

  .mode-btn--active {
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .mode-btn:hover:not(.mode-btn--active) {
    color: var(--color-text);
  }

  /* Inputs Grid */
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
    gap: var(--space-4);
  }

  /* Input Field */
  .input-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .input-field__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .default-badge {
    font-size: 0.625rem;
    letter-spacing: 0.03em;
    color: var(--color-text-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: 0 var(--space-1);
    font-weight: 400;
    white-space: nowrap;
  }

  .input-field__wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    padding: 0 var(--space-3);
    min-height: 2.75rem;
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }

  .input-field__wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }

  .input-field__wrap--error {
    border-color: var(--color-error);
  }

  .input-field__input {
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

  .input-field__unit {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
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

  /* Results */
  .results {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: var(--space-3);
  }

  .result-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .result-card--primary {
    border-color: var(--color-text);
  }

  .result-card--highlight {
    border-color: var(--color-accent);
  }

  .result-card__label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    font-weight: 500;
  }

  .result-card__value {
    font-size: 1.25rem;
    font-family: var(--font-family-mono);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.2;
  }

  .result-card__value--muted {
    color: var(--color-text-subtle);
    font-size: 1rem;
  }

  .result-card__unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .result-card__sub {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.4;
    margin-top: var(--space-1);
  }

  /* Status badge */
  .status-badge {
    display: inline-block;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: var(--r-sm);
    padding: 0 var(--space-1);
    margin-top: var(--space-1);
    width: fit-content;
  }

  .status-badge--gewinn {
    background: color-mix(in oklch, var(--color-success) 12%, transparent);
    color: var(--color-success);
    border: 1px solid color-mix(in oklch, var(--color-success) 30%, transparent);
  }

  .status-badge--verlust {
    background: color-mix(in oklch, var(--color-error) 12%, transparent);
    color: var(--color-error);
    border: 1px solid color-mix(in oklch, var(--color-error) 30%, transparent);
  }

  .status-badge--breakeven {
    background: color-mix(in oklch, var(--color-text-subtle) 12%, transparent);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  /* Formel row */
  .formel-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
  }

  .formel-label {
    font-size: var(--font-size-xs);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    flex-shrink: 0;
    padding-top: 0.1em;
  }

  .formel-text {
    font-family: var(--font-family-mono);
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    word-break: break-all;
  }

  /* Actions */
  .actions-bar {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .copy-btn {
    padding: var(--space-2) var(--space-4);
    min-height: 2.75rem;
    border: 1px solid var(--color-text);
    background: var(--color-text);
    color: var(--color-bg);
    font-size: var(--font-size-small);
    font-weight: 500;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }

  .copy-btn--copied {
    background: var(--color-success);
    border-color: var(--color-success);
  }

  .copy-btn:hover:not(.copy-btn--copied) {
    opacity: 0.85;
  }

  .reset-btn {
    padding: var(--space-2) var(--space-4);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }

  .reset-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  /* Disclaimer */
  .disclaimer {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text);
    line-height: 1.5;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .input-field__wrap,
    .copy-btn,
    .reset-btn {
      transition: none;
    }
  }
</style>
