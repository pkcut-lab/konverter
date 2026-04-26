#### Review-Pass T7 — 2026-04-26T06:25:00+02:00
**Reviewer:** quality-reviewer
**Verdict:** ✅ approved
**Layer-Check:** Hard-Caps ✅ · Build ✅ · Funktional ✅ · Look ✅ (N/A)

## Layer 1 — Hard-Caps

- Refined-Minimalism: N/A (reine Backend/Lib-Implementierung, kein UI)
- Tokens-only: N/A (`src/lib/seo/tool-jsonld.ts` ist kein Component; keine Hex-Farben gefunden)
- Astro 5 + Svelte 5 Runes: ✅ (TypeScript lib, kein Framework-Import)
- AAA-Contrast: N/A (kein UI)
- Pure-Client: ✅ (SSG pre-rendered, kein Server-Upload)
- DSGVO: ✅ (JSON-LD ist öffentliche Metadaten, kein Consent nötig)
- Organization/WebSite-Blöcke: ✅ NICHT dupliziert — bleiben in BaseLayout.astro (T3)

**Layer 1: PASS**

## Layer 2 — Build-Gates

- `npm run check`: 0 errors / 0 warnings / 0 hints (129 Astro-Dateien) ✅
- `npx vitest run`: 4 failures — ALLE pre-existing aus Phase-3 EN pivot (commit 855c0b7, 2026-04-26 04:28)
  - `hreflang.test.ts`: expects ACTIVE_LANGUAGES=['de'] — Phase-3 hat 'en' hinzugefügt
  - `slug-map.test.ts`: expects getSupportedLangs("meter-to-feet")=['de'] — Phase-3 erweitert
  - `tools-schema.test.ts`: expects rejection of 'en' — 'en' ist jetzt aktiv
  - `deploy.test.ts`: expects _redirects / → /de/ 301 — CF Function übernimmt in Phase-3
  - Keine dieser Tests hat Bezug zu T7 (tool-jsonld.ts / slug.astro JSON-LD)
  - 1757 Tests pass ✅

**Layer 2: PASS** (pre-existing Failures nicht T7-verursacht; T7-relevante Tests alle grün)

⚠️ **ESKALATION:** 4 pre-existing Test-Failures aus Phase-3 EN pivot brauchen separaten Fix.
Zuständig: Launch-Coordinator → Koordination mit codebase-Owner.

## Layer 3 — Funktional

Spot-Check 3 Sample-Tools via `dist/de/<slug>/index.html` (Build vom 26.04.2026):

| Tool | JSON-LD Blöcke | Schema-Typen vorhanden |
|------|---------------|------------------------|
| meter-zu-fuss | 6 | Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQPage (5 Q&A), HowTo (3 Steps) |
| webp-konverter | 6 | Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQPage (5 Q&A), HowTo (3 Steps) |
| passwort-generator | 6 | Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQPage (5 Q&A), HowTo (3 Steps) |

Alle Tools × {SoftApp + Breadcrumb} immer vorhanden; FAQPage + HowTo erscheinen wenn faq/steps im Frontmatter.

Schema-Mapping korrekt:
- `applicationCategory` per category-map (dev→DeveloperApplication, image/video→MultimediaApplication, etc.) ✅
- `operatingSystem: 'Web'` ✅
- `offers.price: '0', priceCurrency: 'EUR'` ✅
- `inLanguage` aus `content.lang` ✅

**Layer 3: PASS**

## Layer 4 — Look-Review

N/A — T7 ist ein reiner Backend/SEO-Task ohne UI-Änderungen.

**Layer 4: PASS (N/A)**

## Notes

- Implementation file: `src/lib/seo/tool-jsonld.ts` (buildToolJsonLd)
- Integration: `src/pages/[lang]/[slug].astro` (Zeilen 184-208)
- 154 Pages in Build (DE+EN), alle 6 blocks pro Tool mit FAQ/Steps im Frontmatter
- Pre-existing Failures wurden von quality-reviewer zur Koordinator-Eskalation markiert
