<script lang="ts">
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    computeCashflowDirekt,
    computeCashflowIndirekt,
    computeFreeCashflow,
    formatEuro,
  } from '../../lib/tools/cash-flow-calculator';
  import type { DirectResult, IndirectResult, FreeCfResult } from '../../lib/tools/cash-flow-calculator';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    lang: Lang;
  }
  let { lang }: Props = $props();
  const strings = $derived(t(lang));
  const T = $derived(strings.tools.cashFlowCalculator);

  type Mode = 'direkt' | 'indirekt' | 'free';
  let mode = $state<Mode>('direkt');

  // ---- Direkte Methode ----
  let einzahlungenStr = $state('85.000');
  let auszahlungenStr = $state('72.000');

  // ---- Indirekte Methode ----
  let juStr = $state('20.000');
  let afaStr = $state('15.000');
  let rueckstellungenStr = $state('0');
  let forderungenStr = $state('5.000');
  let vorraedeStr = $state('0');
  let verbindlichkeitenStr = $state('0');

  // ---- Free Cashflow ----
  let ocfStr = $state('30.000');
  let capexStr = $state('10.000');

  // ---- Copy-State ----
  let copiedField = $state<string | null>(null);

  // ---- Parsed: Direkt ----
  const einzahlungen = $derived(parseDE(einzahlungenStr));
  const auszahlungen = $derived(parseDE(auszahlungenStr));

  // ---- Parsed: Indirekt ----
  const ju = $derived(parseDE(juStr));
  const afa = $derived(parseDE(afaStr));
  const rueckstellungen = $derived(parseDE(rueckstellungenStr));
  const forderungen = $derived(parseDE(forderungenStr));
  const vorraede = $derived(parseDE(vorraedeStr));
  const verbindlichkeiten = $derived(parseDE(verbindlichkeitenStr));

  // ---- Parsed: Free CF ----
  const ocf = $derived(parseDE(ocfStr));
  const capex = $derived(parseDE(capexStr));

  // ---- Validierung: Direkt ----
  const einzahlungenError = $derived.by<string | null>(() => {
    if (!Number.isFinite(einzahlungen)) return T.errInvalidNumber;
    if (einzahlungen < 0) return T.errEinzahlungenNegative;
    return null;
  });

  const auszahlungenError = $derived.by<string | null>(() => {
    if (!Number.isFinite(auszahlungen)) return T.errInvalidNumber;
    if (auszahlungen < 0) return T.errAuszahlungenNegative;
    return null;
  });

  // ---- Validierung: Indirekt ----
  const juError = $derived.by<string | null>(() => {
    if (!Number.isFinite(ju)) return T.errInvalidNumber;
    return null;
  });

  const afaError = $derived.by<string | null>(() => {
    if (!Number.isFinite(afa)) return T.errInvalidNumber;
    if (afa < 0) return T.errAfaNegative;
    return null;
  });

  const rueckstellungenError = $derived.by<string | null>(() => {
    if (!Number.isFinite(rueckstellungen)) return T.errInvalidNumber;
    return null;
  });

  const forderungenError = $derived.by<string | null>(() => {
    if (!Number.isFinite(forderungen)) return T.errInvalidNumber;
    return null;
  });

  const vorraedeError = $derived.by<string | null>(() => {
    if (!Number.isFinite(vorraede)) return T.errInvalidNumber;
    return null;
  });

  const verbindlichkeitenError = $derived.by<string | null>(() => {
    if (!Number.isFinite(verbindlichkeiten)) return T.errInvalidNumber;
    return null;
  });

  // ---- Validierung: Free CF ----
  const ocfError = $derived.by<string | null>(() => {
    if (!Number.isFinite(ocf)) return T.errInvalidNumber;
    return null;
  });

  const capexError = $derived.by<string | null>(() => {
    if (!Number.isFinite(capex)) return T.errInvalidNumber;
    if (capex < 0) return T.errCapexNegative;
    return null;
  });

  // ---- Ergebnisse ----
  const direktResult = $derived.by<DirectResult | null>(() => {
    if (mode !== 'direkt') return null;
    if (einzahlungenError !== null || auszahlungenError !== null) return null;
    if (!Number.isFinite(einzahlungen) || !Number.isFinite(auszahlungen)) return null;
    return computeCashflowDirekt(einzahlungen, auszahlungen);
  });

  const indirektResult = $derived.by<IndirectResult | null>(() => {
    if (mode !== 'indirekt') return null;
    if (
      juError !== null || afaError !== null ||
      rueckstellungenError !== null || forderungenError !== null ||
      vorraedeError !== null || verbindlichkeitenError !== null
    ) return null;
    if (
      !Number.isFinite(ju) || !Number.isFinite(afa) ||
      !Number.isFinite(rueckstellungen) || !Number.isFinite(forderungen) ||
      !Number.isFinite(vorraede) || !Number.isFinite(verbindlichkeiten)
    ) return null;
    return computeCashflowIndirekt(ju, afa, rueckstellungen, forderungen, vorraede, verbindlichkeiten);
  });

  const freeCfResult = $derived.by<FreeCfResult | null>(() => {
    if (mode !== 'free') return null;
    if (ocfError !== null || capexError !== null) return null;
    if (!Number.isFinite(ocf) || !Number.isFinite(capex)) return null;
    return computeFreeCashflow(ocf, capex);
  });

  const activeResult = $derived(direktResult ?? indirektResult ?? freeCfResult);
  const activeCf = $derived(
    direktResult?.cashflow ?? indirektResult?.ocf ?? freeCfResult?.freeCf ?? null,
  );
  const activeStatus = $derived(activeResult?.status ?? null);

  // ---- Copy ----
  async function copyText(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedField = field;
      setTimeout(() => { if (copiedField === field) copiedField = null; }, 2000);
    } catch { /* Clipboard nicht verfügbar */ }
  }

  // ---- Reset ----
  function handleReset() {
    einzahlungenStr = '85.000';
    auszahlungenStr = '72.000';
    juStr = '20.000';
    afaStr = '15.000';
    rueckstellungenStr = '0';
    forderungenStr = '5.000';
    vorraedeStr = '0';
    verbindlichkeitenStr = '0';
    ocfStr = '30.000';
    capexStr = '10.000';
    copiedField = null;
  }
