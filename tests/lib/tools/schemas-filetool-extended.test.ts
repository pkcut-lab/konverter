import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('FileToolConfig — extended fields', () => {
  const valid = {
    id: 'test-tool',
    type: 'file-tool' as const,
    categoryId: 'bilder',
    accept: ['image/png'],
    maxSizeMb: 10,
    process: () => new Uint8Array([1, 2, 3]),
  };

  it('accepts config without prepare/defaultFormat/cameraCapture (backwards-compat)', () => {
    const r = parseToolConfig(valid);
    expect(r.ok).toBe(true);
  });

  it('accepts config with optional prepare function', () => {
    const r = parseToolConfig({ ...valid, prepare: async () => undefined });
    expect(r.ok).toBe(true);
  });

  it('accepts config with defaultFormat string', () => {
    const r = parseToolConfig({ ...valid, defaultFormat: 'png' });
    expect(r.ok).toBe(true);
  });

  it('accepts config with cameraCapture boolean', () => {
    const r = parseToolConfig({ ...valid, cameraCapture: false });
    expect(r.ok).toBe(true);
  });

  it('accepts config with filenameSuffix string', () => {
    const r = parseToolConfig({ ...valid, filenameSuffix: '_no-bg' });
    expect(r.ok).toBe(true);
  });

  it('accepts config with showQuality boolean', () => {
    const r = parseToolConfig({ ...valid, showQuality: false });
    expect(r.ok).toBe(true);
  });

  it('rejects non-callable prepare', () => {
    const r = parseToolConfig({ ...valid, prepare: 'not-a-function' });
    expect(r.ok).toBe(false);
  });
});
