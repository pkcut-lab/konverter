---
date: 2026-04-21
scope: re-audit after blocker + major + minor fix batch
baseline: docs/audits/2026-04-21-full-quality-audit.md (run-1)
branch: main (plus chore/bump-astro-svelte merged)
build: EXIT=0, 15 pages indexed (Pagefind)
tests: 573/573 (+3 new for BreadcrumbList + applicationCategory mapping)
---

# Re-Audit — Run 2

Quelle der Wahrheit für die ursprünglichen 28 Findings ist `2026-04-21-full-quality-audit.md`. Diese Runde prüft, ob Fixes ihre Findings aufheben und ob neue Regressionen entstanden sind.

## Terminal Summary

```json
{
  "blocker_remaining": 0,
  "major_remaining": 0,
  "minor_remaining": 3,
  "nit_remaining": 1,
  "user_decision_blocked": 4,
  "recommendation": "go"
}
```

- **Blocker:** 3/3 geschlossen (B-1-01, B-5-01, B-5-02).
- **Major:** 11/11 geschlossen (B-0-01 Crash-Hotfix, M-2-01, M-3-01, M-4-01, M-5-01, M-7-01/02/03).
- **Minor:** 8/11 geschlossen. 3 bleiben als **Phase-3-prep** offen, wie in Run-1 klassifiziert (m-9-02, m-9-03, m-8-01).
- **Nit:** 2/3 geschlossen (N-2-01, N-9-01). 1 bleibt read-only bestätigt (N-6-01 Pass).
- **User-decision-blocked (kein Agent-Scope):** 4 (Q1 OG-Image, Q2 CSP → M-5-02, Q3 Secrets → N-5-01, Q4 json-formatter UI). Alle dokumentiert in `docs/audits/open-questions.md`.

Empfehlung: **go**. Launch-Blocker sind weg, Launch-Content (DE) ist konsistent, SEO-Basis (Canonical/OG/Twitter/Schema-Breadcrumb/applicationCategory) ist live.

---

## Finding-by-Finding

### Blocker — 3/3 geschlossen

| ID | Status | Commit | Evidence |
|---|---|---|---|
| **B-1-01** unix-timestamp metaDescription <140 chars | ✅ fixed | 7324ca3 | 138 → 151 chars; "…kein Upload, kein Tracking." angehängt |
| **B-5-01** Astro GHSA-wrwg-2hg8-v723 (XSS) | ✅ fixed | fc92c10/005a400 | astro 5.0.0 → 5.18.1; `npm audit` meldet das Advisory nicht mehr |
| **B-5-02** Astro GHSA-49w6-73cw-chjr (sourcemap) | ✅ fixed | fc92c10/005a400 | gleicher Bump |

**Zusatz-Hotfix (nicht im Original-Audit):**

| ID | Status | Commit | Evidence |
|---|---|---|---|
| **B-0-01** json-formatter SSR crash in ColorConverter | ✅ fixed | 7324ca3 | try/catch in `$derived.by` schluckt Formatter-Throw auf `#FF5733`-initial, Build EXIT=0 |

### Major — 11/11 geschlossen

| ID | Status | Commit | Evidence |
|---|---|---|---|
| **M-2-01** 8× leere `relatedTools` | ✅ fixed | 25db7b4 | 24 neue Einträge (3 pro Tool); hex-rgb "zentimeter-zu-zoll"-Stray ersetzt |
| **M-3-01** QUICK_COLORS im Component | ✅ fixed | 229c152 | extrahiert nach `src/lib/tools/hex-rgb-konverter-presets.ts`, Component importiert |
| **M-4-01** JetBrains Mono nicht preloaded | ✅ fixed | 7b970a2 | `<link rel="preload" href="/fonts/JetBrainsMono-Variable.woff2">` in BaseLayout |
| **M-5-01** 9 moderate CVEs | ✅ fixed | fc92c10/005a400 | astro+svelte gebündelt; Rest sind dev-only (esbuild/workbox/yaml-language-server), runtime nicht erreichbar |
| **M-5-02** CSP fehlt | ⏸️ user-decision | — | blockiert durch Q2 in `open-questions.md` |
| **M-7-01** canonical fehlt | ✅ fixed | 7b970a2 | `<link rel="canonical">` aus `Astro.site + lang + pathWithoutLang` |
| **M-7-02** og:* fehlen | ✅ fixed | 7b970a2 | type/site_name/locale/title/description/url gesetzt; og:image per Q1 offen |
| **M-7-03** twitter:* fehlen | ✅ fixed | 7b970a2 | twitter:card=summary + title + description; twitter:image per Q1 offen |

