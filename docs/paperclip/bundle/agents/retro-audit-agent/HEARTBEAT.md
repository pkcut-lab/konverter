# Heartbeat — Retro-Audit-Agent (v1.0)

Routine + event-based. Event: CEO-Dispatch bei Rulebook-Hash-Change (R3) oder 20-Tool-Milestone (R1). Routine: 1. des Monats (R2). Dauer: 1–3h bei 200 Tools, wegen Full-Check-Sweep.

## Tick-Procedure (6 Steps)

1. **Identity + Eval-Smoke + Trigger-Detect** — Modus bestimmen (R1/R2/R3/R4/R5).
2. **Tools + Checks Scope-Resolve** — je nach Modus.
3. **Drift-Audit-Run** — alle Tools gegen alle Checks aus Scope. Details `AGENTS.md §3`.
4. **Drift-Vektor-Aggregation** — welche Checks sind systemic?
5. **Systemic-Drift-Alerts** — wenn ≥10 Tools einen Check fail: `inbox/to-user/systemic-drift-<check>.md`.
6. **State-Update + Task-End** — `memory/retro-audit-state.json` mit neuem `last_shipped_count`, Log, Lock.

## Status-Matrix

| Outcome | Status |
|---|---|
| Full-Sweep komplett, Drift-Report geschrieben | `done` |
| >5 Tools haben keine Dossier-Ref (Grandfathered) | `partial` + `ungrandfathered_count` |
| Playwright für Design-Checks fail | `partial` mit `playwright_skipped` |
| Rulebook-Hash-Lookup fail | `blocked` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Tool-Directory ohne de.md (malformed) | skip, Digest-Note |
| B | Check-Script fehlt für Rulebook-Version | `inbox/to-user/check-script-missing-<id>.md` |
| C | Rulebook-Version-Parser fail | `verdict: fail`, `inbox/to-user/rulebook-version-parser.md` |
| D | 200-Tool-Run OOM | Batch 50 Tools + sequentiell |

## Cross-Checks

- Merged-Critic hat 19 Checks, Critics haben eigene Sets. Retro-Audit prüft ALLE Checks — aber gruppiert nach Critic-Ownership im Report
- Bei Rulebook-Change (R3-Trigger): CEO dispatcht Retro nur für Checks aus geänderter Sektion (Effizienz)

## Forbidden

- Auto-Rework-Dispatch, Rulebook-Edits, Tool-Edits, Einzel-Critics-Override, Stichprobe
