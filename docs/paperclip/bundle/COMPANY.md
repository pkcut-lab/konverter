---
agentcompanies: v1
company: kittokit
name: kittokit
description: >-
  kittokit — multilingualer Tool-Hub (Astro 5 SSG + Svelte 5 + Tailwind),
  Skalierungsziel 200–1000 Tools. Refined-Minimalism, pure-client, DSGVO-
  konform, AdSense ab Phase 2. Betrieben von einem einzelnen Menschen
  (pkcut-lab).
version: 2.0
license: MIT
primary_language: de
languages: [de]
launch_phase: 1

# 29 aktive Agenten in agents[] (Phase 1 + 2)
# 4 Phase-3-drafted in deferred_agents[] (NICHT hired bis current_phase = 3)
# Total: 33 Agent-Directories auf Platte
agents:
  # Core (v1.0, aktiv Phase 1)
  - ceo
  - tool-dossier-researcher
  - tool-builder
  - merged-critic

  # Specialized Critics (v2.0, Phase 1/2)
  - content-critic
  - design-critic
  - a11y-auditor
  - performance-auditor
  - security-auditor
  - legal-auditor
  - seo-auditor
  - platform-engineer

  # Research + Strategy (v2.0)
  - differenzierungs-researcher
  - seo-geo-strategist
  - seo-geo-monitor
  - analytics-interpreter
  - competitor-watcher
  - faq-gap-finder
  - internal-linking-strategist

  # Auto-Enrichment-Workers (v2.0, Phase 1)
  - schema-markup-enricher
  - image-optimizer
  - content-refresher

  # Meta + Quality-Control (v2.0, Phase 2)
  - retro-audit-agent
  - cross-tool-consistency-auditor
  - conversion-critic
  - meta-reviewer
  - polish-agent

  # Lightweight Routines (v2.0, Phase 2)
  - skill-scout
  - uptime-sentinel

# Phase-3-drafted Agenten — NICHT in agents[]. Ein stumpfer Paperclip-Loader
# der agents[] enumeriert, würde translator/cto nicht hiren. Erst bei
# current_phase>=3 wandert dieser Block in das aktive agents[]-Array
# (manuell durch User oder via `paperclipai company phase-advance 3`).
deferred_agents:
  - translator
  - i18n-specialist
  - brand-voice-auditor
  - cto

primary_coordinator: ceo
# SCOPE: dieser Default gilt NUR für coordinator-tier (CEO). Alle anderen
# Agenten tragen eigenes `heartbeat: event-driven` oder `heartbeat: routine`
# im Frontmatter + optional `heartbeat_cadence` (siehe AGENTS-SCHEMA §2.1).
# Paperclip soll diesen Wert NICHT als Fallback-Default für alle Agenten lesen.
heartbeat_cadence: 30m

# Phase-Gating — welche Agenten sind in welcher Phase aktiv?
# Paperclip liest diese Liste + Agent-Frontmatter `activation_phase`. Agent wird
# NUR gehired wenn sein Slug in der aktuellen Phase-Liste steht.
activation:
  phase_1_active:
    - ceo
    - tool-dossier-researcher
    - tool-builder
    - merged-critic
    # Specialized Critics event-triggered ab erstem Unique-Tool
    - content-critic
    - design-critic
    - a11y-auditor
    - performance-auditor
    - security-auditor
    - legal-auditor
    - platform-engineer
    - differenzierungs-researcher
    - seo-geo-strategist
    - schema-markup-enricher
    - image-optimizer
    - faq-gap-finder
  phase_2_active:
    # Alle Phase-1-Agenten + Post-Ship + Routinen
    - seo-auditor
    - seo-geo-monitor
    - analytics-interpreter
    - competitor-watcher
    - content-refresher
    - internal-linking-strategist
    - conversion-critic
    - retro-audit-agent
    - cross-tool-consistency-auditor
    - meta-reviewer
    - polish-agent
    - skill-scout
    - uptime-sentinel
  phase_3_active:
    # Multi-Language-Rollen + Architektur-Eskalation
    - translator
    - i18n-specialist
    - brand-voice-auditor
    - cto

