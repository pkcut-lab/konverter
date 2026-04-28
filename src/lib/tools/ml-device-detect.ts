/**
 * Mobile-aware device-class detection for ML-File-Tools.
 *
 * ML model downloads (Hugging Face ONNX weights) and ONNX-Runtime inference
 * have wildly different success rates depending on the user's device. iOS
 * Safari crashes consistently around 100-200 MB WASM allocation; older
 * Android Chromium kills background fetches; carrier networks throttle large
 * range-requests. This module returns a probe object that ML-Tools use to
 * pick a model variant (fast / quality / pro) at prepare-time.
 *
 * Pure module — no DOM mutation, no module-scope side effects. Safe to
 * import from any environment (vitest jsdom runs the same code path).
 *
 * The probe runs one async WebGPU adapter request; everything else is sync
 * navigator-property lookup. Total time: <50ms typical, <500ms worst-case
 * (WebGPU adapter request on a slow device).
 *
 * **Anti-pattern guard:** never UA-sniff for device class alone — feature
 * detection (deviceMemory / connection / WebGPU) is the primary signal,
 * UA only serves as iOS-Safari-fallback because Apple does not expose
 * `navigator.deviceMemory` or `navigator.connection`.
 */

export type DeviceClass = 'fast-mobile' | 'capable-mobile' | 'desktop';

export interface DeviceProbe {
  /** Coarse class — drives the default variant choice. */
  class: DeviceClass;
  /**
   * WebGPU adapter is available, NOT a fallback (software-rendered) adapter,
   * and `shader-f16` is supported. We tighten the bar to match what the FP16
   * segmentation models actually need: a fallback adapter (Chrome's CPU-side
   * Dawn-fallback) advertises WebGPU but in practice routes work to WASM-like
   * paths and OOMs on FP16; a non-shader-f16 adapter executes FP16 ops in
   * software with poor performance and unreliable correctness. Both cases are
   * treated as "no WebGPU" for variant selection.
   */
  hasWebGPU: boolean;
  /** `navigator.deviceMemory < 4` — Chromium-only signal, defaults to false. */
  hasReducedRam: boolean;
  /** `effectiveType` is 2g/3g OR `saveData === true` — Chromium-only. */
  isSlowConnection: boolean;
  /** UA contains a mobile/tablet token — last-resort fallback signal. */
  isMobileUA: boolean;
}

/**
 * Minimal slice of the WebGPU adapter shape we read in the probe. Treats every
 * field as optional because shader-f16 detection runs against an interim
 * `GPUSupportedFeatures`-style `Set<string>` that not every Chromium build
 * exposes identically. Keep this typed-loose-on-purpose and validate at runtime.
 */
interface MinimalGpuAdapter {
  isFallbackAdapter?: boolean;
  features?: { has: (feature: string) => boolean } | Set<string>;
}
interface MinimalGpu {
  requestAdapter: (opts?: { powerPreference?: 'low-power' | 'high-performance' }) => Promise<MinimalGpuAdapter | null>;
}
interface NavigatorWithGpu extends Navigator {
  gpu?: MinimalGpu;
}
interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number;
}
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
}

const MOBILE_UA_RE = /iPhone|iPad|iPod|Android|Mobile|Tablet/i;
const SLOW_NET_RE = /^(slow-2g|2g|3g)$/;

function adapterHasFeature(adapter: MinimalGpuAdapter, feature: string): boolean {
  const f = adapter.features;
  if (!f) return false;
  // Branch on the runtime shape — `GPUSupportedFeatures` is a `Set` in spec
  // but some early Chromium builds shipped a `Set`-compatible object that
  // only exposes `.has()`. Both paths converge here.
  if (typeof (f as { has?: (k: string) => boolean }).has === 'function') {
    return (f as { has: (k: string) => boolean }).has(feature);
  }
  return false;
}

