# kittokit — Design-Spezifikation

**Version:** 1.1
**Datum:** 2026-04-17
**Status:** Design approved, spec-review passed, scope-reduced iteration
**Autor:** pkcut-lab + Claude Code

**Changelog v1.1:**
- Sprachscope reduziert: DE → 5 Sprachen → Gate auf 13 → Gate auf 30 (statt 70 ab Start)
- R2 als explizites Phase-5-Prerequisite (statt offene Frage OQ7)
- Ad-Slot-CLS-Tokens als Design-System-Pflicht
- Non-Negotiable #7a: ML-File-Tools-Ausnahme mit klaren Bedingungen + DSGVO-Dokumentations-Pflicht
- Timeline 5-8 → 4-6 Monate bis Revenue (wegen Scope-Reduktion)

---

## 1. Executive Summary

Aufbau einer multilingualen Web-Plattform mit 1000+ Konverter-, Rechner-, Generator- und File-Tools. Ziel: die qualitativ beste Tool-Sammlung im Web, finanziert über AdSense ab Phase 2.

**Kern-Werte:**
- **Qualität vor Geschwindigkeit** — jedes Tool wird erst gelauncht, wenn es perfekt ist
- **Privacy First** — kein Tracking ohne Consent, Cookie-frei in Phase 1, File-Tools arbeiten 100% client-side
- **SEO-Exzellenz** — saubere Struktur, Hreflang, JSON-LD, Core Web Vitals AAA
- **Session-Continuity** — Tool #3 sieht identisch aus wie Tool #250, über Monate und Hunderte von Sessions

**Staged-Launch-Strategie (neu v1.1):**
- **Phase 1-2:** DE only (~1.000 Seiten) — Revenue-Validation-Basis
- **Phase 3:** +EN, ES, FR, PT-BR (~5.000 Seiten) — 5-Sprachen-Launch
- **Phase 5 (Entry-Gate):** +JA, KO, NL, SV, IT, PL, TR, NO (~13.000 Seiten) — High-CPC-Cluster
- **Phase 6 (Entry-Gate):** bis 30 Sprachen (~30.000 Seiten) — nach R2-Migration + Revenue-Validation

Architektur ist zukunftsfähig bis 30 Sprachen ohne Rewrite. Die Reduktion ggü. der ursprünglichen 70-Sprachen-Vision ist strategisch: Revenue zuerst validieren, dann skalieren.

---

## 2. Project Scope & Goals

### 2.1 Scope (Staged-Launch)

**Launch-Scope (Phase 1-3):** 1 Kern-Sprache (DE, ~1000 Tools) → 5 Sprachen (DE/EN/ES/FR/PT-BR, ~5000 Seiten).

**Expansion-Gates:**
- **Phase 5:** +8 Sprachen (JA, KO, NL, SV, IT, PL, TR, NO) → ~13.000 Seiten. **Entry-Gate:** Monthly-Revenue > 2.000€, keine Crawl-Anomalien in Search Console.
- **Phase 6:** Weitere Sprachen bis max 30 → ~30.000 Seiten. **Entry-Gate:** R2-Bucket + Worker-Proxy für Pagefind-Index implementiert (siehe 3.3), Revenue-Wachstum bestätigt.

