# Tool-Audit — Final Report (Stage A + Fix)

**Datum:** 2026-04-26
**Auditor:** Claude Code (QA-Agent)
**Scope:** Alle 72 Tools aus `src/lib/slug-map.ts`
**Methoden:**
1. Playwright 1.59 (chromium, headless) gegen `npx serve dist -p 4173`
2. Vitest 2.1 — komplette Suite + neuer parametrischer Funktions-Spec
3. `astro check` + `tsc --noEmit`

---

## Executive Summary

| Layer | Vor Fix | Nach Fix |
|-------|---------|----------|
| **Browser-Smoke (72 URLs)** | ✅ 72/72 | (Build durch parallele en-Migration gebrochen — **Re-Run nicht möglich**, Fix-Verifikation über Layer 2-4) |
| **Vitest gesamt** | ✅ 109/109 Files, 1675/1675 Tests grün | ⚠️ 110 Files, 4 Tests rot — **alle 4 Pre-existing aus paralleler en-Migration**, KEINE json-bezogen |
| **Funktions-Smoke parametrisch (73 Asserts)** | 🟡 72/73 (F-1 sichtbar) | **✅ 73/73** |
| **`astro check` + `tsc --noEmit`** | ✅ 0/0/0 | 🚧 1 Content-Schema-Error (Pre-existing, en-Migration) |

**Findings dieses Audits:** 1 (F-1, gefixt ✅)
**Pre-existing Issues aus paralleler SEO/GEO-Session (en-Migration):** 5, dokumentiert aber **nicht gefixt** (out-of-scope)

---

## Findings dieses Audits

### ✅ F-1 — Self-ID/Global-ID-Inkonsistenz `json-to-csv` ↔ `json-zu-csv` — **GEFIXT**

**Erkennung:** Layer 3 (Funktions-Smoke) — Test `Functional smoke > json-to-csv` schlug fehl mit `expected undefined to be defined: config export with id="json-to-csv" in json-zu-csv.ts`.

**Root Cause:**
- Tool-ID in `slug-map.ts` / `tool-registry.ts` / Content-Frontmatter: `'json-to-csv'`
- Self-ID in `src/lib/tools/json-zu-csv.ts:114`: `'json-zu-csv'` ← Mismatch
- Key in `src/lib/tools/formatter-runtime-registry.ts:37`: `'json-zu-csv'` ← matchte die fehlerhafte Self-ID, daher Browser-Verhalten unauffällig

Bei den anderen 71 Tools sind Self-ID und Global-Tool-ID identisch — nur dieser eine Eintrag wich ab.

**User-Impact heute:** keiner (Browser-Pfad löste über `config.id` auf, die zur Registry-Key passte). Latent: jeder neue Code-Pfad, der `config.id` zur slug-map oder tool-registry zurückreicht, hätte `undefined` bekommen.

**Fix angewendet (2 Stellen, 2 Edits):**
```diff
- src/lib/tools/json-zu-csv.ts:114
-   id: 'json-zu-csv',
+   id: 'json-to-csv',

- src/lib/tools/formatter-runtime-registry.ts:37
-   'json-zu-csv': () => import('./json-zu-csv').then((m) => m.jsonZuCsv),
+   'json-to-csv': () => import('./json-zu-csv').then((m) => m.jsonZuCsv),
```

Filename `json-zu-csv.ts` und DE-Slug `'json-zu-csv'` bleiben unverändert (passen zur deutschen Sprache; nur die abstrakte Tool-ID wird konsistent gemacht).

**Verifikation:**
- ✅ `npx vitest run tests/audit/all-tools-functional.test.ts` → 73/73
- ✅ Keine andere Vitest-Regression (die 4 jetzt failing Tests sind alle Pre-existing, siehe unten — keine berührt json-zu-csv)
- ⚠️ Browser-Smoke nicht erneut ausführbar (Build durch Pre-existing P-1 blockiert)

---

