# Brand Guide — Eval-Rubrik für Agenten

> **Zweck:** Konsolidiert STYLE.md + CONTENT.md + tokens.css in agent-lesbare, messbare Regeln. Die Rulebooks bleiben Single-Source-of-Truth — dieser Guide ist die aggregierte Sicht für Agenten, die keine Zeit haben 5 Files zu lesen.
>
> **Wichtig für Agenten:** Wenn dieser Guide und eine Rulebook-Datei sich widersprechen, gewinnt die Rulebook-Datei. Öffne dann ein User-Issue mit der Diskrepanz.

---

## 1. Visual (konkret messbar)

### Farben
- **Pflicht:** CSS-Variablen aus `src/styles/tokens.css`. Kein Hex, kein RGBA, kein Tailwind-Arbitrary-Color.
  - `var(--color-text)`, `var(--color-bg)`, `var(--color-border)`, `var(--color-muted)`, `var(--color-success)`, `var(--color-error)`
- **Akzent = Graphit-Grau.** NICHT Blau, NICHT Purple, keine Gradients.
- **Success (Olive) + Error (Rust):** NUR für semantischen State. Nicht dekorativ.
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

### Struktur (jede Tool-Seite)
1. H1 = Tool-Name + Kern-Nutzen
2. Tool-Component (Converter, Calculator, etc.) direkt unter H1
3. `## Wie funktioniert [Tool]?` — erklärend, 2–4 Absätze
4. `## Wann brauchst du [Tool]?` — 3–5 konkrete Use-Cases
5. `## Formel / Hintergrund` (bei Konvertern/Rechnern) — Mathematik transparent
6. `## Häufige Fragen` — FAQPage-Schema, min. 3 Fragen
7. **Related Tools:** automatisch via `<RelatedTools>` (siehe [CONVENTIONS.md](../../CONVENTIONS.md)). NICHT hand-authored.

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

## 4. Eval-Rubrik für QA-Agent

Pro Tool-Commit vor `engineer_output.md` → `qa_results.md`:

| Kriterium | Pass-Bedingung | Tool |
|-----------|----------------|------|
| Tests grün | `npm test` exit 0 | Bash |
| Astro-Check grün | `astro check` 0/0/0 | Bash |
| Kein Hex in Component-Code | `grep -E '#[0-9a-fA-F]{3,8}' src/components/` leer | Grep |
| Keine arbitrary-px | `grep -E '[0-9]+px' src/components/` nur in tokens.css | Grep |
| Content ≥ 300 Wörter | wc -w auf `.md`-Content ≥ 300 | Bash |
| H1 vorhanden + unique | Regex auf `^# ` (exactly 1) | Grep |
| Schema.org JSON-LD | `<script type="application/ld+json">` im HTML | Playwright |
| Contrast AAA | axe-core audit ohne Fails | Playwright |
| Focus-Ring sichtbar | Visual-Diff Screenshot Tab-Navigation | Playwright |
| NBSP zwischen Zahl+Einheit | Regex `[0-9]+\s(MB\|GB\|m\|km\|Fuß)` = 0 matches | Grep |
| Commit-Trailer vorhanden | `git log -1` enthält `Rulebooks-Read:` | Bash |

**Pass-Schwelle:** 11/11. Jeder Fail = Re-Work Ticket an Tool-Builder.
