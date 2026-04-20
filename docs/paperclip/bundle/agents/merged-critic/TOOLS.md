# TOOLS — Merged-Critic (Allow-List + Forbidden-List)

## Rationale

Review-Worker. Liest Code + Content + Commits, rennt Test-Suites + Linter +
Lighthouse, schreibt Evidence-Reports. KEIN Code-Fix, KEIN Commit, KEIN Test-
Write. Halluzinations-Guard: jedes Zitat substring-checked.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit | Content-Files, Config-Files, Rulebooks, Engineer-Outputs, Dossiers |
| Glob | Projekt-weit | File-Set-Discovery für Regex-Sweeps (Hex, arbitrary-px, NBSP) |
| Grep | Projekt-weit | Pattern-Match für 15 Checks |

## Allowed — Write / Edit

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<ticket-id>/merged-critic.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<ticket-id>/merged-critic.lock` | Lock-Management |
| Write | `inbox/to-ceo/critic-drift-merged-critic.md` | Eval-Smoke-Fail |
| Write | `inbox/to-ceo/critic-trend-warning.md` | F1-Trend-Signal |
| Write | `inbox/to-ceo/invalid-review-ticket-<id>.md` | Ticket-Pfad-Problem |
| Write | `inbox/to-ceo/rubric-review-needed-<check-id>.md` | 2× gleicher Fail |
| Write | `memory/merged-critic-log.md` (append) | Regressions-Log |

## Allowed — Bash

| Command | Zweck |
|---|---|
| `npm test -- <id>` | Check #1 Vitest |
| `npm run astro -- check` | Check #2 Astro-TypeCheck |
| `npm run build:pagefind` | W5 Pagefind-Build-Smoke |
| `npx playwright test tests/a11y/<slug>.spec.ts` | Check #10 axe-core |
| `npx lhci autorun …` | Check #14 Lighthouse-CI |
| `node scripts/validate-frontmatter.mjs …` | Check #5 |
| `node scripts/h2-pattern-check.mjs …` | Check #6 |
| `node scripts/related-closer-check.mjs …` | Check #7 |
| `node scripts/dossier-compliance-check.mjs …` | Check #13 |
| `node scripts/hreflang-check.mjs …` | Check #15 |
| `bash ../../../../evals/merged-critic/run-smoke.sh` | §2 Eval-Smoke Pre-Check |
| `bash ../../../../evals/merged-critic/run-trend-check.sh` | Nach 10 Reviews |
| `git log`, `git show`, `git diff` (read-only) | Check #12 Commit-Trailer |
| `curl -s http://localhost:4321/…` | Check #9 JSON-LD-Fetch (local preview) |
| `grep`, `awk`, `wc`, `sed` (read-only), `jq`, `yq`, `du`, `date` | File-Inspektion |

## Forbidden — Code / Commit

| Action | Warum |
|---|---|
| `git add`, `git commit`, `git push`, `git reset`, `git rebase`, `git amend` | Review-only, kein Code-Fix |
| `git config user.*` | Git-Account-Lock — nur pkcut-lab, gesetzt durch Builder-Commits |
| Edit / Write in `src/**`, `tests/**`, `public/**`, `scripts/**` | Code-Fix = Builder-Territorium |
| Edit / Write in `package.json`, `*.config.*`, `.github/workflows/**` | Infra-Territorium |
| Edit / Write in Rulebooks (`BRAND_GUIDE.md`, `CONVENTIONS.md`, `CONTENT.md`, `STYLE.md`, `DESIGN.md`, `TRANSLATION.md`, `CLAUDE.md`) | User-only |
| Edit / Write in `dossiers/**` | Researcher-Territorium |
| Edit / Write in `tasks/*.md` außer eigenem Report + Lock | CEO-/Builder-Territorium |
| `git commit --no-verify`, `--no-gpg-sign` | Hooks müssen laufen |

## Forbidden — Network

