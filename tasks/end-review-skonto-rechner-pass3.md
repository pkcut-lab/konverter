---
ticket_type: end-review
pass_number: 3
target_slug: skonto-rechner
tool_id: cash-discount-calculator
build_commit_sha: 273e12c
dossier_ref: tasks/dossier-output-skonto-rechner.md
previous_pass_ref: tasks/end-review-skonto-rechner-pass2.md
verdict: clean
reviewed_at: 2026-04-25T16:20:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

**Verdict: CLEAN.** Finaler Ship-Gate bestätigt. B-01 fix (commit 273e12c) ist in Source
(`de.md:88`: `979,61 €`) und gebautem HTML verifiziert. Keine Regressionen zwischen `273e12c`
und HEAD (`d52d1ec` ist docs-only, kein skonto-rechner Touchpoint). Alle 9 Dimensionen sauber.
4 offene Improvements bleiben nicht-blocking.

---

## §2.1 Build & Boot

```
npm run build → 73 pages built — Complete!
/de/skonto-rechner → index.html existiert ✓
Layout-Marker: tool-main, basis-pill, jahreszins-card, copy-inline, netto-box, results — alle vorhanden ✓
```

Delta-Check `273e12c → HEAD (d52d1ec)`:
```
git diff 273e12c HEAD -- src/lib/tools/skonto-rechner.ts
                          src/components/tools/SkontoRechnerTool.svelte
                          src/content/tools/skonto-rechner/
→ (no output) — keine Änderungen
```

`d52d1ec` ist `docs(agent-handoff)`-only. Keine Regression möglich.

**Build: PASS. Smoke-Test: PASS.**

---

## §2.2 Funktions-Test-Verifikation

Alle 5 Test-Cases via direkter Logik-Verifikation gegen `computeSkonto`-Implementierung:

| Test | Input | Output | Manuell verifiziert |
|------|-------|--------|---------------------|
| Normal | 1000/2%/10T/30T | skonto=20, zahl=980, ejz=36,73 % | `(2/98)×(360/20)×100=36,7347→36,73` ✓ |
| Min | 0,01/0,01%/1T/2T | skonto=0, zahl=0,01, ejz=3,60 % | Kein Crash ✓ |
| Large | 5000/3%/7T/30T | skonto=150, zahl=4850, ejz=48,41 % | `(3/97)×(360/23)×100=48,4088→48,41` ✓ |
| Frist=Ziel | 1000/2%/30T/30T | ejz=null | Div/0-Schutz korrekt ✓ |
| Netto-Modus | 840/2%/19%/10T/30T | nettoNachSkonto=823,20; mwst=156,41; bruttoNachSkonto=979,61 | `840×0,98=823,20; 823,20×0,19=156,408→156,41` ✓ |

Invalid-Input: `"abc"` → `parseDE` = NaN → betragError ausgelöst ✓

**Alle 5 Funktions-Tests PASS.**

### §2.2.1 Input-Format-Konsistenz (DE-Locale)

Verifiziert gegen tatsächliche `src/lib/tools/parse-de.ts`-Implementierung
(3-digit-segment-Heuristik korrekt implementiert):

| Feld | `3000` | `3.000` | `3 000` | `3,00` | `3.000,50` | Verdict |
|------|--------|---------|---------|--------|------------|---------|
| Rechnungsbetrag | 3000 → skonto=60 | 3000 → skonto=60 | 3000 → skonto=60 | 3 → skonto=0,06 | 3000,5 → skonto=60,01 | ✓ konsistent |

Alle 3 Gleichwert-Varianten (3000/3.000/3 000) → identisches Ergebnis ✓

Output-Round-Trip:
- `parseDE("36,73") = 36.73` ✓
- `parseDE("980,00") = 980` ✓
- `parseDE("20,00") = 20` ✓

Kein Silent-Trap. Angezeigte Formate sind als Input akzeptiert.

**DE-Locale §2.2.1: PASS.**

---

## §2.3 Dossier-Differenzierungs-Check

