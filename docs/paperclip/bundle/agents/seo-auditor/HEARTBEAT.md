# Heartbeat — SEO-Auditor (v1.0)

Event-driven: wach nach Deploy-Success-Event. Routine: Weekly-Indexation-Check für kürzlich deployed Tools. Dauer: 5–10 min.

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Live-URL-nicht-Build, Rich-Results-Gold, Sitemap-Diff). `bash evals/seo-auditor/run-smoke.sh`.
2. **Deploy-Propagation** — `sleep 60` nach Ship-Event, damit Cloudflare-Edge propagiert.
3. **Lock + 10-Check-Sequenz** — SE1–SE10 gegen Live-URL. Details in `AGENTS.md §2`.
4. **Evidence-Report + Task-End** — Report schreiben, Log, Lock.
5. **Indexation-Follow-Up** — 7d später automatisch nachprüfen. Wenn indexed: digest-note. Wenn pending: CEO-Inbox.

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 10/10 | — | `pass` |
| 9/10 minor | 0 blocker | `partial` |
| ≥1 blocker | — | `fail` |
| Live-URL 404 (Cache-Lag) | — | `timeout`, 10min retry |
| Google-API unreachable | SE9 warning | — |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Cloudflare-Cache-Lag (Live-URL 404) | Retry 3×, sonst `timeout` |
| B | Rich-Results-API down | SE9 = `warning`, `skipped_reason: google-api-down` |
| C | Search-Console-OAuth expired | `inbox/to-user/gsc-oauth-refresh.md`, SE10 skipped |
| D | Sitemap fehlt Slug | `inbox/to-ceo/sitemap-missing-<slug>.md`, Build-Process prüfen |

## Cross-Checks

- SE4 + Merged-Critic #15 hreflang — Merged-Critic prüft Build-Output, SEO-Auditor prüft Live-URL. Beide sollten übereinstimmen.
- SE1–SE3 + Schema-Markup-Enricher — Enricher generiert, SEO-Auditor validiert.
- SE6 + Astro-Sitemap-Plugin — falls Diskrepanz: Build-Config-Problem, nicht Content-Problem.

## Forbidden

- Pre-Ship-Checks übernehmen, JSON-LD editieren, Sitemap editieren, Search-Console-Submit
