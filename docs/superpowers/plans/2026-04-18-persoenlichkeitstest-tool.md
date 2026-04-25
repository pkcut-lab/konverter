# Persönlichkeitstest-Tool (Big Five) — Implementation Plan

> **ACHTUNG AGENT:** Dieser Plan wurde am 2026-04-19 finalisiert und eingefroren. Er ist eine **Phase-2-Deliverable** und wartet darauf, dass die Phase-0/1-Foundation komplett ist.
>
> **Bevor du auch nur eine Datei anfasst:** Arbeite den Abschnitt **„Pre-Execution Checklist"** (direkt unterhalb) **in Reihenfolge** ab. Brich ab und informiere den User, wenn irgendeine Zeile in Pre-Flight B1–B7 fehlschlägt. Keine Task-Ausführung ohne B9-Bestätigung.
>
> **REQUIRED SUB-SKILL:** Use `superpowers:subagent-driven-development` (recommended) — eine Task = ein frischer Subagent. Fallback: `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.
>
> **Gelockte Entscheidungen:** R1–R16 (Research) + D1–D4 (User-Entscheidungen). **Keine davon nachverhandeln** — wenn du meinst, eine sei falsch, **STOP** und frage den User. Niemals einfach abändern.

**Goal:** Kostenloser, 100 % client-seitiger Big-Five-Persönlichkeitstest (50 Items, IPIP-BFM-50, Public Domain) mit Likert-5, horizontaler Trait-Bar-Visualisierung, 6 German-native Archetypen (5 Trait-Dominant + balanced-mit-Top-2-Nuance), sessionStorage-Persistenz und 1200×630-PNG-Share-Card. Deutsche Master-Version (DE); EN/ES/FR/PT-BR sind Phase-3-Folgearbeit.

**Architecture:** Astro-Seite (`/de/persoenlichkeitstest`) mit einer einzelnen Svelte-5-Island (`PersonalityTest.svelte`) als Orchestrator und vier UI-Child-Komponenten (Intro, Question, Progress, Result). Alle Berechnungen laufen reine TypeScript-Funktionen ohne Runtime-Abhängigkeiten (0 npm-Packages über Stack hinaus). Antwort-Persistenz via `sessionStorage`. Ergebnis-Share-Card wird client-seitig via `<canvas>`-API als PNG gerendert und via Web-Share-API oder `<a download>` ausgeliefert.

**Tech Stack:** Astro 5.0.0, Svelte 5.1.16 (Runes-only), TypeScript 5.7.2 strict, Tailwind 3.4.15 + `tokens.css`, Vitest 2.1.8 + jsdom. Keine neuen Dependencies.

**Phase:** Phase 2 — nach Abschluss von Session 4 (Tool-Config-Foundation), Session 5 (Meter-zu-Fuß-Prototype), Session 6 (Prototype-Review), Session 7 (WebP-Konverter Prototype als FileTool-Template), Session 8 (Review), und den Batch-Sessions für Converter-Skalierung (Phase 1). Tool-Typ 9 (Interactive) muss vorher durch einen einfacheren Interactive-Prototyp validiert sein.

---

## Pre-Execution Checklist (Pflicht — vor Task 1)

**Wenn du dieser Agent bist, der den Plan neu aufnimmt:** Arbeite diese Liste **in Reihenfolge** ab. Brich ab und melde dich beim User, sobald eine Zeile fehlschlägt. Starte Task 1 NUR wenn alle ✅ sind.

### A — Read-First (diese Dateien MÜSSEN gelesen werden)

| # | Datei | Warum |
|---|---|---|
| 1 | `CLAUDE.md` | Arbeitsprinzipien, Git-Account-Lock, Session-Ritual — Non-Negotiables |
| 2 | `PROGRESS.md` | Aktueller Projekt-Status; prüfe ob Phase 1 abgeschlossen ist (siehe Pre-Flight B) |
| 3 | `PROJECT.md` | Gelockte Tech-Stack-Versionen — keine Abweichung |
| 4 | `CONVENTIONS.md` | Code-Regeln (Svelte-5-Runes-only, TS strict, File-Naming, Import-Aliase) |
| 5 | `STYLE.md` | Visual-Rulebook (Token-Vars only, keine Hex-Literals außer Canvas-Ausnahme Task 13) |
| 6 | `CONTENT.md` | Copy-Regeln (Du-Anrede, H1/H2-Sequenz, 300–800 Wörter, FAQ-`details`) |
| 7 | `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` Section 18 | Non-Negotiables-Liste für Acceptance |
| 8 | Diesen Plan (hier) komplett, inkl. Research-Decisions R1–R16 | Locked-Entscheidungen — nicht überschreiben |
| 9 | `.claude/projects/c--Users-carin--gemini-Konverter-Webseite/memory/MEMORY.md` und verlinkte Einträge | User-Präferenzen, Git-Account-Regel, Design-Memos |

### B — Pre-Flight (ausführbare Prüfungen, in Reihenfolge)

- [ ] **B1 — Git-Account-Lock.** Run: `bash scripts/check-git-account.sh`
  → **STOP** wenn rot. Fix: `git config user.email paulkuhn.cut@gmail.com && git config user.name pkcut-lab`. Nur `pkcut-lab` darf in diesem Workspace committen (hartes Memory-Lock).

- [ ] **B2 — Phase-0-Foundation komplett.** PROGRESS.md muss Session 1–10 als ✅ zeigen.
  → **STOP** und sage dem User: „Persönlichkeitstest ist Phase-2-Deliverable; Foundation-Sessions X–Y sind noch offen. Bitte zuerst Foundation schließen."

- [ ] **B3 — Tool-Config-Foundation vorhanden.**
  Run: `test -f src/lib/tools/schemas.ts && test -f src/lib/slug-map.ts && echo OK || echo MISSING`
  Erwartet: `OK`. → **STOP** wenn MISSING: Session 4 ist nicht durch.

- [ ] **B4 — `parseToolConfig` exportiert `interactive`-Typ.**
  Run: `grep -n "'interactive'" src/lib/tools/schemas.ts`
  Erwartet: mindestens ein Treffer. → **STOP** wenn leer: Session 4 hat den Interactive-Typ nicht registriert.

- [ ] **B5 — BaseLayout und i18n-Props stimmen mit Task-15-Signatur überein.**
  Run: `grep -nE "lang|title|description|pathWithoutLang" src/layouts/BaseLayout.astro`
  Erwartet: alle vier Prop-Namen. → Falls BaseLayout die Prop-Namen inzwischen geändert hat: Task 15 entsprechend anpassen BEVOR du Code schreibst, nicht danach.

- [ ] **B6 — `tokens.css` hat alle referenzierten Token-Variablen.**
  Run: `grep -nE "^ *--(color-accent|color-surface|color-text-|color-border|space-|font-size-|font-fw-|font-lh-|r-)" src/styles/tokens.css | wc -l`
  Erwartet: ≥ 25 Treffer. → STOP falls deutlich weniger: `tokens.css` ist unvollständig.

- [ ] **B7 — Mindestens ein Interactive-Prototype existiert.**
  Erwartet: ein anderer Tool-Typ „interactive" ist bereits produktiv (z.B. ein einfacher Selbsttest oder Farbwähler). → **STOP** falls nicht: Dieser Plan ist zu groß, um der erste Interactive zu sein.

- [ ] **B8 — Branch-Setup.**
  Run: `git checkout -b feat/personality-test-v1 main`
  Expected: neuer Branch vom aktuellen `main`. Ein Commit = ein Task = ein Schritt gemäß CLAUDE.md §3 (Surgical Changes).

- [ ] **B9 — Bestätigung des Users einholen.** Melde: „Pre-Flight grün. Starte Task 1 — Types. OK?" und warte auf explizites Go. Danach erst TodoWrite anlegen und Task 1 beginnen.

### C — Pickup-Instruktionen für Subagent-Driven-Execution

- **Eine Task = ein frischer Subagent.** Kontext bleibt sauber, Fehlertoleranz hoch.
- **Task-Prompt-Template für Subagent:**
  - Verweise auf diesen Plan-Pfad absolut.
  - Nenne die Task-Nummer und den erwarteten Code/Test.
  - Sage: „Read CLAUDE.md, PROGRESS.md, CONVENTIONS.md, STYLE.md (falls relevant) BEFORE you write code. Don't deviate from the plan. Commit with Rulebooks-Read trailer. Report: what you wrote, test output, git SHA."
- **Nach jedem Subagent-Output:** Diff prüfen, Tests lokal selbst laufen lassen, dann Review-Entscheidung: merge / adjust / retry.
- **Wenn ein Task scheitert:** NICHT in den nächsten springen. Ursache debuggen (meist: Plan nimmt eine Abhängigkeit an, die nicht existiert). User benachrichtigen.

### D — Acceptance-Kriterien (vor Merge zu main)

- [ ] Alle 20 Tasks grün (Checkboxen in dieser Datei abgehakt).
- [ ] Test-Coverage: `npm run test` zeigt ≥ 95 % Pass auf `src/lib/personality-test/*`.
- [ ] `npm run build` läuft clean, keine TS-Errors, Astro-Output enthält `/de/persoenlichkeitstest/index.html`.
- [ ] Lighthouse (lokal, mobile): Performance ≥ 95, Accessibility = 100, SEO = 100.
- [ ] Manuelle Verifikation Happy Path: 50 Fragen beantworten → Result-View rendert → Share-Card-PNG wird als File erzeugt (Web-Share oder Download).
- [ ] DevTools Network-Tab während Test-Durchlauf: **keine einzige Server-Request für Antworten oder Ergebnis**. Privacy-Non-Negotiable #2 runtime-verifiziert.
- [ ] `PROGRESS.md` aktualisiert (Task 20).
- [ ] PR-Beschreibung listet R1–R16 und D1–D4 als gelockte Entscheidungen — keine davon nachverhandelt.

---

## Research-Decisions (gelockt vor Plan-Start)

Basierend auf Deep-Scrape von 16personalities.com und IPIP/Big-Five-Literatur (ipip.ori.org, Johnson 2014, Sauro MeasuringU, SurveyMonkey Progress-Bar-Studie, W3C WAI-ARIA Radio-Group-Pattern):

| # | Entscheidung | Grund |
|---|--------------|-------|
| R1 | **50 Items** (IPIP-Big-Five-Markers, Goldberg 1992), nicht 60 | Kein validierter Public-Domain-60er existiert; 50er hat α ≈ .84 und ist der leichteste wissenschaftlich defensible Footprint |
| R2 | **Likert-5** (1–5), nicht 7 | IPIP-Standard. 7 hat nur marginal bessere Psychometrik, kostet aber Mobile-UX-Aufwand |
| R3 | **Horizontale Bar-Chart** als primäre Ergebnis-Viz | Radar-Chart ist a11y-feindlich, Achsen-Reihenfolge verzerrt Wahrnehmung; Bar ist screen-reader-freundlich und clinical-standard |
| R4 | **Radar-Chart nur als dekorative Share-Card**, sekundär | Viralitäts-Element, aber nicht primary Display |
| R5 | **Progress-Bar am unteren Rand, visuell ohne Prozent/Zahl** | SurveyMonkey-Studie: top+numerisch senkt Completion; bottom+visuell steigert sie |
| R6 | **Native `<input type="radio">` in `<fieldset><legend>`**, kein Slider | WAI-ARIA-Konform, Screen-Reader-safe, Keyboard-Arrow-Keys free |
| R7 | **Eine Frage pro Screen auf Mobile; 5 auf Desktop ≥1024 px** | Mobile-Completion-Rates ~36 % höher bei One-per-Screen; Desktop-Power-User profitieren von Paging |
| R8 | **Fixed interleaved Order**, keine echte Randomisierung | IPIP-Pattern ABABAB (alterniert +/−) reicht gegen Acquiescence-Bias; deterministisch = testbar |
| R9 | **6 German-native Archetypen** (5 Trait-Dominant + 1 "der-balancierte"), keine 16-Kombos, keine MBTI-Codes, keine "Architect"/"Advocate" | Trademark-Risiko (MBTI® + 16p NERIS®); 5 Trait-Dominant + 1 Balanced bleibt ehrlich zum Big-Five-Spektrum. 8-Würfel (E×C×N) droppt O und A stillschweigend — unglaubwürdig. |
| R16 | **`der-balancierte` zeigt Top-2-Stärken als Nuance**, nicht als catch-all "du bist mittig" | Das "balanced"-Label ist sonst eine Enttäuschung. Reframe: "Dein Profil ist ausgeglichen — deine Top-2-Ausprägungen sind X und Y." Gibt multi-peak-Usern ein teilbares, spezifisches Ergebnis ohne 8. Archetyp. |
| R10 | **Inline-Start**: erste Frage sichtbar ohne "Start"-Click | 16p-Pattern (Zero-Friction-Entry) — User antwortet, bevor er committet |
| R11 | **Keine Percentiles in v1**, stattdessen Percentage-of-Max | Norms brauchen Demographie-Matching; ehrlicher: "Position auf Skala", nicht "78. Perzentil" |
| R12 | **Share-Card 1200×630 PNG, < 500 KB, keine Prozente auf dem Bild** | OG-Standard; Labels statt Zahlen → 2–3× höhere Social-Share-Rate (16p/Truity-Präzedenz) |
| R13 | **Public-Domain-IPIP als Basis**, eigene deutsche Formulierungen basierend auf IPIP-Konstrukten | IPIP erlaubt Copy/Edit/Translate frei; eigene Formulierungen minimieren Verwechslungsrisiko |
| R14 | **sessionStorage**, nicht localStorage | Browser-Close = Daten weg (Privacy-First, Non-Negotiable #2) |
| R15 | **Privacy-Badge sichtbar auf Ergebnis-Seite** | Differenzierung zu 16p (der Server-seitig trackt); runtime-beweisbar: kein Netzwerk-Call |

Diese 16 Entscheidungen überschreiben den vorherigen Konzept-Draft (`specs/2026-04-18-persoenlichkeitstest-tool-plan.md`) dort, wo sie kollidieren (ehemals 60 Items/Likert-7/Radar-primary/60-Beispielfragen).

---

## File Structure

**Create:**
- `src/lib/personality-test/types.ts` — `Question`, `Answer`, `DomainScore`, `Archetype`, `TestState`, `Result`-Pattern
- `src/lib/personality-test/questions-de.ts` — 50 deutsche Items mit Keying + Domain (IPIP-BFM-50 basierend)
- `src/lib/personality-test/scoring.ts` — Reverse-Scoring, Domain-Aggregation, Percentage-Normalisierung
- `src/lib/personality-test/archetypes.ts` — Archetypen-Mapping aus 5 Domain-Scores
- `src/lib/personality-test/descriptions-de.ts` — Deutsche Beschreibungstexte pro Domain × 5 Stufen + pro Archetyp
- `src/lib/personality-test/storage.ts` — sessionStorage-Wrapper mit Schema-Versioning
- `src/lib/tools/personality-test.config.ts` — Tool-Config (Zod-validiert)
- `src/components/tools/personality-test/PersonalityTest.svelte` — Orchestrator-Island (Runes-State-Machine)
- `src/components/tools/personality-test/TestIntro.svelte` — View 1: Intro + erste Frage inline
- `src/components/tools/personality-test/TestQuestion.svelte` — View 2: Einzelfrage mit Radio-Group
- `src/components/tools/personality-test/TestProgress.svelte` — Fortschrittsbalken (unten, visuell-only)
- `src/components/tools/personality-test/TestResult.svelte` — View 3: Ergebnis-Dashboard
- `src/components/tools/personality-test/TraitBar.svelte` — Horizontaler Bar mit bipolaren Ankern
- `src/components/tools/personality-test/ArchetypeCard.svelte` — Archetyp-Hero mit Pencil-Sketch-Icon
- `src/components/tools/personality-test/ShareCard.svelte` — Canvas-zu-PNG-Renderer (1200×630)
- `src/components/tools/personality-test/PrivacyBadge.svelte` — "Deine Antworten haben nie den Browser verlassen"
- `src/pages/de/persoenlichkeitstest.astro` — Astro-Seite mit SEO-Frontmatter + Svelte-Island
- `src/content/tools/persoenlichkeitstest/de.md` — SEO-Content nach CONTENT.md-Pattern
- `public/icons/tools/persoenlichkeitstest.png` — Pencil-Sketch-Icon (Tool-Level)
- `public/icons/archetypes/der-stratege.png` … (5 Archetyp-Icons)
- `tests/lib/personality-test/scoring.test.ts` — Scoring-Korrektheit
- `tests/lib/personality-test/archetypes.test.ts` — Archetyp-Mapping-Fixtures
- `tests/lib/personality-test/questions.test.ts` — Struktur- und Balance-Invarianten
- `tests/lib/personality-test/storage.test.ts` — sessionStorage-Roundtrip + Schema-Version-Guard
- `tests/components/personality-test.test.ts` — UI-Integration (happy path)

**Update:**
- `PROGRESS.md` — Tool-Inventar um `persoenlichkeitstest` ergänzen, Session-Eintrag hinzufügen
- `src/lib/tools/categories.ts` — Kategorie `psychologie` registrieren (Datei neu anlegen falls nicht vorhanden; siehe Task 8a)

**Do not touch:**
- `src/lib/hreflang.ts`, `src/lib/site.ts`, `src/layouts/*`, `src/styles/tokens.css`, `STYLE.md`, `TRANSLATION.md`, sämtliche anderen Tool-Configs.

---

## Task 1 — Types + Shared Primitives

**Files:**
- Create: `src/lib/personality-test/types.ts`

**Rationale:** Alle anderen Module importieren von hier. Pure Types, kein Runtime-Code. Locked in Task 1 — Signaturen später zu ändern bricht jeden Folge-Task.

- [ ] **Step 1.1 — Write `src/lib/personality-test/types.ts`**

```typescript
import type { Result } from '../tools/types';

export const DOMAINS = ['O', 'C', 'E', 'A', 'N'] as const;
export type Domain = (typeof DOMAINS)[number];

export const ARCHETYPES = [
  'der-neugierige',
  'der-stratege',
  'der-enthusiast',
  'der-harmoniseur',
  'der-feinfuehlige',
  'der-balancierte',
] as const;
export type ArchetypeId = (typeof ARCHETYPES)[number];

export interface Question {
  readonly id: number;
  readonly text: string;
  readonly domain: Domain;
  readonly reversed: boolean;
}

export interface Answer {
  readonly questionId: number;
  readonly value: 1 | 2 | 3 | 4 | 5;
}

export interface DomainScore {
  readonly domain: Domain;
  readonly raw: number;
  readonly percentage: number;
  readonly level: 'sehr-niedrig' | 'niedrig' | 'durchschnittlich' | 'hoch' | 'sehr-hoch';
}

export interface TestResult {
  readonly answers: readonly Answer[];
  readonly scores: readonly DomainScore[];
  readonly archetype: ArchetypeId;
  readonly completedAt: number;
}

export type View = 'intro' | 'question' | 'result';

export interface TestState {
  readonly view: View;
  readonly currentQuestionIndex: number;
  readonly answers: readonly Answer[];
  readonly startedAt: number | null;
  readonly result: TestResult | null;
}

export type StorageResult<T> = Result<T, 'parse-failed' | 'version-mismatch' | 'not-found'>;
```

- [ ] **Step 1.2 — Commit**

```bash
git add src/lib/personality-test/types.ts
git commit -m "feat(personality-test): add shared types"
```

---

## Task 2a — Fragenkatalog (O + C, 20 Items)

**Files:**
- Create: `src/lib/personality-test/questions-de.ts` (erste Hälfte: Openness + Conscientiousness)

**Rationale:** 50 Items = 10 pro Domain × 5 Domains, je 5 positiv- und 5 revers-gekeyt. Reihenfolge interleaved ABABAB nach IPIP-Pattern (Frage 1: O+, Frage 2: C+, Frage 3: E+, Frage 4: A+, Frage 5: N+, Frage 6: O−, …). ID = `1..50` in exakt dieser Reihenfolge. Domain-Zuordnung ist der Wahrheits-Indikator, nicht die Reihenfolge.

Items sind eigene deutsche Formulierungen, die die IPIP-BFM-50-Konstrukte inhaltlich abbilden, aber nicht verbatim aus einer einzelnen Quelle kopieren (defensive Praxis gegen Verwechslungsvorwürfe mit anderen kommerziellen Tests).

- [ ] **Step 2a.1 — Create `src/lib/personality-test/questions-de.ts` (Skeleton + O/C Items)**

```typescript
import type { Question } from './types';

export const QUESTIONS_DE: readonly Question[] = [
  { id: 1, text: 'Ich habe eine lebhafte Vorstellungskraft und tagträume häufig.', domain: 'O', reversed: false },
  { id: 2, text: 'Ich führe Listen und arbeite Aufgaben systematisch ab.', domain: 'C', reversed: false },
  { id: 3, text: 'Ich fühle mich in großen Gruppen wohl und genieße es, im Mittelpunkt zu stehen.', domain: 'E', reversed: false },
  { id: 4, text: 'Ich glaube, dass die meisten Menschen im Grunde gute Absichten haben.', domain: 'A', reversed: false },
  { id: 5, text: 'Ich mache mir häufig Sorgen über Dinge, die noch nicht passiert sind.', domain: 'N', reversed: false },
  { id: 6, text: 'Ich halte mich lieber an bewährte Methoden, statt ständig Neues auszuprobieren.', domain: 'O', reversed: true },
  { id: 7, text: 'Ich neige dazu, Aufgaben bis zur letzten Minute aufzuschieben.', domain: 'C', reversed: true },
  { id: 8, text: 'Auf Partys halte ich mich lieber im Hintergrund.', domain: 'E', reversed: true },
  { id: 9, text: 'In Diskussionen setze ich meinen Standpunkt durch, auch wenn andere sich unwohl fühlen.', domain: 'A', reversed: true },
  { id: 10, text: 'Auch in stressigen Situationen bleibe ich innerlich ruhig und gefasst.', domain: 'N', reversed: true },
  { id: 11, text: 'Abstrakte philosophische Fragen faszinieren mich mehr als alltagspraktische.', domain: 'O', reversed: false },
  { id: 12, text: 'Ordnung und Sauberkeit in meinem Umfeld sind mir wichtig.', domain: 'C', reversed: false },
  { id: 13, text: 'Ich bin meistens diejenige Person, die in einer Gruppe das Gespräch beginnt.', domain: 'E', reversed: false },
  { id: 14, text: 'Ich helfe anderen gern, auch wenn ich selbst dadurch Nachteile habe.', domain: 'A', reversed: false },
  { id: 15, text: 'Kleinigkeiten können mich unverhältnismäßig stark aufregen.', domain: 'N', reversed: false },
  { id: 16, text: 'Wenn etwas funktioniert, sehe ich keinen Grund, es zu ändern.', domain: 'O', reversed: true },
  { id: 17, text: 'Mein Schreibtisch sieht meistens eher chaotisch aus.', domain: 'C', reversed: true },
  { id: 18, text: 'Nach einem langen Tag unter Menschen brauche ich Zeit allein, um meine Energie wieder aufzuladen.', domain: 'E', reversed: true },
  { id: 19, text: 'Ich sage direkt und unverblümt, was ich denke — auch wenn es wehtut.', domain: 'A', reversed: true },
  { id: 20, text: 'Rückschläge stecke ich schnell weg und mache weiter.', domain: 'N', reversed: true },
];
// Fortsetzung in Task 2b
```

- [ ] **Step 2a.2 — Commit**

```bash
git add src/lib/personality-test/questions-de.ts
git commit -m "feat(personality-test): add questions 1-20 (O/C partial)"
```

---

## Task 2b — Fragenkatalog (E + A + N, 30 Items)

**Files:**
- Modify: `src/lib/personality-test/questions-de.ts` (Zeilen nach der letzten Item-Definition)

- [ ] **Step 2b.1 — Append items 21–50 to the array before the closing `];`**

Ersetze `// Fortsetzung in Task 2b` mit folgenden 30 Items (weiterhin ABABAB interleaved über Domain-Achse, +reverse pattern abwechselnd):

```typescript
  { id: 21, text: 'Kunst und Musik können mich tief emotional berühren.', domain: 'O', reversed: false },
  { id: 22, text: 'Wenn ich ein Versprechen gebe, halte ich es auch ein.', domain: 'C', reversed: false },
  { id: 23, text: 'Ich bin begeistert von neuen sozialen Situationen und lerne gern neue Menschen kennen.', domain: 'E', reversed: false },
  { id: 24, text: 'Ich versuche, Konflikte zu vermeiden und diplomatische Lösungen zu finden.', domain: 'A', reversed: false },
  { id: 25, text: 'Ich habe Phasen, in denen ich mich ohne konkreten Anlass niedergeschlagen fühle.', domain: 'N', reversed: false },
  { id: 26, text: 'Ich bin eher praktisch veranlagt und halte wenig von theoretischem Grübeln.', domain: 'O', reversed: true },
  { id: 27, text: 'Es fällt mir schwer, mich an feste Zeitpläne zu halten.', domain: 'C', reversed: true },
  { id: 28, text: 'Ich bin eher still und beobachtend in Meetings oder Diskussionen.', domain: 'E', reversed: true },
  { id: 29, text: 'Im Wettbewerb geht es mir darum zu gewinnen, nicht darum, nett zu sein.', domain: 'A', reversed: true },
  { id: 30, text: 'Ich würde mich als emotional sehr stabil und ausgeglichen beschreiben.', domain: 'N', reversed: true },
  { id: 31, text: 'Ich lese gern über Kulturen und Ideen, die völlig anders sind als meine eigenen.', domain: 'O', reversed: false },
  { id: 32, text: 'Ich setze mir klare Ziele und verfolge sie konsequent.', domain: 'C', reversed: false },
  { id: 33, text: 'Mein Energielevel steigt, wenn ich unter Menschen bin.', domain: 'E', reversed: false },
  { id: 34, text: 'Das Wohlbefinden anderer ist mir genauso wichtig wie mein eigenes.', domain: 'A', reversed: false },
  { id: 35, text: 'In sozialen Situationen frage ich mich oft, ob andere mich negativ bewerten.', domain: 'N', reversed: false },
  { id: 36, text: 'Poesie und symbolische Sprache langweilen mich eher.', domain: 'O', reversed: true },
  { id: 37, text: 'Ich handle bei Entscheidungen oft spontan aus dem Bauch heraus.', domain: 'C', reversed: true },
  { id: 38, text: 'Ich verbringe meine freie Zeit am liebsten allein mit einem Buch oder Hobby.', domain: 'E', reversed: true },
  { id: 39, text: 'Wenn jemand meine Hilfe nicht verdient hat, biete ich sie auch nicht an.', domain: 'A', reversed: true },
  { id: 40, text: 'Kritik an meiner Arbeit nehme ich sachlich auf, ohne sie persönlich zu nehmen.', domain: 'N', reversed: true },
  { id: 41, text: 'Ich probiere gern exotisches Essen aus, auch wenn ich nicht weiß, was mich erwartet.', domain: 'O', reversed: false },
  { id: 42, text: 'Ich überprüfe meine Arbeit gründlich, bevor ich sie abgebe.', domain: 'C', reversed: false },
  { id: 43, text: 'Mir fällt es leicht, Fremde in ein Gespräch zu verwickeln.', domain: 'E', reversed: false },
  { id: 44, text: 'Ich fühle mit Menschen, die ungerecht behandelt werden, und möchte ihnen helfen.', domain: 'A', reversed: false },
  { id: 45, text: 'Ich neige dazu, über vergangene Fehler lange nachzugrübeln.', domain: 'N', reversed: false },
  { id: 46, text: 'Ich fühle mich am wohlsten in vertrauten Umgebungen und Situationen.', domain: 'O', reversed: true },
  { id: 47, text: 'Details interessieren mich weniger — mir geht es ums große Ganze.', domain: 'C', reversed: true },
  { id: 48, text: 'Ich fühle mich nach langen Networking-Events erschöpft.', domain: 'E', reversed: true },
  { id: 49, text: 'Bescheidenheit wird in unserer Gesellschaft überbewertet.', domain: 'A', reversed: true },
  { id: 50, text: 'Ich fühle mich selten von meinen Emotionen überwältigt.', domain: 'N', reversed: true },
];
```

- [ ] **Step 2b.2 — Commit**

```bash
git add src/lib/personality-test/questions-de.ts
git commit -m "feat(personality-test): complete 50-item question set"
```

---

## Task 3 — Question-Struktur-Invarianten (Tests before Scoring)

**Files:**
- Create: `tests/lib/personality-test/questions.test.ts`

**Rationale:** Bevor wir Scoring bauen, locken wir die Daten-Struktur durch Tests. Ein Typo in `domain: 'E'` → `domain: 'A'` verschiebt sonst den ganzen Score.

- [ ] **Step 3.1 — Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { QUESTIONS_DE } from '~/lib/personality-test/questions-de';
import { DOMAINS } from '~/lib/personality-test/types';

describe('questions-de invariants', () => {
  it('has exactly 50 items', () => {
    expect(QUESTIONS_DE.length).toBe(50);
  });

  it('has exactly 10 items per domain', () => {
    for (const d of DOMAINS) {
      expect(QUESTIONS_DE.filter((q) => q.domain === d).length).toBe(10);
    }
  });

  it('has exactly 5 reversed and 5 non-reversed per domain', () => {
    for (const d of DOMAINS) {
      const items = QUESTIONS_DE.filter((q) => q.domain === d);
      expect(items.filter((q) => q.reversed).length).toBe(5);
      expect(items.filter((q) => !q.reversed).length).toBe(5);
    }
  });

  it('has strictly increasing ids from 1 to 50', () => {
    QUESTIONS_DE.forEach((q, i) => expect(q.id).toBe(i + 1));
  });

  it('has no duplicate text', () => {
    const texts = QUESTIONS_DE.map((q) => q.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('every text ends with a period', () => {
    QUESTIONS_DE.forEach((q) =>
      expect(q.text.endsWith('.'), `q${q.id}`).toBe(true),
    );
  });
});
```

- [ ] **Step 3.2 — Run tests, expect PASS**

Run: `npm run test tests/lib/personality-test/questions.test.ts`
Expected: 6 passing.

- [ ] **Step 3.3 — If any test fails, fix `questions-de.ts` until all pass, then commit**

```bash
git add tests/lib/personality-test/questions.test.ts
git commit -m "test(personality-test): lock question-set invariants"
```

---

## Task 4 — Scoring-Funktion (TDD)

**Files:**
- Create: `src/lib/personality-test/scoring.ts`
- Create: `tests/lib/personality-test/scoring.test.ts`

**Rationale:** Reine Funktion. Kein State. Input = Answers + Questions. Output = 5 DomainScores. Kein side-effect, kein `new Date()`.

- [ ] **Step 4.1 — Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import type { Answer, Question } from '~/lib/personality-test/types';
import {
  reverseScoreIfNeeded,
  scoreDomain,
  scoreAll,
  levelFromPercentage,
} from '~/lib/personality-test/scoring';

const q = (id: number, domain: 'O' | 'C' | 'E' | 'A' | 'N', reversed: boolean): Question =>
  ({ id, text: `Q${id}`, domain, reversed });

const a = (questionId: number, value: 1 | 2 | 3 | 4 | 5): Answer => ({ questionId, value });

describe('reverseScoreIfNeeded', () => {
  it('returns value unchanged when not reversed', () => {
    expect(reverseScoreIfNeeded(3, false)).toBe(3);
    expect(reverseScoreIfNeeded(5, false)).toBe(5);
  });
  it('mirrors around 3 when reversed (1↔5, 2↔4, 3→3)', () => {
    expect(reverseScoreIfNeeded(1, true)).toBe(5);
    expect(reverseScoreIfNeeded(2, true)).toBe(4);
    expect(reverseScoreIfNeeded(3, true)).toBe(3);
    expect(reverseScoreIfNeeded(4, true)).toBe(2);
    expect(reverseScoreIfNeeded(5, true)).toBe(1);
  });
});

describe('scoreDomain', () => {
  const questions: Question[] = [
    q(1, 'E', false), q(2, 'E', false), q(3, 'E', false), q(4, 'E', false), q(5, 'E', false),
    q(6, 'E', true),  q(7, 'E', true),  q(8, 'E', true),  q(9, 'E', true),  q(10, 'E', true),
  ];

  it('returns raw=10 percentage=0 when all answers are minimum in extraversion direction', () => {
    // All +items = 1, all reversed = 5 → reversed flip back to 1 → total 10
    const answers: Answer[] = [
      a(1, 1), a(2, 1), a(3, 1), a(4, 1), a(5, 1),
      a(6, 5), a(7, 5), a(8, 5), a(9, 5), a(10, 5),
    ];
    const r = scoreDomain(answers, questions, 'E');
    expect(r.raw).toBe(10);
    expect(r.percentage).toBe(0);
    expect(r.level).toBe('sehr-niedrig');
  });

  it('returns raw=50 percentage=100 when all answers are maximum in extraversion direction', () => {
    const answers: Answer[] = [
      a(1, 5), a(2, 5), a(3, 5), a(4, 5), a(5, 5),
      a(6, 1), a(7, 1), a(8, 1), a(9, 1), a(10, 1),
    ];
    const r = scoreDomain(answers, questions, 'E');
    expect(r.raw).toBe(50);
    expect(r.percentage).toBe(100);
    expect(r.level).toBe('sehr-hoch');
  });

  it('returns raw=30 percentage=50 when all answers are neutral (3)', () => {
    const answers: Answer[] = Array.from({ length: 10 }, (_, i) => a(i + 1, 3));
    const r = scoreDomain(answers, questions, 'E');
    expect(r.raw).toBe(30);
    expect(r.percentage).toBe(50);
    expect(r.level).toBe('durchschnittlich');
  });

  it('ignores answers whose questions are outside the domain', () => {
    const mixed: Question[] = [...questions, q(11, 'O', false)];
    const answers: Answer[] = [
      a(1, 3), a(2, 3), a(3, 3), a(4, 3), a(5, 3),
      a(6, 3), a(7, 3), a(8, 3), a(9, 3), a(10, 3),
      a(11, 5),
    ];
    const r = scoreDomain(answers, mixed, 'E');
    expect(r.raw).toBe(30);
  });
});

describe('levelFromPercentage', () => {
  it.each([
    [0, 'sehr-niedrig'], [15, 'sehr-niedrig'],
    [16, 'niedrig'], [35, 'niedrig'],
    [36, 'durchschnittlich'], [65, 'durchschnittlich'],
    [66, 'hoch'], [85, 'hoch'],
    [86, 'sehr-hoch'], [100, 'sehr-hoch'],
  ] as const)('%d → %s', (pct, expected) => {
    expect(levelFromPercentage(pct)).toBe(expected);
  });
});

describe('scoreAll', () => {
  it('returns exactly 5 domain scores in OCEAN order', () => {
    const questions: Question[] = [
      ...Array.from({ length: 10 }, (_, i) => q(i + 1, 'O', i % 2 === 1)),
      ...Array.from({ length: 10 }, (_, i) => q(i + 11, 'C', i % 2 === 1)),
      ...Array.from({ length: 10 }, (_, i) => q(i + 21, 'E', i % 2 === 1)),
      ...Array.from({ length: 10 }, (_, i) => q(i + 31, 'A', i % 2 === 1)),
      ...Array.from({ length: 10 }, (_, i) => q(i + 41, 'N', i % 2 === 1)),
    ];
    const answers: Answer[] = Array.from({ length: 50 }, (_, i) => a(i + 1, 3));
    const r = scoreAll(answers, questions);
    expect(r.map((s) => s.domain)).toEqual(['O', 'C', 'E', 'A', 'N']);
    r.forEach((s) => expect(s.percentage).toBe(50));
  });
});
```

- [ ] **Step 4.2 — Run tests to verify they fail**

Run: `npm run test tests/lib/personality-test/scoring.test.ts`
Expected: All fail with "module not found".

- [ ] **Step 4.3 — Write implementation `src/lib/personality-test/scoring.ts`**

```typescript
import type {
  Answer,
  Domain,
  DomainScore,
  Question,
} from './types';
import { DOMAINS } from './types';

export const LIKERT_MIN = 1;
export const LIKERT_MAX = 5;
export const ITEMS_PER_DOMAIN = 10;
export const DOMAIN_RAW_MIN = LIKERT_MIN * ITEMS_PER_DOMAIN;   // 10
export const DOMAIN_RAW_MAX = LIKERT_MAX * ITEMS_PER_DOMAIN;   // 50

export function reverseScoreIfNeeded(value: number, reversed: boolean): number {
  return reversed ? LIKERT_MIN + LIKERT_MAX - value : value;
}

export function levelFromPercentage(pct: number): DomainScore['level'] {
  if (pct <= 15) return 'sehr-niedrig';
  if (pct <= 35) return 'niedrig';
  if (pct <= 65) return 'durchschnittlich';
  if (pct <= 85) return 'hoch';
  return 'sehr-hoch';
}

export function scoreDomain(
  answers: readonly Answer[],
  questions: readonly Question[],
  domain: Domain,
): DomainScore {
  const domainQuestionIds = new Set(
    questions.filter((q) => q.domain === domain).map((q) => q.id),
  );
  const questionById = new Map(questions.map((q) => [q.id, q]));

  let raw = 0;
  for (const answer of answers) {
    if (!domainQuestionIds.has(answer.questionId)) continue;
    const q = questionById.get(answer.questionId)!;
    raw += reverseScoreIfNeeded(answer.value, q.reversed);
  }

  const percentage = Math.round(
    ((raw - DOMAIN_RAW_MIN) / (DOMAIN_RAW_MAX - DOMAIN_RAW_MIN)) * 100,
  );

  return { domain, raw, percentage, level: levelFromPercentage(percentage) };
}

export function scoreAll(
  answers: readonly Answer[],
  questions: readonly Question[],
): readonly DomainScore[] {
  return DOMAINS.map((d) => scoreDomain(answers, questions, d));
}
```

- [ ] **Step 4.4 — Run tests to verify they pass**

Run: `npm run test tests/lib/personality-test/scoring.test.ts`
Expected: All passing (18+ tests).

- [ ] **Step 4.5 — Commit**

```bash
git add src/lib/personality-test/scoring.ts tests/lib/personality-test/scoring.test.ts
git commit -m "feat(personality-test): add domain scoring with reverse-keying"
```

---

## Task 5 — Archetype-Mapping (TDD)

**Files:**
- Create: `src/lib/personality-test/archetypes.ts`
- Create: `tests/lib/personality-test/archetypes.test.ts`

**Rationale:** 6 Archetypen (5 Trait-Dominant + `der-balancierte`) werden aus den 5 Domain-Scores abgeleitet nach folgender Regel:

1. Berechne pro Domain die **absolute Abweichung vom Mittel (50 %)**: `|pct − 50|`.
2. Wenn maximale Abweichung `< 15` Punkte → Archetyp `der-balancierte` (keine Domain sticht hervor).
3. Andernfalls wähle die Domain mit der höchsten Abweichung:
   - O → `der-neugierige` (wenn pct ≥ 50) ODER `der-pragmatiker`, falls wir jemals einen 6. Archetyp brauchen — v1: bei niedrigem O → `der-balancierte` (Fallback, low-O ist schwer zu positiv zu rahmen)
   - C → `der-stratege`
   - E → `der-enthusiast` (nur bei pct ≥ 50; low-E fällt auf `der-balancierte`)
   - A → `der-harmoniseur` (nur bei pct ≥ 50; low-A fällt auf `der-balancierte`)
   - N → `der-feinfuehlige` (nur bei pct ≥ 50; low-N = "emotional stabil" fällt auf `der-balancierte`)

In v1 ist die Archetyp-Projektion bewusst **asymmetrisch positiv** — wir kennen nur die 5 "Flaggen-nach-Oben"-Archetypen plus den Balanced-Fallback. Das reduziert die Beschreibungstext-Last von 10 Stufen auf 6 und vermeidet negativ gerahmte Labels ("Der Distanzierte" für low-E würde User abschrecken).

- [ ] **Step 5.1 — Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import type { DomainScore } from '~/lib/personality-test/types';
import { pickArchetype, computeBalancedNuance } from '~/lib/personality-test/archetypes';

const s = (domain: DomainScore['domain'], percentage: number): DomainScore => ({
  domain,
  raw: 0,
  percentage,
  level: 'durchschnittlich',
});

describe('pickArchetype', () => {
  it('returns der-balancierte when all scores are within ±14 of 50', () => {
    const scores = [s('O', 50), s('C', 55), s('E', 45), s('A', 60), s('N', 40)];
    expect(pickArchetype(scores)).toBe('der-balancierte');
  });

  it('returns der-stratege when C is the strongest above-50 deviation', () => {
    const scores = [s('O', 55), s('C', 90), s('E', 50), s('A', 55), s('N', 50)];
    expect(pickArchetype(scores)).toBe('der-stratege');
  });

  it('returns der-enthusiast when E is dominant-high', () => {
    const scores = [s('O', 50), s('C', 50), s('E', 85), s('A', 55), s('N', 45)];
    expect(pickArchetype(scores)).toBe('der-enthusiast');
  });

  it('returns der-harmoniseur when A is dominant-high', () => {
    const scores = [s('O', 50), s('C', 50), s('E', 50), s('A', 88), s('N', 50)];
    expect(pickArchetype(scores)).toBe('der-harmoniseur');
  });

  it('returns der-feinfuehlige when N is dominant-high', () => {
    const scores = [s('O', 50), s('C', 50), s('E', 50), s('A', 50), s('N', 82)];
    expect(pickArchetype(scores)).toBe('der-feinfuehlige');
  });

  it('returns der-neugierige when O is dominant-high', () => {
    const scores = [s('O', 90), s('C', 50), s('E', 50), s('A', 50), s('N', 50)];
    expect(pickArchetype(scores)).toBe('der-neugierige');
  });

  it('returns der-balancierte when dominant deviation is low (N=20) because low-N maps to balanced', () => {
    const scores = [s('O', 50), s('C', 52), s('E', 48), s('A', 50), s('N', 20)];
    expect(pickArchetype(scores)).toBe('der-balancierte');
  });

  it('is deterministic for ties — earliest OCEAN wins', () => {
    const scores = [s('O', 80), s('C', 80), s('E', 50), s('A', 50), s('N', 50)];
    expect(pickArchetype(scores)).toBe('der-neugierige');
  });
});

describe('computeBalancedNuance', () => {
  it('returns the two domains with largest absolute deviation from 50', () => {
    const scores = [s('O', 62), s('C', 48), s('E', 55), s('A', 40), s('N', 52)];
    // |deviations|: O=12, C=2, E=5, A=10, N=2 → top-2 = O, A
    const nuance = computeBalancedNuance(scores);
    expect(nuance.top1.domain).toBe('O');
    expect(nuance.top2.domain).toBe('A');
  });

  it('preserves sign (direction) on nuance for label rendering', () => {
    const scores = [s('O', 62), s('C', 48), s('E', 55), s('A', 40), s('N', 52)];
    const nuance = computeBalancedNuance(scores);
    expect(nuance.top1.direction).toBe('high'); // O=62 > 50
    expect(nuance.top2.direction).toBe('low');  // A=40 < 50
  });

  it('returns OCEAN order for deviation ties', () => {
    const scores = [s('O', 55), s('C', 55), s('E', 50), s('A', 50), s('N', 50)];
    const nuance = computeBalancedNuance(scores);
    expect(nuance.top1.domain).toBe('O');
    expect(nuance.top2.domain).toBe('C');
  });
});
```

- [ ] **Step 5.2 — Run tests to verify they fail**

Run: `npm run test tests/lib/personality-test/archetypes.test.ts`
Expected: All fail with "module not found".

- [ ] **Step 5.3 — Write implementation `src/lib/personality-test/archetypes.ts`**

```typescript
import type { ArchetypeId, Domain, DomainScore } from './types';

const HIGH_ARCHETYPE: Record<Domain, ArchetypeId> = {
  O: 'der-neugierige',
  C: 'der-stratege',
  E: 'der-enthusiast',
  A: 'der-harmoniseur',
  N: 'der-feinfuehlige',
};

const BALANCED_THRESHOLD = 15;

export function pickArchetype(scores: readonly DomainScore[]): ArchetypeId {
  let best: { domain: Domain; deviation: number } | null = null;

  for (const s of scores) {
    const deviation = s.percentage - 50;
    if (deviation < BALANCED_THRESHOLD) continue;
    if (best === null || deviation > best.deviation) {
      best = { domain: s.domain, deviation };
    }
  }

  return best === null ? 'der-balancierte' : HIGH_ARCHETYPE[best.domain];
}

export interface BalancedNuanceEntry {
  readonly domain: Domain;
  readonly direction: 'high' | 'low';
  readonly absoluteDeviation: number;
}

export interface BalancedNuance {
  readonly top1: BalancedNuanceEntry;
  readonly top2: BalancedNuanceEntry;
}

const OCEAN_ORDER: readonly Domain[] = ['O', 'C', 'E', 'A', 'N'];

export function computeBalancedNuance(scores: readonly DomainScore[]): BalancedNuance {
  // Preserve OCEAN order as tiebreaker by iterating in OCEAN_ORDER
  const sorted = [...OCEAN_ORDER]
    .map((domain) => {
      const s = scores.find((x) => x.domain === domain);
      if (!s) throw new Error(`Missing score for domain ${domain}`);
      const signedDeviation = s.percentage - 50;
      return {
        domain,
        direction: (signedDeviation >= 0 ? 'high' : 'low') as 'high' | 'low',
        absoluteDeviation: Math.abs(signedDeviation),
      };
    })
    // Stable sort — ties preserve OCEAN order
    .sort((a, b) => b.absoluteDeviation - a.absoluteDeviation);

  return { top1: sorted[0], top2: sorted[1] };
}
```

- [ ] **Step 5.4 — Run tests to verify they pass**

Run: `npm run test tests/lib/personality-test/archetypes.test.ts`
Expected: 11 passing (8 `pickArchetype` + 3 `computeBalancedNuance`).

- [ ] **Step 5.5 — Commit**

```bash
git add src/lib/personality-test/archetypes.ts tests/lib/personality-test/archetypes.test.ts
git commit -m "feat(personality-test): add archetype mapping from domain scores"
```

---

## Task 6 — sessionStorage-Wrapper (TDD)

**Files:**
- Create: `src/lib/personality-test/storage.ts`
- Create: `tests/lib/personality-test/storage.test.ts`

**Rationale:** Wir speichern den Test-State zwischen Page-Reloads. sessionStorage wird beim Tab-Close gelöscht — passt zu Privacy-First. Schema-Version = `1` (erhöhen wenn `TestState`-Shape sich ändert).

- [ ] **Step 6.1 — Write failing tests**

```typescript
/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { saveState, loadState, clearState, STORAGE_KEY } from '~/lib/personality-test/storage';
import type { TestState } from '~/lib/personality-test/types';

const validState: TestState = {
  view: 'question',
  currentQuestionIndex: 3,
  answers: [{ questionId: 1, value: 4 }],
  startedAt: 1234567890,
  result: null,
};

describe('storage', () => {
  beforeEach(() => sessionStorage.clear());

  it('round-trips a valid state', () => {
    saveState(validState);
    const r = loadState();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual(validState);
  });

  it('returns not-found when nothing saved', () => {
    const r = loadState();
    expect(r).toEqual({ ok: false, error: 'not-found' });
  });

  it('returns parse-failed on malformed JSON', () => {
    sessionStorage.setItem(STORAGE_KEY, '{ not json');
    const r = loadState();
    expect(r).toEqual({ ok: false, error: 'parse-failed' });
  });

  it('returns version-mismatch when version differs', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, state: validState }));
    const r = loadState();
    expect(r).toEqual({ ok: false, error: 'version-mismatch' });
  });

  it('clearState removes the key', () => {
    saveState(validState);
    clearState();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
```

- [ ] **Step 6.2 — Run tests to verify they fail**

- [ ] **Step 6.3 — Write implementation `src/lib/personality-test/storage.ts`**

```typescript
import type { TestState, StorageResult } from './types';

export const STORAGE_KEY = 'konverter.personality-test.v1';
const SCHEMA_VERSION = 1;

interface Envelope {
  readonly version: number;
  readonly state: TestState;
}

export function saveState(state: TestState): void {
  if (typeof sessionStorage === 'undefined') return;
  const env: Envelope = { version: SCHEMA_VERSION, state };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(env));
}

export function loadState(): StorageResult<TestState> {
  if (typeof sessionStorage === 'undefined') return { ok: false, error: 'not-found' };
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return { ok: false, error: 'not-found' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'parse-failed' };
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as Envelope).version !== SCHEMA_VERSION
  ) {
    return { ok: false, error: 'version-mismatch' };
  }
  return { ok: true, value: (parsed as Envelope).state };
}

export function clearState(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 6.4 — Run tests, verify pass**

- [ ] **Step 6.5 — Commit**

```bash
git add src/lib/personality-test/storage.ts tests/lib/personality-test/storage.test.ts
git commit -m "feat(personality-test): add sessionStorage wrapper with schema versioning"
```

---

## Task 7 — Archetypen- und Domain-Beschreibungstexte (DE)

**Files:**
- Create: `src/lib/personality-test/descriptions-de.ts`

**Rationale:** Statische Text-Tabellen. 5 Domains × 5 Stufen + 6 Archetypen. ~1800 Wörter Gesamttext. Tone per CONTENT.md §5 (direkt, faktisch, Du-Anrede, keine LLM-Floskeln).

- [ ] **Step 7.1 — Create `src/lib/personality-test/descriptions-de.ts`**

Struktur mit 11 Text-Blöcken — je 120–160 Wörter pro Stufe/Archetyp. Der Writer dieses Tasks produziert Text gemäß §5 + §4 CONTENT.md (keine Superlativ-Phrasen, aktiv, deutsch-nüchtern). Volltext-Seed unten als **Minimum-Viable-Start**; finale Content-Runde durch Copy-Edit-Pass vor Task 19.

```typescript
import type { ArchetypeId, Domain, DomainScore } from './types';

interface ArchetypeDescription {
  readonly id: ArchetypeId;
  readonly name: string;
  readonly motto: string;
  readonly sketchIcon: string; // filename in public/icons/archetypes/
  readonly body: string;       // ~150 words
}

export const ARCHETYPE_DE: Readonly<Record<ArchetypeId, ArchetypeDescription>> = {
  'der-neugierige': {
    id: 'der-neugierige',
    name: 'Der Neugierige',
    motto: 'Ideen sind dein natürliches Terrain.',
    sketchIcon: 'der-neugierige.png',
    body:
      'Du ziehst das Neue dem Bewährten vor. Abstrakte Fragen, fremde Kulturen, ' +
      'ungewöhnliche Ästhetik — dein Kopf sucht aktiv nach Reizen, an denen er sich reiben kann. ' +
      'Im Alltag äußert sich das als Offenheit für Kurswechsel: ein Buch, ein Beruf, eine ' +
      'Überzeugung — alles darf geprüft und überarbeitet werden. In Teams bist du der Impuls, ' +
      'der festgefahrene Pfade verlässt. Schattenseite: Entscheidungsfreude leidet, wenn zu ' +
      'viele Optionen offen bleiben. Wer dich nicht kennt, hält dich manchmal für unfokussiert — ' +
      'dabei ist das Umkreisen eines Themas dein Erkenntnis-Modus.',
  },
  'der-stratege': {
    id: 'der-stratege',
    name: 'Der Stratege',
    motto: 'Pläne, die halten, was sie versprechen.',
    sketchIcon: 'der-stratege.png',
    body:
      'Struktur ist dein Erfolgs-Hebel. Du zerlegst Aufgaben in Etappen, hältst Zusagen ein und ' +
      'hast einen inneren Kompass für Fristen. Das macht dich zum zuverlässigen Gegenüber — ' +
      'Kollegen wissen, dass deine Arbeit hält. Im Privaten merkt man es an Kalender-Hygiene und ' +
      'an der Art, wie du Entscheidungen vorbereitest statt aus dem Bauch trifft. Schattenseite: ' +
      'Spontanität kann sich wie Kontrollverlust anfühlen; Pläne, die sich unterwegs ändern, ' +
      'kosten dich mehr Energie als den Durchschnitt. Wer dich kennt, weiß: Hinter deiner ' +
      'Präzision steht kein Perfektionismus, sondern Respekt vor der Sache und den Menschen, ' +
      'die auf das Ergebnis zählen.',
  },
  'der-enthusiast': {
    id: 'der-enthusiast',
    name: 'Der Enthusiast',
    motto: 'Energie, die andere mitzieht.',
    sketchIcon: 'der-enthusiast.png',
    body:
      'Du lädst dich in sozialen Kontexten auf. Gespräche, neue Begegnungen, ein voller Raum — ' +
      'dort läufst du zur Höchstform. Das Umfeld spürt das: du bist der Person, die ein Meeting ' +
      'auftaut oder eine Party in Gang bringt. Dein Denken läuft im Dialog, nicht im stillen ' +
      'Kämmerlein. Schattenseite: längere Phasen allein können deinen Antrieb drücken, und ' +
      'Introvertierte fühlen sich manchmal überrumpelt von deinem Tempo. Dein Wachstums-Feld ' +
      'liegt im bewussten Dosieren von Reiz: nicht jede Entscheidung muss durch Reden fallen, ' +
      'manche Antworten entstehen erst in Ruhe. Wenn du diese Balance findest, kombiniert sich ' +
      'deine Energie mit echter Tiefe.',
  },
  'der-harmoniseur': {
    id: 'der-harmoniseur',
    name: 'Der Harmoniseur',
    motto: 'Wer zuhört, sieht mehr.',
    sketchIcon: 'der-harmoniseur.png',
    body:
      'Du bist sensibel für das, was in einer Gruppe unausgesprochen mitläuft. Du siehst ' +
      'schnell, wer sich zurückhält, und baust Brücken, bevor Konflikte eskalieren. Deine ' +
      'Grundhaltung gegenüber anderen ist vertrauensvoll — das macht dich zum verlässlichen ' +
      'Partner und zum natürlichen Moderator. Schattenseite: Harmonie-Bedürfnis kann dich von ' +
      'berechtigter Konfrontation abhalten. Du sagst seltener „Nein“, als es dir guttut, und ' +
      'nimmst manchmal Kritik zu persönlich, die sachlich gemeint war. Dein Wachstumsfeld ist ' +
      'das gesunde Abgrenzen: Andere schützen zu wollen ist stark — dich selbst schützen zu ' +
      'können ist genauso wichtig.',
  },
  'der-feinfuehlige': {
    id: 'der-feinfuehlige',
    name: 'Der Feinfühlige',
    motto: 'Tiefe sehen, wo andere nur Oberfläche lesen.',
    sketchIcon: 'der-feinfuehlige.png',
    body:
      'Du nimmst Stimmungen und Zwischentöne wahr, die andere übersehen. Das macht dich ' +
      'aufmerksam, empathisch und in kreativen Feldern produktiv — deine innere Resonanz ist ' +
      'Rohstoff. Die Kehrseite: Stress, Kritik und Unsicherheit treffen dich stärker und länger ' +
      'als den Durchschnitt. Grübel-Schleifen kennst du gut. Wichtig zu wissen: Hohe emotionale ' +
      'Reaktivität ist kein Defizit, sondern ein Sensor mit hoher Auflösung. Sie wird zur ' +
      'Belastung, wenn du sie nicht regulierst — zu einer Stärke, wenn du lernst, zwischen ' +
      'Alarm und echter Gefahr zu unterscheiden. Pausen, Bewegung und ein stabiles Umfeld sind ' +
      'für dich keine Luxus-Tools, sondern Grundversorgung.',
  },
  'der-balancierte': {
    id: 'der-balancierte',
    name: 'Der Balancierte',
    motto: 'Kein Lager, dafür alle Register.',
    sketchIcon: 'der-balancierte.png',
    body:
      'Deine Werte liegen in allen fünf Dimensionen nahe am Mittelfeld. Keine Eigenschaft ' +
      'dominiert — du ziehst je nach Situation das passende Register. Das ist weder langweilig ' +
      'noch Zeichen schwacher Antworten: ausgeglichene Profile sind in der Psychologie so ' +
      'häufig wie ausgeprägte, und sie sind ein Vorteil in Rollen, die Flexibilität verlangen. ' +
      'Du bist selten Typen-Klischee, dafür anpassungsfähig und schwer zu kategorisieren. ' +
      'Achte darauf, diese Flexibilität nicht mit Unentschiedenheit zu verwechseln: Wenn du ' +
      'eine klare Position brauchst, liegen die Ressourcen dafür in dir — nur der Default ist ' +
      'eben „beide Seiten hören“.',
  },
};

interface DomainTexts {
  readonly name: string;
  readonly anchorLow: string;
  readonly anchorHigh: string;
  readonly levels: Readonly<Record<DomainScore['level'], string>>;
}

export const DOMAIN_DE: Readonly<Record<Domain, DomainTexts>> = {
  O: {
    name: 'Offenheit für Erfahrungen',
    anchorLow: 'Praktisch, bewährt',
    anchorHigh: 'Neugierig, ideenreich',
    levels: {
      'sehr-niedrig':
        'Du bevorzugst stark das Bekannte. Routinen geben dir Sicherheit, und abstrakte ' +
        'Diskussionen interessieren dich wenig. Das macht dich im Alltag effizient — ' +
        'kann aber bremsen, wenn das Umfeld einen Wandel erzwingt.',
      niedrig:
        'Du magst es funktional. Neue Ideen prüfst du zurückhaltend und adoptierst sie erst, ' +
        'wenn ihr Nutzen klar ist. In Teams bist du das Korrektiv gegen zu schnelle Experimente.',
      durchschnittlich:
        'Du balancierst Neues und Bewährtes situationsabhängig. Veränderung schreckt dich nicht, ' +
        'aber du brauchst sie auch nicht ständig — das ist die häufigste Ausprägung.',
      hoch:
        'Du suchst aktiv nach neuen Reizen, Ideen und Ästhetik. Kultureller Austausch und ' +
        'abstrakte Themen ziehen dich an; feste Strukturen empfindest du schnell als eng.',
      'sehr-hoch':
        'Du bist getrieben von Neugier. Deine Stärke ist kreative Verknüpfung über Feld-Grenzen ' +
        'hinweg. Achte darauf, deine Breite nicht gegen Tiefe zu tauschen.',
    },
  },
  C: {
    name: 'Gewissenhaftigkeit',
    anchorLow: 'Spontan, flexibel',
    anchorHigh: 'Organisiert, diszipliniert',
    levels: {
      'sehr-niedrig':
        'Du arbeitest stark situativ und nach Bauchgefühl. Deadlines sind für dich weiche ' +
        'Markierungen. In kreativen, improvisierenden Rollen ist das ein Vorteil; in Projekten ' +
        'mit vielen Abhängigkeiten eine Belastung für dein Umfeld.',
      niedrig:
        'Planung ist nicht dein bevorzugter Modus. Du vertraust darauf, unter Druck liefern zu ' +
        'können — was oft funktioniert, aber Stress erzeugt, der vermeidbar wäre.',
      durchschnittlich:
        'Du hast ein pragmatisches Verhältnis zu Struktur: genug, um Sachen zu Ende zu bringen, ' +
        'nicht so viel, dass du Spontanität verlierst.',
      hoch:
        'Du arbeitest zielgerichtet, hältst Zusagen ein und planst voraus. Deine Arbeitsergebnisse ' +
        'sind sauber und verlässlich, was dich zur ersten Wahl bei verantwortungsvollen Aufgaben macht.',
      'sehr-hoch':
        'Du funktionierst nach Prinzipien und Listen. Deine Gründlichkeit ist Marktvorteil — und ' +
        'gleichzeitig ein Risiko für Überforderung, wenn du dir selbst zu hohe Standards auferlegst.',
    },
  },
  E: {
    name: 'Extraversion',
    anchorLow: 'Ruhig, reflektiert',
    anchorHigh: 'Gesellig, energiegeladen',
    levels: {
      'sehr-niedrig':
        'Du schöpfst Energie im Alleinsein. Große Gruppen und ständige Interaktion leeren dich. ' +
        'Deine Stärke liegt in konzentrierter Einzelarbeit und tiefem Fokus.',
      niedrig:
        'Du bist zurückhaltend in neuen Gruppen, brauchst Warmlaufphasen. Einmal vertraut, ' +
        'führst du Gespräche gerne — aber bevorzugst tiefe 1:1-Interaktion gegenüber Small Talk.',
      durchschnittlich:
        'Du bewegst dich flexibel zwischen geselligen und stillen Modi. Weder klassischer ' +
        'Introvertierter noch reiner Extrovertierter — "Ambivert" trifft es.',
      hoch:
        'Du bist gesprächig, dynamisch und profitierst von sozialem Austausch. In Teams bist du ' +
        'die Person, die Meetings öffnet und Energie einbringt.',
      'sehr-hoch':
        'Du brauchst soziale Interaktion wie andere Schlaf. Ohne Menschen um dich herum verliert ' +
        'dein Tag Farbe. Achte darauf, dass deine Energie andere nicht überrollt.',
    },
  },
  A: {
    name: 'Verträglichkeit',
    anchorLow: 'Direkt, wettbewerbsorientiert',
    anchorHigh: 'Kooperativ, einfühlsam',
    levels: {
      'sehr-niedrig':
        'Du stellst die Sache über die Beziehung. Klartext ist für dich Respekt, nicht Härte. ' +
        'In Verhandlungen und kritischer Analyse ein Vorteil — in sozialen Kontexten manchmal ' +
        'als schroff wahrgenommen.',
      niedrig:
        'Du sagst, was du denkst, auch wenn es reibt. Fairness ist dir wichtiger als Harmonie. ' +
        'Das macht dich zum klaren Feedback-Geber.',
      durchschnittlich:
        'Du bist kooperativ, wenn es trägt, und direkt, wenn es nötig ist. Dieser Mittelweg ist ' +
        'die häufigste Ausprägung und sozial am meisten anschlussfähig.',
      hoch:
        'Du gehst grundsätzlich wohlwollend auf Menschen zu, hörst zu und vermittelst in ' +
        'Konflikten. Dein Umfeld schätzt deine Verlässlichkeit als Gegenüber.',
      'sehr-hoch':
        'Empathie ist dein Default-Modus. Du riskierst dabei, eigene Bedürfnisse zurückzustellen. ' +
        'Grenzen zu ziehen ist kein Gegenteil von Fürsorge, sondern deren Voraussetzung.',
    },
  },
  N: {
    name: 'Emotionale Reaktivität',
    anchorLow: 'Gelassen, belastbar',
    anchorHigh: 'Sensibel, reaktiv',
    levels: {
      'sehr-niedrig':
        'Du bist emotional sehr stabil. Stress, Kritik und Rückschläge perlen weitgehend ab — ' +
        'in Krisen bist du der Anker. Achte darauf, dass deine Gelassenheit auf andere nicht ' +
        'teilnahmslos wirkt.',
      niedrig:
        'Du kommst mit Druck gut klar und machst dir selten lange Gedanken über Fehler. Dein ' +
        'Umfeld profitiert von deiner Ruhe.',
      durchschnittlich:
        'Du reagierst auf Stress normal spürbar, erholst dich aber in angemessener Zeit. Emotional ' +
        'ausgeglichenes Mittelfeld — häufigster Wert in der Bevölkerung.',
      hoch:
        'Du nimmst Kritik und Stress deutlich wahr und brauchst länger, um sie zu verarbeiten. ' +
        'Gleichzeitig bist du emotional präsent und empathisch — keine Einbahnstraße.',
      'sehr-hoch':
        'Deine emotionale Reaktivität ist hoch. Das ist in kreativen und sozialen Feldern eine ' +
        'Stärke, birgt aber Stress-Risiko. Regulations-Tools (Bewegung, Schlaf, soziale Stütze) ' +
        'sind für dich keine Extras, sondern Grundlage.',
    },
  },
};
```

- [ ] **Step 7.2 — Commit**

```bash
git add src/lib/personality-test/descriptions-de.ts
git commit -m "feat(personality-test): add German archetype and domain descriptions"
```

---

## Task 8a — Kategorie-Registry `categories.ts` anlegen

**Files:**
- Create oder Modify: `src/lib/tools/categories.ts`

**Rationale:** `psychologie` ist die erste Kategorie dieser Domäne. Wir legen die Registry jetzt an (auch wenn der Persönlichkeitstest zunächst das einzige Psychologie-Tool ist), damit spätere Tools (Stressindex, Schlafqualität, Emotionale-Intelligenz-Test) ohne Registry-Refactor einrasten können. Spart eine Session-Diskussion beim zweiten Tool.

- [ ] **Step 8a.1 — Prüfen, ob Datei bereits existiert**

Run: `ls src/lib/tools/categories.ts 2>/dev/null && echo EXISTS || echo MISSING`

Wenn `EXISTS` → Step 8a.2 überspringen, mit Step 8a.3 fortfahren.
Wenn `MISSING` → Step 8a.2 ausführen.

- [ ] **Step 8a.2 — Datei neu anlegen** (falls MISSING)

```typescript
// src/lib/tools/categories.ts
export const CATEGORIES = {
  psychologie: {
    id: 'psychologie',
    label: { de: 'Psychologie', en: 'Psychology' },
    description: {
      de: 'Selbsttests für Persönlichkeit, Stress, Schlaf und emotionale Gesundheit — alles im Browser, keine Datenspeicherung.',
      en: 'Self-assessments for personality, stress, sleep, and emotional health — all in-browser, no storage.',
    },
    seoSlug: { de: 'psychologie', en: 'psychology' },
  },
} as const;

export type CategoryId = keyof typeof CATEGORIES;

export function getCategory(id: CategoryId) {
  return CATEGORIES[id];
}
```

- [ ] **Step 8a.3 — `psychologie` ergänzen (falls Datei EXISTS)**

Öffne `src/lib/tools/categories.ts` und füge ins `CATEGORIES`-Objekt ein:

```typescript
psychologie: {
  id: 'psychologie',
  label: { de: 'Psychologie', en: 'Psychology' },
  description: {
    de: 'Selbsttests für Persönlichkeit, Stress, Schlaf und emotionale Gesundheit — alles im Browser, keine Datenspeicherung.',
    en: 'Self-assessments for personality, stress, sleep, and emotional health — all in-browser, no storage.',
  },
  seoSlug: { de: 'psychologie', en: 'psychology' },
},
```

- [ ] **Step 8a.4 — Test: Registry-Sanity**

Create `tests/lib/tools/categories.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategory } from '~/lib/tools/categories';

describe('categories registry', () => {
  it('registers psychologie with DE and EN labels', () => {
    const cat = getCategory('psychologie');
    expect(cat.id).toBe('psychologie');
    expect(cat.label.de).toBe('Psychologie');
    expect(cat.label.en).toBe('Psychology');
    expect(cat.description.de.length).toBeGreaterThan(50);
  });

  it('every category has de and en slug', () => {
    for (const [id, cat] of Object.entries(CATEGORIES)) {
      expect(cat.seoSlug.de, `${id} missing DE slug`).toBeDefined();
      expect(cat.seoSlug.en, `${id} missing EN slug`).toBeDefined();
    }
  });
});
```

- [ ] **Step 8a.5 — Run tests**

Run: `npx vitest run tests/lib/tools/categories.test.ts`
Expected: 2 tests pass.

- [ ] **Step 8a.6 — Commit**

```bash
git add src/lib/tools/categories.ts tests/lib/tools/categories.test.ts
git commit -m "feat(tools): add category registry with psychologie"
```

---

## Task 8 — Tool-Config-Datei

**Files:**
- Create: `src/lib/tools/personality-test.config.ts`

**Rationale:** Registriert den Persönlichkeitstest im Tool-Config-System (aus Session 4). Benutzt den `interactive`-Typ aus `TOOL_TYPES`.

**Voraussetzung:** Session 4 ist durch. Die Zod-Schemas aus `src/lib/tools/schemas.ts` existieren. Dieser Plan darf sich auf `parseToolConfig()` und die Struktur aus Session 4 verlassen. Task 8a ist durch — `CategoryId` ist importierbar.

- [ ] **Step 8.1 — Write `src/lib/tools/personality-test.config.ts`**

```typescript
import { parseToolConfig } from './schemas';

export const personalityTestConfig = parseToolConfig({
  type: 'interactive',
  id: 'personalityTest',
  slugs: {
    de: 'persoenlichkeitstest',
    en: 'personality-test',
    es: 'test-de-personalidad',
    fr: 'test-de-personnalite',
    'pt-br': 'teste-de-personalidade',
  },
  category: 'psychologie',
  icon: 'persoenlichkeitstest.png',
  /**
   * Pencil-Sketch-Icon-Prompt (Recraft.ai, Graphit-Palette, monochrom):
   * "Hand-drawn pencil-sketch icon, single monochromatic graphite color,
   *  minimal line art, 256x256, centered on white background:
   *  a stylized human head silhouette in profile with a small gear
   *  visible inside the skull, crosshatched pencil shading, no color,
   *  no gradient, no photographic elements."
   */
});
```

- [ ] **Step 8.2 — Commit**

```bash
git add src/lib/tools/personality-test.config.ts
git commit -m "feat(personality-test): register interactive tool config"
```

---

## Task 9 — Orchestrator-Island `PersonalityTest.svelte`

**Files:**
- Create: `src/components/tools/personality-test/PersonalityTest.svelte`

**Rationale:** Einzige `client:load`-Island. State-Machine mit Svelte-5-Runes (`$state`, `$derived`). Rendert je nach `view` eine der Child-Komponenten.

- [ ] **Step 9.1 — Write `src/components/tools/personality-test/PersonalityTest.svelte`**

```svelte
<script lang="ts">
  import { QUESTIONS_DE } from '~/lib/personality-test/questions-de';
  import { scoreAll } from '~/lib/personality-test/scoring';
  import { pickArchetype } from '~/lib/personality-test/archetypes';
  import { saveState, loadState, clearState } from '~/lib/personality-test/storage';
  import type { Answer, TestState, View } from '~/lib/personality-test/types';
  import TestIntro from './TestIntro.svelte';
  import TestQuestion from './TestQuestion.svelte';
  import TestResult from './TestResult.svelte';

  let state: TestState = $state({
    view: 'intro',
    currentQuestionIndex: 0,
    answers: [],
    startedAt: null,
    result: null,
  });

  const currentQuestion = $derived(QUESTIONS_DE[state.currentQuestionIndex] ?? null);
  const progress = $derived(state.answers.length / QUESTIONS_DE.length);

  $effect(() => {
    const loaded = loadState();
    if (loaded.ok) state = loaded.value;
  });

  $effect(() => {
    if (state.view !== 'intro' || state.answers.length > 0) saveState(state);
  });

  function start(firstAnswer: Answer | null): void {
    state = {
      view: 'question',
      currentQuestionIndex: firstAnswer ? 1 : 0,
      answers: firstAnswer ? [firstAnswer] : [],
      startedAt: Date.now(),
      result: null,
    };
  }

  function answerCurrent(value: 1 | 2 | 3 | 4 | 5): void {
    if (currentQuestion === null) return;
    const answer: Answer = { questionId: currentQuestion.id, value };
    const answers = [...state.answers.filter((a) => a.questionId !== answer.questionId), answer];
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= QUESTIONS_DE.length) {
      const scores = scoreAll(answers, QUESTIONS_DE);
      const archetype = pickArchetype(scores);
      state = {
        view: 'result',
        currentQuestionIndex: nextIndex,
        answers,
        startedAt: state.startedAt,
        result: { answers, scores, archetype, completedAt: Date.now() },
      };
    } else {
      state = { ...state, currentQuestionIndex: nextIndex, answers };
    }
  }

  function goBack(): void {
    if (state.currentQuestionIndex === 0) return;
    const prevIndex = state.currentQuestionIndex - 1;
    state = { ...state, view: 'question', currentQuestionIndex: prevIndex };
  }

  function restart(): void {
    clearState();
    state = { view: 'intro', currentQuestionIndex: 0, answers: [], startedAt: null, result: null };
  }
