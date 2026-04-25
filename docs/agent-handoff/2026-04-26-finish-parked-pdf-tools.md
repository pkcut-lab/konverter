---
title: Agent-Handoff — 2 geparkte PDF-Tools fertig bauen
created: 2026-04-26
created_by: claude (CEO-Heartbeat-44 → Phase-2 Sonderdelegation)
target_agent: separate-session-tool-builder (parallel zu Paperclip)
quality_bar: paperclip-equivalent (gleicher Standard wie 1. Handoff 2026-04-25)
status: ready-for-handoff
verification_after: report nach Vorlage am Ende, User gibt Report an Claude zurück
predecessor: 2026-04-25-finish-incomplete-tools.md (8/10 Tools shipped + 2 PDFs hier dran)
---

# Auftrag — 2 geparkte PDF-Tools fertig bauen

## Kontext (in 30 Sekunden)

Am 2026-04-25 wurden 8 von 10 unfertigen Tools in einer Sonderdelegation geshippet. Die 2 PDF-Tools (`pdf-zusammenfuehren` + `pdf-aufteilen`) wurden bewusst geparkt, weil sie jeweils ein 600–900 LoC Custom-Svelte-Component brauchen, das im Zeitbudget der ML-Tools-Lieferung gefehlt hätte. CEO-Decision dokumentiert in `docs/ceo-decisions-log.md` (Eintrag 2026-04-25 Park-Decision pdf-zusammenfuehren + pdf-aufteilen).

Du übernimmst beide jetzt. Pattern bewährt: 8/10 Tools im ersten Handoff erfolgreich, drei-Pass-Review-Pattern hat 6 reale Defects gefunden (siehe `docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md` Befund-Sektionen).

## Wer du bist

Eigenständiger Tool-Builder-Agent in einer **separaten Session**, parallel zu Paperclip. Paperclip arbeitet weiter an anderen Tools (gerade dispatched: skonto-rechner Rework, dann grunderwerbsteuer-rechner). Du baust die 2 PDF-Tools fertig. Wenn du fertig bist: Report nach Vorlage am Ende. User leitet an Claude weiter, Claude verifiziert am Code (nicht am Commit-Log) per 8-Phasen-Checkliste.

## Pflichtlektüre (in dieser Reihenfolge)

Bevor du ANFANGST, lies diese Files VOLLSTÄNDIG:

1. `CLAUDE.md` — Hard-Caps + Arbeitsprinzipien + Non-Negotiables
2. `docs/paperclip/bundle/agents/ceo/AGENTS.md §0` (komplette Sektion, inkl. §0.1 Sequential, §0.7 NO-ESCALATION-LOCK)
3. `CONVENTIONS.md` — Code-Regeln + Category-Taxonomie
4. `STYLE.md` — Visual-Tokens + SEO-Schema
5. `CONTENT.md` — Frontmatter-Schema + H2-Pattern
6. `DESIGN.md` — Tool-Detail-Layout + Komponenten-Conventions
7. `PROJECT.md` — gelockte Tech-Stack-Versionen
8. `docs/completed-tools.md` — Schema (CEO-Notes-Spalte) + Liste shipped Tools (zur Orientierung welche Patterns funktionieren)
9. `docs/ceo-decisions-log.md` — kürzliche autonome Entscheidungen (NO-ESCALATION-LOCK + Park-Decision für deine 2 Tools)
10. `src/content/tools.schema.ts` — Zod-Schema das jedes Content-md erfüllen muss
11. `src/lib/tools/schemas.ts` — Zod-Schema das jedes Tool-Config erfüllen muss
12. `docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md` (komplett) — was beim 1. Handoff funktioniert hat + welche Defects die 3 Review-Passes gefunden haben → was du vermeidest

Pro Tool zusätzlich:
- `dossiers/pdf-zusammenfuehren/2026-04-25.md` (KON-322, citation-verify clean)
- `dossiers/pdf-aufteilen/2026-04-25.md` (volles §1-10)

