<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    computeMoonPhase,
    PHASE_NAMES_DE,
    PHASE_NAMES_EN,
  } from '../../lib/tools/mondphasen-rechner';
  import { dispatchToolUsed } from '../../lib/tracking';

  interface Props {
    config: FormatterConfig;
    lang?: string;
  }
  let { config, lang = 'de' }: Props = $props();
  void config;

  const PHASE_NAMES = $derived(lang === 'en' ? PHASE_NAMES_EN : PHASE_NAMES_DE);

  function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  let dateStr = $state(todayStr());

  const result = $derived.by(() => {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T12:00:00Z');
    if (isNaN(d.getTime())) return null;
    return computeMoonPhase(d);
  });

  // Track first use
  let _tracked = false;
  $effect(() => {
    if (!_tracked && result !== null) {
      _tracked = true;
      dispatchToolUsed({ slug: config.id, category: config.categoryId, locale: lang });
    }
  });

  function formatDate(d: Date): string {
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'de-DE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  /**
   * Build an SVG path for the moon terminator.
   * The moon disc is a circle of radius R centered at (cx, cy).
   * We draw the lit portion: a semicircle on the correct side plus an ellipse arc.
   *
   * illumination: 0–1
   * waxing: true = lit on right, false = lit on left
   */
  function moonPath(illumination: number, waxing: boolean): string {
    const R = 80;
    const cx = 100;
    const cy = 100;

    if (illumination <= 0.01) return ''; // new moon – no lit path
    if (illumination >= 0.99) {
      // full moon – complete circle
      return `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx} ${cy + R} A ${R} ${R} 0 1 1 ${cx} ${cy - R} Z`;
    }

    // The terminator ellipse x-axis: positive = bulge toward lit side
    // At 50% illumination, terminatorX = 0 (straight line / first quarter)
    // At 25% illumination, terminatorX = R (full crescent)
    // At 75% illumination, terminatorX = -R (full gibbous looks wide)
    const terminatorX = R * Math.cos(illumination * Math.PI);

    const litRight = waxing;
    // Arc direction for outer semicircle:
    // Lit right → draw right semicircle top→bottom sweep=1
    // Lit left  → draw left semicircle top→bottom sweep=0
    const outerSweep = litRight ? 1 : 0;
    // The terminator ellipse closes the shape
    // terminatorX positive → ellipse bulges away from lit side (crescent)
    // terminatorX negative → ellipse bulges toward lit side (gibbous)
    // For lit-right: terminator is on left half. If waxing crescent (illum<0.5),
    // ellipse rx is positive and sweeps from bottom to top on lit side.
    const ellipseSweep = litRight ? (illumination < 0.5 ? 1 : 0) : (illumination < 0.5 ? 0 : 1);
    const absRx = Math.abs(terminatorX);

    return [
      `M ${cx} ${cy - R}`,
      // Outer semicircle (always radius R, lit side)
      `A ${R} ${R} 0 0 ${outerSweep} ${cx} ${cy + R}`,
      // Terminator ellipse back to top
      `A ${absRx || 0.1} ${R} 0 0 ${ellipseSweep} ${cx} ${cy - R}`,
      'Z',
    ].join(' ');
  }

  const i18n = {
    de: {
      label: 'Datum wählen',
      phaseName: 'Phase',
      illumination: 'Beleuchtung',
      moonAge: 'Mondalter',
      days: 'Tage',
      waxing: 'Zunehmend',
      waning: 'Abnehmend',
      nextFull: 'Nächster Vollmond',
      nextNew: 'Nächster Neumond',
      in: 'in',
      privacy: 'Kein Server-Upload · Berechnung lokal im Browser',
    },
    en: {
      label: 'Select date',
      phaseName: 'Phase',
      illumination: 'Illumination',
      moonAge: 'Lunar age',
      days: 'days',
      waxing: 'Waxing',
      waning: 'Waning',
      nextFull: 'Next full moon',
      nextNew: 'Next new moon',
      in: 'in',
      privacy: 'No server upload · Calculated locally in your browser',
    },
  } as const;

  type LangKey = keyof typeof i18n;
  const s = $derived(i18n[(lang as LangKey) in i18n ? (lang as LangKey) : 'de']);
</script>

<div class="moon-tool" aria-label={lang === 'en' ? 'Moon phase calculator' : 'Mondphasen-Rechner'}>

  <!-- Date input -->
  <div class="date-row">
    <label class="date-label" for="moon-date">{s.label}</label>
    <input
      id="moon-date"
      type="date"
      class="date-input"
      bind:value={dateStr}
      aria-label={s.label}
    />
  </div>

  {#if result}
    <div class="result-layout">

      <!-- Moon SVG -->
      <div class="moon-visual" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          class="moon-svg"
          role="img"
          aria-label={PHASE_NAMES[result.phaseIndex]}
        >
          <!-- Dark disc (shadow side) -->
          <circle cx="100" cy="100" r="80" class="moon-dark" />

          <!-- Surface texture rings (subtle depth) -->
          <circle cx="100" cy="100" r="80" class="moon-ring" fill="none" stroke-width="0.5" />
          <circle cx="100" cy="100" r="60" class="moon-ring" fill="none" stroke-width="0.3" />
          <circle cx="100" cy="100" r="40" class="moon-ring" fill="none" stroke-width="0.2" />

          <!-- Lit portion -->
          {#if result.illumination > 0.01}
            <path
              d={moonPath(result.illumination, result.waxing)}
              class="moon-lit"
              clip-path="url(#moon-clip)"
            />
          {/if}

          <!-- Clip to disc -->
          <defs>
            <clipPath id="moon-clip">
              <circle cx="100" cy="100" r="80" />
            </clipPath>
          </defs>

          <!-- Outer glow ring -->
          <circle cx="100" cy="100" r="80" class="moon-border" fill="none" />
        </svg>

        <!-- Phase label under moon -->
        <p class="moon-phase-label">{PHASE_NAMES[result.phaseIndex]}</p>
        <p class="moon-direction">
          {result.waxing ? s.waxing : s.waning}
          · {Math.round(result.illumination * 100)}&nbsp;%
        </p>
      </div>

      <!-- Stats grid -->
      <div class="stats">

        <div class="stat-card stat-card--accent">
          <span class="stat-label">{s.phaseName}</span>
          <span class="stat-value">{PHASE_NAMES[result.phaseIndex]}</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">{s.illumination}</span>
          <span class="stat-value">{Math.round(result.illumination * 100)}<span class="stat-unit">&nbsp;%</span></span>
          <div class="illumination-bar" aria-hidden="true">
            <div class="illumination-fill" style="width: {Math.round(result.illumination * 100)}%"></div>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-label">{s.moonAge}</span>
          <span class="stat-value">{result.age.toFixed(1)}<span class="stat-unit">&nbsp;{s.days}</span></span>
        </div>

        <div class="stat-card">
          <span class="stat-label">{s.nextFull}</span>
          <span class="stat-value stat-value--sm">{formatDate(result.nextFull)}</span>
          <span class="stat-sub">{s.in} {Math.ceil(result.daysToFull)}&nbsp;{s.days}</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">{s.nextNew}</span>
          <span class="stat-value stat-value--sm">{formatDate(result.nextNew)}</span>
          <span class="stat-sub">{s.in} {Math.ceil(result.daysToNew)}&nbsp;{s.days}</span>
        </div>

      </div>
    </div>
  {/if}

  <p class="privacy-badge">{s.privacy}</p>

</div>

<style>
  .moon-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Date row */
  .date-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .date-label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .date-input {
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 1rem;
    font-family: var(--font-family-mono);
    padding: var(--space-3) var(--space-3);
    min-height: 2.75rem;
    max-width: 16rem;
    outline: none;
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
    cursor: pointer;
  }

  .date-input:focus {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }

  /* Layout */
  .result-layout {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-8);
    align-items: start;
  }

  @media (max-width: 580px) {
    .result-layout {
      grid-template-columns: 1fr;
      justify-items: center;
    }
  }

  /* Moon SVG */
  .moon-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .moon-svg {
    filter: drop-shadow(0 0 18px color-mix(in oklch, var(--color-text) 8%, transparent));
    transition: filter var(--dur-base) var(--ease-out);
  }

  .moon-dark {
    fill: var(--color-surface);
    stroke: var(--color-border);
    stroke-width: 1;
  }

  .moon-ring {
    stroke: var(--color-border);
    opacity: 0.35;
  }

  .moon-lit {
    fill: #d4c89a;
  }

  :global([data-theme='dark']) .moon-lit {
    fill: #e8d9a0;
  }

  .moon-border {
    stroke: var(--color-border);
    stroke-width: 1.5;
    opacity: 0.6;
  }

  .moon-phase-label {
    margin: 0;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.03em;
    text-align: center;
  }

  .moon-direction {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    text-align: center;
  }

  /* Stats grid */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: var(--space-3);
    align-content: start;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .stat-card--accent {
    border-color: var(--color-text);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    font-weight: 500;
  }

  .stat-value {
    font-size: 1.375rem;
    font-family: var(--font-family-mono);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.2;
  }

  .stat-value--sm {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .stat-unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .stat-sub {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    margin-top: var(--space-1);
  }

  /* Illumination bar */
  .illumination-bar {
    margin-top: var(--space-2);
    height: 3px;
    background: var(--color-border);
    border-radius: 9999px;
    overflow: hidden;
  }

  .illumination-fill {
    height: 100%;
    background: var(--color-text);
    border-radius: 9999px;
    transition: width var(--dur-base) var(--ease-out);
  }

  /* Privacy */
  .privacy-badge {
    margin: 0;
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-align: center;
    padding-top: var(--space-1);
    border-top: 1px solid var(--color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .moon-svg,
    .date-input,
    .illumination-fill {
      transition: none;
    }
  }
</style>
