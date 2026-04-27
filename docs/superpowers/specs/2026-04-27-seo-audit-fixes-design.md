---
date: 2026-04-27
status: approved (autonomous brainstorm — User-Vertrauen)
tags: seo, i18n, region-adaptive, audit, p0
spec-id: 2026-04-27-seo-audit-fixes
authors: pkcut-lab
---

# Spec — SEO Audit Fixes + Region-Adaptive Calculators (US/UK)

## 1. Kontext & Auslöser

Eingehender SEO-Audit (5 Sub-Agenten Deep-Dive, 30+ Punkte) deckt drei Klassen von Issues auf:

1. **Strategische Falsch-Lokalisierung (P0):** 5 EN-Tools versprechen Features (US-Steuersätze, multi-image PDF, Date-Picker), liefern aber das identische deutsche Tool. Google's „scaled-content / unhelpful-content"-Klassifikator straft sitewide.
2. **Mechanische SEO-Fehler (P0/P1):** Apex `noindex`, DEFAULT_LANGUAGE-Mismatch zwischen `hreflang.ts` und CF-Pages-Function, 45 EN-Files mit `## Häufige Fragen?`-Heading, fehlende Sitemap-hreflang-Alternates, hardcodierter `priceCurrency: 'EUR'` in JSON-LD auch auf EN-Seiten, Styleguide ohne `noindex`, Breadcrumb-Last-Item ohne `item:`-URL, Footer auf 8 Tools gecappt (65/73 nie verlinkt), 242 KB render-blocking CSS auf jeder Tool-Seite durch statische Tool-Component-Imports.
3. **Polish (P1):** Font-Fallback ohne `size-adjust`, JetBrains-Mono-Preload überflüssig, hardcodierte deutsche Alt-Texte in zwei Komponenten, `frontmatter.unit: "EUR"` in mehreren EN-Files, `pt-BR`-Casing für künftige Phase-3-Erweiterung.

Site ist **bereits live** (DE+EN). Audit-Empfehlung „Launch DE only" greift nicht mehr — laufender Schaden muss gestoppt werden.

## 2. Ziele

**Muss:**
- Stop-the-bleeding: alle P0-Items behoben, sitemap + hreflang signal-konsistent.
- Die 5 broken EN-Tools werden zu echten Region-Adaptive-Tools (US **und** UK) mit Auto-Adaptation aus `navigator.language` + Manual-Region-Toggle + LocalStorage-Persistence.
- Auto-Adaptation: Wechsel DE→EN landet US/UK-Nutzer auf einem Tool, das ihren Kontext kennt (Default = US wegen Marktgröße).
- 2 Feature-Upgrades (`unix-timestamp` mit Date-Picker, `jpg-to-pdf` mit Multi-Image-Reorder) — verbessern beide Sprachen.
- Performance-P0: 242 KB-CSS halbiert via dynamic-import.
- Alle P1-Items aus dem Audit, sofern nicht in §10 (Out-of-Scope).
- Nichts brechen: alle bisherigen 1853 Tests bleiben grün.
- Final-Verification: erneuter Audit-Lauf bestätigt 0 verbleibende P0/P1.

**Soll:**
- US/UK-Nutzer finden die 3 Calculator-Tools über google.com / google.co.uk und erkennen sofort, dass das Tool ihren Markt versteht.
- DE-Tools bleiben unverändert in Verhalten und Visual.
- Hard-Caps aus CLAUDE.md eingehalten: Refined-Minimalism, Graphit + Orange, Tokens-only in Components, kein Tracking, pure-client.