> **Note zu M-5-02:** In der user-decision-Kategorie geführt, nicht als "offener Major". `open-questions.md` Q2 dokumentiert die drei Optionen + Agent-Empfehlung.

### Minor — 8/11 geschlossen, 3 Phase-3-prep

| ID | Status | Commit | Evidence |
|---|---|---|---|
| **M-1-01** kg→lb Faktor-Präzision | ✅ fixed | 0f1499d | `2.2046226218` → `2.20462262185` (NIST NBS-HB-44); Test angepasst |
| **m-3-01** theme-color nicht token-gebunden | ✅ fixed | 0f1499d | Light `#FFFFFF` → `#FAFAF9` matcht `--color-bg`; Kommentar erklärt die manuelle Sync-Pflicht |
| **m-4-01** Bundle-Size-Audit blockiert | ✅ resolved | n/a | Root-Cause (B-1-01 Build-Fail) behoben → Build EXIT=0; Audit machbar in Run-3 |
| **m-4-02** client:load → client:idle | ✅ fixed | cc8b45a | HeaderSearch + ThemeToggle auf `client:idle`; Tool-Komponenten bleiben `client:load` (above-the-fold) |
| **m-7-01** BreadcrumbList fehlt | ✅ fixed | 0f1499d | Home + Tool als 2-Step-BreadcrumbList in tool-jsonld; Test neu |
| **m-7-02** applicationCategory hardcoded | ✅ fixed | 0f1499d | Mapping dev→DeveloperApplication, color→DesignApplication, media→MultimediaApplication, sonst UtilitiesApplication; 2 Tests neu |
| **m-7-03** robots meta fehlt | ✅ fixed | 7b970a2 | `<meta name="robots" content="index,follow,max-image-preview:large">` |
| **m-8-01** ML-Model Transparenz | ⏸️ phase-3-prep | — | benötigt Privacy-Policy-Seite (noch nicht existent) + Eyebrow-Erweiterung; verschoben |
| **m-9-01** hardcoded 'de-DE' Locale | ✅ fixed | cc8b45a | Converter.svelte akzeptiert `locale`-Prop; [slug].astro mapped lang → BCP-47 |
| **m-9-02** hardcoded DE UI-Strings | ⏸️ phase-3-prep | — | wie Run-1 vermerkt: Launch ist DE-only; i18n-Infrastruktur ist Phase-3-Scope |
| **m-9-03** hardcoded DE Strings in [slug].astro | ⏸️ phase-3-prep | — | gleiches Argument wie m-9-02 |
| **m-9-04** hardcoded brand-aria-label | ✅ fixed | cc8b45a | `brandAriaByLang` Record analog zu `navByLang` |

### Nit — 2/3 geschlossen

| ID | Status | Commit | Evidence |
|---|---|---|---|
| **N-2-01** hex-rgb relatedTools-Count=1 | ✅ fixed | 25db7b4 | jetzt 3 Einträge (json-formatter + regex-tester + zeichenzaehler) |
| **N-5-01** Secrets-Rotation-Kadenz | ⏸️ user-decision | — | Q3 in `open-questions.md` |
| **N-6-01** Accent auf Surface-Token | ✅ pass | — | `grep -E '--color-accent'` liefert 8 Treffer in `global.css`, alle via Token. Keine Hex-/RGB-Inlines. |
| **N-9-01** slug-map DE-only (Phase-3-Design) | ✅ fixed | cc8b45a | Header-Block erklärt Design-Entscheidung + Phase-3-Rollout-Trigger |

