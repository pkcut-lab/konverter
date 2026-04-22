import type { FormatterConfig } from './schemas';

/**
 * JWT Decoder — decodes JWT header and payload (no signature verification).
 * Pure client-side, no server contact. Base64url decoding via atob with
 * URL-safe character replacement.
 */

/** Known JWT timestamp claims. */
const TIMESTAMP_CLAIMS = ['iat', 'exp', 'nbf'] as const;

/**
 * Decode a single base64url-encoded segment to a UTF-8 string.
 * Replaces URL-safe chars (- → +, _ → /) and adds padding before atob.
 */
function decodeBase64Url(segment: string): string {
  let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  // Pad to multiple of 4
  const pad = base64.length % 4;
  if (pad === 2) base64 += '==';
  else if (pad === 3) base64 += '=';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Format a Unix timestamp (seconds) as a human-readable ISO-like string
 * in the user's local timezone.
 */
function formatTimestamp(epochSeconds: number): string {
  const date = new Date(epochSeconds * 1000);
  return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

/**
 * Determine the expiry status of the token based on `exp` and `nbf` claims.
 */
function getExpiryStatus(payload: Record<string, unknown>): string {
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.nbf === 'number' && now < payload.nbf) {
    return '⏳ Noch nicht gültig (nbf liegt in der Zukunft)';
  }
  if (typeof payload.exp === 'number') {
    return now >= payload.exp
      ? '❌ Abgelaufen (exp liegt in der Vergangenheit)'
      : '✅ Gültig (exp liegt in der Zukunft)';
  }
  return 'ℹ️ Kein exp-Claim — Token hat kein Ablaufdatum';
}

function decodeJwt(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte einen JWT-Token eingeben.');
  }

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    throw new Error(
      `Ungültiges JWT-Format: erwartet 3 Segmente (header.payload.signature), erhalten: ${String(parts.length)}.`,
    );
  }

  const [headerB64, payloadB64] = parts;

  let header: Record<string, unknown>;
  try {
    header = JSON.parse(decodeBase64Url(headerB64)) as Record<string, unknown>;
  } catch {
    throw new Error('JWT-Header ist kein gültiges JSON. Prüfe, ob der Token korrekt kopiert wurde.');
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(decodeBase64Url(payloadB64)) as Record<string, unknown>;
  } catch {
    throw new Error('JWT-Payload ist kein gültiges JSON. Prüfe, ob der Token korrekt kopiert wurde.');
  }

  const lines: string[] = [];

  // Header
  lines.push('═══ HEADER ═══');
  lines.push(JSON.stringify(header, null, 2));
  lines.push('');

  // Payload
  lines.push('═══ PAYLOAD ═══');
  lines.push(JSON.stringify(payload, null, 2));
  lines.push('');

  // Timestamp annotations
  const timestampLines: string[] = [];
  for (const claim of TIMESTAMP_CLAIMS) {
    if (typeof payload[claim] === 'number') {
      timestampLines.push(`  ${claim}: ${formatTimestamp(payload[claim] as number)}`);
    }
  }
  if (timestampLines.length > 0) {
    lines.push('═══ ZEITSTEMPEL ═══');
    lines.push(...timestampLines);
    lines.push('');
  }

  // Expiry status
  lines.push('═══ STATUS ═══');
  lines.push(`  ${getExpiryStatus(payload)}`);

  return lines.join('\n');
}

export const jwtDecoder: FormatterConfig = {
  id: 'jwt-decoder',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'custom',
  format: decodeJwt,
  placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSIsImlhdCI6MTcwMDAwMDAwMH0.hKXMRsqB7JvYPzgNzgPjgKoN3R5i5TcJj0h8v7v_d14',
};
