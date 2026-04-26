# Progress Tracker

**Letztes Update:** 2026-04-26 — SEO/GEO-Audit: Organization+WebSite-JSON-LD global, robots.txt, llms.txt, llms-full.txt
**Aktuelle Phase:** Phase 1 — Skalierung (läuft) · Sequential-Workflow-Pipeline aktiv (§0 v1.5)

---

## Zusammenfassung

| Metrik | Wert |
|--------|------|
| Tools gesamt (slug-map) | **72** |
| ✅ Shipped (live auf CF Pages) | **69** |
| 🟡 In Pipeline (Paperclip, noch nicht shipped) | **3** |
| ⬜ Skelett / leer | **0** |
| ❌ Broken | **0** |
| Dedizierte Vitest-Tests | 57 Tools |
| Schema-only-Coverage | 15 Tools |
| **Stage-A Browser-Smoke (2026-04-26)** | **✅ 72/72** — HTTP 200 + 0 Console/Page/Hydration-Errors (siehe `audits/2026-04-26-tool-functions.md`) |
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
| INP/Core-Web-Vitals-Audit (SEO-G11) | Lighthouse-Run + INP-Tuning. Schwelle 2026: <200 ms (Praxis-Target <150 ms). Forschung: `docs/superpowers/research/2026-04-26-seo-geo-deep-research.md` | hoch |
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
