<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { QUICK_COLORS } from '../../lib/tools/hex-rgb-konverter-presets';

  interface Props {
    config: FormatterConfig;
  }
  type CopyState = 'idle' | 'copied';

  let { config }: Props = $props();

  let hexInput = $state<string>('#FF5733');
  let copyStates = $state<Record<string, CopyState>>({});

  const output = $derived.by(() => {
    try {
      return config.format(hexInput);
    } catch {
      // Formatter contract allows throw for invalid input (see json-formatter).
      // Hex-specific initial state would crash SSR for non-hex formatters that
      // happen to route through this component. Swallow the error — the UI
      // will simply render no output block until input becomes valid.
      return '';
    }
  });
  const lines = $derived(output ? output.split('\n') : []);

  const FORMAT_LABELS: Record<number, string> = { 0: 'RGB', 1: 'HSL', 2: 'OKLCH' };

  /**
   * Derive a valid CSS color from the hex input for the swatch preview.
   * Only render a swatch when the formatter produces output (= input is valid).
   */
  const swatchColor = $derived.by(() => {
    if (!output) return null;
    const cleaned = hexInput.replace(/\s/g, '').replace(/^#{0,1}/, '#');
    const bare = cleaned.slice(1);
    if (/^[0-9A-Fa-f]{3,8}$/.test(bare) && [3, 4, 6, 8].includes(bare.length)) {
      return cleaned;
    }
    return null;
  });

  function onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    hexInput = target.value;
  }

  function onQuickColor(hex: string) {
    hexInput = hex;
  }

  async function onCopyLine(index: number) {
    const line = lines[index];
    if (!line) return;
    try {
      await navigator.clipboard.writeText(line);
      copyStates = { ...copyStates, [index]: 'copied' };
      setTimeout(() => {
        copyStates = { ...copyStates, [index]: 'idle' };
      }, 1500);
    } catch {
      // Clipboard rejection — fail silent
    }
  }

  async function onCopyAll() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      copyStates = { ...copyStates, all: 'copied' };
      setTimeout(() => {
        copyStates = { ...copyStates, all: 'idle' };
      }, 1500);
    } catch {
      // Clipboard rejection — fail silent
    }
  }
</script>

