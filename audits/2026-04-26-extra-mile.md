# Extra-Mile Sprint Audit — 2026-04-26

**Branch:** `feature/en-i18n`
**Tasks:** X.1–X.10 (10 commits)
**Verification:** 1837/1837 Vitest · 0 errors · 0 warnings (astro check + tsc) · all lint scripts pass

---

## Task Results

### X.1 — AVIF OG Cards ✅ High Impact

**Change:** `scripts/generate-og-cards.mjs` now outputs `.avif` alongside `.webp` via
`sharp.avif({ quality: 80 })`. BaseLayout accepts new `ogAvifPath` prop and emits the
AVIF `og:image` group *first* (type + dimensions + alt) so crawlers that support AVIF
pick it; WebP group follows as fallback.

**File sizes:**
| Format | Total (72 files) | Avg per card |
|--------|-----------------|--------------|
| WebP (q90) | 862 KB | 12 KB |
| AVIF (q80) | 642 KB | 9 KB |
| **Savings** | **-25.5%** | — |

**Verdict:** Meaningful social-sharing bandwidth reduction. AVIF support among major
crawlers (Facebook, Slack, iMessage) is broad in 2026. No regression risk — WebP
fallback always present.

---

### X.2 — Critical CSS Inlining ⚪ Evaluated / No-op

**Change:** `astro.config.mjs` now explicitly declares `inlineStylesheets: 'auto'`
(was already the default).

**Evaluation:** Tested `'always'` mode; it would inline ~15–20 KB of scoped Svelte +
Astro CSS per tool page. On H2 (single origin, cached fonts), the round-trip savings
don't outweigh the HTML bloat. `'auto'` already inlines small shared CSS below Astro's
internal threshold. Lighthouse FCP measurement deferred (requires live CF Pages build).

**Verdict:** Nice-to-have. Documents the evaluation explicitly so future engineers
don't re-investigate. Low impact.

---

### X.3 — DNS Prefetch + Preconnect ✅ Medium Impact

**Change:** Clarity `dns-prefetch` upgraded to `preconnect` (when project ID is set);
`dns-prefetch` for `huggingface.co` added.

| Origin | Before | After |
|--------|--------|-------|
| cloudflareinsights.com | preconnect ✓ | unchanged |
| www.clarity.ms | dns-prefetch | preconnect (conditional) |
| huggingface.co | — | dns-prefetch |

**Verdict:** Clarity preconnect saves ~100–200 ms TCP+TLS when Clarity fires after
consent. HF dns-prefetch reduces initial latency for ML tools on slow connections.
Zero regression risk.

---

### X.4 — LCP Hero Image Preload ⚪ Deferred

**Change:** `BaseLayout` accepts `heroImagePath` prop; emits
`<link rel="preload" as="image" fetchpriority="high">` when path is provided.
`[slug].astro` resolves `public/heroes/tools/<deSlug>.webp` via `existsSync` at build.

**Status:** No-op today — `public/heroes/tools/` does not exist (0/72 heroes).
Activates automatically once hero images are added to the repo. No build or test cost.

**Trigger:** Hero rollout (PROGRESS.md: ⬜ 0/72 heroes).

---

### X.5 — Skip-to-Content Link ✅ High A11y Impact

**Change:** `<a href="#main" class="skip-to-content">` as first `<body>` child in
BaseLayout. `<main>` gets `id="main"`. CSS: `clip-path: inset(50%)` hides until
`:focus-visible`, then expands with accent-border box — tokens-only, no hex.

**A11y impact:**
- Keyboard-only users can skip the 8-item header nav on every page
- Screen reader users already have landmark nav; skip-link serves keyboard-only users
- `prefers-reduced-motion` disables clip-path transition
- WCAG 2.4.1 (Bypass Blocks) — Level A conformance

**Verdict:** Required for WCAG A compliance. Should have been in from day one.

---

### X.6 — Adaptive Favicon ✅ Low-Medium Impact

**Change:** `public/icon-dark.svg` (light bg `#FAFAF9`, dark strokes `#1A1917`,
dark-orange accent `#8F3A0C`). BaseLayout emits
`<link rel="icon" media="(prefers-color-scheme: dark)" href="/icon-dark.svg">`.

**Logic:**
- Light mode: `icon.svg` (dark bg, white marks) — stands out on bright browser chrome
- Dark mode: `icon-dark.svg` (light bg, dark marks) — stands out on dark browser chrome

**Browser support:** Safari (full), Chrome/Edge (SVG favicon + media, partial — falls
through to `icon.svg` gracefully), Firefox (uses first matching icon).

**Verdict:** Nice UX polish for Safari/iOS. Graceful degradation everywhere else.

---

### X.7 — Pagefind Tuning ✅ Medium Impact

**Change:** `[slug].astro` adds `data-pagefind-weight` at two levels:
- `data-pagefind-weight="3"` on all `<h1>` elements (both `headingHtml` and plain title)
- `data-pagefind-weight="5"` on `<article class="tool-article">` for 6 popular tools

