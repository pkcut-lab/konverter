<script lang="ts">
  import type { ValidatorConfig } from '../../lib/tools/schemas';
  import { loadValidate, type ValidateFn } from '../../lib/tools/type-runtime-registry';

  interface Props {
    config: ValidatorConfig;
    placeholder?: string;
  }
  let { config, placeholder = '' }: Props = $props();

  // Lazy-load the validator module so only this tool's chunk ships.
  let validate = $state<ValidateFn | undefined>(undefined);
  let loaded = $state<boolean>(false);
  $effect(() => {
    const id = config.id;
    let cancelled = false;
    void loadValidate(id).then((fn) => {
      if (cancelled) return;
      validate = fn;
      loaded = true;
    });
    return () => {
      cancelled = true;
    };
  });

  let rawInput = $state<string>('');

  const status = $derived.by<'empty' | 'valid' | 'invalid'>(() => {
    if (rawInput === '') return 'empty';
    if (!loaded) return 'empty';
    if (!validate) return 'invalid';
    try {
      return validate(rawInput) ? 'valid' : 'invalid';
    } catch {
      return 'invalid';
    }
  });
</script>

<div class="validator" data-testid="validator">
  <div class="validator__panel">
    <label class="validator__label" for="validator-input">Eingabe</label>
    <textarea
      id="validator-input"
      class="validator__field"
      class:validator__field--valid={status === 'valid'}
      class:validator__field--invalid={status === 'invalid'}
      rows="6"
      spellcheck="false"
      autocomplete="off"
      {placeholder}
      value={rawInput}
      oninput={(e) => (rawInput = (e.target as HTMLTextAreaElement).value)}
    ></textarea>
  </div>

  <div class="validator__status" aria-live="polite">
    {#if status === 'empty'}
      <span class="validator__badge validator__badge--neutral">Bereit</span>
      <span class="validator__rule">{config.rule}</span>
    {:else if status === 'valid'}
      <span class="validator__badge validator__badge--valid">Gültig</span>
      <span class="validator__rule">{config.rule}</span>
    {:else}
      <span class="validator__badge validator__badge--invalid">Ungültig</span>
      <span class="validator__rule">{config.rule}</span>
    {/if}
  </div>
</div>

<style>
  .validator {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .validator__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .validator__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .validator__field {
    width: 100%;
    min-height: 6rem;
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
  .validator__field:hover {
    border-color: var(--color-text-subtle);
  }
  .validator__field:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }
  .validator__field--valid {
    border-color: var(--color-success, var(--color-text-subtle));
  }
  .validator__field--invalid {
    border-color: var(--color-accent);
  }
  .validator__status {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .validator__badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
  }
  .validator__badge--neutral {
    color: var(--color-text-muted);
  }
  .validator__badge--valid {
    color: var(--color-success, var(--color-text));
    border-color: var(--color-success, var(--color-border));
  }
  .validator__badge--invalid {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
  .validator__rule {
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
</style>
