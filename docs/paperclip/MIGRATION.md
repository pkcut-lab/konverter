# MIGRATION.md — Folder-Layout-Plan vor `paperclipai init`

> **Status:** PLAN. Nicht ausführen, bevor Review-Gate 3 approved. Schritt-
> Reihenfolge ist sequenziell, jedes Stück separat committen.

## Zweck

`paperclipai@2026.416.0` erwartet `companies/<name>/<agent>/` als Root mit
pro-Agent 4 Kern-Files:

```
companies/konverter/
├── ceo/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── HEARTBEAT.md
├── tool-builder/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── HEARTBEAT.md
├── tool-dossier-researcher/
│   └── (wie oben)
└── merged-critic/
    └── (wie oben)
```

`$AGENT_HOME` = `companies/konverter/<agent>/`. Alle vier SOUL-Files
referenzieren bereits `$AGENT_HOME/TOOLS.md` (siehe
`souls/ceo.md:81`, `souls/merged-critic.md:108`, `souls/tool-builder.md:113`,
`souls/tool-dossier-researcher.md:82`) — das ist also eine Vorwärts-
Referenz auf die Ziel-Struktur.

## Ist-Zustand

```
docs/paperclip/
├── HEARTBEAT.md              ← Company-Level, 12-Step CEO-Loop
├── agents/
│   ├── _archived/
│   ├── ceo.md
│   ├── merged-critic.md
│   ├── tool-builder.md
│   └── tool-dossier-researcher.md
├── souls/
│   ├── _archived/
│   ├── ceo.md
│   ├── cto.md                ← nicht-core-4 (v1.0 draft)
│   ├── merged-critic.md
│   ├── seo-audit.md          ← nicht-core-4 (v1.0 draft)
│   ├── tool-builder.md
│   ├── tool-dossier-researcher.md
│   └── translator.md         ← nicht-core-4 (v1.0 draft)
├── BRAND_GUIDE.md
├── CATEGORY_TTL.md
├── DAILY_DIGEST.md
├── DOSSIER_REPORT.md
├── EMERGENCY_HALT.md
├── EVIDENCE_REPORT.md
├── ONBOARDING.md
├── README.md
├── SKILLS.md
├── TICKET_TEMPLATE.md
└── research/
    └── 2026-04-20-multi-agent-role-matrix.md
```

**Fehlt zur Ziel-Struktur:**

1. Kein `companies/konverter/<agent>/` Folder existiert.
2. Single-File-AGENTS vs. Paperclip-Erwartung pro-Agent.
3. `TOOLS.md` existiert für keinen Agent.
4. Company-Level-HEARTBEAT statt 4× per-Agent-HEARTBEAT. Default-
   Company (`paperclipai/paperclip` Repo `companies/default/ceo/HEARTBEAT.md`)
   zeigt: per-Agent-Tick-Procedure ist Standard, nicht Company-Level.

## Drei Varianten

### Variante A: **Move** (Empfohlen)

Files in neue Struktur umziehen. Git `mv` für History-Erhalt.

**Contra:**
- Alle bestehenden Referenzen (SKILLS.md, ONBOARDING.md, research-doc,
  CLAUDE.md, PROGRESS.md, commit-trailer in vorherigen Commits) brechen
  Pfade. Muss in einem einzigen Commit mitbehoben werden.
- Rulebook-Hash-Baseline in `.paperclip/rulebook.sha.lock` wird neu —
  HEARTBEAT.md §2 Step-1 sieht Drift und will User-Eskalation. → Baseline
  post-Move neu seed'en, vermerken in memory/halt-history.md.

**Pro:**
- Zero impedance-mismatch mit Paperclip. `$AGENT_HOME` funktioniert direkt.
- Per-Agent-HEARTBEAT.md + per-Agent-TOOLS.md passen nativ rein.
- Clean separation der nicht-core-4-SOULs (cto, seo-audit, translator) —
  die bleiben in einem `companies/konverter/_inactive/` Folder als
  Draft-Archiv, werden nicht scaffolded.
- Canonical Paperclip-Workflow: jeder `cat $AGENT_HOME/{AGENTS,SOUL,TOOLS}.md`
  funktioniert out-of-the-box.

### Variante B: **Symlink**

`companies/konverter/ceo/SOUL.md` → `../../docs/paperclip/souls/ceo.md`, etc.

**Contra (blocking):**
- **Windows-Platform** (system.platform=win32, `OS=Windows 11 Home`).
  Unprivileged Symlink-Creation ist Windows-feindlich (Developer-Mode
  nötig oder Admin-Terminal). Git-on-Windows erzeugt sie meist als
  Platzhalter-Files, bricht, wenn User ohne Developer-Mode klont.
- Per-Agent-HEARTBEAT.md + per-Agent-TOOLS.md müssen trotzdem existieren
  — Symlink löst nur das AGENTS/SOUL-Problem, nicht den Kernmangel.
- Git-diff + blame wird doppeldeutig (Ziel-Datei ändert sich, Symlink-
  Target-Path ändert sich).

