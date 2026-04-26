<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { dispatchToolUsed } from '../../lib/tracking';
  import {
    deriveJpgFilename,
    deriveZipFilename,
    estimateJpgSizeBytes,
    formatFileSize,
    dpiToScale,
    dpiLabel,
    buildZipStore,
    DPI_OPTIONS,
    JPEG_BACKGROUND,
    type DpiOption,
  } from '../../lib/tools/pdf-zu-jpg-utils';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();

  const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

  type Phase =
    | 'idle'
    | 'loading'
    | 'ready'
    | 'rendering'
    | 'done'
    | 'error';

  type PageThumb = {
    pageNum: number;
    // Thumbnail canvas URL (small) for the grid
    thumbUrl: string;
    // Estimated output size at current DPI
    estimatedBytes: number;
    selected: boolean;
  };

  type Output = {
    pageNum: number;
    filename: string;
    url: string;
    sizeBytes: number;
  };

  // $state.raw — thumbUrls and output data are Blob-URL strings or heavy Blobs.
  // Per Performance-Mandate §9.3: these need no deep-reactive proxy.
  let loaded = $state.raw<{ name: string; sizeBytes: number; bytes: Uint8Array; totalPages: number } | null>(null);
  let thumbs = $state.raw<PageThumb[]>([]);
  let outputs = $state.raw<Output[]>([]);

  let dragging = $state<boolean>(false);
  let phase = $state<Phase>('idle');
  let loadError = $state<string>('');
  let statusMessage = $state<string>('');
  let renderProgress = $state<number>(0); // 0–100
  let selectedDpi = $state<DpiOption>(150);
  let password = $state<string>('');
  let showPasswordPrompt = $state<boolean>(false);
  let pendingBytes = $state.raw<Uint8Array | null>(null);
  let returnFocus = $state.raw<HTMLElement | null>(null);

  // Focus password input when dialog opens; store return-focus target (a11y B5 + N2)
  $effect(() => {
    if (showPasswordPrompt) {
      returnFocus = document.activeElement as HTMLElement | null;
      Promise.resolve().then(() => {
        (document.getElementById('pzj-password-input') as HTMLInputElement | null)?.focus();
      });
    }
  });

  const selectedCount = $derived(thumbs.filter((t) => t.selected).length);
  const canRender = $derived(
    !!loaded && selectedCount > 0 && phase !== 'rendering' && phase !== 'loading',
  );
  const totalEstimatedBytes = $derived(
    thumbs
      .filter((t) => t.selected)
      .reduce((acc, t) => acc + estimateJpgSizeBytes(
        Math.round((loaded ? 595 : 595) * dpiToScale(selectedDpi)),
        Math.round((loaded ? 842 : 842) * dpiToScale(selectedDpi)),
      ), 0),
  );

  function isPdfMagic(bytes: Uint8Array): boolean {
    if (bytes.length < PDF_MAGIC.length) return false;
    for (let i = 0; i < PDF_MAGIC.length; i++) {
      if (bytes[i] !== PDF_MAGIC[i]) return false;
    }
    return true;
  }

  function clearOutputs() {
    for (const o of outputs) URL.revokeObjectURL(o.url);
    outputs = [];
  }

  function clearThumbs() {
    for (const t of thumbs) URL.revokeObjectURL(t.thumbUrl);
    thumbs = [];
  }

  function reset() {
    clearOutputs();
    clearThumbs();
    loaded = null;
    phase = 'idle';
    statusMessage = '';
    loadError = '';
    renderProgress = 0;
    showPasswordPrompt = false;
    pendingBytes = null;
    password = '';
    const target = returnFocus;
    returnFocus = null;
    target?.focus();
  }

  async function loadPdf(bytes: Uint8Array, passwordAttempt?: string) {
    loadError = '';
    clearOutputs();
    clearThumbs();
    phase = 'loading';
    statusMessage = 'PDF wird geladen …';

    // Lazy-load PDF.js — ~900 KB WASM + JS; not included unless this runs.
    // Performance-Mandate §9.2.
    let pdfjsLib: typeof import('pdfjs-dist');
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).href;
    } catch {
      loadError = 'PDF.js konnte nicht geladen werden. Bitte Seite neu laden.';
      phase = 'error';
      statusMessage = '';
      return;
    }

    let pdfDoc: Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise'] extends Promise<infer T> ? T : never;
    try {
      const loadTask = pdfjsLib.getDocument(
        passwordAttempt !== undefined
          ? { data: bytes, password: passwordAttempt }
          : { data: bytes },
      );
      pdfDoc = await loadTask.promise;
    } catch (err) {
      const name = err instanceof Error ? (err as Error & { name?: string }).name ?? '' : '';
      const msg = err instanceof Error ? err.message : '';
      if (name === 'PasswordException' || /password/i.test(msg)) {
        pendingBytes = bytes;
        showPasswordPrompt = true;
        phase = 'idle';
        statusMessage = '';
        loadError = passwordAttempt !== undefined ? 'Falsches Passwort. Bitte erneut versuchen.' : '';
      } else if (name === 'InvalidPDFException' || /invalid/i.test(msg)) {
        loadError = 'Diese PDF-Datei ist beschädigt oder ungültig.';
        phase = 'error';
        statusMessage = '';
      } else {
        loadError = 'Die PDF-Datei konnte nicht geöffnet werden. Bitte Datei prüfen.';
        phase = 'error';
        statusMessage = '';
      }
      return;
    }

    const totalPages = pdfDoc.numPages;
    if (loaded === null || loaded.bytes !== bytes) {
      // only update name/bytes when a new file is loaded, not on password re-entry
    }
    const fileName = loaded?.name ?? 'dokument.pdf';
    const fileSizeBytes = loaded?.sizeBytes ?? bytes.length;
    loaded = { name: fileName, sizeBytes: fileSizeBytes, bytes, totalPages };

    showPasswordPrompt = false;
    pendingBytes = null;
    password = '';

    // Render thumbnails (low-res, scale 0.2) for the page grid
    statusMessage = `Vorschauen werden erstellt … (${totalPages} Seiten)`;
    const thumbScale = 0.2;
    const newThumbs: PageThumb[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: thumbScale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      const thumbUrl = canvas.toDataURL('image/jpeg', 0.7);
      const estW = Math.round(viewport.width / thumbScale * dpiToScale(selectedDpi));
      const estH = Math.round(viewport.height / thumbScale * dpiToScale(selectedDpi));
      newThumbs.push({
        pageNum,
        thumbUrl,
        estimatedBytes: estimateJpgSizeBytes(estW, estH),
        selected: true,
      });
    }

    thumbs = newThumbs;
    phase = 'ready';
    statusMessage = '';
  }

  async function handleFile(file: File) {
    loadError = '';
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
      // Store name+size before loadPdf sets loaded (loadPdf reuses name from loaded)
      loaded = { name: file.name, sizeBytes: file.size, bytes, totalPages: 0 };
      await loadPdf(bytes);
    } catch {
      loadError = 'Datei konnte nicht gelesen werden.';
      phase = 'error';
      statusMessage = '';
    }
  }

  async function submitPassword() {
    if (!pendingBytes) return;
    await loadPdf(pendingBytes, password);
  }

  function togglePage(pageNum: number) {
    thumbs = thumbs.map((t) =>
      t.pageNum === pageNum ? { ...t, selected: !t.selected } : t,
    );
  }

  function selectAll() {
    thumbs = thumbs.map((t) => ({ ...t, selected: true }));
  }

  function deselectAll() {
    thumbs = thumbs.map((t) => ({ ...t, selected: false }));
  }

  async function renderPages() {
    if (!canRender || !loaded) return;
    clearOutputs();
    phase = 'rendering';
    renderProgress = 0;
    statusMessage = 'Konvertiert …';

    let pdfjsLib: typeof import('pdfjs-dist');
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).href;
    } catch {
      loadError = 'PDF.js konnte nicht geladen werden.';
      phase = 'error';
      statusMessage = '';
      return;
    }

    let pdfDoc: Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise'] extends Promise<infer T> ? T : never;
    try {
      pdfDoc = await pdfjsLib.getDocument({ data: loaded.bytes }).promise;
    } catch {
      loadError = 'PDF konnte nicht erneut geöffnet werden.';
      phase = 'error';
      statusMessage = '';
      return;
    }

    const selectedPages = thumbs.filter((t) => t.selected);
    const scale = dpiToScale(selectedDpi);
    const newOutputs: Output[] = [];
    const totalPages = loaded.totalPages;

    for (let i = 0; i < selectedPages.length; i++) {
      const thumb = selectedPages[i]!;
      const page = await pdfDoc.getPage(thumb.pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // White background — JPEG has no alpha channel
        ctx.fillStyle = JPEG_BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
      });
      const filename = deriveJpgFilename(loaded.name, thumb.pageNum, totalPages);
      newOutputs.push({
        pageNum: thumb.pageNum,
        filename,
        url: URL.createObjectURL(blob),
        sizeBytes: blob.size,
      });
      renderProgress = Math.round(((i + 1) / selectedPages.length) * 100);
      statusMessage = `Seite ${thumb.pageNum} von ${totalPages} konvertiert …`;
    }

    outputs = newOutputs;
    phase = 'done';
    statusMessage = `Fertig — ${newOutputs.length} Bild${newOutputs.length === 1 ? '' : 'er'} bereit.`;
    dispatchToolUsed({ slug: config.id, category: config.categoryId ?? 'document', locale: 'de' });
  }

  async function downloadAll() {
    if (outputs.length === 0) return;
    if (outputs.length === 1) {
      // Single file: direct download
      const a = document.createElement('a');
      a.href = outputs[0]!.url;
      a.download = outputs[0]!.filename;
      a.click();
      return;
    }
    // Multiple files: assemble ZIP in-browser and trigger single download
    statusMessage = 'ZIP wird erstellt …';
    const files: { name: string; data: Uint8Array }[] = [];
    for (const out of outputs) {
      const resp = await fetch(out.url);
      const buf = await resp.arrayBuffer();
      files.push({ name: out.filename, data: new Uint8Array(buf) });
    }
    const zipBytes = buildZipStore(files);
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = deriveZipFilename(loaded?.name);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    statusMessage = `Fertig — ${outputs.length} Bilder als ZIP.`;
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
</script>

<div class="pzj" data-testid="pdf-zu-jpg">
  {#if !loaded || phase === 'idle'}
    <label
      class="pzj__dropzone"
      class:pzj__dropzone--dragging={dragging}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      data-testid="pzj-dropzone"
    >
      <input
        type="file"
        accept="application/pdf,.pdf"
        class="pzj__input"
        onchange={onPick}
        aria-label="PDF-Datei auswählen"
        data-testid="pzj-input"
      />
      <span class="pzj__dz-title">PDF hierher ziehen</span>
      <span class="pzj__dz-sub">oder klicken · eine Datei · max. Gerätespeicher</span>
    </label>
  {/if}

  {#if showPasswordPrompt}
    <div
      class="pzj__password"
      role="dialog"
      aria-modal="true"
      aria-label="Passwort eingeben"
      onkeydown={(e) => { if (e.key === 'Escape') reset(); }}
      data-testid="pzj-password-prompt"
    >
      <p class="pzj__password-hint">Diese PDF ist passwortgeschützt.</p>
      {#if loadError}
        <p class="pzj__password-error" role="alert">{loadError}</p>
      {/if}
      <label class="pzj__password-label">
        Passwort
        <input
          type="password"
          id="pzj-password-input"
          class="pzj__password-input"
          bind:value={password}
          onkeydown={(e) => { if (e.key === 'Enter') void submitPassword(); }}
          data-testid="pzj-password-input"
        />
      </label>
      <div class="pzj__password-actions">
        <button
          type="button"
          class="pzj__primary-btn"
          onclick={submitPassword}
          data-testid="pzj-password-submit"
        >
          Entsperren
        </button>
        <button type="button" class="pzj__ghost-btn" onclick={reset} data-testid="pzj-password-cancel">
          Abbrechen
        </button>
      </div>
    </div>
  {/if}

  {#if loadError && !showPasswordPrompt}
    <div class="pzj__error" role="alert" data-testid="pzj-load-error">
      <span class="pzj__error-label">Fehler</span>
      <span>{loadError}</span>
      <button type="button" class="pzj__ghost-btn" onclick={reset} data-testid="pzj-reset">
        Andere Datei wählen
      </button>
    </div>
  {/if}

  {#if loaded && loaded.totalPages > 0 && phase !== 'idle'}
    <section class="pzj__file-summary" aria-label="Datei-Übersicht">
      <div class="pzj__file-meta">
        <span class="pzj__file-name" data-testid="pzj-filename">{loaded.name}</span>
        <span class="pzj__file-stat">
          {loaded.totalPages}&nbsp;Seite{loaded.totalPages === 1 ? '' : 'n'}
          <span class="pzj__file-stat-sep" aria-hidden="true">·</span>
          {formatFileSize(loaded.sizeBytes)}
        </span>
      </div>
      <button type="button" class="pzj__ghost-btn" onclick={reset} data-testid="pzj-clear">
        Andere Datei
      </button>
    </section>

    <!-- DPI selector -->
    <fieldset class="pzj__dpi" data-testid="pzj-dpi-selector">
      <legend class="pzj__dpi-legend">Auflösung</legend>
      <div class="pzj__dpi-options">
        {#each DPI_OPTIONS as dpi (dpi)}
          <label class="pzj__dpi-option" class:pzj__dpi-option--active={selectedDpi === dpi}>
            <input
              type="radio"
              name="pzj-dpi"
              value={dpi}
              bind:group={selectedDpi}
              data-testid={`pzj-dpi-${dpi}`}
            />
            <span class="pzj__dpi-label">{dpiLabel(dpi)}</span>
          </label>
        {/each}
      </div>
    </fieldset>

    <!-- Page selection grid -->
    {#if thumbs.length > 0}
      <section class="pzj__pages" aria-label="Seiten auswählen" data-testid="pzj-pages">
        <div class="pzj__pages-header">
          <span class="pzj__pages-title">
            {selectedCount}&nbsp;von&nbsp;{thumbs.length}&nbsp;Seite{thumbs.length === 1 ? '' : 'n'} ausgewählt
          </span>
          <div class="pzj__pages-actions">
            <button type="button" class="pzj__ghost-btn" onclick={selectAll} data-testid="pzj-select-all">
              Alle
            </button>
            <button type="button" class="pzj__ghost-btn" onclick={deselectAll} data-testid="pzj-deselect-all">
              Keine
            </button>
          </div>
        </div>
        <div class="pzj__grid" role="group" aria-label="Seiten-Vorschauen">
          {#each thumbs as thumb (thumb.pageNum)}
            <label
              class="pzj__thumb"
              class:pzj__thumb--selected={thumb.selected}
              data-testid={`pzj-thumb-${thumb.pageNum}`}
            >
              <input
                type="checkbox"
                class="pzj__thumb-check"
                checked={thumb.selected}
                onchange={() => togglePage(thumb.pageNum)}
                aria-label={`Seite ${thumb.pageNum}`}
              />
              <img
                src={thumb.thumbUrl}
                alt={`Vorschau Seite ${thumb.pageNum}`}
                class="pzj__thumb-img"
                loading="lazy"
              />
              <span class="pzj__thumb-num">{thumb.pageNum}</span>
              {#if thumb.selected}
                <span class="pzj__thumb-check-mark" aria-hidden="true"></span>
              {/if}
            </label>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Actions -->
    <div class="pzj__actions">
      <button
        type="button"
        class="pzj__primary-btn"
        onclick={renderPages}
        disabled={!canRender}
        data-testid="pzj-convert"
      >
        {phase === 'rendering' ? `Konvertiert … ${renderProgress}%` : `${selectedCount} Seite${selectedCount === 1 ? '' : 'n'} konvertieren`}
      </button>
    </div>
  {/if}

  {#if statusMessage}
    <div
      class="pzj__status"
      class:pzj__status--done={phase === 'done'}
      class:pzj__status--error={phase === 'error'}
      role="status"
      aria-live="polite"
      data-testid="pzj-status"
    >
      {statusMessage}
    </div>
  {/if}

  {#if phase === 'rendering'}
    <div class="pzj__progress" role="progressbar" aria-valuenow={renderProgress} aria-valuemin={0} aria-valuemax={100} data-testid="pzj-progress">
      <div class="pzj__progress-bar" style="width: {renderProgress}%"></div>
    </div>
  {/if}

  {#if outputs.length > 0}
    <section class="pzj__outputs" aria-label="Konvertierte Bilder" data-testid="pzj-outputs">
      <div class="pzj__outputs-header">
        <span class="pzj__outputs-count">{outputs.length}&nbsp;Bild{outputs.length === 1 ? '' : 'er'} bereit</span>
        {#if outputs.length > 1}
          <button
            type="button"
            class="pzj__primary-btn pzj__primary-btn--sm"
            onclick={downloadAll}
            data-testid="pzj-download-all"
          >
            Alle als ZIP
          </button>
        {/if}
      </div>
      <ol class="pzj__dl-list" data-testid="pzj-dl-list">
        {#each outputs as out (out.url)}
          <li class="pzj__dl-item">
            <span class="pzj__dl-label">Seite&nbsp;{out.pageNum}</span>
            <span class="pzj__dl-size">{formatFileSize(out.sizeBytes)}</span>
            <a class="pzj__dl-link" href={out.url} download={out.filename} aria-label={`Seite ${out.pageNum} herunterladen`}>
              Herunterladen
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</div>

<style>
  .pzj {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
  }

  /* Dropzone */
  .pzj__dropzone {
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
  .pzj__dropzone:hover {
    border-color: var(--color-text-subtle);
  }
  .pzj__dropzone:has(.pzj__input:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .pzj__dropzone--dragging {
    border-color: var(--color-accent);
    border-style: solid;
  }
  .pzj__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .pzj__dz-title {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .pzj__dz-sub {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }

  /* Password prompt */
  .pzj__password {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pzj__password-hint {
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    margin: 0;
  }
  .pzj__password-error {
    color: var(--color-error);
    font-size: var(--font-size-small);
    margin: 0;
  }
  .pzj__password-label {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
  }
  .pzj__password-input {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text);
    font-size: var(--font-size-body);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    min-height: 2.75rem;
  }
  .pzj__password-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .pzj__password-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /* Error */
  .pzj__error {
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
  .pzj__error-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-error);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* File summary */
  .pzj__file-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pzj__file-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-half);
    min-width: 0;
  }
  .pzj__file-name {
    color: var(--color-text);
    font-size: var(--font-size-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pzj__file-stat {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .pzj__file-stat-sep {
    margin: 0 var(--space-1);
  }

  /* DPI selector */
  .pzj__dpi {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    border: 0;
  }
  .pzj__dpi-legend {
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
    margin-bottom: var(--space-2);
    padding: 0;
  }
  .pzj__dpi-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }
  @media (max-width: 28rem) {
    .pzj__dpi-options {
      grid-template-columns: 1fr;
    }
  }
  .pzj__dpi-option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
    min-height: 2.75rem;
  }
  .pzj__dpi-option:hover {
    border-color: var(--color-text-subtle);
  }
  .pzj__dpi-option--active {
    border-color: var(--color-accent);
  }
  .pzj__dpi-option input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }
  .pzj__dpi-option:has(input:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pzj__dpi-label {
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
  }

  /* Page grid */
  .pzj__pages-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  .pzj__pages-title {
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
  }
  .pzj__pages-actions {
    display: flex;
    gap: var(--space-1);
  }
  .pzj__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
    gap: var(--space-2);
  }
  .pzj__thumb {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
    overflow: hidden;
  }
  .pzj__thumb:hover {
    border-color: var(--color-text-subtle);
  }
  .pzj__thumb--selected {
    border-color: var(--color-accent);
  }
  .pzj__thumb-check {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }
  .pzj__thumb:has(.pzj__thumb-check:focus-visible) {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pzj__thumb-img {
    width: 100%;
    aspect-ratio: 1 / 1.414; /* A4 ratio */
    object-fit: cover;
    border-radius: var(--r-xs);
    display: block;
  }
  .pzj__thumb-num {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .pzj__thumb-check-mark {
    position: absolute;
    top: var(--space-1);
    right: var(--space-1);
    width: 1rem;
    height: 1rem;
    background: var(--color-accent);
    border-radius: 50%;
  }

  /* Actions */
  .pzj__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* Buttons */
  .pzj__primary-btn {
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
  .pzj__primary-btn--sm {
    min-height: 2.75rem;
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-small);
  }
  .pzj__primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }
  .pzj__primary-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pzj__primary-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .pzj__ghost-btn {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
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
  .pzj__ghost-btn:hover {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .pzj__ghost-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Status */
  .pzj__status {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pzj__status--done {
    color: var(--color-success);
    border-color: var(--color-success);
  }
  .pzj__status--error {
    color: var(--color-error);
    border-color: var(--color-error);
  }

  /* Progress bar */
  .pzj__progress {
    height: var(--space-1);
    background: var(--color-surface);
    border-radius: var(--r-xs);
    overflow: hidden;
    border: 1px solid var(--color-border);
  }
  .pzj__progress-bar {
    height: 100%;
    background: var(--color-accent);
    border-radius: var(--r-xs);
    transition: width var(--dur-fast) var(--ease-out);
  }

  /* Outputs */
  .pzj__outputs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  .pzj__outputs-count {
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-weight: 500;
  }
  .pzj__dl-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pzj__dl-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pzj__dl-label {
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    font-variant-numeric: tabular-nums;
  }
  .pzj__dl-size {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }
  .pzj__dl-link {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
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
  .pzj__dl-link:active {
    transform: scale(0.98);
  }
  .pzj__dl-link:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .pzj__dropzone,
    .pzj__primary-btn,
    .pzj__primary-btn:active,
    .pzj__ghost-btn,
    .pzj__dpi-option,
    .pzj__thumb,
    .pzj__dl-link,
    .pzj__dl-link:active,
    .pzj__progress-bar {
      transition: none;
      transform: none;
    }
  }
</style>
