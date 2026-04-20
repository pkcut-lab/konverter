# Brand Guide — Eval-Rubrik für Agenten

> **Zweck:** Konsolidiert STYLE.md + CONTENT.md + tokens.css in agent-lesbare, messbare Regeln. Die Rulebooks bleiben Single-Source-of-Truth — dieser Guide ist die aggregierte Sicht für Agenten, die keine Zeit haben 5 Files zu lesen.
>
> **Wichtig für Agenten:** Wenn dieser Guide und eine Rulebook-Datei sich widersprechen, gewinnt die Rulebook-Datei. Öffne dann ein User-Issue mit der Diskrepanz.

---

## 1. Visual (konkret messbar)

### Farben
- **Pflicht:** CSS-Variablen aus `src/styles/tokens.css`. Kein Hex, kein RGBA, kein Tailwind-Arbitrary-Color.
  - `var(--color-text)`, `var(--color-bg)`, `var(--color-border)`, `var(--color-muted)`, `var(--color-success)`, `var(--color-error)`
- **Palette (Runde 3, gelockt):** Graphit + 1 warmer Orange-Accent (`#8F3A0C` Light / `#F0A066` Dark, beide AAA). Orange erscheint **ausschließlich** auf Links, Focus-Rings, `<em>`-Highlights, Eyebrow-Pulse-Dots, Spinner-Arcs, Dropzone-Active-Borders. **Niemals Primary-Button-Fläche** — Primary-Buttons bleiben `var(--color-text)` graphit. Kein Purple, keine bold accent colors, keine Gradients.
- **Success (Olive) + Error (Rust):** Pro/Con-Bullet-Dots + States. Nicht dekorativ.
- **Icon-Color:** `filter: var(--icon-filter)` — niemals manuell pro Theme recolorieren.

### Spacing
- **Erlaubt:** `var(--space-1)` bis `var(--space-24)` oder Tailwind-Utilities die darauf mappen.
- **Verboten:** `padding: 7px`, `gap: 13px` etc. Runden auf Token. Falls neuer Token nötig → User-Ticket.

### Radii
- `var(--r-sm)` (4px), `var(--r-md)` (8px), `var(--r-lg)` (12px).
- **Kein `rounded-full`** außer bei Avataren. Ein Button ist KEIN Pill.

### Borders
- **Standard:** `1px solid var(--color-border)`. Keine 2px, keine dashed, keine colored-borders.

### Typography
- `font-family: var(--font-family-sans)` = Inter (self-hosted, DSGVO).
- `font-family: var(--font-family-mono)` = JetBrains Mono — NUR für Code + Numeric-Outputs in Convertern.
- Größen: `--font-size-*` Token-Trio. Keine Zwischengrößen.
- **`text-wrap: balance`** auf H1/H2.
- **`font-variant-numeric: tabular-nums`** auf Numeric-Results.
- **`translate="no"`** auf Unit-Spans (`Fuß`, `MB`, `m`).
- **NBSP** zwischen Zahl und Einheit: `10\u00A0MB`, `&nbsp;` in MD.

### Motion
- Nur `var(--dur-fast)`, `var(--dur-base)`, `var(--dur-slow)` + `var(--ease-out)`.
- `@media (prefers-reduced-motion: reduce) { animation: none; }` Pflicht.
- Keine ad-hoc `transition: all 0.3s ease`.

### Layout-Don'ts (auch wenn ein Design-Skill es vorschlägt)
- Keine Asymmetrie, keine Grid-Breaking-Layouts, keine diagonalen Kompositionen
- Keine Noise-Texturen, Grain-Overlays, Gradient-Mesh
- Keine maximalistische Visual-Density
- Kein `rounded-full` auf Cards, Buttons, Inputs
- Kein Emoji in UI-Copy

### Accessibility (WCAG 2.1 AAA)
- Contrast ≥ 7:1 für Body-Text, ≥ 4.5:1 für Large-Text.
- Focus-Ring: `outline: 2px solid var(--color-accent)` + `outline-offset: 2px`.
- Tap-Target ≥ 44×44px auf Mobile.
- `aria-*`-Attribute bei interaktiven Komponenten (Radiogroup, Combobox, Disclosure).

---

## 2. Copy / Content

### Tone (aus CONTENT.md)
- **Stimme:** Sachlich, präzise, knapp. Keine Marketing-Phrasen.
- **Verboten:** "Elevate your", "Seamless experience", "Revolutionary", "Game-changer", "Harness the power of".
- **Emojis:** NEIN in UI und SEO-Content. Ausnahme: Explizit gewünscht vom User.

### Länge
- **Tool-Seiten:** ≥ 300 Wörter. < 300 = thin Content = automatischer Reject.
- **H1:** Eine klare Aussage. Keine Fragen. Keine "Die ultimative Lösung für…"
- **Meta-Description:** 140–160 Zeichen, Call-to-Action sinnvoll, keine Emojis.

### Struktur (jede Tool-Seite — v2, Session-6-gelockt)

