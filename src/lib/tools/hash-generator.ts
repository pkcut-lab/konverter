import type { FormatterConfig } from './schemas';

/**
 * Hash Generator — generates MD5, SHA-1, SHA-256, SHA-384, SHA-512 digests.
 * Pure client-side, no server contact. All algorithms implemented in JS
 * (no external dependencies). Output is synchronous hex-encoded strings.
 *
 * The format function returns all five hash digests separated by labelled
 * lines, with SHA-256 highlighted as the recommended default.
 */

// ---------------------------------------------------------------------------
// MD5 — RFC 1321 (pure JS, no dependencies)
// ---------------------------------------------------------------------------

function md5(input: string): string {
  const bytes = utf8Encode(input);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  // Pre-processing: pad message
  const origLen = bytes.length;
  const bitLen = origLen * 8;

  // Append 0x80 byte, then zeros, then 64-bit length (little-endian)
  const padLen = ((56 - (origLen + 1) % 64) + 64) % 64;
  const padded = new Uint8Array(origLen + 1 + padLen + 8);
  padded.set(bytes);
  padded[origLen] = 0x80;

  // Append original length in bits as 64-bit little-endian
  // Only low 32 bits needed for practical inputs (< 512 MB)
  const lenOffset = origLen + 1 + padLen;
  padded[lenOffset] = bitLen & 0xff;
  padded[lenOffset + 1] = (bitLen >>> 8) & 0xff;
  padded[lenOffset + 2] = (bitLen >>> 16) & 0xff;
  padded[lenOffset + 3] = (bitLen >>> 24) & 0xff;
  // High 32 bits stay 0 (Uint8Array is zero-initialized)

  // Per-round shift amounts
  const s: number[] = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Pre-computed K table (floor(2^32 * abs(sin(i+1))))
  const K: number[] = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  // Process each 512-bit (64-byte) chunk
  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] =
        padded[offset + j * 4]! |
        (padded[offset + j * 4 + 1]! << 8) |
        (padded[offset + j * 4 + 2]! << 16) |
        (padded[offset + j * 4 + 3]! << 24);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i]! + M[g]!) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << s[i]!) | (F >>> (32 - s[i]!)))) | 0;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  return toLittleEndianHex(a0) + toLittleEndianHex(b0) + toLittleEndianHex(c0) + toLittleEndianHex(d0);
}

function toLittleEndianHex(n: number): string {
  let hex = '';
  for (let i = 0; i < 4; i++) {
    const byte = (n >>> (i * 8)) & 0xff;
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

// ---------------------------------------------------------------------------
// SHA-1 — FIPS 180-4 (pure JS)
// ---------------------------------------------------------------------------

function sha1(input: string): string {
  const bytes = utf8Encode(input);
  const padded = shaPad(bytes, true);

  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const W = new Uint32Array(80);
    for (let t = 0; t < 16; t++) {
      W[t] =
        (padded[offset + t * 4]! << 24) |
        (padded[offset + t * 4 + 1]! << 16) |
        (padded[offset + t * 4 + 2]! << 8) |
        padded[offset + t * 4 + 3]!;
    }
    for (let t = 16; t < 80; t++) {
      const x = W[t - 3]! ^ W[t - 8]! ^ W[t - 14]! ^ W[t - 16]!;
      W[t] = (x << 1) | (x >>> 31);
    }

    let a = H0, b = H1, c = H2, d = H3, e = H4;

    for (let t = 0; t < 80; t++) {
      let f: number, k: number;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + W[t]!) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
  }

  return toBigEndianHex(H0) + toBigEndianHex(H1) + toBigEndianHex(H2) + toBigEndianHex(H3) + toBigEndianHex(H4);
}

// ---------------------------------------------------------------------------
// SHA-256 — FIPS 180-4 (pure JS)
// ---------------------------------------------------------------------------

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256(input: string): string {
  const bytes = utf8Encode(input);
  const padded = shaPad(bytes, true);

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const W = new Uint32Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] =
        (padded[offset + t * 4]! << 24) |
        (padded[offset + t * 4 + 1]! << 16) |
        (padded[offset + t * 4 + 2]! << 8) |
        padded[offset + t * 4 + 3]!;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15]!, 7) ^ rotr(W[t - 15]!, 18) ^ (W[t - 15]! >>> 3);
      const s1 = rotr(W[t - 2]!, 17) ^ rotr(W[t - 2]!, 19) ^ (W[t - 2]! >>> 10);
      W[t] = (W[t - 16]! + s0 + W[t - 7]! + s1) | 0;
    }

    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[t]! + W[t]!) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }

    H0 = (H0 + a) | 0; H1 = (H1 + b) | 0; H2 = (H2 + c) | 0; H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0; H5 = (H5 + f) | 0; H6 = (H6 + g) | 0; H7 = (H7 + h) | 0;
  }

  return [H0, H1, H2, H3, H4, H5, H6, H7].map(toBigEndianHex).join('');
}

