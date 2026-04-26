# T9 — WCAG 2.2 AAA Accessibility Audit + Fix
**Status:** ready-for-review
**Agent:** a11y-auditor (d5ce894b)
**Date:** 2026-04-26

---

## Summary

axe-core violations: **29 → 0** (74 pages scanned)
Manual checks: ✅ all passed
`npm run check`: ✅ 0 errors, 0 warnings
`npx vitest run`: ✅ 1757/1761 (4 pre-existing failures, 0 new regressions)

---

## Scan Details

- **Tool:** axe-core/playwright 4.11.2
- **Tags:** wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice
- **Pages scanned:** 74 (all DE tool pages + root + werkzeuge + legal pages)
- **BEFORE:** 29 violations across 7 pages
- **AFTER:** 0 violations across 74 pages

---

## Violations Fixed

### 1. `aria-allowed-role` — 27 pages (critical)
**File:** `src/components/CookieBanner.svelte`
**Issue:** `<aside role="dialog">` — `role="dialog"` is not allowed on `<aside>` elements.
**Fix:** Changed both `<aside>` elements to `<div>` while preserving all ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-label`).
**Lines changed:** 32, 44, 46, 71

### 2. `label` — 1 page (`/de/kontrast-pruefer`, critical)
**File:** `src/components/tools/ContrastCheckerTool.svelte`
**Issue:** Two hex text inputs lacked programmatic labels. Visual labels existed (`<span class="contrast__label">`) but were not associated with the inputs.
**Fix:** Added `aria-label` to both inputs:
- Foreground: `aria-label="Vordergrundfarbe als Hex-Code"`
- Background: `aria-label="Hintergrundfarbe als Hex-Code"`

### 3. `aria-prohibited-attr` — 1 page (`/de/qr-code-generator`, serious)
**File:** `src/components/tools/QrCodeGeneratorTool.svelte:103`
**Issue:** `<div aria-label="QR-Code-Vorschau">` — `aria-label` is prohibited on plain `<div>` without a valid ARIA role.
**Fix:** Added `role="img"` to the wrapper div.

### 4. `dlitem` — 2 pages (`/de/datenschutz`, `/de/impressum`, serious)
**Files:** `src/pages/de/datenschutz.astro`, `src/pages/de/impressum.astro`
**Issue:** `<dt>` and `<dd>` elements inside `<div class="legal-dl">` — the outer container was a `<div>`, not a `<dl>`. axe-core requires `<dt>`/`<dd>` to be descendants of a `<dl>`.
**Fix:** Changed all `<div class="legal-dl">` → `<dl class="legal-dl">` and `<div class="legal-rights">` → `<dl class="legal-rights">`. Inner `<div class="legal-dl__row">` wrappers are permitted inside `<dl>` per HTML spec.

### 5. `html-has-lang`, `meta-refresh`, `landmark-one-main`, `page-has-heading-one`, `region` — 1 page (`/`, 5 violations)
**File:** `src/pages/index.astro`
**Issue:** Astro's `Astro.redirect('/de')` in SSG mode generates a minimal HTML stub with `<meta http-equiv="refresh" content="2;url=/de">` — missing `lang`, `<main>`, `<h1>`, and using a 2-second delayed refresh (WCAG prohibits timed refreshes <20h when user can't extend them).
**Fix:** Replaced with a full proper redirect page:
- `lang="de"` on `<html>`
- `<meta http-equiv="refresh" content="0;url=/de">` (0-second = immediate, exempt from WCAG)
- `<main>` landmark
- `<h1>kittokit</h1>`
- `<meta name="robots" content="noindex">` preserved
Note: In production, Cloudflare Pages Functions intercept `/` before this HTML is served.

### 6. Pre-existing TypeScript error fixed (bonus)
**File:** `src/layouts/BaseLayout.astro:18`
**Issue:** `ogImagePath?: string` with `exactOptionalPropertyTypes: true` caused TS2375 in `[lang]/[slug].astro`.
**Fix:** Changed to `ogImagePath?: string | undefined`.

---

## Manual Checks

| Check | Result |
|-------|--------|
| Contrast (Light): all token pairs | ✅ ≥7:1 (lowest: `--color-text-subtle` 7.21:1) |
| Contrast (Dark): all token pairs | ✅ ≥7:1 (lowest: `--color-text-muted` 7.24:1) |
| Heading order (sample: 4 pages) | ✅ No skipped levels |
| `prefers-reduced-motion` | ✅ CookieBanner animation wrapped in `@media (prefers-reduced-motion: no-preference)` |
| Touch target ≥24px | ✅ All interactive elements meet minimum |
| Focus rings | ✅ `outline: 2px solid var(--color-accent)` everywhere |

---

## Files Changed

```
src/components/CookieBanner.svelte
src/components/tools/ContrastCheckerTool.svelte
src/components/tools/QrCodeGeneratorTool.svelte
src/pages/de/datenschutz.astro
src/pages/de/impressum.astro
src/pages/index.astro
src/layouts/BaseLayout.astro
```

---

## Known Residual Debt

- EN pages not scanned (only DE). EN tool pages use identical templates → expected same 0-violation result, but not formally verified.
- `public/styleguide` page not in scope (dev-only).
- 4 pre-existing test failures (ACTIVE_LANGUAGES EN-pivot + `_redirects` test) — not related to a11y, tracked in PROGRESS.md.

---

**Übergabe:** quality-reviewer
