<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    computeLeasingFaktor,
    getBewertung,
    formatFaktor,
    formatEuro,
    MARKT_DURCHSCHNITT,
    BEWERTUNG_LABEL,
  } from '../../lib/tools/leasing-faktor-rechner';
  import type { FaktorBewertung } from '../../lib/tools/leasing-faktor-rechner';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  // ---- Eingabe-Felder ----
  let rateStr = $state('250');
  let listenpreisStr = $state('33.850');
  let sonderzahlungStr = $state('');
  let laufzeit = $state(36);
  let showSonderzahlung = $state(false);

  // ---- Copy ----
  type CopyState = 'idle' | 'copied' | 'error';
  let copyState = $state<CopyState>('idle');
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  // ---- Parsed ----
  const rate = $derived(parseDE(rateStr));
  const listenpreis = $derived(parseDE(listenpreisStr));
  const sonderzahlung = $derived(showSonderzahlung ? parseDE(sonderzahlungStr || '0') : 0);

  // ---- Validierung ----
  const rateError = $derived.by<string | null>(() => {
    if (rateStr === '') return null;
    if (!Number.isFinite(rate)) return 'Bitte eine gültige Rate eingeben.';
    if (rate < 0) return 'Rate muss ≥ 0 sein.';
    return null;
  });

  const listenpreisError = $derived.by<string | null>(() => {
    if (listenpreisStr === '') return null;
    if (!Number.isFinite(listenpreis)) return 'Bitte einen gültigen Listenpreis eingeben.';
    if (listenpreis <= 0) return 'Listenpreis muss > 0 sein.';
    return null;
  });

  const sonderzahlungError = $derived.by<string | null>(() => {
    if (!showSonderzahlung || sonderzahlungStr === '' || sonderzahlungStr === '0') return null;
    if (!Number.isFinite(sonderzahlung)) return 'Bitte eine gültige Sonderzahlung eingeben.';
    if (sonderzahlung < 0) return 'Sonderzahlung muss ≥ 0 sein.';
    return null;
  });

  // ---- Ergebnis ----
  const result = $derived.by(() => {
    if (rateError !== null || listenpreisError !== null || sonderzahlungError !== null) return null;
    if (!Number.isFinite(rate) || rate < 0) return null;
    if (!Number.isFinite(listenpreis) || listenpreis <= 0) return null;
    if (!Number.isFinite(sonderzahlung) || sonderzahlung < 0) return null;
    return computeLeasingFaktor(rate, listenpreis, sonderzahlung, laufzeit);
  });

  // ---- Gauge-Berechnung ----
  // Skala von 0 bis 1.5 (alles > 1.5 wird auf 100% geclamped)
  const GAUGE_MAX = 1.5;
  const gaugePercent = $derived.by<number>(() => {
    if (!result) return 0;
    return Math.min((result.faktor / GAUGE_MAX) * 100, 100);
  });
  const benchmarkPercent = $derived((MARKT_DURCHSCHNITT / GAUGE_MAX) * 100);

  // Bewertungs-Farbe für den Indikator
  const bewertungClass = $derived.by<string>(() => {
    if (!result) return '';
    const map: Record<FaktorBewertung, string> = {
      'spitzenangebot': 'gauge-indicator--spitze',
      'sehr-gut': 'gauge-indicator--sehr-gut',
      'gut': 'gauge-indicator--gut',
      'durchschnittlich': 'gauge-indicator--durchschnittlich',
      'wenig-attraktiv': 'gauge-indicator--schlecht',
    };
    return map[result.bewertung];
  });

  // ---- Aktionen ----
  async function copyFaktor() {
    if (!result) return;
    const text = `Leasingfaktor: ${formatFaktor(result.faktor)}`;
    try {
      await navigator.clipboard.writeText(text);
      copyState = 'copied';
    } catch {
      copyState = 'error';
    }
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyState = 'idle'; }, 2000);
  }

  function handleReset() {
    rateStr = '250';
    listenpreisStr = '33.850';
    sonderzahlungStr = '';
    laufzeit = 36;
    showSonderzahlung = false;
    copyState = 'idle';
  }
</script>

