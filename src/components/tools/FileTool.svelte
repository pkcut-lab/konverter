<script lang="ts">
  import type { FileToolConfig } from '../../lib/tools/schemas';
  import { getRuntime } from '../../lib/tools/tool-runtime-registry';
  import { decodeHeicIfNeeded } from '../../lib/tools/heic-decode';
  import Loader from '../Loader.svelte';

  interface Props {
    config: FileToolConfig;
  }
  type Phase = 'idle' | 'preparing' | 'converting' | 'done' | 'error';

  let { config }: Props = $props();

  let phase = $state<Phase>('idle');
  let quality = $state<number>(85);
  let sourceName = $state<string>('');
  let sourceSize = $state<number>(0);
  let outputSize = $state<number>(0);
  let outputUrl = $state<string>('');
  let errorMessage = $state<string>('');
  let outputFormat = $state<string>(config.defaultFormat ?? 'webp');
  let prepareProgress = $state<{ loaded: number; total: number }>({ loaded: 0, total: 0 });

  const acceptAttr = $derived(config.accept.join(','));
  const runtime = $derived(getRuntime(config.id));
  const processor = $derived(runtime?.process);
  const reencoder = $derived(runtime?.reencode);
  const downloadName = $derived(
    buildDownloadName(sourceName, outputFormat, config.filenameSuffix),
  );
  const sizeReduction = $derived(
    sourceSize > 0 ? Math.round((1 - outputSize / sourceSize) * 100) : 0,
  );

  function formatToMime(f: string): string {
    switch (f) {
      case 'png': return 'image/png';
      case 'jpg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      default: return 'image/webp';
    }
  }
  function formatToExt(f: string): string {
    switch (f) {
      case 'png': return 'png';
      case 'jpg': return 'jpg';
      case 'webp': return 'webp';
      default: return 'webp';
    }
  }
  function buildDownloadName(name: string, format: string, suffix?: string): string {
    if (!name) return '';
    const ext = '.' + formatToExt(format);
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    return `${stem}${suffix ?? ''}${ext}`;
  }

  // U+00A0 NO-BREAK SPACE between number and unit per typography rules.
  function formatBytes(n: number): string {
    if (n < 1024) return `${n}\u00A0B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}\u00A0KB`;
    return `${(n / (1024 * 1024)).toFixed(2)}\u00A0MB`;
  }

  function reset() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    runtime?.clearLastResult?.();
    phase = 'idle';
    sourceName = '';
    sourceSize = 0;
    outputSize = 0;
    outputUrl = '';
    errorMessage = '';
    prepareProgress = { loaded: 0, total: 0 };
  }

  async function processFile(file: File) {
    if (!config.accept.includes(file.type)) {
      errorMessage = `Dateityp nicht unterstützt. Erlaubt: ${config.accept.join(', ')}.`;
      phase = 'error';
      return;
    }
    if (file.size > config.maxSizeMb * 1024 * 1024) {
      errorMessage = `Datei zu groß. Maximal ${config.maxSizeMb}\u00A0MB erlaubt.`;
      phase = 'error';
      return;
    }

    sourceName = file.name;
    sourceSize = file.size;
    errorMessage = '';
    outputFormat = config.defaultFormat ?? 'webp';

    if (!processor) {
      errorMessage = `Kein Prozessor registriert für „${config.id}”.`;
      phase = 'error';
      return;
    }

    // HEIC pre-decode (static import — lazy-loading of heic2any happens inside decodeHeicIfNeeded)
    let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await file.arrayBuffer() as ArrayBuffer);
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const dec = await decodeHeicIfNeeded(bytes, file.type);
        bytes = dec.bytes;
      } catch (err) {
        errorMessage = err instanceof Error ? `HEIC-Decode-Fehler: ${err.message}` : 'HEIC-Decode-Fehler.';
        phase = 'error';
        return;
      }
    }

    const alreadyReady = runtime?.isPrepared?.() ?? false;
    if (runtime?.prepare && !alreadyReady) {
      phase = 'preparing';
      try {
        await runtime.prepare((e) => { prepareProgress = e; });
      } catch (err) {
        errorMessage = err instanceof Error ? `Modell-Lade-Fehler: ${err.message}` : 'Modell-Lade-Fehler.';
        phase = 'error';
        return;
      }
    }

    phase = 'converting';
    try {
      const outBytes = await processor(bytes, { quality });
      const blob = new Blob([outBytes as BlobPart], { type: formatToMime(outputFormat) });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = URL.createObjectURL(blob);
      outputSize = outBytes.byteLength;
      phase = 'done';
    } catch (err) {
      errorMessage =
        err instanceof Error
          ? `Konvertierung fehlgeschlagen: ${err.message}`
          : 'Konvertierung fehlgeschlagen.';
      phase = 'error';
    }
  }

  async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  $effect(() => {
    function onPaste(e: ClipboardEvent) {
      if (phase !== 'idle' && phase !== 'error') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind !== 'file') continue;
        if (!item.type.startsWith('image/')) continue;
        const file = item.getAsFile();
        if (file) {
          let finalFile: File;
          if (file.name) {
            finalFile = file;
          } else {
            const synthesized = new File(
              [file],
              `pasted-image-${Date.now()}.${item.type.split('/')[1] ?? 'png'}`,
              { type: item.type },
            );
            // Preserve patched arrayBuffer (needed in test envs that lack native File.arrayBuffer)
            if (typeof (file as File & { arrayBuffer?: unknown }).arrayBuffer === 'function' &&
                typeof synthesized.arrayBuffer !== 'function') {
              Object.defineProperty(synthesized, 'arrayBuffer', {
                value: (file as File).arrayBuffer.bind(file),
                configurable: true,
              });
            }
            finalFile = synthesized;
          }
          void processFile(finalFile);
          return;
        }
      }
    }
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  });

  async function onFormatChange(newFormat: string) {
    if (!reencoder) return;
    outputFormat = newFormat;
    try {
      const newBytes = await reencoder(newFormat);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const blob = new Blob([newBytes as BlobPart], { type: formatToMime(newFormat) });
      outputUrl = URL.createObjectURL(blob);
      outputSize = newBytes.byteLength;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Format-Wechsel fehlgeschlagen.';
      phase = 'error';
    }
  }
