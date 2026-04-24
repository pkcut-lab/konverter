<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    computeZins,
    formatEuro,
    formatProzent,
  } from '../../lib/tools/zinsrechner';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  // ---- Pflicht-Eingaben ----
  let k0Str = $state('10.000');
  let zinssatzStr = $state('3,00');
  let laufzeitStr = $state('10');

  // ---- Adjustable Defaults ----
  let steuersatzStr = $state('26,375');
  let freibetragStr = $state('1.000');
  let inflationStr = $state('2,50');

  // ---- Parsed ----
  const k0 = $derived(parseDE(k0Str));
  const zinssatz = $derived(parseDE(zinssatzStr));
  const laufzeit = $derived(parseDE(laufzeitStr));
  const steuersatz = $derived(parseDE(steuersatzStr));
  const freibetrag = $derived(parseDE(freibetragStr));
  const inflation = $derived(parseDE(inflationStr));

  // ---- Validierung ----
  const k0Error = $derived.by<string | null>(() => {
    if (!Number.isFinite(k0)) return 'Bitte ein gültiges Anfangskapital eingeben.';
    if (k0 < 0) return 'Anfangskapital muss ≥ 0 € sein.';
    return null;
  });

  const zinssatzError = $derived.by<string | null>(() => {
    if (!Number.isFinite(zinssatz)) return 'Bitte einen gültigen Zinssatz eingeben.';
    if (zinssatz < -10 || zinssatz > 100) return 'Zinssatz muss zwischen −10 und 100 % liegen.';
    return null;
  });

  const laufzeitError = $derived.by<string | null>(() => {
    if (!Number.isFinite(laufzeit)) return 'Bitte eine gültige Laufzeit eingeben.';
    if (laufzeit <= 0 || laufzeit > 100) return 'Laufzeit muss zwischen 1 und 100 Jahren liegen.';
    return null;
  });

  const steuersatzError = $derived.by<string | null>(() => {
    if (!Number.isFinite(steuersatz)) return 'Bitte einen gültigen Steuersatz eingeben.';
    if (steuersatz < 0 || steuersatz > 100) return 'Steuersatz: 0–100 %.';
    return null;
  });

  const freibetragError = $derived.by<string | null>(() => {
    if (!Number.isFinite(freibetrag)) return 'Bitte einen gültigen Freibetrag eingeben.';
    if (freibetrag < 0) return 'Freibetrag muss ≥ 0 € sein.';
    return null;
  });

  const inflationError = $derived.by<string | null>(() => {
    if (!Number.isFinite(inflation)) return 'Bitte eine gültige Inflationsrate eingeben.';
    if (inflation < -10 || inflation > 30) return 'Inflation: −10 bis 30 %.';
    return null;
  });

  const hasErrors = $derived(
    k0Error !== null ||
    zinssatzError !== null ||
    laufzeitError !== null ||
    steuersatzError !== null ||
    freibetragError !== null ||
    inflationError !== null,
  );

  // ---- Ergebnis ----
  const result = $derived.by(() => {
    if (hasErrors) return null;
    if (!Number.isFinite(k0) || !Number.isFinite(zinssatz) || !Number.isFinite(laufzeit)) return null;
    return computeZins(k0, zinssatz, laufzeit, steuersatz, freibetrag, inflation);
  });

  // ---- Reset ----
  function handleReset() {
    k0Str = '10.000';
    zinssatzStr = '3,00';
    laufzeitStr = '10';
    steuersatzStr = '26,375';
    freibetragStr = '1.000';
    inflationStr = '2,50';
  }
</script>

