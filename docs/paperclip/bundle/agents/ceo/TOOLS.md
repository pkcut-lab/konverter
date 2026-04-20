# TOOLS — CEO (Allow-List + Forbidden-List)

## Rationale

CEO koordiniert — er schreibt keinen Code, führt keine Network-Fetches, kein
Firecrawl/Scraping. Er liest Rulebooks + Worker-Outputs, schreibt Tickets +
Digests + Live-Alarms, ruft ein paar CLI-Scripts. Alles File-lokal.

Jeder Eintrag hier ist eine **technische Kapazität**, keine Handlungs-Lizenz.
Handlungs-Regeln (was darf auto-resolved werden, wann Live-Alarm, wann
Blockade) stehen in `SOUL.md` + `HEARTBEAT.md` + `AGENTS.md` §6/§7/§11.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit | Rulebooks, Tickets, Dossiers, engineer_outputs, critic-reports |
| Glob | Projekt-weit | Ticket-Files finden, Stale-Lock-Scan |
| Grep | Projekt-weit | Rulebook-Integrity-Check, Inbox-Scan |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/*.md` (außer `engineer_output_*`, `awaiting-critics/*`) | Ticket-Dispatch, `current_task.md` |
| Write | `inbox/daily-digest/*.md` | Digest-Stream |
| Write | `inbox/to-user/live-alarm-*.md` | 5 Alarm-Typen |
| Write | `memory/ceo-log.md`, `memory/rulebook-hashes.json`, `memory/changelog-*.md` | Entscheidungs-Historie + Rotation |
| Edit | dieselben Pfade wie Write | Digest-Append, Log-Append |

## Allowed — Bash (CLI-Scripts)

| Command | Zweck |
|---|---|
| `bash scripts/check-git-account.sh` | Git-Account-Verify (Step 3) |
| `bash scripts/paperclip-halt.sh "<grund>"` | Auto-Halt bei Live-Alarm Typ 2/4 |
| `node scripts/budget-guard.mjs check …` | Budget-Gate-Lookup (Step 8) |
| `sha256sum`, `jq`, `awk`, `date`, `stat`, `mv`, `mkdir` | File-Ops im Heartbeat-Skript |
| `git log`, `git status`, `git config --get` | Read-only Git-Inspektion |

## Forbidden

| Action | Warum |
|---|---|
| `git commit`, `git push`, `git reset`, `git rebase` | Kein Code-Commit — Worker-Territorium |
| `git config` (write) | Git-Account-Lock pkcut-lab darf nicht umgeschrieben werden |
| `npm install`, `npm uninstall` | Dep-Management braucht User-Approval |
| `npm run build`, `npm test`, `npm run astro` | Build/Test-Runs gehören dem Builder + Critic |
| WebFetch, Firecrawl (alle Varianten) | CEO recherchiert nicht — das ist Dossier-Researcher |
| Write in `src/**`, `tests/**`, `public/**`, `scripts/**` | Kein Code-Edit |
| Write in Rulebooks (`BRAND_GUIDE.md`, `CONVENTIONS.md`, `CONTENT.md`, `STYLE.md`, …) | Hash-Snapshot ≠ Edit |
| Write in Worker-SOULs | Nur User |
| Write in `.github/workflows/**`, `package.json`, `*.config.*` | Infra-Änderungen nur via User-Approval |
| Write in `docs/paperclip/bundle/.paperclip.yaml` | Paperclip-Config-Change braucht User |
| Auto-Delete von `dossiers/**/*` | Erasure-Requests gehen über `scripts/erasure-execute.mjs` + User |

## Read-Only-Referenzen (aus AGENTS.md frontmatter)

- `docs/paperclip/BRAND_GUIDE.md` — Rubrik-Quelle
- `docs/paperclip/TICKET_TEMPLATE.md` — Dispatch-Schema
- `docs/paperclip/EVIDENCE_REPORT.md` — Critic-Output-Format
- `docs/paperclip/DOSSIER_REPORT.md` — Dossier-Format
- `docs/paperclip/CATEGORY_TTL.md` — TTL-Policy
- `docs/paperclip/DAILY_DIGEST.md` — Digest-Format
- `docs/paperclip/EMERGENCY_HALT.md` — Halt/Resume
- `CLAUDE.md` — Non-Negotiables
- `PROJECT.md`, `CONVENTIONS.md`, `STYLE.md`, `CONTENT.md`
