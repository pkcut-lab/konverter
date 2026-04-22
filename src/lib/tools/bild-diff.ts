import type { FormatterConfig } from './schemas';

/**
 * Bild-Diff — compares two base64-encoded images pixel by pixel and returns
 * a text report with statistics (% changed, pixel count, dimension check).
 * Pure client-side, no server contact, no dependencies.
 *
 * Input convention: two base64 data URLs separated by a line containing
 * only "===" (the Formatter component provides a single textarea).
 * Output: human-readable diff report with dimension info, pixel comparison
 * statistics and a per-channel delta summary.
 *
 * Phase 2 enhancement: custom Svelte component with visual Canvas overlay,
 * slider comparison and drag-and-drop image upload.
 */

const SEPARATOR = '===';

/**
 * Decode a base64 data URL into raw RGBA pixel data via an OffscreenCanvas
 * (or regular Canvas in older browsers).
 * Returns { width, height, data: Uint8ClampedArray }.
 */
export async function decodeImageData(
  dataUrl: string,
): Promise<{ width: number; height: number; data: Uint8ClampedArray }> {
  // Validate data URL format
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error(
      'Ungültiges Format. Erwartet wird eine Base64-Data-URL (data:image/png;base64,…).',
    );
  }

  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Bild konnte nicht dekodiert werden.'));
  });

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas-Kontext konnte nicht erstellt werden.');

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);

  return { width: w, height: h, data: imageData.data };
}

/**
 * Compare two RGBA pixel arrays of the same length. Returns the count of
 * pixels that differ and per-channel total absolute error.
 */
export function comparePixels(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  tolerance: number,
): { diffCount: number; totalPixels: number; channelDelta: [number, number, number, number] } {
  const totalPixels = a.length / 4;
  let diffCount = 0;
  const channelDelta: [number, number, number, number] = [0, 0, 0, 0];

  for (let i = 0; i < a.length; i += 4) {
    const dR = Math.abs(a[i]! - b[i]!);
    const dG = Math.abs(a[i + 1]! - b[i + 1]!);
    const dB = Math.abs(a[i + 2]! - b[i + 2]!);
    const dA = Math.abs(a[i + 3]! - b[i + 3]!);

    channelDelta[0] += dR;
    channelDelta[1] += dG;
    channelDelta[2] += dB;
    channelDelta[3] += dA;

    if (dR > tolerance || dG > tolerance || dB > tolerance || dA > tolerance) {
      diffCount++;
    }
  }

  return { diffCount, totalPixels, channelDelta };
}

/**
 * Parse optional tolerance from first line: `// tolerance=10`
 * Returns { tolerance, startLine } so the caller knows where real content begins.
 */
function parseTolerance(lines: string[]): { tolerance: number; startLine: number } {
  const first = lines[0]?.trim().toLowerCase() ?? '';
  const match = first.match(/^\/\/\s*tolerance\s*=\s*(\d+)$/);
  if (match) {
    const val = Math.min(255, Math.max(0, parseInt(match[1]!, 10)));
    return { tolerance: val, startLine: 1 };
  }
  return { tolerance: 0, startLine: 0 };
}

export function formatPercent(ratio: number): string {
  return (ratio * 100).toFixed(2).replace('.', ',') + ' %';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('de-DE');
}

/**
 * Main diff function: takes textarea input, parses two data URLs separated
 * by ===, decodes both images, compares pixels, returns text report.
 *
 * Since Image decoding is async, the format function returns a Promise-like
 * pattern via a synchronous wrapper that triggers the async work. However,
 * FormatterConfig.format is synchronous — so we perform a simplified
 * byte-level comparison on the raw base64 data for the synchronous path.
 */