<div class="zinsrechner-tool" aria-label="Zinsrechner">

  <!-- Pflicht-Eingaben -->
  <div class="inputs-grid">

    <div class="input-field">
      <label class="input-field__label" for="inp-k0">Anfangskapital</label>
      <div class="input-field__wrap" class:input-field__wrap--error={k0Error !== null}>
        <input
          id="inp-k0"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 10.000"
          bind:value={k0Str}
          aria-label="Anfangskapital in Euro"
          aria-invalid={k0Error !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if k0Error}
        <p class="field-error" role="alert">{k0Error}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-zinssatz">Zinssatz p.a.</label>
      <div class="input-field__wrap" class:input-field__wrap--error={zinssatzError !== null}>
        <input
          id="inp-zinssatz"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 3,00"
          bind:value={zinssatzStr}
          aria-label="Zinssatz pro Jahr in Prozent"
          aria-invalid={zinssatzError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">%</span>
      </div>
      {#if zinssatzError}
        <p class="field-error" role="alert">{zinssatzError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-laufzeit">Laufzeit</label>
      <div class="input-field__wrap" class:input-field__wrap--error={laufzeitError !== null}>
        <input
          id="inp-laufzeit"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 10"
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

  </div>

  <!-- Adjustable Defaults -->
  <div class="defaults-section">
    <p class="defaults-label">Steuer &amp; Inflation</p>
    <div class="defaults-grid">

      <div class="input-field input-field--sm">
        <label class="input-field__label" for="inp-steuersatz">
          Abgeltungssteuer
          <span class="default-badge">Standard 26,375&nbsp;%</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={steuersatzError !== null}>
          <input
            id="inp-steuersatz"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="26,375"
            bind:value={steuersatzStr}
            aria-label="Abgeltungssteuersatz in Prozent"
            aria-invalid={steuersatzError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if steuersatzError}
          <p class="field-error" role="alert">{steuersatzError}</p>
        {/if}
      </div>

      <div class="input-field input-field--sm">
        <label class="input-field__label" for="inp-freibetrag">
          Sparerpauschbetrag
          <span class="default-badge">Standard 1.000&nbsp;€</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={freibetragError !== null}>
          <input
            id="inp-freibetrag"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="1.000"
            bind:value={freibetragStr}
            aria-label="Sparerpauschbetrag in Euro"
            aria-invalid={freibetragError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if freibetragError}
          <p class="field-error" role="alert">{freibetragError}</p>
        {/if}
      </div>

      <div class="input-field input-field--sm">
        <label class="input-field__label" for="inp-inflation">
          Inflationsrate
          <span class="default-badge">Standard 2,50&nbsp;%</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={inflationError !== null}>
          <input
            id="inp-inflation"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="2,50"
            bind:value={inflationStr}
            aria-label="Inflationsrate pro Jahr in Prozent"
            aria-invalid={inflationError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if inflationError}
          <p class="field-error" role="alert">{inflationError}</p>
        {/if}
      </div>

    </div>
  </div>

  <!-- Ergebnis -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">
    {#if result}

      <div class="results-grid">

        <div class="result-card result-card--primary">
          <span class="result-card__label">Brutto-Endkapital</span>
          <span class="result-card__value">{formatEuro(result.kn)}<span class="result-card__unit"> €</span></span>
          <span class="result-card__sub">Zinsertrag: +{formatEuro(result.zinsen)}&nbsp;€</span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Netto-Endkapital</span>
          <span class="result-card__value">{formatEuro(result.knNetto)}<span class="result-card__unit"> €</span></span>
          <span class="result-card__sub">
            {#if result.steuer > 0}
              Steuer: −{formatEuro(result.steuer)}&nbsp;€
            {:else}
              Unter Sparerpauschbetrag — steuerfrei
            {/if}
          </span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Real-Endkapital</span>
          <span class="result-card__value">{formatEuro(result.knReal)}<span class="result-card__unit"> €</span></span>
          <span class="result-card__sub">Realrendite: {formatProzent(result.realrendite, 2)}&nbsp;%&nbsp;p.a. (Fisher)</span>
        </div>

      </div>

      <!-- Effektivzins-Zeile -->
      <div class="effektivzins-row" aria-label="Effektivzins">
        <span class="effektivzins-label">Effektivzinssatz</span>
        <span class="effektivzins-value">{formatProzent(result.effektivzins, 4)}&nbsp;% p.a.</span>
      </div>

    {:else if !hasErrors && Number.isFinite(k0) && Number.isFinite(zinssatz)}
      <p class="empty-state">Gib alle Felder ein, um das Ergebnis zu sehen.</p>
    {/if}
  </div>

  <!-- Zurücksetzen -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>Zurücksetzen</button>
  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">
    Diese Berechnung dient ausschließlich zur unverbindlichen Information.
    Tatsächliche Zinsen, Steuerlasten und Renditen können abweichen.
  </p>

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label="Datenschutz-Hinweis">
    Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser
  </div>

</div>

<style>
  .zinsrechner-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Inputs Grid */
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
    gap: var(--space-4);
  }

  /* Defaults Section */
  .defaults-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .defaults-label {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .defaults-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
    gap: var(--space-3);
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

  .input-field--sm .input-field__input {
    font-size: 0.9375rem;
    padding: var(--space-2) 0;
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

  .result-card__label {
    font-size: 0.6875rem;
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

  .result-card__unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .result-card__sub {
    font-size: 0.6875rem;
    color: var(--color-text-subtle);
    line-height: 1.4;
    margin-top: var(--space-1);
  }

  /* Effektivzins */
  .effektivzins-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
  }

  .effektivzins-label {
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  .effektivzins-value {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-weight: 500;
  }

  /* Empty state */
  .empty-state {
    margin: 0;
    text-align: center;
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
    padding: var(--space-4) 0;
  }

  /* Actions */
  .actions-bar {
    display: flex;
    gap: var(--space-2);
  }

  .reset-btn {
    padding: var(--space-2) var(--space-4);
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
    font-size: 0.6875rem;
    color: var(--color-text);
    line-height: 1.5;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .input-field__wrap,
    .reset-btn {
      transition: none;
    }
  }
</style>
