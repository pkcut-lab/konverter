# Phase 0 Session 3 — Layout-Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reusable `BaseLayout.astro` with `Header` (Logo + Lang-Switcher-Stub + Search-Stub + `ThemeToggle.svelte`) and `Footer`, plus a phase-aware `hreflang.ts` helper — consolidating the duplicated `<head>` in `index.astro` and `styleguide.astro`.

**Architecture:** Pure Astro layout primitive (`BaseLayout.astro`) owns the `<html>`+`<head>`+`<body>` skeleton and imports `global.css` + `ThemeScript` exactly once. `Header.astro` and `Footer.astro` are static Astro partials that slot in. The only interactive island is `ThemeToggle.svelte` (Svelte 5 Runes, `client:load`) which mutates `localStorage['theme']` + `document.documentElement.dataset.theme` per the Session-2-locked contract. `hreflang.ts` centralises the list of active languages (single source of truth, consumed by both `astro.config.mjs` and `BaseLayout.astro`) and emits `<link rel="alternate">` tags + `x-default`.

**Tech Stack:** Astro 5.0.0, Svelte 5.1.16 (Runes: `$state`, `$effect`), Tailwind 3 (utility supplement only — tokens win), Vitest 2, TypeScript 5.7 strict + `noUncheckedIndexedAccess`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/hreflang.ts` | Single source of truth for active languages + builder for hreflang link entries. Phase 0 = `['de']`; extensible without signature change. |
| `src/lib/site.ts` | Compile-time site URL constant (mirrors `astro.config.mjs::site`) — consumed by `hreflang.ts`. Tiny file, single export. |
| `tests/lib/hreflang.test.ts` | Unit tests: phase-0 single-entry + x-default, phase-3 five-entry shape, invariant that `x-default` always present, invariant that `href` uses absolute URL. |
| `src/components/ThemeToggle.svelte` | Three-state toggle (auto/light/dark). Svelte 5 Runes. Reads `localStorage['theme']`, reacts to system-scheme change when in auto. Mutates `documentElement.dataset.theme`. Accessible (aria-pressed, keyboard). |
| `src/components/Header.astro` | Sticky top bar: Brand-Wordmark (left) · Search-Stub (center, disabled) · Lang-Switcher-Stub (shows "DE" inert) · `<ThemeToggle client:load />` (right). |
| `src/components/Footer.astro` | Three-column layout stub: Kategorien (placeholder list) · Rechtliches (placeholder) · Meta (build-year). Uses tokens only. |
| `src/layouts/BaseLayout.astro` | `<html lang>` + consolidated `<head>` (meta, ThemeScript, global.css, font preload, hreflang links, per-page title+description) + `<body>` wrapping `<Header>`, `<slot />`, `<Footer>`. |
| `src/pages/[lang]/index.astro` | **Modified:** wraps content in `<BaseLayout>`. No more inline head. |
| `src/pages/[lang]/styleguide.astro` | **Modified:** wraps content in `<BaseLayout>`. Removes local inline theme-toggle buttons (Header toggle covers it). |
| `astro.config.mjs` | **Modified:** import `ACTIVE_LANGUAGES` from `src/lib/hreflang.ts` so `i18n.locales` is one source of truth. |
| `PROGRESS.md` | **Modified (final task only):** Session 3 → ✅ done, Next-Session-Plan → Session 4. |

**Decomposition rationale:** `hreflang.ts` before components (pure, testable, no UI). `ThemeToggle.svelte` before `Header.astro` (Header imports it). `Header`+`Footer` before `BaseLayout` (BaseLayout imports both). Page migrations last (depend on BaseLayout). PROGRESS/memory at end.

---

## Pre-flight (every task)

Before any commit:

```bash
bash scripts/check-git-account.sh
```

Must print green (pkcut-lab account verified). Husky enforces this, but run explicitly in each task to fail fast.

Commit trailer convention (from CLAUDE.md):

```
Rulebooks-Read: PROJECT, CONVENTIONS[, STYLE]
```

Include `STYLE` whenever a task touches visual output (tokens, components, layout).

---

## Task 1: Site URL constant

**Files:**
- Create: `src/lib/site.ts`

- [ ] **Step 1: Create file with single exported constant**

```ts
// src/lib/site.ts
/**
 * Canonical site URL. Mirrors astro.config.mjs `site`.
 * Used by hreflang.ts to build absolute alternate URLs.
 */
