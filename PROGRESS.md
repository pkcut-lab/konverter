# Progress Tracker

**Letztes Update:** 2026-04-28 — 4-Layer Mobile-Overflow-Defense komplett (6 Commits, +Playwright-Gate 12×6=72 Tests) · 1928/1928 Vitest grün · 16/16 a11y-Test grün · 72/72 Overflow-Gate grün · Commit `d02b8ab`
**Aktuelle Phase:** Phase 3 — EN live · DE + EN beide aktiv · CF Pages Function: Accept-Language + Cookie Redirect (DEFAULT=en) · 3 EN-Tools jetzt Region-Adaptive (US+UK)

---

## Mobile-Overflow-Defense 2026-04-28 — 4-Layer-Architektur

User-Report: leichter horizontaler Scroll auf Mobile, vorheriger Fix (`html { overflow-x: clip }`) maskierte nur am Seitenrand. Deep-Research + Forensic + Implementation.

**Layer 1 — Viewport-Meta** (`BaseLayout.astro`)
- `viewport-fit=cover` aktiviert iOS-Notch-Awareness; gepaart mit safe-area-inset auf allen `position: sticky`/`fixed`-Elementen.

**Layer 2 — Globaler CSS-Reset** (`global.css`)
- `body { overflow-x: clip }` (statt `<html>`) — kanonische 2026-Empfehlung; bricht `position: sticky` NICHT (clip ist kein Scroll-Container).
- `body { overflow-wrap: anywhere }` (statt `break-word`) — zählt Soft-Breaks in `min-content` ein, sodass lange URLs/Hashes Flex-Items nicht mehr sprengen.
- `html { scrollbar-gutter: stable }` — Desktop-CLS-Schutz.
- Globaler `pre { overflow-wrap: normal; overflow-x: auto }` — Code-Blöcke scrollen statt zu brechen.
- Replaced-Elements (img/video/iframe/canvas/picture) gecappt auf `max-inline-size: 100%`. SVG-Reset entkoppelt: `svg:not([width]):not([height]) { block-size: auto }` damit Brand-Mark-Attribute nicht überschrieben werden.

**Layer 3 — Tactical Leaf-Fixes**
- `Header.astro` `.popular-bar`: `overflow: hidden → clip` + `max-inline-size: 100%` (iOS-Sticky-Compositor-Bug).
- `.site-main`/`.inner`/`.popular-bar__inner`/`.skip-to-content`/`.banner`: safe-area-inset-Padding via `max(var(--space-*), env(safe-area-inset-*))`.
- `ColorConverter.swatch`: `120px`/`80px` → Tokens `--color-swatch-size`/`--color-swatch-size-mobile-h` (CONVENTIONS Tokens-only-Compliance).
- `JpgToPdfTool.svelte` `.jpg-pdf__name`: `min-width: 0` damit `text-overflow: ellipsis` im 1fr-Grid-Track greift.

**Layer 4 — Playwright-CI-Gate** (`tests/e2e/no-horizontal-overflow.spec.ts`)
- 6 Viewport-Breiten (320/375/390/412/430/768) × 12 Routen (alle 7 Tool-Typen + idiosynkratische Renderpfade) = 72 Tests.
- Lifte Layer-2-Mask temporär per `page.evaluate`, misst `scrollWidth - clientWidth` an `<html>`, listet Top-10-Offender bei Failure als direkten Fix-Hint.
- `playwright.config.ts` erweitert (testDir 'tests/a11y' → 'tests', testMatch beide Subsuiten); `npm run test:overflow` als Script.
- Result: 72/72 grün — bestätigt dass Mobile-Overflow als globale Klasse eliminiert ist.

**Performance:** netto neutral. `overflow-x: clip` günstiger als `hidden` (kein neuer Scroll-Container). `scrollbar-gutter: stable` reduziert CLS auf Desktop. `anywhere` text-layout +0.05ms pro Text-Node bei einmaligem Layout — irrelevant zur Runtime. CI-Gate +~53s pro PR-Run.

**Commits:** `7b7a941` (Foundation) · `c909370` (site-main safe-area) · `dda366f` (ColorConverter Tokens) · `e9f5fb8` (JpgToPdf min-width:0) · `8262385` (Layer-4 Gate) · `d02b8ab` (Reviewer-Follow-ups: SVG-Reset präziser + Gate auf 12 Routen).

