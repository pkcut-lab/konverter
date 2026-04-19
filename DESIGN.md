# DESIGN.md — Konverter Webseite

> **Für Stitch (Google Labs) und jeden AI-Agent, der UI für dieses Projekt generiert.**
> Single source of truth ist `src/styles/tokens.css` + `STYLE.md` im Repo. Diese Datei destilliert beide in das offizielle Stitch-DESIGN.md-Format (9 Sektionen) plus Agent-Prompt-Guide.
> Bei Konflikt gilt `tokens.css` (enforced durch `tests/design-system/tokens.test.ts` + `contrast.test.ts`, WCAG AAA ≥7:1).
> Regeneriere diese Datei, wenn sich `tokens.css` oder `STYLE.md §0-§11` ändern.

---

## 1. Visual Theme & Atmosphere

**Refined editorial minimalism in graphite monochrome.** Quiet sophistication through typography hierarchy, precise spacing rhythms, and hairline borders — never through color, ornament, or motion.

The website hosts over a thousand conversion tools (unit converters, file converters, calculators, generators). Each tool page serves a single pragmatic job. The UI must recede so the tool becomes the focus: a calm blank-page canvas, a single dominant widget, and typographic metadata around it. No competing calls-to-action, no decorative flourishes, no chromatic accents.

The atmosphere: a printed editorial page set in a quiet library — restrained, precise, warm-toned. Not clinical. Not corporate. Not playful. The user should feel respected and unhurried.

**Mood keywords:** calm, editorial, precise, warm-monochrome, paper-like, serious-but-not-cold, restrained, dignified.

**Anti-mood (what it is NOT):** tech-bro dashboard, SaaS template, Material, glassmorphic, retro, neo-brutalist, maximalist, playful, "elevating", "seamless".

---

## 2. Color Palette & Roles

All colors are locked in `src/styles/tokens.css`. Never approximate the hex values below.

### Light Mode (default)

| Role | Hex | Semantic Name | Functional Use |
|---|---|---|---|
| Background | `#FFFFFF` | True white | Page canvas — the reader's blank page |
| Surface | `#FAFAF9` | Warm off-white | Cards, panels, input fields (one step up from canvas) |
| Border | `#E8E6E1` | Warm pale gray | 1px hairlines, dividers, card outlines — the only structural line |
| Text | `#1A1917` | Graphite off-black | Body text, headings, primary content (NEVER pure `#000000`) |
| Text Muted | `#5C5A55` | Mid warm gray | Subtitles, labels, secondary copy |
| Text Subtle | `#9C9A94` | Light warm gray | Timestamps, metadata, disabled captions |
| Accent | `#3A3733` | Deep graphite | Primary CTA background, active links, focus rings |
| Accent Hover | `#1A1917` | Darkest graphite | Hover state for accent elements |
| Success | `#4A6B4E` | Muted olive | Confirmation states only — sparingly |
| Error | `#8B3A3A` | Muted rust | Error states only — sparingly |

### Dark Mode

| Role | Hex | Notes |
|---|---|---|
| Background | `#1A1917` | Inverted graphite canvas |
| Surface | `#252320` | Warm near-black |
| Border | `#3A3733` | Deep graphite hairline |
| Text | `#FAFAF9` | Warm near-white |
| Text Muted | `#A8A59E` | |
| Text Subtle | `#6C6A64` | |
| Accent | `#E8E6E1` | Inverted — light accent on dark |
| Accent Hover | `#FFFFFF` | |
| Success | `#7FA582` | Muted olive lightened |
| Error | `#C67373` | Muted rust lightened |

### Role Rules

- **Graphite only.** No blue, purple, teal, cyan, pink, yellow, orange, or any saturated chromatic accent.
- **Success and Error are the ONLY two non-graphite hues.** Use exclusively for semantic state signaling (form validation, operation result).
- **No pastels.** Pale blue, pale green, pale yellow, pale red from other design systems are forbidden here.
- **No colored backgrounds on large surfaces.** Sections, heroes, cards use white or warm off-white only.
- **No gradients of any kind.** Use solid fill plus a hairline border for separation.

---