// ---------------------------------------------------------------------------
// SHA-384 / SHA-512 — FIPS 180-4 (pure JS, 64-bit via paired 32-bit words)
// ---------------------------------------------------------------------------

// 64-bit arithmetic helpers (hi/lo pairs, big-endian)
type U64 = [number, number]; // [hi, lo]

function u64add(a: U64, b: U64): U64 {
  const lo = (a[1] + b[1]) | 0;
  const carry = ((a[1] >>> 0) + (b[1] >>> 0)) > 0xffffffff ? 1 : 0;
  const hi = (a[0] + b[0] + carry) | 0;
  return [hi, lo];
}

function u64rotr(x: U64, n: number): U64 {
  if (n < 32) {
    return [
      (x[0] >>> n) | (x[1] << (32 - n)),
      (x[1] >>> n) | (x[0] << (32 - n)),
    ];
  }
  const m = n - 32;
  return [
    (x[1] >>> m) | (x[0] << (32 - m)),
    (x[0] >>> m) | (x[1] << (32 - m)),
  ];
}

function u64shr(x: U64, n: number): U64 {
  if (n < 32) {
    return [x[0] >>> n, (x[1] >>> n) | (x[0] << (32 - n))];
  }
  return [0, x[0] >>> (n - 32)];
}

function u64xor(a: U64, b: U64): U64 {
  return [a[0] ^ b[0], a[1] ^ b[1]];
}

function u64and(a: U64, b: U64): U64 {
  return [a[0] & b[0], a[1] & b[1]];
}

function u64not(a: U64): U64 {
  return [~a[0], ~a[1]];
}

const SHA512_K: U64[] = [
  [0x428a2f98, 0xd728ae22], [0x71374491, 0x23ef65cd], [0xb5c0fbcf, 0xec4d3b2f], [0xe9b5dba5, 0x8189dbbc],
  [0x3956c25b, 0xf348b538], [0x59f111f1, 0xb605d019], [0x923f82a4, 0xaf194f9b], [0xab1c5ed5, 0xda6d8118],
  [0xd807aa98, 0xa3030242], [0x12835b01, 0x45706fbe], [0x243185be, 0x4ee4b28c], [0x550c7dc3, 0xd5ffb4e2],
  [0x72be5d74, 0xf27b896f], [0x80deb1fe, 0x3b1696b1], [0x9bdc06a7, 0x25c71235], [0xc19bf174, 0xcf692694],
  [0xe49b69c1, 0x9ef14ad2], [0xefbe4786, 0x384f25e3], [0x0fc19dc6, 0x8b8cd5b5], [0x240ca1cc, 0x77ac9c65],
  [0x2de92c6f, 0x592b0275], [0x4a7484aa, 0x6ea6e483], [0x5cb0a9dc, 0xbd41fbd4], [0x76f988da, 0x831153b5],
  [0x983e5152, 0xee66dfab], [0xa831c66d, 0x2db43210], [0xb00327c8, 0x98fb213f], [0xbf597fc7, 0xbeef0ee4],
  [0xc6e00bf3, 0x3da88fc2], [0xd5a79147, 0x930aa725], [0x06ca6351, 0xe003826f], [0x14292967, 0x0a0e6e70],
  [0x27b70a85, 0x46d22ffc], [0x2e1b2138, 0x5c26c926], [0x4d2c6dfc, 0x5ac42aed], [0x53380d13, 0x9d95b3df],
  [0x650a7354, 0x8baf63de], [0x766a0abb, 0x3c77b2a8], [0x81c2c92e, 0x47edaee6], [0x92722c85, 0x1482353b],
  [0xa2bfe8a1, 0x4cf10364], [0xa81a664b, 0xbc423001], [0xc24b8b70, 0xd0f89791], [0xc76c51a3, 0x0654be30],
  [0xd192e819, 0xd6ef5218], [0xd6990624, 0x5565a910], [0xf40e3585, 0x5771202a], [0x106aa070, 0x32bbd1b8],
  [0x19a4c116, 0xb8d2d0c8], [0x1e376c08, 0x5141ab53], [0x2748774c, 0xdf8eeb99], [0x34b0bcb5, 0xe19b48a8],
  [0x391c0cb3, 0xc5c95a63], [0x4ed8aa4a, 0xe3418acb], [0x5b9cca4f, 0x7763e373], [0x682e6ff3, 0xd6b2b8a3],
  [0x748f82ee, 0x5defb2fc], [0x78a5636f, 0x43172f60], [0x84c87814, 0xa1f0ab72], [0x8cc70208, 0x1a6439ec],
  [0x90befffa, 0x23631e28], [0xa4506ceb, 0xde82bde9], [0xbef9a3f7, 0xb2c67915], [0xc67178f2, 0xe372532b],
  [0xca273ece, 0xea26619c], [0xd186b8c7, 0x21c0c207], [0xeada7dd6, 0xcde0eb1e], [0xf57d4f7f, 0xee6ed178],
  [0x06f067aa, 0x72176fba], [0x0a637dc5, 0xa2c898a6], [0x113f9804, 0xbef90dae], [0x1b710b35, 0x131c471b],
  [0x28db77f5, 0x23047d84], [0x32caab7b, 0x40c72493], [0x3c9ebe0a, 0x15c9bebc], [0x431d67c4, 0x9c100d4c],
  [0x4cc5d4be, 0xcb3e42b6], [0x597f299c, 0xfc657e2a], [0x5fcb6fab, 0x3ad6faec], [0x6c44198c, 0x4a475817],
];

