# TOOLS — Tool-Builder (Allow-List + Forbidden-List)

## Rationale

Tool-Builder schreibt Code + Content + Tests. Er liest Rulebooks + Dossiers,
schreibt in 3 Scopes (`src/lib/tools/`, `src/content/tools/`, `tests/lib/tools/`),
committet mit Trailer. Er macht KEINE Recherche-Calls — keine WebFetch, kein
Firecrawl. Recherche kommt über Dossier vom Researcher.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit | Rulebooks, Dossier, existierende Tools als Template-Referenz |
| Glob | Projekt-weit | Slug-Map, Sibling-Tools in Kategorie (für relatedTools) |
| Grep | Projekt-weit | Pattern-Match für H2-Konformität, NBSP-Vorkommen, Template-Precedent |

## Allowed — Write / Edit

| Tool | Scope | Warum |
|---|---|---|
| Write | `src/lib/tools/<id>.ts` | Config-File |
| Write | `src/content/tools/<slug>/<lang>.md` | Content-File |
| Write | `tests/lib/tools/<id>.test.ts` | Vitest |
| Write | `src/components/tools/**` | NUR bei explizitem User-Approval-Ticket (neue generische Komponente) |
| Write | `tasks/engineer_output_<id>.md` | Output-Contract |
| Write | `inbox/to-ceo/<blocker|missing-dossier|rulebook-conflict>-<id>.md` | Blocker-Escalation |
| Edit | dieselben Pfade wie Write | Rework-Fixes |

## Allowed — Bash

| Command | Zweck |
|---|---|
| `npm test -- <id>` | Vitest für Single-Tool |
| `npm run astro -- check` | Astro-TypeCheck (0/0/0) |
| `npm run build:pagefind` | Optional — nur wenn Content-Change Pagefind betrifft |
| `npm run nbsp:check` / `bash scripts/nbsp-check.sh` | NBSP-Religion-Guard |
| `git add <specific paths>`, `git commit -m` | Commit mit Trailer |
| `git log`, `git status`, `git diff` | Read-only Git-Inspektion |
| `bash scripts/check-git-account.sh` | Git-Account verifizieren |
| `node scripts/budget-guard.mjs check day tokens_in` | Pre-Tool-Call-Budget |
| `wc`, `grep`, `awk`, `sed` (read-only), `date` | File-Inspektion |

## Allowed — Skills (CLAUDE.md §5)

| Skill | Wann | Reihenfolge |
|---|---|---|
| `minimalist-ui` | Vor UI-Code (neue Komponente, Redesign) | 1 |
| `frontend-design` | Vor UI-Code, nach minimalist-ui | 2 |
| `web-design-guidelines` | Nach Code-Fertigstellung, als Audit | 3 |
| `astro` | Bei Astro-spezifischen Mustern | ad-hoc |
| `schema-markup` | Bei JSON-LD-Feinschliff | ad-hoc |
| `svelte-core-bestpractices` | Bei Svelte-Runes-Mustern | ad-hoc |

Hard-Caps der Rulebooks überstimmen JEDE Skill-Empfehlung.

## Forbidden

| Action | Warum |
|---|---|
| `git push`, `git reset --hard`, `git rebase` (interaktiv), `git amend` (pushed) | Push = CEO+User via Ready-to-Ship-Ticket |
| `git commit --no-verify` | Husky-Git-Account-Hook MUSS laufen |
| `git config user.*` | Git-Account-Lock pkcut-lab |
| `npm install`, `npm uninstall`, `package.json` edits | Dep-Change braucht User |
| Write in `src/components/**` außer `src/components/tools/` | Tool-Builder-Scope = nur tool-spezifische Komponenten |
| Write in `src/layouts/**`, `src/styles/**`, `src/lib/tokens*`, `Header`, `Footer`, `BaseLayout` | Design-System-Territorium |
| Write in `astro.config.*`, `vite.config.*`, `vitest.config.*`, `tsconfig.*` | Build-Config-Change braucht User |
| Write in `.github/workflows/**` | CI-Change braucht User |
| Write in Rulebooks (`BRAND_GUIDE.md`, `CONVENTIONS.md`, `CONTENT.md`, `STYLE.md`, `DESIGN.md`, `CLAUDE.md`, …) | Rulebooks sind User-only |
| Write `@iconPrompt`-JSDoc oder `icon`-Field | Runde 3 Session 4 — keine Tool-Icons mehr |
| WebFetch, Firecrawl (alle Varianten) | Recherche = Dossier-Researcher |
| Write in `dossiers/**`, `memory/**` (außer direkter Output) | Dossier-Territorium / CEO-Territorium |
| User direkt kontaktieren (inbox/to-user/) | ALLES über CEO |
| Ticket selbst erzeugen (`tasks/tool-build-*.md`) | Nur CEO öffnet Tickets |
| Rework > 2× eigenständig wiederholen | Nach Rework-Counter 2 entscheidet CEO |
| Build ohne `dossier_ref` starten | Hard-Gate §1 Step 2 |

## Read-Only-Referenzen

- `../../../BRAND_GUIDE.md` — Rubrik-Kriterien (für Self-Check vor Commit)
- `../../../DOSSIER_REPORT.md` — Format, den du liest
- `../../../EVIDENCE_REPORT.md` — Format, den du nach Critic-Review bekommst
- `../../../../CLAUDE.md` §1–6 — Arbeitsprinzipien, Skill-Sequenz, Differenzierungs-Check
- `../../../../CONVENTIONS.md` — Code + Category-Taxonomie (14-Enum)
- `../../../../CONTENT.md` §13 — Frontmatter (15 Felder) + H2-Pattern A/B/C
- `../../../../STYLE.md` — Visual-Tokens
- `../../../../DESIGN.md` §4–5 — Tool-Detail-Layout + Komponenten
