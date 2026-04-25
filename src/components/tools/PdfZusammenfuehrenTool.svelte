<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    isValidPdfMagic,
    formatFileSize,
    deriveOutputFilename,
    totalBytes,
  } from '../../lib/tools/pdf-merge-utils';

  interface Props {
    config: FormatterConfig;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { config: _config }: Props = $props();

  type Entry = {
    id: string;
    name: string;
    sizeBytes: number;
    bytes: Uint8Array;
    error?: string;
  };

  type Phase = 'idle' | 'merging' | 'done' | 'error';

  // $state.raw — entries hold Uint8Array buffers up to many MB.
  // Default $state would proxy-walk every byte on each access (see
  // CONVENTIONS.md §Performance-Mandate 2). Reassignments still trigger
  // reactivity because the array reference changes.
  let entries = $state.raw<Entry[]>([]);
  let dragging = $state<boolean>(false);
  let stripMetadata = $state<boolean>(true);
  let phase = $state<Phase>('idle');
  let statusMessage = $state<string>('');
  let downloadUrl = $state<string | null>(null);
  let downloadName = $state<string>('zusammengefuehrt.pdf');
  let downloadSize = $state<number>(0);

  let nextId = 0;
  function makeId(): string {
    nextId += 1;
    return `e${nextId}`;
  }

  const validEntries = $derived(entries.filter((e) => !e.error));
  const hasInvalidEntries = $derived(entries.some((e) => !!e.error));
  const totalSize = $derived(totalBytes(entries.map((e) => e.sizeBytes)));
  const showSizeWarning = $derived(totalSize > 100 * 1024 * 1024);
  const canMerge = $derived(validEntries.length >= 2 && phase !== 'merging');

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    const newEntries: Entry[] = [];
    for (const file of list) {
      try {
        const buf = new Uint8Array(await file.arrayBuffer());
        if (!isValidPdfMagic(buf)) {
          newEntries.push({
            id: makeId(),
            name: file.name,
            sizeBytes: file.size,
            bytes: new Uint8Array(0),
            error: 'Keine gültige PDF-Datei (fehlender %PDF-Header)',
          });
          continue;
        }
        newEntries.push({
          id: makeId(),
          name: file.name,
          sizeBytes: file.size,
          bytes: buf,
        });
      } catch {
        newEntries.push({
          id: makeId(),
          name: file.name,
          sizeBytes: file.size,
          bytes: new Uint8Array(0),
          error: 'Datei konnte nicht gelesen werden',
        });
      }
    }
    entries = [...entries, ...newEntries];
    resetOutput();
  }

  function resetOutput() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = null;
    }
    phase = 'idle';
    statusMessage = '';
    downloadSize = 0;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    if (e.dataTransfer?.files) void handleFiles(e.dataTransfer.files);
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
    if (target.files) void handleFiles(target.files);
    // Reset input so the same file can be re-picked after a remove.
    target.value = '';
  }

  function moveEntry(id: string, delta: -1 | 1) {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const next = idx + delta;
    if (next < 0 || next >= entries.length) return;
    const copy = entries.slice();
    const tmp = copy[idx]!;
    copy[idx] = copy[next]!;
    copy[next] = tmp;
    entries = copy;
    resetOutput();
  }

  function removeEntry(id: string) {
    entries = entries.filter((e) => e.id !== id);
    resetOutput();
  }

  function clearAll() {
    entries = [];
    resetOutput();
  }

  async function mergePdfs() {
    if (!canMerge) return;
    phase = 'merging';
    statusMessage = 'Lädt PDF-Bibliothek …';
    try {
      // Lazy import per Performance-Mandate §9.1 — avoid 1 MB pdf-lib chunk
      // in the route bundle for visitors who never click „Zusammenführen".
      const { PDFDocument } = await import('pdf-lib');
      statusMessage = 'Führt PDFs zusammen …';
      const dest = await PDFDocument.create();
      let copiedAny = false;
      const skipped: string[] = [];
      for (const entry of validEntries) {
        try {
          const src = await PDFDocument.load(entry.bytes);
          const indices = src.getPageIndices();
          if (indices.length === 0) {
            skipped.push(`${entry.name} (0 Seiten)`);
            continue;
          }
          const pages = await dest.copyPages(src, indices);
          for (const page of pages) dest.addPage(page);
          copiedAny = true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (/encrypt|password/i.test(msg)) {
            skipped.push(`${entry.name} (passwortgeschützt)`);
          } else {
            skipped.push(`${entry.name} (beschädigt)`);
          }
        }
      }
      if (!copiedAny) {
        phase = 'error';
        statusMessage =
          'Keine Datei konnte gelesen werden. Bitte gültige, unverschlüsselte PDFs auswählen.';
        return;
      }
      if (stripMetadata) {
        dest.setAuthor('');
        dest.setTitle('');
        dest.setSubject('');
        dest.setKeywords([]);
        dest.setProducer('');
        dest.setCreator('');
      }
      const bytes = await dest.save();
      // Re-wrap in a fresh Uint8Array to satisfy the Blob constructor's
      // BufferSource overload across all browsers (some environments only
      // accept Uint8Array, not the wider Uint8Array | ArrayBuffer type).
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      downloadUrl = URL.createObjectURL(blob);
      downloadName = deriveOutputFilename(validEntries[0]?.name);
      downloadSize = blob.size;
      phase = 'done';
      statusMessage =
        skipped.length > 0
          ? `Fertig. Übersprungen: ${skipped.join(', ')}.`
          : 'Fertig. Klicke auf „Herunterladen“.';
    } catch (err) {
      phase = 'error';
      statusMessage = err instanceof Error ? err.message : 'Unbekannter Fehler beim Zusammenführen';
    }
  }
