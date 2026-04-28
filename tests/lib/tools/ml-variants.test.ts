import { describe, it, expect } from 'vitest';
import {
  ML_VARIANTS,
  pickDefaultVariant,
  getVariant,
  formatVariantSize,
} from '../../../src/lib/tools/ml-variants';
import type { DeviceProbe } from '../../../src/lib/tools/ml-device-detect';

function probeFor(cls: DeviceProbe['class'], hasWebGPU = cls === 'desktop'): DeviceProbe {
  return {
    class: cls,
    hasWebGPU,
    hasReducedRam: cls === 'fast-mobile',
    isSlowConnection: cls === 'fast-mobile',
    isMobileUA: cls !== 'desktop',
  };
}

describe('ML_VARIANTS', () => {
  it('has at least one tool registered', () => {
    expect(Object.keys(ML_VARIANTS).length).toBeGreaterThan(0);
  });

  it('every variant declares an AdSense-compatible license', () => {
    const allowed = new Set(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'CC-BY-4.0']);
    for (const [toolId, variants] of Object.entries(ML_VARIANTS)) {
      for (const v of variants) {
        expect(
          allowed.has(v.license),
          `${toolId}/${v.id} has license "${v.license}" — must be MIT/Apache-2.0/BSD/CC-BY`,
        ).toBe(true);
      }
    }
  });

  it('every variant has a positive sizeBytes', () => {
    for (const [toolId, variants] of Object.entries(ML_VARIANTS)) {
      for (const v of variants) {
        expect(v.sizeBytes, `${toolId}/${v.id} sizeBytes must be > 0`).toBeGreaterThan(0);
      }
    }
  });

  it('every variant has a non-empty modelId', () => {
    for (const [toolId, variants] of Object.entries(ML_VARIANTS)) {
      for (const v of variants) {
        expect(v.modelId, `${toolId}/${v.id} modelId must be set`).toBeTruthy();
        expect(v.modelId.length, `${toolId}/${v.id} modelId must be non-empty`).toBeGreaterThan(2);
      }
    }
  });
});

describe('remove-background variants', () => {
  it('declares fast / quality / pro', () => {
    const variants = ML_VARIANTS['remove-background'];
    expect(variants).toBeDefined();
    expect(variants?.map((v) => v.id)).toEqual(['fast', 'quality', 'pro']);
  });

  it('fast variant is allowed for all device classes', () => {
    const fast = ML_VARIANTS['remove-background']?.find((v) => v.id === 'fast');
    expect(fast?.allowedFor).toContain('fast-mobile');
    expect(fast?.allowedFor).toContain('capable-mobile');
    expect(fast?.allowedFor).toContain('desktop');
  });

  it('pro variant is desktop-only', () => {
    const pro = ML_VARIANTS['remove-background']?.find((v) => v.id === 'pro');
    expect(pro?.allowedFor).toEqual(['desktop']);
  });

  it('size order: fast < quality < pro', () => {
    const variants = ML_VARIANTS['remove-background']!;
    const byId = Object.fromEntries(variants.map((v) => [v.id, v]));
    expect(byId.fast!.sizeBytes).toBeLessThan(byId.quality!.sizeBytes);
    expect(byId.quality!.sizeBytes).toBeLessThan(byId.pro!.sizeBytes);
  });
});

describe('pickDefaultVariant', () => {
  it('picks fast for fast-mobile', () => {
    expect(pickDefaultVariant('remove-background', probeFor('fast-mobile'))).toBe('fast');
  });

  it('picks fast for capable-mobile (smallest applicable)', () => {
    expect(pickDefaultVariant('remove-background', probeFor('capable-mobile'))).toBe('fast');
  });

  it('picks quality for desktop (NOT pro — pro is opt-in)', () => {
    expect(pickDefaultVariant('remove-background', probeFor('desktop'))).toBe('quality');
  });

  it('picks fast for desktop without WebGPU (BiRefNet/BEN2 OOM in WASM)', () => {
    // Regression: a desktop Firefox/Linux user without WebGPU was getting the
    // FP16 BiRefNet_lite default, which crashed inference with `std::bad_alloc`
    // (`OrtRun ERROR_CODE: 6`). The default-picker must filter out variants
    // marked `requiresWebGPU` when probe.hasWebGPU is false.
    expect(pickDefaultVariant('remove-background', probeFor('desktop', false))).toBe('fast');
  });

  it('picks fast for capable-mobile without WebGPU', () => {
    expect(pickDefaultVariant('remove-background', probeFor('capable-mobile', false))).toBe('fast');
  });

  it('throws for an unregistered tool', () => {
    expect(() => pickDefaultVariant('does-not-exist', probeFor('desktop'))).toThrow(
      /No variants registered/,
    );
  });
});

describe('requiresWebGPU flag', () => {
  it('marks BiRefNet_lite (quality) and BEN2 (pro) as WebGPU-required for remove-background', () => {
    const variants = ML_VARIANTS['remove-background']!;
    const byId = Object.fromEntries(variants.map((v) => [v.id, v]));
    expect(byId.fast!.requiresWebGPU).toBeFalsy();
    expect(byId.quality!.requiresWebGPU).toBe(true);
    expect(byId.pro!.requiresWebGPU).toBe(true);
  });

  it('marks BiRefNet_lite (quality) as WebGPU-required for video-bg-remove', () => {
    const variants = ML_VARIANTS['video-bg-remove']!;
    const byId = Object.fromEntries(variants.map((v) => [v.id, v]));
    expect(byId.fast!.requiresWebGPU).toBeFalsy();
    expect(byId.quality!.requiresWebGPU).toBe(true);
  });

  it('every WebGPU-required tool has at least one fallback variant runnable in WASM', () => {
    // Invariant: pickDefaultVariant must never throw "no runnable variant"
    // — for every tool with a WebGPU-required variant, there must be a Q4/Q8
    // counterpart that runs in WASM.
    for (const [toolId, variants] of Object.entries(ML_VARIANTS)) {
      const hasWebGpuOnly = variants.some((v) => v.requiresWebGPU);
      if (!hasWebGpuOnly) continue;
      const wasmRunnable = variants.filter((v) => !v.requiresWebGPU);
      expect(
        wasmRunnable.length,
        `${toolId} has WebGPU-required variants but no WASM-runnable fallback`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('getVariant', () => {
  it('returns the matching variant', () => {
    const v = getVariant('remove-background', 'fast');
    expect(v?.modelId).toBe('Xenova/modnet');
    expect(v?.dtype).toBe('q8');
  });

  it('returns undefined for unknown tool', () => {
    expect(getVariant('does-not-exist', 'fast')).toBeUndefined();
  });

  it('returns undefined for unknown variant of a known tool', () => {
    // @ts-expect-error: deliberately passing invalid variant id
    expect(getVariant('remove-background', 'super-pro')).toBeUndefined();
  });
});

describe('formatVariantSize', () => {
  // U+00A0 NBSP between number and unit — see ml-variants.ts comment.
  it('formats 6.63 MB as "6.6 MB" (NBSP)', () => {
    expect(formatVariantSize(6_630_000)).toBe('6.6 MB');
  });

  it('formats 115 MB as "115 MB"', () => {
    expect(formatVariantSize(115_000_000)).toBe('115 MB');
  });

  it('formats 219 MB as "219 MB"', () => {
    expect(formatVariantSize(219_000_000)).toBe('219 MB');
  });

  it('formats sub-MB as KB', () => {
    expect(formatVariantSize(500_000)).toBe('488 KB');
  });

  it('formats GB-scale', () => {
    expect(formatVariantSize(1_500_000_000)).toBe('1.5 GB');
  });
});
