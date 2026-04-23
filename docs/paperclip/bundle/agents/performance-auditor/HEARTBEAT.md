# Heartbeat — Performance-Auditor (v1.0)

Event-driven für Ship-Gate + Cron-based (weekly) für Prod-Regression-Scan. Ein Tick = ein Review. Dauer: 10–20 min wegen Lighthouse 3-Run-Median.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Messung-vor-Meinung, Budget-hart, Third-Party-Hygiene). `bash evals/performance-auditor/run-smoke.sh`.
2. **Build + Preview-Start** — `npm run build`, `npx astro preview --port 4321` im Hintergrund.
3. **Lock + 9-Check-Sequenz** — Details in `AGENTS.md §2`. Lighthouse-CI rennt alle CWV-Checks in einem Aufruf, Bundle-Size + Third-Party sind separate Scans.
4. **Evidence-Report + Task-End** — Report schreiben, Log appenden, Lock entfernen, Preview kill.
5. **Prod-Regression (wöchentlich, separate Routine)** — siehe AGENTS.md §5.

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 9/9 | — | `pass` |
| 8/9 minor | 0 blocker, 0 major | `partial` |
| ≥1 major, 0 blocker | — | `partial` |
| ≥1 blocker | — | `fail` |
| Lighthouse nicht ausführbar | — | `timeout` |
| Eval-F1 <0.85 | — | `self-disabled` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Lighthouse-Varianz >10% zwischen Runs | 5 statt 3 Runs, Median |
| B | Preview-Server startet nicht | `verdict: timeout`, `inbox/to-ceo/preview-fail-<id>.md` |
| C | Chrome nicht verfügbar (Headless-Problem) | `verdict: timeout`, `inbox/to-ceo/chrome-missing.md` |
| D | CI-Resource-Constraint (langsame VM) | Soft-Warning + `resource_caveat` |

## Cross-Checks mit Merged-Critic

- Merged-Critic #14 Perf-Budget macht 1-Run-Lighthouse (grobe Sieve). Performance-Auditor ersetzt #14 wenn aktiv (3-Run-Median). CEO-Dispatch skipt #14 bei parallelem Run.

## Forbidden

- Single-Shot-Measurement, Code-Edits, Budget-Change, Third-Party-Exception-Grant