# Modell-Strategie (v2.0) — explizit pro Agent statt Default
# Rationale in SOUL-Files jedes Agenten, hier konsolidiert:
# - Opus 4.7: Deep-Reasoning / Synthesis / Creative-Strategy (9 Agenten)
# - Sonnet 4.6: Rubric-Execution / Code / Template-Fill (22 Agenten)
# - Haiku 4.5: Lightweight-Checks / HTTP-Probes (2 Agenten)
model_strategy:
  opus_4_7:
    - ceo
    - legal-auditor
    - differenzierungs-researcher
    - seo-geo-strategist
    - analytics-interpreter
    - internal-linking-strategist
    - meta-reviewer
    - polish-agent
    - cto
  sonnet_4_6:
    - tool-dossier-researcher
    - tool-builder
    - merged-critic
    - content-critic
    - design-critic
    - a11y-auditor
    - performance-auditor
    - security-auditor
    - seo-auditor
    - platform-engineer
    - seo-geo-monitor
    - retro-audit-agent
    - cross-tool-consistency-auditor
    - conversion-critic
    - faq-gap-finder
    - schema-markup-enricher
    - image-optimizer
    - content-refresher
    - competitor-watcher
    - brand-voice-auditor
    - translator
    - i18n-specialist
  haiku_4_5:
    - skill-scout
    - uptime-sentinel

rulebook_base: ../..
rulebooks:
  # v1.0 Rulebooks
  - path: ../../BRAND_GUIDE.md
    description: Rubrik-Quelle für Critics (15 Checks)
  - path: ../../TICKET_TEMPLATE.md
    description: Ticket-Schema für CEO-Dispatches
  - path: ../../DOSSIER_REPORT.md
    description: Format-Standard für Research-Agenten
  - path: ../../EVIDENCE_REPORT.md
    description: Format-Standard für alle Critics
  - path: ../../CATEGORY_TTL.md
    description: TTL-authoritative für Dossier-Refreshes
  - path: ../../DAILY_DIGEST.md
    description: Format für CEO-Digest-Stream
  - path: ../../EMERGENCY_HALT.md
    description: Halt/Resume-Procedure für Kill-Switch
  - path: ../../SKILLS.md
    description: Skill-Sequenz-Inventar pro Agent
  - path: ../../README.md
    description: Kit-Übersicht

  # v2.0 NEU
  - path: ../../SEO-GEO-GUIDE.md
    description: SEO + GEO (Google + AI-SERPs), 24 Checks für seo-geo-strategist + seo-auditor
  - path: ../../PERFORMANCE-BUDGET.md
    description: CWV + Bundle + Lighthouse-Minima für performance-auditor
  - path: ../../ANALYTICS-RUBRIC.md
    description: RUM + GSC + Rework-Score für analytics-interpreter
  - path: ../../LEGAL-CHECKLIST.md
    description: DSGVO + TMG + AdSense + BGH-Rulings für legal-auditor
  - path: ../../AGENTS-SCHEMA.md
    description: Frontmatter-Standard (budget_caps, activation_trigger, heartbeat-Override)

  # Projekt-Rulebooks
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

# Company — kittokit (v2.0)

33 Agenten in 7 Kategorien. Activation phase-gated via `activation.phase_X_active` oben.

## Kategorien + Modell-Assignment

### Core (Phase 1) — 4 Agenten

| Slug | Tier | Modell | Heartbeat |
|---|---|---|---|
| `ceo` | primary | **opus-4-7** | 30m |
| `tool-dossier-researcher` | worker | sonnet-4-6 | event |
| `tool-builder` | worker | sonnet-4-6 | event |
| `merged-critic` | worker | sonnet-4-6 | event |

### Specialized Critics (Phase 1+, event-triggered) — 8 Agenten

| Slug | Modell | Trigger |
|---|---|---|
| `content-critic` | sonnet-4-6 | unique-tool OR merged-critic-split |
| `design-critic` | sonnet-4-6 | unique-tool OR custom-component |
| `a11y-auditor` | sonnet-4-6 | unique-tool OR release |
| `performance-auditor` | sonnet-4-6 | every-ship + weekly-prod |
| `security-auditor` | sonnet-4-6 | every-10-tools OR dep-change |
| `legal-auditor` | **opus-4-7** | every-release + monthly-rulings |
| `seo-auditor` | sonnet-4-6 | post-deploy + weekly-indexation |
| `platform-engineer` | sonnet-4-6 | shared-component-change |