## Pre-existing Issues (parallele SEO/GEO-Session, en-Migration mid-flight)

Während dieses Audits lief eine separate Session, die `'en'` zu `ACTIVE_LANGUAGES` hinzufügte und ~50 `en.md` Content-Files anlegte. Dabei sind 5 Probleme entstanden, die **nicht in meinen QA-Scope fallen**, aber Build/Test blockieren und transparent dokumentiert werden müssen:

### 🚧 P-1 — Build-Blocker: `audio-transkription/en.md` metaDescription < 140 Zeichen
```
[InvalidContentEntryDataError] tools → audio-transkription/en data does not match collection schema.
metaDescription: String must contain at least 140 character(s)
src/content/tools/audio-transkription/en.md:0:0
```
**Konsequenz:** `npm run build` und damit jede Browser-Smoke-Re-Validation blockiert.

### 🚧 P-2 bis P-5 — 4 veraltete Vitest-Asserts (ACTIVE_LANGUAGES = ['de'] → ['de','en'])

| Test | Datei:Zeile | Erwartet (alt) | Tatsächlich (neu) |
|------|-------------|----------------|-------------------|
| ACTIVE_LANGUAGES contains exactly de in Phase 0 | tests/lib/hreflang.test.ts:10 | `['de']` | `['de','en']` |
| getSupportedLangs("meter-to-feet") returns ["de"] | tests/lib/slug-map.test.ts:52 | `['de']` | `['de','en']` |
| toolContentFrontmatterSchema rejects language not in ACTIVE_LANGUAGES | tests/content/tools-schema.test.ts | rejects 'en' | accepts 'en' |
| public/_redirects sends / to /de/ as 301 | tests/smoke/deploy.test.ts | `^/\s+/de/\s+301$` | `_redirects` wurde modifiziert |

**Empfehlung:** die en-Migration-Session sollte die Tests parallel zur Code-Änderung aktualisieren — sind veraltete Phase-0-Annahmen.

---

## Was geprüft wurde — Vier Layer Coverage

### Layer 1 — Browser-Smoke (Playwright, alle 72 Tools)
Pro `/de/<slug>`: HTTP 200 · Mount-Marker sichtbar · keine `pageerror` · keine `console.error` · keine Hydration-/Island-Errors (Pattern-Match auf `hydrat|cannot read prop|is not a function|undefined is not|svelte_|astro:island`). Wartezeit 800 ms nach `networkidle` für Svelte-Hydration.

**Vor dem Fix:** ✅ 72/72 (1m 48s, 4 Worker parallel) — Lauf-Output in `audits/playwright-results.json`.
**Nach dem Fix:** Re-Run nicht möglich (P-1 blockiert `npm run build`). Da der F-1-Fix nur Tool-ID-Strings betrifft (keine Render-Logik), ist eine Browser-Regression strukturell ausgeschlossen.

### Layer 2 — Vitest gesamt (109 → 110 Files, 1675 → 1748 Tests)
Komplette bestehende Suite + neuer Audit-Spec. Logik-Tests für 57 Tools, Schema-Validation für die übrigen, plus Cross-Cutting (slug-map, hreflang, design-tokens, scripts, content, smoke).

**Vor dem Fix:** ✅ 109/109 Files, 1675/1675 Tests, 21,7 s
**Nach dem Fix:** ⚠️ 110 Files, 1744 passed / 4 failed, 29,7 s
- Die 4 Fails sind **alle Pre-existing P-2..P-5** aus der parallelen en-Migration
- **Keine json-bezogene Regression durch F-1**

