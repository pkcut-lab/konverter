# Paperclip — Agent-Bootstrap (v2.0, 2026-04-23)

**Status (ehrlich):** v2.0 — **33 Agent-Blueprints** (SOUL + AGENTS + HEARTBEAT + TOOLS) und **4 neue Rulebooks + 1 Schema-Doc** komplett. **Integration-Layer** (COMPANY.md / .paperclip.yaml) auf v2.0. **Aktivierung jedoch blockiert** durch **137 fehlende Scripts** (150 referenziert, 13 existent) und 32 fehlende Eval-Fixtures. Details in `GAPS-AND-NEXT-STEPS.md` + `SCRIPT-INVENTORY.md`.

> **Tranche-A abgeschlossen:** Blueprints + Rulebooks + Integration-Config + Meta-Docs (dieser State).
> **Tranche-B ausstehend:** Script-Implementation + Eval-Bootstrap + Per-Agent-Activation-Gate. **30–37 Sessions** für volle Phase-1+2 Aktivierung (Phase-1: 12 Sessions Scripts + 10 Sessions Evals; Phase-2: 10 Sessions Scripts + 5 Sessions Evals; siehe GAPS-AND-NEXT-STEPS §2).

**Was v2.0 neu bringt (gegenüber v1.0, 4 Agenten):**
- 8 Specialized Critics (content, design, a11y, perf, security, legal, seo, platform)
- 7 Research+Strategy (differenzierungs, seo-geo-strategist/monitor, analytics, competitor, faq-gap, internal-linking)
- 3 Auto-Enrichment-Workers (schema, image, content-refresher)
- 5 Meta+Quality (retro, consistency, conversion, meta-review, polish)
- 2 Lightweight-Routines (skill-scout, uptime-sentinel)
- 4 Phase-3-drafted (translator, i18n-specialist, brand-voice-auditor, cto) — in `COMPANY.md deferred_agents[]`, NICHT in active `agents[]`
- 4 neue Rulebooks (`SEO-GEO-GUIDE.md`, `PERFORMANCE-BUDGET.md`, `ANALYTICS-RUBRIC.md`, `LEGAL-CHECKLIST.md`) + `AGENTS-SCHEMA.md` (Frontmatter-Standard)
- Model-Strategy explicit: **Opus 4.7** (9 Agenten) / **Sonnet 4.6** (22 Agenten) / **Haiku 4.5** (2 Agenten)
- Phase-Gating via `.paperclip.yaml activation.phase_X_active`
- **13 Cron-Routinen** in `.paperclip.yaml routines[]`
- Per-Modell-Budget-Caps — **dokumentiert, noch nicht enforced** (siehe §Caveats)

**Warum jetzt schon Blueprint:** Claude-Max-20x macht Spec-Arbeit kostenlos. Blueprints + Rulebooks können entworfen werden, ohne Scripts zu schreiben. Tranche B ist Code-Implementation — das ist separat.

**Was NICHT importierbar ist — Stand 2026-04-23 (ehrlich):**
- `paperclipai company import docs/paperclip/bundle --dry-run` — **ungetestet** (`paperclipai` nicht im Workspace installiert, `which paperclipai → not found`). YAML ist syntaktisch plausibel, aber ob Paperclip-Parser v2.0-Keys (`activation.*`, `activation_gate`, `routines[]`, `models.assignments`, `api_caps`, `deferred_agents[]`) akzeptiert, ist **unverifiziert**
- `hire ceo` würde beim ersten Heartbeat versuchen, nicht-existierende Scripts aufzurufen (siehe `SCRIPT-INVENTORY.md`)
- **Activation-Gate** ist im YAML definiert; `scripts/validate-agent-activation.mjs` ist Stub (`exit 1` hard-fail) — blockt Aktivierung formal, bis Tranche B liefert

## Caveats (ehrlich)

| Claim | Realität |
|---|---|
| "13 Cron-Routinen registriert" | Registriert in `.paperclip.yaml routines[]`. **NICHT** bei Paperclip-API registriert — das passiert bei Activation. |
| "Per-Modell-Budget-Caps enforced" | Cap-Werte in `.paperclip.yaml budgets.per_model_monthly_cap`. **Enforcement** durch `scripts/budget-guard.mjs` ist v1.0 und kennt `per_model_monthly_cap` / `api_caps` / `forbidden_apis` NOCH NICHT — Extension-Task in Tranche B. |
| "activation_gate blockt Hiring" | Stub `scripts/validate-agent-activation.mjs` existiert und returned `exit 1` immer — also blockt es tatsächlich formal. Inhaltliche Validation (Scripts+Evals-Existenz) ist Tranche B. |
| "Forbidden-APIs (SerpAPI/Ahrefs/SEMrush/Moz) hard-blocked" | Nur per Agent-SOUL/TOOLS-`Forbidden`-Klausel dokumentiert (`_forbidden_apis_enforcement: doc-only`). Runtime-Block fehlt — Vertrauensbasis auf Agent-Disziplin bis Tranche B liefert. |
| "valid YAML" | Plausibel, aber `paperclipai`-Parser nicht verfügbar zum Verifizieren. |

