<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    formatEuro,
    computeFromNetto,
    computeFromBrutto,
    computeFromMwst,
  } from '../../lib/tools/mehrwertsteuer-rechner';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;
  const strings = $derived(t(lang));

  // -- Rate state --
  type RatePreset = '19' | '7' | '0' | 'custom';
  let ratePreset = $state<RatePreset>('19');
  let customRateStr = $state<string>('');

  const effectiveRate = $derived.by<number>(() => {
    if (ratePreset === '19') return 19;
    if (ratePreset === '7') return 7;
    if (ratePreset === '0') return 0;
    const n = parseFloat(customRateStr.replace(',', '.'));
    if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
    return NaN;
  });

  const rateError = $derived.by<string | null>(() => {
    if (ratePreset !== 'custom') return null;
    if (customRateStr === '') return null;
    const n = parseFloat(customRateStr.replace(',', '.'));
    if (!Number.isFinite(n)) return 'Bitte eine Zahl zwischen 0 und 100 eingeben.';
    if (n < 0 || n > 100) return 'Steuersatz muss zwischen 0 und 100 liegen.';
    return null;
  });

  // -- Field state: raw string inputs (what the user typed) --
  let nettoStr = $state<string>('');
  let mwstStr = $state<string>('');
  let bruttoStr = $state<string>('');

  // Track which field was last changed by the user
  type ActiveField = 'netto' | 'mwst' | 'brutto' | null;
  let activeField = $state<ActiveField>(null);

  // -- Computed result --
  interface ComputedFields {
    netto: number;
    mwst: number;
    brutto: number;
  }

  const result = $derived.by<ComputedFields | null>(() => {
    if (!Number.isFinite(effectiveRate)) return null;
    if (activeField === 'netto') {
      const n = parseDE(nettoStr);
      if (!Number.isFinite(n) || n < 0) return null;
      return computeFromNetto(n, effectiveRate);
    }
    if (activeField === 'mwst') {
      const m = parseDE(mwstStr);
      if (!Number.isFinite(m) || m < 0) return null;
      return computeFromMwst(m, effectiveRate);
    }
    if (activeField === 'brutto') {
      const b = parseDE(bruttoStr);
      if (!Number.isFinite(b) || b < 0) return null;
      return computeFromBrutto(b, effectiveRate);
    }
    return null;
  });

  // Displayed values in the non-active fields
  const nettoDisplay = $derived.by<string>(() => {
    if (activeField === 'netto') return nettoStr;
    if (result && Number.isFinite(result.netto)) return formatEuro(result.netto);
    return '';
  });
  const mwstDisplay = $derived.by<string>(() => {
    if (activeField === 'mwst') return mwstStr;
    if (result && Number.isFinite(result.mwst)) return formatEuro(result.mwst);
    return '';
  });
  const bruttoDisplay = $derived.by<string>(() => {
    if (activeField === 'brutto') return bruttoStr;
    if (result && Number.isFinite(result.brutto)) return formatEuro(result.brutto);
    return '';
  });

  // -- Validation errors for amount fields --
  function getAmountError(raw: string, field: ActiveField): string | null {
    if (field !== activeField || raw === '') return null;
    const n = parseDE(raw);
    if (!Number.isFinite(n)) return 'Bitte nur Zahlen eingeben.';
    if (n < 0) return 'Bitte einen Betrag größer als 0 eingeben.';
    if (n > 99_999_999.99) return 'Betrag ist zu groß. Bitte maximal 99.999.999,99 eingeben.';
    if (field === 'mwst' && activeField === 'mwst' && effectiveRate === 0 && Number.isFinite(n) && n > 0) {
      return 'MwSt-Betrag kann bei 0%-Steuersatz nicht für Rückrechnung genutzt werden.';
    }
    return null;
  }

  const nettoError = $derived(getAmountError(nettoStr, 'netto'));
  const mwstError = $derived(getAmountError(mwstStr, 'mwst'));
  const bruttoError = $derived(getAmountError(bruttoStr, 'brutto'));

  // -- Handlers --
  function handleNettoInput(e: Event) {
    nettoStr = (e.target as HTMLInputElement).value;
    activeField = 'netto';
  }
  function handleMwstInput(e: Event) {
    mwstStr = (e.target as HTMLInputElement).value;
    activeField = 'mwst';
  }
  function handleBruttoInput(e: Event) {
    bruttoStr = (e.target as HTMLInputElement).value;
    activeField = 'brutto';
  }

  function handleRatePreset(p: RatePreset) {
    ratePreset = p;
    // Recalculate from the active field with new rate
  }

  function handleClear() {
    nettoStr = '';
    mwstStr = '';
    bruttoStr = '';
    activeField = null;
  }

  // -- Copy state per field --
  type CopyState = 'idle' | 'copied';
  let copyNetto = $state<CopyState>('idle');
  let copyMwst = $state<CopyState>('idle');
  let copyBrutto = $state<CopyState>('idle');

  async function copyField(value: string, which: 'netto' | 'mwst' | 'brutto') {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      if (which === 'netto') { copyNetto = 'copied'; setTimeout(() => (copyNetto = 'idle'), 1500); }
      if (which === 'mwst') { copyMwst = 'copied'; setTimeout(() => (copyMwst = 'idle'), 1500); }
      if (which === 'brutto') { copyBrutto = 'copied'; setTimeout(() => (copyBrutto = 'idle'), 1500); }
    } catch {
      // clipboard permission denied — fail silent
    }
  }

  // -- Formula tooltip state --
  let tooltipVisible = $state<'netto' | 'mwst' | 'brutto' | null>(null);

  function nettoFormula(): string {
    const r = Number.isFinite(effectiveRate) ? (1 + effectiveRate / 100).toFixed(2) : '1+r';
    if (activeField === 'brutto') return `Brutto ÷ ${r} = Netto`;
    if (activeField === 'mwst') return `MwSt ÷ ${(effectiveRate / 100).toFixed(2)} = Netto`;
    return `Netto eingegeben`;
  }
  function mwstFormula(): string {
    if (activeField === 'netto') return 'Brutto − Netto = MwSt';
    if (activeField === 'brutto') return 'Brutto − Netto = MwSt';
    if (activeField === 'mwst') return `MwSt eingegeben`;
    return 'Brutto − Netto = MwSt';
  }
  function bruttoFormula(): string {
    const r = Number.isFinite(effectiveRate) ? (1 + effectiveRate / 100).toFixed(2) : '1+r';
    if (activeField === 'netto') return `Netto × ${r} = Brutto`;
    if (activeField === 'mwst') return `Netto × ${r} = Brutto`;
    return `Brutto eingegeben`;
  }
