/**
 * Reactive subscription helpers around the region store. Plain TS so
 * `tsc --noEmit` typechecks without Svelte's preprocessor — Svelte
 * components import these and wire them into a local `$state` rune.
 *
 * Why not a `.svelte.ts` rune-module:
 *   tsc cannot resolve the global `$state`/`$effect` runes during
 *   `astro check && tsc --noEmit` (svelte-check would, but the project
 *   uses tsc as the gating typechecker). Keeping the cross-island store
 *   as a plain pub-sub avoids a dependency on rune-aware tooling and
 *   matches the pattern Astro recommends for shared state.
 */
import { detectRegion, setRegion, type Region, REGION_CHANGE_EVENT } from './region';

let _current: Region = 'us';
let _initialized = false;
const subscribers = new Set<(r: Region) => void>();

function ensureInitialized(): void {
  if (_initialized) return;
  _initialized = true;
  if (typeof window === 'undefined') return;

  _current = detectRegion();

  window.addEventListener(REGION_CHANGE_EVENT, (e: Event) => {
    const detail = (e as CustomEvent<{ region: Region }>).detail;
    if (detail?.region === 'us' || detail?.region === 'uk') {
      _current = detail.region;
      for (const fn of subscribers) fn(_current);
    }
  });
}

/** Read the current region (initialises detection on first call). */
export function getRegion(): Region {
  ensureInitialized();
  return _current;
}

/** Persist a new region and broadcast to every subscriber. */
export function setRegionPersisted(region: Region): void {
  _current = region;
  setRegion(region); // localStorage + window event — subscribers fire from listener.
}

/**
 * Subscribe to region changes. Returns an unsubscribe function — pair with
 * `$effect` in a Svelte component to clean up on unmount.
 */
export function subscribeRegion(fn: (r: Region) => void): () => void {
  ensureInitialized();
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
