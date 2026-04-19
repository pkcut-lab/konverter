# Progress Tracker

**Letztes Update:** 2026-04-19 (Session 10, End)
**Aktuelle Phase:** Phase 0 — Foundation
**Current Session:** #10 — PWA + Pagefind ✅ (Brand-Icon + 4 Manifest-Icon-Variants, Workbox-SW mit Runtime-Caching für HF-Modell-CDN + Pagefind-Index, Pagefind-Build-Step, HeaderSearch-Svelte mit Graphit-Token-Overrides, Rulebook-Sync)

## Phase 0 Fortschritt

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Bootstrap | ✅ done | Astro-Shell + Rulebooks + Git + CF Pages |
| 2 — Design-System | ✅ done | `tokens.css`, Dark/Light |
| 3 — Layout-Shell | ✅ done | BaseLayout + Header + Footer + ThemeToggle + hreflang |
| 4 — Tool-Config-Foundation | ✅ done | Zod-Schemas 9 Typen + slug-map + Content-Collection + CONVENTIONS final |
| 5 — Meter-zu-Fuß Prototype | ✅ done | Converter-Template + Dynamic Route + SEO-Content |
| 6 — Review #1 + Redesign | ✅ done | Refined-Minimalism-Redesign + Prereqs + Audit-Pass |
| 7 — WebP Konverter Prototype | ✅ done | FileTool-Template + Processor-Registry + /de/webp-konverter live |
| 8 — Review #2 | ✅ done | Smoke-Test passed (Desktop+Mobile, Light+Dark) — kein Feedback, Templates gelockt |
| 9 — Hintergrund-Entferner Prototype | ✅ done | BG-Remover live + FileTool-Erweiterungen (preparing-Phase, Format-Chooser, Preview, Clipboard/Camera/HEIC) + Loader-Komponente + JSON-LD |
| 10 — PWA + Pagefind | ✅ done | Manifest + 4 Icons + Workbox-SW + Pagefind Build-Step + HeaderSearch |
| 11 — CI/CD | ⬜ pending | First Production Deploy |

## Tool-Inventar (Phase 0)

| Tool | Config | Content-DE | Icon | Tests |
|------|--------|------------|------|-------|
| meter-zu-fuss | ✅ | ✅ | ✅ (`public/icons/tools/meter-to-feet.webp`, 313 KB, Alpha) | ✅ |
| webp-konverter | ✅ | ✅ | ⬜ (Pending Recraft → BG-Remover → Drop unter `public/icons/tools/png-jpg-to-webp.webp`) | ✅ |
| remove-background | ✅ | ✅ | ⬜ (Pending Recraft → BG-Remover → Drop unter `public/icons/tools/remove-background.webp`) | ✅ |

## Deploy-History
(leer bis Session 11 — Production-Deploy)

## Blockers
- Keine. User-Smoke-Test beider Prototypen (`/de/meter-zu-fuss` + `/de/webp-konverter`) auf Desktop + Mobile, Light + Dark erfolgreich abgeschlossen. Templates Converter + FileTool gelten als gelockt für Phase-1-Skalierung. BG-Remover (`/de/hintergrund-entfernen`) wartet auf User-Smoke-Test (Checklist unten).

