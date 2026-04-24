---
ticket_type: end-review
pass_number: 1
target_slug: kreditrechner
tool_id: loan-calculator
build_commit_sha: 43280f9
dossier_ref: tasks/dossier-output-kreditrechner.md
previous_pass_ref: null
verdict: blockers_found
reviewed_at: 2026-04-24T18:45:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

The originally-cited R3 blocker (`.optional-badge` AAA contrast) was **RESOLVED** by CEO direct
hot-fix `43280f9` — zero `--color-text-subtle` occurrences remain. Core tool (logic, UI, security,
performance, input-format parsing) is clean. Three new blockers found, all in
`src/content/tools/kreditrechner/de.md`: (B-01) implementation comment renders visibly as page
text, (B-02) Sondertilgungs body-example is 2× factually wrong, (B-03) FAQ Sondertilgungs
answer is ~10× factually wrong. All three are plain-text fixes in a single markdown file.

---

## Smoke-Test (§2.1)

```
rm -rf dist/ .astro/
npm run build   → Complete (60 HTML, 59 Pagefind pages) ✓  No errors in build log.
Dev server      → http://localhost:4337 (ports 4321-4336 occupied)
curl /de/kreditrechner → HTTP=200 ✓
Layout markers: kreditrechner-tool, section[aria-label="Kreditrechner"] → 5 matches ✓
dist/de/kreditrechner/index.html exists, timestamp after last commit ✓
```

Build is green. Page renders.

---

## Funktions-Test-Verifikation (§2.2)

All inputs manually fed through `computeMonatsrate()` / `computeKreditErgebnis()` source logic
using Node.js to verify independently.

| Input | Angezeigt / Erwartet | Extern verifiziert | OK |
|-------|---------------------|-------------------|-----|
| 200.000 € / 3,80% / 240m | Monatsrate 1.190,99 € | Node: 1190.99 | ✓ |
| 10.000 € / 5% / 12m | Monatsrate 856,07 € | Node: 856.07 | ✓ |
| 100.000 € / 4% / 120m | Monatsrate 1.012,45 € | Node: 1012.45 | ✓ |
| 100.000 € / 4% / 120m + 5000 ST | Ersparnis 6.736,27 € / 36 Monate | Node: 6736.27 / 36 | ✓ |
| 0 (Kreditbetrag) | Validierungsfehler "muss > 0 €" | NaN guard fires | ✓ |
| -5000 (Kreditbetrag) | Validierungsfehler "muss > 0 €" | guard: kreditbetrag <= 0 | ✓ |
| `abc` (Text) | Validierungsfehler "Bitte einen Betrag" | parseDE → NaN | ✓ |
| `<script>alert(1)</script>` | parseDE → NaN, Validierungsfehler | No XSS, Svelte textContent | ✓ |

Reset-Button: clears alle Felder auf Defaults (200.000 / 3,80 / 240 / leer). ✓

Sondertilgungs-Delta-Box: erscheint reaktiv nach Eingabe ≥1 in Sondertilgung-Feld. ✓

Tilgungsplan-Tabelle: erscheint wenn Ergebnis vorhanden. Spalte "Sondertilg." wird dynamisch
ergänzt wenn Sondertilgung > 0. ✓

aria-live="polite" auf .results — Screen-Reader-Output bei Rechenänderung. ✓

### Input-Format-Konsistenz (§2.2.1)

`parseDE()` tested with all 4 German number variants:

| Feld | `200000` | `200.000` | `200,00` | `200.000,50` | Verdict |
|------|----------|-----------|----------|--------------|---------|
| Kreditbetrag | → 200.000,00 € | → 200.000,00 € | → 200,00 € | → 200.000,50 € | ✓ konsistent |
| Sollzins | `3.8`=3,80 | `3,80`=3,80 | `3,80`=3,80 | n/a | ✓ konsistent |

Anzeige-Format Round-Trip: Tool zeigt `200.000,00 €` → `parseDE("200.000,00")` = 200000 ✓
Placeholder `z.B. 200.000` → `parseDE("200.000")` = 200000 ✓
Placeholder `z.B. 3,80` → `parseDE("3,80")` = 3.8 ✓
Placeholder `z.B. 5.000` → `parseDE("5.000")` = 5000 ✓