Honest Path-to-Production: siehe `GAPS-AND-NEXT-STEPS.md`.

## Inhalt

| Datei | Zweck |
|-------|-------|
| `ONBOARDING.md` | Phase-2-Session-1 Bootstrap-Runbook |
| `BRAND_GUIDE.md` | Agent-lesbare Eval-Rubrik |
| `SEO-GEO-GUIDE.md` | **NEU v2.0** — SEO + GEO (Google + AI-SERPs), 24 Checks |
| `PERFORMANCE-BUDGET.md` | **NEU v2.0** — CWV + Bundle + Lighthouse |
| `ANALYTICS-RUBRIC.md` | **NEU v2.0** — RUM + GSC + Rework-Score |
| `LEGAL-CHECKLIST.md` | **NEU v2.0** — DSGVO + TMG + AdSense + BGH |
| `AGENTS-SCHEMA.md` | **NEU v2.0** — Frontmatter-Standard (budget_caps, activation_trigger, heartbeat, rulebook-Paths) |
| `SCRIPT-INVENTORY.md` | **NEU v2.0** — ehrliche Liste 150 referenzierter Scripts, 13 existent, 137 fehlend |
| `GAPS-AND-NEXT-STEPS.md` | **NEU v2.0** — Review-Response + Tranche-B-Plan + 3 Activation-Options |
| `legal-rulings-log.md` | **NEU v2.0** — BGH/EuGH/LG-Tracker mit 4 Baseline-Einträgen |
| `TICKET_TEMPLATE.md` | 1 Ticket = 1 Aktion |
| `DOSSIER_REPORT.md` | Format-Standard für Research-Agenten |
| `EVIDENCE_REPORT.md` | Format-Standard für Critics |
| `CATEGORY_TTL.md` | Per-Kategorie TTL |
| `DAILY_DIGEST.md` | CEO Digest-Format |
| `EMERGENCY_HALT.md` | Kill-Switch |
| `SKILLS.md` | **aktualisiert v2.0** — Skill-Zuordnung pro 33 Agenten |
| `bundle/COMPANY.md` | **aktualisiert v2.0** — 33 Agenten (29 aktiv + 4 deferred) + Phase-Gates |
| `bundle/.paperclip.yaml` | **aktualisiert v2.0** — Model-Strategy + Activation-Phases + 13 Routines |
| `bundle/agents/*/` | **33 Agent-Directories** mit SOUL + AGENTS + HEARTBEAT + TOOLS |

## Hard-Prerequisites

Vor Paperclip-Start MÜSSEN erfüllt sein:

1. **Template-Stabilität:** Mindestens 5 Tool-Typen live + gehärtet (Converter, Calculator, Generator, Formatter, Validator). Stand 2026-04-23: 1/5. Gate = Phase 1 Sessions 5–10 abgeschlossen.
2. **Eval-Rubrik:** `BRAND_GUIDE.md` in Agenten-Sprache (konkret, messbar).
3. **Rulebooks fixiert:** alle in `bundle/COMPANY.md` referenzierten Files unverändert.
4. **Git-Account-Lock aktiv:** `scripts/check-git-account.sh` läuft pre-commit.
5. **Test-Gate:** Jeder Tool-Commit `npm test` + `astro check` grün.
6. **Monthly-Spend-Cap:** $0 dank Max-20x, Budget-UI auf $0 als Tripwire.

## Activation-Checklist (Phase 2 Session 1, v2.0)

**Pre-Flight (MUSS vor Checkliste erfüllt sein):**
- [ ] Node.js ≥ 18 vorhanden (`node --version`)
- [ ] `paperclipai` CLI installiert — aktuell NICHT im Workspace (`which paperclipai → not found`). Install: `npm install -g paperclip-agents` + `@anthropic-ai/claude-code`. **Ohne dieses Pre-Flight scheitert jede Checkliste-Zeile darunter.**

