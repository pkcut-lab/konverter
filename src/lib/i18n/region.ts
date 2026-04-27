/**
 * Region — for tools whose semantics depend on the user's locale beyond
 * just the language. The 3 region-adaptive calculators (vat, gross-net,
 * interest) deliver fundamentally different math depending on whether
 * the user is filing US taxes, UK taxes, or DE taxes:
 *
 *   - DE (germany)   → /de/{slug} — Lohnsteuer §32a, MwSt 19/7/0, Abgeltungssteuer
 *   - EN-US          → /en/{slug} with region='us' — FICA + Federal Brackets, sales tax matrix, simple/compound + APR
 *   - EN-UK          → /en/{slug} with region='uk' — PAYE + NI + Personal Allowance, VAT 20/5/0, ISA tax-free
 *
 * The `Region` here is independent of `Lang`. Lang controls which slug we
 * land on (DE vs EN page); Region only branches the EN page's tool logic
 * between US and UK. DE pages do not consult Region — they always run
 * German rules.
 *
 * Default detection priority (en pages only):
 *   1. Persisted choice in localStorage `kittokit-region` ('us' | 'uk').
 *   2. navigator.languages: 'en-GB' / 'en-UK' → 'uk', 'en-US' → 'us'.
 *   3. Fall back to 'us' (broader market — UK users switch via the
 *      RegionSelector and the choice persists thereafter).
 */
export type Region = 'us' | 'uk';
export const REGIONS: readonly Region[] = ['us', 'uk'] as const;

const STORAGE_KEY = 'kittokit-region';
const DEFAULT_REGION: Region = 'us';

export const REGION_CHANGE_EVENT = 'kittokit-region-change';

/**
 * Read the current region from localStorage + navigator.languages.
 * Safe to call from any module — returns DEFAULT_REGION when running on
 * the server (no `window`).
 */
export function detectRegion(): Region {
  if (typeof window === 'undefined') return DEFAULT_REGION;

  // 1. Persisted explicit user choice wins over heuristics.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'us' || stored === 'uk') return stored;
  } catch {
    // Private mode / disabled storage — fall through to detection.
  }

  // 2. Auto-detect from navigator.languages.
  const langs = window.navigator.languages ?? [window.navigator.language ?? ''];
  for (const l of langs) {
    const tag = (l ?? '').toLowerCase();
    if (tag.startsWith('en-gb') || tag.startsWith('en-uk')) return 'uk';
    if (tag.startsWith('en-us')) return 'us';
  }

  return DEFAULT_REGION;
}

/**
 * Persist the user's region choice and broadcast a window-level event so
 * any mounted RegionSelector or region-aware tool component can update
 * reactively without re-running detection.
 */
export function setRegion(region: Region): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, region);
  } catch {
    // Private mode — the in-memory state still works for this tab.
  }
  window.dispatchEvent(
    new CustomEvent(REGION_CHANGE_EVENT, { detail: { region } }),
  );
}

/** Display label for a region — typically rendered inside RegionSelector. */
export function regionLabel(region: Region): string {
  return region === 'uk' ? 'United Kingdom' : 'United States';
}

/** ISO-4217 currency code attached to each region. */
export function regionCurrency(region: Region): 'USD' | 'GBP' {
  return region === 'uk' ? 'GBP' : 'USD';
}