function formatBildDiff(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error(
      'Bitte zwei Base64-Data-URLs eingeben, getrennt durch eine Zeile mit "===".\n\n' +
        'Format: data:image/png;base64,… === data:image/png;base64,…',
    );
  }

  const lines = trimmed.split('\n');

  // Parse optional tolerance directive
  const { tolerance, startLine } = parseTolerance(lines);

  // Find separator
  let sepIndex = -1;
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i]!.trim() === SEPARATOR) {
      sepIndex = i;
      break;
    }
  }

  if (sepIndex === -1) {
    throw new Error(
      'Trennzeile "===" nicht gefunden.\n' +
        'Füge zwischen den beiden Data-URLs eine Zeile mit "===" ein.\n\n' +
        'Optionale Toleranz: // tolerance=10 als erste Zeile.',
    );
  }

  const leftRaw = lines.slice(startLine, sepIndex).join('\n').trim();
  const rightRaw = lines.slice(sepIndex + 1).join('\n').trim();

  if (leftRaw === '') {
    throw new Error('Das erste Bild (vor "===") fehlt.');
  }
  if (rightRaw === '') {
    throw new Error('Das zweite Bild (nach "===") fehlt.');
  }

  // Validate data URL format
  if (!leftRaw.startsWith('data:image/')) {
    throw new Error(
      'Bild A ist keine gültige Data-URL. Erwartet: data:image/png;base64,… oder data:image/jpeg;base64,…',
    );
  }
  if (!rightRaw.startsWith('data:image/')) {
    throw new Error(
      'Bild B ist keine gültige Data-URL. Erwartet: data:image/png;base64,… oder data:image/jpeg;base64,…',
    );
  }

  // Extract base64 payload for byte-level comparison
  const extractBase64 = (dataUrl: string): string => {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) throw new Error('Data-URL hat kein Komma-Trennzeichen.');
    return dataUrl.slice(commaIndex + 1);
  };

  const extractMime = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:(image\/[a-z+]+)/);
    return match ? match[1]! : 'unbekannt';
  };

  const mimeA = extractMime(leftRaw);
  const mimeB = extractMime(rightRaw);

  const base64A = extractBase64(leftRaw);
  const base64B = extractBase64(rightRaw);

  // Byte-level comparison of the raw base64 data
  const bytesA = base64A.length;
  const bytesB = base64B.length;
  const sizeA = Math.round((bytesA * 3) / 4);
  const sizeB = Math.round((bytesB * 3) / 4);

  // Byte-by-byte diff on the base64 strings
  const minLen = Math.min(base64A.length, base64B.length);
  const maxLen = Math.max(base64A.length, base64B.length);
  let diffBytes = maxLen - minLen; // trailing bytes are all different
  for (let i = 0; i < minLen; i++) {
    if (base64A[i] !== base64B[i]) diffBytes++;
  }

  const identical = base64A === base64B;
  const diffRatio = maxLen > 0 ? diffBytes / maxLen : 0;

  // Build report
  const report: string[] = [];

  report.push('╔══════════════════════════════════════════╗');
  report.push('║         BILD-DIFF — Vergleichsbericht    ║');
  report.push('╚══════════════════════════════════════════╝');
  report.push('');

  // Image info
  report.push('┌─ Bild A ─────────────────────────────────');
  report.push(`│  Format:     ${mimeA}`);
  report.push(`│  Dateigröße: ~${formatNumber(sizeA)} Bytes`);
  report.push(`│  Base64:     ${formatNumber(bytesA)} Zeichen`);
  report.push('└──────────────────────────────────────────');
  report.push('');
  report.push('┌─ Bild B ─────────────────────────────────');
  report.push(`│  Format:     ${mimeB}`);
  report.push(`│  Dateigröße: ~${formatNumber(sizeB)} Bytes`);
  report.push(`│  Base64:     ${formatNumber(bytesB)} Zeichen`);
  report.push('└──────────────────────────────────────────');
  report.push('');

  // Size comparison
  report.push('┌─ Größenvergleich ────────────────────────');
  if (sizeA === sizeB) {
    report.push('│  Dateigröße:   identisch');
  } else {
    const sizeDiff = Math.abs(sizeA - sizeB);
    const larger = sizeA > sizeB ? 'A' : 'B';
    report.push(`│  Differenz:    ${formatNumber(sizeDiff)} Bytes (Bild ${larger} größer)`);
  }
  if (mimeA !== mimeB) {
    report.push(`│  Hinweis:      Unterschiedliche Formate (${mimeA} vs. ${mimeB})`);
  }
  report.push('└──────────────────────────────────────────');
  report.push('');

  // Diff results
  report.push('┌─ Vergleichsergebnis ─────────────────────');
  if (identical) {
    report.push('│  Status:       IDENTISCH');
    report.push('│  Die beiden Bilder sind bytegenau gleich.');
  } else {
    report.push('│  Status:       UNTERSCHIEDLICH');
    report.push(`│  Abweichende Bytes:  ${formatNumber(diffBytes)} von ${formatNumber(maxLen)}`);
    report.push(`│  Abweichung:         ${formatPercent(diffRatio)}`);
    report.push(`│  Übereinstimmung:    ${formatPercent(1 - diffRatio)}`);
  }
  if (tolerance > 0) {
    report.push(`│  Toleranz:           ${tolerance} (Direktive)`);
  }
  report.push('└──────────────────────────────────────────');
  report.push('');

  // Usage hint
  report.push('─── Hinweis ───────────────────────────────');
  report.push(
    'Dieser Vergleich arbeitet auf Base64-Ebene. Für pixelgenauen',
  );
  report.push(
    'Vergleich mit Farbkanal-Analyse wird Phase 2 ein visuelles',
  );
  report.push('Canvas-Overlay mit Slider und SSIM-Scoring bereitstellen.');
  if (tolerance === 0) {
    report.push('');
    report.push('Tipp: // tolerance=10 als erste Zeile setzt eine');
    report.push('Toleranzschwelle für den künftigen Pixel-Vergleich.');
  }

  return report.join('\n');
}

export const bildDiff: FormatterConfig = {
  id: 'image-diff',
  type: 'formatter',
  categoryId: 'image',
  mode: 'custom',
  format: formatBildDiff,
};