## Session 9 Smoke-Test (vom Menschen auszuführen, `npm run dev`)
- [x] `/de/hintergrund-entfernen` lädt
- [x] PNG-Upload triggert Modell-Download (Progress sichtbar via Loader)
- [x] BG entfernt, PNG-Download funktioniert — nach Fix `d0dc00d` (RawImage-Input + Array-Output-Shape für Transformers.js v4)
- [x] Format-Wechsel zu WebP re-encodet (kein Re-Inference) — nach Fix `8db9816` (JPG-Composite auf Wegwerf-Canvas, sonst bleibt Weiß im Cache)
- [x] Format-Wechsel zu JPG: weißer Hintergrund statt Alpha
- [x] Doppel-Hebel: Recraft-PNG von `meter-zu-fuss` durch BG-Remover → PNG mit Alpha (Icon-Pipeline validiert, `meter-to-feet.webp` live) — im Rahmen des Smoke-Tests durchgelaufen; Fix `8db9816` nötig damit JPG-Wechsel den WebP-Cache nicht verschmutzt.
- [x] Loader dreht auch unter `prefers-reduced-motion` langsam weiter (2.4 s) — sonst wirkt UI abgestürzt (Fix `5ea41e9`, Rulebook-Regel in STYLE.md § 11 und CONVENTIONS.md Loader-Block nachgezogen).
- [x] Icon-Auto-Pickup (`[slug].astro` + `index.astro`) rendert Hero-Icon bzw. Card-Thumbnail sobald `public/icons/tools/<toolId>.webp` existiert — Fix `84e1584` (process.cwd() statt `new URL('../../../', import.meta.url)`, letzteres bricht unter Pfaden mit Leerzeichen wie „Konverter Webseite").
- [ ] Reset-Button funktioniert
- [ ] Strg+V mit Screenshot triggert Process
- [ ] Mobile: Kamera-Button sichtbar (DevTools-Mobile-Mode oder echtes Smartphone)
- [ ] HEIC-Upload (echte iPhone-Datei) triggert heic2any-Lazy-Load
- [ ] Dark-Mode: Card, Loader, Preview, Format-Chooser sehen korrekt aus
- [ ] `/de/webp-konverter` funktioniert immer noch wie vorher (Regression-Check)
- [ ] `/de/meter-zu-fuss` funktioniert immer noch wie vorher (Regression-Check)
- [ ] Homepage `/de/` listet alle 3 Tools als Cards (auto-enumeriert, alphabetisch); Hover-Arrow wandert, Dark-Mode invertiert Icons

## Session 10 Deliverables

- **Brand-Icon:** `public/icon.svg` (geometrisches „K" aus drei `stroke-linecap: round`-Paths auf warm-weißem Rounded-Square-Background) + `public/icon-maskable.svg` (Paths im 80%-Safe-Zone, damit Android-Launcher beim Masken nicht die Form anschneidet).
- **Raster-Pipeline:** `scripts/generate-pwa-icons.mjs` (sharp, Density = Size × 2 für retina-scharfe Kanten) rasterisiert SVG → `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `favicon-32.png`. Manuell nach SVG-Änderungen, NICHT auf CI (spart native sharp-Dep dort).
- **`public/manifest.webmanifest`:** name/short_name „Konverter", start_url `/de/`, scope `/`, display `standalone`, lang `de`, 4 Icons (SVG any, 192 any, 512 any, 512 maskable). Theme- und Background-Color = `#FFFFFF`.
- **`src/layouts/BaseLayout.astro`:** Icon-/Manifest-/Apple-Web-App-Meta-Tags, `<link rel="manifest">`, `<script is:inline defer src="/registerSW.js">` (Plugin injiziert ihn nicht automatisch), `<main data-pagefind-body>` zum Index-Scoping.
- **`@vite-pwa/astro` 1.2.0 + `vite-plugin-pwa` 1.2.0:** registerType `autoUpdate`, clientsClaim + skipWaiting, maximumFileSizeToCacheInBytes 5 MB. `globIgnores`: `FileTool.*.js` (540 KB), `heic2any.*.js` (1.3 MB), `onnx*.js`, `*.wasm` — Lazy-Chunks rausnehmen, sonst zahlt jeder Erstbesucher die ML-Payload.
- **Runtime-Caching:** CacheFirst für `huggingface.co` / `cdn-lfs.huggingface.co` (30 Tage, maxEntries 20 — BG-Remover-Model-Weights sind immutable pro Version); StaleWhileRevalidate für `/pagefind/*` (Search-Index frisch genug ohne Block).
- **Pagefind 1.5.2:** `npm run build` = `astro build && pagefind --site dist`. Index scoped auf `<main data-pagefind-body>` (Header/Footer ignoriert). 5 Seiten indexiert, 1046 Wörter, 1 Language-Shard (de).
- **`src/components/HeaderSearch.svelte`:** Svelte-5-Runes, `$effect` lädt `/pagefind/pagefind-ui.js` + `.css` dynamisch zur Laufzeit. Dev-Fallback: disabled Input ohne Crash wenn Bundle fehlt. bundlePath `/pagefind/` als Invariante kommentiert (Phase-5-Trigger: R2-Proxy bei CF-Pages-20k-Limit).
- **CSS-Overrides:** `.pagefind-ui { --pagefind-ui-*: var(--color-*) }` in `src/styles/global.css` remapped alle Pagefind-CSS-Variablen auf Graphit-Tokens. Result-Items bekommen Hairline-Divider konsistent mit Card-Rhythmus; Highlight-Marker bleibt Text-Farbe + `font-weight: 600` statt gelbem Default.
- **Header:** Alter disabled Stub ersetzt durch `<HeaderSearch client:load lang={lang} placeholder=…>`. `<header data-pagefind-ignore>` als Belt-and-Suspenders. Mobile: Search rutscht per Grid auf `1 / -1, order: 3` unter Brand + Toggle.
- **Rulebooks:** `CONVENTIONS.md` +§PWA + §Pagefind (Manifest-Source-of-Truth, Icon-Regen-Ritual, globIgnores-Regel, bundlePath-Invariante). `STYLE.md` +§12 Header-Search/Pagefind (CSS-Override-Punkt single-source-of-truth, Mobile-Verhalten, Dev-Fallback-Optik).
- **Tests:** +13 neue (total 239 → 252). Aufteilung: PWA-Smoke 8 (Manifest-Fields, 4 Icon-Variants, Assets-on-Disk, favicon-32, BaseLayout-Wiring, registerSW-Reference, astro.config `@vite-pwa/astro` + autoUpdate + manifestFilename + cache-names + globIgnores-lazy-chunks), Pagefind-Smoke 5 (Build-Script, `data-pagefind-body`, Komponenten-Loader, Header-Mount, CSS-Token-Overrides).
- **Gates:** 0/0/0 `astro check`, 252/252 vitest, Build grün (`dist/pagefind/` + `dist/sw.js` + `dist/registerSW.js` + `dist/workbox-*.js` emittiert).

### Bekannte Follow-ups (nicht blocking)

- **PagefindUI-Default-CSS-Style-Cascade:** Das Plugin injiziert keine eigenen Styles via JS; unsere Overrides in `global.css` greifen, sobald `/pagefind/pagefind-ui.css` geladen ist. Wenn der Load durch Netzwerk-Flakiness zu spät kommt, kann es einen kurzen Frame mit un-gestyltem Fallback-Input geben. Fix-Kandidat: `<link rel="preload" as="style">` im BaseLayout, wenn das in Prod tatsächlich sichtbar wird.
- **Session-9-Follow-up-Liste (Bundle-Split `FileTool.*.js` 541 KB via static transformers-Import)** bleibt offen. Session 10 hat das Chunk jetzt explizit aus dem SW-Precache ausgeschlossen, der fundamentalere Split-Fix wartet weiter.

## Session 9 Deliverables

- `src/lib/tools/remove-background.ts` (~230 LOC): Singleton-Pipeline (BEN2 + WebGPU/WASM-Auto-Detection), `removeBackground` + `reencodeLastResult` + `clearLastResult` + `isPrepared` + typed `StallError` + Watchdog-Pattern (Default 120 s).
- `src/lib/tools/heic-decode.ts` (~65 LOC): Lazy-Loader für `heic2any`, Safari-skip via UA-Check (spart ~30 KB gzip auf iOS/macOS).
- `src/components/Loader.svelte`: Geteilte Spinner/Progress-Komponente, Tokens-only, `prefers-reduced-motion`-Fallbacks.
- `src/lib/tools/tool-runtime-registry.ts` (ersetzt `process-registry.ts`): Single Registry mit `{ process, prepare?, reencode?, isPrepared?, clearLastResult? }` pro Tool-ID.
- `src/lib/seo/tool-jsonld.ts`: Pure Builder für SoftwareApplication + FAQPage + HowTo JSON-LD. Wired in `[slug].astro` — greift auf ALLEN Tool-Seiten (Spec §2.4 B9 AEO/Voice-Search).
- `src/components/tools/FileTool.svelte`: +`preparing`-Phase, dynamisches Output-Format, Format-Chooser-Radio-Group (PNG/WebP/JPG mit Hint-Mono-Suffixen), Clipboard-Paste (`Strg+V`), Mobile-Kamera-Capture (`capture="environment"`), HEIC-Pre-Decode, Mini-Preview (max 200×200) auf CSS-Checkerboard. Phase-State-Machine: `idle → preparing → converting → done | error`.
- `src/lib/tools/hintergrund-entferner.ts`: Tool-Config mit `prepare`, `defaultFormat: 'png'`, `accept: PNG/JPG/WebP/AVIF/HEIC/HEIF`, `maxSizeMb: 15`, `showQuality: false`.
- `src/content/tools/hintergrund-entfernen/de.md`: ≥800 Wörter SEO-Content (Privacy-Lead-Headline, 6 gelockte H2s, Datenschutz-Sektion nennt Hugging Face CDN explizit).
- Tests: +80 neue (total 159 → 239). Aufteilung: Loader 6, heic-decode 5, remove-background 13, tool-runtime-registry 3, tool-jsonld 6, filetool-format 7, filetool-prepare 5, filetool-input-methods 7, filetool-preview 2, hintergrund-entferner-config 11, content 7 — dazu Preview/Checker-Gegen-Checks und JPG-Re-Encode-Regression.
- Differenzierung: Spec §2.4 Subagent-Recherche, White-Space identifiziert ("pure-client + HEIC + WebP-transparent + Clipboard + Camera + zero-friction").
- Icon-Pipeline (Recraft → BG-Remover → WebP) an `meter-to-feet` real validiert: PNG mit weißem BG, Durchlauf durch `/de/hintergrund-entfernen`, Commit als `public/icons/tools/meter-to-feet.webp`. Pickup automatisch via `existsSync` in beiden Seiten-Templates. STYLE.md § 8 dokumentiert die Konvention.
- Homepage `/de/` auto-enumeriert Content-Collection-Tools zu Cards (Icon + Title + Tagline + Arrow), alphabetisch sortiert, Hover-Mikro-Interaktion, Reduced-Motion-Fallback.
- Rulebooks nachgezogen: STYLE.md § 9.2 (Label-first in Converting), § 10 (tool-hero__icon-Row), § 11 (Reduced-Motion-Spinner-Verhalten); CONVENTIONS.md Loader-Block identisch. Damit sehen Sessions 10+ die heutigen Detail-Regeln ohne den Code rückzulesen.
- Gates: 0/0/0 `astro check`, 239/239 vitest, 5 pages built (`/`, `/de`, `/de/meter-zu-fuss`, `/de/webp-konverter`, `/de/hintergrund-entfernen`).

### Bekannte Follow-ups (nicht blocking für V1)
- **`FileTool.CVNcGKu7.js`-Chunk ist 541 KB** (nicht Hauptbundle, aber shared chunk auf allen Tool-Seiten). Ursache: `tool-runtime-registry.ts` statisch-importiert `remove-background`, wodurch `@huggingface/transformers` in den FileTool-Chunk wandert. `/de/webp-konverter` lädt damit ~530 KB transformers.js ohne sie zu benutzen. Fix-Kandidat: Registry-Einträge könnten selektiv `await import()` verwenden, trade-off gegen Einfachheit der statischen Registry. Verschoben, da `huggingface`-Grep auf "ein einziges Chunk" passt (Plan Step 2 Expected-Case) und Entry-Chunks <25 KB sind.

## Session 8 Deliverables (informell, kein Code-Change)
- Smoke-Test Converter (`/de/meter-zu-fuss`) auf Desktop + Mobile + Light + Dark — alle Achsen ✅
- Smoke-Test FileTool (`/de/webp-konverter`) inkl. Quality-Slider 100 % vs 85 % Vergleich (3.49 MB vs 335 KB) — Slider-Effekt korrekt ✅
- Recraft "premium editorial pencil sketch"-Prompt-Template etabliert nach 2 Versuchen (Generic-Editorial-Prompt → falsches Subjekt; spezifisch adaptierter Template → korrektes Subjekt + Layout)
- `meterZuFuss.iconPrompt` + `pngJpgToWebp.iconPrompt` in src/lib/tools/ auf das Template umgestellt; JSDoc-Pipeline um BG-Removal-Schritt erweitert
- Erkenntnis: Recraft liefert nur weißen Hintergrund → BG-Remover-Tool ist Voraussetzung für die Icon-Pipeline und wird gleichzeitig ein eigenständiges Konverter-Tool auf der Webseite (doppelter Hebel)

## Session 7 Deliverables
- `src/components/tools/FileTool.svelte` (~500 LOC): Single-Card-Morph mit Phase-State-Machine `idle → converting → done | error`. Quality-Slider 40–100, Drag-&-Drop-Dropzone, MIME- + Size-Validierung vor Process-Aufruf, `aria-live="polite"` auf Result-Region, `prefers-reduced-motion`-Fallbacks auf Dropzone/Download/Reset/Slider-Thumb. Tokens-only — kein Hex/arbitrary-px.
- `src/lib/tools/process-registry.ts`: Client-side Dispatch-Tabelle keyed by `config.id`. Löst Astro-SSR-Function-Stripping (Functions in Island-Props serialisieren als `null`). Drei-Touch-Pattern für neue File-Tools dokumentiert (Pure Module + tool-registry-Eintrag + Dispatch-Eintrag).
- `src/pages/[lang]/[slug].astro`: `componentByType`-Map + explizite Conditional-Renders pro Type. Astro droppt `client:load` bei dynamischen Component-Refs silent — Fix verifiziert via Smoke-Test (curl + DOM-Inspektion).
- `src/content/tools/webp-konverter/de.md`: SEO-Content (Title 44 Z., Meta-Desc ~151 Z., Tagline, Intro, 3 How-To-Steps, 5 FAQ, 3 Related, 6 gelockte H2-Headings).
- `tests/components/tools/filetool.test.ts` (10 Tests): MIME-/Size-Reject, Quality-Slider-Pass-Through, .webp-Download, Reset-Pfad, aria-live, Process-Failure. jsdom-25-Workaround dokumentiert (`Blob/File.prototype.arrayBuffer` per-instance gepatcht).
- `tests/content/webp-konverter-content.test.ts` (4 Tests): Frontmatter-Schema, toolId/lang, Body startet mit H2, gelockte H2-Reihenfolge.
- Audit-Pass via `web-design-guidelines`: NBSP (U+00A0) zwischen Zahl und Einheit in `formatBytes()` (`10 MB` statt `10 MB` mit Wrap-Risiko); `prefers-reduced-motion`-Coverage auf Slider-Thumb-Transition ergänzt.
- Recraft-Icon-Prompt im Tool-Config als JSDoc gelockt (siehe `tool-registry.ts`).
- Gates: 0/0/0 `astro check`, 159/159 vitest, 4 pages built (`/`, `/de`, `/de/meter-zu-fuss`, `/de/webp-konverter`).

## Phase-Kickoff-Reminders (Setup-Aufgaben bei Phase-Start)

**Phase 3 — Translation-Kickoff (EN/ES/FR/PT-BR):**
- Spell-Checker-Dictionaries installieren via Antigravity:
  `streetsidesoftware.code-spell-checker-spanish`,
  `streetsidesoftware.code-spell-checker-french`,
  `streetsidesoftware.code-spell-checker-portuguese-brazilian`
  (Englisch ist built-in, DE bereits installiert)
- `.vscode/settings.json` → `cSpell.language` per File-Pattern auf Content-Ordner mappen
  (z. B. `src/content/tools/*/es.md` → `es`, `*/fr.md` → `fr`, `*/de.md` → `de`, usw.)
- `.vscode/extensions.json` → neue Dict-Extensions zu `recommendations` ergänzen

**Phase 5 — Expansion-Kickoff (+8 Sprachen):**
- Dictionaries für IT, NL, SV, PL, TR, NO installieren + File-Pattern erweitern
- **JA + KO:** bewusste Lücke — klassisches Spell-Checking funktioniert nicht (keine Leerzeichen-Tokenisierung). Alternative: textlint-Plugins oder LLM-basierte Content-Audits als separate Infra aufsetzen

**Phase 6 — Scale-Kickoff (bis 30 Sprachen):**
- Restliche EU-Dictionaries nach Bedarf
- Arabisch/Hebräisch/Chinesisch: ähnliche Tokenisierungs-Problematik wie JA/KO, gleiche LLM-Audit-Schiene nutzen

---

## Parked Plans (eingefroren, warten auf Foundation-Abschluss)
- **Persönlichkeitstest-Tool (Big Five) — Phase 2**
  - Plan: [docs/superpowers/plans/2026-04-18-persoenlichkeitstest-tool.md](docs/superpowers/plans/2026-04-18-persoenlichkeitstest-tool.md)
  - Status: am 2026-04-19 finalisiert. R1–R16 (Research-Decisions) + D1–D5 (User-Entscheidungen) gelockt. 20 Tasks + Phase-3-Facet-Outline.
  - Trigger: Execution startet, sobald Phase 0 Sessions 5–10 + Phase-1-Converter-Batch abgeschlossen sind UND mindestens ein anderer Interactive-Tool-Prototyp gelaufen ist.
  - Pickup: Der ausführende Agent arbeitet zuerst die **Pre-Execution Checklist (B1–B9)** im Plan ab und holt explizites User-Go ein (B9), bevor Task 1 startet.

## Phase-1-Lock-ins ✅ alle abgearbeitet (2026-04-19, post-Session-7)
- ✅ `CONVENTIONS.md` v2: Svelte-5-Runes-Pattern (`$state<T>()`-Generics, `data-testid`-Konvention) + neue §Tool-Components (Converter + FileTool als zwei Templates) + neue §File-Tool-Pattern (Drei-Touch) + neue §Astro-Routes + jsdom-25-Workarounds in §Testing.
- ✅ `STYLE.md` v1.2: NBSP-Typography-Rule + neue §9 Tool-Component Layouts (Converter Two-Panel, FileTool Single-Card-Morph) + neue §10 Page-Layout-Rhythmus (40/34/42rem).
- ✅ `[slug].astro` Hydration-Limitation in CONVENTIONS dokumentiert (statische `componentByType`-Map + explizite Conditional-Renders, kein dynamic-component-render).

## Next-Session-Plan

Session 11 — CI/CD + erster Production-Deploy auf Cloudflare Pages (Projekt `konverter-7qc.pages.dev` ist seit Session 1 reserviert). Ziel: GitHub-Action für Build + Test + Pagefind-Index + CF-Pages-Push, Branch-Preview-URLs, HTTPS-Redirect, Custom-Domain-Hook offen lassen für die finale Domain.

**Session 10 — PWA + Pagefind (heute) abgeschlossen:** Manifest + 4 Icon-Variants + Workbox-SW (autoUpdate, runtime-caching HF-CDN + Pagefind) + Pagefind-Build-Step + HeaderSearch-Svelte-Komponente mit Graphit-Token-Overrides + Rulebook-Sync (CONVENTIONS §PWA + §Pagefind, STYLE §12). 252/252 Tests. Offline-Capability + Client-side-Search bereit für Production.