---

## SEO-Audit-Sweep 2026-04-27 — Punkt-für-Punkt-Status

Eingehender Audit identifizierte 30+ Punkte (P0/P1) verteilt über Strategy/SEO/Performance/Polish. Resultat:

### Wave 1 — Stop-the-Bleeding-Mechanik (12 P0/P1)
✅ Apex `noindex` + hardcoded `/en` canonical entfernt (`src/pages/index.astro`)
✅ `DEFAULT_LANGUAGE` `de`→`en` (`src/lib/hreflang.ts`) — synchron mit `functions/index.js:20` (P0-5)
✅ 45 EN-Files: `## Häufige Fragen?` → `## Frequently Asked Questions`
✅ Styleguide `noindex` + sitemap-filter
✅ Breadcrumbs JSON-LD: last-item bekommt `item:` canonical-URL
✅ JSON-LD `priceCurrency`: lang-aware (de→EUR, en→USD); `creator.@id` lang-agnostic `/#person`
✅ Brand-suffix zentralisiert in `BaseLayout.astro` (Skip-when-already-branded-Logic)
✅ Footer-Tools cap 8 → 16
✅ JetBrains-Mono Preload droppen + `Inter Fallback`-Face mit metric-overrides (size-adjust 107%, ascent/descent/line-gap)
✅ `*.pages.dev` preview-URLs: `X-Robots-Tag: noindex` via `functions/_middleware.js`

