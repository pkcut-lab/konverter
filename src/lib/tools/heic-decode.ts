/**
 * HEIC/HEIF decode helper. Lazy-loads `heic2any` only when needed AND only
 * in non-Safari browsers. Safari decodes HEIC natively via createImageBitmap,
 * so the polyfill is skipped — saves ~30 KB gzip on iOS/macOS visits.
 */

export interface DecodeResult {
  bytes: Uint8Array;
  mime: string;
}

const HEIC_MIMES = new Set(['image/heic', 'image/heif']);

function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
}

/** Reads a Blob to Uint8Array, with FileReader fallback for jsdom/older envs. */
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === 'function') {
    return new Uint8Array(await blob.arrayBuffer());
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

export async function decodeHeicIfNeeded(
  bytes: Uint8Array,
  mime: string,
): Promise<DecodeResult> {
  if (!HEIC_MIMES.has(mime)) return { bytes, mime };
  if (isSafari()) return { bytes, mime };

  let heic2any: (opts: { blob: Blob; toType: string }) => Promise<Blob | Blob[]>;
  try {
    const mod = await import('heic2any');
    heic2any = mod.default as typeof heic2any;
  } catch (err) {
    throw new Error(
      `HEIC-Decoder konnte nicht geladen werden: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let outBlob: Blob;
  try {
    const result = await heic2any({
      blob: new Blob([bytes as BlobPart], { type: mime }),
      toType: 'image/png',
    });
    outBlob = Array.isArray(result) ? (result[0] as Blob) : result;
  } catch (err) {
    throw new Error(
      `HEIC-Datei konnte nicht gelesen werden: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const buf = await blobToUint8Array(outBlob);
  return { bytes: buf, mime: 'image/png' };
}
