---
title: Agent-Handoff — 9 unfertige Tools fertig bauen
created: 2026-04-25
created_by: claude (CEO-Heartbeat-44, Sonderdelegation)
target_agent: separate-session-tool-builder (parallel zu Paperclip)
quality_bar: paperclip-equivalent
status: ready-for-handoff
verification_after: report nach Vorlage am Ende, User gibt Report an Claude zurück
---

# Auftrag — 9 unfertige Tools fertig bauen

## Wer du bist

Du bist ein eigenständiger Tool-Builder-Agent in einer **separaten Session**, parallel zu Paperclip laufend. Paperclip arbeitet weiter an neuen Tools — du räumst die abgebrochene Arbeit aus früheren Crashes auf. Wenn du fertig bist, schreibst du einen Report nach Vorlage (siehe Ende). Der User gibt den Report an Claude weiter; Claude verifiziert deine Arbeit.

## Pflichtlektüre (in dieser Reihenfolge)

Bevor du irgendetwas tust, lies diese Files vollständig:

1. `CLAUDE.md` — Hard-Caps + Arbeitsprinzipien + Non-Negotiables
2. `docs/paperclip/bundle/agents/ceo/AGENTS.md §0` — Sequential Pipeline Override (v1.5, USER-LOCKED)
3. `CONVENTIONS.md` — Code-Regeln + Category-Taxonomie
4. `STYLE.md` — Visual-Tokens + SEO-Schema
5. `CONTENT.md` — Frontmatter-Schema + H2-Pattern
6. `DESIGN.md` — Tool-Detail-Layout + Komponenten-Conventions
7. `PROJECT.md` — gelockte Tech-Stack-Versionen
8. `docs/completed-tools.md` — Schema (CEO-Notes-Spalte) + bereits-shipped Tools
9. `docs/ceo-decisions-log.md` — kürzlich getroffene autonome Entscheidungen
10. `src/content/tools.schema.ts` — Zod-Schema das jedes Content-md erfüllen muss
11. `src/lib/tools/schemas.ts` — Zod-Schema das jedes Tool-Config erfüllen muss

Pro Tool zusätzlich:
- `dossiers/<slug>/2026-04-25.md` (oder neuestes Datum) — Tool-spezifische Recherche

## Sequential Pipeline (Pflicht-Workflow pro Tool)

Du folgst **exakt** dem in `docs/paperclip/bundle/agents/ceo/AGENTS.md §0` festgeschriebenen Ablauf:

```
Phase A — Vorbereitung
  Dossier vorhanden? Differenzierung §2.4 dokumentiert? CEO-Gate-1
Phase B — Build
  Config (Zod-valid) + Content (Schema-valid) + Tests (≥15 Cases) + ggf. Custom-Component
  Slug-Map + Tool-Registry registrieren
  Build grün, Tests grün → CEO-Gate-2
Phase C — Pre-Publish
  SEO-Meta korrekt? FAQ ≥4? CEO-Gate-3
Phase D — Critics
  Self-Review aller Dimensionen (siehe Quality-Bar unten)
  Bei Issues: scoped Fix → max 2 Reworks → ggf. Hotfix-by-Self
Phase E — End-Review (3-Pass-Pflicht)
  Pass 1: Full-Tool-Review (gerendertes HTML aus dist/)
  Pass 2: Verifiziert Pass-1-Fixes
  Pass 3: Final-Sanity-Check
Phase F — Ship
  Append in docs/completed-tools.md mit CEO-Notes
  Eintrag in tasks/.ceo-tmp/completed.txt
  Eigener Commit pro Tool mit Trailer
```

**EISERNE REGELN (überstimmen alles):**

- **Ein Tool zur Zeit.** Erst wenn das aktuelle Tool im completed-tools.md steht, fängst du das nächste an.
- **Kein Schritt darf abbrechen.** Bei Fail: Fix → Re-Test → weiter. Niemals stille Aufgabe. Wenn ein Tool unbaubar ist, dokumentiere im Report mit Park-Decision.
- **3-Pass-End-Review ist Pflicht** — auch wenn Pass 1 clean ist. Pass 2 + 3 sind Sanity-Checks.
- **Pro Tool ein Commit** mit Phase A–F im Body. Trailer: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- **Vor jedem Commit**: `bash scripts/check-git-account.sh` — muss `pkcut-lab` zeigen.

## Quality-Bar (Paperclip-Äquivalent, alles Pflicht)

Pro Tool MUSS folgendes erfüllt sein, sonst nicht shipped:

### Code
- [ ] Config validiert mit `parseToolConfig()` aus `src/lib/tools/schemas.ts` (Test enthält dies)
- [ ] Pure-Client (kein Server-Upload, kein Tracking)
- [ ] Keine externen Network-Runtime-Deps (Ausnahme 7a: ML-File-Tools mit Worker-Fallback)
- [ ] Keine Hex-Codes in Components — nur Tokens aus `src/styles/tokens.css`
- [ ] Keine arbitrary px-Werte in Components — nur Tokens
- [ ] Keine Emojis in UI-Strings (außer User-Config explizit erlaubt es)
- [ ] Keine `innerHTML`, kein `eval`, keine prototype-pollution
- [ ] DE-Eingabe-Normalisierung über `parseDE()` aus `src/lib/tools/parse-de.ts`

### Tests
- [ ] ≥15 Tests pro Tool (Config-Identity + Standardfälle + Edge-Cases + Locale-Format)
- [ ] Edge-Cases: Empty/Zero/Negative/NaN/Infinity/Sehr-Groß/Sehr-Klein
- [ ] Locale: DE-Komma + Tausenderpunkt + Negative
- [ ] `npx vitest run <tool>` zeigt 100% pass

### Content (`src/content/tools/<slug>/de.md`)
- [ ] Frontmatter erfüllt `tools.schema.ts`:
  - `title` 30–60 Zeichen
  - `metaDescription` 140–160 Zeichen
  - `tagline` 1–200 Zeichen
  - `headingHtml` mit ≤1 `<em>…</em>`
  - `howToUse` 3–5 Schritte
  - `faq` 4–6 Q/A-Paare (keine Q–A-Ein-Wort-Antworten, je ≥1 Satz substantiell)
  - `relatedTools` 0–5 kebab-case Slugs
  - `category` aus `TOOL_CATEGORIES`-Enum
  - `contentVersion: 1`
- [ ] Body: Intro + 2–4 H2-Sektionen + Anwendungsbeispiele + Verwandte-Tools-Sektion
- [ ] Mind. 300 Wörter im Body (Quality-Gate)
- [ ] Tool-Nennungen im Prose IMMER als Markdown-Link (`[Tool-Name](/de/slug)`)

### Build + Render
- [ ] `npx astro build` durch (production-build, KEIN dev) — Tool erscheint unter `/de/<slug>/`
- [ ] HTML enthält JSON-LD x4: SoftwareApplication + BreadcrumbList + FAQPage + HowTo
- [ ] Italic-accent H1 mit `<em>` rendert als Inter-Italic
- [ ] Eyebrow-Pill mit „Läuft lokal · kein Upload" sichtbar
- [ ] Related-Bar resolvt alle relatedTools-Slugs
- [ ] Astro check zeigt ≤bestehende Anzahl TS-Fehler (du fügst KEINE neuen TS-Fehler hinzu)

### Sequential-Pipeline-Compliance
- [ ] Eintrag in `slug-map.ts` mit `{ de: '<slug>' }`
- [ ] Eintrag in `tool-registry.ts` mit lazy `import()`
- [ ] Append in `docs/completed-tools.md` mit CEO-Notes-Spalte ausgefüllt
- [ ] Append in `tasks/.ceo-tmp/completed.txt`
- [ ] Eigener Commit `feat(tools/<category>): ship <slug>` mit Phase-A–F-Body
- [ ] CEO-Decisions-Log-Eintrag in `docs/ceo-decisions-log.md` wenn nicht-trivial entschieden (z.B. neue Dependency, §7.15-Override, Park-Decision)

## Tool-Liste (Reihenfolge nach Reife)

### 1. cashflow-rechner (am weitesten — Phase B fast komplett)

**Aktueller Stand:**
- Config: `src/lib/tools/cash-flow-calculator.ts` (239 LoC, ID `cash-flow-calculator`)
- Content: `src/content/tools/cashflow-rechner/de.md` (Schema-valid, ich habe Title-Length + relatedTools-Format gefixt)
- Custom Component: `src/components/tools/CashflowRechnerTool.svelte` (vorhanden, ungeprüft)
- Test: `tests/lib/tools/cash-flow-calculator.test.ts` (vorhanden, ungeprüft)
- Slug-Map: schon eingetragen (cashflow-rechner)
- Tool-Registry: schon eingetragen
- Dossier: `dossiers/cashflow-rechner/2026-04-25.md` vorhanden

**Was fehlt:**
- Custom-Component-Verdrahtung in `src/pages/[lang]/[slug].astro` prüfen (analog zu RegexTesterTool, BildDiffTool etc.)
- Phase D Critic-Self-Review
- Phase E 3-Pass-End-Review
- Phase F Ship-Append

