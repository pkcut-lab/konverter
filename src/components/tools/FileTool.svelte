<script lang="ts">
  import type { FileToolConfig } from '../../lib/tools/schemas';
  import { getRuntime } from '../../lib/tools/tool-runtime-registry';
  import { decodeHeicIfNeeded } from '../../lib/tools/heic-decode';
  import Loader from '../Loader.svelte';

  interface Props {
    config: FileToolConfig;
  }
  type Phase = 'idle' | 'preparing' | 'converting' | 'done' | 'error';
  type Dims = { w: number; h: number } | null;
  type ClipboardState = 'idle' | 'copied' | 'error';

  let { config }: Props = $props();

  let phase = $state<Phase>('idle');
  let quality = $state<number>(85);
  let sourceName = $state<string>('');
  let sourceSize = $state<number>(0);
  let sourceUrl = $state<string>('');
  let sourceDims = $state<Dims>(null);
  let outputSize = $state<number>(0);
  let outputUrl = $state<string>('');
  let outputDims = $state<Dims>(null);
  let errorMessage = $state<string>('');
  let outputFormat = $state<string>(config.defaultFormat ?? 'webp');
  let prepareProgress = $state<{ loaded: number; total: number }>({ loaded: 0, total: 0 });
  let progress = $state<number | null>(null);
  let convertStartMs = $state<number | null>(null);
  let clipboardState = $state<ClipboardState>('idle');
  let presetValue = $state<string>(config.presets?.default ?? '');
  const initialToggles: Record<string, boolean> = {};
  for (const t of config.toggles ?? []) initialToggles[t.id] = false;
  let toggleValues = $state<Record<string, boolean>>(initialToggles);
  const preflightError = config.id
    ? (getRuntime(config.id)?.preflightCheck?.() ?? null)
    : null;
  if (preflightError) {
    phase = 'error';
    errorMessage = preflightError;
  }

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
  const clipboardLabel = $derived(
    clipboardState === 'copied' ? 'Kopiert'
    : clipboardState === 'error' ? 'Nicht unterstützt'
    : 'In Zwischenablage',
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

  async function measureDims(blob: Blob): Promise<Dims> {
    if (typeof createImageBitmap !== 'function') return null;
    try {
      const bmp = await createImageBitmap(blob);
      const dims = { w: bmp.width, h: bmp.height };
      bmp.close?.();
      return dims;
    } catch {
      return null;
    }
  }

  function reset() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    runtime?.clearLastResult?.();
    // Preflight-error stays sticky — the browser-API gap doesn't change on reset.
    phase = preflightError ? 'error' : 'idle';
    errorMessage = preflightError ?? '';
    sourceName = '';
    sourceSize = 0;
    sourceUrl = '';
    // sourceDims persists: the toggle's visibility depends on it, and the
    // plan requires toggle-state to stick across reset so the user can opt
    // in/out before re-dropping another file of the same source class.
    outputSize = 0;
    outputUrl = '';
    outputDims = null;
    prepareProgress = { loaded: 0, total: 0 };
    progress = null;
    convertStartMs = null;
    clipboardState = 'idle';
  }

  // ETA formatter — MM:SS when <1 h, HH:MM:SS otherwise. Zero-padded.
  // Empty string if seconds is undefined or non-positive (caller suppresses output).
  function formatEta(seconds: number | undefined): string {
    if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return '';
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  // Lazy probe of source video dimensions via Mediabunny. Used by toggles with
  // visibleIf='source-gt-1080p' — we need to know W×H BEFORE showing the
  // checkbox. Cached in `sourceDims`. Failure is non-fatal: toggle stays hidden.
  async function probeVideoDims(bytes: Uint8Array<ArrayBuffer>): Promise<Dims> {
    try {
      const mb: Record<string, unknown> = await import('mediabunny');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const source = new (mb.BufferSource as any)(bytes);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inputFile = new (mb.Input as any)({ source, formats: mb.ALL_FORMATS });
      const track = await inputFile.getPrimaryVideoTrack();
      if (!track) return null;
      return { w: track.width, h: track.height };
    } catch {
      return null;
    }
  }

  async function processFile(file: File) {
    if (preflightError) return; // Browser gap blocks the tool entirely.
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
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = URL.createObjectURL(file);
    errorMessage = '';
    outputFormat = config.defaultFormat ?? 'webp';

    if (!processor) {
      errorMessage = `Kein Prozessor registriert für „${config.id}”.`;
      phase = 'error';
      return;
    }

    let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await file.arrayBuffer() as ArrayBuffer);
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const dec = await decodeHeicIfNeeded(bytes, file.type);
        bytes = dec.bytes as Uint8Array<ArrayBuffer>;
      } catch (err) {
        errorMessage = err instanceof Error ? `HEIC-Decode-Fehler: ${err.message}` : 'HEIC-Decode-Fehler.';
        phase = 'error';
        return;
      }
    }

    // Source-resolution probe — only runs if at least one toggle needs it.
    const needsVideoProbe = (config.toggles ?? []).some((t) => t.visibleIf === 'source-gt-1080p');
    if (needsVideoProbe) {
      sourceDims = await probeVideoDims(bytes);
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
    progress = null;
    convertStartMs = performance.now();
    // Merged runtime-config: base slider (quality), chosen preset, all toggle values.
    const mergedConfig: Record<string, unknown> = { quality };
    if (config.presets) mergedConfig[config.presets.id] = presetValue;
    for (const t of config.toggles ?? []) mergedConfig[t.id] = toggleValues[t.id] ?? false;
    try {
      const outBytes = await processor(
        bytes,
        mergedConfig,
        (p: number) => { progress = p; },
      );
      const blob = new Blob([outBytes as BlobPart], { type: formatToMime(outputFormat) });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = URL.createObjectURL(blob);
      outputSize = outBytes.byteLength;
      phase = 'done';
      progress = null;
      convertStartMs = null;
      void measureDims(blob).then((d) => { outputDims = d; });
    } catch (err) {
      progress = null;
      convertStartMs = null;
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
      void measureDims(blob).then((d) => { outputDims = d; });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Format-Wechsel fehlgeschlagen.';
      phase = 'error';
    }
  }

  async function copyToClipboard() {
    if (!outputUrl) return;
    try {
      const res = await fetch(outputUrl);
      const blob = await res.blob();
      const CI = (globalThis as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
      if (!CI || !navigator.clipboard?.write) throw new Error('Clipboard unsupported');
      await navigator.clipboard.write([new CI({ [blob.type]: blob })]);
      clipboardState = 'copied';
    } catch {
      clipboardState = 'error';
    }
    setTimeout(() => { clipboardState = 'idle'; }, 1800);
  }
</script>

<div class="filetool">
  {#if (phase === 'idle' || phase === 'error') && !preflightError}
    {#if config.presets}
      <fieldset class="presets" data-testid="filetool-presets">
        <legend class="presets__legend">Qualität</legend>
        {#each config.presets.options as opt (opt.id)}
          <label class="presets__opt">
            <input
              type="radio"
              name="filetool-preset"
              value={opt.id}
              data-testid="filetool-preset-{opt.id}"
              checked={presetValue === opt.id}
              onchange={() => { presetValue = opt.id; }}
            />
            <span>{opt.label}</span>
          </label>
        {/each}
      </fieldset>
    {/if}

    {#each config.toggles ?? [] as t (t.id)}
      {#if t.visibleIf === undefined || (t.visibleIf === 'source-gt-1080p' && sourceDims !== null && (sourceDims.w > 1920 || sourceDims.h > 1080))}
        <label class="toggle">
          <input
            type="checkbox"
            data-testid="filetool-toggle-{t.id}"
            checked={toggleValues[t.id] ?? false}
            onchange={(e) => {
              toggleValues = { ...toggleValues, [t.id]: (e.currentTarget as HTMLInputElement).checked };
            }}
          />
          <span>{t.label}</span>
        </label>
      {/if}
    {/each}

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

  {#if phase === 'converting'}
    <div class="converting" data-testid="filetool-status" aria-live="polite">
      <Loader variant="spinner" ariaLabel="Konvertiert" />
      {#if progress !== null}
        {@const percent = Math.round(progress * 100)}
        {@const elapsedMs = convertStartMs !== null ? performance.now() - convertStartMs : 0}
        {@const etaSec = progress > 0.05 && elapsedMs > 0
          ? (elapsedMs / 1000) * (1 - progress) / progress
          : undefined}
        {@const etaStr = formatEta(etaSec)}
        <span class="progress" data-testid="filetool-progress" translate="no">
          <span class="progress__pct">{percent}&nbsp;%</span>
          {#if etaStr}
            <span class="progress__sep" aria-hidden="true"> · </span>
            <span class="progress__eta">{etaStr}&nbsp;verbleibend</span>
          {/if}
        </span>
      {:else}
        <span>Konvertiert …</span>
      {/if}
    </div>
  {/if}

  {#if phase === 'done' && outputUrl}
    <article class="card" data-testid="filetool-status">
      <span class="badge" aria-label="Status: fertig">
        <span class="badge__dot" aria-hidden="true"></span>
        <span class="badge__text">FERTIG</span>
      </span>

      <div class="compare">
        <figure class="compare__col">
          <figcaption class="compare__cap">ORIGINAL</figcaption>
          <div class="frame">
            {#if sourceUrl}
              <img
                class="frame__img"
                src={sourceUrl}
                alt="Quelldatei"
              />
            {/if}
          </div>
        </figure>

        <figure class="compare__col">
          <figcaption class="compare__cap">ERGEBNIS</figcaption>
          <div class="preview">
            <img
              class="preview__img"
              src={outputUrl}
              alt="Vorschau des Ergebnisses"
              data-testid="filetool-preview"
            />
          </div>
        </figure>
      </div>

      <footer class="card__foot">
        <p class="meta" translate="no">
          {#if outputDims}
            <span class="meta__part">{outputDims.w}×{outputDims.h}</span>
            <span class="meta__dot" aria-hidden="true">·</span>
          {/if}
          <span class="meta__part">{formatToExt(outputFormat).toUpperCase()}</span>
          <span class="meta__dot" aria-hidden="true">·</span>
          <span class="meta__part">{formatBytes(outputSize)}</span>
          {#if sizeReduction > 0}
            <span class="meta__dot" aria-hidden="true">·</span>
            <span class="meta__part meta__part--success">−{sizeReduction}%</span>
          {/if}
        </p>

        <div class="actions">
          <button
            type="button"
            class="btn btn--ghost"
            data-testid="filetool-reset"
            onclick={reset}
          >Neues Bild</button>

          <button
            type="button"
            class="btn btn--ghost"
            onclick={copyToClipboard}
            aria-live="polite"
          >{clipboardLabel}</button>

          <a
            class="btn btn--primary"
            href={outputUrl}
            download={downloadName}
            data-testid="filetool-download"
          >
            <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
        </div>
      </footer>
    </article>
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
  </div>
</div>

<style>
  .filetool {
    position: relative;
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
    padding: var(--space-8) var(--space-6);
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

  /* ---------- Converting state ---------- */
  .converting {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) 0;
    margin: 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  /* ---------- Preparing state ---------- */
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

  /* ---------- Done state: result card ---------- */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    overflow: hidden;
  }

  .badge {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    letter-spacing: 0.08em;
  }
  .badge__dot {
    width: var(--space-2);
    height: var(--space-2);
    border-radius: 9999px;
    background: var(--color-success);
  }

  .compare {
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 40rem) {
    .compare {
      grid-template-columns: 1fr 1fr;
    }
    .compare__col + .compare__col {
      border-left: 1px solid var(--color-border);
    }
  }
  .compare__col + .compare__col {
    border-top: 1px solid var(--color-border);
  }
  @media (min-width: 40rem) {
    .compare__col + .compare__col {
      border-top: 0;
    }
  }

  .compare__col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding: var(--space-5);
  }

  .compare__cap {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.12em;
  }

  .frame,
  .preview {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background-color: var(--color-bg);
  }
  .preview {
    /* Checkerboard to reveal alpha channel in ERGEBNIS (transparent PNG/WebP) */
    background-image:
      linear-gradient(45deg, var(--color-border) 25%, transparent 25%),
      linear-gradient(-45deg, var(--color-border) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--color-border) 75%),
      linear-gradient(-45deg, transparent 75%, var(--color-border) 75%);
    background-size: 12px 12px;
    background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  }
  .frame__img,
  .preview__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  .card__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .meta {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    margin: 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }
  .meta__dot {
    color: var(--color-text-subtle);
  }
  .meta__part--success {
    color: var(--color-success);
    font-weight: 500;
  }

  .actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-small);
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      background var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out);
  }
  .btn--ghost {
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }
  .btn--ghost:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .btn--primary {
    background: var(--color-text);
    color: var(--color-bg);
    border: 1px solid var(--color-text);
    padding: var(--space-3) var(--space-5);
  }
  .btn--primary:hover {
    background: var(--color-text-muted);
    border-color: var(--color-text-muted);
  }
  .btn:active {
    transform: scale(0.98);
  }
  .btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .btn__icon {
    width: 16px;
    height: 16px;
  }

  /* ---------- Presets (preset-radios replace the quality slider) ---------- */
  .presets {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin: 0;
    padding: var(--space-3) 0;
    border: 0;
  }
  .presets__legend {
    padding: 0;
    margin-right: var(--space-3);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.01em;
  }
  .presets__opt {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-small);
    color: var(--color-text);
    cursor: pointer;
  }
  .presets__opt input[type='radio'] {
    accent-color: var(--color-text);
    cursor: pointer;
  }

  /* ---------- Single-toggle checkbox (e.g. "Auf 1080p verkleinern") ---------- */
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-2) 0;
    font-size: var(--font-size-small);
    color: var(--color-text);
    cursor: pointer;
  }
  .toggle input[type='checkbox'] {
    accent-color: var(--color-text);
    cursor: pointer;
  }

  /* ---------- Progress (converting state: "42 % · 00:37 verbleibend") ---------- */
  .progress {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }
  .progress__sep {
    color: var(--color-text-subtle);
  }

  /* ---------- Formats + quality (unchanged layout, below card) ---------- */
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

  /* ---------- Error container ---------- */
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

  @media (max-width: 40rem) {
    .filetool {
      padding: var(--space-6);
      gap: var(--space-5);
    }
    .dropzone {
      padding: var(--space-8) var(--space-4);
    }
    .compare__col {
      padding: var(--space-4);
    }
    .card__foot {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dropzone,
    .btn,
    .quality__slider::-webkit-slider-thumb {
      transition: none;
    }
    .btn:active,
    .quality__slider:active::-webkit-slider-thumb {
      transform: none;
    }
  }
</style>