function sha512Core(input: string, is384: boolean): string {
  const bytes = utf8Encode(input);
  // SHA-512 padding uses 128-byte blocks and 128-bit length field
  const padded = shaPad512(bytes);

  let H: U64[];
  if (is384) {
    H = [
      [0xcbbb9d5d, 0xc1059ed8], [0x629a292a, 0x367cd507],
      [0x9159015a, 0x3070dd17], [0x152fecd8, 0xf70e5939],
      [0x67332667, 0xffc00b31], [0x8eb44a87, 0x68581511],
      [0xdb0c2e0d, 0x64f98fa7], [0x47b5481d, 0xbefa4fa4],
    ];
  } else {
    H = [
      [0x6a09e667, 0xf3bcc908], [0xbb67ae85, 0x84caa73b],
      [0x3c6ef372, 0xfe94f82b], [0xa54ff53a, 0x5f1d36f1],
      [0x510e527f, 0xade682d1], [0x9b05688c, 0x2b3e6c1f],
      [0x1f83d9ab, 0xfb41bd6b], [0x5be0cd19, 0x137e2179],
    ];
  }

  for (let offset = 0; offset < padded.length; offset += 128) {
    const W: U64[] = new Array(80);
    for (let t = 0; t < 16; t++) {
      const hi =
        (padded[offset + t * 8]! << 24) |
        (padded[offset + t * 8 + 1]! << 16) |
        (padded[offset + t * 8 + 2]! << 8) |
        padded[offset + t * 8 + 3]!;
      const lo =
        (padded[offset + t * 8 + 4]! << 24) |
        (padded[offset + t * 8 + 5]! << 16) |
        (padded[offset + t * 8 + 6]! << 8) |
        padded[offset + t * 8 + 7]!;
      W[t] = [hi, lo];
    }
    for (let t = 16; t < 80; t++) {
      const s0 = u64xor(u64xor(u64rotr(W[t - 15]!, 1), u64rotr(W[t - 15]!, 8)), u64shr(W[t - 15]!, 7));
      const s1 = u64xor(u64xor(u64rotr(W[t - 2]!, 19), u64rotr(W[t - 2]!, 61)), u64shr(W[t - 2]!, 6));
      W[t] = u64add(u64add(W[t - 16]!, s0), u64add(W[t - 7]!, s1));
    }

    let a = H[0]!, b = H[1]!, c = H[2]!, d = H[3]!;
    let e = H[4]!, f = H[5]!, g = H[6]!, h = H[7]!;

    for (let t = 0; t < 80; t++) {
      const S1 = u64xor(u64xor(u64rotr(e, 14), u64rotr(e, 18)), u64rotr(e, 41));
      const ch = u64xor(u64and(e, f), u64and(u64not(e), g));
      const temp1 = u64add(u64add(h, S1), u64add(u64add(ch, SHA512_K[t]!), W[t]!));
      const S0 = u64xor(u64xor(u64rotr(a, 28), u64rotr(a, 34)), u64rotr(a, 39));
      const maj = u64xor(u64xor(u64and(a, b), u64and(a, c)), u64and(b, c));
      const temp2 = u64add(S0, maj);

      h = g; g = f; f = e; e = u64add(d, temp1);
      d = c; c = b; b = a; a = u64add(temp1, temp2);
    }

    H[0] = u64add(H[0]!, a); H[1] = u64add(H[1]!, b);
    H[2] = u64add(H[2]!, c); H[3] = u64add(H[3]!, d);
    H[4] = u64add(H[4]!, e); H[5] = u64add(H[5]!, f);
    H[6] = u64add(H[6]!, g); H[7] = u64add(H[7]!, h);
  }

  const count = is384 ? 6 : 8;
  return H.slice(0, count).map((w) => toBigEndianHex(w[0]) + toBigEndianHex(w[1])).join('');
}

