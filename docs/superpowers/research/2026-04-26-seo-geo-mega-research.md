# SEO + GEO Mega-Research 2026 — kittokit.com

**Author:** SEO/GEO-Mega-Research-Agent · **Datum:** 2026-04-26 · **Working dir:** `c:\Users\carin\.gemini\Konverter Webseite`

**Quellen-Mix:** 5 NotebookLM-Notebooks (104 + 60 + 11 + 34 + 1 Quellen, ~210 Quellen kuratiert), vorheriger Code-Audit (`2026-04-26-seo-geo-deep-research.md`), aktueller Code-Stand (`BaseLayout.astro`, `tool-jsonld.ts`, `astro.config.mjs`, `public/robots.txt`, `public/llms.txt`, `public/llms-full.txt`, `src/pages/[lang]/[slug].astro`).

**Phase 2 (eigener Deep-Research-Notebook):** ❌ FEHLGESCHLAGEN. `mcp__notebooklm__research_start` wirft beide Versuche (deep + fast) "Google API error code 3 (unknown)". Konsolidierung deshalb auf 5 bestehende Notebooks gestützt — diese decken den Recherche-Korridor (15-Faktoren-On-Page, GEO-Strukturen, Schema, Multilingual, Crawler, Maintenance-Workflows) ab. Bei Bedarf in 24 h erneut versuchen.

---

## TL;DR — Top 10 Aktionen, priorisiert

| # | Aktion | Prio | Impact (qualitativ) | Aufwand | Status IST |
|---|--------|------|---------------------|---------|-----------|
| 1 | **Per-Tool `dateModified`/`datePublished` in `SoftwareApplication`-Schema + sichtbar in der UI** ("Zuletzt geprüft: …") | **P0** | sehr hoch — Freshness ist der stärkste 2026-Citation-Treiber für ChatGPT/Perplexity (Quelle: Notebook 1, SE Ranking 11/2025: "Content updated in the past three months averages 6 citations versus 3.6 for outdated pages") | S — 1 Frontmatter-Field + JSON-LD-Patch + UI-Stamp | ❌ fehlt komplett |
| 2 | **`Person`/`Organization`-Author-Block + sichtbare About-/Author-Page** | **P0** | hoch — E-E-A-T-Experience ist 2026 Rang-1-Signal; Notebook 2: "78% of users actively seek content with identifiable human authors" | M — 1 Astro-Page + Schema-Erweiterung + author-Frontmatter | ❌ fehlt |
| 3 | **Sichtbare Stat-Block-Mini-Sektion pro Tool** ("Verarbeitet 100 MB in <2 s · läuft auf 4 Browser-Engines · 0 Server-Roundtrips") | **P0** | sehr hoch — "Citation-Magnet"-Fakten sind Top-2-Hebel laut Notebook 1+3 (Princeton/Georgia-Tech-Studie: +30–40% Citation-Rate durch Statistiken) | S — 1 Tool-Frontmatter-Field + Render-Snippet | ❌ fehlt; Big-Number-Pattern existiert (Comparer/Analyzer) ist aber nicht systematisch in jedem Tool-Hero |
| 4 | **`@graph`-Konsolidierung der per-Tool-JSON-LD-Blöcke + `mainEntityOfPage`-Backlink** | P0 | mittel — vereinfacht Crawler-Parsing, stärkt Entity-Verknüpfung; Notebook 4: "@graph lets you include multiple schema entities in a single snippet" | XS — `tool-jsonld.ts` refactor | ❌ Blöcke sind heute lose nebeneinander |
| 5 | **`security.txt` (RFC 9116) anlegen** | P0 | mittel-niedrig (Trust-Signal) — Eintrittskarte für Penetration-Testers + Bug-Bounty-Platforms; macht "wir sind seriös" maschinenlesbar | XS — 1 Datei | ❌ fehlt |
| 6 | **Question-Headers + Answer-First-Block** in jedem Tool-Article (40-60 Wörter direkte Antwort unter H1, vor Inhalts-Tiefe) | P0 | hoch — von 5/5 Notebooks bestätigtes Top-3-GEO-Signal | M — Content-Refactor 72 Tools (Migration-Skript möglich) | ⚠️ teilweise: `intro` existiert, aber keine 40-60-Wort-Garantie + keine `<h2>`-als-Frage-Konvention erzwungen |
| 7 | **Author-Page mit `Person`-Schema + `sameAs` zu Wikidata/LinkedIn/GitHub** | P0 | hoch — Entity-Disambiguation für AI-Crawler; Notebook 4 Top-Recommendation | S — 1 Page + Schema | ❌ |
| 8 | **`speakable`-Schema-Property** auf intro + FAQ-Antworten | P1 | niedrig-mittel (Voice/Audio-Surface, marginal) — Notebook 4-Empfehlung, aber Voice-Surface noch klein | XS — 1 Prop pro JSON-LD-Block | ❌ |
| 9 | **`@type: WebApplication` + `browserRequirements: "Requires JavaScript. Requires HTML5."`** statt nur `SoftwareApplication` | P1 | niedrig — `WebApplication` ist die korrektere Subclass für Browser-Tools, marginales Citation-Signal | XS — 1-Wort-Change in `tool-jsonld.ts` | ⚠️ aktuell `SoftwareApplication` |
| 10 | **Dual-Sitemap (sitemap-index + per-language sitemaps)** mit `lastmod` für jedes Tool | P1 | mittel — kontrolliert Crawl-Budget bei 72→1000 Tools | M — `astro.config.mjs` sitemap-Plugin-Config | ⚠️ Default `@astrojs/sitemap` läuft (45 k Limit reicht), aber kein `lastmod` aus Frontmatter ausgespielt |