export const SITE_URL = 'https://konverter.pages.dev';
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 3: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/site.ts
git commit -m "feat(lib): add SITE_URL constant

Rulebooks-Read: PROJECT, CONVENTIONS"
```

---

## Task 2: `hreflang.ts` — phase-aware builder (TDD)

**Files:**
- Create: `tests/lib/hreflang.test.ts`
- Create: `src/lib/hreflang.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/hreflang.test.ts
import { describe, it, expect } from 'vitest';
import {
  ACTIVE_LANGUAGES,
  DEFAULT_LANGUAGE,
  buildHreflangLinks,
} from '../../src/lib/hreflang';

describe('ACTIVE_LANGUAGES', () => {
  it('contains exactly de in Phase 0', () => {
    expect(ACTIVE_LANGUAGES).toEqual(['de']);
  });

  it('DEFAULT_LANGUAGE is de', () => {
    expect(DEFAULT_LANGUAGE).toBe('de');
  });
});

describe('buildHreflangLinks', () => {
  it('emits one alternate per active language plus x-default (Phase 0: 2 entries)', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    expect(links).toHaveLength(ACTIVE_LANGUAGES.length + 1);
  });

  it('includes x-default pointing at default language URL', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    const xDefault = links.find((l) => l.hreflang === 'x-default');
    expect(xDefault).toBeDefined();
    expect(xDefault?.href).toBe('https://konverter.pages.dev/de/');
  });

  it('builds absolute URLs with trailing path', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/styleguide/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/styleguide/');
  });

  it('normalises path: missing leading slash is added', () => {
    const links = buildHreflangLinks({ pathWithoutLang: 'styleguide/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/styleguide/');
  });

  it('normalises path: missing trailing slash is added for non-root', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/styleguide' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/styleguide/');
  });

  it('root path "/" maps to /{lang}/ (no double slash)', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/lib/hreflang.test.ts`
Expected: FAIL with "Cannot find module '../../src/lib/hreflang'".

- [ ] **Step 3: Implement minimal `hreflang.ts`**

```ts
// src/lib/hreflang.ts
import { SITE_URL } from './site';

/**
 * Active languages — single source of truth.
 * Phase 0: de only. Phase 3: de, en, es, fr, pt-br.
 * Imported by astro.config.mjs so i18n.locales stays in sync.
 */
export const ACTIVE_LANGUAGES = ['de'] as const;

export type ActiveLanguage = (typeof ACTIVE_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: ActiveLanguage = 'de';

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * Build hreflang + x-default alternate link entries for a page.
 *
 * @param pathWithoutLang - Path without language prefix, e.g. "/" or "/styleguide/".
 *                         Leading and trailing slashes are normalised.
 */
export function buildHreflangLinks(
  { pathWithoutLang }: { pathWithoutLang: string },
): HreflangLink[] {
  const normalised = normalisePath(pathWithoutLang);

  const perLanguage: HreflangLink[] = ACTIVE_LANGUAGES.map((lang) => ({
    hreflang: lang,
    href: `${SITE_URL}/${lang}${normalised}`,
  }));

  const xDefault: HreflangLink = {
    hreflang: 'x-default',
    href: `${SITE_URL}/${DEFAULT_LANGUAGE}${normalised}`,
  };

  return [...perLanguage, xDefault];
}

function normalisePath(path: string): string {
  if (path === '' || path === '/') return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  const withBoth = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return withBoth;
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run tests/lib/hreflang.test.ts`
Expected: PASS — 6/6 tests green.

- [ ] **Step 5: Run full test suite to confirm no regression**

Run: `npm test`
Expected: PASS — 61/61 (55 existing + 6 new).

- [ ] **Step 6: Type-check**

Run: `npm run check`
Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 7: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/hreflang.ts tests/lib/hreflang.test.ts
git commit -m "feat(i18n): phase-aware hreflang builder

Rulebooks-Read: PROJECT, CONVENTIONS"
```

---

## Task 3: Wire `ACTIVE_LANGUAGES` into `astro.config.mjs`

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Replace local constant with import**

Open `astro.config.mjs`. Replace the line

```js
const SUPPORTED_LANGUAGES = ['de'];
```

with

```js
import { ACTIVE_LANGUAGES } from './src/lib/hreflang.ts';
```

Then in `i18n`, replace `locales: SUPPORTED_LANGUAGES,` with `locales: [...ACTIVE_LANGUAGES],` (spread because `ACTIVE_LANGUAGES` is `readonly`).

- [ ] **Step 2: Run build to verify config still loads**

Run: `npm run build`
Expected: PASS — builds `/de/` and `/de/styleguide/` (2 pages), no config errors.

- [ ] **Step 3: Commit**

```bash
bash scripts/check-git-account.sh
git add astro.config.mjs
git commit -m "refactor(i18n): astro.config reads ACTIVE_LANGUAGES from hreflang.ts

Rulebooks-Read: PROJECT, CONVENTIONS"
```

---

## Task 4: `ThemeToggle.svelte` — three-state toggle (TDD via Vitest)

**Files:**
- Create: `tests/components/theme-toggle.test.ts`
- Create: `src/components/ThemeToggle.svelte`

Component contract (locked by Session 2 + Spec 5.2):
- Three visible buttons: **Auto**, **Hell**, **Dunkel** (german labels — DE is launch language).
- On mount: reads `localStorage['theme']`. If `'light'` or `'dark'` → that mode is active. Else → `'auto'`.
- Clicking **Auto**: removes `localStorage['theme']`, sets `dataset.theme` to system-preference result.
- Clicking **Hell**: `localStorage.setItem('theme', 'light')`, `dataset.theme = 'light'`.
- Clicking **Dunkel**: `localStorage.setItem('theme', 'dark')`, `dataset.theme = 'dark'`.
- When in auto mode: listens to `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` and mirrors to `dataset.theme`. Unsubscribes on destroy.
- `aria-pressed` on each button reflects current mode.
- Keyboard: buttons are native `<button>` — Enter/Space free from browser.

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/theme-toggle.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import ThemeToggle from '../../src/components/ThemeToggle.svelte';

function setupDom() {
  document.documentElement.dataset.theme = 'light';
  localStorage.clear();
}

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
    dispatchEvent: () => true,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    fireChange(newMatches: boolean) {
      (mql as any).matches = newMatches;
      listeners.forEach((cb) =>
        cb({ matches: newMatches } as MediaQueryListEvent),
      );
    },
  };
}

describe('ThemeToggle', () => {
  beforeEach(setupDom);

  it('renders three buttons labelled Auto / Hell / Dunkel', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const labels = Array.from(target.querySelectorAll('button')).map(
      (b) => b.textContent?.trim(),
    );
    expect(labels).toEqual(['Auto', 'Hell', 'Dunkel']);
    unmount(cmp);
  });

  it('click on Hell stores theme=light and sets dataset', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const hell = target.querySelectorAll('button')[1] as HTMLButtonElement;
    hell.click();
    flushSync();
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount(cmp);
  });

  it('click on Dunkel stores theme=dark and sets dataset', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const dunkel = target.querySelectorAll('button')[2] as HTMLButtonElement;
    dunkel.click();
    flushSync();
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    unmount(cmp);
  });

  it('click on Auto removes theme key and mirrors system preference', () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
    mockMatchMedia(false); // system = light
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const auto = target.querySelectorAll('button')[0] as HTMLButtonElement;
    auto.click();
    flushSync();
    expect(localStorage.getItem('theme')).toBeNull();
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount(cmp);
  });

  it('in auto mode, responds to system-scheme change', () => {
    const mm = mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    // already auto by default (no localStorage)
    mm.fireChange(true);
    flushSync();
    expect(document.documentElement.dataset.theme).toBe('dark');
    unmount(cmp);
  });

  it('aria-pressed reflects current mode after click', () => {
    mockMatchMedia(false);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const cmp = mount(ThemeToggle, { target });
    flushSync();
    const [auto, hell, dunkel] = target.querySelectorAll('button');
    (hell as HTMLButtonElement).click();
    flushSync();
    expect(auto?.getAttribute('aria-pressed')).toBe('false');
    expect(hell?.getAttribute('aria-pressed')).toBe('true');
    expect(dunkel?.getAttribute('aria-pressed')).toBe('false');
    unmount(cmp);
  });
});
```

- [ ] **Step 2: Add `jsdom` to Vitest if missing**

Check `vitest.config.ts` (or `vite.config.ts`) for `test.environment`. If it is not `'jsdom'`, add it:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
```

