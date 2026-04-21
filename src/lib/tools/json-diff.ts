import type { FormatterConfig } from './schemas';

/**
 * JSON-Diff — compares two JSON documents and reports differences with
 * JSON-Path locations and type-change detection.
 * Pure client-side, no server contact, no dependencies.
 *
 * Input convention: both JSON documents separated by a line containing
 * only "===" (the Formatter component provides a single textarea).
 * Output: human-readable diff report with one line per difference,
 * each prefixed by its JSON-Path (e.g. $.items[0].name).
 */

interface DiffEntry {
  path: string;
  kind: 'added' | 'removed' | 'changed' | 'type-changed';
  oldValue?: unknown;
  newValue?: unknown;
  oldType?: string;
  newType?: string;
}

function typeLabel(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function formatValue(v: unknown): string {
  if (typeof v === 'string') return `"${v}"`;
  return JSON.stringify(v);
}

/**
 * Recursively compare two parsed JSON values and collect differences.
 */
function collectDiffs(
  a: unknown,
  b: unknown,
  path: string,
  out: DiffEntry[],
  ignoreArrayOrder: boolean,
): void {
  const typeA = typeLabel(a);
  const typeB = typeLabel(b);

  if (typeA !== typeB) {
    out.push({
      path,
      kind: 'type-changed',
      oldValue: a,
      newValue: b,
      oldType: typeA,
      newType: typeB,
    });
    return;
  }

  // Both arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (ignoreArrayOrder) {
      compareArraysUnordered(a, b, path, out, ignoreArrayOrder);
    } else {
      const maxLen = Math.max(a.length, b.length);
      for (let i = 0; i < maxLen; i++) {
        const childPath = `${path}[${i}]`;
        if (i >= a.length) {
          out.push({ path: childPath, kind: 'added', newValue: b[i] });
        } else if (i >= b.length) {
          out.push({ path: childPath, kind: 'removed', oldValue: a[i] });
        } else {
          collectDiffs(a[i], b[i], childPath, out, ignoreArrayOrder);
        }
      }
    }
    return;
  }

  // Both objects
  if (typeA === 'object' && a !== null && b !== null) {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    for (const key of allKeys) {
      const childPath = `${path}.${key}`;
      const inA = key in objA;
      const inB = key in objB;
      if (inA && !inB) {
        out.push({ path: childPath, kind: 'removed', oldValue: objA[key] });
      } else if (!inA && inB) {
        out.push({ path: childPath, kind: 'added', newValue: objB[key] });
      } else {
        collectDiffs(objA[key], objB[key], childPath, out, ignoreArrayOrder);
      }
    }
    return;
  }

  // Primitives
  if (a !== b) {
    out.push({ path, kind: 'changed', oldValue: a, newValue: b });
  }
}

/**
 * Unordered array comparison: match elements by deep equality, then report
 * unmatched items as added/removed.
 */
function compareArraysUnordered(
  a: unknown[],
  b: unknown[],
  path: string,
  out: DiffEntry[],
  ignoreArrayOrder: boolean,
): void {
  const usedB = new Set<number>();

  for (let i = 0; i < a.length; i++) {
    let matched = false;
    for (let j = 0; j < b.length; j++) {
      if (usedB.has(j)) continue;
      if (deepEqual(a[i], b[j])) {
        usedB.add(j);
        matched = true;
        break;
      }
    }
    if (!matched) {
      out.push({ path: `${path}[${i}]`, kind: 'removed', oldValue: a[i] });
    }
  }

  for (let j = 0; j < b.length; j++) {
    if (!usedB.has(j)) {
      out.push({ path: `${path}[${j}]`, kind: 'added', newValue: b[j] });
    }
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => k in objB && deepEqual(objA[k], objB[k]));
  }
  return false;
}

const SEPARATOR = '===';

function formatJsonDiff(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte zwei JSON-Dokumente eingeben, getrennt durch eine Zeile mit "===".');
  }

  // Split on the first line that is exactly "==="
  const lines = trimmed.split('\n');
  let sepIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.trim() === SEPARATOR) {
      sepIndex = i;
      break;
    }
  }

  if (sepIndex === -1) {
    throw new Error(
      'Trennzeile "===" nicht gefunden. Füge zwischen den beiden JSON-Dokumenten eine Zeile mit "===" ein.',
    );
  }

  const leftRaw = lines.slice(0, sepIndex).join('\n').trim();
  const rightRaw = lines.slice(sepIndex + 1).join('\n').trim();

  if (leftRaw === '') {
    throw new Error('Das erste JSON-Dokument (vor "===") ist leer.');
  }
  if (rightRaw === '') {
    throw new Error('Das zweite JSON-Dokument (nach "===") ist leer.');
  }

  let left: unknown;
  let right: unknown;

  try {
    left = JSON.parse(leftRaw);
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : 'Unbekannter Fehler';
    throw new Error(`Syntaxfehler im ersten JSON: ${msg}`);
  }

  try {
    right = JSON.parse(rightRaw);
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : 'Unbekannter Fehler';
    throw new Error(`Syntaxfehler im zweiten JSON: ${msg}`);
  }

  // Detect ignore-array-order flag: if the first line before the separator
  // starts with "// ignore-array-order" we enable it.
  const ignoreArrayOrder = lines[0]!.trim().toLowerCase() === '// ignore-array-order';
  const effectiveLeft = ignoreArrayOrder ? lines.slice(1, sepIndex).join('\n').trim() : leftRaw;
  if (ignoreArrayOrder) {
    try {
      left = JSON.parse(effectiveLeft);
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : 'Unbekannter Fehler';
      throw new Error(`Syntaxfehler im ersten JSON: ${msg}`);
    }
  }

  const diffs: DiffEntry[] = [];
  collectDiffs(left, right, '$', diffs, ignoreArrayOrder);

  if (diffs.length === 0) {
    return 'Keine Unterschiede gefunden. Beide JSON-Dokumente sind identisch.';
  }

  const summary = buildSummary(diffs);
  const details = diffs.map(formatDiffEntry).join('\n');

  return `${summary}\n\n${details}`;
}

function buildSummary(diffs: DiffEntry[]): string {
  const added = diffs.filter((d) => d.kind === 'added').length;
  const removed = diffs.filter((d) => d.kind === 'removed').length;
  const changed = diffs.filter((d) => d.kind === 'changed').length;
  const typeChanged = diffs.filter((d) => d.kind === 'type-changed').length;

  const parts: string[] = [];
  if (added > 0) parts.push(`+${added} hinzugefügt`);
  if (removed > 0) parts.push(`-${removed} entfernt`);
  if (changed > 0) parts.push(`~${changed} geändert`);
  if (typeChanged > 0) parts.push(`!${typeChanged} Typ-Wechsel`);

  return `${diffs.length} Unterschiede: ${parts.join(', ')}`;
}

function formatDiffEntry(entry: DiffEntry): string {
  switch (entry.kind) {
    case 'added':
      return `+ ${entry.path}  →  ${formatValue(entry.newValue)}`;
    case 'removed':
      return `- ${entry.path}  →  ${formatValue(entry.oldValue)}`;
    case 'changed':
      return `~ ${entry.path}  →  ${formatValue(entry.oldValue)}  ⇒  ${formatValue(entry.newValue)}`;
    case 'type-changed':
      return `! ${entry.path}  →  ${formatValue(entry.oldValue)} (${entry.oldType})  ⇒  ${formatValue(entry.newValue)} (${entry.newType})`;
  }
}

export const jsonDiff: FormatterConfig = {
  id: 'json-diff',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: formatJsonDiff,
};