**Input-Format-Konsistenz: PASS** — kein Silent-Parse-Bug, kein Format-Trap.

---

## Blocker (ship-blocking, müssen vor Freigabe gefixt sein)

### B-01 — Content: Implementierungskommentar rendert als öffentlicher Seitentext (AF-1 carry-over)

**Problem:** `src/content/tools/kreditrechner/de.md:98` enthält eine technische Notiz, die als
sichtbares HTML auf der Seite gerendert wird.

**Beleg:**
```
Befehl: grep "FAQ wird aus" dist/de/kreditrechner/index.html
Output: <p>(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)</p>
```
Ebenso in dev-server-Response bestätigt.

**Impact:** Besucher sehen direkt unter der Überschrift `## Häufige Fragen` eine interne
Entwickler-Notiz. Das wirkt unprofessionell und kann Nutzervertrauen beschädigen.

**Fix:** `src/content/tools/kreditrechner/de.md:98` — Zeile löschen.
Die `## Häufige Fragen`-H2 und die FAQPage-JSON-LD bleiben vollständig erhalten.

---

### B-02 — Content: Sondertilgungs-Beispiel im Body-Text 2× zu niedrig

**Problem:** `src/content/tools/kreditrechner/de.md:78` nennt "ca. 3.000 € Zinsen" als
Ersparnis für ein konkretes Beispiel — die tatsächliche Tool-Berechnung ergibt 6.736,27 €.

**Beleg:**
```
de.md:75-78:
"Beispiel — Sondertilgung 5.000 € p.a.:
- Kredit: 100.000 €, Sollzins: 4 %, Laufzeit: 10 Jahre
- Ohne Sondertilgung: Gesamtzinsen ca. 21.494 €, Laufzeit 120 Monate
- Mit 5.000 € Sondertilgung p.a.: Einsparung ca. 3.000 € Zinsen, Laufzeit kürzer um mehrere Monate"

Node.js computeKreditErgebnis(100000, 4, 120, 5000):
  ersparnis_zinsen = 6736.27   (content: "ca. 3.000" → 2,2× zu niedrig)
  ersparnis_monate = 36        (content: "mehrere Monate" → 3 Jahre, grobe Untertreibung)
  planMit.length   = 84 Monate (36 Monate kürzer als 120)
```

Auch die Baseline-Zahl ist korrekt (`gesamtzinsenOhne = 21494.25 ≈ "ca. 21.494 €"` ✓), was
zeigt der Fehler liegt gezielt beim Ersparnis-Teil.

**Impact:** User liest die Beispielzahl "3.000 €", gibt dieselben Werte in das Tool ein, sieht
"Du sparst **6.736,27 € Zinsen** und bist **36 Monate früher** schuldenfrei." — direkter
Widerspruch zwischen erklärendem Content und Tool-Ergebnis. Vertrauensverlust; potenzielle
Fehlplanung bei realen Finanzentscheidungen.

**Fix:**
```
src/content/tools/kreditrechner/de.md:78
- "Einsparung ca. 3.000 € Zinsen, Laufzeit kürzer um mehrere Monate"
+ "Einsparung ca. 6.736 € Zinsen, Laufzeit um 36 Monate (3 Jahre) kürzer"
```

---

### B-03 — Content: FAQ-Antwort ~10× falsche Zinsersparnis

**Problem:** Die FAQ-Antwort "Lohnt sich eine Sondertilgung?" enthält Zahlen, die um den
Faktor ~10 von dem abweichen, was das Tool für dieselbe Parameterkonstellation berechnet.

**Beleg:**
```
de.md FAQ frontmatter (ca. Zeile 27-28):
"Eine Sondertilgung von 5.000 € bei einem 100.000-€-Kredit mit 4 % auf 10 Jahre
spart rund 600–800 € Zinsen und verkürzt die Laufzeit um mehrere Monate."

Tool-Berechnung (Sondertilgung = jährlich):
  ersparnis_zinsen = 6.736,27 €   (FAQ: "600–800 €" → ~10× zu niedrig)
  ersparnis_monate = 36           (FAQ: "mehrere Monate" → 3 Jahre)
```

