# Phase-1-Tool-Katalog — Die ersten 50 Tools (DE)

**Status:** Draft (Review-Pending) · **Erstellt:** 2026-04-20 · **Input:** 3 parallele Recherche-Agents (Keyword-Demand · Konkurrenz-Matrix · Tech-Feasibility)

## 1. Ziel & Scope

50 deutsche Tools als Phase-1-Launch-Set. Alle 9 Tool-Typen mindestens 1× validiert. Reihenfolge gegen Risiko und Build-Cost priorisiert. Nach Phase-1 (50) folgt Phase-2-Katalog mit 150–250 zusätzlichen Tools.

**Parallele Recherche-Inputs verarbeitet:**
- 123 Tool-Ideen mit DE-Demand-Signal (HIGH / MED / LOW)
- Konkurrenz-Matrix über 8 DE-Hubs (rechneronline, blitzrechner, smallpdf/de, tinypng, remove.bg/de, ilovepdf/de, convertio/de, online-convert/de)
- Pure-Client-Feasibility + Build-Hour-Schätzung pro Kategorie

## 2. Scoring-Framework (angewandt)

Pro Tool 5 Dimensionen × Gewicht, max 50 Punkte:

| Dim | Gewicht | Mapping |
|---|---|---|
| SEO-Traffic DE | ×3 | HIGH=5 · MED=3 · LOW=1 |
| Tool-Typ-Quote | ×2 | Noch ungedecker Typ=5 · Teilweise gedeckt=3 · Schon voll=1 |
| Build-Cost (invers) | ×2 | <3h=5 · 3–6h=4 · 6–10h=3 · 10–15h=2 · >15h=1 |
| Pure-Client | ×2 | Native=5 · WASM/ML-Worker=3 · Riskant=1 |
| Differenzierung | ×1 | White-Space=5 · Mittel=3 · Baseline=2 |

**Schwelle für Phase 1:** Score ≥ 30. Quoten pro Typ werden harter als Score erzwungen (alle 9 Typen müssen besetzt sein).

## 3. Schon live (8)

| Slug | Typ | Status |
|---|---|---|
| meter-zu-fuss | Converter | ✅ Session 5 |
| zentimeter-zu-zoll | Converter | ✅ Batch-1 |
| kilometer-zu-meilen | Converter | ✅ Batch-1 |
| kilogramm-zu-pfund | Converter | ✅ Batch-1 |
| celsius-zu-fahrenheit | Converter | ✅ Batch-1 |
| quadratmeter-zu-quadratfuss | Converter | ✅ Batch-1 |
| webp-konverter | FileTool | ✅ Session 7 |
| hintergrund-entfernen | FileTool | ✅ Session 9 |

## 4. In Arbeit (1)

| Slug | Typ | Status |
|---|---|---|
| hevc-zu-h264 | FileTool | Spec + Plan locked (2026-04-20); Implementation folgt |

## 5. Phase-1-Roadmap — die verbleibenden 41 Tools

### 5.1 Converter-Cluster (ergänzt — +9 auf 15 total)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| C-1 | zoll-zu-zentimeter | 47 | 1 | Trivial, hoher Traffic; Batch-2-Einstieg |
| C-2 | ps-zu-kw | 46 | 2 | DE-Auto-Pain; exakt wie km-mi-Pattern |
| C-3 | base64-encoder | 43 | 1 | Dev-Standard; client-trivial |
| C-4 | url-encoder-decoder | 42 | 1 | Dev-Standard |
| C-5 | roemische-zahlen | 42 | 2 | Eigenbau-Algo; high-volume Schul-Traffic |
| C-6 | unix-timestamp | 41 | 2 | Dev-Standard; client-native |
| C-7 | hex-rgb-konverter | 41 | 3 | `culori` + eigenes UI |
| C-8 | zeitzonen-rechner | 40 | 3 | `Intl.DateTimeFormat` nativ; kein Server |
| C-9 | json-zu-csv | 38 | 4 | Dev-Pain; client-side |

