<script lang="ts">
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    formatEuro,
    formatPct,
    computeMonatsrate,
    computeMonatsrateFromAnfangstilgung,
    computeLaufzeit,
    computeTilgungsplan,
  } from '../../lib/tools/tilgungsplan-rechner';
  import type { TilgungsplanResult } from '../../lib/tools/tilgungsplan-rechner';
  import { dispatchToolUsed } from '../../lib/tracking';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    toolId: string;
    categoryId: string;
    lang: Lang;
  }
  let { toolId, categoryId, lang }: Props = $props();
  const strings = $derived(t(lang));
  const T = $derived(strings.tools.tilgungsplan);

  // ---- Berechnungs-Modus ----
  type Modus = 'anfangstilgung' | 'monatsrate' | 'laufzeit';
  let modus = $state<Modus>('anfangstilgung');

  // ---- Eingabe-States ----
  let betragStr = $state('300.000');
  let zinssatzStr = $state('3,50');
  let anfangstilgungStr = $state('2,00');
  let monatsrateStr = $state('');
  let laufzeitStr = $state('');
  let zinsbindungStr = $state('10');
  let sondertilgungStr = $state('');

  // ---- Computed: geparste Werte ----
  const betrag = $derived(parseDE(betragStr));
  const zinssatz = $derived(parseDE(zinssatzStr));
  const anfangstilgung = $derived(parseDE(anfangstilgungStr));
  const monatsrateInput = $derived(parseDE(monatsrateStr));
  const laufzeitInput = $derived(parseDE(laufzeitStr));
  const zinsbindung = $derived(parseDE(zinsbindungStr));
  const sondertilgung = $derived(sondertilgungStr.trim() === '' ? 0 : parseDE(sondertilgungStr));

  // ---- Validierung ----
  const betragError = $derived.by<string | null>(() => {
    if (!Number.isFinite(betrag)) return T.errAmountRequired;
    if (betrag < 1000) return T.errAmountMin;
    if (betrag > 10_000_000) return T.errAmountMax;
    return null;
  });

  const zinssatzError = $derived.by<string | null>(() => {
    if (!Number.isFinite(zinssatz)) return T.errInterestRequired;
    if (zinssatz < 0.1) return T.errInterestMin;
    if (zinssatz > 20) return T.errInterestMax;
    return null;
  });

  const anfangstilgungError = $derived.by<string | null>(() => {
    if (modus !== 'anfangstilgung') return null;
    if (!Number.isFinite(anfangstilgung)) return T.errInitialPayoffRequired;
    if (anfangstilgung <= 0) return T.errInitialPayoffMin;
    if (anfangstilgung > 20) return T.errInitialPayoffMax;
    return null;
  });

  const monatsrateError = $derived.by<string | null>(() => {
    if (modus !== 'monatsrate') return null;
    if (!Number.isFinite(monatsrateInput)) return T.errMonthlyRequired;
    if (monatsrateInput <= 0) return T.errMonthlyMin;
    if (Number.isFinite(zinssatz) && Number.isFinite(betrag)) {
      const monatszins = betrag * (zinssatz / 100 / 12);
      if (monatsrateInput <= monatszins) {
        return T.errMonthlyTooLow.replace('{amount}', formatEuro(monatszins));
      }
    }
    return null;
  });

  const laufzeitError = $derived.by<string | null>(() => {
    if (modus !== 'laufzeit') return null;
    if (!Number.isFinite(laufzeitInput)) return T.errTermRequired;
    if (laufzeitInput < 1 || laufzeitInput > 50) return T.errTermRange;
    return null;
  });

  const zinsbindungError = $derived.by<string | null>(() => {
    if (!Number.isFinite(zinsbindung)) return T.errFixedTermRequired;
    if (zinsbindung < 1 || zinsbindung > 40) return T.errFixedTermRange;
    return null;
  });

  const sondertilgungError = $derived.by<string | null>(() => {
    if (sondertilgungStr.trim() === '') return null;
    if (!Number.isFinite(sondertilgung)) return T.errExtraAmountInvalid;
    if (sondertilgung < 0) return T.errExtraNegative;
    if (Number.isFinite(betrag) && sondertilgung > betrag * 0.5) {
      return T.errExtraTooLarge;
    }
    return null;
  });

  const hasErrors = $derived(
    betragError !== null ||
    zinssatzError !== null ||
    anfangstilgungError !== null ||
    monatsrateError !== null ||
    laufzeitError !== null ||
    zinsbindungError !== null,
  );

  // ---- Berechnete Monatsrate aus dem gewählten Modus ----
  const effectiveMonatsrate = $derived.by<number>(() => {
    if (!Number.isFinite(betrag) || !Number.isFinite(zinssatz)) return NaN;
    if (betrag < 1000 || zinssatz < 0.1 || zinssatz > 20) return NaN;

    if (modus === 'anfangstilgung') {
      if (!Number.isFinite(anfangstilgung) || anfangstilgung <= 0) return NaN;
      return computeMonatsrateFromAnfangstilgung(betrag, zinssatz, anfangstilgung);
    }
    if (modus === 'monatsrate') {
      if (!Number.isFinite(monatsrateInput) || monatsrateInput <= 0) return NaN;
      const monatszins = betrag * (zinssatz / 100 / 12);
      if (monatsrateInput <= monatszins) return NaN;
      return monatsrateInput;
    }
    if (modus === 'laufzeit') {
      if (!Number.isFinite(laufzeitInput) || laufzeitInput < 1 || laufzeitInput > 50) return NaN;
      return computeMonatsrate(betrag, zinssatz, Math.round(laufzeitInput) * 12);
    }
    return NaN;
  });

  // ---- Tilgungsplan-Ergebnis ----
  const result = $derived.by<TilgungsplanResult | null>(() => {
    if (!Number.isFinite(effectiveMonatsrate)) return null;
    if (!Number.isFinite(zinsbindung) || zinsbindung < 1 || zinsbindung > 40) return null;
    if (hasErrors) return null;

    return computeTilgungsplan({
      betrag,
      zinssatzJahrPct: zinssatz,
      monatsrate: effectiveMonatsrate,
      zinsbindungJahre: Math.round(zinsbindung),
      sondertilgungPA: Number.isFinite(sondertilgung) && sondertilgung > 0 ? sondertilgung : 0,
    });
  });

  // Track first result for AdSense conversion attribution (Phase 2).
  let _firstResult = false;
  $effect(() => {
    if (!_firstResult && result !== null) {
      _firstResult = true;
      dispatchToolUsed({ slug: toolId, category: categoryId, locale: lang });
    }
  });

  // Abgeleitete Laufzeit (für Modus monatsrate — zeigt berechnete Laufzeit)
  const abgeleitetereLaufzeit = $derived.by<number | null>(() => {
    if (modus !== 'monatsrate') return null;
    if (!Number.isFinite(betrag) || !Number.isFinite(zinssatz) || !Number.isFinite(monatsrateInput)) return null;
    const n = computeLaufzeit(betrag, monatsrateInput, zinssatz);
    return Number.isFinite(n) ? n : null;
  });

  // ---- Anschlussfinanzierung ----
  let anschlussZinssatzStr = $state('4,00');
  const anschlussZinssatz = $derived(parseDE(anschlussZinssatzStr));

  const anschlussRate = $derived.by<number | null>(() => {
    if (!result) return null;
    if (result.restschuldNachZinsbindung <= 0) return null;
    if (!Number.isFinite(anschlussZinssatz) || anschlussZinssatz < 0.1 || anschlussZinssatz > 20) return null;
    const restLaufzeit = result.laufzeitMonate - Math.round(zinsbindung) * 12;
    if (restLaufzeit <= 0) return null;
    return computeMonatsrate(result.restschuldNachZinsbindung, anschlussZinssatz, restLaufzeit);
  });

  // ---- Copy Result ----
  type CopyState = 'idle' | 'copied';
  let copyResult = $state<CopyState>('idle');

  async function handleCopyResult() {
    if (!result) return;
    const lines = [
      T.clipboardTitle,
      T.clipboardMonthly.replace('{amount}', formatEuro(result.monatsrate)),
      T.clipboardTotalInterest.replace('{amount}', formatEuro(result.gesamtZinsen)),
      T.clipboardBalanceAfter.replace('{amount}', formatEuro(result.restschuldNachZinsbindung)),
      T.clipboardTerm
        .replace('{years}', String(result.laufzeitJahre))
        .replace('{months}', String(result.laufzeitMonate)),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      copyResult = 'copied';
      setTimeout(() => (copyResult = 'idle'), 1500);
    } catch {
      // clipboard permission denied — fail silent
    }
  }

  // ---- Zurücksetzen ----
  function handleReset() {
    betragStr = '300.000';
    zinssatzStr = '3,50';
    anfangstilgungStr = '2,00';
    monatsrateStr = '';
    laufzeitStr = '';
    zinsbindungStr = '10';
    sondertilgungStr = '';
    modus = 'anfangstilgung';
  }
