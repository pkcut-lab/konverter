# Dossier-Report — Format-Standard für Tool-Dossier-Researcher

> **Zweck:** Einheitliches Pre-Build-Research-Artifact, das der Tool-Dossier-Researcher (Rolle 12) pro Tool erzeugt. Tool-Builder, Content-Critic, Design-Critic lesen dieses File vor/während ihrer Arbeit; CEO referenziert es in `current_task.md` und schaltet den Build-Ticket erst nach Dossier-Gate-Pass frei.
>
> **Ablage:** `tasks/dossiers/<ticket-id>/dossier.md` (runtime). Cache: `tasks/dossiers/_cache/<category>/<slug>.dossier.md` mit Index `_cache/INDEX.yaml`.
>
> **Quelle der Wahrheit:** Research-Report `research/2026-04-20-multi-agent-role-matrix.md` §5.4 (Format) + §5.5 (Citation-Verify) + §7.12 (DSGVO) + §7.13 (Kategorie-TTL) + §7.16 (Kostenlos-Policy).

## Struktur

Zwei Teile: **YAML-Frontmatter** (maschinenlesbar, CEO-Gate) + **10-Sektionen-Markdown-Körper** (menschenlesbar, Builder- und Critic-Kontext) + **Quellen-Block** am Ende.

Gesamtlänge-Ziel: 2000–4000 Wörter (Standard-Tool), bis 6000 Wörter (Unique-Tool mit Differenzierungs-Deep-Research-Referenz).

## YAML-Frontmatter (Pflicht)

```yaml
---
# Dossier-Metadaten
dossier_version: 1
ticket_id: tool-build-0042
tool_slug: meter-zu-fuss
tool_category: laenge              # aus 14-Enum (CONVENTIONS.md §Category-Taxonomie)
tool_type: converter               # converter | calculator | generator | formatter | validator | analyzer | comparer
language: de
researcher: tool-dossier-researcher
research_started: 2026-04-21T09:00:00Z
research_completed: 2026-04-21T10:20:00Z
sources_count: 14
sources_cache_hits: 3              # aus tasks/dossiers/_cache/laenge/ gezogen

# Cache + Staleness (§7.13 Kategorie-TTL)
cache_key: laenge/meter-zu-fuss/de # deterministic, für reuse
ttl_days: 365                      # aus §7.13-Tabelle gezogen (laenge = 365d)
ttl_category_source: laenge        # Nachvollziehbarkeit
refresh_trigger: ttl-expiry        # ttl-expiry | analytics-dip | user-feedback | competitor-launch
override_triggers_active: [analytics-dip, competitor-launch, user-feedback]
reuse_parent: null                 # delta-child? hier Parent-Dossier-ID (z.B. laenge/_category-root)

# Pass/Fail-Gate für CEO-Aggregation
sections_filled: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
all_sources_cited: true
differentiation_hypotheses_count: 2  # mind. 1 Pflicht
unique_tool_flag: false
diff_researcher_report: null         # path zu differentiation-deep-research.md wenn unique_tool_flag: true

# Citation-Verify-Gate (§5.5)
citation_verify_passed: true
citation_verify_run_at: 2026-04-21T10:15:00Z
citation_verify_method: webfetch+bigram-jaccard
citations_total: 28
citations_verified: 26
citations_warned: 2                  # soft misses (paraphrase, nicht wörtlich)
citations_failed: 0                  # bei > 0: research_completed bleibt false

# Cost-Transparenz (§7.11 Observability)
tokens_in: 48000
tokens_out: 9200
webfetch_calls: 24                   # §7.16 free-first
firecrawl_calls: 2                   # §7.16 max 3 pro Ticket
firecrawl_reason: ['JS-Rendered: competitor-top-1', 'Bot-Block-Fallback: reddit-thread-xyz']

# DSGVO (§7.12)
pii_scrub_version: 1
pii_scrub_run_at: 2026-04-21T10:18:00Z
usernames_redacted: 8                # Pseudonymisierungs-Count
---
```

## 10-Sektionen-Markdown-Körper (Reihenfolge fest)

### § 1 — Tool-Mechanik-Research

- Formel-Varianten (exakt vs gerundet, z.B. 1 m = 3.28084 ft vs 3.281 ft)
- Historische Definitionen (internationale Fuß vs US-Survey-Fuß; Celsius 1742 vs 1948-Redefinition)
- Edge-Cases (Negativwerte, 0, `10^9+`, wissenschaftliche Notation, NaN-Inputs)
- Sprach-Varianten der Einheit (Fuß vs Fuss; Pound vs Pfund; °C / °F-Display)
- Präzisions-Erwartungen der Zielgruppe (3 Nachkommastellen Standard, 6 für wissenschaftliche Nutzer)
- Häufige Nutzer-Fehler (Komma vs Punkt-Dezimaltrenner, Leerzeichen im Input)
- Validation-Regel-Kandidaten (min/max, negative-allowed?, decimal-places-limit)

### § 2 — Konkurrenz-Matrix