</script>

<div class="filetool">
  {#if phase === 'idle' || phase === 'error'}
    <label
      class="dropzone"
      class:dropzone--error={phase === 'error'}
      data-testid="filetool-dropzone"
    >
      <span class="dropzone__title">Datei wählen</span>
      <span class="dropzone__hint" data-testid="filetool-meta">
        {config.accept.join(', ')} · max. {config.maxSizeMb}&nbsp;MB · oder Strg+V
      </span>
      <input
        class="dropzone__input"
        type="file"
        accept={acceptAttr}
        data-testid="filetool-input"
        onchange={onFileChange}
      />
  </label>
  {#if (config.cameraCapture ?? true) && config.accept.some((m) => m.startsWith('image/'))}
    <label class="camera">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        data-testid="filetool-camera-input"
        hidden
        onchange={onFileChange}
      />
      <span>Foto aufnehmen</span>
    </label>
  {/if}
{/if}

  {#if phase === 'preparing'}
    <div class="preparing" data-testid="filetool-preparing" aria-live="polite">
      <p class="preparing__title">Lädt einmalig Modell …</p>
      <Loader
        variant="progress"
        value={prepareProgress.total > 0 ? prepareProgress.loaded / prepareProgress.total : 0}
        label={prepareProgress.total > 0
          ? `${Math.round(prepareProgress.loaded / 1024 / 1024)}\u00A0/\u00A0${Math.round(prepareProgress.total / 1024 / 1024)}\u00A0MB`
          : ''}
      />
    </div>
  {/if}

  {#if phase === 'converting' || phase === 'done'}
    <div class="status" data-testid="filetool-status">
      <div class="row">
        <span class="row__label">Quelle</span>
        <span class="row__value" translate="no">{sourceName}</span>
        <span class="row__meta">{formatBytes(sourceSize)}</span>
      </div>
      {#if phase === 'done'}
        <div class="row">
          <span class="row__label">Ergebnis</span>
          <span class="row__value" translate="no">{downloadName}</span>
          <span class="row__meta">{formatBytes(outputSize)}</span>
        </div>
        {#if sizeReduction > 0}
          <p class="reduction">
            <span class="reduction__num" translate="no">−{sizeReduction}%</span>
            kleiner als das Original
          </p>
        {/if}
      {:else}
        <p class="converting" aria-live="polite">
          <Loader variant="spinner" ariaLabel="Konvertiert" />
          <span>Konvertiert …</span>
        </p>
      {/if}
    </div>
  {/if}

  {#if phase === 'done' && outputUrl}
    <div class="preview">
      <img
        class="preview__img"
        src={outputUrl}
        alt="Vorschau des Ergebnisses"
        data-testid="filetool-preview"
      />
    </div>
  {/if}

  {#if phase === 'done' && reencoder}
    <fieldset class="formats" data-testid="filetool-format-chooser">
      <legend class="formats__legend">Format</legend>
      <label class="formats__opt">
        <input
          type="radio"
          name="filetool-format"
          value="png"
          data-testid="filetool-format-png"
          checked={outputFormat === 'png'}
          onchange={() => onFormatChange('png')}
        />
        <span>PNG <span class="formats__hint">(Transparenz)</span></span>
      </label>
      <label class="formats__opt">
        <input
          type="radio"
          name="filetool-format"
          value="webp"
          data-testid="filetool-format-webp"
          checked={outputFormat === 'webp'}
          onchange={() => onFormatChange('webp')}
        />
        <span>WebP <span class="formats__hint">(Transparenz)</span></span>
      </label>
      <label class="formats__opt">
        <input
          type="radio"
          name="filetool-format"
          value="jpg"
          data-testid="filetool-format-jpg"
          checked={outputFormat === 'jpg'}
          onchange={() => onFormatChange('jpg')}
        />
        <span>JPG <span class="formats__hint">(weißer Hintergrund)</span></span>
      </label>
    </fieldset>
  {/if}

  {#if config.showQuality ?? true}
    <div class="quality" hidden={phase === 'preparing' || phase === 'converting' || phase === 'done'}>
      <div class="quality__head">
        <label for="filetool-quality" class="quality__label">Qualität</label>
        <span class="quality__value" translate="no">{quality}</span>
      </div>
      <input
        id="filetool-quality"
        class="quality__slider"
        type="range"
        min="40"
        max="100"
        step="1"
        bind:value={quality}
        data-testid="filetool-quality"
      />
      <div class="quality__scale">
        <span>kleiner</span>
        <span>schärfer</span>
      </div>
    </div>
  {/if}

  <div class="result" data-testid="filetool-result" aria-live="polite">
    {#if phase === 'error'}
      <p class="error" data-testid="filetool-error">{errorMessage}</p>
    {/if}
    {#if phase === 'done'}
      <a
        class="download"
        href={outputUrl}
        download={downloadName}
        data-testid="filetool-download"
      >
        <svg class="download__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Herunterladen</span>
      </a>
      <button
        type="button"
        class="reset"
        data-testid="filetool-reset"
        onclick={reset}
      >Neue Datei</button>
    {/if}
  </div>
</div>

<style>
  .filetool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-sm);
  }

  .dropzone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-10) var(--space-6);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    cursor: pointer;
    transition:
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  .dropzone:hover {
    border-color: var(--color-text-subtle);
    background: var(--color-bg);
  }
  .dropzone:focus-within {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .dropzone--error {
    border-color: var(--color-error);
  }

  .dropzone__title {
    font-size: var(--font-size-h3);
    line-height: var(--font-lh-h3);
    color: var(--color-text);
    letter-spacing: -0.01em;
  }
  .dropzone__hint {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }
  .dropzone__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .camera {
    display: none;
  }
  @media (hover: none) and (pointer: coarse) {
    .camera {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: var(--space-3);
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--r-md);
      font-size: var(--font-size-small);
      color: var(--color-text-muted);
      cursor: pointer;
    }
  }
  .camera input[type='file'] {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .status {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4) 0;
  }
  .row {
    display: grid;
    grid-template-columns: 5.5rem 1fr auto;
    align-items: baseline;
    gap: var(--space-3);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .row:last-of-type {
    border-bottom: 0;
  }
  .row__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.01em;
  }
  .row__value {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .row__meta {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-subtle);
  }

  .reduction {
    margin: var(--space-2) 0 0 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .reduction__num {
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-success);
    font-weight: 500;
    margin-right: var(--space-2);
  }

  .converting {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-2) 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .preparing {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) 0;
  }
  .preparing__title {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    letter-spacing: 0.01em;
  }

  .formats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin: 0;
    padding: var(--space-3) 0;
    border: 0;
  }
  .formats__legend {
    padding: 0;
    margin-right: var(--space-3);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.01em;
  }
  .formats__opt {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-small);
    color: var(--color-text);
    cursor: pointer;
  }
  .formats__opt input[type='radio'] {
    accent-color: var(--color-text);
    cursor: pointer;
  }
  .formats__hint {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }

  .quality {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .quality[hidden] {
    display: none;
  }
  .quality__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .quality__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.01em;
  }
  .quality__value {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
  }
  .quality__slider {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    height: 2px;
    background: var(--color-border);
    border-radius: var(--r-sm);
    outline: none;
    cursor: pointer;
  }
  .quality__slider::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    background: var(--color-text);
    border: 0;
    cursor: pointer;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .quality__slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    background: var(--color-text);
    border: 0;
    cursor: pointer;
  }
  .quality__slider:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }
  .quality__slider:active::-webkit-slider-thumb {
    transform: scale(1.1);
  }
  .quality__scale {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }

  .result {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    min-height: 0;
  }
  .result:empty {
    display: none;
  }

  .preview {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 200px;
    max-height: 200px;
    margin: 0 auto;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background-color: var(--color-bg);
    background-image:
      linear-gradient(45deg, var(--color-border) 25%, transparent 25%),
      linear-gradient(-45deg, var(--color-border) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--color-border) 75%),
      linear-gradient(-45deg, transparent 75%, var(--color-border) 75%);
    background-size: 12px 12px;
    background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  }
  .preview__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  .error {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    width: 100%;
    background: transparent;
    border: 1px solid var(--color-error);
    border-radius: var(--r-md);
    color: var(--color-error);
    font-size: var(--font-size-small);
    line-height: 1.5;
  }

  .download {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    background: var(--color-text);
    color: var(--color-bg);
    border: 1px solid var(--color-text);
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-body);
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      background var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .download:hover {
    background: var(--color-text-muted);
    border-color: var(--color-text-muted);
  }
  .download:active {
    transform: scale(0.98);
  }
  .download:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .download__icon {
    width: 16px;
    height: 16px;
  }

  .reset {
    flex: 0 0 auto;
    padding: var(--space-3) var(--space-4);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-small);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .reset:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .reset:active {
    transform: scale(0.98);
  }
  .reset:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (max-width: 40rem) {
    .filetool {
      padding: var(--space-6);
      gap: var(--space-5);
    }
    .dropzone {
      padding: var(--space-8) var(--space-4);
    }
    .row {
      grid-template-columns: 4.5rem 1fr auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dropzone,
    .download,
    .reset,
    .quality__slider::-webkit-slider-thumb {
      transition: none;
    }
    .download:active,
    .reset:active,
    .quality__slider:active::-webkit-slider-thumb {
      transform: none;
    }
  }
</style>
