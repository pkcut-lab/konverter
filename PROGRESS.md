# Progress Tracker

**Letztes Update:** 2026-04-19 (Session 5, End)
**Aktuelle Phase:** Phase 0 — Foundation
**Current Session:** #5 — Meter-zu-Fuß Prototype ✅

## Phase 0 Fortschritt

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Bootstrap | ✅ done | Astro-Shell + Rulebooks + Git + CF Pages |
| 2 — Design-System | ✅ done | `tokens.css`, Dark/Light |
| 3 — Layout-Shell | ✅ done | BaseLayout + Header + Footer + ThemeToggle + hreflang |
| 4 — Tool-Config-Foundation | ✅ done | Zod-Schemas 9 Typen + slug-map + Content-Collection + CONVENTIONS final |
| 5 — Meter-zu-Fuß Prototype | ✅ done | Converter-Template + Dynamic Route + SEO-Content |
| 6 — Review #1 | ⬜ pending | Iteration + Lock |
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
- User-Verifikation offen: `http://localhost:4321/de/meter-zu-fuss` lokal im Browser testen (Desktop + Mobile, Light + Dark). Spec-Reviewer hat Build bestätigt; interaktive Verifikation delegiert.

## Session-6-Prerequisites (Code-Review-Carry-Overs aus Session 5)
- `astro.config.mjs` um `vitePreprocess` erweitern, damit Svelte-Komponenten `interface`-/`type`-Deklarationen nutzen können (Workaround derzeit: `$props<T>()` Generic-Form). Nachdem `vitePreprocess` aktiv ist: Parameter-Typen in `Converter.svelte` wiederherstellen — `formatDecimal(n: number, decimals: number)`, `onInput(e: Event)`, `onQuickValue(n: number)`; `$state<T>()` Generics bei `inputValue`/`direction`/`copyState` wieder typisieren. Quelle: Code-Review Issue 4 + Final-Review Important.
- `.prose` Utility in `src/styles/global.css` einführen und `src/pages/[lang]/[slug].astro` `.tool-seo :global(...)` ersetzen — spart 150+ duplizierte CSS-Regeln. Quelle: Code-Review Issue 3, TODO-Marker in der Datei.
- `src/lib/tool-registry.ts` extrahieren, damit neue Tools nur an zwei Stellen (Registry + slug-map) gepflegt werden müssen. Quelle: Code-Review Issue 2, JSDoc-Marker in der Datei.

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
Session 6 — Prototype-Review #1: User testet `http://localhost:4321/de/meter-zu-fuss` lokal (Desktop + Mobile, Light + Dark). Feedback zu Layout, Typografie, Converter-Interaktion, Mobile-Scroll-Verhalten. Iteration bis 100%. Session-6-Prerequisites (oben) abarbeiten: vitePreprocess-Config, `.prose`-Utility-Extraktion, `tool-registry.ts`-Extraktion. Danach lock in `CONVENTIONS.md` (Svelte-5-Runes-Pattern für Tools, `data-testid`-Konvention) und `STYLE.md` (Converter-Box-Layout, Quick-Value-Button-Look). Kein neuer Converter, kein WebP — das ist Session 7.
