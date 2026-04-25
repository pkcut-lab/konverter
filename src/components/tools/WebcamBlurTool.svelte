<script lang="ts">
  import type { InteractiveConfig } from '../../lib/tools/schemas';
  import { onDestroy } from 'svelte';

  interface Props {
    config: InteractiveConfig;
  }
  let { config }: Props = $props();
  void config;

  type ToolState =
    | 'idle'
    | 'requesting'
    | 'active'
    | 'error-permission'
    | 'error-no-camera'
    | 'error-no-support';

  let toolState = $state<ToolState>('idle');
  let errorMsg = $state('');
  let blurEnabled = $state(false);
  let blurIntensity = $state(10);
  let hasNativeBlur = $state(false);
  let isMobile = $state(false);

  let stream = $state.raw<MediaStream | null>(null);
  let rafId = $state.raw<number | null>(null);

  let videoEl: HTMLVideoElement;
  let canvasEl: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  function checkSupport(): boolean {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toolState = 'error-no-support';
      errorMsg =
        'Dein Browser unterstützt keinen Kamerazugriff. Bitte Chrome, Firefox oder Edge verwenden.';
      return false;
    }
    isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return true;
  }

  async function startCamera() {
    if (!checkSupport()) return;
    toolState = 'requesting';

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      stream = s;

      // Check W3C Background Blur API availability (Chrome 114+, hardware-dependent)
      const track = s.getVideoTracks()[0];
      if (track) {
        const caps = track.getCapabilities?.() as Record<string, unknown> | undefined;
        hasNativeBlur = caps != null && 'backgroundBlur' in caps;
      }

      videoEl.srcObject = s;
      videoEl.play().catch(() => {});

      // Wait for video dimensions
      await new Promise<void>((resolve) => {
        if (videoEl.readyState >= 1) {
          resolve();
        } else {
          videoEl.addEventListener('loadedmetadata', () => resolve(), { once: true });
        }
      });

      canvasEl.width = videoEl.videoWidth || 1280;
      canvasEl.height = videoEl.videoHeight || 720;
      ctx = canvasEl.getContext('2d');

      toolState = 'active';
      scheduleFrame();
    } catch (e: unknown) {
      const err = e as DOMException;
      if (err.name === 'NotAllowedError') {
        toolState = 'error-permission';
        errorMsg =
          'Kamerazugriff wurde verweigert. Bitte erlaube den Zugriff in den Browsereinstellungen und lade die Seite neu.';
      } else if (err.name === 'NotFoundError') {
        toolState = 'error-no-camera';
        errorMsg =
          'Keine Kamera gefunden. Bitte eine Webcam anschließen und die Seite neu laden.';
      } else {
        toolState = 'error-no-support';
        errorMsg = 'Kamerazugriff fehlgeschlagen. Bitte Chrome, Firefox oder Edge verwenden.';
      }
    }
  }

  function scheduleFrame() {
    rafId = requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    if (toolState !== 'active' || !ctx || !videoEl) return;

    // Keep canvas in sync with actual video dimensions
    if (videoEl.videoWidth > 0 && canvasEl.width !== videoEl.videoWidth) {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx = canvasEl.getContext('2d');
      if (!ctx) return;
    }

    const w = canvasEl.width;
    const h = canvasEl.height;

    if (blurEnabled) {
      if (hasNativeBlur) {
        // Track already applies person-segmented blur; add subtle global softening for slider feel
        const extra = Math.max(0, Math.round((blurIntensity - 8) * 0.4));
        if (extra > 0) ctx.filter = `blur(${extra}px)`;
        ctx.drawImage(videoEl, 0, 0, w, h);
        if (extra > 0) ctx.filter = 'none';
      } else {
        // Full-frame CSS filter blur — blurs both person and background equally
        const px = Math.max(1, Math.round(blurIntensity * 1.5));
        ctx.filter = `blur(${px}px)`;
        ctx.drawImage(videoEl, 0, 0, w, h);
        ctx.filter = 'none';
      }
    } else {
      ctx.drawImage(videoEl, 0, 0, w, h);
    }

    rafId = requestAnimationFrame(renderFrame);
  }

  // Sync blur enabled state to native track constraint
  $effect(() => {
    if (!stream || !hasNativeBlur) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    track
      .applyConstraints({ backgroundBlur: blurEnabled } as MediaTrackConstraints)
      .catch(() => {
        // Hardware doesn't actually support it — fall back to CSS blur
        hasNativeBlur = false;
      });
  });

  function stopCamera() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) videoEl.srcObject = null;
    toolState = 'idle';
    blurEnabled = false;
    hasNativeBlur = false;
    ctx = null;
  }

  function retry() {
    stopCamera();
    void startCamera();
  }

  function downloadSnapshot() {
    if (!canvasEl) return;
    canvasEl.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'webcam-unschaerfe.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  onDestroy(stopCamera);
</script>

<div class="webcam-tool">
  {#if toolState === 'idle'}
    <div class="webcam-tool__idle">
      <p class="webcam-tool__idle-desc">
        Das Tool greift über die Browser-API auf deine Kamera zu.
        Die Verarbeitung läuft vollständig lokal — kein Frame verlässt deinen Browser.
      </p>
      <button class="btn-primary" onclick={() => startCamera()}>
        Kamera starten
      </button>
    </div>
  {:else if toolState === 'requesting'}
    <div class="webcam-tool__loading">
      <div class="spinner" aria-hidden="true"></div>
      <p>Kamerazugriff wird angefragt…</p>
    </div>
  {:else if toolState === 'active'}
    <div class="webcam-tool__view">
      <!-- Hidden native video element feeds into canvas -->
      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        bind:this={videoEl}
        class="webcam-tool__video"
        autoplay
        muted
        playsinline
        aria-hidden="true"
      ></video>

      <canvas
        bind:this={canvasEl}
        class="webcam-tool__canvas"
        aria-label="Live-Kamerabild"
      ></canvas>

      <div class="webcam-tool__controls">
        <!-- Blur toggle -->
        <label class="toggle-row">
          <span class="toggle-row__label">Hintergrundunschärfe</span>
          <button
            class="toggle"
            class:toggle--on={blurEnabled}
            role="switch"
            aria-checked={blurEnabled}
            onclick={() => { blurEnabled = !blurEnabled; }}
          >
            <span class="toggle__thumb"></span>
          </button>
        </label>

        <!-- Intensity slider (visible when blur is on) -->
        {#if blurEnabled}
          <label class="slider-row">
            <span class="slider-row__label">
              Intensität
              <span class="slider-row__value">{blurIntensity}</span>
            </span>
            <input
              type="range"
              min="1"
              max="20"
              bind:value={blurIntensity}
              class="slider"
              aria-label="Blur-Intensität"
            />
            <span class="slider-row__hints">
              <span>Leicht</span>
              <span>Stark</span>
            </span>
          </label>
        {/if}

        <!-- Compat notice: non-native blur = full-frame -->
        {#if blurEnabled && !hasNativeBlur}
          <p class="webcam-tool__notice webcam-tool__notice--info">
            In deinem Browser oder auf dieser Hardware läuft die Unschärfe über eine
            Vollbild-Filterung — Hintergrund <em>und</em> Person werden unscharf.
            Für reine Hintergrundunschärfe ist Chrome&nbsp;114+ mit kompatibler Hardware empfohlen.
          </p>
        {/if}

        <!-- Mobile performance note -->
        {#if isMobile}
          <p class="webcam-tool__notice webcam-tool__notice--warn">
            Auf mobilen Geräten kann die Bildverarbeitung etwas verzögert reagieren.
            Für beste Ergebnisse einen Desktop-Browser verwenden.
          </p>
        {/if}

        <div class="webcam-tool__actions">
          <button class="btn-secondary" onclick={downloadSnapshot}>
            Schnappschuss&nbsp;speichern
          </button>
          <button class="btn-ghost" onclick={stopCamera}>
            Kamera&nbsp;beenden
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- Error states -->
    <div class="webcam-tool__error">
      <p class="webcam-tool__error-msg">{errorMsg}</p>
      {#if toolState !== 'error-no-support'}
        <button class="btn-secondary" onclick={retry}>
          Erneut versuchen
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .webcam-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }

  /* ── Idle ── */
  .webcam-tool__idle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    padding: var(--space-8);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
    background: var(--color-surface);
    text-align: center;
  }

  .webcam-tool__idle-desc {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    line-height: 1.6;
    max-width: 28rem;
  }

  /* ── Loading ── */
  .webcam-tool__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-8);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }

  .spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Active view ── */
  .webcam-tool__view {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .webcam-tool__video {
    /* Hidden source — user sees the canvas */
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .webcam-tool__canvas {
    width: 100%;
    height: auto;
    border-radius: var(--r-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface-sunk);
    display: block;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  /* ── Controls card ── */
  .webcam-tool__controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  /* Toggle row */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    cursor: pointer;
  }

  .toggle-row__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text);
  }

  .toggle {
    position: relative;
    width: 2.75rem;
    height: 1.5rem;
    border-radius: 9999px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-sunk);
    cursor: pointer;
    padding: 0;
    transition:
      background var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
    flex-shrink: 0;
  }

  .toggle--on {
    background: var(--color-text);
    border-color: var(--color-text);
  }

  .toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
    background: var(--color-text-muted);
    transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  }

  .toggle--on .toggle__thumb {
    transform: translateX(1.25rem);
    background: var(--color-bg);
  }

  /* Slider row */
  .slider-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .slider-row__label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text);
  }

  .slider-row__value {
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    color: var(--color-text-subtle);
  }

  .slider {
    width: 100%;
    accent-color: var(--color-text);
    cursor: pointer;
  }

  .slider-row__hints {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
  }

  /* Notices */
  .webcam-tool__notice {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-sm);
    font-size: var(--font-size-small);
    line-height: 1.5;
  }

  .webcam-tool__notice--info {
    background: color-mix(in oklch, var(--color-text) 6%, transparent);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  .webcam-tool__notice--warn {
    background: color-mix(in oklch, var(--color-accent) 10%, transparent);
    color: var(--color-text-muted);
    border: 1px solid color-mix(in oklch, var(--color-accent) 25%, transparent);
  }

  /* Action buttons */
  .webcam-tool__actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* ── Error ── */
  .webcam-tool__error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
    background: var(--color-surface);
  }

  .webcam-tool__error-msg {
    margin: 0;
    font-size: var(--font-size-small);
    line-height: 1.6;
    color: var(--color-error);
  }

  /* ── Shared buttons ── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--r-md);
    border: none;
    background: var(--color-text);
    color: var(--color-bg);
    font-family: var(--font-family-sans);
    font-size: var(--font-size-small);
    font-weight: 500;
    cursor: pointer;
    transition: opacity var(--dur-fast) var(--ease-out);
  }

  .btn-primary:hover {
    opacity: 0.85;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--r-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-family-sans);
    font-size: var(--font-size-small);
    font-weight: 400;
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
  }

  .btn-secondary:hover {
    border-color: var(--color-text-muted);
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--r-md);
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-family: var(--font-family-sans);
    font-size: var(--font-size-small);
    font-weight: 400;
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease-out);
  }

  .btn-ghost:hover {
    color: var(--color-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
      border-top-color: var(--color-text-subtle);
    }
    .toggle,
    .toggle__thumb {
      transition: none;
    }
  }
</style>