**Popular tools boosted:** hevc-to-h264, remove-background, png-jpg-to-webp,
meter-to-feet, celsius-to-fahrenheit, km-to-mile.

**Notes:**
- Header/Footer already excluded from pagefind index via `data-pagefind-body` on `<main>`
- H1 weight boost means tool names score 3× vs body text — fixes alphabetical ranking
  bias when query matches multiple tools equally

**Verdict:** Meaningful search quality improvement. Zero cost at runtime (build-time
HTML attributes only).

---

### X.8 — Web Vitals RUM ✅ Medium Impact

**Change:** `web-vitals@^5.2.0` installed. `WebVitals.svelte` measures CLS, LCP, INP,
FCP, TTFB via the web-vitals library; sends to CF Web Analytics via
`window.cfBeacon.push('record', name, { value })`. Production-only
(`import.meta.env.PROD`). Loaded via `client:idle` (non-blocking).

**Bundle impact:** web-vitals tree-shakes to ~2 KB gzipped. `client:idle` defers
hydration until main thread is free — FCP/LCP unaffected.

**CF Analytics integration:** Custom events visible under CF Analytics dashboard once
the CF beacon token is set (`CF_RUM_TOKEN` env var). Gracefully silently no-ops if
`window.cfBeacon` is absent.

**Verdict:** Foundational RUM setup for future performance regression detection.

---

### X.9 — Trailing Slash Consistency Linter ✅ DX Impact

**Change:** `scripts/seo/lint-trailing-slash.mjs` — scans `.astro`, `.svelte`, `.ts`
in `src/` for `href=".../"` patterns ending with a slash. Allows `/`, external URLs,
and template literals with `${}` expressions (dynamic, can't statically verify).

Integrated into `npm run check` → CI catches future regressions automatically.
Standalone alias: `npm run lint:trailing-slash`.

**First run result:** 0 violations across all 72 tools + layout/component files.

**Verdict:** Insurance policy against `trailingSlash: 'never'` drift. Small upfront
cost, ongoing correctness guarantee.

---

### X.10 — DEPLOY.md After-Go-Live Docs ✅ Ops Impact

**Change:** Added two new sections to `DEPLOY.md`:

1. **HSTS Preload Submission** — step-by-step `hstspreload.org` flow. All three
   requirements already satisfied in `_headers` (2yr max-age, includeSubDomains,
   preload). Warning: submit only after HTTPS confirmed on all subdomains.
   Timeline: ~6–8 weeks for Chromium inclusion.

2. **Search Console + Bing Webmaster** — DNS TXT verify, sitemap submit, service-account
   setup for programmatic access (T14). Bing GSC auto-import shortcut documented.

**Verdict:** Prevents "I forgot the HSTS submission" on launch day. Zero code risk.

---

## Summary Table

| Task | Impact | Status | Notes |
|------|--------|--------|-------|
| X.1 AVIF OG Cards | High | ✅ Done | 25.5% size reduction, 72 files |
| X.2 Critical CSS | Low | ⚪ Evaluated | `auto` already in effect, `always` rejected |
| X.3 DNS Prefetch | Medium | ✅ Done | Clarity preconnect + HF dns-prefetch |
| X.4 LCP Preload | Medium | ⚪ Deferred | Code wired, triggers when heroes added |
| X.5 Skip-to-Content | High | ✅ Done | WCAG 2.4.1 Level A — keyboard users |
| X.6 Adaptive Favicon | Low | ✅ Done | Polished Safari/iOS dark-mode UX |
| X.7 Pagefind Tuning | Medium | ✅ Done | H1 weight=3, popular tools weight=5 |
| X.8 Web Vitals RUM | Medium | ✅ Done | ~2 KB, client:idle, prod-only |
| X.9 Trailing Slash Lint | DX | ✅ Done | 0 violations, CI-integrated |
| X.10 DEPLOY.md | Ops | ✅ Done | HSTS preload + Search Console steps |

---

## Lighthouse / Bundle Baseline

> Formal Lighthouse measurement requires a live CF Pages build with populated env vars.
> The staging URL (`konverter-7qc.pages.dev`) is available once CI secrets are set.
> Previous Lighthouse snapshots in `audits/lighthouse-2026-04-26-*.json` serve as baseline.

**Expected improvements after this sprint:**
- **A11y score:** +5–10 pts (skip-to-content link satisfies WCAG 2.4.1)
- **Performance:** marginal FCP improvement possible (preconnects, AVIF smaller payloads)
- **SEO:** unchanged (already 100 in prior runs)
- **PWA:** unchanged

**Bundle delta (X.8):** +~2 KB gzipped (web-vitals, client:idle, deferred)

---

## Pagefind Index Stats

> Pagefind index rebuilt on `npm run build`. The `dist/_pagefind/` directory stats:

```bash
# Run after next build to compare:
# du -sh dist/_pagefind/
# pagefind --site dist --output-path dist/_pagefind/ --index-only
```

Expected change: H1 weight boost improves ranking for direct tool-name queries.
Measurable only via user-query testing post-launch.
