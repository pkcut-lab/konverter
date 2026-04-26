# SEO + GEO Implementation Roadmap — kittokit (2026-04-26)

**Source:** `docs/superpowers/research/2026-04-26-seo-geo-mega-research.md` Teil 6.
**Format:** 3 Sprints à 1 Woche, je 5-7 Tasks. Pro Task: Files (absolute Pfade), geschätzte LoC-Diff, Test-Gates.
**Hard-Constraint:** keine Verletzung der Refined-Minimalism-Hard-Caps (Tokens-only, Inter+JetBrains, Graphit+Orange-Accent, kein Hex/arbitrary-px in Components).

---

## Sprint 1 — Foundation (Woche 2026-04-27 → 2026-05-03)

**Ziel:** Freshness-Signal + Author-Block + Content-Reorder + Trust-File. Hebelt 4 von 5 Top-Citation-Treibern auf einmal.

### Task 1.1 — `dateModified` + `datePublished` Frontmatter + Schema + UI-Stamp
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\content\config.ts` (Schema erweitern)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\lib\seo\tool-jsonld.ts` (write `dateModified`, `datePublished` ins SoftwareApplication-Block)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\pages\[lang]\[slug].astro` (sichtbarer "Zuletzt aktualisiert"-Stamp im Tool-Footer)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\content\tools\**\*.mdx` (alle 72 Files: `dateModified: '2026-04-26'` einfügen via Migration-Skript)
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\scripts\seo\migrate-date-modified.mjs` (Skript, das jedem Frontmatter-Block `datePublished` aus Git-History first-commit + `dateModified` aus latest-commit setzt)
- **LoC-Diff:** ~80 LoC Schema/Component + ~5 LoC pro MDX × 72 = ~440 LoC Frontmatter (per Skript)
- **Test-Gates:**
  - `npx vitest run` — alle existierenden Tests grün
  - neuer Test: `tests/seo/date-modified.test.ts` validiert dass JSON-LD `dateModified` gesetzt + ISO-8601-Format
  - neuer Test: alle Tool-Frontmatter haben `dateModified`-Field
  - manuell: `pnpm dev` + Browser → "Zuletzt aktualisiert: 26.04.2026" sichtbar im Footer einer Test-Page

### Task 1.2 — Answer-First-Block-Reorder
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\pages\[lang]\[slug].astro` — `intro` aus `<article class="tool-article">` herausziehen und direkt unter `<header class="tool-hero">` rendern (vor `<div class="tool-main">`). 40-60-Wort-Cap als Lint-Regel.
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\scripts\seo\lint-intro-length.mjs`
- **LoC-Diff:** ~25 LoC Page-Reorder + ~40 LoC Lint-Skript
- **Test-Gates:**
  - bestehende Page-Snapshot-Tests aktualisieren (DOM-Reihenfolge)
  - Lint im `npm run check` integrieren — fail wenn `intro` >70 Wörter
  - manuell: View-Source einer Tool-Page, intro-Text steht zwischen `<h1>` und Tool-Component

### Task 1.3 — `Organization.sameAs` befüllen
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\layouts\BaseLayout.astro:54` — `sameAs: []` → Array mit GitHub-Org-URL, LinkedIn-Page, X/Mastodon-Profil (was vorhanden), künftiges Wikidata-Item (Q-Nr.)
- **LoC-Diff:** ~5 LoC
- **Test-Gates:**
  - bestehender JSON-LD-Validation-Test (falls da) bleibt grün
  - neuer Mini-Test: `Organization.sameAs.length > 0`

### Task 1.4 — `security.txt` (RFC 9116)
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\public\security.txt` mit `Contact: mailto:security@kittokit.com`, `Expires: 2027-04-26T00:00:00.000Z`, `Preferred-Languages: de, en`, `Canonical: https://kittokit.com/.well-known/security.txt`, `Policy: https://kittokit.com/de/security-policy`
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\public\.well-known\security.txt` (Symlink/Copy — RFC fordert primär `.well-known/`-Pfad)
- **LoC-Diff:** ~10 LoC × 2 Files
- **Test-Gates:**
  - `curl http://localhost:4321/security.txt` + `/.well-known/security.txt` → 200, korrekter Content
  - `Expires:`-Date >12 Monate in der Zukunft

