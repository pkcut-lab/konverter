<script lang="ts">
  import type { FileToolConfig } from '../../lib/tools/schemas';
  import { getRuntime } from '../../lib/tools/tool-runtime-registry';
  import Loader from '../Loader.svelte';
  import { dispatchToolUsed } from '../../lib/tracking';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FileToolConfig;
    lang: Lang;
  }

  type Phase =
    | 'idle'
    | 'preparing'
    | 'model-loading'
    | 'converting'
    | 'done'
    | 'error';

  type ModelKey = 'quality' | 'speed';
  type OutputMode = 'transparent' | 'solid';

  let { config, lang }: Props = $props();
  const strings = $derived(t(lang));

  let phase = $state<Phase>('idle');
  let modelKey = $state<ModelKey>('quality');
  let outputMode = $state<OutputMode>('transparent');
  let bgColor = $state<string>('#ffffff');

  let sourceName = $state<string>('');
  let sourceSize = $state<number>(0);
  let outputUrl = $state<string>('');
  let outputSize = $state<number>(0);
  let outputMime = $state<string>('video/webm');
  let errorMessage = $state<string>('');

  let modelLoaded = $state<number>(0);
  let modelTotal = $state<number>(0);
  let frameIdx = $state<number>(0);
  let totalFrames = $state<number>(0);
  let convertStartMs = $state<number | null>(null);

  let isDragging = $state<boolean>(false);
  let fileInputEl: HTMLInputElement | undefined = $state();

  const runtime = $derived(getRuntime(config.id));
  const preflightError = $derived(runtime?.preflightCheck?.() ?? null);

  $effect(() => {
    if (preflightError && phase === 'idle') {
      phase = 'error';
      errorMessage = preflightError;
    }
  });

  const acceptAttr = $derived(config.accept.join(','));
  const downloadName = $derived(buildDownloadName(sourceName, outputMime, config.filenameSuffix));

  const modelPctLabel = $derived(
    modelTotal > 0 ? Math.round((modelLoaded / modelTotal) * 100) + ' %' : '0 %',
  );
  const framePctLabel = $derived(
    totalFrames > 0 ? Math.round((frameIdx / totalFrames) * 100) + ' %' : '0 %',
  );
  const frameEtaLabel = $derived.by(() => {
    if (totalFrames <= 0 || frameIdx <= 0 || convertStartMs === null) return '';
    const elapsedMs = performance.now() - convertStartMs;
    const perFrameMs = elapsedMs / frameIdx;
    const remainingMs = perFrameMs * (totalFrames - frameIdx);
    return formatEta(remainingMs / 1000);
  });

  function buildDownloadName(name: string, mime: string, suffix?: string): string {
    if (!name) return '';
    const ext = mime === 'video/webm' ? '.webm' : '.mp4';
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    return `${stem}${suffix ?? ''}${ext}`;
  }

  function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }

  function formatEta(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '';
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  function reset() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    runtime?.clearLastResult?.();
    phase = preflightError ? 'error' : 'idle';
    errorMessage = preflightError ?? '';
    sourceName = '';
    sourceSize = 0;
    outputUrl = '';
    outputSize = 0;
    modelLoaded = 0;
    modelTotal = 0;
    frameIdx = 0;
    totalFrames = 0;
    convertStartMs = null;
  }

  async function processFile(file: File) {
    if (preflightError) return;
    const typeOk = config.accept.includes(file.type);
    const ext = file.name.toLowerCase().split('.').pop() ?? '';
    const extOk = ext === 'mp4' || ext === 'mov' || ext === 'webm';
    if (!typeOk && !extOk) {
      errorMessage = 'Dateityp nicht unterstuetzt. Erlaubt: MP4, MOV, WebM.';
      phase = 'error';
      return;
    }
    if (file.size > config.maxSizeMb * 1024 * 1024) {
      errorMessage = `Datei zu gross. Maximal ${config.maxSizeMb} MB erlaubt.`;
      phase = 'error';
      return;
    }

    sourceName = file.name;
    sourceSize = file.size;
    errorMessage = '';
    const bytes = new Uint8Array(await file.arrayBuffer());

    const procModule = await import('../../lib/tools/process-video-bg-remove');

    if (!procModule.isVideoBgRemovePrepared()) {
      phase = 'model-loading';
      modelLoaded = 0;
      modelTotal = 0;
      try {
        await procModule.prepareVideoBgRemoveModel(
          (e) => {
            modelLoaded = e.loaded;
            modelTotal = e.total;
          },
          modelKey,
        );
      } catch (err) {
        errorMessage =
          err instanceof Error
            ? `Modell-Lade-Fehler: ${err.message}`
            : 'Modell-Lade-Fehler.';
        phase = 'error';
        return;
      }
    }

    phase = 'converting';
    frameIdx = 0;
    totalFrames = 0;
    convertStartMs = performance.now();
    try {
      const result = await procModule.processVideoBgRemove(
        bytes,
        { modelKey, outputMode, bgColor },
        (e) => {
          if (e.phase === 'model') {
            modelLoaded = e.loaded;
            modelTotal = e.total;
          } else {
            frameIdx = e.frameIdx;
            totalFrames = e.totalFrames;
          }
        },
      );
      outputMime = result.mime;
      const blob = new Blob([result.output as BlobPart], { type: outputMime });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = URL.createObjectURL(blob);
      outputSize = result.output.byteLength;
      phase = 'done';
      convertStartMs = null;
    } catch (err) {
      convertStartMs = null;
      if (err instanceof Error && err.name === 'AbortError') {
        reset();
        return;
      }
      errorMessage =
        err instanceof Error
          ? `Verarbeitung fehlgeschlagen: ${err.message}`
          : 'Verarbeitung fehlgeschlagen.';
      phase = 'error';
    }
  }

  async function onAbort() {
    const procModule = await import('../../lib/tools/process-video-bg-remove');
    procModule.abortVideoBgRemove();
  }

  async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) void processFile(file);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function onDragLeave() {
    isDragging = false;
  }

  let _tracked = false;
  $effect(() => {
    if (!_tracked && phase === 'done') {
      _tracked = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: 'de' });
    }
  });
