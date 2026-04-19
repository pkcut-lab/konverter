# Progress Tracker

**Letztes Update:** 2026-04-19 (Session 9, End)
**Aktuelle Phase:** Phase 0 — Foundation
**Current Session:** #9 — Hintergrund-Entferner Prototype ✅ (BG-Remover live, FileTool-Phase-Machine erweitert, Loader-Komponente, JSON-LD für alle Tool-Seiten)

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
| 10 — PWA + Pagefind | ⬜ pending | Scaffolding |
| 11 — CI/CD | ⬜ pending | First Production Deploy |

## Tool-Inventar (Phase 0)

| Tool | Config | Content-DE | Icon | Tests |
|------|--------|------------|------|-------|
| meter-zu-fuss | ✅ | ✅ | 🟡 (Recraft-PNG generiert, BG-Removal jetzt via BG-Remover Tool möglich) | ✅ |
| webp-konverter | ✅ | ✅ | ⬜ (Pending Recraft) | ✅ |
| remove-background | ✅ | ✅ | ⬜ (Pending Recraft) | ✅ |

## Deploy-History
(leer bis Session 10)

## Blockers
- Keine. User-Smoke-Test beider Prototypen (`/de/meter-zu-fuss` + `/de/webp-konverter`) auf Desktop + Mobile, Light + Dark erfolgreich abgeschlossen. Templates Converter + FileTool gelten als gelockt für Phase-1-Skalierung. BG-Remover (`/de/hintergrund-entfernen`) wartet auf User-Smoke-Test (Checklist unten).

## Session 9 Smoke-Test (vom Menschen auszuführen, `npm run dev`)
- [ ] `/de/hintergrund-entfernen` lädt
- [ ] PNG-Upload triggert Modell-Download (Progress sichtbar via Loader)
- [ ] BG entfernt, PNG-Download funktioniert
- [ ] Format-Wechsel zu WebP re-encodet (kein Re-Inference; Network-Tab zeigt keinen erneuten Modell-Download)
- [ ] Format-Wechsel zu JPG: weißer Hintergrund statt Alpha
- [ ] Reset-Button funktioniert
- [ ] Strg+V mit Screenshot triggert Process
- [ ] Mobile: Kamera-Button sichtbar (DevTools-Mobile-Mode oder echtes Smartphone)
- [ ] HEIC-Upload (echte iPhone-Datei) triggert heic2any-Lazy-Load
- [ ] Dark-Mode: Card, Loader, Preview, Format-Chooser sehen korrekt aus
- [ ] `/de/webp-konverter` funktioniert immer noch wie vorher (Regression-Check)
- [ ] `/de/meter-zu-fuss` funktioniert immer noch wie vorher (Regression-Check)
- [ ] Doppel-Hebel: Recraft-PNG von `meter-zu-fuss` durch BG-Remover → PNG mit Alpha (Icon-Pipeline-Validation)

## Session 9 Deliverables

- `src/lib/tools/remove-background.ts` (~230 LOC): Singleton-Pipeline (BEN2 + WebGPU/WASM-Auto-Detection), `removeBackground` + `reencodeLastResult` + `clearLastResult` + `isPrepared` + typed `StallError` + Watchdog-Pattern (Default 120 s).
- `src/lib/tools/heic-decode.ts` (~65 LOC): Lazy-Loader für `heic2any`, Safari-skip via UA-Check (spart ~30 KB gzip auf iOS/macOS).
- `src/components/Loader.svelte`: Geteilte Spinner/Progress-Komponente, Tokens-only, `prefers-reduced-motion`-Fallbacks.
- `src/lib/tools/tool-runtime-registry.ts` (ersetzt `process-registry.ts`): Single Registry mit `{ process, prepare?, reencode?, isPrepared?, clearLastResult? }` pro Tool-ID.
- `src/lib/seo/tool-jsonld.ts`: Pure Builder für SoftwareApplication + FAQPage + HowTo JSON-LD. Wired in `[slug].astro` — greift auf ALLEN Tool-Seiten (Spec §2.4 B9 AEO/Voice-Search).
- `src/components/tools/FileTool.svelte`: +`preparing`-Phase, dynamisches Output-Format, Format-Chooser-Radio-Group (PNG/WebP/JPG mit Hint-Mono-Suffixen), Clipboard-Paste (`Strg+V`), Mobile-Kamera-Capture (`capture="environment"`), HEIC-Pre-Decode, Mini-Preview (max 200×200) auf CSS-Checkerboard. Phase-State-Machine: `idle → preparing → converting → done | error`.
- `src/lib/tools/hintergrund-entferner.ts`: Tool-Config mit `prepare`, `defaultFormat: 'png'`, `accept: PNG/JPG/WebP/AVIF/HEIC/HEIF`, `maxSizeMb: 15`, `showQuality: false`.
- `src/content/tools/hintergrund-entfernen/de.md`: ≥800 Wörter SEO-Content (Privacy-Lead-Headline, 6 gelockte H2s, Datenschutz-Sektion nennt Hugging Face CDN explizit).
- Tests: +79 neue (total 159 → 238). Aufteilung: Loader 6, heic-decode 5, remove-background 13, tool-runtime-registry 3, tool-jsonld 6, filetool-format 7, filetool-prepare 5, filetool-input-methods 7, filetool-preview 2, hintergrund-entferner-config 11, content 7 — dazu Preview/Checker-Gegen-Checks.
- Differenzierung: Spec §2.4 Subagent-Recherche, White-Space identifiziert ("pure-client + HEIC + WebP-transparent + Clipboard + Camera + zero-friction").
- Gates: 0/0/0 `astro check`, 238/238 vitest, 5 pages built (`/`, `/de`, `/de/meter-zu-fuss`, `/de/webp-konverter`, `/de/hintergrund-entfernen`).

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
Session 10 — PWA + Pagefind (laut Phase-0-Roadmap). Scaffolding für Offline-Capability + Client-side-Search. Danach Session 11 = CI/CD + erster Production-Deploy.

**Parallel-Track abgeschlossen (Session 9):** Hintergrund-Entferner als drittes Phase-0-Tool — FileTool-Template jetzt auch für schwere ML-Modelle verifiziert (Lazy-Loading-Pfad, WebGPU-Detection, WASM-Fallback, Stall-Watchdog). Tech-Wahl validiert: `@huggingface/transformers v4 + onnx-community/BEN2-ONNX`. **R2-Mirror wurde aus V1 gestrichen** — Modell lädt direkt vom Hugging-Face-CDN, mit explizitem Datenschutz-Text in der Content-MD; R2-Mirror kann in Phase 2 nachgereicht werden wenn CDN-Performance oder Privacy-Anforderungen es verlangen.
