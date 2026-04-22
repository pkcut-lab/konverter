<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    loadFormatter,
    type FormatFn,
    type FormatterEntry,
  } from '../../lib/tools/formatter-runtime-registry';

  interface Props {
    config: FormatterConfig;
    placeholder?: string;
    inversePlaceholder?: string;
    inverseLabel?: string;
  }
  type CopyState = 'idle' | 'copied';
  type Direction = 'forward' | 'inverse';

  let {
    config,
    placeholder = '',
    inversePlaceholder = '',
    inverseLabel = 'Decode',
  }: Props = $props();

  // Formatter module is lazy-imported by config.id so each tool page ships its
  // own chunk instead of all 17 formatters. `entry` stays undefined until the
  // chunk resolves; the UI shows the empty state during that window.
  let entry = $state<FormatterEntry | undefined>(undefined);
  let loaded = $state<boolean>(false);

  $effect(() => {
    const id = config.id;
    let cancelled = false;
    void loadFormatter(id).then((e) => {
      if (cancelled) return;
      entry = e;
      loaded = true;
    });
    return () => {
      cancelled = true;
    };
  });

  const format = $derived<FormatFn | undefined>(entry?.format);
  const inverse = $derived<FormatFn | undefined>(entry?.inverse);
  const hasInverse = $derived(inverse !== undefined);

  let direction = $state<Direction>('forward');
  let rawInput = $state<string>('');
  let copyState = $state<CopyState>('idle');

  const activeFn = $derived<FormatFn | undefined>(direction === 'inverse' ? inverse : format);
  const activePlaceholder = $derived(
    direction === 'inverse' && inversePlaceholder ? inversePlaceholder : placeholder,
  );

  type Result =
    | { ok: true; value: string }
    | { ok: false; error: string }
    | { ok: 'pending' };

  const result = $derived.by<Result>(() => {
    if (rawInput.trim() === '') return { ok: true, value: '' };
    if (!loaded) return { ok: 'pending' };
    if (!activeFn) {
      return { ok: false, error: `Kein Formatter für "${config.id}" registriert.` };
    }
    try {
      return { ok: true, value: activeFn(rawInput) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler' };
    }
  });

  function setDirection(d: Direction) {
    if (d === direction) return;
    direction = d;
  }

  const hasOutput = $derived(result.ok === true && result.value !== '');
  const lineCount = $derived(
    result.ok === true && result.value ? result.value.split('\n').length : 0,
  );

  function onInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    rawInput = target.value;
  }

  async function onCopyOutput() {
    if (result.ok !== true || !result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      // Clipboard rejection — fail silent
    }
  }

  function onClear() {
    rawInput = '';
  }
</script>

<div class="formatter" data-testid="formatter">
  {#if hasInverse}
    <div class="formatter__toggle" role="group" aria-label="Richtung wählen">
      <button
        type="button"
        class="formatter__toggle-btn"
        class:formatter__toggle-btn--active={direction === 'forward'}
        aria-pressed={direction === 'forward'}
        onclick={() => setDirection('forward')}
      >
        Encode
      </button>
      <button
        type="button"
        class="formatter__toggle-btn"
        class:formatter__toggle-btn--active={direction === 'inverse'}
        aria-pressed={direction === 'inverse'}
        onclick={() => setDirection('inverse')}
      >
        {inverseLabel}
      </button>
    </div>
  {/if}

  <div class="formatter__panel">
    <div class="formatter__panel-head">
      <label class="formatter__label" for="formatter-input" data-testid="formatter-label-input">
        Eingabe
      </label>
      <button
        type="button"
        class="formatter__ghost-btn"
        onclick={onClear}
        disabled={rawInput === ''}
        data-testid="formatter-clear"
      >
        Leeren
      </button>
    </div>
    <textarea
      class="formatter__field"
      id="formatter-input"
      name="formatter-input"
      rows="10"
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      placeholder={activePlaceholder}
      value={rawInput}
      oninput={onInput}
      data-testid="formatter-input"
    ></textarea>
  </div>

  <div class="formatter__panel">
    <div class="formatter__panel-head">
      <span class="formatter__label" data-testid="formatter-label-output">
        Ausgabe{#if hasOutput}<span class="formatter__meta"> · {lineCount} {lineCount === 1 ? 'Zeile' : 'Zeilen'}</span>{/if}
      </span>
      <button
        type="button"
        class="formatter__ghost-btn"
        class:formatter__ghost-btn--copied={copyState === 'copied'}
        onclick={onCopyOutput}
        disabled={!hasOutput}
        aria-label="Formatierte Ausgabe in die Zwischenablage kopieren"
        data-testid="formatter-copy"
      >
        {copyState === 'copied' ? 'Kopiert' : 'Kopieren'}
      </button>
    </div>
    {#if result.ok === true && result.value}
      <pre
        class="formatter__output"
        aria-live="polite"
        data-testid="formatter-output">{result.value}</pre>
    {:else if result.ok === false}
      <div class="formatter__error" role="alert" data-testid="formatter-error">
        <span class="formatter__error-label">Fehler</span>
        <span class="formatter__error-message">{result.error}</span>
      </div>
    {:else}
      <div class="formatter__empty" data-testid="formatter-empty">
        <span>Eingabe leer — oben einfügen, um die formatierte Ausgabe zu sehen.</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .formatter {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .formatter__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }

  .formatter__panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: 1.5rem;
  }

  .formatter__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .formatter__meta {
    color: var(--color-text-subtle);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }

  .formatter__field {
    width: 100%;
    min-height: 10rem;
    margin: 0;
    padding: var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    resize: vertical;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .formatter__field::placeholder {
    color: var(--color-text-subtle);
  }
  .formatter__field:hover {
    border-color: var(--color-text-subtle);
  }
  .formatter__field:focus {
    outline: none;
    border-color: var(--color-accent);
  }
  .formatter__field:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }

  .formatter__output {
    margin: 0;
    padding: var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    max-height: 28rem;
    overflow: auto;
    white-space: pre;
    tab-size: 2;
  }

  .formatter__empty,
  .formatter__error {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .formatter__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
  }
  .formatter__error-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-accent);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .formatter__error-message {
    font-family: var(--font-family-mono);
    color: var(--color-text-muted);
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .formatter__ghost-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.05em;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }
  .formatter__ghost-btn:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .formatter__ghost-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
  .formatter__ghost-btn:disabled {
    color: var(--color-text-subtle);
    cursor: not-allowed;
  }
  .formatter__ghost-btn--copied {
    color: var(--color-accent);
  }

  .formatter__toggle {
    display: inline-flex;
    align-self: flex-start;
    padding: 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
  }
  .formatter__toggle-btn {
    padding: var(--space-1) var(--space-4);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: transparent;
    border: none;
    border-radius: calc(var(--r-sm) - 2px);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease-out),
      background-color var(--dur-fast) var(--ease-out);
  }
  .formatter__toggle-btn:hover:not(.formatter__toggle-btn--active) {
    color: var(--color-text);
  }
  .formatter__toggle-btn--active {
    color: var(--color-bg);
    background: var(--color-text);
  }
  .formatter__toggle-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
</style>
