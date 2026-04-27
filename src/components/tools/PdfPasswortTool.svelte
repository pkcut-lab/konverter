<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { formatFileSize } from '../../lib/tools/pdf-split-utils';
  import {
    isValidPdfMagicBytes,
    deriveUnlockedFilename,
  } from '../../lib/tools/pdf-passwort-utils';

  interface Props {
    config: FormatterConfig;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { config: _config }: Props = $props();


  type Phase =
    | 'idle'
    | 'loading'
    | 'needs-password'
    | 'processing'
    | 'done'
    | 'error';

  type Loaded = {
    name: string;
    sizeBytes: number;
    bytes: Uint8Array;
    totalPages: number;
  };

  // $state.raw for large Uint8Array — avoids reactive deep-copy overhead.
  let loaded = $state.raw<Loaded | null>(null);
  let outputUrl = $state.raw<string | null>(null);
  let outputSizeBytes = $state<number>(0);
  let outputFilename = $state<string>('');

  let dragging = $state<boolean>(false);
  let phase = $state<Phase>('idle');
  let statusMessage = $state<string>('');
  let loadError = $state<string>('');
  let password = $state<string>('');
  let progress = $state<number>(0);
  let showPasswordInput = $state<boolean>(false);
  let passwordError = $state<string>('');
  let alreadyUnlocked = $state<boolean>(false);

  // Derived
  const canProcess = $derived(
    !!loaded && !showPasswordInput && phase !== 'processing',
  );
  const showSizeWarning = $derived(
    loaded ? loaded.sizeBytes > 50 * 1024 * 1024 : false,
  );


  function clearOutput() {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      outputUrl = null;
    }
    outputSizeBytes = 0;
    outputFilename = '';
  }

  function reset() {
    clearOutput();
    loaded = null;
    phase = 'idle';
    statusMessage = '';
    loadError = '';
    password = '';
    progress = 0;
    showPasswordInput = false;
    passwordError = '';
    alreadyUnlocked = false;
  }

  async function handleFile(file: File) {
    reset();
    phase = 'loading';
    statusMessage = 'Datei wird gelesen …';

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());

      if (!isValidPdfMagicBytes(bytes)) {
        loadError = 'Keine gültige PDF-Datei (fehlender %PDF-Header).';
        phase = 'error';
        statusMessage = '';
        return;
      }

      // Pre-check for encryption using pdfjs — lazy load
      let pdfjsLib: typeof import('pdfjs-dist');
      try {
        pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).href;
      } catch {
        loadError = 'PDF-Bibliothek konnte nicht geladen werden.';
        phase = 'error';
        statusMessage = '';
        return;
      }

      // Try loading without password first
      try {
        const probe = await pdfjsLib.getDocument({ data: bytes }).promise;
        const totalPages = probe.numPages;
        loaded = { name: file.name, sizeBytes: file.size, bytes, totalPages };
        // PDF is not password-protected
        alreadyUnlocked = true;
        phase = 'needs-password';
        statusMessage = '';
        showPasswordInput = false;
      } catch (err) {
        const name = err instanceof Error ? err.constructor.name : '';
        const msg = err instanceof Error ? err.message : '';
        if (name === 'PasswordException' || /password/i.test(msg)) {
          // PDF is encrypted — ask for password
          // We don't know totalPages yet; set a placeholder
          loaded = { name: file.name, sizeBytes: file.size, bytes, totalPages: 0 };
          phase = 'needs-password';
          statusMessage = '';
          showPasswordInput = true;
          alreadyUnlocked = false;
          // Focus password input on next tick
          setTimeout(() => {
            (document.getElementById('pdpp-password-input') as HTMLInputElement | null)?.focus();
          }, 50);
        } else {
          loadError = 'Die PDF-Datei ist beschädigt und kann nicht verarbeitet werden.';
          phase = 'error';
          statusMessage = '';
        }
      }
    } catch {
      loadError = 'Datei konnte nicht gelesen werden.';
      phase = 'error';
      statusMessage = '';
    }
  }

  async function unlock() {
    if (!loaded) return;
    if (alreadyUnlocked) {
      // PDF is not encrypted — offer original as download
      const blob = new Blob([loaded.bytes], { type: 'application/pdf' });
      clearOutput();
      outputUrl = URL.createObjectURL(blob);
      outputSizeBytes = blob.size;
      outputFilename = loaded.name;
      phase = 'done';
      statusMessage = 'Dieses PDF war bereits nicht passwortgeschützt — Original wird angeboten.';
      return;
    }

    // Load with password using pdfjs-dist
    let pdfjsLib: typeof import('pdfjs-dist');
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).href;
    } catch {
      loadError = 'PDF-Bibliothek konnte nicht geladen werden.';
      phase = 'error';
      statusMessage = '';
      return;
    }

    let pdfDoc: Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise'] extends Promise<infer T> ? T : never;
    try {
      pdfDoc = await pdfjsLib.getDocument({
        data: loaded.bytes,
        password,
      }).promise;
    } catch (err) {
      const name = err instanceof Error ? err.constructor.name : '';
      const msg = err instanceof Error ? err.message : '';
      if (name === 'PasswordException' || /password/i.test(msg)) {
        passwordError = 'Falsches Passwort. Bitte erneut versuchen.';
        return;
      }
      loadError = 'Die PDF-Datei konnte nicht geöffnet werden.';
      phase = 'error';
      statusMessage = '';
      return;
    }

    passwordError = '';
    showPasswordInput = false;
    const totalPages = pdfDoc.numPages;
    // Update loaded.totalPages now that we know it
    loaded = { ...loaded, totalPages };

    // Render pages → JPEG → pdf-lib output PDF
    phase = 'processing';
    progress = 0;
    statusMessage = 'Seiten werden verarbeitet …';

    let pdfLibModule: typeof import('pdf-lib');
    try {
      pdfLibModule = await import('pdf-lib');
    } catch {
      loadError = 'PDF-Bibliothek konnte nicht geladen werden.';
      phase = 'error';
      statusMessage = '';
      return;
    }

    const outputDoc = await pdfLibModule.PDFDocument.create();
    const scale = 150 / 72; // 150 DPI (≈ 2.083×)

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }

      // Canvas → JPEG bytes
      const jpegBytes = await new Promise<Uint8Array>((resolve) => {
        canvas.toBlob(
          (blob) => {
            blob!.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
          },
          'image/jpeg',
          0.92,
        );
      });

      // Embed in output PDF
      const jpegImage = await outputDoc.embedJpg(jpegBytes);
      const pdfPage = outputDoc.addPage([viewport.width, viewport.height]);
      pdfPage.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      progress = Math.round((pageNum / totalPages) * 100);
      statusMessage = `Seite ${pageNum} von ${totalPages} …`;
    }

    const savedBytes = await outputDoc.save();
    const blob = new Blob([savedBytes], { type: 'application/pdf' });
    clearOutput();
    outputUrl = URL.createObjectURL(blob);
    outputSizeBytes = blob.size;
    outputFilename = deriveUnlockedFilename(loaded.name);
    phase = 'done';
    statusMessage = `Fertig — ${totalPages} Seite${totalPages === 1 ? '' : 'n'} entsperrt.`;
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
  function onPasswordKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') void unlock();
  }
