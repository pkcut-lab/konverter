<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    parsePageRanges,
    totalPagesInRanges,
    formatFileSize,
    formatRangeLabel,
    derivePerRangeFilename,
    deriveSingleOutputFilename,
    type Range,
    type PageRangesResult,
  } from '../../lib/tools/pdf-split-utils';

  interface Props {
    config: FormatterConfig;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { config: _config }: Props = $props();

  const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];

  type Loaded = {
    name: string;
    sizeBytes: number;
    bytes: Uint8Array;
    totalPages: number;
  };

  type Phase = 'idle' | 'loading' | 'ready' | 'splitting' | 'done' | 'error';

  type Output = {
    label: string;
    filename: string;
    url: string;
    sizeBytes: number;
  };

  // $state.raw — Loaded.bytes is a multi-MB Uint8Array; outputs hold blob URLs.
  // Same Performance-Mandate §9.2 reasoning as pdf-zusammenfuehren.
  let loaded = $state.raw<Loaded | null>(null);
  let outputs = $state.raw<Output[]>([]);
  let dragging = $state<boolean>(false);
  let rangeInput = $state<string>('');
  let mode = $state<'single' | 'per-range'>('single');
  let phase = $state<Phase>('idle');
  let statusMessage = $state<string>('');
  let loadError = $state<string>('');

  const parsed = $derived<PageRangesResult | null>(
    loaded && rangeInput.trim().length > 0
      ? parsePageRanges(rangeInput, loaded.totalPages)
      : null,
  );

  const ranges = $derived<Range[]>(parsed && parsed.ok ? parsed.ranges : []);
  const parseError = $derived<string>(parsed && !parsed.ok ? parsed.error : '');
  const selectedPageCount = $derived(totalPagesInRanges(ranges));
  const showSizeWarning = $derived(loaded ? loaded.sizeBytes > 100 * 1024 * 1024 : false);
  const canSplit = $derived(
    !!loaded && ranges.length > 0 && !parseError && phase !== 'splitting' && phase !== 'loading',
  );

  function isPdfMagic(bytes: Uint8Array): boolean {
    if (bytes.length < PDF_MAGIC.length) return false;
    for (let i = 0; i < PDF_MAGIC.length; i++) {
      if (bytes[i] !== PDF_MAGIC[i]) return false;
    }
    return true;
  }

  async function handleFile(file: File) {
    loadError = '';
    clearOutputs();
    phase = 'loading';
    statusMessage = 'Datei wird gelesen …';
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!isPdfMagic(bytes)) {
        loadError = 'Keine gültige PDF-Datei (fehlender %PDF-Header).';
        phase = 'error';
        statusMessage = '';
        return;
      }
      // Lazy import — same lazy-pattern as pdf-zusammenfuehren so we don't
      // ship 438 KB of pdf-lib to visitors who never click Browse.
      const { PDFDocument } = await import('pdf-lib');
      let doc;
      try {
        doc = await PDFDocument.load(bytes);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (/encrypt|password/i.test(msg)) {
          loadError =
            'Diese PDF ist passwortgeschützt. Bitte vorher in deinem PDF-Reader entsperren.';
        } else {
          loadError = 'Die PDF-Datei ist beschädigt und kann nicht verarbeitet werden.';
        }
        phase = 'error';
        statusMessage = '';
        return;
      }
      const totalPages = doc.getPageCount();
      loaded = { name: file.name, sizeBytes: file.size, bytes, totalPages };
      // Default range = the whole document, matches the "extract a single
      // page or two" use case better than an empty input.
      if (rangeInput.trim().length === 0) {
        rangeInput = totalPages === 1 ? '1' : `1-${totalPages}`;
      }
      phase = 'ready';
      statusMessage = '';
    } catch {
      loadError = 'Datei konnte nicht gelesen werden.';
      phase = 'error';
      statusMessage = '';
    }
  }

  function clearOutputs() {
    for (const o of outputs) URL.revokeObjectURL(o.url);
    outputs = [];
  }

  function reset() {
    clearOutputs();
    loaded = null;
    rangeInput = '';
    phase = 'idle';
    statusMessage = '';
    loadError = '';
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) void handleFile(file);
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();
    dragging = true;
  }
  function onDragLeave() {
    dragging = false;
  }
  function onPick(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) void handleFile(file);
    target.value = '';
  }

  async function splitPdf() {
    if (!canSplit || !loaded) return;
    clearOutputs();
    phase = 'splitting';
    statusMessage = 'Teilt PDF …';
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(loaded.bytes);
      const newOutputs: Output[] = [];

      if (mode === 'single') {
        const dest = await PDFDocument.create();
        for (const range of ranges) {
          const indices = pageIndicesForRange(range);
          const pages = await dest.copyPages(src, indices);
          for (const p of pages) dest.addPage(p);
        }
        const bytes = await dest.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        const filename = deriveSingleOutputFilename(loaded.name);
        newOutputs.push({
          label: `Auszug (${ranges.map(formatRangeLabel).join(', ')})`,
          filename,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
        });
      } else {
        for (const range of ranges) {
          const dest = await PDFDocument.create();
          const indices = pageIndicesForRange(range);
          const pages = await dest.copyPages(src, indices);
          for (const p of pages) dest.addPage(p);
          const bytes = await dest.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          const filename = derivePerRangeFilename(loaded.name, range);
          newOutputs.push({
            label: formatRangeLabel(range),
            filename,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
          });
        }
      }
      outputs = newOutputs;
      phase = 'done';
      statusMessage = `Fertig — ${newOutputs.length} Datei${newOutputs.length === 1 ? '' : 'en'} bereit.`;
    } catch (err) {
      phase = 'error';
      statusMessage = err instanceof Error ? err.message : 'Unbekannter Fehler beim Aufteilen';
    }
  }

  function pageIndicesForRange(range: Range): number[] {
    // 1-indexed → 0-indexed
    const len = range.end - range.start + 1;
    return Array.from({ length: len }, (_, i) => range.start - 1 + i);
  }
