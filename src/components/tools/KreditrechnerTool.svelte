<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    computeKreditErgebnis,
    buildTilgungsplan,
  } from '../../lib/tools/kreditrechner';
  import type { TilgungsplanZeile } from '../../lib/tools/kreditrechner';
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
  const T = $derived(strings.tools.loanCalculator);

  // ---- Hilfsfunktionen ----
  function formatEuro(n: number): string {
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ---- Eingabe-States ----
  let kreditbetragStr = $state('200.000');
  let sollzinsStr = $state('3,80');
  let laufzeitStr = $state('240');
  let sondertilgungStr = $state('');

  // ---- Computed: geparste Werte ----
  const kreditbetrag = $derived(parseDE(kreditbetragStr));
  const sollzins = $derived(parseDE(sollzinsStr));
  const laufzeit = $derived(parseDE(laufzeitStr));
  const sondertilgung = $derived(sondertilgungStr.trim() === '' ? 0 : parseDE(sondertilgungStr));

  // ---- Validierung ----
  const kreditbetragError = $derived.by<string | null>(() => {
    if (!Number.isFinite(kreditbetrag)) return T.errAmountRequired;
    if (kreditbetrag <= 0) return T.errAmountMin;
    if (kreditbetrag > 10_000_000) return T.errAmountMax;
    return null;
  });

  const sollzinsError = $derived.by<string | null>(() => {
    if (!Number.isFinite(sollzins)) return T.errInterestRequired;
    if (sollzins <= 0) return T.errInterestMin;
    if (sollzins > 20) return T.errInterestMax;
    return null;
  });

  const laufzeitError = $derived.by<string | null>(() => {
    if (!Number.isFinite(laufzeit)) return T.errTermRequired;
    if (laufzeit < 1) return T.errTermMin;
    if (laufzeit > 600) return T.errTermMax;
    return null;
  });

  const sondertilgungError = $derived.by<string | null>(() => {
    if (sondertilgungStr.trim() === '') return null;
    if (!Number.isFinite(sondertilgung)) return T.errExtraAmountInvalid;
    if (sondertilgung < 0) return T.errExtraNegative;
    if (Number.isFinite(kreditbetrag) && sondertilgung > kreditbetrag * 0.5) {
      return T.errExtraTooLarge;
    }
    return null;
  });

  const hasErrors = $derived(
    kreditbetragError !== null ||
    sollzinsError !== null ||
    laufzeitError !== null,
  );

  // ---- Berechnung ----
  const ergebnis = $derived.by(() => {
    if (hasErrors) return null;
    if (!Number.isFinite(kreditbetrag) || !Number.isFinite(sollzins) || !Number.isFinite(laufzeit)) return null;
    const r = computeKreditErgebnis(kreditbetrag, sollzins, Math.round(laufzeit), sondertilgung);
    if (!Number.isFinite(r.monatsrate)) return null;
    return r;
  });

  // Track first result for AdSense conversion attribution (Phase 2).
  let _firstResult = false;
  $effect(() => {
    if (!_firstResult && ergebnis !== null) {
      _firstResult = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: lang });
    }
  });

  // Tilgungsplan (jährliche Übersicht) — nur wenn Ergebnis da
  const tilgungsplan = $derived.by<TilgungsplanZeile[]>(() => {
    if (!ergebnis) return [];
    return buildTilgungsplan(kreditbetrag, sollzins, Math.round(laufzeit), sondertilgung);
  });

  // Jährliche Zusammenfassung aus monatlichem Plan
  interface JahrZeile {
    jahr: number;
    zinsenJahr: number;
    tilgungJahr: number;
    sondertilgungJahr: number;
    restschuld: number;
  }

  const jahresplan = $derived.by<JahrZeile[]>(() => {
    if (tilgungsplan.length === 0) return [];
    const map = new Map<number, JahrZeile>();
    for (const z of tilgungsplan) {
      const jahr = Math.ceil(z.monat / 12);
      const existing = map.get(jahr);
      if (existing) {
        existing.zinsenJahr += z.zinsanteil;
        existing.tilgungJahr += z.tilgungsanteil;
        existing.sondertilgungJahr += z.sondertilgung;
        existing.restschuld = z.restschuld;
      } else {
        map.set(jahr, {
          jahr,
          zinsenJahr: z.zinsanteil,
          tilgungJahr: z.tilgungsanteil,
          sondertilgungJahr: z.sondertilgung,
          restschuld: z.restschuld,
        });
      }
    }
    return Array.from(map.values());
  });

  const hatSondertilgung = $derived(jahresplan.some((r) => r.sondertilgungJahr > 0));

  // ---- Zurücksetzen ----
  function handleReset() {
    kreditbetragStr = '200.000';
    sollzinsStr = '3,80';
    laufzeitStr = '240';
    sondertilgungStr = '';
  }
</script>

