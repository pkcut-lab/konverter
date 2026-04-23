# Heartbeat — FAQ-Gap-Finder (v1.0)

Event-driven (Pre-Tool-Ship) + routine (quartalsweise Refresh aller Tools). Dauer: 5–15 min pro Tool.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — drei Werte (Evidence, Kostenlos, Match-Quality).
2. **Mining** — Google-Suggest + Brave-PAA + AlsoAsked.
3. **Current-FAQ-Extract** — aus Tool-Content.
4. **Gap-Analysis + Scoring** — Frequency + Volume-Proxy.
5. **Report + CEO-Notify** — wenn ≥2 high-priority Gaps.

## Status-Matrix

| Outcome | Status |
|---|---|
| ≥1 Gap mit high-priority gefunden | `done` + Ticket |
| Keine Gaps | `done`, Digest-Note |
| Brave API 429 | `partial`, retry-after 60s, max 3× |
| Alle APIs fail | `blocked` |

## Cross-Checks

- Dossier-Researcher §6 Keyword-Blueprint (Primary + Secondary + PAA) — FAQ-Gap-Finder validiert nach Ship, ob tatsächliche PAA-Landschaft das matcht, was Dossier prognostiziert hat
- Content-Refresher — nutzt FAQ-Gap-Findings als Refresh-Trigger

## Forbidden

- Content-Edits, Answer-Writes, kostenpflichtige SEO-Tools, Direct-Google-Scraping