### Task 1.5 — Author-Page `/de/ueber` + `Person`-Schema
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\src\pages\de\ueber.astro` (Bio + Mission + Person-JSON-LD)
  - String-Keys: `c:\Users\carin\.gemini\Konverter Webseite\src\lib\i18n\strings.ts` (footer-link "Über")
  - Footer-Link: `c:\Users\carin\.gemini\Konverter Webseite\src\components\Footer.astro`
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\src\lib\seo\person-jsonld.ts` (helper)
- **LoC-Diff:** ~150 LoC
- **Test-Gates:**
  - `npx vitest run` grün
  - `pnpm build` baut `/de/ueber/index.html` ohne Fehler
  - JSON-LD enthält `Person` mit `sameAs` zu LinkedIn/GitHub
  - manuell: Page hat ≥300 Wörter (Anti-Thin-Content), Bio + 3 Differenzierungs-Sätze + Author-Photo

### Task 1.6 — `creator`-Verlinkung in per-Tool-JSON-LD
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\lib\seo\tool-jsonld.ts` — `SoftwareApplication`-Block bekommt `creator: { '@type': 'Person', '@id': 'https://kittokit.com/de/ueber#person' }`
- **LoC-Diff:** ~5 LoC
- **Test-Gates:**
  - JSON-LD-Snapshot-Tests aktualisieren

**Sprint-1-Verification:**
- `npm run check` grün
- `pnpm build` baut alle 72 Tool-Pages + neue Author-Page
- Stichprobe 3 Tool-Pages durch Google Rich Results Test (manuell oder via API): keine Errors, Warnings ok
- `git diff --stat` ≤700 LoC (ohne Migration-Skript-Output)

---

## Sprint 2 — GEO Citation-Magnets (Woche 2026-05-04 → 2026-05-10)

**Ziel:** Stat-Block, Question-Headers, `@graph`, Schema-Refinement. Maximiert "Citation-Magnet"-Mechanik laut Princeton-Studie.

### Task 2.1 — `<ToolStats>` Komponente + Frontmatter-Field
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\src\components\ToolStats.astro` (Refined-Minimalism: 3-4 Stat-Items, monospace-Numbers via JetBrains, kein Background, `--color-text-subtle` Labels)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\content\config.ts` (`stats: z.array(z.object({ label: z.string(), value: z.string() })).optional()`)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\pages\[lang]\[slug].astro` (zwischen Hero und Tool, only render if `entry.data.stats`)
  - **Migration:** Frontmatter-Field für 5-10 Lighthouse-Tools (höchstgewichtete Tools) initial; rest in Phase 2
- **LoC-Diff:** ~80 LoC Komponente + ~10 LoC Page-Integration + ~30 LoC für 10 MDX-Tools
- **Test-Gates:**
  - Komponente rendert mit 0/3/4 Stats korrekt (Tests in `tests/components/ToolStats.test.ts`)
  - kein CLS-Impact (ToolStats hat fixe min-height-Reserve)
  - Lighthouse-Visual-Regression-Snapshot grün
  - kein Hex/px in Component (Token-Lint grün)

### Task 2.2 — Question-Header-Lint + Migration
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\scripts\seo\lint-question-headers.mjs` (warnt wenn H2 nicht mit `?` endet ODER nicht mit Question-Word startet — Konfig: `ignore: ['Datenschutz', 'Über kittokit']`)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\content\tools\**\*.mdx` — 72 Files audit + migrieren wo nötig (~30-40 betroffen)
  - `package.json` Lint-Script
- **LoC-Diff:** ~80 LoC Lint + ~3 LoC pro betroffenem MDX
- **Test-Gates:**
  - `npm run lint:question-headers` exit 0 nach Migration
  - alle bestehenden Tests grün
  - Stichprobe 3 Pages: H2s sind Fragen oder explizit ignoriert

### Task 2.3 — `@graph`-Konsolidierung
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\lib\seo\tool-jsonld.ts` — von `Array<JSON-LD>` zu `{ '@context': 'https://schema.org', '@graph': [...] }`
  - `c:\Users\carin\.gemini\Konverter Webseite\src\pages\[lang]\[slug].astro` — Render-Loop ersetzen durch single `<script>` Block
- **LoC-Diff:** ~30 LoC Refactor
- **Test-Gates:**
  - bestehende JSON-LD-Tests aktualisieren auf `@graph`-Struktur
  - Rich Results Test (manuell) — keine Regression

### Task 2.4 — `WebApplication`-Subtype + `browserRequirements` + `featureList`
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\lib\seo\tool-jsonld.ts` — `@type: ['SoftwareApplication', 'WebApplication']` (Schema.org erlaubt Multi-Type), + `browserRequirements: 'Requires JavaScript. Requires HTML5.'`, + `featureList`-Array aus neuer Frontmatter
  - `c:\Users\carin\.gemini\Konverter Webseite\src\content\config.ts` (`featureList: z.array(z.string()).optional()`)
  - Migration für 10 Initial-Tools
