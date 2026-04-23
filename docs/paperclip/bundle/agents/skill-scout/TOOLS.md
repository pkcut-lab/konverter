# TOOLS — Skill-Scout

## Allowed — Read
- Read: `memory/**`, `docs/paperclip/SKILLS.md`
- Grep: `memory/**` (read)

## Allowed — Write
- Write: `inbox/to-user/skill-recommendations-<YYYY-WW>.md`
- Write: `memory/skill-scout-log.md` (append)
- Write: `tasks/awaiting-critics/skill-scout-<week>/lock`

## Allowed — Network
- `gh api repos/paperclipai/paperclip/contents/skills` (read)
- `gh api repos/anthropics/skills/contents` (read)
- `gh api repos/vercel-labs/agent-skills/contents` (read)
- WebFetch to `socket.dev`, `snyk.io`, `skills.sh` (Security-Scores, read)

## Allowed — Bash
- `node scripts/scout/pain-extract.mjs`
- `node scripts/scout/skill-match.mjs`
- `node scripts/scout/security-scan.mjs`
- `node scripts/scout/write-report.mjs`
- `gh`, `jq`, `comm`, `sort`, `uniq`

## Forbidden
- `git *`, `npm install`, `npx skills add` (auto-install)
- Write in `src/**`, `scripts/**`, `package*.json`
- Write in Rulebooks (SKILLS.md ist auto-regeneriert nur post-install)
- GitHub-Writes (PRs, Issues)
- Paid-Skill-Empfehlung
