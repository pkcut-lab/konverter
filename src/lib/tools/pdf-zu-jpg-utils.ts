/**
 * pdf-zu-jpg-utils — pure utilities for PDF-to-JPG conversion.
 *
 * No DOM / no PDF.js dependency — safe to import in tests (Node/Vitest).
 */

// ---------------------------------------------------------------------------
// Filename helpers
// ---------------------------------------------------------------------------

/**
 * Derive a JPG output filename for a single page.
 * Examples:
 *   deriveJpgFilename('vertrag.pdf', 1, 5) → 'vertrag-seite-01.jpg'
 *   deriveJpgFilename(undefined, 3, 3)     → 'seite-3.jpg'
 */
export function deriveJpgFilename(
  pdfName: string | undefined,
  pageNum: number,
  totalPages: number,
): string {
  const padded = String(pageNum).padStart(String(totalPages).length, '0');
  if (!pdfName) return `seite-${padded}.jpg`;
  const base = pdfName.replace(/\.[Pp][Dd][Ff]$/, '');
  return `${base}-seite-${padded}.jpg`;
}

/**
 * Derive the ZIP archive name for a multi-page download.
 * Examples:
 *   deriveZipFilename('vertrag.pdf') → 'vertrag-jpg.zip'
 *   deriveZipFilename(undefined)     → 'pdf-jpg.zip'
 */
export function deriveZipFilename(pdfName: string | undefined): string {
  if (!pdfName) return 'pdf-jpg.zip';
  const base = pdfName.replace(/\.[Pp][Dd][Ff]$/, '');
  return `${base}-jpg.zip`;
}

// ---------------------------------------------------------------------------
// Size estimation
// ---------------------------------------------------------------------------

/**
 * Rough JPEG size estimate for a given pixel canvas area.
 * Uses empirical baseline: ~0.1 byte per pixel at quality 0.92 for document
 * content (text + vectors). Pure-photo scanned pages run higher.
 *
 * Returns bytes (number).
 */
export function estimateJpgSizeBytes(widthPx: number, heightPx: number): number {
  if (widthPx <= 0 || heightPx <= 0) return 0;
  return Math.round(widthPx * heightPx * 0.1);
}

/**
 * Format bytes for display. Same contract as pdf-split-utils.formatFileSize
 * so we keep both in sync without cross-importing.
 */