### Research + Strategy (v2.0) — 7 Agenten

| Slug | Modell | Trigger |
|---|---|---|
| `differenzierungs-researcher` | **opus-4-7** | unique-strategy-dispatch |
| `seo-geo-strategist` | **opus-4-7** | every-ship-pre-publish |
| `seo-geo-monitor` | sonnet-4-6 | cron:weekly-mon |
| `analytics-interpreter` | **opus-4-7** | cron:weekly-tue |
| `competitor-watcher` | sonnet-4-6 | cron:weekly-fri |
| `faq-gap-finder` | sonnet-4-6 | pre-ship + cron:quarterly |
| `internal-linking-strategist` | **opus-4-7** | cron:weekly-thu |

### Auto-Enrichment-Workers — 3 Agenten

| Slug | Modell | Trigger |
|---|---|---|
| `schema-markup-enricher` | sonnet-4-6 | pre-build |
| `image-optimizer` | sonnet-4-6 | new-image OR image-tool-ship |
| `content-refresher` | sonnet-4-6 | cron:weekly-fri |

### Meta + Quality-Control — 5 Agenten

| Slug | Modell | Trigger |
|---|---|---|
| `retro-audit-agent` | sonnet-4-6 | every-20-tools OR cron:monthly-1st |
| `cross-tool-consistency-auditor` | sonnet-4-6 | cron:monthly OR 5th-tool-per-cat |
| `conversion-critic` | sonnet-4-6 | every-ship (Phase 2+) |
| `meta-reviewer` | **opus-4-7** | cron:monthly-15th |
| `polish-agent` | **opus-4-7** | post-critic-pass-score-80-94 |

### Lightweight Routines — 2 Agenten

| Slug | Modell | Trigger |
|---|---|---|
| `skill-scout` | **haiku-4-5** | cron:weekly-wed |
| `uptime-sentinel` | **haiku-4-5** | cron:daily + cron:weekly-sun |

### Phase-3-drafted (inaktiv bis Gate) — 4 Agenten

| Slug | Modell | Activation-Gate |
|---|---|---|
| `translator` | sonnet-4-6 | ≥2 Sprachen live |
| `i18n-specialist` | sonnet-4-6 | ≥2 Sprachen live |
| `brand-voice-auditor` | sonnet-4-6 | ≥2 Sprachen live |
| `cto` | **opus-4-7** | Architektur-Eskalations-Signal |

## Workflow-Topologie (Phase 2+)

```
Backlog → CEO → [Dossier-Researcher + optional Differenzierungs-Researcher]
              → [Schema-Enricher + Image-Optimizer pre-build]
              → Tool-Builder
              → [SEO-GEO-Strategist pre-publish]
              → [Merged-Critic | Split: Content/Design/a11y/Perf/Security]
              → Conversion-Critic (Phase 2+)
              → CEO-Aggregate
              → Platform-Engineer (bei shared-change) → Deploy
              → Post-Deploy: SEO-Auditor + Uptime-Sentinel
              → Zyklus-Audits: Retro-Audit (20-tool) + Meta-Reviewer (monthly) +
                Consistency-Auditor (5-tool-cat) + Legal-Auditor (release)
              → Weekly: SEO-GEO-Monitor + Analytics-Interpreter + Competitor-Watcher +
                Content-Refresher + Internal-Linking-Strategist + Skill-Scout
              → Analytics-Feedback-Loop → Rework-Trigger → Tool-Builder
              → Polish-Agent (optional, 80-94% Score)
```

## Phase-Gates (data-driven)

- **Phase 1** (aktuell): 16 Agenten aktiv (siehe `activation.phase_1_active`)
- **Phase 2** (AdSense + Analytics live): +13 Agenten (Routinen + Post-Ship)
- **Phase 3** (≥2 Sprachen): +4 Agenten (Translator + i18n + Brand-Voice + CTO)
- **Phase 5** (bis 13 Sprachen): CTO full activation, Visual-QA-Split evaluieren
- **Merged-Critic-Split**: F1-Drift < 0.90 über 5 HB, Rework-Rate > 25%/20 Tickets, oder 50 aktive Tools — Details in `agents/merged-critic/SOUL.md`