### 2. leasing-faktor-rechner

**Aktueller Stand:**
- Config: `src/lib/tools/leasing-faktor-rechner.ts` (211 LoC) — **1 TS strict-mode Error** (line ~156, exactOptionalPropertyTypes auf `sonderzahlungProMonat?`)
- Content: `src/content/tools/leasing-faktor-rechner/de.md` (Schema-valid)
- Custom Component: `src/components/tools/LeasingFaktorRechnerTool.svelte` (vorhanden, ungeprüft)
- Test: `tests/lib/tools/leasing-faktor-rechner.test.ts` (vorhanden, ungeprüft)
- Slug-Map + Tool-Registry: schon eingetragen
- Dossier: `dossiers/leasing-faktor-rechner/2026-04-25.md` vorhanden

**Was fehlt:**
- TS-Error fixen (Type-Annotation für sonderzahlungProMonat: `number | undefined` explizit deklarieren)
- Phase D-F wie oben

### 3. erbschaftsteuer-rechner

**Aktueller Stand:**
- Config: `src/lib/tools/erbschaftsteuer-rechner.ts` (317 LoC)
- Content: **FEHLT** — `src/content/tools/erbschaftsteuer-rechner/de.md` muss neu geschrieben werden
- Custom Component: `src/components/tools/ErbschaftsteuerRechnerTool.svelte` (vorhanden, ungeprüft)
- Test: `tests/lib/tools/erbschaftsteuer-rechner.test.ts` (vorhanden, **2 Tests failing**)
  - `berechneRohsteuer(80_000, 1)` erwartet 7.750 (Härteausgleich Stkl I), bekommt anderen Wert
  - `berechneRohsteuer(75_000, 1)` erwartet 5.250 (7%), bekommt anderen Wert
- Slug-Map + Tool-Registry: **NICHT eingetragen**
- Dossier: `dossiers/erbschaftsteuer-rechner/` prüfen

**Was fehlt:**
- 2 Test-Failures fixen — Härteausgleich §19 Abs. 3 ErbStG korrekt implementieren (siehe BMF-Rechner als Referenz)
- Content `de.md` schreiben (gem. Schema)
- Slug-Map + Tool-Registry eintragen
- Phase A–F vollständig (Differenzierung §2.4, Tests, Build, End-Review, Ship)

**ACHTUNG Legal:** Erbschaftsteuer ist regulatorisch sensibel. Pflicht-Disclaimer im Tool: „Keine Steuerberatung. Verbindliche Auskunft beim Finanzamt einholen." Keine garantierten Steuersätze ohne Quelle.

### 4. jpg-zu-pdf

**Aktueller Stand:**
- Runtime: `src/lib/tools/jpg-zu-pdf-runtime.ts` (461 LoC, **8 TS strict-mode Errors**)
- Config: **FEHLT**
- Content: **FEHLT**
- Custom Component: prüfen ob vorhanden in `src/components/tools/`
- Test: **FEHLT**
- Slug-Map + Tool-Registry: nicht eingetragen
- Dossier: `dossiers/jpg-zu-pdf/2026-04-25.md` prüfen
- Dependency: `pdf-lib@^1.17.1` schon in package.json

**TS-Errors (alle in jpg-zu-pdf-runtime.ts):**
- Line 425: exactOptionalPropertyTypes-Mismatch auf JpgToPdfOptions
- Lines 70–78: `Object is possibly 'undefined'` (6 stellen) — fehlende Null-Checks
- Line 70: `'marker' is possibly 'undefined'`

**Was fehlt:**
- TS-Errors fixen (entweder Optional-Chaining oder explizite Null-Guards einbauen)
- Config `jpg-zu-pdf.ts` schreiben (FileToolConfig, da File-Input)
- Content `src/content/tools/jpg-zu-pdf/de.md` schreiben
- Test schreiben
- Slug-Map + Tool-Registry eintragen
- Phase A–F vollständig

### 5. pdf-zusammenfuehren

**Aktueller Stand:**
- Config + Content: **temporär geparkt** in `.paperclip/parked-tools/` (YAML-Encoding-Issue im Original)
- Dossier: `dossiers/pdf-zusammenfuehren/2026-04-25.md` vorhanden
- Dependency: `pdf-lib` da