| Hypothese | Dossier-Claim | Im Tool sichtbar? | Beleg |
|-----------|---------------|-------------------|-------|
| **H1** Brutto/Netto-Toggle mit Vorsteuer-Aufschlüsselung | kein Konkurrent hat Toggle+Aufschlüsselung | ✓ JA | `.basis-bar` + Toggle (Svelte:138–152), `.netto-box` (Svelte:366) |
| **H2** EJZ als Haupt-Insight mit Ampel | kein Konkurrent zeigt EJZ+Ampel prominent | ✓ JA | `.jahreszins-card` + `.ampel-dot--gruen/gelb/rot` (Svelte:295–327) |
| **White-Space** Copy-Button | kein Konkurrent hat Copy | ✓ JA | 3× `.copy-inline` (Svelte:315, 337, 352) |
| **White-Space** Live-on-Typing | kein Konkurrent | ✓ JA | `$derived` für alle Felder (Svelte:34–98), kein Submit-Button |

**Dossier: H1 ✓, H2 ✓, White-Space ✓ — alle implementiert und sichtbar.**

---

## §2.4 Security-Review

| Check | Ergebnis |
|-------|----------|
| `innerHTML` / `set:html` | NICHT VORHANDEN ✓ |
| Inline-Event-Handler `onclick="..."` | NICHT VORHANDEN ✓ |
| Externe Network-Calls | NICHT VORHANDEN ✓ |
| XSS `<script>alert(1)</script>` | `parseDE` extrahiert numerischen Content (ergibt `1`, nicht NaN); Svelte auto-escaped Output — kein HTML-Execution-Pfad ✓ |
| Hex-Colors im Component | NICHT VORHANDEN ✓ |

Hinweis: Pass-1-Doc behauptete `parseDE('<script>alert(1)</script>') = NaN`. Korrekt ist `= 1`
(Regex entfernt alle non-digit/comma/dot/minus chars, `1` bleibt). Sicherheitskonsequenz: betrag=1
→ gültige Berechnung (1 Euro), kein XSS-Pfad. Pass-1-Befund war formal falsch, sicherheitlich
korrekt. Kein neuer Blocker.

**Security: PASS.**

---

## §2.5 Performance-Review

```
SkontoRechnerTool.CQkNdjAU.js:  13,58 kB raw │ gzip: 4,24 kB   (Budget: 150 kB) ✓
_slug_.CiZn_zlo.css (shared):   Budget-Frage deferred per CEO-Decision KON-S1 ✓
```

Reaktivität: `$derived` für alle Outputs — O(1), kein Debounce nötig ✓
Keine statischen Heavy-Dep-Imports ✓
Kein `Uint8Array`/`Blob`/`Canvas`-State ✓

**Performance: PASS (JS-Budget ok).**

---

## §2.6 A11y-Review

| Check | Ergebnis | Beleg |
|-------|----------|-------|
| Labels assoziiert | ✓ | `label[for=inp-betrag/satz/skontofrist/zahlungsziel/mwst]` + `input[id=...]` — 5/5 Paare ✓ |
| aria-live | ✓ | `aria-live="polite"` auf `.results` (Svelte:288) ✓ |
| role=alert Errors | ✓ | 5× `<p role="alert">` (Svelte:187/210/233/256/280) ✓ |
| aria-invalid | ✓ | Alle 5 Input-Felder mit `aria-invalid={...Error !== null}` ✓ |
| aria-pressed Toggle | ✓ | `.basis-pill[aria-pressed={basis==='brutto/netto'}]` ✓ |
| focus-visible | ✓ | `.basis-pill:focus-visible`, `.copy-inline:focus-visible`, `.reset-btn:focus-visible` ✓ |
| prefers-reduced-motion | ✓ | `@media (prefers-reduced-motion: reduce)` → alle Transitions none ✓ |

**A11y: PASS.**

---

## §2.7 UX-Review

- **Default-State:** Default-Werte (1000/2/10/30) ergeben sofort valides Ergebnis — EJZ 36,73 %,
  Ampel grün, sichtbar beim ersten Besuch ✓