</script>

{#if state.view === 'intro'}
  <TestIntro firstQuestion={QUESTIONS_DE[0]} onStart={start} />
{:else if state.view === 'question' && currentQuestion !== null}
  <TestQuestion
    question={currentQuestion}
    currentIndex={state.currentQuestionIndex}
    total={QUESTIONS_DE.length}
    existingValue={state.answers.find((a) => a.questionId === currentQuestion.id)?.value ?? null}
    onAnswer={answerCurrent}
    onBack={goBack}
    canGoBack={state.currentQuestionIndex > 0}
    progress={progress}
  />
{:else if state.view === 'result' && state.result !== null}
  <TestResult result={state.result} onRestart={restart} />
{/if}
```

- [ ] **Step 9.2 — Commit**

```bash
git add src/components/tools/personality-test/PersonalityTest.svelte
git commit -m "feat(personality-test): add orchestrator island with state machine"
```

---

## Task 10 — `TestIntro.svelte` mit Inline-Frage

**Files:**
- Create: `src/components/tools/personality-test/TestIntro.svelte`

**Rationale:** Research-Decision R10 (Inline-Start, Zero-Friction-Entry). Erste Frage bereits sichtbar. Antwortet User → `onStart(firstAnswer)`. Klickt auf "Mehr erfahren" ohne Antwort → `onStart(null)`.

- [ ] **Step 10.1 — Write component**

```svelte
<script lang="ts">
  import type { Answer, Question } from '~/lib/personality-test/types';

  interface Props {
    firstQuestion: Question;
    onStart: (firstAnswer: Answer | null) => void;
  }
  const { firstQuestion, onStart }: Props = $props();

  function handleFirstAnswer(value: 1 | 2 | 3 | 4 | 5): void {
    onStart({ questionId: firstQuestion.id, value });
  }
</script>

<section class="intro">
  <h1>Persönlichkeitstest</h1>
  <p class="lead">
    Dein Big-Five-Profil in rund zehn Minuten. Fünfzig Fragen, keine Anmeldung,
    keine Datenspeicherung — alles läuft in deinem Browser.
  </p>

  <fieldset class="first-question">
    <legend>{firstQuestion.text}</legend>
    <p class="anchors" aria-hidden="true">
      <span>Trifft gar nicht zu</span>
      <span>Trifft voll zu</span>
    </p>
    <div class="radios" role="radiogroup" aria-labelledby="first-q-legend">
      {#each [1, 2, 3, 4, 5] as v (v)}
        <label class="radio">
          <input
            type="radio"
            name="first-answer"
            value={v}
            onchange={() => handleFirstAnswer(v as 1 | 2 | 3 | 4 | 5)}
          />
          <span>{v}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  <p class="skip">
    <button type="button" class="link-button" onclick={() => onStart(null)}>
      Erst mehr erfahren, dann starten
    </button>
  </p>

  <section class="meta">
    <h2>Wie der Test funktioniert</h2>
    <ol>
      <li>Fünfzig kurze Aussagen — du wählst eine Stufe von 1 (trifft gar nicht zu) bis 5 (trifft voll zu).</li>
      <li>Am Ende siehst du dein Profil auf den fünf Big-Five-Dimensionen mit deinem Archetyp.</li>
      <li>Optional: Ergebnis als Bild teilen oder speichern. Ohne Account.</li>
    </ol>
  </section>
</section>

<style>
  .intro { max-width: 40rem; margin-inline: auto; padding-block: var(--space-8); }
  .lead { font-size: var(--font-size-lg); line-height: var(--font-lh-relaxed); color: var(--color-text-muted); margin-block-end: var(--space-8); }
  .first-question { border: 1px solid var(--color-border); border-radius: var(--r-md); padding: var(--space-6); margin-block-end: var(--space-6); }
  .first-question legend { font-weight: var(--font-fw-semibold); padding-inline: var(--space-2); }
  .anchors { display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-muted); margin-block: var(--space-3) var(--space-2); }
  .radios { display: flex; justify-content: space-between; gap: var(--space-2); }
  .radio { display: flex; flex-direction: column; align-items: center; min-width: 3rem; min-height: 3rem; cursor: pointer; }
  .radio input { inline-size: 1.25rem; block-size: 1.25rem; }
  .skip { margin-block-end: var(--space-8); }
  .link-button { background: none; border: none; color: var(--color-accent); text-decoration: underline; cursor: pointer; font: inherit; padding: 0; }
</style>
```

- [ ] **Step 10.2 — Commit**

```bash
git add src/components/tools/personality-test/TestIntro.svelte
git commit -m "feat(personality-test): add intro view with inline first question"
```

---

## Task 11 — `TestQuestion.svelte` (Radio-Group, Keyboard, Auto-Advance)

**Files:**
- Create: `src/components/tools/personality-test/TestQuestion.svelte`
- Create: `src/components/tools/personality-test/TestProgress.svelte`

**Rationale:** Native Radio-Group (Research R6). Keyboard: Zahlen 1–5 setzen Antwort, Enter/Pfeil-rechts = weiter, Pfeil-links = zurück. Auto-Advance 300 ms nach Radio-Click.

- [ ] **Step 11.1 — Write `TestProgress.svelte`**

```svelte
<script lang="ts">
  interface Props { progress: number; }
  const { progress }: Props = $props();
  const pct = $derived(Math.round(progress * 100));
</script>

<div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct}>
  <div class="fill" style:inline-size="{pct}%"></div>
