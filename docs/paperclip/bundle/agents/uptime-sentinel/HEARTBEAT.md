# Heartbeat — Uptime-Sentinel (v1.0)

Routine-double: Täglich 05:00 (U1+U2), wöchentlich Sonntag 04:00 (U3+U4). Dauer: 2-5 min daily, 10-20 min weekly.

## Tick-Procedure Daily

1. **Identity** — drei Werte (Fast+Cheap, No-False-Positives, Low-Signal-to-Noise).
2. **U1 Tool-URL-Check** — curl alle Tool-URLs.
3. **U2 Sitemap/Robots/LLMs** — 3 Fetches.
4. **Consecutive-Fail-Analysis** — Vergleich mit gestrigem Log.
5. **Daily-Digest + Log** — OK-Line oder Issue-Tickets.

## Tick-Procedure Weekly

1. **U3 CWV-RUM** — Cloudflare Analytics, 2-Day-Consecutive-Threshold.
2. **U4 Broken-Internal-Link-Scan** — crawl + check.
3. **Alert + Log**.

## Status-Matrix

| Outcome | Status |
|---|---|
| All ok | `done` |
| 2-konsekutive Fail | `done` + CEO-Ticket |
| Sitemap/Robots/LLMs Fail | `done` + Live-Alarm |
| Cloudflare-API unreachable | `partial`, retry nächsten Run |

## Forbidden

- URL-Fixes, Link-Edits, CWV-Deep-Analysis, AI-Checks, Dep-Changes
