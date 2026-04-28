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
