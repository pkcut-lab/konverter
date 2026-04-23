# Skills-Installation pro Rolle (v2.0, 2026-04-23)

> **Quellen:**
> 1. `https://github.com/paperclipai/paperclip` — offizielle Paperclip-Skills
> 2. `https://github.com/anthropics/skills` — Anthropics-Skills
> 3. `https://github.com/vercel-labs/agent-skills` — web-design-guidelines
> 4. leonxlnx/taste-skill — minimalist-ui
> 5. Community via `skills.sh` Marketplace

---

## Bereits global installiert (Stand 2026-04-23)

**Via User-Workspace (Memory):**
- `astro` — Framework-Best-Practices
- `schema-markup` — JSON-LD Injection
- `svelte-core-bestpractices` — Runes-only Patterns
- `frontend-design`, `minimalist-ui`, `web-design-guidelines` — Design-Trio
- `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`
- `find-skills`, `using-superpowers`
- `dispatching-parallel-agents`
- `test-driven-development`, `systematic-debugging`, `verification-before-completion`
- `karpathy-guidelines`

**Via Paperclip-Prep:**
- `paperclip` — Control-Plane API
- `paperclip-create-agent` — Governance-aware Hiring
- `para-memory-files` — PARA-Methode File-Memory
- `company-creator` — Company-Package-Scaffolding
- `design-guide` — Frontend-Komponenten-Design-System

## Zuordnung pro Rolle (v2.0 — 33 Agenten: 29 aktiv + 4 deferred)

### Core (v1.0)

#### ceo (opus-4-7)
- ✅ `paperclip` — API-Grundlage, PFLICHT
- ✅ `paperclip-create-agent` — Hiring-Workflows
- ✅ `para-memory-files` — `memory/ceo-log.md` + Rotation
- ✅ `writing-plans` — Ticket-Decomposition
- ✅ `brainstorming` — Feature-Diskussion vor neuem Tool-Typ

#### tool-builder (sonnet-4-6)
- ✅ `paperclip`
- ✅ `astro`, `svelte-core-bestpractices`, `schema-markup`
- ✅ `minimalist-ui` → `frontend-design` → `web-design-guidelines` (Hard-Sequenz)
- ✅ `design-guide`
- ✅ `test-driven-development`

#### tool-dossier-researcher (sonnet-4-6)
- ✅ `paperclip`
- ✅ `para-memory-files` — `memory/dossier-cache-index.md`

#### merged-critic (sonnet-4-6)
- ✅ `paperclip`
- ✅ `verification-before-completion`
- ✅ `web-design-guidelines`
- Kandidat: `prcheckloop` (Phase 2)

---

### Specialized Critics (v2.0)

#### content-critic (sonnet-4-6)
- ✅ `paperclip`
- ✅ `verification-before-completion`

#### design-critic (sonnet-4-6)
- ✅ `paperclip`
- ✅ `verification-before-completion`
- ⚠️ **NICHT** `minimalist-ui`/`frontend-design` — Skills sind Builder-exklusiv
- ✅ `web-design-guidelines` als Audit-Modus

#### a11y-auditor (sonnet-4-6)
- ✅ `paperclip`
- ✅ `verification-before-completion`
- Externer Dep: Playwright + axe-core

#### performance-auditor (sonnet-4-6)
- ✅ `paperclip`
- Externer Dep: Lighthouse-CLI, Playwright

#### security-auditor (sonnet-4-6)
- ✅ `paperclip`
- ✅ `systematic-debugging`
- Externer Dep: npm, Snyk

#### legal-auditor (opus-4-7)
- ✅ `paperclip`
- ✅ `para-memory-files` — `legal-rulings-log.md` Rotation

#### seo-auditor (sonnet-4-6)
- ✅ `paperclip`
- ✅ `schema-markup`
- Externer Dep: Google Search-Console API, Schema.org Validator

#### platform-engineer (sonnet-4-6)
- ✅ `paperclip`
- ✅ `systematic-debugging`
- Externer Dep: Playwright (Screenshot-Diff), Lighthouse-CI

---

### Research + Strategy (v2.0)

#### differenzierungs-researcher (opus-4-7)
- ✅ `paperclip`
- ✅ `para-memory-files`
- Externer Dep: Firecrawl MCP (max 3/ticket)

#### seo-geo-strategist (opus-4-7)
- ✅ `paperclip`
- ✅ `schema-markup`
- ✅ `brainstorming` (Creative Strategy)

#### seo-geo-monitor (sonnet-4-6)
- ✅ `paperclip`
- Externer Dep: GSC API (OAuth), Brave Search API, Perplexity API

#### analytics-interpreter (opus-4-7)
- ✅ `paperclip`
- ✅ `para-memory-files`
- Externer Dep: Cloudflare Analytics GraphQL, GSC API

#### competitor-watcher (sonnet-4-6)
- ✅ `paperclip`
- Externer Dep: Firecrawl MCP (1/Konkurrent/Woche), HN Algolia

