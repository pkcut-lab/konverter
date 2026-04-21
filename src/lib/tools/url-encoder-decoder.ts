import type { FormatterConfig } from './schemas';

/**
 * URL Encoder/Decoder — encodes/decodes text using percent-encoding (RFC 3986).
 * Pure client-side, no server contact. Uses encodeURIComponent/decodeURIComponent.
 *
 * Differentiators:
 * - Double-encoding detection: warns when input already contains %XX sequences
 * - Space-encoding awareness: uses %20 (RFC 3986 standard)
 */

/** Pattern matching valid percent-encoded sequences (%HH where H is a hex digit). */
const PERCENT_ENCODED_RE = /%[0-9A-Fa-f]{2}/;

/**
 * Detects whether input already contains percent-encoded sequences.
 * Returns true if at least one valid %HH pattern is found.
 */
export function hasPercentEncoding(input: string): boolean {
  return PERCENT_ENCODED_RE.test(input);
}

/**
 * Encodes a string using encodeURIComponent (RFC 3986 percent-encoding).
 * Unreserved characters (A-Z a-z 0-9 - _ . ~) are left unencoded.
 */
function encodeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte Text eingeben oder eine Datei laden.');
  }

  return encodeURIComponent(trimmed);
}

/**
 * Decodes a percent-encoded string using decodeURIComponent.
 * Throws a clear error on malformed percent sequences.
 */
export function decodeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte Text eingeben oder eine Datei laden.');
  }

  try {
    return decodeURIComponent(trimmed);
  } catch {
    throw new Error(
      'Ungültige Percent-Encoding-Sequenz. Prüfe, ob alle %XX-Werte gültige Hex-Paare sind.',
    );
  }
}

export const urlEncoderDecoder: FormatterConfig = {
  id: 'url-encoder-decoder',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: encodeUrl,
};