**Größter neuer Insight (vs. altem Audit):** Das alte `2026-04-26-seo-geo-deep-research.md` hat alle Schema/Entity-Themen bereits aufgegriffen — und der Code wurde zwischenzeitlich gepatcht (`Organization` + `WebSite` + `SearchAction` LIVE in `BaseLayout.astro`, `robots.txt` + `llms.txt` + `llms-full.txt` LIVE). Was fehlt, sind die **Content-Layer-Hebel** (Freshness-Stamp, Author-Attribution, Citation-Magnet-Stats, Question-Headers) — und die haben laut SE-Ranking-November-2025-Studie (104-Quellen-Notebook) einen **größeren** Citation-Impact als jeder weitere Schema-Block.

---

## Teil 1 — Klassisches SEO (Google/Bing) 2026

### 1.1 Top 25 Ranking-Faktoren (konsolidiert aus Notebook 1 + 5)

| # | Faktor | Schwelle / Standard 2026 | kittokit-IST |
|---|--------|---------------------------|--------------|
| 1 | **INP (Interaction to Next Paint)** | <200 ms (Pflicht), <150 ms (Praxis-Target). 75-Perzentil. (Notebook 1 + altes Audit) | unbekannt — out-of-scope, Lighthouse-CI separat |
| 2 | **LCP** | <2.5 s | unbekannt |
| 3 | **CLS** | <0.1 — Ad-Slot-Container reservieren `300×250` pre-occupy ✅ | ✅ implementiert in `[slug].astro:429` |
| 4 | **FCP** | <0.4 s — Pages mit FCP <0.4 s erhalten **3× mehr ChatGPT-Citations** (SE Ranking 11/2025) | unbekannt |
| 5 | **HTML-Cleanliness / SSR** | Kerninhalt im Roh-HTML lesbar (46 % aller GPTBot-Visits laufen im "Plain Reading Mode" ohne JS) | ✅ Astro SSG liefert reines HTML; interaktive Tools sind Inseln, der gesamte Content (intro/howto/faq/article) ist statisch gerendert |
| 6 | **Helpful Content** | First-Hand-Experience, people-first-purpose | ⚠️ Content ist ok, aber **kein Author-Block** + keine "Tested by"/"Built by"-Attribution |
| 7 | **E-E-A-T-Experience** | Author-Bylines + Author-Page mit Credentials | ❌ |
| 8 | **Title-Tag-Formula** | <60 Zeichen, **First-Person-Hooks** ("Ich habe X getestet …") wirken besser als klassisch-SEO-optimiert (Notebook 1, Trend 2026) | ⚠️ aktuell klassisch (`title` aus Frontmatter); für Utility-Brand legitim, aber Optimierungspotential |
| 9 | **Meta-Description** | <160 Zeichen, Action-Verb + Tool-Output-Versprechen | ✅ `metaDescription` Frontmatter |
| 10 | **Canonical** | self-referencing `<link rel="canonical">` | ✅ `BaseLayout:79` |
| 11 | **hreflang + x-default** | jede Sprache referenziert sich selbst + alle anderen, x-default → DEFAULT | ✅ `hreflang.ts` mustergültig |
| 12 | **Internal Link Depth** | jede Page ≤3 Klicks von Home | ⚠️ unbekannt — Footer + Header verlinken Kategorien, aber keine 3-Klick-Verifikation |
| 13 | **`alt`-Texte (10–15 Wörter)** | beschreibend, keyword-rich | ⚠️ Hero-Images: alt-Text fehlt-Audit nicht durchgeführt |
| 14 | **Sitemap mit `lastmod`** | jeder URL-Eintrag mit ISO-Datum | ⚠️ Default-Plugin liefert lastmod aus File-mtime, aber **nicht aus Frontmatter `dateModified`** |
| 15 | **Breadcrumbs** | sichtbar + `BreadcrumbList`-Schema | ✅ JSON-LD da; **sichtbar in UI fehlt** |
| 16 | **Mobile-First** | responsive, touch-targets ≥44 px | ✅ Tailwind + Tokens |
| 17 | **HTTPS + HSTS** | Pflicht | ✅ Cloudflare Pages |
| 18 | **Author/Organization-Schema** | `Person` + `Organization` + `sameAs` zu Wikidata/LinkedIn | ⚠️ `Organization` da, `Person` fehlt |
| 19 | **`SoftwareApplication`/`WebApplication`** | mit `applicationCategory`, `operatingSystem`, `offers.price=0` | ✅ vorhanden, aber `WebApplication`-Subtype wäre präziser |
| 20 | **`FAQPage`** | structured Q/A | ✅ |
| 21 | **`HowTo`** | step-by-step | ✅ wenn `aside.steps` oder `howToUse` vorhanden |
| 22 | **Content-Freshness** | `dateModified` ≤90 Tage; Notebook 1: "Pages updated in past 3 months avg 6 citations vs. 3.6 outdated" | ❌ kein `dateModified` |
| 23 | **Word-Count** | Pages >2,900 Wörter avg 5.1 ChatGPT-Citations vs. 3.2 für <800 (SE Ranking) | ⚠️ Tool-Articles sind ~300-800 Wörter. Bewusste Wahl (Spec §"kein Thin Content <300"), aber für GEO Untergrenze des Sweet-Spots |
| 24 | **Robots.txt mit Sitemap-Hint** | Pflicht | ✅ |
| 25 | **`max-image-preview:large`** | Pflicht für AI Overviews mit Image-Cards | ✅ `BaseLayout:80` |