### 5.2 Calculator-Cluster (+6 — erstmals Typ-2 im Launch)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| Ca-1 | prozentrechner | **47** | 2 | DE-Top-1 (Blitzrechner Pos.1); Refined-Minimalism vs. 2008-UIs der Konkurrenz |
| Ca-2 | bmi-rechner | 46 | 2 | Health-Evergreen; privat (Gesundheitsdaten bleiben lokal) |
| Ca-3 | dreisatzrechner | 45 | 2 | Schul-Traffic; trivial |
| Ca-4 | mehrwertsteuer-rechner | 44 | 3 | DE-Business-Pflicht |
| Ca-5 | zinseszinsrechner | 40 | 5 | Finanz-Evergreen + Chart-Visualisierung |
| Ca-6 | brutto-netto-rechner | 38 | 7 | DE-Payroll-Top-1; Privacy-USP (Gehalt lokal) |

### 5.3 Generator-Cluster (+5 — erstmals Typ-3)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| G-1 | passwort-generator | 46 | 3 | `crypto.getRandomValues` nativ; Privacy-USP |
| G-2 | uuid-generator | 45 | 2 | `crypto.randomUUID()` nativ |
| G-3 | lorem-ipsum-generator | 44 | 2 | Eigenbau-Korpus |
| G-4 | hash-generator | 43 | 3 | `SubtleCrypto.digest` nativ |
| G-5 | qr-code-generator | 42 | 5 | `qrcode` MIT; Batch-Modus (Konkurrenz macht nur 1:1) |

### 5.4 Formatter-Cluster (+4 — erstmals Typ-4, shared-prettier-chunk)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| F-1 | json-formatter | 44 | 3 | Nativ `JSON.parse/stringify` + Pretty-Printer; Kein Login wie jsonreader |
| F-2 | sql-formatter | 37 | 4 | `sql-formatter` MIT; Deutsche Dialekt-Defaults |
| F-3 | xml-formatter | 36 | 4 | `fast-xml-parser` MIT; shared-chunk mit YAML |
| F-4 | css-formatter | 35 | 6 | `prettier` shared-chunk (amortisiert über F-1–4) |

### 5.5 Validator-Cluster (+3 — erstmals Typ-5)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| V-1 | iban-pruefer | 44 | 3 | `ibantools` MIT; DE-Banking |
| V-2 | ust-id-pruefer | **43** | 4 | White-Space (kein sauberer Browser-only Anbieter in DE) + B2B-Pflicht |
| V-3 | regex-tester | 42 | 4 | Native `RegExp` + ReDoS-Schutz via Worker |

### 5.6 Analyzer-Cluster (+3 — erstmals Typ-6)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| A-1 | zeichenzaehler | 45 | 2 | `Intl.Segmenter` nativ |
| A-2 | kontrast-pruefer | 43 | 4 | `culori` + WCAG 2.2 + APCA; A11y-USP |
| A-3 | jwt-decoder | 40 | 3 | Client-only (wichtig: kein Token leakt an Server — Pain-Point bei jstoolset etc.) |

### 5.7 Comparer-Cluster (+3 — erstmals Typ-7)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| Co-1 | text-diff | 42 | 4 | `diff` BSD-3; UX-Polish |
| Co-2 | json-diff | 38 | 4 | `jsondiffpatch` MIT; Klassifizierung add/remove/change |
| Co-3 | bild-diff | 36 | 6 | `pixelmatch` ISC; Pixel + perceptual (SSIM) |

### 5.8 FileTool-Cluster (+4 auf 7 total — schließt Phase 1)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| F-T1 | heic-zu-jpg | **45** | 7 | iPhone-Pain-Point; pure-client via `heic-to` (alle Konkurrenten Server-Upload) |
| F-T2 | pdf-zu-jpg | 44 | 6 | `pdfjs-dist` pure-client; USP: PDFs bleiben lokal (smallpdf/ilovepdf laden hoch) |
| F-T3 | jpg-zu-pdf | 43 | 6 | `pdf-lib` pure-client; Batch + Seiten-Sortierung |
| F-T4 | pdf-komprimieren | 40 | 10 | `pdf-lib` + Image-Resample via `pdfjs`; keine Paywall wie smallpdf |

*(webp-konverter, hintergrund-entfernen, hevc-zu-h264 = 3 bereits gezählt)*

### 5.9 Interactive-Cluster (+4 — erstmals Typ-9)

