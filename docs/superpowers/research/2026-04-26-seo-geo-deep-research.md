# Deep SEO + GEO Research — kittokit (2026-04-26)

**Author:** SEO/GEO-Audit-Agent · **Working dir:** `c:\Users\carin\.gemini\Konverter Webseite`

---

## Executive Summary

kittokit hat überraschend starkes SEO-Fundament: BaseLayout liefert OG/Twitter/Canonical/hreflang, jede Tool-Page emittiert bereits 3–4 JSON-LD-Blöcke (`SoftwareApplication` + `BreadcrumbList` + `FAQPage` + optional `HowTo`) via `src/lib/seo/tool-jsonld.ts`. Sitemap läuft via `@astrojs/sitemap` (Default 45k URLs/File, weit unter Bedarf bei 72 Tools). `trailingSlash: 'never'` ist konsistent.

**Größte Lücken (P0):**
1. **`robots.txt` fehlt komplett** → AI-Crawler haben keine Allow-Hints, keine Sitemap-Referenz.
2. **Kein globales `Organization`-/`WebSite`-JSON-LD** → kittokit-Brand-Entity in Knowledge-Graph nicht etabliert (Entity-Authority ist laut 2026er-Research der wichtigste GEO-Faktor).
3. **`llms.txt` fehlt** → trotz nur 5–15 % Tech-Adoption Low-Cost/High-Optionality (Anthropic + Cursor + Mintlify shippen es; selbst wenn aktuell wenig gecrawlt, künftig erwartete Konvergenz).

**Mittel (P1):** Article/News-OG-Type fehlt für Tool-Pages (kittekit liefert nur `og:type=website`); kein `Person`/`Organization` als Author-Reference auf Tool-Pages.

**Niedrig (P2):** Sitemap-Split nach Kategorie (jetzt unnötig, später wenn ≥1k Tools).

---

## Thema 1 — Klassisches SEO 2026

### Findings
- **INP ist Pflicht-Ranking-Signal mit gleichem Gewicht wie LCP/CLS.** Schwellenwert: <200 ms (gut), <150 ms ist neuer Praxis-Target. 75-Perzentil-Bewertung. 43 % aller Sites failen INP. Sites über 200 ms verlieren ~0,8 Positionen, über 500 ms 2–4 Positionen. (Mewa Studio, 2026; ALMcorp, 2026; Nitropack, 2026)
- **Helpful Content System** wurde 2026 verschärft: aggressiv gegen Content „nur fürs Ranking". Belohnt First-Hand-Experience + people-first-purpose. (orbitinfotech, 2026)
- **E-E-A-T-Experience** ist 2026 das stärkste der vier Signale; Trust-Buffer durch Knowledge-Graph-Anerkennung als Brand-Entity. (Insyntrix, 2026; Heroic Rankings, 2026)
- **Sitemap-Limits:** 50k URLs / 50 MB pro Sitemap, Sitemap-Index referenziert bis zu 50k Sitemaps. Best Practice: Pro Content-Type splitten. Astro-Default `entryLimit=45000` reicht für kittekit langfristig (1000+ Tools × 30 Sprachen = 30k URLs liegen unter Limit). (Astro Docs; Polemic Digital, 2026)

### Empfehlungen für kittokit
- **INP-Audit fahren** (separater Task — Phase 1 weiter, Lighthouse-CI bereits scaffolded). Aktuell out-of-scope für diesen Audit, aber hier dokumentiert. → P1
- **Helpful-Content-Konformität** ist bereits gut: Content-Files haben `intro`, `howToUse`, `faq`, deutsche Tiefe, „kein Tracking"-Trust-Eyebrow. → keine Aktion.
- **Brand-Entity-Signal** schwach — kein `Organization`-JSON-LD. → **P0 fixen.**
- **Sitemap-Split:** noch nicht nötig (72 Tools), bei Phase 6 (1000+) re-evaluieren. → P2

