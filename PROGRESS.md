# Progress Tracker

**Letztes Update:** 2026-04-19 (Session 6, End)
**Aktuelle Phase:** Phase 0 — Foundation
**Current Session:** #6 — Prototype-Review #1 + Redesign ✅

## Phase 0 Fortschritt

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Bootstrap | ✅ done | Astro-Shell + Rulebooks + Git + CF Pages |
| 2 — Design-System | ✅ done | `tokens.css`, Dark/Light |
| 3 — Layout-Shell | ✅ done | BaseLayout + Header + Footer + ThemeToggle + hreflang |
| 4 — Tool-Config-Foundation | ✅ done | Zod-Schemas 9 Typen + slug-map + Content-Collection + CONVENTIONS final |
| 5 — Meter-zu-Fuß Prototype | ✅ done | Converter-Template + Dynamic Route + SEO-Content |
| 6 — Review #1 + Redesign | ✅ done | Refined-Minimalism-Redesign + Prereqs + Audit-Pass |
| 7 — WebP Konverter Prototype | ⬜ pending | FileTool-Template |
| 8 — Review #2 | ⬜ pending | Iteration + Lock |
| 9 — PWA + Pagefind | ⬜ pending | Scaffolding |
| 10 — CI/CD | ⬜ pending | First Production Deploy |

## Tool-Inventar (Phase 0)

| Tool | Config | Content-DE | Icon | Tests |
|------|--------|------------|------|-------|
| meter-zu-fuss | ✅ | ✅ | ⬜ (Pending Recraft) | ✅ |
| webp-konverter | ⬜ | ⬜ | ⬜ | ⬜ |

## Deploy-History
(leer bis Session 10)

## Blockers
- Keine. User testet `http://localhost:4321/de/meter-zu-fuss` im Browser und gibt ggf. Iterations-Feedback (Desktop + Mobile, Light + Dark).

## Session-6-Prerequisites ✅ alle abgearbeitet
- ✅ `vitePreprocess({ script: true, style: false })` in `astro.config.mjs` + `vitest.config.ts` — TS-Annotationen in `Converter.svelte` wiederhergestellt (`interface Props`, `$state<T>()` Generics, typisierte Handler).
- ✅ `.prose` Utility in `src/styles/global.css` — alle `:global()`-Duplikate aus `[slug].astro` entfernt.
- ✅ `src/lib/tool-registry.ts` extrahiert — neue Tools brauchen nur noch Registry + slug-map-Edit.

## Session 6 Deliverables
- Redesign `src/components/tools/Converter.svelte`: zweispaltiger Stack mit Hairline-Divider + zentrierte Swap-Pill, inline SVG-Icons (Swap rotiert 180°, Copy), Chips außerhalb der Card, `font-size-h1` Mono Tabular-Nums Output, `:focus-visible` 2px Outline, `:active scale(0.98)`, `copy--copied` Color-Shift via `--color-success`.
- Redesign `src/pages/[lang]/[slug].astro`: `.tool-hero` (max-w 40rem zentriert), `.tool-section` (max-w 34rem — Tool dominiert), Ad-Slot-Ghost (dashed 1px, min-h 5rem, CLS-safe), `.tool-article` mit `counter(how-step, decimal-leading-zero)` für editorial "01/02/03" Listing.
- Audit-Pass via `web-design-guidelines` angewandt: `translate="no"` auf Unit-Spans, `touch-action: manipulation` auf Interaktiv-Elementen, `text-wrap: balance` auf H1/H2, `color-scheme` auf `:root`/`[data-theme="dark"]`, `a:focus-visible` Outline-Ring.
- Gates: 0/0/0 `astro check`, 133/133 vitest, 3 pages built.

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

## Next-Session-Plan
Session 7 — WebP Konverter Prototype: Erster File-Tool-Konverter (Client-only WebP-Kompression, Browser-Canvas-API, Worker-Fallback). Liefert das `FileTool`-Template analog zum Converter-Template aus Session 5/6.

**Offener Lock-in nach User-Review der Session-6-Arbeit** (nicht blockierend für Session 7, aber vor Tool-Skalierung in Phase 1):
- `CONVENTIONS.md`: Svelte-5-Runes-Pattern für Tools (`interface Props`, typisierte `$state<T>()`, `data-testid`-Konvention) — Vorlage liegt in `Converter.svelte` fertig.
- `STYLE.md`: Converter-Box-Layout (Two-Panel + Hairline-Divider + zentrierte Swap-Pill), Quick-Value-Chip-Stil (außerhalb der Card, `--r-sm`), Page-Layout-Rhythmus (Hero 40rem / Tool 34rem / Ad+Article 42rem).
