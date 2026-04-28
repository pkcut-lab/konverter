import { readHeicExif, injectExifIntoJpeg } from './heic-exif';
import type { ExifMode } from './heic-exif';

export type OutputFormat = 'jpg' | 'png';
export type ResizeMode = 'original' | '4k' | '1080';

export interface ConvertOpts {
  format: OutputFormat;
  quality: number; // 0.0–1.0 (jpg only)
  resize: ResizeMode;
  exifMode: ExifMode;
}

export interface ConvertResult {
  kind: 'result';
  filename: string;
  bytes: Uint8Array;
  mime: string;
  originalName: string;
}

export interface ConvertError {
  kind: 'error';
  originalName: string;
  message: string;
}

const HEIC_MIMES = new Set([
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

export function isHeicFile(file: File): boolean {
  if (HEIC_MIMES.has(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

function replaceExtension(name: string, ext: string): string {
  return name.replace(/\.(heic|heif)$/i, '') + '.' + ext;
}

async function decodeHeicToCanvas(bytes: Uint8Array, mime: string): Promise<HTMLCanvasElement> {
  const isSafari = (() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  })();

  let blob: Blob;
  if (isSafari) {
    blob = new Blob([bytes], { type: mime });
  } else {
    const mod = await import('heic2any');
    const heic2any = mod.default as (opts: { blob: Blob; toType: string }) => Promise<Blob | Blob[]>;
    const result = await heic2any({ blob: new Blob([bytes], { type: mime }), toType: 'image/png' });
    blob = Array.isArray(result) ? (result[0] as Blob) : result;
  }

  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  img.close();
  return canvas;
}

function applyOrientation(canvas: HTMLCanvasElement, deg: 0 | 90 | 180 | 270): HTMLCanvasElement {
  if (deg === 0) return canvas;
  const rotated = document.createElement('canvas');
  if (deg === 90 || deg === 270) {
    rotated.width = canvas.height;
    rotated.height = canvas.width;
  } else {
    rotated.width = canvas.width;
    rotated.height = canvas.height;
  }
  const ctx = rotated.getContext('2d')!;
  ctx.translate(rotated.width / 2, rotated.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return rotated;
}

function applyResize(canvas: HTMLCanvasElement, resize: ResizeMode): HTMLCanvasElement {
  const maxPx = resize === '4k' ? 3840 : resize === '1080' ? 1920 : 0;
  if (maxPx === 0) return canvas;
  const { width, height } = canvas;
  if (width <= maxPx && height <= maxPx) return canvas;
  const scale = maxPx / Math.max(width, height);
  const resized = document.createElement('canvas');
  resized.width = Math.round(width * scale);
  resized.height = Math.round(height * scale);
  resized.getContext('2d')!.drawImage(canvas, 0, 0, resized.width, resized.height);
  return resized;
}

async function canvasToBytes(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('canvas.toBlob failed')); return; }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject);
      },
      mime,
      format === 'jpg' ? quality : undefined,
    );
  });
}

export async function convertOne(file: File, opts: ConvertOpts): Promise<Uint8Array> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = HEIC_MIMES.has(file.type) ? file.type : 'image/heic';

  // Read EXIF before decode — heic2any strips EXIF during conversion
  const { orientationDeg, rawTags } = await readHeicExif(bytes);

  const rawCanvas = await decodeHeicToCanvas(bytes, mime);
  const oriented = applyOrientation(rawCanvas, orientationDeg);
  const resized = applyResize(oriented, opts.resize);
  let outBytes = await canvasToBytes(resized, opts.format, opts.quality);

  // Re-attach EXIF for JPG output in standard/all modes
  if (opts.format === 'jpg' && opts.exifMode !== 'none' && rawTags) {
    outBytes = injectExifIntoJpeg(outBytes, rawTags, opts.exifMode);
  }

  return outBytes;
}

export async function* convertBatch(
  files: File[],
  opts: ConvertOpts,
): AsyncGenerator<ConvertResult | ConvertError> {
  for (const file of files) {
    try {
      const bytes = await convertOne(file, opts);
      const mime = opts.format === 'jpg' ? 'image/jpeg' : 'image/png';
      yield {
        kind: 'result',
        filename: replaceExtension(file.name, opts.format),
        bytes,
        mime,
        originalName: file.name,
      };
    } catch (err) {
      yield {
        kind: 'error',
        originalName: file.name,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