If `@sveltejs/vite-plugin-svelte` is not present in `devDependencies`, install it exact-pinned:

```bash
npm install --save-exact --save-dev @sveltejs/vite-plugin-svelte@5.0.3 jsdom@25.0.1
```

(Check `package.json` first to avoid duplicate installs — `@astrojs/svelte@7` may already pull it transitively, but it must be in `devDependencies` for vitest to resolve it directly.)

- [ ] **Step 3: Run the test to verify failure**

Run: `npx vitest run tests/components/theme-toggle.test.ts`
Expected: FAIL — "Cannot find module '../../src/components/ThemeToggle.svelte'".

- [ ] **Step 4: Implement `ThemeToggle.svelte`**

```svelte
<!-- src/components/ThemeToggle.svelte -->
<script lang="ts">
  /**
   * Three-state theme toggle (auto / light / dark).
   * Contract (locked Session 2):
   *   - localStorage['theme']  = 'light' | 'dark' | absent(=auto)
   *   - document.documentElement.dataset.theme = 'light' | 'dark'
   * Flash-prevention is handled pre-paint by ThemeScript.astro; this
   * component owns runtime mutation + system-scheme-change mirroring.
   */
  type Mode = 'auto' | 'light' | 'dark';

  let mode = $state<Mode>(readInitialMode());
  let mql: MediaQueryList | null = null;

  function readInitialMode(): Mode {
    if (typeof localStorage === 'undefined') return 'auto';
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  }

  function systemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function apply(next: Mode) {
    mode = next;
    if (next === 'auto') {
      localStorage.removeItem('theme');
      document.documentElement.dataset.theme = systemTheme();
    } else {
      localStorage.setItem('theme', next);
      document.documentElement.dataset.theme = next;
    }
  }

  $effect(() => {
    mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (mode === 'auto') {
        document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
      }
    };
    mql.addEventListener('change', onChange);
    return () => mql?.removeEventListener('change', onChange);
  });
</script>

<div
  class="theme-toggle"
  role="group"
  aria-label="Farbschema auswählen"
>
  <button
    type="button"
    aria-pressed={mode === 'auto'}
    onclick={() => apply('auto')}
  >Auto</button>
  <button
    type="button"
    aria-pressed={mode === 'light'}
    onclick={() => apply('light')}
  >Hell</button>
  <button
    type="button"
    aria-pressed={mode === 'dark'}
    onclick={() => apply('dark')}
  >Dunkel</button>
</div>

<style>
  .theme-toggle {
    display: inline-flex;
    gap: var(--space-1);
    padding: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }
  .theme-toggle button {
    font: inherit;
    font-size: var(--font-size-small);
    padding: var(--space-1) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 0;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background var(--motion-fast), color var(--motion-fast);
  }
  .theme-toggle button:hover {
    color: var(--color-text);
  }
  .theme-toggle button[aria-pressed='true'] {
    background: var(--color-bg);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
  }
  .theme-toggle button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
```

