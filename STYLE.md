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
