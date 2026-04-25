# DESIGN.md — kittokit

> **Für Stitch (Google Labs) und jeden AI-Agent, der UI für dieses Projekt generiert.**
> Single source of truth ist `src/styles/tokens.css` + `STYLE.md` im Repo. Diese Datei destilliert beide in das offizielle Stitch-DESIGN.md-Format (9 Sektionen) plus Agent-Prompt-Guide.
> Bei Konflikt gilt `tokens.css` (enforced durch `tests/design-system/tokens.test.ts` + `contrast.test.ts`, WCAG AAA ≥7:1).
> Regeneriere diese Datei, wenn sich `tokens.css` oder `STYLE.md §0-§11` ändern.

### Konflikt-Heuristik: Spec vs. Shipped Code

Wann immer diese DESIGN.md mit shipped, getestetem Code kollidiert — **shipped gewinnt, DESIGN.md wird nachgezogen**. Der Code ist die Wahrheit, die Spec beschreibt ihn.

**Ausnahme:** Die Abweichung bricht einen Hard-Cap aus `CLAUDE.md §5` — dann ist der Code falsch und wird korrigiert. Hard-Caps sind:
- Tokens-Only (kein Hex, kein arbitrary-px)
- Palette (Graphit-Tokens aus `tokens.css` **+ 1 warmer Orange-Accent** + Olive-Success + Rust-Error; keine weiteren Farben, keine Pastell-Akzente, keine Colored Gradients — gelockert Runde 3 2026-04-20)
- Fonts (Inter + JetBrains Mono, self-hosted; keine Serif-Fonts — Emphasis via Inter-Italic + Accent-Color)
- Stack (Astro + Svelte 5 Runes + Tailwind)
- WCAG-AAA-Kontrast (≥7:1)
- Refined-Minimalism-Direction (keine Maximalismus-Varianten)

Alle anderen Kollisionen (Slot-Counts, Interaktions-Patterns, Layout-Details, Icon-vs-Text-Labels) werden durch Nachziehen der Spec gelöst, nicht durch Umschreiben des Codes.

---

## 1. Visual Theme & Atmosphere

**Refined editorial minimalism in graphite monochrome, warmed by a single orange accent.** Quiet sophistication through typography hierarchy, precise spacing rhythms, and hairline borders — color is a scarce resource, deployed only for emphasis and state.

The website hosts over a thousand conversion tools (unit converters, file converters, calculators, generators). Each tool page serves a single pragmatic job. The UI must recede so the tool becomes the focus: a calm blank-page canvas, a single dominant widget, and typographic metadata around it. No competing calls-to-action, no decorative flourishes. Accent color (warm burnt-orange) surfaces only on links, focus rings, `<em>` highlights in headings, and the small eyebrow-pulse dot — never as a button background, never as a card fill.

The atmosphere: a printed editorial page set in a quiet library — restrained, precise, warm-toned. Not clinical. Not corporate. Not playful. The user should feel respected and unhurried.

**Mood keywords:** calm, editorial, precise, warm-monochrome, paper-like, serious-but-not-cold, restrained, dignified.

**Anti-mood (what it is NOT):** tech-bro dashboard, SaaS template, Material, glassmorphic, retro, neo-brutalist, maximalist, playful, "elevating", "seamless".

---

## 2. Color Palette & Roles

All colors are locked in `src/styles/tokens.css`. Never approximate the hex values below.

### History

- **v1 (Session 2, 2026-04-18):** Graphite-only. Accent was Deep Graphite `#3A3733`. Success + Error as sole non-graphite hues (sparingly).
- **v2 (Runde 3, 2026-04-20):** Accent gelockert auf warmen Orange (`#8F3A0C` Light / `#F0A066` Dark, beide AAA ≥7:1). Motivation: das externe Redesign zeigte, dass ein einzelner Orange-Akzent die Refined-Minimalism-Identität stärkt (Emphasis, Link-State, Focus-Ring), ohne in SaaS-Bunt abzudriften. Graphite bleibt primär; Primary-Buttons bleiben graphit-dunkel. Success (Olive) + Error (Rust) bekommen breitere Use-License: auch für Pro/Con-Bullet-Lists in Content, nicht nur States.

### Light Mode (default)

| Role | Hex | Semantic Name | Functional Use |
|---|---|---|---|
| Background | `#FFFFFF` | True white | Page canvas — the reader's blank page |
| Surface | `#FAFAF9` | Warm off-white | Cards, panels, input fields (one step up from canvas) |
| Surface Sunk | `#F3F0EA` | Warm sunk | Badge-pills, code-inlines, mini-stat-chips (below canvas) |
| Border | `#E8E6E1` | Warm pale gray | 1px hairlines, dividers, card outlines — the only structural line |
| Text | `#1A1917` | Graphite off-black | Body text, headings, primary content (NEVER pure `#000000`) |
| Text Muted | `#5C5A55` | Mid warm gray | Subtitles, labels, secondary copy |
| Text Subtle | `#9C9A94` | Light warm gray | Timestamps, metadata, disabled captions |
| **Accent** | `#8F3A0C` | **Warm burnt-orange** | Links, focus rings, `<em>` highlights in headings, eyebrow pulse-dot, spinner top-arc, dropzone active-border |
| Accent Hover | `#6B2A08` | Deeper burnt-orange | Hover state for accent elements |
| Success | `#4A6B4E` | Muted olive | Success states, pro-bullet dots (`.compare .plus li::before`) |
| Error | `#8B3A3A` | Muted rust | Error states, con-bullet dots (`.compare .minus li::before`) |

### Dark Mode

| Role | Hex | Notes |
|---|---|---|
| Background | `#1A1917` | Inverted graphite canvas |
| Surface | `#252320` | Warm near-black |
| Surface Sunk | `#0F0E0D` | Darker than canvas — pill-bg |
| Border | `#3A3733` | Deep graphite hairline |
| Text | `#FAFAF9` | Warm near-white |
| Text Muted | `#A8A59E` | |
| Text Subtle | `#6C6A64` | |
| **Accent** | `#F0A066` | **Peach-orange** — AAA ≥8:1 on dark canvas |
| Accent Hover | `#F5B07C` | Lighter peach-orange |
| Success | `#7FA582` | Muted olive lightened |
| Error | `#C67373` | Muted rust lightened |

