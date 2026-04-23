# SEO-GEO-GUIDE (v1.0, 2026-04-23)

> **Zweck:** Single-Source-of-Truth für Suchmaschinen-Optimierung (Google, Bing) UND Generative-Engine-Optimization (Perplexity, ChatGPT-Search, Claude Web, Google AI-Overviews, Brave, You.com). Der **SEO-GEO-Strategist** prüft gegen diese Rubrik vor jedem Tool-Ship, der **SEO-GEO-Monitor** trackt Rankings + AI-Citations post-launch.
>
> **Status:** binding für jeden `tool-build`-Ticket ab Aktivierung (Batch 4, dieser Migration). Verstöße gegen §1–§4 sind `fail`, §5 ist `soft-warning`.

## §1. Klassische SEO — Pre-Publish-Pflichten

### §1.1 Title / H1 / Meta-Description (Length + Keyword-Placement)

| Feld | Länge | Regel | Rulebook-Anchor |
|---|---|---|---|
| `<title>` / `headingHtml` Text | ≤60 chars, Primary-Keyword in ersten 40 chars | Ein `<em>` um das Ziel-Substantiv, Wortwiederholung minimieren | CONTENT.md §13.1 |
| `metaDescription` | 140–160 chars (hard) | Primary-Keyword im ersten Satz, Call-to-Action-Verb | CONTENT.md §13.1, Zod-Schema |
| H1 im Body | 1× pro Seite, entspricht `headingHtml` | Kein Duplikat mit `<title>` — `<title>` ist Tool-Name-Variante, H1 ist Aktions-Variante | CONTENT.md §13.2 |

### §1.2 URL-Slug

- Lowercase, nur `a-z0-9-`, keine Umlaute (DE: `meter-zu-fuss` statt `meter-zu-fuß`, EN: `meters-to-feet`)
- Primary-Keyword + Direction: `<unit-a>-zu-<unit-b>` für Konverter, `<tool-action>-<object>` für Generator/Formatter
- Max 50 chars. Länger → CEO-Approval nötig.
- Einzahl/Mehrzahl locale-spezifisch: DE `meter`, EN `meters`, ES `metros`, FR `mètres-en-pieds`, PT `metros-para-pes`.

### §1.3 Schema.org JSON-LD — Pflicht-Paket

Jede Tool-Seite MUSS drei Schema-Typen als `application/ld+json` im `<head>` tragen:

1. **WebApplication** — Name, Description, ApplicationCategory (`UtilityApplication`), OperatingSystem (`Any`), offers.price=0, featureList[] aus `features`-Frontmatter
2. **FAQPage** — aus den H2-Fragen des Contents (automatisch, via `schema-markup`-Skill)
3. **BreadcrumbList** — Home › Werkzeuge › `<Kategorie>` › `<Tool-Name>`

