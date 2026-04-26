# T8 — Performance + CWV — Worker-Output

Status: ready-for-review

## Audit

7 URLs audited on static dist build via `npx serve dist`.

| URL | Perf Before | Perf After |
|-----|-------------|------------|
| / | 76 | 98 |
| /de | 98 | 99 |
| /de/werkzeuge | **58** | **99** |
| /de/meter-zu-fuss | 97 | 98 |
| /de/passwort-generator | 97 | 98 |
| /de/zinsrechner | 96 | 98 |
| /de/webp-konverter | 93 | 97 |

**Avg: 87 → 98**

## Findings

### CRITICAL — werkzeuge TBT = 7,230 ms

`pagefind` WASM + worker initialized eagerly on mount (inside `client:idle`).
On the werkzeuge page (144 tools, large pagefind index) this caused 8,522 ms of
"Unattributable" main-thread work under Lighthouse's 4× CPU throttle.

### HIGH — root P = 76, TBT = 1,100 ms

`/` redirects to `/de` (expected i18n pattern). Redirect chain wasted 676 ms.
Also: render-blocking `_slug_.css` added 227 ms. After fix: P = 98, TBT = 0 ms.

### MEDIUM — webp-konverter A11y = 96

Touch target on `.you-might__link` too small (< 24 px WCAG 2.5.8).

## Fixes Applied (3 classes, 3 commits)

### 1. `perf(pagefind): defer WASM init to user interaction`

`src/components/HeaderSearch.svelte` — removed auto-init `$effect`, replaced with
`focusin` + `pointerdown` listeners that lazy-load pagefind on first interaction.

Result: werkzeuge TBT 7,230 ms → 0 ms, P 58 → 99.

### 2. `perf(headers+preconnect): add og/* cache + analytics preconnect`

- `public/_headers` — added `Cache-Control: public, max-age=31536000, immutable` for `/og/*`
  and explicit `/icon*.png` / `/icon*.svg` cache entries.
- `src/layouts/BaseLayout.astro` — added `<link rel="preconnect" href="https://static.cloudflareinsights.com">`
  and `<link rel="dns-prefetch" href="https://www.clarity.ms">`.

### 3. `fix(a11y): increase you-might__link touch target to 24 px`

`src/components/YouMightAlsoLike.astro` — added `padding: 6px 4px` to meet
WCAG 2.5.8 minimum touch target.

Result: webp-konverter A11y 96 → 100.

## Lighthouse Score Summary

- Performance ≥ 90: ✅ (min=97, avg=98)
- SEO ≥ 95: ✅ (all 100)
- Accessibility = 100: ✅ (all 100 after fix)
- PWA: n/a in local HTTP audit (SW requires HTTPS)

Full JSON results: `audits/lighthouse-2026-04-26-*.json`
Summary table: `audits/lighthouse-2026-04-26-summary.md`

Übergabe: quality-reviewer