- **LoC-Diff:** ~20 LoC Schema + ~30 LoC Frontmatter
- **Test-Gates:**
  - JSON-LD-Snapshot-Updates
  - Validate via `npx schema-dts-validator` (oder manuell Rich Results Test)

### Task 2.5 — `speakable`-Property
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\lib\seo\tool-jsonld.ts` — `speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.tool-hero p.tagline', '.tool-article .intro'] }` auf der Page-Level (in `WebPage`-Wrap)
- **LoC-Diff:** ~10 LoC
- **Test-Gates:** Snapshot-Update

### Task 2.6 — Sichtbare Breadcrumbs
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\src\components\Breadcrumbs.astro` (Refined-Minimalism: text-subtle, separator `›`, 1px-Border-bottom optional)
  - `c:\Users\carin\.gemini\Konverter Webseite\src\pages\[lang]\[slug].astro` (zwischen Header und Hero)
- **LoC-Diff:** ~60 LoC
- **Test-Gates:**
  - Tests rendern Breadcrumb für 1/2/3 Levels
  - Token-Compliance (kein Hex/px)
  - Mobile-Snapshot bleibt visuell ok

### Task 2.7 — `lastmod` aus Frontmatter `dateModified` in Sitemap
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\astro.config.mjs` — `sitemap()` mit `serialize`-Hook, der für Tool-URLs das `dateModified` aus Content-Collection-Cache liefert
- **LoC-Diff:** ~30 LoC
- **Test-Gates:**
  - `pnpm build` produziert `dist/sitemap-0.xml` mit `<lastmod>` für jede Tool-URL
  - Lastmod entspricht Frontmatter-Wert

**Sprint-2-Verification:**
- `npm run check` + `npx vitest run` grün
- `pnpm build` ok
- Stichprobe 5 Pages → Rich Results Test ohne Errors
- Lighthouse-Score (Performance) ≥ Sprint-1-Baseline (kein Regression durch ToolStats/Breadcrumbs)
- `npm run lint:question-headers` exit 0

---

## Sprint 3 — Maintenance + Continuous Quality (Woche 2026-05-11 → 2026-05-17)

**Ziel:** Lighthouse-CI, Schema-Drift-CI, Alt-Text-Audit, RSS, Word-Count-Audit. Verhindert Regressionen + automatisiert Maintenance.

### Task 3.1 — Lighthouse-CI Setup
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\.github\workflows\lighthouse.yml`
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\lighthouserc.cjs` (Targets: LCP <2.5 s, INP <200 ms, CLS <0.1, FCP <1.8 s — strict für /de + /de/meter-zu-fuss + /de/json-formatter als Sample)
- **LoC-Diff:** ~60 LoC
- **Test-Gates:**
  - GitHub-Action läuft nach Push und kommentiert PR mit Lighthouse-Report
  - lokaler Test: `npx lhci autorun` exit 0 für Targets

### Task 3.2 — Schema-Drift-CI (Rich-Results-Test API)
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\scripts\seo\schema-validate-ci.mjs` (post-build: 5 Sample-URLs gegen Google Rich Results Test API jagen, fail wenn neue Errors)
  - `c:\Users\carin\.gemini\Konverter Webseite\.github\workflows\schema-validate.yml`
- **LoC-Diff:** ~80 LoC
- **Test-Gates:**
  - lokal: Skript läuft gegen `pnpm preview`-Server, exit 0
  - GitHub-Action grün

### Task 3.3 — Alt-Text-Audit-Skript + Migration
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\scripts\seo\audit-alt-text.mjs` (parsed `*.mdx` + Hero-Image-Frontmatter, warnt bei <8 oder >20 Wörtern, generic Strings wie "Image" / "Foto")
  - `c:\Users\carin\.gemini\Konverter Webseite\src\content\tools\**\*.mdx` — Migration für betroffene Files (~10-30)
- **LoC-Diff:** ~80 LoC Skript + ~5 LoC pro betroffenem File
- **Test-Gates:**
  - `npm run audit:alt-text` exit 0

### Task 3.4 — RSS-Feed
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\src\pages\rss.xml.ts`
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\src\pages\de\rss.xml.ts`
  - `c:\Users\carin\.gemini\Konverter Webseite\package.json` — `@astrojs/rss` Dependency
  - `c:\Users\carin\.gemini\Konverter Webseite\src\layouts\BaseLayout.astro` — `<link rel="alternate" type="application/rss+xml" href="/de/rss.xml">`
