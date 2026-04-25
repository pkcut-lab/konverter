---
ticket_type: end-review
pass_number: 3
target_slug: zinsrechner
tool_id: interest-calculator
build_commit_sha: c1e6549
dossier_ref: tasks/dossiers/_cache/finance/zinsrechner.dossier.md
previous_pass_ref: tasks/end-review-zinsrechner-pass2.md
verdict: clean
reviewed_at: 2026-04-25T10:45:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

**verdict=clean.** Vollständige Triple-Pass-Rubric §2.1–§2.9 absolviert. Alle 4 B-01-Werte aus Pass 1 numerisch bestätigt (kein Regression). Build produziert korrektes HTML, SSR-Output zeigt Default-Ergebnisse korrekt. KON-177/KON-210 Disclaimer- und Datenschutz-Fixes vorhanden. Keine neuen Blocker. I-01/I-02 bleiben Improvements (non-blocking, seit Pass 1 dokumentiert).

---

## §2.1 Smoke-Test

- **Build:** `npm run build` → Kompilierung abgeschlossen (HTML-Rendering ✓, Pagefind ✓). Note: `@vite-pwa/astro-integration` hook läuft async nach dem HTML-Output — eine site-weite bekannte Eigenheit dieses Build-Environments, kein zinsrechner-spezifisches Problem.
- **HTML-Datei:** `dist/de/zinsrechner/index.html` vorhanden ✓
- **DOM-Marker-Count:**

| Marker | Count | Status |
|---|---|---|
| `zinsrechner-tool` | 1 | ✓ |
| `results-grid` | 1 | ✓ |
| `result-card` | 16 | ✓ (3 Ergebnis-Cards × SSR-Tokens) |
| `privacy-badge` | 1 | ✓ |
| `aria-live` | 1 | ✓ |
| `aria-label` | 21 | ✓ |

- **headingHtml:** `<em>Zinsen</em> berechnen` — 1 `<em>` auf Substantiv ✓
- **SSR-Output:** Default-Ergebnis (10.000 €, 3 %, 10 Jahre) sofort in HTML sichtbar, kein leerer State ✓

---

## §2.2 Funktions-Test

Manuell via Node-Replikation der `computeZins()`-Logik (identisch mit `src/lib/tools/zinsrechner.ts`):

| Input | Tool-Ergebnis | Extern verifiziert | Status |
|---|---|---|---|
| k0=10.000, p=3%, n=10 | kn=13.439,16, steuer=643,33, knNetto=12.795,83, knReal=10.498,65 | 10000×1,03^10=13439,16; Fisher r_real=(1,03/1,025)−1=0,004878; 10000×1,004878^10=10498,65 | ✓ |
| k0=20.000, p=−0,5%, n=2 | kn=19.800,50, Kapitalverlust=199,50 | 20000×0,995^2=20000×0,990025=19800,50 | ✓ |
| k0=5.000, p=4%, n=1 | zinsen=200, steuer=0 (unter 1.000 € Freibetrag), knNetto=5.200 | 5000×0,04=200 <1000 → steuerfrei | ✓ |
| k0=0, p=5%, n=10 | kn=0, zinsen=0 | 0×anything=0 | ✓ |
| k0=10.000, p=0%, n=10 | kn=10.000, zinsen=0 | 10000×1^10=10000 | ✓ |
| Invalid: k0=−100 | Error „Anfangskapital muss ≥ 0 € sein." | Korrekte Ablehnung | ✓ |

**SSR-Verifikation (direktes HTML-Output):**

Aus `dist/de/zinsrechner/index.html` (SSR-gerenderter Svelte-State mit Default-Werten):
- `Brutto-Endkapital: 13.439,16 €` ✓
- `Steuer: −643,33 €` ✓
- `Netto-Endkapital: 12.795,83 €` ✓
- `Real-Endkapital: 10.498,65 €` ✓
- `Realrendite: 0,49 % p.a. (Fisher)` ✓
- `Effektivzinssatz: 3,0000 % p.a.` ✓

### §2.2.1 Input-Format-Konsistenz (DE-Locale)

Alle 6 Felder nutzen `parseDE()` (kein raw `parseFloat` — verifiziert via Source-Lesen `ZinsrechnerTool.svelte:27–32`).

