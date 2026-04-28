<script lang="ts">
  import { loadAudioTranskription } from '../../lib/tools/type-runtime-registry';
  import Loader from '../Loader.svelte';
  import type { ProgressEvent, TranscriptionResult, ModelSize } from '../../lib/tools/audio-transkription';
  import { onDestroy } from 'svelte';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';
  import MlBanner from '../MlBanner.svelte';
  import { ML_VARIANTS, type VariantId } from '../../lib/tools/ml-variants';

  interface Props {
    lang: Lang;
  }
  let { lang }: Props = $props();
  const strings = $derived(t(lang));
  const T = $derived(strings.tools.audioTranscription);

  let file = $state<File | null>(null);
  let audioUrl = $state<string | null>(null);
  let phase = $state<'idle' | 'preparing' | 'analyzing' | 'done' | 'error'>('idle');
  let errorMessage = $state<string>('');
  let result = $state<TranscriptionResult | null>(null);
  let prepareProgress = $state<ProgressEvent>({ loaded: 0, total: 0, status: '', name: '', file: '', progress: 0 });

  let selectedModel = $state<ModelSize>('base');
  let selectedFormat = $state<'txt' | 'srt'>('txt');
  let selectedLanguage = $state<string>('german');
  let stalled = $state<boolean>(false);

  let module: typeof import('../../lib/tools/audio-transkription') | null = null;
  let activeAudioCtx: AudioContext | null = null;

  // Map ModelSize ↔ VariantId so the banner-switcher reuses the existing
  // model-picker state. tiny=fast (52 MB), base=quality (83 MB), small=pro (200 MB).
  const variants = ML_VARIANTS['audio-transkription'] ?? [];
  const variantIdForModel: Record<ModelSize, VariantId> = {
    tiny: 'fast',
    base: 'quality',
    small: 'pro',
  };
  const modelForVariantId: Record<VariantId, ModelSize> = {
    fast: 'tiny',
    quality: 'base',
    pro: 'small',
  };
  const selectedVariantId = $derived<VariantId>(variantIdForModel[selectedModel]);

  function onSwitchVariant(id: VariantId) {
    if (selectedVariantId === id) return;
    selectedModel = modelForVariantId[id];
    // Module-level pipeline keys on modelSize — switching invalidates by
    // construction (the module sees a different `currentModelSize`).
    // No need to manually reset.
    stalled = false;
  }

  function onRetry() {
    stalled = false;
    errorMessage = '';
    if (file) void startTranscription();
  }

  function onFallbackToFast() {
    stalled = false;
    errorMessage = '';
    selectedModel = 'tiny';
    if (file) void startTranscription();
  }

  const fileSizeWarningMb = $derived.by(() => {
    if (!file) return 0;
    return file.size / 1024 / 1024;
  });

  // Cleanup blob URLs on component destroy to prevent memory leaks.
  onDestroy(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
      activeAudioCtx.close();
    }
  });

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      file = target.files[0];
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioUrl = URL.createObjectURL(file);
      result = null;
      errorMessage = '';
    }
  }

  async function startTranscription() {
    if (!file) return;
    errorMessage = '';
    
    // Close any previous AudioContext before creating a new one.
    if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
      activeAudioCtx.close();
      activeAudioCtx = null;
    }

    try {
      if (!module) {
        module = await loadAudioTranskription();
      }

      if (!module.isPrepared()) {
        phase = 'preparing';
        await module.prepareModel(selectedModel, (p) => {
          prepareProgress = p;
        });
      }

      phase = 'analyzing';

      // Load audio data using Web Audio API to ensure correct format for Whisper (16kHz mono)
      const audioBuffer = await file.arrayBuffer();
      activeAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const decodedData = await activeAudioCtx.decodeAudioData(audioBuffer);

      // Downmix all channels to mono by averaging
      let audioData: Float32Array;
      const numChannels = decodedData.numberOfChannels;
      if (numChannels > 1) {
        const length = decodedData.length;
        audioData = new Float32Array(length);
        for (let ch = 0; ch < numChannels; ch++) {
          const channelData = decodedData.getChannelData(ch);
          for (let i = 0; i < length; i++) {
            audioData[i] = (audioData[i] ?? 0) + channelData[i]!;
          }
        }
        for (let i = 0; i < length; i++) {
          audioData[i] = (audioData[i] ?? 0) / numChannels;
        }
      } else {
        audioData = decodedData.getChannelData(0);
      }

      const langOptions = selectedLanguage ? { language: selectedLanguage } : {};
      result = await module.transcribe(audioData, langOptions);
      phase = 'done';
    } catch (err) {
      console.error(err);
      phase = 'error';
      // Detect stall by error name (set by the underlying watchdog) or by
      // the network 'Failed to fetch' message that mobile carriers produce.
      if (err instanceof Error) {
        const nameStall = err.name === 'StallError';
        const msgFetch = /failed to fetch/i.test(err.message);
        if (nameStall || msgFetch) stalled = true;
      }
      errorMessage = err instanceof Error ? err.message : T.errorGeneric;
    } finally {
      // Always close AudioContext after use, regardless of success or failure.
      if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
        activeAudioCtx.close();
        activeAudioCtx = null;
      }
    }
  }

  function reset() {
    file = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = null;
    result = null;
    phase = 'idle';
    errorMessage = '';
  }

  function copyToClipboard() {
    if (result) {
      navigator.clipboard.writeText(selectedFormat === 'srt' && result.chunks ? generateSRT(result.chunks) : result.text);
    }
  }

  function formatTime(seconds: number): string {
    const date = new Date(seconds * 1000);
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
  }

  function generateSRT(chunks: Array<{text: string, timestamp: [number, number]}>): string {
    return chunks.map((chunk, index) => {
      const start = formatTime(chunk.timestamp[0]);
      const end = formatTime(chunk.timestamp[1] || chunk.timestamp[0] + 5);
      return `${index + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n`;
    }).join('\n');
  }

  function downloadResult() {
    if (!result) return;
    
    let content = result.text;
    let filename = `transkription.txt`;
    let type = 'text/plain';

    if (selectedFormat === 'srt' && result.chunks) {
      content = generateSRT(result.chunks);
      filename = `transkription.srt`;
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="audio-tool">
  {#if phase === 'idle' || phase === 'error'}
    {#if variants.length > 0}
      <MlBanner
        {lang}
        {variants}
        selectedVariantId={selectedVariantId}
        onSwitch={onSwitchVariant}
        showStall={stalled}
        onRetry={onRetry}
        onFallbackToFast={onFallbackToFast}
      />
    {/if}
    <div class="audio-tool__input">
      <div class="upload-area {file ? 'upload-area--has-file' : ''}">
        {#if file}
          <div class="file-display">
            <div class="file-info">
              <div class="file-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div class="file-meta">
                <span class="file-name">{file.name}</span>
                <span class="file-size">{(file.size / 1024 / 1024).toFixed(2)}&nbsp;MB</span>
              </div>
              <button class="remove-btn" onclick={reset} aria-label={T.removeFileAria}>
                <span class="remove-icon">×</span>
              </button>
            </div>
            {#if audioUrl}
              <audio src={audioUrl} controls class="audio-preview"></audio>
            {/if}
          </div>
        {:else}
          <label class="upload-label" for="audio-upload">
            <div class="upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <span class="upload-text">{T.uploadText}</span>
            <span class="upload-hint">{T.uploadHint}</span>
          </label>
        {/if}
        <input 
          id="audio-upload" 
          type="file" 
          accept="audio/*" 
          onchange={handleFileChange} 
          class="hidden-input"
        />
      </div>

      {#if errorMessage}
        <div class="audio-tool__error">{errorMessage}</div>
      {/if}

      {#if fileSizeWarningMb > 100}
        <div class="audio-tool__size-warning">
          {T.sizeWarningTemplate.replace('{mb}', fileSizeWarningMb.toFixed(0))}
        </div>
      {:else if fileSizeWarningMb > 50}
        <div class="audio-tool__size-hint">
          {T.sizeHintTemplate.replace('{mb}', fileSizeWarningMb.toFixed(0))}
        </div>
      {/if}

      <div class="audio-tool__config">
        <div class="config-group">
          <label for="model-select">{T.modelLabel}</label>
          <select id="model-select" bind:value={selectedModel} class="select-input">
            <option value="tiny">{T.modelTiny}</option>
            <option value="base">{T.modelBase}</option>
            <option value="small">{T.modelSmall}</option>
          </select>
        </div>
        <div class="config-group">
          <label for="lang-select">{T.languageLabel}</label>
          <select id="lang-select" bind:value={selectedLanguage} class="select-input">
            <option value="german">{T.languageGerman}</option>
            <option value="english">{T.languageEnglish}</option>
            <option value="french">{T.languageFrench}</option>
            <option value="spanish">{T.languageSpanish}</option>
            <option value="">{T.languageAuto}</option>
          </select>
        </div>
      </div>

      <div class="audio-tool__actions">
        <button class="btn btn--primary" onclick={startTranscription} disabled={!file}>
          {T.startButton}
        </button>
      </div>
    </div>
  {:else if phase === 'preparing' || phase === 'analyzing'}
    <div class="audio-tool__loading">
      <div class="audio-tool__loading-box">
        {#if phase === 'preparing'}
          <Loader
            variant="progress"
            value={prepareProgress.total ? prepareProgress.loaded / prepareProgress.total : 0}
            label={T.loaderModelLoading}
          />
          <p class="audio-tool__loading-note">
            {T.loaderModelLoadingNoteTemplate
              .replace('{speed}', selectedModel === 'tiny' ? T.speedSchnell : selectedModel === 'small' ? T.speedGroß : T.speedAusgewogen)
              .replace('{size}', selectedModel === 'tiny' ? T.sizeTiny : selectedModel === 'small' ? T.sizeSmall : T.sizeBase)}
          </p>
        {:else}
          <div class="analyzing-indicator">
            <Loader variant="spinner" />
            <span class="analyzing-text">{T.analyzingText}</span>
          </div>
          <p class="audio-tool__loading-note">
            {T.analyzingNote}
          </p>
        {/if}
      </div>
    </div>
  {:else if phase === 'done' && result}
    <div class="audio-tool__result">
      <div class="result-card">
        <div class="result-header">
          <div class="result-header-left">
            <h3 class="result-title">{T.resultTitle}</h3>
            <select bind:value={selectedFormat} class="format-select">
              <option value="txt">{T.formatTxt}</option>
              <option value="srt">{T.formatSrt}</option>
            </select>
          </div>
          <div class="result-actions">
            <button class="copy-btn" onclick={copyToClipboard} title={T.copyTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              {strings.toolsCommon.copy}
            </button>
            <button class="copy-btn copy-btn--primary" onclick={downloadResult} title={T.downloadTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {T.downloadButton}
            </button>
          </div>
        </div>

        <div class="transcription-container">
          <p class="transcription-text">
            {#if selectedFormat === 'srt' && result.chunks}
              {generateSRT(result.chunks)}
            {:else}
              {result.text}
            {/if}
          </p>
        </div>
      </div>

      <div class="audio-tool__actions">
        <button class="btn btn--secondary" onclick={reset}>{T.otherFileButton}</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .audio-tool {
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
    padding: var(--space-6);
    background: var(--color-surface);
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

  /* File Display */
  .file-display {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }
  .file-info {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface-sunk);
    border-radius: var(--r-md);
    position: relative;
  }
  .file-icon {
    color: var(--color-accent);
    background: color-mix(in oklch, var(--color-accent) 10%, var(--color-bg));
    padding: var(--space-2);
    border-radius: var(--r-sm);
  }
  .file-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: hidden;
  }
  .file-name {
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .file-size {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
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

  .audio-preview {
    width: 100%;
    height: 40px;
  }

  /* Loading State */
  .audio-tool__loading {
    padding: var(--space-12) 0;
    display: flex;
    justify-content: center;
  }
  .audio-tool__loading-box {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    align-items: center;
  }
  .audio-tool__loading-note {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    text-align: center;
    line-height: var(--font-lh-small);
  }

  /* Result Area */
  .result-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    overflow: hidden;
  }
  .result-header {
    padding: var(--space-4) var(--space-6);
    background: var(--color-surface-sunk);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
  .result-header-left {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }
  .result-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .result-title {
    font-size: var(--font-size-small);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-text-muted);
    margin: 0;
  }
  .format-select {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--r-sm);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-small);
    outline: none;
  }
  .copy-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--r-sm);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--dur-fast) var(--ease-out);
  }
  .copy-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  .copy-btn--primary {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }
  .copy-btn--primary:hover {
    background: var(--color-text-muted);
    color: var(--color-bg);
    border-color: var(--color-text-muted);
  }
  .copy-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .audio-tool__size-warning {
    margin-top: var(--space-4);
    color: var(--color-error);
    background: color-mix(in oklch, var(--color-error) 8%, var(--color-bg));
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-sm);
    border: 1px solid color-mix(in oklch, var(--color-error) 20%, var(--color-bg));
    font-size: var(--font-size-small);
    line-height: 1.5;
  }
  .audio-tool__size-hint {
    margin-top: var(--space-4);
    color: var(--color-text-muted);
    background: var(--color-surface-sunk);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-sm);
    border: 1px solid var(--color-border);
    font-size: var(--font-size-small);
  }

  .audio-tool__config {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }
  .config-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--color-surface-sunk);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-md);
    border: 1px solid var(--color-border);
  }
  .config-group label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
  .select-input {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--r-sm);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 0.9rem;
    font-weight: 500;
    outline: none;
    cursor: pointer;
  }
  .select-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }

  .transcription-container {
    padding: var(--space-6);
    max-height: 400px;
    overflow-y: auto;
    background: var(--color-surface);
  }
  .transcription-text {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--color-text);
    margin: 0;
    white-space: pre-wrap;
  }

  /* Actions */
  .audio-tool__actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-8);
  }

  .audio-tool__error {
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
  .analyzing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface-sunk);
    border-radius: var(--r-md);
    border: 1px solid var(--color-border);
    width: 100%;
  }
  .analyzing-text {
    font-weight: 500;
    font-size: 1rem;
    color: var(--color-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .upload-area,
    .btn,
    .btn--primary:active:not(:disabled) {
      transition: none;
      transform: none;
    }
  }
</style>