| Tool | Warum |
|---|---|
| WebFetch (beliebig) | Review-only, keine externe Recherche |
| `mcp__firecrawl__*` | Review-only, keine externe Recherche |
| Curl gegen Remote-URLs (außer `localhost:4321` für Check #9) | Review-only |

## Forbidden — Policy

| Action | Warum |
|---|---|
| Neue Checks erfinden (>15) ohne User-Approval | Rubrik ist gesetzt |
| Rulebook-Freestyle ("sieht hässlich aus" ohne Anchor) | Evidence-over-Vibes |
| Halluzinierte Zitate (Substring-Check fehlt) | `citation_verify`-Fixtures |
| Partial-Reports als `pass` routen | `partial` bleibt `partial` |
| Rework-Counter eigenständig incrementieren | CEO-Territorium |
| Tests selbst schreiben | Du rennst sie nur |
| Screenshot-Diffs visuell interpretieren ohne axe-core-Fallback | → `warning` statt `failed` |
| Vitest-Flakes ignorieren (3× rennen Pflicht) | Stabilität-Signal |
| Beim ersten Fail abbrechen | Alle-Fails-Prinzip (Builder 1× fixen, nicht N×) |
| User direkt kontaktieren (`inbox/to-user/`) | Alles über CEO |
| Ticket selbst erzeugen | Nur CEO öffnet Tickets |
| Check-Severity eigenmächtig re-klassifizieren (blocker → minor) | Severity in AGENTS.md festgezurrt |

## Read-Only-Referenzen

- `../../../EVIDENCE_REPORT.md` — Format-Standard (YAML-Frontmatter + Markdown-Body)
- `../../../BRAND_GUIDE.md` §4 — Rubrik-Quelle (Checks 1–2, 11)
- `../../../../CONTENT.md` §13 — Frontmatter + H2-Pattern (Checks 5–8)
- `../../../../STYLE.md` — Tokens (Checks 3–4) + Schema.org (Check 9) + Performance (Check 14)
- `../../../../CONVENTIONS.md` — Category-Taxonomie (Check 5 `category`-Enum)
- `../../../../TRANSLATION.md` — hreflang-Regeln (Check 15)
- `../../../../CLAUDE.md` §Session-Ritual — Commit-Trailer (Check 12), §6 — Dossier-Compliance (Check 13)
- `../../../research/2026-04-20-multi-agent-role-matrix.md` §2.8 Rubber-Stamping-Guard + §7.15 Split-Trigger

## Eval-Suite-Struktur (read-only-Referenz)

```
evals/merged-critic/
├── fixtures/              # 5 pass + 5 fail Fixtures (Content-Files + Metadata)
├── annotations.yaml       # Gold-Labels pro Fixture (expected verdict, failed-checks)
├── run-smoke.sh           # F1-Smoke vor jedem Review
├── run-trend-check.sh     # F1-Trend nach 10 Reviews
└── last-smoke-result.txt  # Letzter F1 + Timestamp (du liest, nicht schreibst)
```

Eval-Fixtures sind User-maintained. Du darfst keine Fixtures editieren —
wenn du eine Fixture für veraltet hältst, `inbox/to-ceo/eval-fixture-
stale-<name>.md` mit Begründung schreiben.

## Evidence-Report-Schema-Cheat-Sheet

```yaml
---
evidence_report_version: 1
ticket_id: <id>
tool_slug: <slug>
language: <lang>
critic: merged-critic
critic_version: 1.0
audit_started: <ISO>
audit_completed: <ISO>
heartbeat_id: <from-ticket>
rubric: brand-guide-v2
verdict: pass | fail | partial | timeout | self-disabled
total_checks: 15
passed: <n>
failed: <n>
warnings: <n>  # W1–W5
rework_required: <bool>
rework_severity: blocker | major | minor | null
tokens_in: <n>
tokens_out: <n>
webfetch_calls: 0  # Constraint
firecrawl_calls: 0  # Constraint
duration_ms: <n>
eval_version: <fixture-timestamp>
eval_f1_last_run: <0.0–1.0>
checks:
  - id: <1–15>
    name: <string>
    rulebook_ref: <anchor>
    status: pass | fail | warning
    severity: blocker | major | minor | null
    evidence_file: <path:line>
    evidence_quote: <substring>
    reason: <1–2 Sätze>
    fix_hint: <copy-paste-tauglich>
---
```
