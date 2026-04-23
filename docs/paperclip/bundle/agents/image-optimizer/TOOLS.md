# TOOLS — Image-Optimizer

## Allowed — Read
- Read: `public/images/**`, `src/content/tools/**` (Alt-Text-Kontext), Rulebooks

## Allowed — Write
- Write: `public/images/<slug>-hero.{avif,webp}` (Builder committet)
- Write: `public/images/<slug>-hero-{320w,640w,1024w,1920w}.avif` (Builder committet)
- Write: `public/images/<slug>-hero-lqip.b64`
- Write: `tasks/image-optimization-<slug>-<date>.md` (Commit-Request)
- Write: `memory/image-optimizer-log.md` (append)

## Allowed — Bash / Tools
- `npx sharp-cli` (AVIF + WebP + Resize)
- `base64`, `stat`, `yq`, `grep`

## Forbidden
- `git *` (Commit-Request an Builder)
- Write in `src/**` außer `public/` (Scope-Trennung)
- Write in Rulebooks
- AI-Image-Generation (User-Territorium)
- Copyright-Bilder-Upload
- `npm install` neue Deps
