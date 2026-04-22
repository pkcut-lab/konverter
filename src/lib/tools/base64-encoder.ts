import type { FormatterConfig } from './schemas';

/**
 * Base64 Encoder — encodes text to Base64 (RFC 4648).
 * Pure client-side, no server contact. Supports standard Base64 and
 * URL-safe Base64url variant (RFC 4648 §5).
 */

function encodeBase64(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte Text eingeben.');
  }
  const bytes = new TextEncoder().encode(trimmed);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
}

function decodeBase64(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, '');
  if (trimmed === '') {
    throw new Error('Bitte Base64-String eingeben.');
  }
  // Accept URL-safe Base64url (RFC 4648 §5) by normalizing back to standard
  const normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(padded);
  } catch {
    throw new Error('Kein gültiger Base64-String.');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Base64 ist gültig, enthält aber keinen UTF-8-Text.');
  }
}

export const base64Encoder: FormatterConfig = {
  id: 'base64-encoder',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: encodeBase64,
  inverse: decodeBase64,
  inverseLabel: 'Decode',
  placeholder: 'Hallo Welt',
  inversePlaceholder: 'SGFsbG8gV2VsdA==',
};