<div class="color-converter" data-testid="color-converter">
  <div class="color-converter__input-row">
    <div class="input-panel">
      <label class="input-panel__label" for="hex-input" data-testid="color-converter-label">
        <span class="input-panel__label-text">HEX</span>
      </label>
      <input
        class="input-panel__field"
        id="hex-input"
        name="hex-input"
        type="text"
        inputmode="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="#FF5733"
        value={hexInput}
        oninput={onInput}
        data-testid="color-converter-input"
      />
    </div>

    <div
      class="swatch"
      class:swatch--empty={!swatchColor}
      role="img"
      style:background-color={swatchColor ?? 'transparent'}
      aria-label={swatchColor ? `Farbvorschau: ${swatchColor}` : 'Keine gültige Farbe'}
      data-testid="color-converter-swatch"
    >
      {#if !swatchColor}
        <span class="swatch__placeholder">?</span>
      {/if}
    </div>
  </div>

  {#if lines.length > 0}
    <div class="output-rows" data-testid="color-converter-output">
      {#each lines as line, i (i)}
        <div class="output-row">
          <span class="output-row__label">{FORMAT_LABELS[i] ?? `Format ${i + 1}`}</span>
          <output class="output-row__value" aria-live="polite" data-testid="color-converter-output-{i}">{line}</output>
          <button
            type="button"
            class="copy-btn"
            class:copy-btn--copied={copyStates[i] === 'copied'}
            onclick={() => onCopyLine(i)}
            aria-label="{FORMAT_LABELS[i] ?? 'Wert'} kopieren"
            data-testid="color-converter-copy-{i}"
          >
            <svg class="copy-btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.75" />
              <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>{copyStates[i] === 'copied' ? 'Kopiert' : 'Kopieren'}</span>
          </button>
        </div>
      {/each}
    </div>
  {:else if hexInput.replace(/[\s#]/g, '').length > 0}
    <div class="output-empty" data-testid="color-converter-error">
      <span>Ungültiger HEX-Code — bitte 3, 4, 6 oder 8 Hex-Ziffern eingeben</span>
    </div>
  {/if}

  <div class="color-converter__actions">
    <button
      type="button"
      class="kbd-chip"
      class:kbd-chip--copied={copyStates.all === 'copied'}
      disabled={lines.length === 0}
      onclick={onCopyAll}
      aria-label="Alle Formate kopieren"
      data-testid="color-converter-copy-all"
    >
      <svg class="kbd-chip__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.75" />
        <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>{copyStates.all === 'copied' ? 'Alle kopiert' : 'Alle kopieren'}</span>
    </button>
  </div>

  <div class="quick">
    <span class="quick__label">Häufige Farben</span>
    <div class="quick__list">
      {#each QUICK_COLORS as color (color.hex)}
        <button
          type="button"
          class="chip"
          class:chip--active={hexInput.toUpperCase() === color.hex.toUpperCase()}
          onclick={() => onQuickColor(color.hex)}
          data-testid="color-converter-quick-{color.hex.slice(1).toLowerCase()}"
        >
          <span
            class="chip__dot"
            style:background-color={color.hex}
            aria-hidden="true"
          ></span>
          {color.label}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .color-converter {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
  }

  .color-converter__input-row {
    display: flex;
    align-items: flex-end;
    gap: var(--space-6);
  }

  .input-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }

  .input-panel__label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .input-panel__field {
    width: 100%;
    margin: 0;
    padding: 0 0 var(--space-2) 0;
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-h1);
    line-height: var(--font-lh-h1);
    font-variant-numeric: tabular-nums;
    font-weight: 400;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
    appearance: none;
    touch-action: manipulation;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .input-panel__field::placeholder {
    color: var(--color-text-subtle);
  }
  .input-panel__field:hover {
    border-bottom-color: var(--color-text-subtle);
  }
  .input-panel__field:focus {
    outline: none;
    border-bottom-color: var(--color-accent);
  }
  .input-panel__field:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-radius: var(--r-sm);
    border-bottom-color: transparent;
  }

  .swatch {
    flex: 0 0 auto;
    width: 120px;
    height: 120px;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--dur-fast) var(--ease-out);
  }
  .swatch--empty {
    background: var(--color-surface);
  }
  .swatch__placeholder {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-h2);
    color: var(--color-text-subtle);
    user-select: none;
  }

  .output-rows {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
  }

  .output-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .output-row:last-child {
    border-bottom: 0;
  }

  .output-row__label {
    flex: 0 0 4rem;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .output-row__value {
    flex: 1;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    overflow-wrap: break-word;
    word-break: break-word;
    min-width: 0;
  }

  .copy-btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: transparent;
    color: var(--color-text-subtle);
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .copy-btn:hover {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .copy-btn:active {
    transform: scale(0.98);
  }
  .copy-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .copy-btn--copied,
  .copy-btn--copied:hover {
    color: var(--color-success);
    border-color: var(--color-success);
  }
  .copy-btn__icon {
    width: 12px;
    height: 12px;
  }

  .output-empty {
    margin-top: var(--space-6);
    padding: var(--space-4);
    border: 1px solid var(--color-error);
    border-radius: var(--r-sm);
    background: transparent;
    color: var(--color-error);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }

  .color-converter__actions {
    margin-top: var(--space-4);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .kbd-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .kbd-chip:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .kbd-chip:active:not(:disabled) {
    transform: scale(0.98);
  }
  .kbd-chip:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .kbd-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .kbd-chip--copied,
  .kbd-chip--copied:hover {
    color: var(--color-success);
    border-color: var(--color-success);
  }
  .kbd-chip__icon {
    width: 14px;
    height: 14px;
  }

  .quick {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .quick__label {
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.01em;
  }

  .quick__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font: inherit;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  .chip:hover {
    color: var(--color-text);
    background: var(--color-surface);
  }
  .chip:active {
    transform: scale(0.98);
  }
  .chip:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .chip--active {
    color: var(--color-text);
    border-color: var(--color-accent);
  }

  .chip__dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: var(--r-sm);
    border: 1px solid var(--color-border);
    flex: 0 0 auto;
  }

  @media (max-width: 48rem) {
    .color-converter {
      padding: var(--space-6);
    }
    .color-converter__input-row {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-4);
    }
    .swatch {
      width: 100%;
      height: 80px;
    }
    .input-panel__field {
      font-size: 1.875rem;
    }
    .output-row {
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .output-row__label {
      flex: 0 0 100%;
    }
    .output-row__value {
      flex: 1;
    }
  }
</style>
