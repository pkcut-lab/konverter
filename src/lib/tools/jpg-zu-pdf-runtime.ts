/**
 * Pure-browser PDF encoder for jpg-zu-pdf.
 *
 * Encodes multiple JPEG / PNG / WebP images into a single PDF document.
 * No external library — uses the PDF 1.4 spec's native DCTDecode filter to
 * embed JPEG byte-streams directly without re-encoding. PNG / WebP are
 * converted to JPEG via OffscreenCanvas before embedding.
 *
 * Spec: ISO 32000-1:2008 §7 (Syntax), §8.9 (Images), §7.9.4 (Streams).
 */

/** Page size preset keys */
export type PageSizePreset = 'a4' | 'letter' | 'auto' | 'custom';

/** Orientation */
export type Orientation = 'portrait' | 'landscape';

/** Margin in mm (will be converted to PDF points internally) */
export type MarginMm = 0 | 8 | 16;

export interface JpgToPdfOptions {
  pageSize?: PageSizePreset;
  orientation?: Orientation;
  marginMm?: MarginMm;
  /** Custom page width in mm — only used when pageSize === 'custom' */
  customWidthMm?: number;
  /** Custom page height in mm — only used when pageSize === 'custom' */
  customHeightMm?: number;
  /** JPEG quality when re-encoding PNG/WebP, 0–1 */
  jpegQuality?: number;
}

export interface ImageEntry {
  /** Raw JPEG bytes (after PNG/WebP → JPEG conversion if needed) */
  jpegBytes: Uint8Array;
  width: number;
  height: number;
  /** Number of colour components: 1 = Gray, 3 = RGB, 4 = CMYK */
  colorComponents: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Points per mm */
const PT_PER_MM = 72 / 25.4;

/** Standard page dimensions [w, h] in portrait-points */
const PAGE_DIMS: Record<Exclude<PageSizePreset, 'auto' | 'custom'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

// ─── JPEG parsing ─────────────────────────────────────────────────────────────

/**
 * Scan a JPEG byte array for an SOFn marker and return image dimensions
 * plus the number of colour components.
 */
export function parseJpegMetadata(
  data: Uint8Array,
): { width: number; height: number; colorComponents: number } {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
    throw new Error('Not a valid JPEG file');
  }
  let i = 2;
  while (i < data.length - 1) {
    if (data[i] !== 0xff) throw new Error('Invalid JPEG marker at offset ' + i);
    const marker = data[i + 1] ?? 0;
    // SOF0 = 0xC0, SOF1 = 0xC1, SOF2 = 0xC2 (baseline/extended/progressive)
    if (marker >= 0xc0 && marker <= 0xc2) {
      const h1 = data[i + 5] ?? 0;
      const h2 = data[i + 6] ?? 0;
      const w1 = data[i + 7] ?? 0;
      const w2 = data[i + 8] ?? 0;
      const height = (h1 << 8) | h2;
      const width = (w1 << 8) | w2;
      const colorComponents = data[i + 9] ?? 3;
      return { width, height, colorComponents };
    }
    // Skip segment: marker (2) + length field (2) + segment data (length - 2)
    if (marker === 0xd9 || marker === 0xda) break; // EOI / SOS — stop scanning
    const s1 = data[i + 2] ?? 0;
    const s2 = data[i + 3] ?? 0;
    const segLen = (s1 << 8) | s2;
    if (segLen < 2) break;
    i += 2 + segLen;
  }
  throw new Error('Could not find SOFn marker in JPEG data');
}

// ─── Image preparation ────────────────────────────────────────────────────────

/**
 * Prepare an image File for PDF embedding.
 * JPEG is kept as-is. PNG / WebP are re-encoded to JPEG via OffscreenCanvas.
 */
export async function prepareImage(
  file: File,
  jpegQuality = 0.9,
): Promise<ImageEntry> {
  const arrayBuffer = await file.arrayBuffer();
  const raw = new Uint8Array(arrayBuffer);

  const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';

  let jpegBytes: Uint8Array;
  let width: number;
  let height: number;
  let colorComponents: number;

  if (isJpeg) {
    // Embed JPEG directly — no re-encoding, zero quality loss.
    const meta = parseJpegMetadata(raw);
    jpegBytes = raw;
    width = meta.width;
    height = meta.height;
    colorComponents = meta.colorComponents;
  } else {
    // PNG / WebP: decode via ImageBitmap → draw to OffscreenCanvas → encode JPEG.
    const blob = new Blob([raw], { type: file.type });
    const bitmap = await createImageBitmap(blob);
    width = bitmap.width;
    height = bitmap.height;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable');

    // White background for transparent PNG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const outBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: jpegQuality,
    });
    const outBuf = await outBlob.arrayBuffer();
    jpegBytes = new Uint8Array(outBuf);
    colorComponents = 3; // JPEG from Canvas is always RGB
  }

  return { jpegBytes, width, height, colorComponents };
}

