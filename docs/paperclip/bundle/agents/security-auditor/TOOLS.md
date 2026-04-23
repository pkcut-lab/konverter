# TOOLS — Security-Auditor

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/**`, `dist/**`, `package*.json`, Rulebooks | Source + Build + Deps |
| Glob | Projekt-weit | CSPRNG-Grep-Discovery |
| Grep | Projekt-weit (read-only) | eval/Function/innerHTML-Scan |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/security-auditor.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/security-auditor.lock` | Lock |
| Write | `memory/security-auditor-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/*.md` | Drift, Dep-Change-Escalation |
| Write | `inbox/to-user/live-alarm-security-<date>.md` | HIGH-Finding Live-Alarm |

## Allowed — Bash

| Command | Zweck |
|---|---|
| `bash evals/security-auditor/run-smoke.sh` | Pre-Review |
| `npm audit --audit-level=high --production --json` | S2 |
| `node scripts/csp-check.mjs` | S1 |
| `node scripts/dep-freshness.mjs` | S10 |
| `grep -rE`, `jq`, `yq`, `awk` (read) | Scans |
| `curl -sI https://konverter-7qc.pages.dev/` | S11 HSTS (read-only Prod-Check) |

## Forbidden

| Action | Warum |
|---|---|
| `npm install`, `npm update`, `npm ci` | Dep-Change = User |
| `git *` | Audit-only |
| Write in `src/**`, `tests/**`, `public/**`, `package*.json` | Kein Code |
| Write in Rulebooks | User-only |
| CSP-Header-Edit (in `wrangler.toml` / `_headers`) | Cloudflare-Config = User |
| Silent-Ignore von CVEs (ohne `security-exceptions.yaml`-Eintrag) | Audit-Integrity |
| Aktive Exploit-Versuche (Pentests) | Scope = passive Audit |
| `eval()` jemals erlauben | harter Block |

## Read-Only-Referenzen

- OWASP Top 10 + Cheat Sheets
- `docs/paperclip/EVIDENCE_REPORT.md`
- `CLAUDE.md` §18 Non-Negotiables
- `security-exceptions.yaml` (User-kuratiert, Override-Liste)
