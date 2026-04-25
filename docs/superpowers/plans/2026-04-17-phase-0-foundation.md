# Konverter Webseite Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Scope-Note:** Dieser Plan deckt **nur Phase 0** (Foundation + 2 Prototypes, ~10 Sessions, 1-2 Wochen). Phase 1+ (Template-Scale, Content-Build, Translation, Monetization) bekommt eigene Plan-Dokumente, wenn die jeweilige Phase erreicht wird. Innerhalb Phase 0: **Session 1 ist vollständig bite-sized detailliert**, Sessions 2-10 sind **Outlines** die erst vor Ausführung zu fresh Plans expandiert werden (pragmatische Adaption ans 5h-Session-Reset-Modell — siehe user-memory `user_claude_code_usage.md`).

**Goal:** Leere deploybare Astro-Shell live auf Cloudflare Pages, 6 Rulebooks + Workspace-CLAUDE.md committed, 2 genehmigte Prototypes (WebP Konverter + Meter zu Fuß) als Templates für Tool-Typ-Familien.

**Architecture:** Astro 5 SSG + Svelte 5 (Runes) + Tailwind 3.4 + TypeScript strict. Single Repo auf GitHub (pkcut-lab), GitHub Flow, Two-Way-Deploy (GitHub Actions für Pfad A, Wrangler lokal für Pfad B). PWA via `@vite-pwa/astro`, Search via Pagefind. Content via Astro Content Collections + Zod. Kein Backend.

**Tech Stack:** Node 20.11.1 • Astro 5.x • Svelte 5.x • Tailwind 3.4.x • TypeScript 5.7.x • Zod 3.24.x • @vite-pwa/astro • pagefind • sharp • husky.

**Spec-Referenz:** `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` (v1.1, approved).

---

## Phase 0 — Session-Roadmap (High-Level)

| # | Session-Titel | Kern-Deliverable | Dauer (5h-Session) | Blocker für |
|---|--------------|-----------------|-------------------|-------------|
| 1 | **Bootstrap** | Astro-Shell + Rulebooks + CLAUDE.md + Git + CF Pages Project | ~4-5h (diese Plan: fully detailed) | alle folgenden |
| 2 | **Design-System** | `tokens.css`, Dark/Light + Flash-Prevention, Self-hosted Fonts, Ad-Slot-CSS | ~3-4h | S3, S5, S7 |
| 3 | **Layout-Shell** | `BaseLayout.astro`, Header (Logo/Lang/Theme/Search-Stub), Footer, Hreflang-Infrastruktur | ~4-5h | S5, S7 |
| 4 | **Tool-Config-Foundation** | Zod-Schemas (alle 9 Tool-Typen), `slug-map.ts`, Astro Content-Collection-Config | ~3-4h | S5, S7 |
| 5 | **Meter-zu-Fuß Prototype** | `Converter.svelte` + `meter-zu-fuss.ts` + `de.md` + `[lang]/[slug].astro` Route | ~4-5h | S6 |
| 6 | **Prototype-Review #1** | User-Review Meter-zu-Fuß → Iteration → `CONVENTIONS.md`/`STYLE.md`-Lock | ~2-3h (review-driven) | S7 |
| 7 | **WebP Konverter Prototype** | `FileTool.svelte` + `webp-konverter.ts` + `de.md` + Canvas/JSZip Integration | ~4-5h | S8 |
| 8 | **Prototype-Review #2** | User-Review WebP → Iteration → File-Tool-Pattern-Lock | ~2-3h | S9 |
| 9 | **PWA + Pagefind Scaffolding** | `@vite-pwa/astro`-Integration, Pagefind-Build-Step, `offline.html`, Manifest | ~3-4h | S10 |
| 10 | **CI/CD Pipeline + First Deploy** | GitHub Actions (Incremental), Pre-Commit-Hooks, Deploy-Checklist, Production-Deploy | ~4-5h | Phase 1 |

**Gate zu Phase 1:** Beide Prototypes approved, CF Pages Production-URL live, PROGRESS.md zeigt Phase 0 Complete.

---

## Session 1 — Bootstrap (FULL DETAIL)

**Goal:** Lauffähiges Astro-Projekt mit gelockten Dependencies, 6 Rulebooks + CLAUDE.md, Git unter pkcut-lab initialisiert, Cloudflare Pages Project angelegt, erster leerer Build deployt.

**Precondition-Checks (User muss vor Session bestätigen):**
- Cloudflare-Account vorhanden, API-Token mit "Cloudflare Pages: Edit" + "Account Settings: Read" Scope verfügbar
- GitHub-Repo (leer) auf pkcut-lab-Account angelegt: `https://github.com/pkcut-lab/konverter`
- `wrangler` CLI bereits installiert oder npm-install-bereit
- Node 20.11.1 via nvm/volta installiert

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `tailwind.config.mjs`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `src/pages/index.astro`
- Create: `src/pages/[lang]/index.astro`
- Create: `src/env.d.ts`
- Create: `CLAUDE.md`
- Create: `PROJECT.md`
- Create: `CONVENTIONS.md` (Stub)
- Create: `STYLE.md` (Stub)
- Create: `CONTENT.md` (Stub)
- Create: `TRANSLATION.md` (Stub)
- Create: `PROGRESS.md`
- Create: `README.md`
- Create: `.github/workflows/deploy.yml` (Placeholder)
- Create: `.husky/pre-commit`
- Create: `scripts/check-git-account.sh`
- Create: `tests/smoke/build.test.ts`