### Role Rules

- **One warm accent.** Orange only. No blue, purple, teal, cyan, pink, yellow, or any other saturated hue — those remain gesperrt.
- **Orange is NEVER a primary-button background.** Primary filled-buttons use `var(--color-text)` (dark graphite). Orange appears as text-color, focus-ring, border-highlight, or outlined-secondary-button — not as a filled CTA surface. This preserves Refined-Minimalism — Orange reads as emphasis, not as loud attention-grab.
- **Success and Error are the ONLY two additional hues.** Use for semantic state (form validation, operation result) **and** for pro/con-bullet dots in content comparisons (see §4 Compare-Table).
- **No pastels as backgrounds.** Pale blue, pale green, pale yellow, pale red from other design systems are forbidden. Pill-tints are achieved via `color-mix(in oklch, var(--color-accent|success|error) N%, var(--color-bg))` — never via hard-coded pastel hex.
- **No gradients of any kind.** Use solid fill plus a hairline border for separation.
- **No colored-header-blocks or hero-BGs.** Only the accent letter, bullet, or ring carries color.

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

- **Structure:** schmale Leiste, 64px Höhe, volle Bildschirmbreite, `background: var(--color-bg)` ohne Blur. Position `sticky`, `top: 0`.
- **Inner container:** max-width `72rem`, horizontal padding `1.5rem`, vertikal zentriert per Grid.
- **Slot-Gliederung (Desktop, in Lese-Reihenfolge links → rechts):**
  1. **Brand:** Wortmarke „Konverter" in Inter 600, 18px, `color: var(--color-text)`. Klickbar → `/[lang]/`.
  2. **Nav-Links:** drei Text-Links in Inter 500, 14px, `color: var(--color-text-muted)`, gap 24px. Sprachabhängig:
     - DE: `Werkzeuge` · `Über` · `Sprache ▾`
     - EN: `Tools` · `About` · `Language ▾`
  3. **Search:** Pagefind-Eingabe (siehe `HeaderSearch.svelte`), 1px Hairline, `var(--r-md)`. Ist seit Session 10 integrales Feature; vor DESIGN-Aufriss übersehen, hier explizit verankert. Flex-breitet sich auf den freien Raum aus; min-width `0` damit Grid-Children nicht sprengen.
  4. **ThemeToggle:** rechts außen als **Segmented Control mit drei Slots** (`Auto` · `Hell` · `Dunkel`). Die ursprüngliche „32×32 Icon-Swap Sonne ↔ Mond"-Formulierung war ein Stitch-Vorschlag ohne Auto-Modus; der shipped Code bietet Auto + Hell + Dunkel als drei explizite First-Class-Slots. Konkrete Werte aus `src/components/ThemeToggle.svelte` (Single Source of Truth):
     - **Container:** `display: inline-flex`, `gap: var(--space-1)` (4px), `padding: var(--space-1)` (4px), `border: 1px solid var(--color-border)`, `border-radius: var(--r-md)` (8px), `background: var(--color-surface)`. Höhe nicht hart fixiert — ergibt sich aus Container-Padding + Slot-Padding + Font-Line-Height der Labels.
     - **Slot (inaktiv):** `padding: var(--space-1) var(--space-3)` (4px × 12px), `background: transparent`, `color: var(--color-text-muted)`, `border: 0`, `border-radius: var(--r-sm)` (4px), `font-size: var(--font-size-small)` (0.875rem / 14px), Font-Family `Inter` via `font: inherit`, Weight default (400).
     - **Slot (aktiv, `aria-pressed="true"`):** `background: var(--color-bg)` (kippt auf Canvas, nicht Surface — das ist der optische Trick, der den aktiven Slot aus dem Surface-Container heraushebt), `color: var(--color-text)`, `box-shadow: var(--shadow-sm)`.
     - **Slot (hover):** `color: var(--color-text)`.
     - **Labels:** Text-Only (deutsche Beschriftung auf allen Routen: „Auto" / „Hell" / „Dunkel"). Keine Icons, kein Sun/Moon-Swap.
     - **Fokus:** `outline: 2px solid var(--color-accent)`, `outline-offset: 2px` auf dem aktiven Slot.
- **Slot-Anzahl:** 5 Slots (Brand · Nav · Search · Toggle; Nav zählt als ein Slot, nicht drei). Es gibt keinen weiteren CTA, kein Account-Element, keine Benachrichtigung.
- **Mobile (≤40rem):** Grid bricht auf zwei Zeilen um. Zeile 1: Brand + ThemeToggle (Nav kollabiert). Zeile 2: Search über volle Breite. Nav wird in Phase 1 als Drawer/Menu getrennt behandelt (aktuell: Nav auf Mobile ausgeblendet, Funktionalität via Footer + Search erreichbar).
- **Divider:** 1px `var(--color-border)` unter dem Header, volle Breite.
- **NIEMALS erlaubt:**
  - Login-/Sign-In-/Sign-Up-Buttons oder -Links
  - Account-Avatare, User-Menüs, Benachrichtigungs-Glocken
  - CTA-Farbflächen im Header (kein gefüllter Button oben rechts)
  - Englische Nav-Labels auf DE-Routen (z.B. „Tools · Journal · Archive")

### Card (The Primary Container)

- **Background:** Surface (`#FAFAF9` light / `#252320` dark)
- **Border:** `1px solid` Border (`#E8E6E1` light / `#3A3733` dark)
- **Radius:** `8px` (medium) — never `rounded-full`, never sharp corners, never `4px` for cards
- **Padding:** `24px` on mobile, `32px` on desktop
- **Shadow rest:** `0 1px 2px rgba(26, 25, 23, 0.05)` — graphite-tinted, ultra-diffuse
- **Shadow hover (interactive cards only):** `0 4px 8px rgba(26, 25, 23, 0.08)`

#### Variant: Tool-Listing (Homepage `tool-card`)

Vertikaler Stack. Verwendet für Auto-Index-Grids auf der Homepage und künftig Kategorie-Seiten.

- **Layout:** `display: flex; flex-direction: column; gap: var(--space-2)`. Tighter 8px-Paar-Bindung zwischen Titel und Tagline — ohne Icon-Slot bilden die zwei Text-Items ein redaktionelles Unit.
- **Padding:** `var(--space-6)` (24px) Desktop, `var(--space-5)` (20px) unter 40rem.
- **Höhe:** `height: 100%` auf dem inneren `<a>`, damit Grid-Geschwister in derselben Row gleiche Höhe haben.
- **Inhalt (in Reihenfolge):** H3 Titel → `.tagline` (Small, `--color-text-muted`). **Tool-Identity-Icons: keine — der Name ist das Label.**
- **Hover:** Border-Farbe kippt auf `--color-text-subtle`, Background auf `--color-bg`, Shadow auf Hover-Level.
- **Focus-visible:** `outline: 2px solid var(--color-accent)`, `outline-offset: 2px`.
- **Kein Arrow, kein Chevron, kein Status-Dot, keine Kategorie-Badge, kein Identity-Icon.** Die Karte ist die Affordanz — der Titel ist der CTA.

#### Variant: Related-Bar (Tool-Detail-Page — Zwilling der Header-`popular-bar`)

Runde 3 Session (2026-04-20): Die alte Compact-Card-Grid-Variante (H3 + Tagline-Karten) wurde verworfen. `RelatedTools` rendert jetzt als horizontale Tab-Leiste direkt unter dem Tool-Bereich — visuell und strukturell dasselbe Muster wie die Header-`popular-bar`. Ziel: nach dem Konvertieren sieht der Nutzer die nächste Option auf einen Blick, ohne dass ein zweites Karten-Raster das Tool „erschlägt".

- **Position:** direkt unter `.tool-main`, VOR dem Ad-Slot und vor der `.tool-article`. Die Platzierung ist inhaltliches Design — Nähe zum Tool ist die Affordanz.
- **Container:** `<nav class="related-bar">` mit `max-width: 60rem`, `border-top` + `border-bottom` (`1px solid var(--color-border)`), keine Hintergrund-Fläche, keine Radii. Kein Karten-Look.
- **Inner-Layout:** `display: flex; align-items: stretch; overflow-x: auto; gap: var(--space-4); padding: 0 var(--space-2);`. Scrollbar visuell versteckt (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`).
- **Label (`.related-bar__label`):** Sprachbasiert (`de: 'Verwandt'`, `en: 'Related'`). Mono (`--font-family-mono`), `0.6875rem`, `font-weight: 500`, `letter-spacing: 0.12em`, `text-transform: uppercase`, `color: var(--color-text-subtle)`, `border-right: 1px solid var(--color-border)`, `padding-right: var(--space-4)`.
- **Tab-Label (`.related-tab__label`):** Zeigt `t.shortTitle` (nicht `t.title`). `computeShortTitle()` in `src/lib/tools/list.ts` schneidet den SEO-Suffix nach „ – " / „ — " / „ - " ab, sodass Tabs nicht mit USP-Claims wie „– ohne Upload" oder „— direkt im Browser" überladen werden. Gilt ebenso für You-Might-Strip.
- **Tab (`.related-tab`):** `display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-3);`, `font-size: var(--font-size-small)`, `color: var(--color-text-muted)`, `border-bottom: 2px solid transparent`.
- **Dot (`.related-tab__dot`):** `5×5` Pixel, `border-radius: 9999px`, Grundfarbe `--color-text-subtle`. Hover → `--color-accent`. Dot + Border-Bottom sind die einzigen Orange-Touches.
- **Hover:** Tab-Text → `--color-text`, `border-bottom-color: var(--color-accent)`, Dot → Accent.
- **Focus-visible:** `outline: 2px solid var(--color-accent)`, `outline-offset: -2px`, `border-radius: var(--r-sm)`.
- **Keine Motion:** keine staggered fade-in, keine IntersectionObserver-Abhängigkeit. Die Leiste ist statisch und sofort sichtbar — wie die Header-`popular-bar`.
- **Mobile (< 40rem):** Label wird versteckt (`display: none`). Tabs bleiben horizontal-scrollbar.

#### Variant: You-Might-Strip (Tool-Detail-Page — direkt über dem Footer)

Serendipity-Strip direkt über dem Footer. Mono-Label + einfache zentrierte Liste von Tool-Titeln mit dünnen `·`-Separatoren. Ziel: am Seitenende eine „schau-dich-um"-Einladung ohne neue Karten-Fläche.

- **Position:** Letzter Block innerhalb `.tool-page`, direkt vor dem Footer. Kommt nach `.tool-article`, schließt die Seite ab.
- **Container:** `<section class="you-might">` mit `max-width: 60rem`, `border-top: 1px solid var(--color-border)` (einzige Trennung zur vorherigen Prose-Sektion), `text-align: center`.
- **Padding:** `var(--space-8) var(--space-6)` (32px × 24px), Mobile `var(--space-6) var(--space-4)`. Tight, weil `.tool-article` ihr eigenes kleines Bottom-Padding mitbringt.
- **Label:** Block-Element oben, sprachbasiert (`de: 'Das könnte dir auch gefallen'`, `en: 'You might also like'`). Mono, `0.6875rem`, uppercase, Letter-Spacing `0.12em`, `color: var(--color-text-subtle)`, `margin-bottom: var(--space-4)`.
- **Liste:** `display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 0 var(--space-4); row-gap: var(--space-2);`. Editorial-Separator per `li:not(:last-child)::after { content: '·'; color: var(--color-text-subtle); }` — keine Punkte im Markup, nur CSS.
- **Link (`.you-might__link`):** zeigt `t.shortTitle` (nicht `t.title` — gleiche Regel wie Related-Bar). Keine Tagline, keine Icons, keine Karten. `font-size: 0.9375rem`, `color: var(--color-text-muted)`, `text-decoration: none`. Hover → `--color-text`. Focus → Accent-Outline.
- **Auswahl:** seeded shuffle basierend auf `currentToolId` (xfnv1a + mulberry32 inline in der Komponente). Stabil pro Tool, unterschiedlich pro Tool. Limit default `6`. Aktuelles Tool und Slugs aus `relatedTools` (Content-Frontmatter) werden ausgeschlossen, damit sich die Strip nicht mit der Related-Bar doppelt.
- **Keine Motion.**

#### Variant: Aside-Slot (Tool-Detail-Page optional Sidebar)

Wird ausschließlich auf Tool-Detail-Pages gerendert, wenn die Content-Frontmatter einen `aside`-Block enthält. Siehe §5 „Aside-Slot-Primitive" für Container-Regeln.

- **Layout:** `display: flex; flex-direction: column; gap: var(--space-8)` — zwei Sub-Sections (Steps, Privacy) mit großzügiger vertikaler Trennung.
- **Padding:** `var(--space-6)` (24px) — analog Tool-Listing-Variant.
- **Border / Radius / Background / Shadow:** identisch zu Base-Card (`1px solid var(--color-border)`, `var(--r-md)`, `var(--color-surface)`, `var(--shadow-sm)`). Keine Hover-Elevation — Aside ist nicht interaktiv.
- **Steps-Sub-Section (`.tool-aside__steps`):** `<h3>` (small-caps mono-number vorne: „01" / „02" / „03"), darunter Step-Titel als fette `0.875rem` und Description als `--color-text-muted` Small-Text. Maximal drei Steps, gelockt durch Zod-Schema.
- **Privacy-Sub-Section (`.tool-aside__privacy`):** `<h3>` mit JetBrains-Mono-Eyebrow (`0.6875rem`, uppercase, `letter-spacing: 0.1em`, `--color-text-subtle`) als „DATENSCHUTZ", darunter Paragraph in `--color-text-muted` bei `line-height: 1.55`. Border-Top `1px solid var(--color-border)` trennt sie von Steps.
- **Icon:** Keine. Der Steps-Block erzählt die Story durch Zahlen + Typografie allein.

#### Variant: Kbd-Hint-Row (Tool-Detail-Page unterhalb Tool-Card)

Passive Shortcut-Hinweise — keine Buttons, keine Actions. Liegen unter der `.tool-section` auf FileTool-Pages und bleiben unberührt von State-Änderungen im Tool. Unterscheidet sich bewusst vom interaktiven `.kbd-chip` im Converter (der ist ein Button).

- **Layout:** `display: flex; flex-wrap: wrap; gap: var(--space-2)`; zentriert unter `.tool-section` bei schmalem Viewport, linksbündig ab Desktop.
- **Chip (`<kbd>`):** Border `1px solid var(--color-border)`, Radius `4px` (kbd-Ausnahme, §4 „Keyboard Shortcut Chip"), Background `var(--color-surface)`, Padding `var(--space-1) var(--space-2)`, Font JetBrains Mono `0.75rem`, Text `var(--color-text-muted)`.
- **Key + Label:** Zwei `<span>` nebeneinander, `gap: var(--space-1)`. Key (`⌘V`, `Drag & Drop`, `⌘C`) trägt `font-weight: 500` und `color: var(--color-text)`. Label (`Einfügen`, `Ziehen`, `Kopieren`) bleibt in Muted.
- **Kein Hover, kein Focus, kein tabindex.** Es sind Text-Affordanzen, keine interaktiven Elemente.

### Primary CTA / Button

- **Background:** `var(--color-text)` — dark graphite in Light (`#1A1917`), near-white in Dark (`#FAFAF9`). **Never Orange.** Primary buttons are graphit-dunkel, damit Orange als Emphasis-Akzent reserviert bleibt.
- **Text color:** `var(--color-bg)` — white in Light, dark graphite in Dark (automatische Inversion).
- **Padding:** `var(--space-3) var(--space-5)` (12px × 20px)
- **Radius:** `var(--r-md)` (8px)
- **Font weight:** 500
- **Active state:** `transform: scale(0.98)` über `var(--dur-fast)` mit `var(--ease-out)`
- **Focus-visible:** `outline: 2px solid var(--color-accent)` (Orange), `outline-offset: 2px` — Orange tritt nur im Fokus-Ring auf, nicht in der Flächen-Füllung.
- **One primary CTA per page.** Der dunkle Button IST der Fokus-Punkt — keine konkurrierenden Accent-Buttons.

### Secondary / Ghost Button

- Background: transparent
- Text: `var(--color-text)` oder `var(--color-accent)` (Orange). Orange nur auf Neben-Actions mit eindeutig emphatischem Zweck (z.B. „Mehr erfahren" unter einem Privacy-Callout). Default ist Graphit-Text.
- Border: `1px solid var(--color-border)`
- Hover: Background wechselt auf `var(--color-surface)`; wenn Orange-Text, kippt er auf `var(--color-accent-hover)`.

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

- **Spinner:** `24×24`, `1px` hairline arc, stroke `var(--color-accent)` (Orange — einziger Ort, an dem Orange als bewegtes Element auftritt), 900ms Rotation, linear. Unter `prefers-reduced-motion`: langsamere Rotation (`2.4s`), NICHT eingefroren.
- **Progress Bar:** `2px` Höhe, Background `var(--color-border)`, Fill `var(--color-accent)`, width-transitions `var(--dur-med) var(--ease-out)`. Label in JetBrains Mono tabular-nums rechts.

### Eyebrow Pill (Above Heading)

Kleine Status-Kapsel direkt über H1 in Hero-Blöcken und Section-Heads. Signalisiert Kontext („KONVERTER", „BILD-TOOL", „VIDEO-TOOL") ohne visuelles Lärm.

- **Shape:** pill (`border-radius: 9999px`) — Ausnahme zur No-rounded-full-Regel, analog Tag/Badge.
- **Layout:** `display: inline-flex; align-items: center; gap: var(--space-2)`.
- **Background:** `var(--color-surface-sunk)` — Warmer Sunk-Ton, einen Schritt UNTER Canvas, damit das Pill ruhig in der Hero-Fläche sitzt.
- **Border:** `1px solid var(--color-border)`.
- **Padding:** `var(--space-1) var(--space-3)` (4px × 12px).
- **Typography:** JetBrains Mono, `0.6875rem` (11px), `uppercase`, `letter-spacing: 0.08em`, `color: var(--color-text-muted)`, `font-weight: 500`.
- **Pulse-Dot (optional):** kleiner Kreis `6×6px`, `border-radius: 9999px`, `background: var(--color-accent)` (Orange), pulsiert via `@keyframes` 2s-Loop (`opacity: 1 → 0.4 → 1`). Unter `prefers-reduced-motion` statisch auf `opacity: 1`. Der Pulse-Dot ist die EINE Stelle, an der Orange in einem Hero ruhig rhythmisch atmet — signalisiert „das Tool ist live, arbeitet clientseitig".

### Italic Accent in Headings

Emphasis innerhalb H1/H2 wird als `<em>` in Inter-Italic + Orange gerendert, nicht als neue Serif-Font. Das ist unser „editorial Seriven-Substitut".

- **Markup:** `<h1>100 Meter in <em>Fuß</em> umrechnen</h1>`.
- **CSS:** `h1 em, h2 em { font-style: italic; color: var(--color-accent); font-weight: inherit; }`.
- **Semantik:** `<em>` markiert das konzeptionelle Kern-Wort (Einheit, Tool-Zweck, Nutzen). Maximal **1** `<em>` pro Heading, sonst verliert der Akzent seine Ruhe.
- **Mobile:** kein Scale-Down — das `<em>` erbt H1/H2-Größe.
- **Dark Mode:** Orange-Tint kippt auf Peach (`#F0A066`), automatisch via `var(--color-accent)`.

### Section Head (2-Column Editorial)

Für Below-the-fold-Sektionen auf Tool-Detail-Pages und Homepage-Variant: Kleiner Mono-Label links, großer Titel rechts. Editorial-Rhythmus, der Abschnitte wie Kapitel in einer Zeitschrift gliedert.

- **Grid Desktop (≥48rem):** `display: grid; grid-template-columns: 10rem 1fr; gap: var(--space-8);`.
- **Grid Mobile (<48rem):** `display: flex; flex-direction: column; gap: var(--space-2);` — Label stapelt über Titel.
- **Label (links):** JetBrains Mono, `0.75rem`, `uppercase`, `letter-spacing: 0.1em`, `color: var(--color-text-subtle)`, `padding-top: var(--space-2)` (optisch zur Grundlinie des Titels justiert). Kann Zähler sein: `01 — ANWENDUNGSFÄLLE` (Mono-Number + em-Dash + Wort).
- **Titel (rechts):** H2-Scale (`1.75rem`, weight 600, `text-wrap: balance`). Darf ein `<em>` Orange-Italic enthalten.
- **Abstand zu Section-Body:** `margin-top: var(--space-6)` zwischen Head und erstem Content-Block.

### Compare Table (Pro/Con List in Content)

**Reine CSS-Klassen, kein eigenständiger Component.** MDX-Autoren nutzen `.compare`, `.compare .plus`, `.compare .minus` inline in Tool-Content-Bodies. Existiert als SEO-Struktur, nicht als Widget.

- **Container:** `<div class="compare">` — `display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);`. Mobile stapelt auf `1fr` via `@media (max-width: 40rem)`.
- **Spalten:** `<div class="plus">` (Vorteile) + `<div class="minus">` (Nachteile). Beide haben `<h3>` mit Mono-Eyebrow + Titel-Text, darunter `<ul>` mit 3–5 `<li>`.
- **Bullet-Color:** custom `::before` mit `content: "+"` (plus) oder `content: "−"` (minus, U+2212), `color: var(--color-success)` bzw. `var(--color-error)`, `font-family: 'JetBrains Mono'`, `font-weight: 600`, `margin-right: var(--space-2)`. Bullets sind die EINE erlaubte Stelle, an der Success/Error als Content-Signal (nicht State) erscheinen dürfen.
- **Kein Border um die Spalten.** Reiner Text-Block, gegliedert nur durch Typografie + Farbe der Bullets.
- **Mobile:** Plus-Block zuerst, Minus-Block darunter (gleicher Flow, keine Reorder-Acrobatik).

### Usecases Grid (Numbered Cards)

Editorial 3-Spalten-Liste für „So nutzt du das Tool"-Abschnitte. Nummerierte Cards mit Titel + Description.

- **Container:** `<ol class="usecases">` — `display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);`. Tablet (≤48rem): 2 Spalten. Mobile: 1 Spalte.
- **Item:** `<li>` mit `padding: var(--space-5)`, `border: 1px solid var(--color-border)`, `border-radius: var(--r-md)`, `background: var(--color-surface)`.
- **Counter:** `counter-reset: usecase;` auf `<ol>`, `counter-increment: usecase;` auf `<li>`. `<li>::before { content: counter(usecase, decimal-leading-zero); }` in JetBrains Mono, `0.75rem`, uppercase, `color: var(--color-text-subtle)`, `letter-spacing: 0.1em`, `display: block; margin-bottom: var(--space-2);`.
- **Titel:** H3-Scale oder body-medium 500-weight, `color: var(--color-text)`.
- **Description:** Small-scale, `color: var(--color-text-muted)`, `line-height: 1.55`.
- **Hover:** kein Hover — Cards sind nicht interaktiv (reiner Content).

### Limits Rows (Technische Grenzen / Specs)

Editorial-Tabelle light — key-value-Zeilen, die technische Grenzen kommunizieren („Max. Dateigröße: 50 MB", „Unterstützte Formate: …"). Kein `<table>`-Element; strukturierter `<dl>` oder Flex-Rows.

- **Container:** `<dl class="limits">` — `display: flex; flex-direction: column; gap: 0;`.
- **Row:** `<div class="limits__row">` — `display: grid; grid-template-columns: auto 1fr; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border);`. Letzte Row ohne border.
- **Num / Marker (optional, links):** JetBrains Mono, `0.75rem`, `color: var(--color-accent)` (Orange). Wenn semantisch sinnvoll: `01`, `02`, `03`. Kann auch ein Zeichen sein (`→`, `·`).
- **Key (`<dt>`):** weight 500, `color: var(--color-text)`.
- **Value (`<dd>`):** `color: var(--color-text-muted)`, right-aligned auf Desktop, left-aligned Mobile (flex-direction wechselt auf column unter 40rem).
- **Mono-Werte:** Dateigrößen, Dauern, Pixel-Werte tragen `.mono { font-family: var(--font-family-mono); font-variant-numeric: tabular-nums; }`.

### Privacy Callout (Client-Only-Trust-Signal)

Mini-Block zur Kommunikation „läuft im Browser, kein Upload". Entscheidend für File-Tools (Hintergrund-Entferner, HEIC-Decoder), sekundär für Converters.

- **Container:** `<aside class="privacy-callout">` — `display: grid; grid-template-columns: auto 1fr; gap: var(--space-4); padding: var(--space-4) var(--space-5); border: 1px solid var(--color-border); border-radius: var(--r-md); background: var(--color-surface);`.
- **Icon-Slot (links):** `24×24`, aktuell keine dedizierten Icons — nutze stattdessen ein graphit-Monogramm-Glyph in JetBrains Mono `1.25rem` (`§`, `•`, oder `→`). Kein externes Icon-Set.
- **Text-Slot (rechts):** Kurze Zeile Small-Scale, `color: var(--color-text-muted)`. Beispiel: „Läuft vollständig in deinem Browser · keine Datei wird hochgeladen · kein Tracking." Unit-Labels in `<span translate="no">` wrappen, wenn Fachwörter auftauchen.
- **Kein Dismiss-X, kein CTA darin** — reiner Trust-Signal-Block.

---

## 5. Layout Principles

### Page Rhythm (Tool Detail Pages — `/[lang]/[slug]`)

Feste Render-Reihenfolge im Template (Runde 3 Session 2026-04-20 gelockt):

1. `.tool-hero` — H1 + Eyebrow + Tagline
2. `.tool-main` — Tool-Widget (+ optional `.tool-aside`)
3. `.related-bar` — **direkt unter dem Tool** (Verwandt-Tabs, Zwilling der Header-popular-bar)
4. `.ad-slot-placeholder` — AdSense-Platz
5. `.tool-article` — Intro, How-To, FAQ, MDX-Prose
6. `.you-might` — **direkt über dem Footer** (Serendipity-Strip mit random Tools)

| Block | max-width | Notes |
|---|---|---|
| `.tool-hero` (H1 + tagline) | `40rem` | Editorial reading flow, centered |
| `.tool-main` (tool + optional aside) | `60rem` | Container-primitive; aside-slot opt-in. Siehe „Aside-Slot-Primitive" unten. |
| `.tool-section` (the tool widget) | `34rem` (Converter) / `48rem` (FileTool) | Tool ist der visuelle Anker, zentriert innerhalb `.tool-main` |
| `.tool-aside` (optionaler Slot) | `20rem` | Nur gerendert, wenn Content-Frontmatter `aside` füllt. |
| `.related-bar` (Verwandt-Tabs) | `60rem` | Horizontale Tab-Leiste, direkt unter `.tool-main`. Siehe §4 „Variant: Related-Bar". |
| `.ad-slot-placeholder` | `42rem` | CLS-reservierter Platz, Phase 2 befüllt. |
| `.tool-article` (intro, how-to, FAQ) | `42rem` | Prose-optimal reading width |
| `.you-might` (Serendipity-Strip) | `60rem` | Zentrierte Link-Liste mit `·`-Separatoren, direkt vor dem Footer. Siehe §4 „Variant: You-Might-Strip". |

### Aside-Slot-Primitive (`.tool-main`)

**Regel:** Tool-Detail-Pages bekommen einen additiven Aside-Slot. Ob er sichtbar wird, entscheidet ausschließlich die Content-Frontmatter (`aside` Block), nicht der Tool-Typ (`converter` / `file-tool` / etc.). Jede künftige Tool-Seite entscheidet inhaltlich „habe ich Aside-Content?" statt identitär „welche Klasse bin ich?".

- **Container:** `.tool-main { max-width: 60rem; margin: 0 auto; }` ersetzt die direkt zentrierte `.tool-section`. Solange kein Aside da ist, rendert die `.tool-section` weiter mit `max-width: 34rem` und bleibt innerhalb der 60rem zentriert — visuell identisch zum vorherigen Zustand.
- **Grid:** Sobald `.tool-aside` existiert UND Viewport `≥ 60rem` (960px), aktiviert `.tool-main` `display: grid; grid-template-columns: minmax(0, 34rem) minmax(0, 20rem); gap: var(--space-6);`. Unterhalb von `60rem` stackt der Aside unter der `.tool-section` (wieder Flow).
- **Kein Klassen-Branching:** Weder in DESIGN.md noch im Code gibt es „Converter-Class" vs. „FileTool-Class". Der Slot ist Layout-Primitive, nicht Identität.
- **Leerer Slot = Regression-frei:** Meter-zu-Fuß und die fünf Phase-1-Batch-1-Converter haben kein `aside`-Frontmatter und bleiben visuell 1:1. Verifiziere per Browser bei jeder Schema-Änderung.

### Vertical Rhythm

Runde 3 Session (2026-04-20) — Abstände sind knapper geworden, damit Related-Bar direkt am Tool klebt und You-Might-Strip nicht abhängt:

- Between hero and tool: `3rem` (48px) desktop, `2rem` mobile
- **Between tool and Related-Bar: `1rem` (16px)** — Related-Bar ist Teil des Tool-Kontextes, darf nicht separat wirken.
- Between Related-Bar and Ad-Slot / Article: `4rem` (64px) desktop
- Between article end and You-Might-Strip: `2rem` (32px) desktop, `1rem` mobile — die Border-Top übernimmt die visuelle Trennung.
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
- Don't use blue, purple, teal, cyan, pink, yellow, red, green as accents — we have exactly ONE warm-orange accent (`var(--color-accent)`) plus Olive-Success + Rust-Error for pro/con-bullets and state
- Don't use a bright/saturated orange — our orange is burnt, earthy (`#8F3A0C`), not a candy-hue. Never approximate with `#FF5722`, `#F97316`, or Tailwind `orange-500`
- Don't use orange as a filled primary-button background — orange is for links, focus-rings, `<em>`-highlights, eyebrow-pulse-dots, spinner arcs, dropzone active-borders. Primary buttons are `var(--color-text)` (dark graphite)
- Don't use pastel backgrounds (pale blue, pale green, pale yellow, pale red). For soft tints, use `color-mix(in oklch, var(--color-accent|success|error) 8%, var(--color-bg))`
- Don't use gradient backgrounds (`bg-gradient-*`, gradient-mesh, radial blobs)
- Don't use Tailwind default shadows (`shadow-md`, `shadow-lg`) — blue cast
- Don't use pure black `#000000` for body text — use `var(--color-text)` (`#1A1917`)

**Shapes & Surfaces:**
- Don't use `rounded-full` on cards, buttons, inputs, images, or any large container (tags/badges are the single exception)
- Don't use tilted, rotated, or diagonal layouts
- Don't use noise textures, grain overlays, dot patterns, decorative borders
- Don't use 3D glassmorphism, beveled edges, inset shadows
- Don't use multiple competing CTA buttons on one page

**Icons & Imagery:**
- Don't use Phosphor Icons, Lucide, Feather, Heroicons, Material Icons — functional system icons stay as locked SVGs or glyphs (Search-Lupe, Theme-Toggle, Kbd-Chips, Spinner, FERTIG-Badge, Favicon/PWA, FileTool-funktional); Tool-Identity-Icons auf Karten sind abgeschafft (siehe nächster Punkt).
- Don't use Per-Tool-Identity-Icons auf Karten (Tool-Listing + Compact). Ab Runde 3 Session „No Tool Icons" (2026-04-20) tragen Tool-Karten ausschließlich Titel + Tagline. Begründung: Produktions-Aufwand bei 1000+ Tools, redaktionelle Ruhe wird durch Icon-Wiederholung gestört. Das betrifft nur die 48×48-Slots auf Karten — der 160×160-Hero-Icon auf `[slug].astro` bleibt, sofern `public/icons/tools/<toolId>.webp` existiert (Recraft → BG-Removal → WebP-Pipeline).
- Don't use oversaturated stock photography
- Don't use emoji characters in markup, text, alt text, or aria-labels
- Don't invent new icons ad-hoc — we have a locked pipeline (Recraft → BG-removal → WebP) für Hero-Icons; funktionale UI-Glyphs sind fest inline.

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
- **Converter widget:** horizontales Zwei-Spalten-Grid mit zentralem `=`-Separator auf ≥`48rem`; vertikal gestapelt unter `48rem`. Breakpoint-basiertes Stacking löst keinen CLS aus (Media-Queries werten vor Content-Paint aus). Die zwei Panels (Input links, Output rechts) teilen eine Grundlinie, das `=` sitzt als 1px-Hairline-Chip zwischen ihnen. Kopier/Tauschen erscheinen als Kbd-Chip-Row unter der Card
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

> "Generate this in accordance with DESIGN.md. Use Tailwind utility classes for layout. All colors must resolve to the exact hex values in Section 2 — graphite tokens plus one warm burnt-orange accent (`#8F3A0C` light / `#F0A066` dark). All typography must use Inter (sans) and JetBrains Mono (mono) per Section 3. Follow every Don't in Section 7 without exception. This is a refined editorial minimalism aesthetic in graphite monochrome, warmed by a single orange accent — not SaaS, not Material, not maximalist. Orange appears only on links, focus-rings, `<em>`-highlights inside headings, eyebrow-pulse-dots, spinner arcs, dropzone active borders. Primary buttons stay dark graphite (`var(--color-text)`)."

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

**Retro-Note (Runde 3, 2026-04-20 — Palette-Loosening):** Die vier Baselines unten wurden gegen die v1-Palette (Graphit-only Accent `#3A3733`) generiert. Mit der Palette-Lockerung zu warm-burnt-orange (`#8F3A0C` Light / `#F0A066` Dark) driften die Accent-getragenen Elemente der Baselines farblich — konkret: Link-Color, Focus-Ring, Spinner-Stroke, Dropzone-Active-Border, Eyebrow-Pulse-Dot. Das ist **kein Baseline-Invalid**; die Layout-, Typografie-, und Slot-Entscheidungen bleiben gültig. Nur die Accent-Farbe ist jetzt Orange statt Graphit. Vor Re-Generation einer Baseline: prüfen, ob die Layout-Entscheidung noch trägt — wenn ja, kein Stitch-Re-Run nötig, nur die implementierte Farbe rippled automatisch via `var(--color-accent)`.

**Converter (Light) — initiale Abnahme:**
- Screen-ID: `bfbed533ae504d6ebea69366a8048e08`
- Output: `stitch-output/2026-04-19T19-50-27-bfbed533ae504d6ebea69366a8048e08/`
- Akzeptiert: H1-Setzung, Zwei-Spalten-Card mit `=`-Separator, Kbd-Chips, Erklär-Abschnitt unten.
- Verworfen: englische Header-Nav ("Tools · Journal · Archive · Sign In"), Footer "Technical Editor", Login-Button. Fix → §4 Header-Regel.
- Fußnote: Baseline-Screenshot zeigt den Desktop-Zustand (≥`48rem`). Mobile-Variante = vertikaler Stack, siehe §8.

**Converter (Dark) — Validierungs-Run nach Header-Fix:**
- Screen-ID: `3f7ab1d7d4a94162a63bcba2f2898341`
- Output: `stitch-output/2026-04-19T20-37-08-3f7ab1d7d4a94162a63bcba2f2898341/`
- Akzeptiert: Header-Struktur (Brand + Werkzeuge · Über · Sprache ▾ + Theme-Toggle), DE-Footer (Datenschutz · Impressum · Kontakt · Status), spontane "Häufige Werte"-Tabelle als SEO-Content-Muster.
- Beweist: Hard-Caps greifen in Stitch; Dark-Mode spiegelt Light sauber.
- Fußnote: Der Baseline-Screen zeigt einen Stitch-Default-Mond-Toggle (Single-Icon). Die reale Implementation ist das 3-Slot-Segment `Auto · Hell · Dunkel` gemäß §4 — nicht aus dem Screenshot ableiten.

**FileTool (Light) — Hintergrund entfernen, Result-State:**
- Screen-ID: `97e004f183ed4b5f8b42bb47e82457e1`
- Output: `stitch-output/2026-04-19T20-46-42-97e004f183ed4b5f8b42bb47e82457e1/`
- Akzeptiert: Vorher/Nachher-Grid mit Schachbrett-Transparenz, Status-Badge "FERTIG", Meta-Zeile `1240×1760px · PNG · 340 KB`, Action-Row (Primary `Herunterladen` + zwei Ghost), rechts-seitige Bento-Sidebar "So funktioniert es" mit 01/02/03-Schritten, DSGVO-Banner.
- Stitch-Eigenleistung (begrüßt): Bento-Sidebar statt vertikaler Flow — Layout darf so bleiben.

**Homepage (Light) — Tool-Listing, /de/ Default-State:**
- Screen-ID: `5e95108ca38e4d0f89bd0cea7d7b00a1`
- Output: `stitch-output/2026-04-20T00-46-32-5e95108ca38e4d0f89bd0cea7d7b00a1/`
- **Retro-Note (Runde 3 Session „No Tool Icons", 2026-04-20):** Die Baseline zeigt 48×48-Pencil-Sketch-Icon-Slots pro Karte. Shipped implementiert jetzt NUR Titel + Tagline — keine Icons. Die Baseline bleibt strukturell gültig (Grid-Layout, Card-Padding, Hover-Shadow-Tick, Typo-Hierarchie sind alle weiter ok) und wird visuell überstimmt: Icons in Baseline vorhanden, Code-Implementierung ohne. Analog zur Palette-Retro-Note oben — Baseline-Layout trägt weiter, nur der eine Slot fällt weg. Kein Stitch-Re-Run nötig.
- Akzeptiert: Eyebrow "KONVERTER" + H1 + Lede im 44rem-Hero, Section-Head mit `Alle Werkzeuge` + `06`-count-badge, Bento-Grid 3-Col Desktop / 2-Col Tablet / 1-Col Mobile mit sechs uniformen Karten (vertikaler Stack: ~~Icon-Container oben → H3 Titel → Tagline~~ → H3 Titel → Tagline ab Session „No Tool Icons"), alphabetische Sortierung der sechs Live-Tool-Titel plus ihre Taglines wörtlich aus den Content-Frontmattern.
- Stitch-Eigenleistungen (verworfen, NICHT ins Code-Alignment übernommen):
  - **Material-Symbols-Icons** (`thermostat`, `scale`, `straighten`, …) als 48×48-Platzhalter — verletzt §7 Don't (Material Icons). Live bleibt bei `/icons/tools/<toolId>.webp` Pencil-Sketch.
  - **Icon-Wrapper** mit `bg-surface-container-high` + Border um jedes Icon herum — Stitch-ism. Live-Icons sitzen direkt auf der Card ohne Sekundärcontainer.
  - **Google-Fonts-CDN-Link** — Stitch-Default. Wir bleiben self-hosted via `@fontsource-variable/*`.
  - **Material-Design-3-Token-Namen** (`on-surface-variant`, `surface-container-lowest`) — werden 1:1 auf `var(--color-*)` gemappt.
- Footer-Divergenz (Live gewinnt per Konflikt-Heuristik): Stitch zeigt Brand+© / Werkzeuge+Über / Datenschutz+Impressum+Sprache; Live hat FooterToolsList (6 Tool-Links) / Rechtliches (Datenschutz+Impressum, disabled) / Meta (Sprache+©). Shipped bleibt, Stitch-Vorschlag wird nicht übernommen.
- Bestätigt: 4-Element-Header-Regel aus §4 (Brand + Nav + Search + Theme-Toggle), 3-Slot-Segmented-Control (`Hell` aktiv), keine Login-/Account-Elemente, DE-Nav-Labels, Hex-Werte matchen §2 innerhalb M3-Token-Mapping-Toleranz.
- Fußnote (Card-Count-Drift): Baseline zeigt **6** Converter-Karten (alphabetisch, matched Phase-1-Batch-1 + meter-zu-fuss). Live-SSR an `/de/` indiziert zum Zeitpunkt der Baseline bereits **8** Karten — inklusive `hintergrund-entfernen` und `webp-konverter` (beide via Auto-Index aus `src/content/tools/`). Das Layout ist breakpoint-robust für beliebige `N`: Grid fällt 3→2→1 sauber durch, der `count`-Badge rendert `String(n).padStart(2, '0')`. Baseline-Zahl ist eine Momentaufnahme für Design-Abnahme, kein Tool-Whitelist.

---

**Generated from:** `src/styles/tokens.css` (v1.3, Runde 3 palette-loosening) + `STYLE.md` (v1.3) + `CLAUDE.md §5 Hard-Caps`.
**Last regenerated:** 2026-04-20.
**Regenerate when:** tokens.css changes, STYLE.md §0–§11 changes, or CLAUDE.md §5 Hard-Caps change.