**Note to implementer:** if any of `--motion-fast`, `--r-sm`, `--font-size-small` do not exist in `src/styles/tokens.css`, STOP and report. The Session-2 locked contract says new visual tokens must go into **both** `:root` blocks and pass contrast ≥ 7:1 — do not silently invent. (All three tokens should exist; verify with `grep -n 'motion-fast\|--r-sm\|font-size-small' src/styles/tokens.css` first.)

- [ ] **Step 5: Run the test to verify pass**

Run: `npx vitest run tests/components/theme-toggle.test.ts`
Expected: PASS — 6/6 tests green.

- [ ] **Step 6: Run full test suite to confirm no regression**

Run: `npm test`
Expected: PASS — 67/67 (61 from before + 6 new).

- [ ] **Step 7: Type-check**

Run: `npm run check`
Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 8: Commit**

```bash
bash scripts/check-git-account.sh
git add src/components/ThemeToggle.svelte tests/components/theme-toggle.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat(ui): ThemeToggle.svelte three-state runes component

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

(Only stage `vitest.config.ts`, `package.json`, `package-lock.json` if they actually changed in Step 2.)

---

## Task 5: `Header.astro` — sticky brand bar

**Files:**
- Create: `src/components/Header.astro`

Layout: three-zone flex row. Left: wordmark linked to `/{lang}/`. Center: search input stub (disabled, placeholder text — real search comes in Session 9). Right: language switcher stub (shows current lang inert — real switcher in Phase 3) + `ThemeToggle`.

- [ ] **Step 1: Create file**

```astro
---
// src/components/Header.astro
import ThemeToggle from './ThemeToggle.svelte';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
---
<header class="site-header">
  <div class="inner">
    <a class="brand" href={`/${lang}/`}>
      <span class="wordmark">Konverter</span>
    </a>

    <div class="search-stub" aria-hidden="true">
      <input
        type="search"
        placeholder="Tools durchsuchen (bald verfügbar)"
        disabled
      />
    </div>

    <div class="right">
      <span class="lang-stub" aria-label="Aktuelle Sprache">
        {lang.toUpperCase()}
      </span>
      <ThemeToggle client:load />
    </div>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
  }
  .inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: var(--space-3) var(--space-6);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-6);
  }
  .brand {
    color: var(--color-text);
    text-decoration: none;
  }
  .wordmark {
    font-weight: 600;
    font-size: 1.125rem;
    letter-spacing: -0.01em;
  }
  .search-stub input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text-muted);
    font: inherit;
    font-size: var(--font-size-small);
  }
  .right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .lang-stub {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
  }

  @media (max-width: 640px) {
    .inner {
      grid-template-columns: auto 1fr;
      row-gap: var(--space-2);
    }
    .search-stub {
      grid-column: 1 / -1;
      order: 3;
    }
  }