---

### Task 1.1 — Git Account Verify

**Files:** `scripts/check-git-account.sh`

- [ ] **Step 1: Verify active git identity**

Run:
```bash
cd "c:/Users/carin/.gemini/Konverter Webseite"
git config user.email
```
Expected: `276936739+pkcut-lab@users.noreply.github.com`

If output = `dennis@dennisjedlicka.com` or anything else → **STOP**. Fix `includeIf`-Regel in globaler `~/.gitconfig` (Memory-Referenz `feedback_git_account_konverter.md`).

- [ ] **Step 2: Verify `gh auth` active profile**

Run:
```bash
gh auth status
```
Expected: Active profile = `pkcut-lab`.

- [ ] **Step 3: Write the git-account guard script**

Create `scripts/check-git-account.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
EXPECTED="276936739+pkcut-lab@users.noreply.github.com"
ACTUAL="$(git config user.email || echo '')"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "❌ Wrong git account: got '$ACTUAL', expected '$EXPECTED'"
  echo "   This workspace is locked to pkcut-lab via includeIf."
  echo "   Fix: check ~/.gitconfig includeIf rule for this workspace."
  exit 1
fi
echo "✓ Git account correct: $ACTUAL"
```

Make executable:
```bash
chmod +x scripts/check-git-account.sh
```

- [ ] **Step 4: Run guard to confirm green**

Run: `bash scripts/check-git-account.sh`
Expected: `✓ Git account correct: 276936739+pkcut-lab@users.noreply.github.com`

---

### Task 1.2 — Git Init + .gitignore

**Files:** `.gitignore`, `.nvmrc`

- [ ] **Step 1: Git init (idempotent)**

Run:
```bash
git init --initial-branch=main
```

- [ ] **Step 2: Write .gitignore**

Create `.gitignore`:
```gitignore
# Dependencies
node_modules/

# Build
dist/
.astro/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
.env.*.local

# Logs
npm-debug.log*
*.log

# Pagefind Index (generated)
public/pagefind/

# Icons pipeline (User drops PNGs here, Build converts to public/icons/tools/)
pending-icons/*.png
pending-icons/*.jpg
!pending-icons/.gitkeep

# Husky runtime
.husky/_/

# Cloudflare
.wrangler/
```

- [ ] **Step 3: Write .nvmrc**

Create `.nvmrc` with content exactly:
```
20.11.1
```

- [ ] **Step 4: Verify**

Run: `git status`
Expected: `.gitignore` und `.nvmrc` als untracked sichtbar.

---

### Task 1.3 — package.json mit gelockten Versionen

**Files:** `package.json`

- [ ] **Step 1: Write package.json**

Create `package.json`:
```json
{
  "name": "konverter",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepare": "husky"
  },
  "dependencies": {
    "astro": "5.0.0",
    "@astrojs/svelte": "7.0.0",
    "@astrojs/tailwind": "5.1.4",
    "@astrojs/sitemap": "3.2.1",
    "svelte": "5.1.16",
    "tailwindcss": "3.4.15",
    "typescript": "5.7.2",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.8",
    "@types/node": "20.17.9",
    "vitest": "2.1.8",
    "husky": "9.1.7"
  },
  "engines": {
    "node": "20.11.1",
    "npm": "10.2.4"
  }
}
```

> Note: Versions locked exact (no `^`). Bumps brauchen eigenen `chore/bump-{package}`-Branch (Spec Section 10.2).

- [ ] **Step 2: Install**

Run:
```bash
npm install
```
Expected: `node_modules/` erzeugt, kein Error, `package-lock.json` wird erzeugt.

- [ ] **Step 3: Verify installed versions**

Run:
```bash
npm ls astro svelte tailwindcss typescript zod --depth=0
```
Expected: Exact locked versions listed.

---

### Task 1.4 — Astro-Config + TypeScript-Config + Tailwind-Config

**Files:** `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `src/env.d.ts`

- [ ] **Step 1: Write astro.config.mjs**

Create `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const SUPPORTED_LANGUAGES = ['de'];

export default defineConfig({
  site: 'https://konverter.pages.dev',
  trailingSlash: 'never',
  integrations: [
    svelte(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: SUPPORTED_LANGUAGES,
    routing: {
      prefixDefaultLocale: true,
    },
  },
  build: {
    format: 'directory',
  },
});
```

> Note: `SUPPORTED_LANGUAGES` startet mit nur `de` — wird in Phase 3 auf `['de','en','es','fr','pt-BR']` erweitert. Siehe Spec Section 11.1.

- [ ] **Step 2: Write tsconfig.json**

Create `tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "allowJs": false,
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "astro.config.mjs"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Write tailwind.config.mjs**

Create `tailwind.config.mjs`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,svelte,md}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Write src/env.d.ts**