</div>

<style>
  .track { position: fixed; inset-block-end: 0; inset-inline: 0; block-size: 3px; background: var(--color-surface-subtle); }
  .fill { block-size: 100%; background: var(--color-accent); transition: inline-size var(--dur-med) var(--ease-out); }
</style>
```

- [ ] **Step 11.2 — Write `TestQuestion.svelte`**

```svelte
<script lang="ts">
  import type { Question } from '~/lib/personality-test/types';
  import TestProgress from './TestProgress.svelte';

  interface Props {
    question: Question;
    currentIndex: number;
    total: number;
    existingValue: 1 | 2 | 3 | 4 | 5 | null;
    onAnswer: (value: 1 | 2 | 3 | 4 | 5) => void;
    onBack: () => void;
    canGoBack: boolean;
    progress: number;
  }
  const { question, currentIndex, total, existingValue, onAnswer, onBack, canGoBack, progress }: Props = $props();

  let selected = $state<1 | 2 | 3 | 4 | 5 | null>(existingValue);

  $effect(() => { selected = existingValue; });

  function handleSelect(v: 1 | 2 | 3 | 4 | 5): void {
    selected = v;
    setTimeout(() => onAnswer(v), 300);
  }

  function handleKey(e: KeyboardEvent): void {
    if (e.key >= '1' && e.key <= '5') {
      handleSelect(Number(e.key) as 1 | 2 | 3 | 4 | 5);
    } else if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && canGoBack) {
      onBack();
    }
  }

  const microcopy = $derived(
    currentIndex === 10 ? 'Zehn geschafft — du bist warmgelaufen.' :
    currentIndex === 25 ? 'Halbzeit. Kurz Luft holen? Dein Fortschritt bleibt, solange der Tab offen ist.' :
    currentIndex === 40 ? 'Noch zehn. Bleib ehrlich, nicht nett zu dir selbst.' :
    null,
  );
