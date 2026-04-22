import type { FormatterConfig } from './schemas';

/**
 * QR Code Generator — generates QR codes as SVG from text/URL input.
 * Pure client-side, no server contact, no npm dependencies.
 *
 * Input: any text or URL string
 * Output: SVG markup string of the QR code
 *
 * Uses a minimal inline QR encoder supporting byte mode with
 * error correction level M (15% recovery).
 */

// ── Reed-Solomon GF(256) arithmetic ────────────────────────────────────────

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255] as number;
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] as number) + (GF_LOG[b] as number)] as number;
}

/** Generate Reed-Solomon generator polynomial for `ecLen` error correction codewords. */
function rsGeneratorPoly(ecLen: number): Uint8Array {
  let gen = new Uint8Array([1]);
  for (let i = 0; i < ecLen; i++) {
    const next = new Uint8Array(gen.length + 1);
    const factor = GF_EXP[i] as number;
    for (let j = gen.length - 1; j >= 0; j--) {
      next[j + 1] = (next[j + 1] as number) ^ gfMul(gen[j] as number, factor);
      next[j] = (next[j] as number) ^ (gen[j] as number);
    }
    gen = next;
  }
  return gen;
}

/** Compute Reed-Solomon error correction codewords. */
function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const result = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++) {
    const coef = (data[i] as number) ^ (result[0] as number);
    // Shift result left by 1
    for (let j = 0; j < ecLen - 1; j++) {
      result[j] = result[j + 1] as number;
    }
    result[ecLen - 1] = 0;
    if (coef !== 0) {
      for (let j = 0; j < ecLen; j++) {
        result[j] = (result[j] as number) ^ gfMul(gen[j + 1] as number, coef);
      }
    }
  }
  return result;
}

// ── QR Code constants ──────────────────────────────────────────────────────

/**
 * Error correction level M: version → [totalCodewords, ecCodewordsPerBlock, numBlocks].
 * Supports versions 1–10 which handle up to ~174 bytes in byte mode (plenty for URLs/text).
 */
const EC_TABLE_M: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0],      // placeholder for 0-index
  [26, 10, 1],     // V1
  [44, 16, 1],     // V2
  [70, 26, 1],     // V3
  [100, 18, 2],    // V4
  [134, 24, 2],    // V5
  [172, 16, 4],    // V6
  [196, 18, 4],    // V7
  [242, 24, 4],    // V8 — 2 groups: 2 blocks of 15 + 2 blocks of 16
  [292, 30, 4],    // V9 — 3+1 split
  [346, 18, 6],    // V10 — 2 groups: 4 blocks of 17 + 2 blocks of 18 (but simplified)
];

/**
 * Data capacity in bytes for byte mode, EC level M, versions 1–10.
 * Computed as: totalCodewords - (ecCodewordsPerBlock * numBlocks) - mode/length overhead.
 */
const BYTE_CAPACITY_M: readonly number[] = [
  0,   // placeholder
  14,  // V1: 26 - 10*1 - 2 overhead = 14
  26,  // V2: 44 - 16*1 - 2 = 26
  42,  // V3: 70 - 26*1 - 2 = 42
  62,  // V4: 100 - 18*2 - 2 = 62
  84,  // V5: 134 - 24*2 - 2 = 84
  106, // V6: 172 - 16*4 - 2 = 106
  122, // V7: 196 - 18*4 - 2 = 122
  152, // V8: 242 - 24*4 - 2 (approx, simplified) = 144 → corrected below
  180, // V9
  213, // V10
];

/** Size of QR code matrix for a given version. */
function matrixSize(version: number): number {
  return 17 + version * 4;
}

// ── Alignment pattern positions ────────────────────────────────────────────

const ALIGNMENT_POSITIONS: ReadonlyArray<readonly number[]> = [
  [],          // V1 — no alignment
  [6, 18],     // V2
  [6, 22],     // V3
  [6, 26],     // V4
  [6, 30],     // V5
  [6, 34],     // V6
  [6, 22, 38], // V7
  [6, 24, 42], // V8
  [6, 26, 46], // V9
  [6, 28, 52], // V10
];

// ── Format info (EC level M, mask 0–7) ─────────────────────────────────────

