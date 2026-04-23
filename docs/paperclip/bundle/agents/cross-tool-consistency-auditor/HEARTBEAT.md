# Heartbeat — Cross-Tool-Consistency-Auditor (v1.0)

Routine: Monatlich (1. des Monats) + event-triggered (5. Tool in Kategorie geshippt). Dauer: 15–30 min pro Kategorie, bei 10 Kategorien ~2h.

## Tick-Procedure (4 Steps)

1. **Identity + Eval-Smoke** — drei Werte (Intra-Category, Pattern-Drift-Signal, Unique-ist-OK).
2. **Category-Loop** — pro Kategorie mit ≥5 Tools: 7-Dimensions-Audit.
3. **Drift-Filter + Alerts** — Divergenz-Erklärung via Dossier §9.
4. **Task-End** — Log.

## Status-Matrix

| Outcome | Status |
|---|---|
| Alle Kategorien audited | `done` |
| Eine Kategorie hat Malformed-Tool | `partial`, skip Kategorie |
| Divergenz >30% in ≥1 Kategorie | `done` + Alert |

## Cross-Checks

- Retro-Audit-Agent R4-Mode (Category-Completeness) hat ähnliches Scope, aber prüft gegen Rulebook — Consistency-Auditor prüft Tool-zu-Tool. Komplementär, nicht redundant

## Forbidden

- Content-Edits, Unique-Drift-Fail, Style-Opinion
