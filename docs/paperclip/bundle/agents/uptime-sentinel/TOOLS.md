# TOOLS — Uptime-Sentinel

## Allowed — Read
- Read: `src/content/tools/**`, `docs/completed-tools.md`, `memory/uptime-sentinel-log.md`

## Allowed — Write
- Write: `memory/uptime-sentinel-log.md` (append)
- Write: `inbox/daily-digest/<date>.md` (append)
- Write: `inbox/to-user/live-alarm-uptime-<date>.md`, `inbox/to-user/live-alarm-dns.md`
- Write: `inbox/to-ceo/uptime-issue-<url>.md`, `inbox/to-ceo/cwv-regression-<date>.md`, `inbox/to-ceo/broken-links-<date>.md`

## Allowed — Network
- `curl` gegen `https://konverter-7qc.pages.dev/**` (read)
- Cloudflare Analytics GraphQL (read, rate-limited)

## Allowed — Bash
- `node scripts/uptime/cwv-rum-check.mjs`
- `node scripts/uptime/broken-link-scan.mjs`
- `curl`, `date`, `grep`, `awk`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, `public/**`, Rulebooks
- URL-Fixes, Link-Edits, CWV-Deep-Analysis
- Dep-Changes
- SEO-GEO-Monitor-Scope (Rankings + Citations)
