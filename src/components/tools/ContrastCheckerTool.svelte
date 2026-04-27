<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { evaluatePair, normalizeHex } from '../../lib/tools/kontrast-pruefer';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;
  const strings = $derived(t(lang));

  let fgInput = $state<string>('#1A1A1A');
  let bgInput = $state<string>('#FFFFFF');

  const fgNormalized = $derived(normalizeHex(fgInput));
  const bgNormalized = $derived(normalizeHex(bgInput));
  const fgHexCss = $derived(fgNormalized ? `#${fgNormalized}` : null);
  const bgHexCss = $derived(bgNormalized ? `#${bgNormalized}` : null);

  const evaluation = $derived(evaluatePair(fgInput, bgInput));

  function swap() {
    const tmp = fgInput;
    fgInput = bgInput;
    bgInput = tmp;
  }

  function fmtRatio(n: number): string {
    return n.toFixed(2).replace('.', ',');
  }
</script>

<div class="contrast" data-testid="contrast-checker">
  <div class="contrast__inputs">
    <div class="contrast__picker">
      <span class="contrast__label">Vordergrund</span>
      <div class="contrast__picker-row">
        <label class="contrast__swatch-picker" aria-label="Vordergrundfarbe auswählen">
          <input
            type="color"
            class="contrast__color-input"
            value={fgHexCss ?? '#000000'}
            oninput={(e) => (fgInput = (e.target as HTMLInputElement).value)}
          />
          <span
            class="contrast__swatch"
            style:background-color={fgHexCss ?? 'transparent'}
            aria-hidden="true"
          ></span>
        </label>
        <input
          type="text"
          class="contrast__hex-input"
          aria-label="Vordergrundfarbe als Hex-Code"
          spellcheck="false"
          autocomplete="off"
          value={fgInput}
          oninput={(e) => (fgInput = (e.target as HTMLInputElement).value)}
        />
      </div>
    </div>

    <button type="button" class="contrast__swap" onclick={swap} aria-label={strings.toolsCommon.swapAria}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M7 10h10M7 10l3-3M7 10l3 3M17 14H7m10 0-3-3m3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>{strings.toolsCommon.swap}</span>
    </button>

    <div class="contrast__picker">
      <span class="contrast__label">Hintergrund</span>
      <div class="contrast__picker-row">
        <label class="contrast__swatch-picker" aria-label="Hintergrundfarbe auswählen">
          <input
            type="color"
            class="contrast__color-input"
            value={bgHexCss ?? '#FFFFFF'}
            oninput={(e) => (bgInput = (e.target as HTMLInputElement).value)}
          />
          <span
            class="contrast__swatch"
            style:background-color={bgHexCss ?? 'transparent'}
            aria-hidden="true"
          ></span>
        </label>
        <input
          type="text"
          class="contrast__hex-input"
          aria-label="Hintergrundfarbe als Hex-Code"
          spellcheck="false"
          autocomplete="off"
          value={bgInput}
          oninput={(e) => (bgInput = (e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  </div>

  {#if evaluation}
    <div class="contrast__preview" style:background-color={`#${evaluation.bg}`}>
      <p class="contrast__preview-large" style:color={`#${evaluation.fg}`}>
        Typografie prüfen
      </p>
      <p class="contrast__preview-body" style:color={`#${evaluation.fg}`}>
        Der schnelle braune Fuchs springt über den faulen Hund — Lesbarkeit im Fließtext.
      </p>
      <p class="contrast__preview-small" style:color={`#${evaluation.fg}`}>
        Klein: Captions, Labels, Metadaten.
      </p>
    </div>

    <div class="contrast__ratio">
      <span class="contrast__ratio-value">{fmtRatio(evaluation.ratio)}:1</span>
      <span class="contrast__ratio-label">Kontrastverhältnis</span>
    </div>

    <div class="contrast__grid">
      <div class="contrast__cell">
        <span class="contrast__cell-label">AA · Normal</span>
        <span class="contrast__cell-sub">≥ 4,5:1</span>
        <span class="contrast__badge" class:contrast__badge--pass={evaluation.result.aa.normalText}>
          {evaluation.result.aa.normalText ? 'bestanden' : 'nicht bestanden'}
        </span>
      </div>
      <div class="contrast__cell">
        <span class="contrast__cell-label">AA · Groß</span>
        <span class="contrast__cell-sub">≥ 3:1</span>
        <span class="contrast__badge" class:contrast__badge--pass={evaluation.result.aa.largeText}>
          {evaluation.result.aa.largeText ? 'bestanden' : 'nicht bestanden'}
        </span>
      </div>
      <div class="contrast__cell">
        <span class="contrast__cell-label">AAA · Normal</span>
        <span class="contrast__cell-sub">≥ 7:1</span>
        <span class="contrast__badge" class:contrast__badge--pass={evaluation.result.aaa.normalText}>
          {evaluation.result.aaa.normalText ? 'bestanden' : 'nicht bestanden'}
        </span>
      </div>
      <div class="contrast__cell">
        <span class="contrast__cell-label">AAA · Groß</span>
        <span class="contrast__cell-sub">≥ 4,5:1</span>
        <span class="contrast__badge" class:contrast__badge--pass={evaluation.result.aaa.largeText}>
          {evaluation.result.aaa.largeText ? 'bestanden' : 'nicht bestanden'}
        </span>
      </div>
    </div>
  {:else}
    <div class="contrast__empty" role="alert">
      Ungültiger Hex-Code — bitte 3- oder 6-stellig eingeben (z. B. #1A1A1A).
    </div>
  {/if}
</div>

<style>
  .contrast {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .contrast__inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-4);
    align-items: end;
  }
  @media (max-width: 40rem) {
    .contrast__inputs {
      grid-template-columns: 1fr;
    }
  }
  .contrast__picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }
  .contrast__picker-row {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }
  .contrast__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .contrast__swatch-picker {
    position: relative;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--r-sm);
    cursor: pointer;
    display: block;
  }
  .contrast__swatch {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .contrast__swatch-picker:hover .contrast__swatch {
    border-color: var(--color-text-subtle);
  }
  .contrast__color-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: 0;
    padding: 0;
  }
  .contrast__color-input:focus-visible + .contrast__swatch {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .contrast__hex-input {
    flex: 1;
    min-width: 0;
    padding: var(--space-2) var(--space-3);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    font-variant-numeric: tabular-nums;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .contrast__hex-input:hover {
    border-color: var(--color-text-subtle);
  }
  .contrast__hex-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }
  .contrast__swap {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
    margin-bottom: 0;
    height: fit-content;
    align-self: end;
  }
  .contrast__swap:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .contrast__swap:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  @media (max-width: 40rem) {
    .contrast__swap {
      justify-self: center;
    }
  }
  .contrast__preview {
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .contrast__preview-large {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .contrast__preview-body {
    margin: 0;
    font-size: 1rem;
    line-height: 1.55;
  }
  .contrast__preview-small {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.5;
  }
  .contrast__ratio {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }
  .contrast__ratio-value {
    font-family: var(--font-family-mono);
    font-size: 2.25rem;
    font-weight: 500;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .contrast__ratio-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .contrast__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  @media (min-width: 40rem) {
    .contrast__grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .contrast__cell {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .contrast__cell-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: 0.03em;
  }
  .contrast__cell-sub {
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    color: var(--color-text-subtle);
    font-variant-numeric: tabular-nums;
    margin-bottom: var(--space-2);
  }
  .contrast__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1) var(--space-2);
    background: transparent;
    color: var(--color-error);
    border: 1px solid var(--color-error);
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-align: center;
  }
  .contrast__badge--pass {
    color: var(--color-success);
    border-color: var(--color-success);
  }
  .contrast__empty {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text);
    font-size: var(--font-size-small);
  }
</style>
