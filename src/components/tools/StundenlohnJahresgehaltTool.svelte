<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    parseWage,
    formatEuroFull,
    computeSchnell,
    computeExakt,
    BUNDESLAENDER,
    MINDESTLOHN_2026,
    MINDESTLOHN_2027,
    MINIJOB_GRENZE_2026,
  } from '../../lib/tools/stundenlohn-jahresgehalt';
  import { dispatchToolUsed } from '../../lib/tracking';
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
  const T = $derived(strings.tools.hourlyToAnnual);

  // ── Direction ──────────────────────────────────────────────────────────────
  type Direction = 'stundenlohn-zu-gehalt' | 'gehalt-zu-stundenlohn';
  let direction = $state<Direction>('stundenlohn-zu-gehalt');

  // ── Formula mode ───────────────────────────────────────────────────────────
  type FormulaMode = 'schnell' | 'exakt';
  let formulaMode = $state<FormulaMode>('schnell');

  // ── Primary inputs ─────────────────────────────────────────────────────────
  let stundenlohnStr = $state<string>('');
  let jahresgehaltStr = $state<string>('');

  // ── Common parameters ──────────────────────────────────────────────────────
  let wochenstunden = $state<number>(40);
  const QUICK_SELECT_STUNDEN = [20, 32, 35, 40, 42] as const;

  // ── Exakt-mode params ──────────────────────────────────────────────────────
  let urlaubstage = $state<number>(30);
  let selectedBundesland = $state<string>('NW');

  const bundeslandFeiertage = $derived(
    BUNDESLAENDER.find((b) => b.id === selectedBundesland)?.feiertage ?? 10,
  );

  // ── Parsed inputs ──────────────────────────────────────────────────────────
  const parsedStundenlohn = $derived(parseWage(stundenlohnStr));
  const parsedJahresgehalt = $derived(parseWage(jahresgehaltStr));

  // ── Computed result ────────────────────────────────────────────────────────
  const result = $derived.by(() => {
    if (formulaMode === 'schnell') {
      if (direction === 'stundenlohn-zu-gehalt') {
        if (parsedStundenlohn === null) return null;
        return computeSchnell({ stundenlohn: parsedStundenlohn, wochenstunden });
      } else {
        if (parsedJahresgehalt === null) return null;
        return computeSchnell({ jahresgehalt: parsedJahresgehalt, wochenstunden });
      }
    } else {
      if (direction === 'stundenlohn-zu-gehalt') {
        if (parsedStundenlohn === null) return null;
        return computeExakt({
          stundenlohn: parsedStundenlohn,
          wochenstunden,
          urlaubstage,
          feiertage: bundeslandFeiertage,
        });
      } else {
        if (parsedJahresgehalt === null) return null;
        return computeExakt({
          jahresgehalt: parsedJahresgehalt,
          wochenstunden,
          urlaubstage,
          feiertage: bundeslandFeiertage,
        });
      }
    }
  });

  // Track first result for AdSense conversion attribution (Phase 2).
  let _firstResult = false;
  $effect(() => {
    if (!_firstResult && result !== null) {
      _firstResult = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: lang });
    }
  });

  // ── Warnings ───────────────────────────────────────────────────────────────
  const unterMindestlohn = $derived.by<boolean>(() => {
    if (!result) return false;
    return result.stundenlohn > 0 && result.stundenlohn < MINDESTLOHN_2026;
  });
  const ueberArbZG = $derived(wochenstunden > 48);
  const minijobWarnung = $derived.by<boolean>(() => {
    if (!result) return false;
    return result.monatsgehalt > 0 && result.monatsgehalt < MINIJOB_GRENZE_2026;
  });

  // ── Formel-Erklärung ───────────────────────────────────────────────────────
  const formulaExplanation = $derived.by<string>(() => {
    if (formulaMode === 'schnell') {
      return T.formulaSchnellTemplate.replace('{hours}', String(wochenstunden));
    }
    const at = result && 'arbeitstage' in result ? (result as { arbeitstage: number }).arbeitstage : (260 - urlaubstage - bundeslandFeiertage);
    const th = (wochenstunden / 5).toFixed(1);
    return T.formulaExaktTemplate
      .replace('{workdays}', String(at))
      .replace('{hoursPerDay}', th)
      .replace('{vacation}', String(urlaubstage))
      .replace('{holidays}', String(bundeslandFeiertage));
  });

  // ── Copy state ─────────────────────────────────────────────────────────────
  type CopyKey = 'stundenlohn' | 'jahresgehalt' | 'monatsgehalt' | 'wochengehalt' | 'tagesgehalt';
  let copyState = $state<Record<CopyKey, 'idle' | 'copied'>>({
    stundenlohn: 'idle',
    jahresgehalt: 'idle',
    monatsgehalt: 'idle',
    wochengehalt: 'idle',
    tagesgehalt: 'idle',
  });

  async function copyValue(key: CopyKey, value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      copyState = { ...copyState, [key]: 'copied' };
      setTimeout(() => { copyState = { ...copyState, [key]: 'idle' }; }, 1500);
    } catch {
      // clipboard permission denied — fail silent
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function handleReset() {
    stundenlohnStr = '';
    jahresgehaltStr = '';
  }
</script>

<div class="sl-tool">
  <!-- Direction toggle -->
  <div class="direction-bar">
    <div class="direction-pills" role="group" aria-label={T.directionAria}>
      <button
        type="button"
        class="dir-pill"
        class:dir-pill--active={direction === 'stundenlohn-zu-gehalt'}
        onclick={() => { direction = 'stundenlohn-zu-gehalt'; jahresgehaltStr = ''; }}
        aria-pressed={direction === 'stundenlohn-zu-gehalt'}
      >{T.directionToSalary}</button>
      <button
        type="button"
        class="dir-pill"
        class:dir-pill--active={direction === 'gehalt-zu-stundenlohn'}
        onclick={() => { direction = 'gehalt-zu-stundenlohn'; stundenlohnStr = ''; }}
        aria-pressed={direction === 'gehalt-zu-stundenlohn'}
      >{T.directionToHourly}</button>
    </div>
  </div>

  <!-- Primary input -->
  {#if direction === 'stundenlohn-zu-gehalt'}
    <div class="input-group">
      <label class="input-label" for="sl-input">{T.hourlyLabel}</label>
      <div class="input-wrap" class:input-wrap--error={stundenlohnStr !== '' && parsedStundenlohn === null}>
        <input
          id="sl-input"
          type="text"
          inputmode="decimal"
          class="main-input"
          placeholder={T.hourlyPlaceholder}
          bind:value={stundenlohnStr}
          aria-label={T.hourlyAria}
          aria-invalid={stundenlohnStr !== '' && parsedStundenlohn === null}
          autocomplete="off"
        />
        <span class="input-unit" aria-hidden="true">{T.unitEuroPerHour}</span>
      </div>
      {#if stundenlohnStr !== '' && parsedStundenlohn === null}
        <p class="field-error" role="alert">{T.errAmountRange}</p>
      {/if}
    </div>
  {:else}
    <div class="input-group">
      <label class="input-label" for="jg-input">{T.annualLabel}</label>
      <div class="input-wrap" class:input-wrap--error={jahresgehaltStr !== '' && parsedJahresgehalt === null}>
        <input
          id="jg-input"
          type="text"
          inputmode="decimal"
          class="main-input"
          placeholder={T.annualPlaceholder}
          bind:value={jahresgehaltStr}
          aria-label={T.annualAria}
          aria-invalid={jahresgehaltStr !== '' && parsedJahresgehalt === null}
          autocomplete="off"
        />
        <span class="input-unit" aria-hidden="true">{T.unitEuroPerYear}</span>
      </div>
      {#if jahresgehaltStr !== '' && parsedJahresgehalt === null}
        <p class="field-error" role="alert">{T.errAmountRange}</p>
      {/if}
    </div>
  {/if}

  <!-- Wochenstunden with quick-select -->
  <div class="param-row">
    <label class="param-label" for="wochenstunden-input">{T.weeklyHoursLabel}</label>
    <div class="param-controls">
      <div class="quick-select" role="group" aria-label={T.quickSelectAria}>
        {#each QUICK_SELECT_STUNDEN as h}
          <button
            type="button"
            class="qs-btn"
            class:qs-btn--active={wochenstunden === h}
            onclick={() => (wochenstunden = h)}
            aria-pressed={wochenstunden === h}
          >{h}h</button>
        {/each}
      </div>
      <div class="param-input-wrap">
        <input
          id="wochenstunden-input"
          type="number"
          class="param-input"
          min="1"
          max="80"
          value={wochenstunden}
          oninput={(e) => {
            const v = parseInt((e.target as HTMLInputElement).value, 10);
            if (v >= 1 && v <= 80) wochenstunden = v;
          }}
          aria-label={T.weeklyHoursAdjustAria}
        />
        <span class="param-unit">{T.unitHoursPerWeek}</span>
      </div>
    </div>
    {#if ueberArbZG}
      <p class="hint hint--warn" role="note">
        {T.hintArbeitszeitgesetz}
      </p>
    {/if}
  </div>

  <!-- Formula mode toggle -->
  <div class="mode-bar">
    <span class="mode-label">{T.modeLabel}</span>
    <div class="mode-pills" role="group" aria-label={T.modeAria}>
      <button
        type="button"
        class="mode-pill"
        class:mode-pill--active={formulaMode === 'schnell'}
        onclick={() => (formulaMode = 'schnell')}
        aria-pressed={formulaMode === 'schnell'}
      >{T.modeSchnell} <span class="mode-sub">{T.modeSchnellSub}</span></button>
      <button
        type="button"
        class="mode-pill"
        class:mode-pill--active={formulaMode === 'exakt'}
        onclick={() => (formulaMode = 'exakt')}
        aria-pressed={formulaMode === 'exakt'}
      >{T.modeExakt} <span class="mode-sub">{T.modeExaktSub}</span></button>
    </div>
  </div>

  <!-- Exakt params -->
  {#if formulaMode === 'exakt'}
    <div class="exakt-params">
      <div class="param-row">
        <label class="param-label" for="urlaub-input">{T.vacationLabel}</label>
        <div class="param-input-wrap">
          <input
            id="urlaub-input"
            type="number"
            class="param-input"
            min="0"
            max="60"
            value={urlaubstage}
            oninput={(e) => {
              const v = parseInt((e.target as HTMLInputElement).value, 10);
              if (v >= 0 && v <= 60) urlaubstage = v;
            }}
            aria-label={T.vacationAria}
          />
          <span class="param-unit">{T.unitDays}</span>
        </div>
        {#if urlaubstage > 30}
          <p class="hint" role="note">{T.hintVacationMinimum}</p>
        {/if}
      </div>

      <div class="param-row">
        <label class="param-label" for="bundesland-select">{T.stateLabel}</label>
        <select
          id="bundesland-select"
          class="bundesland-select"
          bind:value={selectedBundesland}
          aria-label={T.stateAria}
        >
          {#each BUNDESLAENDER as bl}
            <option value={bl.id}>{bl.label} ({T.stateOptionTemplate.replace('{feiertage}', String(bl.feiertage))})</option>
          {/each}
        </select>
      </div>
    </div>
  {/if}

  <!-- Formula explanation -->
  {#if result !== null}
    <div class="formula-tip" role="note" aria-label={T.formulaTipAria}>
      {formulaExplanation}
    </div>
  {/if}

  <!-- Result table -->
  {#if result !== null}
    <div class="result-section">
      <div class="result-table" role="table" aria-label={T.resultTableAria}>
        <div class="result-table__head" role="rowgroup">
          <div class="result-row result-row--header" role="row">
            <span class="result-cell result-cell--label" role="columnheader">{T.colTimePeriod}</span>
            <span class="result-cell result-cell--value" role="columnheader">{T.colAmount}</span>
            <span class="result-cell result-cell--action" role="columnheader" aria-label={strings.toolsCommon.copy}></span>
          </div>
        </div>
        <div class="result-table__body" role="rowgroup">
          {#each ([
            { key: 'stundenlohn' as const, label: T.rowHourly, value: result.stundenlohn, unit: T.unitEuroPerHour },
            { key: 'tagesgehalt' as const, label: T.rowDaily, value: result.tagesgehalt, unit: T.unitEuroPerDay },
            { key: 'wochengehalt' as const, label: T.rowWeekly, value: result.wochengehalt, unit: T.unitEuroPerWeek },
            { key: 'monatsgehalt' as const, label: T.rowMonthly, value: result.monatsgehalt, unit: T.unitEuroPerMonth },
            { key: 'jahresgehalt' as const, label: T.rowYearly, value: result.jahresgehalt, unit: T.unitEuroPerYear },
          ] as const) as row}
            <div
              class="result-row"
              class:result-row--highlight={row.key === (direction === 'stundenlohn-zu-gehalt' ? 'jahresgehalt' : 'stundenlohn')}
              role="row"
            >
              <span class="result-cell result-cell--label" role="cell">
                {row.label}
                {#if row.key === 'stundenlohn' && unterMindestlohn}
                  <span class="warn-dot" aria-label={T.warnDotAria} title={T.warnDotTitle}></span>
                {/if}
              </span>
              <span class="result-cell result-cell--value" role="cell">
                <span class="result-amount">{formatEuroFull(row.value)}</span>
                <span class="result-unit">{row.unit}</span>
              </span>
              <span class="result-cell result-cell--action" role="cell">
                <button
                  type="button"
                  class="copy-btn"
                  class:copy-btn--copied={copyState[row.key] === 'copied'}
                  onclick={() => copyValue(row.key, formatEuroFull(row.value))}
                  aria-label={copyState[row.key] === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
                >
                  {copyState[row.key] === 'copied' ? '✓' : '⧉'}
                </button>
              </span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Mindestlohn warnings -->
      {#if unterMindestlohn}
        <div class="alert alert--warn" role="alert">
          {@html T.alertMinWageHtml.replace('{amount}', MINDESTLOHN_2026.toLocaleString(INTL_LOCALE_MAP[lang], { minimumFractionDigits: 2 }))}
        </div>
      {/if}

      {#if minijobWarnung}
        <div class="alert alert--info" role="note">
          {@html T.alertMinijobHtml.replace('{amount}', String(MINIJOB_GRENZE_2026))}
        </div>
      {/if}

      <!-- Mindestlohn 2027 preview -->
      <div class="min-preview" role="note">
        {@html T.minPreview2027Html.replace('{amount}', MINDESTLOHN_2027.toLocaleString(INTL_LOCALE_MAP[lang], { minimumFractionDigits: 2 }))}
      </div>

      <!-- Brutto-Hinweis -->
      <p class="brutto-hint" role="note">
        {@html T.bruttoHintHtml}
      </p>
    </div>

    <div class="actions-bar">
      <button type="button" class="clear-btn" onclick={handleReset}>{strings.toolsCommon.reset}</button>
    </div>
  {:else if (direction === 'stundenlohn-zu-gehalt' ? stundenlohnStr === '' : jahresgehaltStr === '')}
    <p class="empty-state">
      {direction === 'stundenlohn-zu-gehalt' ? T.emptyStateToSalary : T.emptyStateToHourly}
    </p>
  {/if}

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    {T.privacyBadge}
  </div>
</div>

<style>
  .sl-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Direction toggle */
  .direction-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .direction-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .dir-pill {
    padding: var(--space-2) var(--space-4);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }
  .dir-pill:hover {
    background: var(--color-surface-raised);
  }
  .dir-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  /* Input group */
  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .input-label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }
  .input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    padding: 0 var(--space-3);
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }
  .input-wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }
  .input-wrap--error {
    border-color: var(--color-error);
  }
  .main-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1.25rem;
    font-family: var(--font-family-mono);
    padding: var(--space-3) 0;
    min-width: 0;
  }
  .input-unit {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }
  .field-error {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-error);
    line-height: 1.4;
  }

  /* Param rows */
  .param-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .param-label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }
  .param-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }
  .param-input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    padding: 0 var(--space-3);
  }
  .param-input-wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }
  .param-input {
    width: 4rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    padding: var(--space-2) 0;
    text-align: right;
  }
  .param-unit {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
    white-space: nowrap;
  }

  /* Quick select buttons */
  .quick-select {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }
  .qs-btn {
    padding: var(--space-1) var(--space-2);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .qs-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }
  .qs-btn--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  /* Formula mode bar */
  .mode-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-3);
  }
  .mode-label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
    padding-top: var(--space-2);
    white-space: nowrap;
  }
  .mode-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .mode-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
    text-align: left;
  }
  .mode-pill:hover {
    background: var(--color-surface-raised);
  }
  .mode-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }
  .mode-sub {
    font-size: var(--font-size-xs);
    opacity: 0.7;
    font-family: var(--font-family-mono);
    margin-top: 1px;
  }

  /* Exakt params */
  .exakt-params {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }
  .bundesland-select {
    padding: var(--space-2) var(--space-3);
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    outline: none;
    cursor: pointer;
    max-width: 22rem;
  }
  .bundesland-select:focus {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }

  /* Formula explanation */
  .formula-tip {
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  /* Result table */
  .result-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .result-table {
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    overflow: hidden;
  }
  .result-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    transition: background var(--dur-fast) var(--ease-out);
  }
  .result-row:last-child {
    border-bottom: none;
  }
  .result-row--header {
    background: var(--color-surface);
  }
  .result-row--highlight {
    background: var(--color-surface);
    border-color: var(--color-text);
  }
  .result-row--highlight .result-amount {
    font-size: 1.125rem;
    font-weight: 600;
  }
  .result-cell--label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .result-row--header .result-cell--label {
    font-weight: 500;
    color: var(--color-text-subtle);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .result-row--highlight .result-cell--label {
    color: var(--color-text);
    font-weight: 500;
  }
  .result-cell--value {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
    padding: 0 var(--space-3);
    text-align: right;
    justify-content: flex-end;
  }
  .result-row--header .result-cell--value {
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    font-family: inherit;
    font-weight: 500;
  }
  .result-amount {
    font-family: var(--font-family-mono);
    font-size: 1rem;
    color: var(--color-text);
  }
  .result-unit {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    white-space: nowrap;
  }
  .result-cell--action {
    width: 2rem;
    display: flex;
    justify-content: center;
  }

  .warn-dot {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-accent);
    flex-shrink: 0;
  }

  /* Copy button */
  .copy-btn {
    width: 2.75rem;
    height: 2.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: transparent;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .copy-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }
  .copy-btn--copied {
    border-color: var(--color-success);
    color: var(--color-text); /* A12-R2-01: AAA contrast fix — success green fails 7:1; border retains non-text indicator */
  }
  .dir-pill:focus-visible,
  .mode-pill:focus-visible,
  .qs-btn:focus-visible,
  .copy-btn:focus-visible,
  .clear-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Alerts */
  .alert {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-md);
    font-size: var(--font-size-small);
    line-height: 1.5;
    border: 1px solid transparent;
  }
  .alert--warn {
    background: color-mix(in oklch, var(--color-error) 10%, transparent);
    border-color: color-mix(in oklch, var(--color-error) 30%, transparent);
    color: var(--color-text);
  }
  .alert--info {
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-text-muted);
  }

  /* Mindestlohn preview */
  .min-preview {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
  }

  /* Brutto hint */
  .brutto-hint {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    line-height: 1.5;
  }

  /* Hints */
  .hint {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    line-height: 1.4;
  }
  .hint--warn {
    color: var(--color-error);
  }

  /* Actions */
  .actions-bar {
    display: flex;
    gap: var(--space-2);
  }
  .clear-btn {
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
  .clear-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  /* Empty state */
  .empty-state {
    margin: 0;
    text-align: center;
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
    padding: var(--space-6) 0;
    line-height: 1.6;
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-align: center;
    padding-top: var(--space-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .dir-pill,
    .mode-pill,
    .qs-btn,
    .copy-btn,
    .clear-btn,
    .input-wrap,
    .result-row {
      transition: none;
    }
  }
</style>
