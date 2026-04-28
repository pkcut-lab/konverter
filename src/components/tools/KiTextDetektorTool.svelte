<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { loadKiTextDetektor } from '../../lib/tools/type-runtime-registry';
  import Loader from '../Loader.svelte';
  import type { ProgressEvent, KiTextResult } from '../../lib/tools/ki-text-detektor';
  import type { Lang } from '../../lib/i18n/lang';
  import MlBanner from '../MlBanner.svelte';
  import { ML_VARIANTS } from '../../lib/tools/ml-variants';

  interface Props {
    config: FormatterConfig;
    placeholder?: string;
    lang?: Lang;
  }
  let {
    config,
    placeholder = 'Füge den Text ein, den du auf KI prüfen möchtest...',
    lang = 'de',
  }: Props = $props();

  let rawInput = $state<string>('');
  let phase = $state<'idle' | 'preparing' | 'analyzing' | 'done' | 'error'>('idle');
  let errorMessage = $state<string>('');
  let results = $state<KiTextResult[] | null>(null);
  let prepareProgress = $state<ProgressEvent>({ loaded: 0, total: 0 });

  let module: typeof import('../../lib/tools/ki-text-detektor') | null = null;
  // Single-variant tool — banner just discloses the size; no switcher.
  const variants = ML_VARIANTS['ki-text-detektor'] ?? [];

  async function analyze() {
    if (!rawInput.trim()) return;
    errorMessage = '';
    
    try {
      if (!module) {
        module = await loadKiTextDetektor();
      }

      if (!module.isPrepared()) {
        phase = 'preparing';
        await module.prepareModel((p) => {
          prepareProgress = p;
        });
      }

      phase = 'analyzing';
      results = await module.analyzeText(rawInput);
      phase = 'done';
    } catch (err) {
      console.error(err);
      phase = 'error';
      errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.';
    }
  }

  function reset() {
    rawInput = '';
    phase = 'idle';
    results = null;
    errorMessage = '';
  }

  // TMR AI Text Detector: LABEL_0 = human, LABEL_1 = ai
  const aiScore = $derived.by(() => {
    if (!results || results.length === 0) return 0;
    
    // The new model uses 'ai' (LABEL_1) and 'human' (LABEL_0)
    const aiResult = results.find(r => 
      r.label.toLowerCase() === 'ai' || 
      r.label === 'LABEL_1'
    );
    
    if (aiResult) return Math.round(aiResult.score * 100);
    
    const humanResult = results.find(r => 
      r.label.toLowerCase() === 'human' || 
      r.label === 'LABEL_0'
    );
    
    if (humanResult) return 100 - Math.round(humanResult.score * 100);
    
    return 0;
  });

  const resultStatus = $derived.by(() => {
    if (aiScore > 80) return 'ai';
    if (aiScore > 40) return 'mix';
    return 'human';
  });

  const CHAR_LIMIT = 2000;
  const charCount = $derived(rawInput.length);
  const charOverLimit = $derived(charCount > CHAR_LIMIT);
</script>

