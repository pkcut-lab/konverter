---
ticket_type: end-review
pass_number: 3
target_slug: tilgungsplan-rechner
tool_id: tilgungsplan-rechner
build_commit_sha: f2d7a37f40bd829b7b549bbe75ac944d5dd10b75
dossier_ref: tasks/dossiers/_cache/finance/tilgungsplan-rechner.dossier.md
previous_pass_ref: tasks/end-review-tilgungsplan-rechner-pass2.md
verdict: clean
reviewed_at: 2026-04-24T18:45:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

# End-Review Pass 3 — tilgungsplan-rechner

## TL;DR

**clean.** Alle Pass-1- und Pass-2-Befunde vollständig verifiziert. Build exit 0, HTTP 200, Berechnungen formel-korrekt, Content-Werte stimmen mit Tool-Output überein, Security sauber, A11y umfassend, Bundle 6,5 kB gzipped. Vier Dossier-Differenzierungs-Hypothesen sichtbar implementiert. Keine neuen Blocker. Tool ist ship-ready.

---

## §2.1 Build & Boot

```
npm run build → [build] Complete! (exit 0)
60 pages built, Pagefind: 59 pages indexed
curl /de/tilgungsplan-rechner → HTTP=200 Size=291.722 Bytes
```

**PASS.** Kein Content-Schema-Fehler. Alle 3 zuvor überflaufenden metaDescriptions aus Pass 1 innerhalb Limit:

| Tool | Chars | Limit |
|------|-------|-------|
| lorem-ipsum-generator | 159 | ≤160 ✓ |
| millimeter-zu-zoll | 148 | ≤160 ✓ |
| zinseszins-rechner | 152 | ≤160 ✓ |
| tilgungsplan-rechner | 151 | ≤160 ✓ |

---

## §2.2 Funktions-Test

Live-Page HTTP 200 + Node.js-Formel-Verifikation.

### Kalkulations-Verifikation

| Input-Szenario | Tool-Output (Node.js) | Extern bestätigt |
|---|---|---|
| Bsp1: 300k, 3,5%, 2% AT — Monatsrate | 1.375,00 € | 300000 × 5,5% / 12 = 1.375,00 ✓ |
| Bsp1: 300k, 3,5%, 2% AT — Gesamtzinsen | 177.593,08 € | Simulation ✓ |
| Bsp1: 300k, 3,5%, 2% AT — Restschuld 10yr | 228.283,70 € | Formel Restschuld_m ✓ |
| Bsp1: Laufzeit | 348 Monate (29 Jahre) | computeLaufzeit ✓ |
| Bsp2: 180k, 4,2%, 240mo — Monatsrate | 1.109,83 € | K × q^n × i / (q^n - 1) ✓ |
| Bsp2: Gesamtzinsen | 86.358,16 € | Simulation ✓ |
| Bsp3: 300k + 5k/yr Sonder — Einsparung | 63.148,94 € | Delta ohne/mit Sonder ✓ |
| Bsp3: Laufzeitverkürzung | 115 Monate | 348 - 233 = 115 ✓ |

**Content-Werte im Live-HTML korrekt:**
- "rund 228.000 €" im Formel-Abschnitt ✓
- "ca. 178.000 €" Gesamtzinsen Bsp1 ✓
- "ca. 228.000 €" Restschuld Bsp1 ✓
- "ca. 1.110 €" Rate Bsp2 ✓
- "ca. 63.000 €" Sonder-Einsparung Bsp3 ✓
- "115 Monat" Laufzeitverkürzung Bsp3 ✓ (gefunden via grep im HTML)

Alte Falschwerte nicht mehr vorhanden: grep auf "247.000|148.000|18.000.*Zinsen|30 Monate" → 0 Treffer ✓

### §2.2.1 Input-Format-Konsistenz

parseDE-Implementation in `src/lib/tools/parse-de.ts` geprüft (kanonisch, shared across all finance tools):

- Kernlogik: wenn nur Punkte und letztes Segment genau 3 Digits → DE-Tausend; sonst EN-Dezimal. Damit kein `parseFloat("3.000") === 3`-Bug.

| Feld | `300000` | `300.000` | `300,00` | `300.000,50` | Verdict |
|------|---------|----------|---------|-------------|---------|
| Darlehensbetrag | 300000 ✓ | 300000 ✓ | 300 (korrekt DE-Dezimal) ✓ | 300000.5 ✓ | **PASS** |
| Zinssatz | 3.5 ✓ | 3.5 ✓ | 3.5 (Komma-Dezimal) ✓ | — | **PASS** |
| Anfangstilgung | 2.0 ✓ | — | 2.0 ✓ | — | **PASS** |

**Output→Input Round-Trip:** `formatEuro(228283.7)` → `"228.283,70"` → `parseDE("228.283,70")` → `228283.7` ✓

Anzeige-Format ("228.283,70 €") wird als Input korrekt akzeptiert. Kein Silent-Format-Trap.

**Placeholder-Ehrlichkeit:** Placeholder "z.B. 300.000" → parseDE("300.000") = 300000 ✓. Placeholder ist Versprechen — eingehalten.

---