| Rank | Slug | Score | Build-h | Differenzierungs-Hebel |
|---|---|---|---|---|
| I-1 | altersrechner | 42 | 3 | Wizard-Pattern Validierung (klein genug für Template-Lock) |
| I-2 | arbeitszeitrechner | 41 | 4 | DE-HR-Traffic; Pausen-Regel-Intelligenz |
| I-3 | eisprungrechner | 40 | 4 | Privacy-USP (fertility-tracking bleibt lokal) |
| I-4 | persoenlichkeitstest-16 | **38** | 12 | DE-Version fehlt, 1 Mrd+ Takes weltweit; sprengt Template-Scope = Interactive-Anchor-Tool |

## 6. Gesamt-Zusammenfassung

| Typ | Live | In Arbeit | Neu in Phase 1 | Total Phase 1 | Quote erfüllt? |
|---|---|---|---|---|---|
| Converter | 6 | — | 9 | **15** | ✓ Ziel 15 |
| Calculator | 0 | — | 6 | **6** | ✓ Ziel 6 |
| Generator | 0 | — | 5 | **5** | ✓ Ziel 5 |
| Formatter | 0 | — | 4 | **4** | ✓ Ziel 4 |
| Validator | 0 | — | 3 | **3** | ✓ Ziel 3 |
| Analyzer | 0 | — | 3 | **3** | ✓ Ziel 3 |
| Comparer | 0 | — | 3 | **3** | ✓ Ziel 3 |
| FileTool | 2 | 1 (hevc) | 4 | **7** | ✓ Ziel 7 |
| Interactive | 0 | — | 4 | **4** | ✓ Ziel 4 |
| **Summe** | **8** | **1** | **41** | **50** | **✓** |

**Build-Aufwand Phase 1 (nur die 41 neuen + hevc):**  
Converter: ~20h · Calculator: ~21h · Generator: ~15h · Formatter: ~17h · Validator: ~11h · Analyzer: ~9h · Comparer: ~14h · FileTool: ~35h · Interactive: ~23h  
**Total: ~165 Build-Stunden** (inkl. Tests + i18n + SEO-Content · ohne UX-Polishing-Sessions)

## 7. Session-Reihenfolge (Cluster-weise)

Reihenfolge priorisiert nach: (a) ungedecker Tool-Typ zuerst (Template-Lock ermöglicht folgende Session-Parallelisierung), (b) Build-Cost aufsteigend innerhalb Cluster, (c) Low-Hanging-Fruit-First zur Moral.

**Phase 1a: Tool-Typ-Template-Validierung** (~6 Sessions, ~65h)
1. **Session P1-1 — Converter-Batch-2** (9 Tools, ~20h): C-1 bis C-9. Leicht; nutzt bestehendes Converter-Template. Validiert Batch-Throughput.
2. **Session P1-2 — Calculator-Template** (Ca-1 bis Ca-3, ~7h): erste Calculator-Session lockt das Template. Nur Low-Cost (2–3h/Tool).
3. **Session P1-3 — Generator-Template** (G-1 bis G-3, ~7h): Generator-Template-Lock (Password/UUID/Lorem).
4. **Session P1-4 — Formatter-Template + F-1** (~6h): `json-formatter` als Template-Anchor + shared-prettier-chunk vorbereiten.
5. **Session P1-5 — Validator-Template + V-1** (~4h): `iban-pruefer` als Anchor.
6. **Session P1-6 — Analyzer-Template + A-1** (~3h): `zeichenzaehler` als trivialster Anchor.

**Phase 1b: Cluster-Scaling** (~4 Sessions, ~45h)
7. **Session P1-7 — Calculator-Scaling** (Ca-4 bis Ca-6, ~15h).
8. **Session P1-8 — Generator-Scaling + Formatter-Scaling** (G-4, G-5, F-2 bis F-4, ~17h).
9. **Session P1-9 — Validator/Analyzer/Comparer-Scaling** (V-2, V-3, A-2, A-3, Co-1 bis Co-3, ~25h).
10. **Session P1-10 — FileTool-Cluster** (hevc-zu-h264 aus in-progress finalisieren + F-T1 bis F-T4, ~33h über 2–3 Sub-Sessions).

**Phase 1c: Interactive + Interactive-Anchor** (~2 Sessions, ~23h)
11. **Session P1-11 — Interactive-Template** (I-1 bis I-3, ~11h).
12. **Session P1-12 — Interactive-Anchor `persoenlichkeitstest-16`** (~12h über 2 Sub-Sessions für Content + Auswertung).