function sha384(input: string): string {
  return sha512Core(input, true);
}

function sha512(input: string): string {
  return sha512Core(input, false);
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function utf8Encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function toBigEndianHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}

/** SHA-1 / SHA-256 padding: 64-byte blocks, big-endian 64-bit length */
function shaPad(bytes: Uint8Array, _bigEndian: boolean): Uint8Array {
  const origLen = bytes.length;
  const bitLen = origLen * 8;
  const padLen = ((55 - origLen % 64) + 64) % 64;
  const result = new Uint8Array(origLen + 1 + padLen + 8);
  result.set(bytes);
  result[origLen] = 0x80;

  // 64-bit big-endian length
  const lenOffset = result.length - 8;
  // For messages < 2^32 bytes, high 4 bytes are 0
  result[lenOffset + 4] = (bitLen >>> 24) & 0xff;
  result[lenOffset + 5] = (bitLen >>> 16) & 0xff;
  result[lenOffset + 6] = (bitLen >>> 8) & 0xff;
  result[lenOffset + 7] = bitLen & 0xff;

  return result;
}

/** SHA-384 / SHA-512 padding: 128-byte blocks, big-endian 128-bit length */
function shaPad512(bytes: Uint8Array): Uint8Array {
  const origLen = bytes.length;
  const bitLen = origLen * 8;
  const padLen = ((111 - origLen % 128) + 128) % 128;
  const result = new Uint8Array(origLen + 1 + padLen + 16);
  result.set(bytes);
  result[origLen] = 0x80;

  // 128-bit big-endian length (only low 64 bits used for practical inputs)
  const lenOffset = result.length - 8;
  result[lenOffset + 4] = (bitLen >>> 24) & 0xff;
  result[lenOffset + 5] = (bitLen >>> 16) & 0xff;
  result[lenOffset + 6] = (bitLen >>> 8) & 0xff;
  result[lenOffset + 7] = bitLen & 0xff;

  return result;
}

// ---------------------------------------------------------------------------
// Public API: all-at-once format function for the Formatter component
// ---------------------------------------------------------------------------

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512';

export const HASH_ALGORITHMS: { id: HashAlgorithm; label: string; hexLen: number }[] = [
  { id: 'md5', label: 'MD5', hexLen: 32 },
  { id: 'sha1', label: 'SHA-1', hexLen: 40 },
  { id: 'sha256', label: 'SHA-256', hexLen: 64 },
  { id: 'sha384', label: 'SHA-384', hexLen: 96 },
  { id: 'sha512', label: 'SHA-512', hexLen: 128 },
];

const hashFns: Record<HashAlgorithm, (input: string) => string> = {
  md5,
  sha1,
  sha256,
  sha384,
  sha512,
};

export function computeHash(algorithm: HashAlgorithm, input: string): string {
  return hashFns[algorithm](input);
}

function formatAllHashes(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte Text eingeben.');
  }

  const lines: string[] = [];
  for (const algo of HASH_ALGORITHMS) {
    const hash = hashFns[algo.id](trimmed);
    lines.push(`${algo.label}:\n${hash}`);
  }
  return lines.join('\n\n');
}

export const hashGenerator: FormatterConfig = {
  id: 'hash-generator',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: formatAllHashes,
};
