# Kategorie-spezifische TTL-Tabelle

> **Zweck:** Authoritative Referenz für `ttl_days` im Dossier-Frontmatter (DOSSIER_REPORT.md). One-size-fits-all 90d war Token-Verschwendung — Physik ändert sich nicht, Format-Landschaft ändert sich mäßig, Krypto wäre in 30 Tagen veraltet.
>
> **Quelle der Wahrheit:** Research-Report `research/2026-04-20-multi-agent-role-matrix.md` §7.13 + CONVENTIONS.md §Category-Taxonomie.

## TTL-Tabelle — Tool-Dossiers (Child) vs. Category-Root-Dossiers (Parent)

**Regel:** Category-Root-TTL = `ceil(Tool-TTL / 2)`, Minimum 30d. Rationale: Ein Root-Dossier deckt alle Konkurrenten, User-Pain-Communities und SEO-Landschaften der Kategorie gleichzeitig ab — d.h. größere Change-Surface pro Zeiteinheit als ein einzelnes Tool-Dossier. Wenn ein Root halluziniert oder veraltet ist, vergiftet er 8+ Children gleichzeitig (siehe `DOSSIER_REPORT.md §Inheritance-Integrity-Gate`).

| Kategorie (Slug) | Kategorie (DE-Label) | Tool-TTL | Root-TTL | Begründung |
|---|---|---|---|---|
| `length` | Längen | **365d** | **180d** | Metrische + imperiale Definitionen seit Jahrzehnten stabil; Konkurrenz-UX ändert sich langsam |
| `weight` | Gewicht | **365d** | **180d** | siehe `length` |
| `area` | Flächen | **365d** | **180d** | siehe `length` |
| `volume` | Volumen | **365d** | **180d** | siehe `length` |
| `distance` | Distanzen | **365d** | **180d** | siehe `length` |
| `temperature` | Temperatur | **365d** | **180d** | Celsius-Definition 1948 stabil; nur Darstellungs-Varianten im Fluss |
| `image` | Bild | **180d** | **90d** | AVIF / JPEG-XL / HEIC-Adoption ändert sich merklich pro Jahr |
| `video` | Video | **180d** | **90d** | Codec-Support (AV1, VP9, H.266) in Flux |
| `audio` | Audio | **180d** | **90d** | Opus-Adoption, neue Container-Formate |
| `document` | Dokument | **180d** | **90d** | PDF-Reader-Kompat, ODF-Updates |
| `text` | Text | **180d** | **90d** | Markdown-Variants, AI-Workflow-Integration |
| `dev` | Dev / Code-Tools | **180d** | **90d** | Build-Tool-Flux (Vite, Turbopack, Bun) |
| `color` | Farbe | **180d** | **90d** | OKLCH-Adoption, Design-Tool-Output-Formate |
| `time` | Zeit | **180d** | **90d** | Zeitzone-DB-Updates, Daylight-Saving-Regeln |

## Zukünftige Kategorien (falls aktiviert)

| Kategorie (Slug) | Tool-TTL | Root-TTL | Begründung |
|---|---|---|---|
| `crypto` | **30d** | **30d** (Minimum greift) | Volatilität, Listing-Änderungen, Exchange-Shutdowns — Tool = Root, weil Refresh-Takt schon auf Anschlag |
| `finance` | **90d** | **45d** | Zinsen, Wechselkurse, regulatorische Flux |

Aufnahme erfordert CONVENTIONS.md §Category-Taxonomie-Update + ein User-Approval-Ticket (Enum-Erweiterung ist kein agent-autonomer Vorgang).

## Override-Trigger (pro Tool, nicht pro Kategorie)

Unabhängig vom TTL feuert ein Sofort-Refresh bei:

- **Analytics-Dip:** Bounce > +20 % oder CTR < −15 % über 14 Tage → immediate refresh
- **Competitor-Launch-Event:** Top-3-Konkurrent launcht Major-Feature oder redesignt → immediate refresh
- **User-Feedback-Schwelle:** ≥3 Reports gleicher Pain → immediate refresh
- **Citation-Verify-Fail beim TTL-Refresh:** Delta-Only wird zu Full-Research eskaliert

Trigger-Datenquellen (alle frei, §7.16-konform):

| Trigger | Datenquelle | Abfrage-Cadence |
|---|---|---|
| Analytics-Dip | Plausible / CF-Web-Analytics | täglich via `scripts/metrics-digest.ts` |
| Competitor-Launch | Top-3-Homepages per WebFetch, Diff gegen Last-Fetch-Hash | monatlich pro Kategorie |
| User-Feedback | `inbox/from-users/` Pain-Report-Files | CEO-Heartbeat-täglich |
| Citation-Fail | `citation-verify.ts`-Run-Result | pro Dossier-Write |

## Integration ins Dossier-Frontmatter

**Tool-Dossier (Child):**

```yaml
ttl_days: 365                    # aus "Tool-TTL"-Spalte gezogen
ttl_category_source: length
dossier_scope: tool              # tool | category-root
parent_dossier: _categories/length/2026-04-20.md
override_triggers_active:
  - analytics-dip
  - competitor-launch
  - user-feedback
```

**Category-Root-Dossier (Parent):**

```yaml
ttl_days: 180                    # aus "Root-TTL"-Spalte gezogen, halbierte Tool-TTL
ttl_category_source: length
dossier_scope: category-root
parent_dossier: null             # Roots haben keinen Parent
citation_verify_passed: true     # HART: blockiert sonst Child-Inheritance
override_triggers_active:
  - competitor-launch            # kaskadiert auf ALLE Children, siehe DOSSIER_REPORT.md §Inheritance-Integrity-Gate
  - analytics-dip-cluster        # Bounce > +20% über ≥3 Tools der Kategorie
```

## Tradeoff (akzeptiert)

365d für Physik-Konverter heißt: Ein Konkurrent-Redesign wird bis zu 12 Monate lang verschlafen, wenn kein Override greift. **Mitigation zweistufig:**

- **Root-Level-Refresh alle 180d** fängt Kategorie-weite Competitor-Shifts (UX-Pattern-Wandel, neue Konkurrent-Welle) spätestens nach 6 Monaten ab, ohne dass jeder einzelne Child-Dossier neu gerollt werden muss.
- **Competitor-Watch-List** (monatlicher Per-Kategorie-Diff-Check, ~5 Min) fängt den 80%-Fall ab, lange vor TTL-Ablauf — Script in `scripts/competitor-watch.mjs` (Batch 3, Runner-Wiring in Batch 5).

## Änderungs-Policy

Jede TTL-Änderung:

1. CONVENTIONS.md-Begründung nötig ("warum ändert sich diese Kategorie jetzt schneller / langsamer als früher")
2. User-Approval via `inbox/to-user/ttl-change-<category>.md`
3. CEO schreibt Migration-Ticket: alle Dossiers der Kategorie bekommen neuen `ttl_days`-Wert bei nächstem Refresh

TTL wird **nicht** agent-autonom geändert — das ist ein manueller, begründeter Policy-Shift.
