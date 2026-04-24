---
ticket_type: end-review
pass_number: 3
target_slug: brutto-netto-rechner
tool_id: gross-net-calculator
build_commit_sha: cce3dd9
dossier_ref: tasks/dossiers/_cache/finance/brutto-netto-rechner.dossier.md
previous_pass_ref: tasks/end-review-brutto-netto-rechner-pass2.md
verdict: blockers_after_3_passes
reviewed_at: 2026-04-24T22:20:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

# End-Review Pass 3 — brutto-netto-rechner

## TL;DR

**blockers_after_3_passes.** Pass-2-Blocker B-01 und B-02 sind korrekt gefixt
(commit d26be2e). Kernrechnung, Security, Performance, A11y, UX und Dossier-
Differenzierung alle PASS. Ein neuer Blocker B-03 wurde gefunden: das erste
FAQ-Answer gibt "ca. 2.270–2.320 € Netto" für 3.500 € SK I NRW an — das Tool
zeigt tatsächlich **2.140,70 €**. Die Differenz von ~130 € ist signifikant und
wurde in Pass 1 und Pass 2 nicht erkannt (FAQ wurde nur in Pass 1 als
Kirchensteuer-Check geprüft, nicht numerisch verifi­ziert). Eskalation an User
erforderlich.

---

## §2.1 Build & Boot

```
npm run build
→ ✓ Completed in 2.25s — Complete!
→ 63 pages built, kein Error, kein Warning
```

Dev-Server (Port 4341 — 4321 bereits belegt): HTTP=200 für
`/de/brutto-netto-rechner`. Layout-Marker `bn-tool`, `art-bar`, `summary-grid`,
`breakdown` im gerenderten HTML vorhanden.

**Build: PASS** — commit cce3dd9 build-clean.

---

## §2.2 Funktions-Test

Vollständige Node.js-Simulation mit inline-replizierter Logic (parseDE +
brutto-netto-rechner.ts Kernfunktionen). Alle 5 Test-Inputs verifiziert:

| # | Input | Params | Tool-Output | Extern-Verif. | Verdict |
|---|-------|--------|-------------|---------------|---------|
| T1 | 3500 | SK I, NW, mitKind | Netto 2.140,70 € | 3500−1359,30=2140,70 ✓ | ✓ PASS |
| T2 | 3500 | SK III, NW, mitKind | Netto 2.476,62 €, LSt 308,50 € | Splitting: eStTarif(20367)×2=3702/12=308,50 ✓ | ✓ PASS |
| T3 | 1200 | Midijob, SK I, NW | Netto 992,78 € | svBasis=967,66, RV=89,99, netto=992,78 ✓ | ✓ PASS |
| T4 | 603 | Vollzeit, SK I | Netto 603,00 € (Minijob) | brutto ≤ 603 → AN-SV=0 ✓ | ✓ PASS |
| T5 | 9000 | SK I, NW, BBG-Grenze | RV 785,85 € | 8450×9,3%=785,85 (BBG cap) ✓ | ✓ PASS |
| T-Inv | `abc` | — | parseDE→NaN → Error-UI | kein Absturz, Inline-Fehler ✓ | ✓ PASS |

### Input-Format-Konsistenz (§2.2.1)

| Feld | `3500` | `3.500` | `3,00` | `3.000,50` | Verdict |
|------|--------|---------|--------|------------|---------|
| Bruttogehalt | 3500 | 3500 (DE-Tausender) | 3 (Dezimal-Komma) | 3000,5 | ✓ konsistent |

- `"3500"` == `"3.500"` → identischer Output ✓
- `"3,00"` → parseDE = 3 (DE-Dezimal) ✓ (andere Bedeutung, korrekt differentiert)
- `"3.000,50"` → 3000,5 ✓
- **Round-Trip:** `"3.500,00"` → parseDE = 3500 ✓; `"2.140,70"` → parseDE = 2140,7 ✓
- Anzeige-Format (`formatEuro`) ist als Input akzeptiert — keine Silent-Trap ✓

**§2.2.1: PASS**

---

## §2.3 Dossier §9 Differenzierungs-Check

| Hypothese | Beschreibung | Implementiert? | Beleg |
|-----------|-------------|----------------|-------|
| H1 Transparenz-Layer | Formel-Erklärung pro Abzugsposten | ✓ | `.breakdown__title` + `.bd-cell--formula` Spalte zeigt z.B. "9,30 % × 3.500,00 € (BBG: 8.450 €)" |
| H2 Privacy-Kontrast | "Berechnet nur im Browser" | ✓ | `.privacy-badge` + Intro-Text "kein Server-Upload, kein Tracking, keine Werbecookies"; 0 externe Requests |
| H3 Beschäftigungsart-Navigation | Vollzeit/Midijob/Minijob als erstes Feld | ✓ | `.art-pills` mit `aria-pressed`, Vollzeit/Midijob/Minijob am Seitenanfang |

