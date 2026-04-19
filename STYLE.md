# STYLE — Visual Design Rulebook

**Status:** v1 final (Session 2 locked) + v1.1 Skill-Integration (2026-04-19).
**Last reviewed:** 2026-04-19.

---

## 0. Aesthetic Direction (Locked)

**Refined Minimalism.** Ruhige Flächen, großzügige Weißräume, klare Typografie-Hierarchie, präzise Spacing-Rhythmen, dezente Mikro-Interaktionen. Schönheit entsteht aus Restraint und Detail-Präzision — nicht aus Farbe, Ornament, Asymmetrie.

**Hard Don'ts** (auch wenn ein Design-Skill es vorschlägt):
- Keine bunten Gradienten (insbesondere keine Purple-on-White AI-Gradients)
- Keine Asymmetrie-/Grid-Breaking-Layouts, keine diagonalen Kompositionen
- Keine Noise-Texturen, Grain-Overlays, Gradient-Meshes, dekorative Borders
- Keine "unerwarteten Fonts" — Inter + JetBrains Mono sind gelockt (Session 2)
- Keine maximalistische Visual-Density

**Do's (das ist der Qualitäts-Hebel):**
- Typografie-Hierarchie über Size/Weight/Color, nicht über Farbakzente
- Whitespace als aktives Gestaltungselement (eher mehr als weniger)
- Dezente Micro-Copy-Details, tabular-nums bei Zahlen, präzise Focus-Ringe
- Karten/Flächen mit 1px-Border + subtilem Shadow statt Farb-Füllung
- Einzelner Fokus-Punkt pro Seite, nicht konkurrierende Call-to-Actions

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

## 9. Skill-Integration für Design-Arbeit

Bei jeder Session, die UI erstellt oder überarbeitet, ist folgende Skill-Sequenz Pflicht:
1. **`minimalist-ui`** (leonxlnx/taste-skill) — Form-Fundament (Bento, Borders, Radii, Padding-Zahlen).
2. **`frontend-design`** (anthropics/skills) — Hierarchie, Whitespace, Detail-Politur.
3. **Code schreiben.**
4. **`web-design-guidelines`** (vercel-labs) — Audit-Pass nach Fertigstellung.

**Hard-Caps (überstimmen alle Skills):**
- Ästhetik = "refined minimalism" (Section 0).
- Palette = Graphit-Tokens (Section 1) — Pastell-Akzente aus `minimalist-ui` werden NICHT übernommen.
- Fonts = Inter + JetBrains Mono gelockt (Section 2) — Skill-Defaults "avoid Inter" werden überstimmt.
- Konkrete px/Hex-Werte aus Skills auf Tokens mappen, niemals direkt übernehmen.
- Stack = Astro + Svelte-Runes — React/Next.js-Syntax wird umgeschrieben.

**CLAUDE.md Section 5** ist die authoritative Quelle dieses Prozesses — falls Konflikt, gilt dort.
