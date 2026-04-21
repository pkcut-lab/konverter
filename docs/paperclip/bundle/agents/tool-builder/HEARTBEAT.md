# Heartbeat — Tool-Builder (v1.0)

Event-driven: Tool-Builder hat keinen fixen Intervall. Er wacht auf, wenn CEO
ein `tasks/tool-build-<id>.md`-Ticket dispatcht (und das Lock leer ist). Ein
Tick = ein Ticket von Start bis engineer_output. Typische Dauer: 15–40 min,
abhängig von Dossier-Umfang + Template-Divergenz.

## Tick-Procedure (6 Steps)

1. **Identity-Check** — `SOUL.md` lesen, drei Kernwerte reaktivieren (Template-
   Treue, Dossier-driven, Skill-Sequenz-Pflicht). Git-Account per
   `bash scripts/check-git-account.sh` verifizieren — SOFORT stop
   wenn nicht `pkcut-lab`.

2. **Ticket + Dossier laden** — `cat tasks/tool-build-<id>.md`. Pflicht-Felder:
   `dossier_ref`, `tool_slug`, `language`, `category`, `tool_type`. Fehlt eins
   → `inbox/to-ceo/missing-dossier-<id>.md` + Lock entfernen + exit. Dossier-
   File lesen, §Baseline + §White-Space + §User-Pain mental markieren — das
   informiert Test-Cases, FAQ-Auswahl, White-Space-Feature-Pick.

3. **Lock + Skill-Gate** — `echo "tool-builder|$(date -Iseconds)|<id>" > tasks/task.lock`.
   Wenn Ticket UI-Arbeit enthält (neue Komponente, Tool-Template-Änderung,
   Redesign): **BEVOR** Code geschrieben wird, Skill-Sequenz via `Skill`-Tool:
   `minimalist-ui` → `frontend-design`. Hard-Caps aus `CLAUDE.md` §5
   überstimmen jede Skill-Empfehlung (Graphit+Orange-Accent, Inter+JetBrains
   Mono, Tokens-only, AAA-Contrast).

4. **Build-Sequenz A→B→C** (Details `AGENTS.md` §2):
   - A: `src/lib/tools/<id>.ts` — Config (kein `icon`, kein `@iconPrompt`)
   - B: `tests/lib/tools/<id>.test.ts` — TDD-first: Red, dann Impl
   - C: `src/content/tools/<slug>/<lang>.md` — Frontmatter + H2-Pattern (A/B/C
     nach Tool-Typ) + ≥300 Wörter Prose + NBSP-religion + exakt 3 Closer-Bullets
   Zwischendurch `npm test -- <id>` und `npm run astro -- check` laufen lassen
   (exit 0 + 0/0/0 als Hard-Gate).

5. **Pre-Commit-Gate → Commit → engineer_output** — Drei Hard-Gates MÜSSEN
   grün sein, BEVOR `git commit` läuft. Lessons-Learned Audit 2026-04-21:
   ohne diese Gates landeten CVEs (astro 5.0.0 GHSA-wrwg-2hg8-v723) +
   Schema-Fails (unix-timestamp metaDescription 138 chars) + Test-Regressions
   in merged Commits.

   ```bash
   # Gate 5a — Full Prod-Build (fängt Collection-Schema, Route-Konflikte)
   npm run build || { echo "BLOCK — build fail"; exit 1; }

   # Gate 5b — npm audit high-severity (fängt CVE-Regressions bei Dep-Updates)
   npm audit --audit-level=high --production || { echo "BLOCK — high/critical CVE"; exit 1; }

   # Gate 5c — Full Test-Suite (nicht nur <id>-Tests; fängt Cross-Tool-Regressions)
   npm test || { echo "BLOCK — tests red"; exit 1; }
   ```

   Bei `BLOCK`: nicht committen, stattdessen `inbox/to-ceo/pre-commit-fail-<id>.md`
   mit Gate-Name + stderr-Tail + `rework_reason` schreiben. Lock NICHT entfernen,
   CEO entscheidet retry vs. escalate.

   Erst wenn 5a+5b+5c grün: `git add` der 3 Files + `git commit` mit Trailer
   `Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT`. NIEMALS `--no-verify`.
   Dann `tasks/engineer_output_<id>.md` mit YAML-Frontmatter schreiben
   (Pflicht-Felder: `dossier_applied.baseline_features`,
   `dossier_applied.white_space_feature`, `dossier_applied.user_pain_addressed`,
   `files_changed`, `tests`, `astro_check`, `build_ok: true`, `audit_ok: true`,
   `word_count`). Nach Skill-Sequenz (falls UI): `Skill: web-design-guidelines`
   als Audit-Pass auf die geänderten Dateien.

