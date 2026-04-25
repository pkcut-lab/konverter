/**
 * Pure helpers for the pdf-aufteilen custom Svelte component.
 *
 * The page-range parser is the trickiest piece — extracted here so all the
 * edge cases (reverse ranges, out-of-bounds, whitespace, trailing comma,
 * non-numeric tokens) can be unit-tested without booting the component.
 *
 * Design decisions:
 *  - Input is **1-indexed** (user-visible page numbers). The component
 *    converts to 0-indexed before calling `pdf-lib`'s `copyPages`.
 *  - Single page tokens like "5" are normalised to {start:5, end:5} so the
 *    consumer never branches on shorthand vs. full range.
 *  - We intentionally keep duplicate ranges allowed — repeating a page is a
 *    legitimate use-case (e.g. duplicating a cover page).
 *  - Whitespace is forgiving (any amount around tokens / inside ranges).
 */

const MAX_INPUT_LEN = 500; // dossier §8 boundary-test guard against absurd input

export type Range = { start: number; end: number };

export type PageRangesResult =
  | { ok: true; ranges: Range[] }
  | { ok: false; error: string };

export function parsePageRanges(input: string, totalPages: number): PageRangesResult {
  if (!input || input.trim().length === 0) {
    return { ok: false, error: 'Bitte mindestens eine Seite oder einen Bereich angeben.' };
  }
  if (input.length > MAX_INPUT_LEN) {
    return { ok: false, error: 'Eingabe zu lang (maximal 500 Zeichen).' };
  }
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    return { ok: false, error: 'Ungültige Seitenanzahl.' };
  }

  const tokens = input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (tokens.length === 0) {
    return { ok: false, error: 'Bitte mindestens eine Seite oder einen Bereich angeben.' };
  }

  const ranges: Range[] = [];
  for (const token of tokens) {
    // Normalise inner whitespace around `-` so "5 - 7" works
    const cleaned = token.replace(/\s*-\s*/g, '-');
    const parts = cleaned.split('-');
    if (parts.length === 1) {
      const n = parsePageNumber(parts[0]!);
      if (n === null) {
        return { ok: false, error: `„${token}“ ist keine gültige Seitenzahl.` };
      }
      if (n < 1) return { ok: false, error: 'Seitenzahlen beginnen bei 1.' };
      if (n > totalPages) {
        return {
          ok: false,
          error: `Seite ${n} existiert nicht. Das PDF hat nur ${totalPages} Seiten.`,
        };
      }
      ranges.push({ start: n, end: n });
    } else if (parts.length === 2) {
      const start = parsePageNumber(parts[0]!);
      const end = parsePageNumber(parts[1]!);
      if (start === null || end === null) {
        return { ok: false, error: `„${token}“ ist kein gültiger Bereich.` };
      }
      if (start < 1 || end < 1) return { ok: false, error: 'Seitenzahlen beginnen bei 1.' };
      if (start > end) {
        return {
          ok: false,
          error: `Ungültiger Bereich „${token}“: Startseite muss kleiner oder gleich Endseite sein.`,
        };
      }
      if (end > totalPages) {
        return {
          ok: false,
          error: `Seite ${end} existiert nicht. Das PDF hat nur ${totalPages} Seiten.`,
        };
      }
      ranges.push({ start, end });
    } else {
      return { ok: false, error: `„${token}“ ist kein gültiger Bereich.` };
    }
  }

  return { ok: true, ranges };
}

function parsePageNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || !Number.isFinite(n)) return null;
  return n;
}

/**
 * Total number of pages across all ranges (no de-duplication).
 * Used in the UI to preview „X Seiten ausgewählt" before splitting.
 */
export function totalPagesInRanges(ranges: ReadonlyArray<Range>): number {
  let sum = 0;
  for (const r of ranges) sum += r.end - r.start + 1;
  return sum;
}

/**
 * Format a byte count with NBSP between value and unit (DESIGN.md §3).
 * Same formatter used in pdf-merge — kept local so each tool stays self-
 * contained and we don't grow a shared "byte-format" import surface.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return `0 B`;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Pretty-print a range for UI: single page → "5", range → "5–9".
 * Uses U+2013 (en-dash), not ASCII hyphen — matches editorial typo of the rest of the site.
 */
export function formatRangeLabel(r: Range): string {
  if (r.start === r.end) return String(r.start);
  return `${r.start}–${r.end}`;
}

/**
 * Output-filename for a per-range split.
 * "vertrag.pdf" + range {3,7} → "vertrag-seiten-3-7.pdf"
 * "vertrag.pdf" + range {5,5} → "vertrag-seite-5.pdf"
 */
export function derivePerRangeFilename(
  sourceName: string | undefined,
  range: Range,
): string {
  const stem = stripPdfExt(sourceName) || 'pdf';
  if (range.start === range.end) return `${stem}-seite-${range.start}.pdf`;
  return `${stem}-seiten-${range.start}-${range.end}.pdf`;
}

/**
 * Output-filename for a single-output split (all selected ranges in one PDF).
 */
export function deriveSingleOutputFilename(sourceName: string | undefined): string {
  const stem = stripPdfExt(sourceName) || 'pdf';
  return `${stem}-auszug.pdf`;
}

function stripPdfExt(name: string | undefined): string {
  if (!name) return '';
  return name.replace(/\.pdf$/i, '').trim();
}
