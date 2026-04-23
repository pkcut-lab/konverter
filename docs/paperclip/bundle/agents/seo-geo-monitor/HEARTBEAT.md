# Heartbeat — SEO-GEO-Monitor (v1.0)

Routine: 1× pro Woche Montags 06:00 via Cron. Dauer: 45–90 min (viele API-Calls, rate-limited).

## Tick-Procedure (7 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Rankings-relativ, AI-Citations-Leading, Kostenlos).
2. **API-Auth-Check** — GSC-OAuth valid, Brave-API-Key vorhanden, Perplexity-Key vorhanden.
3. **Metriken-Fetch** — M1–M5 seriell mit Rate-Limit. Details `AGENTS.md §2`.
4. **Aggregation** — Weekly-Report-Generator.
5. **Trigger-Tickets** — CTR <1.5% → Rework, Rank-Drop ≥10 → Investigation.
6. **Positive Signals** — AI-Citations in Digest.
7. **Task-End** — Log.

## Status-Matrix

| Outcome | Status |
|---|---|
| Alle APIs grün, Report komplett | `done` |
| 1 API fail, Rest ok | `partial` mit `api_caveat` |
| Alle APIs fail | `blocked` |
| OAuth expired | `blocked` + `inbox/to-user/gsc-oauth-refresh.md` |
| Budget-Cap hit (unwahrscheinlich, aber Safety) | `blocked` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Perplexity 429 | Backoff 60s, Queries auf 2 Sessions verteilen |
| B | Brave Monthly-Cap | Skip Brave, Digest-Note „Brave-Cap reached" |
| C | GSC OAuth expired | `inbox/to-user/gsc-oauth-refresh.md` |
| D | Playwright für M5 fail | M5 = `warning`, nicht `fail` |

## Cross-Checks

- M1 + Analytics-Interpreter Bounce/CTR — SEO-GEO-Monitor ist primary bei CTR + Rank, Analytics-Interpreter primary bei Bounce/Time
- M4 + SEO-GEO-Strategist SG24 — Strategist-Hypothese „Pillar-Article zieht Citations" wird hier empirisch geprüft
- Rework-Trigger: SEO-GEO-Monitor + Analytics-Interpreter können beide `rework-*`-Tickets öffnen. CEO dedupliziert via `ticket.trigger_source`

## Forbidden

- Content-Edits, Schema-Edits, Pre-Publish-Checks, kostenpflichtige APIs, GSC-Submits
