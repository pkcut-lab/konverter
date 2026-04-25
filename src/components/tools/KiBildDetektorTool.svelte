<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { loadKiBildDetektor } from '../../lib/tools/type-runtime-registry';
  import Loader from '../Loader.svelte';
  import type { ProgressEvent, KiImageResult } from '../../lib/tools/ki-bild-detektor';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();

  let file = $state<File | null>(null);
  let previewUrl = $state<string | null>(null);
  let phase = $state<'idle' | 'preparing' | 'analyzing' | 'done' | 'error'>('idle');
  let errorMessage = $state<string>('');
  let results = $state<KiImageResult[] | null>(null);
  let prepareProgress = $state<ProgressEvent>({ loaded: 0, total: 0, progress: 0, status: '', name: '', file: '' });

  let module: typeof import('../../lib/tools/ki-bild-detektor') | null = null;

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      file = target.files[0];
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(file);
      results = null;
      phase = 'idle';
      errorMessage = '';
    }
  }

  async function analyze() {
    if (!file) return;
    errorMessage = '';
    
    try {
      if (!module) {
        module = await loadKiBildDetektor();
      }

      if (!module.isPrepared()) {
        phase = 'preparing';
        await module.prepareModel((p) => {
          prepareProgress = p;
        });
      }

      phase = 'analyzing';
      
      // Convert file to Uint8Array for Transformers.js
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      results = await module.analyzeImage(bytes);
      phase = 'done';
    } catch (err) {
      console.error(err);
      phase = 'error';
      errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.';
    }
  }

  function reset() {
    file = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    phase = 'idle';
    results = null;
    errorMessage = '';
  }

  const aiScore = $derived.by(() => {
    if (!results || results.length === 0) return 0;
    
    // The SMOGY model output handling
    // LABEL_1 is usually 'fake' / 'ai'
    const aiResult = results.find(r => 
      r.label.toLowerCase().includes('fake') || 
      r.label.toLowerCase().includes('ai') ||
      r.label === 'LABEL_1'
    );
    
    if (aiResult) return Math.round(aiResult.score * 100);
    
    // Fallback: LABEL_0 is usually 'real' / 'human'
    const humanResult = results.find(r => 
      r.label.toLowerCase().includes('real') || 
      r.label.toLowerCase().includes('human') ||
      r.label === 'LABEL_0'
    );
    
    if (humanResult) return 100 - Math.round(humanResult.score * 100);
    
    return 0;
  });

  const resultStatus = $derived.by(() => {
    if (aiScore > 70) return 'ai';
    if (aiScore > 30) return 'mix';
    return 'human';
  });
</script>

<div class="ki-tool">
  {#if phase === 'idle' || phase === 'error'}
    <div class="ki-tool__input-panel">
      <div class="upload-area {file ? 'upload-area--has-file' : ''}">
        {#if previewUrl}
          <div class="preview-container">
            <img src={previewUrl} alt="Vorschau des hochgeladenen Bildes" class="preview-img" />
            <button class="remove-btn" onclick={reset} aria-label="Bild entfernen">
              <span class="remove-icon">×</span>
            </button>
          </div>
        {:else}
          <label class="upload-label" for="file-upload">
            <div class="upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <span class="upload-text">Bild wählen oder hierher ziehen</span>
            <span class="upload-hint">JPG, PNG, WEBP, GIF · Ohne Upload</span>
          </label>
        {/if}
        <input
          id="file-upload"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
          onchange={handleFileChange}
          class="hidden-input"
        />
      </div>
      
      {#if errorMessage}
        <div class="ki-tool__error">{errorMessage}</div>
      {/if}

      <div class="ki-tool__actions">
        <button class="btn btn--primary" onclick={analyze} disabled={!file}>
          Bild auf KI prüfen
        </button>
      </div>
    </div>
  {:else if phase === 'preparing' || phase === 'analyzing'}
    <div class="ki-tool__loading">
      <div class="ki-tool__loading-box">
        <Loader 
          variant="progress" 
          value={phase === 'preparing' ? (prepareProgress.total ? prepareProgress.loaded / prepareProgress.total : 0) : 1}
          label={phase === 'preparing' ? 'KI-Modell wird geladen...' : 'Bild wird analysiert...'}
        />
        <p class="ki-tool__loading-note">Beim ersten Mal lädt das Modell (~90 MB) einmalig — danach ist es offline verfügbar. Lokale Analyse, keine Daten verlassen deinen Browser.</p>
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
              Dieses Bild zeigt starke Anzeichen einer KI-Generierung.
            {:else if resultStatus === 'mix'}
              Das Ergebnis ist uneindeutig. Es könnten KI-Elemente vorhanden sein.
            {:else}
              Dieses Bild wirkt authentisch und wurde wahrscheinlich von einem Menschen erstellt.
            {/if}
          </div>
          
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-{resultStatus}">
                {#if resultStatus === 'ai'}KI-generiert{:else if resultStatus === 'mix'}Fragwürdig{:else}Authentisch{/if}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="ki-tool__actions">
        <button class="btn btn--secondary" onclick={reset}>Anderes Bild prüfen</button>
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

  /* Upload Area */
  .upload-area {
    border: 2px dashed var(--color-border);
    border-radius: var(--r-md);
    padding: var(--space-12);
    text-align: center;
    transition: all var(--dur-fast) var(--ease-out);
    background: var(--color-bg);
    cursor: pointer;
    position: relative;
  }
  .upload-area:hover {
    border-color: var(--color-accent);
    background: color-mix(in oklch, var(--color-accent) 4%, var(--color-bg));
  }
  .upload-area--has-file {
    border-style: solid;
    padding: var(--space-4);
  }
  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    cursor: pointer;
  }
  .upload-icon {
    color: var(--color-text-subtle);
  }
  .upload-text {
    font-weight: 500;
    font-size: 1rem;
    color: var(--color-text);
  }
  .upload-hint {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .hidden-input {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }

  /* Preview */
  .preview-container {
    position: relative;
    display: inline-block;
    max-width: 100%;
  }
  .preview-img {
    max-width: 100%;
    max-height: 480px;
    border-radius: var(--r-sm);
    display: block;
    border: 1px solid var(--color-border);
  }
  .remove-btn {
    position: absolute;
    top: calc(var(--space-2) * -1);
    right: calc(var(--space-2) * -1);
    background: var(--color-error);
    color: var(--color-bg);
    border: none;
    border-radius: var(--r-sm);
    width: 1.75rem;
    height: 1.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .remove-btn:hover {
    transform: scale(1.1);
  }
  .remove-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .remove-icon {
    font-size: 1.25rem;
    line-height: 1;
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
    .upload-area,
    .circle,
    .btn,
    .btn--primary:active:not(:disabled),
    .remove-btn,
    .remove-btn:hover {
      transition: none;
      transform: none;
    }
  }
</style>