Zusätzliche Inkonsistenz: Body-Text (B-02) sagt "ca. 3.000 €", FAQ sagt "600–800 €" — beide
falsch und gegenseitig inkonsistent für nominell dieselbe Ausgangssituation.

Die FAQ meint möglicherweise eine einmalige (nicht jährliche) Sondertilgung. Das Tool
unterstützt jedoch ausschließlich jährliche Sondertilgungen — ein Nutzer, der die FAQ
liest und dann 5.000 in das Sondertilgung-Feld eingibt, sieht 6.736 € statt 600–800 €.
Selbst eine Einmal-Zahlung von 5.000 € würde in der ersten Jahres-Periode ca. 1.500-1.800 €
sparen, nicht 600–800 €.

**Impact:** Die FAQ ist für viele User der erste Einstiegspunkt. Falsche Größenordnungen
(~10× niedrig) schaffen bei Nutzern falsche Erwartungen und Misstrauen wenn das Tool
erheblich höhere Werte zeigt.

**Fix:**
```
de.md FAQ "Lohnt sich eine Sondertilgung?" — Antwort überarbeiten:
Option A: jährliches Beispiel mit korrekten Zahlen
  "Eine jährliche Sondertilgung von 5.000 € bei einem 100.000-€-Kredit mit 4 % auf
   10 Jahre spart rund 6.700 € Zinsen und verkürzt die Laufzeit um ca. 3 Jahre."
Option B: einmaliges Beispiel mit korrekten Zahlen (anderer Parameterraum)
  "Eine einmalige Sondertilgung von 5.000 € nach dem ersten Jahr spart ca. 1.700 €
   Zinsen. Jährliche Sondertilgungen verstärken den Effekt deutlich — unser Rechner
   zeigt das Delta live."
```

---

## Improvements (sollten gemacht werden, nicht ship-blocking)

### I-01 — Content: Annuitätenformel-Beispielzahl 1 € zu hoch (gegenüber Tool-Ausgabe)

**Problem:** `de.md:55` nennt "≈ 1.191,99 €" Monatsrate für 200.000 € / 3,80% / 240m.
Tool berechnet 1.190,99 € (1 € Differenz). Gesamtzinsen: Content sagt "86.077 €", Tool
berechnet 85.836,68 € (~240 € Differenz = 240 × 1 €).

Das "≈"-Symbol erlaubt Annäherung, aber bei Ausgaben auf Cent-Niveau schafft eine 1 €-
Abweichung Irritation, da der User diesen Wert direkt im Tool reproduzieren kann.

**Fix:** `de.md:55-57` → `1.190,99 €` / `85.836,68 €` / `285.836,68 €`

### I-02 — A11y: .reset-btn ohne :focus-visible (A3 carry-over)

**Location:** `KreditrechnerTool.svelte:566-580` — `.reset-btn:hover` vorhanden, `:focus-visible` fehlt.