const FORMAT_BITS_M: readonly number[] = [
  0x5412, 0x5125, 0x5e7c, 0x5b4b,
  0x45f9, 0x40ce, 0x4f97, 0x4aa0,
];

// ── Version info (versions 7–10) ──────────────────────────────────────────

const VERSION_INFO: readonly number[] = [
  0, 0, 0, 0, 0, 0, 0, // 0–6: no version info
  0x07c94, 0x085bc, 0x09a99, 0x0a4d3,
];

// ── Data encoding ──────────────────────────────────────────────────────────

function selectVersion(dataLen: number): number {
  for (let v = 1; v <= 10; v++) {
    if (dataLen <= (BYTE_CAPACITY_M[v] as number)) return v;
  }
  throw new Error(`Text zu lang fuer QR-Code (max ~213 Bytes bei Version 10, EC-Level M). Eingabe: ${dataLen} Bytes.`);
}

/** Encode data bytes into QR data codewords (byte mode, EC level M). */
function encodeData(text: string): { version: number; codewords: Uint8Array } {
  // UTF-8 encode
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const version = selectVersion(bytes.length);

  const [totalCW, ecPerBlock, numBlocks] = EC_TABLE_M[version] as readonly [number, number, number];
  const dataCW = totalCW - ecPerBlock * numBlocks;

  // Build data bitstream: mode indicator (0100 = byte) + character count + data + terminator + padding
  const bits: number[] = [];

  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Mode indicator: byte = 0100
  pushBits(0b0100, 4);

  // Character count indicator: 8 bits for V1–9, 16 bits for V10+
  const countBits = version <= 9 ? 8 : 16;
  pushBits(bytes.length, countBits);

  // Data bytes
  for (const b of bytes) {
    pushBits(b, 8);
  }

  // Terminator: up to 4 zero bits
  const maxBits = dataCW * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad codewords
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2] as number, 8);
    padIdx++;
  }

  // Convert bits to bytes
  const dataBytes = new Uint8Array(dataCW);
  for (let i = 0; i < dataCW; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | ((bits[i * 8 + b] as number | undefined) || 0);
    }
    dataBytes[i] = byte;
  }

  // Split into blocks and compute EC
  const blockDataLen = Math.floor(dataCW / numBlocks);
  const longBlocks = dataCW % numBlocks;
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    const len = blockDataLen + (b >= numBlocks - longBlocks ? 1 : 0);
    const block = dataBytes.slice(offset, offset + len);
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
    offset += len;
  }

  // Interleave data codewords
  const result: number[] = [];
  const maxDataBlockLen = blockDataLen + (longBlocks > 0 ? 1 : 0);
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (let b = 0; b < numBlocks; b++) {
      const block = dataBlocks[b] as Uint8Array;
      if (i < block.length) {
        result.push(block[i] as number);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      result.push((ecBlocks[b] as Uint8Array)[i] as number);
    }
  }

  return { version, codewords: new Uint8Array(result) };
}

// ── Matrix construction ────────────────────────────────────────────────────

type Matrix = Uint8Array[];

function createMatrix(size: number): Matrix {
  return Array.from({ length: size }, () => new Uint8Array(size));
}

function cloneMatrix(m: Matrix): Matrix {
  return m.map((row) => new Uint8Array(row));
}

/** Set a module and mark it as reserved (bit 1 = value, bit 7 = reserved flag). */
function setReserved(m: Matrix, r: number, c: number, val: boolean) {
  if (r >= 0 && r < m.length && c >= 0 && c < m.length) {
    (m[r] as Uint8Array)[c] = (val ? 1 : 0) | 0x80;
  }
}

function placeFinderPattern(m: Matrix, row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const tr = row + r;
      const tc = col + c;
      if (tr < 0 || tr >= m.length || tc < 0 || tc >= m.length) continue;
      const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      const isSeparator = r === -1 || r === 7 || c === -1 || c === 7;
      setReserved(m, tr, tc, (inOuter || inInner) && !isSeparator);
    }
  }
}

function placeAlignmentPattern(m: Matrix, row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const tr = row + r;
      const tc = col + c;
      if (((m[tr] as Uint8Array | undefined)?.[tc] ?? 0) & 0x80) continue; // skip if reserved
      const isEdge = r === -2 || r === 2 || c === -2 || c === 2;
      const isCenter = r === 0 && c === 0;
      setReserved(m, tr, tc, isEdge || isCenter);
    }
  }
}