| Feld | `10000` | `10.000` | `10,00` | `10.000,50` | Anzeige-Round-Trip |
|---|---|---|---|---|---|
| Anfangskapital | 10000 ✓ | 10000 ✓ | 10 (Dezimal) ✓ | 10000.5 ✓ | `13.439,16` → parseDE = 13439.16 ✓ |
| Zinssatz | — | — | `3,00`=3 ✓ | — | `3,0000 %` → parseDE = 3 ✓ |
| Steuersatz | — | — | `26,375`=26.375 ✓ | — | ✓ |
| Freibetrag | 1000 ✓ | `1.000`=1000 ✓ | — | — | ✓ |

**Anzeige-Format → Input-Round-Trip:** Tool zeigt `13.439,16 €` → parseDE(`13.439,16`) = 13439.16 → selbes Ergebnis ✓

**Placeholder-Ehrlichkeit:** Placeholder `z.B. 10.000` → parseDE(`10.000`) = 10000 ✓ (kein Silent-Trap)

**§2.2.1 Status: PASS** — Kein Locale-Bug, kein Format-Mismatch.

---

## §2.3 Dossier-Differenzierungs-Check

| Hypothese | Status | Beleg (HTML) |
|---|---|---|
| **H1** Drei Ergebniszeilen (Brutto/Netto/Real) im Default-UI | ✓ | 3 `result-card`s in `results-grid`; SSR rendert alle 3 Werte ohne Toggle |
| **H2** Solve-for-Modus mit Sparplan | ✗ | Nur Vorwärts-Berechnung — I-02, Phase-1-deferred |
| **H3** Privacy-First beweisbar | ✓ | `privacy-badge`: „Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser"; kein `fetch`/XHR/sendBeacon in Komponente; `aside.tool-aside__privacy` Datenschutz-Sektion vorhanden |

---

## §2.4 Security-Review

- **XSS via Input:** kein `innerHTML`/`set:html` in `ZinsrechnerTool.svelte` oder `zinsrechner.ts` — Svelte rendert ausschließlich via textContent ✓
- **Grep auf `innerHTML`/`set:html`:** 0 Treffer in Komponente und Logic-Datei ✓
- **Externe Netzwerk-Calls:** kein `fetch`/`XMLHttpRequest`/`sendBeacon`/`import.*https` in Tool-Dateien ✓
- **Prototype-Pollution:** kein JSON.parse aus User-Input ✓
- **Inline Event-Handlers:** `onclick={handleReset}` via Svelte-Binding → kein HTML-Attribut-Handler → kein CSP-Verstoß ✓

**Security: PASS**

---

## §2.5 Performance-Review

- **JS-Chunk** `ZinsrechnerTool.gTGSJIHc.js`: ~3,2 KB gzipped (aus Pass 2, identischer Build-Commit `c1e6549`, kein Code-Change) ✓ (< 150 KB Limit)
- **Keine Heavy-Deps:** kein `@huggingface`, kein dynamic-import nötig (synchroner Rechner) ✓
- **Reaktivität:** `$derived()` + `$derived.by()` — synchron, kein Debounce nötig ✓
- **Binary-State:** kein `Uint8Array`/`Blob`/`Canvas` → kein `$state.raw`-Issue ✓
- **Lighthouse:** 95 Performance (stabil, kein Code-Change seit Pass 2) ✓

**Performance: PASS**

---

## §2.6 A11y-Review

Aus SSR-Output `dist/de/zinsrechner/index.html` verifiziert:

- **Labels:** alle 6 Inputs: `<label for="inp-k0">`, `<label for="inp-zinssatz">`, `<label for="inp-laufzeit">`, `<label for="inp-steuersatz">`, `<label for="inp-freibetrag">`, `<label for="inp-inflation">` → passende `id=`-Attribute auf Inputs ✓
- **aria-invalid:** `aria-invalid="false"` auf allen Inputs im Default-State ✓; wird auf `true` gesetzt bei Fehler (Source-Code `ZinsrechnerTool.svelte:114`) ✓
- **aria-live="polite":** auf `.results` Container ✓ (HTML bestätigt)
- **inputmode="decimal":** alle 6 numerischen Felder ✓
- **Touch-Target:** `min-height: 2.75rem` (44px) auf `.input-field__wrap` und `.reset-btn` ✓ (ZinsrechnerTool.svelte:386, 525)
- **Focus-Ring `.input-field__wrap:focus-within`:** `box-shadow: 0 0 0 2px var(--color-focus-ring)` ✓ (line 391)
- **I-01 offen:** `.reset-btn` hat nur `:hover`-State, kein `:focus-visible` mit `--color-focus-ring` (UA-Default-Outline vorhanden, minimale WCAG-Konformität, non-blocking)

