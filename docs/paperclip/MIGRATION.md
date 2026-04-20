# MIGRATION.md v2 — Bundle-Subpath für `paperclipai company import`

> **Supersedes:** `_archived/MIGRATION-v1-2026-04-20.md`. v1 nahm fälschlich
> `paperclipai init` als CLI-Kommando an. Empirischer Test + Research-Agent:
> `paperclipai init` existiert nicht. Die CLI nutzt `company import <path>`
> + `worktree init` + `configure`. Authoritatives Format ist
> `agentcompanies/v1` mit `COMPANY.md` hard-required + pro-Agent-Folder.

## CLI-Realität

**Kommandos (empirisch bestätigt):**
- `paperclipai configure` — Runtime-Config (telemetry, defaults). Muss VOR
  erstem Server-Start laufen. Telemetry wird auf `false` gesetzt (Scope
  unbekannt, mögliche strategische Metadaten-Leaks, reversibel).
- `paperclipai company import <path>` — Lädt eine Company aus
  `<path>/COMPANY.md` + `<path>/agents/<slug>/*.md`. Dry-Run-Flag wenn
  vorhanden → Phase B verifizieren.
- `paperclipai worktree init` — Runtime-Initialisierung nach erfolgreichem
  Company-Import. Erzeugt `tasks/`-Subfolder wenn nötig.

**Kein `paperclipai init`.** Ein solches Kommando existiert nicht. v1-Plan
(Variante A Move / Variante C --existing-Flag) sind daher obsolet.

## Format: `agentcompanies/v1`

```
<bundle-root>/
├── COMPANY.md                    ← hard-required, agentcompanies/v1
├── .paperclip.yaml               ← runtime-config (telemetry, cadence, paths)
└── agents/
    └── <slug>/
        ├── AGENTS.md             ← YAML-Frontmatter + Instructions-Body
        ├── SOUL.md               ← Persona / Werte / Live-Alarm-Regeln
        ├── HEARTBEAT.md          ← Tick-Procedure (per-Agent, nicht company)
        └── TOOLS.md              ← Tool-Allow-List
```

## Strategie: Bundle-Subpath

`docs/paperclip/bundle/` = die importable Unit. Sie enthält COMPANY.md +
agents/<slug>/ — das und NUR das gibt paperclipai zu lesen.

**Was außerhalb bleibt (shared rulebooks):**
- `docs/paperclip/BRAND_GUIDE.md`
- `docs/paperclip/TICKET_TEMPLATE.md`
- `docs/paperclip/DOSSIER_REPORT.md`
- `docs/paperclip/EVIDENCE_REPORT.md`
- `docs/paperclip/CATEGORY_TTL.md`
- `docs/paperclip/DAILY_DIGEST.md`
- `docs/paperclip/EMERGENCY_HALT.md`
- `docs/paperclip/SKILLS.md`, `ONBOARDING.md`, `README.md`
- `docs/paperclip/research/*`

Agent-Files im Bundle referenzieren diese Rulebooks mit relativen
Pfaden (`../../../BRAND_GUIDE.md`). Rulebook-Edits betreffen also alle
Agenten gleichzeitig, ohne dass Bundle-Inhalt berührt wird. Paperclip
liest Rulebooks als `read-only`-Context via `AGENTS.md`-Frontmatter-
Listen.

**Was isoliert bleibt (runtime):**
- `tasks/` — Runtime-State, Locks, Dossiers, Metrics. Nicht im Bundle,
  nicht in `docs/paperclip/`. Wird per `worktree init` angelegt (wenn
  noch nicht vorhanden — aktuell existiert nur `tasks/backlog/` +
  `tasks/budgets.yaml`, die bleiben).

**Vorteile vs. v1-Varianten:**
- Keine Git-`mv` der aktiven Rulebooks nötig — die bleiben am Ort.
- Paperclip-CLI kriegt exakt den Subpath, den es erwartet.
- Shared Rulebooks sind für Menschen + Worker gleich erreichbar, kein
  Dublett-Problem.