</style>
```

- [ ] **Step 2: Commit (isolated — Header is not wired yet)**

```bash
bash scripts/check-git-account.sh
git add src/components/Header.astro
git commit -m "feat(ui): Header.astro with brand, search-stub, lang-stub, theme-toggle

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

---

## Task 6: `Footer.astro` — three-column category stub

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create file**

```astro
---
// src/components/Footer.astro
interface Props {
  lang: string;
}
const { lang } = Astro.props;
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="inner">
    <section>
      <h2>Kategorien</h2>
      <ul>
        <li><span class="stub">Längen (bald)</span></li>
        <li><span class="stub">Dateien (bald)</span></li>
        <li><span class="stub">Text (bald)</span></li>
      </ul>
    </section>
    <section>
      <h2>Rechtliches</h2>
      <ul>
        <li><span class="stub">Impressum (Phase 2)</span></li>
        <li><span class="stub">Datenschutz (Phase 2)</span></li>
      </ul>
    </section>
    <section>
      <h2>Meta</h2>
      <ul>
        <li lang={lang}>Sprache: {lang.toUpperCase()}</li>
        <li>© {year} Konverter</li>
      </ul>
    </section>
  </div>
</footer>

<style>
  .site-footer {
    margin-top: var(--space-24);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
  }
  .inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
  h2 {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 var(--space-3);
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--font-size-small);
  }
  .stub {
    color: var(--color-text-subtle);
    font-style: italic;
  }

  @media (max-width: 640px) {
    .inner {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
bash scripts/check-git-account.sh
git add src/components/Footer.astro
git commit -m "feat(ui): Footer.astro three-column stub

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

---

## Task 7: `BaseLayout.astro` — consolidated shell

**Files:**
- Create: `src/layouts/BaseLayout.astro`

Props:
- `lang: string` (required)
- `title: string` (required)
- `description?: string`
- `pathWithoutLang: string` — used for hreflang; callers supply "/" or "/styleguide/"

- [ ] **Step 1: Create file**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import ThemeScript from '../components/ThemeScript.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { buildHreflangLinks } from '../lib/hreflang';

interface Props {
  lang: string;
  title: string;
  description?: string;
  pathWithoutLang: string;
}
const { lang, title, description, pathWithoutLang } = Astro.props;
const hreflangs = buildHreflangLinks({ pathWithoutLang });
---
<!DOCTYPE html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}

    {/* Flash-prevention MUST be first — sets data-theme before CSS loads */}
    <ThemeScript />

    <link
      rel="preload"
      href="/fonts/Inter-Variable.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />

    {hreflangs.map((l) => (
      <link rel="alternate" hreflang={l.hreflang} href={l.href} />
    ))}
  </head>
  <body>
    <Header lang={lang} />
    <main class="site-main">
      <slot />
    </main>
    <Footer lang={lang} />
  </body>
</html>

<style>
  .site-main {
    max-width: 72rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
  }
</style>
```

