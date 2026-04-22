import { describe, it, expect } from 'vitest';
import {
  zeitzonenRechner,
  parseTimezoneInput,
  formatAllZones,
  TIMEZONE_PRESETS,
} from '../../../src/lib/tools/zeitzonen-rechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('zeitzonenRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(zeitzonenRechner);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(zeitzonenRechner.id).toBe('timezone-converter');
    expect(zeitzonenRechner.type).toBe('formatter');
    expect(zeitzonenRechner.categoryId).toBe('time');
    expect(zeitzonenRechner.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...zeitzonenRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('TIMEZONE_PRESETS', () => {
  it('contains 10 presets', () => {
    expect(TIMEZONE_PRESETS).toHaveLength(10);
  });

  it('all presets have id and label', () => {
    for (const preset of TIMEZONE_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.label).toBeTruthy();
    }
  });

  it('all timezone ids are valid IANA zones', () => {
    for (const preset of TIMEZONE_PRESETS) {
      expect(() => {
        Intl.DateTimeFormat('de-DE', { timeZone: preset.id });
      }).not.toThrow();
    }
  });
});

describe('parseTimezoneInput', () => {
  it('parses HH:MM with timezone', () => {
    const result = parseTimezoneInput('14:30 Europe/Berlin');
    expect(result.sourceZone).toBe('Europe/Berlin');
    expect(result.date).toBeInstanceOf(Date);
  });

  it('parses HH:MM:SS with timezone', () => {
    const result = parseTimezoneInput('14:30:45 Europe/Berlin');
    expect(result.sourceZone).toBe('Europe/Berlin');
    expect(result.date).toBeInstanceOf(Date);
  });

  it('parses single-digit hour', () => {
    const result = parseTimezoneInput('9:00 America/New_York');
    expect(result.sourceZone).toBe('America/New_York');
  });

  it('throws on empty input', () => {
    expect(() => parseTimezoneInput('')).toThrow('Bitte Zeit und Zeitzone eingeben');
    expect(() => parseTimezoneInput('   ')).toThrow('Bitte Zeit und Zeitzone eingeben');
  });

  it('throws on invalid format', () => {
    expect(() => parseTimezoneInput('1430 Europe/Berlin')).toThrow('Format:');
    expect(() => parseTimezoneInput('14:30')).toThrow('Format:');
    expect(() => parseTimezoneInput('Europe/Berlin')).toThrow('Format:');
  });

  it('throws on invalid time values', () => {
    expect(() => parseTimezoneInput('25:00 Europe/Berlin')).toThrow('Ungültige Uhrzeit');
    expect(() => parseTimezoneInput('14:60 Europe/Berlin')).toThrow('Ungültige Uhrzeit');
    expect(() => parseTimezoneInput('14:30:60 Europe/Berlin')).toThrow('Ungültige Uhrzeit');
  });

  it('throws on unknown timezone', () => {
    expect(() => parseTimezoneInput('14:30 Foo/Bar')).toThrow('Unbekannte Zeitzone');
  });

  it('accepts various valid IANA timezones', () => {
    expect(() => parseTimezoneInput('12:00 Asia/Tokyo')).not.toThrow();
    expect(() => parseTimezoneInput('12:00 America/Los_Angeles')).not.toThrow();
    expect(() => parseTimezoneInput('12:00 Australia/Sydney')).not.toThrow();
    expect(() => parseTimezoneInput('12:00 UTC')).not.toThrow();
  });
});

describe('formatAllZones', () => {
  it('returns one line per preset timezone', () => {
    const date = new Date(Date.UTC(2026, 3, 21, 12, 0, 0)); // 2026-04-21 12:00 UTC
    const result = formatAllZones(date);
    const lines = result.split('\n');
    expect(lines).toHaveLength(TIMEZONE_PRESETS.length);
  });

  it('each line contains the zone label', () => {
    const date = new Date(Date.UTC(2026, 3, 21, 12, 0, 0));
    const result = formatAllZones(date);
    for (const preset of TIMEZONE_PRESETS) {
      expect(result).toContain(preset.label);
    }
  });

  it('contains time-like patterns in each line', () => {
    const date = new Date(Date.UTC(2026, 3, 21, 12, 0, 0));
    const result = formatAllZones(date);
    const lines = result.split('\n');
    for (const line of lines) {
      // Each line should contain a colon-separated time
      expect(line).toMatch(/\d{2}:\d{2}/);
    }
  });
});

describe('zeitzonenRechner format (integration)', () => {
  it('converts a valid input and returns multi-line output', () => {
    const result = zeitzonenRechner.format('12:00 UTC');
    const lines = result.split('\n');
    expect(lines).toHaveLength(TIMEZONE_PRESETS.length);
  });

  it('throws on empty input', () => {
    expect(() => zeitzonenRechner.format('')).toThrow('Bitte Zeit und Zeitzone eingeben');
  });

  it('throws on malformed input', () => {
    expect(() => zeitzonenRechner.format('abc')).toThrow('Format:');
  });

  it('output contains Berlin line', () => {
    const result = zeitzonenRechner.format('12:00 UTC');
    expect(result).toContain('Berlin');
  });

  it('output contains Tokyo line', () => {
    const result = zeitzonenRechner.format('12:00 UTC');
    expect(result).toContain('Tokio');
  });
});