</script>

<div class="pdfm" data-testid="pdf-zusammenfuehren">
  <label
    class="pdfm__dropzone"
    class:pdfm__dropzone--dragging={dragging}
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
    data-testid="pdfm-dropzone"
  >
    <input
      type="file"
      accept="application/pdf,.pdf"
      multiple
      class="pdfm__input"
      onchange={onPick}
      aria-label="PDF-Dateien auswählen"
      data-testid="pdfm-input"
    />
    <span class="pdfm__dz-title">PDFs hierher ziehen</span>
    <span class="pdfm__dz-sub">oder klicken · mehrere Dateien gleichzeitig möglich</span>
  </label>

  {#if entries.length > 0}
    <div class="pdfm__list-head">
      <span class="pdfm__label">{entries.length}&nbsp;Datei{entries.length === 1 ? '' : 'en'}</span>
      <button
        type="button"
        class="pdfm__ghost-btn"
        onclick={clearAll}
        data-testid="pdfm-clear-all"
      >
        Alle entfernen
      </button>
    </div>
    <ol class="pdfm__list" data-testid="pdfm-list">
      {#each entries as entry, i (entry.id)}
        <li class="pdfm__item" class:pdfm__item--error={!!entry.error}>
          <div class="pdfm__item-info">
            <span class="pdfm__item-pos" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div class="pdfm__item-meta">
              <span class="pdfm__item-name">{entry.name}</span>
              <span class="pdfm__item-sub">
                {#if entry.error}
                  <span class="pdfm__item-err">{entry.error}</span>
                {:else}
                  {formatFileSize(entry.sizeBytes)}
                {/if}
              </span>
            </div>
          </div>
          <div class="pdfm__item-actions">
            <button
              type="button"
              class="pdfm__icon-btn"
              onclick={() => moveEntry(entry.id, -1)}
              disabled={i === 0}
              aria-label="Eine Position nach oben"
              data-testid="pdfm-up-{entry.id}"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M8 3 L3 9 H6 V13 H10 V9 H13 Z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              class="pdfm__icon-btn"
              onclick={() => moveEntry(entry.id, 1)}
              disabled={i === entries.length - 1}
              aria-label="Eine Position nach unten"
              data-testid="pdfm-down-{entry.id}"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M8 13 L13 7 H10 V3 H6 V7 H3 Z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              class="pdfm__icon-btn pdfm__icon-btn--danger"
              onclick={() => removeEntry(entry.id)}
              aria-label="Datei entfernen"
              data-testid="pdfm-remove-{entry.id}"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path
                  d="M4 4 L12 12 M12 4 L4 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </li>
      {/each}
    </ol>
  {/if}

  {#if entries.length > 0}
    <label class="pdfm__option">
      <input
        type="checkbox"
        bind:checked={stripMetadata}
        class="pdfm__checkbox"
        data-testid="pdfm-strip-metadata"
      />
      <span class="pdfm__option-text">
        Metadaten bereinigen (Autor, Titel, Programm-Info entfernen)
      </span>
    </label>
  {/if}

  {#if showSizeWarning}
    <div class="pdfm__warning" role="status" data-testid="pdfm-size-warning">
      <span class="pdfm__warning-label">Hinweis</span>
      Gesamtgröße {formatFileSize(totalSize)} — auf älteren Geräten kann es etwas dauern.
    </div>
  {/if}

  {#if hasInvalidEntries}
    <div class="pdfm__warning pdfm__warning--error" role="alert" data-testid="pdfm-invalid-warning">
      <span class="pdfm__warning-label">Fehler</span>
      Eine oder mehrere Dateien sind keine gültigen PDFs und werden beim Zusammenführen übersprungen.
    </div>
  {/if}

  <div class="pdfm__actions">
    <button
      type="button"
      class="pdfm__primary-btn"
      onclick={mergePdfs}
      disabled={!canMerge}
      data-testid="pdfm-merge"
    >
      {phase === 'merging' ? 'Wird zusammengeführt …' : 'Zusammenführen'}
    </button>
    {#if validEntries.length < 2}
      <span class="pdfm__hint">Mindestens 2 PDFs auswählen</span>
    {/if}
  </div>

  {#if statusMessage}
    <div
      class="pdfm__status"
      class:pdfm__status--error={phase === 'error'}
      class:pdfm__status--done={phase === 'done'}
      role="status"
      aria-live="polite"
      data-testid="pdfm-status"
    >
      {statusMessage}
    </div>
  {/if}

  {#if phase === 'done' && downloadUrl}
    <a
      class="pdfm__download"
      href={downloadUrl}
      download={downloadName}
      data-testid="pdfm-download"
    >
      Herunterladen ({formatFileSize(downloadSize)})
    </a>
  {/if}
</div>

<style>
  .pdfm {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
  }
  .pdfm__dropzone {
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
  .pdfm__dropzone:hover {
    border-color: var(--color-text-subtle);
  }
  .pdfm__dropzone--dragging {
    border-color: var(--color-accent);
    border-style: solid;
  }
  .pdfm__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .pdfm__dz-title {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .pdfm__dz-sub {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .pdfm__list-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }
  .pdfm__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .pdfm__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pdfm__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    min-width: 0;
  }
  .pdfm__item--error {
    border-color: var(--color-error);
  }
  .pdfm__item-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
    flex: 1;
  }
  .pdfm__item-pos {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .pdfm__item-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pdfm__item-name {
    color: var(--color-text);
    font-size: var(--font-size-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pdfm__item-sub {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .pdfm__item-err {
    color: var(--color-error);
  }
  .pdfm__item-actions {
    display: flex;
    gap: var(--space-1);
    flex-shrink: 0;
  }
  .pdfm__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* Touch-target ≥44×44 — A11y mandate from Lessons-Learned */
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: var(--space-2);
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .pdfm__icon-btn:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .pdfm__icon-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pdfm__icon-btn:disabled {
    color: var(--color-text-subtle);
    cursor: not-allowed;
    opacity: 0.5;
  }
  .pdfm__icon-btn--danger:hover:not(:disabled) {
    color: var(--color-error);
    border-color: var(--color-error);
  }
  .pdfm__option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
    cursor: pointer;
  }
  .pdfm__checkbox {
    width: 1.125rem;
    height: 1.125rem;
    accent-color: var(--color-accent);
    cursor: pointer;
  }
  .pdfm__option-text {
    color: var(--color-text);
    font-size: var(--font-size-small);
  }
  .pdfm__warning {
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
  .pdfm__warning--error {
    border-left-color: var(--color-error);
    color: var(--color-text);
  }
  .pdfm__warning-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .pdfm__warning--error .pdfm__warning-label {
    color: var(--color-error);
  }
  .pdfm__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .pdfm__primary-btn {
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
  .pdfm__primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }
  .pdfm__primary-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pdfm__primary-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .pdfm__hint {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }
  .pdfm__ghost-btn {
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
  .pdfm__ghost-btn:hover {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .pdfm__ghost-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pdfm__status {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdfm__status--error {
    color: var(--color-error);
    border-color: var(--color-error);
  }
  .pdfm__status--done {
    color: var(--color-success);
    border-color: var(--color-success);
  }
  .pdfm__download {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    min-height: 2.75rem;
    padding: var(--space-3) var(--space-5);
    color: var(--color-bg);
    background: var(--color-text);
    border: 1px solid var(--color-text);
    border-radius: var(--r-md);
    font-size: var(--font-size-body);
    font-weight: 500;
    text-decoration: none;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .pdfm__download:active {
    transform: scale(0.98);
  }
  .pdfm__download:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* prefers-reduced-motion: explicit transform: none on every selector that
     uses :active scale or hover transforms. global.css zeroes transition
     duration but does NOT cancel the transform property itself — see
     Lessons-Learned from 2026-04-25 Third-Pass-Review. */
  @media (prefers-reduced-motion: reduce) {
    .pdfm__dropzone,
    .pdfm__icon-btn,
    .pdfm__primary-btn,
    .pdfm__primary-btn:active,
    .pdfm__ghost-btn,
    .pdfm__download,
    .pdfm__download:active {
      transition: none;
      transform: none;
    }
  }
</style>
