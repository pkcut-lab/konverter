# PERFORMANCE-BUDGET (v1.0, 2026-04-23)

> **Zweck:** Messbare Perf-Thresholds für jede Tool-Seite. Performance-Auditor (Agent 8) enforced diese Gates vor Ship; Uptime-Sentinel (Agent 30) monitort sie auf Prod.
>
> **Status:** binding ab Aktivierung. Verstöße gegen §1–§2 sind `fail`, §3 sind `warning`.

## §1. Core Web Vitals (2026 Standard)

| Metric | Mobile 4G | Desktop | Source |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤2.5s | ≤2.0s | web.dev/lcp |
| **INP** (Interaction to Next Paint) | ≤200ms | ≤200ms | web.dev/inp (ersetzt FID seit 2024-03) |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | ≤0.1 | web.dev/cls |
| **TTFB** (Time to First Byte) | ≤800ms | ≤600ms | web.dev/ttfb |
| **FCP** (First Contentful Paint) | ≤1.8s | ≤1.0s | web.dev/fcp |

**Messung:** Lighthouse-CI gegen `astro preview` (lokal, für Pre-Ship-Gate) + Cloudflare Web Analytics RUM (Prod, für Monitor). Threshold = 75. Perzentil (nicht Median).

## §2. Bundle-Size-Budget

Pro Tool-Seite (gzip-gemessen, `dist/` nach `astro build`):

| Asset-Typ | Budget | Rationale |
|---|---|---|
| **HTML** (Tool-Page) | ≤15 KB | Astro-SSG, kein JS-Bootstrap-Overhead |
| **CSS** (Critical + Async) | ≤12 KB | Tailwind purged, Inter+JBMono subsetted |
| **JS** (Islands nur) | ≤25 KB | Svelte-5-Runes only, kein Framework-Runtime |
| **TOTAL** (HTML+CSS+JS) | ≤50 KB | Hard-Cap |
| **Fonts** (woff2) | ≤80 KB (cached) | Self-hosted Inter + JetBrains Mono, subsetted |
| **Images** (hero, inline) | ≤100 KB (AVIF) | Tool-Page-Hero max 160×160 |

**Tool-spezifische Ausnahmen:**
- **Bild-Tools** (bild-diff, farbe-extrahieren): ≤80 KB JS + ≤200 KB canvas-polyfills
- **Video-Tools** (Phase 2+): ≤150 KB JS + ≤500 KB WASM (ML-Worker)
- **Audio-Tools** (Phase 2+): ≤100 KB JS + ≤800 KB WASM

Jede Ausnahme MUSS im `src/lib/tools/<slug>.ts`-Config-Kommentar stehen + vom Performance-Auditor gegen diese Tabelle geprüft werden.

## §3. Lighthouse Score (Kategorie-Minima)

| Kategorie | Minimum | Ziel |
|---|---|---|
| **Performance** | ≥90 | 98 |
| **Accessibility** | ≥95 | 100 |
| **Best Practices** | ≥95 | 100 |
| **SEO** | ≥95 | 100 |
| **PWA** (wo aktiv) | ≥80 | 95 |

Wenn eine Kategorie unter Minimum: `fail`. Zwischen Minimum und Ziel: `warning`.

## §4. Third-Party-Budget

Strikt:

| Domain | Allow/Block | Grund |
|---|---|---|
| `konverter-7qc.pages.dev` (self) | allow | own |
| `pagead2.googlesyndication.com` | allow (ab Phase 2) | AdSense |
| `*.google-analytics.com` | **block** | wir nutzen Cloudflare Analytics (server-side, keine Cookies) |
| `*.fonts.googleapis.com` | **block** | Fonts self-hosted (DSGVO) |
| `*.cdnjs.cloudflare.com` | block | keine CDN-Libraries |
| `*.jsdelivr.net` | block | keine CDN-Libraries |
| ML-Model-CDN (bei File-Tools, Phase 2+) | allow mit Worker-Fallback | spec §7a |

Violation = `fail`. Keine Ausnahmen ohne User-Approval.

## §5. CWV-Regression-Detection (Prod)

Uptime-Sentinel (Agent 30) misst täglich:
- RUM via Cloudflare Analytics (CWV nach Perzentil 75)
- Regression-Alarm wenn **zwei aufeinander folgende Tage** eine Metrik den Threshold überschreiten
- Alarm-Kanal: `inbox/to-ceo/cwv-regression-<YYYY-MM-DD>.md`, CEO routet zu Performance-Auditor für Deep-Dive

## §6. Pre-Ship-Gate (Performance-Auditor-Prozedur)

```bash
# Vor jedem Tool-Ship
npm run build
npx lhci autorun \
  --collect.url=http://localhost:4321/de/<slug>/ \
  --collect.numberOfRuns=3 \
  --assert.preset=lighthouse:recommended \
  --assert.assertions.categories:performance="{aggregationMethod:median-run,minScore:0.9}" \
  --assert.assertions.categories:accessibility="{aggregationMethod:median-run,minScore:0.95}" \
  --assert.assertions.categories:seo="{aggregationMethod:median-run,minScore:0.95}" \
  --assert.assertions.cumulative-layout-shift="{maxNumericValue:0.1}" \
  --assert.assertions.largest-contentful-paint="{maxNumericValue:2500}" \
  --assert.assertions.interactive="{maxNumericValue:3500}"

# Bundle-Size Gate
du -sb dist/de/<slug>/ | awk '$1 > 51200 {print "FAIL — bundle " $1 " > 50 KB"; exit 1}'

# Third-Party-Domains Gate
grep -rE "(googleapis|cdnjs|jsdelivr)" dist/de/<slug>/ && exit 1 || echo PASS
```

## §7. Output-Format Performance-Report

```yaml
---
evidence_report_version: 1
critic: performance-auditor
verdict: <pass|fail|partial>
cwv:
  lcp_ms: <n>
  inp_ms: <n>
  cls: <n>
  ttfb_ms: <n>
  fcp_ms: <n>
lighthouse:
  performance: <n>
  accessibility: <n>
  best_practices: <n>
  seo: <n>
  pwa: <n>
bundle_kb:
  html: <n>
  css: <n>
  js: <n>
  total: <n>
third_party_domains: [list]
violations: [list of metric names]
---
```

## §8. Referenzen

- web.dev/vitals (Google)
- `SEO-GEO-GUIDE.md` §4 (shared thresholds)
- `STYLE.md` §Performance
- `CLAUDE.md` §18 Non-Negotiables #3 (Quality-Gates)
