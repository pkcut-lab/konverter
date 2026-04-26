/**
 * pdf-passwort-utils — pure utilities for pdf-passwort tool.
 *
 * No DOM / no pdfjs / no pdf-lib dependency — safe to import in tests.
 */

/** PDF magic bytes: "%PDF-" */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d] as const;

/**
 * Returns true if the first 5 bytes match the PDF magic header "%PDF-".
 */
export function isValidPdfMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_MAGIC.length) return false;
  for (let i = 0; i < PDF_MAGIC.length; i++) {
    if (bytes[i] !== PDF_MAGIC[i]) return false;
  }
  return true;
}

/**
 * Derive the output filename for the unlocked PDF.
 * Appends "-entsperrt" before the .pdf extension.
 *
 * Examples:
 *   deriveUnlockedFilename('vertrag.pdf')  → 'vertrag-entsperrt.pdf'
 *   deriveUnlockedFilename('DOKUMENT.PDF') → 'DOKUMENT-entsperrt.pdf'
 *   deriveUnlockedFilename('file')         → 'file-entsperrt.pdf'
 */
export function deriveUnlockedFilename(name: string): string {
  const base = name.replace(/\.[Pp][Dd][Ff]$/, '');
  return `${base}-entsperrt.pdf`;
}

/**
 * Format bytes for display.
 * Mirror of pdf-split-utils.formatFileSize — kept separate to avoid cross-dep.
 */
export function formatUnlockFileSize(bytes: number): string {
  if (!isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