Reference-Implementations zum Abgucken:
- **`src/components/tools/BildDiffTool.svelte`** — bestes File-Tool-Pattern (drag-drop, multi-file, Svelte 5 Runes, refined-minimalism). Custom-Component-Imports in `src/pages/[lang]/[slug].astro:280-325`.
- **`src/components/tools/FileTool.svelte`** — generische Single-File-Variante (siehst, was Standard-Pattern ist und wo dein Custom-Component davon abweicht).
- **`src/lib/tools/jpg-zu-pdf-runtime.ts`** + `JpgZuPdfTool.svelte` (geshippet im 1. Handoff) — direkt verwandt: pdf-lib Single-File-PDF-Output, lazy import pattern, page-size + orientation + margin presets. Dein pdf-zusammenfuehren ist die Multi-Input-Version davon.

## Sequential-Pipeline (Pflicht-Workflow pro Tool, identisch zum 1. Handoff)

Du folgst exakt §0 v1.5 + §0.7 v2.3 (NO-ESCALATION-LOCK):

```
Phase A — Vorbereitung (Dossier vorhanden, §2.4 Differenzierung im Dossier)
  → CEO-Gate-1: pass / reject

Phase B — Build
  Config (Zod-valid) + Content (Schema-valid) + Tests (≥15) + Custom-Component
  Slug-Map + Tool-Registry registrieren
  Build grün, Tests grün → CEO-Gate-2

Phase C — Pre-Publish (Meta + FAQ ready)
  → CEO-Gate-3

Phase D — Critics (Self-Review aller Dimensionen)
  Bei Issues: scoped Fix → max 2 Reworks → ggf. CEO-Hotfix-by-Self

Phase E — End-Review (3-Pass-Pflicht)
  Pass 1: Full-Tool-Review (gerendertes HTML aus dist/)
  Pass 2: Verifiziert Pass-1-Fixes
  Pass 3: Final-Sanity-Check

Phase F — Ship
  Append in docs/completed-tools.md mit CEO-Notes
  Eintrag in tasks/.ceo-tmp/completed.txt
  Eigener Commit pro Tool mit Trailer
```

**EISERNE REGELN:**

- **Ein Tool zur Zeit.** Erst pdf-zusammenfuehren komplett shippen, dann pdf-aufteilen.
- **Kein Schritt darf abbrechen.** Bei Fail: Fix → Re-Test → weiter. Niemals stille Aufgabe.
- **3-Pass-End-Review ist Pflicht** — auch bei clean Pass 1.
- **Pro Tool ein Commit** mit Phase A–F im Body. Trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- **NO-ESCALATION-LOCK §0.7:** Kein File in `inbox/to-user/` außer den 5 Live-Alarm-Typen. Bei Hard-Cases: autonom entscheiden + in `docs/ceo-decisions-log.md` loggen.
- **Vor jedem Commit:** `bash scripts/check-git-account.sh` — muss `pkcut-lab` zeigen.

## Quality-Bar (alles Pflicht)

Identisch zum 1. Handoff. Pro Tool MUSS:

### Code
- [ ] Config validiert mit `parseToolConfig()` aus `src/lib/tools/schemas.ts` (Test enthält dies)
- [ ] Pure-Client (kein Server-Upload, kein Tracking) — pdf-lib ist client-side, perfekt
- [ ] Keine externen Network-Runtime-Deps
- [ ] Keine Hex-Codes in Components — nur Tokens aus `src/styles/tokens.css`
- [ ] Keine arbitrary px-Werte in Components — nur Tokens
- [ ] Keine Emojis in UI-Strings
- [ ] Keine `innerHTML`, kein `eval`, keine prototype-pollution
- [ ] DE-Eingabe-Normalisierung wo zutreffend
- [ ] Lazy import von pdf-lib (`await import('pdf-lib')`) per Performance-Mandate §9.1 — kein static-import in Tool-Config

