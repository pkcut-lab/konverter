# TOOLS — Conversion-Critic

## Allowed — Read
- Read: `src/components/tools/**`, `dist/**`, `src/layouts/**`, Rulebooks
- Glob: `dist/<lang>/**`
- Grep: `src/components/**`, `dist/**` (read)

## Allowed — Write
- Write: `tasks/awaiting-critics/<id>/conversion-critic.md`
- Write: `tasks/awaiting-critics/<id>/conversion-critic.lock`
- Write: `memory/conversion-critic-log.md` (append)
- Write: `inbox/to-ceo/*.md`

## Allowed — Bash / Playwright
- `npm run build`, `npx astro preview`
- `npx playwright test tests/conversion/*.spec.ts`
- `node scripts/conversion/*.mjs`

## Forbidden
- `git *`, Write in `src/**`, Rulebooks, `wrangler.toml`, `public/**`
- AdSense-Config-Änderungen
- A/B-Test-Auto-Dispatch
