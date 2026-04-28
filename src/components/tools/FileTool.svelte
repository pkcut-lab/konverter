<script lang="ts">
  import type { FileToolConfig } from '../../lib/tools/schemas';
  import { getRuntime } from '../../lib/tools/tool-runtime-registry';
  import { decodeHeicIfNeeded } from '../../lib/tools/heic-decode';
  import Loader from '../Loader.svelte';
  import { dispatchToolUsed } from '../../lib/tracking';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';
  import { INTL_LOCALE_MAP } from '../../lib/i18n/locale-maps';
  import { resolveLabel } from '../../lib/tools/label';
  import {
    detectMlDevice,
    pickStallTimeout,
    type DeviceProbe,
  } from '../../lib/tools/ml-device-detect';
  import {
    pickDefaultVariant,
    formatVariantSize,
    type VariantId,
    type MlVariant,
  } from '../../lib/tools/ml-variants';

  interface Props {
    config: FileToolConfig;
    lang: Lang;
  }
  type Phase = 'idle' | 'preparing' | 'converting' | 'done' | 'error';
  type Dims = { w: number; h: number } | null;
  type ClipboardState = 'idle' | 'copied' | 'error';

  let { config, lang }: Props = $props();
  const strings = $derived(t(lang));

  let phase = $state<Phase>('idle');
  let quality = $state<number>(85);
  let sourceName = $state<string>('');
  let sourceSize = $state<number>(0);
  let sourceUrl = $state<string>('');
  let sourceDims = $state<Dims>(null);
  let outputSize = $state<number>(0);
  let outputUrl = $state<string>('');
  let outputDims = $state<Dims>(null);
  let outputText = $state<string>('');
  
  // Image Zoom State
  let isZooming = $state<boolean>(false);
  let zoomX = $state<number>(50);
  let zoomY = $state<number>(50);

  let errorMessage = $state<string>('');
  let outputFormat = $state<string>(config.defaultFormat ?? 'webp');
  let prepareProgress = $state<{ loaded: number; total: number }>({ loaded: 0, total: 0 });
  let progress = $state<number | null>(null);
  let convertStartMs = $state<number | null>(null);
  let clipboardState = $state<ClipboardState>('idle');
  let presetValue = $state<string>(config.presets?.default ?? '');
  let isDragging = $state<boolean>(false);
  let pasteStatus = $state<'idle' | 'error'>('idle');
  let fileInputEl: HTMLInputElement | undefined = $state();
  // Mobile-aware ML state. `deviceProbe` is null until the WebGPU adapter
  // probe resolves (one-shot, runs on first $effect tick — does not block
  // the dropzone render). `selectedVariant` defaults to the auto-picked
  // variant for the device class; the variant-switcher banner overrides it.
  // `stalled` flips on `StallError` and unblocks the retry-recovery banner.
  let deviceProbe = $state<DeviceProbe | null>(null);
  let selectedVariant = $state<VariantId | null>(null);
  let stalled = $state<boolean>(false);
  let lastFileForRetry = $state<File | null>(null);
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
  // ML-variant-derived UI helpers.
  const variants = $derived<MlVariant[] | undefined>(getRuntime(config.id)?.variants);
  const activeVariant = $derived<MlVariant | undefined>(
    variants && selectedVariant
      ? variants.find((v) => v.id === selectedVariant)
      : variants?.[0],
  );
  const fastVariant = $derived<MlVariant | undefined>(
    variants?.find((v) => v.id === 'fast'),
  );
  // Variants the user can switch to from the active one (excluding the active).
  const switchableVariants = $derived.by<MlVariant[]>(() => {
    if (!variants || !activeVariant) return [];
    return variants.filter((v) => v.id !== activeVariant.id);
  });

  $effect(() => {
    let cancelled = false;
    void detectMlDevice().then((probe) => {
      if (cancelled) return;
      deviceProbe = probe;
      if (variants && variants.length > 0 && !selectedVariant) {
        selectedVariant = pickDefaultVariant(config.id, probe);
      }
    });
    return () => { cancelled = true; };
  });
  // Dropzone title adapts to the tool's category. Falls back to the generic
  // subject when the category is not recognised.
  const dropzoneSubject = $derived.by(() => {
    const s = strings.fileTool;
    const map: Record<string, string> = {
      video: s.subjectVideo,
      image: s.subjectImage,
      audio: s.subjectAudio,
      document: s.subjectDocument,
    };
    return map[config.categoryId] ?? s.subjectFile;
  });
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
    clipboardState === 'copied' ? strings.toolsCommon.copied
    : clipboardState === 'error' ? strings.fileTool.clipboardError
    : strings.fileTool.clipboardCopy,
  );
  // navigator.clipboard.write([ClipboardItem]) only supports image/* MIME types,
  // not application/pdf. Hide the copy button for PDF output.
  const COPY_SUPPORTED_FORMATS = new Set(['png', 'jpg', 'webp']);
  const canCopyToClipboard = $derived(COPY_SUPPORTED_FORMATS.has(outputFormat));

  function formatToMime(f: string): string {
    switch (f) {
      case 'png': return 'image/png';
      case 'jpg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      case 'txt': return 'text/plain';
      case 'pdf': return 'application/pdf';
      default: return 'image/webp';
    }
  }
  function formatToExt(f: string): string {
    switch (f) {
      case 'png': return 'png';
      case 'jpg': return 'jpg';
      case 'webp': return 'webp';
      case 'txt': return 'txt';
      case 'pdf': return 'pdf';
      default: return 'webp';
    }
  }
  // Map "video/quicktime" → "MOV", "image/jpeg" → "JPG", "video/hevc" → "HEVC".
  // Used in the dropzone hint row where we show the list of accepted formats
  // as compact, human-recognisable extensions instead of full MIME types.
  function mimeToExt(mime: string): string {
    const rawSub = mime.split('/')[1] ?? mime;
    const simplified = rawSub
      .replace(/^x-/, '')
      .replace('quicktime', 'mov')
      .replace('jpeg', 'jpg')
      .replace('h265', 'hevc')
      .replace('svg+xml', 'svg');
    return simplified.toUpperCase();
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
    outputText = '';
    prepareProgress = { loaded: 0, total: 0 };
    progress = null;
    convertStartMs = null;
    clipboardState = 'idle';
    stalled = false;
    lastFileForRetry = null;
  }

  // Drop the cached pipeline for the active variant so retry actually re-fetches.
  // Used after a StallError when the user wants to try the same variant again,
  // and when switching to the fast-fallback variant.
  function clearActiveVariantCache() {
    if (selectedVariant && runtime?.clearVariantCache) {
      runtime.clearVariantCache(selectedVariant);
    }
  }

  async function retryAfterStall() {
    stalled = false;
    errorMessage = '';
    clearActiveVariantCache();
    if (lastFileForRetry) {
      void processFile(lastFileForRetry);
    }
  }

  async function fallbackToFastVariant() {
    stalled = false;
    errorMessage = '';
    clearActiveVariantCache();
    selectedVariant = 'fast';
    if (lastFileForRetry) {
      void processFile(lastFileForRetry);
    }
  }

  function chooseVariant(id: VariantId) {
    if (selectedVariant === id) return;
    clearActiveVariantCache();
    selectedVariant = id;
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
      errorMessage = strings.fileTool.errorUnsupportedType.replace('{types}', config.accept.join(', '));
      phase = 'error';
      return;
    }
    if (file.size > config.maxSizeMb * 1024 * 1024) {
      errorMessage = strings.fileTool.errorTooLarge.replace('{size}', String(config.maxSizeMb));
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
      errorMessage = strings.fileTool.errorNoProcessor.replace('{id}', config.id);
      phase = 'error';
      return;
    }

    let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await file.arrayBuffer() as ArrayBuffer);
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const dec = await decodeHeicIfNeeded(bytes, file.type);
        bytes = dec.bytes as Uint8Array<ArrayBuffer>;
      } catch (err) {
        errorMessage = err instanceof Error ? strings.fileTool.errorHeicDecode.replace('{msg}', err.message) : strings.fileTool.errorHeicDecode.replace('{msg}', '');
        phase = 'error';
        return;
      }
    }

    // Source-resolution probe — only runs if at least one toggle needs it.
    const needsVideoProbe = (config.toggles ?? []).some((t) => t.visibleIf === 'source-gt-1080p');
    if (needsVideoProbe) {
      sourceDims = await probeVideoDims(bytes);
    }

    // Variant-aware cache check: if the runtime exposes isPreparedFor and we
    // have a selected variant, prefer the per-variant flag. Otherwise fall
    // back to the global isPrepared. This skips the preparing-phase on
    // revisit only when the *same* variant is cached.
    const alreadyReady =
      selectedVariant && runtime?.isPreparedFor
        ? runtime.isPreparedFor(selectedVariant)
        : runtime?.isPrepared?.() ?? false;
    if (runtime?.prepare && !alreadyReady) {
      phase = 'preparing';
      stalled = false;
      // Mobile-aware watchdog (240s mobile, 60s desktop) plus the user-picked
      // variant flow through to the runtime.
      const stallTimeoutMs = deviceProbe ? pickStallTimeout(deviceProbe) : undefined;
      const prepOpts: { variant?: VariantId; stallTimeoutMs?: number } = {};
      if (selectedVariant) prepOpts.variant = selectedVariant;
      if (stallTimeoutMs !== undefined) prepOpts.stallTimeoutMs = stallTimeoutMs;
      try {
        await runtime.prepare((e) => { prepareProgress = e; }, prepOpts);
      } catch (err) {
        const isStall = err instanceof Error && err.name === 'StallError';
        if (isStall) {
          stalled = true;
          lastFileForRetry = file;
        }
        errorMessage = err instanceof Error
          ? strings.fileTool.errorModelLoad.replace('{msg}', err.message)
          : strings.fileTool.errorModelLoad.replace('{msg}', '');
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
      if (outputFormat === 'txt') {
        outputText = new TextDecoder().decode(outBytes);
      } else {
        outputText = '';
      }
      phase = 'done';
      progress = null;
      convertStartMs = null;
      void measureDims(blob).then((d) => { outputDims = d; });
    } catch (err) {
      progress = null;
      convertStartMs = null;
      errorMessage = err instanceof Error ? strings.fileTool.errorConversion.replace('{msg}', err.message) : strings.fileTool.errorConversion.replace('{msg}', '');
      phase = 'error';
    }
  }

  async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  let _tracked = false;
  $effect(() => {
    if (!_tracked && phase === 'done') {
      _tracked = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: INTL_LOCALE_MAP[lang] });
    }
  });

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
      if (newFormat === 'txt') {
        outputText = new TextDecoder().decode(newBytes);
      } else {
        outputText = '';
      }
      void measureDims(blob).then((d) => { outputDims = d; });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : strings.fileTool.errorFormatChange;
      phase = 'error';
    }
  }

  // Drag-and-drop handlers for the dropzone. preventDefault is required on both
  // dragover AND drop, otherwise the browser navigates away to the file.
  function onDragOver(e: DragEvent) {
    if (phase !== 'idle' && phase !== 'error') return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    isDragging = true;
  }
  function onDragLeave(e: DragEvent) {
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
    isDragging = false;
  }
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    zoomX = ((e.clientX - rect.left) / rect.width) * 100;
    zoomY = ((e.clientY - rect.top) / rect.height) * 100;
    isZooming = true;
  }

  function handleMouseLeave() {
    isZooming = false;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) void processFile(file);
  }

  // Full-area click-to-pick. The nested "Datei wählen" label + "Einfügen"
  // button handle their own clicks natively — we only fire when the click
  // originated on the empty dropzone surface (icon, title, hint, mime pills).
  // Without this guard, clicking the label would open the picker twice.
  function onDropzoneClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('button, a, label, input')) return;
    fileInputEl?.click();
  }

  // Paste-button handler: async Clipboard API. Falls back to a short error flash
  // if the user's browser doesn't grant permission or has nothing pasteable.
  // The global document paste-listener in $effect still handles Ctrl+V directly.
  async function onPasteClick() {
    const clip = navigator.clipboard;
    if (!clip?.read) { pasteStatus = 'error'; setTimeout(() => { pasteStatus = 'idle'; }, 1600); return; }
    try {
      const items = await clip.read();
      for (const item of items) {
        for (const type of item.types) {
          if (config.accept.includes(type)) {
            const blob = await item.getType(type);
            const ext = type.split('/')[1] ?? 'bin';
            const file = new File([blob], `pasted-${Date.now()}.${ext}`, { type });
            void processFile(file);
            return;
          }
        }
      }
      pasteStatus = 'error';
      setTimeout(() => { pasteStatus = 'idle'; }, 1600);
    } catch {
      pasteStatus = 'error';
      setTimeout(() => { pasteStatus = 'idle'; }, 1600);
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
  {#if (phase === 'idle' || phase === 'error') && !preflightError && variants && activeVariant}
    <aside class="ml-banner" data-testid="filetool-ml-banner" aria-live="polite">
      <p class="ml-banner__msg">
        {strings.fileTool.mlBannerOneTime.replace('{size}', formatVariantSize(activeVariant.sizeBytes))}
      </p>
      {#if switchableVariants.length > 0}
        <div class="ml-banner__actions">
          {#each switchableVariants as v (v.id)}
            {@const labelKey =
              v.id === 'fast' ? 'mlBannerSwitchFast'
              : v.id === 'pro' ? 'mlBannerSwitchPro'
              : 'mlBannerSwitchQuality'}
            <button
              type="button"
              class="ml-banner__switch"
              data-testid="filetool-ml-switch-{v.id}"
              onclick={() => chooseVariant(v.id)}
            >{strings.fileTool[labelKey].replace('{size}', formatVariantSize(v.sizeBytes))}</button>
          {/each}
        </div>
      {/if}
    </aside>
  {/if}

  {#if (phase === 'idle' || phase === 'error') && !preflightError}
    {@const visibleToggles = (config.toggles ?? []).filter((t) =>
      t.visibleIf === undefined ||
      (t.visibleIf === 'source-gt-1080p' &&
        sourceDims !== null && (sourceDims.w > 1920 || sourceDims.h > 1080))
    )}
    {#if config.presets || visibleToggles.length > 0}
      <div class="settings">
        {#if config.presets}
          <fieldset class="presets" data-testid="filetool-presets">
            <legend class="presets__legend">{strings.fileTool.presetsLegend}</legend>
            <div class="presets__group">
              {#each config.presets.options as opt (opt.id)}
                <label
                  class="preset-pill"
                  class:preset-pill--active={presetValue === opt.id}
                >
                  <input
                    type="radio"
                    name="filetool-preset"
                    value={opt.id}
                    data-testid="filetool-preset-{opt.id}"
                    checked={presetValue === opt.id}
                    onchange={() => { presetValue = opt.id; }}
                  />
                  <span class="preset-pill__label">{resolveLabel(opt.label, lang)}</span>
                  {#if opt.subLabel}
                    <span class="preset-pill__sub">{resolveLabel(opt.subLabel ?? '', lang)}</span>
                  {/if}
                </label>
              {/each}
            </div>
          </fieldset>
        {/if}

        {#if visibleToggles.length > 0}
          <div class="settings__toggles">
            {#each visibleToggles as t (t.id)}
              <label class="toggle">
                <input
                  type="checkbox"
                  data-testid="filetool-toggle-{t.id}"
                  checked={toggleValues[t.id] ?? false}
                  onchange={(e) => {
                    toggleValues = { ...toggleValues, [t.id]: (e.currentTarget as HTMLInputElement).checked };
                  }}
                />
                <span>{resolveLabel(t.label, lang)}</span>
              </label>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <div
      class="dropzone"
      class:dropzone--error={phase === 'error'}
      class:dropzone--dragging={isDragging}
      data-testid="filetool-dropzone"
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      onclick={onDropzoneClick}
      role="region"
      aria-label={strings.fileTool.dropzoneAria}
    >
      <div class="dropzone__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            d="M12 15V4m0 0l-4 4m4-4l4 4M5 20h14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="dropzone__title">{strings.fileTool.dragHere.replace('{subject}', dropzoneSubject)}</p>
      <p class="dropzone__hint" data-testid="filetool-meta">
        <span class="dropzone__formats">{config.accept.map(mimeToExt).join(', ')}</span>
        <span class="dropzone__sep" aria-hidden="true">·</span>
        <span>max. {config.maxSizeMb}&nbsp;MB</span>
      </p>
      <ul class="dropzone__mime" aria-hidden="true">
        {#each config.accept as mime (mime)}
          <li class="dropzone__mime-pill">{mime}</li>
        {/each}
      </ul>
      <div class="dropzone__actions">
        <label class="btn btn--primary dropzone__browse">
          <span>{strings.toolsCommon.pickFile}</span>
          <input
            bind:this={fileInputEl}
            class="dropzone__input"
            type="file"
            accept={acceptAttr}
            data-testid="filetool-input"
            onchange={onFileChange}
          />
        </label>
        <button
          type="button"
          class="btn btn--ghost dropzone__paste"
          onclick={onPasteClick}
          data-testid="filetool-paste"
        >
          <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="8" y="3" width="8" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
              fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span>{pasteStatus === 'error' ? strings.fileTool.pasteError : strings.fileTool.pasteBtn}</span>
          <kbd class="btn__kbd">⌘V</kbd>
        </button>
      </div>
    </div>
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
        <span>{strings.fileTool.camera}</span>
      </label>
    {/if}
  {/if}

  {#if phase === 'preparing'}
    <div class="preparing" data-testid="filetool-preparing" aria-live="polite">
      <p class="preparing__title">{strings.fileTool.modelLoading}</p>
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
      <Loader variant="spinner" ariaLabel={strings.fileTool.convertingAria} />
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
            <span class="progress__eta">{strings.fileTool.etaRemaining.replace('{eta}', etaStr)}</span>
          {/if}
        </span>
      {:else}
        <span>{strings.fileTool.converting}</span>
      {/if}
    </div>
  {/if}

  {#if phase === 'done' && outputUrl}
    <article class="card" data-testid="filetool-status">
      <span class="badge" aria-label={strings.fileTool.doneAria}>
        <span class="badge__dot" aria-hidden="true"></span>
        <span class="badge__text">{strings.fileTool.done}</span>
      </span>

      <div class="compare">
        <figure class="compare__col">
          <figcaption class="compare__cap">{strings.fileTool.original}</figcaption>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="frame"
            onmousemove={handleMouseMove}
            onmouseleave={handleMouseLeave}
          >
            {#if sourceUrl}
              {#if config.categoryId === 'audio'}
                <audio controls src={sourceUrl} class="audio-player">{strings.fileTool.audioFallback}</audio>
              {:else if config.categoryId === 'document'}
                <object data={sourceUrl} type="application/pdf" class="frame__pdf" aria-label={strings.fileTool.sourcePdfAria}><p class="frame__pdf-fallback">{strings.fileTool.pdfFallback}</p></object>
              {:else}
                <img
                  class="frame__img"
                  class:frame__img--zoomed={isZooming}
                  style={isZooming ? `transform-origin: ${zoomX}% ${zoomY}%;` : ''}
                  src={sourceUrl}
                  alt={strings.fileTool.sourceAlt}
                />
              {/if}
            {/if}
          </div>
        </figure>

        <figure class="compare__col">
          <figcaption class="compare__cap">{strings.fileTool.result}</figcaption>
          <div class="preview" class:preview--text={outputFormat === 'txt'} class:preview--audio={config.categoryId === 'audio'}>
            {#if outputFormat === 'txt'}
              <textarea class="preview__text" readonly value={outputText} aria-label={strings.fileTool.ocrTextAria}></textarea>
            {:else if config.categoryId === 'audio'}
              <audio controls src={outputUrl} class="audio-player" data-testid="filetool-preview">{strings.fileTool.audioFallback}</audio>
            {:else if config.categoryId === 'document'}
              <object data={outputUrl} type="application/pdf" class="preview__pdf" aria-label={strings.fileTool.resultPdfAria} data-testid="filetool-preview"><p class="frame__pdf-fallback">{strings.fileTool.pdfFallback}</p></object>
            {:else}
              <img
                class="preview__img"
                src={outputUrl}
                alt={strings.fileTool.resultAlt}
                data-testid="filetool-preview"
              />
            {/if}
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
          >{resolveLabel(config.resetLabel ?? '', lang) || strings.toolsCommon.reset}</button>

          {#if canCopyToClipboard}
          <button
            type="button"
            class="btn btn--ghost"
            onclick={copyToClipboard}
            aria-live="polite"
          >{clipboardLabel}</button>
          {/if}

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
            <span>{strings.toolsCommon.download}</span>
          </a>
        </div>
      </footer>
    </article>
  {/if}

  {#if phase === 'done' && reencoder}
    <fieldset class="formats" data-testid="filetool-format-chooser">
      <legend class="formats__legend">{strings.fileTool.formatLegend}</legend>
      <label class="formats__opt">
        <input
          type="radio"
          name="filetool-format"
          value="png"
          data-testid="filetool-format-png"
          checked={outputFormat === 'png'}
          onchange={() => onFormatChange('png')}
        />
        <span>PNG <span class="formats__hint">({strings.fileTool.transparency})</span></span>
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
        <span>WebP <span class="formats__hint">({strings.fileTool.transparency})</span></span>
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
        <span>JPG <span class="formats__hint">({strings.fileTool.whiteBackground})</span></span>
      </label>
    </fieldset>
  {/if}

  {#if config.showQuality ?? true}
    <div class="quality" hidden={phase === 'preparing' || phase === 'converting' || phase === 'done'}>
      <div class="quality__head">
        <label for="filetool-quality" class="quality__label">{strings.fileTool.qualityLabel}</label>
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
        <span>{strings.fileTool.qualityMin}</span>
        <span>{strings.fileTool.qualityMax}</span>
      </div>
    </div>
  {/if}

  <div class="result" data-testid="filetool-result" aria-live="polite">
    {#if phase === 'error'}
      <p class="error" data-testid="filetool-error">{errorMessage}</p>
      {#if stalled}
        <div class="stall-recovery" data-testid="filetool-stall-recovery">
          <p class="stall-recovery__title">{strings.fileTool.mlStalledTitle}</p>
          <div class="stall-recovery__actions">
            <button
              type="button"
              class="btn btn--ghost"
              data-testid="filetool-stall-retry"
              onclick={retryAfterStall}
            >{strings.fileTool.mlStalledRetry}</button>
            {#if fastVariant && activeVariant && activeVariant.id !== 'fast'}
              <button
                type="button"
                class="btn btn--primary"
                data-testid="filetool-stall-fallback"
                onclick={fallbackToFastVariant}
              >{strings.fileTool.mlStalledFallback}</button>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  /* Layout-only wrapper — KEIN eigenes Chrome. Settings-Card + Dropzone
     schweben als unabhängige Cards auf dem warmen Canvas (Template-Match).
     Der alte Outer-Border/Shadow/Padding würde einen überflüssigen zweiten
     Rahmen um die inneren Cards ziehen. */
  .filetool {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* ---------- Dropzone (Session 4 redesign, 2026-04-20) ----------
     Structure: icon-tile → title → meta hint → MIME pills → action row.
     The whole zone is a drop target; the "Datei wählen" label nests the
     hidden file input so clicking it opens the browser's file picker
     without the legacy absolute-positioned overlay. */
  .dropzone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-3);
    padding: var(--space-12) var(--space-6) var(--space-8);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    /* Whole surface is click-to-pick — nested button/label handle their
       own clicks via onDropzoneClick guard. */
    cursor: pointer;
    transition:
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  .dropzone:hover {
    border-color: var(--color-text-subtle);
  }
  .dropzone--error {
    border-color: var(--color-error);
  }
  .dropzone--dragging {
    border-color: var(--color-accent);
    border-style: solid;
    background: color-mix(in oklch, var(--color-accent) 6%, var(--color-bg));
  }

  .dropzone__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: var(--space-2);
    border-radius: var(--r-md);
    background: var(--color-surface-sunk);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }
  .dropzone__title {
    margin: 0;
    font-size: var(--font-size-h3);
    line-height: 1.25;
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: -0.01em;
  }
  .dropzone__hint {
    margin: 0;
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }
  .dropzone__formats {
    color: var(--color-text-muted);
  }
  .dropzone__sep {
    color: var(--color-text-subtle);
  }
  .dropzone__mime {
    list-style: none;
    padding: 0;
    margin: var(--space-1) 0 var(--space-4);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-1);
  }
  .dropzone__mime-pill {
    padding: 2px var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    background: color-mix(in oklch, var(--color-accent) 8%, var(--color-bg));
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .dropzone__actions {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
  }
  .dropzone__browse {
    position: relative;
    cursor: pointer;
  }
  .dropzone__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  .dropzone__paste .btn__kbd {
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    padding: 0 var(--space-1);
    margin-left: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    background: var(--color-surface);
    color: var(--color-text-subtle);
    line-height: 1.4;
  }

  .camera {
    display: none;
  }
  @media (hover: none) and (pointer: coarse) {
    .camera {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.75rem; /* WCAG 2.5.5 — min tap target */
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
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background-color: var(--color-bg);
    overflow: hidden;
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
  .preview--text {
    background-image: none;
    background-color: transparent;
  }
  .preview--audio,
  .frame:has(.audio-player) {
    aspect-ratio: auto;
    min-height: 5rem;
    background-image: none;
    align-items: center;
  }
  .audio-player {
    width: 100%;
  }
  .frame__img,
  .preview__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    transition: transform 0.1s ease-out;
    will-change: transform;
  }
  .frame__img--zoomed {
    transform: scale(2.5);
    cursor: zoom-in;
  }
  .preview__text {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    background: transparent;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text);
    padding: var(--space-2);
    outline: none;
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
    /* Feinere Button-Proportionen — schmaleres Padding, kleinerer Radius
       und leichterer Font-Weight zugunsten eines eleganten, premium
       Eindrucks statt "solid block". */
    min-height: 2.75rem; /* WCAG 2.5.5 — min tap target */
    padding: var(--space-2) var(--space-4);
    border-radius: var(--r-sm);
    font: inherit;
    font-size: var(--font-size-small);
    font-weight: 450;
    letter-spacing: -0.005em;
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
    /* Primary-Padding bleibt etwas großzügiger als Secondary, aber spürbar
       schmaler als der alte --space-3/--space-5-Block. */
    padding: var(--space-2) var(--space-5);
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

  /* ---------- Settings card ----------------------------------------
     Single rounded card that wraps the preset-row + optional toggles —
     template shows both in ONE bordered container with a divider between
     them. Acts as the card chrome; .presets and .toggle are chrome-less
     children so the parent's border/background is the single source. */
  .settings {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
  }
  .settings__toggles {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--color-border);
  }

  /* ---------- Presets — segmented-pill selector (Session 4 redesign) ----------
     Template match: mono "QUALITÄT" label on the left with a divider, then
     horizontal pills. Active pill is filled graphite. Each pill optionally
     carries a compact mono sub-label ("CRF 18 · größte Datei"). Chrome-less
     — the surrounding .settings card provides border/background. */
  .presets {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: var(--space-3);
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border: 0;
    background: transparent;
  }
  .presets__legend {
    float: none;
    display: inline-flex;
    align-items: center;
    padding-right: var(--space-3);
    margin-right: var(--space-1);
    border-right: 1px solid var(--color-border);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .presets__group {
    /* Group füllt den Rest der Settings-Card und zentriert die Pills horizontal —
       so bleibt die Anordnung balanciert, egal ob 2, 3, 4 oder 5 Preset-Pills. */
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-1);
  }
  .preset-pill {
    position: relative;
    display: inline-flex;
    align-items: center; /* was: baseline; WCAG 2.5.5 requires min-height which needs center */
    /* Pill kompakter — kleineres Gap + schmaleres Padding, damit alle
       drei Presets + QUALITÄT-Label einzeilig in die Settings-Card passen. */
    gap: 6px;
    min-height: 2.75rem; /* WCAG 2.5.5 — min tap target */
    padding: 5px var(--space-3);
    border-radius: 9999px;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    cursor: pointer;
    /* Kein Umbruch zwischen Label und Sub-Label innerhalb eines Pills. */
    white-space: nowrap;
    transition:
      background var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out);
  }
  .preset-pill:hover {
    color: var(--color-text);
  }
  .preset-pill input[type='radio'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  /* Fokus-Ring NUR bei Keyboard-Fokus — :focus-within würde auch nach
     Mausklick triggern (radio-input behält Fokus) und den Accent-Ring um
     den ohnehin schon schwarz markierten Active-Pill legen. */
  .preset-pill:has(input:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .preset-pill__label {
    /* 450 statt 500 — feinere Typografie auf dem Active-Pill, damit die
       dunkle Fläche nicht zu stark nach vorn drückt. */
    font-weight: 450;
    color: inherit;
  }
  .preset-pill__sub {
    font-family: var(--font-family-mono);
    /* Sub-Label kompakter — 11px statt 12px, damit die Preset-Reihe
       horizontal in die 48rem-Settings-Card passt ohne umzubrechen. */
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    letter-spacing: 0.01em;
  }
  .preset-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
  }
  .preset-pill--active .preset-pill__label,
  .preset-pill--active .preset-pill__sub {
    color: var(--color-bg);
  }
  .preset-pill--active .preset-pill__sub {
    opacity: 0.7;
  }

  /* ---------- Single-toggle checkbox (e.g. "Auf 1080p verkleinern") ----------
     Lives inside .settings__toggles; the parent handles alignment/spacing. */
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 2.75rem; /* WCAG 2.5.5 — min tap target */
    margin: 0;
    padding: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    cursor: pointer;
  }
  .toggle:hover {
    color: var(--color-text);
  }
  .toggle input[type='checkbox'] {
    accent-color: var(--color-accent);
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
    min-height: 2.75rem; /* WCAG 2.5.5 — min tap target */
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
    height: 2.75rem; /* WCAG 2.5.5 — vertical tap area; visual track via pseudo */
    background: transparent; /* track styled per-engine via pseudo-elements below */
    border-radius: var(--r-sm);
    outline: none;
    cursor: pointer;
  }
  .quality__slider::-webkit-slider-runnable-track {
    height: 2px;
    background: var(--color-border);
    border-radius: var(--r-sm);
  }
  .quality__slider::-moz-range-track {
    height: 2px;
    background: var(--color-border);
    border-radius: var(--r-sm);
    border: 0;
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

  /* ---------- Mobile-aware ML banner (size-disclosure + variant switcher) ----------
     Sits above the settings/dropzone in idle/error. Refined-Minimalism: no
     Emoji, no "Tipp:" prefix, no exclamation marks — direct numerics with a
     mono-tabular label, monospace switcher links. Variant-switcher renders
     0–N "Schnell-Variante (6,6 MB)" buttons depending on tool's variant matrix. */
  .ml-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface-sunk);
  }
  .ml-banner__msg {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    line-height: 1.5;
  }
  .ml-banner__actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  .ml-banner__switch {
    appearance: none;
    background: transparent;
    border: 0;
    padding: 0;
    font: inherit;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    letter-spacing: 0.01em;
  }
  .ml-banner__switch:hover {
    color: var(--color-text);
  }
  .ml-banner__switch:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
    border-radius: 2px;
  }

  /* ---------- Stall-Recovery (after model-download timeout) ---------- */
  .stall-recovery {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) 0 0;
  }
  .stall-recovery__title {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .stall-recovery__actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-2);
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
      gap: var(--space-4);
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
    .frame__img {
      transition: none;
      transform: none;
    }
  }
</style>
