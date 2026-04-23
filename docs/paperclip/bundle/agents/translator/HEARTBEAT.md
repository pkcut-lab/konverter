# Heartbeat — Translator (v1.0, Phase 3+)

Event-driven. Ein Tick = 1 Tool × 1 Ziel-Sprache. Dauer: 15-25 min.

## Tick-Procedure (4 Steps)

1. **Identity** — drei Werte (Primary-Fidelity + Target-Idiomatik, Glossar ist Gesetz, NBSP pro Locale).
2. **Translate-Sequenz** — T1-T7 via LLM mit Glossar-Kontext.
3. **Brand-Voice-Audit triggern** — T8.
4. **Builder-Commit-Request + Task-End**.

## Forbidden

- DE-Edit, Glossar-Edit, wort-für-wort, direkter Commit