- **Error-States:** Alle Fehlermeldungen deutsch, konkret (z.B. "Die Skontofrist muss kürzer sein
  als das Zahlungsziel.") ✓
- **Privacy-Badge:** "Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser" ✓
- **Mobile (375px):** `grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))` — sauber ✓
- **Microcopy:** Kein KI-Floskel-Copy. Präzise, nüchtern. ✓
- **Progressive Disclosure:** Netto-Felder nur bei Toggle auf Netto ✓
- **Input/Output-Format-Konsistenz:** Output-Formate als Input parsbar (kein Silent-Trap) ✓

**UX: PASS.**

---

## §2.8 Content-Audit

| Check | Ergebnis | Detail |
|-------|----------|--------|
| B-01 Fix | ✓ GEFIXT | `de.md:88` und `dist/de/skonto-rechner/index.html` zeigen `979,61 €` ✓ |
| Word-Count | ✓ | 800 Wörter (min 300) ✓ |
| NBSP | ✓ | 16 Zeilen mit `&nbsp;` Vorkommen ✓ |
| H2-Pattern | ✓ | Calculator-Pattern C: Was ist Skonto / EJZ / Brutto-Netto / Wann lohnt / Beispiele / FAQ / Verwandte ✓ |
| headingHtml | ✓ | `"Skonto berechnen — <em>Jahreszins</em> kennen"` — 1 em, umschließt Ziel-Substantiv ✓ |
| relatedTools | ✓ | mehrwertsteuer-rechner ✓, rabatt-rechner ✓, zinsrechner ✓ — alle in dist gebaut ✓ |
| §13.4 Intro-Zeile | OFFEN (I-02) | `de.md:96`: "Weitere Tools für Buchhaltung und Unternehmensfinanzen:" statt Pflicht-Wortlaut — seit Pass 1 offen, nicht blocking |

**Content: PASS (B-01 gefixt, I-02 offen wie in Pass 1+2).**

---

## Regression-Status (Pass 1 + Pass 2)

| Finding | Status | Beleg |
|---------|--------|-------|
| B-01 — Content: Falsches Berechnungsbeispiel | ✓ gefixt | `de.md:88` und built HTML: `979,61 €` (war `999,21 €`) |
| I-01 — font-size raw rem (Svelte:512,644,652) | offen (akzeptabel) | `1rem`/`1.375rem`/`0.875rem` unverändert |
| I-02 — §13.4 Intro-Zeile abweichend | offen (akzeptabel) | `de.md:96` unverändert |
| I-03 — Display font-size raw rem (Svelte:587,595) | offen (akzeptabel) | `2rem`/`1.125rem` unverändert |
| I-04 — Skontosatz 0% nicht geblockt | offen (akzeptabel) | keine Validierungsänderung |

Kein neuer Blocker durch den B-01-Fix eingeführt.

---

## Observations

- **O-01:** CSS-Bundle ~19,6 kB gzip — deferred KON-S1 (systemic, nicht skonto-spezifisch)
- **O-06 (neu):** `parseDE('<script>alert(1)</script>')` gibt `1` zurück (nicht NaN, wie Pass-1-Doc
  annahm). Root cause: Regex entfernt non-digit chars, `1` aus `(1)` bleibt. Sicherheitlich
  irrelevant (betrag=1 → normale Berechnung, kein XSS-Pfad). Dokumentations-Korrektur für
  zukünftige Pass-Reviewer.
- **O-05:** Empty-State-Message (`"Gib die Werte ein…"`) ist toter Code mit Default-Werten.
  Backlog unverändert.

---

## Abschnitts-Zusammenfassung

| Dimension | Ergebnis |
|-----------|----------|
| Funktion | ✓ PASS |
| Input-Format-Konsistenz §2.2.1 | ✓ PASS |
| Security | ✓ PASS |
| Performance | ✓ PASS |
| A11y | ✓ PASS |
| UX | ✓ PASS |
| Content | ✓ PASS (B-01 gefixt) |
| Dossier-Differenzierung | ✓ H1 ✓, H2 ✓, White-Space ✓ |

---

## Recommendation for CEO

**Verdict: CLEAN. Tool ist ship-ready — `skonto-rechner` in `docs/paperclip/freigabe-liste.md` aufnehmen.**

Alle 3 Passes abgeschlossen. Einziger Blocker (B-01: falsches Berechnungsbeispiel) wurde in
commit `273e12c` korrekt behoben und ist in Source + Build verifiziert. Keine Regressionen.
Keine neuen Blocker.

Offene Improvements (nicht blocking, Maintenance-Window oder KON-S1-Cleanup):
- I-01 + I-03: Token-Compliance font-size raw rem (SkontoRechnerTool.svelte)
- I-02: `de.md:96` Intro-Zeile auf CONTENT.md §13.4 Pflicht-Wortlaut korrigieren
- I-04: Skontosatz 0% Guard in satzError ergänzen