**Was fehlt:**
- Geparktes Material aus `.paperclip/parked-tools/pdf-zusammenfuehren/` nach `src/content/tools/pdf-zusammenfuehren/` zurück
- Geparktes `pdf-zusammenfuehren.ts` aus `.paperclip/parked-tools/` nach `src/lib/tools/` zurück
- YAML-Encoding-Issue im Content fixen (UTF-8 Re-Encoding der `howToUse`-Zeilen die als `?` erscheinen)
- Slug-Map + Tool-Registry eintragen
- Test schreiben
- Phase A–F vollständig

### 6. pdf-aufteilen

**Aktueller Stand:**
- Nur Dossier: `dossiers/pdf-aufteilen/2026-04-25.md` vorhanden (KON-356)
- Dependency: `pdf-lib` da

**Was fehlt:**
- Frischer Build von Phase B onwards: Config + Content + Test + Custom Component + Slug-Map + Tool-Registry + Phase D–F
- Architektur: FileToolConfig-Variante mit Page-Range-Selection

### 7. bild-zu-text (OCR)

**Aktueller Stand:**
- Config: `src/lib/tools/bild-zu-text.ts` (99 LoC) — vorhanden, prüfen ob Stub oder fertig
- Content: `src/content/tools/bild-zu-text/de.md` vorhanden
- Slug-Map + Tool-Registry: prüfen
- Dossier: `dossiers/bild-zu-text/` prüfen
- Dependency: `tesseract.js` schon in package.json

**Was fehlt:**
- Config-Review (99 LoC für OCR ist möglicherweise zu wenig — Worker-Init + Language-Pack + Progress-Tracking nötig)
- Test schreiben (Tesseract-Mock-Strategie)
- Phase A–F vollständig

### 8. ki-text-detektor

**Aktueller Stand:**
- Config: `src/lib/tools/ki-text-detektor-config.ts` — **9 LoC = Stub mit `format: (t) => t`**
- Content: `src/content/tools/ki-text-detektor/de.md` vorhanden
- Slug-Map + Tool-Registry: nicht eingetragen
- Dossier: prüfen

**Was fehlt:**
- Echte Implementierung: Welcher Detection-Ansatz? (Burstiness/Perplexity-Statistik vs. ML-Modell). Im Dossier prüfen.
- Config muss echte format-Funktion oder Custom-Component aufrufen
- Test schreiben
- Phase A–F vollständig

### 9. ki-bild-detektor

**Aktueller Stand:**
- Config: `src/lib/tools/ki-bild-detektor-config.ts` — **9 LoC = Stub**
- Content: `src/content/tools/ki-bild-detektor/de.md` vorhanden (referenziert Vision Transformer)
- Slug-Map + Tool-Registry: nicht eingetragen
- Dossier: prüfen
- ML-Constraints: 7a-Exception relevant (browser-ML-Tool)

**Was fehlt:**
- Vision-Transformer-Modell-Auswahl (Hugging-Face-Compatible, MIT/Apache-License Pflicht)
- Worker-Fallback-Strategie für 7a-Exception (siehe `ml-tool-defaults.md`)
- Config + Custom-Component mit Loader/Progress
- Test schreiben (Mock-Strategie)
- Phase A–F vollständig

### 10. audio-transkription

**Aktueller Stand:**
- Config: `src/lib/tools/audio-transkription-config.ts` — **9 LoC = Stub**
- Content: prüfen ob vorhanden
- Dossier: `dossiers/audio-transkription/` prüfen
- ML-Constraints: 7a-Exception (Whisper.js / Transformers.js)

**Was fehlt:**
- Whisper-Modell-Auswahl (multilingual oder DE-only, Quantization)
- Worker-Fallback
- Config + Custom-Component
- Test
- Phase A–F vollständig

## Pre-Flight-Check (vor jedem Tool)

```bash
# 1. Git-Account-Lock
bash scripts/check-git-account.sh   # MUSS pkcut-lab zeigen

# 2. Working-Tree-Status
git status --short                  # sollte clean sein zwischen Tools

# 3. Tests-Status pre-Tool
npx vitest run --reporter=basic 2>&1 | tail -5   # Baseline, neue Tools dürfen nicht regressieren

# 4. Build-Status
npx astro build 2>&1 | tail -3      # Baseline-Page-Count merken
```

## Verbotene Aktionen

- **Niemals** mehrere Tools parallel bauen.
- **Niemals** ein Tool auf `shipped` setzen wenn nicht alle Quality-Bar-Checkboxen oben grün sind.
- **Niemals** `git push --force` oder `git reset --hard`.
- **Niemals** in `.paperclip/work-snapshots/` löschen — das ist Crash-Recovery-Backup.
- **Niemals** einen anderen Git-Account als `pkcut-lab` verwenden.
- **Niemals** PROGRESS.md-Heartbeat-Einträge erfinden (nur Claude/CEO schreibt diese).

