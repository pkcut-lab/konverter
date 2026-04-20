# Kategorie-spezifische TTL-Tabelle

> **Zweck:** Authoritative Referenz für `ttl_days` im Dossier-Frontmatter (DOSSIER_REPORT.md). One-size-fits-all 90d war Token-Verschwendung — Physik ändert sich nicht, Format-Landschaft ändert sich mäßig, Krypto wäre in 30 Tagen veraltet.
>
> **Quelle der Wahrheit:** Research-Report `research/2026-04-20-multi-agent-role-matrix.md` §7.13 + CONVENTIONS.md §Category-Taxonomie.

## TTL-Tabelle

| Kategorie (Slug) | Kategorie (DE-Label) | TTL | Begründung |
|---|---|---|---|
| `length` | Längen | **365d** | Metrische + imperiale Definitionen seit Jahrzehnten stabil; Konkurrenz-UX ändert sich langsam |
| `weight` | Gewicht | **365d** | siehe `length` |
| `area` | Flächen | **365d** | siehe `length` |
| `volume` | Volumen | **365d** | siehe `length` |
| `distance` | Distanzen | **365d** | siehe `length` |
| `temperature` | Temperatur | **365d** | Celsius-Definition 1948 stabil; nur Darstellungs-Varianten im Fluss |
| `image` | Bild | **180d** | AVIF / JPEG-XL / HEIC-Adoption ändert sich merklich pro Jahr |
| `video` | Video | **180d** | Codec-Support (AV1, VP9, H.266) in Flux |
| `audio` | Audio | **180d** | Opus-Adoption, neue Container-Formate |
| `document` | Dokument | **180d** | PDF-Reader-Kompat, ODF-Updates |
| `text` | Text | **180d** | Markdown-Variants, AI-Workflow-Integration |
| `dev` | Dev / Code-Tools | **180d** | Build-Tool-Flux (Vite, Turbopack, Bun) |
| `color` | Farbe | **180d** | OKLCH-Adoption, Design-Tool-Output-Formate |
| `time` | Zeit | **180d** | Zeitzone-DB-Updates, Daylight-Saving-Regeln |

## Zukünftige Kategorien (falls aktiviert)

| Kategorie (Slug) | TTL | Begründung |
|---|---|---|
| `crypto` | **30d** | Volatilität, Listing-Änderungen, Exchange-Shutdowns |
| `finance` | **90d** | Zinsen, Wechselkurse, regulatorische Flux |

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

```yaml
ttl_days: 365                 # aus dieser Tabelle gezogen, nicht frei gewählt
ttl_category_source: length   # zur Nachvollziehbarkeit (CEO-Gate kann prüfen)
override_triggers_active:
  - analytics-dip
  - competitor-launch
  - user-feedback
```

## Tradeoff (akzeptiert)

365d für Physik-Konverter heißt: Ein Konkurrent-Redesign wird bis zu 12 Monate lang verschlafen, wenn kein Override greift. **Mitigation:** Competitor-Watch-List (monatlicher Per-Kategorie-Diff-Check, ~5 Min) fängt den 80%-Fall ab, lange vor TTL-Ablauf.

## Änderungs-Policy

Jede TTL-Änderung:

1. CONVENTIONS.md-Begründung nötig ("warum ändert sich diese Kategorie jetzt schneller / langsamer als früher")
2. User-Approval via `inbox/to-user/ttl-change-<category>.md`
3. CEO schreibt Migration-Ticket: alle Dossiers der Kategorie bekommen neuen `ttl_days`-Wert bei nächstem Refresh

TTL wird **nicht** agent-autonom geändert — das ist ein manueller, begründeter Policy-Shift.