Tabelle mit 8–12 Konkurrenten. Pflichtspalten:

| # | URL | USP (1 Zeile) | Input-UX | Präzision | Copy-Button | Historie-Feature | Mobile | Ads-Dichte | Privacy-Posture | LCP (geschätzt) |

Primary-Competitor-URLs (Top 3) bekommen zusätzlich einen kurzen Fließtext-Abschnitt mit Screenshot-Link.

### § 3 — Strengths / Weaknesses Top 3

Pro Top-3-Konkurrent:

- **Competitor A — `<url>`**
  - Strengths (was wir lernen): 3 Bullets
  - Weaknesses (was wir vermeiden / besser machen): 3 Bullets
  - Wörtliche User-Review-Zitate (Trustpilot / PH / G2 / Reddit): ≥2 pro Top-3-Konkurrent
- **Competitor B — `<url>`** (idem)
- **Competitor C — `<url>`** (idem)

### § 4 — User-Pain-Points

Mindestens 3 wörtliche Zitate aus Communities (Reddit r/`<topic>`, HN, Trustpilot, ProductHunt, G2). Format:

```
> "Zitat" — [Community](url), Datum, [community-user]
```

Pseudonymisierung gemäß §7.12 DSGVO ist Pflicht — keine Usernames, keine Profil-URLs.

Kategorisiert in:

- **UX-Pain** (nervige Interaktion)
- **Privacy-Pain** (Tracking, Cookies)
- **Accuracy-Pain** (falsche Werte, zu grobe Rundung)
- **Missing-Feature-Pain**
- **Ads-Interruption-Pain**

### § 5 — UX-Patterns Best-in-Class

- Live-Conversion on-typing (debounce 150 ms Standard) — wer macht's?
- Copy-Button-Position (rechts-oben-Input vs neben-Output)
- Error-Feedback (inline vs toast vs shake)
- Mobile-Keyboard-Type (`inputmode="decimal"` Standard 2026)
- Reverse-Toggle-Interaktion (Swap-Icon vs separater Button)
- Keyboard-Shortcuts (Enter = convert, Tab-Order)
- Focus-Ring-Visibility im Flow
- Empty-State + Success-State + Error-State

**Empfehlung:** Welches Muster übernehmen wir, welches setzen wir bewusst anders? (mit Beleg auf §3 Weaknesses oder §4 Pains)

### § 6 — SEO-Keyword-Landschaft

- **Primary-Keyword:** `<phrase>`
- **Secondary (5–10):** `<phrase>`, `<phrase>`, …
- **People-Also-Ask (SERP Top 5):** „Frage?" — 1-Satz-Antwort-Indikator
- **Intent-Analyse:** informational (90 %) + transactional (10 %) — Verteilung schätzen
- **Keyword-Gap** (rankt bei Konkurrenten, fehlt uns)
- **Snippet-Opportunity** (featured-snippet-Format aktuell: Liste / Tabelle / Absatz?)

Quellen: Google-SERP (WebFetch), AlsoAsked (frei), Google-Suggest-Scrape. SerpAPI ist **nicht erlaubt** (§7.16).

### § 7 — Content-Angle

- **Überstrapaziert bei Konkurrenz:** „Einfach und schnell", „Genauer Umrechner", triviale Historie — was lesen wir immer wieder?
- **Unterrepräsentiert:** Use-Cases aus DACH-Kontext, Präzisions-Fallen, branchenspezifische Beispiele
- **Empfohlenes Framing:** 1–2 Sätze narrative These
- **Information-Gain-Kandidat** (Clearscope-Konzept): welche Facts / Stories / Daten sind neu gegenüber der Konkurrenz?

### § 8 — Edge-Cases + Validation-Regeln

- **Allowed:** positive decimals, "0"
- **Blocked:** `<Liste>` (z.B. negative values — sind negative Fuß sinnvoll?) — **Entscheidung notwendig**
- **Blocked:** non-numeric chars, max-length
- **User-Message-Katalog:** „Bitte eine Zahl eingeben" (de), … pro verbotener Input-Klasse
- **Boundary-Tests:** 0, 1, 10^9, 10^-9

### § 9 — Differenzierungs-Hypothese(n)

Mindestens 1, maximal 3 konkrete Thesen mit Beleg aus §§ 1–4:

- **H1:** `<These>` (Beleg: §7 Content-Angle-Lücke)
- **H2:** `<These>` (Beleg: §2 Matrix, Spalte `<X>`)
- **H3** (optional, bei Unique-Tool): Referenz auf `differentiation-deep-research.md` §2.4

Bei `unique_tool_flag: true` wird § 9 primär aus dem Differenzierungs-Researcher-Report gespeist.

### § 10 — Re-Evaluation-Trigger

