# Heartbeat — Analytics-Interpreter (v1.0)

Routine: 1× pro Woche Dienstag 07:00 (nach SEO-GEO-Monitor Montag, der dessen GSC-Cache nutzt).

## Tick-Procedure (8 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Daten-Triangulation, Segmentierung-vor-Aggregation, Kausalität-ist-Hypothese).
2. **Data-Fetch** — CF-RUM + GSC + AdSense (Phase 2+).
3. **Sample-Size-Filter** — Tools mit <100 Sessions/14d skip.
4. **Rework-Score-Compute** — pro Tool, gemäß ANALYTICS-RUBRIC §5.
5. **Segmentierung** — pro Kategorie aggregieren.
6. **Insights-Synthese** — Opus generiert narrative Insights + Hypothesen.
7. **Trigger-Dispatch** — Rework-Tickets nur bei ≥2 Metrik-Fails (Triangulation-Regel).
8. **Task-End** — Log, Lock entfernen.

## Status-Matrix

| Outcome | Status |
|---|---|
| Full-Run, alle Datenquellen | `done` |
| 1 Datenquelle fail (CF/GSC/AdSense) | `partial` mit `data_gap` |
| Alle Quellen fail | `blocked` |
| Zu wenig Tools mit Sample-Size (neu-Launch-Woche) | `observation-only`, kein Trigger |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | CF-GraphQL Rate-Limit | Retry mit Backoff 60s |
| B | GSC OAuth expired | `inbox/to-user/gsc-oauth-refresh.md` |
| C | AdSense-API Permission-Denied (neu geändert) | skip, Digest-Note |
| D | Rework-Score-Algorithmus NaN/Inf | Log-Dump + `verdict: fail`, Fixture-Review-Pflicht |

## Cross-Checks

- SEO-GEO-Monitor (Mo) schreibt GSC-Cache-File (`memory/gsc-cache-<date>.json`), Analytics-Interpreter (Di) liest denselben Cache — spart einen API-Call
- Rework-Trigger: sowohl Monitor als auch Interpreter können Tickets schreiben. CEO dedupliziert via `ticket.trigger_source` + Merge wenn ≤ 7d alt
- Performance-Auditor weekly-Prod-Scan (CWV) + Analytics CWV-Fail-Rate korrelieren — wenn beide fail: hohe Konfidenz in Perf-Trigger

## Forbidden

- Content-Edits, Session-Replay, User-Attribution, Kausalität-als-Fakt, Single-Metric-Trigger
