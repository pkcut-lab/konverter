import type { FileToolConfig } from './schemas';
import { createWorker, type Worker } from 'tesseract.js';
import { decodeHeicIfNeeded } from './heic-decode';

// Worker is cached per-language so switching variant invalidates the cache
// (rather than carrying both lang-traineddata in memory). Mobile-fast loads
// only the user's display-language pack (~17-22 MB); quality loads DE+EN
// together (~39 MB).
let worker: Worker | null = null;
let workerLang: string | null = null;

function pickTesseractLang(variant?: string): string {
  if (variant === 'quality') return 'deu+eng';
  if (variant === 'fast') {
    // Detect from navigator.language at call time. iOS Safari does expose
    // `navigator.language`, so this works on every platform.
    const ua = typeof navigator !== 'undefined' ? navigator.language ?? '' : '';
    return ua.toLowerCase().startsWith('de') ? 'deu' : 'eng';
  }
  // Backward-compat default: when no variant is passed, fall back to the
  // pre-mobile-aware behavior so existing call-sites don't regress.
  return 'deu+eng';
}

export const bildZuText: FileToolConfig = {
  id: 'image-to-text',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/heic', 'image/heif'],
  maxSizeMb: 10,
  defaultFormat: 'txt',
  filenameSuffix: '_text',
  showQuality: false,
  prepare: async (onProgress, opts?: { variant?: string }) => {
    const lang = pickTesseractLang(opts?.variant);
    if (worker && workerLang === lang) return;
    if (worker && workerLang !== lang) {
      // Variant switch: terminate the old worker so a fresh one loads the
      // new lang pack. Without this, switching from `eng` to `deu+eng`
      // would silently keep the smaller pack.
      await worker.terminate().catch(() => undefined);
      worker = null;
      workerLang = null;
    }
    worker = await createWorker(lang, 1, {
      logger: ((m: { status: string; progress: number }) => {
        if (
          m.status === 'loading tesseract core' ||
          m.status === 'downloading language traineddata' ||
          m.status === 'loading language traineddata' ||
          m.status === 'initializing tesseract' ||
          m.status === 'initializing api'
        ) {
          onProgress({ loaded: Math.round(m.progress * 100), total: 100 });
        }
      }) as any,
    });
    workerLang = lang;
  },
  process: async (input, config, _onProgress) => {
    const variant = typeof config?.mlVariant === 'string' ? config.mlVariant : undefined;
    const lang = pickTesseractLang(variant);
    if (!worker || workerLang !== lang) {
      worker = await createWorker(lang);
      workerLang = lang;
    }

    // Pre-process HEIC/HEIF images (Apple format) — Tesseract cannot read them
    // natively, so we decode to PNG first via heic2any (non-Safari browsers).
    const decoded = await decodeHeicIfNeeded(input, detectMime(input));

    // Tesseract.js can read Blobs directly.
    const blob = new Blob([decoded.bytes], { type: decoded.mime });

    const ret = await worker.recognize(blob, undefined, {
      text: true,
    } as any);

    const text = ret.data.text;

    // Output should be a Uint8Array representing the text file.
    return new TextEncoder().encode(text);
  },
};

/**
 * Best-effort MIME detection from magic bytes for cases where the MIME is not
 * passed through the pipeline (e.g., from FileTool Uint8Array input).
 */
function detectMime(bytes: Uint8Array): string {
  if (bytes.length < 12) return 'image/png';

  // HEIF/HEIC: bytes 4-8 are 'ftyp'
  const ftypStr = String.fromCharCode(bytes[4]!, bytes[5]!, bytes[6]!, bytes[7]!);
  if (ftypStr === 'ftyp') {
    const brandStr = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!);
    if (brandStr === 'heic' || brandStr === 'heix' || brandStr === 'mif1') {
      return 'image/heic';
    }
  }

  // PNG magic: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }

  // JPEG magic: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // WebP magic: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return 'image/png';
}