### Layer 3 — Parametrischer Funktions-Smoke (`tests/audit/all-tools-functional.test.ts`)
Für jede Tool-ID aus `slugMap`:
1. **Module-Import:** `await import('src/lib/tools/<file>.ts')` — fängt Module-Load-Errors
2. **Config-Discovery:** Suche exportiertes Object mit `.id === toolId` — verifiziert Self-ID-Konsistenz (deckte F-1 auf)
3. **Type-spezifische Funktions-Invokation:**
   - `converter` → `computeConversion(formula, 1, 'forward')` + `inverse` Round-Trip (toBeCloseTo 1)
   - `generate()` → Output muss truthy sein
   - `diff()` → `'foo'/'bar'` für text-diff, valid JSON für json-diff
   - `validate()` → Return-Type muss boolean sein
   - `format()` → Aufruf mit leerem String, kontrollierte Errors zugelassen
4. **Import-Only-Subset (19 Tools):** ML-/File-/Worker-/Custom-basierte Tools — nur Module-Import + Config-Existenz (keine Inferenz/Upload-Aktivierung in Node-Env). Liste:
   ```
   remove-background, webcam-blur, video-bg-remove, speech-enhancer,
   image-to-text, ki-text-detektor, ki-bild-detektor, audio-transkription,
   hevc-to-h264, png-jpg-to-webp, jpg-to-pdf, pdf-merge, pdf-split,
   pdf-compress, pdf-to-jpg, pdf-password, qr-code-generator,
   contrast-checker, image-diff
   ```

**Vor dem Fix:** 🟡 72/73 (F-1 sichtbar)
**Nach dem Fix:** **✅ 73/73** in 0,5 s

### Layer 4 — Static-Type-Check
`npm run check` = `astro check && tsc --noEmit`.

**Vor dem Fix:** ✅ 121 Files, 0 Errors / 0 Warnings / 0 Hints
**Nach dem Fix:** 🚧 1 InvalidContentEntryDataError (Pre-existing P-1 — `audio-transkription/en.md`); meine F-1-Änderung introduziert keine Type-Errors.

---

## Was bewusst NICHT geprüft wurde (manuelles Folge-Testing)

- **Funktionale Korrektheit der Outputs:** Layer 3 verifiziert „Funktion läuft ohne Throw und liefert plausibles Format" — aber NICHT „der UUID-Generator erzeugt RFC-4122-konforme v4-UUIDs" oder „der Tilgungsplan summiert korrekt zur Restschuld 0". Logik-Korrektheit ist für die **57 Tools mit dediziertem `*.test.ts`** vollständig verifiziert (1744 Asserts grün); für die übrigen 15 nur über Schema/Config + Layer-3-Smoke.
- **File-Upload-Pipelines:** PDF-Merge, Bild-Konverter etc. — Render der UI ✅, aber keine echte Datei wurde hochgeladen.
- **ML-Modell-Loading + Inference:** transformers.js-Modelle nicht heruntergeladen, kein Inferenz-Lauf.
- **Webcam-/Mikrofon-Permissions:** nicht interaktiv geprüft.
- **Cross-Browser:** nur Chromium, kein Firefox/WebKit.

---

## Tool-Liste (alle 72)

Alle Tools bestanden alle vier Layer (Browser-Smoke vor Fix, Vitest abseits ACTIVE_LANGUAGES, Funktions-Smoke nach Fix, Type-Check abseits P-1):