## 3. Typography Rules

### Font Families

- **Sans (every legible surface — body, UI, headings, buttons):** `Inter`
- **Monospace (numeric output, code, keyboard shortcuts, technical identifiers):** `JetBrains Mono`
- Both fonts are **self-hosted** via `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`. Never link to Google Fonts CDN (GDPR requirement, non-negotiable).
- **No serif fonts.** Hero headlines are Inter sans, weight 600 — not Lyon, not Newsreader, not Playfair, not Instrument Serif.

### Scale (rem-based)

| Level | Size | Line Height | Weight | Additional |
|---|---|---|---|---|
| H1 | 2.25rem (36px) | 1.2 | 600 | `letter-spacing: -0.015em`, `text-wrap: balance` |
| H2 | 1.75rem (28px) | 1.3 | 600 | `text-wrap: balance` |
| H3 | 1.375rem (22px) | 1.4 | 500 | |
| Body | 1rem (16px) | 1.6 | 400 | |
| Small | 0.875rem (14px) | 1.5 | 400 | |

Do not invent intermediate sizes. If a new size is genuinely needed, add it to the token scale first.

### Numeric Outputs

Conversion results, counters, quality sliders, file sizes — anything that displays a numeric value:

- **Font:** JetBrains Mono
- **Feature:** `font-variant-numeric: tabular-nums` (aligned digit columns)
- **Size:** H1 scale when the number is the hero of the card (e.g., `100 m → 328.084 ft`)

### Unit / Number Pairs

Always use a **non-breaking space (U+00A0)** between value and unit to prevent orphan-breaks across lines:
- ✅ `10 MB`, `5 min`, `100 m`, `328.084 ft`
- ❌ `10 MB` (regular space — can wrap)

In source files: `\u00A0` (JS/TS strings) or `&nbsp;` (HTML/Markdown).

### Translation Protection

Wrap unit labels in `<span translate="no">…</span>` (e.g., `Fuß`, `MB`) to prevent browser auto-translate from corrupting the unit.

---

## 4. Component Stylings

### Header (Site-wide Navigation Bar)

- **Structure:** schmale Leiste, 64px Höhe, volle Bildschirmbreite, `background: var(--color-bg)` ohne Blur.
- **Inner container:** max-width `72rem`, horizontal padding `1.5rem`, vertikal zentriert per Flex.
- **Left block:** Wortmarke "Konverter" in Inter 600, 18px, `color: var(--color-text)`. Klickbar → `/[lang]/`.
- **Center / right block (Desktop):** drei Text-Links in Inter 500, 14px, `color: var(--color-text-muted)`, gap 24px. Links sind sprachabhängig:
  - DE: `Werkzeuge` · `Über` · `Sprache ▾`
  - EN: `Tools` · `About` · `Language ▾`
- **Trailing element:** ThemeToggle rechts außen, 32×32px quadratisch, 1px Border, `var(--r-md)`, Icon swap Sonne ↔ Mond. Keine Label-Text.
- **Divider:** 1px `var(--color-border)` unter dem Header, volle Breite.
- **NIEMALS erlaubt:**
  - Login-/Sign-In-/Sign-Up-Buttons oder -Links
  - Account-Avatare, User-Menüs, Benachrichtigungs-Glocken
  - CTA-Farbflächen im Header (kein gefüllter Button oben rechts)
  - Mehr als vier Interaktionselemente gesamt (Brand + max. 3 Links + Toggle)

### Card (The Primary Container)

- **Background:** Surface (`#FAFAF9` light / `#252320` dark)
- **Border:** `1px solid` Border (`#E8E6E1` light / `#3A3733` dark)
- **Radius:** `8px` (medium) — never `rounded-full`, never sharp corners, never `4px` for cards
- **Padding:** `24px` on mobile, `32px` on desktop
- **Shadow rest:** `0 1px 2px rgba(26, 25, 23, 0.05)` — graphite-tinted, ultra-diffuse
- **Shadow hover (interactive cards only):** `0 4px 8px rgba(26, 25, 23, 0.08)`

### Primary CTA / Button