export function formatFileSize(bytes: number): string {
  if (!isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------------
// DPI helpers
// ---------------------------------------------------------------------------

/** JPEG canvas background color (white). JPEG has no alpha channel. */
export const JPEG_BACKGROUND = '#ffffff' as const;

/** Valid DPI options for PDF-to-JPG conversion. */
export type DpiOption = 72 | 150 | 300;

export const DPI_OPTIONS: DpiOption[] = [72, 150, 300];

/**
 * Compute the PDF.js render scale for a target DPI.
 * PDF uses 72 pt/inch internally. scale = targetDPI / 72.
 */
export function dpiToScale(dpi: DpiOption): number {
  return dpi / 72;
}

/**
 * Human-readable DPI label used in the UI and filenames.
 */
export function dpiLabel(dpi: DpiOption): string {
  switch (dpi) {
    case 72:
      return '72 DPI — Web';
    case 150:
      return '150 DPI — Standard';
    case 300:
      return '300 DPI — Druck';
  }
}

// ---------------------------------------------------------------------------
// Minimal STORE-mode ZIP assembler (no compression, pure TypeScript)
// Suitable for JPEG output — JPEG is already compressed; deflate adds no gain.
// ---------------------------------------------------------------------------

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]!;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

/**
 * Assemble a STORE-mode ZIP from an array of named files.
 * Returns a Uint8Array containing the complete ZIP archive.
 */
export function buildZipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder();

  // Pre-compute sizes to allocate a single buffer
  const fileEntries: {
    nameBytes: Uint8Array;
    data: Uint8Array;
    crc: number;
    localOffset: number;
  }[] = [];

  let totalSize = 0;
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const localOffset = totalSize;
    // local file header (30) + name + data
    totalSize += 30 + nameBytes.length + file.data.length;
    fileEntries.push({ nameBytes, data: file.data, crc, localOffset });
  }

  const centralDirOffset = totalSize;
  // central directory entry per file: 46 + name length
  for (const e of fileEntries) totalSize += 46 + e.nameBytes.length;
  // end of central directory: 22 bytes
  totalSize += 22;

  const buf = new Uint8Array(totalSize);
  const view = new DataView(buf.buffer);
  let pos = 0;

  // Write local file headers + data
  for (const e of fileEntries) {
    // Local file header signature
    writeUint32LE(view, pos, 0x04034b50); pos += 4;
    writeUint16LE(view, pos, 20); pos += 2; // version needed
    writeUint16LE(view, pos, 0); pos += 2;  // general purpose bit flag
    writeUint16LE(view, pos, 0); pos += 2;  // compression method: STORE
    writeUint16LE(view, pos, 0); pos += 2;  // last mod time
    writeUint16LE(view, pos, 0); pos += 2;  // last mod date
    writeUint32LE(view, pos, e.crc); pos += 4;
    writeUint32LE(view, pos, e.data.length); pos += 4; // compressed size
    writeUint32LE(view, pos, e.data.length); pos += 4; // uncompressed size
    writeUint16LE(view, pos, e.nameBytes.length); pos += 2;
    writeUint16LE(view, pos, 0); pos += 2; // extra field length
    buf.set(e.nameBytes, pos); pos += e.nameBytes.length;
    buf.set(e.data, pos); pos += e.data.length;
  }

  // Write central directory
  const centralDirStart = pos;
  for (const e of fileEntries) {
    writeUint32LE(view, pos, 0x02014b50); pos += 4; // central dir signature
    writeUint16LE(view, pos, 20); pos += 2; // version made by
    writeUint16LE(view, pos, 20); pos += 2; // version needed
    writeUint16LE(view, pos, 0); pos += 2;  // general purpose bit flag
    writeUint16LE(view, pos, 0); pos += 2;  // compression method: STORE
    writeUint16LE(view, pos, 0); pos += 2;  // last mod time
    writeUint16LE(view, pos, 0); pos += 2;  // last mod date
    writeUint32LE(view, pos, e.crc); pos += 4;
    writeUint32LE(view, pos, e.data.length); pos += 4; // compressed size
    writeUint32LE(view, pos, e.data.length); pos += 4; // uncompressed size
    writeUint16LE(view, pos, e.nameBytes.length); pos += 2;
    writeUint16LE(view, pos, 0); pos += 2; // extra field length
    writeUint16LE(view, pos, 0); pos += 2; // file comment length
    writeUint16LE(view, pos, 0); pos += 2; // disk number start
    writeUint16LE(view, pos, 0); pos += 2; // internal file attributes
    writeUint32LE(view, pos, 0); pos += 4; // external file attributes
    writeUint32LE(view, pos, e.localOffset); pos += 4; // relative offset of local header
    buf.set(e.nameBytes, pos); pos += e.nameBytes.length;
  }

  const centralDirSize = pos - centralDirStart;

  // End of central directory record
  writeUint32LE(view, pos, 0x06054b50); pos += 4; // signature
  writeUint16LE(view, pos, 0); pos += 2; // disk number
  writeUint16LE(view, pos, 0); pos += 2; // disk with central dir
  writeUint16LE(view, pos, fileEntries.length); pos += 2; // entries on this disk
  writeUint16LE(view, pos, fileEntries.length); pos += 2; // total entries
  writeUint32LE(view, pos, centralDirSize); pos += 4;
  writeUint32LE(view, pos, centralDirOffset); pos += 4;
  writeUint16LE(view, pos, 0); // comment length

  return buf;
}
