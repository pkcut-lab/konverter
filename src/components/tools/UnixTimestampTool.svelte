<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    parseTimestampInput,
    type TimestampInputKind,
  } from '../../lib/tools/unix-timestamp';
  import { INTL_LOCALE_MAP } from '../../lib/i18n/locale-maps';
  import type { Lang } from '../../lib/i18n/lang';

  /**
   * Unix Timestamp Converter — bidirectional with date-picker.
   *
   * Replaces the generic-Formatter rendering of the unix-timestamp tool.
   * Adds: a <input type="datetime-local"> picker, a "Now" button, structured
   * output panel (UTC / Local / ISO 8601 / Unix-s / Unix-ms / Relative),
   * per-row copy buttons, full i18n via `lang` prop. Audit P0-2.4
   * (2026-04-27) — output labels were hardcoded German on EN pages.
   */

  interface Props {
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;

  // ── Tiny inline string lookup. The strings.ts global registry doesn't
  // currently have a unix-timestamp namespace; we keep these here so the
  // rollout is surgical, and a future i18n migration round can fold them
  // into strings.ts unchanged. The lint guard scans for known DE stop-
  // words, none of which appear below.
  const STR = $derived(
    lang === 'en'
      ? {
          inputLabel: 'Timestamp or date',
          inputHint: 'Auto-detects: 10 digits = seconds, 13 = ms, anything else = ISO-8601 / Date string.',
          pickerLabel: 'Or pick a date and time (local)',
          nowBtn: 'Now',
          interpretedAsLabel: 'Interpreted as',
          interpretedSeconds: (n: number | string) => `Unix timestamp in seconds (${n})`,
          interpretedMs: (n: number | string) => `Unix timestamp in milliseconds (${n})`,
          interpretedDate: (s: number | string) => `Date string (${s})`,
          rowUtc: 'UTC',
          rowLocal: 'Local',
          rowIso: 'ISO 8601',
          rowUnixS: 'Unix (s)',
          rowUnixMs: 'Unix (ms)',
          rowRelative: 'Relative',
          relJustNow: 'just now',
          relIn: (v: number, u: string) => `in ${v} ${u}`,
          relAgo: (v: number, u: string) => `${v} ${u} ago`,
          unitsRel: ['seconds', 'minutes', 'hours', 'days', 'months', 'years'] as const,
          copyBtnAria: 'Copy this value',
          copied: 'Copied',
          empty: 'Enter a timestamp or pick a date above.',
          errPrefix: 'Error',
        }
      : {
          inputLabel: 'Timestamp oder Datum',
          inputHint: 'Auto-Erkennung: 10 Stellen = Sekunden, 13 = ms, sonst ISO-8601 / Datums-String.',
          pickerLabel: 'Oder Datum und Uhrzeit wählen (lokal)',
          nowBtn: 'Jetzt',
          interpretedAsLabel: 'Erkannt als',
          interpretedSeconds: (n: number | string) => `Unix-Timestamp in Sekunden (${n})`,
          interpretedMs: (n: number | string) => `Unix-Timestamp in Millisekunden (${n})`,
          interpretedDate: (s: number | string) => `Datum (${s})`,
          rowUtc: 'UTC',
          rowLocal: 'Lokalzeit',
          rowIso: 'ISO 8601',
          rowUnixS: 'Unix (s)',
          rowUnixMs: 'Unix (ms)',
          rowRelative: 'Relativ',
          relJustNow: 'gerade eben',
          relIn: (v: number, u: string) => `in ${v} ${u}`,
          relAgo: (v: number, u: string) => `vor ${v} ${u}`,
          unitsRel: ['Sekunden', 'Minuten', 'Stunden', 'Tagen', 'Monaten', 'Jahren'] as const,
          copyBtnAria: 'Diesen Wert kopieren',
          copied: 'Kopiert',
          empty: 'Timestamp eingeben oder Datum wählen.',
          errPrefix: 'Fehler',
        },
  );

  let inputStr = $state<string>('');
  let pickerValue = $state<string>('');
  let copyState = $state<{ key: string; t: number } | null>(null);

  // Always resolve a current Date if either field is filled.
  const result = $derived.by(() => {
    if (inputStr.trim()) {
      try {
        return parseTimestampInput(inputStr);
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) } as const;
      }
    }
    if (pickerValue) {
      const d = new Date(pickerValue);
      if (!isNaN(d.getTime())) {
        return { date: d, kind: 'date' as TimestampInputKind, raw: pickerValue, interpretedAs: '' };
      }
    }
    return null;
  });

  function pad(n: number, w = 2) {
    return String(n).padStart(w, '0');
  }
  function formatUtc(d: Date): string {
    return (
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
      `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
    );
  }
  function formatLocal(d: Date): string {
    try {
      return new Intl.DateTimeFormat(INTL_LOCALE_MAP[lang], {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short',
      }).format(d);
    } catch {
      return d.toString();
    }
  }
  function formatRelative(d: Date, now = new Date()): string {
    const diffMs = d.getTime() - now.getTime();
    const absMs = Math.abs(diffMs);
    const breakpoints = [
      [1000],
      [60 * 1000],
      [60 * 60 * 1000],
      [24 * 60 * 60 * 1000],
      [30 * 24 * 60 * 60 * 1000],
      [365 * 24 * 60 * 60 * 1000],
    ];
    if (absMs < breakpoints[0]![0]!) return STR.relJustNow;
    let value = 0;
    let unitIdx = 0;
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      if (absMs >= breakpoints[i]![0]!) {
        value = Math.floor(absMs / breakpoints[i]![0]!);
        unitIdx = i;
        break;
      }
    }
    const unit = STR.unitsRel[unitIdx]!;
    return diffMs > 0 ? STR.relIn(value, unit) : STR.relAgo(value, unit);
  }
  function interpretedLabel(r: { kind: TimestampInputKind; raw: string | number }): string {
    if (r.kind === 'seconds') return STR.interpretedSeconds(r.raw);
    if (r.kind === 'milliseconds') return STR.interpretedMs(r.raw);
    return STR.interpretedDate(r.raw);
  }

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copyState = { key, t: Date.now() };
      setTimeout(() => {
        if (copyState && copyState.key === key) copyState = null;
      }, 1500);
    } catch {
      // Clipboard blocked — silently no-op; user still sees the value.
    }
  }

  function setNow() {
    const n = new Date();
    pickerValue = '';
    inputStr = String(Math.floor(n.getTime() / 1000));
  }

  // When the picker is touched, mirror to inputStr-ish by clearing inputStr.
  function onPickerInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    pickerValue = v;
    if (v) inputStr = '';
  }
</script>

<div class="ts-tool">
  <div class="ts-tool__row">
    <label class="ts-tool__field">
      <span class="ts-tool__label">{STR.inputLabel}</span>
      <input
        type="text"
        bind:value={inputStr}
        placeholder="1700000000"
        aria-describedby="ts-hint"
      />
      <span class="ts-tool__hint" id="ts-hint">{STR.inputHint}</span>
    </label>
    <label class="ts-tool__field">
      <span class="ts-tool__label">{STR.pickerLabel}</span>
      <span class="ts-tool__picker-row">
        <input
          type="datetime-local"
          step="1"
          value={pickerValue}
          oninput={onPickerInput}
          aria-label={STR.pickerLabel}
        />
        <button type="button" class="ts-tool__now" onclick={setNow}>{STR.nowBtn}</button>
      </span>
    </label>
  </div>

  {#if result && 'error' in result}
    <p class="ts-tool__error" role="alert">
      {STR.errPrefix}: {result.error}
    </p>
  {:else if result}
    <dl class="ts-tool__panel" aria-live="polite">
      <div class="ts-tool__interpreted">
        <span class="ts-tool__label">{STR.interpretedAsLabel}</span>
        <span>{interpretedLabel(result)}</span>
      </div>

      {#each [
        { key: 'utc', label: STR.rowUtc, value: formatUtc(result.date) },
        { key: 'local', label: STR.rowLocal, value: formatLocal(result.date) },
        { key: 'iso', label: STR.rowIso, value: result.date.toISOString() },
        { key: 'unix-s', label: STR.rowUnixS, value: String(Math.floor(result.date.getTime() / 1000)) },
        { key: 'unix-ms', label: STR.rowUnixMs, value: String(result.date.getTime()) },
        { key: 'rel', label: STR.rowRelative, value: formatRelative(result.date) },
      ] as row (row.key)}
        <div class="ts-tool__row-out">
          <dt class="ts-tool__row-label">{row.label}</dt>
          <dd class="ts-tool__row-val">
            <span class="ts-tool__val-text" data-testid={`ts-${row.key}`}>{row.value}</span>
            <button
              type="button"
              class="ts-tool__copy"
              aria-label={STR.copyBtnAria}
              onclick={() => copyValue(row.key, row.value)}
            >
              {copyState?.key === row.key ? STR.copied : '⧉'}
            </button>
          </dd>
        </div>
      {/each}
    </dl>
  {:else}
    <p class="ts-tool__empty">{STR.empty}</p>
  {/if}
</div>

<style>
  .ts-tool { display: flex; flex-direction: column; gap: var(--space-4); }

  .ts-tool__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
  }
  @media (max-width: 40rem) {
    .ts-tool__row { grid-template-columns: 1fr; }
  }

  .ts-tool__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .ts-tool__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .ts-tool__field input[type="text"],
  .ts-tool__field input[type="datetime-local"] {
    appearance: none;
    flex: 1;
    width: 100%;
    padding: var(--space-3);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    font: inherit;
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .ts-tool__field input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }
  .ts-tool__hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
    line-height: 1.4;
  }

  .ts-tool__picker-row {
    display: flex;
    gap: var(--space-2);
    align-items: stretch;
  }
  .ts-tool__now {
    appearance: none;
    padding: 0 var(--space-4);
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    border-radius: var(--r-md);
    font: inherit;
    font-size: var(--font-size-small);
    font-weight: 500;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .ts-tool__now:hover {
    background: var(--color-text-muted);
  }
  .ts-tool__now:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .ts-tool__panel {
    margin: 0;
    padding: var(--space-5);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .ts-tool__interpreted {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }
  .ts-tool__row-out {
    display: grid;
    grid-template-columns: minmax(7rem, auto) 1fr;
    gap: var(--space-4);
    align-items: center;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .ts-tool__row-out:last-child {
    border-bottom: none;
  }
  .ts-tool__row-label {
    margin: 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .ts-tool__row-val {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
    font-size: var(--font-size-small);
  }
  .ts-tool__val-text {
    overflow-wrap: anywhere;
  }
  .ts-tool__copy {
    appearance: none;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .ts-tool__copy:hover {
    border-color: var(--color-text-muted);
    color: var(--color-text);
  }
  .ts-tool__copy:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .ts-tool__empty {
    padding: var(--space-5);
    margin: 0;
    background: var(--color-bg);
    border: 1px dashed var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text-subtle);
    text-align: center;
    font-size: var(--font-size-small);
  }

  .ts-tool__error {
    margin: 0;
    padding: var(--space-4);
    background: var(--color-bg);
    border: 1px solid var(--color-error);
    border-radius: var(--r-md);
    color: var(--color-error);
    font-size: var(--font-size-small);
  }

  @media (prefers-reduced-motion: reduce) {
    .ts-tool__field input,
    .ts-tool__now,
    .ts-tool__copy { transition: none; }
  }
</style>
