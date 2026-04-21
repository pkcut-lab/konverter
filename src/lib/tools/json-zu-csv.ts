import type { FormatterConfig } from './schemas';

/**
 * JSON-zu-CSV — converts JSON (array-of-objects, single object, or nested
 * structures) into CSV with automatic dot-notation flattening.
 * Pure client-side, no server contact, no dependencies.
 *
 * Input: valid JSON (array of objects preferred, single object wrapped).
 * Output: CSV with header row + data rows, RFC 4180 escaping.
 */

/**
 * Flatten a nested object into a single-level record with dot-notation keys.
 * Arrays are stringified as JSON.
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix: string,
  out: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      out[path] = '';
    } else if (Array.isArray(value)) {
      // Arrays: stringify as JSON (compact)
      out[path] = JSON.stringify(value);
    } else if (typeof value === 'object') {
      flattenObject(value as Record<string, unknown>, path, out);
    } else {
      out[path] = String(value);
    }
  }
}

/**
 * Escape a CSV field according to RFC 4180.
 * Fields containing commas, double quotes, or newlines are wrapped in quotes.
 * Double quotes within are doubled.
 */
function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatJsonToCsv(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte JSON eingeben — ein Array von Objekten oder ein einzelnes Objekt.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : 'Unbekannter Fehler';
    throw new Error(`Syntaxfehler im JSON: ${msg}`);
  }

  // Normalise to array of objects
  let rows: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error('Das JSON-Array ist leer — es gibt keine Daten zum Konvertieren.');
    }
    // Filter to objects only (skip primitives in array)
    rows = parsed.filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    );
    if (rows.length === 0) {
      throw new Error(
        'Das Array enthält keine Objekte. JSON-zu-CSV benötigt ein Array von Objekten (z. B. [{"name": "Alice"}]).',
      );
    }
  } else if (parsed !== null && typeof parsed === 'object') {
    rows = [parsed as Record<string, unknown>];
  } else {
    throw new Error(
      'Erwarte ein JSON-Objekt oder ein Array von Objekten. Primitive Werte (String, Zahl, Boolean) können nicht in CSV konvertiert werden.',
    );
  }

  // Flatten all rows and collect all headers
  const flatRows: Record<string, string>[] = [];
  const headerSet = new Set<string>();

  for (const row of rows) {
    const flat: Record<string, string> = {};
    flattenObject(row, '', flat);
    flatRows.push(flat);
    for (const key of Object.keys(flat)) {
      headerSet.add(key);
    }
  }

  // Stable header order: insertion order from first occurrence across all rows
  const headers = [...headerSet];

  // Build CSV
  const headerLine = headers.map(escapeCsvField).join(',');
  const dataLines = flatRows.map((flat) =>
    headers.map((h) => escapeCsvField(flat[h] ?? '')).join(','),
  );

  return [headerLine, ...dataLines].join('\n');
}

export const jsonZuCsv: FormatterConfig = {
  id: 'json-zu-csv',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: formatJsonToCsv,
};