<div class="ki-tool">
  {#if phase === 'idle' || phase === 'error'}
    {#if variants.length > 0}
      <MlBanner {lang} {variants} />
    {/if}
    <div class="ki-tool__input-panel">
      <div class="ki-tool__label-row">
        <label class="ki-tool__label" for="ki-input">Text eingeben</label>
        <span class="ki-tool__char-count {charOverLimit ? 'ki-tool__char-count--over' : ''}">
          {charCount} / {CHAR_LIMIT}
        </span>
      </div>
      <textarea
        id="ki-input"
        class="ki-tool__field"
        rows="10"
        {placeholder}
        value={rawInput}
        oninput={(e) => (rawInput = (e.target as HTMLTextAreaElement).value)}
      ></textarea>
      {#if charOverLimit}
        <p class="ki-tool__char-warning">
          Text wird auf {CHAR_LIMIT} Zeichen gekürzt. Nur der erste Teil wird analysiert.
        </p>
      {/if}

      {#if errorMessage}
        <div class="ki-tool__error">{errorMessage}</div>
      {/if}

      <div class="ki-tool__actions">
        <button class="btn btn--primary" onclick={analyze} disabled={!rawInput.trim()}>
          Text auf KI prüfen
        </button>
      </div>
    </div>
  {:else if phase === 'preparing' || phase === 'analyzing'}
    <div class="ki-tool__loading">
      <div class="ki-tool__loading-box">
        <Loader 
          variant="progress" 
          value={phase === 'preparing' ? (prepareProgress.total ? prepareProgress.loaded / prepareProgress.total : 0) : 1}
          label={phase === 'preparing' ? 'KI-Modell wird geladen...' : 'Text wird analysiert...'}
        />
        <p class="ki-tool__loading-note">Beim ersten Mal lädt das Modell (~80 MB) einmalig — danach ist es offline verfügbar. Alle Analysen laufen 100 % lokal im Browser, keine Daten werden hochgeladen.</p>
      </div>
    </div>
  {:else if phase === 'done' && results}
    <div class="ki-tool__result-panel">
      <div class="result-layout">
        <div class="ki-tool__meter">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path class="circle circle--{resultStatus}"
              stroke-dasharray="{aiScore}, 100"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="21" class="percentage">{aiScore}%</text>
          </svg>
        </div>

        <div class="ki-tool__result-text">
          <h3 class="result-title">KI-Wahrscheinlichkeit</h3>
          
          <div class="ki-tool__alert ki-tool__alert--{resultStatus}">
            {#if resultStatus === 'ai'}
              Es ist sehr wahrscheinlich, dass dieser Text von einer KI generiert wurde.
            {:else if resultStatus === 'mix'}
              Dieser Text enthält gemischte Muster. Er könnte menschlich sein, aber stark redigiert.
            {:else}
              Dieser Text wirkt natürlich und ist höchstwahrscheinlich von einem Menschen geschrieben.
            {/if}
          </div>

          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-{resultStatus}">
                {#if resultStatus === 'ai'}Synthetisch{:else if resultStatus === 'mix'}Gemischt{:else}Authentisch{/if}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="ki-tool__actions">
        <button class="btn btn--secondary" onclick={reset}>Neuen Text prüfen</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .ki-tool {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    padding: var(--space-8);
    box-shadow: var(--shadow-sm);
  }

  .ki-tool__input-panel,
  .ki-tool__result-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .ki-tool__label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .ki-tool__label {
    font-weight: 500;
    color: var(--color-text);
    font-size: var(--font-size-small);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
  }
  .ki-tool__char-count {
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-muted);
    transition: color var(--dur-fast) var(--ease-out);
  }
  .ki-tool__char-count--over {
    color: var(--color-error);
    font-weight: 600;
  }
  .ki-tool__char-warning {
    font-size: var(--font-size-small);
    color: var(--color-error);
    margin: 0;
  }

  .ki-tool__field {
    width: 100%;
    padding: var(--space-4);
    font-family: var(--font-family-sans);
    font-size: 1rem;
    line-height: 1.6;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    resize: vertical;
    color: var(--color-text);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .ki-tool__field:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }

  /* Loading State */
  .ki-tool__loading {
    padding: var(--space-12) 0;
    display: flex;
    justify-content: center;
  }
  .ki-tool__loading-box {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    align-items: center;
  }
  .ki-tool__loading-note {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    text-align: center;
    line-height: var(--font-lh-small);
  }

  /* Results Panel */
  .result-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-8);
  }
  .ki-tool__meter {
    width: 160px;
  }
  .circular-chart {
    display: block;
  }
  .circle-bg {
    fill: none;
    stroke: var(--color-surface-sunk);
    stroke-width: 3;
  }
  .circle {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 1s var(--ease-out);
  }
  .circle--human { stroke: var(--color-success); }
  .circle--mix { stroke: var(--color-accent); }
  .circle--ai { stroke: var(--color-error); }

  .percentage {
    fill: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: 0.55rem;
    font-weight: 600;
    text-anchor: middle;
    font-variant-numeric: tabular-nums;
  }

  .ki-tool__result-text {
    text-align: center;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .result-title {
    font-size: var(--font-size-h3);
    font-weight: var(--font-fw-h3);
    color: var(--color-text);
  }

  /* Alerts */
  .ki-tool__alert {
    padding: var(--space-4) var(--space-5);
    border-radius: var(--r-md);
    font-weight: 500;
    line-height: 1.5;
    border: 1px solid transparent;
  }
  .ki-tool__alert--human {
    background: color-mix(in oklch, var(--color-success) 8%, var(--color-bg));
    color: var(--color-success);
    border-color: color-mix(in oklch, var(--color-success) 20%, var(--color-bg));
  }
  .ki-tool__alert--mix {
    background: color-mix(in oklch, var(--color-accent) 8%, var(--color-bg));
    color: var(--color-accent);
    border-color: color-mix(in oklch, var(--color-accent) 20%, var(--color-bg));
  }
  .ki-tool__alert--ai {
    background: color-mix(in oklch, var(--color-error) 8%, var(--color-bg));
    color: var(--color-error);
    border-color: color-mix(in oklch, var(--color-error) 20%, var(--color-bg));
  }

  .result-details {
    display: flex;
    justify-content: center;
    gap: var(--space-6);
    margin-top: var(--space-2);
  }
  .detail-row {
    display: flex;
    gap: var(--space-2);
    font-size: var(--font-size-small);
  }
  .detail-label {
    color: var(--color-text-muted);
  }
  .detail-value {
    font-weight: 600;
    font-family: var(--font-family-mono);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
  }
  .status-human { color: var(--color-success); }
  .status-mix { color: var(--color-accent); }
  .status-ai { color: var(--color-error); }

  /* Actions */
  .ki-tool__actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-8);
  }

  .ki-tool__error {
    margin-top: var(--space-4);
    color: var(--color-error);
    background: color-mix(in oklch, var(--color-error) 8%, var(--color-bg));
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-sm);
    border: 1px solid color-mix(in oklch, var(--color-error) 20%, var(--color-bg));
    text-align: center;
    font-size: var(--font-size-small);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3) var(--space-5);
    border-radius: var(--r-md);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--dur-fast) var(--ease-out);
    font-family: var(--font-family-sans);
    font-size: 1rem;
    border: 1px solid transparent;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .btn--primary {
    background: var(--color-text);
    color: var(--color-bg);
  }
  .btn--primary:hover:not(:disabled) {
    background: var(--color-text-muted);
  }
  .btn--primary:active:not(:disabled) {
    transform: scale(0.98);
  }
  .btn--secondary {
    background: transparent;
    border-color: var(--color-border);
    color: var(--color-text);
  }
  .btn--secondary:hover {
    background: var(--color-surface);
  }

  @media (prefers-reduced-motion: reduce) {
    .ki-tool__field,
    .ki-tool__char-count,
    .circle,
    .btn,
    .btn--primary:active:not(:disabled) {
      transition: none;
      transform: none;
    }
  }
</style>