</script>

<section class="vbg" data-testid="vbg-tool">
  {#if phase === 'idle'}
    <div class="vbg__settings" aria-label="Einstellungen">
      <fieldset class="vbg__field">
        <legend>Modus</legend>
        <div class="vbg__radios" role="radiogroup">
          <label class="vbg__radio">
            <input
              type="radio"
              name="output-mode"
              value="transparent"
              bind:group={outputMode}
              data-testid="vbg-mode-transparent"
            />
            <span>Transparent <span class="vbg__hint">— WebM, VP9 + Alpha</span></span>
          </label>
          <label class="vbg__radio">
            <input
              type="radio"
              name="output-mode"
              value="solid"
              bind:group={outputMode}
              data-testid="vbg-mode-solid"
            />
            <span>Einfarbig <span class="vbg__hint">— MP4, H.264</span></span>
          </label>
        </div>
        {#if outputMode === 'solid'}
          <label class="vbg__color">
            <span>Farbe</span>
            <input type="color" bind:value={bgColor} data-testid="vbg-bg-color" />
            <code class="vbg__color-code">{bgColor}</code>
          </label>
        {/if}
      </fieldset>

      <fieldset class="vbg__field">
        <legend>Modell</legend>
        <div class="vbg__radios" role="radiogroup">
          <label class="vbg__radio">
            <input
              type="radio"
              name="model"
              value="quality"
              bind:group={modelKey}
              data-testid="vbg-model-quality"
            />
            <span>Qualität <span class="vbg__hint">— beste Haarkanten</span></span>
          </label>
          <label class="vbg__radio">
            <input
              type="radio"
              name="model"
              value="speed"
              bind:group={modelKey}
              data-testid="vbg-model-speed"
            />
            <span>Schnell <span class="vbg__hint">— nahezu Echtzeit</span></span>
          </label>
        </div>
      </fieldset>
    </div>

    <div
      class="vbg__dropzone"
      class:vbg__dropzone--dragging={isDragging}
      ondrop={onDrop}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      role="button"
      tabindex="0"
      onclick={() => fileInputEl?.click()}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputEl?.click();
        }
      }}
      data-testid="vbg-dropzone"
    >
      <p class="vbg__dropzone-title">Video hier ablegen oder Datei wählen</p>
      <p class="vbg__dropzone-meta">
        MP4, MOV, WebM &middot; bis {config.maxSizeMb}&nbsp;MB &middot; bis FullHD&nbsp;1920×1080
      </p>
      <input
        bind:this={fileInputEl}
        type="file"
        accept={acceptAttr}
        onchange={onFileChange}
        class="vbg__file-input"
        data-testid="vbg-input"
      />
    </div>
  {:else if phase === 'model-loading'}
    <div class="vbg__status" data-testid="vbg-model-loading" aria-live="polite">
      <p class="vbg__status-label">Lädt einmalig Modell …</p>
      <Loader
        variant="progress"
        value={modelTotal > 0 ? modelLoaded / modelTotal : 0}
        label={modelPctLabel}
        ariaLabel="Modell-Download"
      />
      <p class="vbg__hint">
        Erste Verwendung: ~{modelKey === 'quality' ? '50' : '25'}&nbsp;MB. Danach gecacht.
      </p>
    </div>
  {:else if phase === 'converting'}
    <div class="vbg__status" data-testid="vbg-converting" aria-live="polite">
      <div class="vbg__convert-row">
        <p class="vbg__status-label">
          Verarbeitet Frame
          <span class="vbg__num">{frameIdx}</span>
          <span class="vbg__num-sep">/</span>
          <span class="vbg__num">{totalFrames || '…'}</span>
        </p>
        <Loader variant="spinner" ariaLabel="Konvertiert" />
      </div>
      <Loader
        variant="progress"
        value={totalFrames > 0 ? frameIdx / totalFrames : 0}
        label={framePctLabel}
        ariaLabel="Konvertierungs-Fortschritt"
      />
      {#if frameEtaLabel}
        <p class="vbg__hint">Noch ca. {frameEtaLabel}</p>
      {/if}
      <button
        type="button"
        class="btn btn--secondary"
        onclick={onAbort}
        data-testid="vbg-abort"
      >
        Abbrechen
      </button>
    </div>
  {:else if phase === 'done'}
    <div class="vbg__done" data-testid="vbg-done">
      <p class="vbg__status-label">Fertig.</p>
      <dl class="vbg__sizes">
        <div>
          <dt>Quelle</dt>
          <dd>{formatBytes(sourceSize)}</dd>
        </div>
        <div>
          <dt>Ergebnis</dt>
          <dd>{formatBytes(outputSize)}</dd>
        </div>
      </dl>
      <div class="vbg__actions">
        <a
          class="btn btn--primary"
          href={outputUrl}
          download={downloadName}
          data-testid="vbg-download"
        >
          Herunterladen
        </a>
        <button
          type="button"
          class="btn btn--secondary"
          onclick={reset}
          data-testid="vbg-reset"
        >
          Neue Datei
        </button>
      </div>
      <p class="vbg__disclaimer">
        Dieses Video wurde mit KI bearbeitet (Hintergrund {outputMode === 'transparent' ? 'entfernt' : 'ersetzt'}).
      </p>
    </div>
  {:else if phase === 'error'}
    <div class="vbg__error" data-testid="vbg-error" role="alert">
      <p class="vbg__error-text">{errorMessage}</p>
      {#if !preflightError}
        <button
          type="button"
          class="btn btn--secondary"
          onclick={reset}
          data-testid="vbg-error-reset"
        >
          {strings.toolsCommon.reset}
        </button>
      {/if}
    </div>
  {/if}
</section>

<style>
  .vbg {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .vbg__settings {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .vbg__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border: none;
    padding: 0;
    margin: 0;
  }
  .vbg__field legend {
    font-family: var(--font-family-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    padding: 0;
  }
  .vbg__radios {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .vbg__radio {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    cursor: pointer;
  }
  .vbg__radio input[type='radio'] {
    margin: 0;
    accent-color: var(--color-text);
  }
  .vbg__radio:has(input:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: var(--r-sm);
  }
  .vbg__hint {
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }
  .vbg__color {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }
  .vbg__color input[type='color'] {
    width: 2.5rem;
    height: 2rem;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: transparent;
    cursor: pointer;
  }
  .vbg__color-code {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .vbg__dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 11rem;
    padding: var(--space-8);
    border: 2px dashed var(--color-border);
    border-radius: var(--r-md);
    background: transparent;
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .vbg__dropzone--dragging {
    border-color: var(--color-accent);
  }
  .vbg__dropzone:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .vbg__dropzone-title {
    margin: 0;
    color: var(--color-text);
    font-size: var(--font-size-body);
    text-align: center;
  }
  .vbg__dropzone-meta {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    text-align: center;
  }
  .vbg__file-input {
    display: none;
  }

  .vbg__status {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .vbg__status-label {
    margin: 0;
    color: var(--color-text);
  }
  .vbg__convert-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .vbg__num {
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
  }
  .vbg__num-sep {
    color: var(--color-text-subtle);
    margin: 0 var(--space-1);
  }

  .vbg__done {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .vbg__sizes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin: 0;
  }
  .vbg__sizes div {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .vbg__sizes dt {
    font-family: var(--font-family-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .vbg__sizes dd {
    margin: 0;
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
  }
  .vbg__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  .vbg__disclaimer {
    margin: 0;
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }

  .vbg__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .vbg__error-text {
    margin: 0;
    color: var(--color-error);
  }

  @media (prefers-reduced-motion: reduce) {
    .vbg__dropzone {
      transition: none;
      transform: none;
    }
  }
</style>