- Bundle kann versioniert importiert werden (zukünftige Tags/Branches).

## Phase A — Scaffold (dieser Commit-Batch, 3 Commits)

**Kein Code-Change, kein `npm install`, kein `paperclipai configure`.**

### Commit 1 — dieser Commit

- `docs/paperclip/MIGRATION.md` v2 (diese Datei)
- `docs/paperclip/_archived/MIGRATION-v1-2026-04-20.md` (v1, preserved)

### Commit 2 — Bundle-Scaffold

```
docs/paperclip/bundle/
├── COMPANY.md
├── .paperclip.yaml
└── agents/
    ├── ceo/                      ← SOUL + AGENTS inherited from existing files
    │   ├── AGENTS.md             + YAML frontmatter prepended
    │   ├── SOUL.md
    │   ├── HEARTBEAT.md          ← moved from docs/paperclip/HEARTBEAT.md
    │   └── TOOLS.md              ← NEU
    ├── tool-builder/
    │   ├── AGENTS.md             + frontmatter
    │   ├── SOUL.md
    │   ├── HEARTBEAT.md          ← NEU (5-7 Steps builder-tick)
    │   └── TOOLS.md              ← NEU (no WebFetch/Firecrawl)
    ├── tool-dossier-researcher/
    │   ├── AGENTS.md             + frontmatter
    │   ├── SOUL.md
    │   ├── HEARTBEAT.md          ← NEU (6 Steps, incl. cache-check)
    │   └── TOOLS.md              ← NEU (WebFetch+Firecrawl budgeted)
    └── merged-critic/
        ├── AGENTS.md             + frontmatter
        ├── SOUL.md
        ├── HEARTBEAT.md          ← NEU (3-4 Steps, rubric-run)
        └── TOOLS.md              ← NEU (Read-only)
```

**Frontmatter-Schema (Best-Guess, verify in Phase B):**
```yaml
---
agentcompanies: v1
slug: ceo
name: CEO
role: coordinator
tier: primary
heartbeat: 30m
can_dispatch: [tool-builder, tool-dossier-researcher, merged-critic]
rulebooks:
  - ../../../BRAND_GUIDE.md
  - ../../../TICKET_TEMPLATE.md
  - ../../../DAILY_DIGEST.md
  - ../../../EMERGENCY_HALT.md
---
```

### Commit 3 — Archive v1-Layout

- `git mv docs/paperclip/agents/ → docs/paperclip/_archived/agents-v1-layout/`
- `git mv docs/paperclip/souls/ → docs/paperclip/_archived/souls-v1-layout/`
- `git mv docs/paperclip/HEARTBEAT.md → docs/paperclip/_archived/HEARTBEAT-company-level-v1.md`
  (top-level HEARTBEAT ist redundant, sobald `bundle/agents/ceo/HEARTBEAT.md` existiert — Logik-Konsistenz)

**Nicht archiviert** (bleiben aktive Shared-Rulebooks):
`BRAND_GUIDE.md`, `CATEGORY_TTL.md`, `DAILY_DIGEST.md`, `DOSSIER_REPORT.md`,
`EMERGENCY_HALT.md`, `EVIDENCE_REPORT.md`, `ONBOARDING.md`, `README.md`,
`SKILLS.md`, `TICKET_TEMPLATE.md`, `research/`.

## Phase B — Dry-Run (nach Review-Gate 4)

1. `paperclipai configure`
   - Set `telemetry: false` (Scope unknown, reversibel)
   - Set default company: `konverter`
   - Set worktree-base: Projekt-Root
2. `paperclipai company import docs/paperclip/bundle --dry-run` (falls Flag)
   - Alternative: import in ephemeren temp-worktree
   - Verifiziere: Schema-Fehler, Pfad-Fehler, Rulebook-Referenzen aufgelöst