**Quellen:**
- [Mewa Studio — SEO & Core Web Vitals 2026](https://www.mewastudio.com/en/blog/seo-core-web-vitals-2026)
- [ALMcorp — Core Web Vitals 2026](https://almcorp.com/blog/core-web-vitals-2026-technical-seo-guide/)
- [Nitropack — Most Important CWV 2026](https://nitropack.io/blog/most-important-core-web-vitals-metrics/)
- [Insyntrix — E-E-A-T 2026](https://beta.insyntrix.com/blog/e-e-a-t-brand-trust-2026/)
- [Orbit Infotech — Helpful Content Update 2026](https://orbitinfotech.com/blog/google-2026-helpful-content-update/)
- [Polemic Digital — Perfecting XML Sitemaps](https://www.polemicdigital.com/perfecting-xml-sitemaps)

---

## Thema 2 — GEO (Generative Engine Optimization)

### Findings
- **Direct-Answer-Patterns:** Erste 200 Wörter müssen Primary-Query vollständig beantworten (Perplexity, AI Overviews bewerten primär den Opener). (Enrich Labs, 2026)
- **Question-Headers** (z.B. „Was ist X?") werden bevorzugt zitiert vs. „X Overview". Eine der höchsten ROI-Änderungen. (First Page Sage, 2026)
- **Spezifische zitierfähige Daten** (Zahlen, Original-Research, Case-Studies) sind „Citation-Magnets". (Enrich Labs)
- **Entity-Authority statt Keyword-Rankings:** GEO-Erfolg = Brand-Entity stark im Knowledge-Graph. Co-Occurrence + Unlinked-Mentions zählen mehr als Backlinks 2026. (memorable.design, 2026; netranks.ai, 2026)
- **`llms.txt`-Realität:** 5–15 % Tech-Site-Adoption, aber Studie zeigt **keine messbare Korrelation** zwischen llms.txt-Implementation und LLM-Citations. Keiner der großen Crawler (GPTBot, ClaudeBot, PerplexityBot) requested es aktuell. Dennoch: Anthropic, Cursor, Mintlify, GitBook shippen es. Cost: minimal. (longato.ch, 2026; SEranking, 2026; bigcloudy, 2026; SearchSignal, 2026)
- **AI-Crawler 10–30 % von Search-Volume.** Wachsend. (longato.ch)

### Empfehlungen für kittokit
- **Question-Headers in Tool-Content:** kittokit-FAQ macht das schon (`q: "Wie viele Fuß sind ein Meter?"`). Article-H2s (`Was macht der Konverter?`) ebenfalls. → bereits gut.
- **Direct-Answer in Intros:** Spec-Lock § 2.4 + Content-Files haben `intro`-Frontmatter. Stichproben (meter-zu-fuss) zeigen: ja. → bereits gut.
- **Entity-Authority via globales `Organization`-JSON-LD + `WebSite`-Schema** mit `SearchAction` (Pagefind als Endpoint). → **P0 implementieren.**
- **`llms.txt` shippen** als Low-Cost-Optionswert. Realistisch: kein erwarteter Traffic-Lift heute, aber Future-Proofing + Anthropic/OpenAI-Konvergenz möglich. → **P0 — billig.**
- **`llms-full.txt` mit Tool-Liste + Brand-Mission** als Bonus — unfundiert evidenzmäßig, aber kostet nichts und matcht aktuelle Best-Practice der GEO-Community. → P0 mit llms.txt-Bundle.

**Quellen:**
- [Enrich Labs — GEO Complete 2026](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)
- [First Page Sage — GEO Algorithm Breakdown](https://firstpagesage.com/seo-blog/generative-engine-optimization-geo-explanation/)
- [memorable.design — Brand Signals 2026](https://memorable.design/google-ranking-brand-signals-2026/)
- [netranks.ai — E-E-A-T as #1 GEO Factor](https://www.netranks.ai/blog/e-e-a-t-as-the-1-geo-ranking-factor-in-2026-a-guide-to-the-entity-identity-protocol)
- [longato.ch — LLMs.txt Audit Aug 2025](https://www.longato.ch/llms-recommendation-2025-august/)
- [SEranking — LLMs.txt Why It Doesn't Work](https://seranking.com/blog/llms-txt/)
- [SearchSignal — llms.txt 2026](https://searchsignal.online/blog/llms-txt-2026)

---

## Thema 3 — Schema.org für Tools

### Findings
- **`SoftwareApplication` ist korrekte Wahl** für Browser-Tools (Canva, Adobe Express nutzen es). `WebApplication` ist Subclass — beide funktionieren, `SoftwareApplication` ist breiter unterstützt. (schema.org; unhead.unjs.io)
- **Pflicht-Properties** für Rich-Results: `name`, `description`, `applicationCategory`, `operatingSystem`, `offers` mit `price` (kostenlose Tools: `0`). kittokit hat all das.
- **`HowTo`-Schema** ist 2026 weiterhin valid; Google reduzierte zwar Rich-Result-Anzeige (2023), aber LLMs nutzen es weiter für Direct-Answer-Extraction.
- **`FAQPage`** ebenso — Rich-Result-Anzeige restriktiv (nur autoritative Sites), aber LLMs zitieren FAQ-Content massiv.
- **`BreadcrumbList`** = unverändert wichtig für Site-Hierarchie-Verständnis.

### Empfehlungen für kittokit
- **Aktueller `tool-jsonld.ts` ist State-of-the-Art** — keine Änderung nötig.
- **Globaler Layer fehlt:** `Organization` (kittokit-Brand) + `WebSite` (mit Pagefind-`SearchAction`) → **P0.**
- **Optional:** `aggregateRating` per Tool (sobald Reviews existieren) — Phase 2+. → P2

**Quellen:**
- [schema.org SoftwareApplication](https://schema.org/SoftwareApplication)
- [Unhead — SoftwareApplication Guide](https://unhead.unjs.io/docs/schema-org/api/schema/software-app)
- [Darren Lester — JSON-LD Web Apps](https://www.darrenlester.com/blog/json-ld-structured-data-for-web-applications)

---

## Thema 4 — Multilinguale SEO

### Findings
- **3 Non-Negotiables 2026:** Self-Reference-Tag pro Page, Symmetrie (jede Page der Cluster referenziert jede andere), valid ISO 639-1 Codes. 75 % der internationalen Sites haben hreflang-Errors. (clickrank.ai, 2026; linkgraph, 2026)
- **Subdirectory >> Subdomain** für neue Sites — Link-Equity bleibt im Domain-Pool. (capgo.ai, 2026)
- **`x-default`** ist explicit für Multi-Region-Fallback empfohlen (Google Search Central seit 2013, weiterhin aktuell).

### kittokit-Status (verifiziert in `src/lib/hreflang.ts`)
- ✅ Self-Reference (jede Sprache referenziert sich selbst)
- ✅ Symmetrie (alle Sprachen aus `ACTIVE_LANGUAGES` werden generiert)
- ✅ `x-default` zeigt auf `DEFAULT_LANGUAGE='de'` ✓
- ✅ Subdirectory (`/de/<slug>`)
- ✅ ISO-Code (`de`)
- ✅ Trailing-Slash-Sweep konsistent (`trailingSlash: 'never'`, `normalisePath` strippt trailing)

### Empfehlungen für kittokit
- **Keine Änderung nötig** — Implementierung mustergültig. → keine Aktion.
- Bei Phase 3 (EN/ES/FR/PT-BR) `ACTIVE_LANGUAGES` erweitern; Helper macht Rest automatisch.

**Quellen:**
- [Google Search Central — Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [ClickRank — Hreflang Ultimate Guide 2026](https://www.clickrank.ai/hreflang-tags-complete-guide/)
- [LinkGraph — Hreflang Implementation Guide 2026](https://www.linkgraph.com/blog/hreflang-implementation-guide/)
- [Capgo — Multilingual SEO 2026](https://capgo.ai/blogs/multilingual-website-seo-aeo-geo-best-practices-subdirectory-structure-language-code-standards/)

---

## Thema 5 — AI-Search-Specific (Crawler-Differenzierung + Allow-Strategie)

### Findings
- **Crawler-Splitting (Search vs. Training):**
  - **Search-/Citation-Crawler** (liefern Traffic mit Attribution): `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended` (für AI Overviews), `Applebot-Extended`.
  - **Training-Crawler** (Bulk, kein Traffic): `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Meta-ExternalAgent`.
- **Crawl-to-Refer-Ratios:** GPTBot 1255:1, ClaudeBot 20583:1 — extrem hohe Crawl-Last für minimal Traffic. Publisher-Trend: Search erlauben, Training blocken.
- **Cloudflare-Daten:** Mehrheit aller Sites blockt mittlerweile mindestens GPTBot/CCBot. (technologychecker, 2026)

### Empfehlungen für kittokit (gegen User-Default „ALLOW")
- **User-Anweisung:** „Default ALLOW, kittokit will Reichweite". Diese gilt — **explizit ALLEN AI-Bots erlauben**, sowohl Search als auch Training.
- Begründung: kittokit ist
  1. **public-utility-content** (Tool-Anleitungen sind Wissen, kein Premium-Content),
  2. **monetarisiert via AdSense ab Phase 2** — direkter LLM-Traffic ist Bonus, kein Verlust,
  3. **Brand-Building-Phase** — jede Citation bei ChatGPT/Claude/Perplexity baut Entity-Authority auf (P0-Priorität laut Thema 2).
- **Training-Allow** für GPTBot/ClaudeBot/CCBot: kontroverse Wahl, aber Anweisung deckt das. Trade-off dokumentiert.
- **Sitemap-Referenz** in robots.txt → Pflicht.

**Quellen:**
- [Mersel AI — AI Bot Robots.txt Guide](https://www.mersel.ai/blog/how-to-block-or-allow-ai-bots-on-your-website)
- [No Hacks — AI User Agent Landscape 2026](https://nohacks.co/blog/ai-user-agents-landscape-2026)
- [Open Shadow — robots.txt for AI Bots 2026](https://www.openshadow.io/guides/robots-txt-ai-bots)
- [TechnologyChecker — Cloudflare Crawler Analysis](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report)
- [SEO-Kreativ — robots.txt Guide 2026](https://www.seo-kreativ.de/en/blog/robots-txt-guide-how-to-control-crawlers-incl-gptbot-google-extended/)

---

## Phase B — Gap-Analyse

| # | Gap | Status | Severity | Impact | Aufwand |
|---|-----|--------|----------|--------|---------|
| G1 | `public/robots.txt` fehlt | ❌ | P0 | Crawler haben kein Sitemap-Hint, AI-Bots Default-Allow durch Abwesenheit aber suboptimal kommuniziert | XS (1 File) |
| G2 | Globales `Organization`-JSON-LD fehlt | ❌ | P0 | Knowledge-Graph-Entity nicht etabliert → schwächste GEO-Position | S (1 File-Edit) |
| G3 | Globales `WebSite`-JSON-LD mit `SearchAction` fehlt | ❌ | P0 | Sitelinks-Searchbox + LLM-Site-Search-Discovery | S (1 File-Edit) |
| G4 | `public/llms.txt` fehlt | ❌ | P0 (low-cost-bet) | Future-proof, kein heutiger Lift | XS (1 File) |
| G5 | `public/llms-full.txt` fehlt | ❌ | P1 | siehe G4 | S (1 File) |
| G6 | Per-Tool-Page hat keinen `WebApplication`-Subtype | ✅ (SoftwareApplication ist OK) | — | — | — |
| G7 | OG `og:type` ist statisch `website` für alle Pages | ⚠️ | P2 | Tool-Pages könnten `article` sein, marginal | S |
| G8 | Sitemap-Index-Struktur | ✅ via @astrojs/sitemap default | — | — | — |
| G9 | hreflang + x-default | ✅ | — | — | — |
| G10 | Canonical | ✅ | — | — | — |
| G11 | INP/Core-Web-Vitals-Audit | unbekannt | P1 | groß bei Fail | M (Lighthouse-Run + Fix-Iteration) — out-of-scope diese Session |
| G12 | Per-Tool `aggregateRating` | ❌ | P2 | Phase 2+ wenn Reviews existieren | M |

**Priorisierte Action-Liste:**
- **P0 (jetzt — diese Session):** G1, G2, G3, G4, G5
- **P1 (separater Audit):** G11 (Lighthouse/INP) — out of scope
- **P2 (Phase 2+):** G7, G12

---

## Bewusste Abweichungen (Hard-Constraint > SEO-Best-Practice)

- **Training-AI-Bots blocken** wäre Mainstream-Best-Practice (höhere Server-Effizienz, weniger Datenklau-Risiko). User-Default ALLOW + kittokit-Reichweiten-Phase überstimmen. Falls in 6 Monaten Brand etabliert ist, re-evaluieren.
- **`Person`-Author-Markup** auf Tool-Pages wäre E-E-A-T-Plus, kollidiert aber mit kittokit-Brand-Voice (utility platform, kein Personality-Site). → bewusst nicht.

## Re-Evaluation-Trigger

- **Phase 2 Analytics-Launch (mit Consent):** echte LLM-Crawl-Daten + AI-Search-Referrals einsehen.
- **Tool-Count ≥ 500:** Sitemap-Split pro Kategorie evaluieren.
- **Brand-Entity-Check:** ab `kittokit` in Google Knowledge Panel auftaucht (manuelle SERP-Probe alle 4 Wochen).
- **Spätestens 6 Monate (2026-10-26):** llms.txt-Adoption + Cite-Effekt erneut messen.