### 1.2 Was kittokit BEREITS hat

- ✅ Astro-SSG → 100 % Roh-HTML, kein JS-Rendering-Penalty
- ✅ `Organization` + `WebSite` + `SearchAction` global in `BaseLayout.astro:47-70`
- ✅ Per-Tool `SoftwareApplication` + `BreadcrumbList` + `FAQPage` + optional `HowTo` in `tool-jsonld.ts`
- ✅ Hreflang + x-default + Canonical + Self-Reference (mustergültig — siehe altes Audit Thema 4)
- ✅ Inter + JetBrains Mono self-hosted (DSGVO + LCP-Optimierung)
- ✅ Service-Worker (PWA) mit Workbox-Caching → schnelle Repeat-Visits
- ✅ Cloudflare Web Analytics privacy-first (kein Consent nötig)
- ✅ `robots.txt` ALLOW für Search + Citation + Training Crawlers
- ✅ `llms.txt` + `llms-full.txt` (ist eine der Top-1 %-Optionen 2026 — Anthropic, Cursor, Mintlify shippen es; Effekt low aber Optionswert hoch)
- ✅ Trailing-Slash-Konsistenz (`trailingSlash: 'never'`)
- ✅ `og:type=website` + Twitter Card + per-Tool OG-Image
- ✅ FAQ-Schema bereits Question-Headers in `q:`-Pattern
- ✅ Privacy-Eyebrow ("Läuft lokal · kein Upload") als Trust-Signal über H1
- ✅ Ad-Slot CLS-frei vorreserviert (300×250)

### 1.3 Was kittokit NOCH NICHT hat (Gap-List, priorisiert)

| Gap | Quelle | Prio |
|-----|--------|------|
| **`dateModified` + `datePublished` per Tool** im Frontmatter, JSON-LD und sichtbar in UI ("Zuletzt aktualisiert: 26.04.2026") | Notebook 1 #11 + Notebook 2 #6 | **P0** |
| **`Person`-Author-Schema + Author-Page** (`/de/ueber` mit `Person`-JSON-LD) | Notebook 1 #13 + Notebook 4 | **P0** |
| **Stat-Block in Tool-Hero** (Citation-Magnets) — z.B. `34.000 Konvertierungen · 0 Server-Logs · WebKit/Blink/Gecko getestet` | Notebook 1 #8 + Notebook 3 #5 | **P0** |
| **Question-Headers in Article-H2s** — bisher Frontmatter-`headingHtml` ist eine Aussage; H2 unter "How To" ist aussagebasiert. Konvertieren zu Frage. | Notebook 1 #9 + Notebook 3 #1 | **P0** |
| **Answer-First-Block** unter H1 (40-60 Wörter direkte Antwort) — `intro` in `tool-article` ist zu spät platziert (kommt nach Tool + Ad) | Notebook 1 #1 + Notebook 3 #2 | **P0** |
| **Visible Breadcrumbs** (Schema da, UI fehlt) | Notebook 1 #10 | P1 |
| **`@graph`-Konsolidierung** der 4 JSON-LD-Blöcke pro Tool-Page | Notebook 4 | P1 |
| **`speakable`-Property** auf intro + FAQ | Notebook 4 #3 | P1 |
| **Alt-Text-Audit** Hero-Images (10-15 Wörter, descriptive) | Notebook 1 #12 | P1 |
| **Word-Count-Range-Audit** — definieren ob 800-1.200 oder 2.000+ pro Tool ein realistisches Ziel ist (Trade-off mit "Helpful, kein Filler") | Notebook 1 #6 | P1 |
| **`dateModified`-Sitemap** ausspielen statt File-mtime | Notebook 1 #14 | P1 |
| **First-Person-Hooks** in `<title>` für Best-Of-Listicles (z.B. einer "Beste Konverter 2026"-Page in Phase 2) | Notebook 1 #15 | P2 |
| Per-Tool `aggregateRating` (Phase 2+ wenn Reviews da sind) | Altes Audit G12 | P2 |

