/**
 * Pure helpers for the pdf-zusammenfuehren custom Svelte component.
 *
 * Extracted so the magic-bytes check, byte-formatter and filename derivation
 * can be unit-tested without booting jsdom or loading pdf-lib. The component
 * (`PdfZusammenfuehrenTool.svelte`) imports these and runs them client-side
 * before triggering the lazy `import('pdf-lib')`.
 */

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

/**
 * Returns true iff the first 5 bytes match the PDF magic sequence "%PDF-".
 * Required pre-load gate per dossier §11 — pdf-lib otherwise throws on
 * malformed inputs and returns no useful diagnostic for end users.
 */
export function isValidPdfMagic(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_MAGIC.length) return false;
  for (let i = 0; i < PDF_MAGIC.length; i++) {
    if (bytes[i] !== PDF_MAGIC[i]) return false;
  }
  return true;
}

/**
 * Format a byte count with NBSP between value and unit (DESIGN.md §3).
 * Mirrors the output style of the BildDiffTool size column.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return `0 B`;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Derive a sensible output filename for the merged PDF.
 * Uses the first input filename's stem with a `-zusammengefuehrt.pdf` suffix
 * if present, otherwise falls back to a static default.
 */
export function deriveOutputFilename(firstFilename: string | undefined): string {
  if (!firstFilename || firstFilename.length === 0) return 'zusammengefuehrt.pdf';
  const cleaned = firstFilename.replace(/\.pdf$/i, '').trim();
  if (cleaned.length === 0) return 'zusammengefuehrt.pdf';
  return `${cleaned}-zusammengefuehrt.pdf`;
}

/**
 * Total byte size of a list of files. Splits into a helper purely so tests
 * can exercise the empty + overflow-protection paths without touching DOM.
 */
export function totalBytes(sizes: ReadonlyArray<number>): number {
  let acc = 0;
  for (const s of sizes) {
    if (Number.isFinite(s) && s > 0) acc += s;
  }
  return acc;
}