- [ ] **Step 2: Commit (not wired yet, pages still use inline heads)**

```bash
bash scripts/check-git-account.sh
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): BaseLayout.astro consolidates head + header + footer

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

---

## Task 8: Migrate `src/pages/[lang]/index.astro`

**Files:**
- Modify: `src/pages/[lang]/index.astro`

- [ ] **Step 1: Replace file contents**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';

export function getStaticPaths() {
  return [{ params: { lang: 'de' } }];
}
const { lang } = Astro.params;
---
<BaseLayout
  lang={lang!}
  title="Konverter — Phase 0 Design System"
  description="Multilinguale Konverter-Webseite. Phase 0 Foundation."
  pathWithoutLang="/"
>
  <h1>Konverter</h1>
  <p>Phase 0 — Design-System live. Sprache: {lang}</p>
  <p>Styleguide: <a href={`/${lang}/styleguide`}>/{lang}/styleguide</a></p>
</BaseLayout>
```

- [ ] **Step 2: Build and sanity-check the generated page**

Run: `npm run build`
Expected: PASS — `/de/index.html` present.

Run: `grep -c '<link rel="alternate"' dist/de/index.html`
Expected: `2` (one `de`, one `x-default`).

Run: `grep -c 'document.documentElement.dataset.theme' dist/de/index.html`
Expected: ≥ `1` (ThemeScript inline).

Run: `grep -c 'site-header' dist/de/index.html`
Expected: `1` (Header renders).

Run: `grep -c 'site-footer' dist/de/index.html`
Expected: `1` (Footer renders).

- [ ] **Step 3: Run tests to confirm no regression**

Run: `npm test`
Expected: PASS — 67/67.

- [ ] **Step 4: Commit**

