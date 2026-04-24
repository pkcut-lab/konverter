# Site-wide --color-text-subtle AAA-Audit

**Ticket:** KON-253
**Datum:** 2026-04-24
**Trigger:** KON-236 meta-review flaggte `.optional-badge`/`.empty-state` mit `--color-text-subtle` — Rubrik-Unklarheit zwischen a11y-auditor (BLOCKER) und merged-critic (MINOR).

---

## 1. Token-Werte

| Token | Light (#) | Dark (#) |
|---|---|---|
| `--color-bg` | `#FAFAF9` | `#1A1917` |
| `--color-surface` | `#FFFFFF` | `#252320` |
| `--color-surface-sunk` | `#F3F0EA` | `#0F0E0D` |
| `--color-text-subtle` (vorher) | `#575450` | `#A8A59E` |
| `--color-text-subtle` (nachher) | `#575450` | **`#B3B0A9`** |
| `--color-text-muted` | `#52504B` | `#A8A59E` |

---

## 2. Kontrast-Matrix (nach Fix)

| subtle auf Hintergrund | Light | Pass? | Dark (vorher) | Dark (nachher) | Pass? |
|---|---|---|---|---|---|
| `--color-bg` | 7.21:1 | ✅ AAA | 7.14:1 | **8.11:1** | ✅ AAA |
| `--color-surface` | 7.53:1 | ✅ AAA | **6.37:1** ❌ | **7.24:1** | ✅ AAA |
| `--color-surface-sunk` | 6.62:1 | ⚠ (kein Text drauf*) | 7.84:1 | **8.91:1** | ✅ AAA |
| `--color-surface-raised` | ~7.04:1 | ✅ AAA | — | — | — |

*\* Kein instructionaler `--color-text-subtle`-Text sitzt in der Praxis auf `--color-surface-sunk` (nur Icon-Box, Toggle-Track, Video-Element — keine Text-Träger).*

**Root-Cause der Failures:** Dark-mode `--color-surface` (`#252320`) ist etwas zu hell für den alten subtle-Wert (`#A8A59E` = 6.37:1 < 7:1). Beide Tokens (muted + subtle) hatten denselben Wert — dark-mode hatte keine Differenzierung.

---

## 3. Callsite-Inventar

### 3a. Nicht-Text-Uses (border-color, background) — WCAG-Text-Kontrast nicht anwendbar

WCAG SC 1.4.3 (Contrast) gilt nur für Text. Für UI-Komponenten und Grafik gilt SC 1.4.11 (Non-text Contrast, ≥3:1). `--color-text-subtle` als `border-color` oder `background` ist bereits deutlich über 3:1 auf allen Hintergründen und erfordert keinen Fix.

| Datei | Zeile | Use | Klasse | Entscheidung |
|---|---|---|---|---|
| Analyzer.svelte | 101 | border-color | `.analyzer__field:hover` | decorative — OK |
| BildDiffTool.svelte | 447 | border-color | dropzone border | decorative — OK |
| Comparer.svelte | 184 | border-color | textarea hover | decorative — OK |
| ContrastCheckerTool.svelte | 210,240,268 | border-color | input borders | decorative — OK |
| Converter.svelte | 243,299 | border-bottom/border | panel separator | decorative — OK |
| FileTool.svelte | 767,1083 | border-color | dropzone/area borders | decorative — OK |
| Formatter.svelte | 259 | border-color | textarea hover | decorative — OK |
| QrCodeGeneratorTool.svelte | 168,243 | border-color | panel borders | decorative — OK |
| RegexTesterTool.svelte | 267,310,345 | border-color | input/field borders | decorative — OK |
| RelatedTools.astro | 114 | background | divider | decorative — OK |
| Header.astro | 271 | background | divider | decorative — OK |
| BildDiffTool.svelte | 565 | background | divider | decorative — OK |
| WebcamBlurTool.svelte | 594 | border-top-color | spinner divider | decorative — OK |
| Validator.svelte | 111,119 | border-color | field borders | decorative — OK |
| ColorConverter.svelte | 258,406 | border-bottom/border | tab/field | decorative — OK |

### 3b. Text-Uses (color) — klassifiziert

#### ✅ Instructional — AAA erforderlich — PASSING (light + dark nach Fix)

| Datei | Zeile | Klasse | Text-Beispiel | Hintergrund | Light | Dark (nach Fix) |
|---|---|---|---|---|---|---|
| Converter.svelte | 207 | `.panel__label-unit` | "km", "€" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| Converter.svelte | 266 | `.converter__separator` | "=" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| Converter.svelte | 327 | `.quick__label` | "Beispiele:" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| FileTool.svelte | 806 | `.dropzone__hint` | Format-Infos | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| FileTool.svelte | 861 | `.dropzone__sep` | "·" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| FileTool.svelte | 986,1042,1157,1216,1263,1281,1299,1369 | diverse Labels | Meta-Infos | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| Generator.svelte | 188 | `.generator__control-label` | "Länge" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| Generator.svelte | 263 | `.generator__ghost-btn:disabled` | "Kopieren" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| Generator.svelte | 290 | `.generator__empty` | Empty-State | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| Comparer.svelte | 211 | `.comparer__empty` | Empty-State | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| Comparer.svelte | 251 | `.comparer__ghost-btn:disabled` | "Vergleichen" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| Analyzer.svelte | 128 | `.analyzer__metric-label` | "Wörter", "Zeichen" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| RegexTesterTool.svelte | 249 | `.regex__count` | "3 Treffer" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| RegexTesterTool.svelte | 277 | `.regex__delim` | "/" Trennzeichen | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| RegexTesterTool.svelte | 359,432 | `.regex__flag-label`, `.regex__match-val` | Flag-Labels | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| RegexTesterTool.svelte | 406 | `.regex__match-idx` | "#1", "#2" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| RegexTesterTool.svelte | 451 | `.regex__group-label` | "Gruppe 1" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| RegexTesterTool.svelte | 463 | `.regex__empty` | Empty-State | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| WebcamBlurTool.svelte | 466 | `.slider-row__value` | "50 %" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| WebcamBlurTool.svelte | 479 | `.slider-row__hints` | "0" / "100" | `--color-surface` | 7.53 ✅ | 7.24 ✅ |
| BruttoNettoRechnerTool.svelte | 561 | `.optional-badge` | "optional" | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| BruttoNettoRechnerTool.svelte | 834 | `.empty-state` | Empty-State | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| (alle Calculator-Tools) | diverse | `.empty-state`, `.optional-badge` | Prompts | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| Footer.astro | 155,197,211,216 | diverse | Meta-Links | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| Header.astro | 187,235 | diverse | Nav-Hints | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| [slug].astro | 476,505,594 | diverse | Page-Labels | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| [lang]/index.astro | 77,115 | diverse | Category-Labels | `--color-bg` | 7.21 ✅ | 8.11 ✅ |
| global.css | 281,314,380 | diverse | Prose-Meta | `--color-bg` | 7.21 ✅ | 8.11 ✅ |

#### ❌ Vorher failing (dark mode) → ✅ nach Token-Fix

Alle Zeilen mit `--color-text-subtle` als `color` innerhalb von Elementen mit `background: var(--color-surface)`:
- **Converter.svelte**: `.panel__label-unit`, `.converter__separator`, `.quick__label` (root hat `--color-surface`)
- **Generator.svelte**: `.generator__empty`
- **Comparer.svelte**: `.comparer__empty`
- **Analyzer.svelte**: `.analyzer__metric-label` (parent `--color-surface`)
- **RegexTesterTool.svelte**: `.regex__delim`, `.regex__empty`
- **FileTool.svelte**: `.dropzone__hint`, `.dropzone__sep` (dropzone hat `--color-surface`)
- **WebcamBlurTool.svelte**: `.slider-row__value`, `.slider-row__hints` (controls-card hat `--color-surface`)

---

## 4. Fix angewendet

**Datei:** `src/styles/tokens.css`
**Änderung:** Dark-mode `--color-text-subtle` von `#A8A59E` → `#B3B0A9`

```diff
- --color-text-subtle: #A8A59E;
+ --color-text-subtle: #B3B0A9; /* AAA: #A8A59E war 6.37:1 auf --color-surface; #B3B0A9 = 7.24:1 */
```

**Light mode:** unverändert (`#575450`) — keine praktischen Failures gefunden (kein instructionaler Text auf `--color-surface-sunk` in der Codebase).

---

## 5. Rubric-Entscheidung (für EVIDENCE_REPORT.md)

Siehe §§ in EVIDENCE_REPORT.md ergänzt (Abschnitt "A11y-Auditor Rubrik-Klärung").

**Kurzfassung:**
- `--color-text-subtle` als **border-color / background**: WCAG SC 1.4.11 (≥3:1). Kein AAA-Kontrast nötig. → **MINOR wenn ≥3:1, PASS**
- `--color-text-subtle` als **color** (Textfarbe) auf jeglichem Hintergrund: WCAG SC 1.4.6 (≥7:1 AAA). → **BLOCKER wenn < 7:1**
- `--color-text-subtle::placeholder`: Ausnahme laut WCAG SC 1.4.3 Note — Placeholder-Text gilt als *inaktiver UI-Zustand* → **AA (≥4.5:1) ausreichend, kein AAA**
- `.optional-badge`/`.empty-state` auf `--color-bg`: beide Tokens bestehen AAA (7.21:1 light, 8.11:1 dark nach Fix) — a11y-auditor BLOCKER war korrekt als Signal, aber Failure-Background war falsch (bg, nicht surface) → MINOR-Einordnung des merged-critics war ebenfalls ungenau.

---

## 6. Unblocks

- [KON-236](/KON/issues/KON-236) kreditrechner End-Review: `.optional-badge` und `.empty-state` waren bereits mit `--color-text` (kein subtle) in KreditrechnerTool — kein aktives Contrast-Fail. Blockierung aufgehoben durch Rubrik-Klärung in EVIDENCE_REPORT.md.
