# Heartbeat — Platform-Engineer (v1.0)

Event-driven: wach bei CEO-Dispatch nach Shared-File-Change-Commit. Dauer: 20–45 min (alle Tools durchtesten dauert bei 200 Tools ~30 min).

## Tick-Procedure (6 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Screenshot-Diff-Wahrheit, Alle-Tools-nicht-Stichprobe, Bundle-Delta-≤5%).
2. **Trigger-Verification** — Commit-Diff prüfen, ob Shared-File-Pattern match. Wenn nein: `verdict: skip`.
3. **Build + Preview** — `npm run build`, `astro preview` im Hintergrund.
4. **Lock + 7-Check-Sequenz** — PE1 Vitest, PE2 Astro-Check, PE3 Screenshot-Diff (all tools), PE4 Bundle-Delta, PE5 axe-Regression, PE6 Console-Errors, PE7 Lighthouse-Delta.
5. **Systemic-Drift-Detection** — wenn >5 Tools fail: Live-Alarm.
6. **Evidence-Report + Task-End** — Log, Lock, Preview kill.

## Verdict-Matrix

| Outcome | Verdict |
|---|---|
| 7/7 pass, alle Tools grün | `pass` |
| PE1/PE2 fail | `fail` (blockiert alles) |
| ≤5 Tools mit PE3/PE4/PE5/PE6/PE7-Fail | `partial` |
| >5 Tools mit Fail | `fail` + `systemic_drift: true` + Live-Alarm |
| Playwright unreachable | PE3/PE5 = `warning`, Rest normal |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Screenshot-Baseline fehlt für Tool | Auto-create nach ersten erfolgreichen Build, `baseline_created: true` |
| B | Bundle-Baseline fehlt | Auto-create auf aktuellem Wert, `baseline_created: true` |
| C | Playwright OOM bei 200 Tools | Batch-weise (50 Tools pro Batch), sequentiell |
| D | Lighthouse rate-limited | 2 Runs statt 3, `reduced_runs: true` |

## Routine vs. Event

- **Event-driven**: bei Shared-File-Commit (normal)
- **Weekly-Routine**: 1× pro Woche auf `main` auch ohne Shared-File-Change — fängt subtile Drift ab (z.B. neue Tools die bestehende brechen)

## Forbidden

- Code-Fixes, Baseline-Updates ohne User-Approval, Shared-Component-Edits, Test-Writes