**Phase 1d: Launch-Ready** (1 Session)
13. **Session P1-13 — Launch-Check + Lighthouse + initial Pagefind-Index** (~8h).

## 8. Reserve-Liste 20 (falls ein Top-50-Tool rausfliegt)

Sortiert nach Score. Erste Kandidaten für Phase 2, falls Phase 1 Platz freigibt:

1. ust-id-pruefer (bereits in Phase 1 — doppelt gelistet zur Reserve-Info)
2. taschenrechner (Calculator, HIGH, 2h)
3. rabattrechner (Calculator, HIGH, 2h)
4. slug-generator (Generator, MED, 2h)
5. markdown-zu-html (Converter, MED, 4h)
6. html-formatter (Formatter, MED, 3h)
7. json-validator (Validator, HIGH, 3h)
8. passwort-staerke (Analyzer, MED, 4h)
9. wortfrequenz (Analyzer, MED, 3h)
10. kredit-vergleich (Comparer, HIGH, 6h)
11. mov-zu-mp4 (FileTool, HIGH, 7h)
12. svg-zu-png (FileTool, MED, 5h)
13. bild-zuschneiden (FileTool, MED, 5h)
14. kalenderwoche (Calculator, HIGH, 2h)
15. datumsrechner (Calculator, HIGH, 3h)
16. geburtstermin-rechner (Calculator, HIGH, 3h)
17. zufallszahlen-generator (Generator, HIGH, 2h)
18. barcode-generator (Generator, MED, 3h)
19. lesbarkeits-index (Analyzer, MED, 6h)
20. notendurchschnitt (Calculator, HIGH, 3h)

## 9. Bewusst weggelassen (Phase 1 not-in-scope + Begründung)

- **youtube-zu-mp3** — Urheberrechts-Grauzone.
- **audio-zu-text / plagiatspruefer / ki-detector** — Modell-Größe sprengt pure-client-Budget.
- **ip-lookup / dns-check / whois / website-speed** — braucht Server-API.
- **live-crypto-rates / live-broker-tools** — Live-Network-Calls zur Runtime verletzen NN #7.
- **online-signatur / qes-sign** — rechtliche Zertifikats-Infrastruktur.
- **kreditkarten-generator (Komplettnummer)** — Reputations-Risiko. Nur Luhn-Check (V-4-Reserve).
- **mp4-zu-webm** — ffmpeg.wasm-LGPL-Konflikt; erst klären ob Mediabunny reicht (Phase 2).
- **pdf-ocr** — Tesseract.wasm-Footprint >20 MB; Phase-2-Kandidat.

## 10. Re-Evaluation-Trigger

- Nach **Session P1-6**: Template-Lock für 6 Tool-Typen vollzogen → Quick-Retrospektive, ob Score-Gewichte in §2 justiert werden müssen.
- Nach **Session P1-10**: FileTool-Cluster geladen → prüfen ob Bundle-Size-Budget (Mediabunny + pdf.js + pdf-lib + heic-to) gehalten wurde; sonst Lazy-Chunking nachziehen.
- Nach **Session P1-13 (Launch)**: erste Analytics-Woche → welche Tools holen organischen Traffic? Unter-performer wandern in Phase-2-Nacharbeit.

## 11. Nicht-Ziele dieses Katalogs

- Kein Batch-Import in einer Session — jede Session bleibt chirurgisch (CLAUDE.md §3).
- Keine gleichzeitige Mehr-Sprachen-Expansion — Phase 3 ist separater Gate.
- Kein AdSense-Integration — Phase 2 (NN #5).
- Kein abschließendes Ranking der 1000+-Tool-Vision — dieser Katalog deckt nur Phase 1. Phase-2-Katalog folgt nach Launch-Analytics.

---

**Quellen (Recherche-Agents, 2026-04-20):**
- Keyword-Agent-Report: `.claude` Tasks-Tmp (agentId a79647e8f42bf8112)
- Konkurrenz-Agent-Report: (agentId a2071a7f7e9295ba6)
- Tech-Feasibility-Agent-Report: (agentId a8085a7f480835d5b)

**Bindende Referenzen:**
- `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` §4.1 (9 Tool-Typen) + §15 (Launch Timeline)
- `CLAUDE.md` §5 (Design-Skill-Pflicht) + §6 (Differenzierungs-Check pro Tool-Spec)
- `PROGRESS.md` (aktueller Session-Stand)