- **TTL:** `<Tage>` (aus §7.13-Kategorie-Tabelle, Frontmatter `ttl_days`)
- **Analytics-Trigger:** Bounce > +20 % oder CTR < −15 % über 14 Tage → immediate refresh
- **User-Feedback-Trigger:** ≥3 Reports gleicher Pain → immediate refresh
- **Competitor-Launch-Trigger:** Top-3-Konkurrent launcht Major-Feature oder redesignt → immediate refresh
- **Re-Research-Ausmaß:** Full vs Delta — Delta wenn ≤5 Frontmatter-Felder ändern, Full bei > 5

## Quellen-Block

```
## Quellen

- [Source Title 1](https://example.com/1) — gefetcht 2026-04-21, zitiert in §2, §3
  - erasure_key: sha256(url+timestamp)   # §7.12 Right-to-Erasure
  - paywall: false
  - bot_block: false
- [Source Title 2](https://example.com/2) — gefetcht 2026-04-21, zitiert in §4 (User-Pain)
  - erasure_key: …
  - quote_length: 87   # bei direkten Zitaten > 300 Zeichen Summary nutzen (§7.12 Quote-Kontext-Recht)
- …
```

## CEO-Gate-Check (Aggregation)

Der CEO liest Frontmatter + Sektions-Headers. Dossier ist nur **pass**, wenn:

1. `sections_filled` enthält alle 1–10.
2. `all_sources_cited: true`.
3. `differentiation_hypotheses_count ≥ 1`.
4. Bei `unique_tool_flag: true`: `diff_researcher_report` ist nicht null und File existiert.
5. `sources_count ≥ 8` für Standard-Tool, ≥12 für Unique-Tool.
6. `citation_verify_passed: true` (§5.5 — harte Fakten alle verifiziert, nur paraphrasierte Warnings erlaubt).
7. `pii_scrub_version` matcht aktuelle Pipeline-Version (§7.12).

Bei Fail: CEO schickt Dossier-Researcher zur Nacharbeit (max 1 Rework, dann §7.15 Auto-Resolve: Claim-Strip + Quelle als `unverified` markieren **oder** Ticket park).

## Writer-Constraints (nicht verhandelbar)

- **Keine Halluzinationen:** Jeder Claim in §§ 1–7 zitiert eine Quelle aus dem Quellen-Block mit Fetch-Datum. Citation-Verify-Pass (§5.5) prüft das maschinell.
- **Keine Meinung in §§ 1–6**, nur Beobachtung. §§ 7, 9, 10 dürfen Empfehlungen enthalten, müssen aber Beleg-Refs haben.
- **Kein Marketing-Sprech** („Seamless", „Effortless", „Elevate", „Revolutionary").
- **Deutsch für de-Dossiers**, Englisch nur für direkte Zitate.
- **Keine PII:** Usernames, Profil-URLs, Mails, Telefone sind durch `tools/pii-scrub.ts` (Batch 3) vor Write zu filtern (§7.12).
- **Budget:** `tokens_out ≤ 15000` für Standard-Tool, ≤25000 für Unique-Tool. Firecrawl max 3 Calls (§7.16).

## Versionierung

Schema-Änderungen erhöhen `dossier_version`. CEO rejected Dossiers mit unbekannter Version. Cache-Inhalte mit älterer Version werden beim nächsten Refresh migriert — Details in `scripts/migrate-dossiers.ts` (Batch 3 optional).

## Cache-Struktur (reuse + TTL)

```
tasks/dossiers/
├── _cache/
│   ├── INDEX.yaml                      # cache_key → { last_refresh, ttl_days, sources_count }
│   ├── laenge/
│   │   ├── _category-root.dossier.md   # parent-dossier für Kategorie-Bulk-Research (§7.8 P2)
│   │   ├── meter-zu-fuss.dossier.md
│   │   └── kilometer-zu-meilen.dossier.md
│   ├── image/
│   │   └── …
│   └── …
└── <ticket-id>/
    └── dossier.md                      # runtime-Kopie, liest + merged aus _cache
```

**Reuse-Policy (§7.8 P2 + P5):**

- **Parent-Child-Inheritance:** Category-Root-Dossier wird einmal tief recherchiert (Top-Konkurrenten der Kategorie, gemeinsame UX-Patterns, kategorie-weite SEO-Landschaft). Child-Tool-Dossiers erben §§2, 5, 6 aus Parent und füllen nur §§1, 3, 4, 7, 8, 9, 10 tool-spezifisch auf. Dossier-Frontmatter `reuse_parent: laenge/_category-root`.
- **Sprachen-Reuse:** de-Dossier wird zum en-Dossier gemerged; nur §4 (User-Pains aus EN-Communities) + §6 (EN-Keywords) + §8 (locale-Validation) werden neu recherchiert. Frontmatter `reuse_parent: laenge/meter-zu-fuss/de`.

**Staleness-Check (vor jeder Dossier-Read-Operation durch CEO oder Critics):**

```
IF now() - INDEX.yaml[cache_key].last_refresh > ttl_days * 86400:
  CEO öffnet `tool-research-dossier`-Ticket mit refresh_trigger: ttl-expiry
  UND: dossier wird als `stale: true` markiert, Builder darf stale lesen nur wenn Ticket priority != urgent
```