```bash
bash scripts/check-git-account.sh
git add src/pages/[lang]/index.astro
git commit -m "refactor(pages): /de/ now uses BaseLayout

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

---

## Task 9: Migrate `src/pages/[lang]/styleguide.astro`

**Files:**
- Modify: `src/pages/[lang]/styleguide.astro`

Remove the inline `<script is:inline>` theme-toggle block at the bottom — Header's `ThemeToggle` covers this now. Remove the inline buttons at the top of the body (the three buttons in the `<header>` element inside the page). Keep all the styleguide content sections.

- [ ] **Step 1: Replace file contents**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';

export function getStaticPaths() {
  return [{ params: { lang: 'de' } }];
}
const { lang } = Astro.params;

const colorTokens = [
  'bg', 'surface', 'border', 'text', 'text-muted', 'text-subtle',
  'accent', 'accent-hover', 'success', 'error',
];
const spaceTokens = [1, 2, 3, 4, 6, 8, 12, 16, 24];
const shadowTokens = ['sm', 'md', 'lg'];
---
<BaseLayout
  lang={lang!}
  title="Styleguide — Konverter Design System"
  description="Visuelle Verifikation aller Design-Tokens."
  pathWithoutLang="/styleguide/"
>
  <h1>Styleguide</h1>

  <section style="margin-bottom: var(--space-12);">
    <h2>Typography</h2>
    <h1>H1 — 2.25rem, 600</h1>
    <h2>H2 — 1.75rem, 600</h2>
    <h3>H3 — 1.375rem, 500</h3>
    <p>Body — 1rem, 400, line-height 1.6. Der schnelle braune Fuchs springt über den faulen Hund.</p>
    <p style="font-size: var(--font-size-small); line-height: var(--font-lh-small);">Small — 0.875rem.</p>
    <p style="font-family: var(--font-family-mono);">JetBrains Mono: const x = 42;</p>
  </section>

  <section style="margin-bottom: var(--space-12);">
    <h2>Colors</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: var(--space-4);">
      {colorTokens.map((name) => (
        <div style="border: 1px solid var(--color-border); border-radius: var(--r-md); overflow: hidden;">
          <div style={`background: var(--color-${name}); height: 5rem;`}></div>
          <div style="padding: var(--space-3);">
            <code style="font-family: var(--font-family-mono); font-size: var(--font-size-small);">--color-{name}</code>
          </div>
        </div>
      ))}
    </div>
  </section>

  <section style="margin-bottom: var(--space-12);">
    <h2>Spacing</h2>
    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
      {spaceTokens.map((n) => (
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <code style="font-family: var(--font-family-mono); min-width: 6rem;">--space-{n}</code>
          <div style={`height: var(--space-${n}); background: var(--color-accent); min-width: var(--space-${n});`}></div>
        </div>
      ))}
    </div>
  </section>

  <section style="margin-bottom: var(--space-12);">
    <h2>Shadows</h2>
    <div style="display: flex; gap: var(--space-8); padding: var(--space-6); background: var(--color-surface);">
      {shadowTokens.map((size) => (
        <div style={`background: var(--color-bg); padding: var(--space-6); border-radius: var(--r-md); box-shadow: var(--shadow-${size});`}>
          <code style="font-family: var(--font-family-mono);">--shadow-{size}</code>
        </div>
      ))}
    </div>
  </section>

  <section style="margin-bottom: var(--space-12);">
    <h2>Ad-Slot Placeholder (CLS-prevention)</h2>
    <p style="font-size: var(--font-size-small); color: var(--color-text-muted);">
      Toggle <code>[data-ads-enabled="true"]</code> on &lt;html&gt; to reveal the slot. The reserved space stays either way.
    </p>
    <div class="ad-slot ad-slot--banner" style="display: block; border: 2px dashed var(--color-border);">
      <div style="padding: var(--space-4); color: var(--color-text-muted); text-align: center;">
        Ad Slot Banner — min-height locked
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build and sanity-check**

Run: `npm run build`
Expected: PASS — `/de/styleguide/index.html` present.

Run: `grep -c 'data-theme-set' dist/de/styleguide/index.html`
Expected: `0` (old inline buttons removed — Header toggle replaces them).

Run: `grep -c 'theme-toggle' dist/de/styleguide/index.html`
Expected: ≥ `1` (Header's `ThemeToggle` rendered).

Run: `grep -c '<link rel="alternate" hreflang="x-default"' dist/de/styleguide/index.html`
Expected: `1`.

- [ ] **Step 3: Run full test suite + type-check**

Run: `npm test && npm run check`
Expected: 67/67 PASS; `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 4: Commit**

```bash
bash scripts/check-git-account.sh
git add src/pages/[lang]/styleguide.astro
git commit -m "refactor(pages): styleguide uses BaseLayout, drops inline theme buttons

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

---

## Task 10: Manual visual verification

**Files:** none (smoke-check only).

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify `/de/` in browser**

Open `http://localhost:4321/de/`.

Check:
- Header visible, sticky on scroll.
- Wordmark links to `/de/`.
- Search input shows placeholder and is disabled.
- Language stub shows "DE".
- Theme toggle shows three buttons; clicking Dunkel switches colors instantly (no flash), reloading page keeps dark; clicking Auto removes storage and follows system.
- Footer visible at bottom with three columns.
- No console errors.

- [ ] **Step 3: Verify `/de/styleguide/` in browser**

Open `http://localhost:4321/de/styleguide/`.