</script>

<div class="mwst-tool">
  <!-- Rate Selector -->
  <div class="rate-bar">
    <span class="rate-bar__label">Steuersatz</span>
    <div class="rate-pills" role="group" aria-label="Steuersatz auswählen">
      {#each ([['19', '19 %'], ['7', '7 %'], ['0', '0 %']] as const) as [val, label]}
        <button
          type="button"
          class:rate-pill--active={ratePreset === val}
          class="rate-pill"
          onclick={() => handleRatePreset(val)}
          aria-pressed={ratePreset === val}
        >{label}</button>
      {/each}
      <button
        type="button"
        class:rate-pill--active={ratePreset === 'custom'}
        class="rate-pill"
        onclick={() => handleRatePreset('custom')}
        aria-pressed={ratePreset === 'custom'}
      >Individuell</button>
    </div>
    {#if ratePreset === 'custom'}
      <div class="custom-rate">
        <input
          type="text"
          inputmode="decimal"
          class="custom-rate__input"
          class:custom-rate__input--error={rateError !== null}
          placeholder="z.B. 10,7"
          bind:value={customRateStr}
          aria-label="Individueller Steuersatz in Prozent"
        />
        <span class="custom-rate__unit">%</span>
      </div>
      {#if rateError}
        <p class="field-error" role="alert">{rateError}</p>
      {/if}
    {/if}
  </div>

  <!-- Gastronomie 2026 badge when 7% selected -->
  {#if ratePreset === '7'}
    <div class="gastro-badge" role="note" aria-label="Gastronomie-Hinweis 2026">
      <span class="gastro-badge__icon" aria-hidden="true">ℹ</span>
      <span>Ab Jan&nbsp;2026 gilt 7&nbsp;% dauerhaft für Restaurantspeisen&nbsp;· Getränke: 19&nbsp;%</span>
    </div>
  {/if}

  <!-- Three Fields -->
  <div class="fields">
    <!-- Netto -->
    <div class="field" class:field--active={activeField === 'netto'}>
      <div class="field__header">
        <label class="field__label" for="field-netto">Nettobetrag</label>
        <div class="field__actions">
          <button
            type="button"
            class="info-btn"
            aria-label="Formel für Nettobetrag anzeigen"
            onclick={() => tooltipVisible = tooltipVisible === 'netto' ? null : 'netto'}
          >i</button>
          <button
            type="button"
            class="copy-btn"
            class:copy-btn--copied={copyNetto === 'copied'}
            aria-label={copyNetto === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
            onclick={() => copyField(nettoDisplay, 'netto')}
            disabled={!nettoDisplay}
          >
            {#if copyNetto === 'copied'}
              <span aria-hidden="true">✓</span> {strings.toolsCommon.copied}
            {:else}
              <span aria-hidden="true">⧉</span> {strings.toolsCommon.copy}
            {/if}
          </button>
        </div>
      </div>
      {#if tooltipVisible === 'netto'}
        <div class="formula-tip" role="note">{nettoFormula()}</div>
      {/if}
      <div class="field__input-wrap" class:field__input-wrap--error={nettoError !== null}>
        <input
          id="field-netto"
          type="text"
          inputmode="decimal"
          class="field__input"
          placeholder="z.B. 100,00"
          value={nettoDisplay}
          oninput={handleNettoInput}
          onfocus={() => { if (activeField !== 'netto') { nettoStr = nettoDisplay; activeField = 'netto'; } }}
          aria-label="Nettobetrag in Euro"
          aria-invalid={nettoError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">€</span>
      </div>
      {#if nettoError}
        <p class="field-error" role="alert">{nettoError}</p>
      {/if}
    </div>

    <!-- MwSt-Betrag -->
    <div class="field" class:field--active={activeField === 'mwst'}>
      <div class="field__header">
        <label class="field__label" for="field-mwst">MwSt-Betrag</label>
        <div class="field__actions">
          <button
            type="button"
            class="info-btn"
            aria-label="Formel für MwSt-Betrag anzeigen"
            onclick={() => tooltipVisible = tooltipVisible === 'mwst' ? null : 'mwst'}
          >i</button>
          <button
            type="button"
            class="copy-btn"
            class:copy-btn--copied={copyMwst === 'copied'}
            aria-label={copyMwst === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
            onclick={() => copyField(mwstDisplay, 'mwst')}
            disabled={!mwstDisplay}
          >
            {#if copyMwst === 'copied'}
              <span aria-hidden="true">✓</span> {strings.toolsCommon.copied}
            {:else}
              <span aria-hidden="true">⧉</span> {strings.toolsCommon.copy}
            {/if}
          </button>
        </div>
      </div>
      {#if tooltipVisible === 'mwst'}
        <div class="formula-tip" role="note">{mwstFormula()}</div>
      {/if}
      <div class="field__input-wrap" class:field__input-wrap--error={mwstError !== null}>
        <input
          id="field-mwst"
          type="text"
          inputmode="decimal"
          class="field__input"
          placeholder="z.B. 19,00"
          value={mwstDisplay}
          oninput={handleMwstInput}
          onfocus={() => { if (activeField !== 'mwst') { mwstStr = mwstDisplay; activeField = 'mwst'; } }}
          aria-label="Mehrwertsteuer-Betrag in Euro"
          aria-invalid={mwstError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">€</span>
      </div>
      {#if mwstError}
        <p class="field-error" role="alert">{mwstError}</p>
      {/if}
    </div>

    <!-- Brutto -->
    <div class="field" class:field--active={activeField === 'brutto'}>
      <div class="field__header">
        <label class="field__label" for="field-brutto">Bruttobetrag</label>
        <div class="field__actions">
          <button
            type="button"
            class="info-btn"
            aria-label="Formel für Bruttobetrag anzeigen"
            onclick={() => tooltipVisible = tooltipVisible === 'brutto' ? null : 'brutto'}
          >i</button>
          <button
            type="button"
            class="copy-btn"
            class:copy-btn--copied={copyBrutto === 'copied'}
            aria-label={copyBrutto === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copyAria}
            onclick={() => copyField(bruttoDisplay, 'brutto')}
            disabled={!bruttoDisplay}
          >
            {#if copyBrutto === 'copied'}
              <span aria-hidden="true">✓</span> {strings.toolsCommon.copied}
            {:else}
              <span aria-hidden="true">⧉</span> {strings.toolsCommon.copy}
            {/if}
          </button>
        </div>
      </div>
      {#if tooltipVisible === 'brutto'}
        <div class="formula-tip" role="note">{bruttoFormula()}</div>
      {/if}
      <div class="field__input-wrap" class:field__input-wrap--error={bruttoError !== null}>
        <input
          id="field-brutto"
          type="text"
          inputmode="decimal"
          class="field__input"
          placeholder="z.B. 119,00"
          value={bruttoDisplay}
          oninput={handleBruttoInput}
          onfocus={() => { if (activeField !== 'brutto') { bruttoStr = bruttoDisplay; activeField = 'brutto'; } }}
          aria-label="Bruttobetrag in Euro"
          aria-invalid={bruttoError !== null}
          autocomplete="off"
        />
        <span class="field__unit" aria-hidden="true">€</span>
      </div>
      {#if bruttoError}
        <p class="field-error" role="alert">{bruttoError}</p>
      {/if}
    </div>
  </div>

  <!-- Clear -->
  {#if activeField !== null}
    <div class="actions-bar">
      <button type="button" class="clear-btn" onclick={handleClear}>{strings.toolsCommon.reset}</button>
    </div>
  {/if}

  <!-- Empty state -->
  {#if activeField === null}
    <p class="empty-state">Gib Netto-, MwSt- oder Bruttobetrag ein — alle Felder sind editierbar.</p>
  {/if}

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label={strings.toolsCommon.privacyBadgeAria}>
    Kein Server-Upload · Kein Tracking · Rechnet lokal im Browser
  </div>
</div>

<style>
  .mwst-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Rate bar */
  .rate-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }
  .rate-bar__label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .rate-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .rate-pill {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
    font-family: var(--font-family-mono);
  }
  .rate-pill:hover {
    background: var(--color-surface-raised);
  }
  .rate-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }
  .custom-rate {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }
  .custom-rate__input {
    width: 6rem;
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    border-radius: var(--r-md);
    outline: none;
  }
  .custom-rate__input:focus {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }
  .custom-rate__input--error {
    border-color: var(--color-error);
  }
  .custom-rate__unit {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
  }

  /* Gastronomie badge */
  .gastro-badge {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.5;
  }
  .gastro-badge__icon {
    flex-shrink: 0;
    font-style: normal;
    color: var(--color-accent);
    font-weight: 600;
    font-size: 0.875rem;
  }

  /* Fields */
  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .field--active {
    border-color: var(--color-text);
  }

  .field__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }
  .field__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }
  .field--active .field__label {
    color: var(--color-text);
  }

  .field__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .info-btn {
    width: 1.25rem;
    height: 1.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    font-style: normal;
    line-height: 1;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .info-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0 var(--space-2);
    height: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    white-space: nowrap;
  }
  .copy-btn:hover:not(:disabled) {
    border-color: var(--color-text);
    color: var(--color-text);
  }
  .copy-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .copy-btn--copied {
    border-color: var(--color-success);
    color: var(--color-success);
  }

  .formula-tip {
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-raised);
    border-radius: var(--r-sm);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  .field__input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    padding: 0 var(--space-3);
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }
  .field__input-wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }
  .field__input-wrap--error {
    border-color: var(--color-error);
  }

  .field__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1.125rem;
    font-family: var(--font-family-mono);
    padding: var(--space-3) 0;
    min-width: 0;
  }
  .field__unit {
    font-family: var(--font-family-mono);
    font-size: 0.875rem;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  .field-error {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-error);
    line-height: 1.4;
  }

  /* Actions bar */
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
    padding: var(--space-4) 0;
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
    .field,
    .rate-pill,
    .copy-btn,
    .clear-btn,
    .info-btn,
    .field__input-wrap {
      transition: none;
    }
  }
</style>
