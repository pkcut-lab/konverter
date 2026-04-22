import type { ComparerConfig } from './schemas';

/**
 * JSON-Diff — compares two JSON documents and reports differences with
 * JSON-Path locations and type-change detection.
 * Pure client-side, no server contact, no dependencies.
 *
 * Renders via the generic Comparer component: two textareas A/B. The
 * `diff(a, b)` entry point parses each document independently and walks
 * them recursively.
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
      compareArraysUnordered(a, b, path, out);
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

function parseJson(raw: string, label: 'A' | 'B'): unknown {
  const trimmed = raw.trim();
  if (trimmed === '') {
    throw new Error(`JSON ${label} ist leer.`);
  }

  // Support a leading "// ignore-array-order" directive in either pane
  const withoutDirective = trimmed.replace(/^\/\/\s*ignore-array-order\s*\n?/i, '');
  try {
    return JSON.parse(withoutDirective);
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : 'Unbekannter Fehler';
    throw new Error(`Syntaxfehler in JSON ${label}: ${msg}`);
  }
}

function diffJson(a: string, b: string): string {
  const ignoreArrayOrder =
    /^\s*\/\/\s*ignore-array-order/i.test(a) || /^\s*\/\/\s*ignore-array-order/i.test(b);

  const left = parseJson(a, 'A');
  const right = parseJson(b, 'B');

  const diffs: DiffEntry[] = [];
  collectDiffs(left, right, '$', diffs, ignoreArrayOrder);

  if (diffs.length === 0) {
    return 'Keine Unterschiede gefunden. Beide JSON-Dokumente sind identisch.';
  }

  const summary = buildSummary(diffs);
  const details = diffs.map(formatDiffEntry).join('\n');
  const hint = ignoreArrayOrder ? '\n\n(Array-Reihenfolge wird ignoriert)' : '';

  return `${summary}\n\n${details}${hint}`;
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

export const jsonDiff: ComparerConfig = {
  id: 'json-diff',
  type: 'comparer',
  categoryId: 'dev',
  diffMode: 'json',
  diff: diffJson,
  placeholderA: '{\n  "name": "Ada",\n  "langs": ["de", "en"]\n}',
  placeholderB: '{\n  "name": "Ada",\n  "langs": ["de", "fr"],\n  "active": true\n}',
};
