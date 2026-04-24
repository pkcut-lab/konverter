---
ticket_type: end-review
pass_number: 2
target_slug: kreditrechner
tool_id: loan-calculator
build_commit_sha: 59a417f
dossier_ref: tasks/dossier-output-kreditrechner.md
previous_pass_ref: tasks/end-review-kreditrechner-pass1.md
verdict: clean
reviewed_at: 2026-04-24T22:10:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

All 3 Pass-1 blockers resolved in commit `59a417f`. No regressions introduced.
Build green (`✓ Completed in 15.24s`), dev-server HTTP=200, rendered HTML confirms
all fixes. Tool is **ship-ready**.

---

## Regression-Status (Pass 1 → Pass 2)

| Pass-1 Finding | Status | Beleg |
|----------------|--------|-------|
| B-01 — Comment rendert als Seitentext | ✓ gefixt | `grep "FAQ wird aus" rendered HTML → 0 hits` |
| B-02 — Sondertilgungs-Beispiel 2× zu niedrig | ✓ gefixt | `de.md:78` → `"Einsparung ca. 6.736 € Zinsen, Laufzeit um 36 Monate (3 Jahre) kürzer"` |
| B-03 — FAQ Sondertilgung ~10× falsch | ✓ gefixt | `de.md:28` → `"spart rund 6.700 € Zinsen und verkürzt die Laufzeit um ca. 3 Jahre"` |
| I-01 — Annuitätenformel 1€ zu hoch | — übersprungen (akzeptabel) | `≈`-Symbol erklärt Annäherung, kein Blocker |
| I-02 — .reset-btn ohne :focus-visible | — übersprungen (akzeptabel) | Improvement, nicht blocking |
| I-03 — 3× "unser(es) Rechner(s)" | — übersprungen (akzeptabel) | Improvement |
| I-04 — kein try/catch um computeKreditErgebnis | — übersprungen (akzeptabel) | Improvement |
| I-05 — relatedTools: 1 Eintrag statt ≥2 | — übersprungen (akzeptabel) | Improvement |
| I-06 — howToUse Schritt 4 referenziert SCHUFA-Badge falsch | — übersprungen (akzeptabel) | Improvement |

---

## Smoke-Test (§2.1)

```
npm run build → ✓ Completed in 15.24s (kein Error-Log-Treffer)
               /de/kreditrechner/index.html (+289ms) — emit confirmed
Dev-Server     → http://localhost:4380
curl /de/kreditrechner → HTTP=200 ✓
Layout-Marker  → 39 matches (kreditrechner-tool, aria-live, tilgungsplan, etc.) ✓
```

---

## Regressionscheck B-01 — Comment entfernt

```
grep -c "FAQ wird aus" /rendered_html → 0 ✓
## Häufige Fragen → present, no text following before ## Verwandte Finanz-Tools ✓
```

Die `## Häufige Fragen`-Überschrift ist erhalten, das FAQ-Schema rendert korrekt über
Frontmatter, kein Entwickler-Text auf der Seite.

---

## Regressionscheck B-02 — Sondertilgungs-Beispiel

```
de.md:78 (vorher): "Einsparung ca. 3.000 € Zinsen, Laufzeit kürzer um mehrere Monate"
de.md:78 (jetzt):  "Einsparung ca. 6.736 € Zinsen, Laufzeit um 36 Monate (3 Jahre) kürzer"

Render-Verifikation: grep "6.736" rendered_html → 2 Treffer ✓
Node.js computeKreditErgebnis(100000, 4, 120, 5000) → ersparnis_zinsen=6736.27 ✓
Content = Tool-Output — kein Widerspruch mehr.
```

---

## Regressionscheck B-03 — FAQ Sondertilgung

```
de.md:28 (vorher): "spart rund 600–800 € Zinsen und verkürzt die Laufzeit um mehrere Monate"
de.md:28 (jetzt):  "spart rund 6.700 € Zinsen und verkürzt die Laufzeit um ca. 3 Jahre
                    — der Rechner zeigt das Delta live."

Render-Verifikation: grep "6.700" rendered_html → 2 Treffer ✓
grep "600.800\|600–800" rendered_html → 0 Treffer ✓
FAQ und Body-Text jetzt konsistent (beide: ~6.700 €/6.736 €, 3 Jahre). ✓
```

---

## Blocker

Keine. Alle Pass-1-Blocker gefixt, keine neuen Blocker eingeführt.

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Notes |
|-----------|--------|-------|
| Funktion | ✓ | Keine Code-Änderung — Formeln weiterhin korrekt |
| Input-Format-Konsistenz §2.2.1 | ✓ | parseDE unverändert, Round-Trip PASS |
| Security | ✓ | Keine Code-Änderung |
| Performance | ✓ | Keine Code-Änderung |
| A11y | ~ | .reset-btn :focus-visible noch offen (I-02) — Improvement |
| UX | ✓ | Alle Content-Widersprüche aufgelöst |
| Content | ✓ | B-01/B-02/B-03 alle gefixt; FAQ und Body-Text konsistent |
| Dossier H1 (SCHUFA-Badge) | ~ | I-06 noch offen — Improvement |
| Dossier H2 (ST-Delta) | ✓ | Sondertilgungs-Delta mit korrekten Zahlen belegt |

---

## Recommendation for CEO

**verdict=clean — Tool ist ship-ready. Appendiere in Freigabe-Liste.**

Die 3 Pass-1-Blocker wurden sauber in einem einzigen Commit (`59a417f`) behoben.
Keine neuen Blocker, kein Regressions-Risiko (nur Textänderungen in `de.md`).
Die offenen Improvements (I-01 bis I-06) sind nach dem Go-Live adressierbar.