## §2.3 Dossier-Differenzierungs-Check

Alle 4 Differenzierungs-Hypothesen aus §9 implementiert und UI-sichtbar:

| Hypothese | Status | Beleg |
|---|---|---|
| H1 — Privacy-First-Badge | ✓ | `.privacy-badge` mit "Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser" — verifiziert im HTML (1 Treffer) |
| H2 — Anschlussfinanzierungs-Mini-Rechner | ✓ | `.anschluss-section` mit `#inp-anschluss-zinssatz` — erscheint wenn Restschuld > 0; verifiziert im HTML (2 Treffer inp-anschluss) |
| H3 — Sondertilgung-Effekt-Zusammenfassung | ✓ | `.sondertilgung-box` mit "Du sparst X € Zinsen und bist Y Monate früher schuldenfrei" — verifiziert im HTML (3 Treffer) |
| H4 — Tilgungsparadoxon-Warnung | ✓ | `.warning-box` mit `result.paradoxWarning` (AT < 1,5% UND Zins > 3%) — verifiziert im HTML (2 Treffer) |

---

## §2.4 Security

- **XSS:** kein `innerHTML`, kein `{@html}`, kein `set:html` in Komponente oder Logic — grep-Ergebnis: 0 Treffer. User-Input läuft durch `parseDE()→number→formatEuro()`, keine Raw-HTML-Einfügung.
- **Externe Network-Calls:** kein `fetch()`, kein `XMLHttpRequest`, kein `WebSocket`, kein `import()` in Component oder `tilgungsplan-rechner.ts` — grep: 0 Treffer.
- **Inline-Handler:** `onclick` Svelte-Attribut-Syntax (kein raw HTML `onclick="..."`), CSP-kompatibel.
- **Prototype-Pollution:** kein JSON-Parser im Tool — nicht anwendbar.

**Security: PASS ✓**

---

## §2.5 Performance

- **JS-Bundle:** `TilgungsplanRechnerTool.BDnas531.js` — 22.266 B raw → **6.478 B gzipped** (weit unter 150 kB Limit) ✓
- **Lazy-Loading:** nicht erforderlich (kein Heavy-Dep) ✓
- **Reaktivität:** `$derived`-basiert, O(n) Simulation (MAX_MONTHS=600), < 1 ms pro Keystroke — kein messbares Perf-Problem
- **Debounce:** fehlt (I-03 aus Pass 1, weiterhin offenes Improvement — kein echtes Perf-Problem bei < 1 ms Simulation)

**Performance: PASS ✓** (I-03 bleibt Backlog-Improvement)

---

## §2.6 A11y

- Alle Inputs haben explizites `<label for="...">` ✓
- `aria-invalid` auf allen Eingabefeldern bei Fehler ✓
- `aria-describedby` → Error-Paragraph bei Fehler ✓
- `role="alert"` auf Field-Error-Paragraphen ✓
- `aria-live="polite"` auf Summary-Card-Values — verifiziert im HTML (5 Treffer) ✓
- `role="region"` + `aria-label` auf Tool + Results-Container ✓
- `role="group"` + `aria-label` auf Modus-Pills ✓
- `aria-pressed` auf Mode-Buttons (3 Modus-Pills) ✓
- `scope="col"` auf Tabellen-Header — verifiziert im HTML (5 Treffer) ✓
- `scope="row"` auf Jahr-Zellen der Tabelle (th scope="row") ✓
- `tabindex="0"` auf `.table-wrap` (horizontales Scrollen per Keyboard) ✓
- Focus-Ring: `outline: 2px solid var(--color-accent)` auf allen interaktiven Elementen ✓
- `prefers-reduced-motion` Media Query — Komponente :1093 ✓
- Anschluss-Input (`#inp-anschluss-zinssatz`) hat `aria-label` aber kein `aria-invalid`/Error-Feedback (I-02 aus Pass 1 — Improvement, kein Blocker)

**A11y: PASS ✓** (I-02 bleibt Backlog-Improvement)

---

## §2.7 UX

- **Empty-State:** Felder sind vorbelegt (300.000 / 3,50 / 2,00) → Tilgungsplan erscheint sofort ohne User-Eingabe. Klare Onboarding-Hilfe ✓
- **Error-States:** Jedes Eingabefeld hat eigene Fehlermeldung (z.B. "Mindestbetrag: 1.000 €", "Rate zu gering — Monatszinsen betragen X €"). Deutsche Sprache, kein technisches Kauderwelsch ✓
- **Copy-Button:** mit State-Feedback "Kopiert" (1,5s Timeout) ✓
- **Reset-Button:** setzt alle Felder auf Defaults zurück ✓
- **Disclaimer:** vorhanden ("Diese Berechnung dient ausschließlich zur unverbindlichen Information...") ✓
- **Placeholder-Ehrlichkeit:** "z.B. 300.000" → parseDE akzeptiert es korrekt ✓
- **Copy-Round-Trip:** Copy-Output enthält "300.000,00 €"-Format → parseDE akzeptiert es ✓
- **Mobile:** Layout nutzt `grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))` → fluid responsive ✓
- **Progressive Disclosure:** Sondertilgung als optional-markiertes Feld; Anschluss-Rechner erscheint nur wenn Restschuld > 0 ✓
- **showMonths dead state** (I-01 aus Pass 1 — kein Toggle-Button, Jahresansicht only): weiterhin offen, Backlog-Improvement