**Pro:**
- `docs/paperclip/` bleibt als Working-Directory für Edits erhalten —
  Menschen editieren dort, Paperclip liest dort über Symlink.

**Verdict:** Windows-Fragilität disqualifiziert. Selbst ohne das hätten
wir nur halbes Problem gelöst.

### Variante C: **`--existing` / Custom Base-Dir Flag**

Prüfen, ob `paperclipai init` einen Flag hat, der einen alternativen
`$COMPANY_HOME`-Basis-Pfad akzeptiert (`paperclipai init konverter --base=docs/paperclip`).

**Status:** Unverifiziert. Die zugängliche Dokumentation
(`research/2026-04-20-multi-agent-role-matrix.md` Z.61–73, ONBOARDING.md
Z.20) erwähnt keinen solchen Flag. Im Paperclip-Repo
(`github.com/paperclipai/paperclip`) würde man das im CLI-Source
`bin/paperclipai.js` oder Root-`README.md` verifizieren. Das ist NICHT
Teil dieses Plans — kein `npm install` vor Review-Gate-3-Go.

**Wenn Flag existiert:** Variante C ist unschlagbar — keine Migration,
keine Breaking-Refs, kein Per-Agent-Multiplikator. Dann MIGRATION.md
abspecken auf „scaffolde TOOLS.md + per-Agent-HEARTBEAT.md in
`docs/paperclip/agents/<agent>/` und konfiguriere `--base`".

**Wenn Flag fehlt:** Variante A ist Default.

**Recommended action pre-Review-Gate-3:** User läuft einmal
`npx paperclipai@2026.416.0 init --help` (ohne tatsächlichen init) um
die CLI-Signatur zu sehen. 30 Sekunden Arbeit, entscheidet zwischen A
und C.

## Entscheidungs-Matrix

| Kriterium | A Move | B Symlink | C --existing-Flag |
|---|---|---|---|
| Paperclip-Kompat | ✅ native | ⚠️ filesystem-Magic | ✅ native |
| Windows-robust | ✅ | ❌ | ✅ |
| Referenz-Breakage | 🔴 viel | 🟡 wenig | 🟢 null |
| Per-Agent-HEARTBEAT/TOOLS | ✅ clean | 🔴 muss trotzdem | ✅ clean |
| Human-Edit-Ergonomie | ⚠️ neue Pfade | 🟢 doc/-Pfade bleiben | 🟢 doc/-Pfade bleiben |
| Vor-Prüfung nötig | nein | nein | **ja** (--help) |

**Default-Empfehlung:** Variante A, unless `paperclipai init --help`
bestätigt, dass Variante C verfügbar ist.

## Per-Agent-TOOLS.md — was gehört rein?

Paperclip-default-company's `tools.md` (aus Research-Doc §4) listet die
Tool-Allow-List pro Agent. In unserem Kontext:

| Agent | Erlaubte Tools (entwurf) |
|---|---|
| `ceo` | Bash (npm/git/scripts/*), Edit, Read, Grep, Glob, Write (inbox/, tasks/, memory/), WebFetch nur zur Link-Validation |
| `tool-builder` | Bash (npm test, npm run build), Edit, Read, Grep, Glob, Write (`src/lib/tools/`, `src/content/tools/`, `tests/lib/tools/`), KEIN WebFetch, KEIN Firecrawl |
| `tool-dossier-researcher` | WebFetch (budgeted), Firecrawl (budgeted via budget-guard), Read, Write (`tasks/dossiers/`), Grep, Glob, KEIN Edit auf `src/` |
| `merged-critic` | Read, Grep, Glob, Write nur auf `tasks/awaiting-critics/<ticket>/merged-critic.md`, KEIN Bash (außer `npm test` read-only), KEIN Edit auf `src/` |

Die Tabelle ist DRAFT — vor dem Write der TOOLS.md-Files prüfen gegen
Paperclip-Format (YAML-Liste? Markdown-Liste? `allow:` / `deny:` Keys?).
Default-Company's format ist Referenz.

## Per-Agent-HEARTBEAT.md — was gehört rein?

Paperclip-default-company's CEO-HEARTBEAT hat 8 Steps (unser CEO hat 12
in HEARTBEAT.md §2). Die anderen 3 Agenten brauchen eigene, kürzere
Tick-Procedures:

| Agent | Heartbeat-Inhalt |
|---|---|
| `ceo` | = jetziger `HEARTBEAT.md` §2 (12 Steps). Move als-is. |
| `tool-builder` | Read `current_task.md` → Write `task.lock` → implement 3 files → `npm test` → remove lock → Write `engineer_output.md`. 5-7 Steps. |
| `tool-dossier-researcher` | Read dispatch-ticket → Check `_cache/INDEX.yaml` für cache-hit → wenn cache-miss: Firecrawl+WebFetch via budget-guard → PII-scrub → write `tasks/dossiers/<slug>.dossier.md` → citation-verify. 6 Steps. |
| `merged-critic` | Read `engineer_output.md` → run 11-Punkte-Rubrik (BRAND_GUIDE §4) → compute verdict → write `tasks/awaiting-critics/<ticket>/merged-critic.md`. 3-4 Steps. |

Die drei Worker-HEARTBEAT-Files müssen NEU geschrieben werden — sie
existieren heute nicht. Das ist unabhängig von der Migrations-Variante
(auch in Variante C nötig).

## Execution-Plan (für Variante A, nach Review-Gate-3-Go)

**Sequenz, jeder Punkt = eigener Commit:**

1. `docs(paperclip): company-move — git mv agents/ + souls/`
   - `git mv docs/paperclip/agents/ceo.md companies/konverter/ceo/AGENTS.md` (× 4 core-roles)
   - `git mv docs/paperclip/souls/ceo.md companies/konverter/ceo/SOUL.md` (× 4)
   - `git mv docs/paperclip/HEARTBEAT.md companies/konverter/ceo/HEARTBEAT.md`
   - Non-core SOULs (`cto.md`, `seo-audit.md`, `translator.md`) →
     `companies/konverter/_inactive/<role>/SOUL.md`
   - `_archived/` Folder → `companies/konverter/_archived/`

2. `docs(paperclip): write per-agent TOOLS.md + HEARTBEAT.md`
   - 4× `TOOLS.md` (formats siehe "Per-Agent-TOOLS.md"-Sektion oben)
   - 3× Worker `HEARTBEAT.md` (für tool-builder, tool-dossier-researcher,
     merged-critic — CEO's HEARTBEAT wurde schon in Schritt 1 verschoben)

3. `docs(paperclip): update references after move`
   - Grep-and-replace für alle Pfad-Referenzen in:
     - `CLAUDE.md`
     - `PROGRESS.md`
     - `docs/paperclip/ONBOARDING.md` (neuer Pfad falls self-referencing)
     - `docs/paperclip/SKILLS.md`
     - `docs/paperclip/README.md`
     - `docs/paperclip/research/2026-04-20-multi-agent-role-matrix.md`
       (nur §6-Action-Items, Research-Body bleibt historisches Artefakt)
   - `MEMORY.md` in `C:\Users\carin\.claude\projects\...\memory\` —
     Projekt-Memory-Einträge checken und updaten.

4. `docs(paperclip): re-seed rulebook.sha.lock baseline`
   - `bash scripts/rulebook-hash.sh > .paperclip/rulebook.sha.lock`
     (Script existiert noch nicht — separater Commit vor diesem).
   - Vermerk in `memory/halt-history.md` unter
     `## YYYY-MM-DDTHH:MM:SS+02:00 | baseline-reseed | post-migration`.

5. `feat(paperclip): run paperclipai init (dry-run first if flag exists)`
   - `npx paperclipai@2026.416.0 init konverter --dry-run` (falls Flag) ODER
   - `npx paperclipai@2026.416.0 init konverter` direkt
   - Post-Init: verify `companies/konverter/<agent>/*` Files unverändert
     (kein unbeabsichtigter overwrite), git-status diff prüfen.

**Reversal-Plan** (wenn Variante A in Schritt 5 bricht): `git reset --hard HEAD~4` auf Commit-Head vor Schritt 1. Kein irreversibler Schritt bis Schritt 5.

## Smoke-Test-Target-Kandidat

Nach init: **`meter-zu-fuss`** als 4-Rollen-Pipeline-Smoke.

**Rationale:**
- Existiert bereits seit Session 5 (`src/lib/tools/meter-to-feet.ts` +
  `src/content/tools/meter-zu-fuss/de.md` + 4 Tests grün).
- Goldene Referenz vorhanden → Pipeline-Output gegen existierende Files
  diff-bar. Echter End-to-End-Test, nicht Blank-Page-Scaffolding.
- Kategorie `length` ist die best-abgedeckte (kilometer-zu-meilen + 4
  weitere Siblings) → Dossier-Cache kann category-level cached werden.
- Unique-Strategy-Flag: `differenzierung.applies: false` → kein Subagent-
  Research nötig, reiner Structural-Build-Test.

**Alternative (verworfen):** Brandneues Standard-Tool (`dezimeter-zu-fuss`).
Problem: keine Gold-Standard-Referenz → Pipeline-Output muss manuell
gereviewt werden, kein diff-basiertes „PASS oder nicht".

## Non-Goals

- **Kein** Move vor Review-Gate 3. Dieser File ist PLAN, nicht EXECUTE.
- **Kein** `npm install paperclipai` in diesem Commit.
- **Kein** Edit an existenten AGENTS/SOUL-Inhalten — nur Folder-
  Location ändert sich in Schritt 1.
- **Kein** neues Tool-Ticket bevor init + Smoke-Test durch.

## Referenzen

- `research/2026-04-20-multi-agent-role-matrix.md` §4.1 (Paperclip-Kern-
  Konzept), §6 Action-Items (Zeile 777 = dieser Migrations-Plan).
- `souls/*.md` Referenzen auf `$AGENT_HOME/TOOLS.md` (Zielpfad-Anker).
- `ONBOARDING.md` Z.20 (`paperclip init konverter`).
- Paperclip-Default-Company: `github.com/paperclipai/paperclip/
  tree/main/companies/default`.