<section class="kreditrechner-tool" aria-label={T.regionAria}>

  <!-- Eingabefelder -->
  <div class="inputs-grid">

    <div class="input-field">
      <label class="input-field__label" for="inp-kreditbetrag">{T.loanAmountLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={kreditbetragError !== null}>
        <input
          id="inp-kreditbetrag"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.loanAmountPlaceholder}
          bind:value={kreditbetragStr}
          aria-label={T.loanAmountAria}
          aria-invalid={kreditbetragError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if kreditbetragError}
        <p class="field-error" role="alert">{kreditbetragError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-sollzins">{T.interestRateLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={sollzinsError !== null}>
        <input
          id="inp-sollzins"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.interestRatePlaceholder}
          bind:value={sollzinsStr}
          aria-label={T.interestRateAria}
          aria-invalid={sollzinsError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">%</span>
      </div>
      {#if sollzinsError}
        <p class="field-error" role="alert">{sollzinsError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-laufzeit">{T.termLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={laufzeitError !== null}>
        <input
          id="inp-laufzeit"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.termPlaceholder}
          bind:value={laufzeitStr}
          aria-label={T.termAria}
          aria-invalid={laufzeitError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">{T.unitMonths}</span>
      </div>
      {#if laufzeitError}
        <p class="field-error" role="alert">{laufzeitError}</p>
      {/if}
    </div>

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
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">{T.unitEuroPerYear}</span>
      </div>
      {#if sondertilgungError}
        <p class="field-error" role="alert">{sondertilgungError}</p>
      {/if}
    </div>

  </div><!-- /inputs-grid -->

  <!-- Ergebnis-Bereich -->
  <div class="results" aria-live="polite" aria-label={T.resultsAria}>

    {#if ergebnis}
      <!-- Haupt-Summary-Cards -->
      <div class="summary-grid">
        <div class="summary-card summary-card--primary">
          <span class="summary-card__label">{T.cardMonthlyRate}</span>
          <span class="summary-card__value">{formatEuro(ergebnis.monatsrate)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">{T.cardTotalInterest}</span>
          <span class="summary-card__value">{formatEuro(ergebnis.gesamtzinsen)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">{T.cardTotalCost}</span>
          <span class="summary-card__value">{formatEuro(ergebnis.gesamtkosten)} <span class="summary-card__unit">€</span></span>
        </div>
      </div>

      <!-- Sondertilgungs-Delta (Differenzierung H2) -->
      {#if ergebnis.ersparnis_zinsen > 0}
        <div class="sondertilgung-box" role="note" aria-label={T.extraEffectAria}>
          <span class="sondertilgung-box__icon" aria-hidden="true">✓</span>
          <div>
            {@html T.extraEffectBodyHtml
              .replace('{amount}', formatEuro(sondertilgung))
              .replace('{savings}', formatEuro(ergebnis.ersparnis_zinsen))
              .replace('{months}', String(ergebnis.ersparnis_monate))}
          </div>
        </div>
      {/if}

      <!-- Tilgungsplan Jahresübersicht -->
      {#if jahresplan.length > 0}
        <div class="table-section">
          <div class="table-header">
            <h2 class="table-title">{T.tableTitle}</h2>
          </div>
          <div class="table-wrap">
            <table class="tilgungsplan-table" aria-label={T.tableAria}>
              <thead>
                <tr>
                  <th scope="col">{T.colYear}</th>
                  <th scope="col">{T.colInterest}</th>
                  <th scope="col">{T.colPrincipal}</th>
                  {#if hatSondertilgung}
                    <th scope="col">{T.colExtra}</th>
                  {/if}
                  <th scope="col">{T.colBalance}</th>
                </tr>
              </thead>
              <tbody>
                {#each jahresplan as row (row.jahr)}
                  <tr>
                    <td class="cell--year">{row.jahr}</td>
                    <td class="cell--num">{formatEuro(row.zinsenJahr)}</td>
                    <td class="cell--num">{formatEuro(row.tilgungJahr)}</td>
                    {#if hatSondertilgung}
                      <td class="cell--num">{row.sondertilgungJahr > 0 ? formatEuro(row.sondertilgungJahr) : '—'}</td>
                    {/if}
                    <td class="cell--num cell--restschuld">{formatEuro(row.restschuld)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

    {:else if !hasErrors && Number.isFinite(kreditbetrag) && Number.isFinite(sollzins) && Number.isFinite(laufzeit)}
      <p class="empty-state">{T.emptyStateCheckFields}</p>
    {:else if !Number.isFinite(kreditbetrag) || !Number.isFinite(sollzins) || !Number.isFinite(laufzeit)}
      <p class="empty-state">{T.emptyStateFillFields}</p>
    {/if}

  </div><!-- /results -->

  <!-- Reset button -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>{strings.toolsCommon.reset}</button>
  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">
    {T.disclaimer}
  </p>

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    {T.privacyBadge}
  </div>

</section><!-- /kreditrechner-tool -->

<style>
  .kreditrechner-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
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
    color: var(--color-text);
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
    color: var(--color-text);
    flex-shrink: 0;
    white-space: nowrap;
  }

  .field-error {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-error);
    line-height: 1.4;
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
    color: var(--color-text);
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
    color: var(--color-text);
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

  .sondertilgung-box__icon {
    flex-shrink: 0;
    color: var(--color-success);
    font-weight: 700;
    font-size: 1rem;
    font-style: normal;
    line-height: 1.4;
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
    gap: var(--space-3);
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

  .tilgungsplan-table tbody td {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    text-align: right;
    white-space: nowrap;
  }

  .tilgungsplan-table tbody tr:last-child td {
    border-bottom: none;
  }

  .tilgungsplan-table tbody tr:hover td {
    background: var(--color-surface);
  }

  .cell--year {
    text-align: left !important;
    font-weight: 500;
    color: var(--color-text);
  }

  .cell--num {
    text-align: right;
  }

  .cell--restschuld {
    font-weight: 600;
  }

  /* Empty state */
  .empty-state {
    margin: 0;
    text-align: center;
    color: var(--color-text);
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
    .input-field__wrap,
    .reset-btn {
      transition: none;
    }
  }
</style>