**UX: PASS ✓** (I-01 Backlog, I-04 Backlog)

---

## §2.8 Content-Audit

- **Word-Count Body:** 436 Wörter (Minimum 300 ✓)
- **H2-Pattern:** Pattern C (Free-Form für Calculator) — endet mit "Verwandte Finanz-Tools" ✓, enthält "Häufige Fragen" ✓
- **FAQ-Korrektheit:** 5 FAQ-Paare im Frontmatter (4–6 Range ✓). Inhalte fachlich korrekt (Annuitätenformel, Anfangstilgungsempfehlung 2%, Tilgungsparadoxon-Erklärung, Sondertilgung-Mechanik) ✓
- **NBSP:** kein "[0-9] %" ohne NBSP gefunden ✓
- **Letztes H2:** "Verwandte Finanz-Tools" mit 3 validen internen Links (/de/mehrwertsteuer-rechner, /de/zeitzonen-rechner, /de/zeichenzaehler) — alle 3 im HTML verifiziert ✓
- **headingHtml:** `<em>Tilgungsplan</em> berechnen` — 1 em auf Ziel-Substantiv (§13.5 Regel 2) ✓
- **metaDescription:** 151 Zeichen (140–160 Range) ✓

**Content: PASS ✓**

---

## Regression-Status (Pass 2 → Pass 3)

| Pass-Finding | Status | Beleg |
|---|---|---|
| **B-01** — BUILD: metaDescription-Overflow (3 Tools) | ✓ gefixt, stabil | lorem-ipsum 159, millimeter-zu-zoll 148, zinseszins 152 Chars — Build exit 0 |
| **B-02** — CONTENT: 6 falsche Beispielwerte | ✓ gefixt, stabil | Live-HTML: 228.000 ✓, 178.000 ✓, 1.110 ✓, 63.000 ✓, 115 Monate ✓; grep auf Falschwerte → 0 Treffer |
| **I-01** — UX: showMonths dead state | — übersprungen (Backlog) | — |
| **I-02** — UX: Anschluss-Input ohne Error-Feedback | — übersprungen (Backlog) | — |
| **I-03** — PERF: kein Debounce | — übersprungen (kein echtes Perf-Problem) | — |
| **I-04** — UX: Modus-Wechsel ohne Vorschlag | — übersprungen (Backlog) | — |

**Keine Regressionen** seit Pass 2. Commits 0bd5ec7, d241ca4, 287dbd5 (nach f2d7a37) betreffen ausschließlich Tokens-Darkmode, CEO-Loop-Fixes und Paperclip-Docs — kein Tilgungsplan-Rechner-Code berührt.

---

## Blocker

**Keine.**

---

## Improvements (nicht ship-blocking, Backlog)

- **I-01:** Monatsansicht-Toggle fehlt (showMonths = dead state). Jahrestilgungsplan vorhanden.
- **I-02:** Anschluss-Zinssatz-Input ohne aria-invalid/Fehlermeldung bei ungültigem Wert.
- **I-03:** Kein Debounce auf $derived-Berechnung (< 1 ms, kein echtes Problem).
- **I-04:** Modus-Wechsel ohne Vorschlagswert im neuen Pflichtfeld.

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Findings |
|---|---|---|
| Build/Boot | ✓ | exit 0, HTTP 200, alle metaDescriptions ≤160 Chars |
| Funktion (Kernrechnung) | ✓ | 8 Szenarien formel-verifiziert; alle Content-Werte korrekt |
| Input-Format-Konsistenz (§2.2.1) | ✓ | parseDE korrekt für alle DE-Varianten; Round-Trip OK |
| Security | ✓ | kein XSS, kein Network-Call, kein innerHTML |
| Performance | ✓ | 6,5 kB gzipped (< 150 kB), < 1 ms Berechnung |
| A11y | ✓ | Umfassend; I-02 Anschluss-Input ohne Error-State (Backlog) |
| UX | ✓ | Default-Werte, Fehler-Feedback, Copy/Reset; I-01/I-04 Backlog |
| Content | ✓ | 436 Wörter, Pattern-C, korrekte Werte, NBSP-konform |
| Dossier-Differenzierung | ✓ | H1 Privacy ✓, H2 Anschluss ✓, H3 Sondertilgung ✓, H4 Paradoxon ✓ |

---

## Recommendation for CEO

**verdict: clean** — Tool ist ship-ready. Bitte in deploy-queue aufnehmen.

Keine Blocker. Alle Pass-1- und Pass-2-Blocker vollständig gefixt und durch unabhängigen Pass-3-Test verifiziert. Die 4 offenen Improvements (I-01 bis I-04) sind nicht ship-blocking und können als separate Backlog-Tickets nachgezogen werden.

**Freigabe-Liste:** tilgungsplan-rechner wurde an `docs/paperclip/freigabe-liste.md` angehängt (per End-Reviewer-Prozedur §5).
