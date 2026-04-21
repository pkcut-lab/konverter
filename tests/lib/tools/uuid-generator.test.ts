import { describe, it, expect } from 'vitest';
import { uuidGenerator } from '../../../src/lib/tools/uuid-generator';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidGenerator config', () => {
  it('parses as valid GeneratorConfig', () => {
    const r = parseToolConfig(uuidGenerator);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(uuidGenerator.id).toBe('uuid-generator');
    expect(uuidGenerator.type).toBe('generator');
    expect(uuidGenerator.categoryId).toBe('dev');
    expect(uuidGenerator.defaultCount).toBe(1);
  });

  it('rejects invalid modification', () => {
    const broken = { ...uuidGenerator, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('uuidGenerator generate', () => {
  it('generates a valid UUID v4 by default', () => {
    const uuid = uuidGenerator.generate();
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it('generates a valid UUID v4 when version=4', () => {
    const uuid = uuidGenerator.generate({ version: 4 });
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it('generates a valid UUID v7 when version=7', () => {
    const uuid = uuidGenerator.generate({ version: 7 });
    expect(uuid).toMatch(UUID_V7_REGEX);
  });

  it('generates lowercase hex characters', () => {
    const uuid = uuidGenerator.generate();
    expect(uuid).toBe(uuid.toLowerCase());
  });

  it('generates 36-character string with hyphens', () => {
    const uuid = uuidGenerator.generate();
    expect(uuid.length).toBe(36);
    expect(uuid.charAt(8)).toBe('-');
    expect(uuid.charAt(13)).toBe('-');
    expect(uuid.charAt(18)).toBe('-');
    expect(uuid.charAt(23)).toBe('-');
  });

  it('generates unique UUIDs on consecutive calls', () => {
    const uuids = new Set(Array.from({ length: 50 }, () => uuidGenerator.generate()));
    expect(uuids.size).toBe(50);
  });

  it('v7 embeds a recent timestamp', () => {
    const before = Date.now();
    const uuid = uuidGenerator.generate({ version: 7 });
    const after = Date.now();

    // Extract 48-bit timestamp from first 12 hex chars (bytes 0-5)
    const hex = uuid.replace(/-/g, '').slice(0, 12);
    const ts = parseInt(hex, 16);

    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('falls back to v4 for unknown version numbers', () => {
    const uuid = uuidGenerator.generate({ version: 99 });
    expect(uuid).toMatch(UUID_V4_REGEX);
  });
});