- **Background:** Accent (`#3A3733` light / `#E8E6E1` dark)
- **Text color:** `#FFFFFF` light / `#1A1917` dark
- **Padding:** `12px 20px`
- **Radius:** `8px`
- **Font weight:** 500
- **Active state:** `transform: scale(0.98)` over `150ms` with `cubic-bezier(0.16, 1, 0.3, 1)`
- **Focus-visible:** `outline: 2px solid` Accent, `outline-offset: 2px`
- **One primary CTA per page.** The dark button IS the focus point — no competing accent buttons.

### Secondary / Ghost Button

- Background: transparent
- Text: Accent color
- Border: `1px solid` Border
- Hover: background shifts to Surface

### Input Field

- **Background:** Background (the card's parent, not Surface)
- **Border:** `1px solid` Border at rest, `1px solid` Accent on focus
- **Radius:** `8px`
- **Padding:** `10px 14px`
- **Label:** above the input, never as floating placeholder, `0.875rem` weight 500
- **Focus-visible:** `outline: 2px solid` Accent, `outline-offset: 2px`

### Hairline Divider

- `1px solid` Border-color. That's it.
- No thick dividers, no colored dividers, no gradient-fades, no shadow separators.

### Tag / Badge (Use Sparingly)

- **Shape:** pill (`border-radius: 9999px`) — this is the ONE allowed exception to the "no rounded-full" rule, and only for tags/badges. Never for buttons or cards.
- **Typography:** JetBrains Mono, `0.75rem`, `uppercase`, `letter-spacing: 0.05em`
- **Background:** Surface (no pastels)
- **Border:** `1px solid` Border

### Keyboard Shortcut Chip (`<kbd>`)

- Border: `1px solid` Border
- Radius: `4px` (small — kbd is an exception to the 8px card-norm)
- Background: Surface
- Font: JetBrains Mono, `0.875rem`
- Padding: `2px 6px`

### Accordion / FAQ

- Strip all container boxes and backgrounds
- Items separated ONLY by `border-bottom: 1px solid` Border
- Toggle indicator: clean `+` / `−` character in Accent color (NEVER chevrons, arrows, or triangles)
- Expanded content: `16px` padding-top, no background change

### Dropzone (File Upload)

- Border: `2px dashed` Border (`1px dashed` reads as a bug on mid-DPI screens)
- Padding: `48px` (generous — the dropzone IS the affordance)
- Drag-over state: border solid, color switches to Accent
- Inside: centered hint copy + Browse button + meta line showing accepted MIME types and max size

### Loader

Two variants only:

- **Spinner:** `24×24`, `1px` hairline arc, stroke `#9C9A94`, 900ms rotation, linear. Under `prefers-reduced-motion`: slower rotation (`2.4s`), NOT frozen.
- **Progress Bar:** `2px` height, background Border, fill `#9C9A94`, width transitions `250ms ease-out`. Label in JetBrains Mono tabular-nums on the right.

---

## 5. Layout Principles

### Page Rhythm (Tool Detail Pages — `/[lang]/[slug]`)

| Block | max-width | Notes |
|---|---|---|
| `.tool-hero` (H1 + tagline) | `40rem` | Editorial reading flow, centered |
| Tool icon | `160×160` desktop, `120×120` mobile | Pencil-sketch WebP, native 1:1 |
| `.tool-section` (the tool widget) | `34rem` | Narrowest — the tool is the visual anchor |
| `.tool-article` (intro, how-to, FAQ) | `42rem` | Prose-optimal reading width |

### Vertical Rhythm

- Between hero and tool: `3rem` (48px) desktop, `2rem` mobile
- Between tool and article: `6rem` (96px) desktop, `4rem` mobile
- Between major article sections: `3rem`

### Grid System

- **Feature grids:** CSS Grid, symmetrical or bento-asymmetrical — but always grid-aligned
- **Forbidden:** tilted cards, rotated elements, diagonal flows, overlapping-by-decoration, grid-breaking asymmetry
- All spacing snaps to the scale: `0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 3 / 4 / 6 rem`

### Alignment

- Text: left-aligned everywhere except page hero H1 (centered within the 40rem block)
- Numeric outputs: right-aligned in tables, centered in hero-result cards
- Never justify text (creates uneven spaces)

---

## 6. Depth & Elevation

**Depth is communicated by hierarchy and hairline, not by shadow or layering.**

Two elevation levels only:

| Level | Shadow | Used For |
|---|---|---|
| Rest | `0 1px 2px rgba(26, 25, 23, 0.05)` | Cards, panels, inputs — barely perceptible |
| Hover / Focus | `0 4px 8px rgba(26, 25, 23, 0.08)` | Interactive cards on hover |

### Forbidden

- Dramatic shadows (`shadow-lg`, `shadow-xl`, `shadow-2xl` Tailwind defaults — they have blue cast)
- 3D glassmorphism (beyond a subtle navbar blur, which we do not use)
- Beveled edges, inner shadows, chunky borders
- Layered transparent overlays on cards

### Dark Mode Elevation

Shadows are even softer in dark mode — elevation is communicated primarily via border contrast (`#3A3733` card border against `#1A1917` canvas). Do not increase shadow opacity in dark mode.

---

## 7. Do's and Don'ts

### DO

- Use typography hierarchy (size + weight + color) as the primary visual structure
- Use whitespace generously — blank space is an active design element
- Use `text-wrap: balance` on every H1 and H2
- Use `tabular-nums` on every numeric output
- Use NBSP (U+00A0) between every value-unit pair: `10 MB`, `5 min`, `100 m`
- Use `prefers-reduced-motion: reduce` guards on every animation, without exception
- Use `focus-visible:outline 2px solid <accent>` on every interactive element
- Use `1px solid #E8E6E1` (light) / `#3A3733` (dark) for every container border
- Use the exact hex values in Section 2 — never approximate
- Write realistic German tool copy ("Konvertiere Meter in Fuß", "Hintergrund entfernen") — never placeholder text
- Wrap unit labels in `<span translate="no">…</span>`

### DON'T

**Fonts:**
- Don't use Google Fonts CDN — fonts must be self-hosted
- Don't use SF Pro Display, Geist Sans, Switzer, Helvetica Neue — we use Inter
- Don't use editorial serif fonts (Lyon, Newsreader, Playfair, Instrument Serif, EB Garamond)
- Don't use Arial, Roboto, Open Sans, system-ui as the primary font

**Colors:**
- Don't use blue, purple, teal, cyan, pink, yellow, orange as accents
- Don't use pastel backgrounds (pale blue, pale green, pale yellow, pale red)
- Don't use gradient backgrounds (`bg-gradient-*`, gradient-mesh, radial blobs)
- Don't use Tailwind default shadows (`shadow-md`, `shadow-lg`) — blue cast
- Don't use pure black `#000000` for body text — use `#1A1917`

**Shapes & Surfaces:**
- Don't use `rounded-full` on cards, buttons, inputs, images, or any large container (tags/badges are the single exception)
- Don't use tilted, rotated, or diagonal layouts
- Don't use noise textures, grain overlays, dot patterns, decorative borders
- Don't use 3D glassmorphism, beveled edges, inset shadows
- Don't use multiple competing CTA buttons on one page

**Icons & Imagery:**
- Don't use Phosphor Icons, Lucide, Feather, Heroicons, Material Icons — tool icons are pencil-sketch WebP files served from `/icons/tools/<toolId>.webp`
- Don't use oversaturated stock photography
- Don't use emoji characters in markup, text, alt text, or aria-labels
- Don't invent new icons ad-hoc — we have a locked pipeline (Recraft → BG-removal → WebP)

**Copy:**
- Don't use AI-copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve", "Embark"
- Don't use placeholder names (John Doe, Acme Corp, Lorem Ipsum) — use realistic German context
- Don't use exclamation marks in CTA text — we are calm and direct
- Don't write body copy longer than 75 characters per line at any viewport

**Technical:**
- Don't introduce horizontal scroll at any viewport ≥320px
- Don't use `px` for padding/margin/gap — snap to the rem scale
- Don't use hex literals in component code — use `var(--color-*)` tokens
- Don't recolor icons per theme manually — use `filter: var(--icon-filter)`

---

## 8. Responsive Behavior

### Breakpoints (mobile-first)

- `≤ 639px` — mobile
- `640px` — small tablets
- `768px` — tablets
- `1024px` — small desktops
- `1280px` — large desktops

### Layout Shifts Across Breakpoints

- **Tool Card:** 100% width with `1rem` side padding on mobile, `34rem` max-width centered on desktop
- **Hero H1:** scales from `1.75rem` (mobile ≤40rem) to `2.25rem` (desktop)
- **Converter widget:** always vertical two-panel stack — NEVER side-by-side, even on wide desktops
- **FileTool widget:** single card with phase-state-machine morph — stays at the same size across breakpoints to prevent CLS (layout jumps)
- **Tool icon:** `120×120` on ≤40rem, `160×160` otherwise
- **Header nav:** horizontal row on desktop, stacked grid (brand + toggle on row 1, search on row 2) on ≤40rem
- **Footer:** 3-column desktop (Werkzeuge / Rechtliches / Meta), single-column stacked mobile

### Hard Rules

- Zero horizontal scroll at any width ≥320px
- Cards never overflow their parent (use `min-width: 0` on grid children if needed)
- Numeric outputs use `overflow-wrap: break-word` so long conversion results (e.g., many decimals) don't burst the card

---

## 9. Agent Prompt Guide

When driving Stitch (or any generating agent) with this DESIGN.md active:

### Prompt Prefix (Mandatory on Every Generation)

> "Generate this in accordance with DESIGN.md. Use Tailwind utility classes for layout. All colors must resolve to the exact hex values in Section 2. All typography must use Inter (sans) and JetBrains Mono (mono) per Section 3. Follow every Don't in Section 7 without exception. This is a refined editorial minimalism aesthetic in graphite monochrome — not SaaS, not Material, not maximalist."

### For Tool-Widget Screens (Converters, File Tools, Calculators)

> "Build a tool detail page. Header: brand 'Konverter' left, three text links (Werkzeuge · Über · Sprache ▾) right, 32×32 theme toggle at the far right. NO Sign-In, NO Login, NO user avatar, NO English nav labels. Hero block (40rem max-width, centered): H1 title + tagline + optional 160×160 pencil-sketch icon placeholder. Tool card below (34rem max-width, centered): 1px hairline border in `#E8E6E1`, 8px radius, 32px padding, warm off-white `#FAFAF9` background. Article block below (42rem max-width): intro paragraph, numbered how-to list with `counter(how-step, decimal-leading-zero)` prefix in JetBrains Mono, FAQ accordion with `+` / `−` toggles and `border-bottom` dividers only."

### For FileTool-Widget Screens (Hintergrund-Entferner, WebP-Konverter, HEIC-Decoder)

> "Build a file-tool detail page for the RESULT state (datei bereits verarbeitet). Header: brand 'Konverter' left, three text links (Werkzeuge · Über · Sprache ▾) right, 32×32 theme toggle at the far right. NO Sign-In, NO Login. H1 + tagline, then the tool card (`34rem` max-width, 1px border `#E8E6E1`, 8px radius, 32px padding). Card content: status badge `FERTIG` top-right (kbd-style, JetBrains Mono 11px uppercase); two-column preview grid (gap 16px) with labels `Original` and `Ergebnis` in JetBrains Mono 11px uppercase — the Ergebnis thumbnail uses a light checkerboard pattern to signal transparency; meta line `WIDTH×HEIGHT · FORMAT · SIZE` in JetBrains Mono 12px; action row with one primary button (`Herunterladen`, dark #3A3733) and two ghost buttons (`Neues Bild`, `In Zwischenablage`). Optional right-side bento column (`24rem` wide) with an `So funktioniert es` list of three steps prefixed `01 / 02 / 03` in JetBrains Mono. Privacy banner below (`Browser-lokal · Kein Upload · DSGVO-ready`). Footer unchanged."

### For Homepage / Tool-Listing Screens

> "Bento grid of tool cards. 3-column desktop, 2-column tablet, 1-column mobile. Each card: 1px hairline border `#E8E6E1`, 8px radius, 24px padding, warm off-white `#FAFAF9` background. Card interior: 48px pencil-sketch icon placeholder, H3 title, one-line body-small tagline in Text Muted `#5C5A55`. Hover state: shadow lifts to `0 4px 8px rgba(26,25,23,0.08)`. No chromatic accents, no colored badges."

### Stitch Variant Settings

When calling `screen.variants()`:

- **`creativeRange: 'REFINE'`** — we are refining an established system, never exploring or reimagining
- **`aspects: ['LAYOUT']`** — only vary layout. NEVER let Stitch vary `COLOR_SCHEME`, `IMAGES`, or `TEXT_FONT` — those are locked by this document
- **`variantCount`:** 3 maximum (cheaper, lets us compare without decision paralysis)

### Iteration Protocol

- If the output violates any Don't in Section 7, reject it and re-prompt — do not hand-patch Stitch output in Svelte
- Prefer a smaller, tighter generation over a flashier one that breaks the system
- After every generation, verify: (a) colors match hex values in Section 2; (b) typography uses Inter/JetBrains Mono only; (c) no `rounded-full` on cards; (d) no gradient backgrounds; (e) shadows match Section 6

### DesignSystem Upload

This DESIGN.md is also uploaded as a Stitch `DesignSystem` object (via `project.createDesignSystem({...})`) and applied to every new screen via `apply_design_system`. The uploaded theme object MUST mirror Section 2 (colors) and Section 3 (typography) exactly. Keep the upload script (`scripts/stitch/design-system.mjs`) in sync with this file when either changes.

### Approved Baselines (2026-04-19)

Alle Baselines liegen im Stitch-Projekt `17885144393549343699`.

**Converter (Light) — initiale Abnahme:**
- Screen-ID: `bfbed533ae504d6ebea69366a8048e08`
- Output: `stitch-output/2026-04-19T19-50-27-bfbed533ae504d6ebea69366a8048e08/`
- Akzeptiert: H1-Setzung, Zwei-Spalten-Card mit `=`-Separator, Kbd-Chips, Erklär-Abschnitt unten.
- Verworfen: englische Header-Nav ("Tools · Journal · Archive · Sign In"), Footer "Technical Editor", Login-Button. Fix → §4 Header-Regel.

**Converter (Dark) — Validierungs-Run nach Header-Fix:**
- Screen-ID: `3f7ab1d7d4a94162a63bcba2f2898341`
- Output: `stitch-output/2026-04-19T20-37-08-3f7ab1d7d4a94162a63bcba2f2898341/`
- Akzeptiert: Header-Struktur (Brand + Werkzeuge · Über · Sprache ▾ + Theme-Toggle), DE-Footer (Datenschutz · Impressum · Kontakt · Status), spontane "Häufige Werte"-Tabelle als SEO-Content-Muster.
- Beweist: Hard-Caps greifen in Stitch; Dark-Mode spiegelt Light sauber.

**FileTool (Light) — Hintergrund entfernen, Result-State:**
- Screen-ID: `97e004f183ed4b5f8b42bb47e82457e1`
- Output: `stitch-output/2026-04-19T20-46-42-97e004f183ed4b5f8b42bb47e82457e1/`
- Akzeptiert: Vorher/Nachher-Grid mit Schachbrett-Transparenz, Status-Badge "FERTIG", Meta-Zeile `1240×1760px · PNG · 340 KB`, Action-Row (Primary `Herunterladen` + zwei Ghost), rechts-seitige Bento-Sidebar "So funktioniert es" mit 01/02/03-Schritten, DSGVO-Banner.
- Stitch-Eigenleistung (begrüßt): Bento-Sidebar statt vertikaler Flow — Layout darf so bleiben.

---

**Generated from:** `src/styles/tokens.css` (v1.2, Session 2 locked) + `STYLE.md` (v1.2) + `CLAUDE.md §5 Hard-Caps`.
**Last regenerated:** 2026-04-19.
**Regenerate when:** tokens.css changes, STYLE.md §0–§11 changes, or CLAUDE.md §5 Hard-Caps change.
