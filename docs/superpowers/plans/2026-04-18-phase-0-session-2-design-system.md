# Phase 0 — Session 2: Design-System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete Graphite-palette design-token system (CSS custom properties for light + dark themes, typography, spacing, radii, shadows, motion, ad-slot-CLS-prevention heights) + self-hosted Inter & JetBrains Mono variable fonts + flash-prevention inline script. End state: a `/de/styleguide` route visually proves every token renders, Dark/Light toggles cleanly, and WCAG-AAA contrast is locked down by automated tests.

**Architecture:** Token layer (`src/styles/tokens.css`) holds every design primitive as a CSS custom property. A base layer (`src/styles/global.css`) maps those tokens onto HTML element defaults and imports the font layer (`src/styles/fonts.css`) which declares `@font-face` for the self-hosted variable fonts copied into `public/fonts/` from the `@fontsource-variable/*` packages. An Astro component (`src/components/ThemeScript.astro`) emits a synchronous inline script in `<head>` to set `data-theme` BEFORE the first paint — eliminating the dark/light flash. The Tailwind config already references these CSS vars; we complete the mapping. Ad-slot CSS (`.ad-slot` with `min-height` + hidden-by-default + `[data-ads-enabled="true"]` toggle) lives in `global.css` to make CLS-prevention impossible to forget.

**Tech Stack:** Astro 5.0.0, Tailwind 3.4.15 (already wired in Session 1), `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono` (new, exact-pinned deps), Vitest 2.1.8 (already installed). No new runtime frameworks. No network deps.

**Spec References:** Section 5.1 (Graphite-Palette), 5.2 (Dark/Light Strategie + Flash-Prevention), 5.3 (Typography), 5.4 (Spacing/Radii/Shadows + Ad-Slot-CLS Non-Negotiable), 5.5 (Breakpoints). Non-Negotiable #7 (no runtime network deps — fonts are build-time + self-hosted).

---

## File Structure

| File | Responsibility | Why separate |
|------|----------------|--------------|
| `src/styles/tokens.css` | CSS custom properties (colors both themes, typography, spacing, radii, shadows, motion, ad-slot heights) | Single source of truth; parsed by tests |
| `src/styles/fonts.css` | `@font-face` declarations for self-hosted Inter + JetBrains Mono variable | Isolates font wiring; easy to swap |
| `src/styles/global.css` | `@import` of tokens + fonts + Tailwind; base element resets; `.ad-slot` class | App-wide base layer |
| `src/components/ThemeScript.astro` | Inline `<script is:inline>` that sets `data-theme` + `prefers-color-scheme` meta pre-paint | Must run synchronously, blocking — hence its own component |
| `public/fonts/Inter-Variable.woff2` | Self-hosted Inter Latin subset (weight 100-900 variable) | DSGVO + performance |
| `public/fonts/JetBrainsMono-Variable.woff2` | Self-hosted JetBrains Mono Latin subset | DSGVO + performance |
| `scripts/copy-fonts.sh` | Reproducible copy from `node_modules/@fontsource-variable/*/files/*.woff2` into `public/fonts/` | Reruns on font-package upgrade |
| `src/pages/[lang]/styleguide.astro` | Visual token-gallery route (swatches, typography samples, spacing scale, shadow samples, ad-slot placeholder, theme toggle) | Manual verification surface; no Svelte yet |
| `tests/design-system/contrast.test.ts` | Vitest: parse tokens.css, compute WCAG contrast ratios for text×bg pairs in both themes, assert AAA (≥7:1) | Locks accessibility budget |
| `tests/design-system/tokens.test.ts` | Vitest: parse tokens.css, assert every spec-required custom-property name exists in both themes | Locks the token surface from accidental deletion |
| `src/pages/[lang]/index.astro` (modify) | Add `<link>` to `global.css` + use `<ThemeScript />` | Activate the design system on every page |
| `package.json` (modify) | Add `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono` exact-pinned | Reproducible self-hosted fonts |
| `STYLE.md` (modify stub → final) | Color-usage rules, typography rules, when-to-use-token-vs-Tailwind rule, ad-slot rule, motion rule | Becomes binding rulebook for all future sessions |
| `PROGRESS.md` (modify) | Session 2 row 🟡 → ✅; Next-Session-Plan → Session 3 | Session-close ritual |