**Scope-Invarianten (über alle Phasen stabil):**
- 1000+ einzelne Tool-Seiten, eigenständige URLs für SEO
- PWA Day 1 (Installable, Offline-fähig)
- Client-Side-Search über alle Tools
- Statisch gerendert, null Server-Rendering (Ausnahme: ML-File-Tools, siehe Non-Negotiable #7a)

### 2.2 Explizite Nicht-Ziele
- Kein User-Account-System
- Keine User-Generated-Content (Kommentare, Reviews)
- Keine externen APIs zur Runtime (alles client-side oder Build-time)
- Kein Backend-Code (statisches Hosting only)
- Keine Mobile-App (PWA reicht)
- Keine Push-Notifications

### 2.3 Monetarisierungs-Modell (Phase 2)
- Google AdSense primär
- Optional Direct-Sponsoring bestimmter Kategorien (später)
- Kein Paywall, alle Tools gratis

---

## 3. Tech Stack & Infrastructure

### 3.1 Runtime & Core

| Component | Choice | Version (Locked) |
|-----------|--------|------------------|
| Node | Node.js | 20.11.1 LTS |
| Package Manager | npm | 10.2.4 |
| Meta-Framework | Astro (Islands Architecture, SSG) | 5.x |
| UI-Layer | Svelte 5 (Runes-Mode) | 5.x |
| CSS | Tailwind CSS | 3.4.x |
| Language | TypeScript (strict) | 5.7.x |
| Validation | Zod | 3.24.x |

**Warum Astro:** SSG mit 0 KB JS default, nur hydriert wo nötig (Islands), multi-lingual routing nativ, exzellente Core Web Vitals.

**Warum Svelte:** Kleinste Bundle-Size der Component-Frameworks, Runes sind perfekte Reactivity ohne Overhead, 1. Wahl für Interactive Tools innerhalb von Astro-Islands.

### 3.2 Plugins

| Plugin | Purpose |
|--------|---------|
| `@vite-pwa/astro` | Service Worker, Manifest, Offline, A2HS |
| `astro-sitemap` | Sitemap-Index für 70k URLs mit Hreflang |
| `pagefind` | Client-Side-Search, pro Sprache gechunkt |
| `sharp` | Icon-WebP-Conversion (Build-Script) |

### 3.3 Hosting & CDN

**Cloudflare Pages** (keine Vercel).
- Kostenlos, unlimited Bandwidth (kritisch für 70k Seiten)
- Edge-Cached weltweit
- Git-Integration (Auto-Deploy)
- Preview-URLs pro PR

**Kritisches Limit:** CF Pages erlaubt **max 20.000 Files pro Deployment**. Strategie ist gestuft:

**Phase 1-4 (bis ~5.000 Seiten, 5 Sprachen):**
- Pagefind-Index liegt direkt in `dist/pagefind/` → alles in CF Pages, kein R2 nötig.
- **Pre-Flight-Check** (`scripts/check-file-count.ts`) läuft bei jedem Build — warnt bei ≥18.000 Files, bricht ab bei ≥19.500.
- Bei 5 Sprachen × 1000 Seiten + Pagefind-Fragmente rechnen wir mit ~8.000-15.000 Files → klar unter Limit.

**Phase 5 Prerequisite (vor Rollout der 6. Sprache):**
- **R2-Bucket + Worker-Proxy** für Pagefind-Index wird implementiert
- Build-Script schreibt Pagefind-Output nach R2 statt `dist/pagefind/`
- Pagefind-Client-Config umgestellt: Base-URL `/pagefind/` → `https://search.konverter.app/pagefind/` (Worker-Proxy auf eigene Subdomain)
- HTML-Seiten bleiben in CF Pages → File-Count-Limit bleibt unter 20k auch für 30 Sprachen
- **Aufwand:** ~4-6h Engineering (Nachmittags-Task), kein Architektur-Rewrite

**Warum nicht Multi-Project-Split (verworfen):** Pro Sprachfamilie eigenes CF-Pages-Projekt wäre Ops-Overhead (separate Deploys, separate Domains/Subdomains, fragmentierte Analytics). R2+Worker ist sauberer.

**Architektur-Invariante:** Pagefind-Client-Code ist so geschrieben, dass der Base-URL-Switch (Phase 5) ohne Code-Änderung möglich ist — nur Config.

### 3.4 Analytics

**Phase 1:** Cloudflare Web Analytics (cookie-frei, kein Banner nötig, keine DSGVO-Probleme, kostenlos).

**Phase 2 (mit Ads):** + Microsoft Clarity (Heatmaps, Session-Recordings, frei, Ads-Optimierung).

### 3.5 Git-Workflow

- **Single Repo** auf GitHub
- **GitHub Flow** (main + kurzlebige Feature-Branches pro Tool-Familie)
- **Git-Account:** NUR `pkcut-lab` in diesem Workspace (via `includeIf` in Global-Git-Config gelockt)
- Commit-Identity: `pkcut-lab <276936739+pkcut-lab@users.noreply.github.com>`

### 3.6 Deploy-Strategie (Two-Way)

**Pfad A — GitHub Actions → CF Pages (Auto-Deploy):**
Kleine Changes (1-10 Tools, Bug-Fixes, Content-Updates). Build-Timeout 18 Min. Deploy via `cloudflare/pages-action`.

**Pfad B — Lokaler Wrangler-Deploy:**
Massive Rebuilds (neue Sprache = +1000 Seiten, Design-System-Changes). `npm run build && npx wrangler pages deploy dist`. Umgeht 20-Min-CI-Limit.

---

## 4. Tool Architecture

### 4.1 Neun Tool-Typen

Alle Tools basieren auf einer von **neun** generischen Svelte-Komponenten. Tool-Config lebt als TypeScript-File in `src/lib/tools/`.

| # | Typ | Input | Output | Beispiele |
|---|-----|-------|--------|-----------|
| 1 | **Converter** | 1 Input + Units | 1 Output | Meter↔Fuß, EUR↔USD, °C↔°F |
| 2 | **Calculator** | n Inputs + Formel | Ergebnis(se) | BMI, MwSt, Zinsen |
| 3 | **Generator** | Config | Text/String | Passwort, UUID, Lorem Ipsum |
| 4 | **Formatter** | Rohtext/Code | Formatierter Output | JSON Pretty, SQL Format, Base64 |
| 5 | **Validator** | Input + Regel | Boolean + Details | Email, IBAN, URL, JSON |
| 6 | **Analyzer** | Input | Multi-Daten | Word-Count, URL-Parser, JWT-Decoder, Regex-Tester |
| 7 | **Comparer** | 2 Inputs | Diff/Ähnlichkeit | Text-Diff, JSON-Diff, CSV-Diff |
| 8 | **File-Tool** | File(s) + Config | File(s) / Download | WebP Konverter, Background-Remover, Video→WebP-Frames, Favicon-Generator |
| 9 | **Interactive** | Kontinuierliche State-Manipulation (Canvas/SVG) | Exportierbarer State (Code/Image) | SVG-Path-Editor, Cubic-Bezier-Editor, Mesh-Gradient-Generator, Color-Picker-from-Image, Glassmorphism-CSS-Generator (Live-Preview) |

**Typ 9 (Interactive) Spezifika:** Tools mit Canvas- oder SVG-basierter kontinuierlicher Interaktion (Drag, Zeichnen, Punkt-Manipulation). Kein klassischer Input→Output-Flow, sondern State→Export. Output ist typischerweise Code-Snippet (CSS/SVG) oder Bild-Datei. UI-Pattern: Preview-Canvas links, Controls rechts, Export-Button unten.

### 4.2 Tool-Config-Schema (TypeScript, pro Tool)

```typescript
// src/lib/tools/{slug}.ts

/**
 * ICON-PROMPT (für Recraft.ai — Custom Style aktiviert!):
 *
 * A premium editorial pencil sketch of {OBJECT}.
 * Minimalist line drawing featuring beautifully textured, bold and expressive
 * graphite strokes. Very clean composition on a pure white background,
 * high contrast monochromatic. No heavy shading, focusing on the raw,
 * authentic texture of a soft graphite pencil. Centered, modern artistic
 * execution, bespoke and unique appearance.
 *
 * Status: [ ] Pending  [ ] Generated  [ ] Delivered
 */
export const meterZuFuss: ConverterConfig = {
  id: "meter-to-feet",
  type: "converter",
  categoryId: "laengen",
  units: {
    from: { id: "m", label: "Meter" },
    to:   { id: "ft", label: "Fuß" },
  },
  convert: (m) => m * 3.28084,
  convertInverse: (ft) => ft / 3.28084,
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
```

### 4.3 File-Layout

```
src/
├── lib/
│   └── tools/                      # Tool-Configs (TypeScript)
│       ├── meter-zu-fuss.ts
│       ├── webp-konverter.ts
│       └── ...
├── components/
│   └── tools/                      # Eine Svelte-Component pro Tool-Typ
│       ├── Converter.svelte
│       ├── Calculator.svelte
│       ├── Generator.svelte
│       ├── Formatter.svelte
│       ├── Validator.svelte
│       ├── Analyzer.svelte
│       ├── Comparer.svelte
│       ├── FileTool.svelte
│       └── Interactive.svelte
├── content/
│   └── tools/                      # Content pro Tool pro Sprache
│       ├── meter-zu-fuss/
│       │   ├── de.md
│       │   ├── en.md
│       │   └── ...
│       └── ...
├── pages/
│   └── [lang]/
│       └── [slug].astro            # Dynamic Route
└── styles/
    └── tokens.css                  # Design-Tokens (CSS-Vars)

public/
├── icons/tools/                    # WebP-Icons, 80x80 CSS
└── pagefind/                       # Generated Search-Index pro Sprache

pending-icons/                      # User-Drop-Zone (Recraft → Build-Script)
```

### 4.4 Slug-Strategie

- **Pro Sprache eigener Slug:** `meter-zu-fuss` (DE) / `meters-to-feet` (EN) / `metros-a-pies` (ES)
- **CJK/RTL:** Transliteration (Pinyin für ZH, Romaji für JA) für URL-Kompatibilität; native Script im Content + Heading
- **ASCII-only für URL-Segmente** (keine Umlaute: `fuss` statt `fuß`)
- **Slug-Mapping-Datei:** `src/lib/slug-map.ts` verlinkt Tool-ID ↔ Slug pro Sprache (für Hreflang)

### 4.5 Unique-Tool-Strategie (Competitive Moat)

Launch-Katalog: **150 Standard-Tools + 50 Unique-Tools**.

**Kategorien Unique:**
- **Multilingual-exklusiv:** Umlaut/Akzent-Remover pro Sprache, Multilingual Lorem Ipsum, Lesbarkeits-Analyzer pro Sprache, Fake-Data-Generator mit kulturellen Namen
- **Developer (selten gut gebaut):** Regex-Visualizer (Graph/State-Machine), CRON-Expression-Explainer, Cubic-Bezier-Editor, API-Rate-Limit-Calculator, Docker-Tag-Diff, Bundle-Size-Visualizer
- **Business/Life mit DE-USP:** GDPR-Cookie-Banner-Generator, Impressum-Generator (§5 TMG), Kleinunternehmer-Grenz-Rechner (§19 UStG), EU-MwSt-Prüfer mit VAT-ID-Validierung, Feiertags-Rechner mit Bundesländern
- **Creative:** Color-Palette aus Bild, Glassmorphism/Neomorphism-CSS-Generator, SVG-Path-Editor, Mesh-Gradient-Generator
- **File-Tools (User-Wunsch):** WebP-Konverter, Background-Remover, Video→WebP-Frame-Sequence (für Parallax-Effekte)

---

## 5. Design System

### 5.1 Color Palette (Warm Graphite)

Accent ist **Graphit-Grau** mit warmem Unterton — bewusste Abkehr vom Standard-Blau, weil alle Icons im Pencil-Sketch-Stil generiert werden und Kohärenz zwischen Icons und UI entscheidend ist.

**Light Mode (default):**
```css
--color-bg:           #FFFFFF;
--color-surface:      #FAFAF9;   /* Warm off-white */
--color-border:       #E8E6E1;
--color-text:         #1A1917;   /* Deep graphite */
--color-text-muted:   #5C5A55;
--color-text-subtle:  #9C9A94;
--color-accent:       #3A3733;   /* Dark graphite for CTAs, Links, Focus */
--color-accent-hover: #1A1917;
--color-success:      #4A6B4E;   /* Muted olive green */
--color-error:        #8B3A3A;   /* Rusty red */
--icon-filter:        none;
```

**Dark Mode:**
```css
:root[data-theme="dark"] {
  --color-bg:           #1A1917;
  --color-surface:      #252320;
  --color-border:       #3A3733;
  --color-text:         #FAFAF9;
  --color-text-muted:   #A8A59E;
  --color-text-subtle:  #6C6A64;
  --color-accent:       #E8E6E1;   /* Inverted: light accent on dark */
  --color-accent-hover: #FFFFFF;
  --color-success:      #7FA582;
  --color-error:        #C67373;
  --icon-filter:        invert(0.92) brightness(1.05);   /* Pencil-Sketches sind achromatisch → kein hue-rotate nötig */
}
```

**Contrast-Verification (WCAG AAA):**
- Light: `#1A1917` auf `#FFFFFF` = 16.8:1 ✓
- Light-Accent: `#3A3733` auf `#FFFFFF` = 10.9:1 ✓
- Dark: `#FAFAF9` auf `#1A1917` = 15.1:1 ✓
- Dark-Accent: `#E8E6E1` auf `#1A1917` = 13.8:1 ✓

### 5.2 Dark/Light Mode Strategie

**Three-State-Toggle** (auto / light / dark) im Header:
- **Default `auto`:** folgt `prefers-color-scheme` des Systems
- **Override:** User-Toggle speichert in `localStorage`
- **Flash-Prevention:** Inline-Script im `<head>` setzt `data-theme` VOR CSS-Load

```html
<script>
  (function() {
    const stored = localStorage.getItem('theme');
    const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = stored || system;
  })();
</script>
```

**Meta-Theme-Color (Mobile Browser Chrome):**
```html
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1A1917" media="(prefers-color-scheme: dark)">
```

### 5.3 Typography

```css
--font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;

--font-h1:      2.25rem / 1.2 / 600;
--font-h2:      1.75rem / 1.3 / 600;
--font-h3:      1.375rem / 1.4 / 500;
--font-body:    1rem / 1.6 / 400;
--font-small:   0.875rem / 1.5 / 400;
```

**Self-hosted Fonts** (keine Google-Fonts → DSGVO-konform + Performance-Win). Variable Fonts wenn möglich. Preload nur Latin-Subset der aktiven Sprache.

### 5.4 Spacing, Radii, Shadows

```css
/* Spacing-Scale (fixed) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-24: 6rem;    /* 96px */

/* Radii */
--r-sm: 4px;
--r-md: 8px;
--r-lg: 12px;

/* Shadows (graphite-tinted, no blue bias) */
--shadow-sm: 0 1px 2px rgba(26, 25, 23, 0.05);
--shadow-md: 0 4px 8px rgba(26, 25, 23, 0.08);
--shadow-lg: 0 12px 24px rgba(26, 25, 23, 0.12);

/* Motion */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--dur-fast: 150ms;
--dur-med: 250ms;

/* Ad-Slot CLS Prevention (Non-Negotiable) */
--ad-slot-1-height-mobile: 250px;    /* 300×250 */
--ad-slot-1-height-desktop: 90px;    /* 728×90 */
--ad-slot-2-height: 250px;           /* In-Content 300×250 */
--ad-slot-3-height: 600px;           /* Sidebar 300×600 */
```

**Ad-Slot CSS (in allen Tool-Layouts identisch):**
```css
.ad-slot {
  min-height: var(--ad-slot-height);
  background: var(--color-surface);    /* Subtle placeholder */
  border-radius: var(--r-md);
  display: none;                        /* Phase 1: hidden, Slot reserviert */
}
[data-ads-enabled="true"] .ad-slot {
  display: block;
}
```

**Why Non-Negotiable:** Ohne feste `min-height` explodiert CLS sobald AdSense-Skripte asynchron Inhalte nachladen → Lighthouse-Score fällt von 95+ auf ~70 in Phase 2. Feste Höhe + Placeholder-Background = Zero CLS beim Ad-Rollout.

### 5.5 Breakpoints

```
sm:  640px   /* Mobile Landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large Desktop */
```

### 5.6 Icon-Strategie (Pencil-Sketch via Recraft.ai)

**Tool:** Recraft.ai mit "Custom Style" trainiert auf 3-5 Referenz-Icons → konsistenter Look über Hunderte Generationen. Free-Tier 50 Icons/Tag.

**Master-Prompt-Template:**
```
A premium editorial pencil sketch of {OBJECT}.
Minimalist line drawing featuring beautifully textured, bold and expressive
graphite strokes. Very clean composition on a pure white background,
high contrast monochromatic. No heavy shading, focusing on the raw,
authentic texture of a soft graphite pencil. Centered, modern artistic
execution, bespoke and unique appearance.
```

**Workflow pro Tool:**
1. Icon-Prompt als JSDoc-Kommentar in Tool-Config-Datei (siehe Section 4.2)
2. Status-Checkboxes: `[ ] Pending → [ ] Generated → [ ] Delivered`
3. User generiert bei Recraft → speichert als PNG in `pending-icons/{slug}.png`
4. Build-Script konvertiert → WebP 160×160 Q=85 → `public/icons/tools/{slug}.webp`
5. Commit → Deploy

**Technische Spezifikation Icon:**
- **Format:** WebP, 80×80 CSS-Pixel (intern 160×160 für Retina)
- **Quality:** 85 (sweet-spot Qualität/Größe, ~3-6 KB pro Icon)
- **Position:** Zentriert über H1, 80×80 Desktop / 64×64 Mobile, 32px Abstand zum Titel
- **Loading:** `loading="eager"` (above-the-fold), `width`/`height` gesetzt → kein CLS
- **Alt-Tag:** `{tool.title}` in aktueller Sprache → Google Images SEO
- **Fallback:** Wenn Icon fehlt → **nichts rendern** (keine Placeholder)

**Dark-Mode-Icons:** CSS-Filter `invert(0.92) brightness(1.05)` wandelt die achromatischen Pencil-Sketches → hellgraue Linien auf dunklem Grund. Kein hue-rotate (Pencil-Sketches sind monochrom → hue-rotate ist wirkungslos auf Graustufen-Pixeln). Kein zweiter Icon-Satz nötig. Falls bei Prototyp-Review optisch unsauber → Fallback = zweiter Icon-Satz mit invertiertem Master-Prompt (entscheiden bei Prototype-Review, OQ3).

### 5.7 Tool-Layout-Spec (Pixelgenau)

**Desktop (≥1024px):**
```
┌────────────────────────────────────────────┐
│  [Icon 80×80]                              │
│  # H1 Tool-Titel                           │
│  Tagline                                   │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  TOOL-UI (Input → Output)            │  │
│  │  (Svelte-Component pro Typ)          │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  [Ad-Slot 1: 728×90 Reserved Phase 1]      │
│                                            │
│  ## Intro-Abschnitt (~80 Wörter)           │
│                                            │
│  ## Wie benutzt du {tool}? (3-5 Steps)     │
│                                            │
│  ## SEO-Artikel (~400 Wörter, H2/H3)       │
│     [Ad-Slot 2: In-Content, nach 1. H2]    │
│                                            │
│  ## Häufige Fragen (4-6 FAQ)               │
│                                            │
│  ## Ähnliche Tools (3-5 Karten)            │
│                                            │
│  [Ad-Slot 3: Sidebar-Sticky 300×600        │
│     Desktop only]                          │
└────────────────────────────────────────────┘
```

**Ad-Slots (Phase 1 leer reserviert, Phase 2 aktiviert):**
- Slot 1: unter Tool, volle Breite, 300×250 Mobile / 728×90 Desktop
- Slot 2: In-Content, nach 1. H2 (nur wenn seoArticle > 500 W)
- Slot 3: Sidebar-Sticky, 300×600, Desktop-only

---

## 6. Search Architecture (Pagefind)

### 6.1 Index-Struktur

```
/pagefind/
  ├── pagefind-entry.json        # Sprache-Registry
  ├── de/                        # ~10 MB chunked à ~100 KB
  │   ├── fragments/
  │   └── index/
  ├── en/
  └── ... (70 Sprachen)
```

Ein **separater Index pro Sprache** → kein 70-sprachiger Mega-Blob. Pagefind lädt nur benötigte Chunks (~100-200 KB pro Query).

**Build-Integration:** Nach Astro-Build → `npx pagefind --site dist --glob "**/*.html"`.

### 6.2 UI-Component (Svelte Island)

**Position:** Sticky Header, zentral.

**Trigger:**
- Click auf Search-Bar → Modal
- `Cmd+K` / `Ctrl+K` → Modal
- `/`-Taste → fokussiert Inline-Suche
- `Esc` → schließt

**Modal-Features:**
- Instant-Results (50ms Debounce)
- Match-Highlighting mit **Graphit-Underline** (nicht Gelb-Highlight — Brand-Kohärenz)
- Kategorie-Gruppierung (max 5 pro Kategorie, "5 weitere"-Link)
- Tool-Type-Badge neben jedem Treffer
- Keyboard-Navigation: ↑↓ Einträge, ↵ Öffnen, Tab zwischen Kategorien
- Recent Searches (localStorage, letzte 5)
- "Populäre Tools"-Fallback wenn Query leer

**Hydration:** `client:idle` → Search-Bar rendert sofort als statisches Input, Pagefind-JS lädt nach LCP.

### 6.3 Indexierungs-Markup

```html
<article data-pagefind-body>
  <h1 data-pagefind-meta="title">Meter zu Fuß Konverter</h1>
  <div data-pagefind-meta="category:Längen"></div>
  <div data-pagefind-meta="type:Konverter"></div>
  <div data-pagefind-meta="popularity:97"></div>
  <p data-pagefind-meta="description">...</p>
  <div data-pagefind-filter="category[]">Längen</div>

  <section data-pagefind-index>[Content]</section>
  <section data-pagefind-ignore><ToolComponent /></section>
</article>
```

**Ranking-Boost:** `popularity`-Meta:
- **Initial (Phase 1-2):** 50 (neutral) für alle Tools — keine manuelle Pflege
- **Ab Phase 2+Soft-Launch:** automatische Aktualisierung via `scripts/update-popularity.ts` (nightly CI-Job, zieht CF-Web-Analytics-Export, mapped Page-View-Counts auf Tool-Slugs, schreibt normalisiert 0-100)
- Popularity ist SEO-Signal + Sort-Order in Category-Pages + Fallback-Liste in Search-Modal

### 6.4 Sprach-Scope

User auf `/de/...` → sucht nur im `de/`-Index. **Kein Cross-Language-Search**. Sprachwechsel behält Query bei (kann in neuer Sprache weitergesucht werden).

### 6.5 Offline-Search (PWA-Integration)

Service Worker cached `/pagefind/{lang}/` der User-Sprache bei erstem Besuch → komplette Suche funktioniert offline. Strategy: `stale-while-revalidate`.

### 6.6 Build-Impact (realistische Werte)

| Metrik | Wert |
|--------|------|
| Pagefind-Index-Zeit (alle 70 Sprachen) | **35-140 Min** (Pagefind indiziert ~500-2000 Seiten/Min) |
| Index total (70 Sprachen) | ~600-800 MB |
| Pro-Sprache-Index | ~10-12 MB |
| Initial Search-Load | ~150 KB JS + 100 KB Index-Chunk |

**Konsequenz:** Ein Full-Pagefind-Rebuild aller 70 Sprachen läuft **nur lokal via Pfad B**, niemals in GitHub Actions. Inkrementelles Indexing pro Sprache (`--incremental` + Sprachpfad-Glob) ist Pflicht für CI-taugliche Builds: dann ~1-3 Min pro Sprache in einer typischen CI-Session.

**File-Count-Konsequenz:** Pagefind erzeugt viele kleine Fragment-Files → verschärft das CF-Pages-20k-File-Limit. Deswegen Auslagerung auf R2 (siehe 3.3 Option A) oder Multi-Project-Split. Index-Delivery via Worker-Proxy zu R2 ist transparent für Clients.

---

## 7. PWA Architecture

### 7.1 Caching-Strategien

| Asset-Typ | Strategy | Rationale |
|-----------|----------|-----------|
| HTML-Seiten (Tools) | NetworkFirst (3s Timeout, Cache-Fallback) | Content änderbar, Offline-Fallback |
| JS/CSS Bundles | CacheFirst (Content-Hash = immutable) | Cache forever |
| Icons (WebP) | CacheFirst (max 500, 30 Tage) | Offline kritisch |
| Pagefind-Index | StaleWhileRevalidate (user-lang only) | Offline-Search + Updates |
| Fonts | CacheFirst (1 Jahr) | Self-hosted, versioniert |
| Cross-Language HTML | NetworkOnly (kein Precache) | Sonst explodiert Storage |

### 7.2 Precache vs Runtime-Cache

**Precache (beim Install, ~2-3 MB):**
- App-Shell (Header, Footer, Navigation)
- CSS/JS Core-Bundles
- `/offline.html`
- App-Icons (192, 512, maskable)
- Aktuelle Sprach-Homepage + Kategorie-Indexe

**Runtime-Cache (lazy):**
- Individuelle Tool-Seiten
- Tool-Icons
- Pagefind-Chunks

**Storage-Budget:** ~50 MB typisch, max ~100 MB, Browser evictet via LRU.

### 7.3 Offline-UX

Bei Verbindungsverlust auf nicht-gecachter Seite → `/offline.html` listet gecachte Tools + erlaubt Suche in gecachten Tools.

Bereits besuchte Tools funktionieren 100% offline (Tool-Logik ist komplett client-side).

### 7.4 A2HS (Add-to-Homescreen) Install-Prompt

**Nicht-aufdringlich:**
- Kein sofortiges Popup
- **Trigger:** nach 3. Besuch ODER 60s Aktivität
- Bottom-Banner, dismissible, niemals blocking
- 30-Tage-Cooldown nach Dismiss (localStorage)

### 7.5 Web App Manifest

**Pro Sprache eigenes Manifest:**
```json
{
  "name": "[Brand] — Konverter & Rechner",
  "short_name": "[Brand]",
  "start_url": "/de/",
  "display": "standalone",
  "background_color": "#FAFAF9",
  "theme_color": "#3A3733",
  "icons": [
    { "src": "/icons/app-192.webp", "sizes": "192x192", "type": "image/webp" },
    { "src": "/icons/app-512.webp", "sizes": "512x512", "type": "image/webp" },
    { "src": "/icons/app-maskable.webp", "sizes": "512x512", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Suche", "url": "/de/?search=open" },
    { "name": "Populäre Tools", "url": "/de/populaer" }
  ]
}
```

### 7.6 Update-Strategie

`skipWaiting: false` + Update-Toast beim Bereitstehen einer neuen Version → User-kontrolliert, kein Force-Reload.

### 7.7 Bewusste Nicht-Features

- Keine Push-Notifications (irrelevant, nervig)
- Kein Background-Sync (keine Server-Writes)
- Kein App-Store-Deployment (PWA reicht, keine Store-Tax)

---

## 8. Content Pipeline

### 8.1 Content-Blöcke pro Tool (8 Blöcke)

| # | Block | Zweck | Länge |
|---|-------|-------|-------|
| 1 | `title` | H1, `<title>` | 30-60 Zeichen |
| 2 | `metaDescription` | SEO Snippet | 140-160 Zeichen |
| 3 | `tagline` | Untertitel | 1 Satz |
| 4 | `intro` | Lead-Paragraph | 40-80 Wörter |
| 5 | `howToUse` | Step-by-Step | 3-5 Steps |
| 6 | `seoArticle` | Haupt-Content | ~400 Wörter, H2/H3 |
| 7 | `faq` | FAQ-Block + JSON-LD | 4-6 Q&A |
| 8 | `relatedTools` | Manuell in Config | 3-5 Tool-Slugs |

**400-Wörter-Sweetspot:** SEO-optimal für Konverter (zu kurz = thin, zu lang = User scrollt nicht). Answer-First-Struktur.

### 8.2 Storage-Format: Markdown + Frontmatter

```markdown
---
slug: meter-zu-fuss
toolId: meter-to-feet
language: de
title: Meter zu Fuß Konverter — Schnell & Genau
metaDescription: Wandle Meter in Fuß um. Kostenlos, ohne Anmeldung...
tagline: Präzise Längen-Umrechnung in Sekunden
intro: |
  Meter (m) und Fuß (ft) sind die weltweit gebräuchlichsten...
howToUse:
  - Gib den Wert in Meter ein
  - Ergebnis erscheint automatisch in Fuß
  - Tausch-Button für Umkehr-Umrechnung
faq:
  - q: Wie viele Fuß sind ein Meter?
    a: Ein Meter entspricht exakt 3,28084 Fuß...
relatedTools:
  - zentimeter-zu-zoll
  - kilometer-zu-meile
contentVersion: 1
---

## Was ist ein Meter?
[...400 Wörter SEO-Text...]
```

**Why Markdown + Frontmatter:** Astro Content-Collections nativ, Zod-validated, Git-Diff-freundlich, klare Trennung Struktur vs Prose.

### 8.3 Session-Typen

**Typ A — DE-Batch (Phase 2):** 5-10 thematisch verwandte Tools, Single-Pass Draft nach CONTENT.md + optional Audit-Stichprobe (2 Tools pro Batch via `npm run content:audit`). Commit auf Feature-Branch. ~6-8 Min/Tool → 10 Tools in 60-80 Min in 5h-Session.

**Typ B — Translation (Phase 3):** Pivot-Strategie DE → EN → alle anderen. 20-30 Tools pro Session, Glossary-gelockt via `TRANSLATION.md`.

**Typ C — Unique-Tools:** 1 Tool pro Session wegen höherer Komplexität (Regex-Visualizer, Impressum-Generator).

### 8.4 Content-Generation-Strategie (Single-Pass + Optional Audit)

**Default: Single-Pass** (~6-8 Min/Tool). `CONTENT.md` ist so präzise formuliert, dass alle SEO/Heading/FAQ/Tone-Regeln in einem Pass eingehalten werden. Zod-Schema-Validation fängt strukturelle Fehler automatisch ab.

**Optional: Audit-Pass** (`npm run content:audit`) — läuft als Batch-Job über N zufällige oder gezielt geflaggte Tools. Findet:
- Tone-Drift gegen CONTENT.md
- Über-/Unter-Wortzahl
- FAQ-Qualitäts-Issues (zu generische Antworten)
- Keyword-Density-Ausreißer

**Trigger für Audit-Pass:**
- Nach jedem Batch (5-10 neue Tools) Stichprobe von 2 Tools auditen
- Bei Content-Version-Bump: alle betroffenen Tools
- Manuell vor Soft-Launch: alle Tools einmal durch

**Why Single-Pass statt Multi-Pass:** 3-Pass × 200 Tools = ~37h vs Single-Pass × 200 Tools = ~20h → der Multi-Pass-Overhead multipliziert die Session-Belastung ohne proportional-bessere Qualität, wenn CONTENT.md gut geschrieben ist. Audit-Pass als Stichprobe liefert die Qualitätssicherung kosteneffizient.

### 8.5 Quality-Gates (im Build)

| Gate | Check | Fail-Action |
|------|-------|-------------|
| Struktur | Alle 8 Blöcke? (Zod) | Build-Abbruch |
| Wortzahl | seoArticle 350-450? | Warnung |
| Heading | Kein H3 ohne H2? | Warnung |
| FAQ-Count | 4-6 Einträge? | Warnung |
| Keyword-Density | 0.8-1.5% im Body? | Warnung |
| relatedTools | Slugs existieren? | Build-Abbruch |
| Tone | Claude self-review gegen CONTENT.md | Audit-Pass via `npm run content:audit` (Stichprobe 2 Tools pro Batch + alle vor Soft-Launch) |

Script: `scripts/content-lint.ts`, integriert in `npm run build`.

### 8.6 Content-Change-Management

Versionierung via `contentVersion`-Frontmatter. Build erkennt outdated Files → Batch-Migration-Session.

### 8.7 Explizite Nicht-Features

- Keine dynamischen Content-Fetches
- Kein UGC (DSGVO-Minefield)
- Kein externes CMS (over-engineered)

---

## 9. Build & Deploy Pipeline

### 9.1 Build-Phasen (zwei Profile: Incremental vs Full)

**Incremental Build** (typisch in CI, Pfad A) — eine Sprache oder Tool-Subset:
1. Content-Validation (nur geänderte Files) — ~10s
2. Tool-Config-Validation — ~5s
3. Icon-Existence-Check — ~5s
4. Astro Build (incremental, eine Sprache) — ~2-5 min
5. Pagefind Index (inkrementell, `--incremental` Flag für geänderte Sprache) — ~1-3 min
6. PWA Service-Worker — ~30s
7. Sitemap-Update (partiell) — ~15s
8. Optimization (nur neue Assets) — ~30-60s

**Total Incremental:** ~4-10 Min ✓ passt in CI.

**Full Build** (nur lokal via Pfad B) — alle 70 Sprachen, 70k Seiten:
1. Content-Validation (alle) — ~2 min
2. Tool-Config-Validation — ~30s
3. Icon-Existence-Check — ~15s
4. Astro SSG (70 Sprachen × Tools) — **~30-60 min** (70k statische Seiten generieren ist rechenintensiv)
5. Pagefind Index (full) — **~35-140 min** (je nach Content-Volume)
6. PWA Service-Worker-Precache-Manifest — ~2 min
7. Sitemap-Index + 70 Sitemap-Files + Hreflang — ~3 min
8. Optimization + Upload-Preparation — ~5-10 min

**Total Full:** **~75-220 Min** — läuft NIE in CI, nur Pfad B lokal, typischerweise über Nacht.

### 9.2 Two-Way-Deploy (konkretisiert)

**Pfad A — GitHub Actions → CF Pages (Auto-Deploy):**
- **Scope:** Änderungen an 1 Sprache oder ≤100 Tool-Files
- **Dauer:** 4-10 Min
- **Timeout:** `timeout-minutes: 15` (Safety-Margin vor CF-20-Min-Limit)
- **Bei Fail:** Workflow bricht ab, Developer fällt auf Pfad B zurück

**Pfad B — Lokaler Wrangler-Deploy:**
- **Scope:** Full-Rebuild, neue Sprache-Rollout, Design-System-Change, Content-Migration
- **Dauer:** 75-220 Min + 5-15 Min Upload zu CF Pages
- **Command:** `npm run build:full && npx wrangler pages deploy dist --project-name=konverter`
- **Pre-Flight-Check:** File-Count validieren (`scripts/check-file-count.ts`) — warnt bei ≥18.000 Files (CF-20k-Limit)

**Wichtig:** Pfad B schreibt nach Abschluss `dist/` nicht nach Git (das wäre Gigabytes). Nur `wrangler pages deploy` pusht den Build-Output direkt zu CF Pages. Source-Code bleibt in Git, Build-Output ist transient.

### 9.3 GitHub Actions Workflow

```yaml
name: Deploy
on:
  push: { branches: [main] }
  pull_request:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15   # Safety-Margin vor CF-20-Min-Build-Limit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: Content-Lint
        run: npm run lint:content

      # CI baut standardmäßig inkrementell — nur geänderte Sprache(n) ins Astro-Build
      # und Pagefind-Index. Für Full-Rebuild (Sprachen-Rollout, Design-Change) Pfad B nutzen.
      - name: Determine Build-Scope
        id: scope
        run: scripts/determine-build-scope.sh   # setzt $BUILD_LANGS Env (z.B. "de" oder "de,en")

      - name: Astro Build (incremental)
        run: npm run build -- --lang=${{ steps.scope.outputs.langs }}
        env: { NODE_OPTIONS: --max-old-space-size=4096 }

      - name: Pagefind Index (incremental)
        run: npx pagefind --site dist --glob "${{ steps.scope.outputs.langs }}/**/*.html" --incremental

      - name: Pre-Flight File-Count-Check
        run: scripts/check-file-count.ts   # warnt bei ≥18.000 Files, abort bei ≥19.500

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: konverter
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 9.4 Feature-Branch-Workflow (GitHub Flow)

- 1 Branch = 1 Tool-Familie / 1 logische Einheit
- Preview-URL pro PR: `feat-laengen.konverter.pages.dev`
- Merge → Auto-Deploy Production
- Kurzlebige Branches, merge-frequent

### 9.5 Icon-Asset-Pipeline

```
pending-icons/{slug}.png
     │  (npm run icons:build)
     │  sharp: Resize 160×160, WebP Q=85
     ▼
public/icons/tools/{slug}.webp   (committed)
```

Script: `scripts/build-icons.ts`. User dropt PNGs, Script konvertiert, User committed.

### 9.6 Sitemap-Strategie (70k URLs)

Sitemap-Index + pro-Sprache-Sitemap (max 50k pro File):

```
/sitemap-index.xml
  ├── /sitemaps/de.xml   (~1000 URLs)
  ├── /sitemaps/en.xml
  └── ... (70 Files)
```

Hreflang-Tags per Sitemap-Entry + im HTML-Head.

### 9.7 Environments

| Env | URL | Branch | Ads | Analytics |
|-----|-----|--------|-----|-----------|
| Local | localhost | any | off | off |
| Preview | *.pages.dev | feat/* | off | off |
| Production | konverter.app | main | P1: off, P2: on | on |

### 9.8 Feature-Flags

```
PUBLIC_ADS_ENABLED=false          # Phase 1 default
PUBLIC_ANALYTICS_ENABLED=true
PUBLIC_CLARITY_ID=                # Phase 2
```

### 9.9 Deploy-Checklist

`.github/DEPLOY_CHECKLIST.md`:
```
[ ] Lokaler Build durch (npm run build)
[ ] Content-Lint passes (npm run lint:content)
[ ] Icon-Check: keine "pending" Tools aktiv
[ ] Preview-Deploy visuell gecheckt (Mobile + Desktop)
[ ] Hreflang-Check (Script)
[ ] Sitemap regeneriert
[ ] Lighthouse-Score ≥ 95 auf Sample-Pages
[ ] PROGRESS.md aktualisiert
[ ] Git: pkcut-lab als Committer? (git config user.email)
```

**Pre-Commit-Hook (husky):** Email-Check + Lint.

### 9.10 Rollback

CF Pages speichert alle historischen Deploys → 1-Click-Rollback im Dashboard. Danach Git-Revert für Hygiene.

### 9.11 Monitoring

**Phase 1:** CF Web Analytics, CF Pages Deploy-Notifications, GitHub Actions Status.

**Phase 2:** + MS Clarity (Heatmaps), AdSense-Dashboard, CF Logpush bei Bedarf.

**Kein:** Sentry, Datadog, New Relic (over-engineered).

---

## 10. Continuity Infrastructure (6 Rulebooks)

Im Workspace-Root, committed in Git. Jede Session liest zu Beginn.

### 10.1 Session-Ritual (Enforced via Pre-Commit-Hook)

**Start (60 Sek):**
1. `PROGRESS.md` lesen
2. `PROJECT.md` check
3. Task-relevante Rulebooks lesen (`CONVENTIONS.md`, `STYLE.md`, `CONTENT.md`)
4. `git config user.email` verify → muss `pkcut-lab` sein
5. Task beginnen

**Ende (60 Sek):**
1. `PROGRESS.md` updaten — genau welche Tools in welchem Zustand
2. Git-Commit auf Feature-Branch mit Commit-Trailer `Rulebooks-Read: <gelesene Rulebooks>`
3. Stop

**Enforcement:** `scripts/check-session-ritual.ts` läuft als Pre-Commit-Hook (husky). Prüft:
- Commit-Message enthält Trailer `Rulebooks-Read: ...` mit min. PROJECT + CONVENTIONS
- Content-Commits enthalten zusätzlich `CONTENT`
- Übersetzungs-Commits enthalten zusätzlich `TRANSLATION`
- Style-/Design-Commits enthalten zusätzlich `STYLE`

Ohne Trailer → Commit-Abbruch mit Fehler-Output, der auf dieses Ritual hinweist.

**Beispiel-Commit:**
```
feat(tools): Add meter-zu-fuss converter

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT
```

**Why:** In Session #47 reicht "ich erinnere mich an Konventionen" nicht — Claude muss die Rulebooks tatsächlich gelesen haben, bevor dieser Turn committen darf. Der Hook ist die maschinen-lesbare Version des Session-Rituals.

### 10.2 `PROJECT.md` — Tech-Stack-Snapshot

Gelockte Versionen (Node, Astro, Svelte, Tailwind, Plugins). Dependencies werden NICHT silent upgedated — Bumps brauchen eigenen `chore/bump-{package}`-Branch + Re-Validate auf 3 Sample-Tools.

### 10.3 `CONVENTIONS.md` — Code-Patterns

- File-Layout (Paths pro Tool)
- TypeScript-Config-Schemas für alle 9 Tool-Typen (Converter, Calculator, Generator, Formatter, Validator, Analyzer, Comparer, File-Tool, Interactive)
- Naming: Slugs kebab-case, Tool-IDs camelCase, Zod-validated Props
- Error-Handling: `{ ok, value, error }`-Result-Type
- Testing: Unit-Tests pro Typ + Integration-Smoke-Test
- Commit-Format: Conventional Commits
- Svelte: Runes-only, keine Stores-Mix
- CSS: Tailwind Utility-First, Custom-CSS nur in `tokens.css`
- Verboten: `any`, `@ts-ignore`, Default-Exports für Tool-Configs

### 10.4 `STYLE.md` — Visual-Regeln

Alle Design-Tokens aus Section 5 + Tool-Layout-Spec (pixelgenaue Wireframe-Beschreibung).

### 10.5 `CONTENT.md` — SEO-Schreibstil (Deutsche Master)

**Tone-of-Voice:**
- Sachlich, präzise, keine Marketing-Floskeln
- Kein "wir" / "unser Tool"
- Anrede Du (informell)
- Aktive Sätze, kurze Hauptsätze

**Blacklist-Phrasen:** "Willkommen bei...", "In diesem Artikel...", "Jetzt noch nie war es so einfach...", "Mit unserem praktischen Tool...", Superlativ-Spam ("der beste", "ultimativ").

**SEO-Artikel-Struktur (400 W, gelockte H2):**
```
## Was ist {EinheitA}?       (~80 W)
## Was ist {EinheitB}?       (~80 W)
## Umrechnungsformel         (~60 W + Formel)
## Häufige Umrechnungen      (~60 W + Tabelle)
## Wo wird {EinheitB} verwendet?  (~80 W)
## Geschichte (optional)     (~40 W)
```

**FAQ-Style:** Direkte Frage, Antwort erster Satz = direkte Zahl, dann 1-2 Sätze Kontext.

**Zahlen-Notation:** `,` DE, `.` EN; Einheit mit Space (`3,28 m`).

### 10.6 `TRANSLATION.md` — Übersetzungsregeln (Phase 3)

- Sprachfamilien-Ton (Germanische Du, Slawische Sie, CJK höflich-neutral, Arabisch MSA)
- Gelocktes Glossar ~50 Kern-Begriffe pro Sprache
- Kultur-Hinweise (RTL, Script, Zahlenformate)
- Regionalisierung (DE: "Fuß" nicht "Fuss", EN: en-US Default, PT: pt-BR Default, ES: es-ES Default)

### 10.7 `PROGRESS.md` — Status-Tracker

Pro Tool Status-Matrix: Config/Content-DE/Icon/Tests je `✅`, `🟡`, `⬜`.

Pro Session: Next-Session-Plan, Blockers, Deploy-History.

---

## 11. Internationalization

### 11.1 Sprach-Scope (gestuft, max 30)

**Launch-Set (Phase 1-3):**
| Stage | Sprache | Begründung |
|-------|---------|------------|
| Phase 1-2 | **DE** | Heimatmarkt, höchster AdSense-CPC in Europa, User kann Qualität Muttersprachlich prüfen |
| Phase 3 | **EN** | Größter globaler Markt, Pivot-Basis für alle weiteren Übersetzungen |
| Phase 3 | **ES** | 500M+ Sprecher, wenig Tool-Konkurrenz, guter CPC (Spanien + LatAm-Sekundär) |
| Phase 3 | **FR** | Hoher CPC (FR/BE/CH/CA), Bonus-Traffic aus Westafrika |
| Phase 3 | **PT-BR** | Größter Einzelmarkt Südamerika, überraschend guter CPC |

**Expansion-Set Phase 5 (High-CPC-Cluster, +8 Sprachen → 13 total):**
JA, KO, NL, SV, IT, PL, TR, NO — Länder mit hoher Kaufkraft und wenig lokalisierter Tool-Konkurrenz.

**Expansion-Set Phase 6 (max 30 total):**
Auswahl aus ZH-CN, HI, AR, RU, VI, ID, TH, BN, DA, FI, CS, GR, RO, HU, UK, HE, + evtl. regionale (SR, HR, BG). Finale Auswahl datengetrieben nach Phase-5-Performance.

**Bewusst NICHT im 30-Scope:** Minor-Afrikanische Sprachen (Swahili/Amharisch/Hausa), Minor-Südostasiatische — zu wenig CPC-Return vs Übersetzungsaufwand. Kann in Phase 7+ reevaluiert werden, wenn ML-gestützte Übersetzung für Long-Tail-SEO verfügbar wird.

**Entry-Gate-Kriterien (Phase 5 & 6):**
1. Revenue-Schwelle: > 2.000 €/Monat vor Phase 5, > 5.000 €/Monat vor Phase 6
2. Google Search Console zeigt keine Crawl-/Indexing-Anomalien
3. Phase 6 zusätzlich: R2-Bucket + Worker-Proxy für Pagefind implementiert (siehe 3.3)

### 11.2 URL-Struktur

```
konverter.app/de/meter-zu-fuss
konverter.app/en/meters-to-feet
konverter.app/es/metros-a-pies
konverter.app/zh/mi-dao-chi         (Pinyin, Content Chinesisch)
konverter.app/ja/me-to-ru-kara-fu-to  (Romaji, Content Japanisch)
```

### 11.3 Hreflang-Tags

Jede Seite hat `<link rel="alternate" hreflang="..." href="...">` für alle aktiven Sprach-Äquivalente + `x-default` → Signal an Google über Sprachversionen. Phase 3: 5 Einträge, Phase 5: 13, Phase 6: bis 30.

Sitemap enthält zusätzlich `<xhtml:link>` pro Language-Variante.

### 11.4 Language-Switcher

Header-Dropdown, zeigt alle aktuell aktiven Sprachen (5 in Phase 3, 13 in Phase 5, bis 30 in Phase 6), sortiert nach: aktuelle Sprache → Browser-Accept-Languages → alphabetisch. `client:load` (muss sofort funktionieren).

Route-Mapping via `slug-map.ts` → behält aktuellen Tool-Kontext beim Sprachwechsel.

### 11.5 Translation-Pipeline (Phase 3, reduzierter Scope)

**Phase 3a (1-1.5 Wochen):** DE → EN Pivot komplett aufbauen
**Phase 3b (2-2.5 Wochen):** EN → ES, FR, PT-BR parallel

**Total Phase 3:** 3-4 Wochen (statt 8-12 bei 70 Sprachen).

**Phase 5 (später, nach Revenue-Gate):** EN → JA, KO, NL, SV, IT, PL, TR, NO → +3-4 Wochen zusätzlich.

**Phase 6 (später):** EN → bis 17 weitere Sprachen → datengetrieben, je nach Revenue-Wachstum in Phase 5.

### 11.6 RTL-Support

Für Arabisch, Hebräisch, Persisch: `dir="rtl"` auf `<html>`, Layout-Flip via CSS-Logical-Properties (`margin-inline-start` statt `margin-left`).

---

## 12. SEO Strategy

### 12.1 On-Page SEO

- **Unique Title + Meta pro Tool pro Sprache**
- **H1 = Tool-Name**, H2/H3-Hierarchie eingehalten
- **Strukturierte FAQ** mit `schema.org/FAQPage` JSON-LD
- **Tool = `schema.org/WebApplication`** mit `applicationCategory`
- **Breadcrumb-JSON-LD** für Kategorie-Kontext
- **OG-Tags + Twitter-Cards** pro Seite mit Tool-Icon als Preview

### 12.2 URL-Quality

- Kurze Slugs (`meter-zu-fuss` nicht `wandle-meter-in-fuss-um`)
- Keine URL-Parameter für Tool-State (alles client-side)
- Lowercase, kebab-case, ASCII-only
- Trailing Slash konsistent (optional, Entscheidung in Phase 0)

### 12.3 Core Web Vitals Targets

- **LCP:** < 1.5s (P75)
- **FID/INP:** < 100ms
- **CLS:** < 0.05
- **Lighthouse:** ≥ 95 auf allen Core Pages

Enforcement: CI-Integration mit `@lhci/cli` auf 3 Sample-Routes pro Build.

### 12.4 Internal Linking

- `relatedTools` pro Tool-Config (3-5 kuratiert)
- Kategorie-Seiten linken alle Tools
- Home-Page linkt Top-50 populärste Tools
- Footer linkt Kategorie-Index

### 12.5 Keine Negativ-Praktiken

- Kein Thin-Content (< 300 W wird abgelehnt)
- Kein Duplicate-Content zwischen Sprachen (echte Übersetzung, nicht Copy)
- Kein Keyword-Stuffing (0.8-1.5% Density enforced)
- Keine hidden Links oder Doorway-Pages

---

## 13. Monetization Strategy

### 13.1 Phase 1 — Keine Ads

**Zielstand:**
- Ad-Slots in Layout vorhanden, aber leer (CSS `display: none` hinter `PUBLIC_ADS_ENABLED=false`)
- Kein Cookie-Banner nötig (Cloudflare Analytics = cookie-frei)
- Keine Privacy-Policy-Pflicht für erste Tools
- Impressum? Nur Kontakt-Form-Minimum, keine Adresse (Kleingewerbe/Postlagerung erst in Phase 2)

**Why:** Baseline ohne Rechts-Komplexität, User-Vertrauen durch Ad-freie Experience, Traffic-Aufbau.

### 13.2 Phase 2 — AdSense Rollout

**Voraussetzungen:**
1. Kleingewerbe + Kleinunternehmer-Regelung angemeldet (User-Task)
2. Postlagerungsdienst für Impressum-Adresse
3. Impressum (§5 TMG) pro Sprache
4. Datenschutzerklärung pro Sprache — inkl. expliziter Eintrag zu ML-Worker-Fallback (transient processing, siehe Non-Negotiable #7a), falls solche Tools bis dahin live sind
5. Cookie-Consent-Banner (selbst gebaut, DSGVO-konform, minimal)
6. AdSense-Account + Approval (Wochen)

**Rollout:**
- `PUBLIC_ADS_ENABLED=true`
- MS Clarity aktiviert (Heatmaps für Ad-Positionierung)
- A/B-Testing Ad-Platzierungen

### 13.3 Ad-Placement-Strategie

**Drei Slots (siehe Section 5.7):**
1. Nach Tool: 728×90 (Desktop) / 300×250 (Mobile)
2. In-Content nach 1. H2 (nur wenn seoArticle > 500 W)
3. Sidebar-Sticky 300×600 (Desktop only)

**Grenzen:** Max 3 Ad-Einheiten pro Seite (Google-Policy-konform, UX-respectful).

### 13.4 Alternative Revenue-Streams (Future)

- Direct-Sponsoring bestimmter Kategorien (z.B. "gesponsert von {Firma}")
- Premium-Tier? (Batch-Conversion, API-Access) — nur wenn Traffic > 100k/Monat rechtfertigt

---

## 14. Prototype Plan

Phase 0 enthält **zwei Prototypes**, weil File-Tool-UI und Number-Converter-UI grundverschieden sind und jeweils als Template für ihre Tool-Typ-Familie dienen.

### 14.1 Prototype 1 — WebP Konverter (File-Tool-Pattern)

**Warum zuerst:** Direkter Dogfood-Wert — User kann PNG/JPG-Icons aus Recraft.ai sofort zu WebP konvertieren für die eigene Icon-Pipeline.

**Funktionalität:**
- Drop-Zone für PNG/JPG (einzeln oder mehrere)
- Options-Panel:
  - Quality-Slider (0-100, Default 85)
  - Resize-Optionen (Custom / Preset: 80px, 160px, 320px, 640px)
  - Aspect-Ratio-Lock (Checkbox, Default on)
  - Strip-Metadata-Checkbox (Privacy-Option)
- Preview: Before/After mit File-Size-Vergleich
- Download-Button (einzeln) / ZIP-Download (Batch)
- Progress-Bar für jede Datei
- 100% Client-Side (Canvas `toBlob('image/webp', quality)`)

**UI-Pattern (etabliert FileTool.svelte Template):**
```
┌──────────────────────────────────────────┐
│  [Icon 80×80]                            │
│  # WebP Konverter                        │
│  Wandle PNG/JPG in WebP um — direkt im   │
│  Browser, 100% privat                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   📁 Dateien hier reinziehen       │  │
│  │      oder klicken zum auswählen    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Quality  [====●========] 85             │
│  Resize   [Original ▾]  [🔒] Aspect     │
│  [ ] Metadata entfernen                  │
│                                          │
│  ┌───────────────────────────────────┐   │
│  │ 📄 icon-meter.png → icon-meter.webp│  │
│  │    ████████░░ 80%  3.2 KB → 1.1 KB│   │
│  │    [Download]                     │   │
│  └───────────────────────────────────┘   │
│                                          │
│  [ Alle als ZIP herunterladen ]          │
│                                          │
│  ## Was ist WebP? (400 W SEO-Content)    │
│  ## Warum PNG/JPG → WebP?                │
│  ## Wie funktioniert dieses Tool?        │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Technische Umsetzung:**
- Canvas-API für Encoding (native Browser-Support)
- `FileReader` + `Blob` für File-I/O
- `JSZip` als Haupt-Dependency für Batch-Download (gebundelt, kein Runtime-Network-Call — konform zu Non-Negotiable #7)
- Web Worker für Encoding bei großen Files (> 5 MB)

### 14.2 Prototype 2 — Meter zu Fuß (Converter/Number-Pattern)

**Warum zweitens:** Standard-Template für 80% der späteren Tools (alle Unit-Converter, MwSt-Rechner etc.). Klassisches Number-Input-Pattern.

**Funktionalität:**
- Number-Input-Feld (Meter)
- Output-Feld (Fuß) — read-only, live-updated
- Tausch-Button (swap from/to)
- Kopieren-Button für Output
- Häufige Werte: 1, 10, 100, 1000 als Quick-Buttons

**UI-Pattern (etabliert Converter.svelte Template):**
```
┌──────────────────────────────────────────┐
│  [Icon 80×80]                            │
│  # Meter zu Fuß Konverter                │
│  Präzise Längen-Umrechnung in Sekunden   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Meter (m)              [         ] │  │
│  │                                    │  │
│  │         [ ⇅ Tauschen ]             │  │
│  │                                    │  │
│  │ Fuß (ft)   [3,28084]    [📋 Kopie] │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Häufige Werte: [1] [10] [100] [1000]    │
│                                          │
│  ## Was ist ein Meter?                   │
│  ## Was ist ein Fuß?                     │
│  ## Umrechnungsformel                    │
│  ## Häufige Umrechnungen (Tabelle)       │
│  ## Wo wird Fuß verwendet?               │
│  ## Häufige Fragen                       │
│  ## Ähnliche Tools                       │
└──────────────────────────────────────────┘
```

### 14.3 Review-Prozess

Nach jedem Prototype:
1. User reviewt lokal (npm run dev)
2. Feedback-Runde: Layout, Typografie, Interaktion, Mobile-Behavior
3. Iteration bis 100%
4. Pattern wird in `CONVENTIONS.md` + `STYLE.md` gelockt
5. Template-Component wird extrahiert für späteres Scaling

---

## 15. Launch Timeline

| Phase | Dauer | Sessions | Meilenstein |
|-------|-------|----------|-------------|
| **Phase 0** — Foundation | 1-2 Wochen | 6-10 | Leere Shell live, 6 Rulebooks, 2 Prototypes (WebP + Meter-zu-Fuß) approved |
| **Phase 1** — Template + Core | 3-5 Wochen | 20-30 | 50 Tools DE live, alle 9 Tool-Typen validiert, Search/PWA/SEO fertig |
| **Phase 2** — Content-Scale DE | 6-10 Wochen | 40-60 | 200-300 Tools DE komplett |
| **Soft-Launch** | 1 Woche | 3-5 | Stabile DE-Version, echte Nutzungsdaten |
| **Phase 3** — Translation (EN/ES/FR/PT-BR) | 3-4 Wochen | 20-30 | 5 Sprachen live, ~5.000 Seiten |
| **Phase 4** — Monetization | 2-3 Wochen | 8-12 | Ads live, Revenue-Tracking |
| **Total bis Revenue-Start** | **~4-6 Monate** | **~100-150 Sessions** | — |

**Realistic-Target:** Erste Revenue 5-7 Monate nach Start (Puffer für Iteration + AdSense-Approval-Delays).

**Expansion-Phasen (später, gate-gated):**

| Phase | Dauer | Entry-Gate | Meilenstein |
|-------|-------|------------|-------------|
| **Phase 5** — Expansion (+8 Sprachen) | 3-4 Wochen | Revenue > 2.000€/Mo + R2-Implementation | 13 Sprachen live, ~13.000 Seiten |
| **Phase 6** — Scale (bis 30 Sprachen) | 4-8 Wochen | Revenue > 5.000€/Mo + Phase-5-Stabilität | bis 30 Sprachen, ~30.000 Seiten |

Phase 5 & 6 werden nicht geplant bevor ihre Gates erfüllt sind — datengetrieben, nicht dogmatisch.

### 15.1 Parallele User-Tasks

- Icon-Generation in Recraft.ai (kontinuierlich, User-Pace)
- Domain-Entscheidung (spätestens Phase 2-Ende) — aktuell vertagt
- Kleingewerbe + Postlagerung anmelden (vor Phase 4)
- AdSense-Account anlegen (vor Phase 4)

---

## 16. Open Questions & Deferred Decisions

| # | Thema | Status | Entscheidungs-Deadline |
|---|-------|--------|------------------------|
| OQ1 | Domain-Name / Brand | Deferred (alle Kandidaten hatten Konflikte) | Phase 2-Ende (vor Launch-URL) |
| OQ2 | Trailing-Slash-Konvention in URLs | TBD | Phase 0 |
| OQ3 | Dark-Mode-Icon-Strategie: CSS-Filter vs 2. Icon-Satz | CSS-Filter `invert(0.92) brightness(1.05)` (Default), Fallback bei Prototyp-Review | Phase 0 Prototype-Review |
| OQ4 | Phase 3-Source: DE→Andere direkt oder DE→EN→Andere | DE→EN→Andere (Pivot-Strategie) | Phase 3-Start |
| OQ5 | Background-Remover: welches Client-Side-Modell? (u2net, remove.bg-API?) | TBD | Wenn Tool gebaut wird |
| OQ6 | Premium-Tier-Strategie | Nicht Phase 1-4 | Nach Traffic > 100k/Monat |
| OQ7 | ~~CF-Pages-20k-File-Limit~~ | **Entschieden v1.1:** R2-Bucket + Worker-Proxy für Pagefind-Index als Phase-5-Prerequisite (siehe 3.3). Phase 1-4 bleibt in CF Pages. | — (geschlossen) |
| OQ8 | ML-File-Tools: wann Worker-Fallback aktivieren? Device-Detection vs User-Toggle? | TBD wenn erstes ML-Tool gebaut wird (Background-Remover) | Phase 2 |

---

## 17. Success Criteria

Design gilt als erfolgreich umgesetzt wenn:

- [ ] **Phase 0:** Zwei Prototypes live auf localhost, Lighthouse ≥95, beide approved vom User
- [ ] **Phase 1:** 50 Tools DE live, alle 9 Tool-Typen validiert, Search/PWA/SEO-Infrastruktur production-ready
- [ ] **Phase 2:** 200-300 Tools DE, Core Web Vitals AAA auf 95% aller Seiten
- [ ] **Soft-Launch:** 7 Tage ohne kritische Bugs, >100 organic Sessions/Tag
- [ ] **Phase 3:** 5 Sprachen (DE/EN/ES/FR/PT-BR) live, hreflang-valid, kein Duplicate-Content
- [ ] **Phase 4:** AdSense approved, 3 Ad-Slots live (mit CLS-Tokens Zero-Shift), erste Revenue eingeht
- [ ] **Phase 5 (optional gate):** +8 Sprachen nach Revenue > 2.000€/Mo, R2-Migration durchgeführt
- [ ] **Phase 6 (optional gate):** bis 30 Sprachen nach Revenue > 5.000€/Mo

---

## 18. Non-Negotiables

Regeln die NICHT verhandelbar sind, auch wenn Druck zur Abkürzung entsteht:

1. **Session-Continuity:** Rulebooks werden befolgt, keine silent drifts
2. **Privacy-First:** Kein Tracking, kein File-Upload, keine Third-Party-Cookies ohne Consent
3. **Quality-Gates:** Build bricht ab bei fehlender Struktur — keine "wir fixen's später"
4. **Git-Account:** Nur `pkcut-lab` in diesem Workspace — `DennisJedlicka` ist verboten
5. **AdSense erst in Phase 2:** Keine Ads vor Legal-Setup
6. **Design-Approval vor Template-Extraction:** Beide Prototypes müssen stehen bevor skaliert wird
7. **Keine externen Network-Dependencies zur Runtime:** Alles client-side oder Build-time. Gebundelte NPM-Libraries (z.B. JSZip für File-Tool-Batch-Downloads) sind erlaubt — sie werden zur Build-Zeit in Client-Bundles integriert, es gibt zur Runtime keinen externen Network-Call.

   **7a. Eng-umrissene Ausnahme — ML-File-Tools:** Tools, die client-seitig nicht performant ausführbar sind (z.B. Background-Remover mit ML-Modell >10 MB), dürfen einen Cloudflare-Worker-Proxy als Fallback nutzen. **Verbindliche Bedingungen:**
   - (a) Client-Side-Pfad bleibt Default und funktioniert auf Desktop
   - (b) Worker ist Fallback **nur für Mobile-Devices** oder bei expliziter User-Wahl
   - (c) **Keine Speicherung** — Files nur im Arbeitsspeicher, sofortige Löschung nach Response, keine Logs mit File-Inhalt
   - (d) Worker auf eigener Subdomain (`api.konverter.app`), separate CORS-Policy
   - (e) **DSGVO-Eintrag Pflicht** in der Datenschutzerklärung: "transient processing im Arbeitsspeicher des Cloudflare-Workers, keine Speicherung, keine Weitergabe, gelöscht unmittelbar nach Response" — Aufgabe der Phase-2-Legal-Checkliste
   - (f) User-Hinweis im UI, wenn Worker aktiv: "Diese Verarbeitung läuft auf unserem Server (dein iPhone schafft es lokal nicht). Datei wird nicht gespeichert."

8. **Kein thin Content:** Jedes Tool hat seine 400 Wörter, keine Ausnahmen

---

## Appendix A — Glossar

- **Tool:** Ein einzelnes Konverter/Rechner/etc. — z.B. "Meter zu Fuß"
- **Tool-Typ:** Eine der 9 architekturellen Kategorien (Converter, Calculator, ..., File-Tool, Interactive)
- **Slug:** URL-Segment eines Tools, pro Sprache eigen (`meter-zu-fuss` / `meters-to-feet`)
- **Unique-Tool:** Eines der kuratierten 50 Tools mit Wettbewerbs-Differenzierung
- **Rulebook:** Eines der 6 Continuity-Files (`PROJECT.md`, `CONVENTIONS.md`, `STYLE.md`, `CONTENT.md`, `TRANSLATION.md`, `PROGRESS.md`)
- **Prototype:** Eines der zwei Referenz-Tools in Phase 0 (WebP Konverter + Meter zu Fuß)
- **Dogfood-Loop:** Wir nutzen unseren eigenen WebP-Konverter für die Icon-Pipeline der Site
- **Pfad A / Pfad B:** Die zwei Deploy-Strategien (CI-Auto vs Wrangler-Lokal)
- **Entry-Gate:** Harte Kriterien (Revenue, Infrastruktur) die erfüllt sein müssen, bevor eine Expansion-Phase gestartet wird
- **Launch-Set / Expansion-Set:** Launch-Set = 5 Sprachen (Phase 1-3), Expansion-Set = +8 (Phase 5) bzw. bis 30 (Phase 6)

## Appendix B — Referenzen

- **Astro Islands:** https://docs.astro.build/en/concepts/islands/
- **Pagefind:** https://pagefind.app/
- **@vite-pwa/astro:** https://vite-pwa-org.netlify.app/frameworks/astro.html
- **Cloudflare Pages Build Limits:** https://developers.cloudflare.com/pages/platform/limits/
- **WCAG AAA:** https://www.w3.org/WAI/WCAG2AAA-Conformance

---

**End of Specification. Ready for spec-document-reviewer.**
