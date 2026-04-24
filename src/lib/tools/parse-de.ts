/**
 * Canonical DE-locale number parser — shared across all finance tools.
 *
 * Handles:
 *   "3000"       → 3000   (plain integer)
 *   "3.000"      → 3000   (DE thousands, 3-digit segment)
 *   "3,00"       → 3.00   (DE decimal comma)
 *   "3.000,50"   → 3000.5 (DE full format)
 *   "3.5"        → 3.5    (EN decimal, 1-digit segment → not thousands)
 *   "3.50"       → 3.5    (EN decimal, 2-digit segment → not thousands)
 *   "3.500"      → 3500   (DE thousands, 3-digit segment)
 *   "1.000.000"  → 1000000 (multi-thousands)
 *
 * Root cause fixed: the original lastDot > lastComma branch treated "3.000"
 * as an EN decimal, yielding parseFloat("3.000") === 3.
 * Fix: when only dots (no comma), check if every post-dot segment is exactly
 * 3 digits → thousands pattern. Otherwise decimal.
 */
export function parseDE(raw: string): number {
  const s = raw.trim();
  if (s === '' || s === '-') return NaN;
  const cleaned = s.replace(/[^\d,.\-]/g, '');
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;

  if (lastComma > lastDot) {
    // DE format: 1.000,99 → remove dots, swap comma→dot
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // Either EN decimal (3.5, 3.50) or DE thousands (3.000, 1.000.000)
    const parts = cleaned.split('.');
    const allSegmentsThreeDigits =
      parts.length > 1 && parts.slice(1).every((p) => /^\d{3}$/.test(p));
    if (allSegmentsThreeDigits) {
      // DE thousands separator: remove dots
      normalized = cleaned.replace(/\./g, '');
    } else {
      // EN decimal: remove commas (there are none in this branch, but be safe)
      normalized = cleaned.replace(/,/g, '');
    }
  } else {
    // No dot or comma (plain integer), or edge case
    normalized = cleaned.replace(',', '.');
  }

  return parseFloat(normalized);
}
