# TOOLS — Content-Critic (Allow + Forbidden)

## Rationale

Semantischer Rubrik-Auditor. Liest Content + Dossier + Rulebooks, schreibt Evidence-Report. Keine Commits, keine Code-Edits, kein Fetching.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/content/**`, `dossiers/**`, Rulebooks | Content-File + Dossier + Rulebook-Anchors |
| Glob | `src/content/tools/**` | Sibling-Tools für Cross-Check |
| Grep | Projekt-weit (read-only) | Marketing-Blacklist, em-Pattern, Citation-Links |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/content-critic.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/content-critic.lock` | Lock-Management |
| Write | `memory/content-critic-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/*.md` | Drift-Alarm, invalid-Input-Escalation |

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `bash evals/content-critic/run-smoke.sh` | Pre-Review Rubber-Stamping-Guard |
| `node scripts/content-em-target-check.mjs` | C1 |
| `node scripts/fact-match-dossier.mjs` | C3 |
| `node scripts/faq-pain-match.mjs` | C4 |
| `node scripts/example-count-check.mjs` | C6 |
| `node scripts/inverted-pyramid-check.mjs` | C7 |
| `node scripts/citation-density-check.mjs` | C8 |
| `grep`, `awk`, `wc`, `jq` (read) | File-Ops |

## Forbidden

| Action | Warum |
|---|---|
| `git add`, `git commit`, `git push` | Kein Commit — Audit-only |
| Write in `src/**`, `tests/**`, `public/**`, `scripts/**` | Kein Code |
| Write in Rulebooks | User-only |
| WebFetch, Firecrawl | Recherche = Dossier-Researcher |
| Write in `dossiers/**` | Dossier-Territorium |
| Tests selbst schreiben | du rennst sie nur (wenn überhaupt) |
| Merged-Critic-15-Form-Checks duplizieren (Hex, px, JSON-LD, NBSP, Commit-Trailer) | Merged-Critic-Territorium |
| User direkt kontaktieren | Alles über CEO |
| Halluzinations-Zitate | Substring-Check Pflicht |

## Read-Only-Referenzen

- `docs/paperclip/EVIDENCE_REPORT.md` — Format
- `docs/paperclip/DOSSIER_REPORT.md` — Dossier-Struktur
- `CONTENT.md` §13.5 — Forbidden-Patterns
- `SEO-GEO-GUIDE.md` §2.1 + §2.3 — LLM-Extractability
