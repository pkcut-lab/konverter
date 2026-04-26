# Lighthouse Summary — 2026-04-26

Audit run on `npx serve dist -l 4321` (static build, HTTP).
Note: PWA score requires HTTPS — SW registration fails on HTTP; omitted from summary.

| URL | Perf Before | Perf After | A11y After | SEO After | TBT After | LCP After |
|-----|-------------|------------|------------|-----------|-----------|-----------|
| / (→/de) | 76 | 98 | 100 | 100 | 0 ms | 2.3 s |
| /de | 98 | 99 | 100 | 100 | 0 ms | 2.0 s |
| /de/werkzeuge | 58 | 99 | 100 | 100 | 0 ms | 2.0 s |
| /de/meter-zu-fuss | 97 | 98 | 100 | 100 | 90 ms | 2.3 s |
| /de/passwort-generator | 97 | 98 | 100 | 100 | 80 ms | 2.3 s |
| /de/zinsrechner | 96 | 98 | 100 | 100 | 90 ms | 2.3 s |
| /de/webp-konverter | 93 | 97 | 100 | 100 | 60 ms | 2.4 s |

**Avg Performance: 87 → 98**

## Goal Achievement

- Performance ≥ 90: ✅ All 7 URLs pass (min=97)
- SEO ≥ 95: ✅ All 7 URLs = 100
- Accessibility = 100: ✅ All 7 URLs (was 96 on webp-konverter)
- PWA ≥ 80: n/a in local HTTP audit