**Dossier §9: H1 ✓, H2 ✓, H3 ✓ — alle 3 Hypothesen implementiert.**

---

## §2.4 Security-Review

- **XSS:** `grep -n "innerHTML\|set:html\|dangerouslySet"` → 0 Treffer in
  `BruttoNettoRechnerTool.svelte`. User-Input fließt nur durch `parseDE()` →
  `Number` → `formatEuro()` → Svelte Text-Node. Kein HTML-Rendering von
  User-Input. ✓
- **Externe Network-Calls:** `grep "fetch\|XMLHttpRequest\|import("` → 0 Treffer
  in Component und Tool-Logic. ✓
- **XSS-Input:** `parseDE("<script>alert(1)</script>")` = 1 (extrahiert Zahl).
  Kein XSS-Risiko da keine innerHTML-Ausgabe — reine Zahl geht in formatEuro().
  O-02 aus Pass 1 bestätigt. ✓
- **Inline-Event-Handler:** Keine `onclick="..."` Attribute. Svelte-Syntax
  `onclick={() => {}}` korrekt. ✓

**Security: PASS**

---

## §2.5 Performance-Review

- **Bundle-Size:** `BruttoNettoRechnerTool.BbeeUBda.js` = 20K unkomprimiert,
  **6.2K gzipped** — weit unter 150K Limit ✓
- **Keine Heavy-Deps:** Reines TS-Math, kein externer Import, kein ML-Modell ✓
- **Reaktivität:** O(1) synchrone Berechnung < 0,5ms. Debounce technisch nicht
  nötig (Perf-neutral). I-03 aus Pass 1 bleibt als Improvement. ✓
- **Build-Warning:** "(!) brutto-netto-rechner.ts dynamically imported by
  tool-registry but also statically imported by BruttoNettoRechnerTool.svelte"
  — bekannte Astro-Warnung für static+dynamic Mix. Kein Funktions-Impact. ✓

**Performance: PASS**

---

## §2.6 A11y-Review

- **Labels:** `<label for="inp-brutto">` + `<input id="inp-brutto">` ✓;
  `<label for="inp-sk">` + `<select id="inp-sk">` ✓; `<label for="inp-bl">`
  + `<select id="inp-bl">` ✓
- **aria-invalid:** auf Input-Feldern bei Fehler gesetzt ✓
- **aria-pressed:** auf allen Toggle-Buttons (Kirchensteuer, Kinderlos, PKV) ✓
- **role="group":** auf `.toggles-row` + `.art-pills` ✓
- **aria-live="polite":** auf `.results` — Screen-Reader kündigt Netto-Änderung
  bei jeder Keystroke an ✓
- **ARIA-Table:** `role="table/rowgroup/row/columnheader/cell"` vollständig ✓
- **Focus-Ring:** `.input-field__wrap:focus-within` → `box-shadow: 0 0 0 2px
  var(--color-focus-ring, var(--color-accent))` ✓
- **prefers-reduced-motion:** alle Transitions disabled bei reduce ✓
- **I-01 (aria-describedby):** weiterhin offen (Improvement, nicht bindend)

**A11y: PASS (I-01 Improvement bleibt offen)**

---

## §2.7 UX-Review

- **Empty-State:** "Bruttogehalt eingeben — Netto und Abzüge erscheinen sofort." ✓
- **Pre-filled:** `bruttoStr = '3.500'` — Tool zeigt sofort Ergebnis on load ✓
- **Fehler-Meldungen:** "Bitte einen gültigen Betrag eingeben." (bei NaN),
  "Maximalbetrag: 100.000 €" — DE-Sprache, verständlich ✓
- **Progressive Disclosure:** PKV-Beitrag-Feld nur sichtbar wenn PKV an ✓
- **Mobile:** `grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))`
  + Media-Query für Formel-Spalte ✓
- **Copy-Button:** nicht vorhanden (kein Blocker — nicht im Dossier als Pflicht)
- **Microcopy:** kein KI-Generic-Text wie "Entdecke die Welt..." — sachlich,
  präzise, deutsch ✓
- **Disclaimer:** ±10–20 € systembedingte Abweichung erklärt ✓
- **Privacy-Badge:** "Kein Server-Upload · Kein Tracking · Alle Berechnungen
  lokal im Browser" ✓

**UX: PASS**

---

## §2.8 Content-Audit

- **Word-Count:** 1045 Wörter ≥ 300 ✓
- **H2-Pattern:** Was macht dieser Rechner → Berechnungsformeln →
  Anwendungsbeispiele → Häufige Einsatzgebiete → Häufige Fragen →
  Verwandte Finanz-Tools ✓