</script>

<div class="pdpp" data-testid="pdf-passwort">
  <!-- Drop zone (only shown when idle) -->
  {#if phase === 'idle'}
    <label
      class="pdpp__dropzone"
      class:pdpp__dropzone--dragging={dragging}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      data-testid="pdpp-dropzone"
    >
      <input
        type="file"
        accept="application/pdf,.pdf"
        class="pdpp__input"
        onchange={onPick}
        aria-label="PDF-Datei auswählen"
        data-testid="pdpp-input"
      />
      <span class="pdpp__dz-title">PDF hierher ziehen</span>
      <span class="pdpp__dz-sub">oder klicken · eine Datei</span>
    </label>
  {/if}

  <!-- Load error -->
  {#if loadError}
    <div class="pdpp__error" role="alert" data-testid="pdpp-load-error">
      <span class="pdpp__error-label">Fehler</span>
      <span>{loadError}</span>
      <button type="button" class="pdpp__ghost-btn" onclick={reset} data-testid="pdpp-reset">
        Andere Datei wählen
      </button>
    </div>
  {/if}

  <!-- File summary (shown once loaded) -->
  {#if loaded && phase !== 'idle' && phase !== 'error'}
    <section class="pdpp__file-summary" aria-label="Datei-Übersicht">
      <div class="pdpp__file-meta">
        <span class="pdpp__file-name" data-testid="pdpp-filename">{loaded.name}</span>
        <span class="pdpp__file-stat">
          {#if loaded.totalPages > 0}
            {loaded.totalPages}&nbsp;Seite{loaded.totalPages === 1 ? '' : 'n'}
            <span class="pdpp__stat-sep" aria-hidden="true">·</span>
          {/if}
          {formatFileSize(loaded.sizeBytes)}
        </span>
      </div>
      <button type="button" class="pdpp__ghost-btn" onclick={reset} data-testid="pdpp-clear">
        Andere Datei
      </button>
    </section>

    {#if showSizeWarning}
      <div class="pdpp__warning" role="status" data-testid="pdpp-size-warning">
        <span class="pdpp__warning-label">Hinweis</span>
        Datei {formatFileSize(loaded.sizeBytes)} — Verarbeitung großer Dateien kann etwas dauern.
      </div>
    {/if}

    <!-- Already unlocked notice -->
    {#if alreadyUnlocked}
      <div class="pdpp__notice" role="status" data-testid="pdpp-already-unlocked">
        <span class="pdpp__notice-label">Info</span>
        Dieses PDF ist bereits nicht passwortgeschützt. Du kannst es trotzdem herunterladen.
      </div>
    {/if}

    <!-- Password input -->
    {#if showPasswordInput}
      <div class="pdpp__password-section" data-testid="pdpp-password-section">
        <label class="pdpp__pw-label" for="pdpp-password-input">PDF-Passwort eingeben</label>
        <div class="pdpp__pw-row">
          <input
            type="password"
            id="pdpp-password-input"
            class="pdpp__pw-input"
            bind:value={password}
            placeholder="Passwort …"
            autocomplete="off"
            onkeydown={onPasswordKeydown}
            data-testid="pdpp-password-input"
          />
          <button
            type="button"
            class="pdpp__primary-btn"
            onclick={unlock}
            disabled={password.length === 0 || phase === 'processing'}
            data-testid="pdpp-unlock-btn"
          >
            Entsperren
          </button>
        </div>
        {#if passwordError}
          <p class="pdpp__pw-error" role="alert" data-testid="pdpp-password-error">
            {passwordError}
          </p>
        {/if}
        <p class="pdpp__pw-hint">
          Hinweis: Das Passwort verlässt deinen Browser nicht — die gesamte Verarbeitung läuft lokal.
        </p>
      </div>
    {/if}

    <!-- Unlock button for already-unlocked PDFs -->
    {#if alreadyUnlocked && phase !== 'done' && phase !== 'processing'}
      <div class="pdpp__actions">
        <button
          type="button"
          class="pdpp__primary-btn"
          onclick={unlock}
          disabled={phase === 'processing'}
          data-testid="pdpp-download-original-btn"
        >
          Original herunterladen
        </button>
      </div>
    {/if}
  {/if}

  <!-- Processing progress -->
  {#if phase === 'processing'}
    <div class="pdpp__progress" role="status" aria-live="polite" data-testid="pdpp-progress">
      <div class="pdpp__progress-bar">
        <div class="pdpp__progress-fill" style="width: {progress}%"></div>
      </div>
      <span class="pdpp__progress-label">{statusMessage}</span>
    </div>
  {/if}

  <!-- Done: download area -->
  {#if phase === 'done' && outputUrl}
    <div class="pdpp__output" data-testid="pdpp-output">
      <div class="pdpp__output-meta">
        <span class="pdpp__output-name" data-testid="pdpp-output-filename">{outputFilename}</span>
        <span class="pdpp__output-size" data-testid="pdpp-output-size">
          {formatFileSize(outputSizeBytes)}
        </span>
      </div>
      <a
        class="pdpp__dl-link"
        href={outputUrl}
        download={outputFilename}
        data-testid="pdpp-download-link"
      >
        Herunterladen
      </a>
    </div>

    <div class="pdpp__raster-notice" role="note" data-testid="pdpp-raster-notice">
      <span class="pdpp__raster-label">Hinweis</span>
      Die entsperrte PDF enthält Seiten als Bilder (150&nbsp;DPI). Text ist nicht mehr auswählbar oder durchsuchbar.
    </div>

    <div class="pdpp__status pdpp__status--done" role="status" data-testid="pdpp-status">
      {statusMessage}
    </div>
  {/if}

  <!-- Generic status (non-done) -->
  {#if statusMessage && phase !== 'done' && phase !== 'processing'}
    <div
      class="pdpp__status"
      class:pdpp__status--error={phase === 'error'}
      role="status"
      aria-live="polite"
      data-testid="pdpp-status"
    >
      {statusMessage}
    </div>
  {/if}
</div>

<style>
  .pdpp {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
  }

  /* Drop zone */
  .pdpp__dropzone {
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
  .pdpp__dropzone:hover {
    border-color: var(--color-text-subtle);
  }
  .pdpp__dropzone--dragging {
    border-color: var(--color-accent);
    border-style: solid;
  }
  .pdpp__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .pdpp__dz-title {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .pdpp__dz-sub {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }

  /* File summary */
  .pdpp__file-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdpp__file-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pdpp__file-name {
    color: var(--color-text);
    font-size: var(--font-size-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pdpp__file-stat {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .pdpp__stat-sep {
    margin: 0 var(--space-1);
  }

  /* Notice (info) */
  .pdpp__notice {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--color-accent);
    border-radius: var(--r-sm);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }
  .pdpp__notice-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-accent);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Warning */
  .pdpp__warning {
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
  .pdpp__warning-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Password section */
  .pdpp__password-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdpp__pw-label {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .pdpp__pw-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .pdpp__pw-input {
    flex: 1;
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    min-height: 2.75rem;
  }
  .pdpp__pw-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .pdpp__pw-error {
    color: var(--color-error);
    font-size: var(--font-size-small);
    margin: 0;
  }
  .pdpp__pw-hint {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
    margin: 0;
  }

  /* Progress */
  .pdpp__progress {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pdpp__progress-bar {
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .pdpp__progress-fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: 2px;
    transition: width var(--dur-fast) var(--ease-out);
  }
  .pdpp__progress-label {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }

  /* Output */
  .pdpp__output {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdpp__output-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pdpp__output-name {
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pdpp__output-size {
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }

  /* Raster notice */
  .pdpp__raster-notice {
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
  .pdpp__raster-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-subtle);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Actions row */
  .pdpp__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* Error */
  .pdpp__error {
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
  .pdpp__error-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-error);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Status */
  .pdpp__status {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .pdpp__status--error {
    color: var(--color-error);
    border-color: var(--color-error);
  }
  .pdpp__status--done {
    color: var(--color-success);
    border-color: var(--color-success);
  }

  /* Buttons */
  .pdpp__primary-btn {
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
  .pdpp__primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }
  .pdpp__primary-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .pdpp__primary-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pdpp__ghost-btn {
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
  .pdpp__ghost-btn:hover {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .pdpp__ghost-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .pdpp__dl-link {
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
    white-space: nowrap;
  }
  .pdpp__dl-link:active {
    transform: scale(0.98);
  }
  .pdpp__dl-link:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .pdpp__dropzone,
    .pdpp__primary-btn,
    .pdpp__primary-btn:active,
    .pdpp__ghost-btn,
    .pdpp__dl-link,
    .pdpp__dl-link:active,
    .pdpp__progress-fill {
      transition: none;
      transform: none;
    }
  }
</style>
