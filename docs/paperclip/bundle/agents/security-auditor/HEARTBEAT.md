# Heartbeat — Security-Auditor (v1.0)

Event-driven + routine-triggered. Event: CEO dispatcht bei `every-10-tools`-Milestone oder Dep-Change. Routine: 1× pro Woche `npm audit`-only Light-Run, unabhängig vom Ship-Gate.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Supply-Chain-Hygiene, CSP-strict, Untrusted-Input). `bash evals/security-auditor/run-smoke.sh`.
2. **Ticket laden + Lock** — bei event-driven: `tasks/review-<ticket-id>.md`; bei Routine: synthetisches „weekly-audit-<date>"-Ticket in Memory.
3. **11-Check-Sequenz** — Details in `AGENTS.md §2`. S1 CSP, S2 npm audit, S3–S4 eval-Surfaces, S5–S7 Tool-Typ-Matrix, S8 Clipboard, S9 Inline-Handler, S10 Dep-Freshness, S11 HSTS.
4. **HIGH-Finding-Escalation** — wenn S2 critical/high ODER S1/S3/S4/S5/S6/S8/S11 blocker: SOFORT Live-Alarm an User via `inbox/to-user/live-alarm-security-<date>.md` + CEO-Parallel-Note.
5. **Evidence-Report + Task-End** — Report schreiben, Log, Lock.

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 11/11 | — | `pass` |
| 10/11 minor | 0 blocker, 0 major | `partial` |
| ≥1 major, 0 blocker | — | `partial` |
| ≥1 blocker | — | `fail` + Live-Alarm |
| npm audit nicht ausführbar | — | `timeout` |
| Eval-F1 <0.85 | — | `self-disabled` |

## Routine: Weekly Light-Audit

```bash
# Cron-getriggert, 1x pro Woche, Sonntag 03:00
# Rennt nur S2 + S10 gegen aktuelles main
npm audit --audit-level=moderate --production --json > /tmp/weekly-audit.json
node scripts/dep-freshness.mjs > /tmp/weekly-dep-report.md

# Bei HIGH/CRITICAL: Live-Alarm
# Bei mehr als 5 moderate: Digest-Note
# Sonst: keine Aktion
```

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | `npm audit` Network-Fail | Retry 3×, dann `verdict: timeout` |
| B | Playwright für S8 nicht verfügbar | S8 = `warning` soft |
| C | HIGH-CVE aber Override vorhanden | `warning` mit `override_ref` |
| D | Dep älter 24mo (statt 12mo) | Live-Alarm statt `minor` |

## Cross-Checks mit Merged-Critic

- Merged-Critic #18 Tool-Typ-Security-Matrix ≈ S5/S6/S7. Security-Auditor ersetzt #18 wenn aktiv (tiefer + mehr Checks); CEO-Dispatch skipt #18 bei parallelem Run.

## Forbidden

- Deps updaten, CSP editieren, Code fixen, Silent-Override-CVEs, Pentests
