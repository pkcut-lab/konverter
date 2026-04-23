# Heartbeat — Content-Refresher (v1.0)

Routine: Freitag 09:00 (nach SEO-GEO-Monitor Mo + Analytics Di + Retro-Audit monthly). Nutzt deren Output als Input. Dauer: 15–25 min.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — drei Werte (TTL-ist-Minimum, Refresh-vs-Rewrite, Trigger-Konsolidierung).
2. **Trigger-Sammlung** — 6 Quellen parallel.
3. **Konsolidierung** — pro Slug EIN Ticket.
4. **Skip-Filter** — Rework in-flight oder <30d alt.
5. **Ticket-Generation + Log**.

## Status-Matrix

| Outcome | Status |
|---|---|
| ≥1 Refresh-Ticket geöffnet | `done` |
| Keine Trigger | `done`, Digest-Note |
| Trigger-Quelle unreachable | `partial` |

## Forbidden

- Content-Edits, Rewrite-Tickets, Multi-Ticket-per-Tool, Dossier-Refresh-Dispatch
