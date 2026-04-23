# TOOLS — Design-Critic (Allow + Forbidden)

## Rationale

Visual-Policy-Auditor. Liest Components + Styles + Screenshots, schreibt Evidence-Report. Keine Commits, keine Skill-Invocations (Skills sind Builder-Territorium).

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/components/**`, `src/layouts/**`, `src/styles/**`, Rulebooks | Components + Tokens |
| Glob | `src/**/*.svelte`, `src/**/*.astro`, `src/**/*.css` | File-Discovery |
| Grep | Projekt-weit (read-only) | Forbidden-Pattern-Detection |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/design-critic.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/design-critic.lock` | Lock |
| Write | `memory/design-critic-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/*.md` | Drift-Alarm, Skill-Misinterpretation-Hinweis |

## Allowed — Bash / Playwright

| Command | Zweck |
|---|---|
| `bash evals/design-critic/run-smoke.sh` | Pre-Review |
| `node scripts/design-primary-button-color.mjs` | D6 |
| `node scripts/design-accent-scope.mjs` | D7 |
| `node scripts/reduced-motion-check.mjs` | D9 |
| `npx playwright test tests/a11y/*-contrast.spec.ts` | D10 Contrast-Stichprobe |
| `grep`, `awk`, `wc` (read) | File-Ops |

## Forbidden

| Action | Warum |
|---|---|
| `git add`, `git commit`, `git push` | Audit-only |
| Write in `src/**`, `tests/**`, `public/**` | Kein Code |
| `Skill` tool (minimalist-ui, frontend-design, web-design-guidelines, impeccable) | Skills = Builder-Domäne |
| WebFetch, Firecrawl | Recherche = Dossier-Researcher |
| Write in Rulebooks (STYLE.md, DESIGN.md) | User-only |
| Form-Review (Typography-Hierarchy, Whitespace-Rhythm) | Skill-Domäne, nicht Policy |
| Ambiguous Screenshot-Interpretation als `fail` | muss `warning` sein |
| Merged-Critic-#3/#4-Checks duplizieren wenn NICHT aktiv | Doppelaudit-Verbot |

## Read-Only-Referenzen

- `STYLE.md` §Tokens, §Motion, §Radii
- `DESIGN.md` §4 Layout, §5 Komponenten
- `CLAUDE.md` §5 Hard-Caps + Runde-3-Lockerung
- `docs/paperclip/EVIDENCE_REPORT.md`