6. **Task-End + Post-Review-Gate** — `rm tasks/task.lock`. Exit. Warten auf
   CEO-Dispatch. Wenn ein Rework-Ticket reinkommt (`rework_counter` im Header):
   - `rework_counter ≤ 2` → EVIDENCE_REPORT des Critics lesen, NUR die in §Fails
     genannten Punkte fixen, neuen Commit mit Trailer `Rework-Reference:
     <previous-commit-sha>`, `engineer_output` überschreiben.
   - `rework_counter > 2` → nichts tun. CEO Auto-Resolve (§7.15 Score-Check).
     Lock entfernen, exit.

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | `dossier_ref` fehlt oder File nicht gefunden | `inbox/to-ceo/missing-dossier-<id>.md` + Lock lösen |
| B | Commit bricht wegen Git-Account-Hook | SOFORT stop, `inbox/to-ceo/git-account-fail-<id>.md`. **Kein** `--no-verify`. |
| C | Rulebook-Konflikt entdeckt (CONTENT.md §X vs BRAND_GUIDE.md §Y) | `inbox/to-ceo/rulebook-conflict-<id>.md`, Status `blocked` |
| D | Test nicht schreibbar weil Feature vage | `inbox/to-ceo/blocker-<id>.md` Typ D mit konkreten Unklarheiten |
| E | Pre-Commit-Gate 5a/5b/5c fail | `inbox/to-ceo/pre-commit-fail-<id>.md` mit Gate + stderr-Tail, Lock bleibt, kein Commit |

## Budget-Gate (Pre-Tool-Call)

Vor jedem teuren Tool-Call (derzeit nur Claude-API-Tokens für Text-Generierung
via Skill oder LLM-Assist):

```bash
node scripts/budget-guard.mjs check day tokens_in
# Exit 0 = OK, Exit 1 = BLOCKED
```

Fail-secure: Config missing → alle Calls blockiert (§7.16 hard-bound).
Tool-Builder macht KEINE Firecrawl- oder WebFetch-Aufrufe — das ist
Dossier-Researcher-Territorium.

## Skill-Sequenz-Reminder (Hard)

```
1. minimalist-ui           ← vor jedem UI-Code (warm-monochrome, flat Bento)
2. frontend-design         ← danach (Typografie, Whitespace, Motion)
3. Code schreiben
4. web-design-guidelines   ← nach Fertigstellung (Audit-Pass)
```

Hard-Caps (CLAUDE.md §5) überstimmen die Skills: Graphit+Orange-Accent,
Inter+JetBrains Mono aus `tokens.css`, Tokens-only (kein Hex, kein arbitrary-px),
Astro 5 SSG + Svelte 5 Runes (Skills schlagen oft React/Next.js vor — zu
Svelte-Runes umschreiben), AAA-Contrast ≥7:1.

## Memory-Update

Du hältst **kein** eigenes Memory-File. Jeder `engineer_output_<id>.md` IST das
Memory-Snippet für diesen Build. CEO aggregiert in `memory/ceo-log.md`.