## Erlaubte CEO-Decisions

Du darfst autonom entscheiden, MUSST aber `docs/ceo-decisions-log.md` ergänzen:

- **Neue npm-Dependency installieren** (Pflicht-Check: MIT/Apache, ≤2 MB, MVP-bewährt, kein Server-Runtime)
- **§7.15-Override** wenn `rework_counter` 2/2 erschöpft (ship-with-debt + Phase-2-Backlog-Eintrag)
- **Tool parken** wenn unbaubar (Park-Decision dokumentieren mit Begründung)
- **Scope-Cut** (Feature aus Tool-Spec entfernen wenn out-of-scope für Phase 1)

## Report-Format (am Ende deiner Session zurück an User)

Schreibe deine Ergebnisse in **EINE** Datei: `docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md` mit folgendem Format:

```markdown
---
report_for: 2026-04-25-finish-incomplete-tools.md
agent_session: <timestamp_start> bis <timestamp_end>
tools_attempted: <count>
tools_shipped: <count>
tools_parked: <count>
total_commits: <count>
session_duration_minutes: <int>
---

# Report — 9-unfertige-Tools-Session

## Zusammenfassung

<2–3 Sätze: was geschafft, was nicht, ungewöhnliche Entscheidungen>

## Pro-Tool-Bilanz

### 1. cashflow-rechner
- **Status:** shipped | parked | failed
- **Commit-SHA:** <abbreviated>
- **Tests:** <passed>/<total> grün
- **Phasen-Bilanz:** A clean / B clean / C clean / D <details> / E <Pass-1/2/3> / F shipped
- **Quality-Bar:** alle Checkboxen grün? Wenn nein, welche?
- **CEO-Decisions:** keine | <list>
- **Reworks:** 0 | 1 | 2
- **Auffälligkeiten:** <z.B. Differenzierung musste angepasst werden, weil...>

### 2. leasing-faktor-rechner
... gleiches Format

### N. <slug>
... gleiches Format

## Kumulierte Metriken

- **Build-Status final:** `npx astro build` → <pages> Pages, <warnings>
- **Test-Status final:** `npx vitest run` → <passed>/<total> grün, <failed> Failures
- **Astro check final:** TS-Fehler-Delta vs. Baseline (vor deiner Session): <+N/-N/0>
- **Bundle-Größe:** Pre-Session vs. Post-Session
- **Git-Log seit Handoff-Start:** <commit-count>

## CEO-Decisions-Log Diff

Welche Einträge hast du in `docs/ceo-decisions-log.md` ergänzt? Liste der Decision-Titel.

## Was offen blieb (falls etwas)

- Tool X: Reason warum nicht shipped
- TS-Fehler Y in <File>: warum nicht gefixt (Begründung)
- Test Z: warum disabled/skipped (mit Issue-Reference)

## Verifikation (für Claude/CEO)

```bash
# Diese Commands müssen identische Ergebnisse zeigen wie in deinem Report:
git log --oneline 9c3e1e6..HEAD
npx vitest run --reporter=basic 2>&1 | tail -3
npx astro build 2>&1 | tail -3
grep -c "^| \[" docs/completed-tools.md
```
```

## Wenn du fertig bist

1. Letzten Commit pushen (NUR wenn User explizit fragt)
2. Report-Datei schreiben unter dem oben genannten Pfad
3. Dem User mitteilen: „Report fertig unter `docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md`. Bitte an Claude weiterleiten zur Verifikation."
4. Session beenden — keine offenen Fragen, keine teilweisen Ships.

## Wenn du blockiert bist

- **Fundamentaler Architektur-Konflikt:** STOP, dokumentiere in Report unter „Was offen blieb", andere Tools weiterbauen.
- **Mehr als 3 Reworks bei einem Tool:** §7.15-Override aktivieren (ship-with-debt mit Phase-2-Backlog) ODER park.
- **Eine Pflicht-Dependency fehlt:** CEO-Decision treffen + Eintrag in ceo-decisions-log.md + weiterbauen.
- **Test-Suite-Gesamt-Regression nach deinem Commit:** zurückrollen mit `git revert <sha>`, dokumentieren, anderes Tool angehen.

---

**Start-Befehl an dich:** „Lies diesen Brief vollständig. Beginne mit Tool 1 (cashflow-rechner). Arbeite die Liste in Reihenfolge ab. Liefer am Ende den Report nach Vorlage."

— Claude (CEO, Heartbeat-44)