### Tests
- [ ] ≥15 Tests pro Tool (Config-Identity + Standardfälle + Edge-Cases)
- [ ] Edge-Cases: 0-Datei-Upload, 1 PDF, 50+ PDFs, korrupte PDF, password-geschützt, sehr-große Datei
- [ ] `npx vitest run <tool>` zeigt 100% pass

### Content (`src/content/tools/<slug>/de.md`)
- [ ] Frontmatter erfüllt `tools.schema.ts`:
  - `title` 30–60 Zeichen
  - `metaDescription` 140–160 Zeichen
  - `tagline` 1–200 Zeichen
  - `headingHtml` mit ≤1 `<em>…</em>`
  - `howToUse` 3–5 Schritte
  - `faq` 4–6 Q/A-Paare
  - `relatedTools` 0–5 kebab-case Slugs (z.B. `['jpg-zu-pdf', 'pdf-zu-jpg']`)
  - `category: document`
  - `contentVersion: 1`
- [ ] Body: Intro + 2–4 H2-Sektionen + Anwendungsbeispiele + Verwandte-Tools-Sektion mit Markdown-Links
- [ ] Mind. 300 Wörter im Body

### Build + Render
- [ ] `npx astro build` durch — Tool unter `/de/<slug>/` mit ≥30 KB HTML
- [ ] HTML enthält JSON-LD x4: SoftwareApplication + BreadcrumbList + FAQPage + HowTo
- [ ] Italic-accent H1 mit `<em>` rendert
- [ ] Eyebrow-Pill „Läuft lokal · kein Upload" sichtbar
- [ ] Related-Bar resolvt alle relatedTools
- [ ] Astro check führt KEINE NEUEN TS-Errors ein (Baseline aktuell: 5 errors in `[slug].astro` pre-existing)

### Sequential-Pipeline-Compliance
- [ ] Eintrag in `slug-map.ts` mit `{ de: '<slug>' }`
- [ ] Eintrag in `tool-registry.ts` mit lazy `import()`
- [ ] Custom-Component-Dispatch in `[slug].astro` mit `config.type === 'formatter' && config.id === '...'` Guard (siehe Third-Pass-Review-Befund 2 vom 1. Handoff!)
- [ ] Append in `docs/completed-tools.md` mit CEO-Notes-Spalte ausgefüllt
- [ ] Append in `tasks/.ceo-tmp/completed.txt`
- [ ] Eigener Commit `feat(tools/document): ship <slug>` mit Phase-A–F-Body
- [ ] CEO-Decisions-Log-Eintrag wenn nicht-trivial entschieden

### A11y + Motion (Lessons Learned vom 1. Handoff)
- [ ] `prefers-reduced-motion` Block in jedem Custom-Component (siehe Third-Pass-Befund: `transform: scale(1.1)` muss zusätzlich zu `transition: none` mit `transform: none` in den Block, weil global.css `*` mit !important nur transition-duration zeroed, nicht transform-property)
- [ ] Keyboard-Navigation für Drag-Drop-UI (button-based reorder als Fallback zu Mouse-Drag)
- [ ] ARIA-Labels für File-Inputs + Reorder-Buttons + Page-Range-Inputs
- [ ] Touch-Targets ≥44×44 px

## Tool 1 — pdf-zusammenfuehren

### Aktueller Stand
- **Dossier:** `dossiers/pdf-zusammenfuehren/2026-04-25.md` (KON-322, 14 Sources, citation-verify clean, §2.4 Differenzierungs-Hypothesen vorhanden)
- **Parked Stub:** `.paperclip/parked-tools/pdf-zusammenfuehren.ts` (11 LoC, no-op `format: (t) => t` Placeholder — markiert dass alle Processing in Custom-Component läuft)
- **Parked Content:** `.paperclip/parked-tools/pdf-zusammenfuehren/de.md` (8702 Bytes — Inhalt vorhanden, aber **YAML-Encoding-Issue im Original** — `?` statt UTF-8 Umlaute in `howToUse`-Strings. Muss neu encoded werden.)
- **Tool-Type:** formatter (Custom-Component-Variante) per Stub
- **Tool-Id:** `pdf-merge` (siehe Stub) → `slug: pdf-zusammenfuehren` per slug-map
- **Dependency:** `pdf-lib@^1.17.1` schon in package.json
- **Differenzierung:** siehe Dossier §9 — z.B. „bookmarks erhalten beim Merge" (keiner der Konkurrenten macht das) oder „alternating-page-Mode" (online2pdf Pattern)

