<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    decodeImageData,
    comparePixels,
    formatNumber,
    formatPercent,
  } from '../../lib/tools/bild-diff';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { config: _config, lang }: Props = $props();
  const strings = $derived(t(lang));

  type Slot = 'a' | 'b';
  type Loaded = {
    name: string;
    sizeBytes: number;
    mime: string;
    dataUrl: string;
    width: number;
    height: number;
    data: Uint8ClampedArray;
  };

  // $state.raw — the Loaded object holds a Uint8ClampedArray of up to ~33M
  // entries (4K image = 3840×2160×4). Svelte 5's default $state wraps every
  // accessed member in a Proxy, which forces a proxy-walk of the full pixel
  // buffer on every `comparePixels` call. Slots are always replaced wholesale
  // (clear/set), never mutated in-place, so .raw keeps reactivity on reassignment
  // while avoiding the per-byte proxy overhead. Extend this pattern to any
  // future $state holding Blobs, typed arrays, canvases, or large parsed JSON.
  let slotA = $state.raw<Loaded | null>(null);
  let slotB = $state.raw<Loaded | null>(null);
  let dragging = $state<{ a: boolean; b: boolean }>({ a: false, b: false });
  let error = $state<string>('');
  let tolerance = $state<number>(0);
  let copyState = $state<'idle' | 'copied'>('idle');

  async function handleFile(slot: Slot, file: File) {
    error = '';
    if (!file.type.startsWith('image/')) {
      error = `„${file.name}" ist kein Bild. Erlaubt sind PNG, JPEG, WebP, GIF.`;
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      const decoded = await decodeImageData(dataUrl);
      const loaded: Loaded = {
        name: file.name,
        sizeBytes: file.size,
        mime: file.type,
        dataUrl,
        width: decoded.width,
        height: decoded.height,
        data: decoded.data,
      };
      if (slot === 'a') slotA = loaded;
      else slotB = loaded;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Bild konnte nicht gelesen werden.';
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
      reader.readAsDataURL(file);
    });
  }

  function onDrop(slot: Slot, e: DragEvent) {
    e.preventDefault();
    dragging = { ...dragging, [slot]: false };
    const file = e.dataTransfer?.files?.[0];
    if (file) void handleFile(slot, file);
  }
  function onDragOver(slot: Slot, e: DragEvent) {
    e.preventDefault();
    dragging = { ...dragging, [slot]: true };
  }
  function onDragLeave(slot: Slot) {
    dragging = { ...dragging, [slot]: false };
  }
  function onPick(slot: Slot, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) void handleFile(slot, file);
  }
  function clear(slot: Slot) {
    if (slot === 'a') slotA = null;
    else slotB = null;
  }

  // Structured diff result — drives BOTH the big-number summary above
  // and the detailed ASCII report below. Computing once avoids running
  // comparePixels twice on every tolerance tick (33M-entry typed array).
  type DiffResult =
    | { kind: 'none' }
    | { kind: 'incomparable' }
    | {
        kind: 'identical';
        totalPixels: number;
      }
    | {
        kind: 'different';
        totalPixels: number;
        diffCount: number;
        channelDelta: [number, number, number, number];
      };

  const diffResult = $derived.by<DiffResult>(() => {
    if (!slotA || !slotB) return { kind: 'none' };
    const a = slotA;
    const b = slotB;
    if (a.width !== b.width || a.height !== b.height) {
      return { kind: 'incomparable' };
    }
    const { diffCount, totalPixels, channelDelta } = comparePixels(
      a.data,
      b.data,
      tolerance,
    );
    if (diffCount === 0) return { kind: 'identical', totalPixels };
    return { kind: 'different', totalPixels, diffCount, channelDelta };
  });

  const sizeDiffBytes = $derived(
    slotA && slotB ? Math.abs(slotA.sizeBytes - slotB.sizeBytes) : 0,
  );
  const largerFile = $derived(
    slotA && slotB && slotA.sizeBytes !== slotB.sizeBytes
      ? (slotA.sizeBytes > slotB.sizeBytes ? 'A' : 'B')
      : null,
  );

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const report = $derived.by<string>(() => {
    if (!slotA || !slotB) return '';
    const a = slotA;
    const b = slotB;
    const lines: string[] = [];
    lines.push('╔══════════════════════════════════════════╗');
    lines.push('║         BILD-DIFF — Vergleichsbericht    ║');
    lines.push('╚══════════════════════════════════════════╝');
    lines.push('');
    lines.push('┌─ Bild A ─────────────────────────────────');
    lines.push(`│  Datei:      ${a.name}`);
    lines.push(`│  Format:     ${a.mime}`);
    lines.push(`│  Dateigröße: ${formatNumber(a.sizeBytes)} Bytes`);
    lines.push(`│  Abmessung:  ${a.width} × ${a.height} px`);
    lines.push('└──────────────────────────────────────────');
    lines.push('');
    lines.push('┌─ Bild B ─────────────────────────────────');
    lines.push(`│  Datei:      ${b.name}`);
    lines.push(`│  Format:     ${b.mime}`);
    lines.push(`│  Dateigröße: ${formatNumber(b.sizeBytes)} Bytes`);
    lines.push(`│  Abmessung:  ${b.width} × ${b.height} px`);
    lines.push('└──────────────────────────────────────────');
    lines.push('');

    lines.push('┌─ Größenvergleich ────────────────────────');
    if (a.sizeBytes === b.sizeBytes) {
      lines.push('│  Dateigröße:   identisch');
    } else {
      lines.push(
        `│  Differenz:    ${formatNumber(sizeDiffBytes)} Bytes (Bild ${largerFile} größer)`,
      );
    }
    if (a.mime !== b.mime) {
      lines.push(`│  Hinweis:      Unterschiedliche Formate (${a.mime} vs. ${b.mime})`);
    }
    lines.push('└──────────────────────────────────────────');
    lines.push('');

    lines.push('┌─ Pixel-Vergleich ────────────────────────');
    if (diffResult.kind === 'incomparable') {
      lines.push('│  Status:       NICHT VERGLEICHBAR');
      lines.push('│  Die Bilder haben unterschiedliche Abmessungen.');
      lines.push('│  Pixelgenauer Vergleich braucht identische w × h.');
    } else if (diffResult.kind === 'identical') {
      lines.push('│  Status:       IDENTISCH');
      lines.push(`│  Alle ${formatNumber(diffResult.totalPixels)} Pixel stimmen überein.`);
    } else if (diffResult.kind === 'different') {
      const ratio = diffResult.diffCount / diffResult.totalPixels;
      lines.push('│  Status:       UNTERSCHIEDLICH');
      lines.push(
        `│  Abweichende Pixel:  ${formatNumber(diffResult.diffCount)} von ${formatNumber(diffResult.totalPixels)}`,
      );
      lines.push(`│  Abweichung:         ${formatPercent(ratio)}`);
      lines.push(`│  Übereinstimmung:    ${formatPercent(1 - ratio)}`);
      lines.push('│');
      lines.push('│  Summe absoluter Deltas je Kanal (0–255):');
      lines.push(`│    R: ${formatNumber(diffResult.channelDelta[0])}`);
      lines.push(`│    G: ${formatNumber(diffResult.channelDelta[1])}`);
      lines.push(`│    B: ${formatNumber(diffResult.channelDelta[2])}`);
      lines.push(`│    A: ${formatNumber(diffResult.channelDelta[3])}`);
    }
    if (diffResult.kind !== 'incomparable' && tolerance > 0) {
      lines.push(`│  Toleranz:     ±${tolerance} pro Kanal`);
    }
    lines.push('└──────────────────────────────────────────');

    return lines.join('\n');
  });

  async function onCopy() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      /* silent */
    }
  }
