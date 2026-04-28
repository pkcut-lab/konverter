import { describe, it, expect } from 'vitest';
import { detectMlDevice, pickStallTimeout } from '../../../src/lib/tools/ml-device-detect';
import type { DeviceProbe } from '../../../src/lib/tools/ml-device-detect';

interface MockNavigatorParts {
  userAgent?: string;
  deviceMemory?: number;
  connection?: { effectiveType?: string; saveData?: boolean };
  gpu?: { requestAdapter: (opts?: { powerPreference?: string }) => Promise<unknown> };
}

function makeNav(parts: MockNavigatorParts): Navigator {
  return parts as unknown as Navigator;
}

/** Adapter shape that passes the hardened probe (non-fallback, shader-f16). */
function realAdapter(): unknown {
  return {
    isFallbackAdapter: false,
    features: new Set(['shader-f16']),
  };
}

describe('detectMlDevice', () => {
  it('returns desktop on a vanilla Chromium UA with no special signals', async () => {
    const nav = makeNav({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('desktop');
    expect(probe.hasWebGPU).toBe(false);
    expect(probe.hasReducedRam).toBe(false);
    expect(probe.isSlowConnection).toBe(false);
    expect(probe.isMobileUA).toBe(false);
  });

  it('returns desktop with hasWebGPU=true when a real (non-fallback, shader-f16) adapter resolves', async () => {
    const nav = makeNav({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      gpu: { requestAdapter: async () => realAdapter() },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('desktop');
    expect(probe.hasWebGPU).toBe(true);
  });

  it('returns hasWebGPU=false when the adapter is a fallback (CPU/SwiftShader)', async () => {
    // Chrome's CPU-side Dawn-fallback advertises WebGPU but routes ML work
    // through software paths that OOM on FP16 segmentation networks. Treat
    // it as no-WebGPU so variant selection stays on MODNet-Q8 in WASM.
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/132',
      gpu: {
        requestAdapter: async () => ({
          isFallbackAdapter: true,
          features: new Set(['shader-f16']),
        }),
      },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.hasWebGPU).toBe(false);
  });

  it('returns hasWebGPU=false when adapter lacks shader-f16', async () => {
    // Without shader-f16 the FP16 ops are emulated in software inside the
    // GPU pipeline — correctness fragile, perf worse than WASM-SIMD-threads.
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (Macintosh) Safari/17.0',
      gpu: {
        requestAdapter: async () => ({
          isFallbackAdapter: false,
          features: new Set([]),
        }),
      },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.hasWebGPU).toBe(false);
  });

  it('passes powerPreference: high-performance to requestAdapter', async () => {
    let observedOpts: { powerPreference?: string } | undefined;
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 Chrome/132',
      gpu: {
        requestAdapter: async (opts) => {
          observedOpts = opts;
          return realAdapter();
        },
      },
    });
    await detectMlDevice(nav);
    expect(observedOpts?.powerPreference).toBe('high-performance');
  });

  it('returns desktop with hasWebGPU=false when adapter rejects', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 Chrome/120',
      gpu: {
        requestAdapter: async () => {
          throw new Error('GPU process crashed');
        },
      },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('desktop');
    expect(probe.hasWebGPU).toBe(false);
  });

  it('returns desktop with hasWebGPU=false when adapter returns null', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 Chrome/120',
      gpu: { requestAdapter: async () => null },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.hasWebGPU).toBe(false);
  });

  it('classifies iPhone Safari without other signals as capable-mobile', async () => {
    const nav = makeNav({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('capable-mobile');
    expect(probe.isMobileUA).toBe(true);
  });

  it('classifies iPhone with saveData as fast-mobile', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari',
      connection: { saveData: true },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('fast-mobile');
    expect(probe.isSlowConnection).toBe(true);
  });

  it('classifies Android with deviceMemory=2 as fast-mobile', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-A546B) Chrome/120',
      deviceMemory: 2,
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('fast-mobile');
    expect(probe.hasReducedRam).toBe(true);
  });

  it('classifies Android with effectiveType=3g as fast-mobile', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile',
      connection: { effectiveType: '3g' },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('fast-mobile');
    expect(probe.isSlowConnection).toBe(true);
  });

  it('classifies Desktop Chrome with deviceMemory=2 as capable-mobile (low-end laptop)', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
      deviceMemory: 2,
    });
    const probe = await detectMlDevice(nav);
    expect(probe.class).toBe('capable-mobile');
    expect(probe.hasReducedRam).toBe(true);
    expect(probe.isMobileUA).toBe(false);
  });

  it('handles missing navigator.userAgent without throwing', async () => {
    const nav = makeNav({});
    const probe = await detectMlDevice(nav);
    expect(probe.isMobileUA).toBe(false);
    expect(probe.class).toBe('desktop');
  });

  it('detects iPad UA', async () => {
    const nav = makeNav({
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Safari',
    });
    const probe = await detectMlDevice(nav);
    expect(probe.isMobileUA).toBe(true);
  });

  it('detects fast-2g effectiveType correctly (NOT slow-2g — should be false)', async () => {
    // 'fast-2g' is not in the slow regex; only 'slow-2g', '2g', '3g'.
    const nav = makeNav({
      userAgent: 'Chrome/120',
      connection: { effectiveType: '4g' },
    });
    const probe = await detectMlDevice(nav);
    expect(probe.isSlowConnection).toBe(false);
  });
});

describe('pickStallTimeout', () => {
  it('returns 240s for fast-mobile', () => {
    const probe: DeviceProbe = {
      class: 'fast-mobile',
      hasWebGPU: false,
      hasReducedRam: true,
      isSlowConnection: false,
      isMobileUA: true,
    };
    expect(pickStallTimeout(probe)).toBe(240_000);
  });

  it('returns 240s for capable-mobile', () => {
    const probe: DeviceProbe = {
      class: 'capable-mobile',
      hasWebGPU: true,
      hasReducedRam: false,
      isSlowConnection: false,
      isMobileUA: true,
    };
    expect(pickStallTimeout(probe)).toBe(240_000);
  });

  it('returns 60s for desktop', () => {
    const probe: DeviceProbe = {
      class: 'desktop',
      hasWebGPU: true,
      hasReducedRam: false,
      isSlowConnection: false,
      isMobileUA: false,
    };
    expect(pickStallTimeout(probe)).toBe(60_000);
  });
});
