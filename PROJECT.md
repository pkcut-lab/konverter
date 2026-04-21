# Tech Stack (GELOCKT)

**Philosophie:** Dependencies werden NICHT silent upgedated. Bumps brauchen eigenen `chore/bump-{package}`-Branch + Re-Validate auf 3 Sample-Tools.

## Runtime

| Component | Version | Grund |
|-----------|---------|-------|
| Node.js | 20.11.1 LTS | LTS, via `.nvmrc` gelockt |
| npm | 10.2.4 | bundled mit Node 20.11.1 |

## Framework & Libraries

| Package | Version | Rolle |
|---------|---------|-------|
| astro | 5.18.1 | Meta-Framework, SSG, i18n-Routing (security-bump 2026-04-21: GHSA-wrwg-2hg8-v723 + GHSA-49w6-73cw-chjr) |
| @astrojs/svelte | 7.0.0 | Svelte-Islands-Integration |
| @astrojs/tailwind | 5.1.4 | Tailwind-Integration |
| @astrojs/sitemap | 3.2.1 | Sitemap + Hreflang |
| svelte | 5.55.4 | UI-Komponenten (Runes-only); minor-bump 2026-04-21 (follow-on zum astro-security-bump) |
| tailwindcss | 3.4.15 | CSS utilities |
| typescript | 5.7.2 | strict mode |
| zod | 3.24.1 | Content-Validation |
| mediabunny | 1.40.1 | Pure-client Video-Encoder (WebCodecs-backed); primär für FileTool-Video-Konverter ab Phase 1. MPL-2.0. Gewählt gegen `ffmpeg.wasm` wegen COOP/COEP-Freiheit (AdSense-kompatibel, NN #5), ~70 kB gzip statt ~25 MB, WebCodecs-Performance. Update-Policy: minor/major manuell reviewen (WebCodecs-Parity-Risiko), patches auto. Details: `docs/superpowers/specs/2026-04-20-hevc-zu-h264-design.md` §2.3. |

## Dev

| Package | Version | Rolle |
|-----------|---------|-------|
| @astrojs/check | 0.9.8 | `astro check` Type-Checker |
| vitest | 2.1.8 | Unit-Tests |
| husky | 9.1.7 | Git-Hooks |
| @types/node | 20.17.9 | Typen |

## Später hinzuzufügen (Phase 0 Sessions 7-9)

- `@vite-pwa/astro` — Session 9
- `pagefind` — Session 9
- `sharp` — Session 7 (Icon-Pipeline)
- `jszip` — Session 7 (Batch-Download WebP-Konverter)

## Upgrade-Regel

1. `chore/bump-{package}`-Branch erstellen
2. Bump in `package.json` (exact, kein `^`)
3. `npm install` + `npm run build` + `npm test`
4. 3 Sample-Tools visuell prüfen (sobald existent)
5. PR mit Changelog-Link in Beschreibung
6. Merge nur wenn grün
