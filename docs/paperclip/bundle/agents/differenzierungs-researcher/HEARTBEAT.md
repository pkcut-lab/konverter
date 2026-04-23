# Heartbeat — Differenzierungs-Researcher (v1.0)

Event-driven, lange Dauer (45–90 min) wegen Deep-Fetch + Opus-Synthese. Ein Tick = ein Research-Ticket. Kein Parallel-Running — Opus-Token-Budget ist signifikant.

## Tick-Procedure (8 Steps)

1. **Identity + Unique-Check** — `SOUL.md`, drei Werte. Parent-Dossier prüfen: `unique_tool=true` oder mismatch.
2. **Budget-Pre-Flight** — `node scripts/budget-guard.mjs` — prüft Tages-Token-Cap für Opus, Firecrawl-Monthly-Cap.
3. **Stufe 1 — Konkurrenz-USP-Tiefe** — Top 5 Konkurrenten, WebFetch Landing/Changelog/Pricing/Reviews. Details in `AGENTS.md §2`.
4. **Stufe 2 — User-Wishes-Quote-Mining** — Reddit/HN/PH/Trustpilot, PII-Scrub in-memory, Firecrawl max 3×. Details `AGENTS.md §3`.
5. **Stufe 3 — 2026-Trend-Hypothesen** — Chrome-Status/caniuse/web.dev. Filter gegen Hard-Constraints. Details `AGENTS.md §4`.
6. **Hypothesen-Synthese** — Opus-Reasoning aggregiert alle 3 Stufen, generiert `hypotheses[]` mit Evidence-Refs + Feature-Proposals. Details `AGENTS.md §5`.
7. **Citation-Verify + Cache-Index** — `scripts/citation-verify.mjs`. Bei fail: retry 1×, dann Park.
8. **CEO-Notify + Task-End** — `inbox/to-ceo/diff-research-complete-<slug>.md` + Lock entfernen.

## Verdict-Matrix

| Outcome | Verdict |
|---|---|
| 3 Stufen komplett, ≥2 Hypothesen, Citations verified | `ready` |
| ≥1 Stufe partial (Rate-Limit, Paywall) | `partial` mit `partial_stages: [1,2]` |
| Citation-Verify fail nach Retry | `citation_fail` |
| Tool nicht unique | `mismatch` |
| Budget-Guard blockt | `blocked_budget` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Cloudflare 429 (Reddit/HN) | Backoff 60s, retry 3× |
| B | Firecrawl-Budget erschöpft | Switch zu WebFetch-only, `partial_research`-Flag |
| C | Konkurrent-Paywall | `quelle: paywalled`, skip |
| D | Opus-Token-Cap für Synthesis | Komprimiere Stufe-Outputs (Top-3 statt Top-5 Konkurrenten) |
| E | Citation-Verify fail | Fix Zitate oder entfernen, 1× retry |

## Cross-Checks

- Dossier-Researcher (Rolle 12) liefert Parent-Dossier mit §2 Konkurrenz-Matrix — du nutzt das als Startpunkt, ergänzt Tiefe
- `§9 Differenzierungs-Hypothese` im Parent-Dossier referenziert deine Hypothesen-IDs (H1, H2, …)
- Tool-Builder liest PRIMÄR das Parent-Dossier, deine Deep-Research nur bei komplexen White-Space-Features

## Forbidden

- Standard-Tools researchen, Schablonen-Format, Firecrawl >3×, Hypothesen ohne Evidenz, PII-in-Body, Paraphrase von Paywall
