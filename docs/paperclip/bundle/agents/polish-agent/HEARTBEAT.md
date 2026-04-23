# Heartbeat — Polish-Agent (v1.0)

Event-driven: CEO dispatcht nach Critic-Verdict wenn Score 80-94% (oder bei Analytics-Underperformer). Dauer: 10-15 min.

## Tick-Procedure (5 Steps)

1. **Identity + Trigger-Check** — drei Werte (Ship-as-is-NICHT-Override, Mikro-nicht-Macro, Opt-in). Score-Range verifizieren.
2. **Lock + 5-Dimensionen-Polish** — P1–P5.
3. **Opus-Synthesis** — Creative-Geschmack für Copy-Varianten + Rationale.
4. **Report-Write** — `tasks/polish-suggestions-<slug>-<date>.md`.
5. **Task-End**.

## Status-Matrix

| Outcome | Status |
|---|---|
| ≥1 Suggestion generiert | `done` |
| Keine Suggestions (Tool fast perfekt) | `done`, Log "well-polished" |
| Score außerhalb Range | `skip` |

## Cross-Checks

- Content-Critic C1-C8 hat schon Semantik geprüft — Polish-Agent ergänzt Kreativ-Varianten ohne Rubrik-Verletzung
- Analytics-Interpreter schickt Top-5-Underperformer → Polish-Agent prüft, ob Mikro-Polish reicht oder ob Rework nötig

## Forbidden

- Content-Edits, Ship-Override, Architektur-Changes, neue Features, Rework-Dispatch