</script>

<div class="tilgungsplan-tool" role="region" aria-label={T.regionAria}>

  <!-- Modus-Toggle -->
  <div class="modus-bar">
    <span class="modus-bar__label">{T.modeLabel}</span>
    <div class="modus-pills" role="group" aria-label={T.modeBarAria}>
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'anfangstilgung'}
        aria-pressed={modus === 'anfangstilgung'}
        onclick={() => { modus = 'anfangstilgung'; }}
      >{T.modeAnfangstilgung}</button>
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'monatsrate'}
        aria-pressed={modus === 'monatsrate'}
        onclick={() => { modus = 'monatsrate'; }}
      >{T.modeMonatsrate}</button>
      <button
        type="button"
        class="modus-pill"
        class:modus-pill--active={modus === 'laufzeit'}
        aria-pressed={modus === 'laufzeit'}
        onclick={() => { modus = 'laufzeit'; }}
      >{T.modeLaufzeit}</button>
    </div>
  </div>

  <!-- Eingabefelder -->
  <div class="inputs-grid">

    <!-- Darlehensbetrag -->
    <div class="input-field">
      <label class="input-field__label" for="inp-betrag">{T.loanAmountLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={betragError !== null}>
        <input
          id="inp-betrag"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.loanAmountPlaceholder}
          bind:value={betragStr}
          aria-label={T.loanAmountAria}
          aria-invalid={betragError !== null}
          aria-describedby={betragError ? 'inp-betrag-error' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if betragError}
        <p id="inp-betrag-error" class="field-error" role="alert">{betragError}</p>
      {/if}
    </div>

    <!-- Sollzinssatz -->
    <div class="input-field">
      <label class="input-field__label" for="inp-zinssatz">{T.interestRateLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={zinssatzError !== null}>
        <input
          id="inp-zinssatz"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.interestRatePlaceholder}
          bind:value={zinssatzStr}
          aria-label={T.interestRateAria}
          aria-invalid={zinssatzError !== null}
          aria-describedby={zinssatzError ? 'inp-zinssatz-error' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">%</span>
      </div>
      {#if zinssatzError}
        <p id="inp-zinssatz-error" class="field-error" role="alert">{zinssatzError}</p>
      {/if}
    </div>

    <!-- Modus-abhängiges Eingabefeld -->
    {#if modus === 'anfangstilgung'}
      <div class="input-field">
        <label class="input-field__label" for="inp-anfangstilgung">{T.initialPayoffLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={anfangstilgungError !== null}>
          <input
            id="inp-anfangstilgung"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.initialPayoffPlaceholder}
            bind:value={anfangstilgungStr}
            aria-label={T.initialPayoffAria}
            aria-invalid={anfangstilgungError !== null}
            aria-describedby={anfangstilgungError ? 'inp-anfangstilgung-error' : undefined}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">%</span>
        </div>
        {#if anfangstilgungError}
          <p id="inp-anfangstilgung-error" class="field-error" role="alert">{anfangstilgungError}</p>
        {/if}
      </div>
    {:else if modus === 'monatsrate'}
      <div class="input-field">
        <label class="input-field__label" for="inp-monatsrate">{T.desiredMonthlyLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={monatsrateError !== null}>
          <input
            id="inp-monatsrate"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.desiredMonthlyPlaceholder}
            bind:value={monatsrateStr}
            aria-label={T.desiredMonthlyAria}
            aria-invalid={monatsrateError !== null}
            aria-describedby={monatsrateError ? 'inp-monatsrate-error' : undefined}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">€</span>
        </div>
        {#if monatsrateError}
          <p id="inp-monatsrate-error" class="field-error" role="alert">{monatsrateError}</p>
        {/if}
      </div>
    {:else}
      <div class="input-field">
        <label class="input-field__label" for="inp-laufzeit">{T.desiredTermLabel}</label>
        <div class="input-field__wrap" class:input-field__wrap--error={laufzeitError !== null}>
          <input
            id="inp-laufzeit"
            type="text"
            inputmode="decimal"
            class="input-field__input"
            placeholder={T.desiredTermPlaceholder}
            bind:value={laufzeitStr}
            aria-label={T.desiredTermAria}
            aria-invalid={laufzeitError !== null}
            aria-describedby={laufzeitError ? 'inp-laufzeit-error' : undefined}
            autocomplete="off"
          />
          <span class="input-field__unit" aria-hidden="true">{T.unitYears}</span>
        </div>
        {#if laufzeitError}
          <p id="inp-laufzeit-error" class="field-error" role="alert">{laufzeitError}</p>
        {/if}
      </div>
    {/if}

    <!-- Zinsbindung -->
    <div class="input-field">
      <label class="input-field__label" for="inp-zinsbindung">{T.fixedTermLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={zinsbindungError !== null}>
        <input
          id="inp-zinsbindung"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.fixedTermPlaceholder}
          bind:value={zinsbindungStr}
          aria-label={T.fixedTermAria}
          aria-invalid={zinsbindungError !== null}
          aria-describedby={zinsbindungError ? 'inp-zinsbindung-error' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">{T.unitYears}</span>
      </div>
      {#if zinsbindungError}
        <p id="inp-zinsbindung-error" class="field-error" role="alert">{zinsbindungError}</p>
      {/if}
    </div>

    <!-- Sondertilgung (optional) -->
    <div class="input-field input-field--optional">
      <label class="input-field__label" for="inp-sondertilgung">
        {T.extraPayoffLabel}
        <span class="optional-badge">{T.optionalBadge}</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={sondertilgungError !== null}>
        <input
          id="inp-sondertilgung"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.extraPayoffPlaceholder}
          bind:value={sondertilgungStr}
          aria-label={T.extraPayoffAria}
          aria-invalid={sondertilgungError !== null}
          aria-describedby={sondertilgungError ? 'inp-sondertilgung-error' : undefined}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">{T.unitEuroPerYear}</span>
      </div>
      {#if sondertilgungError}
        <p id="inp-sondertilgung-error" class="field-error" role="alert">{sondertilgungError}</p>
      {/if}
    </div>

  </div><!-- /inputs-grid -->

  <!-- Ergebnis-Bereich -->
  <div class="results" role="region" aria-label={T.resultsAria}>

    {#if result}
      <!-- Copy Result -->
      <div class="result-actions">
        <button
          type="button"
          class="copy-btn"
          class:copy-btn--copied={copyResult === 'copied'}
          aria-label={copyResult === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
          onclick={handleCopyResult}
        >
          {#if copyResult === 'copied'}
            {strings.toolsCommon.copied}
          {:else}
            {strings.toolsCommon.copy}
          {/if}
        </button>
      </div>

      <!-- Summary-Cards -->
      <div class="summary-grid">
        <div class="summary-card summary-card--primary">
          <span class="summary-card__label">{T.cardMonthlyRate}</span>
          <span class="summary-card__value" aria-live="polite">{formatEuro(result.monatsrate)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">{T.cardTotalInterest}</span>
          <span class="summary-card__value" aria-live="polite">{formatEuro(result.gesamtZinsen)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">{T.cardBalanceAfter}</span>
          <span class="summary-card__value" aria-live="polite">{formatEuro(result.restschuldNachZinsbindung)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">{T.cardTotalTerm}</span>
          <span class="summary-card__value" aria-live="polite">
            {result.laufzeitJahre} <span class="summary-card__unit">{T.unitYears}</span>
            {#if result.laufzeitMonate % 12 !== 0}
              <span class="summary-card__sub">({result.laufzeitMonate} {T.unitMonths})</span>
            {/if}
          </span>
        </div>
        {#if modus === 'monatsrate' && abgeleitetereLaufzeit !== null}
          <div class="summary-card">
            <span class="summary-card__label">{T.cardInitialPayoff}</span>
            <span class="summary-card__value">{formatPct(result.anfangstilgungPct)} <span class="summary-card__unit">{T.unitPctPerYear}</span></span>
          </div>
        {/if}
      </div>

      <!-- Tilgungsparadoxon-Warnung -->
      {#if result.paradoxWarning}
        <div class="warning-box" role="alert" aria-label={T.warningParadoxAria}>
          <span class="warning-box__icon" aria-hidden="true">!</span>
          <div>
            <strong>{T.warningParadoxLabel}</strong>
            {@html ' ' + T.warningParadoxBodyHtml
              .replace('{init}', formatPct(result.anfangstilgungPct))
              .replace('{rate}', formatPct(zinssatz))
              .replace('{years}', String(result.laufzeitJahre))}
          </div>
        </div>
      {/if}

      <!-- Sondertilgung-Effekt -->
      {#if result.sondertilgungEinsparungZinsen > 0}
        <div class="sondertilgung-box" role="note" aria-label={T.extraEffectAria}>
          <div>
            {@html T.extraEffectBodyHtml
              .replace('{amount}', formatEuro(sondertilgung))
              .replace('{savings}', formatEuro(result.sondertilgungEinsparungZinsen))
              .replace('{months}', String(result.sondertilgungVerkürzungMonate))}
          </div>
        </div>
      {/if}

      <!-- Tilgungsplan-Tabelle -->
      <div class="table-section">
        <div class="table-header">
          <h2 class="table-title">{T.tableTitle}</h2>
        </div>
        <div class="table-wrap" role="region" aria-label={T.tableScrollAria} tabindex="0">
          <table class="tilgungsplan-table" aria-label={T.tableAria}>
            <thead>
              <tr>
                <th scope="col">{T.colYear}</th>
                <th scope="col">{T.colRatePerYear}</th>
                <th scope="col">{T.colInterest}</th>
                <th scope="col">{T.colPrincipal}</th>
                {#if result.rows.some((r) => r.sondertilgungJahr > 0)}
                  <th scope="col">{T.colExtra}</th>
                {/if}
                <th scope="col">{T.colBalance}</th>
              </tr>
            </thead>
            <tbody>
              {#each result.rows as row (row.jahr)}
                <tr class:row--zinsbindungsende={row.isZinsbindungsende}>
                  <th scope="row" class="cell--year">
                    {row.jahr}
                    {#if row.isZinsbindungsende}
                      <span
                        class="zinsbindungsende-marker"
                        aria-label={T.endOfFixedTerm}
                        title={T.endOfFixedTerm}
                      >{T.endOfFixedTermBadge}</span>
                    {/if}
                  </th>
                  <td class="cell--num">{formatEuro(row.rateJahr)}</td>
                  <td class="cell--num">{formatEuro(row.zinsenJahr)}</td>
                  <td class="cell--num">{formatEuro(row.tilgungJahr)}</td>
                  {#if result.rows.some((r) => r.sondertilgungJahr > 0)}
                    <td class="cell--num">{row.sondertilgungJahr > 0 ? formatEuro(row.sondertilgungJahr) : '—'}</td>
                  {/if}
                  <td class="cell--num cell--restschuld">{formatEuro(row.restschuld)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Anschlussfinanzierung -->
      {#if result.restschuldNachZinsbindung > 0}
        <div class="anschluss-section" role="region" aria-label={T.followupAria}>
          <h2 class="anschluss-title">{T.followupTitle}</h2>
          <p class="anschluss-desc">
            {@html T.followupRemainingBalanceHtml
              .replace('{years}', `${Math.round(zinsbindung)} ${T.unitYears}`)
              .replace('{amount}', formatEuro(result.restschuldNachZinsbindung))}
          </p>
          <div class="anschluss-input-row">
            <label class="anschluss-label" for="inp-anschluss-zinssatz">{T.followupNewRateLabel}</label>
            <div class="anschluss-input-wrap">
              <input
                id="inp-anschluss-zinssatz"
                type="text"
                inputmode="decimal"
                class="anschluss-input"
                placeholder={T.followupNewRatePlaceholder}
                bind:value={anschlussZinssatzStr}
                aria-label={T.followupNewRateAria}
                autocomplete="off"
              />
              <span class="anschluss-unit" aria-hidden="true">%</span>
            </div>
            {#if anschlussRate !== null}
              <div class="anschluss-result" aria-live="polite">
                {@html T.followupNewMonthlyHtml.replace('{amount}', formatEuro(anschlussRate))}
              </div>
            {/if}
          </div>
          <p class="anschluss-hint">
            {T.followupRemainingTerm.replace(
              '{years}',
              `${result.laufzeitJahre - Math.round(zinsbindung)} ${T.unitYears}`,
            )}
          </p>
        </div>
      {/if}

    {:else if !hasErrors && Number.isFinite(betrag) && Number.isFinite(zinssatz)}
      <p class="empty-state">{T.emptyState}</p>
    {/if}

  </div><!-- /results -->

  <!-- Reset button -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>{strings.toolsCommon.reset}</button>
  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">{T.disclaimer}</p>

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    {T.privacyBadge}
  </div>

</div><!-- /tilgungsplan-tool -->

<style>
  .tilgungsplan-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Modus-Bar */
  .modus-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }
  .modus-bar__label {
    font-size: var(--font-size-small);
    color: var(--color-text);
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
    padding: var(--space-2) var(--space-3);
    min-height: 2.75rem;
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
  .modus-pill:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: var(--r-md);
  }

  /* Inputs Grid */
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
    color: var(--color-text);
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .optional-badge {
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: 0 var(--space-1);
    font-weight: 400;
    text-transform: uppercase;
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
    color: var(--color-text-muted);
    flex-shrink: 0;
    white-space: nowrap;
  }

  .field-error {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-error);
    line-height: 1.4;
  }

  /* Result actions (copy) */
  .result-actions {
    display: flex;
    justify-content: flex-end;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    white-space: nowrap;
  }
  .copy-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }
  .copy-btn--copied {
    border-color: var(--color-success);
    color: var(--color-success);
  }
  .copy-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Summary Grid */
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
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
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

  .summary-card__sub {
    display: block;
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--color-text-muted);
    margin-top: var(--space-1);
  }

  /* Tilgungsparadoxon Warning */
  .warning-box {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-error);
    border-radius: var(--r-md);
    background: color-mix(in oklch, var(--color-error) 8%, transparent);
    font-size: var(--font-size-small);
    color: var(--color-text);
    line-height: 1.5;
  }

  .warning-box__icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1.5px solid var(--color-error);
    color: var(--color-error);
    font-weight: 700;
    font-size: 0.75rem;
    font-style: normal;
  }

  /* Sondertilgung Box */
  .sondertilgung-box {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-success);
    border-radius: var(--r-md);
    background: color-mix(in oklch, var(--color-success) 8%, transparent);
    font-size: var(--font-size-small);
    color: var(--color-text);
    line-height: 1.5;
  }

  /* Table */
  .table-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .table-title {
    margin: 0;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
  }

  .table-wrap:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .tilgungsplan-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
  }

  .tilgungsplan-table thead th {
    padding: var(--space-2) var(--space-3);
    text-align: right;
    font-weight: 600;
    color: var(--color-text-muted);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
    letter-spacing: 0.01em;
  }

  .tilgungsplan-table thead th:first-child {
    text-align: left;
  }

  .tilgungsplan-table tbody td,
  .tilgungsplan-table tbody th {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    text-align: right;
    white-space: nowrap;
    font-weight: normal;
  }

  .tilgungsplan-table tbody tr:last-child td,
  .tilgungsplan-table tbody tr:last-child th {
    border-bottom: none;
  }

  .tilgungsplan-table tbody tr:hover td,
  .tilgungsplan-table tbody tr:hover th {
    background: var(--color-surface);
  }

  .row--zinsbindungsende td,
  .row--zinsbindungsende th {
    background: var(--color-surface);
  }

  .cell--year {
    text-align: left !important;
    font-weight: 500;
    color: var(--color-text-muted);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .cell--num {
    text-align: right;
  }

  .cell--restschuld {
    font-weight: 600;
  }

  .zinsbindungsende-marker {
    font-size: 0.6rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: 1px var(--space-1);
    font-family: var(--font-family-sans, var(--font-family-mono));
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Anschluss-Rechner */
  .anschluss-section {
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .anschluss-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .anschluss-desc {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }

  .anschluss-input-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .anschluss-label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .anschluss-input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    padding: 0 var(--space-3);
    width: 8rem;
    min-height: 2.75rem;
  }
  .anschluss-input-wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }

  .anschluss-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 0.9375rem;
    font-family: var(--font-family-mono);
    padding: var(--space-2) 0;
    min-width: 0;
    width: 4rem;
  }

  .anschluss-unit {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }

  .anschluss-result {
    font-size: var(--font-size-small);
    color: var(--color-text);
  }

  .anschluss-hint {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  /* Empty state */
  .empty-state {
    margin: 0;
    text-align: center;
    color: var(--color-text-muted);
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
    border-radius: var(--r-md);
  }

  /* Disclaimer */
  .disclaimer {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    line-height: 1.5;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .modus-pill,
    .input-field__wrap,
    .copy-btn,
    .reset-btn {
      transition: none;
    }
  }
</style>
