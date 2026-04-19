# STYLE — Visual Design Rulebook

**Status:** v1 final (Session 2 locked) + v1.1 Skill-Integration (2026-04-19) + v1.2 Tool-Layouts (2026-04-19, Sessions 5–7).
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
- **NBSP (U+00A0) zwischen Zahl und Einheit** — Pflicht in deutschem Content und in jeder generierten Anzeige (`10\u00A0MB`, `5\u00A0Min`, `100\u00A0m`). Verhindert Wrap-Break zwischen Wert und Unit. In TS/JS-Strings als `\u00A0`, in MD-Content als `&nbsp;`.
- **`text-wrap: balance`** auf H1/H2 setzen — verhindert Waisen-Wörter in der letzten Zeile.
- **`tabular-nums`** auf Numeric-Outputs (Mono-Schrift schon vorgegeben, aber `font-variant-numeric: tabular-nums` zusätzlich für saubere Spalten).
- **`translate="no"`** auf Unit-Spans (z.B. „Fuß", „MB"), damit Browser-Auto-Translate die Einheit nicht verwürfelt.

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

## 9. Tool-Component Layouts (gelockt Sessions 5–7)

Beide Templates folgen denselben Form-Prinzipien: **eine Card pro Tool**, `1px`-Border in `var(--color-border)`, `var(--r-md)` Radien, `var(--space-6)`–`var(--space-8)` Innen-Padding. Hairline-Divider als `1px solid var(--color-border)`, niemals als gefärbter Trenner.

### 9.1 Converter (`Converter.svelte`, gelockt Session 6)

- **Two-Panel-Stack** vertikal: Input-Panel oben, Output-Panel unten, dazwischen Hairline-Divider.
- **Zentrierte Swap-Pill** sitzt auf dem Divider — `position: absolute`, kreisförmig (`var(--r-lg)`), `1px`-Border, mit inline-SVG-Swap-Icon das per CSS `rotate(180deg)` auf Hover dreht.
- **Output-Wert** in `font-size-h1`, Mono, `tabular-nums`. Unit-Span daneben in `font-size-body`, `var(--color-text-muted)`, `translate="no"`.
- **Quick-Value-Chips** liegen **außerhalb** der Card (vertikaler Abstand `var(--space-4)`), Pill-Shape (`var(--r-sm)`), Mono-Schrift, `1px`-Border, klickbar zum Direkt-Set des Input-Werts.
- **Copy-Button** rechts neben dem Output, `:active scale(0.98)`, `:focus-visible` mit 2px-Outline; `copy--copied`-State färbt für `var(--dur-med)` zu `var(--color-success)`.

### 9.2 FileTool (`FileTool.svelte`, gelockt Session 7, erweitert Session 9)