#### faq-gap-finder (sonnet-4-6)
- ✅ `paperclip`
- Externer Dep: Brave API, AlsoAsked

#### internal-linking-strategist (opus-4-7)
- ✅ `paperclip`

---

### Workers + Auto-Enrichment (v2.0)

#### schema-markup-enricher (sonnet-4-6)
- ✅ `paperclip`
- ✅ `schema-markup`
- Externer Dep: Schema.org Validator

#### image-optimizer (sonnet-4-6)
- ✅ `paperclip`
- Externer Dep: `sharp-cli`

#### content-refresher (sonnet-4-6)
- ✅ `paperclip`
- ✅ `para-memory-files`

---

### Meta + Quality-Control (v2.0)

#### retro-audit-agent (sonnet-4-6)
- ✅ `paperclip`
- ✅ `para-memory-files`

#### cross-tool-consistency-auditor (sonnet-4-6)
- ✅ `paperclip`

#### conversion-critic (sonnet-4-6)
- ✅ `paperclip`
- Externer Dep: Playwright (Viewport-Emulation), Lighthouse

#### meta-reviewer (opus-4-7)
- ✅ `paperclip`
- ✅ `para-memory-files`

#### polish-agent (opus-4-7)
- ✅ `paperclip`
- ✅ `brainstorming` (Creative-Micro-Polish)

---

### Lightweight Routines (v2.0)

#### skill-scout (haiku-4-5)
- ✅ `paperclip`
- Externer Dep: `gh` CLI

#### uptime-sentinel (haiku-4-5)
- ✅ `paperclip`
- Externer Dep: Cloudflare Analytics GraphQL

---

### Phase 3+ (drafted)

#### translator (sonnet-4-6, phase 3)
- ✅ `paperclip`
- Kein spezifischer Skill — arbeitet direkt gegen `TRANSLATION.md` + Glossar

#### i18n-specialist (sonnet-4-6, phase 3)
- ✅ `paperclip`
- ✅ `verification-before-completion`

#### brand-voice-auditor (sonnet-4-6, phase 3)
- ✅ `paperclip`
- ✅ `verification-before-completion`

#### cto (opus-4-7, phase 3+)
- ✅ `paperclip`
- ✅ `writing-plans`
- ✅ `systematic-debugging`
- Kandidat: `pr-report`
- Kandidat: `engineering-skills` (bereits installiert)

---

## Bewusst NICHT installiert (aus Paperclip-Repo)

| Skill | Warum NICHT für uns |
|-------|---------------------|
| `paperclip-create-plugin` | Wir bauen keine Paperclip-Plugins (YAGNI) |
| `create-agent-adapter` | Wir nutzen Claude-Code-Adapter, nicht selbst bauen |
| `deal-with-security-advisory` | Nur für Paperclip-Maintainer |
| `release` | Paperclip-Release-Coordination, nicht unser Repo |
| `release-changelog` | Gleiches |
| `doc-maintenance` | Kandidat Phase 5+ wenn Docs driften |

## Phase-2-Evaluations-Kandidaten

Installieren wenn Skill-Scout-Agent einen Pain-Point matcht:
- **`prcheckloop`** — falls Deploy-CI-Checks häufig rot werden
- **`pr-report`** — falls Deep-PR-Analyse manuell zu lang dauert

```bash
# Later-install-Command (User-Approval)
npx skills add https://github.com/paperclipai/paperclip --skill prcheckloop --skill pr-report -g -y
```

## Installation-Commands (für Reproduzierbarkeit)

```bash
# Paperclip-Core (bereits gemacht 2026-04-19)
npx skills add https://github.com/paperclipai/paperclip \
  --skill paperclip \
  --skill paperclip-create-agent \
  --skill para-memory-files \
  --skill company-creator \
  --skill design-guide \
  -g -y
```

## Skill-Scout-Policy (v2.0)

Skill-Scout-Agent läuft wöchentlich (Mittwochs 09:00), prüft Marketplace, matcht gegen Pain-Points aus `memory/ceo-log.md` + `memory/*-critic-log.md`. Empfehlungs-Report: `inbox/to-user/skill-recommendations-<YYYY-WW>.md`. Install ist IMMER User-Approval-Gate.

## Security-Protokoll

Vor jeder `skills add`:
1. Security-Report sichten (skills.sh zeigt Gen/Socket/Snyk-Scores)
2. Bei `Med Risk` oder höher: GitHub-Repo-Source-Code-Review vor Install
3. Bei `1+ alerts` via Socket: Alert-Details prüfen
4. Nach Install: Dummy-Ticket-Test bevor produktives Assignment

**Paperclip-Suite Scan 2026-04-19 (unverändert, gültig):**
- paperclip: Med (Gen) / 0 alerts (Socket) / Med (Snyk) — akzeptiert
- paperclip-create-agent: Safe / 1 alert / Low — akzeptiert
- para-memory-files: Safe / 0 / Low — clean
- company-creator: Safe / 0 / Med — akzeptiert
- design-guide: Safe / 0 / Low — clean
