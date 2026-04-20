# Progress Tracker

**Letztes Update:** 2026-04-20 (Design-Alignment Runde 2c — Homepage-Listing + RelatedTools Compact)
**Aktuelle Phase:** Phase 1 — Skalierung (läuft) · parallel Design-Alignment Runden
**Current Session:** Design-Alignment Runde 2c — Homepage-Cards + RelatedTools.astro auf 4. Approved Baseline (Screen-ID `5e95108ca38e4d0f89bd0cea7d7b00a1`, 1 Stitch-Slot) ✅ · Branch `design/alignment-2c-homepage-and-related` (abgezweigt von 2b-Tip `93425f7`); Deliverables: vertikale 3/2/1-Bento-Grid-Karten in `[lang]/index.astro` (flex-column, 48px-Icon → H3 → Tagline, shadow-sm rest + -md hover, Graphit-Tokens), RelatedTools.astro als Compact-Variante derselben Card (padding `var(--space-4) var(--space-5)` gelockt durch Test, staggered IO-Fade-In), DESIGN.md §4 „Variant: Tool-Listing" + „Variant: Compact" Sub-Specs, DESIGN.md §9 4. Approved Baseline incl. Card-Count-Drift-Fußnote (Baseline 6 Karten / Live-SSR 8 via Auto-Index); 329/329 Tests grün, astro check 0/0/0

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
| 11 — CI/CD | ✅ scaffolded | GitHub Actions + `_headers` + `_redirects` + DEPLOY.md — First Production Deploy wartet auf User-Secrets |

## Phase 1 Fortschritt

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Tool-Cross-Links | ✅ done | `<FooterToolsList>` ersetzt Kategorien-Stubs, `<RelatedTools>` am Fuß jeder Tool-Seite, shared `src/lib/tools/list.ts` Helper, STYLE §14 + CONVENTIONS-§Content-Collection-Enumeration |
| 2 — Homepage-Refactor + Batch-1-DE-Converter | ✅ done | Homepage konsumiert `listToolsForLang`; 5 neue Converter live (cm-to-inch, km-to-mile, kg-to-lb, celsius-to-fahrenheit, sqm-to-sqft) — Config + Content + Registry + Tests, keine Design-Änderungen |

## Design-Alignment (parallel zu Phase 1)

