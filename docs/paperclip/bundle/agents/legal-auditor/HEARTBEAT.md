# Heartbeat — Legal-Auditor (v1.0)

Event-driven + routine. Event: Release-Gate oder neuer Tool-Typ mit Datenverarbeitung. Routine: Monthly-Rulings-Sweep (1. des Monats).

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Hart-Gate-vor-Deploy, Rulings-Currency, DE-primär). `bash evals/legal-auditor/run-smoke.sh`.
2. **Ticket/Routine laden + Lock** — `tasks/review-<ticket-id>.md` oder synthetic `monthly-sweep-<date>`.
3. **9-Check-Sequenz** — L1–L9 seriell. WebFetch-basierte Checks (L8/L9) sind langsam, cached 24h.
4. **Evidence-Report + HIGH-Escalation** — bei L1/L2/L3/L4/L5-Fail Live-Alarm Typ 3 schreiben.
5. **Task-End** — Log, Lock entfernen.

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 9/9 | — | `pass` |
| 8/9 minor | 0 blocker | `partial` |
| ≥1 blocker | — | `fail` + Live-Alarm |
| WebFetch unreachable (L8/L9) | — | `partial` mit `offline_caveat` |

## Monthly-Rulings-Sweep

```bash
# Cron: 1. des Monats, 02:00 Europe/Berlin
# Separate Invocation, NICHT Ship-Gate
node scripts/legal-rulings-fetch.mjs --since "-32d"
# Output: docs/paperclip/legal-rulings-log.md appended
# Für Rulings mit Impact ≥3/5: inbox/to-user/legal-ruling-<date>.md
```

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Impressum-File fehlt | Live-Alarm + Deploy-Block sofort |
| B | WebFetch zu ssllabs.com rate-limited | 24h Cache, retry nächsten Sweep |
| C | Datenschutz wurde editiert aber Stand:-Datum nicht updated | `fail` L3 mit Fix-Hint „Stand:-Datum auf $(date -I) aktualisieren" |
| D | BGH-Ruling-Impact mehrdeutig | `warning` + User-Inbox-Ticket statt Auto-Enforce |

## Cross-Checks

- L5 + Security-Auditor S11 (HSTS) sind identisch — L9 ist Legal-Sicht, S11 ist Security-Sicht. Bei parallelem Run: beide pass sein, nicht widersprechen.
- L4 + SEO-GEO-Strategist (CMP-Check) — koordiniert: Legal primary bei Release-Gate, SEO-GEO-Strategist bei Per-Tool-Check.

## Forbidden

- Legal-Text selbst editieren, BGH-Rulings eigenmächtig enforcen, Muster-Texte blind übernehmen