</script>

<svelte:window onkeydown={handleKey} />

<section class="question-view" aria-live="polite">
  {#if microcopy}<p class="microcopy">{microcopy}</p>{/if}

  <fieldset>
    <legend>{question.text}</legend>
    <p class="anchors" aria-hidden="true">
      <span>Trifft gar nicht zu</span>
      <span>Trifft voll zu</span>
    </p>
    <div class="radios" role="radiogroup">
      {#each [1, 2, 3, 4, 5] as v (v)}
        <label class="radio" class:selected={selected === v}>
          <input
            type="radio"
            name="q-{question.id}"
            value={v}
            checked={selected === v}
            onchange={() => handleSelect(v as 1 | 2 | 3 | 4 | 5)}
          />
          <span>{v}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  <nav class="controls">
    <button type="button" onclick={onBack} disabled={!canGoBack}>← Zurück</button>
    <span class="q-counter" aria-hidden="true">{currentIndex + 1} / {total}</span>
  </nav>
</section>

<TestProgress {progress} />

<style>
  .question-view { max-width: 38rem; margin-inline: auto; padding: var(--space-12) var(--space-6); min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
  .microcopy { font-size: var(--font-size-sm); color: var(--color-text-muted); font-style: italic; margin-block-end: var(--space-4); }
  fieldset { border: none; padding: 0; margin: 0; }
  legend { font-size: var(--font-size-xl); line-height: var(--font-lh-tight); font-weight: var(--font-fw-semibold); margin-block-end: var(--space-6); }
  .anchors { display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-muted); margin-block-end: var(--space-3); }
  .radios { display: flex; justify-content: space-between; gap: var(--space-2); }
  .radio { display: flex; flex-direction: column; align-items: center; min-inline-size: 3rem; min-block-size: 3rem; padding: var(--space-3); border-radius: var(--r-md); cursor: pointer; transition: background var(--dur-fast) var(--ease-out); }
  .radio:hover { background: var(--color-surface-subtle); }
  .radio.selected { background: var(--color-accent-subtle); }
  .radio input { inline-size: 1.25rem; block-size: 1.25rem; accent-color: var(--color-accent); }
  .controls { display: flex; justify-content: space-between; align-items: center; margin-block-start: var(--space-8); }
  .controls button { padding: var(--space-2) var(--space-4); background: none; border: 1px solid var(--color-border); border-radius: var(--r-sm); cursor: pointer; }
  .controls button:disabled { opacity: 0.4; cursor: not-allowed; }
  .q-counter { font-size: var(--font-size-sm); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
</style>
```

- [ ] **Step 11.3 — Commit**

```bash
git add src/components/tools/personality-test/TestQuestion.svelte src/components/tools/personality-test/TestProgress.svelte
git commit -m "feat(personality-test): add question view with keyboard nav and progress bar"
```

---

## Task 12 — `TraitBar.svelte` + `ArchetypeCard.svelte` + `PrivacyBadge.svelte`

**Files:**
- Create: `src/components/tools/personality-test/TraitBar.svelte`
- Create: `src/components/tools/personality-test/ArchetypeCard.svelte`
- Create: `src/components/tools/personality-test/PrivacyBadge.svelte`

- [ ] **Step 12.1 — Write `TraitBar.svelte`**

```svelte
<script lang="ts">
  import type { DomainScore } from '~/lib/personality-test/types';
  import { DOMAIN_DE } from '~/lib/personality-test/descriptions-de';

  interface Props { score: DomainScore; }
  const { score }: Props = $props();
  const meta = $derived(DOMAIN_DE[score.domain]);
  const ariaLabel = $derived(
    `${meta.name}: ${score.percentage} von 100. ${meta.levels[score.level]}`,
  );
</script>

<article class="trait-bar" aria-label={ariaLabel}>
  <header>
    <h3>{meta.name}</h3>
    <span class="value" aria-hidden="true">{score.percentage}</span>
  </header>
  <div class="track" aria-hidden="true">
    <div class="fill" style:inline-size="{score.percentage}%"></div>
  </div>
  <p class="anchors" aria-hidden="true">
    <span>{meta.anchorLow}</span>
    <span>{meta.anchorHigh}</span>
  </p>
  <details>
    <summary>Was bedeutet dein Wert?</summary>
    <p>{meta.levels[score.level]}</p>
  </details>
</article>

<style>
  .trait-bar { padding: var(--space-4) 0; border-block-end: 1px solid var(--color-border-subtle); }
  header { display: flex; justify-content: space-between; align-items: baseline; margin-block-end: var(--space-2); }
  h3 { font-size: var(--font-size-base); font-weight: var(--font-fw-semibold); margin: 0; }
  .value { font-variant-numeric: tabular-nums; font-family: var(--font-family-mono); color: var(--color-text-muted); }
  .track { block-size: 10px; background: var(--color-surface-subtle); border-radius: var(--r-sm); overflow: hidden; }
  .fill { block-size: 100%; background: var(--color-accent); }
  .anchors { display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--color-text-muted); margin-block: var(--space-1) var(--space-3); }
  details summary { cursor: pointer; font-size: var(--font-size-sm); color: var(--color-accent); }
  details p { margin-block-start: var(--space-2); font-size: var(--font-size-sm); line-height: var(--font-lh-relaxed); }
</style>
```

- [ ] **Step 12.2 — Write `ArchetypeCard.svelte`**

```svelte
<script lang="ts">
  import type { ArchetypeId } from '~/lib/personality-test/types';
  import { ARCHETYPE_DE } from '~/lib/personality-test/descriptions-de';

  interface Props { id: ArchetypeId; }
  const { id }: Props = $props();
  const archetype = $derived(ARCHETYPE_DE[id]);
</script>

<article class="archetype-card">
  <img
    src="/icons/archetypes/{archetype.sketchIcon}"
    alt="Pencil-Sketch-Icon von {archetype.name}"
    width="160"
    height="160"
  />
  <div class="text">
    <p class="label">Dein Archetyp</p>
    <h2>{archetype.name}</h2>
    <p class="motto">{archetype.motto}</p>
    <p class="body">{archetype.body}</p>
  </div>
</article>

<style>
  .archetype-card { display: flex; gap: var(--space-6); align-items: flex-start; padding: var(--space-8); background: var(--color-surface); border-radius: var(--r-lg); margin-block-end: var(--space-8); }
  .archetype-card img { filter: var(--icon-filter); flex-shrink: 0; }
  .label { font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin: 0; }
  h2 { font-size: var(--font-size-2xl); margin-block: var(--space-1) var(--space-2); }
  .motto { font-style: italic; color: var(--color-text-muted); margin-block-end: var(--space-4); }
  .body { line-height: var(--font-lh-relaxed); margin: 0; }
  @media (max-width: 640px) {
    .archetype-card { flex-direction: column; align-items: center; text-align: center; }
  }
</style>
```

- [ ] **Step 12.3 — Write `PrivacyBadge.svelte`**

```svelte
<aside class="privacy-badge" aria-label="Datenschutz-Status">
  <p>
    <strong>Deine Antworten haben diesen Browser nie verlassen.</strong>
    Kein Server-Call, kein Account, keine Cookies. Das Ergebnis lebt nur,
    solange du den Tab offen hast.
  </p>
</aside>

<style>
  .privacy-badge { padding: var(--space-3) var(--space-4); background: var(--color-surface-subtle); border-left: 3px solid var(--color-success); border-radius: var(--r-sm); margin-block: var(--space-6); font-size: var(--font-size-sm); line-height: var(--font-lh-relaxed); }
  .privacy-badge p { margin: 0; }
</style>
```

- [ ] **Step 12.4 — Commit**

```bash
git add src/components/tools/personality-test/TraitBar.svelte src/components/tools/personality-test/ArchetypeCard.svelte src/components/tools/personality-test/PrivacyBadge.svelte
git commit -m "feat(personality-test): add trait bar, archetype card, privacy badge"
```

---

## Task 13 — `ShareCard.svelte` (Canvas → 1200×630 PNG)

**Files:**
- Create: `src/components/tools/personality-test/ShareCard.svelte`

**Rationale:** Research R12. Client-seitiges Canvas-Rendering. Share-Card zeigt Archetyp-Name + Motto + 5 Mini-Bars (ohne Prozent-Zahlen). Download via `<a download>`; Web-Share-API falls verfügbar (Mobile).

- [ ] **Step 13.1 — Write component**

```svelte
<script lang="ts">
  import type { TestResult } from '~/lib/personality-test/types';
  import { ARCHETYPE_DE, DOMAIN_DE } from '~/lib/personality-test/descriptions-de';

  interface Props { result: TestResult; }
  const { result }: Props = $props();

  let canvas: HTMLCanvasElement | null = $state(null);
  let dataUrl = $state<string | null>(null);
  let status = $state<'idle' | 'rendering' | 'ready' | 'error'>('idle');

  const archetype = $derived(ARCHETYPE_DE[result.archetype]);

  async function render(): Promise<void> {
    if (canvas === null) return;
    status = 'rendering';
    const ctx = canvas.getContext('2d');
    if (ctx === null) { status = 'error'; return; }
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#F5F4F1';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1A1917';
    ctx.font = '600 32px system-ui, -apple-system, sans-serif';
    ctx.fillText('Mein Big-Five-Archetyp', 80, 110);
    ctx.font = '700 72px system-ui, -apple-system, sans-serif';
    ctx.fillText(archetype.name, 80, 200);
    ctx.font = 'italic 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#5A5955';
    ctx.fillText(archetype.motto, 80, 250);

    const startY = 310;
    const barWidth = 800;
    const barHeight = 18;
    const rowHeight = 60;
    ctx.font = '500 22px system-ui, -apple-system, sans-serif';
    result.scores.forEach((score, i) => {
      const y = startY + i * rowHeight;
      ctx.fillStyle = '#1A1917';
      ctx.fillText(DOMAIN_DE[score.domain].name, 80, y);
      ctx.fillStyle = '#E6E4DF';
      ctx.fillRect(80, y + 10, barWidth, barHeight);
      ctx.fillStyle = '#1A1917';
      ctx.fillRect(80, y + 10, barWidth * (score.percentage / 100), barHeight);
    });

    ctx.fillStyle = '#5A5955';
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('konverter.app/de/persoenlichkeitstest', 80, h - 60);

    dataUrl = canvas.toDataURL('image/png');
    status = 'ready';
  }

  $effect(() => { if (canvas !== null) render(); });

  async function share(): Promise<void> {
    if (dataUrl === null) return;
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'persoenlichkeitstest.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Mein Big-Five-Profil',
        text: `Mein Archetyp: ${archetype.name}. Mach auch den Test.`,
      });
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'persoenlichkeitstest.png';
      a.click();
    }
  }