</script>

<div class="pdfs" data-testid="pdf-aufteilen">
  {#if !loaded}
    <label
      class="pdfs__dropzone"
      class:pdfs__dropzone--dragging={dragging}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      data-testid="pdfs-dropzone"
    >
      <input
        type="file"
        accept="application/pdf,.pdf"
        class="pdfs__input"
        onchange={onPick}
        aria-label="PDF-Datei auswählen"
        data-testid="pdfs-input"
      />
      <span class="pdfs__dz-title">PDF hierher ziehen</span>
      <span class="pdfs__dz-sub">oder klicken · eine Datei</span>
    </label>
  {/if}

  {#if loadError}
    <div class="pdfs__error" role="alert" data-testid="pdfs-load-error">
      <span class="pdfs__error-label">Fehler</span>
      <span>{loadError}</span>
      <button type="button" class="pdfs__ghost-btn" onclick={reset} data-testid="pdfs-reset">
        Andere Datei wählen
      </button>
    </div>
  {/if}

  {#if loaded}
    <section class="pdfs__file-summary" aria-label="Datei-Übersicht">
      <div class="pdfs__file-meta">
        <span class="pdfs__file-name" data-testid="pdfs-filename">{loaded.name}</span>
        <span class="pdfs__file-stat">
          {loaded.totalPages}&nbsp;Seite{loaded.totalPages === 1 ? '' : 'n'}
          <span class="pdfs__file-stat-sep" aria-hidden="true">·</span>
          {formatFileSize(loaded.sizeBytes)}
        </span>
      </div>
      <button type="button" class="pdfs__ghost-btn" onclick={reset} data-testid="pdfs-clear">
        Andere Datei
      </button>
    </section>

    {#if showSizeWarning}
      <div class="pdfs__warning" role="status" data-testid="pdfs-size-warning">
        <span class="pdfs__warning-label">Hinweis</span>
        Datei {formatFileSize(loaded.sizeBytes)} — auf älteren Geräten kann es etwas dauern.
      </div>
    {/if}

    <label class="pdfs__range">
      <span class="pdfs__range-label">Seitenbereiche</span>
      <input
        type="text"
        class="pdfs__range-input"
        bind:value={rangeInput}
        placeholder="z. B. 1-3, 5, 7-9"
        aria-describedby="pdfs-range-hint"
        data-testid="pdfs-range-input"
      />
      <span class="pdfs__range-hint" id="pdfs-range-hint">
        Komma-separiert · Einzelseiten oder Bereiche · 1 bis {loaded.totalPages}
      </span>
    </label>

    {#if parseError}
      <div class="pdfs__warning pdfs__warning--error" role="alert" data-testid="pdfs-parse-error">
        <span class="pdfs__warning-label">Fehler</span>
        {parseError}
      </div>
    {:else if ranges.length > 0}
      <div class="pdfs__preview" data-testid="pdfs-preview">
        <span class="pdfs__preview-count">
          {selectedPageCount}&nbsp;Seite{selectedPageCount === 1 ? '' : 'n'} ausgewählt
        </span>
        <span class="pdfs__preview-detail">
          {ranges.map(formatRangeLabel).join(', ')}
        </span>
      </div>
    {/if}

    <fieldset class="pdfs__mode">
      <legend class="pdfs__mode-legend">Ergebnis-Modus</legend>
      <label class="pdfs__mode-option" class:pdfs__mode-option--active={mode === 'single'}>
        <input
          type="radio"
          name="pdfs-mode"
          value="single"
          bind:group={mode}
          data-testid="pdfs-mode-single"
        />
        <span class="pdfs__mode-title">Eine Datei</span>
        <span class="pdfs__mode-desc">Alle ausgewählten Seiten in einer PDF.</span>
      </label>
      <label class="pdfs__mode-option" class:pdfs__mode-option--active={mode === 'per-range'}>
        <input
          type="radio"
          name="pdfs-mode"
          value="per-range"
          bind:group={mode}
          data-testid="pdfs-mode-per-range"
        />
        <span class="pdfs__mode-title">Pro Bereich</span>
        <span class="pdfs__mode-desc">Pro Komma-Eintrag eine separate PDF.</span>
      </label>
    </fieldset>

    <div class="pdfs__actions">
      <button
        type="button"
        class="pdfs__primary-btn"
        onclick={splitPdf}
        disabled={!canSplit}
        data-testid="pdfs-split"
      >
        {phase === 'splitting' ? 'Wird aufgeteilt …' : 'Aufteilen'}
      </button>
    </div>
  {/if}

  {#if statusMessage}
    <div
      class="pdfs__status"
      class:pdfs__status--error={phase === 'error'}
      class:pdfs__status--done={phase === 'done'}
      role="status"
      aria-live="polite"
      data-testid="pdfs-status"
    >
      {statusMessage}
    </div>
  {/if}

  {#if outputs.length > 0}
    <ol class="pdfs__downloads" data-testid="pdfs-downloads">
      {#each outputs as out (out.url)}
        <li class="pdfs__dl-item">
          <span class="pdfs__dl-label">{out.label}</span>
          <span class="pdfs__dl-size">{formatFileSize(out.sizeBytes)}</span>
          <a class="pdfs__dl-link" href={out.url} download={out.filename}>Herunterladen</a>
        </li>
      {/each}
    </ol>
  {/if}
</div>

<style>
  .pdfs {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
  }
  .pdfs__dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 12rem;
    padding: var(--space-6);
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
    text-align: center;
  }
  .pdfs__dropzone:hover {
    border-color: var(--color-text-subtle);
  }
  .pdfs__dropzone--dragging {
    border-color: var(--color-accent);
    border-style: solid;
  }
  .pdfs__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .pdfs__dz-title {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .pdfs__dz-sub {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }

  .pdfs__file-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdfs__file-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pdfs__file-name {
    color: var(--color-text);
    font-size: var(--font-size-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pdfs__file-stat {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .pdfs__file-stat-sep {
    margin: 0 var(--space-1);
  }

  .pdfs__range {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pdfs__range-label {
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
  }
  .pdfs__range-input {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    min-height: 2.75rem;
  }
  .pdfs__range-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .pdfs__range-hint {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }

  .pdfs__preview {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdfs__preview-count {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .pdfs__preview-detail {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }

  .pdfs__mode {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    border: 0;
  }
  @media (min-width: 32rem) {
    .pdfs__mode {
      grid-template-columns: 1fr 1fr;
    }
  }
  .pdfs__mode-legend {
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
    margin-bottom: var(--space-2);
    padding: 0;
  }
  .pdfs__mode-option {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
    min-height: 2.75rem;
  }
  .pdfs__mode-option:hover {
    border-color: var(--color-text-subtle);
  }
  .pdfs__mode-option--active {
    border-color: var(--color-accent);
  }
  .pdfs__mode-option input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }
  .pdfs__mode-option:has(input:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pdfs__mode-title {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .pdfs__mode-desc {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }

  .pdfs__warning {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--color-text-subtle);
    border-radius: var(--r-sm);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }
  .pdfs__warning--error {
    border-left-color: var(--color-error);
    color: var(--color-text);
  }
  .pdfs__warning-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .pdfs__warning--error .pdfs__warning-label {
    color: var(--color-error);
  }

  .pdfs__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-error);
    border-radius: var(--r-sm);
    color: var(--color-text);
    font-size: var(--font-size-small);
  }
  .pdfs__error-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-error);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .pdfs__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .pdfs__primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: var(--space-3) var(--space-5);
    color: var(--color-bg);
    background: var(--color-text);
    border: 1px solid var(--color-text);
    border-radius: var(--r-md);
    font-size: var(--font-size-body);
    font-weight: 500;
    cursor: pointer;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .pdfs__primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }
  .pdfs__primary-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pdfs__primary-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .pdfs__ghost-btn {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.05em;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .pdfs__ghost-btn:hover {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .pdfs__ghost-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .pdfs__status {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdfs__status--error {
    color: var(--color-error);
    border-color: var(--color-error);
  }
  .pdfs__status--done {
    color: var(--color-success);
    border-color: var(--color-success);
  }

  .pdfs__downloads {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pdfs__dl-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdfs__dl-label {
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    font-variant-numeric: tabular-nums;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pdfs__dl-size {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }
  .pdfs__dl-link {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: var(--space-1) var(--space-3);
    color: var(--color-bg);
    background: var(--color-text);
    border: 1px solid var(--color-text);
    border-radius: var(--r-sm);
    font-size: var(--font-size-small);
    font-weight: 500;
    text-decoration: none;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .pdfs__dl-link:active {
    transform: scale(0.98);
  }
  .pdfs__dl-link:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* prefers-reduced-motion: kill both transition AND transform per
     Lessons-Learned (global.css zeroes duration but keeps property). */
  @media (prefers-reduced-motion: reduce) {
    .pdfs__dropzone,
    .pdfs__primary-btn,
    .pdfs__primary-btn:active,
    .pdfs__ghost-btn,
    .pdfs__mode-option,
    .pdfs__dl-link,
    .pdfs__dl-link:active {
      transition: none;
      transform: none;
    }
  }
</style>
