# Skills-Installation pro Rolle

> **Quellen:**
> 1. `https://github.com/paperclipai/paperclip` — offizielle Paperclip-Skills (13 verfügbar)
> 2. `https://github.com/anthropics/skills` — Anthropics-Skills (frontend-design, minimalist-ui, etc.)
> 3. `https://github.com/vercel-labs/agent-skills` — web-design-guidelines
> 4. leonxlnx/taste-skill — minimalist-ui
> 5. Community via `skills.sh` Marketplace

---

## Bereits global installiert (Stand 2026-04-19)

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

**Via dieser Session (Paperclip-Prep, 2026-04-19):**
- `paperclip` — Control-Plane API (Tasks, Comments, Routines)
- `paperclip-create-agent` — Governance-aware Hiring
- `para-memory-files` — PARA-Methode File-Memory (CEO-Memory-System)
- `company-creator` — Company-Package-Scaffolding (einmalig bei Onboarding)
- `design-guide` — Frontend-Komponenten-Design-System (nutzt mit frontend-design + web-design-guidelines)

## Zuordnung pro Rolle

### CEO (oberste Priorität)
- ✅ `paperclip` — API-Grundlage, PFLICHT
- ✅ `paperclip-create-agent` — Hiring-Workflows
- ✅ `para-memory-files` — `memory/ceo-log.md` + Rotation
- ✅ `writing-plans` — Ticket-Decomposition
- ✅ `brainstorming` — Feature-Diskussion vor neuem Tool-Typ

### Tool-Builder
- ✅ `paperclip` — Task-Status-Updates
- ✅ `astro` — bereits da
- ✅ `svelte-core-bestpractices` — bereits da
- ✅ `schema-markup` — bereits da
- ✅ `minimalist-ui` — Taste-Enforcement
- ✅ `frontend-design` — Form / Hierarchie
- ✅ `design-guide` — Paperclips eigener System-Guide (komplementär)
- ✅ `test-driven-development` — TDD-Light

### QA
- ✅ `paperclip` — Results-Posting
- ✅ `verification-before-completion` — 11-Punkte-Rubrik-Enforcement
- ✅ `web-design-guidelines` — Audit-Modus
- Kandidat: `prcheckloop` (Phase 2 evaluieren — iteriert CI-Checks bis grün)

### Visual-QA (Phase 3 Pflicht)
- ✅ `paperclip`
- ✅ `web-design-guidelines`
- Externer Dep: Playwright MCP (nicht skills.sh)

### Translator (Phase 3)
- ✅ `paperclip`
- Kein spezifischer Skill — arbeitet direkt gegen `TRANSLATION.md`

### SEO-Audit (Phase 2 optional, Phase 3 Pflicht)
- ✅ `paperclip`
- ✅ `schema-markup`
- ✅ `web-design-guidelines`
- Externer Dep: Lighthouse-CLI

### CTO (Phase 5 Pflicht, Phase 2 optional)
- ✅ `paperclip`
- ✅ `writing-plans`
- ✅ `systematic-debugging`
- Kandidat: `pr-report` (Phase 2 evaluieren — tiefe PR-Analyse)
- Kandidat: `engineering-skills` — bereits installiert, nutzt das

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

Installieren wenn beim ersten Heartbeat-Zyklus Nutzen klar wird:
- **`prcheckloop`** — falls Deploy-CI-Checks häufig rot werden und QA-Agent das nicht abfangen kann
- **`pr-report`** — falls CTO-Reviews manuell zu lang dauern; automatisiert Deep-PR-Analyse

```bash
# Later-install-Command
npx skills add https://github.com/paperclipai/paperclip --skill prcheckloop --skill pr-report -g -y
```

## Installation-Commands (für Reproduzierbarkeit / Recovery)

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

## Security-Protokoll

Vor jeder `skills add`:
1. Security-Report sichten (skills.sh zeigt Gen/Socket/Snyk-Scores)
2. Bei `Med Risk` oder höher: GitHub-Repo-Source-Code-Review vor Install
3. Bei `1+ alerts` via Socket: Alert-Details prüfen, User-Eskalation wenn Supply-Chain-Concern
4. Nach Install: Dummy-Ticket-Test bevor produktives Assignment

**Paperclip-Suite Scan 2026-04-19:**
- paperclip: Med (Gen) / 0 alerts (Socket) / Med (Snyk) — akzeptiert
- paperclip-create-agent: Safe / 1 alert / Low — akzeptiert (Alert = vermutlich Network-Permission für API-Calls, by-design)
- para-memory-files: Safe / 0 / Low — clean
- company-creator: Safe / 0 / Med — akzeptiert
- design-guide: Safe / 0 / Low — clean