- **Letzte H2:** `## Verwandte Finanz-Tools` mit 3 internen Links ✓
- **Verwandte-Links:** `/de/stundenlohn-jahresgehalt`, `/de/kreditrechner`,
  `/de/mehrwertsteuer-rechner` — alle 3 Ziele im Build vorhanden ✓
- **NBSP:** 31 NBSP-Vorkommen; kein ungeschütztes Zahl-Einheit-Paar im
  Fließtext gefunden ✓
- **headingHtml:** `Brutto-<em>Netto</em> berechnen` — 1 `<em>`, umschließt
  Ziel-Substantiv "Netto" ✓
- **FAQ-Korrektheit → BLOCKER B-03 (neu):** Erste FAQ-Antwort numerisch falsch
  (Details unten)

**Content: ✗ (B-03 neu)**

---

## Blocker (ship-blocking)

### B-03 — CONTENT: FAQ Q1 — Netto-Beispielwert 130 € zu hoch

**Problem:** `src/content/tools/brutto-netto-rechner/de.md` Zeile 18:

```yaml
a: "Bei Steuerklasse I, NRW, ohne Kirchensteuer und GKV bleiben bei 3.500 € Brutto
   ca. 2.270–2.320 € Netto."
```

**Beleg (Node.js-Verifikation — T1):**

```
berechne(3500, SK=1, bl='NW', kist=false, 'vollzeit', pkv=false, beitrag=0, kinderlos=false)
→ rv: 325,50  kv: 280,88  pv: 63,00  av: 45,50  lst: 644,42  soli: 0  kist: 0
→ gesamt: 1.359,30 €
→ netto: 2.140,70 €
```

Tool-Anzeige: **2.140,70 €** — FAQ-Behauptung: ca. **2.270–2.320 €**.
Differenz: **ca. 130–180 €** (~6–8 % des Nettos).

Externe Verifizierung: Lohnsteuer §32a: zvE = 40.734 → Zone 2: 7.733 € Jahres-LSt / 12
= 644,42 €/Monat. SV-Summe = 714,88 €. Gesamt = 1.359,30 €. Netto = **2.140,70 €**.
Alle Rechnungen stimmen mit dem Tool überein — die FAQ-Aussage ist falsch.

Erschöpfte Alternativ-Interpretationen:
- "ohne Kirchensteuer und GKV" als PKV-Szenario (beitrag=0) → Netto 2.421 € (auch nicht 2270–2320)
- Basis-KV ohne Zusatzbeitrag (7,30 %) → Netto 2.166 € (auch nicht 2270–2320)
- Kinderlos-Zuschlag PV (2,40 %) → Netto 2.119 € (auch nicht 2270–2320)
- Keine der realistischen Konfigurationen ergibt 2.270–2.320 €.