### Was zu tun ist (Phase B im Detail)
1. **Stub unparken:** `mv .paperclip/parked-tools/pdf-zusammenfuehren.ts src/lib/tools/`
2. **Content unparken + Encoding fixen:** `mv .paperclip/parked-tools/pdf-zusammenfuehren/ src/content/tools/`. YAML-Strings in `howToUse` mit `?`-Artefakten neu schreiben (Drag & Drop, Zusammenführen, herunterladen — alle Umlaute/Sonderzeichen sauber UTF-8). Schema-Validation laufen lassen.
3. **Custom-Component schreiben:** `src/components/tools/PdfZusammenfuehrenTool.svelte`. Pattern: `BildDiffTool.svelte` als Vorlage für drag-drop multi-file. Features:
   - Multi-File-Drop-Zone (akzeptiert N PDFs)
   - File-Liste mit Reorder (button-Up/button-Down ≥44×44 für Keyboard, optional Mouse-Drag)
   - Per-Datei: Filename, Seitenzahl-Hint, Remove-Button
   - Merge-Button (disabled wenn <2 Files)
   - Download-Button für resultierendes PDF
   - Optional: „bookmarks erhalten" Toggle (Differenzierungs-Feature aus §9)
   - Lazy import pdf-lib im merge-Handler, nicht im Component-Mount
4. **Custom-Component-Dispatch in `[slug].astro`** ergänzen mit `config.type === 'formatter' && config.id === 'pdf-merge'` Guard.
5. **Test schreiben** (`tests/lib/tools/pdf-zusammenfuehren.test.ts`):
   - Config-Identity (id/type/categoryId/mode)
   - Schema-Validation (parseToolConfig)
   - Mock-pdf-lib Tests für merge-Logic (wenn extrahiert in Helper) ODER reine Config-Tests + Component-E2E (Playwright optional)
   - Mind. 15 Tests
6. **Slug-Map** (`src/lib/slug-map.ts`): `'pdf-merge': { de: 'pdf-zusammenfuehren' }`
7. **Tool-Registry** (`src/lib/tool-registry.ts`): `'pdf-merge': () => import('./tools/pdf-zusammenfuehren').then(m => m.pdfZusammenfuehren)`
8. **Phase D-F** wie oben.

### Geschätzte Dauer
~4–6 Stunden (Component ist der größte Brocken, Rest ist Standard-Pattern).

## Tool 2 — pdf-aufteilen

### Aktueller Stand
- **Dossier:** `dossiers/pdf-aufteilen/2026-04-25.md` (volles §1-10, KON-356)
- **NICHTS sonst** — komplettes Greenfield-Build
- **Tool-Id:** `pdf-split` (Vorschlag) → `slug: pdf-aufteilen`
- **Dependency:** `pdf-lib@^1.17.1` schon installiert
- **Differenzierung:** siehe Dossier §9 (Page-Range-Bookmark-Mode oder ähnlich)

### Was zu tun ist (Phase A-F volle Sequenz)
**Phase A:** Dossier ist komplett, kein Researcher-Lauf mehr nötig. Differenzierung-§2.4 aus Dossier §9 extrahieren und in dein Tool-Concept einbauen.