// ─── PDF writer ───────────────────────────────────────────────────────────────

const encoder = new TextEncoder();

function str(s: string): Uint8Array {
  return encoder.encode(s);
}

/** Round to 3 decimal places for PDF coordinates */
function r(n: number): string {
  return Number(n.toFixed(3)).toString();
}

interface PdfObj {
  id: number;
  offset: number;
  bytes: Uint8Array;
}

class PdfWriter {
  private chunks: Uint8Array[] = [];
  private pos = 0;
  readonly objects: PdfObj[] = [];
  private nextId = 1;

  allocId(): number {
    return this.nextId++;
  }

  get totalObjects(): number {
    return this.nextId - 1;
  }

  get currentOffset(): number {
    return this.pos;
  }

  private emit(data: string | Uint8Array): void {
    const bytes = typeof data === 'string' ? str(data) : data;
    this.chunks.push(bytes);
    this.pos += bytes.length;
  }

  beginObject(id: number): void {
    this.objects.push({ id, offset: this.pos, bytes: new Uint8Array(0) });
    this.emit(`${id} 0 obj\n`);
  }

  endObject(): void {
    this.emit('endobj\n');
  }

  emitDict(dict: Record<string, string>): void {
    const entries = Object.entries(dict)
      .map(([k, v]) => `/${k} ${v}`)
      .join('\n');
    this.emit(`<<\n${entries}\n>>\n`);
  }

  emitStream(dict: Record<string, string>, body: Uint8Array): void {
    this.emit(`<<\n`);
    for (const [k, v] of Object.entries(dict)) {
      this.emit(`/${k} ${v}\n`);
    }
    this.emit(`/Length ${body.length}\n>>\nstream\n`);
    this.emit(body);
    this.emit('\nendstream\n');
  }

  emitRaw(data: string | Uint8Array): void {
    this.emit(data);
  }

