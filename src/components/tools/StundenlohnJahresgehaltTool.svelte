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

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

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
      return `Schnell-Methode: Stundenlohn × ${wochenstunden}\u00a0h/Woche × 52\u00a0Wochen`;
    }
    const at = result && 'arbeitstage' in result ? (result as { arbeitstage: number }).arbeitstage : (260 - urlaubstage - bundeslandFeiertage);
    const th = (wochenstunden / 5).toFixed(1);
    return `Exakt-Methode: Stundenlohn × ${at}\u00a0Arbeitstage × ${th}\u00a0h/Tag (${urlaubstage}\u00a0Urlaubstage + ${bundeslandFeiertage}\u00a0Feiertage abgezogen)`;
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
    <div class="direction-pills" role="group" aria-label="Berechnungsrichtung wählen">
      <button
        type="button"
        class="dir-pill"
        class:dir-pill--active={direction === 'stundenlohn-zu-gehalt'}
        onclick={() => { direction = 'stundenlohn-zu-gehalt'; jahresgehaltStr = ''; }}
        aria-pressed={direction === 'stundenlohn-zu-gehalt'}
      >Stundenlohn → Gehalt</button>
      <button
        type="button"
        class="dir-pill"
        class:dir-pill--active={direction === 'gehalt-zu-stundenlohn'}
        onclick={() => { direction = 'gehalt-zu-stundenlohn'; stundenlohnStr = ''; }}
        aria-pressed={direction === 'gehalt-zu-stundenlohn'}
      >Jahresgehalt → Stundenlohn</button>
    </div>
  </div>

  <!-- Primary input -->
  {#if direction === 'stundenlohn-zu-gehalt'}
    <div class="input-group">
      <label class="input-label" for="sl-input">Stundenlohn (Brutto)</label>
      <div class="input-wrap" class:input-wrap--error={stundenlohnStr !== '' && parsedStundenlohn === null}>
        <input
          id="sl-input"
          type="text"
          inputmode="decimal"
          class="main-input"
          placeholder="z.B. 15,50"
          bind:value={stundenlohnStr}
          aria-label="Stundenlohn in Euro"
          aria-invalid={stundenlohnStr !== '' && parsedStundenlohn === null}
          autocomplete="off"
        />
        <span class="input-unit" aria-hidden="true">€/h</span>
      </div>
      {#if stundenlohnStr !== '' && parsedStundenlohn === null}
        <p class="field-error" role="alert">Bitte eine Zahl zwischen 0,01 und 99.999 eingeben.</p>
      {/if}
    </div>
  {:else}
    <div class="input-group">
      <label class="input-label" for="jg-input">Jahresgehalt (Brutto)</label>
      <div class="input-wrap" class:input-wrap--error={jahresgehaltStr !== '' && parsedJahresgehalt === null}>
        <input
          id="jg-input"
          type="text"
          inputmode="decimal"
          class="main-input"
          placeholder="z.B. 45.000"
          bind:value={jahresgehaltStr}
          aria-label="Jahresgehalt in Euro"
          aria-invalid={jahresgehaltStr !== '' && parsedJahresgehalt === null}
          autocomplete="off"
        />
        <span class="input-unit" aria-hidden="true">€/Jahr</span>
      </div>
      {#if jahresgehaltStr !== '' && parsedJahresgehalt === null}
        <p class="field-error" role="alert">Bitte eine Zahl zwischen 0,01 und 99.999 eingeben.</p>
      {/if}
    </div>
  {/if}

  <!-- Wochenstunden with quick-select -->
  <div class="param-row">
    <label class="param-label" for="wochenstunden-input">Wochenstunden</label>
    <div class="param-controls">
      <div class="quick-select" role="group" aria-label="Wochenstunden Schnellwahl">
        {#each [20, 32, 35, 40, 42] as h}
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
          aria-label="Wochenstunden anpassen"
        />
        <span class="param-unit">h/Woche</span>
      </div>
    </div>
    {#if ueberArbZG}
      <p class="hint hint--warn" role="note">
        Arbeitszeitgesetz: max. 48&nbsp;h/Woche im Durchschnitt (§&nbsp;3&nbsp;ArbZG).
      </p>
    {/if}
  </div>

  <!-- Formula mode toggle -->
  <div class="mode-bar">
    <span class="mode-label">Methode</span>
    <div class="mode-pills" role="group" aria-label="Berechnungsmethode wählen">
      <button
        type="button"
        class="mode-pill"
        class:mode-pill--active={formulaMode === 'schnell'}
        onclick={() => (formulaMode = 'schnell')}
        aria-pressed={formulaMode === 'schnell'}
      >Schnell <span class="mode-sub">×&nbsp;52&nbsp;Wochen</span></button>
      <button
        type="button"
        class="mode-pill"
        class:mode-pill--active={formulaMode === 'exakt'}
        onclick={() => (formulaMode = 'exakt')}
        aria-pressed={formulaMode === 'exakt'}
      >Exakt <span class="mode-sub">Urlaubstage + Feiertage</span></button>
    </div>
  </div>

  <!-- Exakt params -->
  {#if formulaMode === 'exakt'}
    <div class="exakt-params">
      <div class="param-row">
        <label class="param-label" for="urlaub-input">Urlaubstage/Jahr</label>
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
            aria-label="Urlaubstage pro Jahr"
          />
          <span class="param-unit">Tage</span>
        </div>
        {#if urlaubstage > 30}
          <p class="hint" role="note">Gesetzliches Minimum: 20&nbsp;Tage (5-Tage-Woche).</p>
        {/if}
      </div>

      <div class="param-row">
        <label class="param-label" for="bundesland-select">Bundesland</label>
        <select
          id="bundesland-select"
          class="bundesland-select"
          bind:value={selectedBundesland}
          aria-label="Bundesland für Feiertagsanzahl"
        >
          {#each BUNDESLAENDER as bl}
            <option value={bl.id}>{bl.label} ({bl.feiertage}&nbsp;Feiertage)</option>
          {/each}
        </select>
      </div>
    </div>
  {/if}

  <!-- Formula explanation -->
  {#if result !== null}
    <div class="formula-tip" role="note" aria-label="Verwendete Formel">
      {formulaExplanation}
    </div>
  {/if}

  <!-- Result table -->
  {#if result !== null}
    <div class="result-section">
      <div class="result-table" role="table" aria-label="Gehalts-Übersicht">
        <div class="result-table__head" role="rowgroup">
          <div class="result-row result-row--header" role="row">
            <span class="result-cell result-cell--label" role="columnheader">Zeitraum</span>
            <span class="result-cell result-cell--value" role="columnheader">Betrag (Brutto)</span>
            <span class="result-cell result-cell--action" role="columnheader" aria-label="Kopieren"></span>
          </div>
        </div>
        <div class="result-table__body" role="rowgroup">
          {#each ([
            { key: 'stundenlohn' as const, label: 'Stündlich', value: result.stundenlohn, unit: '€/h' },
            { key: 'tagesgehalt' as const, label: 'Täglich', value: result.tagesgehalt, unit: '€/Tag' },
            { key: 'wochengehalt' as const, label: 'Wöchentlich', value: result.wochengehalt, unit: '€/Woche' },
            { key: 'monatsgehalt' as const, label: 'Monatlich', value: result.monatsgehalt, unit: '€/Monat' },
            { key: 'jahresgehalt' as const, label: 'Jährlich', value: result.jahresgehalt, unit: '€/Jahr' },
          ] as const) as row}
            <div
              class="result-row"
              class:result-row--highlight={row.key === (direction === 'stundenlohn-zu-gehalt' ? 'jahresgehalt' : 'stundenlohn')}
              role="row"
            >
              <span class="result-cell result-cell--label" role="cell">
                {row.label}
                {#if row.key === 'stundenlohn' && unterMindestlohn}
                  <span class="warn-dot" aria-label="Unter Mindestlohn" title="Unter Mindestlohn 2026"></span>
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
                  aria-label={copyState[row.key] === 'copied' ? 'Kopiert!' : `${row.label} kopieren`}
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
          <strong>Unter Mindestlohn 2026:</strong> Der gesetzliche Mindestlohn beträgt ab Januar&nbsp;2026 <strong>{MINDESTLOHN_2026.toLocaleString('de-DE', { minimumFractionDigits: 2 })}&nbsp;€/h</strong>.
        </div>
      {/if}

      {#if minijobWarnung}
        <div class="alert alert--info" role="note">
          <strong>Minijob-Bereich:</strong> Monatswert unter der Minijob-Grenze 2026 (€&nbsp;{MINIJOB_GRENZE_2026}/Monat). Besondere Regelungen zu Sozialabgaben und Steuern beachten.
        </div>
      {/if}

      <!-- Mindestlohn 2027 preview -->
      <div class="min-preview" role="note">
        Vorschau: Ab 1.&nbsp;Jan&nbsp;2027 steigt der Mindestlohn auf <strong>{MINDESTLOHN_2027.toLocaleString('de-DE', { minimumFractionDigits: 2 })}&nbsp;€/h</strong> (geplant).
      </div>

      <!-- Brutto-Hinweis -->
      <p class="brutto-hint" role="note">
        Alle Werte sind <strong>Brutto</strong> — Steuern und Sozialabgaben noch nicht abgezogen.
        Für die Nettoberechnung einen separaten Brutto-Netto-Rechner nutzen.
      </p>
    </div>

    <div class="actions-bar">
      <button type="button" class="clear-btn" onclick={handleReset}>Zurücksetzen</button>
    </div>
  {:else if (direction === 'stundenlohn-zu-gehalt' ? stundenlohnStr === '' : jahresgehaltStr === '')}
    <p class="empty-state">
      {direction === 'stundenlohn-zu-gehalt'
        ? 'Stundenlohn eingeben — Jahres-, Monats-, Wochen- und Tageswert erscheinen sofort.'
        : 'Jahresgehalt eingeben — Stundenlohn und alle Zeiträume erscheinen sofort.'}
    </p>
  {/if}

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label="Datenschutz-Hinweis">
    Alle Berechnungen lokal im Browser · Deine Gehaltsinfos verlassen nicht dein Gerät · Kein Tracking
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
    font-size: 0.6875rem;
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
    font-size: 0.6875rem;
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
    font-size: 0.6875rem;
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
    font-size: 0.6875rem;
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
    background: var(--color-warn, #d97706);
    flex-shrink: 0;
  }

  /* Copy button */
  .copy-btn {
    width: 1.75rem;
    height: 1.75rem;
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
    color: var(--color-success);
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
    background: color-mix(in oklch, var(--color-warn, #d97706) 10%, transparent);
    border-color: color-mix(in oklch, var(--color-warn, #d97706) 30%, transparent);
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
    color: var(--color-warn, #d97706);
  }

  /* Actions */
  .actions-bar {
    display: flex;
    gap: var(--space-2);
  }
  .clear-btn {
    padding: var(--space-2) var(--space-4);
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
    font-size: 0.6875rem;
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