Zusätzlich (Pflicht bei passendem Tool-Typ):
- **QAPage** — wenn Tool primär Fragen beantwortet (z.B. „Was ist HEX?", Hex-RGB-Konverter)
- **HowTo** — wenn Content ≥1 nummerierte Anleitung hat (optional, `howTo`-Frontmatter-Bool)
- **SoftwareApplication** — für Code-Tools (parallel zu WebApplication, NICHT statt)
- **Dataset** — für Konstanten-Tools (z.B. "Römische Zahlen-Liste") mit `distribution[]`

Enrichment automatisiert durch **Schema-Markup-Enricher** (Agent 23).

### §1.4 Canonical + hreflang + Sitemap

- Canonical: `<link rel="canonical" href="https://konverter-7qc.pages.dev/<lang>/<slug>/">`
- hreflang bidirectional — `<link rel="alternate" hreflang="<lang>" href="…">` für alle übersetzten Sprachen + `x-default` → DE
- Phase 1: nur `hreflang="de"` + `x-default`. Ab Phase 3: EN/ES/FR/PT-BR bidirektional.
- Sitemap-Priority: `category=length|weight|area|volume|temperature|distance` → 0.8; Rest → 0.6. Start-Page = 1.0.
- Sitemap-Frequency: `weekly` für Content-Änderungen, `monthly` für stabile Tools.

### §1.5 Internal-Linking-Strategy

**Topic-Cluster-Pattern (Silo-Architecture):**
- Pillar-Page pro Kategorie (`/de/laenge/`, `/de/gewicht/`, …) aggregiert alle Tools ihrer Kategorie
- Tool-Detail-Seiten verlinken auf Pillar + auf ≥2 Sibling-Tools (Related-Bar + You-Might-Strip)
- Anchor-Text-Diversifikation: keine wortgleichen Anker zwischen Tool A → Tool B und Tool A → Tool C. Variation-Liste in `internal-links-manifest.json` (Agent 19 pflegt)

**Pflicht-Link-Patterns:**
- Prose-Link-Closer (letzte H2 = `## Verwandte <Kat>-Tools` + 3 Bullet-Links) — CONTENT.md §13.3
- Related-Bar (Chip-Row unterhalb Tool-UI, max 6 Chips) — DESIGN.md §5
- You-Might-Strip (Card-Row am Content-Ende, max 3 Karten) — DESIGN.md §5

### §1.6 Image-SEO

- `alt`-Text: beschreibend, enthält Primary-Keyword WENN relevant (nicht stuffed)
- Filename: `<tool-slug>-<context>.<ext>` (z.B. `meter-zu-fuss-hero.webp`)
- Format: AVIF first (mit WebP-Fallback via `<picture>`), JPG/PNG nur Legacy
- `loading="lazy"` außer Hero (Hero = `loading="eager" fetchpriority="high"`)
- `srcset` für Retina + Responsive (320w / 640w / 1024w / 1920w)
- LQIP (Low-Quality-Image-Placeholder) als inline-base64 für Above-Fold

### §1.7 Sitemap + robots.txt + llms.txt

- `sitemap.xml` auto-generiert, eine Zeile pro Tool × Sprache
- `robots.txt` erlaubt alle Crawler, blockt `/api/*` (falls je)
- `llms.txt` (neu 2026, NEU-Konvention) im Root — Struktur:
  ```
  # Konverter Webseite
  > Multilinguale Konverter-Tool-Sammlung (200+ Tools), pure-client, DSGVO-konform, MIT.

  ## Core Tools
  - [Meter zu Fuß](/de/meter-zu-fuss/) — Längenumrechnung mit Präzisionsschieber
  - [Hex zu RGB](/de/hex-rgb-konverter/) — Farb-Konverter mit Palette-Extractor
  …

  ## Daten-Primärquellen
  - NIST SI-Brochure (BIPM)
  - ISO 80000 Quantities and Units
  ```
  Zweck: explizite Guidance für LLMs, welche Pfade primärer Content sind. Wird von Claude, ChatGPT, Perplexity gelesen.

## §2. GEO — Generative Engine Optimization (AI-SERPs)

### §2.1 LLM-Extractability-Patterns

LLMs extrahieren Passagen nach Mustern, nicht nach Keyword-Dichte. Pflicht-Patterns für jeden Content-Block:

**A) Inverted Pyramid im ersten Absatz:**
- Satz 1: Direkte Antwort auf Primary-Query (≤20 Wörter)
- Satz 2: Formel oder Konstante oder einziger Hauptfakt
- Satz 3: Übergang zur Deep-Dive-Struktur

**B) Definitionen als eigenständige Sätze:**
- Pattern `<Term> ist/sind <Definition> (<Einheit> <Kontext>).`
- Beispiel: „Ein Fuß ist eine angloamerikanische Längeneinheit (0,3048 Meter exakt seit 1959)."
- Schlecht: „Der Fuß — lange Geschichte, unterschiedliche Varianten — wird heute …"

**C) Vergleiche in Tabellenform, nicht im Fließtext:**
- LLMs extrahieren Tabellen mit ≥90% Treffsicherheit, Fließtext-Vergleiche <40%
- Pflicht bei Tools die ≥2 Varianten haben (z.B. „Imperial vs. International Foot"): Markdown-Tabelle, min 3 Spalten (Variante/Wert/Quelle/Jahr)

**D) Numerische Beispiele mit einheitlichem Pattern:**
- `<Input> <Einheit-A> entspricht <Output> <Einheit-B>.`
- Exakt 3 Beispiele pro Tool (klein/mittel/groß), in einer eigenen H3 „Beispiele" gebündelt

**E) FAQ-Antworten als self-contained Passages:**
- Jede Antwort MUSS ohne die Frage als Kontext verständlich sein (LLMs lesen oft nur die Antwort)
- Pattern: Antwort beginnt mit Subject-Repeat — „Die Umrechnung von Meter zu Fuß erfolgt …"

