<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    computeSkonto,
    getAmpelStatus,
    formatEuro,
    formatProzent,
  } from '../../lib/tools/skonto-rechner';
  import type { SkontoResult, AmpelStatus } from '../../lib/tools/skonto-rechner';
  import { dispatchToolUsed } from '../../lib/tracking';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  // ---- Skontobasis-Toggle ----
  type Basis = 'brutto' | 'netto';
  let basis = $state<Basis>('brutto');

  // ---- Eingabe-States ----
  let rechnungsBetragStr = $state('1000');
  let skontosatzStr = $state('2');
  let skontofristStr = $state('10');
  let zahlungszielStr = $state('30');
  let mwstSatzStr = $state('19');

  // ---- Clipboard ----
  let copiedField = $state<string | null>(null);

  // ---- Geparste Werte ----
  const rechnungsBetrag = $derived(parseDE(rechnungsBetragStr));
  const skontosatz = $derived(parseDE(skontosatzStr));
  const skontofrist = $derived(parseDE(skontofristStr));
  const zahlungsziel = $derived(parseDE(zahlungszielStr));
  const mwstSatz = $derived(parseDE(mwstSatzStr));

  // ---- Validierung ----
  const betragError = $derived.by<string | null>(() => {
    if (!Number.isFinite(rechnungsBetrag)) return 'Bitte einen Betrag eingeben.';
    if (rechnungsBetrag <= 0) return 'Bitte einen positiven Betrag eingeben.';
    return null;
  });

  const satzError = $derived.by<string | null>(() => {
    if (!Number.isFinite(skontosatz)) return 'Bitte einen Skontosatz eingeben.';
    if (skontosatz < 0) return 'Der Skontosatz kann nicht negativ sein.';
    if (skontosatz >= 100) return 'Ein Skontosatz von 100 % oder mehr ist nicht zulässig.';
    return null;
  });

  const skontofristError = $derived.by<string | null>(() => {
    if (!Number.isFinite(skontofrist)) return 'Bitte positive Tage eingeben.';
    if (skontofrist < 0) return 'Bitte positive Tage eingeben.';
    return null;
  });

  const zahlungszielError = $derived.by<string | null>(() => {
    if (!Number.isFinite(zahlungsziel)) return 'Bitte positive Tage eingeben.';
    if (zahlungsziel <= 0) return 'Bitte positive Tage eingeben.';
    if (Number.isFinite(skontofrist) && zahlungsziel <= skontofrist) {
      return 'Die Skontofrist muss kürzer sein als das Zahlungsziel.';
    }
    return null;
  });

  const mwstError = $derived.by<string | null>(() => {
    if (basis !== 'netto') return null;
    if (!Number.isFinite(mwstSatz)) return 'Bitte einen MwSt-Satz eingeben.';
    if (mwstSatz < 0) return 'MwSt-Satz muss ≥ 0 % sein.';
    return null;
  });

  const hasErrors = $derived(
    betragError !== null ||
    satzError !== null ||
    skontofristError !== null ||
    zahlungszielError !== null ||
    mwstError !== null,
  );

  // ---- Ergebnis-Berechnung (live on typing, O(1)) ----
  const result = $derived.by<SkontoResult | null>(() => {
    if (hasErrors) return null;
    if (!Number.isFinite(rechnungsBetrag) || !Number.isFinite(skontosatz)) return null;
    if (!Number.isFinite(skontofrist) || !Number.isFinite(zahlungsziel)) return null;
    const mwst = basis === 'netto' && Number.isFinite(mwstSatz) ? mwstSatz : undefined;
    return computeSkonto(rechnungsBetrag, skontosatz, skontofrist, zahlungsziel, mwst);
  });

  // Track first result for AdSense conversion attribution (Phase 2).
  let _firstResult = false;
  $effect(() => {
    if (!_firstResult && result !== null) {
      _firstResult = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: 'de' });
    }
  });

  const ampel = $derived.by<AmpelStatus>(() => {
    if (!result) return null;
    return getAmpelStatus(result.effJahreszins);
  });

  const ampelText = $derived.by<string>(() => {
    if (!result || result.effJahreszins === null) return '';
    if (ampel === 'gruen') return 'Skonto lohnt sich — günstiger als jeder Bankkredit';
    if (ampel === 'gelb') return 'Hängt von Ihrem Finanzierungszins ab';
    if (ampel === 'rot') return 'Skonto lohnt sich selten bei so niedrigem Zinssatz';
    return '';
  });

  // ---- Copy-Helper ----
  async function copyText(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedField = field;
      setTimeout(() => { if (copiedField === field) copiedField = null; }, 2000);
    } catch { /* Clipboard nicht verfügbar */ }
  }

  function handleReset() {
    rechnungsBetragStr = '1000';
    skontosatzStr = '2';
    skontofristStr = '10';
    zahlungszielStr = '30';
    mwstSatzStr = '19';
    basis = 'brutto';
    copiedField = null;
  }