</script>

<section class="share-card">
  <canvas bind:this={canvas} width="1200" height="630"></canvas>
  <div class="actions">
    <button type="button" onclick={share} disabled={status !== 'ready'}>
      Als Bild teilen / herunterladen
    </button>
  </div>
</section>

<style>
  .share-card { margin-block: var(--space-8); }
  canvas { inline-size: 100%; max-inline-size: 600px; block-size: auto; border: 1px solid var(--color-border); border-radius: var(--r-md); }
  .actions { margin-block-start: var(--space-4); }
  button { padding: var(--space-3) var(--space-6); background: var(--color-accent); color: var(--color-on-accent); border: none; border-radius: var(--r-md); cursor: pointer; font-weight: var(--font-fw-semibold); }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
```

- [ ] **Step 13.2 — Commit**

```bash
git add src/components/tools/personality-test/ShareCard.svelte
git commit -m "feat(personality-test): add client-side canvas share-card renderer"
```

---

## Task 14 — `TestResult.svelte` (Zusammenbau View 3)

**Files:**
- Create: `src/components/tools/personality-test/TestResult.svelte`

- [ ] **Step 14.1 — Write component**

```svelte
<script lang="ts">
  import type { TestResult } from '~/lib/personality-test/types';
  import { computeBalancedNuance } from '~/lib/personality-test/archetypes';
  import { DOMAIN_DE } from '~/lib/personality-test/descriptions-de';
  import ArchetypeCard from './ArchetypeCard.svelte';
  import TraitBar from './TraitBar.svelte';
  import PrivacyBadge from './PrivacyBadge.svelte';
  import ShareCard from './ShareCard.svelte';

  interface Props {
    result: TestResult;
    onRestart: () => void;
  }
  const { result, onRestart }: Props = $props();

  // R16 — Balanced-Reframe: zeige Top-2-Ausprägungen als Nuance
  const nuance = $derived(
    result.archetype === 'der-balancierte'
      ? computeBalancedNuance(result.scores)
      : null
  );

  function nuanceLabel(domain: 'O' | 'C' | 'E' | 'A' | 'N', direction: 'high' | 'low') {
    const d = DOMAIN_DE[domain];
    return direction === 'high' ? d.anchorHigh : d.anchorLow;
  }