---

## Teil 2 — Generative Engine Optimization (AI Search)

### 2.1 Wie wird man von LLMs zitiert (Konsens aus 5 Notebooks)

**Top-7-Treiber 2026 (gewichtet):**

1. **Domain-Authority + Brand-Mentions** — Sites mit >32 k Referring Domains werden 3.5× häufiger zitiert (SE Ranking 11/2025). Sites mit Quora/Reddit-Mentions: 4× höhere Citation-Wahrscheinlichkeit. → Long-Term, Phase 2+
2. **FCP <0.4 s** — 3× mehr Citations als langsame Pages (SE Ranking)
3. **Content-Freshness** — pages updated in past 3 months avg 6 Citations vs. 3.6 (Metehan Yeşilyurt 10/2025: "ChatGPT prioritizes RECENT over PERFECT")
4. **Direct-Answer-Patterns** — erste 40-60 Wörter müssen Primary-Query beantworten (Princeton/Georgia-Tech-Studie)
5. **Question-Headers** — H2/H3 als Frage formuliert vs. Aussage (Semrush-Style)
6. **Statistical Density** — +30-40 % Citation-Rate durch eingebaute Statistiken (Princeton-Studie)
7. **Trustpilot/G2/Capterra-Profil** — Sites mit Reviews-Profil 3× häufiger zitiert (SE Ranking) → Phase 2+

**Plattform-Differenz (Notebook 3):**