## Non-Negotiables (aus CLAUDE.md §18)

1. Session-Continuity via Rulebooks
2. Privacy-First (kein Tracking ohne Consent, kein Server-Upload)
3. Quality-Gates (Build bricht ab bei fehlender Struktur)
4. Git-Account `pkcut-lab` only — DennisJedlicka verboten
5. AdSense erst Phase 2
6. Design-Approval vor Template-Extraction
7. Keine Network-Runtime-Deps (Ausnahme 7a: ML-File-Tools mit Worker-Fallback)
8. Kein thin Content (<300 Wörter abgelehnt)

## Platform-Conventions (Windows-first)

**Python-Interpreter-Aufruf.** Jeder Agent MUSS `py` (Python-Launcher) statt
`python` oder `python3` verwenden. Grund: Windows 11 hat `python.exe` + `python3.exe`
als App-Execution-Aliases unter `C:\Users\<user>\AppData\Local\Microsoft\WindowsApps\`,
die Symlinks auf `AppInstallerPythonRedirector.exe` sind → **öffnen den Microsoft
Store** statt Python auszuführen (wenn die Aliases aktiv sind). `py` ist der
offizielle Python-Launcher und umgeht den Stub.

- ✅ `py scripts/foo.py`, `py -c "print(1)"`, `py -3 -m pip install …`
- ❌ `python3 scripts/foo.py`, `python -c "…"`, `#!/usr/bin/env python3`-Shebangs
- ✅ Shebangs: `#!/usr/bin/env py`

Gilt für ALLE Agenten in Bash/MSYS-Commands, Shebangs in `.py`-Dateien unter
`scripts/`, und inline-`py`-Aufrufe in AGENTS.md-Procedure-Blöcken.

## Kostenlos-Constraint (§7.16)

Enforced via `tasks/budgets.yaml` + `scripts/budget-guard.mjs` (Pre-Tool-Call-Wrapper, fail-secure). Keine SerpAPI / Ahrefs / SEMrush. Firecrawl max 3 Calls/Ticket. Brave API 2000/month. Perplexity 5/min.

## Agent-File-Format (unverändert v1.0 → v2.0)

Jeder Agent hat vier Files unter `agents/<slug>/`:
- `AGENTS.md` — YAML-Frontmatter + Prozedur-Body
- `SOUL.md` — Persona + Werte + Default-Actions + Model
- `HEARTBEAT.md` — Tick-Procedure
- `TOOLS.md` — Allow + Forbidden-Liste

Frontmatter-Schema-Standard: `AGENTS-SCHEMA.md` (NEU v2.0).

## Aktueller Bundle-Status (2026-04-23, ehrlich)

**v2.0 Blueprints komplett**, Aktivierung jedoch **NICHT sofort möglich**:
- ✅ 33 Agent-Directories komplett (SOUL + AGENTS + HEARTBEAT + TOOLS)
- ✅ 4 neue Rulebooks (SEO-GEO-GUIDE, PERFORMANCE-BUDGET, ANALYTICS-RUBRIC, LEGAL-CHECKLIST)
- ✅ COMPANY.md + .paperclip.yaml v2.0
- ⚠️ **Evals fehlen** für alle 29 neuen Agenten (`evals/<agent>/run-smoke.sh`)
- ⚠️ **~80+ referenzierte Scripts fehlen** (`scripts/seo/*`, `scripts/geo/*`, `scripts/refresh/*`, …). Inventar: `SCRIPT-INVENTORY.md`
- ⚠️ **Differenzierungs-Check pro Agent (CLAUDE.md §6)** nicht rückwirkend angewendet — Agent-Auswahl basiert auf Role-Matrix v1.0 + User-Prioritäten 2026-04-23, nicht auf pro-Agent Competitor/User-Wish/Trend-Analyse
- ⚠️ **Script-Implementation + Eval-Bootstrap = Tranche B** (5–10 Sessions, nicht diese Session)

Details in `GAPS-AND-NEXT-STEPS.md`.