Create `src/env.d.ts`:
```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADS_ENABLED: string;
  readonly PUBLIC_ANALYTICS_ENABLED: string;
  readonly PUBLIC_CLARITY_ID: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 5: Type-check**

Run:
```bash
npm run check
```
Expected: `0 errors, 0 warnings, 0 hints`. (Warnings zu unused imports akzeptabel, harter Fehler nicht.)

---

### Task 1.5 — Minimal Placeholder-Pages

**Files:** `src/pages/index.astro`, `src/pages/[lang]/index.astro`

- [ ] **Step 1: Write root placeholder**

Create `src/pages/index.astro`:
```astro
---
return Astro.redirect('/de');
---
```

- [ ] **Step 2: Write DE-Home placeholder**

Create `src/pages/[lang]/index.astro`:
```astro
---
export function getStaticPaths() {
  return [{ params: { lang: 'de' } }];
}
const { lang } = Astro.params;
---
<!DOCTYPE html>
<html lang={lang}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Konverter — Bootstrapping</title>
</head>
<body>
  <h1>Konverter</h1>
  <p>Phase 0 Bootstrap — Shell live. Sprache: {lang}</p>
</body>
</html>
```

- [ ] **Step 3: Dev-Server smoke-test**

Run: `npm run dev` (in anderem Terminal/Tab)

Öffne `http://localhost:4321/de/` → erwartete Ausgabe: "Konverter / Phase 0 Bootstrap — Shell live. Sprache: de". Dann Server stoppen (`Ctrl+C`).

- [ ] **Step 4: Production-Build smoke-test**

Run:
```bash
npm run build
```
Expected: `dist/` erstellt, enthält `dist/de/index.html`, `dist/index.html` (oder Redirect-Logik), `dist/sitemap-index.xml`. Keine Fehler.

---

### Task 1.6 — Workspace-CLAUDE.md (Karpathy-tailored)

**Files:** `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Create `CLAUDE.md`:
```markdown
# Konverter Webseite — Claude-Context

Dieses File wird von Claude Code automatisch bei jedem Session-Start geladen.

## Projekt-Kontext (1-Liner)

Multilinguale Konverter-Webseite (Astro 5 SSG + Svelte 5 + Tailwind), 1000+ Tools.
Launch-Set: DE only (Phase 1-2), +EN/ES/FR/PT-BR (Phase 3).
Expansion-Gates: bis 13 Sprachen (Phase 5), bis 30 (Phase 6).
Monetarisierung: AdSense ab Phase 2.
Vollständige Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` (v1.1).

## Bindende Referenzen — LIES ZU SESSION-BEGINN

1. `PROGRESS.md` — aktueller Projekt-Status und Next-Session-Plan
2. `PROJECT.md` — gelockte Tech-Stack-Versionen
3. **Task-abhängig:** `CONVENTIONS.md` (Code) · `STYLE.md` (Visual) · `CONTENT.md` (SEO-Text) · `TRANSLATION.md` (i18n)

## Arbeitsprinzipien (tailored nach Andrej Karpathy)

### 1. Think Before Coding
Bevor du editierst: relevante Rulebooks öffnen, Task-Ziel formulieren, Bite-Size-Steps planen. Kein Code ohne Verständnis von WAS und WARUM. Das ist die deutsche Interpretation von "slow is smooth, smooth is fast".

### 2. Simplicity First
Die einfachste Lösung, die funktioniert. Keine vorausschauenden Abstraktionen, keine Feature-Creep. Drei ähnliche Zeilen schlagen eine voreilige Abstraktion. Wenn du "das wird später nützlich sein" denkst → nicht bauen bis es wirklich gebraucht wird.

### 3. Surgical Changes
Ein Commit = ein logisches Stück (ein Tool, ein Bug-Fix, ein Design-Token). Keine Mix-Commits ("fix X + refactor Y"). Keine opportunistischen Refactors während Bug-Fixes. GitHub Flow: eine Tool-Familie pro Branch.

### 4. Goal-Driven Execution
Jede Session endet mit PROGRESS.md-Update. Task fertig → Commit mit Trailer → stop. Keine "ich mach noch schnell das"-Erweiterungen ohne Plan. Scope-Creep wird aktiv zurückgewiesen.

## Git-Account-Lock (HART)

Nur `pkcut-lab` darf in diesem Workspace committen. Vor jedem Commit:
```bash
bash scripts/check-git-account.sh
```
Muss green sein. `DennisJedlicka` ist in diesem Workspace **verboten**.

## Session-Ritual

**Start (~60 Sek):**
1. `PROGRESS.md` lesen
2. `PROJECT.md` prüfen (Dep-Versionen unverändert?)
3. Task-relevante Rulebooks
4. `bash scripts/check-git-account.sh`
5. Arbeiten beginnen

**Ende (~60 Sek):**
1. `PROGRESS.md` aktualisieren (welche Tools jetzt in welchem Zustand)
2. Commit mit Trailer: `Rulebooks-Read: PROJECT, CONVENTIONS[, STYLE][, CONTENT][, TRANSLATION]`
3. Stop

## Non-Negotiables (siehe Spec Section 18)

1. Session-Continuity: Rulebooks werden befolgt
2. Privacy-First: kein Tracking ohne Consent, kein Server-Upload (Ausnahme: 7a ML-File-Tools)
3. Quality-Gates: Build bricht ab bei fehlender Struktur
4. Git-Account: pkcut-lab only
5. AdSense erst Phase 2
6. Design-Approval vor Template-Extraction
7. Keine externen Network-Dependencies zur Runtime (Ausnahme 7a: ML-File-Tools mit Worker-Fallback, 6 Bedingungen)
8. Kein thin Content (<300 Wörter abgelehnt)
```

