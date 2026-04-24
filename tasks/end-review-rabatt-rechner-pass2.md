---
ticket_type: end-review
pass_number: 2
target_slug: rabatt-rechner
tool_id: discount-calculator
build_commit_sha: 60150a8
dossier_ref: tasks/dossiers/_cache/finance/rabatt-rechner.dossier.md
previous_pass_ref: tasks/end-review-rabatt-rechner-pass1.md
verdict: clean
reviewed_at: 2026-04-24T23:15:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

**clean.** Both Pass-1 blockers (B-01 precision + B-02 FAQ content) are verified fixed. All
three improvements (I-01 focus-ring, I-02 aria-describedby, I-03 copy-button text) and the
O-02 observation (Kettenrabatt double-rounding) were also addressed in the same rework commit
(`60150a8`). Build: 60 pages, HTTP 200, default result correct (P=100 R=20 → E=80,00 €).
No regressions detected.

---

## Funktions-Test-Verifikation

Dev-server running on port 4399, `/de/rabatt-rechner` HTTP=200, SSR renders default
Standard-Modus with P=100, R=20 → Endpreis 80,00 €, Du sparst −20,00 €, Rabatt 20,00 %.

| Input | Output | Manual Verify | Result |
|---|---|---|---|
| P=100, R=20 (Standard) | E=80,00 € | 100×0,80=80 ✓ | ✓ |
| P=150, E=100 (Rückrabatt) | R=33,33 % | (1-100/150)×100=33,33; round2=33,33 ✓ | ✓ **B-01 FIXED** |
| P=300, E=100 (Rückrabatt) | R=66,67 % | (1-100/300)×100=66,67 ✓ | ✓ |
| Kette P=200, R1=15, R2=8 | Gesamt=21,80 % | 1−(0,85×0,92)×100=21,8; round2=21,8 ✓ | ✓ **O-02 FIXED** |
| Kette 7,5%+3,7% | Gesamt=10,92 % | round2(10,9225)=10,92 (not 10,9225) ✓ | ✓ |

Node.js verification (against `rabatt-rechner.ts` logic):
```
computeRabattProzent(150, 100): round2(33.333…) = 33.33  ✓  (Pass-1 was 33.3333)
computeKettenrabatt 7.5%+3.7%:  round2(10.9225) = 10.92  ✓  (Pass-1 was 10.9225)
```

### Input-Format-Konsistenz (§2.2.1)

parseDE (canonical shared implementation, `src/lib/tools/parse-de.ts`) verified:

| Feld | `3000` | `3.000` | `3,00` | `3.000,50` | Verdict |
|---|---|---|---|---|---|
| Ursprungspreis | 3000 | 3000 ✓ | 3 (distinct) | 3000.5 ✓ | ✓ konsistent |
| Endpreis | 3000 | 3000 ✓ | 3 (distinct) | 3000.5 ✓ | ✓ konsistent |
| Rabatt% | 3000→error | 3000→error | 3 | 3000.5→error | ✓ konsistent |

- `"3.000"` → 3000 (3-digit segment = DE thousands) ✓
- `"3,00"` → 3 (DE decimal comma) ✓
- `"3.000,50"` → 3000.5 ✓
- Leading/trailing whitespace: trimmed ✓
- Output format `"3.000,00 €"` IS accepted as input (`parseDE("3.000,00")` → 3000) ✓

Round-trip format-consistency: **PASS** — tool displays in DE format and accepts same format
as input.

---

## Blocker

None. All Pass-1 blockers resolved.

---

## Regression-Status (Pass 2)

| Pass-1 Finding | Status | Beleg |
|---|---|---|
| B-01 Precision: `computeRabattProzent` 4 Dezimalstellen | ✓ gefixt | `:86` war `round2(r * 100) / 100` → jetzt `round2(r)`; Node.js: 33.3333 → 33.33 |
| B-02 Content: FAQ Zwischenpreis 90€ falsch | ✓ gefixt | `de.md:28` „von 80&nbsp;€ (nicht 100&nbsp;€)"; auch in FAQPage-JSON-LD korrekt |
| I-01 Focus-Ring nicht design-systemkonform | ✓ adressiert | `:469` `.modus-pill:focus-visible`, `:609` `.copy-btn:focus-visible`, `:717` `.reset-btn:focus-visible` — alle `outline: 2px solid var(--color-accent); outline-offset: 2px` |
| I-02 aria-describedby fehlt | ✓ adressiert | alle 5 Inputs haben `aria-describedby={fieldError ? 'err-field' : undefined}` + `id="err-field"` auf `<p role="alert">` |
| I-03 U+2713 ✓ im Copy-Button | ✓ adressiert | Copy-Button zeigt nun `"Kopiert"` / `"Ergebnis kopieren"` ohne Sonderzeichen |
| O-02 Kettenrabatt Doppelrundungs-Pattern | ✓ adressiert | `:104` war `round2((1−f1×f2)×100×100)/100` → jetzt `round2((1−f1×f2)×100)` |

**Neue Regressionen: keine.**

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Details |
|---|---|---|
| Funktion | ✓ | Alle 4 Modi korrekt; Endpreis, Rückpreis, Rückrabatt, Kettenrabatt ✓ |
| Input-Format-Konsistenz (§2.2.1) | ✓ | parseDE DE-Locale korrekt; Round-trip konsistent |
| Security | ✓ | Kein `set:html`/`innerHTML`; kein externer Network-Call; reine Text-Interpolation |
| Performance | ✓ | Bundle 4 KB gzip (15,8 KB raw); Build 60 pages OK; kein Heavy-Dep |
| A11y | ✓ | Focus-Ring auf allen 3 Buttons; aria-describedby auf allen 5 Inputs; aria-live="polite" auf Results |
| UX | ✓ | Copy-Button ohne ✓-Sonderzeichen; Default-State sofort sichtbar; Error-States intakt |
| Content | ✓ | FAQ 80€ korrekt; Word-Count 418 ✓; NBSP ✓; H2-Sequenz ✓; FAQPage-JSON-LD ✓ |
| Dossier-Differenzierung | ✓ | H1 (Live+Kette+Additivbox sichtbar) ✓; H2 (Privacy-Badge vorhanden) ✓ |

---

## Recommendation for CEO

**clean — Tool ist ship-ready.**

Alle Pass-1-Blocker sind gefixt und verifiziert. Alle Improvements aus Pass 1 wurden im
selben Rework-Commit (`60150a8`) mitadressiert, was über das Pflichtprogramm hinausgeht.
Keine Regressionen.

Nächster Schritt: Pass 3 dispatchen (finale Freigabe-Listen-Eintragung) oder direkt
in Deployment-Queue einreihen.
