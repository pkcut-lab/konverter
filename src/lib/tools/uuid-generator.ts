import type { GeneratorConfig } from './schemas';

/**
 * UUID generator — pure client-side via Web Crypto API.
 * Supports v4 (random) and v7 (time-ordered, RFC 9562).
 */

const HEX = '0123456789abcdef';

function hexByte(byte: number): string {
  return HEX.charAt((byte >> 4) & 0xf) + HEX.charAt(byte & 0xf);
}

function formatUuid(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < 16; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 10) s += '-';
    s += hexByte(bytes[i]!);
  }
  return s;
}

function generateV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version 4 (bits 48–51)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  // Set variant 1 (bits 64–65)
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  return formatUuid(bytes);
}

function generateV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 48-bit Unix timestamp in milliseconds (big-endian, bytes 0–5)
  const now = Date.now();
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  // Set version 7 (bits 48–51)
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  // Set variant 1 (bits 64–65)
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  return formatUuid(bytes);
}

function generateUuid(config?: Record<string, unknown>): string {
  const version = typeof config?.version === 'number' ? config.version : 4;

  switch (version) {
    case 7:
      return generateV7();
    case 4:
    default:
      return generateV4();
  }
}

export const uuidGenerator: GeneratorConfig = {
  id: 'uuid-generator',
  type: 'generator',
  categoryId: 'dev',
  generate: generateUuid,
  defaultCount: 1,
};