| Runde | Status | Branch | Deliverable |
|-------|--------|--------|-------------|
| 1 — Chrome + Converter | ✅ done | `design/alignment-1-chrome-and-converter` (73b65ce) | Header.astro + Footer.astro (statisch) + Converter.svelte auf Runde-1-Stitch-Baselines; DESIGN.md §4/§8 Spec-Fixes |
| 2a — Integration | ✅ done | `design/alignment-2a-integration` | Merge Phase-1 × Runde-1 × LF-Normalisierung; Kombi-Footer (Live-Liste × Baseline-Styling); stale meter-zu-fuss-Test gefixt |
| 2b — FileTool Done-State | ✅ done (Step 1 von 5) | `design/alignment-2b-expansion` (Tip `93425f7`) | FileTool.svelte internes Done-State auf Baseline `97e004f1*`: Vorher/Nachher + FERTIG-Badge + Meta-Row + konsolidierte Action-Row (Neues Bild / In Zwischenablage / Herunterladen); Clipboard-Copy mit Feature-Detection; aspect-ratio 1/1 gegen CLS |
| 2c — Homepage + Related | ✅ done | `design/alignment-2c-homepage-and-related` (abgezweigt von 2b-Tip `93425f7`) | Stitch-Run Homepage-Tool-Listing (1 Quota-Slot, Screen `5e95108c*`); Homepage-Cards in `[lang]/index.astro` auf vertikalen Flex-Stack (Icon 48px → H3 → Tagline, 3/2/1-Grid, shadow-sm + shadow-md-hover, Graphit-Tokens); RelatedTools.astro als Compact-Variante derselben Card (padding-Lock durch Test, staggered IO-Fade-In beibehalten); DESIGN.md §4 „Variant: Tool-Listing" + „Variant: Compact" Sub-Specs + §9 4. Approved Baseline incl. Card-Count-Drift-Fußnote (6 Baseline / 8 Live-SSR). Page-level „So funktioniert es"-Sidebar + kbd-chips aus FileTool-Baseline (Layout-Arbeit in `[slug].astro`) bewusst auf Runde 2d vertagt — §5 Max-Width-Policy vs. 2-Col-Sidebar muss erst in DESIGN.md geklärt werden |
| 2d — Tool-Detail-Page-Layout | ⬜ geplant | folgt (abgezweigt von 2c-Tip) | Page-level Bento-Sidebar („So funktioniert es" 01/02/03 + Datenschutz) + kbd-chips-Zeile aus FileTool-Baseline (`97e004f1*`); Layout-Arbeit in `src/pages/[lang]/[slug].astro`; Vorbedingung: DESIGN.md §5 Max-Width-Policy vs. 2-Col-Sidebar klären |

## Tool-Inventar

| Tool | Phase | Config | Content-DE | Icon | Tests |
|------|-------|--------|------------|------|-------|
| meter-zu-fuss | 0 | ✅ | ✅ | ✅ (`public/icons/tools/meter-to-feet.webp`, 313 KB, Alpha) | ✅ |
| webp-konverter | 0 | ✅ | ✅ | ⬜ (Pending Recraft → BG-Remover → `public/icons/tools/png-jpg-to-webp.webp`) | ✅ |
| remove-background | 0 | ✅ | ✅ | ⬜ (Pending Recraft → BG-Remover → `public/icons/tools/remove-background.webp`) | ✅ |
| zentimeter-zu-zoll | 1 | ✅ | ✅ | ⬜ (Pending Recraft `cm-to-inch` ruler-mit-Inch-Marken) | ✅ |
| kilometer-zu-meilen | 1 | ✅ | ✅ | ⬜ (Pending Recraft `km-to-mile` road-with-marker) | ✅ |
| kilogramm-zu-pfund | 1 | ✅ | ✅ | ⬜ (Pending Recraft `kg-to-lb` balance-scale) | ✅ |
| celsius-zu-fahrenheit | 1 | ✅ | ✅ | ⬜ (Pending Recraft `celsius-to-fahrenheit` thermometer) | ✅ |
| quadratmeter-zu-quadratfuss | 1 | ✅ | ✅ | ⬜ (Pending Recraft `sqm-to-sqft` floor-plan) | ✅ |

## Deploy-History
- **2026-04-19, Session 11:** CI/CD scaffolded (`.github/workflows/deploy.yml` mit verify→deploy, Wrangler-Action v3, Concurrency-Guard). Edge-Config (`public/_headers` + `public/_redirects`) committed. **Blockiert durch User-Aktion:** Cloudflare-API-Token + Account-ID müssen als GitHub-Repo-Secrets gesetzt werden (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). Checkliste in [DEPLOY.md](DEPLOY.md). Nach Setzen der Secrets → nächster Push auf main → automatischer Production-Deploy auf `konverter-7qc.pages.dev`.

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

## Phase-1 Session 1 Deliverables

- **Tokens (`src/styles/tokens.css`):** +4 neue Design-Tokens für Cross-Link-Komponenten — `--space-5: 1.25rem` (dual-purpose: löst außerdem einen pre-existing silent-fallback Bug auf der Homepage-Grid `src/pages/[lang]/index.astro:172`, die bereits `var(--space-5)` konsumierte ohne Definition), `--icon-size-md: 48px` (RelatedTools-Card-Thumbnail), `--stagger-step: 60ms` (IntersectionObserver-Kaskade), `--underline-offset: 2px` (focus-visible + hover-underline).
- **`src/lib/tools/list.ts` (neu, ~60 LOC):** Single-Source-of-Truth-Helper für jede Enumeration der Content-Collection — exportiert `listToolsForLang(lang)` (alle Tools für eine Sprache, alphabetisch nach `tagline`), `resolveRelatedTools(lang, localizedSlugs)` (löst Array von lokalisierten Slugs zu `ToolListItem[]` auf, preserviert Input-Order, droppt forward-looking Refs silent), und das `ToolListItem`-Interface `{toolId, title, tagline, href, iconRel, hasIcon}`. Ersetzt damit zwei parallele Implementierungen (FooterToolsList + RelatedTools). Testinfrastruktur: `tests/stubs/astro-content.ts` + vitest-resolveId-Plugin `vitest-stub-astro-content` (mit `enforce: 'pre'`), damit das virtuelle `astro:content`-Modul unter vitest resolvable ist. 6 Unit-Tests decken beide Funktionen + Edge-Cases ab.
- **`src/components/FooterToolsList.astro` (neu):** ersetzt den `Kategorien (bald)`-Stub in `Footer.astro`. Listet maximal 8 Tools der aktuellen Sprache, bei mehr als 8 folgt eine Overflow-Link-Zeile `+\u00A0${overflow} weitere Werkzeuge →` zur Homepage `/${lang}/`. H2 „Werkzeuge" mit eigenem scoped styling (Astro scoped styles traversieren keine Component-Boundaries — die Footer-scoped h2-Regel greift hier nicht). Focus-visible mit 2px-Outline, `prefers-reduced-motion` respektiert. Tokens-only, 1px-border, Refined-Minimalism clean.
- **`src/components/Footer.astro` (surgical):** 2 Import-Zeilen + eine `<FooterToolsList lang={lang as Lang} />` ersetzt den Kategorien-Stub. Rechtliches-Spalte + Meta-Zeile bleiben unverändert.
- **`src/components/RelatedTools.astro` (neu, ~180 LOC):** mountet am Fuß jeder Tool-Seite als Sibling nach `</article>`, vor `</div class="tool-page">`. `<h2 id="related-heading">Verwandte Tools</h2>`, `aria-labelledby="related-heading"`. Conditional-Wrap `{tools.length > 0 && ...}` — wenn keine resolvablen Related-Tools vorhanden (z. B. alle forward-looking), rendert der Block nichts. Grid `auto 1fr`, Icon `var(--icon-size-md)`, Card-Padding `var(--space-4) var(--space-5)`, max-width `60rem`. IntersectionObserver-Inline-Script mit `prefers-reduced-motion` + IO-undefined Guards für Stagger-Fade-In. `:global([data-theme='dark']) .related-tools img { filter: invert(1); }` konsistent mit Homepage-Cards.
- **`src/pages/[lang]/[slug].astro` (surgical diff):** 1 Import-Zeile + 1 Mount-Zeile `<RelatedTools lang={entry.data.language} relatedSlugs={entry.data.relatedTools} />`. Keine Änderung an der Converter/FileTool-Dispatch-Logik.
- **Content-Cleanup:** `src/content/tools/{hintergrund-entfernen,meter-zu-fuss,webp-konverter}/de.md` — hand-authored `## Verwandte Tools` / `## Verwandte Konverter` Markdown-Sektionen mit hardcoded forward-looking 404-Links entfernt. Fix gefunden via finaler Code-Review: `/de/hintergrund-entfernen` hätte sonst „Verwandte Tools" zweimal gerendert (einmal aus Markdown, einmal aus Component) mit Phase-1-Slug-Links, die noch nicht existieren. `<RelatedTools>` ist jetzt Single-Source-of-Truth; `relatedTools` im Frontmatter ist die einzige Definitionsstelle.
- **Tests:** +31 neue (total 258 → 289). Aufteilung: list.ts unit 6, footer-tools-list 4, related-tools source-inspection 6, content-regex updates 2, smoke-build-cross-links 8, tool-content-heading-updates 5 (Meter-zu-Fuß + WebP-Konverter: „5 locked H2 headings" statt 6, `Verwandte Konverter` aus erwarteter Liste entfernt). Test-Pyramide: Source-Inspection + Data-Side-Mock statt Astro Container API (inkompatibel mit vitest node/jsdom environment — dokumentiert in Task-5-Plan).
- **Rulebooks:** `STYLE.md` +§14 Cross-Link-Muster (Footer-Werkzeuge-Section + RelatedTools-Block — §14 statt §13, weil §13 bereits Skill-Integration belegt, referenziert aus CLAUDE.md §5). `CONVENTIONS.md` +§Content-Collection-Enumeration (Pflicht-Import aus `src/lib/tools/list.ts`, keine parallelen `getCollection('tools')`-Aufrufe in neuen Components).
- **Gates:** 0/0/0 `astro check`, 289/289 vitest, Build grün (alle 5 Pages rendern FooterToolsList + `/de/{meter-zu-fuss,webp-konverter,hintergrund-entfernen}` RelatedTools-Block inkl. Dark-Mode-Icon-Inversion). web-design-guidelines-Audit-Pass auf beide neue Components clean.
- **Workflow-Dokumentation:** Plan `docs/superpowers/plans/2026-04-19-tool-cross-links-implementation.md` (nach 4 plan-document-reviewer-Fixes final), 7 Tasks via subagent-driven-development ausgeführt, je zwei-Stage-Review (spec-compliance + code-quality) pro Task, finaler Code-Review fand Content-Duplication-Regression (siehe oben).

### Bekannte Follow-ups (nicht blocking)
- **Homepage `src/pages/[lang]/index.astro`-Enumerator** ✅ erledigt in Phase-1 Session 2 — Datei konsumiert jetzt `listToolsForLang`. Eintrag bleibt zur Historie.
- **`RelatedTools.astro` `<style>`-Block** liegt technisch außerhalb des Conditional-Wraps `{tools.length > 0 && (...)}`. Kosmetisch: CSS wird auch dann emittiert, wenn der Block gar nicht rendert. Impact ≈ 1 KB, Astro scoped CSS bleibt ohne Match-Target inert. Advisory, kein Fix nötig.

## Phase-1 Session 2 Deliverables

- **Homepage-Refactor (`src/pages/[lang]/index.astro`):** ersetzt den Session-9-Inline-Enumerator (lokales `getCollection('tools')` + `.filter(lang)` + `.map(...)` + `.sort(tagline)`, ~22 LOC) durch `const tools = await listToolsForLang(lang)` (1 LOC) — derselbe Single-Source-of-Truth-Helper, den Session 1 für FooterToolsList + RelatedTools eingeführt hat. JSX und Styles unverändert. Damit erfüllt die Homepage die in Session 1 angelegte CONVENTIONS-§Content-Collection-Enumeration-Regel und der dort als „nicht blocking" notierte Refactor-Kandidat ist erledigt.
- **5 neue DE-Konverter (Batch-1) — alle nach gelocktem Tool-Add-Pattern:**
  - **`zentimeter-zu-zoll`** (`cm-to-inch`): linear `factor: 0,3937007874`, `decimals: 4`, examples `[1, 10, 30, 100]`. Content nennt 1959er Yard-und-Pfund-Abkommen + 5'11"-Konvertierung + 15"-Display-Diagonale. relatedTools `[meter-zu-fuss, kilometer-zu-meilen, quadratmeter-zu-quadratfuss]`.
  - **`kilometer-zu-meilen`** (`km-to-mile`): linear `factor: 0,6213711922`, `decimals: 4`, examples `[1, 5, 42.195, 100]` (Marathon explizit als example-Wert). Content erklärt nautische-Meile-Distinktion, mph-Tacho-Umrechnung, Yard-Referenz. relatedTools `[meter-zu-fuss, zentimeter-zu-zoll, quadratmeter-zu-quadratfuss]`.
  - **`kilogramm-zu-pfund`** (`kg-to-lb`): linear `factor: 2,2046226218`, `decimals: 4`, examples `[1, 5, 70, 100]`. Content erklärt avoirdupois-Pfund vs deutsches-500-g-Pfund, Stone-Mention, US-Body-Weight-Kontext. relatedTools `[meter-zu-fuss, zentimeter-zu-zoll, celsius-zu-fahrenheit]`.
  - **`celsius-zu-fahrenheit`** (`celsius-to-fahrenheit`): **affine** `formula: { type: 'affine', factor: 1.8, offset: 32 }` — erstes Phase-1-Tool das die affine Formel-Variante der Session-4-Discriminated-Union nutzt; `decimals: 2`, examples `[-40, 0, 20, 37, 100]` (inkl. negativem Wert + −40-Schnittpunkt). Content erklärt Daniel Fahrenheits Nullpunkt-Wahl, −40-Schnittpunkt als Sanity-Check, Fieber- und Ofen-Schwellen. relatedTools `[kilogramm-zu-pfund, meter-zu-fuss, zentimeter-zu-zoll]`.
  - **`quadratmeter-zu-quadratfuss`** (`sqm-to-sqft`): linear `factor: 10.7639104` (vorquadriert: 3,28084²), `decimals: 4`, examples `[1, 10, 50, 100]`. Comment im Config-File dokumentiert, dass der Faktor das Quadrat des linearen Fuß-zu-Meter-Faktors ist. Content erklärt Zwei-Dimensionen-Regel, deutsche WoFlV vs ANSI Z765, Mietvertrags-10%-Toleranz. relatedTools `[meter-zu-fuss, zentimeter-zu-zoll, kilometer-zu-meilen]`.
- **Registry/Slug-Map-Updates:** `src/lib/slug-map.ts` +5 Einträge (`cm-to-inch`/`km-to-mile`/`kg-to-lb`/`celsius-to-fahrenheit`/`sqm-to-sqft` → DE-Slug); `src/lib/tool-registry.ts` +5 Imports + 5 Registry-Einträge passend zu slug-map. Keine Touch an `tool-runtime-registry.ts` (rein Converter-Tools, kein File-Tool-Process-Pfad nötig).
- **Tests:** +40 neue (total 289 → 329, +40). Aufteilung: 5× Tool-Config (`tests/lib/tools/<slug>.test.ts`, je 4 Tests = Schema, Identity, Formula-Shape, iconPrompt) = 20; 5× Content (`tests/content/<slug>-content.test.ts`, je 4 Tests = Schema, toolId/lang, Body-startet-mit-H2, gelockte-5-H2-Reihenfolge) = 20.
- **Content-Pattern-Lock:** alle 5 neuen Inhalte folgen exakt dem 5-H2-Pattern (Was/Formel/Anwendungsbeispiele/Häufige Einsatzgebiete/Häufige Fragen), 4–5 FAQ-Einträge, Tabelle mit zweispaltigem Hin-/Rückweg, Faustregel-Sektion in `## Umrechnungsformel`. metaDescription strikt im 140–160-Zeichen-Korridor (Zod-Schema-Constraint), title 30–60 Zeichen.
- **YAML-Quoting-Fix:** zwei Hot-Fixes nach erstem Test-Run — German-Quote-Style „...\" innerhalb double-quoted YAML-Strings braucht `\"` Escape (sonst terminiert das innere `"` den YAML-String vorzeitig). Betraf `kilometer-zu-meilen` (`„26.2"` Marathon-FAQ) und `celsius-zu-fahrenheit` (`„high fever"` Fieber-FAQ). Konvention für künftige Inhalte: deutsche Anführungszeichen mit `\"` als Schluss-Token escapen. Pattern aus zentimeter-zu-zoll (`5'11\"`) extrapoliert.
- **Gates:** 0/0/0 `astro check`, 329/329 vitest, Build grün — `dist/de/{zentimeter-zu-zoll,kilometer-zu-meilen,kilogramm-zu-pfund,celsius-zu-fahrenheit,quadratmeter-zu-quadratfuss}` rendern, 10 Pages total (5 alte + 5 neue), Pagefind-Index 1 Sprache / 10 Pages / 1.732 Wörter (vorher 1.046 Wörter → +66 % Index-Wachstum), Sitemap enthält die 5 neuen URLs.
- **Bewusst nicht angefasst:** Templates (Converter.svelte unverändert), Design-Tokens, Layout-Komponenten, Style-Files. User hat parallelen Design-Agenten am Laufen, der die Optik refiniert — diese Session bleibt strikt im Daten-Layer (Configs, Markdown-Inhalte, Slug-Map, Registry, Tests). Wenn der Design-Agent fertig ist, wird sich die Optik der 5 neuen Tools automatisch mit-updaten, ohne Re-Touch der Configs/Inhalte.

## Design-Alignment Runde 2a Deliverables (2026-04-20)

- **Branch-Strategie:** `design/alignment-2a-integration` von `phase-1/session-2-batch-1-converters`. Zwei Merges (`tooling/stitch-integration` für DESIGN.md + Stitch-SDK; `chore/git-line-endings` für `.gitattributes`-LF-Enforcement). Drei Cherry-Picks aus Runde 1: `d5a509a` (DESIGN.md-Spec-Fix Header/Converter/ThemeToggle), `b80eca6` (Header 5-Slot-Grid + 3-DE-Nav), `77cefe9` (Converter.svelte horizontal two-column mit `=`-Separator). Explizit **nicht** cherry-gepickt: `3bca688` (alter statischer Runde-1-Footer) — durch Kombi-Footer ersetzt.
- **LF-Normalisierung:** `.gitattributes` greift per Merge; Working-Tree-Re-Checkout über `git reset --hard HEAD` erzwingt LF auf bereits getrackte Files mit CRLF (z.B. `src/content/tools/hintergrund-entfernen/de.md` — Root-Cause für die pre-existing `hintergrund-entfernen-content.test.ts`-Failure ist damit erledigt).
- **Kombi-Footer (`src/components/Footer.astro`):** Phase-1-Live-Liste bleibt in Spalte 1 (Sub-Component `<FooterToolsList lang={lang as Lang}>` — unangetastet, weil Tests die Source asserten). Spalten 2 (Rechtliches) und 3 (Meta) übernehmen das Runde-1-Class-Idiom: `.col / .col__heading / .col__list / .col__link / .col__link--disabled` statt `<span class="stub">`, `aria-disabled="true"` + `tabindex="-1"` + `pointer-events: none`, `<span translate="no">` um Sprachcode in Meta. `background: transparent` (statt `--color-surface`) — Hairline-Top als einzige Struktur per DESIGN.md §6. Mobile-Breakpoint auf 40rem vereinheitlicht. Focus-Visible mit `--color-accent` + `--space-1`-Offset + `--r-sm`.
- **Stale-Test-Fix (`tests/smoke/build.test.ts`):** `meter-zu-fuss suppresses the section` war valid als nur 3 DE-Tools existierten (Session-1, `b29ad95`). Phase-1 Session-2 (`5abc442`) lieferte `zentimeter-zu-zoll`, `kilometer-zu-meilen`, `quadratmeter-zu-quadratfuss` — ab da resolven alle drei relatedSlugs von meter-zu-fuss. Test geflippt auf "renders 3 resolvable Längen-Tools". `webp-konverter`-Assertion bleibt (`jpg-zu-png`, `bild-komprimieren`, `bild-groesse-aendern` weiter forward-looking).
- **Automatische Runde-1-Vererbung auf die 5 Phase-1-Converter:** Weil alle `Converter.svelte` reusen, greift die Runde-1-Alignment automatisch. Browser-verifiziert via `npm run preview` auf `/de/meter-zu-fuss` + `/de/celsius-zu-fahrenheit` — beide zeigen `converter-label-from/to`, `converter-output`, `converter-swap`, `converter-copy`, `.converter__separator`, 4× `.kbd-chip`, Runde-2a-Footer (2× `.col`, 2× `.col__heading`, 2× `.col__link--disabled`), Runde-1-Header + FooterToolsList + `translate="no"` auf Lang-Codes. Keine neuen Tests nötig — Datei-Level-Tests decken durch Converter-Dispatch alle 6 DE-Converter ab.
- **Audit-Pass (web-design-guidelines-Prinzipien):** Footer.astro + FooterToolsList.astro clean bis auf zwei pre-existing Token-Inkonsistenzen in FooterToolsList.astro (`outline-offset: 2px` statt `var(--space-1)`, `outline: ... var(--color-text)` statt `var(--color-accent)`). Projekt-weit uneinheitlich (7× `2px`, 4× `var(--space-1)`), daher kein klarer Hard-Cap-Verstoß — verschoben nach Runde 2b als Codebase-Token-Cleanup-Kandidat.
- **Gates:** 329/329 vitest (+7 gegen Phase-1-Session-2-Stand — stale `suppresses`-Test wurde zu drei Slug-Checks, plus CRLF-Failure eliminiert), 0/0/0 `astro check`, `npm run build` grün, Preview-Verifikation sauber.

### Runde 2a Commits

- `022da31` merge: tooling/stitch-integration into 2a-integration
- `be397d5` docs(design): resolve Header, Converter, and ThemeToggle spec mismatches *(cherry-pick)*
- `b80eca6` feat(header): align to DESIGN.md §4 — 3 DE-nav + 5-slot grid *(cherry-pick)*
- `77cefe9` feat(converter): align card to DESIGN.md §4 — two-column desktop with = separator *(cherry-pick)*
- `96f9116` merge: chore/git-line-endings into 2a-integration
- `e157d06` feat(footer): combine Phase-1 live tools list with Runde-1 baseline styling
- `493c753` test(smoke): meter-zu-fuss renders RelatedTools after Phase-1 Batch-1

### Carry-over nach Runde 2b

- FileTool.svelte auf Baseline `stitch-output/2026-04-19T20-46-42-97e004f183ed4b5f8b42bb47e82457e1/` (Hintergrund-Entferner Result-State: Bento-Sidebar mit 01/02/03-Steps, Status-Badge "FERTIG", Meta-Zeile `WIDTH×HEIGHT · FORMAT · SIZE`, Vorher/Nachher-Grid mit Schachbrett-Transparenz, DSGVO-Banner)
- Homepage-Cards (`src/pages/[lang]/index.astro`) auf Tool-Listing-Baseline — Stitch-Run steht aus
- `RelatedTools.astro` Card-Idiom-Angleichung an DESIGN.md §4 (aktuell inline grid, soll auf Baseline-Card-Pattern)
- FooterToolsList.astro Token-Cleanup (`outline-offset: 2px` → `var(--space-1)`, `outline: ... var(--color-text)` → `var(--color-accent)`) — optional, im Zuge einer codebase-weiten Token-Konsistenz-Session

## Design-Alignment Runde 2b Deliverables (2026-04-20)

Branch `design/alignment-2b-expansion` von 2a-Tip `25ac976`, Tip `93425f7`. Scope nach dem user-Stop-Rule von 5 Schritten auf Step 1 (FileTool-interne Done-State) reduziert — Steps 2–5 in Runde 2c geschoben.

### Step 1 ✅ — FileTool.svelte Done-State

Einziger Commit `93425f7` · Surgical Rewrite des internen Done-States auf Stitch-Baseline `97e004f1*` (Hintergrund-Entferner Result).

- **2-Spalten-Grid Vorher/Nachher:** ORIGINAL + ERGEBNIS als `<figure class="compare__col">` mit mono-uppercase-`<figcaption>`. Desktop (≥40rem) 2-Col mit 1px-Hairline zwischen Spalten (`border-left: 1px solid var(--color-border)`); Mobile 1-Col gestackt mit `border-top`. `.preview`-Wrapper auf ERGEBNIS-Spalte trägt weiter das Schachbrett-Pattern (Alpha-Kanal-Visualisierung für PNG/WebP). `aspect-ratio: 1 / 1` auf beiden Frame-Wrappern verhindert CLS beim Blob-URL-Load.
- **Status-Badge „FERTIG":** top-right absolute, mono · uppercase · `letter-spacing: 0.08em`, mit `var(--color-success)`-Dot (`var(--space-2)` × `var(--space-2)`, 9999px-radius), `aria-label="Status: fertig"`.
- **Meta-Row:** mono · tabular-nums · dot-separiert: `WIDTH×HEIGHT · FORMAT · SIZE · −X%`. Dimensions via `createImageBitmap(blob)` (null-safe try/catch — in jsdom gibt's keine Implementierung). Reduktions-Prozent nur wenn `>0`, eingefärbt in `var(--color-success)`.
- **Konsolidierte Action-Row:** `Neues Bild` (ghost) · `In Zwischenablage` (ghost, Feature-Detect für `ClipboardItem` + `navigator.clipboard.write`, Label-Flip „Kopiert"/„Nicht unterstützt" nach 1800ms) · `Herunterladen` (primary filled, mit Download-SVG-Icon). Ersetzt die alte getrennte `reset+download`-Zeile ohne Clipboard-Option.
- **Source-URL:** `URL.createObjectURL(file)` für die ORIGINAL-Spalte, in `reset()` revoked. HEIC-Dateien rendern ohne Safari-Fallback als Broken-Image (Browser ohne native HEIC-Unterstützung) — akzeptiert, da Runde 1 HEIC nur als Input-Format und die Vorher-Spalte kein Hard-Cap ist.
- **Preparing-, Converting-, Error-Phasen:** unverändert (Loader-Spinner, Prepare-Progress, Error-Box).

### Test-Layer — bewahrte Invarianten

Alle 16 `data-testid`-Anker unverändert: `filetool-dropzone`, `filetool-meta`, `filetool-input`, `filetool-camera-input`, `filetool-preparing`, `filetool-status` (wandert auf das `<article class="card">` im Done-State), `filetool-preview`, `filetool-format-chooser`, `filetool-format-{png,webp,jpg}`, `filetool-quality`, `filetool-result`, `filetool-error`, `filetool-download`, `filetool-reset`, `loader-progress-label`. `.preview`-Klasse bleibt auf dem direkten Parent von `filetool-preview`-img (Test `filetool-preview.test.ts:71` asserts `parentElement.className.match(/preview/)`).

**1 Test-Assertion geflipped:** `filetool-input-methods.test.ts` — „paste in non-idle ignored" testet jetzt relativ (`callsAfterFirst === callsAfterSecond`), weil Done-State jetzt 2 Object-URLs pro Upload erzeugt (Source + Output) statt 1. Semantisch korrekt — ein zweiter Paste in der Done-Phase darf die Pipeline nicht erneut starten, und genau das misst die relative Assertion.

### Gates

- `npx vitest run` → 329/329 grün (inkl. 40/40 `filetool*`-Tests, Converter + Content + Smoke).
- `npx astro check` → 0 errors / 0 warnings / 0 hints.
- `npm run build` → grün, 10 Pagefind-indexed Pages.
- Preview-SSR auf `http://localhost:4325/de/hintergrund-entfernen` liefert korrekte Idle-State-Markup (`<h1>Hintergrund entfernen — direkt im Browser</h1>` + `class="filetool svelte-1tgt0o8"` + alle Dropzone-Testids). Interaktive Done-State-Verifikation (Datei droppen, Badge + Vorher/Nachher sichten) nicht automatisiert durchgeführt — kein Headless-Driver in devDeps; empfohlen manuell vor dem Push von Runde 2c zu sichten.
- Audit-Pass (web-design-guidelines + Hard-Caps CLAUDE.md §5): clean. `outline: none` auf `.quality__slider` ist pre-existing und paart sich mit einer `:focus-visible`-Regel — konform. Keine Hex-Farben, alle Transitions via `var(--dur-fast)` + `var(--ease-out)`, `prefers-reduced-motion` respektiert.

### Commits

- `93425f7` feat(filetool): align done-state to DESIGN.md baseline 97e004f1 — Vorher/Nachher + FERTIG badge + meta-row

### Carry-over nach Runde 2c

- **Step 2** — Stitch-Run Homepage-Tool-Listing (1 Quota-Slot, Prompt in `scripts/stitch/generate.mjs`): 3-Col Desktop · 2-Col Tablet · 1-Col Mobile · DE-Labels · ohne Hero-Background · Bento-Grid aus DESIGN.md §9.
- **Step 3** — Homepage-Cards (`src/pages/[lang]/index.astro`) an neue Stitch-Baseline angleichen.
- **Step 4** — `RelatedTools.astro` als compact-scaled Variante desselben Card-Idioms (kein eigener Stitch-Run, skaliert Homepage-Card herunter).
- **Step 5** — DESIGN.md-Updates: §9 4. Approved-Baseline (Homepage-Listing) + §4 „Variant: compact (RelatedTools)"-Sub-Spec.
- **Bonus (nicht zwingend)** — FileTool-Baseline hat eine page-level Bento-Sidebar („So funktioniert es" 01/02/03 + Datenschutz) + kbd-chips-Zeile unter dem Card. Die gehören NICHT in FileTool.svelte, sondern in `src/pages/[lang]/[slug].astro` (oder ein Tool-Detail-Layout). Wegen des user-Stop-Rules aus 2b in 2c oder später eingeplant; Risiko: §5 Max-Width-Policy vs. 2-Col-Sidebar-Layout muss erst in DESIGN.md §5 geklärt werden.

### Bekannte Follow-ups (nicht blocking)
- **Recraft-Icons für die 5 neuen Tools** stehen aus. Pipeline ist live (`Recraft → /de/hintergrund-entfernen → public/icons/tools/<toolId>.webp`). Auto-Pickup via `existsSync` in beiden Templates greift sobald die WebP-Datei droppt — keine Code-Änderung nötig. Reihenfolge offen, üblicherweise nach Search-Volume.
- **Differenzierungs-Sektion (CLAUDE.md §6)** wurde für diese Standard-Lineare-Konverter-Batch nicht eigens formuliert. Begründung: §6 ist auf Spec-Level für neue Tool-Typen verfasst; einfache Maßeinheits-Konverter folgen dem Meter-zu-Fuß-Vorbild und teilen denselben Differenzierungs-Acl (pure-client + zero-friction + ohne-Tracking). Re-Evaluation-Trigger: erstes Phase-1-Tool das aus dem Standard-Converter-Pattern ausbricht (z. B. ein Generator oder Validator).

## Session 11 Deliverables

- **`.github/workflows/deploy.yml`** (überschreibt den Session-1-Stub): zwei Jobs `verify` + `deploy`. `verify` = checkout → setup-node (von `.nvmrc` = 20.11.1) → npm ci → `npm run check` → `npm test` → `npm run build` → artifact-upload. `deploy` = artifact-download → `cloudflare/wrangler-action@v3` mit `pages deploy dist --project-name=konverter-7qc --branch=${{ github.head_ref || github.ref_name }}` → dynamisches Branch-Flag macht main-push zu Production, PRs zu `<branch>.konverter-7qc.pages.dev`-Preview. `concurrency: deploy-${ref}, cancel-in-progress: true` verhindert Races auf gleichem Ref. Fork-PRs werden skipped (keine Secrets dort).
- **`public/_headers`** (Cloudflare-Pages-Syntax): `/sw.js` und `/registerSW.js` → `no-cache` (sonst klemmt Workbox-skipWaiting). `/_astro/*` + `/fonts/*` → `max-age=31536000, immutable` (hashed/benannt-stabil). `/icons/*` → 1 Woche, `/pagefind/*` + `/manifest.webmanifest` → 1 h, `/favicon-32.png` + `/icon.svg` → 1 Tag. Security-Baseline auf `/*`: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (Kamera self, interest-cohort aus).
- **`public/_redirects`:** `/ /de/ 301` ersetzt den Astro-Meta-Refresh-Stub durch einen Edge-Level-301 — schneller, SEO-besser (passt Canonical-Signal durch), überlebt Edge-Caches. Phase-3-Trigger: per-Accept-Language-Negotiation, wenn EN/ES/FR/PT-BR live.
- **Canonical-URL-Fix:** `astro.config.mjs` `site` und `src/lib/site.ts` `SITE_URL` von `konverter.pages.dev` (nie existiert) auf `konverter-7qc.pages.dev` (Session-1-Reservierung) umgestellt. Verifiziert via `dist/sitemap-0.xml` + `dist/sitemap-index.xml` — alle Tool-URLs zeigen jetzt auf den tatsächlichen Deploy-Origin. Kommentar im `site:`-Block dokumentiert den One-Line-Flip bei späterem Custom-Domain-Wechsel.
- **`DEPLOY.md`** (neu): One-Time-Setup-Checklist für den User. 5 Schritte: (1) CF-API-Token im Dashboard via "Edit Cloudflare Pages"-Template erstellen, (2) Account-ID kopieren, (3) GitHub-Secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` setzen (dash.github.com oder `gh secret set`), (4) CF-Projekt-Settings prüfen (Production-Branch `main`, Build leer), (5) erster Push auf main. Plus: laufender PR-Workflow, Deploy-Status via `gh run list/watch`, Hotfix-Escape via lokalem `npx wrangler pages deploy`, zukünftige Custom-Domain-Flip-Anleitung.
- **Tests:** +6 neue (total 252 → 258). `tests/smoke/deploy.test.ts`: site-Canonical matcht in astro.config + site.ts, `_headers` pinnt SW-no-cache + _astro-immutable + fonts-immutable + manifest-3600 + Security-Header-Trio, `_redirects` hat `/ /de/ 301`, Workflow hat zwei Jobs mit `needs: verify`, npm-ci/check/test/build-Schritte, wrangler-action@v3 + project-name=konverter-7qc + dynamic-branch-flag + concurrency-guard, DEPLOY.md dokumentiert beide Secret-Namen + Projekt-Name.
- **Gates:** 0/0/0 `astro check`, 258/258 vitest, Build grün mit `dist/_headers` + `dist/_redirects` + korrektem Sitemap-Canonical.

### Phase 0 insgesamt

Alle 11 Sessions abgeschlossen. Was für Phase 1 (Tool-Skalierung, AdSense, mehr DE-Tools) bereitsteht:

- **Templates gelockt:** Converter (`Converter.svelte`, Session 6), FileTool (`FileTool.svelte`, Session 7 + 9). Drei reale Prototypen validiert (`/de/meter-zu-fuss`, `/de/webp-konverter`, `/de/hintergrund-entfernen`).
- **Design-System gelockt:** Graphit-Tokens + Inter + JetBrains Mono self-hosted, STYLE.md v1.2, Refined-Minimalism mit Hard-Caps über allen Skills.
- **Tool-Config-Foundation gelockt:** Zod-Schemas für 9 Typen, slug-map, Content-Collection mit SEO-Content-Regeln, auto-Icon-Pickup via `existsSync`.
- **PWA + Pagefind live:** Offline-Capability, Client-side-Search. Lazy-Chunks (FileTool, heic2any, transformers) aus Precache, Runtime-Caching für HF-Modell-CDN.
- **CI/CD scaffolded:** jeder Push auf main → gated Production-Deploy, jeder PR → Preview-URL. Wartet nur noch auf die zwei GitHub-Secrets.
- **Rulebooks vollständig:** PROJECT (Deps), CONVENTIONS (Code + PWA + Pagefind), STYLE (Tokens + Templates + Pagefind-UI), CONTENT (SEO), TRANSLATION (i18n-Flow).
- **Non-Negotiables stehen:** Privacy-First (kein Tracking, kein Server-Upload außer 7a), WCAG-AAA-Contrast, Session-Continuity via Rulebooks, pkcut-lab Git-Lock.

### Bekannte Follow-ups (carry-over in Phase 1)

- **Erster Production-Deploy** wartet auf User-Secrets (DEPLOY.md).
- **`FileTool.*.js`-Chunk 541 KB** (Session 9 → jetzt aus SW-Precache ausgeschlossen, Bundle-Split selbst weiter offen).
- **Session-9-Smoke-Test-Checklist** hat noch offene Items (Reset-Button, Strg+V, Mobile-Kamera, HEIC, Dark-Mode-Cross-Check, Regression auf andere Tools, Homepage-Cards-Verhalten) — user-executable, kein Agent-Task.
- **Pagefind-UI-Style-Flash** theoretisch möglich wenn CSS später lädt als JS. Fix-Kandidat: `<link rel="preload" as="style">` in BaseLayout wenn in Prod sichtbar.

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

## Paperclip-Preparation (Phase-1 Vorarbeit für Phase-2-Aktivierung)

**Status:** Pickup-ready. Aktivierungs-Trigger = Phase 2 Session 1 (sobald AdSense + 20-Tool-Batches starten).

**Kontext:** NotebookLM-Research am 2026-04-19 im Notebook *"Paperclip: The Orchestration Layer for Zero Human Companies"* hat die vorherige "Phase 5"-Memory-Version revidiert — Paperclip-ROI setzt bei ~10–20 Tools/Woche ein, also sobald Templates gelockt + Deploy grün + AdSense-Readiness steht.

**Artefakte unter `docs/paperclip/` (13 Dateien):**

- `README.md` — Index + 6 Hard-Prerequisites (Template-Stability, Eval-Rubric, Rulebooks fixed, Git-Lock, Test-Gate, Budget-Cap $0 Tripwire) + Activation-Checklist + Abgrenzung zu Claude-Code-Subagenten.
- `ONBOARDING.md` — 10-Schritt-Bootstrap-Runbook. CEO-Hiring → Smoke-Test → Tool-Builder → QA → Visual-QA → Translator gestaffelt. Rollback-Trigger (QA-Failure-Rate > 20 %, DennisJedlicka-Commits, Spec-Drift).
- `BRAND_GUIDE.md` — Agent-readable Konsolidierung von STYLE.md + CONTENT.md + tokens.css. §4 = 11-Punkte-QA-Eval-Rubrik mit konkreten Commands (grep, wc, axe-core, Playwright).
- `TICKET_TEMPLATE.md` — YAML-Schema + Workflow-Steps 1–7 + Atomicity-Regeln + gefülltes Beispiel `kilometer-zu-meilen`.
- `HEARTBEAT.md` — 30-min-Default-Intervall, 10-Schritt-Checklist, Lock-File-Mechanik (Stale-Lock > 2 h → Recovery).
- `SKILLS.md` — installierte 5 Paperclip-Skills, 6 explizit nicht-installierte (mit Rationale), 2 Phase-2-Evaluation-Kandidaten (`prcheckloop`, `pr-report`), Security-Scan-Ergebnisse.
- `souls/` — Identity-Layer für 7 Rollen: `ceo.md`, `tool-builder.md`, `qa.md`, `cto.md`, `visual-qa.md`, `translator.md`, `seo-audit.md`.
- `agents/` — Prozedur-Layer mit Bash- und Code-Beispielen: `ceo.md` (Heartbeat-Pseudo-Code + Ticket-Selection), `tool-builder.md` (Build-Sequenz + Commit-HEREDOC), `qa.md` (11-Punkte-Commands + Flakiness-Retry).

**Global installierte Skills (via `npx skills add -g`):** `paperclip`, `paperclip-create-agent`, `para-memory-files`, `company-creator`, `design-guide`. Security-Scans akzeptiert (paperclip Med/Gen, vier Safe via Snyk-Low).

**Aktivierungs-Pickup:** Agent startet in Phase 2 Session 1 mit `docs/paperclip/README.md` → `ONBOARDING.md` 10-Schritt-Runbook. Keine Aktion nötig bis dahin — die Artefakte sind Single-Source-of-Truth und referenzieren existierende Rulebooks, statt sie zu duplizieren.

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

**Phase 0 abgeschlossen, Phase 1 Session 1 (Tool-Cross-Links) + Session 2 (Homepage-Refactor + Batch-1-DE-Converter) ✅ abgeschlossen.** Erster Production-Deploy wartet weiter auf die zwei GitHub-Secrets (Anleitung in [DEPLOY.md](DEPLOY.md)). Inventar steht jetzt bei 8 Tools live (3 aus Phase 0 + 5 aus Phase-1 Session 2). FooterToolsList rendert alle 8 (Cap = 8 → kein Overflow-Link aktiv); ab Tool 9 schlägt der Overflow-Counter zu.

**Phase 1 Session 3 Kandidaten (prioritätsfrei, entscheidet Session-Start):**
- **Batch-2-DE-Converter:** weitere Standard-Konverter (Volumen: liter↔gallone, milliliter↔fl-oz; Zeit: stunden↔minuten, sekunden↔millisekunden; Geschwindigkeit: km/h↔mph, m/s↔km/h; Daten: bit↔byte, megabyte↔gigabyte). Ziel: 8–12 weitere Tools mit demselben Add-Pattern wie Session 2. Sobald Tool 9 live ist, triggert die FooterToolsList den Overflow-Link — Smoke-Check ob `+\u00A0${overflow} weitere Werkzeuge →` korrekt rendert.
- **Recraft-Icon-Batch:** für die 5 Session-2-Konverter Icons generieren + via BG-Remover droppen (Auto-Pickup greift). Macht visuell den größten Sprung pro Aufwand.
- **Phase-1 Mini-Review (Pattern Session 6/8/11):** Smoke-Check der 5 neuen Tool-Seiten auf Desktop+Mobile×Light+Dark, Regression-Check der Phase-0-Tools, Bestätigung dass `<RelatedTools>` zwischen den 5 neuen + 3 alten korrekt resolvt (alle Slugs sind in beiden Richtungen real).
- **Design-Agent-Sync:** sobald der parallele Design-Agent seine Refinements gemerged hat, einen Visual-Audit-Pass über die 5 neuen Tool-Seiten laufen lassen — weil alle Tool-Templates geshared sind, propagieren Design-Änderungen automatisch, aber der Audit-Pass bestätigt es Tool-für-Tool.
- **AdSense-Setup:** Spec §18 Non-Negotiable 5 erlaubt erst Phase 2 (Trigger ~50 Tools live + stabile Traffic-Basis). Aktuell 8/50.

**Phase-1 Session 2 Summary (heute) abgeschlossen:** Homepage-Refactor (`getCollection`-Inline-Enumerator → `listToolsForLang`-Konsument, −22 LOC), 5 neue DE-Konverter (zentimeter-zu-zoll, kilometer-zu-meilen, kilogramm-zu-pfund, celsius-zu-fahrenheit als erstes affines Tool, quadratmeter-zu-quadratfuss mit vorquadriertem Faktor), je Config + DE-SEO-Content + Slug-Map + Registry + Unit-Test + Content-Test. 329/329 Tests (289 → 329, +40). Build grün, 10 Pages, Pagefind-Index +66 % Wörter. Keine Touches an Templates/Tokens/Layout — paralleler Design-Agent ungestört.

**Phase-1 Session 1 Summary (gestern) abgeschlossen:** `<FooterToolsList>` ersetzt Kategorien-Stubs mit 8-Tool-Cap + Overflow-Link, `<RelatedTools>` mountet am Fuß jeder Tool-Seite mit Stagger-Fade-In + Dark-Mode-Icon-Inversion, Single-Source `src/lib/tools/list.ts` eliminiert parallele Content-Collection-Aufrufe. 289/289 Tests. Rulebooks: STYLE §14 + CONVENTIONS §Content-Collection-Enumeration.

**Session 11 — CI/CD-Scaffolding abgeschlossen:** GitHub-Actions-Workflow (verify→deploy, wrangler-action@v3), `public/_headers` (SW no-cache, `_astro`/`fonts` immutable, Security-Baseline), `public/_redirects` (/ → /de/ 301), Canonical korrekt auf `konverter-7qc.pages.dev`, DEPLOY.md mit User-Checklist. 258/258 Tests. 11/11 Phase-0-Sessions ✅.
