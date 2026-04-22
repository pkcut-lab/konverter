import type { FormatterConfig } from './schemas';

/**
 * Zeitzonen-Rechner — converts time between common timezones.
 * Pure client-side, no server contact. Uses Intl.DateTimeFormat for
 * timezone-aware formatting. Input format: "HH:MM IANA-Timezone" or
 * "HH:MM:SS IANA-Timezone". Output: formatted time in all configured zones.
 *
 * Differentiators (from dossier §2.4):
 * - DST awareness via Intl.DateTimeFormat (shows UTC offset per zone)
 * - Privacy-first: no server, no tracking
 * - Meeting-planner concept: see multiple zones at once
 */

/** Common timezones for the converter output. */
export const TIMEZONE_PRESETS = [
  { id: 'Europe/Berlin', label: 'Berlin (MEZ/MESZ)' },
  { id: 'Europe/London', label: 'London (GMT/BST)' },
  { id: 'America/New_York', label: 'New York (EST/EDT)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { id: 'Asia/Tokyo', label: 'Tokio (JST)' },
  { id: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { id: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
  { id: 'Asia/Kolkata', label: 'Kolkata (IST)' },
] as const;

/** Regex for input: "HH:MM" or "HH:MM:SS" followed by a space and IANA timezone. */
const INPUT_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(.+)$/;

/**
 * Parses the user input and returns a Date object anchored to today in the
 * specified source timezone.
 */
export function parseTimezoneInput(input: string): {
  date: Date;
  sourceZone: string;
} {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error(
      'Bitte Zeit und Zeitzone eingeben, z.\u00A0B. "14:30 Europe/Berlin".',
    );
  }

  const match = trimmed.match(INPUT_RE);
  if (!match) {
    throw new Error(
      'Format: HH:MM Zeitzone (z.\u00A0B. "14:30 Europe/Berlin" oder "09:00 America/New_York").',
    );
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] !== undefined ? Number(match[3]) : 0;
  const sourceZone = match[4].trim();

  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw new Error('Ungültige Uhrzeit. Stunden: 0–23, Minuten/Sekunden: 0–59.');
  }

  // Validate that the timezone is recognized by Intl
  try {
    Intl.DateTimeFormat('de-DE', { timeZone: sourceZone });
  } catch {
    throw new Error(
      `Unbekannte Zeitzone "${sourceZone}". Verwende IANA-Format, z.\u00A0B. "Europe/Berlin".`,
    );
  }

  // Build a Date for today in the source timezone.
  // Strategy: create a date string for today, format it in the source zone,
  // then compute the UTC equivalent.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const day = now.getDate();

  // Create a reference date in UTC, then adjust for the source timezone offset.
  const utcGuess = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

  // Get the offset of the source timezone at this approximate time
  const offsetMs = getTimezoneOffsetMs(utcGuess, sourceZone);
  const date = new Date(utcGuess.getTime() - offsetMs);

  return { date, sourceZone };
}

/**
 * Returns the UTC offset in milliseconds for a given timezone at a given instant.
 * Positive = east of UTC (ahead), negative = west (behind).
 */
export function getTimezoneOffsetMs(date: Date, timeZone: string): number {
  // Format the date parts in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };

  const localInZone = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') === 24 ? 0 : get('hour'),
    get('minute'),
    get('second'),
  );

  return localInZone - date.getTime();
}

/**
 * Formats a Date into all preset timezones, returning a multi-line string.
 */
export function formatAllZones(date: Date): string {
  const lines: string[] = [];

  for (const zone of TIMEZONE_PRESETS) {
    const fmt = new Intl.DateTimeFormat('de-DE', {
      timeZone: zone.id,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'shortOffset',
    });
    const timeStr = fmt.format(date);
    lines.push(`${zone.label}: ${timeStr}`);
  }

  return lines.join('\n');
}

/**
 * Main format function for the Formatter component.
 * Input: "HH:MM Timezone" → Output: time in all preset zones.
 */
function convertTimezone(input: string): string {
  const { date } = parseTimezoneInput(input);
  return formatAllZones(date);
}

export const zeitzonenRechner: FormatterConfig = {
  id: 'timezone-converter',
  type: 'formatter',
  categoryId: 'time',
  mode: 'custom',
  format: convertTimezone,
  placeholder: '14:30 Europe/Berlin',
};