Check:
- Same Header + Footer present.
- All styleguide sections render.
- Toggling theme from Header updates styleguide colors live.
- No inline buttons at top of page (those were removed).

- [ ] **Step 4: Stop dev server**

Ctrl+C.

*(No commit — this is a gate, not a code change.)*

---

## Task 11: Session-close — PROGRESS.md + memory + push

**Files:**
- Modify: `PROGRESS.md`
- Modify (user-memory): `C:\Users\carin\.claude\projects\c--Users-carin--gemini-Konverter-Webseite\memory\MEMORY.md`
- Create (user-memory): `C:\Users\carin\.claude\projects\c--Users-carin--gemini-Konverter-Webseite\memory\project_session_3_layout_shell_complete.md`

- [ ] **Step 1: Update `PROGRESS.md`**

Change header `Letztes Update` to `2026-04-18 (Session 3, End)` and `Current Session` to `#3 — Layout-Shell ✅`. Flip Session 3 row to `✅ done` with deliverable `BaseLayout + Header + Footer + ThemeToggle + hreflang`. Replace Next-Session-Plan with Session 4 summary (from Phase-0 foundation plan line 1058+).

- [ ] **Step 2: Write memory file** (reference existing pattern from `project_session_2_design_system_complete.md`)

Content should include: live deliverables, tech-stack additions (if any from Task 4 vitest setup), verification status at HEAD, commits list in order, plan-deviations, locked contracts for Session 4 (e.g. `buildHreflangLinks` signature is now public API — do not break), deferred items, how-to-apply.

- [ ] **Step 3: Append MEMORY.md index line**

Add:

```
- [Session 3 Layout-Shell Complete](project_session_3_layout_shell_complete.md) — 2026-04-18: BaseLayout+Header+Footer+ThemeToggle+hreflang live; 67+/67+ Tests; next = Session 4 Tool-Config
```

- [ ] **Step 4: Final verification**

Run: `npm run build && npm test && npm run check`
Expected: all green.

- [ ] **Step 5: Commit PROGRESS.md**

```bash
bash scripts/check-git-account.sh
git add PROGRESS.md
git commit -m "docs(progress): Session 3 Layout-Shell complete

Rulebooks-Read: PROJECT, CONVENTIONS"
```

- [ ] **Step 6: Push and confirm CI green**

```bash
git push origin main
```

Then:

```bash
gh run list --limit 1 --branch main
```

Expected: latest run `completed success`.

---

## Exit Criteria

- [ ] 11 tasks committed in order, pushed to `origin/main`.
- [ ] `npm test` green (67+/67+): 4 smoke + 45 token + 6 contrast + 6 hreflang + 6 theme-toggle (+ any pre-existing).
- [ ] `npm run build` produces `/de/index.html` + `/de/styleguide/index.html`, both referencing `site-header`, `site-footer`, `theme-toggle`, and two `<link rel="alternate">` tags.
- [ ] `npm run check` → 0 errors / 0 warnings / 0 hints.
- [ ] GitHub Actions green.
- [ ] `PROGRESS.md` reflects Session 3 done + Session 4 next.
- [ ] Memory `project_session_3_layout_shell_complete.md` written, `MEMORY.md` indexed.
- [ ] Dev-server smoke-check passed in Task 10.

## Locked Contracts Produced by Session 3 (for Session 4+)

- `src/lib/hreflang.ts` exports `ACTIVE_LANGUAGES`, `DEFAULT_LANGUAGE`, `buildHreflangLinks`, `HreflangLink`. **Do not change signatures** — add languages by extending `ACTIVE_LANGUAGES` only.
- `BaseLayout.astro` props `{ lang, title, description?, pathWithoutLang }` are the required API for every future page. `pathWithoutLang` MUST end in `/` for non-root, MUST be `/` for root.
- `ThemeToggle.svelte` is `client:load` — NEVER downgrade to `client:idle` without reading Spec 5.2 + Session-2 flash-prevention rationale.
- Component styles use tokens only. Never hardcode colors. Adding tokens follows Session 2 rule: both `:root` blocks + contrast ≥ 7:1.