3. Fix-Cycle bei Fehlern (YAML-Frontmatter-Felder, Rulebook-Paths)
4. Review-Gate 4.1 (Dry-Run green) → Phase C

## Phase C — Real Import + Smoke-Test

1. `paperclipai company import docs/paperclip/bundle` (echter Import)
2. `paperclipai worktree init` (wenn erforderlich)
3. Erstes Ticket schreiben: `tasks/backlog/T-SMOKE-001-meter-zu-fuss.md`
   (tool-build, slug=meter-zu-fuss, existiert seit Session 5 als Gold)
4. Heartbeat triggern, Pipeline durchlaufen:
   - CEO dispatches
   - tool-dossier-researcher liefert (oder Cache-Hit bei length-category)
   - tool-builder baut 3 Files
   - merged-critic runs 11-Punkte-Rubrik
5. **Diff-Test:**
   ```bash
   git diff src/lib/tools/meter-to-feet.ts
   git diff src/content/tools/meter-zu-fuss/de.md
   git diff tests/lib/tools/meter-to-feet.test.ts
   ```
   Erwartet: inhaltliche Äquivalenz zu Gold (Frontmatter-Felder gleich,
   H2-Pattern A identisch, FAQ-Count stimmt, NBSPs an Zahl-Einheit-
   Paaren). Kein byte-genauer match erforderlich — Pipeline darf
   abweichen in Formulierung, solange Struktur-Checks grün.

## Entscheidungs-Matrix (für Transparenz)

| Kriterium | v1 Variante A | v1 Variante C | v2 Bundle-Subpath |
|---|---|---|---|
| CLI-Kompat | ❌ init existiert nicht | ❌ init existiert nicht | ✅ `company import` |
| Git-Move nötig | viel (Move-Plan) | null | minimal (nur agents/souls → _archived) |
| Shared Rulebooks | zerbrechen (Ref-Break) | intakt | intakt |
| Windows-robust | ✅ | ✅ | ✅ |
| Versionierbar | nein | nein | ✅ (bundle-subpath kann branched werden) |

## Offene Punkte (für Phase B)

1. **Frontmatter-Schema:** Exakte Felder-Liste + Pflicht/Optional-Markierung
   gegen `agentcompanies/v1`-Spec verifizieren. Best-Guess im Commit 2
   ist pragmatischer Startpunkt, nicht canonical.
2. **`.paperclip.yaml` Format:** Ob Top-Level-Keys (`company`, `telemetry`,
   `heartbeat`, …) oder nested — verify via `paperclipai configure --help`.
3. **Rulebook-Referenzen:** Ob Paperclip relative Pfade (`../../../*.md`)
   auflöst oder absolute verlangt. Fallback: Symlink `bundle/rulebooks/` →
   `../` (Windows-Fragilität beachten, dann Hardcopy).
4. **Telemetry-Default:** Eventuell ist `paperclipai` bereits opt-in und
   Telemetry steht default auf `false`. Trotzdem explizit setzen für
   Audit-Trail.
5. **Worktree-Verhalten:** `worktree init` vs. `worktree add <ticket>` —
   welcher Befehl erzeugt was. Research-Agent hat das nur am Rande
   berührt.

## Non-Goals

- **Kein** `npm install paperclipai` in Phase A.
- **Kein** `paperclipai`-Aufruf in Phase A (auch kein `--help`).
- **Keine** Rewrite des AGENTS/SOUL-Bodies in Phase A — nur
  Frontmatter prepended, Body unverändert übernommen.
- **Kein** Löschen alter Files ohne Archiv-Kopie.

## Referenzen

- `_archived/MIGRATION-v1-2026-04-20.md` — v1 (obsolete)
- `research/2026-04-20-multi-agent-role-matrix.md` §4 (Paperclip-
  Konzept, damals noch mit init-Annahme)
- `tasks/budgets.yaml` — Runtime-Enforcer, bleibt unberührt
- `scripts/budget-guard.mjs` — Pre-Tool-Call-Wrapper, bleibt unberührt