**Nicht-Ziel:**
- Komplett neue Tool-Konzepte (z.B. dedizierter „US Federal Tax Calculator").
- pt-BR / es / fr Sprachen ausrollen (Phase 3 später).
- Tool-Icons / Hero-Images bauen (eigenes Backlog-Item).

## 3. Strategische Entscheidungen (User-bestätigt)

| # | Entscheidung | Begründung |
|---|---|---|
| 1 | **Spur A erweitert** auf US **und** UK, nicht nur US. | User-Vorgabe. Englisch-Audience ist nicht US-monolithisch — UK-VAT-Searches sind eigenes Cluster. |
| 2 | **Auto-Adaptation per Region-Selector**, nicht per separate Slug. Eine `/en/<slug>` Seite, die intern via Region-State umschaltet. | User-Wunsch „automatisch anpassen". Eine Slug = eine ranking-Page für beide Audiences. JSON-LD und Page-Title bleiben region-neutral, content adressiert beide. |
| 3 | **3 echte Locale-Varianten** (`vat`, `gross-net`, `interest`) bekommen US+UK-Logik. **2 Feature-Gaps** (`unix-timestamp`, `jpg-to-pdf`) sind keine Locale-Probleme — Feature-Upgrades für alle Sprachen. | Audit hat unix-timestamp und jpg-to-pdf falsch als Locale-Issue klassifiziert. Code zeigt: Tools sind UI-seitig unterbaut, nicht falsch-lokalisiert. |
| 4 | **DE-Tool-Verhalten unverändert.** Region-Adaptation lebt nur in EN-Komponenten. | DE-Markt ist gesetzt, no-touch. EN-Komponenten parallel zu DE-Komponenten. Slug-Map bleibt strukturell wie heute. |
| 5 | **Default-Region = US** wenn `navigator.language` keinen Hinweis gibt. UK nur bei `en-GB`-Match oder manueller Auswahl. | Globale Marktgröße. UK-Nutzer wechseln per One-Click und Wahl persistiert via LocalStorage. |

## 4. Architektur

### 4.1 Region-Context (neu)

**Datei:** `src/lib/i18n/region.ts`

```ts
export type Region = 'us' | 'uk';
export const REGIONS: readonly Region[] = ['us', 'uk'];

const STORAGE_KEY = 'kittokit-region';
const DEFAULT_REGION: Region = 'us';

export function detectRegion(): Region {
  if (typeof window === 'undefined') return DEFAULT_REGION;

  // 1. Persisted explicit choice wins.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'us' || stored === 'uk') return stored;
  } catch {/* private mode / disabled storage */}

  // 2. Auto-detect from navigator.languages.
  const langs = window.navigator.languages ?? [window.navigator.language ?? ''];
  for (const l of langs) {
    const tag = (l ?? '').toLowerCase();
    if (tag.startsWith('en-gb') || tag.startsWith('en-uk')) return 'uk';
    if (tag.startsWith('en-us')) return 'us';
  }
  return DEFAULT_REGION;
}

export function setRegion(region: Region): void {
  try { window.localStorage.setItem(STORAGE_KEY, region); } catch {}
  window.dispatchEvent(new CustomEvent('kittokit-region-change', { detail: { region } }));
}
```

**Svelte-Reactive-Wrapper:** `src/lib/i18n/region.svelte.ts`

```ts
let _region = $state<Region>('us');
let _initialized = false;

export function useRegion() {
  if (!_initialized && typeof window !== 'undefined') {
    _region = detectRegion();
    _initialized = true;
    window.addEventListener('kittokit-region-change', (e) => {
      _region = (e as CustomEvent).detail.region;
    });
  }
  return {
    get current() { return _region; },
    set(r: Region) { _region = r; setRegion(r); },
  };
}
```

### 4.2 RegionSelector-Component (neu)

**Datei:** `src/components/tools/RegionSelector.svelte`

Visual: 2 Pill-Buttons im Refined-Minimalism-Look — kein Emoji-Flag (CLAUDE.md verbietet Emojis in Files; Flag-SVG geht). Mono-Font-XS-Caption „Region:" + 2 Buttons. Aktiver Button: `var(--color-text)` Hintergrund, andere transparent mit `1px var(--color-border)`. Toggle-Animation = `var(--dur-fast) var(--ease-out)`. 

Position: Direkt **über** der Tool-Eingabe, im Tool-Card-Header. Wird **nur** auf den 3 region-aware EN-Pages gerendert. Auf DE-Pages und allen anderen EN-Tools nicht sichtbar.

Hinter den Kulissen: dispatcht `change`-Event mit `detail: { region }`, parent-Tool reagiert darauf.

**A11y:** `<fieldset>` + `<legend>`, `role="radiogroup"`, ARIA-keyboard (Pfeil-links/rechts schaltet, Space wählt).

### 4.3 Tool-Konfiguration: getrennte EN-Configs

**Vorher:**
```ts
// [slug].astro picks ONE component for both /de/zinsrechner AND /en/interest-calculator
import { zinsrechner } from '../../lib/tools/zinsrechner';
```

**Nachher:**
```ts
// Lang-aware config selection in [slug].astro:
import { zinsrechner } from '../../lib/tools/zinsrechner';                    // DE
import { interestCalculatorEn } from '../../lib/tools/en/interest-calculator';// EN
const config = lang === 'en' ? interestCalculatorEn : zinsrechner;
```

**Neue Files:**
- `src/lib/tools/en/interest-calculator.ts` — config + region-aware logic
- `src/lib/tools/en/interest-calculator-us.ts` — US compute functions (Simple/Compound + APR)
- `src/lib/tools/en/interest-calculator-uk.ts` — UK compute functions (Simple/Compound, ISA tax-free option)
- `src/lib/tools/en/vat-calculator.ts` + `.../vat-calculator-us.ts` (50-state sales-tax matrix) + `.../vat-calculator-uk.ts` (20/5/0% VAT)
- `src/lib/tools/en/gross-net-calculator.ts` + `.../gross-net-us.ts` (FICA + 2026 federal brackets) + `.../gross-net-uk.ts` (PAYE + NI + Personal Allowance)

**Neue EN-Komponenten:**
- `src/components/tools/InterestCalculatorEnTool.svelte`
- `src/components/tools/VatCalculatorEnTool.svelte`
- `src/components/tools/GrossNetEnTool.svelte`

Jede EN-Komponente:
1. Importiert `useRegion()` und `RegionSelector`.
2. Rendert Region-Selector am Top.
3. Reaktiv: bei `region === 'us'` zeigt USD-Felder + US-Logik, bei `region === 'uk'` GBP-Felder + UK-Logik.
4. Number-Format via `Intl.NumberFormat('en-US' | 'en-GB', { style: 'currency', currency: 'USD' | 'GBP' })`.

### 4.4 Slug-Map (unverändert struktur, ergänzte Einträge)

`slug-map.ts` bleibt wie heute. Hreflang-Pairs zwischen `/de/{slug}` ↔ `/en/{slug}` bleiben — Google-konform, da regionale Variants des gleichen Konzepts.

**Regional-Tools verlieren `closestEquivalent`-Heuristik nicht:** der DE-User-Switcher zeigt `/de/zinsrechner ↔ /en/interest-calculator` weiter. EN-User auf US-Region sieht im Switcher → DE-Tool, klar.

### 4.5 [slug].astro Lang-Aware Config-Resolution

Heute (vereinfacht):
```ts
const config = getToolConfig(toolId);
const Component = pickComponent(config);
```

Neu:
```ts
const config = lang === 'en' && EN_OVERRIDES.has(toolId)
  ? EN_OVERRIDES.get(toolId)!
  : getToolConfig(toolId);
const Component = pickComponent(config);
```

Wo `EN_OVERRIDES`:
```ts
const EN_OVERRIDES = new Map<string, AnyToolConfig>([
  ['interest-calculator', interestCalculatorEn],
  ['vat-calculator',      vatCalculatorEn],
  ['gross-net-calculator',grossNetEn],
]);
```

Komponenten-Picker bekommt `enToolType: 'interactive'`-Discriminator damit `[slug].astro`-statisch-imports auf das EN-Tool umschalten.

### 4.6 JSON-LD Region-Awareness

`tool-jsonld.ts` aktuell hardcoded `priceCurrency: 'EUR'`. Fix:

```ts
// price ist 0 — Currency ist effektiv egal, aber muss zur Sprache passen.
const priceCurrency = lang === 'en' ? 'USD' : 'EUR';
```

Für `creator.@id` analog: aktuell hardcoded `https://kittokit.com/de/ueber#person`. Fix: site-root-fragment `https://kittokit.com/#person` (Schema.org-konform für „same person across all locales").

### 4.7 Performance: dynamic-import tool-components

`[slug].astro` aktuell statisch-importiert 35+ Komponenten. Resultat: 242 KB CSS in jedem Tool-Page-Bundle.

**Fix:** Astro unterstützt dynamische SSR-Imports nicht direkt für Svelte-Islands. **Korrekter Fix:** statt eines „Riesen-Slug-Switch"-Files in `[slug].astro` separate Per-Tool-Routes-Map oder ein `<Astro.glob>`-basiertes Lazy-Loading nicht möglich (statisch-build), aber:

**Pragmatischer Fix:** Tool-Komponenten in `lib/tools/components/index.ts` als per-id-keyed Imports. Pro Build-Output bekommt `[slug].astro` nur den Component-Branch des jeweiligen Slugs (Vite tree-shakt unbenutzte Imports per dynamic-import-Pattern).

```ts
// Variant: per-tool-id chunked dynamic import via Astro `getStaticPaths`
// emitting one entry per slug → Vite splits the bundle per route.
```

**Detail-Plan:** während Wave-4 verifiziert. Falls Astro-Limitations in den Weg kommen, Fallback ist `Astro.glob('../../components/tools/*.svelte')` mit Per-Route-Conditional-Render — dabei muss verifiziert sein, dass Vite tatsächlich pro Route nur das relevante Bundle emittiert.

### 4.8 Hreflang-Default-Lang-Konsistenz

`hreflang.ts:12` ändern: `DEFAULT_LANGUAGE = 'en'`. Die x-default-URL zeigt dann auf `/en`. Konsistent mit `functions/index.js:20`.

Tests die `'de'` als x-default annehmen müssen aktualisiert werden — wahrscheinlich `tests/hreflang.test.ts`.

### 4.9 Sitemap-Hreflang-Alternates

`astro.config.mjs` `sitemap()`-`serialize()`-Callback erweitert um `links: [...]`-Field, das via `buildHreflangLinks()` pro URL die alternates erzeugt. Slug-Map muss für die Sitemap zugänglich sein (im Build-Kontext).

## 5. P0-Fix-Liste (mechanisch, Wave-1)

| # | Lokation | Fix |
|---|---|---|
| P0-1 | `src/pages/index.astro:38` | `<meta name="robots" content="noindex">` entfernen — Apex-Page wird jetzt zu ehrlichem Language-Picker (4-Layer-JS-Redirect läuft weiter). Canonical (Z.41) entfernen, da apex selbst kein Indexier-Ziel ist (nur 302-Stage). Rendering: bleibt visuell identisch. |
| P0-2.1 | `src/lib/tools/en/interest-calculator.ts` (neu) | Echte US/UK-Variante (siehe §4.3). |
| P0-2.2 | `src/lib/tools/en/gross-net-calculator.ts` (neu) | FICA + Federal-Brackets / PAYE + NI. |
| P0-2.3 | `src/lib/tools/en/vat-calculator.ts` (neu) | US-Sales-Tax-State-Matrix / UK-VAT 20/5/0. |
| P0-2.4 | `src/lib/tools/unix-timestamp.ts` + `UnixTimestampTool.svelte` | Wave 3: Date-Picker UI + i18n-Output-Labels. |
| P0-2.5 | `src/lib/tools/jpg-zu-pdf.ts` + `FileTool.svelte` | Wave 3: Multi-File-Upload + Reorder. |
| P0-3 | `src/pages/[lang]/[slug].astro` | dynamic-import Strategie (Wave 4). |
| P0-4 | `astro.config.mjs:17-46` | sitemap `serialize()` ergänzt um `links: [...]` mit hreflang-Alternates. |
| P0-5 | `src/lib/hreflang.ts:12` | `DEFAULT_LANGUAGE = 'en'`. Tests aktualisieren. |
| P0-6 | 45 EN-`.md`-Files | `## Häufige Fragen?` → `## Frequently Asked Questions`. Single regex-sed. |
| P0-7 | `mondphasen-rechner` + `moon-phase-calculator` OG-Images | Verifizieren via `existsSync()` im build. Bei Bedarf Generic-Fallback `/og-image.png` via Frontmatter-Override. |

## 6. P1-Fix-Liste (mechanisch, Wave-5)

| # | Lokation | Fix |
|---|---|---|
| P1-A | `src/pages/[lang]/styleguide.astro` | `<BaseLayout noindex={true} pathWithoutLang="/styleguide">` (trailing-slash entfernt). |
| P1-B | `astro.config.mjs` sitemap | `filter: (page) => !page.includes('/styleguide')`. |
| P1-C | `astro.config.mjs` sitemap `lastmod` | Aus `frontmatter.dateModified` ziehen statt build-time. |
| P1-D | `_headers` für `*.pages.dev` | `X-Robots-Tag: noindex` per `/[*]` und Hostname-Pattern. (Cloudflare Pages erlaubt Header per Domain-Match — wenn Direkt-Pages.dev-URL, header gesetzt.) |
| P1-E | Page-Titel-Konvention | `BaseLayout.astro:91` patcht `<title>{title}</title>` zu `<title>{title} — kittokit</title>` zentral, plus Logik um doppelte Suffixe zu vermeiden. |
| P1-F | `src/lib/seo/tool-jsonld.ts:79` | `priceCurrency` aus `lang` ableiten (`en`→USD, `de`→EUR). |
| P1-G | `src/lib/seo/tool-jsonld.ts:83` | `creator.@id` → `https://kittokit.com/#person`. |
| P1-H | `src/components/Breadcrumbs.astro:22-27` | Last item bekommt `item: <canonical-URL>` aus Astro-context. |
| P1-I | `BaseLayout.astro:80` SearchAction | `urlTemplate` auf `/${lang}/werkzeuge?q=…` (DE) / `/${lang}/tools?q=…` (EN) — mit Pagefind-Search-Page als Target. ODER Action droppen, falls HeaderSearch ?q nicht liest. Verify zuerst. |
| P1-J | `src/styles/tokens-fonts.css` | `@font-face Inter Fallback` mit `size-adjust: 107%`, `ascent-override: 90%`, `descent-override: 22.4%`, `line-gap-override: 0%`. CLS-Regression-Prevention. |
| P1-K | `BaseLayout.astro:142-148` | JetBrains-Mono-Preload entfernen — selten above-fold. |
| P1-L | `KiBildDetektorTool.svelte:111`, `PdfZuJpgTool.svelte:517` | Hardcoded DE-Strings durch `t(lang)`-Lookup ersetzen. |
| P1-M | EN `.md` Frontmatter `unit: "EUR"` | Sweep auf alle EN-files: ist Wert noch passend? Wenn currency-stat → `unit: "USD"` für US-Region-Default; für US/UK-Region-Aware-Tools generell stat-without-unit oder neutralisierte „dollars"-Phrase. |
| P1-N | `FooterToolsList.astro:14` `CAP = 8` | `CAP = 16` (alle 73 Tools sind nicht im Footer; 16 ist ein vernünftiger Mittelwert für Mobile). |
| P1-O | DE `jpg-zu-pdf` `relatedTools` | Mit Wave-3 zusammen: cross-Kategorie-Mismatches auditen. |
| P1-P | `astro.config.mjs:24-28` (regex) | Aus `ACTIVE_LANGUAGES.join('|')` und `STATIC_PAGE_SLUGS` ableiten. |
| P1-Q | `functions/index.js:19` `SUPPORTED` | Aus `ACTIVE_LANGUAGES`-Build-Const ableiten oder via Vitest-Sync-Check verifizieren. |
| P1-R | EN `## Related Tools`-Closer | Sweep: alle 73 EN-files bekommen Related-Tools-Closer-Section analog DE. |
| P1-S | PDF-Tools Worker-Wrap | Investigation in Wave-3: pdf-lib/pdf.js Worker-Move für `PdfZusammenfuehrenTool`, `PdfAufteilenTool`, `PdfZuJpgTool`, `PdfPasswortTool`. INP-Goal <200 ms p75. |
| P1-T | ML-Tools Worker-Verify | KiTextDetektor/KiBildDetektor/AudioTranskription bestätigen Worker-Wrap. Falls main-thread → Worker. |
| P1-U | Transformers-Web-Chunks-Dedup | Investigation: 2× 524/549 KB Chunks + 2× ONNX-Wasms 23.6 MB. Single Vite-Manual-Chunk-Strategy. |

## 7. Implementation-Wellen (Commit-Boundaries)

### Wave 1 — Stop-the-Bleeding (P0-mechanisch)

Atomar-Commit pro Sub-Topic damit Audit-Trail klar:

1. `fix(seo): apex page no-index entfernen + canonical droppen` — P0-1
2. `fix(i18n): DEFAULT_LANGUAGE de → en (CF-Fn-Konsistenz)` — P0-5 + Tests
3. `fix(content): Häufige Fragen? → Frequently Asked Questions in 45 EN-Files` — P0-6 + 45 EN-Files
4. `fix(seo): styleguide noindex + sitemap-filter` — P1-A + P1-B
5. `fix(seo): Breadcrumbs JSON-LD last-item canonical` — P1-H
6. `fix(seo): JSON-LD priceCurrency lang-aware + creator @id global` — P1-F + P1-G
7. `fix(seo): brand-suffix in BaseLayout title centralisieren` — P1-E
8. `fix(seo): footer cap 8 → 16` — P1-N
9. `fix(content): EN frontmatter unit: EUR neutralisieren` — P1-M (mechanisch)
10. `fix(i18n): hardcoded DE alt-strings in KiBild/PdfZuJpg` — P1-L
11. `chore(seo): JetBrains-Mono preload droppen + Font-Fallback metrics` — P1-J + P1-K
12. `chore(seo): pages.dev preview noindex header` — P1-D

**Verification:** vollständige `npm run check` + `npx vitest run` + `astro build` müssen am Ende dieser Welle grün sein. Stage-A-Browser-Smoke ggf.

### Wave 2 — Region-Adaptive Architecture

Pro Tool getrennt commit-bar:

1. `feat(i18n): Region-Context + RegionSelector-Component` — Foundation
2. `feat(en): vat-calculator US sales-tax + UK VAT 20/5/0` — neuer EN-Tool inkl. Component + Config + Tests + EN-md-Rewrite
3. `feat(en): gross-net-calculator FICA+federal / PAYE+NI` — analog
4. `feat(en): interest-calculator simple+compound US/UK + APR/ISA` — analog
5. `feat(seo): hreflang-DEFAULT_LANGUAGE-shift + sitemap-alternates` — P0-4 + P0-5-Folgearbeit

**Tests pro Tool:** Compute-Functions getestet pro Region (genaue Steuerbeträge gegen offizielle Beispiele), Component smoke-test (Region-Toggle-Switch render-different).

### Wave 3 — Feature-Upgrades

1. `feat(unix-timestamp): Date-Picker UI + i18n output-labels` — Component + Tool
2. `feat(jpg-to-pdf): Multi-Image-Upload + Reorder + Page-Size-Picker` — FileTool-Erweiterung oder eigener Component-Tree

### Wave 4 — Performance

1. `perf(slug): dynamic-import tool-components für CSS-Splitting` — verifiziert via Bundle-Analyzer

### Wave 5 — SEO/Hreflang/Sitemap-Polish + Content-Sweep

1. `feat(sitemap): hreflang-alternates per item + lastmod aus dateModified + filter ohne styleguide` — P0-4 + P1-B + P1-C
2. `chore(seo): SearchAction-Pfad-Fix oder -Drop` — P1-I
3. `feat(content): EN ## Related Tools-Closer in 73 EN-Files` — P1-R (mechanisch)
4. `chore(seo): pt-BR-Casing-Vorbereitung + ACTIVE_LANGUAGES-derive` — P1-P + P1-Q
5. `perf(workers): PDF-Tools Worker-Wrap (4 Tools)` — P1-S (falls main-thread bestätigt)
6. `chore(perf): Transformers/ONNX Vite-manualChunks-Strategie` — P1-U
7. `audit(content): jpg-zu-pdf relatedTools cross-Kategorie-Audit` — P1-O

### Wave 6 — Final Verification

1. `npm run check` (astro check + tsc --noEmit) → 0 errors, 0 warnings
2. `npx vitest run` → alle Tests grün, mindestens 1853 + neue (≥ 1900 erwartet)
3. `astro build` → Build erfolgreich, Bundle-Sizes vor/nach in Report
4. Manueller Audit-Re-Check: alle P0/P1-Items abgehakt
5. Verifikations-Subagent dispatched mit explizitem Audit-Replay-Auftrag
6. Final-Report-Commit: `chore(audit): SEO-Audit-Fixes abgeschlossen + Verifikation`

## 8. Verifikations-Plan

**Pro Welle (Gate-Checks):**
- `astro check` clean
- `npx vitest run` 100% grün
- `npm run lint` (no-vendor-names lint clean)
- Build-Lauf: `astro build` ohne Errors, neue Bundle-Sizes notiert

**Spezifisch für Wave-2 (Region-Tools):**
- US-Sales-Tax pro State korrekt vs `tax-rates.test.ts` (Cross-Check gegen Avalara/IRS-Public-Datasource oder Government-Doc)
- UK-VAT 20/5/0 + Personal-Allowance + 2026 NI-Rates korrekt vs gov.uk
- Federal-Brackets 2026 (oder 2025 wenn 2026 noch nicht final) korrekt vs IRS Pub 15-T
- Region-Toggle persistiert über Reload (LocalStorage check)
- `navigator.language === 'en-GB'` → Default-Region `'uk'`

**Final-Audit-Replay (Wave-6):**
1. `curl -I https://kittokit.com/` → 302
2. `curl https://kittokit.com/sitemap-index.xml | grep -c xhtml:link` ≥ 100
3. JSON-LD validation (manueller Check + Schema.org Validator) — alle Tool-Pages, alle Lang
4. EN-Files mit `## Häufige Fragen?` → `grep -r "Häufige Fragen" src/content/tools/**/en.md` returns nothing
5. Region-Toggle-Smoke: 3 Region-Tools öffnen, US→UK switchen, Werte ändern sich, Reload bringt UK zurück
6. Lighthouse-CWV-Smoke auf 1 Tool: LCP <2.5s, CLS <0.1
7. Stage-A-Browser-Smoke (HTTP 200 + 0 Console-Errors auf allen 73 Tool-Pages × 2 Sprachen = 146 Page-Loads)

## 9. Risiken & Mitigations

| Risiko | Impact | Mitigation |
|---|---|---|
| Astro statisch-import-Limit verhindert dynamic-CSS-splitting | LCP bleibt >3s | Fallback: pro Slug eine eigene Astro-Route emittieren statt `[slug].astro` |
| US/UK Steuersatz-Daten ändern sich (jährlich) | Tool veraltet | Konstanten in dedizierter `tax-data.ts` mit `validUntil`-Field; Memory-Note für jährlichen Audit |
| Region-Detection falsch beim ersten Visit (z.B. en-CA) | UX nicht ideal für Kanada | Default = US (kanada-Englisch ist näher US als UK); plus expliziter Toggle |
| Hreflang-Änderung führt zu temporärem Ranking-Drop | DE/EN-Rankings könnten kurz schwanken | Cache-Bust nicht vermeidbar; sitemap re-submit zu GSC nach Deploy |
| 45-File-Mass-Edit überschreibt unbeabsichtigt anderen Content | Content-Loss | Per-File Edit-Tool, exact-string-match, `replace_all=false` per Default — nicht Bulk-Sed |
| Worker-Wrap für PDF-Tools bricht existing Tests | Regressions | Worker-Wrap nur in Wave-5 nach erfolgreichen Wave-2/3, mit Per-Tool-Tests-grün-Gate |

## 10. Out of Scope

- pt-BR / es / fr Locales (Phase 3 separat)
- Tool-Icons / Hero-Images (eigenes Backlog-Item)
- AdSense-Integration (Phase 2)
- Komplett neue Region-Variants für ALLE Calculator-Tools (Audit nennt nur 3 mit echter Lokalisierungs-Differenz; `loan`, `compound-interest`, `discount`, `roi`, `cash-flow`, `kgv`, `inheritance-tax` etc. sind heute schon ehrlich generisch genug oder DE-spezifisch).
- KI-Tools-Worker-Migration falls bereits worker-wrapped (Audit fragt nur „Verify")
- Lighthouse Performance-Tuning auf 100 (Scope = Audit-P0/P1; tiefer-Tuning = eigenes Backlog).
- Pagefind-Search-Page bauen (P1-I — entweder URL fixen oder SearchAction droppen)

## 11. Spec-Pflicht §2.4 — Differenzierung (für die 3 Region-Tools)

Da die 3 Tools effektiv 6 neue Tool-Profile (3 × US + 3 × UK) sind, gilt CLAUDE.md §6 Differenzierungs-Check. Recherche delegiert an Subagent während Wave-2-Vorbereitung — Ergebnisse als A/B/C/D-Bullets im Tool-Spec-Header der jeweiligen `*.ts`-Configs.

**Baseline pro Region (was muss da sein):**
- US-Sales-Tax: State-Picker, optional ZIP-Code (überspringen — zu viele Sub-Stadt-Sätze, halt würden DB benötigen), Pretax/Posttax-Toggle, Total + Breakdown.
- UK-VAT: Standard 20% / Reduced 5% / Zero 0% / Exempt — Toggle, Pretax/Posttax, Total.
- US-Federal-Income: Single/Married-Joint/Married-Sep/Head-of-Household, Annual-Salary-Input, FICA + Federal-Marginal, Take-home + Effective-Rate.
- UK-Income: Personal-Allowance + Basic/Higher/Additional-Rate, NI-Class-1, Take-home.
- US-Interest: Simple-vs-Compound-Toggle, APR-Aware, Daily-Accrual-Display.
- UK-Interest: Simple-vs-Compound-Toggle, ISA-Tax-Free-Toggle, AER (Annual-Equivalent-Rate).

**Differenzierungs-Features (was uns hebt):**
- Region-Toggle in derselben URL — die meisten US-Konkurrenten haben US-only, UK-Konkurrenten UK-only.
- 0 Tracking, kein Server-Submit, kein Sign-up — DSGVO-clean (für UK-EU/GDPR-Audience).
- Side-by-Side-Vergleich US vs UK in einer Calc — niche, aber wertvoll für Cross-Border-Workers/Founders.
- Pure-client → funktioniert offline (PWA).

**Bewusste Lücken:**
- Keine Sub-State-Sales-Tax (NYC-vs-Albany), keine Cities — zu viele Datenpunkte ohne authoritative free-API.
- Keine 401(k)/Pension/ISA-Rebate-Optimizer — das ist Financial-Advisory, nicht ein Calculator.
- Keine MFJ vs HoH Steuer-Optimierung in Mehrfach-Szenarien — explizit single-input-Tool.

**Re-Evaluation:** in Phase-2 (mit Analytics) prüfen wir Bounce-Rate / Exit-Rate auf den 3 Tools in US/UK — falls UK <10% der US-Visits, evtl. UK-Sektion vereinfachen. Sonst halten.

## 12. Zeitplan-Schätzung

Realistic, gegeben Karpathy-Loop + Surgical-Changes:
- Wave 1 (Stop-the-Bleeding): ~3 h
- Wave 2 (3 Region-Tools): ~12 h (4 h pro Tool inkl. Tests + EN-md-Rewrite)
- Wave 3 (2 Feature-Upgrades): ~4 h
- Wave 4 (Performance): ~2 h
- Wave 5 (Polish + Content-Sweep): ~3 h
- Wave 6 (Final-Verification): ~1 h

**Gesamt:** ~25 h Code-Time. User hat „bis später" gesagt + autonomes Arbeiten erlaubt. Wenn Limit/Token-Pressure: Wave-Boundary-Commit, Pause, Resume mit Wave-N+1.

## 13. Verifikations-Hooks

Nach diesem Spec:
- Spec-Reviewer-Subagent (1 Pass — User trust > Loop-Iteration; bei Issues per User-Notiz handeln)
- Implementation-Plan-Skill für Wave-Plan
- Per-Wave: Test-Suite + lint + build als Gate
- Final: Replay-Audit-Subagent

## 14. Open Questions (User-Pingback bei Wiederkehr)

Keine offenen Strategiefragen. Wenn ich auf eine Architektur-Gabel stoße, dokumentiere ich die Entscheidung im Code-Comment + nachträglich in PROGRESS.md, damit du beim Review sehen kannst, was warum gewählt wurde.
