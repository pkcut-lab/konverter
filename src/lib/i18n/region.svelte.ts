/**
 * Svelte 5 reactive wrapper around the region store. Components import
 * `useRegion()` and read `.current` inside `$derived` / `$effect` blocks;
 * calling `.set('uk')` updates every consumer at once via the
 * `kittokit-region-change` window event.
 *
 * Why a tiny module instead of context:
 *   - Astro hydrates each Svelte island independently. Context across
 *     islands would require a shared root, which Astro deliberately
 *     does not provide. A module-level rune + a window event is the
 *     idiomatic cross-island pattern.
 *   - The 3 region-adaptive tools each mount one Svelte island; the
 *     RegionSelector inside each island shares state with the
 *     calculator inside the SAME island via `$state` reactivity, and
 *     across islands (rare — only matters if multiple tools are on
 *     one page) via the window event.
 */
import { detectRegion, setRegion, type Region, REGION_CHANGE_EVENT } from './region';

let _region = $state<Region>('us');
let _initialized = false;

function ensureInitialized() {
  if (_initialized) return;
  _initialized = true;
  if (typeof window === 'undefined') return;

  _region = detectRegion();

  window.addEventListener(REGION_CHANGE_EVENT, (e: Event) => {
    const detail = (e as CustomEvent<{ region: Region }>).detail;
    if (detail?.region === 'us' || detail?.region === 'uk') {
      _region = detail.region;
    }
  });
}

export interface RegionStore {
  readonly current: Region;
  set(region: Region): void;
}

export function useRegion(): RegionStore {
  ensureInitialized();
  return {
    get current(): Region {
      return _region;
    },
    set(region: Region) {
      _region = region;
      setRegion(region);
    },
  };
}
