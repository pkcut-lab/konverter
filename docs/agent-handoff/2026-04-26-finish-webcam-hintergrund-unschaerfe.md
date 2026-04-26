---
title: Agent-Handoff — webcam-hintergrund-unschaerfe fertig shippen
created: 2026-04-26
created_by: claude (post Phase-2-Sonderdelegation)
target_agent: separate-session-tool-builder
quality_bar: paperclip-equivalent
status: ready-for-handoff
verification_after: report nach Vorlage am Ende, User gibt Report an Claude zurück
predecessor: 2026-04-26-finish-parked-pdf-tools.md
ship_block_reason: Beide Test-Files (webcam-blur.test.ts + webcam-hintergrund-unschaerfe.test.ts) sind leere Stubs — kein test suite, 0 Tests
---

# Auftrag — webcam-hintergrund-unschaerfe fertig shippen

## Kontext (in 30 Sekunden)

`webcam-hintergrund-unschaerfe` ist **nahezu fertig** — der harte Teil ist schon erledigt.
Config, 628-Zeilen-Svelte-Component, Content-DE, Slug-Map, Tool-Registry und `[slug].astro`-Dispatch
sind alle vorhanden und verdrahtet. Der einzige Blocker: **beide Test-Files sind leere Stubs**
(kein `describe`, kein `it`, Vitest meldet „No test suite found"). 

Du schreibst die Tests, läuft den Build, machst den 3-Pass-End-Review und shippst.
Keine neuen Architektur-Entscheidungen nötig — nur die Quality-Bar abarbeiten.

## Wer du bist

Eigenständiger Tool-Builder-Agent in einer **separaten Session**. Du bringst ein fast-fertiges
Tool über die Ziellinie. Wenn du fertig bist: Report nach Vorlage am Ende.

## Pflichtlektüre (in dieser Reihenfolge)

Bevor du ANFANGST, lies diese Files VOLLSTÄNDIG:

1. `CLAUDE.md` — Hard-Caps + Non-Negotiables
2. `docs/paperclip/bundle/agents/ceo/AGENTS.md §0` (§0.1 Sequential, §0.7 NO-ESCALATION-LOCK)
3. `CONVENTIONS.md` — Code-Regeln
4. `STYLE.md` — Visual-Tokens
5. `CONTENT.md` — Frontmatter-Schema
6. `DESIGN.md` — Tool-Detail-Layout
7. `PROJECT.md` — Tech-Stack-Versionen
8. `docs/completed-tools.md` — Schema (CEO-Notes-Spalte) + Beispiele
9. `src/content/tools.schema.ts` + `src/lib/tools/schemas.ts` — Zod-Schemas

Reference-Implementations für Test-Pattern:

- **`tests/lib/tools/bild-zu-text.test.ts`** oder **`tests/lib/tools/ki-bild-detektor.test.ts`** —
  wie `InteractiveConfig`-Tools getestet werden (Config-Identity, Schema-Validation, Registry-Check,
  Slug-Map-Check). Dein Pattern für `webcam-blur`.
- **`src/lib/tools/webcam-blur.ts`** — Config-File, das du testest.
- **`src/components/tools/WebcamBlurTool.svelte`** — Component (628 Zeilen, LESEN bevor du Tests schreibst).
- **`src/content/tools/webcam-hintergrund-unschaerfe/de.md`** — Content (LESEN + validieren).

## Aktueller Stand — was existiert

| Artefakt | Status |
|---|---|
| `src/lib/tools/webcam-blur.ts` | ✅ vollständig |
| `src/components/tools/WebcamBlurTool.svelte` | ✅ 628 Zeilen, fertig |
| `src/content/tools/webcam-hintergrund-unschaerfe/de.md` | ✅ vollständig |
| `src/lib/slug-map.ts` | ✅ `'webcam-blur': { de: 'webcam-hintergrund-unschaerfe' }` |
| `src/lib/tool-registry.ts` | ✅ lazy import registriert |
| `src/pages/[lang]/[slug].astro` | ✅ Dispatch mit `config.type === 'interactive' && config.id === WEBCAM_BLUR_TOOL_ID` Guard |
| `tests/lib/tools/webcam-blur.test.ts` | ❌ leerer Stub — kein describe, kein it |
| `tests/lib/tools/webcam-hintergrund-unschaerfe.test.ts` | ❌ leerer Stub — kein describe, kein it |
| `docs/completed-tools.md` | ❌ Tool noch nicht appended |

## Sequential-Pipeline (vereinfacht, da fast fertig)

```
Phase A — Vorbereitung (CHECK existierende Files, nicht neu bauen)
  Config lesen · Content validieren gegen Schema · Component überfliegen
  → CEO-Gate-1

Phase B — Tests schreiben
  tests/lib/tools/webcam-blur.test.ts befüllen (≥15 Tests)
  Leeres tests/lib/tools/webcam-hintergrund-unschaerfe.test.ts LÖSCHEN oder befüllen
  → npx vitest run webcam grün → CEO-Gate-2

Phase C — Build-Check
  npx astro build durch
  /de/webcam-hintergrund-unschaerfe/ mit ≥30 KB HTML gebaut
  → CEO-Gate-3

Phase D — Self-Review (alle Dimensionen)
  Bei Issues: scoped Fix → max 2 Reworks

Phase E — End-Review (3-Pass-Pflicht)
Phase F — Ship
```

**EISERNE REGELN identisch zu allen anderen Handoffs:**
- 3-Pass-End-Review Pflicht
- Commit `feat(tools/video): ship webcam-hintergrund-unschaerfe` mit Phase-A–F-Body
- Trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- NO-ESCALATION-LOCK §0.7 — kein File in `inbox/to-user/`
- `bash scripts/check-git-account.sh` vor jedem Commit → muss `pkcut-lab` zeigen

---

## Phase B im Detail — Tests schreiben

### Datei-Strategie

Schreib alle Tests in `tests/lib/tools/webcam-blur.test.ts` (befüllen).
Die zweite leere Datei `tests/lib/tools/webcam-hintergrund-unschaerfe.test.ts` entweder:
- ebenfalls befüllen (mit wenigen Alias-Tests die auf webcam-blur.test.ts verweisen), ODER
- mit einem CEO-Log-Eintrag löschen (sie ist ein leerer Stub, der Vitest-Fehler wirft)

**Wähle eine Option autonom, logge sie im CEO-Log.**

### Was zu testen ist (≥15 Tests)

```ts
describe('webcam-hintergrund-unschaerfe config + registry', () => {

  // Config-Identity (4 Tests)
  it('id is webcam-blur')
  it('type is interactive')
  it('categoryId is video')
  it('canvasKind is canvas')

  // Schema-Validation (2 Tests)
  it('config validates against interactiveSchema via parseToolConfig()')
  it('exportFormats contains png')

  // Registry (3 Tests)
  it('is registered in tool-registry (hasTool + getToolConfig)')
  it('is registered in slug-map — de: webcam-hintergrund-unschaerfe')
  it('slug-map has no en/fr/es entry yet (Phase 3)')

  // Keine Process/Prepare — InteractiveConfig hat keine — keine Dummy-Tests dafür

  // Content-Frontmatter-Spot-Checks (4 Tests)
  // (import de.md Frontmatter via ?raw und parse YAML-Strings manuell
  //  ODER nutze parseDE aus tools.schema.ts wenn verfügbar)
  it('title is between 30 and 60 characters')
  it('metaDescription is between 140 and 160 characters')
  it('relatedTools contains hevc-zu-h264')
  it('category is video')

  // Qualitäts-Invarianten (2 Tests)
  it('config has no process function (interactive, not file-tool)')
  it('exportFormats array is non-empty')
})
```

**Wichtig:** `InteractiveConfig` hat kein `process` oder `prepare` — erwarte KEINEN `toolRuntimeRegistry`-Eintrag.
Webcam-Logik läuft komplett in `WebcamBlurTool.svelte` via `getUserMedia()`, nicht im Registry-System.

---

## Quality-Bar (alles Pflicht)

### Code

- [ ] Keine Hex-Codes in Component — nur Tokens aus `tokens.css`
- [ ] Keine arbitrary px-Werte in Component — nur Tokens
- [ ] `prefers-reduced-motion` Block mit `transition: none` UND `transform: none`
  (global.css deckt `transform` nicht ab — Lessons-Learned Handoff 1)
- [ ] `track.stop()` auf allen Kamera-Tracks bei Component-Destroy + Kamera-beenden-Button
  (Kamera-LED muss erlöschen — Privacy-Critical)
- [ ] `onDestroy` cleanup für `rafId` (requestAnimationFrame-Loop stoppt)
- [ ] Kein `innerHTML`, kein `eval`
- [ ] Keine Emojis in UI-Strings

### Tests

- [ ] ≥15 Tests in `webcam-blur.test.ts`
- [ ] `npx vitest run webcam` → 100 % pass (kein „No test suite found" mehr)
- [ ] Kein zweites leeres Test-File das Vitest-Fehler wirft

### Content

- [ ] Frontmatter validiert gegen `tools.schema.ts`
- [ ] title 30–60 Zeichen: aktuell „Webcam-Hintergrund unscharf machen — direkt im Browser" (52 Zeichen) ✓
- [ ] metaDescription 140–160 Zeichen: prüfen
- [ ] headingHtml ≤1 `<em>`: `"Webcam-<em>Hintergrund</em> unscharf machen"` ✓
- [ ] howToUse 3–5 Schritte: 4 ✓
- [ ] faq 4–6 Q/A: 6 ✓
- [ ] relatedTools: `['hevc-zu-h264', 'hintergrund-entfernen', 'webp-konverter']` — prüfe ob alle 3 Slugs auflösbar
- [ ] category: `video` ✓
- [ ] Body: ≥300 Wörter ✓ (geschätzt ~450 Wörter)

### Build + Render

- [ ] `npx astro build` durch — `/de/webcam-hintergrund-unschaerfe/` mit ≥30 KB HTML
- [ ] JSON-LD x4: SoftwareApplication + BreadcrumbList + FAQPage + HowTo
- [ ] Italic-accent H1 mit `<em>` rendert
- [ ] Eyebrow-Pill „Läuft lokal · kein Upload" sichtbar
- [ ] Related-Bar resolvt alle 3 relatedTools
- [ ] Aside-Steps-Section rendert (config hat `aside.steps` + `aside.privacy`)
- [ ] Astro check — KEINE NEUEN TS-Errors (Baseline: 5 pre-existing in `[slug].astro`)

### Sequential-Pipeline-Compliance

- [ ] Slug-Map ✓ (schon registriert)
- [ ] Tool-Registry ✓ (schon registriert)
- [ ] `[slug].astro`-Dispatch ✓ (schon vorhanden)
- [ ] Append in `docs/completed-tools.md` mit CEO-Notes-Spalte
- [ ] Append in `tasks/.ceo-tmp/completed.txt`
- [ ] Commit mit Phase-A–F-Body

---

## Verbotene Aktionen

- `git push --force`, `git reset --hard`, DennisJedlicka-Account — niemals.
- File in `inbox/to-user/` schreiben (§0.7 NO-ESCALATION-LOCK).
- Bestehende Content/Config/Component-Files grundlegend umschreiben — du bist hier um zu shippen, nicht zu redesignen.
- Neue externe Dependencies hinzufügen (das Tool braucht keine — läuft mit Browser-APIs).

## Erlaubte autonome Decisions (mit CEO-Log-Eintrag)

- Strategie für zweites Test-File (befüllen oder löschen).
- Minor Content-Fixes wenn Schema-Validation scheitert (z.B. metaDescription zu lang).
- §7.15-Override wenn Phase D Critics nach 2 Reworks noch minor Issues haben.

---

## Report-Format (am Ende deiner Session)

Schreibe deinen Report nach `docs/agent-handoff/2026-04-26-finish-webcam-hintergrund-unschaerfe-REPORT.md`:

```markdown
---
report_for: 2026-04-26-finish-webcam-hintergrund-unschaerfe.md
agent_session: <timestamp_start> bis <timestamp_end>
tools_attempted: 1
tools_shipped: <0 oder 1>
total_commits: <count>
session_duration_minutes: <int>
---

# Report — webcam-hintergrund-unschaerfe Session

## Zusammenfassung
<2–3 Sätze>

## Tool-Bilanz

### webcam-hintergrund-unschaerfe
- **Status:** shipped | parked | failed
- **Commit-SHA:** <abbreviated>
- **Tests:** <passed>/<total> grün
- **Phasen-Bilanz:** A clean / B clean / C clean / D <details> / E <Pass-1/2/3> / F shipped
- **Quality-Bar:** alle Checkboxen grün? Wenn nein, welche?
- **CEO-Decisions:** keine | <list>
- **Reworks:** 0 | 1 | 2
- **Auffälligkeiten:** <z.B. „zweites Test-File gelöscht per CEO-Log">

## Kumulierte Metriken

- **Build-Status:** `npx astro build` → <pages> Pages
- **Test-Status:** `npx vitest run` → <passed>/<total>
- **Astro check Delta:** TS-Errors vor vs nach

## Verifikation (für Claude/CEO)

```bash
git log --oneline <handoff-base-sha>..HEAD
npx vitest run webcam --reporter=basic 2>&1 | tail -3
npx astro build 2>&1 | tail -3
test -f dist/de/webcam-hintergrund-unschaerfe/index.html && echo "page built"
grep "webcam-hintergrund-unschaerfe" docs/completed-tools.md
```
```

## Wenn du fertig bist

1. Letzten Commit nicht pushen.
2. Report schreiben.
3. User mitteilen: „Report fertig unter `docs/agent-handoff/2026-04-26-finish-webcam-hintergrund-unschaerfe-REPORT.md`. Bitte an Claude weiterleiten."

## Wenn du blockiert bist

- **Build bricht wegen Component-Fehler** → Read `WebcamBlurTool.svelte` komplett, finde den TS-Error, 1-line-fix.
- **Content-Schema-Fehler** → Minor-Fix (Zeichenzahl, Tipp), nicht Neuschreiben.
- **3+ Reworks** → §7.15-Override ship-as-is + Phase-2-Backlog.

---

**Start-Befehl:** „Lies diesen Brief + die 9 Pflicht-Files. Dann: Phase A (Files checken, nicht bauen) → Phase B (Tests schreiben) → Phase C–F. Das Tool ist fast fertig — Ziel ist Ship."

— Claude (CEO-Handoff 2026-04-26)
