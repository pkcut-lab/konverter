import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { jwtDecoder } from '../../../src/lib/tools/jwt-decoder';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

/**
 * Helper: build a minimal JWT from header and payload objects.
 * Signature segment is a dummy base64url string.
 */
function buildJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
): string {
  const enc = (obj: Record<string, unknown>) => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  return `${enc(header)}.${enc(payload)}.dummysignature`;
}

describe('jwtDecoder config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(jwtDecoder);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(jwtDecoder.id).toBe('jwt-decoder');
    expect(jwtDecoder.type).toBe('formatter');
    expect(jwtDecoder.categoryId).toBe('dev');
    expect(jwtDecoder.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...jwtDecoder, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('jwtDecoder format — valid tokens', () => {
  it('decodes header correctly', () => {
    const jwt = buildJwt({ alg: 'HS256', typ: 'JWT' }, { sub: '1234' });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('"alg": "HS256"');
    expect(result).toContain('"typ": "JWT"');
  });

  it('decodes payload correctly', () => {
    const jwt = buildJwt({ alg: 'RS256' }, { sub: 'user42', role: 'admin' });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('"sub": "user42"');
    expect(result).toContain('"role": "admin"');
  });

  it('shows HEADER and PAYLOAD section labels', () => {
    const jwt = buildJwt({ alg: 'HS256' }, { sub: '1' });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('HEADER');
    expect(result).toContain('PAYLOAD');
  });
});

describe('jwtDecoder format — timestamp handling', () => {
  it('formats iat claim as human-readable date', () => {
    // 2025-01-15T12:00:00Z = 1736942400
    const jwt = buildJwt({ alg: 'HS256' }, { iat: 1736942400 });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('ZEITSTEMPEL');
    expect(result).toContain('iat:');
    expect(result).toContain('2025-01-15');
    expect(result).toContain('12:00:00');
  });

  it('formats exp claim as human-readable date', () => {
    const jwt = buildJwt({ alg: 'HS256' }, { exp: 1736942400 });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('exp:');
  });

  it('formats nbf claim as human-readable date', () => {
    const jwt = buildJwt({ alg: 'HS256' }, { nbf: 1736942400 });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('nbf:');
  });

  it('omits ZEITSTEMPEL section when no timestamp claims exist', () => {
    const jwt = buildJwt({ alg: 'HS256' }, { sub: 'test' });
    const result = jwtDecoder.format(jwt);
    expect(result).not.toContain('ZEITSTEMPEL');
  });
});

describe('jwtDecoder format — expiry status', () => {
  beforeEach(() => {
    // Fix Date.now to 2025-06-01T00:00:00Z = 1748736000000ms
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows expired status when exp is in the past', () => {
    // exp = 2025-01-01 (past relative to fake now 2025-06-01)
    const jwt = buildJwt({ alg: 'HS256' }, { exp: 1735689600 });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('Abgelaufen');
  });

  it('shows valid status when exp is in the future', () => {
    // exp = 2026-01-01 (future relative to fake now 2025-06-01)
    const jwt = buildJwt({ alg: 'HS256' }, { exp: 1767225600 });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('Gültig');
  });

  it('shows not-yet-valid status when nbf is in the future', () => {
    // nbf = 2026-01-01 (future), exp = 2027-01-01
    const jwt = buildJwt({ alg: 'HS256' }, { nbf: 1767225600, exp: 1798761600 });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('Noch nicht gültig');
  });

  it('shows no-exp message when exp claim is missing', () => {
    const jwt = buildJwt({ alg: 'HS256' }, { sub: 'test' });
    const result = jwtDecoder.format(jwt);
    expect(result).toContain('Kein exp-Claim');
  });
});

describe('jwtDecoder format — malformed input', () => {
  it('throws on empty input', () => {
    expect(() => jwtDecoder.format('')).toThrow('Bitte einen JWT-Token eingeben');
    expect(() => jwtDecoder.format('   ')).toThrow('Bitte einen JWT-Token eingeben');
  });

  it('throws on input with wrong number of segments (1 segment)', () => {
    expect(() => jwtDecoder.format('onlyone')).toThrow('3 Segmente');
  });

  it('throws on input with two segments', () => {
    expect(() => jwtDecoder.format('part1.part2')).toThrow('3 Segmente');
  });

  it('throws on input with four segments', () => {
    expect(() => jwtDecoder.format('a.b.c.d')).toThrow('3 Segmente');
  });

  it('throws on invalid base64 in header', () => {
    expect(() => jwtDecoder.format('!!!.eyJ0ZXN0IjoxfQ.sig')).toThrow('Header');
  });

  it('throws on invalid JSON in payload', () => {
    // Valid base64url that decodes to non-JSON
    const headerB64 = btoa('{"alg":"HS256"}').replace(/=/g, '');
    const badPayload = btoa('not-json').replace(/=/g, '');
    expect(() => jwtDecoder.format(`${headerB64}.${badPayload}.sig`)).toThrow('Payload');
  });

  it('handles token with padding-free base64url segments', () => {
    // Standard JWT tokens omit padding — should still work
    const jwt = buildJwt({ alg: 'HS256' }, { sub: '1' });
    expect(() => jwtDecoder.format(jwt)).not.toThrow();
  });
});
