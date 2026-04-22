<script lang="ts">
  import type { GeneratorConfig } from '../../lib/tools/schemas';
  import { loadGenerate, type GenerateFn } from '../../lib/tools/type-runtime-registry';

  interface Props {
    config: GeneratorConfig;
  }
  let { config }: Props = $props();

  // Lazy-load the generator module so only this tool's chunk ships.
  let generate = $state<GenerateFn | undefined>(undefined);
  $effect(() => {
    const id = config.id;
    let cancelled = false;
    void loadGenerate(id).then((fn) => {
      if (cancelled) return;
      generate = fn;
    });
    return () => {
      cancelled = true;
    };
  });

  let count = $state<number>(config.defaultCount ?? 1);
  let output = $state<string>('');
  let error = $state<string>('');
  let copyState = $state<'idle' | 'copied'>('idle');

  // uuid-generator extra: version toggle
  let uuidVersion = $state<number>(4);
  // password-generator extras
  let pwLength = $state<number>(16);
  let pwLower = $state<boolean>(true);
  let pwUpper = $state<boolean>(true);
  let pwDigits = $state<boolean>(true);
  let pwSpecial = $state<boolean>(true);

  function buildConfig(): Record<string, unknown> {
    if (config.id === 'uuid-generator') return { version: uuidVersion };
    if (config.id === 'password-generator') {
      return {
        length: pwLength,
        lower: pwLower,
        upper: pwUpper,
        digits: pwDigits,
        special: pwSpecial,
      };
    }
    return {};
  }

  function onGenerate() {
    error = '';
    if (!generate) {
      error = `Kein Generator für "${config.id}" registriert.`;
      return;
    }
    try {
      const cfg = buildConfig();
      const results: string[] = [];
      const n = Math.max(1, Math.min(count, 500));
      for (let i = 0; i < n; i++) results.push(generate(cfg));
      output = results.join('\n');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unbekannter Fehler';
    }
  }

  async function onCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      /* silent */
    }
  }
</script>

<div class="generator" data-testid="generator">
  <div class="generator__controls">
    {#if config.id === 'uuid-generator'}
      <label class="generator__control">
        <span class="generator__control-label">Version</span>
        <select
          class="generator__select"
          value={uuidVersion}
          onchange={(e) => (uuidVersion = Number((e.target as HTMLSelectElement).value))}
        >
          <option value={4}>v4 (zufällig)</option>
          <option value={7}>v7 (zeit-sortiert)</option>
        </select>
      </label>
    {/if}
    {#if config.id === 'password-generator'}
      <label class="generator__control">
        <span class="generator__control-label">Länge</span>
        <input
          type="number"
          class="generator__number"
          min="4"
          max="128"
          value={pwLength}
          oninput={(e) => (pwLength = Math.max(4, Math.min(128, Number((e.target as HTMLInputElement).value) || 16)))}
        />
      </label>
      <label class="generator__checkbox">
        <input type="checkbox" checked={pwLower} onchange={(e) => (pwLower = (e.target as HTMLInputElement).checked)} />
        <span>a–z</span>
      </label>
      <label class="generator__checkbox">
        <input type="checkbox" checked={pwUpper} onchange={(e) => (pwUpper = (e.target as HTMLInputElement).checked)} />
        <span>A–Z</span>
      </label>
      <label class="generator__checkbox">
        <input type="checkbox" checked={pwDigits} onchange={(e) => (pwDigits = (e.target as HTMLInputElement).checked)} />
        <span>0–9</span>
      </label>
      <label class="generator__checkbox">
        <input type="checkbox" checked={pwSpecial} onchange={(e) => (pwSpecial = (e.target as HTMLInputElement).checked)} />
        <span>!@#…</span>
      </label>
    {/if}
    <label class="generator__control">
      <span class="generator__control-label">Anzahl</span>
      <input
        type="number"
        class="generator__number"
        min="1"
        max="500"
        value={count}
        oninput={(e) => (count = Math.max(1, Math.min(500, Number((e.target as HTMLInputElement).value) || 1)))}
      />
    </label>
  </div>

  <div class="generator__actions">
    <button type="button" class="generator__btn" onclick={onGenerate}>Generieren</button>
    <button
      type="button"
      class="generator__ghost-btn"
      class:generator__ghost-btn--copied={copyState === 'copied'}
      onclick={onCopy}
      disabled={!output}
    >
      {copyState === 'copied' ? 'Kopiert' : 'Kopieren'}
    </button>
  </div>

  {#if error}
    <div class="generator__error" role="alert">
      <span class="generator__error-label">Fehler</span>
      <span>{error}</span>
    </div>
  {:else if output}
    <pre class="generator__output" aria-live="polite">{output}</pre>
  {:else}
    <div class="generator__empty">Klick „Generieren" für ein Ergebnis.</div>
  {/if}
</div>

<style>
  .generator {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }
  .generator__controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    align-items: flex-end;
  }
  .generator__control {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .generator__control-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .generator__number,
  .generator__select {
    padding: var(--space-2) var(--space-3);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .generator__number {
    width: 6rem;
  }
  .generator__select:focus-visible,
  .generator__number:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
  .generator__checkbox {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .generator__actions {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }
  .generator__btn {
    padding: var(--space-2) var(--space-5);
    color: var(--color-bg);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: var(--color-text);
    border: 1px solid var(--color-text);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: opacity var(--dur-fast) var(--ease-out);
  }
  .generator__btn:hover {
    opacity: 0.85;
  }
  .generator__btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
  .generator__ghost-btn {
    display: inline-flex;
    align-items: center;
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
  }
  .generator__ghost-btn:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .generator__ghost-btn:disabled {
    color: var(--color-text-subtle);
    cursor: not-allowed;
  }
  .generator__ghost-btn--copied {
    color: var(--color-accent);
  }
  .generator__output {
    margin: 0;
    padding: var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    max-height: 28rem;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .generator__empty,
  .generator__error {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .generator__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
  }
  .generator__error-label {
    font-family: var(--font-family-mono);
    font-weight: 500;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
