# TOOLS — Retro-Audit-Agent

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit (read) | Full-Repo-Audit |
| Glob | `src/content/tools/**`, `dossiers/**`, `dist/**` | Enumeration |
| Grep | Projekt-weit (read) | Pattern-Audits |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/retro-audit-<YYYY-MM-DD>.md` | Audit-Report |
| Write | `memory/retro-audit-log.md` (append) | Log |
| Write | `memory/retro-audit-state.json` (update) | Trigger-State |
| Write | `inbox/to-user/systemic-drift-<check>.md` | Systemic-Alerts |
| Write | `inbox/to-user/check-script-missing-<id>.md` | Infra-Alerts |
| Write | `tasks/awaiting-critics/retro-audit-<date>/lock` | Lock |

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `bash evals/retro-audit/run-smoke.sh` | Pre-Run |
| `node scripts/retro/checks-for-section.mjs` | R3 Scope |
| `node scripts/retro/drift-audit.mjs` | Full-Audit |
| `node scripts/retro/aggregate-drift.mjs` | Drift-Vektor |
| Alle Critic-Check-Scripts (read-only-Invocation) | Re-run Checks |
| `jq`, `yq`, `date` | Utils |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only |
| Write in `src/**`, `dist/**`, `public/**`, `scripts/**`, `tests/**` | Kein Code, keine Test-Änderungen |
| Write in Rulebooks | User-only |
| Auto-dispatch von Rework-Tickets | User-Gate |
| Einzel-Tool-Edits | Builder-Scope |
| Rulebook-Hash eigenmächtig aktualisieren | CEO + User-Territorium |
| `npm install` | Dep-Change = User |

## Read-Only-Referenzen

- `docs/paperclip/EVIDENCE_REPORT.md`
- Alle Rulebooks (für Check-Set-Definition)
- `memory/rulebook-hashes.json`
