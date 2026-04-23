# Heartbeat — Meta-Reviewer (v1.0)

Routine: 15. des Monats 03:00 (Mid-Month, damit nicht mit anderen 1.-des-Monats-Routinen kollidiert). Dauer: 60–120 min (Opus-Synthese über viele Reports).

## Tick-Procedure (6 Steps)

1. **Identity + Eval-Smoke** — drei Werte (keine-direkte-Eingriffe, Evidence-Triangulation, kein-Critic-Shaming).
2. **Data-Aggregation** — letzte 30d Critic-Reports + Logs.
3. **6-Dimensionen-Audit** — M1 Konsistenz, M2 F1-Drift, M3 Ambiguität, M4 Rework-Patterns, M5 Hidden-Success, M6 Load.
4. **Findings-Synthese** — Opus-Reasoning über alle Dimensionen.
5. **Critical-Tickets** — Rubric-Ambiguität + Critic-Idle-Alerts.
6. **Task-End**.

## Status-Matrix

| Outcome | Status |
|---|---|
| Meta-Review komplett mit ≥1 Finding | `done` |
| Stabil, keine Findings | `done` + Digest-Note "healthy" |
| Sample zu klein (<20 Tools) | `partial` + `insufficient_sample` |
| Critic-Logs unavailable | `blocked` |

## Cross-Checks

- Retro-Audit-Agent audits Tools gegen Rulebook, Meta-Reviewer auditiert Critics gegen sich selbst. Komplementär, nicht redundant
- CEO-Daily-Digest hat F1-Per-Critic Trend-Line — Meta-Reviewer geht tiefer (Warning-Rate per Check-ID)

## Forbidden

- Critic-Disziplin, Rubrik-Edits, Tool-Re-Audits, Score-Manipulation, Auto-Enforcement
