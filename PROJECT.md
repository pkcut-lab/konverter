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
| astro | 5.0.0 | Meta-Framework, SSG, i18n-Routing |
| @astrojs/svelte | 7.0.0 | Svelte-Islands-Integration |
| @astrojs/tailwind | 5.1.4 | Tailwind-Integration |
| @astrojs/sitemap | 3.2.1 | Sitemap + Hreflang |
| svelte | 5.1.16 | UI-Komponenten (Runes-only) |
| tailwindcss | 3.4.15 | CSS utilities |
| typescript | 5.7.2 | strict mode |
| zod | 3.24.1 | Content-Validation |

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