</script>

<div class="skonto-tool" aria-label="Skonto-Rechner">

  <!-- Skontobasis-Toggle (Dossier §9 H1 — Privacy-First Brutto/Netto) -->
  <div class="basis-bar">
    <span class="basis-bar__label">Skontobasis</span>
    <div class="basis-pills" role="group" aria-label="Skontobasis auswählen">
      <button
        type="button"
        class="basis-pill"
        class:basis-pill--active={basis === 'brutto'}
        aria-pressed={basis === 'brutto'}
        onclick={() => { basis = 'brutto'; }}
      >Brutto</button>
      <button
        type="button"
        class="basis-pill"
        class:basis-pill--active={basis === 'netto'}
        aria-pressed={basis === 'netto'}
        onclick={() => { basis = 'netto'; }}
      >Netto&nbsp;+&nbsp;MwSt</button>
    </div>
    <span class="basis-hint">
      {basis === 'brutto'
        ? 'Buchhalterischer Standard (DE)'
        : 'Nettobetrag eingeben, MwSt wird separat ausgewiesen'}
    </span>
  </div>

  <!-- Eingabefelder -->
  <div class="inputs-grid">

    <!-- Rechnungsbetrag -->
    <div class="input-field">
      <label class="input-field__label" for="inp-betrag">
        {basis === 'brutto' ? 'Rechnungsbetrag (Brutto)' : 'Rechnungsbetrag (Netto)'}
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={betragError !== null}>
        <input
          id="inp-betrag"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 1000"
          bind:value={rechnungsBetragStr}
          aria-label="Rechnungsbetrag in Euro"
          aria-invalid={betragError !== null}
          aria-describedby={betragError ? 'err-betrag' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if betragError}
        <p id="err-betrag" class="field-error" role="alert">{betragError}</p>
      {/if}
    </div>

    <!-- Skontosatz -->
    <div class="input-field">
      <label class="input-field__label" for="inp-satz">Skontosatz</label>
      <div class="input-field__wrap" class:input-field__wrap--error={satzError !== null}>
        <input
          id="inp-satz"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 2"
          bind:value={skontosatzStr}
          aria-label="Skontosatz in Prozent"
          aria-invalid={satzError !== null}
          aria-describedby={satzError ? 'err-satz' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">%</span>
      </div>
      {#if satzError}
        <p id="err-satz" class="field-error" role="alert">{satzError}</p>
      {/if}
    </div>

    <!-- Skontofrist -->
    <div class="input-field">
      <label class="input-field__label" for="inp-skontofrist">Skontofrist</label>
      <div class="input-field__wrap" class:input-field__wrap--error={skontofristError !== null}>
        <input
          id="inp-skontofrist"
          type="text"
          inputmode="numeric"
          class="input-field__input"
          placeholder="z.B. 10"
          bind:value={skontofristStr}
          aria-label="Skontofrist in Tagen"
          aria-invalid={skontofristError !== null}
          aria-describedby={skontofristError ? 'err-skontofrist' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">Tage</span>
      </div>
      {#if skontofristError}
        <p id="err-skontofrist" class="field-error" role="alert">{skontofristError}</p>
      {/if}
    </div>

    <!-- Zahlungsziel -->
    <div class="input-field">
      <label class="input-field__label" for="inp-zahlungsziel">Zahlungsziel</label>
      <div class="input-field__wrap" class:input-field__wrap--error={zahlungszielError !== null}>
        <input
          id="inp-zahlungsziel"
          type="text"
          inputmode="numeric"
          class="input-field__input"
          placeholder="z.B. 30"
          bind:value={zahlungszielStr}
          aria-label="Zahlungsziel in Tagen"
          aria-invalid={zahlungszielError !== null}
          aria-describedby={zahlungszielError ? 'err-zahlungsziel' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">Tage</span>
      </div>
      {#if zahlungszielError}
        <p id="err-zahlungsziel" class="field-error" role="alert">{zahlungszielError}</p>
      {/if}
    </div>

    <!-- MwSt-Satz (nur Netto-Modus) -->
    {#if basis === 'netto'}
      <div class="input-field">
        <label class="input-field__label" for="inp-mwst">MwSt-Satz</label>
        <div class="input-field__wrap" class:input-field__wrap--error={mwstError !== null}>
          <input
            id="inp-mwst"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder="z.B. 19"
            bind:value={mwstSatzStr}
            aria-label="Mehrwertsteuersatz in Prozent"
            aria-invalid={mwstError !== null}
            aria-describedby={mwstError ? 'err-mwst' : undefined}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if mwstError}
          <p id="err-mwst" class="field-error" role="alert">{mwstError}</p>
        {/if}
      </div>
    {/if}

  </div><!-- /inputs-grid -->

  <!-- Ergebnis-Bereich -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">

    {#if result}

      <!-- Effektiver Jahreszins — Haupt-Insight mit Ampel (Dossier §9 H2) -->
      {#if result.effJahreszins !== null}
        <div
          class="jahreszins-card"
          class:jahreszins-card--gruen={ampel === 'gruen'}
          class:jahreszins-card--gelb={ampel === 'gelb'}
          class:jahreszins-card--rot={ampel === 'rot'}
          role="region"
          aria-label="Effektiver Jahreszins"
        >
          <div class="jahreszins-card__top">
            <div class="jahreszins-card__label-group">
              <span
                class="ampel-dot"
                class:ampel-dot--gruen={ampel === 'gruen'}
                class:ampel-dot--gelb={ampel === 'gelb'}
                class:ampel-dot--rot={ampel === 'rot'}
                aria-hidden="true"
              ></span>
              <span class="jahreszins-card__label">Effektiver Jahreszins (Lieferantenkredit)</span>
            </div>
            <button
              type="button"
              class="copy-inline"
              onclick={() => copyText(formatProzent(result!.effJahreszins!) + ' %', 'ejz')}
              aria-label="Jahreszins kopieren"
            >{copiedField === 'ejz' ? 'Kopiert' : 'Kopieren'}</button>
          </div>
          <div class="jahreszins-card__value">
            {formatProzent(result.effJahreszins)}&nbsp;<span class="jahreszins-card__unit">%&nbsp;p.a.</span>
          </div>
          {#if ampelText}
            <p class="jahreszins-card__hint">{ampelText}</p>
          {/if}
        </div>
      {/if}

      <!-- Ergebnis-Karten -->
      <div class="summary-grid">

        <div class="summary-card summary-card--primary">
          <div class="summary-card__header">
            <span class="summary-card__label">Skontobetrag</span>
            <button
              type="button"
              class="copy-inline"
              onclick={() => copyText(formatEuro(result!.skontoBetrag) + ' €', 'skonto')}
              aria-label="Skontobetrag kopieren"
            >{copiedField === 'skonto' ? 'Kopiert' : 'Kopieren'}</button>
          </div>
          <span class="summary-card__value">
            {formatEuro(result.skontoBetrag)}&nbsp;<span class="summary-card__unit">€</span>
          </span>
        </div>

        <div class="summary-card">
          <div class="summary-card__header">
            <span class="summary-card__label">Zahlbetrag</span>
            <button
              type="button"
              class="copy-inline"
              onclick={() => copyText(formatEuro(result!.zahlBetrag) + ' €', 'zahl')}
              aria-label="Zahlbetrag kopieren"
            >{copiedField === 'zahl' ? 'Kopiert' : 'Kopieren'}</button>
          </div>
          <span class="summary-card__value">
            {formatEuro(result.zahlBetrag)}&nbsp;<span class="summary-card__unit">€</span>
          </span>
        </div>

      </div><!-- /summary-grid -->

      <!-- Netto-Aufschlüsselung (nur Netto-Modus, Dossier §9 H1) -->
      {#if basis === 'netto' && result.nettoBasis}
        <div class="netto-box" role="region" aria-label="Netto-Aufschlüsselung">
          <p class="netto-box__title">Aufschlüsselung (Netto-Basis)</p>
          <dl class="netto-dl">
            <div class="netto-dl__row">
              <dt>Netto vor Skonto</dt>
              <dd>{formatEuro(result.nettoBasis.nettoVorSkonto)}&nbsp;€</dd>
            </div>
            <div class="netto-dl__row">
              <dt>Netto nach Skonto</dt>
              <dd>{formatEuro(result.nettoBasis.nettoNachSkonto)}&nbsp;€</dd>
            </div>
            <div class="netto-dl__row">
              <dt>MwSt nach Skonto ({formatProzent(mwstSatz, 0)}&nbsp;%)</dt>
              <dd>{formatEuro(result.nettoBasis.mwstNachSkonto)}&nbsp;€</dd>
            </div>
            <div class="netto-dl__row netto-dl__row--total">
              <dt>Brutto nach Skonto</dt>
              <dd>{formatEuro(result.nettoBasis.bruttoNachSkonto)}&nbsp;€</dd>
            </div>
          </dl>
          <p class="netto-box__hint">
            Hinweis: Durch den Skontoabzug reduziert sich auch die Vorsteuer des Käufers.
          </p>
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

</div><!-- /skonto-tool -->

<style>
  .skonto-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ---- Basis-Bar (Brutto/Netto Toggle) ---- */
  .basis-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .basis-bar__label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .basis-pills {
    display: flex;
    gap: var(--space-2);
  }

  .basis-pill {
    padding: var(--space-1) var(--space-3);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }
  .basis-pill:hover {
    background: var(--color-surface-raised);
  }
  .basis-pill:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .basis-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  .basis-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    letter-spacing: 0.01em;
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

  /* ---- Jahreszins-Card (Haupt-Insight, Dossier §9 H2) ---- */
  .jahreszins-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .jahreszins-card--gruen {
    border-color: var(--color-success);
  }
  .jahreszins-card--gelb {
    border-color: var(--color-warning, var(--color-border));
  }
  .jahreszins-card--rot {
    border-color: var(--color-error);
  }

  .jahreszins-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .jahreszins-card__label-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .jahreszins-card__label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 500;
  }

  .ampel-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--color-text-subtle);
  }
  .ampel-dot--gruen { background: var(--color-success); }
  .ampel-dot--gelb  { background: var(--color-warning); }
  .ampel-dot--rot   { background: var(--color-error); }

  .jahreszins-card__value {
    font-size: 2rem;
    font-family: var(--font-family-mono);
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.1;
  }

  .jahreszins-card__unit {
    font-size: 1.125rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .jahreszins-card__hint {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  /* ---- Summary Cards ---- */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
    gap: var(--space-3);
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .summary-card--primary {
    border-color: var(--color-text);
  }

  .summary-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .summary-card__label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 500;
  }

  .summary-card__value {
    font-size: 1.375rem;
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

  /* ---- Copy-Inline-Button ---- */
  .copy-inline {
    padding: var(--space-1) var(--space-2);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-subtle);
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
    cursor: pointer;
    font-family: var(--font-family-mono);
    letter-spacing: 0.01em;
    white-space: nowrap;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .copy-inline:hover {
    border-color: var(--color-text-muted);
    color: var(--color-text);
  }
  .copy-inline:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ---- Netto-Aufschlüsselung (Dossier §9 H1) ---- */
  .netto-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    font-size: var(--font-size-small);
  }

  .netto-box__title {
    margin: 0;
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .netto-dl {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
  }

  .netto-dl__row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-1) 0;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  .netto-dl__row--total {
    border-bottom: none;
    color: var(--color-text);
    font-weight: 600;
    font-family: var(--font-family-mono);
    padding-top: var(--space-2);
  }

  .netto-dl__row dt {
    flex: 1;
  }

  .netto-dl__row dd {
    margin: 0;
    font-family: var(--font-family-mono);
    text-align: right;
  }

  .netto-box__hint {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.4;
    font-style: italic;
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
  .reset-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ---- Privacy Badge ---- */
  .privacy-badge {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .basis-pill,
    .input-field__wrap,
    .reset-btn,
    .copy-inline {
      transition: none;
    }
  }
</style>