</script>

<div class="bd" data-testid="bild-diff">
  <div class="bd__slots">
    {#each [{ id: 'a' as Slot, label: 'Bild A', loaded: slotA }, { id: 'b' as Slot, label: 'Bild B', loaded: slotB }] as s}
      <div class="bd__slot">
        <div class="bd__slot-head">
          <span class="bd__label">{s.label}</span>
          {#if s.loaded}
            <button type="button" class="bd__ghost-btn" onclick={() => clear(s.id)}>
              Entfernen
            </button>
          {/if}
        </div>
        {#if s.loaded}
          <div class="bd__preview">
            <img src={s.loaded.dataUrl} alt={s.loaded.name} class="bd__thumb" />
            <div class="bd__meta">
              <span class="bd__meta-name">{s.loaded.name}</span>
              <span class="bd__meta-dim">
                {s.loaded.width} × {s.loaded.height} px · {formatNumber(s.loaded.sizeBytes)} B
              </span>
            </div>
          </div>
        {:else}
          <label
            class="bd__dropzone"
            class:bd__dropzone--dragging={dragging[s.id]}
            ondragover={(e) => onDragOver(s.id, e)}
            ondragleave={() => onDragLeave(s.id)}
            ondrop={(e) => onDrop(s.id, e)}
          >
            <input
              type="file"
              accept="image/*"
              class="bd__input"
              onchange={(e) => onPick(s.id, e)}
            />
            <span class="bd__dz-title">Bild hierher ziehen</span>
            <span class="bd__dz-sub">oder klicken · PNG, JPEG, WebP, GIF</span>
          </label>
        {/if}
      </div>
    {/each}
  </div>

  <label class="bd__tolerance">
    <span class="bd__tol-label">Toleranz pro Kanal (0–255)</span>
    <input
      type="number"
      min="0"
      max="255"
      class="bd__tol-input"
      value={tolerance}
      oninput={(e) =>
        (tolerance = Math.max(0, Math.min(255, Number((e.target as HTMLInputElement).value) || 0)))}
    />
  </label>

  {#if error}
    <div class="bd__error" role="alert">
      <span class="bd__error-label">Fehler</span>
      <span>{error}</span>
    </div>
  {/if}

  {#if slotA && slotB && diffResult.kind !== 'none'}
    {@const ratio =
      diffResult.kind === 'different'
        ? diffResult.diffCount / diffResult.totalPixels
        : 0}
    <section class="bd__summary" aria-label="Ergebnis-Übersicht">
      <div
        class="bd__status"
        class:bd__status--identical={diffResult.kind === 'identical'}
        class:bd__status--different={diffResult.kind === 'different'}
        class:bd__status--incomparable={diffResult.kind === 'incomparable'}
      >
        <span class="bd__status-dot" aria-hidden="true"></span>
        <span class="bd__status-label">
          {#if diffResult.kind === 'identical'}Identisch
          {:else if diffResult.kind === 'different'}Unterschiedlich
          {:else}Nicht vergleichbar{/if}
        </span>
      </div>

      <div class="bd__stats">
        {#if diffResult.kind === 'incomparable'}
          <div class="bd__stat bd__stat--wide">
            <span class="bd__stat-label">Abmessungen</span>
            <span class="bd__stat-value bd__stat-value--muted">
              {slotA.width} × {slotA.height}
              <span class="bd__stat-vs" aria-hidden="true">·</span>
              {slotB.width} × {slotB.height}
            </span>
            <span class="bd__stat-sub">
              Pixelgenauer Vergleich braucht identische Abmessungen.
            </span>
          </div>
        {:else}
          <div class="bd__stat">
            <span class="bd__stat-label">Abweichung</span>
            <span class="bd__stat-value" translate="no">
              {diffResult.kind === 'identical' ? '0' : formatPercent(ratio).replace('%', '')}
              <span class="bd__stat-unit">%</span>
            </span>
          </div>
          <div class="bd__stat">
            <span class="bd__stat-label">Übereinstimmung</span>
            <span class="bd__stat-value bd__stat-value--success" translate="no">
              {diffResult.kind === 'identical' ? '100' : formatPercent(1 - ratio).replace('%', '')}
              <span class="bd__stat-unit">%</span>
            </span>
          </div>
          <div class="bd__stat">
            <span class="bd__stat-label">Abweichende Pixel</span>
            <span class="bd__stat-value" translate="no">
              {formatNumber(diffResult.kind === 'identical' ? 0 : diffResult.diffCount)}
            </span>
            <span class="bd__stat-sub">
              von {formatNumber(diffResult.totalPixels)}
            </span>
          </div>
        {/if}

        <div class="bd__stat">
          <span class="bd__stat-label">Größen-Diff</span>
          {#if sizeDiffBytes === 0}
            <span class="bd__stat-value bd__stat-value--success" translate="no">0 B</span>
            <span class="bd__stat-sub">identisch</span>
          {:else}
            <span class="bd__stat-value" translate="no">
              {formatSize(sizeDiffBytes)}
            </span>
            <span class="bd__stat-sub">
              Bild {largerFile} größer
            </span>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <div class="bd__output-head">
    <span class="bd__label">Detailbericht</span>
    <button
      type="button"
      class="bd__ghost-btn"
      class:bd__ghost-btn--copied={copyState === 'copied'}
      onclick={onCopy}
      disabled={!report}
    >
      {copyState === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copy}
    </button>
  </div>
  {#if report}
    <pre class="bd__output" aria-live="polite">{report}</pre>
  {:else}
    <div class="bd__empty">
      Lade zwei Bilder hoch, um Dateigröße, Abmessungen und Pixel-Unterschiede zu vergleichen.
    </div>
  {/if}
</div>

<style>
  .bd {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }
  .bd__slots {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  @media (min-width: 40rem) {
    .bd__slots {
      grid-template-columns: 1fr 1fr;
    }
  }
  .bd__slot {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }
  .bd__slot-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: 1.5rem;
  }
  .bd__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .bd__dropzone {
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
  .bd__dropzone:hover {
    border-color: var(--color-text-subtle);
  }
  .bd__dropzone--dragging {
    border-color: var(--color-accent);
    border-style: solid;
  }
  .bd__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .bd__dz-title {
    color: var(--color-text);
    font-size: var(--font-size-body);
    font-weight: 500;
  }
  .bd__dz-sub {
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .bd__preview {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .bd__thumb {
    display: block;
    width: 100%;
    max-height: 14rem;
    object-fit: contain;
    background: var(--color-bg);
    border-radius: var(--r-sm);
  }
  .bd__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }
  .bd__meta-name {
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bd__meta-dim {
    color: var(--color-text-subtle);
  }
  .bd__tolerance {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-surface);
  }
  .bd__tol-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .bd__tol-input {
    width: 5rem;
    padding: var(--space-1) var(--space-2);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }
  .bd__tol-input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
  /* ---------- Summary block: big-number status card ---------------
     Lifts the key metrics (Status, Abweichung %, Übereinstimmung %,
     Abweichende Pixel, Größen-Diff) out of the ASCII report so users
     see the answer immediately. The detailed report stays below for
     copy/export. Pattern: editorial stat-grid, tokens only. */
  .bd__summary {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }
  .bd__status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    align-self: flex-start;
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    background: var(--color-bg);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
  .bd__status-dot {
    width: var(--space-2);
    height: var(--space-2);
    border-radius: 9999px;
    background: var(--color-text-subtle);
  }
  .bd__status--identical .bd__status-dot {
    background: var(--color-success);
  }
  .bd__status--identical .bd__status-label {
    color: var(--color-text);
  }
  .bd__status--different .bd__status-dot {
    background: var(--color-accent);
  }
  .bd__status--different .bd__status-label {
    color: var(--color-text);
  }

  .bd__stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  @media (min-width: 32rem) {
    .bd__stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 48rem) {
    .bd__stats {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .bd__stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) 0;
    border-top: 1px solid var(--color-border);
  }
  @media (min-width: 48rem) {
    .bd__stat {
      border-top: 0;
      border-left: 1px solid var(--color-border);
      padding: 0 var(--space-4);
    }
    .bd__stat:first-child {
      border-left: 0;
      padding-left: 0;
    }
  }
  .bd__stat--wide {
    grid-column: 1 / -1;
  }
  .bd__stat-label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .bd__stat-value {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
  }
  .bd__stat-value--success {
    color: var(--color-success);
  }
  .bd__stat-value--muted {
    font-size: var(--font-size-body);
    font-family: var(--font-family-mono);
    color: var(--color-text-muted);
  }
  .bd__stat-unit {
    font-size: var(--font-size-body);
    font-weight: 400;
    color: var(--color-text-subtle);
  }
  .bd__stat-vs {
    color: var(--color-text-subtle);
    margin: 0 var(--space-1);
  }
  .bd__stat-sub {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }

  .bd__output-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
  }
  .bd__output {
    margin: 0;
    padding: var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    max-height: 28rem;
    overflow: auto;
    white-space: pre;
  }
  .bd__empty,
  .bd__error {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .bd__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
  }
  .bd__error-label {
    font-family: var(--font-family-mono);
    font-weight: 500;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .bd__ghost-btn {
    display: inline-flex;
    align-items: center;
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
  }
  .bd__ghost-btn:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .bd__ghost-btn:disabled {
    color: var(--color-text-subtle);
    cursor: not-allowed;
  }
  .bd__ghost-btn--copied {
    color: var(--color-accent);
  }
</style>