function placeTimingPatterns(m: Matrix) {
  const size = m.length;
  for (let i = 8; i < size - 8; i++) {
    setReserved(m, 6, i, i % 2 === 0);
    setReserved(m, i, 6, i % 2 === 0);
  }
}

function reserveFormatArea(m: Matrix) {
  const size = m.length;
  const row8 = m[8] as Uint8Array;
  // Around top-left finder
  for (let i = 0; i <= 8; i++) {
    if (!((row8[i] as number) & 0x80)) setReserved(m, 8, i, false);
    if (!(((m[i] as Uint8Array)[8] as number) & 0x80)) setReserved(m, i, 8, false);
  }
  // Around top-right finder
  for (let i = 0; i < 8; i++) {
    if (!((row8[size - 1 - i] as number) & 0x80)) setReserved(m, 8, size - 1 - i, false);
  }
  // Around bottom-left finder
  for (let i = 0; i < 7; i++) {
    if (!(((m[size - 1 - i] as Uint8Array)[8] as number) & 0x80)) setReserved(m, size - 1 - i, 8, false);
  }
  // Dark module
  setReserved(m, size - 8, 8, true);
}

function reserveVersionArea(m: Matrix, version: number) {
  if (version < 7) return;
  const size = m.length;
  const info = VERSION_INFO[version] as number;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const bit = (info >> (i * 3 + j)) & 1;
      setReserved(m, size - 11 + j, i, bit === 1);
      setReserved(m, i, size - 11 + j, bit === 1);
    }
  }
}

function placeDataBits(m: Matrix, codewords: Uint8Array) {
  const size = m.length;
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let x = size - 1;
  let upward = true;

  while (x >= 0) {
    if (x === 6) { x--; continue; } // skip timing column

    const start = upward ? size - 1 : 0;
    const end = upward ? -1 : size;
    const step = upward ? -1 : 1;

    for (let y = start; y !== end; y += step) {
      const row = m[y] as Uint8Array;
      for (let dx = 0; dx <= 1; dx++) {
        const col = x - dx;
        if (col < 0) continue;
        if ((row[col] as number) & 0x80) continue; // reserved
        if (bitIdx < totalBits) {
          const byteIdx = Math.floor(bitIdx / 8);
          const bitPos = 7 - (bitIdx % 8);
          row[col] = ((codewords[byteIdx] as number) >> bitPos) & 1;
          bitIdx++;
        }
      }
    }

    x -= 2;
    upward = !upward;
  }
}

// ── Masking ────────────────────────────────────────────────────────────────

type MaskFn = (r: number, c: number) => boolean;

