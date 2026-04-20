---
agentcompanies: v1
company: konverter
name: Konverter Webseite
description: >-
  Multilinguales Konverter-Webtool-Portal (Astro 5 SSG + Svelte 5 + Tailwind),
  Skalierungsziel 200–1000 Tools. Refined-Minimalism, pure-client, DSGVO-
  konform, AdSense ab Phase 2. Betrieben von einem einzelnen Menschen
  (pkcut-lab).
version: 1.0
license: MIT
primary_language: de
languages: [de]
launch_phase: 1

agents:
  - ceo
  - tool-builder
  - tool-dossier-researcher
  - merged-critic

primary_coordinator: ceo
heartbeat_cadence: 30m

rulebook_base: ../..
rulebooks:
  - path: ../../BRAND_GUIDE.md
    description: Rubrik-Quelle für merged-critic (§4 — 15 Checks)
  - path: ../../TICKET_TEMPLATE.md
    description: Ticket-Schema für CEO-Dispatches
  - path: ../../DOSSIER_REPORT.md
    description: Format-Standard für tool-dossier-researcher
  - path: ../../EVIDENCE_REPORT.md
    description: Format-Standard für merged-critic
  - path: ../../CATEGORY_TTL.md
    description: TTL-authoritative für Dossier-Refreshes
  - path: ../../DAILY_DIGEST.md
    description: Format für CEO-Digest-Stream
  - path: ../../EMERGENCY_HALT.md
    description: Halt/Resume-Procedure für Kill-Switch
  - path: ../../SKILLS.md
    description: Skill-Sequenz-Inventar (minimalist-ui → frontend-design → web-design-guidelines)
  - path: ../../README.md
    description: Kit-Übersicht
  - path: ../../../CLAUDE.md
    description: Non-Negotiables + Arbeitsprinzipien + Hard-Caps
  - path: ../../../CONVENTIONS.md
    description: Code-Regeln + Category-Taxonomie (14-Enum)
  - path: ../../../STYLE.md
    description: Visual-Tokens + SEO-Schema
  - path: ../../../CONTENT.md
    description: Frontmatter-Schema + H2-Pattern A/B/C
  - path: ../../../TRANSLATION.md
    description: i18n-Regeln (Phase 3+)
  - path: ../../../DESIGN.md
    description: Tool-Detail-Layout + Komponenten + Approved Baselines

runtime:
  tasks_root: ../../../../tasks
  memory_root: ../../../../memory
  dossier_root: ../../../../dossiers
  inbox_root: ../../../../inbox
  evals_root: ../../../../evals

halt_flag: ../../../../.paperclip/EMERGENCY_HALT
git_account_lock: pkcut-lab
---

# Company — Konverter Webseite

Vier-Rollen-Core für Phase 1–2:

| Slug | Rolle | Tier | Heartbeat |
|---|---|---|---|
| `ceo` | Coordinator | primary | 30m |
| `tool-dossier-researcher` | Research (Marktforschung) | worker | event-driven |
| `tool-builder` | Engineer (Code + Content) | worker | event-driven |
| `merged-critic` | QA-Review (15 Checks + 5 Soft-Warnings) | worker | event-driven |

CEO dispatcht Worker via `tasks/*-<id>.md`, Worker schreiben Outputs nach
`tasks/awaiting-critics/<id>/` resp. `tasks/engineer_output_<id>.md`. CEO
aggregiert im Heartbeat und entscheidet Autonomie-Gates (§7.15 Score-basierter
Auto-Resolve) oder Live-Alarm (5 Typen: Cost / Build-Fail-Cluster / Security /
Critic-Drift / EMERGENCY_HALT).

## Phase-Gates (data-driven)

- **Phase 2** (AdSense live): nach erstem grünen Tool + Stable-Metrics-Baseline
- **Phase 3** (+EN/ES/FR/PT-BR): Translator-Rolle aktiviert, Hreflang-Graph wächst
- **Phase 5** (bis 13 Sprachen): CTO-Rolle + Visual-QA-Split evaluieren
- **Rubric-Split** (merged-critic → design/content/a11y): Trigger sind data-driven
  (F1-Drift < 0.90 über 5 konsekutive Heartbeats, Rework-Rate > 25% über 20 Tickets,
  oder 50 aktive Tools Hard-Cap). Details in `agents/merged-critic/SOUL.md`.

## Non-Negotiables (aus CLAUDE.md §18)

1. Session-Continuity via Rulebooks
2. Privacy-First (kein Tracking ohne Consent, kein Server-Upload)
3. Quality-Gates (Build bricht ab bei fehlender Struktur)
4. Git-Account `pkcut-lab` only — DennisJedlicka verboten
5. AdSense erst Phase 2
6. Design-Approval vor Template-Extraction
7. Keine Network-Runtime-Deps (Ausnahme 7a: ML-File-Tools mit Worker-Fallback)
8. Kein thin Content (<300 Wörter abgelehnt)

## Kostenlos-Constraint (§7.16)

Enforced via `tasks/budgets.yaml` + `scripts/budget-guard.mjs` (Pre-Tool-Call-
Wrapper, fail-secure: fehlende Config → alle Calls blockiert). Keine
SerpAPI / Ahrefs / SEMrush. Firecrawl max 3 Calls/Ticket, Fallback nach
WebFetch-404.

## Erwartetes Format (agentcompanies/v1 — verify in Phase B)

Jeder Agent hat vier Files unter `agents/<slug>/`:

- `AGENTS.md` — YAML-Frontmatter + Prozedur-Body (Heartbeat-Sequenz, Build-Sequenz, etc.)
- `SOUL.md` — Persona, Werte, Live-Alarm-Regeln, Default-Actions
- `HEARTBEAT.md` — Tick-Procedure (per-Agent, nicht company-wide)
- `TOOLS.md` — Tool-Allow-List + Forbidden-List

Frontmatter-Schema siehe `agents/<slug>/AGENTS.md` — Best-Guess-v1, in Phase B
gegen `paperclipai company import --dry-run` verifiziert.