| Plattform | Bevorzugt | Hinweis für kittokit |
|-----------|-----------|----------------------|
| **ChatGPT** | strukturierte, autoritative, **kürzere** Antworten — 46 % aller Visits sind "Plain Reading Mode" (kein JS, kein CSS) | SSG liefert das ✅ |
| **Perplexity** | sehr **frische** Quellen + Listen-Format | `dateModified` Pflicht |
| **Google AI Overviews** | hoch-rangige Pages (Benford's Law of Prominence) + Featured-Snippet-Format | klassisches SEO bleibt Pflicht |
| **Claude** | "Reasoning Readiness" + Entity-Klarheit + transparente Author-Attribution | `Person`-Schema P0 |
| **Gemini AI Mode** | Frage-basierte H2/H3 + Anschlussfragen-Coverage | FAQ-Coverage erweitern |

### 2.2 Crawler-Strategie (Allow/Block-Matrix)

**kittokit-Position: Default ALLOW** (User-Direktive, dokumentiert in `robots.txt`).

| Bot-Familie | Beispiele | Action | Begründung |
|-------------|-----------|--------|------------|
| Search-/Citation-Crawler | OAI-SearchBot, Claude-SearchBot, PerplexityBot, ChatGPT-User, Perplexity-User, Claude-User, Google-Extended, Applebot-Extended | ALLOW | direkter attribuierter Traffic + Brand-Building |
| Training-Crawler | GPTBot, ClaudeBot, anthropic-ai, CCBot, Bytespider, Meta-ExternalAgent, cohere-ai | ALLOW (kontrovers) | Brand-Entity in Foundation-Models bauen; kein Premium-Content; Re-eval nach Phase 2 |
| Klassische Search | Googlebot, Bingbot, DuckDuckBot | ALLOW | Pflicht |

**Re-Eval-Trigger:** Wenn in 6 Monaten Server-Logs zeigen, dass Training-Crawler >40 % der Bandbreite verschlingen ohne SearchBot-Traffic — dann selektiv `Disallow` für GPTBot/CCBot/Bytespider. Aktuell kostenlos zu erlauben.

### 2.3 Was kittokit bereits hat / Gap-Liste

✅ **Vorhanden:**
- robots.txt mit ALLOW für alle 14 relevanten AI-Bots
- llms.txt + llms-full.txt im Anthropic/Mintlify-Standard
- SSG → keine JS-Walls
- Question-Pattern in FAQ-Frontmatter
- Privacy-Eyebrow + Brand-Voice konsistent
- WebSite-Schema mit SearchAction (Sitelinks-Searchbox-Eligibility)

❌ **Gap (P0):**
- **kein `dateModified`** auf Tool-Pages → Freshness-Signal fehlt
- **kein Author-Block** → Claude/ChatGPT filtern anonyme Mass-Content zunehmend
- **kein Stat-Block** → Citation-Magnet-Mechanik ungenutzt
- **Answer-First-Block-Position falsch** — `intro` kommt erst NACH dem Tool + Ad-Slot, also weit unter dem Fold. AI-Crawler scrollen aber nicht — sie nehmen die Top-Chunks. → `intro` muss VOR das Tool oder zumindest direkt unter `<h1>` (Hero-Tagline-Slot wäre die richtige Position)

⚠️ **Gap (P1):**
- Article-H2 ist klassisch ("Wie verwende ich den Konverter?") — bereits frage-basiert ✅, aber inkonsistent durchgesetzt
- `speakable`-Schema fehlt
- `@graph`-Bündelung fehlt

---

## Teil 3 — Schema.org Best Practices 2026

### 3.1 Aktueller Stand pro Tool-Type

`tool-jsonld.ts` mappt:
- `dev` → `DeveloperApplication`
- `text/time/document/length/weight/area/volume/distance/temperature` → `UtilitiesApplication`
- `color` → `DesignApplication`
- `image/video/audio` → `MultimediaApplication`

→ Mapping ist **state-of-the-art**, keine Änderung nötig.

### 3.2 Pro Tool-Type — Empfehlung 2026

| Tool-Type | Aktuelles Schema | 2026-Empfehlung |
|-----------|-----------------|-----------------|
| **Converter** (meter-zu-fuss, kg-zu-pfund …) | `SoftwareApplication` + `HowTo` + `FAQPage` | + `mathSolver`-Erwähnung in `description`, + `inLanguage` ✅ vorhanden, + `dateModified` |
| **Calculator** (Rechner) | `SoftwareApplication` + `FAQPage` | + `applicationSubCategory: "Calculator"`, + `featureList: [...]` (Output-Liste), + `dateModified` |
| **Generator** (QR, UUID, Passwort) | `SoftwareApplication` | + `creator: { @type: "Person", name: "…" }` + `creativeWorkStatus: "Published"` |
| **Formatter** (JSON, SQL, XML) | `SoftwareApplication` | + `programmingLanguage: ["JSON", "SQL", "XML"]` (Schema.org-valid für DeveloperApplication) |
| **Validator** (Hex, Regex) | `SoftwareApplication` | + `softwareRequirements: "Modern browser"` |
| **Analyzer** (Diff, Bild-Diff) | `SoftwareApplication` | + `featureList` + `mainEntityOfPage` |
| **File-Tool** (PDF, Image, Video) | `SoftwareApplication` | + `fileFormat: ["application/pdf", ...]` (akzeptierte Inputs) |

### 3.3 Hochgewichtete neue Properties 2026 (Notebook 4)

| Property | Use-Case | Aufwand |
|----------|----------|---------|
| **`@graph`** | bündelt SoftwareApplication + BreadcrumbList + FAQPage + HowTo in **einem** JSON-LD-Block — verstärkt semantische Verknüpfung | XS |
| **`mainEntityOfPage`** | Backlink von `SoftwareApplication` auf die Page-URL | XS |
| **`sameAs`** | für `Organization` (kittokit) + `Person` (Author) → Wikidata/LinkedIn/GitHub-IDs | XS |
| **`speakable`** | markiert intro + FAQ-Antworten als für Voice-/Audio-Surface geeignet | XS |
| **`creator` / `author`** | Tool-Pages bekommen `Person`-Author-Verbindung | XS |
| **`dateModified` / `datePublished`** | Pflicht für Freshness-Signal | XS (im Schema), S (Frontmatter+UI) |
| **`featureList`** | Bullet-List der Tool-Capabilities — direkt zitierfähig durch LLMs | XS |
| **`applicationSubCategory`** | Sub-Kategorie unter `applicationCategory` — semantische Präzision | XS |

### 3.4 Was kittokit hat / Gap

✅ Mustergültig: `SoftwareApplication`, `BreadcrumbList`, `FAQPage`, `HowTo`, `Organization`, `WebSite`, `SearchAction`

❌ Fehlt: `Person`/`creator`, `dateModified`, `speakable`, `@graph`, `featureList`, `mainEntityOfPage`, `sameAs` (auf `Organization` ist `sameAs: []` leer in `BaseLayout:54`)

---

## Teil 4 — Multilinguale SEO

### 4.1 Status — bereits mustergültig (siehe altes Audit Thema 4)

- ✅ Self-Reference per Sprache
- ✅ Symmetrie zwischen allen `ACTIVE_LANGUAGES`
- ✅ `x-default → DEFAULT_LANGUAGE='de'`
- ✅ Subdirectory-Pattern `/de/<slug>` (vs. Subdomain — richtige Wahl für neue Sites, Link-Equity bleibt im Domain-Pool)
- ✅ ISO 639-1 Codes
- ✅ Trailing-Slash konsistent strict-`never`

### 4.2 Notebook-Insights für Phase 3 (EN/ES/FR/PT-BR)

- **Übersetzte Sites haben +327 % Visibility in AI Overviews** (Weglot 10/2025) → Phase 3 lohnt sich massiv
- **Slug-per-Language** ist 2026 Pflicht (kittokit hat das ✅ via `slug-map.ts`)
- **`og:locale` per Language** ✅ implementiert in `BaseLayout:84`
- **Hreflang in XML-Sitemap** zusätzlich zum HTML ist optional, aber redundancy-positive — `@astrojs/sitemap` macht das standardmäßig

### 4.3 Gap

- **Hreflang in Sitemap** auditieren — Default-Plugin-Verhalten verifizieren
- Bei Phase 3: `i18nManifest`-Property auf `WebSite`-Schema hinzufügen (Schema.org-Spec, niedriger Impact aber sauber)

---

## Teil 5 — Performance + Trust (CWV, Imprint, security.txt)

### 5.1 Core Web Vitals 2026

Die Schwellen aus 2024 stehen weiter:

| Metric | Good | Bad | kittokit-IST |
|--------|------|-----|--------------|
| LCP | <2.5 s | >4 s | unbekannt |
| INP | <200 ms | >500 ms | unbekannt |
| CLS | <0.1 | >0.25 | ✅ Ad-Slot pre-occupy + Font-Display + Hero-Image-Slot |
| FCP | <1.8 s | >3 s | unbekannt — **<0.4 s als Stretch-Goal für GEO-Citations** |

→ Lighthouse-CI-Audit als separater Task. Out-of-scope für Research-Pass.

### 5.2 Trust-Signale (Notebook 1 + 5)

| Signal | Zweck | kittokit-IST |
|--------|-------|--------------|
| **Imprint/Impressum** | DSGVO-Pflicht in DE | ⚠️ unbekannt — nicht in dieser Research-Session verifiziert |
| **Datenschutz/Privacy-Policy** | DSGVO + AI-Crawler-Vertrauen | ⚠️ unbekannt |
| **About-/Author-Page** | E-E-A-T + Person-Schema-Träger | ❌ |
| **`security.txt` (RFC 9116)** | maschinenlesbarer Security-Contact | ❌ |
| **`humans.txt`** | optional, low-cost Brand-Signal | ❌ |
| **Footer mit Kontakt-Link** | Trust + Legal | ⚠️ Footer existiert, Link-Coverage prüfen |

### 5.3 Gap

- **`security.txt`** in `public/security.txt` mit Contact-Email + Expires-Date → **P0** (XS-Aufwand)
- **About-/Über-Page** mit Author-Bio + `Person`-Schema → **P0** (S-Aufwand)
- Imprint + Datenschutz: vermutlich vorhanden (DSGVO-Pflicht) — verifizieren in Implementation-Session

---

## Teil 6 — Roadmap (P0/P1/P2)

### Sortierung-Logik

**P0** = sofort, hoher Impact, niedriger Aufwand, blockiert keine andere Arbeit. Können in einer 1-Wochen-Sprint-Iteration alle erledigt werden.
**P1** = Q2 2026, mittlerer Impact oder höherer Aufwand. Brauchen Code-Refactor oder Content-Migration.
**P2** = Phase 2+ — abhängig von Reviews, Analytics, Backlinks.

### Roadmap-Tabelle

| Prio | Task | Files (vermutet) | Impact | Effort | Owner |
|------|------|-------------------|--------|--------|-------|
| P0 | `dateModified` + `datePublished` Frontmatter-Field hinzufügen, in `tool-jsonld.ts` schreiben, sichtbar im Tool-Hero ("Zuletzt aktualisiert: 26.04.2026") | `src/content/config.ts`, `src/lib/seo/tool-jsonld.ts`, `src/pages/[lang]/[slug].astro`, alle 72 `*.mdx` | **sehr hoch** (Freshness Top-2 Citation-Treiber) | S (~80 LoC + Frontmatter-Migration via Skript) | dev |
| P0 | Author-Page `/de/ueber` + `/en/about` mit `Person`-JSON-LD + `sameAs` zu Wikidata/LinkedIn/GitHub | `src/pages/de/ueber.astro`, `src/pages/en/about.astro`, neue String-Keys in `i18n/strings.ts` | **hoch** (E-E-A-T Top-Signal) | M (~150 LoC + Content) | dev + content |
| P0 | `Person`/`creator`-Block in per-Tool-JSON-LD verlinken | `src/lib/seo/tool-jsonld.ts` | **hoch** | XS (~10 LoC) | dev |
| P0 | Stat-Block-Komponente `<ToolStats>` in Tool-Hero (3-4 zitierfähige Fakten) — z.B. "Verarbeitet 100 MB in <2 s · 0 Server-Roundtrips · WebKit/Blink/Gecko getestet · MIT-lizenziert" | `src/components/ToolStats.astro`, `src/pages/[lang]/[slug].astro`, optional Frontmatter-Field `stats` | **sehr hoch** (Citation-Magnet) | M (Komponente + Frontmatter-Migration für 72 Tools) | dev + content |
| P0 | Answer-First-`intro` direkt unter H1 platzieren (vor Tool, nicht nach Ad-Slot) | `src/pages/[lang]/[slug].astro` | **sehr hoch** (Top-Chunk für AI-Crawler) | XS (DOM-Reorder, ~15 LoC) | dev |
| P0 | `security.txt` (RFC 9116) mit Contact + Expires | `public/security.txt` | mittel (Trust) | XS (1 Datei) | dev |
| P0 | `Organization.sameAs` befüllen (LinkedIn, GitHub, Mastodon, Wikidata-Item falls existiert) | `src/layouts/BaseLayout.astro:54` | mittel (Entity-Disambiguation) | XS (1 Array) | dev |
| P0 | Question-Header-Konvention erzwingen (Article-H2 als Frage) — Lint-Rule + Migration der 72 Content-Files | `src/content/tools/*.mdx`, optional `scripts/lint-question-headers.mjs` | hoch | M (Migration; Lint XS) | content |
| P1 | `@graph`-Bündelung in `tool-jsonld.ts` | `src/lib/seo/tool-jsonld.ts` | mittel (Schema-Cleanup) | XS (~30 LoC Refactor) | dev |
| P1 | `speakable`-Property auf intro + FAQ | `src/lib/seo/tool-jsonld.ts` | niedrig-mittel | XS (~5 LoC) | dev |
| P1 | `WebApplication`-Subtype + `browserRequirements` | `src/lib/seo/tool-jsonld.ts` | niedrig | XS (~3 LoC) | dev |
| P1 | `featureList` per Tool (Bullet-List der Capabilities) | `src/content/tools/*.mdx`, `src/lib/seo/tool-jsonld.ts` | mittel (zitierfähige Bullets) | M (Frontmatter-Migration) | content |
| P1 | Sichtbare Breadcrumbs in Tool-Hero | `src/components/Breadcrumbs.astro`, `src/pages/[lang]/[slug].astro` | mittel (UX + SEO) | S | dev |
| P1 | `lastmod` aus Frontmatter `dateModified` in Sitemap statt File-mtime | `astro.config.mjs` (sitemap-Plugin-Customize-Pages-Hook) | mittel | S (~30 LoC) | dev |
| P1 | Lighthouse-CI-Setup (INP/LCP/CLS-Monitoring im CI) | `.github/workflows/lighthouse.yml`, `lighthouserc.cjs` | hoch (verhindert CWV-Regression) | M | dev |
| P1 | Alt-Text-Audit für Hero-Images (10-15 Wörter, descriptive) | `src/content/tools/*.mdx`, `src/components/ToolHero.astro` | mittel | M (72 Images × Alt-Text) | content |
| P1 | Word-Count-Audit + Empfehlung pro Tool (Sweet-Spot 800-1.500 Wörter) | `src/content/tools/*.mdx` | mittel-hoch | L (Content-Arbeit) | content |
| P1 | RSS-Feed (`/rss.xml` + `/de/rss.xml`) — Notebook 5 nutzt RSS für Social-Auto-Posting | `src/pages/rss.xml.ts`, `@astrojs/rss` | mittel | S | dev |
| P1 | "Zuletzt aktualisiert"-Stamp im Footer jeder Tool-Page | `src/pages/[lang]/[slug].astro` | mittel (UX-Trust-Signal) | XS | dev |
| P2 | `aggregateRating` per Tool (sobald Reviews/Stars vorhanden) | `src/lib/seo/tool-jsonld.ts` | hoch (Star-Snippets +35 % CTR — Notebook 2) | M (User-Reviews-Pipeline nötig) | dev + Phase 2 |
| P2 | Ratings/Reviews-Mechanik für Tools (Like-Counter im Footer) | neue Komponente + KV-Store | mittel | L | dev |
| P2 | First-Person-Title-Hooks für Listicle-Pages ("Best-Of") in Phase 2 | neue Pages | niedrig-mittel | M | content |
| P2 | Trustpilot/G2/Capterra-Profile aufbauen | extern | hoch (3× Citation-Wahrscheinlichkeit) | L | marketing |
| P2 | Reddit/HN/ProductHunt-Launch-Strategie | extern | sehr hoch (40 % der AI-Citations stammen von UGC — Semrush 12/2025) | L | marketing |
| P2 | GSC-API-Pull-Routine via Claude Code (declining queries detection → auto-refresh-trigger) | `scripts/seo/gsc-decline-monitor.mjs`, Routine via `paperclip` | hoch (Notebook 2 Workflow) | L | dev |
| P2 | Schema-Drift-CI-Check (Rich-Results-Test API auto-validate post-deploy) | `.github/workflows/schema-validate.yml` | mittel (Regression-Schutz) | S | dev |
| P2 | `humans.txt` | `public/humans.txt` | niedrig | XS | dev |
| P2 | Sitemap-Split per Kategorie (wenn ≥500 Tools) | `astro.config.mjs` | niedrig (jetzt) → mittel (später) | S | dev |
| P2 | Per-Tool `dateModified` aus Git-History automatisch ableiten (statt Frontmatter manuell) | `scripts/build/git-date-modified.mjs` | hoch (Maintenance-Killer) | M | dev |

---

## Teil 7 — Bewusste Lücken (was kittokit NICHT bauen sollte)

- **Aggressive AI-Crawler-Blocking** — überstimmt durch User-Direktive ALLOW; Re-Eval erst bei Server-Cost-Trigger
- **Server-side Tool-Rendering** — verletzt Privacy-Spec §7
- **Tracking-without-Consent** — verletzt DSGVO + Brand-Versprechen
- **Bot-Only-Markdown-Clones** der Tool-Pages — John Mueller (11/2025): "Clean HTML works just fine" (Notebook 1)
- **Dezidierter `Article`-Schema** statt `SoftwareApplication` — `SoftwareApplication` ist die korrektere Subclass für Browser-Tools (Adobe Express, Canva nutzen es ebenfalls)
- **AI-generierter Content ohne Author-Review** — Google QRG 1/2025: "Lowest"-Rating für AI-Content "without effort, originality, value"
- **Maximalistische Animations-Effekte** für GEO-Boost (kollidiert mit Refined-Minimalism-Hard-Cap)
- **Mehr als 2 Akzentfarben** (kollidiert mit Design-Canon)

---

## Teil 8 — Re-Evaluation-Trigger

| Trigger | Action |
|---------|--------|
| Phase 2 Analytics-Launch (mit Consent) | echte LLM-Crawl-Daten + AI-Search-Referrals einsehen → P2-Items prioritisieren |
| Tool-Count ≥ 500 | Sitemap-Split pro Kategorie evaluieren |
| Brand-Entity-Check: kittokit in Google Knowledge Panel auftaucht | manuelle SERP-Probe alle 4 Wochen |
| 6 Monate (2026-10-26) | llms.txt-Adoption + Cite-Effekt erneut messen + Phase-2-Notebook neu starten |
| Server-Logs zeigen >40 % Bandbreite an Training-Crawlern | selektives Disallow für GPTBot/CCBot |
| Referring-Domains > 1.000 | Trustpilot/G2-Profile aktiv aufbauen — Citation-Magnetismus aktivieren |
| INP-Failure (>200 ms) im CrUX-Bericht | dedizierter Performance-Sprint |

---

## Teil 9 — Quellen-Konsolidierung (Notebook-Quellen)

Die 5 NotebookLM-Notebooks decken zusammen ~210 unique Quellen ab. Highlights die mehrfach unabhängig zitiert wurden:

- **SE Ranking** (Studie Nov 2025): Ranking-Faktoren-Studie für ChatGPT-Citations — **die meistzitierte Primärquelle** in 2 Notebooks (FCP <0.4 s, Word-Count, Freshness-90-Tage, Domain-Authority-Schwellen)
- **Princeton/Georgia Tech** (10.000-Query-Studie): Direct-Answer + Statistical-Density als Top-Treiber
- **Seer Interactive** (6/2025 + 9/2025): 85 % AI-Overview-Citations aus letzten 2 Jahren; Brands cited in AIO earn +35 % organic clicks +91 % paid clicks
- **John Mueller** (Google, 11/2025): "Clean HTML works just fine" → kein bot-only-Markdown-Clone nötig
- **Metehan Yeşilyurt** (10/2025): "ChatGPT prioritizes RECENT over PERFECT"
- **Surfer SEO** (11/2025): AIO-zitierte Articles haben 62 % mehr Fakten als nicht-zitierte
- **Ahrefs** (12/2025): "Best X" Listicles sind 43.8 % aller ChatGPT-zitierten Page-Types
- **Weglot** (10/2025): translated sites +327 % AI Overview Visibility
- **Semrush + ClickRank**: Schema-Markup als "Trust Layer" / "Fact Validator" für Claude
- **Kevin Indig** (10/2025): G2-Reviews — 10 % more reviews → 2 % more AI citations
- **Liz Reid** (Google VP Search, 10/2025): AI Overviews push expertise + unique perspective; low-quality consensus-content downranked

---

**Phase 2 (eigener Notebook) — Status:** ❌ FEHLGESCHLAGEN. Beide Versuche (`mode=deep` + `mode=fast`) haben "Google API error code 3 (unknown)" zurückgegeben. Ist laut Tool-Doc transient. **Nachfass:** in 24 h erneut versuchen (`mcp__notebooklm__research_start` mit identischem Query). Falls das Notebook angelegt wurde, dann via `mcp__notebooklm__research_status` abrufen + diesen Report als Patch-Update versionieren.

**Output-Files:**
- A) Diese Datei: `docs/superpowers/research/2026-04-26-seo-geo-mega-research.md`
- B) Implementation-Roadmap: `docs/superpowers/plans/2026-04-26-seo-implementation-roadmap.md`
