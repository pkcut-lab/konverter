# ANALYTICS-RUBRIC (v1.0, 2026-04-23)

> **Zweck:** Rubrik für datengetriebene Rework-Priorisierung. Analytics-Interpreter (Agent 16) liest RUM + Search Console + AI-Citation-Logs und triggert automatisch Rework-Tickets, wenn Thresholds gerissen werden.
>
> **Status:** binding ab Phase 2 (AdSense + Analytics live). Quell-Daten: Cloudflare Web Analytics, Google Search Console, Perplexity-Citation-Tracker (intern), Plausible (optional).

## §1. Primary Metrics (Pflicht-Tracking)

| Metric | Quelle | Baseline-Threshold | Rework-Trigger |
|---|---|---|---|
| **Bounce-Rate** | Cloudflare RUM | ≤55% | >70% über 14d |
| **CTR SERP** | Google Search Console | ≥2.5% (Position 5–10) | <1.5% über 28d |
| **Scroll-Depth 75%** | Cloudflare RUM | ≥40% | <25% über 14d |
| **Time-on-Page** | Cloudflare RUM | ≥45s (median) | <20s über 14d |
| **Tool-Usage-Event** | Custom (`dataset:tool-used`) | ≥30% of sessions | <15% über 14d |
| **Core-Web-Vitals Fail-Rate** | Cloudflare RUM | ≤10% p75 | >25% über 7d |
| **AdSense-RPM** (Phase 2+) | Google Ad Manager | tracking-only | — (kein Rework, nur Observe) |
| **AI-Citation-Rate** | Perplexity-Tracker (intern) | ≥15% | <5% über 90d |

## §2. Secondary Signals (nicht-Rework, nur Insights)

- **Organic Sessions (Monat)** — Trend-Tracking, Alert bei -30% MoM
- **Ad-Viewability** (Phase 2+) — ≥70% target
- **Impressions / 28d** — für Keyword-Gap-Erkennung
- **Click-Tiefe** (interne Clicks pro Session) — Topic-Cluster-Health
- **Return-Visitor-Rate** — Trust-Signal
- **Core-Query-Match-Rate** (Query vs. Tool-Title-Ähnlichkeit) — Content-Intent-Fit

## §3. Rework-Trigger-Matrix (Automatisch)

| Trigger | Priorität | Ticket-Type | Assignee |
|---|---|---|---|
| Bounce >70% + Scroll <25% (14d) | high | `tool-rework-ux` | tool-builder + cross-tool-consistency-auditor |
| CTR <1.5% (28d) | high | `tool-rework-serp` | seo-geo-strategist + content-refresher |
| Time-on-Page <20s | medium | `tool-rework-content` | faq-gap-finder + content-refresher |
| Tool-Usage-Event <15% | critical | `tool-rework-ui` | design-critic + conversion-critic |
| CWV-Fail >25% (7d) | critical | `tool-rework-perf` | performance-auditor |
| AI-Citation-Rate <5% (90d) | medium | `tool-rework-geo` | seo-geo-strategist |

**Dispatch-Regel:** Analytics-Interpreter öffnet EIN Ticket pro Tool pro Trigger; multiple Trigger für dasselbe Tool werden als Subtasks unter einem Parent-Ticket gebündelt (Priorität = max).

## §4. Success-Criteria nach Rework

Nach einem Rework-Ship:
- 14d Observation-Fenster
- Metriken müssen Threshold wieder einhalten (Bounce ≤55%, CTR ≥2.5%, …)
- Wenn nach 14d immer noch Violation: Escalate zu CEO → `inbox/to-user/persistent-underperformer-<slug>.md`
- User entscheidet: Rework-Cycle 2, Park (de-index + 404), oder Scope-Change

## §5. Priorisierungs-Score

Analytics-Interpreter berechnet wöchentlich einen **Rework-Score** pro Tool:

```
Rework-Score = (
  1.0 × (bounce_rate - 0.55) / 0.15    # Range 0..1 wenn Bounce zwischen 55-70%
  + 1.5 × max(0, 0.025 - ctr) / 0.025  # Stark gewichtet, CTR ist Revenue-Hebel
  + 1.0 × max(0, 0.40 - scroll_75) / 0.40
  + 2.0 × max(0, 1 - usage_rate / 0.30) # Tool-Usage ist Primär-KPI
  + 1.5 × cwv_fail_rate                 # User-Experience-Hebel
  - 0.5 × log10(organic_sessions_28d)   # Hohe Sessions = niedrigere Prio (Content funktioniert)
)
```

Top 5 Tools nach Score werden wöchentlich in Daily-Digest als „Rework-Candidates" aufgelistet (CEO entscheidet Dispatch).

## §6. Datenschutz & Sampling

- **Kein PII**: Cloudflare Analytics ist cookie-free, server-side. Keine IP-Persistenz, keine User-IDs.
- **Keine Session-Replay-Tools** (Hotjar/FullStory): DSGVO-Problem + §7.16 Kostenlos-Constraint.
- **Sampling:** RUM sammelt alle Sessions, Daten werden nach 30d aggregiert + unweighted, ältere Einzeldaten gelöscht.
- **Search Console API:** OAuth via User (nicht Agent-Auth). Abfrage max 1× täglich, Cached 23h.

## §7. Output-Format Analytics-Report

Analytics-Interpreter schreibt wöchentlich:

```yaml
# tasks/analytics-report-<YYYY-WW>.md
---
report_week: 2026-W17
generated_at: 2026-04-23T06:00:00Z
tools_analyzed: <n>
rework_candidates:
  - slug: <slug>
    score: <float>
    triggers: [bounce_high, ctr_low]
    ticket_dispatched: <ticket-id>
aggregate_trends:
  organic_sessions_mom: <%>
  ctr_avg_position: <float>
  cwv_fail_rate_p75: <%>
  ai_citation_rate_perplexity: <%>
insights:
  - category: length
    observation: "Length-Konverter haben +18% Sessions MoM — Topic-Authority baut sich auf"
  - category: color
    observation: "CTR niedriger als erwartet (1.8%), Meta-Descriptions zu generisch"
---
```

## §8. Referenzen

- `SEO-GEO-GUIDE.md` §2.4 (AI-SERP-Targets)
- `PERFORMANCE-BUDGET.md` §5 (CWV-Regression-Detection)
- Cloudflare Web Analytics (https://dash.cloudflare.com)
- Google Search Console API
- web.dev/vitals-tools