- **LoC-Diff:** ~80 LoC
- **Test-Gates:**
  - `pnpm build` → `dist/rss.xml` + `dist/de/rss.xml` valide RSS 2.0
  - W3C-Feed-Validator-Snapshot

### Task 3.5 — Word-Count-Audit
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\scripts\seo\word-count-audit.mjs` (parsed Tool-Article-Content + Aside, output Tabelle: Tool / WordCount / Status [warn <500, ok 500-2500, warn >2500])
- **LoC-Diff:** ~70 LoC
- **Test-Gates:**
  - `npm run audit:word-count` produziert Markdown-Report nach `inbox/to-claude/word-count-2026-04-26.md`
  - Review nach Sprint 3 → Q2-Sprint-Plan für Content-Erweiterung

### Task 3.6 — "Zuletzt aktualisiert"-Stamp im Tool-Footer
- **Files:**
  - `c:\Users\carin\.gemini\Konverter Webseite\src\pages\[lang]\[slug].astro` — neuer kleiner Footer-Block unter `<article class="tool-article">` mit `<time datetime={...}>{strings.lastUpdatedLabel} {formattedDate}</time>`
  - String-Keys + de/en-Übersetzung
- **LoC-Diff:** ~30 LoC
- **Test-Gates:**
  - Snapshot-Test
  - manuell sichtbar auf Sample-Page

### Task 3.7 — `.well-known/`-Konsolidierung + `humans.txt`
- **Files:**
  - **NEU** `c:\Users\carin\.gemini\Konverter Webseite\public\humans.txt` (Author + Acknowledgments + Stack)
- **LoC-Diff:** ~20 LoC
- **Test-Gates:**
  - `curl /humans.txt` 200

**Sprint-3-Verification:**
- `npm run check` + `npx vitest run` + `npm run lint:question-headers` + `npm run audit:alt-text` + `npm run audit:word-count` alle exit 0
- Lighthouse-CI grün auf 3 Sample-URLs
- Schema-Drift-CI grün
- `pnpm build` produziert: 72 Tool-Pages + Author-Page + RSS-Feeds + Sitemap mit lastmod + security.txt + humans.txt

---

## Out-of-Scope — Phase 2+ (P2-Items aus Mega-Research)

Folgende Tasks werden EXPLICIT NICHT in diese 3 Sprints gepackt — sie warten auf Phase 2 (AdSense + Analytics):
- `aggregateRating`-Pipeline (User-Reviews-Backend nötig)
- Trustpilot/G2/Capterra-Profile (Marketing-Operation)
- Reddit/HN/ProductHunt-Launch
- GSC-API-Pull-Routine (braucht Live-Domain + GSC-Verifikation)
- First-Person-Listicle-Pages
- Sitemap-Split (erst bei ≥500 Tools)
- Per-Tool `dateModified` aus Git-History (kommt erst wenn manuelle Frontmatter-Wartung schmerzt)
- Tool-Like-Counter / Ratings-Widget

---

## Verification — Sprint-übergreifend

Nach Sprint 3:
- alle 72 Tool-Pages haben: SoftwareApplication+WebApplication-Schema, Person-creator-Verbindung, FAQPage, HowTo, BreadcrumbList, dateModified, datePublished, sichtbare Breadcrumbs, sichtbares "Zuletzt aktualisiert"
- globale Layer: Organization (mit sameAs), WebSite (mit SearchAction + speakable)
- Trust-Files: robots.txt ✅, llms.txt ✅, llms-full.txt ✅, security.txt ✅, humans.txt ✅
- CI-Guards: Lighthouse, Schema-Drift, Question-Header-Lint, Alt-Text-Audit, Word-Count-Audit
- 1 neue Page: /de/ueber + /en/about (mit Person-Schema)
- 2 neue Feeds: /rss.xml + /de/rss.xml
- ~15 % Content-Layer-Migration (Stat-Block + featureList + Question-Headers für ~10-30 Tools, rest läuft als Q2-Carry-over)

**Erwarteter SEO/GEO-Impact (qualitative Schätzung, basierend auf SE Ranking + Princeton + Seer Interactive Studien):**
- Citation-Wahrscheinlichkeit pro Tool +30-50 % (Freshness + Stats + Author kombiniert)
- klassisches Google-Ranking +0-1 Position (E-E-A-T + Schema-Cleanup)
- AI-Overview-Inclusion: messbar erst nach 4-8 Wochen Crawl-Cycle

**Priorität wenn nur EIN Sprint möglich:** Sprint 1. Sprint 2 + 3 sind Multipliers, Sprint 1 ist die Basis.