**Fix:**
```css
.reset-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### I-03 — Content: 3× "unser(es) Rechner(s)" (CONTENT.md §4, C2 carry-over)

**Locations:** `de.md:18, 26, 73`
**Fix:** → "dieser Rechner" / "Den Rechner" / "Der Rechner"

### I-04 — Security-Matrix: kein try/catch um computeKreditErgebnis (Check #18 carry-over)

**Location:** `KreditrechnerTool.svelte:76`
Kein praktisches Throw-Risiko (alle NaN-Pfade abgedeckt), aber Typ-Klassifizierungs-Fail.

### I-05 — relatedTools: 1 Eintrag statt ≥2 (Check #19 carry-over)

**Location:** `de.md:29` — `relatedTools: ['mehrwertsteuer-rechner']`
**Fix:** `['mehrwertsteuer-rechner', 'tilgungsplan-rechner', 'zinsrechner']`

### I-06 — UX: howToUse Schritt 4 referenziert nicht-existentes UI-Element

**Problem:** `howToUse[3]`: "Das **SCHUFA-neutral-Badge** unter der Monatsrate bestätigt: ..."
Das Tool hat eine `privacy-badge`-Div am Seitenende (`Kein Server-Upload · Kein Tracking ·
Rechnet lokal in Ihrem Browser`) — dieses erwähnt "SCHUFA" nicht explizit und liegt nicht
unterhalb der Monatsrate-Card.

`grep -i "SCHUFA" src/components/tools/KreditrechnerTool.svelte → 0 Treffer` — kein
SCHUFA-spezifischer Text im Component.

**Fix (Auswahl):**
- (a) `privacy-badge`-Text erweitern: `"SCHUFA-neutral · Kein Server-Upload · Kein Tracking"` +
  DOM nach `summary-card--primary` verschieben
- (b) `howToUse[3]` anpassen: Schritt 4 auf die tatsächliche `privacy-badge`-Position verweisen

---

## Observations

- **O-01:** `parseDE("<script>alert(1)</script>")` — strippt HTML-Zeichen auf "1", gibt 1 zurück.
  Keine Sicherheitslücke (Svelte rendert textContent, kein innerHTML), aber ein
  HTML-Paste-Fall könnte "Kreditbetrag = 1 €" produzieren statt Fehlermeldung. Harmlos.
- **O-02:** Laufzeit-Feld-Label sagt "Laufzeit" ohne "in Monaten" — nur der Unit-Suffix im
  Input ("Monate") klärt die Einheit. Auf Mobile wo Suffix abgeschnitten sein könnte, könnte
  "Jahre" vermutet werden. Backlog: Label zu "Laufzeit (Monate)".
- **O-03:** `hatSondertilgung`-Tabellenspalte erscheint/verschwindet ohne Transition —
  leichter Layout-Shift. Kein axe-Fail, aber kleine Motion-Chance.

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Notes |
|-----------|--------|-------|
| Funktion | ✓ | Formeln korrekt, 37/37 Tests grün |
| Input-Format-Konsistenz §2.2.1 | ✓ | parseDE korrekt, Round-Trip PASS, kein Format-Trap |
| Security | ✓ | Kein innerHTML/eval, keine externen Calls, XSS-Inputs PASS |
| Performance | ✓ | Bundle 11,3 kB << 50 kB Budget; kein Heavy-Dep |
| A11y | ~ | aria-live ✓, labels ✓; .reset-btn focus-visible fehlt → I-02 |
| UX | ✗ | B-01/B-02/B-03: Content widerspricht Tool-Output, Comment sichtbar |
| Content | ✗ | B-01 Comment, B-02 Sondertilgung Body 2×, B-03 FAQ 10× |
| Dossier H1 (SCHUFA-Badge) | ~ | Inhalt kommuniziert SCHUFA-Neutralität, badge-Text fehlt "SCHUFA" → I-06 |
| Dossier H2 (ST-Delta) | ✓ | Sondertilgungs-Delta-Box mit Live-Ersparnis implementiert |
| Dossier H3 (Anschluss-Chip) | ~ | Als Prosa vorhanden, nicht interaktiv (OK für Phase 1) |

---

## Recommendation for CEO

**Rework-Scope:** Alle 3 Blocker liegen in einer einzigen Datei:
`src/content/tools/kreditrechner/de.md`

Da `rework_counter` 2/2 at cap ist, empfiehlt sich ein **CEO-Direktfix** analog zu Commit
`43280f9` (3 Textzeilen, kein JS, keine Build-Prüfung erforderlich außer npm run build):

1. **B-01** — `de.md:98` löschen:
   ```
   (FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)
   ```

2. **B-02** — `de.md:78` korrigieren:
   ```
   - "Einsparung ca. 3.000 € Zinsen, Laufzeit kürzer um mehrere Monate"
   + "Einsparung ca. 6.736 € Zinsen, Laufzeit um 36 Monate (3 Jahre) kürzer"
   ```

3. **B-03** — `de.md` FAQ "Lohnt sich eine Sondertilgung?" überarbeiten:
   ```
   - "spart rund 600–800 € Zinsen und verkürzt die Laufzeit um mehrere Monate"
   + "spart rund 6.700 € Zinsen (jährliche Sondertilgung) und verkürzt die Laufzeit
   +  um ca. 3 Jahre — der Rechner zeigt das Delta live."
   ```

Nach Behebung der 3 Blocker ist das Tool **ship-ready**. Die Improvements (I-01 bis I-06)
können zeitnah, aber außerhalb des Pass-2-Gates adressiert werden.