**Single-Source-of-Truth:** [CONTENT.md §13](../../CONTENT.md#13-tool-content-template-v2-gelockt-session-6). Kurzfassung:

- **Frontmatter:** 15 Felder — siehe §13.1. Pflicht: `toolId`, `language`, `title` (30–60 Z.), `metaDescription` (140–160 Z.), `tagline`, `intro`, `howToUse` (3–5), `faq` (4–6), `relatedTools` (0–5, darf `[]` sein), `category` (14-Enum), `contentVersion`. Optional: `eyebrow` (1–24 Z.), `headingHtml` (max 1 `<em>`, kein anderes HTML), `aside`, `kbdHints`.
- **H2-Patterns:** A (Größen-Konverter, 6 fixe H2s), B (File-Tools, 6 fixe H2s), C (free-form mit Closer-Pflicht). Exakte Wortlaute in §13.2.
- **Prose-Link-Closer:** Jedes DE-Tool endet mit `## Verwandte <Kat>-Tools` + Intro-Zeile `"Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:"` + exakt 3 Bullets im Format `- **[Titel](/de/<slug>)** — Prose ≤120 Zeichen.` Vollständig in §13.4.
- **Kategorie-Mapping:** 14-Zeilen-Tabelle in §13.3 (`length → Längen`, `video → Video`, …). Hand-authored, keine Auto-Derivation.
- **Italic-Accent-Regel:** `<em>` umschließt das Ziel-Substantiv der Umwandlung, NICHT Verb/Prozess (§13.5 Regel 2).
- **Short-Title-Rule:** `computeShortTitle()` kappt Dash-Suffixe NUR für Nav-Chips (Related-Bar, YouMightStrip). NICHT für `<title>`/Meta/JSON-LD/Heading (§13.5 Regel 3).

### SEO-Non-Negotiables
- **Schema.org:** `WebApplication` + `FAQPage` (wenn FAQs vorhanden) + `BreadcrumbList`. Siehe `schema-markup` Skill.
- **hreflang:** Automatisch via `src/lib/hreflang.ts` — Agent ruft nur die Funktion, editiert nichts manuell.
- **Canonical:** Pro Sprache pro Slug.
- **Keine Keyword-Stuffing-Muster.** Natural Language Processing freundlich.

### Numerik-Darstellung
- Deutsche Zahlen: `1.234,56` (Punkt = Tausender, Komma = Dezimal). Nie `1,234.56`.
- Einheiten mit NBSP: `10&nbsp;MB`, `100&nbsp;m`.
- Negative: Minus-Zeichen `−` (U+2212), NICHT Hyphen `-`.

---

## 3. Code (aus CONVENTIONS.md)

- **Commit-Format:** Conventional Commits + `Rulebooks-Read: <Liste>` Trailer Pflicht.
- **Verboten:** `any`, `@ts-ignore`, Default-Exports für Tool-Configs.
- **Git-Account:** `pkcut-lab` exklusiv. Pre-Commit-Hook fängt alles andere.
- **Imports:** Relative (`./`, `../`). Keine Alias bis YAGNI kippt.
- **Slugs:** kebab-case, ASCII-only (`meter-zu-fuss`, NICHT `meter-zu-fuß`).
- **Tests:** Vitest. Pro Zod-Schema ≥ 1 valid + 1 invalid fixture.
- **Result-Type statt Exceptions** bei erwartbaren Fehlern (`ok()` / `err()` aus `src/lib/tools/types.ts`).

---

## 4. Eval-Rubrik für QA-Agent (v2, Session-6-gelockt)

Pro Tool-Commit vor `engineer_output.md` → `qa_results.md`. Referenz für alle v2-Regeln: [CONTENT.md §13](../../CONTENT.md#13-tool-content-template-v2-gelockt-session-6).

| # | Kriterium | Pass-Bedingung | Tool |
|---|-----------|----------------|------|
| 1 | Tests grün | `npm test` exit 0 | Bash |
| 2 | Astro-Check grün | `astro check` 0/0/0 | Bash |
| 3 | Kein Hex in Component-Code | `grep -E '#[0-9a-fA-F]{3,8}' src/components/` leer (außer tokens.css) | Grep |
| 4 | Keine arbitrary-px | `grep -E '[0-9]+px' src/components/` nur in tokens.css | Grep |
| 5 | Frontmatter-Schema valid | Zod-Parse in Vitest-Content-Test grün; `category` gesetzt + valid | Bash |
| 6 | H2-Pattern-Konformität | Pattern A/B: Locked-Sequence matcht exakt (Vitest content-test). Pattern C: `## Häufige Fragen` + `## Verwandte <Kat>-Tools` present | Grep |
| 7 | Prose-Link-Closer korrekt | Letzte H2 = `## Verwandte <Kat>-Tools` (Mapping §13.3) + Intro-Zeile wortgleich + exakt 3 Bullets im Format `- **[Titel](/de/<slug>)** — Prose ≤120 Z.` | Grep |
| 8 | `headingHtml` clean | Falls gesetzt: max 1 `<em>…</em>`, kein anderes HTML → Zod-refine grün | Bash |
| 9 | Schema.org JSON-LD | `WebApplication` + `FAQPage` (wenn FAQ) + `BreadcrumbList` im Build | Playwright |
| 10 | Contrast AAA + Focus-Ring | axe-core ohne Fails + Focus-Ring-Visual-Diff Tab-Navigation | Playwright |
| 11 | NBSP zwischen Zahl+Einheit | Regex `[0-9]+\s(MB\|GB\|KB\|m\|km\|cm\|mm\|Fuß\|Meter\|Zoll\|kg\|lb)` = 0 matches im Content | Grep |
| 12 | Commit-Trailer vorhanden | `git log -1` enthält `Rulebooks-Read:` | Bash |

**Pass-Schwelle:** 12/12. Jeder Fail = Re-Work Ticket an Tool-Builder.

### Forbidden Patterns (instant-Reject)

- `<em>` umschließt Verb/Prozess statt Ziel-Substantiv (§13.5 Regel 2)
- Icon-Frontmatter-Eintrag oder Card-Icon im neuen Content (§13.5 Regel 5 — keine Tool-Icons)
- Orange-Fläche auf Primary-Button (§13.5 Regel 6)
- `computeShortTitle()`-Kappung in `<title>`, Meta-Desc oder JSON-LD (§13.5 Regel 3)
- Prose-Closer mit Forward-Ref-Link (Link auf noch nicht existierenden Slug)
