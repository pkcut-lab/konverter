<script lang="ts">
  import type { ComparerConfig } from '../../lib/tools/schemas';
  import { loadDiff, type DiffFn } from '../../lib/tools/type-runtime-registry';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: ComparerConfig;
    lang: Lang;
    placeholderA?: string;
    placeholderB?: string;
  }
  let { config, lang, placeholderA = '', placeholderB = '' }: Props = $props();
  const strings = $derived(t(lang));

  // Lazy-load the diff module so only this tool's chunk ships on the page.
  let diff = $state<DiffFn | undefined>(undefined);
  $effect(() => {
    const id = config.id;
    let cancelled = false;
    void loadDiff(id).then((fn) => {
      if (cancelled) return;
      diff = fn;
    });
    return () => {
      cancelled = true;
    };
  });

  let inputA = $state<string>('');
  let inputB = $state<string>('');
  // Debounced mirrors of inputA/inputB. text-diff allocates an O(m×n) LCS table
  // on every call and json-diff re-parses both sides — running that on every
  // keystroke locks a paste of 2000 lines visibly. We debounce by DEBOUNCE_MS
  // so the diff catches up shortly after the user stops typing, not during.
  let debouncedA = $state<string>('');
  let debouncedB = $state<string>('');
  const DEBOUNCE_MS = 180;
  let copyState = $state<'idle' | 'copied'>('idle');

  $effect(() => {
    const a = inputA;
    const b = inputB;
    const handle = setTimeout(() => {
      debouncedA = a;
      debouncedB = b;
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  });

  type Result = { ok: true; value: string } | { ok: false; error: string };
  const result = $derived.by<Result>(() => {
    if (debouncedA.trim() === '' && debouncedB.trim() === '') return { ok: true, value: '' };
    if (!diff) return { ok: false, error: `Kein Comparer für "${config.id}" registriert.` };
    try {
      return { ok: true, value: diff(debouncedA, debouncedB) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler' };
    }
  });
  const hasOutput = $derived(result.ok && result.value !== '');

  async function onCopy() {
    if (!result.ok || !result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      /* silent */
    }
  }
</script>

<div class="comparer" data-testid="comparer">
  <div class="comparer__inputs">
    <div class="comparer__panel">
      <label class="comparer__label" for="comparer-a">Text A</label>
      <textarea
        id="comparer-a"
        class="comparer__field"
        rows="8"
        spellcheck="false"
        autocomplete="off"
        placeholder={placeholderA}
        value={inputA}
        oninput={(e) => (inputA = (e.target as HTMLTextAreaElement).value)}
      ></textarea>
    </div>
    <div class="comparer__panel">
      <label class="comparer__label" for="comparer-b">Text B</label>
      <textarea
        id="comparer-b"
        class="comparer__field"
        rows="8"
        spellcheck="false"
        autocomplete="off"
        placeholder={placeholderB}
        value={inputB}
        oninput={(e) => (inputB = (e.target as HTMLTextAreaElement).value)}
      ></textarea>
    </div>
  </div>

  <div class="comparer__panel">
    <div class="comparer__panel-head">
      <span class="comparer__label">Unterschied</span>
      <button
        type="button"
        class="comparer__ghost-btn"
        class:comparer__ghost-btn--copied={copyState === 'copied'}
        onclick={onCopy}
        disabled={!hasOutput}
      >
        {copyState === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copy}
      </button>
    </div>
    {#if result.ok && result.value}
      <pre class="comparer__output" aria-live="polite">{result.value}</pre>
    {:else if !result.ok}
      <div class="comparer__error" role="alert">
        <span class="comparer__error-label">Fehler</span>
        <span>{result.error}</span>
      </div>
    {:else}
      <div class="comparer__empty">Oben beide Texte einfügen, um den Unterschied zu sehen.</div>
    {/if}
  </div>
</div>

<style>
  .comparer {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .comparer__inputs {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  @media (min-width: 40rem) {
    .comparer__inputs {
      grid-template-columns: 1fr 1fr;
    }
  }
  .comparer__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }
  .comparer__panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: 1.5rem;
  }
  .comparer__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .comparer__field {
    width: 100%;
    min-height: 8rem;
    padding: var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    resize: vertical;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .comparer__field:hover {
    border-color: var(--color-text-subtle);
  }
  .comparer__field:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }
  .comparer__output {
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
    white-space: pre;
  }
  .comparer__empty,
  .comparer__error {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .comparer__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
  }
  .comparer__error-label {
    font-family: var(--font-family-mono);
    font-weight: 500;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .comparer__ghost-btn {
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
    transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }
  .comparer__ghost-btn:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .comparer__ghost-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
  .comparer__ghost-btn:disabled {
    color: var(--color-text-subtle);
    cursor: not-allowed;
  }
  .comparer__ghost-btn--copied {
    color: var(--color-accent);
  }
</style>