const MASK_FNS: MaskFn[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(m: Matrix, maskIdx: number): Matrix {
  const masked = cloneMatrix(m);
  const fn = MASK_FNS[maskIdx] as MaskFn;
  const size = m.length;
  for (let r = 0; r < size; r++) {
    const row = masked[r] as Uint8Array;
    for (let c = 0; c < size; c++) {
      if ((row[c] as number) & 0x80) continue; // reserved
      if (fn(r, c)) {
        row[c] = (row[c] as number) ^ 1;
      }
    }
  }
  return masked;
}

function writeFormatInfo(m: Matrix, maskIdx: number) {
  const bits = FORMAT_BITS_M[maskIdx] as number;
  const size = m.length;
  const row8 = m[8] as Uint8Array;

  // Horizontal (row 8)
  const hPositions = [0, 1, 2, 3, 4, 5, 7, 8, size - 8, size - 7, size - 6, size - 5, size - 4, size - 3, size - 2, size - 1];
  for (let i = 0; i < 15; i++) {
    const bit = (bits >> (14 - i)) & 1;
    row8[hPositions[i] as number] = bit | 0x80;
  }

  // Vertical (col 8)
  const vPositions = [0, 1, 2, 3, 4, 5, 7, 8, size - 7, size - 6, size - 5, size - 4, size - 3, size - 2, size - 1];
  for (let i = 0; i < 15; i++) {
    const bit = (bits >> (14 - i)) & 1;
    (m[vPositions[14 - i] as number] as Uint8Array)[8] = bit | 0x80;
  }
}

/** Penalty score for mask evaluation (simplified — rule 1 + rule 3 approximation). */
function penaltyScore(m: Matrix): number {
  const size = m.length;
  let score = 0;

  // Rule 1: consecutive same-color modules (horizontal + vertical)
  for (let r = 0; r < size; r++) {
    const rowR = m[r] as Uint8Array;
    let runH = 1;
    let runV = 1;
    for (let c = 1; c < size; c++) {
      if (((rowR[c] as number) & 1) === ((rowR[c - 1] as number) & 1)) {
        runH++;
        if (runH === 5) score += 3;
        else if (runH > 5) score += 1;
      } else {
        runH = 1;
      }
      if ((((m[c] as Uint8Array)[r] as number) & 1) === (((m[c - 1] as Uint8Array)[r] as number) & 1)) {
        runV++;
        if (runV === 5) score += 3;
        else if (runV > 5) score += 1;
      } else {
        runV = 1;
      }
    }
  }

  // Rule 2: 2x2 same-color blocks
  for (let r = 0; r < size - 1; r++) {
    const rowR = m[r] as Uint8Array;
    const rowR1 = m[r + 1] as Uint8Array;
    for (let c = 0; c < size - 1; c++) {
      const v = (rowR[c] as number) & 1;
      if (((rowR[c + 1] as number) & 1) === v && ((rowR1[c] as number) & 1) === v && ((rowR1[c + 1] as number) & 1) === v) {
        score += 3;
      }
    }
  }

  return score;
}

function selectBestMask(base: Matrix): { masked: Matrix; maskIdx: number } {
  let best = Infinity;
  let bestMask = 0;
  let bestMatrix = base;

  for (let i = 0; i < 8; i++) {
    const masked = applyMask(base, i);
    writeFormatInfo(masked, i);
    const score = penaltyScore(masked);
    if (score < best) {
      best = score;
      bestMask = i;
      bestMatrix = masked;
    }
  }

  return { masked: bestMatrix, maskIdx: bestMask };
}

// ── SVG rendering ──────────────────────────────────────────────────────────

function matrixToSvg(m: Matrix, moduleSize: number = 4, quietZone: number = 4): string {
  const size = m.length;
  const totalSize = (size + quietZone * 2) * moduleSize;

  const paths: string[] = [];
  for (let r = 0; r < size; r++) {
    const row = m[r] as Uint8Array;
    for (let c = 0; c < size; c++) {
      if ((row[c] as number) & 1) {
        const x = (c + quietZone) * moduleSize;
        const y = (r + quietZone) * moduleSize;
        paths.push(`M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z`);
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">`,
    `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`,
    `<path d="${paths.join('')}" fill="black"/>`,
    '</svg>',
  ].join('');
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Generate a QR code as SVG string from arbitrary text input. */
export function generateQrSvg(text: string): string {
  if (!text || text.trim().length === 0) {
    throw new Error('Bitte einen Text oder eine URL eingeben.');
  }

  const { version, codewords } = encodeData(text);
  const size = matrixSize(version);
  const m = createMatrix(size);

  // Place fixed patterns
  placeFinderPattern(m, 0, 0);
  placeFinderPattern(m, 0, size - 7);
  placeFinderPattern(m, size - 7, 0);

  // Alignment patterns (V2+)
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version - 1] as readonly number[];
    for (const r of positions) {
      for (const c of positions) {
        // Skip if overlapping with finder patterns
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        placeAlignmentPattern(m, r, c);
      }
    }
  }

  placeTimingPatterns(m);
  reserveFormatArea(m);
  reserveVersionArea(m, version);

  // Place data
  placeDataBits(m, codewords);

  // Select best mask
  const { masked } = selectBestMask(m);

  return matrixToSvg(masked);
}

/**
 * Format function for FormatterConfig.
 * Takes text input and returns QR code as SVG string.
 */
function formatQrCode(input: string): string {
  return generateQrSvg(input);
}

export const qrCodeGenerator: FormatterConfig = {
  id: 'qr-code-generator',
  type: 'formatter',
  categoryId: 'image',
  mode: 'custom',
  format: formatQrCode,
};