/**
 * Probe WebGPU with the same constraints the FP16 segmentation models impose:
 * 1. `navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })`
 *    — biases toward the dGPU on hybrid laptops; on integrated-only systems
 *    the dispatcher falls back to the iGPU automatically.
 * 2. Reject `adapter.isFallbackAdapter === true` — that's Chrome's CPU-side
 *    Dawn-fallback, advertised as WebGPU but routes ML work through software
 *    paths that OOM on FP16 segmentation networks (BiRefNet_lite, BEN2).
 * 3. Require `shader-f16` feature — without it FP16 ops are emulated in
 *    software inside the GPU pipeline; correctness is fragile and perf is
 *    worse than WASM with SIMD+threads. Documented requirement in the
 *    Transformers.js v4 / ORT-Web 1.20+ FP16 path.
 *
 * Any failure (no adapter, fallback, missing feature, exception) returns
 * `false` so callers route to MODNet-Q8 in WASM, which works everywhere.
 */
async function probeWebGPU(nav: Navigator): Promise<boolean> {
  try {
    const gpu = (nav as NavigatorWithGpu).gpu;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (adapter === null || adapter === undefined) return false;
    if (adapter.isFallbackAdapter === true) return false;
    if (!adapterHasFeature(adapter, 'shader-f16')) return false;
    return true;
  } catch {
    return false;
  }
}

function probeReducedRam(nav: Navigator): boolean {
  const dm = (nav as NavigatorWithDeviceMemory).deviceMemory;
  if (typeof dm !== 'number') return false;
  return dm < 4;
}

function probeSlowConnection(nav: Navigator): boolean {
  const conn = (nav as NavigatorWithConnection).connection;
  if (!conn) return false;
  if (conn.saveData === true) return true;
  const eff = conn.effectiveType;
  if (typeof eff === 'string' && SLOW_NET_RE.test(eff)) return true;
  return false;
}

function probeMobileUA(nav: Navigator): boolean {
  return MOBILE_UA_RE.test(nav.userAgent ?? '');
}

/**
 * Run all probes. Pure-async (single WebGPU adapter call). No throws — every
 * failure-mode degrades gracefully to a more conservative DeviceClass.
 *
 * Class derivation rules (in order):
 * 1. `hasWebGPU && !isMobileUA && !hasReducedRam && !isSlowConnection` → `desktop`
 * 2. `isMobileUA && (hasWebGPU || (!hasReducedRam && !isSlowConnection))` → `capable-mobile`
 * 3. `isMobileUA` (any other constellation) → `fast-mobile`
 * 4. `!isMobileUA && (hasReducedRam || isSlowConnection)` → `capable-mobile`
 *    (low-end laptop / hotspot tethering)
 * 5. fallback → `desktop`
 */
export async function detectMlDevice(
  nav: Navigator = typeof navigator !== 'undefined' ? navigator : ({} as Navigator),
): Promise<DeviceProbe> {
  const [hasWebGPU, hasReducedRam, isSlowConnection, isMobileUA] = await Promise.all([
    probeWebGPU(nav),
    Promise.resolve(probeReducedRam(nav)),
    Promise.resolve(probeSlowConnection(nav)),
    Promise.resolve(probeMobileUA(nav)),
  ]);

  let cls: DeviceClass;
  if (isMobileUA) {
    if (hasWebGPU && !hasReducedRam && !isSlowConnection) {
      cls = 'capable-mobile';
    } else if (!hasReducedRam && !isSlowConnection) {
      cls = 'capable-mobile';
    } else {
      cls = 'fast-mobile';
    }
  } else {
    if (hasReducedRam || isSlowConnection) {
      cls = 'capable-mobile';
    } else {
      cls = 'desktop';
    }
  }

  return { class: cls, hasWebGPU, hasReducedRam, isSlowConnection, isMobileUA };
}

/**
 * Mobile-aware watchdog timeout in ms. Mobile networks need a longer window
 * before we declare a fetch-stall — a 219 MB download over slow LTE realistic
 * takes 3+ minutes, and we don't want a false stall on the user's first try.
 *
 * Returns 240 000 (4 min) for any mobile class, 60 000 (1 min) for desktop.
 */
export function pickStallTimeout(probe: DeviceProbe): number {
  if (probe.class === 'fast-mobile' || probe.class === 'capable-mobile') {
    return 240_000;
  }
  return 60_000;
}