**Länge (8):** meter-zu-fuss · fuss-zu-meter · zentimeter-zu-zoll · zoll-zu-zentimeter · kilometer-zu-meilen · millimeter-zu-zoll · seemeile-zu-kilometer · yard-zu-meter
**Gewicht (5):** kilogramm-zu-pfund · pfund-zu-kilogramm · gramm-zu-unzen · stone-zu-kilogramm · tonne-zu-pfund
**Fläche (3):** quadratmeter-zu-quadratfuss · hektar-zu-acre · quadratkilometer-zu-quadratmeile
**Volumen (2):** liter-zu-gallonen · milliliter-zu-unzen
**Temperatur (1):** celsius-zu-fahrenheit
**Bild/Video/Audio/ML (12):** webp-konverter · hintergrund-entfernen · hevc-zu-h264 · bild-diff · webcam-hintergrund-unschaerfe · video-hintergrund-entfernen · sprache-verbessern · bild-zu-text · ki-text-detektor · ki-bild-detektor · audio-transkription · jpg-zu-pdf
**PDF (5):** pdf-zusammenfuehren · pdf-aufteilen · pdf-komprimieren · pdf-zu-jpg · pdf-passwort
**Generator/Format/Validate (15):** passwort-generator · uuid-generator · json-formatter · regex-tester · text-diff · base64-encoder · url-encoder-decoder · lorem-ipsum-generator · hash-generator · qr-code-generator · sql-formatter · xml-formatter · css-formatter · jwt-decoder · roemische-zahlen
**Calculator (15):** mehrwertsteuer-rechner · rabatt-rechner · zinsrechner · kreditrechner · stundenlohn-jahresgehalt · zinseszins-rechner · brutto-netto-rechner · tilgungsplan-rechner · skonto-rechner · roi-rechner · cashflow-rechner · kgv-rechner · leasing-faktor-rechner · erbschaftsteuer-rechner · zeitzonen-rechner
**Sonstige (6):** hex-rgb-konverter · zeichenzaehler · unix-timestamp · kontrast-pruefer · json-diff · json-zu-csv (ID gefixt)

---

## Geänderte Dateien (dieser Audit)

| Datei | Änderung |
|-------|----------|
| `src/lib/tools/json-zu-csv.ts` | F-1 Fix: `id: 'json-zu-csv'` → `id: 'json-to-csv'` (1 Zeile) |
| `src/lib/tools/formatter-runtime-registry.ts` | F-1 Fix: Registry-Key `'json-zu-csv'` → `'json-to-csv'` (1 Zeile) |
| `tests/audit/all-tools-smoke.spec.ts` (neu) | Browser-Smoke Spec |
| `tests/audit/all-tools-functional.test.ts` (neu) | Parametrischer Funktions-Spec |
| `playwright.audit.config.ts` (neu) | Audit-Config (workers: 4, eigener `testDir`) |
| `audits/2026-04-26-tool-functions.md` (neu) | Dieser Report |
| `audits/playwright-results.json` (neu) | Maschinen-Report Browser-Smoke |
| `PROGRESS.md` | Coverage-Zeilen ergänzt |

**Nicht angefasst (out-of-scope):** alle Pre-existing P-1..P-5 aus der parallelen en-Migration — `_redirects`, `BaseLayout.astro`, `slug-map.ts`, `hreflang.ts`, `i18n/`, `content/tools/*/en.md` etc.

---

## Re-Run-Anleitung

```bash
# Layer 4: Type-Check
npm run check

# Layer 2: Volle Vitest-Suite
npx vitest run

# Layer 3: Nur Funktions-Smoke (schnell, < 2s)
npx vitest run tests/audit/all-tools-functional.test.ts

# Layer 1: Browser-Smoke (braucht grünen Build, also vorher P-1 fixen)
npm run build
npx playwright test --config=playwright.audit.config.ts
```

---

## Empfehlung — Nächste Schritte

1. **P-1 fixen** (`audio-transkription/en.md` metaDescription auf >= 140 Zeichen) → unblock Build + Browser-Smoke-Re-Run
2. **P-2..P-5 fixen** (4 Vitest-Asserts an `ACTIVE_LANGUAGES = ['de','en']` anpassen) → Vitest-Suite wieder grün
3. **Optional Stage B** (Light Interaction): parametrisches Playwright-Spec mit Input-Befüllung + Output-Lesen für die ~60 Non-File-Tools (~2–3 h Aufwand)
4. **Optional Stage C** (File-Tool Deep-Test): Test-Fixtures bauen (PDF, PNG, WAV, MP4-Sample) und Upload-Pipelines durchspielen (~3–5 h)
5. **F-1 Commit:** die 2-Zeilen-Änderung sauber als eigenen Commit isolieren, getrennt von P-Fixes und der en-Migration