<div class="leasing-tool" aria-label="Leasingfaktor-Rechner">

  <!-- Pflicht-Eingaben -->
  <div class="inputs-grid">

    <div class="input-field">
      <label class="input-field__label" for="inp-rate">Monatliche Rate</label>
      <div class="input-field__wrap" class:input-field__wrap--error={rateError !== null}>
        <input
          id="inp-rate"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 250"
          bind:value={rateStr}
          aria-label="Monatliche Leasingrate in Euro"
          aria-invalid={rateError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€/Monat</span>
      </div>
      {#if rateError}
        <p class="field-error" role="alert">{rateError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-listenpreis">Bruttolistenpreis</label>
      <div class="input-field__wrap" class:input-field__wrap--error={listenpreisError !== null}>
        <input
          id="inp-listenpreis"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 33.850"
          bind:value={listenpreisStr}
          aria-label="Bruttolistenpreis des Fahrzeugs in Euro"
          aria-invalid={listenpreisError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if listenpreisError}
        <p class="field-error" role="alert">{listenpreisError}</p>
      {/if}
    </div>

  </div>

  <!-- Sonderzahlung Toggle -->
  <div class="optional-section">
    <button
      type="button"
      class="optional-toggle"
      aria-expanded={showSonderzahlung}
      onclick={() => { showSonderzahlung = !showSonderzahlung; }}
    >
      <span class="optional-toggle__icon" aria-hidden="true">{showSonderzahlung ? '−' : '+'}</span>
      Sonderzahlung berücksichtigen
      <span class="optional-badge">optional</span>
    </button>

    {#if showSonderzahlung}
      <div class="inputs-grid inputs-grid--optional">

        <div class="input-field">
          <label class="input-field__label" for="inp-sonderzahlung">Sonderzahlung</label>
          <div class="input-field__wrap" class:input-field__wrap--error={sonderzahlungError !== null}>
            <input
              id="inp-sonderzahlung"
              type="text"
              inputmode="decimal"
              class="input-field__input"
              placeholder="z.B. 3.600"
              bind:value={sonderzahlungStr}
              aria-label="Einmalige Sonderzahlung oder Anzahlung in Euro"
              aria-invalid={sonderzahlungError !== null}
              autocomplete="off"
            />
            <span class="input-field__unit" aria-hidden="true">€</span>
          </div>
          {#if sonderzahlungError}
            <p class="field-error" role="alert">{sonderzahlungError}</p>
          {/if}
        </div>

        <div class="input-field">
          <label class="input-field__label" for="inp-laufzeit">Laufzeit</label>
          <div class="input-field__wrap">
            <select
              id="inp-laufzeit"
              class="input-field__select"
              bind:value={laufzeit}
              aria-label="Laufzeit in Monaten"
            >
              <option value={24}>24 Monate</option>
              <option value={36}>36 Monate</option>
              <option value={48}>48 Monate</option>
              <option value={60}>60 Monate</option>
            </select>
          </div>
        </div>

      </div>

      {#if result?.bereinigt && result.sonderzahlungProMonat !== undefined}
        <p class="bereinigung-info">
          Anteilige Sonderzahlung: <strong>{formatEuro(result.sonderzahlungProMonat)}&nbsp;€/Monat</strong>
          — bereinigte Rate: <strong>{formatEuro(rate + result.sonderzahlungProMonat)}&nbsp;€</strong>
        </p>
      {/if}
    {/if}
  </div>

  <!-- Ergebnis -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">

    {#if result}
      <div class="results-grid">

        <div class="result-card result-card--primary">
          <span class="result-card__label">Leasingfaktor</span>
          <span class="result-card__value">
            {formatFaktor(result.faktor)}
          </span>
          <span
            class="bewertung-badge"
            class:bewertung-badge--spitze={result.bewertung === 'spitzenangebot'}
            class:bewertung-badge--sehr-gut={result.bewertung === 'sehr-gut'}
            class:bewertung-badge--gut={result.bewertung === 'gut'}
            class:bewertung-badge--durchschnitt={result.bewertung === 'durchschnittlich'}
            class:bewertung-badge--schlecht={result.bewertung === 'wenig-attraktiv'}
          >
            {BEWERTUNG_LABEL[result.bewertung]}
          </span>
        </div>

        <div class="result-card">
          <span class="result-card__label">Marktdurchschnitt 2024</span>
          <span class="result-card__value result-card__value--muted">
            {formatFaktor(MARKT_DURCHSCHNITT)}
          </span>
          <span class="result-card__sub">Quelle: leasingmarkt.de</span>
        </div>

        {#if result.bereinigt}
          <div class="result-card">
            <span class="result-card__label">Bereinigung</span>
            <span class="result-card__value result-card__value--muted">aktiv</span>
            <span class="result-card__sub">Sonderzahlung verteilt auf {laufzeit}&nbsp;Monate</span>
          </div>
        {/if}

      </div>

      <!-- Bewertungs-Gauge -->
      <div class="gauge-section" aria-label="Bewertungs-Gauge">
        <div class="gauge-track" role="img" aria-label={`Leasingfaktor ${formatFaktor(result.faktor)} — ${BEWERTUNG_LABEL[result.bewertung]}`}>
          <!-- Farbsegmente -->
          <div class="gauge-segment gauge-segment--spitze" style="width: 33.33%"></div>
          <div class="gauge-segment gauge-segment--sehr-gut" style="width: 13.33%"></div>
          <div class="gauge-segment gauge-segment--gut" style="width: 13.33%"></div>
          <div class="gauge-segment gauge-segment--durchschnitt" style="width: 6.67%"></div>
          <div class="gauge-segment gauge-segment--schlecht" style="width: 33.33%"></div>
          <!-- Marktdurchschnitt-Marker -->
          <div
            class="gauge-benchmark"
            style="left: {benchmarkPercent}%"
            aria-label="Marktdurchschnitt 0,63"
          >
            <span class="gauge-benchmark__label">Ø 0,63</span>
          </div>
          <!-- Faktor-Indikator -->
          <div
            class="gauge-indicator {bewertungClass}"
            style="left: {gaugePercent}%"
            aria-hidden="true"
          ></div>
        </div>
        <div class="gauge-labels" aria-hidden="true">
          <span>0</span>
          <span>0,50</span>
          <span>0,70</span>
          <span>0,90 1,00</span>
          <span>1,50+</span>
        </div>
      </div>

      <!-- Formel-Zeile -->
      <div class="formel-row" aria-label="Formel-Aufschlüsselung">
        <span class="formel-label">Formel</span>
        <span class="formel-text">{result.formelText}</span>
      </div>

      <!-- Aktionen -->
      <div class="actions-bar">
        <button
          type="button"
          class="copy-btn"
          class:copy-btn--copied={copyState === 'copied'}
          onclick={copyFaktor}
          aria-label="Leasingfaktor in die Zwischenablage kopieren"
        >
          {copyState === 'copied' ? 'Kopiert!' : copyState === 'error' ? 'Fehler' : 'Faktor kopieren'}
        </button>
        <button type="button" class="reset-btn" onclick={handleReset}>Zurücksetzen</button>
      </div>

    {:else}
      <div class="actions-bar">
        <button type="button" class="reset-btn" onclick={handleReset}>Zurücksetzen</button>
      </div>
    {/if}

  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">
    Diese Berechnung dient ausschließlich zur unverbindlichen Information. Der Leasingfaktor
    ist eine Vergleichskennzahl — er ersetzt keine vollständige Angebotsprüfung.
  </p>

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label="Datenschutz-Hinweis">
    Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser
  </div>

</div>

<style>
  .leasing-tool {
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

  .inputs-grid--optional {
    margin-top: var(--space-4);
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

  .input-field__select {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1rem;
    font-family: var(--font-family-sans, inherit);
    padding: var(--space-3) 0;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
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

  /* Optional Toggle */
  .optional-section {
    display: flex;
    flex-direction: column;
  }

  .optional-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    width: fit-content;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    font-weight: 500;
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }

  .optional-toggle:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  .optional-toggle__icon {
    font-family: var(--font-family-mono);
    font-size: 1rem;
    line-height: 1;
    width: 1rem;
    text-align: center;
  }

  .optional-badge {
    font-size: 0.625rem;
    letter-spacing: 0.03em;
    color: var(--color-text-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: 0 var(--space-1);
    font-weight: 400;
  }

  .bereinigung-info {
    margin: var(--space-3) 0 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.5;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
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

  .result-card__label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    font-weight: 500;
  }

  .result-card__value {
    font-size: 1.75rem;
    font-family: var(--font-family-mono);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.2;
  }

  .result-card__value--muted {
    font-size: 1.25rem;
    color: var(--color-text-muted);
  }

  .result-card__sub {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.4;
    margin-top: var(--space-1);
  }

  /* Bewertungs-Badge */
  .bewertung-badge {
    display: inline-block;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: var(--r-sm);
    padding: 0.1em var(--space-2);
    margin-top: var(--space-2);
    width: fit-content;
    border: 1px solid transparent;
  }

  .bewertung-badge--spitze {
    background: color-mix(in oklch, var(--color-success) 15%, transparent);
    color: var(--color-success);
    border-color: color-mix(in oklch, var(--color-success) 35%, transparent);
  }

  .bewertung-badge--sehr-gut {
    background: color-mix(in oklch, var(--color-success) 10%, transparent);
    color: var(--color-success);
    border-color: color-mix(in oklch, var(--color-success) 25%, transparent);
  }

  .bewertung-badge--gut {
    background: color-mix(in oklch, var(--color-text-subtle) 12%, transparent);
    color: var(--color-text-muted);
    border-color: var(--color-border);
  }

  .bewertung-badge--durchschnitt {
    background: color-mix(in oklch, var(--color-accent) 10%, transparent);
    color: var(--color-accent);
    border-color: color-mix(in oklch, var(--color-accent) 25%, transparent);
  }

  .bewertung-badge--schlecht {
    background: color-mix(in oklch, var(--color-error) 12%, transparent);
    color: var(--color-error);
    border-color: color-mix(in oklch, var(--color-error) 30%, transparent);
  }

  /* Gauge */
  .gauge-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .gauge-track {
    position: relative;
    display: flex;
    height: 0.75rem;
    border-radius: var(--r-sm);
    overflow: visible;
    border: 1px solid var(--color-border);
  }

  .gauge-segment {
    height: 100%;
    flex-shrink: 0;
  }

  .gauge-segment--spitze {
    background: color-mix(in oklch, var(--color-success) 40%, transparent);
    border-radius: var(--r-sm) 0 0 var(--r-sm);
  }

  .gauge-segment--sehr-gut {
    background: color-mix(in oklch, var(--color-success) 25%, transparent);
  }

  .gauge-segment--gut {
    background: color-mix(in oklch, var(--color-text-subtle) 20%, transparent);
  }

  .gauge-segment--durchschnitt {
    background: color-mix(in oklch, var(--color-accent) 20%, transparent);
  }

  .gauge-segment--schlecht {
    background: color-mix(in oklch, var(--color-error) 20%, transparent);
    border-radius: 0 var(--r-sm) var(--r-sm) 0;
  }

  /* Benchmark marker */
  .gauge-benchmark {
    position: absolute;
    top: -0.25rem;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }

  .gauge-benchmark::before {
    content: '';
    display: block;
    width: 1px;
    height: calc(0.75rem + 0.5rem);
    background: var(--color-text-subtle);
    border-left: 1px dashed var(--color-text-subtle);
  }

  .gauge-benchmark__label {
    font-size: 0.5625rem;
    color: var(--color-text-subtle);
    white-space: nowrap;
    margin-top: 0.125rem;
  }

  /* Faktor-Indikator */
  .gauge-indicator {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid var(--color-bg);
    transition: left var(--dur-fast) var(--ease-out);
    z-index: 2;
  }

  .gauge-indicator--spitze {
    background: var(--color-success);
  }

  .gauge-indicator--sehr-gut {
    background: color-mix(in oklch, var(--color-success) 70%, var(--color-text-subtle));
  }

  .gauge-indicator--gut {
    background: var(--color-text-muted);
  }

  .gauge-indicator--durchschnittlich {
    background: var(--color-accent);
  }

  .gauge-indicator--schlecht {
    background: var(--color-error);
  }

  .gauge-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.5625rem;
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
    padding: 0 0.125rem;
  }

  /* Formel */
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
    color: var(--color-text-subtle);
    line-height: 1.5;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .input-field__wrap,
    .optional-toggle,
    .copy-btn,
    .reset-btn,
    .gauge-indicator {
      transition: none;
    }
  }
</style>
