<script lang="ts">
  import type { FileToolConfig } from '../../lib/tools/schemas';
  import {
    convertImagesToPdf,
    type JpgToPdfOptions,
    type PageSizePreset,
    type Orientation,
    type MarginMm,
  } from '../../lib/tools/jpg-zu-pdf-runtime';
  import type { Lang } from '../../lib/i18n/lang';

  /**
   * jpg-to-pdf — multi-image PDF builder.
   *
   * Replaces the generic FileTool single-input shell. Adds: multi-file
   * upload, drag-and-drop, reorderable thumbnails (move up/down), per-PDF
   * page size + orientation + margin picker. The runtime convertImagesToPdf
   * was already multi-image-capable (jpg-zu-pdf-runtime.ts) — only the UI
   * was single-input. Audit P0-2.5 (2026-04-27).
   */

  interface Props {
    config: FileToolConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;

  const STR = $derived(
    lang === 'en'
      ? {
          dropZone: 'Drop images here or click to choose',
          dropHint: 'JPG, PNG, WebP — multiple files supported. Reorder with the up/down buttons.',
          addMore: 'Add more images',
          imagesHeading: 'Images in PDF order',
          empty: 'No images yet — drop one above or click to choose.',
          remove: 'Remove',
          moveUp: 'Move up',
          moveDown: 'Move down',
          pageSize: 'Page size',
          orientation: 'Orientation',
          margin: 'Margin',
          portrait: 'Portrait',
          landscape: 'Landscape',
          presetA4: 'A4 (210 × 297 mm)',
          presetLetter: 'US Letter (8.5 × 11 in)',
          presetAuto: 'Match image size (no resize)',
          marginNone: 'No margin',
          marginSmall: '8 mm (small)',
          marginMedium: '16 mm (medium)',
          download: 'Build PDF',
          building: 'Building PDF…',
          downloadAgain: 'Download PDF again',
          error: 'Error',
          ofN: (i: number, n: number) => `${i} of ${n}`,
        }
      : {
          dropZone: 'Bilder hier ablegen oder klicken zum Auswählen',
          dropHint: 'JPG, PNG, WebP — mehrere Dateien möglich. Reihenfolge per Auf/Ab-Buttons.',
          addMore: 'Weitere Bilder hinzufügen',
          imagesHeading: 'Bilder in PDF-Reihenfolge',
          empty: 'Noch keine Bilder — eines hier ablegen oder klicken.',
          remove: 'Entfernen',
          moveUp: 'Nach oben',
          moveDown: 'Nach unten',
          pageSize: 'Seitengröße',
          orientation: 'Ausrichtung',
          margin: 'Rand',
          portrait: 'Hochformat',
          landscape: 'Querformat',
          presetA4: 'A4 (210 × 297 mm)',
          presetLetter: 'US Letter (8,5 × 11 in)',
          presetAuto: 'Bildgröße übernehmen (keine Skalierung)',
          marginNone: 'Kein Rand',
          marginSmall: '8 mm (klein)',
          marginMedium: '16 mm (mittel)',
          download: 'PDF erstellen',
          building: 'PDF wird erstellt…',
          downloadAgain: 'PDF erneut herunterladen',
          error: 'Fehler',
          ofN: (i: number, n: number) => `${i} von ${n}`,
        },
  );

  interface ImageEntry {
    id: string;
    file: File;
    previewUrl: string;
  }

  let images = $state<ImageEntry[]>([]);
  let pageSize = $state<PageSizePreset>('a4');
  let orientation = $state<Orientation>('portrait');
  let margin = $state<MarginMm>(8);
  let building = $state<boolean>(false);
  let progress = $state<{ done: number; total: number } | null>(null);
  let pdfBlobUrl = $state<string | null>(null);
  let errorMsg = $state<string | null>(null);
  let dragOver = $state<boolean>(false);
  let fileInput: HTMLInputElement | null = $state(null);

  function rid(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const accepted: ImageEntry[] = [];
    for (const f of Array.from(list)) {
      if (!/^image\/(jpeg|jpg|png|webp)$/i.test(f.type)) continue;
      accepted.push({ id: rid(), file: f, previewUrl: URL.createObjectURL(f) });
    }
    images = [...images, ...accepted];
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      pdfBlobUrl = null;
    }
    errorMsg = null;
  }

  function removeAt(i: number) {
    const target = images[i];
    if (target) URL.revokeObjectURL(target.previewUrl);
    images = images.filter((_, idx) => idx !== i);
  }

  function moveUp(i: number) {
    if (i <= 0) return;
    const next = [...images];
    [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
    images = next;
  }

  function moveDown(i: number) {
    if (i >= images.length - 1) return;
    const next = [...images];
    [next[i + 1], next[i]] = [next[i]!, next[i + 1]!];
    images = next;
  }

  async function build() {
    if (images.length === 0 || building) return;
    building = true;
    errorMsg = null;
    progress = { done: 0, total: images.length };
    try {
      const opts: JpgToPdfOptions = {
        pageSize,
        orientation,
        marginMm: margin,
        jpegQuality: 0.9,
      };
      const pdfBytes = await convertImagesToPdf(
        images.map((i) => i.file),
        opts,
        (done, total) => {
          progress = { done, total };
        },
      );
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      pdfBlobUrl = URL.createObjectURL(blob);
      // Auto-trigger download on first build.
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = `images-${images.length}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      building = false;
      progress = null;
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }
  function onDragLeave() {
    dragOver = false;
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    addFiles(e.dataTransfer?.files ?? null);
  }
  function onPick(e: Event) {
    const input = e.target as HTMLInputElement;
    addFiles(input.files);
    if (input) input.value = '';
  }
</script>

<div class="jpg-pdf">
  <button
    type="button"
    class="jpg-pdf__drop"
    class:is-over={dragOver}
    aria-label={STR.dropZone}
    onclick={() => fileInput?.click()}
    ondragover={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
  >
    <span class="jpg-pdf__drop-icon" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    </span>
    <span class="jpg-pdf__drop-label">
      {images.length === 0 ? STR.dropZone : STR.addMore}
    </span>
    <span class="jpg-pdf__drop-hint">{STR.dropHint}</span>
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    class="jpg-pdf__file-input"
    onchange={onPick}
    aria-hidden="true"
    tabindex="-1"
  />

  <h3 class="jpg-pdf__heading">{STR.imagesHeading}</h3>
  {#if images.length === 0}
    <p class="jpg-pdf__empty">{STR.empty}</p>
  {:else}
    <ol class="jpg-pdf__list">
      {#each images as img, i (img.id)}
        <li class="jpg-pdf__item">
          <span class="jpg-pdf__index" aria-label={STR.ofN(i + 1, images.length)}>{i + 1}</span>
          <img class="jpg-pdf__thumb" src={img.previewUrl} alt={img.file.name} loading="lazy" />
          <span class="jpg-pdf__name" title={img.file.name}>{img.file.name}</span>
          <span class="jpg-pdf__actions">
            <button type="button" class="jpg-pdf__btn-icon" onclick={() => moveUp(i)} disabled={i === 0} aria-label={STR.moveUp}>↑</button>
            <button type="button" class="jpg-pdf__btn-icon" onclick={() => moveDown(i)} disabled={i === images.length - 1} aria-label={STR.moveDown}>↓</button>
            <button type="button" class="jpg-pdf__btn-icon jpg-pdf__btn-remove" onclick={() => removeAt(i)} aria-label={STR.remove}>×</button>
          </span>
        </li>
      {/each}
    </ol>
  {/if}

  <div class="jpg-pdf__opts">
    <label class="jpg-pdf__field">
      <span class="jpg-pdf__label">{STR.pageSize}</span>
      <select bind:value={pageSize} aria-label={STR.pageSize}>
        <option value="a4">{STR.presetA4}</option>
        <option value="letter">{STR.presetLetter}</option>
        <option value="auto">{STR.presetAuto}</option>
      </select>
    </label>
    <label class="jpg-pdf__field">
      <span class="jpg-pdf__label">{STR.orientation}</span>
      <select bind:value={orientation} aria-label={STR.orientation} disabled={pageSize === 'auto'}>
        <option value="portrait">{STR.portrait}</option>
        <option value="landscape">{STR.landscape}</option>
      </select>
    </label>
    <label class="jpg-pdf__field">
      <span class="jpg-pdf__label">{STR.margin}</span>
      <select bind:value={margin} aria-label={STR.margin}>
        <option value={0}>{STR.marginNone}</option>
        <option value={8}>{STR.marginSmall}</option>
        <option value={16}>{STR.marginMedium}</option>
      </select>
    </label>
  </div>

  <div class="jpg-pdf__actions-row">
    <button
      type="button"
      class="jpg-pdf__build"
      onclick={build}
      disabled={images.length === 0 || building}
    >
      {#if building && progress}
        {STR.building} {progress.done} / {progress.total}
      {:else if pdfBlobUrl}
        {STR.downloadAgain}
      {:else}
        {STR.download}
      {/if}
    </button>
    {#if pdfBlobUrl && !building}
      <a class="jpg-pdf__build jpg-pdf__build--secondary" href={pdfBlobUrl} download={`images-${images.length}.pdf`}>{STR.downloadAgain}</a>
    {/if}
  </div>

  {#if errorMsg}
    <p class="jpg-pdf__error" role="alert">
      {STR.error}: {errorMsg}
    </p>
  {/if}
</div>

<style>
  .jpg-pdf {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .jpg-pdf__drop {
    appearance: none;
    background: var(--color-bg);
    border: 2px dashed var(--color-border);
    border-radius: var(--r-md);
    padding: var(--space-8) var(--space-5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  .jpg-pdf__drop:hover,
  .jpg-pdf__drop.is-over {
    border-color: var(--color-accent);
    color: var(--color-text);
  }
  .jpg-pdf__drop:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .jpg-pdf__drop-icon { color: var(--color-text-subtle); }
  .jpg-pdf__drop-label {
    font-weight: 500;
    color: var(--color-text);
  }
  .jpg-pdf__drop-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
  }
  .jpg-pdf__file-input {
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

  .jpg-pdf__heading {
    margin: 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .jpg-pdf__empty {
    margin: 0;
    padding: var(--space-5);
    background: var(--color-bg);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text-subtle);
    text-align: center;
    font-size: var(--font-size-small);
  }

  .jpg-pdf__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .jpg-pdf__item {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
  }
  .jpg-pdf__index {
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-subtle);
    width: 1.5rem;
    text-align: right;
  }
  .jpg-pdf__thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: var(--r-sm);
    background: var(--color-bg);
  }
  .jpg-pdf__name {
    /* `min-width: 0` lifts the Grid-`min-content`-Floor — ohne das würde
       das `1fr`-Track auf den längsten unteilbaren Dateinamen (z.B.
       "IMG_20260428_screenshot_long_filename.jpeg") expandieren und das
       Grid in der Eltern-Box wider ausbreiten. Damit greift jetzt
       text-overflow: ellipsis sauber statt das Layout zu sprengen. */
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-small);
  }
  .jpg-pdf__actions {
    display: inline-flex;
    gap: var(--space-1);
  }
  .jpg-pdf__btn-icon {
    appearance: none;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .jpg-pdf__btn-icon:not(:disabled):hover {
    border-color: var(--color-text-muted);
    color: var(--color-text);
  }
  .jpg-pdf__btn-icon:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .jpg-pdf__btn-icon:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .jpg-pdf__btn-remove:not(:disabled):hover {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .jpg-pdf__opts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--space-4);
  }
  .jpg-pdf__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .jpg-pdf__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .jpg-pdf__field select {
    appearance: none;
    width: 100%;
    padding: var(--space-3);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .jpg-pdf__field select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .jpg-pdf__field select:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .jpg-pdf__actions-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .jpg-pdf__build {
    appearance: none;
    padding: var(--space-3) var(--space-5);
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    border-radius: var(--r-md);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .jpg-pdf__build:not(:disabled):hover {
    background: var(--color-text-muted);
  }
  .jpg-pdf__build:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .jpg-pdf__build:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .jpg-pdf__build--secondary {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
  .jpg-pdf__build--secondary:hover {
    border-color: var(--color-text);
    background: transparent;
  }

  .jpg-pdf__error {
    margin: 0;
    padding: var(--space-4);
    background: var(--color-bg);
    border: 1px solid var(--color-error);
    border-radius: var(--r-md);
    color: var(--color-error);
    font-size: var(--font-size-small);
  }

  @media (prefers-reduced-motion: reduce) {
    .jpg-pdf__drop,
    .jpg-pdf__field select,
    .jpg-pdf__btn-icon,
    .jpg-pdf__build { transition: none; }
  }
</style>