**Impact:** User liest FAQ → erwartet ~2.300 € → öffnet Tool → sieht 2.140 €
→ Vertrauenslücke von 160 €. Besonders kritisch weil das Tool unmittelbar danach
geöffnet wird. Das ist exakt der Accuracy-Pain aus Dossier §4 ("Nutzer vertrauen
dem Rechner als exakten Gehaltszettel-Ersatz") — aber umgekehrt: der Content
verspricht zu viel.

**Fix:** `src/content/tools/brutto-netto-rechner/de.md` Zeile 18, FAQ Q1 Answer:

```yaml
a: "Bei Steuerklasse I, NRW, ohne Kirchensteuer bleiben bei 3.500 € Brutto
   ca. 2.141 € Netto (mit Kind) bzw. ca. 2.120 € (ohne Kind, kinderloser
   Pflegeversicherungs-Zuschlag). Der genaue Betrag hängt von Bundesland,
   Steuerklasse und Krankenkassenzusatzbeitrag ab — nutze den Rechner für
   deine individuellen Werte."
```

Oder kürzer:
```yaml
a: "Bei Steuerklasse I, NRW, ohne Kirchensteuer bleiben bei 3.500 € Brutto
   ca. 2.141 € Netto. Der genaue Betrag hängt von Bundesland, Steuerklasse
   und Krankenkassenzusatzbeitrag ab — nutze den Rechner für deine
   individuellen Werte."
```

---

## Improvements (Carry-over aus Pass 1 + 2, nicht ship-blocking)

### I-01 — A11y: `aria-describedby` fehlt auf Input-Feldern
Nicht adressiert (akzeptabel — war nie bindend).

### I-02 — CONTENT: NBSP fehlt in Formel-Code-Blocks
Nicht adressiert (akzeptabel).

### I-03 — PERF: Kein Debounce
Nicht adressiert (akzeptabel, da < 0,5 ms Rechnung).

---

## Observations

- **O-01:** `relatedTools: []` leer — 3 verwandte Links nur im Markdown-Body.
  Unverändert aus Pass 1.
- **O-02:** `parseDE("<script>alert(1)</script>")` = 1 — kein XSS-Risiko.
  Bestätigt Pass 1.

---

## §2.9 Regression-Check (Pass 2 Blocker)

| Pass-2-Finding | Status | Beleg |
|----------------|--------|-------|
| B-01 (Bsp.2 SK III — LSt/Netto/Differenz falsch) | ✓ **gefixt** (commit d26be2e) | Zeile 85: "ca. 308 €" / "ca. 2.477 €" / "rund 336 € mehr" — korrekt ✓ |
| B-02 (Bsp.3 Midijob — SV-Basis/RV/Netto falsch) | ✓ **gefixt** (commit d26be2e) | Zeile 89: "SV-Basis ≈ 968 €" / "90 €" / "ca. 993 €" — korrekt ✓ |
| I-01 (aria-describedby) | — übersprungen (nicht bindend) | — |
| I-02 (NBSP Code-Blocks) | — übersprungen (nicht bindend) | — |
| I-03 (kein Debounce) | — übersprungen (nicht bindend) | — |

Pass-2-Blocker B-01 und B-02 vollständig behoben. Kein Regression durch d26be2e.

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Findings |
|-----------|--------|----------|
| Build/Boot | ✓ | 63 Seiten, Complete!, HTTP 200 |
| Funktion (Kernrechnung) | ✓ | 5/5 Tests PASS, BBG-Cap korrekt |
| Input-Format-Konsistenz (§2.2.1) | ✓ | parseDE alle DE-Varianten; Round-Trip OK |
| Security | ✓ | 0 innerHTML, 0 externe Calls, kein Inline-onclick |
| Performance | ✓ | 6,2K gzipped, pure O(1) Math |
| A11y | ✓ | aria-live, ARIA-Table, aria-pressed, Focus-Ring; I-01 Improvement offen |
| UX | ✓ | Empty-State, Progressive Disclosure, Disclaimer, Privacy-Badge |
| Content | ✗ | B-03 FAQ Q1 Netto-Wert falsch (+130–180 €) |
| Dossier-Differenzierung | ✓ | H1 ✓ (Transparenz-Layer), H2 ✓ (Privacy), H3 ✓ (Art-Pills) |

---

## Recommendation for CEO — Eskalation (Pass 3 blocked)

**Drei Passes, ein neuer Blocker — struktureller Kontext:**

B-01 und B-02 (Anwendungsbeispiele) wurden in Pass 3 korrekt gefixt. Der neue
B-03 (FAQ Q1 Netto-Wert) ist ein isolierter Content-Fehler: **eine einzige Zahl
in einer FAQ-Antwort** ist um ~130 € zu hoch. Der Fehler war in Pass 1 und Pass 2
nicht aufgefallen, weil die FAQ-Antworten nur partiell geprüft wurden (Kirchensteuer-
Satz war korrekt, Netto-Wert nicht numerisch verifiziert).

**Empfehlung:** Statt Pass 4 zu dispatchen, empfehle ich dem User eine
**Direkt-Freigabe nach Spot-Fix**:

1. Einzeiler-Fix in `src/content/tools/brutto-netto-rechner/de.md` Zeile 18:
   - „ca. 2.270–2.320 €" → „ca. 2.141 €" (oder mit kinderlos-Variante)
2. Commit: `fix(brutto-netto-rechner): FAQ Q1 Netto-Wert korrigiert 2270-2320→2141`
3. End-Reviewer kann diesen Single-Fix per Stichproben-Verifikation bestätigen
   ohne vollständigen Pass 4 (da alle anderen Dimensionen PASS).

**Alternativ:** Pass 4 dispatchen — erwartetes Ergebnis: `clean` nach diesem
Einzeiler.

**Fix-Scope für Builder (2 Minuten):**
```diff
- a: "Bei Steuerklasse I, NRW, ohne Kirchensteuer und GKV bleiben bei 3.500 € Brutto
-    ca. 2.270–2.320 € Netto. Der genaue Betrag hängt von Bundesland, Steuerklasse
-    und Krankenkassenzusatzbeitrag ab — nutze den Rechner für deine individuellen Werte."
+ a: "Bei Steuerklasse I, NRW, ohne Kirchensteuer bleiben bei 3.500 € Brutto
+    ca. 2.141 € Netto. Der genaue Betrag hängt von Bundesland, Steuerklasse
+    und Krankenkassenzusatzbeitrag ab — nutze den Rechner für deine individuellen Werte."
```

Alle anderen Dimensionen (Logic ✓, Security ✓, A11y ✓, Performance ✓, UX ✓,
Dossier §9 ✓) benötigen keinen weiteren Fix.
