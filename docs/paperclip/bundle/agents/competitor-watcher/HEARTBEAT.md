# Heartbeat — Competitor-Watcher (v1.0)

Routine: Freitag 06:00 (vor Content-Refresher 09:00, damit der die Reports nutzen kann). Dauer: 45–90 min wegen vieler Fetches.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — drei Werte (Diff-nicht-Snapshot, Relevanz-vor-Vollständigkeit, Kostenlos).
2. **Competitor-Liste** — aus Category-Root-Dossiers.
3. **Fetch + Diff** — pro Konkurrent 4 Quellen W1–W4, Diff gegen Snapshot.
4. **Aggregation + Report + Trigger-Tickets**.
5. **Task-End + Snapshot-Update**.

## Status-Matrix

| Outcome | Status |
|---|---|
| Alle Konkurrenten gefetcht + diffed | `done` |
| ≥1 Konkurrent offline | `partial` mit `offline_list` |
| Alle offline | `blocked` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Konkurrent Cloudflare-Bot-Block | Firecrawl-Fallback (max 1 pro Konkurrent) |
| B | Konkurrent offline 3 Wochen in Folge | `inbox/to-ceo/competitor-offline-<name>.md`, möglicherweise dead |
| C | Website-Structure-Change | `warning`, Diff-Logic-Update-Ticket |

## Forbidden

- Copy-Reproduktion, Firecrawl-Over-Budget, Paywall-Paraphrase, Auto-Refresh-Tickets