**Aktivierung:**
- [ ] `paperclip init` in Projekt-Root
- [ ] `paperclipai company import docs/paperclip/bundle --dry-run` (Parser-Validierung für v2.0-Keys: `activation.*`, `routines[]`, `deferred_agents[]`, `models.assignments`, `api_caps`, `cap_precedence[]`)
- [ ] `paperclipai company import docs/paperclip/bundle` (echter Import wenn Dry-Run grün)
- [ ] Skills pro Agent laden via `SKILLS.md` (Agent-spezifische Zuordnung)
- [ ] Model-Strategy verifizieren (siehe `.paperclip.yaml models.assignments`)
- [ ] **Pre-Hire-Gate pro Agent:** `node scripts/validate-agent-activation.mjs <slug>` — MUSS `exit 0` liefern. Stub v0.1 returned aktuell immer `exit 1` → **alle Hirings blockieren bis Tranche-B den Validator ersetzt**
- [ ] CEO hiren als opus-4-7 (nur wenn Gate grün), 1 Testing-Ticket, Heartbeat 30 min
- [ ] Nach 3 grünen Heartbeat-Zyklen → Tool-Builder + Tool-Dossier-Researcher + Merged-Critic (sonnet-4-6)
- [ ] Nach 5 fertig gebauten Tools → Specialized Critics aktivieren (event-triggered)
- [ ] Phase 2 (AdSense + Analytics live) → Weekly-Routines + Post-Publish-Audits aktivieren
- [ ] Phase 3 (EN/ES/FR/PT-BR) → `deferred_agents[]` → `agents[]` promoten (siehe `GAPS-AND-NEXT-STEPS.md §B8`) + Translator/i18n/Brand-Voice/CTO hiren

## Model-Strategy (v2.0)

- **Opus 4.7** (9 Agenten) — Deep-Reasoning, Synthesis, Creative-Strategy
- **Sonnet 4.6** (22 Agenten) — Rubric-Execution, Code, Template-Fill, Routine-Research
- **Haiku 4.5** (2 Agenten) — Lightweight-Checks, HTTP-Probes

Detail: `bundle/COMPANY.md` + `bundle/.paperclip.yaml`.

## Budget-Strategie (v2.0)

Per `.paperclip.yaml`:
- Monthly-Cap: Opus 15M / Sonnet 30M / Haiku 5M Tokens = **50M total**
- Daily-Cap: 2M Tokens
- Firecrawl: max 3/Ticket, 60/Monat, 0 USD Cap (free-tier)
- Brave API: 2000/month (free)
- Perplexity: 5/min (free)

Fail-secure: Budget-Guard blockt teure Calls bei Config-Miss.

## Was Paperclip NICHT automatisiert

Menschliche Entscheidungen bleiben beim User:
- Brand-/Taste-Regel-Anpassungen (nur User editiert `BRAND_GUIDE.md`)
- Architektur-Entscheidungen, die Rulebooks ändern würden (Phase 1-2 User, Phase 3+ CTO-ADR → User-Approval)
- Deployment auf Production (CF-Pages-Secrets bleiben menschlich gated)
- Content-Approval bei sensiblen Tools (Persönlichkeitstest etc. — User-Review Pflicht)
- Legal-Text-Updates (User + Anwalts-Review, Legal-Auditor empfiehlt nur)
- Skill-Installation (Skill-Scout empfiehlt, User installiert)
- Rework-Tickets mit Rulebook-Kollision
- Dep-Updates (User + CTO-Review Phase 3+)

## Abgrenzung zu Claude-Code-Subagenten

| Aspekt | Claude-Code-Subagent (Phase 1) | Paperclip v2.0 (ab Phase 2) |
|--------|--------------------------------|------------------------|
| Coordination | Manuell, per Session | Heartbeat-getrieben, 24/7 |
| State | Session-lokal | File-based persistent |
| Parallelität | 1-3 Subagenten ad-hoc | **33 spezialisierte Agenten** (29 aktive + 4 Phase-3-deferred), phase-aktiviert |
| Model-Tiering | Pro Invocation vom User | Pro Agent festgelegt (Opus/Sonnet/Haiku) |
| Sweet Spot | Template-Validierung, komplexe Einzel-Tasks | Fan-out auf stabiles Template + Continuous-Improvement-Loops |

## Upgrade-Path v1.0 → v2.0

Wenn User v1.0 bereits aktiviert hat (nicht der Fall 2026-04-23, aber für Dokumentation):

1. **Replace Bundle:** `paperclipai company import docs/paperclip/bundle --replace`
2. **Neue Rulebooks referenzieren:** automatisch via `.paperclip.yaml`
3. **Activation-Phase bestätigen:** `.paperclip.yaml activation.phase_X_active` zeigt aktuelle Aktivierung
4. **Routines registrieren:** `.paperclip.yaml routines[]` hat alle Cron-Schedules, Paperclip-Routine-API
5. **Bestehende `memory/ceo-log.md` behalten** — v2.0 ist additiv, nicht disruptiv

## Research-Matrix (Original-Plan)

Detaillierte Begründung + Role-Matrix: `research/2026-04-20-multi-agent-role-matrix.md`. v2.0 implementiert alle dort drafted Rollen plus die neuen aus der User-Kritik vom 2026-04-23 (SEO-GEO-Strategist, SEO-GEO-Monitor, Analytics-Interpreter, Skill-Scout, Internal-Linking-Strategist, Cross-Tool-Consistency-Auditor, Conversion-Critic, FAQ-Gap-Finder, Schema-Markup-Enricher, Content-Refresher, Competitor-Watcher, Image-Optimizer, Meta-Reviewer, Polish-Agent, Brand-Voice-Auditor, Uptime-Sentinel).