  toUint8Array(): Uint8Array {
    const total = this.chunks.reduce((n, c) => n + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }
}

// ─── Page layout ─────────────────────────────────────────────────────────────

function resolvePageDims(
  opts: JpgToPdfOptions,
  imageW: number,
  imageH: number,
): [number, number] {
  const preset = opts.pageSize ?? 'a4';
  const orientation = opts.orientation ?? 'portrait';

  if (preset === 'auto') {
    // Page size equals image size (96 dpi → points: px * 0.75)
    const wPt = imageW * 0.75;
    const hPt = imageH * 0.75;
    return orientation === 'landscape' && wPt < hPt ? [hPt, wPt] : [wPt, hPt];
  }

  if (preset === 'custom') {
    const wMm = opts.customWidthMm ?? 210;
    const hMm = opts.customHeightMm ?? 297;
    const wPt = wMm * PT_PER_MM;
    const hPt = hMm * PT_PER_MM;
    return orientation === 'landscape' && wPt < hPt ? [hPt, wPt] : [wPt, hPt];
  }

  // a4 or letter
  const [pw, ph] = PAGE_DIMS[preset as keyof typeof PAGE_DIMS];
  return orientation === 'landscape' ? [ph, pw] : [pw, ph];
}

/** Compute JPEG placement: scale-to-fit centered within the available area */
function computePlacement(
  pageW: number,
  pageH: number,
  marginPt: number,
  imageW: number,
  imageH: number,
): { sx: number; sy: number; tx: number; ty: number } {
  const availW = pageW - 2 * marginPt;
  const availH = pageH - 2 * marginPt;
  const scale = Math.min(availW / imageW, availH / imageH);
  const scaledW = imageW * scale;
  const scaledH = imageH * scale;
  // Centre within available area; PDF origin is bottom-left
  const tx = marginPt + (availW - scaledW) / 2;
  const ty = marginPt + (availH - scaledH) / 2;
  return { sx: scaledW, sy: scaledH, tx, ty };
}

// ─── Color space mapping ──────────────────────────────────────────────────────

function colorSpaceName(components: number): string {
  if (components === 1) return '/DeviceGray';
  if (components === 4) return '/DeviceCMYK';
  return '/DeviceRGB';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a PDF from an ordered list of pre-prepared image entries.
 * Returns the raw PDF bytes.
 */
export function buildPdf(images: ImageEntry[], opts: JpgToPdfOptions = {}): Uint8Array {
  if (images.length === 0) throw new Error('At least one image is required');

  const marginPt = (opts.marginMm ?? 8) * PT_PER_MM;
  const w = new PdfWriter();

  // Header
  w.emitRaw('%PDF-1.4\n%\xc2\xa7\n');

  // Pre-allocate IDs
  const catalogId = w.allocId();
  const pagesId = w.allocId();

  interface PageIds {
    pageId: number;
    contentId: number;
    imageId: number;
  }
  const pageIdSets: PageIds[] = images.map(() => ({
    pageId: w.allocId(),
    contentId: w.allocId(),
    imageId: w.allocId(),
  }));

  // Write objects: for each page write [Page, Content, Image] in order
  for (let i = 0; i < images.length; i++) {
    const img = images[i]!;
    const ids = pageIdSets[i]!;
    const [pageW, pageH] = resolvePageDims(opts, img.width, img.height);
    const { sx, sy, tx, ty } = computePlacement(pageW, pageH, marginPt, img.width, img.height);

    // Content stream
    const contentBody = str(
      `q\n${r(sx)} 0 0 ${r(sy)} ${r(tx)} ${r(ty)} cm\n/Im Do\nQ\n`,
    );

    // Page object
    w.beginObject(ids.pageId);
    w.emitDict({
      Type: '/Page',
      Parent: `${pagesId} 0 R`,
      MediaBox: `[0 0 ${r(pageW)} ${r(pageH)}]`,
      Resources: `<</XObject <</Im ${ids.imageId} 0 R>>>>`,
      Contents: `${ids.contentId} 0 R`,
    });
    w.endObject();

    // Content stream object
    w.beginObject(ids.contentId);
    w.emitStream({}, contentBody);
    w.endObject();

    // Image XObject
    w.beginObject(ids.imageId);
    w.emitStream(
      {
        Type: '/XObject',
        Subtype: '/Image',
        Width: String(img.width),
        Height: String(img.height),
        ColorSpace: colorSpaceName(img.colorComponents),
        BitsPerComponent: '8',
        Filter: '/DCTDecode',
      },
      img.jpegBytes,
    );
    w.endObject();
  }

  // Pages dictionary
  const kidRefs = pageIdSets.map((ids) => `${ids.pageId} 0 R`).join(' ');
  w.beginObject(pagesId);
  w.emitDict({
    Type: '/Pages',
    Kids: `[${kidRefs}]`,
    Count: String(images.length),
  });
  w.endObject();

  // Catalog
  w.beginObject(catalogId);
  w.emitDict({
    Type: '/Catalog',
    Pages: `${pagesId} 0 R`,
  });
  w.endObject();

  // Cross-reference table
  const xrefOffset = w.currentOffset;
  const totalObjs = w.totalObjects;

  // Build xref entries: object 0 is always free
  let xref = `xref\n0 ${totalObjs + 1}\n`;
  xref += '0000000000 65535 f\r\n';
  // Sort by object id so the xref table is in order
  const sorted = [...w.objects].sort((a, b) => a.id - b.id);
  for (const obj of sorted) {
    xref += obj.offset.toString().padStart(10, '0') + ' 00000 n\r\n';
  }
  w.emitRaw(xref);

  // Trailer
  w.emitRaw(
    `trailer\n<</Size ${totalObjs + 1} /Root ${catalogId} 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );

  return w.toUint8Array();
}

/**
 * High-level convenience: convert an array of image Files to a PDF Uint8Array.
 * Handles PNG/WebP → JPEG conversion internally.
 */
export async function convertImagesToPdf(
  files: File[],
  opts: JpgToPdfOptions = {},
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const entries: ImageEntry[] = [];
  const quality = opts.jpegQuality ?? 0.9;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    entries.push(await prepareImage(file, quality));
    onProgress?.(i + 1, files.length);
  }
  return buildPdf(entries, opts);
}

/**
 * Single-image path used by the tool-runtime-registry (FileTool.svelte compat).
 * config keys: pageSize, orientation, marginMm, customWidthMm, customHeightMm
 */
export async function processJpgToPdf(
  input: Uint8Array,
  config?: Record<string, unknown>,
): Promise<Uint8Array> {
  const opts: JpgToPdfOptions = {
    pageSize: (config?.pageSize as PageSizePreset | undefined) ?? 'a4',
    orientation: (config?.orientation as Orientation | undefined) ?? 'portrait',
    marginMm: (config?.marginMm as MarginMm | undefined) ?? 8,
  };
  if (typeof config?.customWidthMm === 'number') {
    opts.customWidthMm = config.customWidthMm;
  }
  if (typeof config?.customHeightMm === 'number') {
    opts.customHeightMm = config.customHeightMm;
  }

  // Determine if the input is JPEG
  const isJpeg = input[0] === 0xff && input[1] === 0xd8;
  let entry: ImageEntry;

  if (isJpeg) {
    const meta = parseJpegMetadata(input);
    entry = { jpegBytes: input, ...meta };
  } else {
    // Fallback for PNG/WebP passed as raw bytes — attempt OffscreenCanvas path
    const blob = new Blob([input]);
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
    const buf = await outBlob.arrayBuffer();
    entry = {
      jpegBytes: new Uint8Array(buf),
      width: bitmap.width,
      height: bitmap.height,
      colorComponents: 3,
    };
  }

  return buildPdf([entry], opts);
}
