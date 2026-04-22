<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    decodeImageData,
    comparePixels,
    formatNumber,
    formatPercent,
  } from '../../lib/tools/bild-diff';

  interface Props {
    config: FormatterConfig;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { config: _config }: Props = $props();

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

    const sameSize = a.width === b.width && a.height === b.height;
    lines.push('┌─ Größenvergleich ────────────────────────');
    if (a.sizeBytes === b.sizeBytes) {
      lines.push('│  Dateigröße:   identisch');
    } else {
      const diff = Math.abs(a.sizeBytes - b.sizeBytes);
      const larger = a.sizeBytes > b.sizeBytes ? 'A' : 'B';
      lines.push(`│  Differenz:    ${formatNumber(diff)} Bytes (Bild ${larger} größer)`);
    }
    if (a.mime !== b.mime) {
      lines.push(`│  Hinweis:      Unterschiedliche Formate (${a.mime} vs. ${b.mime})`);
    }
    lines.push('└──────────────────────────────────────────');
    lines.push('');

    lines.push('┌─ Pixel-Vergleich ────────────────────────');
    if (!sameSize) {
      lines.push('│  Status:       NICHT VERGLEICHBAR');
      lines.push('│  Die Bilder haben unterschiedliche Abmessungen.');
      lines.push('│  Pixelgenauer Vergleich braucht identische w × h.');
    } else {
      const { diffCount, totalPixels, channelDelta } = comparePixels(
        a.data,
        b.data,
        tolerance,
      );
      const ratio = totalPixels > 0 ? diffCount / totalPixels : 0;
      if (diffCount === 0) {
        lines.push('│  Status:       IDENTISCH');
        lines.push(`│  Alle ${formatNumber(totalPixels)} Pixel stimmen überein.`);
      } else {
        lines.push('│  Status:       UNTERSCHIEDLICH');
        lines.push(
          `│  Abweichende Pixel:  ${formatNumber(diffCount)} von ${formatNumber(totalPixels)}`,
        );
        lines.push(`│  Abweichung:         ${formatPercent(ratio)}`);
        lines.push(`│  Übereinstimmung:    ${formatPercent(1 - ratio)}`);
        lines.push('│');
        lines.push('│  Summe absoluter Deltas je Kanal (0–255):');
        lines.push(`│    R: ${formatNumber(channelDelta[0])}`);
        lines.push(`│    G: ${formatNumber(channelDelta[1])}`);
        lines.push(`│    B: ${formatNumber(channelDelta[2])}`);
        lines.push(`│    A: ${formatNumber(channelDelta[3])}`);
      }
      if (tolerance > 0) {
        lines.push(`│  Toleranz:     ±${tolerance} pro Kanal`);
      }
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

  <div class="bd__output-head">
    <span class="bd__label">Vergleichsbericht</span>
    <button
      type="button"
      class="bd__ghost-btn"
      class:bd__ghost-btn--copied={copyState === 'copied'}
      onclick={onCopy}
      disabled={!report}
    >
      {copyState === 'copied' ? 'Kopiert' : 'Kopieren'}
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