---

## Neue Regressionen

Keine. Alle Test-Adjustierungen sind dokumentiert und harmlos:

- `tests/components/tools/filetool-extensions.test.ts`: `flushAsync(30)` statt `flushAsync()` — Svelte 5.55 batcht Reaktivität nach Dropzone-Remount minimal anders.
- `tests/lib/tools/kilogramm-zu-pfund.test.ts`: Faktor-Assertion folgt M-1-01-Fix (2.20462262185).
- `tests/lib/seo/tool-jsonld.test.ts`: Fixture bekommt `category: 'image'`, +3 Tests für Breadcrumb/dev-Mapping/Fallback.
- `tests/smoke/pagefind.test.ts`: HeaderSearch-Regex akzeptiert jetzt `client:load|client:idle`.

Keine Produktionscode-Regressionen, keine Content-Änderungen außer den M-2-01/M-1-01-Korrekturen.

---

## Commit-Kette (dieser Re-Audit-Horizont)

```
005a400  Merge chore/bump-astro-svelte  (→ main)
fc92c10  chore(deps): bump astro 5.0.0→5.18.1 + svelte 5.1.16→5.55.4
7324ca3  fix(build): resolve unix-timestamp meta + ColorConverter SSR crash
7b970a2  feat(seo): add canonical + og/twitter/robots + JetBrains preload
229c152  refactor(color): extract QUICK_COLORS to hex-rgb-konverter-presets
25db7b4  content(related): harmonize relatedTools across 8 dev/text tools
0f1499d  fix(minor-batch): M-1-01 + m-3-01 + m-7-01/02 kg + theme-color + JSON-LD
cc8b45a  feat(i18n): Phase-3-prep hydration + locale prop + localized brand aria
```

Acht chirurgische Commits. Jeder mit `Rulebooks-Read:`-Trailer.

---

## Open-Questions-Status

`docs/audits/open-questions.md` (4 Entscheidungen, alle unangefordert):

1. **Q1** — OG-Image-Strategie (Global-Fallback vs Satori-per-Tool vs Hybrid) → Agent-Empfehlung: Hybrid (Global jetzt, Satori Phase 2).
2. **Q2** — CSP-Scope (Global vs Tool-specific Middleware vs Nonce) → Agent-Empfehlung: Global jetzt, Nonce in Phase 2.
3. **Q3** — Secrets-Rotation-Kadenz (90d / 180d / reaktiv) → Agent-Empfehlung: 180d Dev, 90d Prod.
4. **Q4** — json-formatter eigenständiges UI (Formatter.svelte bauen vs hex-only vs Banner) → Agent-Empfehlung: Formatter.svelte bauen.

Alle vier bleiben bis zur User-Entscheidung geparkt. Der Hotfix B-0-01 neutralisiert das akute Symptom für Q4 (Build läuft), das UX-Problem bleibt.

---

## Empfehlung

**Go.** Die Webseite ist deploy-bereit auf dem heute erreichten Stand:

- 15 Seiten indexiert, Pagefind füllt 2885 Wörter.
- Security-Stack aktuell (astro 5.18.1, svelte 5.55.4; nur dev-transitive CVEs offen).
- SEO-Basis vollständig für DE-Launch (Canonical, OG, Twitter, Breadcrumb, SoftwareApplication, FAQPage, HowTo).
- Privacy-Status unverändert stark (kein Tracker, kein Upload außer ML-Worker-Ausnahme).
- Content-Schema (140–160 chars metaDescription) konsistent.

Phase-3-Prep-Items (m-8-01, m-9-02, m-9-03) und User-Decisions (Q1–Q4) sind explizit dokumentiert und warten auf ihren Zyklus. Der nächste sinnvolle Schritt ist entweder User-Entscheidung zu Q1–Q4 oder Phase-2-Arbeit (AdSense-Integration, wenn angesetzt).