- [ ] **Step 2: Verify**

Read-back the file to confirm written correctly.
```bash
head -20 CLAUDE.md
```

---

### Task 1.7 — PROJECT.md Tech-Stack-Snapshot

**Files:** `PROJECT.md`

- [ ] **Step 1: Write PROJECT.md**

Create `PROJECT.md`:
```markdown
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
|---------|---------|-------|
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
```

---

### Task 1.8 — Rulebook-Stubs (CONVENTIONS/STYLE/CONTENT/TRANSLATION)

**Files:** `CONVENTIONS.md`, `STYLE.md`, `CONTENT.md`, `TRANSLATION.md`

- [ ] **Step 1: Write CONVENTIONS.md stub**

Create `CONVENTIONS.md`:
```markdown
# Code-Konventionen

> **Status:** Stub — wird in Session 4 (Tool-Config-Foundation) und Session 6 (nach Prototype-Review) konkret befüllt.

## Verbindlich ab Session 1

- **Commit-Format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **Commit-Trailer (PFLICHT):** `Rulebooks-Read: <Liste>` (Enforced via Pre-Commit-Hook ab Session 10)
- **Verboten:** `any`, `@ts-ignore`, Default-Exports für Tool-Configs
- **Paths:** `~/*` = `src/*` (tsconfig-Alias)

## Wird in Session 4 konkretisiert

- Zod-Schemas für 9 Tool-Typen
- File-Layout pro Tool
- Error-Handling `{ ok, value, error }` Result-Type
- Naming: Slugs kebab-case, Tool-IDs camelCase
- Test-Struktur pro Tool-Typ

## Wird in Session 6 konkretisiert (nach Prototype-Review)

- Svelte-Komponenten-Patterns (Runes-only, Stores verboten)
- CSS-Strategie: Tailwind Utility-First, Custom-CSS nur in `tokens.css`
- Astro-Content-Collection-Pattern
```

- [ ] **Step 2: Write STYLE.md stub**

Create `STYLE.md`:
```markdown
# Visual Style Rulebook

> **Status:** Stub — wird in Session 2 (Design-System) konkret befüllt.

## Vorgaben aus Spec Section 5 (verbindlich)

- Warm-Graphite-Palette (Accent `#3A3733`, Text `#1A1917`)
- Three-State-Theme-Toggle (auto/light/dark) mit Flash-Prevention
- Pencil-Sketch-Icons via Recraft.ai (Master-Prompt v2 siehe Spec 5.6)
- WCAG AAA Contrast enforced
- Ad-Slot-CLS-Tokens mit feste min-height (Non-Negotiable)

## Wird in Session 2 konkretisiert

- `tokens.css`-Inhalte
- Typography-Scale (Inter + JetBrains Mono)
- Spacing-Scale, Radii, Shadows
- Tool-Layout-Spec pixelgenau
```

- [ ] **Step 3: Write CONTENT.md stub**

Create `CONTENT.md`:
```markdown
# SEO-Content-Rulebook (Deutsche Master)

> **Status:** Stub — wird in Session 5 (erstes Content-DE für Meter-zu-Fuß) konkret befüllt, finalisiert nach Review in Session 6.

## Vorgaben aus Spec Section 10.5 (verbindlich)

**Tone-of-Voice:**
- Sachlich, präzise, keine Marketing-Floskeln
- Kein "wir" / "unser Tool"
- Anrede "Du" (informell)
- Aktive Sätze, kurze Hauptsätze

**Blacklist-Phrasen:**
- "Willkommen bei..."
- "In diesem Artikel..."
- "Jetzt noch nie war es so einfach..."
- "Mit unserem praktischen Tool..."
- Superlativ-Spam ("der beste", "ultimativ")

**SEO-Artikel-Struktur (400 W, gelockte H2):**
```
## Was ist {EinheitA}?       (~80 W)
## Was ist {EinheitB}?       (~80 W)
## Umrechnungsformel         (~60 W + Formel)
## Häufige Umrechnungen      (~60 W + Tabelle)
## Wo wird {EinheitB} verwendet?  (~80 W)
## Geschichte (optional)     (~40 W)
```

**FAQ-Style:** Direkte Frage, Antwort erster Satz = direkte Zahl, dann 1-2 Sätze Kontext.

**Zahlen-Notation:** `,` DE, `.` EN; Einheit mit Space (`3,28 m`).
```

- [ ] **Step 4: Write TRANSLATION.md stub**

Create `TRANSLATION.md`:
```markdown
# Translation Rulebook

> **Status:** Stub — bleibt Stub bis Phase 3 (DE → EN Pivot). In Phase 0-2 nicht benutzt.

## Vorgaben aus Spec Section 10.6

- Sprachfamilien-Ton: Germanische Du, Slawische Sie, CJK höflich-neutral, Arabisch MSA
- Glossar ~50 Kern-Begriffe pro Sprache (gelockt)
- RTL, Script, Zahlenformate pro Sprache
- Regionalisierung-Defaults: DE "Fuß" (nicht "Fuss"), EN en-US, PT pt-BR, ES es-ES

## Phase 3 aktiviert
- DE → EN (Pivot)
- EN → ES, FR, PT-BR parallel
```

---

### Task 1.9 — PROGRESS.md Initial State

**Files:** `PROGRESS.md`

- [ ] **Step 1: Write PROGRESS.md**

Create `PROGRESS.md`:
```markdown
# Progress Tracker

**Letztes Update:** 2026-04-17 (Session 1, End)
**Aktuelle Phase:** Phase 0 — Foundation
**Current Session:** #1 — Bootstrap

## Phase 0 Fortschritt

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Bootstrap | 🟡 in progress | Astro-Shell + Rulebooks + Git + CF Pages |
| 2 — Design-System | ⬜ pending | `tokens.css`, Dark/Light |
| 3 — Layout-Shell | ⬜ pending | BaseLayout, Header, Footer |
| 4 — Tool-Config-Foundation | ⬜ pending | Zod-Schemas 9 Typen |
| 5 — Meter-zu-Fuß Prototype | ⬜ pending | Converter-Template |
| 6 — Review #1 | ⬜ pending | Iteration + Lock |
| 7 — WebP Konverter Prototype | ⬜ pending | FileTool-Template |
| 8 — Review #2 | ⬜ pending | Iteration + Lock |
| 9 — PWA + Pagefind | ⬜ pending | Scaffolding |
| 10 — CI/CD | ⬜ pending | First Production Deploy |

## Tool-Inventar (Phase 0)

| Tool | Config | Content-DE | Icon | Tests |
|------|--------|------------|------|-------|
| meter-zu-fuss | ⬜ | ⬜ | ⬜ | ⬜ |
| webp-konverter | ⬜ | ⬜ | ⬜ | ⬜ |

## Deploy-History
(leer bis Session 10)

## Blockers
Keine.

## Next-Session-Plan
Session 2 — Design-System: `tokens.css` mit Graphite-Palette, Dark/Light-Tokens, Flash-Prevention-Inline-Script, Ad-Slot-CLS-Tokens, Self-hosted Fonts (Inter + JetBrains Mono). Referenzen: Spec Section 5.
```

---

### Task 1.10 — Husky + Pre-Commit-Hook (Git-Account-Guard)

**Files:** `.husky/pre-commit`

- [ ] **Step 1: Initialize husky**

Run:
```bash
npm run prepare
```
Expected: `.husky/` Verzeichnis erstellt, `package.json` `prepare` script lief durch.

- [ ] **Step 2: Write pre-commit hook**

Create `.husky/pre-commit`:
```bash
#!/usr/bin/env bash
set -e
bash scripts/check-git-account.sh
```

Make executable:
```bash
chmod +x .husky/pre-commit
```

- [ ] **Step 3: Smoke-Test Hook**

Stage a harmless file to trigger hook path:
```bash
git add .gitignore
git status
```
Expected: `.gitignore` staged. Hook selbst läuft erst bei Commit.

> Note: Der volle Rulebooks-Read-Trailer-Check kommt erst in Session 10 dazu — Phase 0 arbeitet noch mit nur Git-Account-Guard.

---

### Task 1.11 — README.md + Deploy-Workflow-Stub

**Files:** `README.md`, `.github/workflows/deploy.yml`

- [ ] **Step 1: Write README.md**

Create `README.md`:
```markdown
# Konverter Webseite

Multilinguale Tool-Plattform (Astro 5 SSG + Svelte 5), 1000+ Konverter/Rechner/Generator/File-Tools.

**Phase:** 0 — Foundation (siehe `PROGRESS.md`).

## Quickstart

```bash
nvm use
npm install
npm run dev
```

## Bindende Dokumente

- `CLAUDE.md` — Claude-Code-Entry-Point (Arbeitsprinzipien)
- `PROJECT.md` — Tech-Stack gelockt
- `CONVENTIONS.md` / `STYLE.md` / `CONTENT.md` / `TRANSLATION.md` / `PROGRESS.md` — Rulebooks

## Spec

`docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` (v1.1).

## Plans

`docs/superpowers/plans/2026-04-17-phase-0-foundation.md`.
```

- [ ] **Step 2: Write Deploy-Workflow Placeholder**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run check
      - run: npm run build
        env:
          NODE_OPTIONS: --max-old-space-size=4096
      # Deploy-Step wird in Session 10 final aktiviert (Cloudflare Pages Action).
      # Bis dahin: Build-Only-CI für PR-Validierung.
```

> Note: Der finale Workflow mit `cloudflare/pages-action`, `--incremental` Pagefind und `check-file-count.ts` kommt in Session 10 (siehe Spec 9.3). Für Session 1 reicht Build-Only.

---

### Task 1.12 — Cloudflare Pages Project Create

**Files:** Keine — CF Pages Setup via Wrangler-CLI oder Web-UI.

- [ ] **Step 1: Install wrangler (lokal, nicht in package.json)**

Run:
```bash
npm install -g wrangler@3
```
Oder alternativ via `npx wrangler ...` ohne globale Installation.

- [ ] **Step 2: Wrangler login**

Run:
```bash
wrangler login
```
Browser öffnet sich, Cloudflare-Account autorisieren.

- [ ] **Step 3: Create Pages Project**

Run:
```bash
wrangler pages project create konverter --production-branch=main
```
Expected: Project `konverter` erstellt, Production-URL `https://konverter.pages.dev` reserviert (noch nicht deployt).

- [ ] **Step 4: Verify via dashboard or CLI**

Run:
```bash
wrangler pages project list
```
Expected: `konverter` ist in der Liste.

- [ ] **Step 5: Manual Dry-Run Deploy (optional, kein Commit in Git)**

Run:
```bash
wrangler pages deploy dist --project-name=konverter --branch=bootstrap-preview
```
Expected: Preview-URL wie `https://bootstrap-preview.konverter.pages.dev` funktioniert — leere Shell sichtbar.

> Note: Das ist ein Preview-Deploy, kein Production. Production-Deploy wird erst in Session 10 nach vollem CI-Setup scharfgeschaltet.

---

### Task 1.13 — Smoke-Test + Initial Commit

**Files:** `tests/smoke/build.test.ts`

- [ ] **Step 1: Write smoke test**

Create `tests/smoke/build.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Phase 0 Bootstrap — Smoke', () => {
  it('dist/ exists after build', () => {
    expect(existsSync(join(process.cwd(), 'dist'))).toBe(true);
  });

  it('dist/de/index.html was generated', () => {
    expect(existsSync(join(process.cwd(), 'dist', 'de', 'index.html'))).toBe(true);
  });

  it('all 6 rulebook files exist at workspace root', () => {
    const rulebooks = ['PROJECT.md', 'CONVENTIONS.md', 'STYLE.md', 'CONTENT.md', 'TRANSLATION.md', 'PROGRESS.md'];
    for (const rb of rulebooks) {
      expect(existsSync(join(process.cwd(), rb))).toBe(true);
    }
  });

  it('CLAUDE.md exists at workspace root', () => {
    expect(existsSync(join(process.cwd(), 'CLAUDE.md'))).toBe(true);
  });
});
```

- [ ] **Step 2: Add vitest config minimal**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 3: Run test — expected to FAIL first (TDD)**

Run: `npm test`
Expected: First run may fail if build hasn't been run. Run `npm run build && npm test`.
Expected after build: All 4 tests PASS.

- [ ] **Step 4: Verify git status is clean-ish**

Run:
```bash
git status
```
Expected: Many untracked new files, nothing staged yet.

- [ ] **Step 5: Stage and commit (with proper trailer)**

Run (specific adds, not `git add -A`):
```bash
git add .gitignore .nvmrc package.json package-lock.json
git add astro.config.mjs tsconfig.json tailwind.config.mjs vitest.config.ts
git add src/env.d.ts src/pages/index.astro "src/pages/[lang]/index.astro"
git add CLAUDE.md PROJECT.md CONVENTIONS.md STYLE.md CONTENT.md TRANSLATION.md PROGRESS.md README.md
git add .husky/pre-commit scripts/check-git-account.sh
git add tests/smoke/build.test.ts
git add .github/workflows/deploy.yml
```

Then commit via HEREDOC:
```bash
git commit -m "$(cat <<'EOF'
chore: bootstrap Phase 0 foundation

Bootstrap Astro 5 + Svelte 5 + Tailwind + TypeScript strict.
6 Rulebooks + CLAUDE.md committed. Git-account-guard pre-commit hook live.
Cloudflare Pages project 'konverter' created.

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
```

Expected: Pre-Commit-Hook läuft durch (git-account-guard green), Commit erstellt.

- [ ] **Step 6: Push to GitHub**

Run:
```bash
git remote add origin https://github.com/pkcut-lab/konverter.git
git push -u origin main
```
Expected: Push successful, CI läuft (Build-Only, sollte durchgehen).

- [ ] **Step 7: Update PROGRESS.md — Session 1 Complete**

Edit `PROGRESS.md`:
- Session 1 row: 🟡 → ✅
- Update "Letztes Update" date
- Confirm "Next-Session-Plan" = Session 2

- [ ] **Step 8: Second commit — session-close**

```bash
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): close Session 1, next = Session 2 Design-System

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
git push
```

**✅ Session 1 complete.** Deliverables:
- Astro Dev + Build laufen lokal
- Preview-Deploy auf CF Pages sichtbar
- 6 Rulebooks + CLAUDE.md in Git
- Husky Git-Account-Guard aktiv
- Smoke-Test green

---

## Sessions 2-10 — Outlines

> **Note:** Jede dieser Sessions wird vor Ausführung zu einem **eigenen Full-Detail-Plan** im writing-plans-Format expandiert (fresh plan file in `docs/superpowers/plans/`). Die folgenden Outlines setzen Rahmen und Blocker, nicht die Schritte.

### Session 2 — Design-System

**Goal:** `src/styles/tokens.css` mit vollständiger Graphite-Palette + Dark/Light-Tokens + Ad-Slot-CLS + Self-hosted Fonts live.

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/fonts.css`
- Create: `public/fonts/Inter-*.woff2`, `public/fonts/JetBrainsMono-*.woff2` (self-hosted, Latin-Subset)
- Create: `src/components/ThemeScript.astro` (inline flash-prevention)
- Update: `STYLE.md` (vom Stub zum finalen Rulebook)

**Dependencies:** Session 1 (Astro-Config + Tailwind-Config müssen stehen).

**Test-Strategie:** Visuelle Prüfung (Storybook-Light via leeres `/styleguide` route), Lighthouse-Contrast-Check, WCAG-AAA-Verifikation automatisiert (axe-core via Vitest).

**Spec-Referenzen:** Section 5.1-5.5, Non-Negotiable Ad-Slot-CLS (5.4).

---

### Session 3 — Layout-Shell

**Goal:** `BaseLayout.astro` mit Header, Footer, Hreflang-Infrastruktur; Theme-Toggle live funktionierend.

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro` (Logo, Lang-Switcher-Stub, Theme-Toggle, Search-Stub)
- Create: `src/components/Footer.astro`
- Create: `src/components/ThemeToggle.svelte` (Runes)
- Create: `src/lib/hreflang.ts` (Hreflang-Link-Builder, Phase-aware)
- Update: `src/pages/[lang]/index.astro` (nutzt BaseLayout)

**Dependencies:** Session 2 (Design-Tokens).

**Test-Strategie:** Vitest-Unit für `hreflang.ts` (5 Sprachen → 5 alternates). Visual für Header/Footer.

**Spec-Referenzen:** Section 11.3, 11.4, 5.2 (Theme-Toggle).

---

### Session 4 — Tool-Config-Foundation

**Goal:** Zod-Schemas für alle 9 Tool-Typen, `slug-map.ts` funktional, Astro Content-Collection-Config live, `CONVENTIONS.md` final befüllt.

**Files:**
- Create: `src/lib/tools/schemas.ts` (Zod-Schemas für Converter/Calculator/Generator/Formatter/Validator/Analyzer/Comparer/FileTool/Interactive)
- Create: `src/lib/slug-map.ts` (Tool-ID ↔ Slug pro Sprache)
- Create: `src/content/config.ts` (Astro Collection-Config mit Zod)
- Update: `CONVENTIONS.md` (final, keine Stub mehr)

**Dependencies:** Session 1 (Zod installed).

**Test-Strategie:** Vitest für Zod-Schemas — valid/invalid Fixtures pro Typ. Boundary-Tests: `noUncheckedIndexedAccess` muss greifen.

**Spec-Referenzen:** Section 4.1, 4.2, 4.4, 10.3.

---

### Session 5 — Meter-zu-Fuß Prototype

**Goal:** Erster funktionierender Converter live auf `localhost:4321/de/meter-zu-fuss`, vollständig inkl. 400-Wörter-SEO-Content, Ähnliche-Tools-Card-Stub.

**Files:**
- Create: `src/components/tools/Converter.svelte` (Runes)
- Create: `src/lib/tools/meter-zu-fuss.ts` (Config + Icon-Prompt JSDoc)
- Create: `src/content/tools/meter-zu-fuss/de.md` (400-Wörter-SEO-Content)
- Create: `src/pages/[lang]/[slug].astro` (dynamic route, resolves slug-map)
- Create: `pending-icons/.gitkeep` + README in `pending-icons/`

**Dependencies:** Sessions 2, 3, 4.

**Test-Strategie:** Unit-Test Converter-Logic (`m * 3.28084`), E2E-Smoke via Playwright (optional diese Session, sonst S10).

**Spec-Referenzen:** Section 14.2, 5.7 (Layout), 10.5 (CONTENT.md).

---

### Session 6 — Review #1 (Meter-zu-Fuß) + Lock

**Goal:** User reviewt Prototype, gibt Feedback, Iteration bis Approved. Dann `CONVENTIONS.md` + `STYLE.md` werden final gelockt.

**Files:**
- Iteration nach User-Feedback
- Update: `CONVENTIONS.md` (Svelte-Patterns, Astro-Patterns final)
- Update: `STYLE.md` (Tool-Layout-Spec pixelgenau final)
- Update: `CONTENT.md` (nach echtem 400-Wörter-Content: Audit-Kriterien final)

**Dependencies:** Session 5.

**Hart-Gate:** User muss schriftlich (Chat) approven: "Prototype Meter-zu-Fuß ist OK, Pattern kann als Template dienen."

---

### Session 7 — WebP Konverter Prototype

**Goal:** WebP Konverter live auf `localhost:4321/de/webp-konverter`, User kann direkt als Dogfood PNG/JPG → WebP konvertieren für eigene Icon-Pipeline.

**Files:**
- Create: `src/components/tools/FileTool.svelte` (Drop-Zone, Progress-Bar, Preview, ZIP-Export)
- Create: `src/lib/tools/webp-konverter.ts` (Config + Icon-Prompt)
- Create: `src/content/tools/webp-konverter/de.md` (400-Wörter-Content "Was ist WebP?")
- Create: `src/lib/webp/encode.ts` (Canvas `toBlob('image/webp')`-Wrapper)
- Create: `src/lib/webp/worker.ts` (Web Worker für >5MB-Files)
- Create: `scripts/build-icons.ts` (sharp → WebP 160×160 Q=85)
- Update: `package.json` — add `jszip` (exact version), `sharp` (exact version)

**Dependencies:** Sessions 4, 6.

**Test-Strategie:** Vitest für `encode.ts` mit Test-PNG-Fixtures, Output-Buffer prüfen Magic-Bytes `RIFF....WEBP`.

**Spec-Referenzen:** Section 14.1, 5.6 (Icon-Pipeline).

---

### Session 8 — Review #2 (WebP) + File-Tool-Pattern-Lock

**Goal:** User reviewt WebP-Konverter + nutzt ihn live für erste Recraft.ai-Icons (Dogfood-Loop!). File-Tool-Pattern final gelockt.

**Files:**
- Iteration nach User-Feedback
- Update: `CONVENTIONS.md` (File-Tool-Section final)
- Update: `pending-icons/` → erste echte Icons durchgeschickt → `public/icons/tools/`

**Dependencies:** Session 7.

**Hart-Gate:** User approven: "File-Tool-Pattern steht, WebP-Konverter nutzbar."

---

### Session 9 — PWA + Pagefind Scaffolding

**Goal:** App installierbar, Offline-Fallback-Seite funktioniert, Pagefind-Index wird beim Build erzeugt (noch ohne UI).

**Files:**
- Update: `package.json` — `@vite-pwa/astro`, `pagefind`
- Update: `astro.config.mjs` — PWA-Integration
- Create: `src/offline.astro` → generiert `dist/offline.html`
- Create: `public/manifest.webmanifest.json` (pro Sprache wird später generiert, jetzt statisch für DE)
- Create: `src/lib/pwa/caching-strategies.ts`
- Create: `scripts/pagefind-build.ts` (Post-Build-Hook)
- Update: `package.json` scripts — `"build": "astro build && node scripts/pagefind-build.ts"`

**Dependencies:** Session 3 (Layout muss stehen), Session 8.

**Test-Strategie:** Manifest-Validator, Service-Worker-Registrierung Smoke-Test im Browser.

**Spec-Referenzen:** Section 6, 7.

---

### Session 10 — CI/CD Pipeline + First Production Deploy

**Goal:** Vollständiger GitHub-Actions-Workflow mit Incremental-Build + Pagefind + File-Count-Check + CF-Deploy. Rulebooks-Read-Trailer-Hook aktiv. Production-URL live.

**Files:**
- Update: `.github/workflows/deploy.yml` (vollständig, wie Spec 9.3)
- Create: `scripts/determine-build-scope.sh`
- Create: `scripts/check-file-count.ts` (warnt ≥18k, abort ≥19.5k)
- Create: `scripts/check-session-ritual.ts` (commit-trailer validator)
- Update: `.husky/pre-commit` — erweitert um trailer-check
- Update: `.husky/commit-msg` — trailer-format-check
- Create: `.github/DEPLOY_CHECKLIST.md`
- Create: `scripts/lighthouse-ci.ts` (Lighthouse ≥95 Gate)

**Dependencies:** Sessions 1-9.

**Test-Strategie:** Workflow-Trockenlauf via `act` (optional), manueller PR zu Test-Branch, grüne CI, dann Merge zu main → Production-Deploy.

**Hart-Gate (Phase 0 Exit):** Production-URL `https://konverter.pages.dev/de/meter-zu-fuss` und `https://konverter.pages.dev/de/webp-konverter` erreichbar, Lighthouse ≥95, beide Tools funktional.

**Spec-Referenzen:** Section 9 (gesamt), 10.1 (Session-Ritual-Enforcement).

---

## Phase 0 Completion Criteria

Wenn alle folgenden grün sind, → Gate zu Phase 1:

- [ ] `https://konverter.pages.dev/de/meter-zu-fuss` live, funktioniert, Lighthouse ≥ 95
- [ ] `https://konverter.pages.dev/de/webp-konverter` live, funktioniert, Lighthouse ≥ 95
- [ ] 6 Rulebooks + CLAUDE.md alle final befüllt (keine Stubs mehr)
- [ ] Pre-Commit-Hook enforced Git-Account UND Rulebooks-Read-Trailer
- [ ] GitHub Actions CI läuft grün auf jedem PR
- [ ] PWA installierbar auf Mobile + Desktop, Offline-Fallback funktioniert
- [ ] Pagefind-Index wird gebaut (UI kommt Phase 1 Session #x)
- [ ] `PROGRESS.md` zeigt alle Phase 0 Sessions ✅
- [ ] **User approved: "Ready für Phase 1"**

Dann: neues Plan-Dokument `docs/superpowers/plans/YYYY-MM-DD-phase-1-template-core.md` für die nächsten 20-30 Sessions.

---

## Open TODOs aus Spec (bis Phase 0 Ende zu entscheiden)

- **OQ2** — Trailing-Slash-Konvention: bereits via `astro.config.mjs` `trailingSlash: 'never'` entschieden in Session 1 ✓
- **OQ3** — Dark-Mode-Icon-Strategie: wird in Session 8 (nach echten Icons im Dark-Mode-Test) final evaluiert. Default `invert(0.92) brightness(1.05)`.

---

**End of Plan. Ready for plan-document-reviewer.**