- **Single-Card-Morph** mit Phase-State-Machine `idle → preparing → converting → done | error`. Die Card wechselt ihren Innenraum, NICHT ihre Position oder Größe (verhindert CLS).
- **Idle:** Dropzone mit `2px dashed var(--color-border)`, `var(--space-12)` Padding, zentrierter Hint-Copy + Browse-Button. Drag-Over-State: Border solid, `--color-accent`. Meta-Zeile darunter zeigt MIME-Liste (lesbar formatiert) + Max-Size mit NBSP (`10\u00A0MB`). Clipboard-Hint („oder Strg+V") als dezente Zeile unter der Dropzone; Kamera-Capture-Button nur auf Mobile sichtbar (CSS-Media-Query).
- **Preparing (Session 9):** `<Loader variant="progress">` mit Status-Text „Lädt einmalig Modell …" (`aria-live="polite"`). Wird übersprungen wenn `isPrepared()` bereits `true` liefert (kein UI-Flash auf Revisit).
- **Converting:** dieselbe Card, ersetzt durch `<Loader variant="spinner">` + Status-Text (`aria-live="polite"`). Quality-Slider bleibt sichtbar und disabled (falls `showQuality`).
- **Done:** dieselbe Card, ersetzt durch **Mini-Preview (max 200×200) auf Transparenz-Checkerboard via CSS-`repeating-linear-gradient`** + Filename + Größen-Vergleich (`vorher → nachher`, beide mit NBSP-Einheit) + **Format-Chooser-Radio-Group** (PNG / WebP / JPG) mit Hint-Mono-Suffixen („verlustfrei" / „kleiner" / „kein Alpha") + Download-`<a>` (Primary-Button-Styling, `download="<name>.<ext>"`) + sekundärer Reset-Button. Format-Wechsel triggert `reencode()` ohne Re-Inference wenn verfügbar.
- **Error:** dieselbe Card, ersetzt durch Error-Message in `var(--color-error)`, plus Reset-Button.
- **Quality-Slider** (`<input type="range">`, `min=40 max=100 step=1`) mit Mono-Wert-Anzeige rechts (`tabular-nums`). Slider-Thumb hat eigene Hover-/Active-Transition; **alle Slider-Übergänge** unter `prefers-reduced-motion: reduce` deaktivieren. Slider ist nur sichtbar wenn `config.showQuality !== false`.
- **`data-testid`-Konvention:** `filetool-dropzone`, `filetool-input`, `filetool-meta`, `filetool-quality`, `filetool-status`, `filetool-result`, `filetool-error`, `filetool-download`, `filetool-reset`, `filetool-preview`, `filetool-format-chooser`, `filetool-camera`. (Konvention generalisiert auf alle 9 Tool-Templates.)
- **`formatBytes()`-Output** verwendet immer NBSP zwischen Zahl und Unit (`KB`, `MB`, `B`).

## 10. Page-Layout-Rhythmus (gelockt Session 6)

Tool-Detail-Seiten (`/[lang]/[slug]`) folgen einer dreistufigen Breiten-Hierarchie. Die Tool-Card ist visuell der Hauptanker, deshalb das schmalste Element.

| Block | `max-width` | Begründung |
|-------|-------------|------------|
| `.tool-hero` (H1 + Tagline) | `40rem` | Editorial Lesefluss, zentriert |
| `.tool-section` (Tool-Card) | `34rem` | Tool dominiert visuell — engste Spalte |
| `.ad-slot-placeholder` | `42rem` | CLS-safe `min-height` aus Token, `dashed 1px` Ghost bis Phase 2 |
| `.tool-article` (Intro + How + Prose) | `42rem` | Prose-optimale Lesebreite |

- Vertikaler Rhythmus: `var(--space-12)` zwischen Hero ↔ Tool, `var(--space-24)` zwischen Tool ↔ Ad-Slot ↔ Article (auf Mobile `var(--space-8)` / `var(--space-16)`).
- **How-To-Liste** verwendet `counter(how-step, decimal-leading-zero)` für editoriale `01 / 02 / 03`-Nummerierung in Mono, `var(--color-text-subtle)`. Kein `<ol>`-Default-Styling.
- Hero-H1 bekommt `text-wrap: balance` und `letter-spacing: -0.015em`; Tagline unter dem H1 ist `var(--color-text-muted)`, `var(--font-size-body)`.

## 11. Loader (`Loader.svelte`, gelockt Session 9)

Geteilte Komponente für jeden Lazy-Load- und Long-Running-Work-Status. Keine komponenten-eigenen Spinner.

- **`<Loader variant="spinner" />`** — indeterminiert.
  - 24×24, 1px-Hairline-Arc (`stroke: var(--color-text-subtle)`), `var(--dur-med)` × 3 Rotations-Cycle.
  - Rotation via `@keyframes spin { to { transform: rotate(360deg); } }`, `animation-duration: 0.9s`, linear.
- **`<Loader variant="progress" value={0..1} label="…" />`** — determiniert.
  - 1px-Hairline-Bar (Höhe `2px`), Hintergrund `var(--color-border)`, Füllung `var(--color-text-subtle)`, `width`-Transition `var(--dur-med) var(--ease-out)`.
  - Mono-Tabular-Label rechts (`font-family: var(--font-family-mono)`, `font-variant-numeric: tabular-nums`), NBSP zwischen Wert und Unit.
- **`prefers-reduced-motion: reduce`** deaktiviert Spin-Animation und Width-Transition (`animation: none; transition: none;`).
- **`data-testid="loader"`** als Default — bei mehreren Loadern pro Seite via Prop überschreibbar.
- **Kein eigener Spacing-Container** — Konsument (z.B. FileTool preparing-phase) bestimmt Padding/Gap.

## 12. Skill-Integration für Design-Arbeit

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
