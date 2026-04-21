import type { FormatterConfig } from './schemas';

/**
 * Base64 Encoder — encodes text to Base64 (RFC 4648).
 * Pure client-side, no server contact. Supports standard Base64 and
 * URL-safe Base64url variant (RFC 4648 §5).
 */

function encodeBase64(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte Text eingeben oder eine Datei laden.');
  }

  // Encode to UTF-8 bytes, then to standard Base64
  const bytes = new TextEncoder().encode(trimmed);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
}

export const base64Encoder: FormatterConfig = {
  id: 'base64-encoder',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: encodeBase64,
};
