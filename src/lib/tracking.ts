/**
 * Tool-usage analytics — browser-only, GDPR-compliant.
 *
 * Dispatches a `tool-used` CustomEvent on `document` when a tool produces
 * its first result (null → non-null transition). No PII, no server upload.
 * The event stays in the browser until a listener (e.g. AdSense wrapper in
 * Phase 2) consumes it.
 *
 * Privacy constraints (Non-Negotiable §2):
 * - No server-upload, no localStorage, no cookies.
 * - Payload: slug + category + locale — all non-PII.
 */

export interface ToolUsedDetail {
  /** Tool config id, e.g. "cash-discount-calculator" */
  slug: string;
  /** Tool category id, e.g. "finance" */
  category: string;
  /** BCP-47 locale of the page, e.g. "de" */
  locale: string;
}

/**
 * Dispatch a `tool-used` CustomEvent on `document`.
 *
 * Safe to call in SSR/SSG context — bails out silently when `document` is
 * not available (Astro build, vitest jsdom opt-out, etc.).
 */
export function dispatchToolUsed(detail: ToolUsedDetail): void {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(
    new CustomEvent<ToolUsedDetail>('tool-used', {
      bubbles: false,
      cancelable: false,
      detail,
    }),
  );
}
