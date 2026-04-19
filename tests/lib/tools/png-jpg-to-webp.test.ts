import { describe, it, expect } from 'vitest';
import { pngJpgToWebp } from '../../../src/lib/tools/png-jpg-to-webp';
import { toolSchema } from '../../../src/lib/tools/schemas';

describe('pngJpgToWebp config', () => {
  it('passes toolSchema validation', () => {
    const r = toolSchema.safeParse(pngJpgToWebp);
    if (!r.success) throw new Error(JSON.stringify(r.error.issues, null, 2));
    expect(r.success).toBe(true);
  });

  it('has id "png-jpg-to-webp" and type "file-tool"', () => {
    expect(pngJpgToWebp.id).toBe('png-jpg-to-webp');
    expect(pngJpgToWebp.type).toBe('file-tool');
  });

  it('accepts image/png and image/jpeg only', () => {
    expect(pngJpgToWebp.accept).toEqual(['image/png', 'image/jpeg']);
  });

  it('has maxSizeMb = 10', () => {
    expect(pngJpgToWebp.maxSizeMb).toBe(10);
  });

  it('has iconPrompt (non-empty Pencil-Sketch-style)', () => {
    expect(pngJpgToWebp.iconPrompt).toMatch(/pencil/i);
  });
});