**Phase B:**
1. **Config schreiben:** `src/lib/tools/pdf-aufteilen.ts`. Pattern wie pdf-zusammenfuehren.ts — `FormatterConfig` mit `format: (t) => t` Placeholder, alle Logik im Component.
2. **Content schreiben:** `src/content/tools/pdf-aufteilen/de.md` mit Schema-konformem Frontmatter (title 30–60, meta 140–160, 4–6 FAQ, relatedTools z.B. `['pdf-zusammenfuehren', 'jpg-zu-pdf', 'pdf-zu-jpg']`, category: document).
3. **Custom-Component:** `src/components/tools/PdfAufteilenTool.svelte`. Pattern: BildDiffTool als Vorlage. Features:
   - Single-File-Drop-Zone (1 PDF)
   - Page-Range-Input (z.B. „1-3, 5, 7-10" Syntax — siehe Dossier UX-Patterns)
   - Preview der Pages (Thumbnail-Grid optional, mind. Seitenzahl-Liste)
   - Split-Mode-Toggle: „Single Output" (1 PDF mit den ausgewählten Pages) vs. „Per-Range" (N PDFs)
   - Split-Button + Download-Liste
   - Lazy import pdf-lib
4. **Custom-Component-Dispatch in `[slug].astro`** mit Guard
5. **Test schreiben** (≥15 Tests, parse-page-range Edge-Cases sind besonders wichtig: leer, „0", „99-1", „a-b", „1,1,1", „1-9999", whitespace, German vs Englisch Komma-Patterns)
6. **Slug-Map + Tool-Registry**
7. **Phase D-F** wie oben.

### Geschätzte Dauer
~6–10 Stunden (kompletter Build vom Greenfield, plus Page-Range-Parser ist tricky).

## Wichtige Lessons-Learned aus dem 1. Handoff

Aus dem Third-Pass-Review (`docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md` Befund 2):

1. **`config.type === 'formatter'` Guard PFLICHT** in `[slug].astro` Custom-Component-Dispatch. Beim 1. Handoff fehlte er für 2 ML-Tools, wurde im Third-Pass-Fix-Commit `8dc082f` nachgereicht.

2. **`prefers-reduced-motion` Coverage VOLLSTÄNDIG** (alle Selektoren mit `transition`, `animation`, `transform`). Global.css killt `transition-duration` site-weit, aber `transform`-Property selbst nicht. Beispiel:
```css
@media (prefers-reduced-motion: reduce) {
  .upload-area, .btn, .your-hover-button, .your-hover-button:hover {
    transition: none;
    transform: none;  /* nicht vergessen! */
  }
}
```

3. **Throughput-Tradeoffs OK, aber dokumentiert.** Wenn du beide Tools in einem Commit shippen willst (z.B. weil sie shared Component-Patterns haben), markiere das im Commit-Body explizit als Throughput-Tradeoff. Pro-Commit-pro-Tool ist Default; Soft-Violations sind erlaubt mit Begründung.

4. **Verify am Code, nicht am Plan:** wenn dein eigener Plan sagt „Stub vorhanden", prüf den File. Beim 1. Handoff war eine Park-Decision-Beschreibung falsch (claim vs. reality), Korrektur in commit `c814401`.

## Verbotene Aktionen

- Niemals beide Tools parallel bauen (§0.1: ein Tool zur Zeit).
- Niemals ein Tool als shipped markieren wenn nicht alle Quality-Bar-Checkboxen grün.
- Niemals `git push --force`, `git reset --hard`, oder DennisJedlicka-Account.
- Niemals in `.paperclip/work-snapshots/` löschen.
- Niemals File in `inbox/to-user/` schreiben (§0.7 NO-ESCALATION-LOCK).
- Niemals neue Dependency außerhalb der Hard-Caps installieren (MIT, ≤2 MB, pure-client). pdf-lib ist die einzige Dep die du brauchst, und die ist da.

## Erlaubte autonome Decisions

Du darfst (mit Eintrag in `docs/ceo-decisions-log.md`):

- **Tool-Architecture-Entscheidungen** (z.B. „Page-Range-Parser als separater Helper-File ja/nein", „bookmarks-Toggle ja oder Phase-2")
- **Differenzierungs-Feature-Cuts** wenn time-budget nicht reicht (z.B. „bookmarks-Erhalt deferred Phase-2, Single-Merge ohne bookmarks geshippet")
- **Test-Strategy** (z.B. „Component-E2E gegen Mock-PDF skipped weil Playwright-Setup zu groß; Helper-Function-Tests reichen für Phase-1 Coverage")
- **§7.15-Override** wenn rework_counter 2/2 erschöpft → ship-as-is mit Phase-2-Backlog-Eintrag
- **Park-Decision** wenn Tool fundamental nicht baubar (z.B. pdf-lib-API-Limit erreicht, password-protected-PDF-Parser-Lib nötig die kein MIT ist)

Niemals stille Aufgabe — entweder ship oder explicit park.

## Report-Format (am Ende deiner Session)

Schreibe deinen Report nach `docs/agent-handoff/2026-04-26-finish-parked-pdf-tools-REPORT.md`:

```markdown
---
report_for: 2026-04-26-finish-parked-pdf-tools.md
agent_session: <timestamp_start> bis <timestamp_end>
tools_attempted: 2
tools_shipped: <count>
tools_parked: <count>
total_commits: <count>
session_duration_minutes: <int>
---

# Report — 2-PDF-Tools-Session

## Zusammenfassung
<2–3 Sätze: was geschafft, was nicht, ungewöhnliche Entscheidungen>

## Pro-Tool-Bilanz

### 1. pdf-zusammenfuehren
- **Status:** shipped | parked | failed
- **Commit-SHA:** <abbreviated>
- **Tests:** <passed>/<total> grün
- **Phasen-Bilanz:** A clean / B clean / C clean / D <details> / E <Pass-1/2/3> / F shipped
- **Quality-Bar:** alle Checkboxen grün? Wenn nein, welche?
- **CEO-Decisions:** keine | <list mit Reversibility>
- **Reworks:** 0 | 1 | 2
- **Auffälligkeiten:** <z.B. „bookmarks-Toggle gestrichen, weil pdf-lib v1.17 keine getOutlines() exposed">

### 2. pdf-aufteilen
... gleiches Format

## Kumulierte Metriken

- **Build-Status final:** `npx astro build` → <pages> Pages
- **Test-Status final:** `npx vitest run` → <passed>/<total>
- **Astro check Delta:** TS-Errors vor vs nach (Baseline 5 errors pre-existing in [slug].astro)
- **Bundle-Größe Delta:** falls relevant

## CEO-Decisions-Log Diff
<welche Einträge ergänzt>

## Was offen blieb (falls etwas)
<Liste mit Begründung>

## Verifikation (für Claude/CEO)

```bash
git log --oneline <handoff-base-sha>..HEAD
npx vitest run --reporter=basic 2>&1 | tail -3
npx astro build 2>&1 | tail -3
grep -c "^| \[" docs/completed-tools.md
test -f dist/de/pdf-zusammenfuehren/index.html && test -f dist/de/pdf-aufteilen/index.html && echo "both pages built"
```
```

## Wenn du fertig bist

1. Letzten Commit nicht pushen (User entscheidet wann)
2. Report-Datei schreiben unter dem Pfad oben
3. Dem User mitteilen: „Report fertig unter `docs/agent-handoff/2026-04-26-finish-parked-pdf-tools-REPORT.md`. Bitte an Claude weiterleiten zur Verifikation."
4. Session beenden

## Wenn du blockiert bist

- **3+ Reworks bei einem Tool** → §7.15-Override ship-as-is mit Phase-2-Backlog ODER park, aber niemals offen lassen
- **Fundamentaler Architektur-Konflikt** → STOP, dokumentiere im Report unter „Was offen blieb", anderes Tool weiterbauen
- **Test-Suite-Gesamt-Regression** → zurückrollen mit `git revert <sha>`, dokumentieren

---

**Start-Befehl an dich:** „Lies diesen Brief vollständig + die 12 Pflicht-Files. Beginne mit Tool 1 (pdf-zusammenfuehren). Wenn shipped → Tool 2 (pdf-aufteilen). Liefer am Ende den Report."

— Claude (CEO, Heartbeat-44 → Phase-2 Sonderdelegation)