### Wave 2 — Region-Adaptive Architecture (3 echte Locale-Variants, US+UK)
✅ Region-Foundation: `src/lib/i18n/region.ts` + `region.svelte.ts` (pub-sub) + `RegionSelector.svelte` (Refined-Minimalism Pill-Toggle mit US/UK-Inline-SVG-Flags + ARIA-keyboard)
✅ **vat-calculator** EN: 50 US-States+DC sales-tax matrix + UK-VAT 20/5/0 + exempt; custom-rate für NYC/LA-combined; Intl.NumberFormat USD/GBP
✅ **gross-net-calculator** EN: US 2025 federal brackets × 4 filing statuses (single/mfj/hoh/mfs) + FICA (SS+Medicare+Add'l) / UK 2025/26 PAYE + Class-1 NI 8/2 + Personal-Allowance-Taper (£100k–£125,140)
✅ **interest-calculator** EN: Simple/Compound + 5 frequencies + APY + daily-accrual-at-t0; US federal-marginal-bracket-Picker (0/10/12/22/24/32/35/37%) / UK ISA-tax-free-Toggle + PSA-Bands
✅ Sitemap `xhtml:link` hreflang-alternates pro Tool-URL via slug-map (146/146 Tool-Pages)
✅ `[slug].astro` EN-Override-Routing für die 3 Region-Tools

### Wave 3 — Feature-Upgrades (DE+EN beide profitieren)
✅ **unix-timestamp**: Date-Picker-UI (datetime-local + „Now"-Button) + strukturiertes Output-Panel (UTC/Local/ISO 8601/Unix-s/Unix-ms/Relative) + per-row Copy-Buttons + Voll-i18n-Labels
✅ **jpg-to-pdf**: Multi-Image-Upload + Drag-and-Drop + Reorder (↑/↓-Buttons) + Page-Size-Picker (A4/Letter/Auto) + Orientation + Margin (0/8/16mm)

### Wave 4 — Performance: dynamic-import [slug].astro CSS-Splitting
🟡 **DEFERRED** — 257-KB CSS-Bundle bestätigt, aber Astro-5-Architektur erfordert per-Tool-Route-Refactor (nicht single-file-fix). Dokumentiert als bekannte Performance-Schuld; Fix kommt in dedizierter Phase-2-Performance-Sprint.

### Wave 5 — SEO/Hreflang/Sitemap-Polish
✅ Sitemap per-page `lastmod` aus `frontmatter.dateModified` (146/146 populated, kein build-time-default mehr)
✅ `WebSite.SearchAction` gedroppt (kein `?q`-Handler implementiert; Re-Add in Phase 2)
✅ Sitemap `(de|en)`-Regex aus `ACTIVE_LANGUAGES.join('|')` derived (P1-P)
✅ CF-Function Sync-Check-Test (`tests/functions/middleware-sync.test.ts`): `SUPPORTED` + `DEFAULT_LANG` + `COOKIE_NAME` müssen mit `hreflang.ts` matchen — bricht CI bei Drift (P1-Q)

### Bewusst übersprungen / als YAGNI markiert
- **Wave 5.1 EN Related-Tools-Closer in 73 Files** — `RelatedTools.astro` Sidebar via Frontmatter `relatedTools:[…]` erfüllt bereits SEO-Goal (146/146 Tool-Pages haben Sidebar). Cookie-Cutter-Textual-Closer wäre Low-Value-Boilerplate.
- **Wave 1.10 KiBildDetektorTool/PdfZuJpgTool DE-Strings** — 50+ Strings je Component → das ist Phase-B5-i18n-Migration, kein Wave-1-Mechanisch.
- **PDF-Tools Worker-Wrap (P1-S)** — Investigation-only, deferred.
- **Transformers/ONNX-Chunk-Dedup (P1-U)** — Investigation-only, deferred.

---

---

## Zusammenfassung

| Metrik | Wert |
|--------|------|
| Tools gesamt (slug-map) | **73** |
| ✅ Shipped (live auf CF Pages) | **69** |
| 🟡 In Pipeline (Paperclip, noch nicht shipped) | **3** |
| 🆕 Neu (bereit, noch nicht deployed) | **1** (mondphasen-rechner) |
| ⬜ Skelett / leer | **0** |
| ❌ Broken | **0** |
| Dedizierte Vitest-Tests | 57 Tools |
| Schema-only-Coverage | 15 Tools |
| **Stage-A Browser-Smoke (2026-04-26)** | **✅ 72/72** — HTTP 200 + 0 Console/Page/Hydration-Errors (Vor-F-1-Fix-Lauf, Re-Run blockiert durch parallele en-Migration P-1) |
| **Vitest gesamt (2026-04-26 nach i18n-Slug-Fix)** | ✅ **1778/1778** (113/113 files) inkl. 17 neue Tests in `static-page-slugs.test.ts` + `header-tools-link.test.ts` |
| **Funktions-Smoke parametrisch (2026-04-26)** | **✅ 73/73 nach F-1-Fix** — siehe `audits/2026-04-26-tool-functions.md` |
| **`astro check` + `tsc --noEmit`** | ✅ 0 errors, 0 warnings (2026-04-26 nach Phase-3 EN Pivot) |
| **F-1 Code-Fix (2026-04-26)** | ✅ `json-to-csv` Self-ID-Konsistenz: `src/lib/tools/json-zu-csv.ts:114` + `src/lib/tools/formatter-runtime-registry.ts:37` |
| Icons (`public/icons/tools/`) | ⬜ 0/72 — Verzeichnis existiert nicht |
| Hero-Images (`public/heroes/tools/`) | ⬜ 0/72 — Verzeichnis existiert nicht |

> **Globale Hinweise:**
> - **Icons:** `public/icons/tools/` existiert nicht → alle 72 Tools ⬜
> - **Heroes:** `public/heroes/tools/` existiert nicht → alle 72 Tools ⬜
> - **Content:** alle 72 Tools haben `src/content/tools/<slug>/de.md` ✅
> - **Code:** alle 72 Tools haben `src/lib/tools/<name>.ts` ✅

---

## Tool-Inventar pro Kategorie

Spalten: **Tool-ID** | **DE-Slug** | **Status** | **Komponente** | **Tests** | **Content** | **Icon** | **Hero**

Legende:
- Status: ✅ shipped · 🟡 in Pipeline · ⬜ Skelett · ❌ broken
- Komponente: `generic/Typ` oder `custom/Name`
- Tests: ✅ dediziertes `.test.ts` · 🟡 nur Schema/Config-Coverage

---

### Länge (`length`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| meter-to-feet | meter-zu-fuss | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |
| foot-to-meter | fuss-zu-meter | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| cm-to-inch | zentimeter-zu-zoll | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |
| inch-to-cm | zoll-zu-zentimeter | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |
| km-to-mile | kilometer-zu-meilen | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |
| mm-to-inch | millimeter-zu-zoll | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| nautical-mile-to-km | seemeile-zu-kilometer | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| yard-to-meter | yard-zu-meter | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |

---

### Gewicht (`weight`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| kg-to-lb | kilogramm-zu-pfund | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |
| lb-to-kg | pfund-zu-kilogramm | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| gram-to-ounce | gramm-zu-unzen | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| stone-to-kg | stone-zu-kilogramm | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| tonne-to-pound | tonne-zu-pfund | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |

---

### Fläche (`area`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| sqm-to-sqft | quadratmeter-zu-quadratfuss | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |
| hectare-to-acre | hektar-zu-acre | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| km2-to-mi2 | quadratkilometer-zu-quadratmeile | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |

---

### Volumen (`volume`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| liter-to-gallon | liter-zu-gallonen | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |
| ml-to-floz | milliliter-zu-unzen | ✅ | generic/Converter | 🟡 | ✅ | ⬜ | ⬜ |

---

### Temperatur (`temperature`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| celsius-to-fahrenheit | celsius-zu-fahrenheit | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |

---

### Bild (`image`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| png-jpg-to-webp | webp-konverter | ✅ | generic/FileTool | ✅ | ✅ | ⬜ | ⬜ |
| remove-background | hintergrund-entfernen | ✅ | generic/FileTool | ✅ | ✅ | ⬜ | ⬜ |
| image-diff | bild-diff | ✅ | custom/BildDiffTool | 🟡 | ✅ | ⬜ | ⬜ |
| qr-code-generator | qr-code-generator | ✅ | custom/QrCodeGeneratorTool | ✅ | ✅ | ⬜ | ⬜ |
| webcam-blur | webcam-hintergrund-unschaerfe | ✅ | custom/WebcamBlurTool | ✅ | ✅ | ⬜ | ⬜ |

---

### Video (`video`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| hevc-to-h264 | hevc-zu-h264 | ✅ | generic/FileTool | ✅ | ✅ | ⬜ | ⬜ |
| video-bg-remove | video-hintergrund-entfernen | ✅ | custom/VideoHintergrundEntfernenTool | ✅ | ✅ | ⬜ | ⬜ |

---

### Text (`text`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| character-counter | zeichenzaehler | ✅ | generic/Analyzer | ✅ | ✅ | ⬜ | ⬜ |
| roman-numerals | roemische-zahlen | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| lorem-ipsum-generator | lorem-ipsum-generator | ✅ | generic/Generator | ✅ | ✅ | ⬜ | ⬜ |
| text-diff | text-diff | ✅ | generic/Comparer | ✅ | ✅ | ⬜ | ⬜ |
| speech-enhancer | sprache-verbessern | ✅ | generic/Analyzer | ✅ | ✅ | ⬜ | ⬜ |
| audio-transkription | audio-transkription | ✅ | custom/AudioTranskriptionTool | ✅ | ✅ | ⬜ | ⬜ |
| image-to-text | bild-zu-text | ✅ | generic/Analyzer | ✅ | ✅ | ⬜ | ⬜ |
| ki-text-detektor | ki-text-detektor | ✅ | custom/KiTextDetektorTool | ✅ | ✅ | ⬜ | ⬜ |
| ki-bild-detektor | ki-bild-detektor | ✅ | custom/KiBildDetektorTool | ✅ | ✅ | ⬜ | ⬜ |

---

### Entwickler-Tools (`dev`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| password-generator | passwort-generator | ✅ | generic/Generator | ✅ | ✅ | ⬜ | ⬜ |
| uuid-generator | uuid-generator | ✅ | generic/Generator | ✅ | ✅ | ⬜ | ⬜ |
| json-formatter | json-formatter | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| regex-tester | regex-tester | ✅ | custom/RegexTesterTool | ✅ | ✅ | ⬜ | ⬜ |
| base64-encoder | base64-encoder | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| url-encoder-decoder | url-encoder-decoder | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| hash-generator | hash-generator | ✅ | generic/Generator | ✅ | ✅ | ⬜ | ⬜ |
| sql-formatter | sql-formatter | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| xml-formatter | xml-formatter | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| css-formatter | css-formatter | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| jwt-decoder | jwt-decoder | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| json-diff | json-diff | ✅ | generic/Comparer | 🟡 | ✅ | ⬜ | ⬜ |
| json-to-csv | json-zu-csv | ✅ | generic/Formatter | 🟡 | ✅ | ⬜ | ⬜ |

---

### Farbe (`color`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| hex-to-rgb | hex-rgb-konverter | ✅ | custom/ColorConverter | ✅ | ✅ | ⬜ | ⬜ |
| contrast-checker | kontrast-pruefer | ✅ | custom/ContrastCheckerTool | ✅ | ✅ | ⬜ | ⬜ |

---

### Zeit (`time`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| unix-timestamp | unix-timestamp | ✅ | generic/Formatter | ✅ | ✅ | ⬜ | ⬜ |
| timezone-converter | zeitzonen-rechner | ✅ | generic/Converter | ✅ | ✅ | ⬜ | ⬜ |

---

### Natur & Astronomie (`nature`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| moon-phase | mondphasen-rechner | 🟡 | custom/MondphasenRechnerTool | ✅ | ✅ | ⬜ | ⬜ |

---

### Finanzen (`finance`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| vat-calculator | mehrwertsteuer-rechner | ✅ | custom/MehrwertsteuerRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| discount-calculator | rabatt-rechner | ✅ | custom/RabattRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| interest-calculator | zinsrechner | ✅ | custom/ZinsrechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| loan-calculator | kreditrechner | ✅ | custom/KreditrechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| hourly-to-annual | stundenlohn-jahresgehalt | ✅ | custom/StundenlohnJahresgehaltTool | ✅ | ✅ | ⬜ | ⬜ |
| compound-interest-calculator | zinseszins-rechner | ✅ | custom/ZinseszinsRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| gross-net-calculator | brutto-netto-rechner | ✅ | custom/BruttoNettoRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| amortization-calculator | tilgungsplan-rechner | ✅ | custom/TilgungsplanRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| cash-discount-calculator | skonto-rechner | ✅ | custom/SkontoRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| roi-calculator | roi-rechner | ✅ | custom/RoiRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| cash-flow-calculator | cashflow-rechner | ✅ | custom/CashflowRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| kgv-calculator | kgv-rechner | ✅ | generic/Analyzer | ✅ | ✅ | ⬜ | ⬜ |
| leasing-factor-calculator | leasing-faktor-rechner | ✅ | custom/LeasingFaktorRechnerTool | ✅ | ✅ | ⬜ | ⬜ |
| inheritance-tax-calculator | erbschaftsteuer-rechner | ✅ | custom/ErbschaftsteuerRechnerTool | ✅ | ✅ | ⬜ | ⬜ |

---

### Dokumente (`document`)

| Tool-ID | DE-Slug | Status | Komp | Tests | Content | Icon | Hero |
|---------|---------|--------|------|-------|---------|------|------|
| jpg-to-pdf | jpg-zu-pdf | ✅ | generic/FileTool | ✅ | ✅ | ⬜ | ⬜ |
| pdf-merge | pdf-zusammenfuehren | ✅ | custom/PdfZusammenfuehrenTool | ✅ | ✅ | ⬜ | ⬜ |
| pdf-split | pdf-aufteilen | ✅ | custom/PdfAufteilenTool | ✅ | ✅ | ⬜ | ⬜ |
| pdf-compress | pdf-komprimieren | 🟡 | generic/FileTool | ✅ | ✅ | ⬜ | ⬜ |
| pdf-to-jpg | pdf-zu-jpg | 🟡 | custom/PdfZuJpgTool | ✅ | ✅ | ⬜ | ⬜ |
| pdf-password | pdf-passwort | 🟡 | custom/PdfPasswortTool | ✅ | ✅ | ⬜ | ⬜ |

---

## Bekannte Issues (🟡 — 3 Tools in Paperclip-Pipeline)

### 1. `pdf-komprimieren` (KON-504)
- **Zustand:** `in_review` — in Paperclip-Pipeline, noch nicht shipped
- **Code:** vollständig (`pdf-komprimieren.ts` + `pdf-komprimieren-runtime.ts` + `FileTool.svelte`)
- **Tests:** ✅ `pdf-komprimieren.test.ts` vorhanden
- **Nächster Schritt:** CEO muss Critics-Ergebnisse aggregieren und Meta-Review dispatchen

### 2. `pdf-zu-jpg` (KON-519)
- **Zustand:** Rework-R3 abgeschlossen (commit `80a0be5`, 1675/1675 Tests grün), Critics-R3 (KON-520–527) dispatched
- **Code:** vollständig (`pdf-zu-jpg.ts` + `pdf-zu-jpg-utils.ts` + `PdfZuJpgTool.svelte`)
- **Tests:** ✅ `pdf-zu-jpg.test.ts` vorhanden
- **Nächster Schritt:** Critics-R3 Verdicts aggregieren → Meta-Review-R3 → End-Review → Ship

### 3. `pdf-passwort` (KON-509)
- **Zustand:** Phase 1 Build fertig (commit `7116871`, §0.7 done), Critics-R1 (KON-528–535) dispatched
- **Code:** vollständig (`pdf-passwort.ts` + `pdf-passwort-utils.ts` + `PdfPasswortTool.svelte`)
- **Tests:** ✅ `pdf-passwort.test.ts` vorhanden
- **Scope-Hinweis:** V1 = decrypt-only (Passwort entfernen). Encrypt-/Lock-Funktion bewusst deferred.
- **Nächster Schritt:** Critics-R1 Verdicts → Rework falls nötig → Meta-Review → End-Review → Ship

---

## Skelette (⬜)

**Keine.** Alle 72 Tools in `slug-map.ts` haben:
- ✅ `src/lib/tools/<name>.ts` — Tool-Config vorhanden
- ✅ `src/content/tools/<slug>/de.md` — SEO-Content vorhanden
- ✅ Svelte-Komponente (generic oder custom) — UI vorhanden

---

## Test-Schulden (🟡 — 15 Tools mit nur Schema-Coverage)

Diese Tools wurden durch das Sequential Pipeline Quality Gate (8 Critics + 3-Pass End-Review) shipped, haben aber kein dediziertes `.test.ts` für ihre Logik. Abgedeckt nur via `schemas.test.ts` (Config-Validierung).

| Tool-ID | DE-Slug | Kategorie |
|---------|---------|-----------|
| foot-to-meter | fuss-zu-meter | length |
| mm-to-inch | millimeter-zu-zoll | length |
| nautical-mile-to-km | seemeile-zu-kilometer | length |
| yard-to-meter | yard-zu-meter | length |
| lb-to-kg | pfund-zu-kilogramm | weight |
| gram-to-ounce | gramm-zu-unzen | weight |
| stone-to-kg | stone-zu-kilogramm | weight |
| tonne-to-pound | tonne-zu-pfund | weight |
| hectare-to-acre | hektar-zu-acre | area |
| km2-to-mi2 | quadratkilometer-zu-quadratmeile | area |
| liter-to-gallon | liter-zu-gallonen | volume |
| ml-to-floz | milliliter-zu-unzen | volume |
| json-diff | json-diff | dev |
| json-to-csv | json-zu-csv | dev |
| image-diff | bild-diff | image |

> Priorität: niedrig — alle sind einfache bidirektionale Converter oder Runtime-free Transformer ohne eigene Fehlerquellen.

---

## Offene Site-weite Schulden

| Ticket | Beschreibung | Priorität |
|--------|-------------|-----------|
| Icons fehlen komplett | `public/icons/tools/` existiert nicht — 72 Hero-Icons (160×160) noch nicht erstellt | mittel |
| Heroes fehlen komplett | `public/heroes/tools/` existiert nicht | niedrig |
| A11y: `--color-text-muted` AAA Gap | 6.61:1 statt ≥7:1 — betrifft Muted-Text sitewide | hoch |
| NBSP-Sweep (KON-918ed843) | Zahlen+Einheiten ohne geschütztes Leerzeichen in Content-Files | niedrig |
| dossier_applied-Audit (KON-f213e279) | Veraltete `dossier_applied:`-Annotations in Content-Files | niedrig |
| INP/Core-Web-Vitals-Audit (SEO-G11) | ⚡ Partial: client:visible für HeaderSearch+ThemeToggle (T3.2). Lighthouse-Messung deferred (braucht live Build). Ziel: INP <200ms p75. | mittel |
| fallbackFormat try/catch (KON-31322868) | Hardening für Edge-Cases in Formatter-Runtime | niedrig |

---

## Phase-0-Milestones

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Bootstrap | ✅ | Astro-Shell + Rulebooks + Git + CF Pages |
| 2 — Design-System | ✅ | `tokens.css`, Dark/Light, self-hosted Fonts |
| 3 — Layout-Shell | ✅ | BaseLayout + Header + Footer + ThemeToggle + hreflang |
| 4 — Tool-Config-Foundation | ✅ | Zod-Schemas 9 Typen + slug-map + Content-Collection |
| 5 — Meter-zu-Fuß Prototype | ✅ | Converter-Template + Dynamic Route + SEO-Content |
| 6 — Review #1 + Redesign | ✅ | Refined-Minimalism-Redesign + Prereqs + Audit-Pass |
| 7 — WebP Konverter | ✅ | FileTool-Template + /de/webp-konverter live |
| 8 — Review #2 | ✅ | Templates gelockt (Desktop+Mobile, Light+Dark) |
| 9 — Hintergrund-Entferner | ✅ | BG-Remover + FileTool-Erweiterungen + JSON-LD |
| 10 — PWA + Pagefind | ✅ | Manifest + 4 Icons + Workbox-SW + Pagefind |
| 11 — CI/CD | ✅ scaffolded | GitHub Actions + `_headers` + `_redirects` — Deploy wartet auf CF-Secrets |

## Phase-1-Milestones

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Tool-Cross-Links | ✅ | FooterToolsList + RelatedTools + list.ts |
| 2 — Batch-1-Converter | ✅ | 5 neue Converter (cm/km/kg/°C/m²) |
| 3 — HEVC→H.264 | ✅ | Video-FileTool + WebCodecs-Engine |
| Design-Alignment R1–R3 | ✅ | Graphit-Palette + Orange-Accent + Editorial-Patterns + No-Tool-Icons |
| Paperclip-Pipeline (§0 v1.5) | ✅ | Sequential-Workflow: Phase A–F, 8 Critics + 3-Pass End-Review |
| Finance-Cycle (8 Tools) | ✅ | brutto/kredit/rabatt/tilgungsplan/zinsrechner/stundenlohn/zinseszins/kgv shipped |
| PDF-Cycle (4 Tools) | ✅ | jpg-zu-pdf/pdf-zusammenfuehren/pdf-aufteilen shipped; 3 noch in Pipeline |
| ML-Tools (7 Tools) | ✅ | hintergrund-entfernen/webcam-blur/video-bg-remove/sprache-verbessern/bild-zu-text/ki-text-detektor/ki-bild-detektor |
| SEO Sprint 1+2 | ✅ | dateModified+datePublished · AnswerFirst · ToolStats · Question-Headers · @graph · BreadcrumbList in [slug].astro |
| SEO Sprint 3 | ✅ | T3.1 hreflang-Fix 144 pages · T3.2 INP client:visible · T3.3 computeRelatedTools · T3.4 llms.txt prebuild · T3.5 sitemap priority · T3.6 Breadcrumbs.astro |
| i18n Phase A+B (2026-04-27) | ✅ | Foundation (lang/types/locale-maps/units/strings/schemas/label/lint) + alle 8 shared Komps + 22 Tool-Komps migriert |

## Nächste Session — Phase B4 (i18n Config-Labels)

**Offen:** 73 Tool-Configs in `src/lib/tools/*.ts` haben noch hardcodierte DE-Labels.
Muster-Migration:
- Unit-Converter: `label: 'Meter'` → `label: unit('m')` (LocalizedString via units.ts)
- Calculator/Custom: `label: 'Brutto'` → `label: { de: 'Brutto', en: 'Gross' }` (manuelle LocalizedString)
- Dann `resolveLabel(config.units.from.label, lang)` in Converter.svelte + generic tools nutzen
- Abschluss: lint-no-de-in-ui.mjs Scope auf `src/lib/tools/**` erweitern (aktuell nur components/layouts)

---

## Completed-Tools (Live-Liste)

Vollständige Liste in [`docs/completed-tools.md`](docs/completed-tools.md) — wird vom CEO-Agent via §7.5 Post-Deploy-Hook gepflegt.

Zuletzt shipped: `video-hintergrund-entfernen` + `pdf-zusammenfuehren` + `pdf-aufteilen` (2026-04-26)

---

## Deploy-History

- **2026-04-19, Session 11:** CI/CD scaffolded. **Blockiert:** CF-API-Token + Account-ID müssen als GitHub-Repo-Secrets gesetzt werden (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). Checkliste in [DEPLOY.md](DEPLOY.md).
- **Staging-URL:** `https://konverter-7qc.pages.dev` (CF Pages — Deploy nach Secret-Setup automatisch)

---

## Blockers

- **CI/CD-Deploy:** CF-Secrets nicht gesetzt — kein Production-Deploy möglich (unverändert seit Session 11).
- **Pipeline-Tools:** 3 Tools in Paperclip-Pipeline warten auf Critics-Ergebnisse (pdf-komprimieren, pdf-zu-jpg, pdf-passwort).

---

## Backlog — Geplante Tools (noch nicht in slug-map)

> Status `📋` = Idee bestätigt, noch kein Build-Auftrag vergeben.
> Alle Tools hier sind **AdSense-konform** und **pure-client** (Non-Negotiables #2+#7 eingehalten).

### Video-Erweiterungen (`video`) — ffmpeg.wasm-Cluster

Alle vier Tools teilen sich dieselbe Worker-Architektur (ffmpeg.wasm WASM-Core, kein Server-Upload, fällt unter 7a-ML-Worker-Ausnahme). Empfohlene Bau-Reihenfolge: Audio-Extraktion zuerst (einfachste ffmpeg.wasm-Integration), dann Format-Konverter, dann Trimmer/Cutter, dann Compressor.

| Tool-ID (Kandidat) | DE-Slug (Kandidat) | Beschreibung | Architektur | Suchvolumen-Signal |
|---|---|---|---|---|
| `video-to-audio` | `video-zu-audio` | MP4/WebM/MKV → MP3/AAC/WAV (Audio-Extraktion, kein Re-Encode nötig) | ffmpeg.wasm Worker, `generic/FileTool` | „mp4 zu mp3" DE: sehr hoch |
| `video-format-converter` | `video-format-konverter` | MP4 ↔ WebM ↔ GIF ↔ MKV · Codec-Auswahl (H.264/VP9/AV1) | ffmpeg.wasm Worker, `custom/VideoFormatKonverterTool` | „mp4 zu gif", „webm konverter" DE: hoch |
| `video-trimmer` | `video-cutter` | Video auf Zeitbereich schneiden · Frame-genaue In/Out-Punkte · keine Neukodierung (copy-stream) | ffmpeg.wasm Worker `-c copy`, `custom/VideoCutterTool` | „video schneiden online" DE: sehr hoch |
| `video-compressor` | `video-komprimierer` | Dateigröße reduzieren via CRF-Slider · Target-Filesize-Mode · Vorschau-Framerates | ffmpeg.wasm Worker CRF, `custom/VideoKomprimiererTool` | „video verkleinern" DE: hoch |

### Text-/KI-Erweiterungen (`text`)

| Tool-ID (Kandidat) | DE-Slug (Kandidat) | Beschreibung | Architektur | Suchvolumen-Signal |
|---|---|---|---|---|
| `youtube-transcript` | `youtube-transkript` | YouTube-URL → Untertitel via offizieller `timedtext`-API (kein Download, kein TPM-Eingriff) → SRT / TXT / JSON. Bonus: Sprach-Filter, Zeitstempel-Toggle. | Fetch `youtube.com/api/timedtext` (öffentlich, CORS-ok via Astro API-Route Server-Funktion), `custom/YoutubeTranskriptTool` | „youtube untertitel herunterladen" DE: sehr hoch |

> **Hinweis `youtube-transcript`:** braucht eine schmale Astro Server-Route als CORS-Proxy für den timedtext-Endpoint (kein Video-Bytes-Transfer, nur XML-Text — Non-Negotiable #2 „kein Server-Upload" nicht verletzt). CF-Pages-Function reicht.
