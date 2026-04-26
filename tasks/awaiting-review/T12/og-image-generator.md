# T12 — OG-Bilder pro Tool + Brand-Asset-Audit — Worker-Output

**Status:** ready-for-review
**Agent:** OG-Image-Generator (33c1c372)
**Date:** 2026-04-26

---

## Brand-Asset-Audit

| Asset | Status | Details |
|---|---|---|
| `public/icon.svg` | ✅ | SVG, 1 KB, correct viewBox 0 0 512 512 |
| `public/favicon-32.png` | ✅ | PNG 32×32 px |
| `public/icon-192.png` | ✅ | PNG 192×192 px |
| `public/icon-512.png` | ✅ | PNG 512×512 px |
| `public/icon-maskable-512.png` | ✅ | PNG 512×512 px maskable |
| `public/og-image.png` | ✅ | PNG 1200×630 px (site-wide fallback) |
| `public/og-image.svg` | ✅ | SVG source for global OG image |
| `public/manifest.webmanifest` | ✅ | references icon.svg, 192, 512, maskable |

**Keine fehlenden Assets.** Alle Brand-Dateien konsistent.

---

## OG-Karten-Generierung

### Ergebnis

- **72 Karten generiert** → `public/og/tools/*.webp`
- **Format:** WebP, 1200×630 px, quality 90
- **Gesamtgröße:** 1.1 MB (∅ ~15 KB/Karte)
- **0 Fehler, 0 skipped**

### Script

`scripts/generate-og-cards.mjs` (neu erstellt)

- Liest alle `src/content/tools/*/de.md`-Files (Frontmatter-Parsing via Regex)
- Leitet Display-Name ab: `headingHtml` HTML-stripped → Fallback auf `title` (bis ` – `)
- Kategorie-Eyebrow: Deutsch uppercase (JetBrains Mono)
- Tool-Name: Inter Variable, 52–72 px je nach Länge, Word-Wrap bis 2 Zeilen
- Fonts inline als base64 (Inter-Variable.woff2 + JetBrainsMono-Variable.woff2)
- Konversion: `sharp` → WebP quality 90

### Design-Token-Compliance (Hard-Caps CLAUDE.md)

| Token | Wert | Verwendung |
|---|---|---|
| `--color-bg` (dark) | `#1A1917` | Karten-Hintergrund |
| `--color-text` (dark) | `#FAFAF9` | Tool-Name, Wordmark |
| `--color-accent` (dark) | `#F0A066` | Wordmark-"o", Logo-Accent |
| `--color-text-muted` (dark) | `#9C998F` | Eyebrow, Footer-URL |
| Logo | icon.svg-Elemente (inverted) | Weiße Badge oben links |

---

## Astro-Integration

### BaseLayout.astro

- Neues optionales Prop `ogImagePath?: string` hinzugefügt
- `const ogImage = new URL(ogImagePath ?? '/og-image.png', Astro.site)` — Fallback auf globales Bild wenn kein per-Tool-Bild

### [slug].astro

- Imports: `existsSync`, `resolve` aus Node
- Per-Tool-OG-Logik: schlägt DE-Slug via `getSlug(toolId, 'de')` nach → prüft ob Datei existiert → übergibt `ogImagePath` an BaseLayout
- **DE-Seiten:** zeigen eigenen Tool-Karte (`/og/tools/meter-zu-fuss.webp`)
- **EN-Seiten:** nutzen dieselbe DE-Karte (toolId → DE-Slug lookup)
- **Fallback:** `/og-image.png` wenn Datei nicht existiert

### Build-Verifikation

```
✓ Completed in 2.60s (no errors, no type errors)
```

Stichprobe OG-Tags:
- `dist/de/meter-zu-fuss/index.html` → `og:image = https://kittokit.com/og/tools/meter-zu-fuss.webp` ✅
- `dist/en/meter-to-feet/index.html` → `og:image = https://kittokit.com/og/tools/meter-zu-fuss.webp` ✅
- Home-Page → `og:image = https://kittokit.com/og-image.png` ✅ (Fallback)

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `scripts/generate-og-cards.mjs` | NEU — Generator-Script |
| `public/og/tools/*.webp` | NEU — 72 OG-Karten |
| `src/layouts/BaseLayout.astro` | +`ogImagePath?` Prop |
| `src/pages/[lang]/[slug].astro` | +per-Tool OG-Logik, +imports |

---

## Übergabe

Bereit für Quality-Review. Empfehle visuelle Stichprobe von 3–5 generierten Karten.

Rulebooks-Read: PROJECT, DESIGN, CLAUDE.md