### §2.2 Citation-Magnet-Content

Pro Kategorie MUSS ≥1 **Pillar-Article** existieren, der originelle, zitierbare Daten trägt:

- **Konkurrenz-Vergleichs-Tabelle** (getestet von uns am `<Datum>`, mit Methodik-Block) — LLMs lieben diese, weil primär-sourced
- **Historische Zeitleiste** (z.B. „Evolution der Einheit Fuß 1195 → 2026")
- **Formel-Sammlung** (z.B. „15 Umrechnungsformeln Längeneinheiten, mit Beispielen")
- **Präzisions-Benchmark** (eigene Messreihe, Methodik transparent)

Diese Pillar-Articles werden vom **SEO-GEO-Strategist** geplant und vom **Competitor-Watcher** + **Analytics-Interpreter** jährlich auf Aktualität geprüft.

### §2.3 E-E-A-T — Experience, Expertise, Authority, Trust

Pflicht-Signals auf jeder Tool-Seite:

| Signal | Umsetzung |
|---|---|
| **Experience** | Changelog-Footer („Zuletzt aktualisiert: <ISO-Datum>, geprüft von: pkcut-lab") |
| **Expertise** | Author-Info im Footer (Name/Pseudonym, ≥1 Credential wenn vorhanden, Kontakt) |
| **Authority** | Primärquellen im Content verlinkt (NIST, BIPM, ISO, IETF, W3C für Tech-Tools) |
| **Trust** | HTTPS + Impressum + Datenschutz + Privacy-Badge („Alle Berechnungen im Browser — keine Server-Uploads") |

`schema.org/Person` im `author`-Feld des WebApplication-JSON-LD + `sameAs` auf GitHub-Profil.

### §2.4 AI-SERP-Visibility-Targets

Messbare Ziele für jede Tool-Seite (SEO-GEO-Monitor trackt):

| Engine | Primärer Erfolgs-Signal | Baseline-Ziel (Phase 2) |
|---|---|---|
| **Perplexity** | Tool zitiert in Antwort auf Primary-Query | ≥30% Zitier-Rate bei Top-10-Queries nach 90d |
| **ChatGPT-Search** | Tool in Quellen-Liste | ≥20% nach 90d |
| **Google AI-Overview** | Tool-Passage in Overview | ≥15% nach 180d (höhere Hürde) |
| **Claude Web** | Tool zitiert wenn aktiviert | ≥25% nach 90d |
| **Brave + You.com** | Top-10 SERP-Rank | ≥40% nach 60d |

Messung: Wöchentlicher Run via Perplexity-API (frei 5 req/min), Brave-Search-API (2k req/month frei), direkte Query-Simulation in ChatGPT/Claude (Playwright-Automation gegen öffentliche Chat-UIs — nicht gegen Paid-APIs).

### §2.5 Structured Data for AI

- `schema.org/QAPage` wo möglich (nicht nur FAQPage) — QAPage hat `acceptedAnswer.Answer.text` der direkt extrahiert wird
- `schema.org/HowTo` mit `step[]` + `supply[]` + `tool[]` — LLMs nutzen das für step-by-step Antworten
- `schema.org/ClaimReview` für Vergleichs-Content (Konkurrenz-Tabellen) — signalisiert Fact-Check
- `schema.org/LearningResource` für Edukativ-Content (Pillar-Articles)

## §3. Content-Strategie — Topic Clusters

### §3.1 Pillar + Cluster-Pages

- **Pillar-Page** = Kategorie-Hub (`/de/laenge/`) — 2000–4000 Wörter, deckt alle Unter-Themen ab, verlinkt zu allen Cluster-Pages
- **Cluster-Pages** = Einzelne Tool-Seiten — 300–600 Wörter, fokussieren ein spezifisches Problem, verlinken zurück auf Pillar
- Internal-Links: Pillar → alle Cluster (bi-direktional); Cluster → Pillar (Pflicht) + ≥2 Siblings (Related-Bar)

### §3.2 Keyword-Cluster-Mapping

Pro Tool ein **Keyword-Blueprint** im Dossier §6:
- **Primary Keyword:** 1× (höchste Suchintention)
- **Secondary Keywords:** 3–5 (verwandte Intentionen, Long-Tail)
- **People-Also-Ask-Fragen:** 5–10 (als FAQ-H2-Kandidaten)
- **Related-Searches:** 3–5 (als Content-Section-Kandidaten)
- **Negative Keywords:** Queries, für die wir NICHT ranken wollen (z.B. „meter zu fuß rechner kostenlos" wenn Produkt premium wäre — hier: keine Negatives, alles gratis)

### §3.3 Content-Frische

- Pillar-Pages: Rewrite-Cycle 180d
- Cluster-Pages: Rewrite-Cycle 365d (Längeneinheiten) / 180d (Format-Tools) / 90d (Crypto/Finance)
- Changelog-Footer auf JEDER Seite mit ISO-Last-Modified
- `content-refresher`-Agent (26) erkennt Stale-Content und öffnet Refresh-Tickets

## §4. Technical SEO — Hard-Gates

| Check | Threshold | Rulebook-Anchor |
|---|---|---|
| Core-Web-Vitals LCP | ≤2.5s (mobile 4G-sim) | PERFORMANCE-BUDGET.md §1 |
| Core-Web-Vitals INP | ≤200ms | PERFORMANCE-BUDGET.md §1 |
| Core-Web-Vitals CLS | ≤0.1 | PERFORMANCE-BUDGET.md §1 |
| Lighthouse SEO Score | ≥95 | PERFORMANCE-BUDGET.md §2 |
| robots.txt reachable | HTTP 200 | §1.7 |
| sitemap.xml reachable | HTTP 200, valid XML | §1.7 |
| llms.txt reachable | HTTP 200 | §1.7 |
| Schema.org validator | 0 errors | §1.3 |
| Mobile-Friendly (Google Test) | pass | §4 |
| HTTPS + HSTS-Header | HSTS max-age ≥31536000 | §2.3 Trust |

## §5. Soft-Warnings (nicht fail, aber im Digest loggen)

- Title enthält Emojis (E-E-A-T-Signal-Schwäche, ChatGPT ignoriert teilweise Emojis)
- Mehr als 2 H1s auf einer Seite
- Meta-Description ohne CTA-Verb
- Internal-Link-Anchor-Text identisch zu Tool-Name (Over-Optimization-Risk)
- Keine Author-Box
- Pillar-Article älter 180d ohne Review
- Fehlendes `schema.org/datePublished` + `dateModified`

## §6. Output-Format SEO-GEO-Report

SEO-GEO-Strategist schreibt vor Ship nach `tasks/awaiting-critics/<ticket-id>/seo-geo-strategist.md`:

```yaml
---
evidence_report_version: 1
ticket_id: <ticket-id>
tool_slug: <slug>
language: <lang>
critic: seo-geo-strategist
critic_version: 1.0
verdict: <pass|fail|partial>
total_checks: 24          # §1 15 + §2 9
passed: <count>
failed: <count>
warnings: <count>

primary_keyword: <string>
secondary_keywords: [list]
paa_coverage: <n-of-5>
llm_extractability_score: <0-10>   # aus §2.1 A-E checklist
eeat_completeness: <0-4>           # aus §2.3
citation_magnet_refs: [list]       # Pillar-Articles dieser Kategorie

tokens_in: <count>
tokens_out: <count>
duration_ms: <ms>
checks:
  - id: 1.1-title
    name: Title-Length + Primary-Keyword
    rulebook_ref: SEO-GEO-GUIDE.md §1.1
    status: pass|fail|warning
    evidence: "<substring or measurement>"
    reason: <1-2 sentences>
    fix_hint: <copy-paste-ready>
  # … 24 checks total
---
```

## §7. Change-Management

Änderungen an §1–§4 brauchen User-Approval-Ticket (Rulebook-Change, wie CLAUDE.md §18). Neue AI-SERPs (§2.4) dürfen vom **SEO-GEO-Monitor** nach Routine-Beobachtung vorgeschlagen werden — via `inbox/to-user/seo-geo-trend-<YYYY-MM-DD>.md`, nicht eigenmächtig.

## §8. Referenzen

- `STYLE.md` §SEO-Schema (Basis JSON-LD)
- `CONTENT.md` §13 (Frontmatter)
- `PERFORMANCE-BUDGET.md` (CWV)
- `docs/paperclip/DOSSIER_REPORT.md` §6 (Keyword-Felder)
- Google Search Central — Crawling & Indexing (https://developers.google.com/search)
- Perplexity Publisher Guidelines (public, 2026-Q1)
- llms.txt Proposal (https://llmstxt.org, 2024-09)
- schema.org (https://schema.org)