</script>

<section class="result">
  <h1>Dein Profil</h1>
  <ArchetypeCard id={result.archetype} />

  {#if nuance}
    <p class="nuance">
      Deine Top-2-Ausprägungen:
      <strong>{nuanceLabel(nuance.top1.domain, nuance.top1.direction)}</strong>
      und
      <strong>{nuanceLabel(nuance.top2.domain, nuance.top2.direction)}</strong>.
    </p>
  {/if}

  <PrivacyBadge />

  <section class="traits">
    <h2>Die fünf Dimensionen</h2>
    {#each result.scores as score (score.domain)}
      <TraitBar {score} />
    {/each}
  </section>

  <ShareCard {result} />

  <section class="actions">
    <button type="button" onclick={onRestart}>Test wiederholen</button>
  </section>

  <aside class="disclaimer">
    <p>
      Hinweis: Dieser Selbsttest basiert auf dem Big-Five-Modell und ersetzt keine
      psychologische Diagnostik. Persönlichkeitsmerkmale können sich über die Zeit
      verändern — das Ergebnis ist eine Momentaufnahme.
    </p>
  </aside>
</section>

<style>
  .result { max-width: 46rem; margin-inline: auto; padding-block: var(--space-12); }
  h1 { font-size: var(--font-size-3xl); margin-block-end: var(--space-6); }
  .nuance { margin-block: var(--space-4) var(--space-6); font-size: var(--font-size-md); color: var(--color-text-primary); line-height: var(--font-lh-relaxed); }
  .nuance strong { color: var(--color-accent); font-weight: var(--font-fw-semibold); }
  .traits { margin-block: var(--space-10); }
  .traits h2 { font-size: var(--font-size-xl); margin-block-end: var(--space-4); }
  .actions { margin-block: var(--space-8); }
  .actions button { padding: var(--space-3) var(--space-6); background: none; border: 1px solid var(--color-border); border-radius: var(--r-md); cursor: pointer; }
  .disclaimer { padding: var(--space-4); background: var(--color-surface-subtle); border-radius: var(--r-sm); font-size: var(--font-size-sm); color: var(--color-text-muted); line-height: var(--font-lh-relaxed); }
</style>
```

- [ ] **Step 14.2 — Commit**

```bash
git add src/components/tools/personality-test/TestResult.svelte
git commit -m "feat(personality-test): assemble result dashboard view"
```

---

## Task 15 — Astro-Seite `persoenlichkeitstest.astro`

**Files:**
- Create: `src/pages/de/persoenlichkeitstest.astro`

**Rationale:** Wrapping der Svelte-Island in Astro-BaseLayout (aus Session 3). SEO-Frontmatter. Loader = `client:load` (Test-State muss direkt nutzbar sein).

- [ ] **Step 15.1 — Write file**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import PersonalityTest from '~/components/tools/personality-test/PersonalityTest.svelte';

const title = 'Kostenloser Persönlichkeitstest (Big Five) — Wissenschaftlich fundiert';
const description = 'Dein Big-Five-Profil in 50 Fragen. Kostenlos, ohne Anmeldung, ohne Datenspeicherung — alles läuft im Browser.';
---

<BaseLayout
  lang="de"
  title={title}
  description={description}
  pathWithoutLang="persoenlichkeitstest"
>
  <main>
    <PersonalityTest client:load />

    <article class="seo-article">
      <h2>Was ist das Big-Five-Modell?</h2>
      <p>
        Das Big-Five-Modell — auch OCEAN genannt — ist der wissenschaftliche Konsens
        in der Persönlichkeitspsychologie. Es beschreibt Persönlichkeit anhand von
        fünf unabhängigen Dimensionen: Offenheit, Gewissenhaftigkeit, Extraversion,
        Verträglichkeit und emotionale Reaktivität. Jede Dimension ist ein Spektrum,
        keine Kategorie — jeder Mensch liegt auf jeder Achse irgendwo zwischen den
        Extremen.
      </p>
      <h2>Warum nicht MBTI?</h2>
      <p>
        Der bekanntere Myers-Briggs-Typen-Indikator (MBTI) teilt Menschen in sechzehn
        Typen wie INTJ oder ENFP ein. Das ist plakativ, aber wissenschaftlich
        umstritten: Die Test-Retest-Reliabilität ist niedrig, und die binäre Einteilung
        zwingt Zwischen-Werte in künstliche Schubladen. Big Five arbeitet stattdessen
        mit Spektren und ist in Peer-Review-Studien robust repliziert.
      </p>
      <h2>Wie entsteht dein Ergebnis?</h2>
      <p>
        Die fünfzig Aussagen stammen aus dem International Personality Item Pool
        (IPIP) — einer öffentlich-zugänglichen, wissenschaftlich validierten Sammlung.
        Deine Antworten werden direkt im Browser summiert, reverse-gekeyt wo nötig,
        und auf eine 0-100-Skala normalisiert. Kein Server sieht deine Antworten.
      </p>
      <h2>Häufige Fragen</h2>
      <details>
        <summary>Wie lange dauert der Test?</summary>
        <p>Rund zehn Minuten bei zügiger Beantwortung. Du kannst pausieren — solange dein Tab offen bleibt, sind deine Antworten gespeichert.</p>
      </details>
      <details>
        <summary>Werden meine Daten gespeichert?</summary>
        <p>Nein. Der Test läuft vollständig in deinem Browser. Keine Übertragung an einen Server, kein Account, kein Tracking. Schließt du den Tab, sind die Antworten weg.</p>
      </details>
      <details>
        <summary>Wie genau ist der Test?</summary>
        <p>Die IPIP-Big-Five-Markers haben eine interne Konsistenz (Cronbachs α) um 0,84 pro Dimension. Das ist gut für einen Kurztest. Für klinische Zwecke sind längere Instrumente (zum Beispiel IPIP-NEO-120) die bessere Wahl.</p>
      </details>
      <details>
        <summary>Kann ich das Ergebnis teilen?</summary>
        <p>Ja — als Bild. Die Teilen-Funktion rendert eine 1200×630-Karte aus deinem Profil. Geteilt wird nur, was du aktiv auf "Teilen" drückst.</p>
      </details>
    </article>

    <section class="related">
      <h2>Verwandte Tools</h2>
      <ul>
        <li><a href="/de/stressindex">Stressindex-Selbsttest</a></li>
        <li><a href="/de/schlafqualitaet">Schlafqualitäts-Check</a></li>
      </ul>
    </section>

    <footer class="attribution">
      <p>
        Items basieren auf dem
        <a href="https://ipip.ori.org/" rel="noopener" target="_blank">International Personality Item Pool (IPIP)</a>
        — Public Domain, Goldberg (1992). Deutsche Formulierungen und
        Auswertungs-Logik eigenständig implementiert. Kein wissenschaftlich
        validiertes diagnostisches Instrument.
      </p>
    </footer>
  </main>
</BaseLayout>

<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Big Five Persönlichkeitstest',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  description,
})}></script>

<style>
  main { max-width: 46rem; margin-inline: auto; padding-inline: var(--space-4); }
  .seo-article { margin-block: var(--space-16); }
  .seo-article h2 { font-size: var(--font-size-xl); margin-block: var(--space-6) var(--space-3); }
  .seo-article p { line-height: var(--font-lh-relaxed); margin-block-end: var(--space-4); }
  .seo-article details { margin-block: var(--space-3); padding: var(--space-3); border: 1px solid var(--color-border-subtle); border-radius: var(--r-sm); }
  .seo-article summary { cursor: pointer; font-weight: var(--font-fw-semibold); }
  .seo-article details p { margin-block-start: var(--space-2); }
  .related ul { list-style: none; padding: 0; display: flex; gap: var(--space-4); flex-wrap: wrap; }
  .related a { color: var(--color-accent); }
  .attribution {
    margin-block: var(--space-12) var(--space-6);
    padding-block-start: var(--space-4);
    border-block-start: 1px solid var(--color-border-subtle);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    line-height: var(--font-lh-normal);
  }
  .attribution a { color: inherit; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px; }
</style>
```

- [ ] **Step 15.2 — Commit**

```bash
git add src/pages/de/persoenlichkeitstest.astro
git commit -m "feat(personality-test): add Astro page with SEO content and JSON-LD"
```

---

## Task 16 — UI-Integration-Test (Happy Path)

**Files:**
- Create: `tests/components/personality-test.test.ts`

**Rationale:** Keyboard-Path ohne sichtbaren DOM-Inspect. Bestätigt: 50 Fragen durchklicken → Ergebnis zeigt 5 Bars + einen Archetyp.

- [ ] **Step 16.1 — Write test**

```typescript
/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import PersonalityTest from '~/components/tools/personality-test/PersonalityTest.svelte';
import userEvent from '@testing-library/user-event';

describe('PersonalityTest happy path', () => {
  beforeEach(() => sessionStorage.clear());

  it('completes all 50 questions and shows result view', async () => {
    const user = userEvent.setup();
    const { container, findByRole } = render(PersonalityTest);

    const firstLegend = container.querySelector('fieldset legend');
    expect(firstLegend).not.toBeNull();

    await user.keyboard('3');
    for (let i = 0; i < 49; i++) {
      await user.keyboard('3');
    }

    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Dein Profil');
    const bars = container.querySelectorAll('.trait-bar');
    expect(bars.length).toBe(5);
  });
});
```

- [ ] **Step 16.2 — Ensure `@testing-library/svelte` and `@testing-library/user-event` are in `package.json`**

If missing, they must be added via a separate `chore/bump-testing-library`-Branch per PROJECT.md upgrade-rule. **Do not** auto-install in this task — block here and surface the missing dep to the user.

- [ ] **Step 16.3 — Run test, verify pass**

Run: `npm run test tests/components/personality-test.test.ts`
Expected: 1 passing.

- [ ] **Step 16.4 — Commit**

```bash
git add tests/components/personality-test.test.ts
git commit -m "test(personality-test): integration test for happy path"
```

---

## Task 17 — Accessibility-Audit + Fixes

**Files:**
- Modify: alle `.svelte`-Komponenten falls axe-Issues aufkommen
- Create: `tests/a11y/personality-test-a11y.test.ts`

**Rationale:** WCAG 2.1 AA. Research R6 enforce über axe-Scan.

- [ ] **Step 17.1 — Install (in separate PR wenn nicht vorhanden) `axe-core` + `@axe-core/playwright` oder `vitest-axe`. Block wenn missing.**

- [ ] **Step 17.2 — Write axe test**

```typescript
/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { axe } from 'vitest-axe';
import TestQuestion from '~/components/tools/personality-test/TestQuestion.svelte';
import { QUESTIONS_DE } from '~/lib/personality-test/questions-de';

describe('a11y — TestQuestion', () => {
  it('has no WCAG 2.1 AA violations', async () => {
    const { container } = render(TestQuestion, {
      props: {
        question: QUESTIONS_DE[0],
        currentIndex: 0,
        total: 50,
        existingValue: null,
        onAnswer: () => {},
        onBack: () => {},
        canGoBack: false,
        progress: 0,
      },
    });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
```

- [ ] **Step 17.3 — Run, fix any violations (typical: missing `aria-labelledby`, insufficient contrast, target-size), commit**

```bash
git add tests/a11y/personality-test-a11y.test.ts src/components/tools/personality-test/
git commit -m "test(personality-test): a11y audit + fixes for WCAG 2.1 AA"
```

---

## Task 18 — Archetyp-Icons (Recraft.ai via Pending-Icons-Drop-Pipeline)

**Files:**
- Create: `public/icons/archetypes/der-neugierige.png`
- Create: `public/icons/archetypes/der-stratege.png`
- Create: `public/icons/archetypes/der-enthusiast.png`
- Create: `public/icons/archetypes/der-harmoniseur.png`
- Create: `public/icons/archetypes/der-feinfuehlige.png`
- Create: `public/icons/archetypes/der-balancierte.png`
- Create: `public/icons/tools/persoenlichkeitstest.png`

**Rationale:** STYLE.md §8 + bestehende Icon-Pipeline. Prompt pro Icon ist im Tool-Config als JSDoc (Task 8) — diese Task fügt die Prompts für die 6 Archetyp-Icons hinzu, generiert sie in Recraft.ai gemäß der Session-5+ Pipeline und dropt sie in `pending-icons/`.

- [ ] **Step 18.1 — Add JSDoc prompts in `src/lib/personality-test/descriptions-de.ts`** (nicht in config, weil dort nur Tool-Level-Icon ist)

Über jedem Archetype-Entry im `ARCHETYPE_DE`-Objekt, füge einen JSDoc-Comment-Block mit dem Recraft-Prompt ein. Beispiel für `der-neugierige`:

```typescript
/**
 * Recraft.ai prompt (Graphit, monochrom, Pencil-Sketch):
 * "Hand-drawn pencil sketch icon, single graphite color on white,
 *  256x256, centered: an open book with a compass needle emerging
 *  from the pages, crosshatched shading, no color fills, minimal line art."
 */
'der-neugierige': { ... },
```

Entsprechend für die anderen 5 (Stratege: Zahnrad; Enthusiast: Herz mit Strahlen; Harmoniseur: Zwei Hände, die sich treffen; Feinfühlige: Spiegel-Oval; Balancierte: Waage).

- [ ] **Step 18.2 — Generate PNGs via Recraft.ai, drop in `pending-icons/`, run Session-5-Pipeline**

(Manueller Schritt — Session-5-Pipeline ist dokumentiert unter `docs/ops/icon-pipeline.md`, wird in Session 5/6 finalisiert.)

- [ ] **Step 18.3 — Commit**

```bash
git add public/icons/archetypes/ public/icons/tools/persoenlichkeitstest.png src/lib/personality-test/descriptions-de.ts
git commit -m "feat(personality-test): add 6 archetype icons + tool icon"
```

---

## Task 19 — Content-Datei (Markdown für Content-Collection, falls separater SEO-Content gebraucht)

**Files:**
- Create: `src/content/tools/persoenlichkeitstest/de.md`

**Rationale:** In der bestehenden Content-Collection (Session 4) wird für jedes Tool eine `de.md` erwartet. Die Astro-Seite aus Task 15 rendert den SEO-Artikel inline; diese Markdown-Datei hält strukturiert Frontmatter (für Sitemap, Meta, Related-Tools) plus Body, den das `BaseLayout` aus der Collection zieht.

**Falls die Tool-Seite in Task 15 den Content direkt inline rendert (wie oben gemacht), ist diese Datei redundant — entscheide basierend auf dem Pattern, das in Session 5 (Meter-zu-Fuß-Prototype) gelockt wurde.** Wenn Pattern = Content-Collection-driven: Seite stripping, Inhalt in `de.md`. Wenn Pattern = Inline-in-Astro: diese Task überspringen.

- [ ] **Step 19.1 — Check Session-5-Pattern**

Open `src/pages/de/meter-zu-fuss.astro` and `src/content/tools/meter-zu-fuss/de.md`.

Case A: `de.md` hat Frontmatter + Body, Astro importiert via `getEntry('tools', 'meter-zu-fuss/de')` → **übernimm Pattern**, bewege SEO-Artikel aus Task 15 in `de.md`.

Case B: Astro rendert alles inline → diese Task ist NO-OP, commit leer unterbinden.

- [ ] **Step 19.2 — If Case A, migrate content, commit**

```bash
git add src/content/tools/persoenlichkeitstest/de.md src/pages/de/persoenlichkeitstest.astro
git commit -m "refactor(personality-test): move SEO content to content-collection"
```

---

## Task 20 — PROGRESS.md Update + Session-Abschluss-Commit

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 20.1 — Add row to Tool-Inventar**

Im Abschnitt `## Tool-Inventar`, ergänze:

```markdown
| persoenlichkeitstest | ✅ | ✅ | ✅ | ✅ |
```

- [ ] **Step 20.2 — Update Current-Session + Next-Session-Plan** gemäß aktuellem Session-Kontext (der Plan hier läuft über ~7 Sessions — jeder Step markiert inkrementell eine Session, Update am Ende jeder).

- [ ] **Step 20.3 — Final commit mit Rulebooks-Read-Trailer**

```bash
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): personality-test tool shipped

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT
EOF
)"
```

---

## Self-Review Checkliste

Nach Task 20 alle Tasks durchgehen:

1. **Spec-Coverage** vs. `specs/2026-04-17-konverter-webseite-design.md` Section 18 (Non-Negotiables):
   - #2 Privacy-First: ✅ (nur sessionStorage, keine Server-Calls — Task 6 + 12.3)
   - #7 Keine externen Runtime-Deps: ✅ (reines Svelte + Canvas-API — kein jspdf, kein Chart.js)
   - #8 Kein thin Content: ✅ (SEO-Artikel mit ~450 Wörtern in Task 15, plus Archetyp/Domain-Beschreibungen in Task 7)
2. **CONTENT.md-Konformität**:
   - H1 einmalig, deutsche Such-Intent-Phrase: ✅ (`Persönlichkeitstest`-Phrase in `<h1>Persönlichkeitstest</h1>` — Task 10 + 14)
   - 3–5 FAQ-Einträge in `details`-Elementen: ✅ (4 in Task 15)
   - Du-Anrede, keine Blacklist-Phrasen: prüfen in Task-7-Review
   - Meta-Description 140–160 Zeichen: prüfen (Title in Task 15 ist 68 Zeichen, Description aktuell 150 Zeichen — ✅)
3. **STYLE.md-Konformität**:
   - Nur Token-Vars in Components: prüfen (jede Component benutzt `var(--…)` — ✅ bei Durchsicht)
   - Keine Hex-Literals außer in Canvas (Task 13) — **Canvas ist Ausnahme**, `ctx.fillStyle` braucht Hex; das ist akzeptabel weil Canvas-Pixel nicht durch CSS-Tokens adressierbar sind. Notiere als Abweichung im Commit-Body.
4. **Placeholder-Scan**:
   - Grep nach "TBD", "TODO", "[add text]": keine gefunden beim Durchsehen
   - Alle Task-Code-Blöcke enthalten kompletten Code, keine `// ...`-Lücken
5. **Type-Consistency**: `TestState`, `Answer`, `DomainScore`, `ArchetypeId` — durchgängig von Task 1 konsistent benutzt. `pickArchetype` in Task 5 returniert `ArchetypeId`, der in Task 14 und 9 als Prop/State passt.

---

## Execution Handoff

**Plan-Status (2026-04-19):** Finalisiert, eingefroren, parked bis Foundation-Sessions 4–8 + Phase-1-Batch abgeschlossen sind. User hat **Subagent-Driven Execution** als Default gewählt (D5).

### Für den Agent, der das Tool später baut

1. **Pre-Execution Checklist (oben in dieser Datei) komplett durcharbeiten.** Ohne grün in B1–B9 wird nichts geschrieben.
2. **Mode = Subagent-Driven.** Eine Task = ein frischer Subagent. Plan-konform ohne Abweichung.
3. **Fresh Subagent-Prompt-Skelett** (verwende das wörtlich für jeden Task):

   ```
   Read these files completely before writing code:
   - C:\Users\carin\.gemini\Konverter Webseite\CLAUDE.md
   - C:\Users\carin\.gemini\Konverter Webseite\PROJECT.md
   - C:\Users\carin\.gemini\Konverter Webseite\CONVENTIONS.md
   - C:\Users\carin\.gemini\Konverter Webseite\STYLE.md       (Svelte/CSS tasks only)
   - C:\Users\carin\.gemini\Konverter Webseite\CONTENT.md     (copy/SEO tasks only)
   - C:\Users\carin\.gemini\Konverter Webseite\docs\superpowers\plans\2026-04-18-persoenlichkeitstest-tool.md
     → Go straight to Task N. Do ONLY the steps in Task N. Do not skip, do not add.

   Git account: pkcut-lab (verify via `bash scripts/check-git-account.sh`).
   TDD pattern: write the failing test, verify it fails, implement, verify it passes, commit.
   Commit message: conventional style + "Rulebooks-Read: PROJECT, CONVENTIONS[, STYLE][, CONTENT]" trailer.
   Report back: (a) files touched with SHA, (b) test output tail, (c) any deviation from plan with reason.
   Do not change ANY of the R1–R16 or D1–D4 locked decisions. If in doubt, STOP and ask.
   ```

4. **Review-Zyklus nach jedem Task:** Diff lesen, Tests lokal nachverifizieren, dann `git log --oneline -1` im Branch. Erst dann Task N+1.
5. **Acceptance-Kriterien (siehe Abschnitt D) müssen alle grün sein**, bevor PR zu `main` geöffnet wird.

**Zurück-Kopplung an User:** Sobald Pre-Flight rot wird, Plan gegenüber Rulebooks divergiert, oder eine gelockte Entscheidung R*/D* in Frage steht → **HALT**, keine Eigenmächtigkeit.

---

## Entscheidungen (2026-04-19 vom User gelockt)

| # | Entscheidung | Resolution |
|---|---|---|
| D1 | Archetyp-Set v1 | **6 Archetypen** (5 Trait-Dominant + `der-balancierte`). Kein 8-Würfel. Reframe: `der-balancierte` zeigt Top-2-Nuance (siehe R16, Task 5/14). |
| D2 | Kategorie `psychologie` | **Sofort registrieren** — eigene Datei `src/lib/tools/categories.ts` (Task 8a, vor Tool-Config). |
| D3 | IPIP-Attribution | **Fußnote in der Tool-Seite**, dezent (`.attribution` styled mit `--font-size-xs` + `--color-text-muted`, siehe Task 15). Keine separate Seite. |
| D4 | Facet-Version (IPIP-NEO-120) | **Phase-3-Task-Liste angehängt** (siehe unten), nicht in v1. |
| D5 | Execution-Mode | **Subagent-Driven** — fresh subagent per task, user reviews between tasks. Execution startet erst nach Foundation-Abschluss. |

---

## Phase 3 — Facet-Version (IPIP-NEO-120) — separater Plan-Zyklus

**Zweck:** „Ausführliche Analyse"-Variante als optionale Tiefen-Durchleuchtung. 120 Items, 30 Facetten (6 pro Domain), ~20 Minuten Ausfüllzeit. Basis: Johnson (2014) IPIP-NEO-120, Public Domain.

**Trigger:** Erst nach v1-Launch + mindestens ein Real-User-Sample (~100 Completions). Ohne echte Conversion-Daten auf v1 ist der Mehraufwand nicht gerechtfertigt.

**Architektur-Delta:**
- Keine neue Route — stattdessen Opt-In-Button auf `TestResult.svelte` ("Willst du dein Profil auf 30 Facetten vertiefen?").
- Shared State: die ersten 50 v1-Antworten bleiben gültig, nur 70 neue Items werden ergänzt (IPIP-NEO-120 enthält die BFM-50-Items als Teilmenge — muss in Mapping-Datei verifiziert werden).
- Neue Ergebnis-View `FacetResult.svelte` mit 30 Facet-Bars gruppiert unter den 5 Domains (Collapsible).

**Task-Outline (ohne Code, nur Struktur — Detail-Plan wird bei Phase-3-Kickoff geschrieben):**

- [ ] P3-Task A — **Facet-Mapping-Research**: IPIP-NEO-120-Items aus [ipip.ori.org](https://ipip.ori.org/newNEOFacetsKey.htm) ziehen, Überlappung mit v1-BFM-50 via Item-Text-Match automatisch ermitteln, manuell verifizieren. Output: `src/lib/personality-test/facet-mapping.ts` (ItemID → FacetID, FacetID → DomainID).
- [ ] P3-Task B — **70 neue Items DE** formulieren (50 sind schon da). Tone-Check gegen CONTENT.md §5.
- [ ] P3-Task C — **Facet-Scoring**: pro Facet 4 Items summieren + reverse-scoren, auf 0–100 normalisieren. Tests mit Johnson-Beispieldaten.
- [ ] P3-Task D — **`FacetResult.svelte`**: Gruppierter Collapsible-Layout, 5 Domain-Panels mit je 6 Facet-Bars. A11y: `<details>`/`<summary>`-basiert, keyboard-navigable.
- [ ] P3-Task E — **Facet-Beschreibungen DE** (~2400 Wörter: 30 Facetten × ~80 Wörter). Content-Pass durch CONTENT.md §5.
- [ ] P3-Task F — **State-Migration**: v1-sessionStorage + neue 70 Antworten zu einheitlichem State verschmelzen. Schema-Version-Bump `pt-v3`.
- [ ] P3-Task G — **Opt-In-UI** auf v1-Result: Button „Profil vertiefen (+70 Fragen, ~12 min)". Ersetzt View, startet inline ohne Neu-Page.
- [ ] P3-Task H — **SEO-Artikel erweitern**: „Was ist eine Facette?"-H2, NEO-PI-R-Kontext, Literatur (Costa & McCrae 1992, Johnson 2014).
- [ ] P3-Task I — **Tests-Erweiterung**: `facet-scoring.test.ts`, `facet-mapping.test.ts` (Invariante: jede Facet-ID mapped zu exakt einem Domain).
- [ ] P3-Task J — **PROGRESS.md + Tool-Config-Update**: `hasFacetMode: true` im Tool-Config, Inventar-Spalte ergänzen.

**Abgrenzung v1 vs Phase 3:**

| | v1 (dieser Plan) | Phase 3 |
|---|---|---|
| Items | 50 | 120 (50 + 70) |
| Zeit | ~10 min | +~12 min = ~22 min |
| Output | 5 Domain-Scores + 6 Archetypen | 5 Domains + 30 Facetten |
| Route | `/de/persoenlichkeitstest` | selbe Route, Opt-In nach v1-Completion |
| Share-Card | 1200×630 PNG | unverändert (zeigt Domains, nicht Facetten) |

**Definitiv NICHT in Phase 3:** Norm-basierte Percentiles (bräuchte Altersgruppe/Geschlecht), IPIP-IPC (interpersonal), Dark-Triad-Erweiterungen. Big Five bleibt der Scope.
