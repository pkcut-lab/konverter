import { describe, it, expect } from 'vitest';
import { webcamHintergrundUnschaerfe } from '../../../src/lib/tools/webcam-blur';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

// ───────────────────────────────────────────────────────────
// Config-Gate
// ───────────────────────────────────────────────────────────

describe('webcamHintergrundUnschaerfe config', () => {
  it('parses as valid InteractiveConfig', () => {
    const r = parseToolConfig(webcamHintergrundUnschaerfe);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(webcamHintergrundUnschaerfe.id).toBe('webcam-blur');
    expect(webcamHintergrundUnschaerfe.type).toBe('interactive');
    expect(webcamHintergrundUnschaerfe.categoryId).toBe('video');
  });

  it('uses canvas kind', () => {
    expect(webcamHintergrundUnschaerfe.canvasKind).toBe('canvas');
  });

  it('exports PNG', () => {
    expect(webcamHintergrundUnschaerfe.exportFormats).toContain('png');
  });

  it('rejects invalid modification', () => {
    const broken = { ...webcamHintergrundUnschaerfe, type: 'unknown-type' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects empty categoryId', () => {
    const broken = { ...webcamHintergrundUnschaerfe, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});