**A11y: PASS**

---

## §2.7 UX-Review

- **Empty-State:** Defaults voreingestellt (10.000 €, 3,00 %, 10 Jahre) → Ergebnis sofort beim Seitenaufruf sichtbar (SSR-bestätigt) ✓
- **Error-States:** Inline-Fehlermeldungen mit `role="alert"` z.B. „Anfangskapital muss ≥ 0 € sein." — klar formuliert, kein Technik-Jargon ✓
- **Mobile (375px):** `grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr))` → Cards umbrechen korrekt ✓
- **Progressive Disclosure:** Steuer/Inflation-Felder in separatem `defaults-section`-Block (mit Label „Steuer & Inflation") ✓
- **Disclaimer (KON-177):** „Diese Berechnung dient ausschließlich zur unverbindlichen Information. Tatsächliche Zinsen, Steuerlasten und Renditen können abweichen." — in HTML bestätigt ✓
- **Privacy-Badge (KON-210):** „Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser" — in HTML bestätigt ✓
- **Disclaimer-Color:** `color: var(--color-text)` (ZinsrechnerTool.svelte:544) — nicht subtle, kontrast-korrekt ✓
- **Input-Output-Format-Konsistenz:** Tool zeigt `13.439,16 €`, parseDE akzeptiert `13.439,16` → kein Silent-Trap ✓
- **Brand-Voice:** sachlich, kein „Elevate/Seamless"-Jargon ✓
- **Microcopy:** Tagline „Brutto, netto und real — Zinsen in einem Schritt berechnen." — präzise, kein Floskel ✓

**UX: PASS**

---

## §2.8 Content-Audit

- **Word-Count:** ~879 Wörter (Body, aus Pass 2 verifiziert; kein Content-Change in `c1e6549`) ≥ 300 ✓
- **H2-Pattern:** `## Was macht dieser Rechner?` → `## Umrechnungsformel` → `## Anwendungsbeispiele` → `## Häufige Einsatzgebiete` → `## Häufige Fragen` → `## Verwandte Finanz-Tools` — Rechner-Pattern A ✓
- **Letztes H2:** `## Verwandte Finanz-Tools` mit 3 internen Links (mehrwertsteuer-rechner ✓, kreditrechner ✓, rabatt-rechner ✓) ✓
- **NBSP:** korrekt bei Zahl-Einheit-Paaren im Source (de.md) ✓
- **headingHtml:** `<em>Zinsen</em> berechnen` — 1 `<em>` auf Ziel-Substantiv ✓
- **relatedTools:** `['mehrwertsteuer-rechner', 'kreditrechner']` + rabatt-rechner im Prose ✓
- **FAQPage-Schema:** in HTML bestätigt (`FAQPage`, `mainEntity`, `acceptedAnswer`) ✓
- **FAQ-Werte:** `18.061` ✓, `4,39 %` ✓, `26,375 %` ✓

### B-01 Regression-Verifikation (Pass 1 → Pass 3)

Grep auf korrigierte UND alte falsche Werte in `dist/de/zinsrechner/index.html`:

| Wert | Pass 1 (falsch) | Pass 3 vorhanden? | Alte Werte noch da? |
|---|---|---|---|
| Steuer Bsp. 1 | 643,64 € | **643,33 €** ✓ (in HTML + Content) | 643,64 → 0 Treffer ✓ |
| knNetto Bsp. 1 | 12.795,52 € | **12.795,83 €** ✓ | 12.795,52 → 0 Treffer ✓ |
| knReal Bsp. 1 | 11.282 € | **10.498,65 €** ✓ | 11.282 → 0 Treffer ✓ |
| kn Bsp. 3 | 19.800,75 € | **19.800,50 €** ✓ | 19.800,75 → 0 Treffer ✓ |
| Kapitalverlust Bsp. 3 | 199,25 € | **199,50 €** ✓ | 199,25 → 0 Treffer ✓ |

**Content: PASS**

---

## §2.9 Regression-Status (Pass 2 → Pass 3)

| Pass 2 Finding | Status | Beleg |
|---|---|---|
| B-01 (4 falsche Zahlenwerte) — ✓ gefixt in Pass 2 | ✓ **stabil** | HTML: 643,33 / 12.795,83 / 10.498,65 / 19.800,50 / 199,50 — alle korrekt; alte Werte 0 Treffer |
| I-01 (reset-btn :focus-visible fehlt) | — stabil offen (non-blocking) | CSS zeigt weiterhin nur `:hover`, kein `:focus-visible` mit Token |
| I-02 (Solve-for H2 nicht impl.) | — stabil offen (non-blocking) | Phase-1-deferred, kein Regression-Risiko |

**Keine Regressionen durch Build seit Pass 2 (audited commit `c1e6549` unverändert).**

---

## Blocker

*Keine.*

---

## Improvements (nicht ship-blocking)

### I-01 — A11y: `.reset-btn` fehlt `:focus-visible` mit Design-Token

**Problem:** `.reset-btn` hat kein `:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }` — UA-Default-Outline vorhanden (minimale WCAG-Konformität), aber nicht Design-System-konsistent.
**Fix-Vorschlag:** `ZinsrechnerTool.svelte` nach `.reset-btn:hover { ... }` ergänzen.

### I-02 — Dossier H2: Solve-for-Modus nicht implementiert

**Problem:** Dossier-Hypothese H2 (Solve-for-Modus: „Wie lange bis X € mit Y €/Monat?") nicht implementiert.
**Fix-Vorschlag:** Phase-2-Backlog-Ticket für Solve-for-Tabs.

---

## Observations (Backlog)

- **O-01:** Kein Copy-Button (C5) — Phase-1-deferred per KON-254.
- **O-02:** Kein `data-tool-used` Analytics-Event — systemic Phase-2-Gap.
- **O-03:** Font-Budget 86,6 KB > 80 KB — site-wide, `rework_required=false`.
- **O-05:** parseDE() extrahiert still Digits aus Nicht-Zahlen-Strings — kein XSS, aber kein Fehler-Feedback bei versehentlicher Text-Eingabe.
- **O-06:** `@vite-pwa/astro-integration`-Hook wirft async-Error am Build-Ende — site-weites Problem, betrifft nicht die HTML-Output-Korrektheit, kein zinsrechner-spezifischer Blocker.
- **O-07:** Vite-Warning „dynamically imported by tool-registry.ts but also statically imported by ZinsrechnerTool.svelte" — kein Render-Fehler, Chunking-Advisory, site-weites Pattern.

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Findings |
|---|---|---|
| Funktion | ✓ PASS | computeZins() SSR-verifiziert; 5/5 Input-Tests korrekt; Fisher/Steuer/Negativ-Zins ✓ |
| Input-Format §2.2.1 | ✓ PASS | parseDE() für alle Felder; kein Silent-Trap; Placeholder-Ehrlichkeit ✓ |
| Security | ✓ PASS | Kein innerHTML, kein XSS-Pfad, keine externen Calls |
| Performance | ✓ PASS | 3,2 KB gzipped; Lighthouse 95; synchrone Berechnung ohne Debounce-Bedarf |
| A11y | ✓ PASS | Labels, aria-live, aria-invalid, touch-targets — I-01 non-blocking |
| UX | ✓ PASS | SSR-Default, Progressive Disclosure, Disclaimer/Privacy-Badge ✓ |
| Content | ✓ PASS | 879 Wörter; alle 4 B-01-Werte korrekt und stabil; FAQ geprüft |
| Dossier H1/H2/H3 | ✓/✗/✓ | H1 ✓, H2 I-02 (non-blocking), H3 ✓ |

---

## Recommendation for CEO

**verdict=clean. Tool ist ship-ready.**

- Triple-Pass absolviert. Alle Blocker aus Pass 1 gefixt und durch Pass 2 + Pass 3 unabhängig verifiziert.
- Keine Regressionen. Build-Commit `c1e6549` ist der zu deployende Stand.
- Freigabe-Liste-Append durchgeführt: `docs/paperclip/freigabe-liste.md` ← zinsrechner (Row #1).
- I-01 + I-02: Backlog-Tickets empfohlen, kein Deploy-Block.
