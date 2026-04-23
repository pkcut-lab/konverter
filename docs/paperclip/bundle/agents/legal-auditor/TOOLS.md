# TOOLS — Legal-Auditor

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/content/static-pages/**`, Rulebooks, `docs/paperclip/legal-rulings-log.md` | Impressum + Datenschutz + Rulings |
| Glob | `src/content/tools/**` | Tool-Typ-Enumeration für L7 |
| Grep | Projekt-weit (read-only) | Disclaimer-Scan |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/legal-auditor.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/legal-auditor.lock` | Lock |
| Write | `memory/legal-auditor-log.md` (append) | Regressions-Log |
| Write | `docs/paperclip/legal-rulings-log.md` (append-only) | Monthly-Sweep Updates |
| Write | `inbox/to-user/legal-ruling-<date>.md` | Rulings-Impact-Empfehlung |
| Write | `inbox/to-user/live-alarm-legal-<date>.md` | HIGH-Finding-Live-Alarm |
| Write | `inbox/to-ceo/*.md` | Drift, Clarifications |

## Allowed — Bash / Network

| Command | Zweck |
|---|---|
| `bash evals/legal-auditor/run-smoke.sh` | Pre-Review |
| `node scripts/impressum-check.mjs` | L1 |
| `node scripts/datenschutz-sections.mjs` | L2 |
| `node scripts/cookie-banner-check.mjs` | L4 |
| `node scripts/cmp-check.mjs` | L5 |
| `node scripts/legal-rulings-fetch.mjs` | Monthly Sweep |
| `curl -sI https://konverter-7qc.pages.dev/` | L9 HSTS |
| `WebFetch` to ssllabs.com, noyb.eu, dsgvo-portal.de, rsw.beck.de | Rulings + SSL-Grade |
| `grep`, `awk`, `jq`, `yq`, `stat`, `date` | Content-Parse |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only |
| Write in `src/**`, `public/**`, `scripts/**` | Kein Code |
| Write in `src/content/static-pages/**` | Legal-Text = User-Anwalts-Review |
| Write in Rulebooks (LEGAL-CHECKLIST.md, CLAUDE.md) | User-only |
| BGH-Rulings eigenmächtig enforcen | Empfehlung-only |
| US/CA-Rechtsfragen außer AdSense | Out-of-scope |
| AdSense-TOS-Overrides | User-Territorium |
| `npm install`, Commits | — |

## Read-Only-Referenzen

- `docs/paperclip/LEGAL-CHECKLIST.md` — authoritativ
- TMG / DDG / TTDSG / DSGVO (https://www.gesetze-im-internet.de/)
- Google AdSense Policies (https://support.google.com/adsense/answer/48182)
- noyb.eu, dsgvo-portal.de, rsw.beck.de (Rulings-Quellen)
- `docs/paperclip/legal-rulings-log.md` (Tracker)
