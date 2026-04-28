/**
 * Optional CDN-mirror for `@huggingface/transformers` model downloads.
 *
 * Hugging Face's CDN works for ~90% of users worldwide, but mobile-carrier
 * range-request bugs out of DE PoPs and the occasional 503 from FRA60 break
 * the remaining 10%. To recover, we expose a build-time switch
 * (`PUBLIC_ML_MIRROR_HOST`) that points `env.remoteHost` to a Cloudflare R2
 * bucket mirroring the same `{repo}/resolve/main/...` paths.
 *
 * Setup is the user's responsibility (R2 bucket + custom domain + CORS).
 * Until `PUBLIC_ML_MIRROR_HOST` is set, `applyMlMirrorIfConfigured()` is
 * a no-op and the default HF CDN is used.
 *
 * Pure module — no top-level side effects. Caller invokes
 * `applyMlMirrorIfConfigured()` once at app start (e.g. from any FileTool's
 * `prepare`-thunk before the first `pipeline()` call).
 */

interface TransformersEnv {
  remoteHost: string;
  remotePathTemplate?: string;
  useBrowserCache?: boolean;
}

interface WindowWithMirror extends Window {
  __KITTOKIT_ML_MIRROR_HOST__?: string;
}

const HF_DEFAULT_HOST = 'https://huggingface.co';

/**
 * Get the configured mirror host, or `null` if HF default should be used.
 * Sources, in priority order:
 * 1. `window.__KITTOKIT_ML_MIRROR_HOST__` — runtime override (e.g. for tests
 *    or staged rollout via a feature flag)
 * 2. `import.meta.env.PUBLIC_ML_MIRROR_HOST` — build-time env, the normal path
 *
 * Both must be valid `https://` URLs without a trailing slash. Anything else
 * is rejected and we fall back to HF default (no exception, just no-mirror).
 */
export function getMirrorHost(): string | null {
  // Runtime override.
  if (typeof window !== 'undefined') {
    const w = window as WindowWithMirror;
    if (typeof w.__KITTOKIT_ML_MIRROR_HOST__ === 'string') {
      const host = w.__KITTOKIT_ML_MIRROR_HOST__;
      if (isValidMirrorHost(host)) return host;
    }
  }

  // Build-time env (Astro / Vite).
  // import.meta.env is undefined in vitest unless we shim it; guarded for safety.
  let envHost: string | undefined;
  try {
    const env = (import.meta as unknown as { env?: { PUBLIC_ML_MIRROR_HOST?: string } }).env;
    envHost = env?.PUBLIC_ML_MIRROR_HOST;
  } catch {
    envHost = undefined;
  }
  if (typeof envHost === 'string' && isValidMirrorHost(envHost)) {
    return envHost;
  }

  return null;
}

function isValidMirrorHost(host: string): boolean {
  if (!host.startsWith('https://')) return false;
  if (host.endsWith('/')) return false;
  if (host === HF_DEFAULT_HOST) return false; // no-op mirror is a misconfig
  return true;
}

/**
 * Apply the configured mirror to the given Transformers.js `env` object, if
 * configured. Returns `{ mirrored, host }` so callers can log / surface the
 * decision in their own diagnostics.
 *
 * Idempotent: calling twice with the same env is safe (sets the same value).
 */
export function applyMlMirrorIfConfigured(env: TransformersEnv): {
  mirrored: boolean;
  host: string | null;
} {
  const host = getMirrorHost();
  if (host === null) return { mirrored: false, host: null };
  env.remoteHost = host;
  return { mirrored: true, host };
}

/**
 * Point ONNX-Runtime-Web at our self-hosted copy of `ort-wasm-*.{mjs,wasm}`
 * instead of letting Transformers.js dynamic-import them from `cdn.jsdelivr
 * .net`. The runtime files are copied into `dist/ort/` by
 * `scripts/copy-ort-web.mjs` at build-time.
 *
 * Why this matters:
 *   The default Transformers.js v4 fetch path hits `cdn.jsdelivr.net` for
 *   `ort-wasm-simd-threaded.{,asyncify,jsep,jspi}.{mjs,wasm}`. On a strict-
 *   CSP site this requires both `script-src https://cdn.jsdelivr.net` and
 *   `connect-src https://cdn.jsdelivr.net` — third-party CDN exposure +
 *   widened CSP for every visitor whether or not they use an ML tool.
 *   Self-hosting drops both grants from the CSP allow-list and removes the
 *   single-point-of-failure on jsdelivr.
 *
 * Transformers.js consults `env.backends.onnx.wasm.wasmPaths` for the prefix.
 * The trailing slash is required (string concatenation, not URL-join).
 *
 * Idempotent. SSR-safe (checks for window before reading runtime overrides).
 */
interface TransformersOnnxBackend {
  wasm?: { wasmPaths?: string };
}
interface TransformersBackends {
  onnx?: TransformersOnnxBackend;
}
interface TransformersEnvWithBackends {
  backends?: TransformersBackends;
}

export function applyOrtSelfHost(env: TransformersEnvWithBackends): void {
  // Default to `/ort/` — the path `scripts/copy-ort-web.mjs` writes into
  // `dist/`. Override-able via window for tests / staged rollouts where a
  // CDN path might be wanted back temporarily.
  let path = '/ort/';
  if (typeof window !== 'undefined') {
    const w = window as Window & { __KITTOKIT_ORT_PATH__?: string };
    if (typeof w.__KITTOKIT_ORT_PATH__ === 'string' && w.__KITTOKIT_ORT_PATH__.length > 0) {
      path = w.__KITTOKIT_ORT_PATH__;
    }
  }
  env.backends = env.backends ?? {};
  env.backends.onnx = env.backends.onnx ?? {};
  env.backends.onnx.wasm = env.backends.onnx.wasm ?? {};
  env.backends.onnx.wasm.wasmPaths = path;
}