---

## Preconditions (verify before Task 1)

- [ ] On branch `main` with Session-1 commits pushed (`git log --oneline` shows `3e293ce` and `7a27e4d`)
- [ ] Workspace git account is `pkcut-lab`: `bash scripts/check-git-account.sh` → green
- [ ] `npm install` has been run; `node_modules/` exists
- [ ] `npm run build` passes (no stale breakage from Session 1)
- [ ] `npm test` passes (smoke tests green)

If any precondition fails, stop and fix before starting Session 2.

---

### Task 1 — Install self-hosted font packages

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Discover the current stable versions**

Run:
```bash
npm view @fontsource-variable/inter version
npm view @fontsource-variable/jetbrains-mono version
```
Expected: semver strings like `5.2.5`. Record them — call them `<INTER_VERSION>` and `<JBM_VERSION>` below.

- [ ] **Step 2: Install with exact pins (no caret)**

Run (substitute the recorded versions):
```bash
npm install --save-exact @fontsource-variable/inter@<INTER_VERSION> @fontsource-variable/jetbrains-mono@<JBM_VERSION>
```
Expected: packages added to `dependencies` (NOT `devDependencies`) without `^` prefix. Lockfile updated.

- [ ] **Step 3: Verify the on-disk files we expect**

Run:
```bash
ls node_modules/@fontsource-variable/inter/files/ | grep 'inter-latin-wght-normal.woff2'
ls node_modules/@fontsource-variable/jetbrains-mono/files/ | grep 'jetbrains-mono-latin-wght-normal.woff2'
```
Expected: each `ls` prints exactly one matching file.

If the file name differs (fontsource sometimes renames), run `ls node_modules/@fontsource-variable/inter/files/ | grep latin` to find the actual Latin variable-weight upright file and record the real names — the copy script in Task 2 must match.

- [ ] **Step 4: Confirm package.json is clean**

Open `package.json` and verify:
- Both packages are in `dependencies`, not `devDependencies`
- Neither has `^` or `~`
- `npm run build` still succeeds: `npm run build` (fail-fast)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(deps): add self-hosted Inter + JetBrains Mono variable fonts

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```
Expected: pre-commit hook green, commit created.

---

### Task 2 — Copy font files into public/fonts/

**Files:**
- Create: `scripts/copy-fonts.sh`
- Create: `public/fonts/Inter-Variable.woff2`, `public/fonts/JetBrainsMono-Variable.woff2`

- [ ] **Step 1: Write the copy script**

Create `scripts/copy-fonts.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

DEST="public/fonts"
mkdir -p "$DEST"

INTER_SRC="node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"
JBM_SRC="node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2"

if [[ ! -f "$INTER_SRC" ]]; then
  echo "❌ Inter source not found at $INTER_SRC"
  echo "   Did you run 'npm install'? Check file name with: ls node_modules/@fontsource-variable/inter/files/"
  exit 1
fi
if [[ ! -f "$JBM_SRC" ]]; then
  echo "❌ JetBrains Mono source not found at $JBM_SRC"
  exit 1
fi

cp "$INTER_SRC" "$DEST/Inter-Variable.woff2"
cp "$JBM_SRC" "$DEST/JetBrainsMono-Variable.woff2"

