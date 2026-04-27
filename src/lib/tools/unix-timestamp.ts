import type { FormatterConfig } from './schemas';

/**
 * Unix Timestamp — converts between Unix timestamps (seconds or milliseconds)
 * and human-readable dates. Auto-detects the direction from the input shape:
 *  - 10-digit integer → seconds since epoch
 *  - 13-digit integer → milliseconds since epoch
 *  - Anything else → parsed as a date string (ISO-8601 preferred).
 * Pure client-side, no server contact.
 */

const TEN_DIGIT_RE = /^-?\d{1,11}$/; // tolerate 1..11 digits for historical dates & future
const THIRTEEN_DIGIT_RE = /^-?\d{12,14}$/;

function pad(n: number, w = 2): string {
  return String(n).padStart(w, '0');
}

function formatUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
  );
}

function formatLocal(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(d);
}

function formatRelative(d: Date, now = new Date()): string {
  const diffMs = d.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const units: Array<[number, string]> = [
    [1000, 'Sekunden'],
    [60 * 1000, 'Minuten'],
    [60 * 60 * 1000, 'Stunden'],
    [24 * 60 * 60 * 1000, 'Tagen'],
    [30 * 24 * 60 * 60 * 1000, 'Monaten'],
    [365 * 24 * 60 * 60 * 1000, 'Jahren'],
  ];
  if (absMs < units[0]![0]) return 'gerade eben';
  let value = 0;
  let label = 'Sekunden';
  for (let i = units.length - 1; i >= 0; i--) {
    if (absMs >= units[i]![0]) {
      value = Math.floor(absMs / units[i]![0]);
      label = units[i]![1];
      break;
    }
  }
  return diffMs > 0 ? `in ${value} ${label}` : `vor ${value} ${label}`;
}

function buildReport(d: Date, interpretedAs: string): string {
  const s = Math.floor(d.getTime() / 1000);
  const ms = d.getTime();
  return [
    `Interpretiert als: ${interpretedAs}`,
    '',
    `UTC:         ${formatUtc(d)}`,
    `Lokalzeit:   ${formatLocal(d)}`,
    `ISO 8601:    ${d.toISOString()}`,
    '',
    `Unix (s):    ${s}`,
    `Unix (ms):   ${ms}`,
    '',
    `Relativ:     ${formatRelative(d)}`,
  ].join('\n');
}

/** Discriminator for the parsed input kind — used by the UI to render an
 *  i18n label without re-parsing. */
export type TimestampInputKind = 'seconds' | 'milliseconds' | 'date';

export interface ParsedTimestampInput {
  date: Date;
  kind: TimestampInputKind;
  /** Original numeric value when kind ∈ {seconds, milliseconds}, or the
   *  trimmed input string when kind === 'date'. */
  raw: string | number;
  /**
   * Backwards-compat human-readable label in German. Existing tests + the
   * legacy formatter shell read this. The new Svelte component ignores this
   * field and renders its own i18n label from `kind`.
   */
  interpretedAs: string;
}

export function parseTimestampInput(raw: string): ParsedTimestampInput {
  const trimmed = raw.trim();
  if (trimmed === '') {
    throw new Error(
      'Bitte Timestamp (z. B. 1700000000) oder Datum (z. B. 2024-03-15) eingeben.',
    );
  }

  if (TEN_DIGIT_RE.test(trimmed)) {
    const n = Number(trimmed);
    return {
      date: new Date(n * 1000),
      kind: 'seconds',
      raw: n,
      interpretedAs: `Unix-Timestamp in Sekunden (${n})`,
    };
  }
  if (THIRTEEN_DIGIT_RE.test(trimmed)) {
    const n = Number(trimmed);
    return {
      date: new Date(n),
      kind: 'milliseconds',
      raw: n,
      interpretedAs: `Unix-Timestamp in Millisekunden (${n})`,
    };
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    throw new Error(
      'Eingabe nicht erkannt. Unterstützt: Unix-Sekunden (10 Stellen), Unix-ms (13 Stellen), ISO-8601 oder jedes vom Browser erkannte Datum.',
    );
  }
  return {
    date: parsed,
    kind: 'date',
    raw: trimmed,
    interpretedAs: `Datum (${trimmed})`,
  };
}

function formatUnixTimestamp(input: string): string {
  const { date, interpretedAs } = parseTimestampInput(input);
  return buildReport(date, interpretedAs);
}

export const unixTimestamp: FormatterConfig = {
  id: 'unix-timestamp',
  type: 'formatter',
  categoryId: 'time',
  mode: 'custom',
  format: formatUnixTimestamp,
  placeholder: '1700000000\n\noder:\n2024-03-15T12:00:00Z',
};
