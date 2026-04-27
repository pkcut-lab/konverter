<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { generateQrSvg } from '../../lib/tools/qr-code-generator';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;
  const strings = $derived(t(lang));

  let input = $state<string>('https://konverter.app');
  let copyState = $state<'idle' | 'copied'>('idle');

  type SvgResult =
    | { ok: true; svg: string }
    | { ok: false; error: string }
    | { ok: 'empty' };

  const result = $derived.by<SvgResult>(() => {
    if (input.trim() === '') return { ok: 'empty' };
    try {
      return { ok: true, svg: generateQrSvg(input) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler' };
    }
  });

  const byteCount = $derived(new TextEncoder().encode(input).length);

  function downloadSvg() {
    if (result.ok !== true) return;
    const blob = new Blob([result.svg], { type: 'image/svg+xml' });
    triggerDownload(blob, 'qr-code.svg');
  }

  function downloadPng() {
    if (result.ok !== true) return;
    const svg = result.svg;
    const img = new Image();
    const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = () => {
      const scale = 8;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale || 512;
      canvas.height = img.height * scale || 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        return;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (b) triggerDownload(b, 'qr-code.png');
        URL.revokeObjectURL(blobUrl);
      }, 'image/png');
    };
    img.onerror = () => URL.revokeObjectURL(blobUrl);
    img.src = blobUrl;
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copySvg() {
    if (result.ok !== true) return;
    try {
      await navigator.clipboard.writeText(result.svg);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      /* silent */
    }
  }
</script>

<div class="qr" data-testid="qr-code-generator">
  <div class="qr__panel">
    <label class="qr__label" for="qr-input">Text oder URL</label>
    <textarea
      id="qr-input"
      class="qr__field"
      rows="3"
      spellcheck="false"
      autocomplete="off"
      placeholder="https://konverter.app"
      value={input}
      oninput={(e) => (input = (e.target as HTMLTextAreaElement).value)}
    ></textarea>
    <span class="qr__byte-count">{byteCount} Byte{byteCount === 1 ? '' : 's'} · max 213</span>
  </div>

  <div class="qr__preview-panel">
    {#if result.ok === true}
      <div class="qr__svg-wrap" role="img" aria-label="QR-Code-Vorschau">
        {@html result.svg}
      </div>
      <div class="qr__actions">
        <button type="button" class="qr__btn" onclick={downloadSvg}>SVG laden</button>
        <button type="button" class="qr__btn" onclick={downloadPng}>PNG laden</button>
        <button
          type="button"
          class="qr__btn qr__btn--ghost"
          class:qr__btn--copied={copyState === 'copied'}
          onclick={copySvg}
        >
          {copyState === 'copied' ? strings.toolsCommon.copied : strings.toolsCommon.copy}
        </button>
      </div>
    {:else if result.ok === 'empty'}
      <div class="qr__empty">Text oder URL oben eingeben — der QR-Code rendert live.</div>
    {:else}
      <div class="qr__error" role="alert">
        <span class="qr__error-label">Fehler</span>
        <span>{result.error}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .qr {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .qr__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }
  .qr__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .qr__field {
    width: 100%;
    padding: var(--space-4);
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    resize: vertical;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .qr__field:hover {
    border-color: var(--color-text-subtle);
  }
  .qr__field:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }
  .qr__byte-count {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .qr__preview-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
  }
  .qr__svg-wrap {
    width: 100%;
    max-width: 18rem;
    aspect-ratio: 1 / 1;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr__svg-wrap :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
  .qr__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;
  }
  .qr__btn {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    background: var(--color-text);
    color: var(--color-bg);
    border: 1px solid var(--color-text);
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition:
      background var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .qr__btn:hover {
    background: var(--color-text-muted);
    border-color: var(--color-text-muted);
  }
  .qr__btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .qr__btn--ghost {
    background: transparent;
    color: var(--color-text-muted);
    border-color: var(--color-border);
  }
  .qr__btn--ghost:hover {
    color: var(--color-text);
    background: transparent;
    border-color: var(--color-text-subtle);
  }
  .qr__btn--copied,
  .qr__btn--copied:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
    background: transparent;
  }
  .qr__empty,
  .qr__error {
    padding: var(--space-6);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
    width: 100%;
    text-align: center;
  }
  .qr__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
    text-align: left;
  }
  .qr__error-label {
    font-family: var(--font-family-mono);
    font-weight: 500;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
