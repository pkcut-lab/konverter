<script lang="ts">
  import type { AnalyzerConfig } from '../../lib/tools/schemas';
  import { loadAnalyze, type AnalyzeFn } from '../../lib/tools/type-runtime-registry';

  interface Props {
    config: AnalyzerConfig;
    placeholder?: string;
  }
  let { config, placeholder = '' }: Props = $props();

  // Lazy-load the analyzer module so only this tool's chunk ships.
  let analyze = $state<AnalyzeFn | undefined>(undefined);
  $effect(() => {
    const id = config.id;
    let cancelled = false;
    void loadAnalyze(id).then((fn) => {
      if (cancelled) return;
      analyze = fn;
    });
    return () => {
      cancelled = true;
    };
  });

  let rawInput = $state<string>('');

  const metrics = $derived.by<Record<string, string>>(() => {
    if (!analyze) return {};
    try {
      return analyze(rawInput);
    } catch {
      return {};
    }
  });
</script>

<div class="analyzer" data-testid="analyzer">
  <div class="analyzer__panel">
    <label class="analyzer__label" for="analyzer-input">Eingabe</label>
    <textarea
      id="analyzer-input"
      class="analyzer__field"
      rows="10"
      spellcheck="false"
      autocomplete="off"
      {placeholder}
      value={rawInput}
      oninput={(e) => (rawInput = (e.target as HTMLTextAreaElement).value)}
    ></textarea>
  </div>

  <div class="analyzer__metrics" aria-live="polite">
    {#each config.metrics as m}
      <div class="analyzer__metric">
        <span class="analyzer__metric-label">{m.label}</span>
        <span class="analyzer__metric-value">{metrics[m.id] ?? '0'}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .analyzer {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .analyzer__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .analyzer__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .analyzer__field {
    width: 100%;
    min-height: 10rem;
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
  .analyzer__field:hover {
    border-color: var(--color-text-subtle);
  }
  .analyzer__field:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }
  .analyzer__metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
    overflow: hidden;
  }
  .analyzer__metric {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }
  .analyzer__metric-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .analyzer__metric-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }
</style>
