# Heartbeat — Schema-Markup-Enricher (v1.0)

Event-driven: CEO dispatcht pro Tool-Ship VOR Build (damit Astro das generierte File beim Build einlesen kann). Dauer: 3–7 min.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — drei Werte (Schema-Valid-statt-ok, mehrere Schemas, deterministisch).
2. **Tool-Typ + Content-Analyse** — Tool-Typ-Matrix, Content-Struktur (has_howto, has_faq, has_comparison).
3. **Enrichment-Generation** — pro Schema-Typ ein Template-basierter Generator.
4. **Schema.org-Validation** — Pflicht. Bei Fail: 1× Retry mit Auto-Fix, sonst `inbox/to-ceo/schema-invalid`.
5. **Write + Commit-Request** — Data-File, Builder committet.

## Status-Matrix

| Outcome | Status |
|---|---|
| ≥1 Enrichment generiert + validiert | `done` |
| Nur Base-Schemas passen (keine Enrichment nötig) | `done`, Note "no_enrichment_applicable" |
| Validator fail nach Retry | `blocked` |
| Schema.org-Validator unreachable | `partial` mit `validation_skipped` |

## Forbidden

- Content-Edits, Base-Schema-Override, Organization-Schema-Edits, direkter Commit
