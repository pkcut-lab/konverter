<script lang="ts">
  import type { FileToolConfig } from '../../lib/tools/schemas';
  import type { Lang } from '../../lib/i18n/lang';
  import { t } from '../../lib/i18n/strings';
  import type { ConvertOpts, ConvertResult, ConvertError, OutputFormat, ResizeMode } from '../../lib/tools/heic-konverter';
  import type { ExifMode } from '../../lib/tools/heic-exif';

  const { config, lang }: { config: FileToolConfig; lang: Lang } = $props();

  const s = $derived(t(lang).tools.heicKonverter);
  const format: OutputFormat = $derived(config.id === 'heic-to-png' ? 'png' : 'jpg');

  // ── State ────────────────────────────────────────────────────────
  let files = $state<File[]>([]);
  let isConverting = $state(false);
  let results = $state<(ConvertResult | ConvertError)[]>([]);
  let quality = $state<'high' | 'mid' | 'low'>('high');
  let resize = $state<ResizeMode>('original');
  let exifMode = $state<ExifMode>('standard');
  let isDragging = $state(false);
  let livePhotosDetected = $state(false);
  let fileInputEl = $state<HTMLInputElement | null>(null);

  const qualityValue = $derived(quality === 'high' ? 0.92 : quality === 'mid' ? 0.82 : 0.65);

  // iOS Safari detection (client-side only)
  const isIos = $derived(
    typeof navigator !== 'undefined' &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg/.test(navigator.userAgent) &&
    /iPhone|iPad/.test(navigator.userAgent)
  );

  // ── File picking ─────────────────────────────────────────────────
  function isHeic(f: File): boolean {
    const mimes = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);
    if (mimes.has(f.type)) return true;
    return /\.(heic|heif)$/i.test(f.name);
  }

  async function addFiles(newFiles: File[]) {
    files = [...files, ...newFiles.filter(isHeic)];
    // Check for Live Photos
    const hasLive = newFiles.some(f => /\.(mov)$/i.test(f.name));
    if (hasLive) livePhotosDetected = true;
    results = [];
  }

  function onFileInputChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    if (!input.files) return;
    addFiles(Array.from(input.files));
    input.value = '';
  }

  async function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (!e.dataTransfer) return;
    const { extractHeicFromDrop, detectLivePhotos } = await import('../../lib/tools/heic-folder-extract');
    const dropped = await extractHeicFromDrop(e.dataTransfer);
    const pairs = detectLivePhotos(dropped);
    if (pairs.some(p => p.mov)) livePhotosDetected = true;
    const heicFiles = pairs.map(p => p.heic);
    if (heicFiles.length === 0) return;
    files = [...files, ...heicFiles];
    results = [];
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function onDragLeave() {
    isDragging = false;
  }

  function removeFile(idx: number) {
    files = files.filter((_, i) => i !== idx);
    results = [];
    livePhotosDetected = false;
  }

  function reset() {
    files = [];
    results = [];
    isConverting = false;
    livePhotosDetected = false;
    if (fileInputEl) fileInputEl.value = '';
  }

  // ── Conversion ───────────────────────────────────────────────────
  async function convert() {
    if (files.length === 0 || isConverting) return;
    isConverting = true;
    results = [];

    const opts: ConvertOpts = {
      format,
      quality: qualityValue,
      resize,
      exifMode,
    };

    const { convertBatch } = await import('../../lib/tools/heic-konverter');
    for await (const item of convertBatch(files, opts)) {
      results = [...results, item];
    }
    isConverting = false;
  }

  // ── Per-file download ────────────────────────────────────────────
  function downloadResult(r: ConvertResult) {
    const url = URL.createObjectURL(new Blob([r.bytes as BlobPart], { type: r.mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = r.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── ZIP download ─────────────────────────────────────────────────
  async function downloadZip() {
    const successResults = results.filter((r): r is ConvertResult => r.kind === 'result');
    if (successResults.length === 0) return;
    const { createZipBlob, triggerDownload } = await import('../../lib/tools/heic-zip-stream');
    const blob = await createZipBlob(successResults.map(r => ({ name: r.filename, bytes: r.bytes })));
    triggerDownload(blob, `heic-konvertiert-${Date.now()}.zip`);
  }

  const successCount = $derived(results.filter(r => r.kind === 'result').length);
  const hasResults = $derived(results.length > 0 && !isConverting);
</script>

<div class="heic-tool">
  <!-- Privacy badge -->
  <p class="privacy-badge" aria-label={s.privacyBadge}>
    <span class="badge-dot" aria-hidden="true"></span>
    {s.privacyBadge}
  </p>

  <!-- iOS hint -->
  {#if isIos}
    <p class="hint hint--ios">{s.iosHint}</p>
  {/if}

  <!-- Live Photos banner -->
  {#if livePhotosDetected}
    <div class="banner banner--info" role="status">{s.livePhotosBanner}</div>
  {/if}

  <!-- Dropzone -->
  <div
    class="dropzone"
    class:dropzone--active={isDragging}
    class:dropzone--has-files={files.length > 0}
    role="button"
    tabindex="0"
    aria-label={s.dropzoneLabel}
    ondrop={onDrop}
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    onclick={() => fileInputEl?.click()}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputEl?.click(); }}
  >
    {#if files.length === 0}
      <span class="dropzone__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 16l4-4 4 4 4-6 4 4"/>
          <rect x="2" y="3" width="20" height="18" rx="2"/>
        </svg>
      </span>
      <span class="dropzone__label">{s.dropzoneLabel}</span>
      <span class="dropzone__sub">{s.dropzoneSubLabel}</span>
      <button type="button" class="btn btn--secondary dropzone__browse" onclick={(e) => { e.stopPropagation(); fileInputEl?.click(); }}>
        {s.orBrowse}
      </button>
      {#if !isIos}
        <span class="dropzone__hint">{s.folderHint}</span>
      {/if}
    {:else}
      <ul class="file-list" onclick={(e) => { e.stopPropagation(); }}>
        {#each files as file, idx}
          <li class="file-list__item">
            <span class="file-list__name">{file.name}</span>
            <span class="file-list__size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <button
              type="button"
              class="file-list__remove"
              aria-label="Remove {file.name}"
              onclick={(e) => { e.stopPropagation(); removeFile(idx); }}
            >×</button>
          </li>
        {/each}
      </ul>
      <button type="button" class="btn btn--ghost btn--sm" onclick={(e) => { e.stopPropagation(); fileInputEl?.click(); }}>
        + {s.orBrowse}
      </button>
    {/if}
  </div>

  <input
    bind:this={fileInputEl}
    type="file"
    accept=".heic,.heif,image/heic,image/heif"
    multiple
    class="sr-only"
    aria-hidden="true"
    onchange={onFileInputChange}
  />

  <!-- Settings -->
  {#if format === 'jpg'}
    <fieldset class="settings-group">
      <legend class="settings-label">{s.qualityLabel}</legend>
      <div class="pill-group" role="radiogroup">
        {#each [['high', s.qualityHigh] as const, ['mid', s.qualityMid] as const, ['low', s.qualityLow] as const] as [val, label]}
          <label class="pill" class:pill--active={quality === val}>
            <input type="radio" name="quality" value={val} bind:group={quality} class="sr-only" />
            {label}
          </label>
        {/each}
      </div>
    </fieldset>
  {/if}

  <fieldset class="settings-group">
    <legend class="settings-label">{s.resizeLabel}</legend>
    <div class="pill-group" role="radiogroup">
      {#each [['original', s.resizeOriginal] as const, ['4k', s.resize4k] as const, ['1080', s.resize1080] as const] as [val, label]}
        <label class="pill" class:pill--active={resize === val}>
          <input type="radio" name="resize" value={val} bind:group={resize} class="sr-only" />
          {label}
        </label>
      {/each}
    </div>
  </fieldset>

  <!-- Advanced (EXIF) -->
  <details class="advanced">
    <summary class="advanced__toggle">{s.advancedToggle}</summary>
    <div class="advanced__body">
      <fieldset class="settings-group">
        <legend class="settings-label">{s.exifLabel}</legend>
        <div class="pill-group" role="radiogroup">
          {#each [['standard', s.exifStandard] as const, ['all', s.exifAll] as const, ['none', s.exifNone] as const] as [val, label]}
            <label class="pill" class:pill--active={exifMode === val}>
              <input type="radio" name="exif" value={val} bind:group={exifMode} class="sr-only" />
              {label}
            </label>
          {/each}
        </div>
        <p class="settings-hint">{s.exifHint}</p>
      </fieldset>
    </div>
  </details>

  <!-- Convert button (sticky on mobile) -->
  <div class="convert-bar">
    <button
      type="button"
      class="btn btn--primary btn--convert"
      disabled={files.length === 0 || isConverting}
      onclick={convert}
    >
      {#if isConverting}
        <span class="spinner" aria-hidden="true"></span>
        {s.converting}
      {:else}
        {s.convertBtn} {#if files.length > 0}({files.length}){/if}
      {/if}
    </button>
    {#if (hasResults || isConverting) && files.length > 0}
      <button type="button" class="btn btn--ghost btn--sm" onclick={reset}>Reset</button>
    {/if}
  </div>

  <!-- Results -->
  {#if hasResults}
    <div class="results" aria-live="polite">
      <p class="results__count">{s.resultCount.replace('{count}', String(successCount))}</p>
      <ul class="result-list">
        {#each results as item}
          <li class="result-list__item" class:result-list__item--error={item.kind === 'error'}>
            {#if item.kind === 'result'}
              <span class="result-list__name">{item.filename}</span>
              <span class="result-list__size">{(item.bytes.byteLength / 1024).toFixed(0)} KB</span>
              <span class="result-list__status">{s.statusDone}</span>
              <button type="button" class="btn btn--ghost btn--sm" onclick={() => downloadResult(item)}>
                {s.downloadFile}
              </button>
            {:else}
              <span class="result-list__name">{item.originalName}</span>
              <span class="result-list__error">{s.statusError}: {item.message}</span>
            {/if}
          </li>
        {/each}
      </ul>
      {#if successCount > 1}
        <div class="results__actions">
          <button type="button" class="btn btn--primary" onclick={downloadZip}>
            {s.downloadZip}
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .heic-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }

  .privacy-badge {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success, #6b7c3c);
    flex-shrink: 0;
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    background: color-mix(in oklch, var(--color-text) 4%, transparent);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--r-md);
  }

  .banner {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--r-md);
    font-size: var(--text-sm);
    border: 1px solid var(--color-border);
  }

  .banner--info {
    background: color-mix(in oklch, var(--color-text) 3%, transparent);
  }

  /* ── Dropzone ─────────────────────────────────────────────── */
  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-4);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-lg);
    background: color-mix(in oklch, var(--color-text) 2%, transparent);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out),
                background var(--dur-fast) var(--ease-out);
    min-height: 12rem;
    text-align: center;
  }

  .dropzone--active {
    border-color: var(--color-accent);
    background: color-mix(in oklch, var(--color-accent) 6%, transparent);
  }

  .dropzone--has-files {
    align-items: flex-start;
    padding: var(--space-4);
    min-height: auto;
    cursor: default;
  }

  .dropzone__icon {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .dropzone__label {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--color-text);
  }

  .dropzone__sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .dropzone__hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    opacity: 0.7;
  }

  .dropzone__browse {
    margin-top: var(--space-1);
  }

  /* ── File list ─────────────────────────────────────────────── */
  .file-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .file-list__item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
    background: color-mix(in oklch, var(--color-text) 4%, transparent);
    border-radius: var(--r-md);
  }

  .file-list__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--color-text);
    font-family: var(--font-mono);
  }

  .file-list__size {
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .file-list__remove {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: var(--text-base);
    padding: 0 var(--space-1);
    line-height: 1;
    flex-shrink: 0;
    transition: color var(--dur-fast) var(--ease-out);
  }

  .file-list__remove:hover {
    color: var(--color-error, #8b3a2c);
  }

  /* ── Settings ─────────────────────────────────────────────── */
  .settings-group {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .settings-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .settings-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
    opacity: 0.8;
  }

  .pill-group {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-full);
    font-size: var(--text-sm);
    cursor: pointer;
    color: var(--color-text-muted);
    background: transparent;
    transition: all var(--dur-fast) var(--ease-out);
    user-select: none;
  }

  .pill:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  .pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  /* ── Advanced ─────────────────────────────────────────────── */
  .advanced {
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    overflow: hidden;
  }

  .advanced__toggle {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: color var(--dur-fast) var(--ease-out);
  }

  .advanced__toggle:hover {
    color: var(--color-text);
  }

  .advanced__toggle::marker,
  .advanced__toggle::-webkit-details-marker {
    display: none;
  }

  .advanced__toggle::before {
    content: '▸';
    transition: transform var(--dur-fast) var(--ease-out);
  }

  details[open] .advanced__toggle::before {
    transform: rotate(90deg);
  }

  .advanced__body {
    padding: var(--space-4);
    border-top: 1px solid var(--color-border);
    background: color-mix(in oklch, var(--color-text) 2%, transparent);
  }

  /* ── Convert bar (sticky mobile) ─────────────────────────── */
  .convert-bar {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    position: sticky;
    bottom: max(var(--space-4), env(safe-area-inset-bottom));
    padding: var(--space-3) 0;
    background: var(--color-bg);
    z-index: 10;
  }

  /* ── Buttons ──────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--r-md);
    font-size: var(--text-sm);
    font-weight: 500;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--dur-fast) var(--ease-out);
    white-space: nowrap;
  }

  .btn--primary {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  .btn--primary:hover:not(:disabled) {
    opacity: 0.85;
  }

  .btn--primary:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .btn--secondary {
    background: transparent;
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .btn--secondary:hover {
    border-color: var(--color-text);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-text-muted);
    border-color: transparent;
    padding-inline: var(--space-2);
  }

  .btn--ghost:hover {
    color: var(--color-text);
    background: color-mix(in oklch, var(--color-text) 6%, transparent);
  }

  .btn--sm {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-3);
  }

  .btn--convert {
    flex: 1;
    justify-content: center;
    padding: var(--space-3) var(--space-6);
    font-size: var(--text-base);
  }

  /* ── Spinner ──────────────────────────────────────────────── */
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid color-mix(in oklch, currentColor 30%, transparent);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; opacity: 0.6; }
  }

  /* ── Results ──────────────────────────────────────────────── */
  .results {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .results__count {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    margin: 0;
  }

  .result-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .result-list__item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font-size: var(--text-sm);
  }

  .result-list__item--error {
    border-color: color-mix(in oklch, var(--color-error, #8b3a2c) 40%, transparent);
    background: color-mix(in oklch, var(--color-error, #8b3a2c) 4%, transparent);
  }

  .result-list__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    font-family: var(--font-mono);
    color: var(--color-text);
  }

  .result-list__size {
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  .result-list__status {
    color: var(--color-success, #6b7c3c);
    font-size: var(--text-xs);
    flex-shrink: 0;
  }

  .result-list__error {
    color: var(--color-error, #8b3a2c);
    font-size: var(--text-xs);
    flex: 1;
  }

  .results__actions {
    display: flex;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }

  /* ── Utilities ────────────────────────────────────────────── */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