</script>

<div class="cf-tool" aria-label={T.regionAria}>

  <!-- Methoden-Tabs -->
  <div class="mode-switcher" role="tablist" aria-label={T.modeAria}>
    <button
      role="tab"
      class="mode-btn"
      class:mode-btn--active={mode === 'direkt'}
      aria-selected={mode === 'direkt'}
      onclick={() => { mode = 'direkt'; }}
    >{T.modeDirekt}</button>
    <button
      role="tab"
      class="mode-btn"
      class:mode-btn--active={mode === 'indirekt'}
      aria-selected={mode === 'indirekt'}
      onclick={() => { mode = 'indirekt'; }}
    >{T.modeIndirekt}</button>
    <button
      role="tab"
      class="mode-btn"
      class:mode-btn--active={mode === 'free'}
      aria-selected={mode === 'free'}
      onclick={() => { mode = 'free'; }}
    >{T.modeFree}</button>
  </div>

  <!-- Methoden-Beschreibung -->
  <p class="mode-desc">
    {#if mode === 'direkt'}
      {T.descDirekt}
    {:else if mode === 'indirekt'}
      {T.descIndirekt}
    {:else}
      {T.descFree}
    {/if}
  </p>

  <!-- Eingaben: Direkte Methode -->
  {#if mode === 'direkt'}
    <div class="inputs-grid">

      <div class="input-field">
        <label class="input-field__label" for="inp-einz">{T.einzahlungenLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={einzahlungenError !== null}>
          <input
            id="inp-einz"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.einzahlungenPlaceholder}
            bind:value={einzahlungenStr}
            aria-label={T.einzahlungenAria}
            aria-invalid={einzahlungenError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if einzahlungenError}
          <p class="field-error" role="alert">{einzahlungenError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-ausz">{T.auszahlungenLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={auszahlungenError !== null}>
          <input
            id="inp-ausz"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.auszahlungenPlaceholder}
            bind:value={auszahlungenStr}
            aria-label={T.auszahlungenAria}
            aria-invalid={auszahlungenError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if auszahlungenError}
          <p class="field-error" role="alert">{auszahlungenError}</p>
        {/if}
      </div>

    </div>
  {/if}

  <!-- Eingaben: Indirekte Methode -->
  {#if mode === 'indirekt'}
    <div class="inputs-grid inputs-grid--wide">

      <div class="input-field">
        <label class="input-field__label" for="inp-ju">
          {T.juLabel}
          <span class="field-hint">{T.juHint}</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={juError !== null}>
          <input
            id="inp-ju"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.juPlaceholder}
            bind:value={juStr}
            aria-label={T.juAria}
            aria-invalid={juError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if juError}
          <p class="field-error" role="alert">{juError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-afa">{T.afaLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={afaError !== null}>
          <input
            id="inp-afa"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.afaPlaceholder}
            bind:value={afaStr}
            aria-label={T.afaAria}
            aria-invalid={afaError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if afaError}
          <p class="field-error" role="alert">{afaError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-rueck">
          {T.rueckLabel}
          <span class="field-hint">{T.rueckHint}</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={rueckstellungenError !== null}>
          <input
            id="inp-rueck"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.rueckPlaceholder}
            bind:value={rueckstellungenStr}
            aria-label={T.rueckAria}
            aria-invalid={rueckstellungenError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if rueckstellungenError}
          <p class="field-error" role="alert">{rueckstellungenError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-ford">
          {T.fordLabel}
          <span class="field-hint">{T.fordHint}</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={forderungenError !== null}>
          <input
            id="inp-ford"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.fordPlaceholder}
            bind:value={forderungenStr}
            aria-label={T.fordAria}
            aria-invalid={forderungenError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if forderungenError}
          <p class="field-error" role="alert">{forderungenError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-vorr">
          {T.vorrLabel}
          <span class="field-hint">{T.vorrHint}</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={vorraedeError !== null}>
          <input
            id="inp-vorr"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.vorrPlaceholder}
            bind:value={vorraedeStr}
            aria-label={T.vorrAria}
            aria-invalid={vorraedeError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if vorraedeError}
          <p class="field-error" role="alert">{vorraedeError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-verb">
          {T.verbLabel}
          <span class="field-hint">{T.verbHint}</span>
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={verbindlichkeitenError !== null}>
          <input
            id="inp-verb"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.verbPlaceholder}
            bind:value={verbindlichkeitenStr}
            aria-label={T.verbAria}
            aria-invalid={verbindlichkeitenError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if verbindlichkeitenError}
          <p class="field-error" role="alert">{verbindlichkeitenError}</p>
        {/if}
      </div>

    </div>
  {/if}

  <!-- Eingaben: Free Cashflow -->
  {#if mode === 'free'}
    <div class="inputs-grid">

      <div class="input-field">
        <label class="input-field__label" for="inp-ocf">{T.ocfLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={ocfError !== null}>
          <input
            id="inp-ocf"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.ocfPlaceholder}
            bind:value={ocfStr}
            aria-label={T.ocfAria}
            aria-invalid={ocfError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if ocfError}
          <p class="field-error" role="alert">{ocfError}</p>
        {/if}
      </div>

      <div class="input-field">
        <label class="input-field__label" for="inp-capex">
          {T.capexLabel}
        </label>
        <div class="input-field__wrap" class:input-field__wrap--error={capexError !== null}>
          <input
            id="inp-capex"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.capexPlaceholder}
            bind:value={capexStr}
            aria-label={T.capexAria}
            aria-invalid={capexError !== null}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if capexError}
          <p class="field-error" role="alert">{capexError}</p>
        {/if}
      </div>

    </div>
  {/if}

  <!-- Ergebnis-Bereich -->
  <div class="results" aria-live="polite" aria-label={T.resultsAria}>

    {#if activeResult && activeCf !== null}

      <!-- Haupt-Ergebnis-Karte -->
      <div
        class="cf-card"
        class:cf-card--positiv={activeStatus === 'positiv'}
        class:cf-card--negativ={activeStatus === 'negativ'}
        role="region"
        aria-label={T.resultRegionAria}
      >
        <div class="cf-card__top">
          <div class="cf-card__label-group">
            <span
              class="status-dot"
              class:status-dot--positiv={activeStatus === 'positiv'}
              class:status-dot--negativ={activeStatus === 'negativ'}
              class:status-dot--null={activeStatus === 'null'}
              aria-hidden="true"
            ></span>
            <span class="cf-card__label">
              {mode === 'direkt' ? T.cardCashflow : mode === 'indirekt' ? T.cardOcf : T.cardFreeCf}
            </span>
          </div>
          <button
            type="button"
            class="copy-inline"
            onclick={() => copyText(formatEuro(activeCf) + ' €', 'cf')}
            aria-label={strings.toolsCommon.copyAria}
          >{copiedField === 'cf' ? strings.toolsCommon.copied : strings.toolsCommon.copy}</button>
        </div>

        <div class="cf-card__value">
          {formatEuro(activeCf)}&nbsp;<span class="cf-card__unit">€</span>
        </div>

        <p class="cf-card__status">
          {#if activeStatus === 'positiv'}
            {T.statusPositiv}
          {:else if activeStatus === 'negativ'}
            {T.statusNegativ}
          {:else}
            {T.statusBreakeven}
          {/if}
        </p>
      </div>

      <!-- Lernmoment: Gewinn ≠ Liquidität (Dossier §9 H2) -->
      {#if indirektResult?.hatLernmoment}
        <div class="lernmoment" role="note" aria-label={T.lernmomentAria}>
          <span class="lernmoment__label">{T.lernmomentLabel}</span>
          <p class="lernmoment__text">
            {@html T.lernmomentTextHtml
              .replace('{ju}', formatEuro(indirektResult.jahresueberschuss))
              .replace('{ocf}', formatEuro(indirektResult.ocf))}
          </p>
        </div>
      {/if}

      <!-- Free-CF-Erklärung -->
      {#if freeCfResult}
        <div class="lernmoment" role="note" aria-label={T.freeAria}>
          <span class="lernmoment__label">{T.freeLabel}</span>
          <p class="lernmoment__text">
            {@html T.freeTextHtml
              .replace('{capex}', formatEuro(freeCfResult.capex))
              .replace('{free}', formatEuro(freeCfResult.freeCf))}
          </p>
        </div>
      {/if}

      <!-- Formel-Aufschlüsselung -->
      <div class="formel-row" aria-label={T.formelAria}>
        <span class="formel-label">{T.formelLabel}</span>
        <span class="formel-text">{activeResult.formelText}</span>
      </div>

    {:else}
      <p class="empty-state">{T.emptyState}</p>
    {/if}

  </div><!-- /results -->

  <!-- Aktionen -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>{strings.toolsCommon.reset}</button>
  </div>

  <!-- Privacy Badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    {T.privacyBadge}
  </div>

</div><!-- /cf-tool -->

<style>
  .cf-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ---- Methoden-Tabs ---- */
  .mode-switcher {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    width: fit-content;
    flex-wrap: wrap;
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

  .mode-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ---- Methoden-Beschreibung ---- */
  .mode-desc {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  /* ---- Inputs ---- */
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-4);
  }

  .inputs-grid--wide {
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
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
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .field-hint {
    font-size: 0.625rem;
    font-weight: 400;
    color: var(--color-text-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: 0 var(--space-1);
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

  /* ---- Cashflow-Ergebnis-Karte ---- */
  .cf-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .cf-card--positiv {
    border-color: var(--color-success);
  }

  .cf-card--negativ {
    border-color: var(--color-error);
  }

  .cf-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .cf-card__label-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--color-text-subtle);
  }

  .status-dot--positiv { background: var(--color-success); }
  .status-dot--negativ { background: var(--color-error); }
  .status-dot--null    { background: var(--color-text-subtle); }

  .cf-card__label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 500;
  }

  .cf-card__value {
    font-size: 2.25rem;
    font-family: var(--font-family-mono);
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.1;
  }

  .cf-card__unit {
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .cf-card__status {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  /* ---- Copy Inline ---- */
  .copy-inline {
    padding: var(--space-1) var(--space-2);
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

  /* ---- Lernmoment-Box (Dossier §9 H2) ---- */
  .lernmoment {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .lernmoment__label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .lernmoment__text {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  /* `<strong>` lives inside {@html} — :global to keep Svelte scoped CSS alive. */
  .lernmoment__text :global(strong) {
    color: var(--color-text);
    font-weight: 600;
  }

  /* ---- Formel-Zeile ---- */
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

  /* ---- Results ---- */
  .results {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
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
    .mode-btn,
    .input-field__wrap,
    .copy-inline,
    .reset-btn {
      transition: none;
    }
  }
</style>