echo "✓ Copied:"
ls -la "$DEST"/*.woff2
```

- [ ] **Step 2: Make it executable and run it**

```bash
chmod +x scripts/copy-fonts.sh
bash scripts/copy-fonts.sh
```
Expected: prints `✓ Copied:` followed by two `.woff2` lines, each ≥ 50 KB (typical Latin-variable is 70-180 KB).

- [ ] **Step 3: Verify the files**

```bash
ls -la public/fonts/
```
Expected:
- `Inter-Variable.woff2` (~60-180 KB)
- `JetBrainsMono-Variable.woff2` (~30-90 KB)

If either file is `< 10 KB` something went wrong (might have copied an empty or wrong file). Investigate before proceeding.

- [ ] **Step 4: Commit**

```bash
git add scripts/copy-fonts.sh public/fonts/Inter-Variable.woff2 public/fonts/JetBrainsMono-Variable.woff2
git commit -m "$(cat <<'EOF'
feat(fonts): self-host Inter + JetBrains Mono Latin subset

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 3 — Write src/styles/fonts.css

**Files:**
- Create: `src/styles/fonts.css`

- [ ] **Step 1: Create the stylesheet**

```bash
mkdir -p src/styles
```

Create `src/styles/fonts.css`:
```css
/* Self-hosted variable fonts — Latin subset only.
   Copied from @fontsource-variable/* via scripts/copy-fonts.sh.
   DSGVO-konform (no Google Fonts CDN). */

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 100 800;
  font-display: swap;
  src: url('/fonts/JetBrainsMono-Variable.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/fonts.css
git commit -m "$(cat <<'EOF'
feat(styles): @font-face declarations for self-hosted variable fonts

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 4 — Write src/styles/tokens.css (Graphite-Palette, both themes, full token set)

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Create the tokens file**

Create `src/styles/tokens.css`:
```css
/* Design Tokens — Single source of truth.
   Spec: Section 5.1-5.5 (2026-04-17 design doc v1.1).
   WCAG AAA contrast locked by tests/design-system/contrast.test.ts. */

:root {
  /* Colors — Light Mode (default) */
  --color-bg: #FFFFFF;
  --color-surface: #FAFAF9;
  --color-border: #E8E6E1;
  --color-text: #1A1917;
  --color-text-muted: #5C5A55;
  --color-text-subtle: #9C9A94;
  --color-accent: #3A3733;
  --color-accent-hover: #1A1917;
  --color-success: #4A6B4E;
  --color-error: #8B3A3A;
  --icon-filter: none;

  /* Typography */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;

  --font-size-h1: 2.25rem;
  --font-lh-h1: 1.2;
  --font-fw-h1: 600;

  --font-size-h2: 1.75rem;
  --font-lh-h2: 1.3;
  --font-fw-h2: 600;

  --font-size-h3: 1.375rem;
  --font-lh-h3: 1.4;
  --font-fw-h3: 500;

  --font-size-body: 1rem;
  --font-lh-body: 1.6;
  --font-fw-body: 400;

  --font-size-small: 0.875rem;
  --font-lh-small: 1.5;
  --font-fw-small: 400;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Radii */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;

  /* Shadows — graphite-tinted (no blue cast) */
  --shadow-sm: 0 1px 2px rgba(26, 25, 23, 0.05);
  --shadow-md: 0 4px 8px rgba(26, 25, 23, 0.08);
  --shadow-lg: 0 12px 24px rgba(26, 25, 23, 0.12);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 150ms;
  --dur-med: 250ms;

  /* Ad-Slot CLS Prevention (Non-Negotiable — Spec 5.4) */
  --ad-slot-1-height-mobile: 250px;
  --ad-slot-1-height-desktop: 90px;
  --ad-slot-2-height: 250px;
  --ad-slot-3-height: 600px;

  /* Breakpoints (for reference in JS/Svelte; CSS uses Tailwind's scale) */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}

:root[data-theme="dark"] {
  --color-bg: #1A1917;
  --color-surface: #252320;
  --color-border: #3A3733;
  --color-text: #FAFAF9;
  --color-text-muted: #A8A59E;
  --color-text-subtle: #6C6A64;
  --color-accent: #E8E6E1;
  --color-accent-hover: #FFFFFF;
  --color-success: #7FA582;
  --color-error: #C67373;
  --icon-filter: invert(0.92) brightness(1.05);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "$(cat <<'EOF'
feat(styles): Graphite-palette tokens with Dark/Light themes

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 5 — TDD: token-presence test

**Files:**
- Create: `tests/design-system/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```bash
mkdir -p tests/design-system
```

Create `tests/design-system/tokens.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS_PATH = join(process.cwd(), 'src/styles/tokens.css');
const css = readFileSync(TOKENS_PATH, 'utf8');

const LIGHT_BLOCK = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? '';
const DARK_BLOCK = css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\}/)?.[1] ?? '';

const REQUIRED_COLOR_VARS = [
  '--color-bg',
  '--color-surface',
  '--color-border',
  '--color-text',
  '--color-text-muted',
  '--color-text-subtle',
  '--color-accent',
  '--color-accent-hover',
  '--color-success',
  '--color-error',
  '--icon-filter',
];

const REQUIRED_LIGHT_ONLY_VARS = [
  '--font-family-sans',
  '--font-family-mono',
  '--font-size-h1',
  '--font-size-body',
  '--space-1',
  '--space-4',
  '--space-24',
  '--r-sm',
  '--r-md',
  '--r-lg',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--ease-out',
  '--dur-fast',
  '--dur-med',
  '--ad-slot-1-height-mobile',
  '--ad-slot-1-height-desktop',
  '--ad-slot-2-height',
  '--ad-slot-3-height',
  '--bp-sm',
  '--bp-lg',
];

describe('Design Tokens — structural completeness', () => {
  it('parses both :root and :root[data-theme="dark"] blocks', () => {
    expect(LIGHT_BLOCK.length).toBeGreaterThan(100);
    expect(DARK_BLOCK.length).toBeGreaterThan(50);
  });

  it.each(REQUIRED_COLOR_VARS)('light theme declares %s', (varName) => {
    expect(LIGHT_BLOCK).toMatch(new RegExp(`${varName}\\s*:`));
  });

  it.each(REQUIRED_COLOR_VARS)('dark theme declares %s', (varName) => {
    expect(DARK_BLOCK).toMatch(new RegExp(`${varName}\\s*:`));
  });

  it.each(REQUIRED_LIGHT_ONLY_VARS)('declares theme-agnostic var %s', (varName) => {
    expect(LIGHT_BLOCK).toMatch(new RegExp(`${varName}\\s*:`));
  });
});
```

- [ ] **Step 2: Run — expect PASS (Task 4 already wrote the file)**

```bash
npm test -- tests/design-system/tokens.test.ts
```
Expected: all tests pass.

If any test fails, the token file in Task 4 is incomplete. Add the missing variable to `src/styles/tokens.css` and re-run.

- [ ] **Step 3: Commit**

```bash
git add tests/design-system/tokens.test.ts
git commit -m "$(cat <<'EOF'
test(tokens): assert all spec-required CSS custom properties exist

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 6 — TDD: WCAG-AAA contrast test

**Files:**
- Create: `tests/design-system/contrast.test.ts`

- [ ] **Step 1: Write the test**

Create `tests/design-system/contrast.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS_PATH = join(process.cwd(), 'src/styles/tokens.css');
const css = readFileSync(TOKENS_PATH, 'utf8');

function extractBlock(source: string, selector: string): string {
  const re = new RegExp(`${selector.replace(/[[\]]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`);
  return source.match(re)?.[1] ?? '';
}

function parseVar(block: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*:\\s*([^;]+);`);
  return block.match(re)?.[1]?.trim() ?? null;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length !== 6) throw new Error(`Unexpected hex: ${hex}`);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [bright, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (bright + 0.05) / (dark + 0.05);
}

const light = extractBlock(css, ':root');
const dark = extractBlock(css, ':root[data-theme="dark"]');

const AAA = 7;

describe('WCAG AAA contrast — Light theme', () => {
  it('text on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(light, '--color-text')!, parseVar(light, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('accent on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(light, '--color-accent')!, parseVar(light, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('text on surface ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(light, '--color-text')!, parseVar(light, '--color-surface')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
});

describe('WCAG AAA contrast — Dark theme', () => {
  it('text on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(dark, '--color-text')!, parseVar(dark, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('accent on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(dark, '--color-accent')!, parseVar(dark, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('text on surface ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(dark, '--color-text')!, parseVar(dark, '--color-surface')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
});
```

- [ ] **Step 2: Run — expect PASS (spec values are pre-verified ≥ 10:1)**

```bash
npm test -- tests/design-system/contrast.test.ts
```
Expected: all 6 tests pass.

If a test fails, the token color was changed away from the spec-verified value. Either restore the spec value OR (if intentional redesign) verify the new value manually against WCAG calc and update the test.

- [ ] **Step 3: Commit**

```bash
git add tests/design-system/contrast.test.ts
git commit -m "$(cat <<'EOF'
test(contrast): lock WCAG-AAA ratios for text/accent on both themes

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 7 — Write src/components/ThemeScript.astro (flash-prevention)

**Files:**
- Create: `src/components/ThemeScript.astro`

- [ ] **Step 1: Create the component**

```bash
mkdir -p src/components
```

Create `src/components/ThemeScript.astro`:
```astro
---
/**
 * Flash-prevention: sets data-theme BEFORE first paint.
 * Must be rendered synchronously in <head>, before stylesheet links.
 * Spec Section 5.2.
 */
---
<script is:inline>
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored === 'light' || stored === 'dark'
        ? stored
        : (systemDark ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
    } catch (e) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
</script>
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#1A1917" media="(prefers-color-scheme: dark)" />
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeScript.astro
git commit -m "$(cat <<'EOF'
feat(theme): ThemeScript.astro for flash-prevention + theme-color meta

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 8 — Write src/styles/global.css (base layer + ad-slot)

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create the file**

Create `src/styles/global.css`:
```css
@import './tokens.css';
@import './fonts.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base element defaults — use tokens, not hard-coded values. */
html {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body);
  line-height: var(--font-lh-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background: inherit;
  color: inherit;
}

h1, h2, h3 {
  color: var(--color-text);
  margin: 0;
}

h1 { font-size: var(--font-size-h1); line-height: var(--font-lh-h1); font-weight: var(--font-fw-h1); }
h2 { font-size: var(--font-size-h2); line-height: var(--font-lh-h2); font-weight: var(--font-fw-h2); }
h3 { font-size: var(--font-size-h3); line-height: var(--font-lh-h3); font-weight: var(--font-fw-h3); }

a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--dur-fast) var(--ease-out);
}
a:hover { color: var(--color-accent-hover); }

code, pre {
  font-family: var(--font-family-mono);
}

/* Ad-Slot CLS Prevention (Non-Negotiable — Spec 5.4)
   Slot is reserved with min-height always; visible only when opt-in flag is on. */
.ad-slot {
  min-height: var(--ad-slot-1-height-mobile);
  background: var(--color-surface);
  border-radius: var(--r-md);
  display: none;
}
@media (min-width: 768px) {
  .ad-slot--banner {
    min-height: var(--ad-slot-1-height-desktop);
  }
}
.ad-slot--sidebar { min-height: var(--ad-slot-3-height); }

[data-ads-enabled="true"] .ad-slot {
  display: block;
}

/* Respect reduced-motion preference. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
```

- [ ] **Step 2: Verify Tailwind still builds**

```bash
npm run build
```
Expected: build completes cleanly. Note: Tailwind will report `global.css` is fine even though Astro currently imports no global style — we wire it in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "$(cat <<'EOF'
feat(styles): global base layer + ad-slot CLS prevention class

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 9 — Wire global.css + ThemeScript into pages

**Files:**
- Modify: `src/pages/[lang]/index.astro`
- Modify: `src/pages/index.astro` (no change expected — it's a pure redirect; just verify)

- [ ] **Step 1: Open the file**

Read `src/pages/[lang]/index.astro` current content (3-line bootstrap shell).

- [ ] **Step 2: Replace the content**

Replace the entire file with:
```astro
---
import '../../styles/global.css';
import ThemeScript from '../../components/ThemeScript.astro';

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
  <title>Konverter — Phase 0 Design System</title>
  <ThemeScript />
  <link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin />
</head>
<body>
  <main style="padding: var(--space-8); max-width: 48rem; margin: 0 auto;">
    <h1>Konverter</h1>
    <p>Phase 0 — Design-System live. Sprache: {lang}</p>
    <p>Styleguide: <a href={`/${lang}/styleguide`}>/{lang}/styleguide</a></p>
  </main>
</body>
</html>
```

- [ ] **Step 3: Build + smoke-test locally**

```bash
npm run build
```
Expected: no errors. `dist/de/index.html` contains:
- `<script>` block from ThemeScript (check with `grep -c 'document.documentElement.dataset.theme' dist/de/index.html` → 1)
- `<link ... preload ... Inter-Variable.woff2 ...>`
- A `<link rel="stylesheet" ...>` pointing to the bundled CSS
- The bundled CSS in `dist/_astro/*.css` contains `--color-bg:#FFFFFF` (check with grep)

- [ ] **Step 4: Commit**

```bash
git add src/pages/[lang]/index.astro
git commit -m "$(cat <<'EOF'
feat(pages): wire global.css + ThemeScript into DE route

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 10 — Styleguide route (visual verification surface)

**Files:**
- Create: `src/pages/[lang]/styleguide.astro`

- [ ] **Step 1: Create the file**

Create `src/pages/[lang]/styleguide.astro`:
```astro
---
import '../../styles/global.css';
import ThemeScript from '../../components/ThemeScript.astro';

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
<!DOCTYPE html>
<html lang={lang}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Styleguide — Konverter Design System</title>
  <ThemeScript />
  <link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin />
</head>
<body>
  <main style="padding: var(--space-8); max-width: 64rem; margin: 0 auto;">
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
      <h1>Styleguide</h1>
      <div>
        <button data-theme-set="light" style="padding: var(--space-2) var(--space-4);">Light</button>
        <button data-theme-set="dark" style="padding: var(--space-2) var(--space-4);">Dark</button>
        <button data-theme-set="auto" style="padding: var(--space-2) var(--space-4);">Auto</button>
      </div>
    </header>

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
          <div style={`border: 1px solid var(--color-border); border-radius: var(--r-md); overflow: hidden;`}>
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
  </main>

  <script is:inline>
    document.querySelectorAll('[data-theme-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-theme-set');
        if (mode === 'auto') {
          localStorage.removeItem('theme');
          document.documentElement.dataset.theme =
            window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          localStorage.setItem('theme', mode);
          document.documentElement.dataset.theme = mode;
        }
      });
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Build and verify the route generates**

```bash
npm run build
ls dist/de/
```
Expected: `dist/de/styleguide/index.html` exists (due to `build.format: 'directory'` from Session 1).

- [ ] **Step 3: Visual verification in browser**

Run:
```bash
npm run dev
```
Open `http://localhost:4321/de/styleguide` in a browser. Verify:
- Inter font is loaded (not fallback Times/Arial)
- Light theme is default; all 10 color swatches render
- Click "Dark" button → entire page flips to dark palette (no flash on reload)
- Click "Light" → flips back
- Click "Auto" → follows system preference
- Hard reload (Ctrl+Shift+R) with dark saved → NO white flash before dark theme applies
- Spacing bars visibly double at each step
- Shadow cards render with graphite-tinted shadow (no blue cast)
- Ad-slot banner reserves ~90px on desktop (≥768px) or 250px on mobile

Stop the dev server when done (`Ctrl+C`).

- [ ] **Step 4: Run the full test suite**

```bash
npm test
```
Expected: smoke tests + token tests + contrast tests all pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/[lang]/styleguide.astro
git commit -m "$(cat <<'EOF'
feat(pages): /de/styleguide for visual token verification

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 11 — STYLE.md: stub → final rulebook

**Files:**
- Modify: `STYLE.md`

- [ ] **Step 1: Replace the stub**

Open `STYLE.md` and replace its entire content with:

```markdown
# STYLE — Visual Design Rulebook

**Status:** v1 final (Session 2 locked).
**Last reviewed:** 2026-04-18.

---

## 1. Color Usage

- **Always** use token vars, never hex literals in component code.
  - ✅ `color: var(--color-text);`
  - ❌ `color: #1A1917;`
- Accent is **Graphit-Grau**. NO blue, NO purple, NO colored gradients.
- Success (olive green) and error (rusty red) are the ONLY two non-graphite hues. Use sparingly — only for semantic state.
- Icon color is achieved via `filter: var(--icon-filter);` — never recolor icons per-theme manually.

## 2. Typography

- `font-family: var(--font-family-sans);` for all body + UI text.
- `font-family: var(--font-family-mono);` only for code, numeric results in converters, and technical identifiers.
- Use the `--font-size-*` / `--font-lh-*` / `--font-fw-*` token trio for H1-body-small. Do not invent intermediate sizes.
- Never use Google Fonts CDN or any external font host (DSGVO + Non-Negotiable #7).

## 3. Spacing

- Use `--space-1` through `--space-24`.
- No arbitrary `px` values in padding/margin/gap. If you need a value not in the scale, either round to the closest token or discuss adding a new token.
- Tailwind utilities (`p-4`, `gap-6`, etc.) are acceptable where they map to the same scale.

## 4. Radii, Shadows, Motion

- Radii: use `--r-sm | --r-md | --r-lg`. Nothing else.
- Shadows: `--shadow-sm | --shadow-md | --shadow-lg`. They are pre-tinted graphite; never use shadow recipes from Tailwind's default (those have blue cast).
- Motion: any animated transition uses `var(--dur-fast)` or `var(--dur-med)` plus `var(--ease-out)`. Do not invent new durations ad-hoc.
- Respect `@media (prefers-reduced-motion: reduce)` — already handled globally in `global.css`. Don't override without a strong reason.

## 5. Ad-Slot CLS (Non-Negotiable)

- Every slot uses `class="ad-slot"` with the appropriate modifier (`ad-slot--banner`, `ad-slot--sidebar`).
- `min-height` comes from the token; never override inline.
- Slots are hidden by default and shown only when `<html data-ads-enabled="true">`. Do not remove this gate.

## 6. Dark/Light Mode

- Never branch on theme in component logic. Use CSS tokens; they swap automatically.
- Every new color must exist in BOTH `:root` and `:root[data-theme="dark"]` blocks of `tokens.css` — enforced by `tests/design-system/tokens.test.ts`.
- New color pairs must maintain WCAG AAA contrast (≥7:1) for text-on-bg — enforced by `tests/design-system/contrast.test.ts`.

## 7. When Tailwind vs. Token

- **Tailwind utility** for layout (flex, grid, gap, positioning, responsive breakpoints).
- **CSS variable** for colors, typography, spacing scale values, radii, shadows, motion. (Tailwind's `bg-bg`, `text-accent` etc. are ok — they resolve to the vars.)
- For component-internal styles: either approach. Prefer utilities for one-liners, `<style>` blocks with vars for anything non-trivial.

## 8. Icons (Preview)

- Pencil-Sketch monochromatic PNGs in `public/icons/tools/<slug>.png`.
- Display with `filter: var(--icon-filter);` so they auto-invert in dark mode.
- Icon-generation pipeline (Recraft.ai + `pending-icons/` drop folder) is locked down in Session 5+.
```

- [ ] **Step 2: Commit**

```bash
git add STYLE.md
git commit -m "$(cat <<'EOF'
docs(style): promote STYLE.md from stub to final v1 rulebook

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

---

### Task 12 — Full verification pass (build + tests + visual)

**Files:** none modified.

- [ ] **Step 1: Clean build**

```bash
rm -rf dist/
npm run build
```
Expected: build completes. `dist/de/index.html` and `dist/de/styleguide/index.html` both exist.

- [ ] **Step 2: Run all tests**

```bash
npm test
```
Expected: all tests pass:
- `tests/smoke/build.test.ts` (4 tests, from Session 1)
- `tests/design-system/tokens.test.ts` (token presence)
- `tests/design-system/contrast.test.ts` (6 WCAG AAA assertions)

- [ ] **Step 3: Type-check**

```bash
npm run check
```
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Final visual round-trip**

```bash
npm run dev
```
- Visit `http://localhost:4321/de/` — page uses Inter + tokens; no CSS flash on reload
- Visit `http://localhost:4321/de/styleguide` — all sections render
- Toggle Dark → all color swatches invert; shadows still visible; no element with hard-coded colors
- In DevTools → Network tab → hard-reload → `Inter-Variable.woff2` loads from same origin (NOT fonts.gstatic.com)
- Close dev server

- [ ] **Step 5: No commit yet** — verification is silent; next task closes the session.

---

### Task 13 — Session-close: update PROGRESS.md + push

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Update PROGRESS.md**

Edit `PROGRESS.md`:
- Change `**Letztes Update:**` to today's date + `(Session 2, End)`
- Change `**Current Session:** #1 — Bootstrap ✅` → `**Current Session:** #2 — Design-System ✅`
- In the Phase 0 Fortschritt table, change Session 2 row from `⬜ pending` → `✅ done`
- Replace `## Next-Session-Plan` body with:
  ```
  Session 3 — Layout-Shell: `BaseLayout.astro` mit Header, Footer, Hreflang-Infrastruktur; Theme-Toggle als Svelte-Runes-Component. Files: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.svelte`, `src/lib/hreflang.ts`. Referenzen: Spec Section 11.3, 11.4, 5.2. Dependencies: Session 2 (Tokens + Fonts live).
  ```

- [ ] **Step 2: Commit**

```bash
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): close Session 2, next = Session 3 Layout-Shell

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE
EOF
)"
```

- [ ] **Step 3: Push**

```bash
git push
```
Expected: all Session 2 commits pushed to `origin/main`. CI (build-only workflow) runs against the new tree and passes.

- [ ] **Step 4: Verify on GitHub**

Open `https://github.com/pkcut-lab/konverter` — confirm latest commit is the PROGRESS.md session-close and the CI check (Deploy workflow → build-and-deploy) is green.

**✅ Session 2 complete.** Deliverables:
- `tokens.css` with full Graphite-Palette (light + dark), WCAG AAA-locked
- Self-hosted Inter + JetBrains Mono Latin-Subset
- `ThemeScript.astro` flash-prevention in every page
- `global.css` with ad-slot CLS-prevention baked in
- `/de/styleguide` visually proves every token
- `STYLE.md` v1 final — binding rulebook from here on
- 10 new tests (token presence + WCAG-AAA) guard future edits

---

## Integration Notes for Session 3

- `ThemeToggle.svelte` (Session 3) will mutate `document.documentElement.dataset.theme` and write to `localStorage.setItem('theme', ...)`. The contract with `ThemeScript.astro` is already fixed — do not change the storage key or dataset attribute name.
- `BaseLayout.astro` must include `<ThemeScript />` + global-css import. It replaces the duplicated head-block currently in `[lang]/index.astro` and `[lang]/styleguide.astro`. Plan that refactor in Session 3 — not here.
- Any new color token must go into `tokens.css` in BOTH theme blocks; `tests/design-system/tokens.test.ts` will fail otherwise.

## Rollback

If Session 2 needs to be fully reverted:
```bash
git reset --hard 7a27e4d
bash scripts/copy-fonts.sh  # regenerate fonts if missing
```
(`7a27e4d` = Session 1 close commit.)
