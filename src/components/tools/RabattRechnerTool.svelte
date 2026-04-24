<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    parseDE,
    formatEuro,
    formatProzent,
    computeEndpreis,
    computeUrsprungspreis,
    computeRabattProzent,
    computeKettenrabatt,
  } from '../../lib/tools/rabatt-rechner';
  import type { RabattResult } from '../../lib/tools/rabatt-rechner';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  type Modus = 'standard' | 'rueck-preis' | 'rueck-rabatt' | 'kette';
  let modus = $state<Modus>('standard');

  // ---- Eingabe-States ----
  let ursprungspreisStr = $state('100');
  let endpreisStr = $state('');
  let rabattStr = $state('20');
  let rabatt1Str = $state('15');
  let rabatt2Str = $state('8');

  // ---- Clipboard ----
  let copied = $state(false);

  // ---- Geparste Werte ----
  const ursprungspreis = $derived(parseDE(ursprungspreisStr));
  const endpreis = $derived(parseDE(endpreisStr));
  const rabatt = $derived(parseDE(rabattStr));
  const rabatt1 = $derived(parseDE(rabatt1Str));
  const rabatt2 = $derived(parseDE(rabatt2Str));

  // ---- Validierung ----
  const ursprungspreisError = $derived.by<string | null>(() => {
    if (modus === 'rueck-preis') return null; // Ursprungspreis wird berechnet, nicht eingegeben
    if (!Number.isFinite(ursprungspreis)) return 'Bitte einen Betrag eingeben.';
    if (ursprungspreis <= 0) return 'Bitte einen positiven Betrag eingeben.';
    if (ursprungspreis > 9_999_999) return 'Maximalbetrag: 9.999.999 €';
    return null;
  });

  const endpreisError = $derived.by<string | null>(() => {
    if (modus !== 'rueck-preis' && modus !== 'rueck-rabatt') return null;
    if (!Number.isFinite(endpreis)) return 'Bitte einen Endpreis eingeben.';
    if (endpreis < 0) return 'Endpreis muss ≥ 0 sein.';
    if (
      modus === 'rueck-rabatt' &&
      Number.isFinite(ursprungspreis) &&
      ursprungspreis > 0 &&
      endpreis > ursprungspreis
    ) {
      return 'Endpreis darf nicht größer als Ursprungspreis sein.';
    }
    return null;
  });

  const rabattError = $derived.by<string | null>(() => {
    if (modus === 'rueck-rabatt' || modus === 'kette') return null;
    if (!Number.isFinite(rabatt)) return 'Bitte einen Rabatt-Prozentsatz eingeben.';
    if (rabatt < 0) return 'Rabatt muss ≥ 0 % sein.';
    if (rabatt > 100) return 'Rabatt kann nicht mehr als 100 % betragen.';
    return null;
  });

  const rabatt1Error = $derived.by<string | null>(() => {
    if (modus !== 'kette') return null;
    if (!Number.isFinite(rabatt1)) return 'Bitte Rabatt 1 eingeben.';
    if (rabatt1 < 0 || rabatt1 > 100) return 'Rabatt: 0–100 %';
    return null;
  });

  const rabatt2Error = $derived.by<string | null>(() => {
    if (modus !== 'kette') return null;
    if (!Number.isFinite(rabatt2)) return 'Bitte Rabatt 2 eingeben.';
    if (rabatt2 < 0 || rabatt2 > 100) return 'Rabatt: 0–100 %';
    return null;
  });

  const hasErrors = $derived(
    ursprungspreisError !== null ||
    endpreisError !== null ||
    rabattError !== null ||
    rabatt1Error !== null ||
    rabatt2Error !== null,
  );

  // ---- Ergebnis-Berechnung ----
  const result = $derived.by<RabattResult | null>(() => {
    if (hasErrors) return null;
    if (modus === 'standard') {
      if (!Number.isFinite(ursprungspreis) || !Number.isFinite(rabatt)) return null;
      return computeEndpreis(ursprungspreis, rabatt);
    }
    if (modus === 'rueck-preis') {
      if (!Number.isFinite(endpreis) || !Number.isFinite(rabatt)) return null;
      if (rabatt >= 100) return null;
      return computeUrsprungspreis(endpreis, rabatt);
    }
    if (modus === 'rueck-rabatt') {
      if (!Number.isFinite(ursprungspreis) || !Number.isFinite(endpreis)) return null;
      if (ursprungspreis <= 0) return null;
      return computeRabattProzent(ursprungspreis, endpreis);
    }
    if (modus === 'kette') {
      if (!Number.isFinite(ursprungspreis) || !Number.isFinite(rabatt1) || !Number.isFinite(rabatt2)) return null;
      return computeKettenrabatt(ursprungspreis, rabatt1, rabatt2);
    }
    return null;
  });

  // ---- Additivfallen-Erklärung (Kettenrabatt-Modus, White-Space-Feature) ----
  const additivFalle = $derived.by<{ naive: number; richtig: number } | null>(() => {
    if (modus !== 'kette') return null;
    if (!Number.isFinite(rabatt1) || !Number.isFinite(rabatt2)) return null;
    const naive = Math.round((rabatt1 + rabatt2) * 100) / 100;
    const richtig = Math.round((1 - (1 - rabatt1 / 100) * (1 - rabatt2 / 100)) * 10000) / 100;
    if (naive === richtig) return null; // Kein Erklärungsbedarf wenn identisch (z.B. einer = 0)
    return { naive, richtig };
  });

  // ---- Primäres Ergebnis für Copy-Button ----
  const primaryResultText = $derived.by<string | null>(() => {
    if (!result) return null;
    if (modus === 'standard' || modus === 'kette') return formatEuro(result.endpreis) + ' €';
    if (modus === 'rueck-preis') return formatEuro(result.ursprungspreis) + ' €';
    if (modus === 'rueck-rabatt') return formatProzent(result.rabattProzent) + ' %';
    return null;
  });

  async function copyResult() {
    if (!primaryResultText) return;
    try {
      await navigator.clipboard.writeText(primaryResultText);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch { /* Clipboard nicht verfügbar */ }
  }

  function handleReset() {
    ursprungspreisStr = '100';
    endpreisStr = '';
    rabattStr = '20';
    rabatt1Str = '15';
    rabatt2Str = '8';
    modus = 'standard';
    copied = false;
  }
</script>

<div class="rabatt-tool" aria-label="Rabatt-Rechner">

  <!-- Modus-Toggle -->
  <div class="modus-bar">
    <span class="modus-bar__label">Berechne</span>
    <div class="modus-pills" role="group" aria-label="Berechnungsmodus auswählen">
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'standard'}
        aria-pressed={modus === 'standard'}
        onclick={() => { modus = 'standard'; }}
      >Endpreis</button>
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'rueck-preis'}
        aria-pressed={modus === 'rueck-preis'}
        onclick={() => { modus = 'rueck-preis'; }}
      >Ursprungspreis</button>
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'rueck-rabatt'}
        aria-pressed={modus === 'rueck-rabatt'}
        onclick={() => { modus = 'rueck-rabatt'; }}
      >Rabatt&nbsp;%</button>
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'kette'}
        aria-pressed={modus === 'kette'}
        onclick={() => { modus = 'kette'; }}
      >Kettenrabatt</button>
    </div>
  </div>

  <!-- Eingabefelder -->
  <div class="inputs-grid">

    <!-- Ursprungspreis (alle Modi außer rueck-preis) -->
    {#if modus !== 'rueck-preis'}
      <div class="input-field">
        <label class="input-field__label" for="inp-ursprungspreis">Ursprungspreis</label>
        <div class="input-field__wrap" class:input-field__wrap--error={ursprungspreisError !== null}>
          <input
            id="inp-ursprungspreis"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 100"
            bind:value={ursprungspreisStr}
            aria-label="Ursprungspreis in Euro"
            aria-invalid={ursprungspreisError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if ursprungspreisError}
          <p class="field-error" role="alert">{ursprungspreisError}</p>
        {/if}
      </div>
    {/if}

    <!-- Endpreis-Input (Modus rueck-preis und rueck-rabatt) -->
    {#if modus === 'rueck-preis' || modus === 'rueck-rabatt'}
      <div class="input-field">
        <label class="input-field__label" for="inp-endpreis">
          {modus === 'rueck-preis' ? 'Endpreis (bezahlt)' : 'Endpreis'}
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={endpreisError !== null}>
          <input
            id="inp-endpreis"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 80"
            bind:value={endpreisStr}
            aria-label="Endpreis in Euro"
            aria-invalid={endpreisError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if endpreisError}
          <p class="field-error" role="alert">{endpreisError}</p>
        {/if}
      </div>
    {/if}

    <!-- Rabatt% (Standard und rueck-preis) -->
    {#if modus === 'standard' || modus === 'rueck-preis'}
      <div class="input-field">
        <label class="input-field__label" for="inp-rabatt">Rabatt</label>
        <div class="input-field__wrap" class:input-field__wrap--error={rabattError !== null}>
          <input
            id="inp-rabatt"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 20"
            bind:value={rabattStr}
            aria-label="Rabatt in Prozent"
            aria-invalid={rabattError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if rabattError}
          <p class="field-error" role="alert">{rabattError}</p>
        {/if}
      </div>
    {/if}

    <!-- Kettenrabatt: zwei Rabattsätze -->
    {#if modus === 'kette'}
      <div class="input-field">
        <label class="input-field__label" for="inp-rabatt1">Rabatt 1</label>
        <div class="input-field__wrap" class:input-field__wrap--error={rabatt1Error !== null}>
          <input
            id="inp-rabatt1"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 15"
            bind:value={rabatt1Str}
            aria-label="Erster Rabattsatz in Prozent"
            aria-invalid={rabatt1Error !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if rabatt1Error}
          <p class="field-error" role="alert">{rabatt1Error}</p>
        {/if}
      </div>
      <div class="input-field">
        <label class="input-field__label" for="inp-rabatt2">Rabatt 2</label>
        <div class="input-field__wrap" class:input-field__wrap--error={rabatt2Error !== null}>
          <input
            id="inp-rabatt2"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 8"
            bind:value={rabatt2Str}
            aria-label="Zweiter Rabattsatz in Prozent"
            aria-invalid={rabatt2Error !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if rabatt2Error}
          <p class="field-error" role="alert">{rabatt2Error}</p>
        {/if}
      </div>
    {/if}

  </div><!-- /inputs-grid -->

  <!-- Ergebnis-Bereich -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">

    {#if result}
      <!-- Summary-Cards -->
      <div class="summary-grid">

        {#if modus === 'standard' || modus === 'kette'}
          <div class="summary-card summary-card--primary">
            <span class="summary-card__label">Endpreis</span>
            <span class="summary-card__value">{formatEuro(result.endpreis)} <span class="summary-card__unit">€</span></span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Du sparst</span>
            <span class="summary-card__value">−{formatEuro(result.rabattBetrag)} <span class="summary-card__unit">€</span></span>
          </div>
          {#if modus === 'kette' && result.gesamtRabattProzent !== undefined}
            <div class="summary-card">
              <span class="summary-card__label">Gesamtrabatt</span>
              <span class="summary-card__value">{formatProzent(result.gesamtRabattProzent)} <span class="summary-card__unit">%</span></span>
            </div>
          {:else}
            <div class="summary-card">
              <span class="summary-card__label">Rabatt</span>
              <span class="summary-card__value">{formatProzent(result.rabattProzent)} <span class="summary-card__unit">%</span></span>
            </div>
          {/if}

        {:else if modus === 'rueck-preis'}
          <div class="summary-card summary-card--primary">
            <span class="summary-card__label">Ursprungspreis</span>
            <span class="summary-card__value">{formatEuro(result.ursprungspreis)} <span class="summary-card__unit">€</span></span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Ersparnis</span>
            <span class="summary-card__value">−{formatEuro(result.rabattBetrag)} <span class="summary-card__unit">€</span></span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Endpreis</span>
            <span class="summary-card__value">{formatEuro(result.endpreis)} <span class="summary-card__unit">€</span></span>
          </div>

        {:else if modus === 'rueck-rabatt'}
          <div class="summary-card summary-card--primary">
            <span class="summary-card__label">Rabatt</span>
            <span class="summary-card__value">{formatProzent(result.rabattProzent)} <span class="summary-card__unit">%</span></span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Du sparst</span>
            <span class="summary-card__value">−{formatEuro(result.rabattBetrag)} <span class="summary-card__unit">€</span></span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Ursprungspreis</span>
            <span class="summary-card__value">{formatEuro(result.ursprungspreis)} <span class="summary-card__unit">€</span></span>
          </div>
        {/if}

      </div><!-- /summary-grid -->

      <!-- Copy-Button -->
      <div class="copy-row">
        <button type="button" class="copy-btn" onclick={copyResult} aria-label="Ergebnis in Zwischenablage kopieren">
          {#if copied}Kopiert ✓{:else}Ergebnis kopieren{/if}
        </button>
      </div>

      <!-- Additivfallen-Erklärung (Kettenrabatt, White-Space-Feature Dossier §9 H1) -->
      {#if modus === 'kette' && additivFalle !== null}
        <div class="additiv-box" role="note" aria-label="Erklärung: Warum addieren sich Rabatte nicht?">
          <div class="additiv-box__header">
            <span class="additiv-box__icon" aria-hidden="true">i</span>
            <strong>Warum {formatProzent(rabatt1)}&nbsp;% + {formatProzent(rabatt2)}&nbsp;% ≠ {formatProzent(additivFalle.naive)}&nbsp;% Gesamtrabatt?</strong>
          </div>
          <p class="additiv-box__text">
            Jeder Rabatt wird auf den <em>bereits reduzierten</em> Preis angewendet. Der zweite Rabatt
            bezieht sich also nicht mehr auf den Originalpreis, sondern auf den günstigeren Zwischenpreis.
          </p>
          <div class="additiv-box__math" aria-label="Rechenweg Kettenrabatt">
            <span class="additiv-box__calc">
              {formatProzent(rabatt1)}&nbsp;%&thinsp;+&thinsp;{formatProzent(rabatt2)}&nbsp;%
              <span class="calc--wrong">≠&thinsp;{formatProzent(additivFalle.naive)}&nbsp;%</span>
            </span>
            <span class="additiv-box__sep" aria-hidden="true">→</span>
            <span class="additiv-box__calc">
              Richtig: <span class="calc--right">{formatProzent(additivFalle.richtig)}&nbsp;%</span>
            </span>
          </div>
        </div>
      {/if}

    {:else if !hasErrors}
      <p class="empty-state">Gib die Werte ein, um das Ergebnis sofort zu sehen.</p>
    {/if}

  </div><!-- /results -->

  <!-- Zurücksetzen -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>Zurücksetzen</button>
  </div>

  <!-- Privacy Badge -->
  <div class="privacy-badge" aria-label="Datenschutz-Hinweis">
    Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser
  </div>

</div><!-- /rabatt-tool -->

<style>
  .rabatt-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ---- Modus-Bar ---- */
  .modus-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }
  .modus-bar__label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .modus-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .modus-pill {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }
  .modus-pill:hover {
    background: var(--color-surface-raised);
  }
  .modus-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  /* ---- Inputs ---- */
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-4);
  }

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

  /* ---- Summary Cards ---- */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: var(--space-3);
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .summary-card--primary {
    border-color: var(--color-text);
  }

  .summary-card__label {
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    font-weight: 500;
  }

  .summary-card__value {
    font-size: 1.25rem;
    font-family: var(--font-family-mono);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.2;
  }

  .summary-card__unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  /* ---- Copy Row ---- */
  .copy-row {
    display: flex;
    justify-content: flex-end;
  }

  .copy-btn {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    font-family: var(--font-family-mono);
    letter-spacing: 0.01em;
  }
  .copy-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  /* ---- Additivfallen-Erklärung (White-Space-Feature Dossier §9 H1) ---- */
  .additiv-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    font-size: var(--font-size-small);
    color: var(--color-text);
    line-height: 1.5;
  }

  .additiv-box__header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .additiv-box__icon {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1.5px solid var(--color-text-muted);
    color: var(--color-text-muted);
    font-weight: 700;
    font-size: 0.6875rem;
    font-style: italic;
    line-height: 1;
    margin-top: 0.1rem;
  }

  .additiv-box__text {
    margin: 0;
    color: var(--color-text-muted);
  }

  .additiv-box__math {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    font-family: var(--font-family-mono);
    font-size: 0.8125rem;
  }

  .additiv-box__calc {
    color: var(--color-text);
  }

  .additiv-box__sep {
    color: var(--color-text-subtle);
    font-size: 0.75rem;
  }

  .calc--wrong {
    color: var(--color-error);
    text-decoration: line-through;
  }

  .calc--right {
    color: var(--color-success);
    font-weight: 600;
  }

  /* ---- Empty State ---- */
  .empty-state {
    margin: 0;
    text-align: center;
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
    padding: var(--space-4) 0;
  }

  /* ---- Actions ---- */
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

  /* ---- Privacy Badge ---- */
  .privacy-badge {
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .modus-pill,
    .input-field__wrap,
    .reset-btn,
    .copy-btn {
      transition: none;
    }
  }
</style>
