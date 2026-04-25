# User-200-Tool-Liste — Bestands-Matching & Ideen-Extraktion

**Status:** Draft · **Erstellt:** 2026-04-21 · **Input:** User-Liste mit 200 thematisch kategorisierten Tools
**Zweck:** Liste gegen Bestand (live / Phase-1-Plan / Backlog / Reserve) mappen + Net-New-Kandidaten priorisieren.

---

## 1. TL;DR

| Status | Count | Notiz |
|---|---|---|
| ✅ Schon live | 9 | Session 1-10 Prototypen |
| 🔵 In Phase-1-Katalog (geplant) | 15 | Siehe `2026-04-20-phase-1-tool-catalog.md` |
| 🟣 Im Backlog (Auto-Refill-Queue) | 8 | `tasks/backlog/differenzierung-queue.md` |
| 🟡 In Phase-1-Reserve-20 | 8 | Reserve-Liste im Katalog §8 |
| 🟠 Parking-Lot (Enum-Extension nötig) | 14 | Speed/Data/Pressure/Energy/Power/Fuel/Angle/Currency fehlen in `categories.ts` |
| 🟢 **Net-New-Kandidaten (nicht geplant)** | **~140** | **Das ist der Ideen-Fundus für nächste Batches** |
| 🔴 Out-of-Scope (Hard-Cap-Blocker) | 5 | Live-Rates, Copyright, Server-API |

**Wichtigste Erkenntnis:** Deine 200er-Liste hat **~140 Tools, die NOCH NICHT geplant sind**. Der größte Block: Mathematik/Geometrie (Calculator-Cluster-Expansion), Finanzen (DE-Business-Pflicht-Tools), Lifestyle/Hobby (starke Nischen), Gesundheit/Fitness (Privacy-USP).

---

## 2. Was wir schon haben (aus deiner Liste)

| # | Dein Tool | Unser Slug | Quelle |
|---|---|---|---|
| 56 | Meter zu Fuß | `meter-zu-fuss` | ✅ Session 5 |
| 57 | Kilometer zu Meilen | `kilometer-zu-meilen` | ✅ Batch-1 |
| 62 | Kilogramm zu Pfund | `kilogramm-zu-pfund` | ✅ Batch-1 |
| 71 | Celsius zu Fahrenheit | `celsius-zu-fahrenheit` | ✅ Batch-1 |
| — | — | `zentimeter-zu-zoll` | ✅ Batch-1 (C-1 verwandt mit deinem #58 Zoll→cm) |
| — | — | `quadratmeter-zu-quadratfuss` | ✅ Batch-1 |
| — | — | `webp-konverter` | ✅ Session 7 |
| — | — | `hintergrund-entfernen` | ✅ Session 9 |
| — | — | `hevc-zu-h264` | ✅ In Arbeit |

---

## 3. Was aus deiner Liste in Phase-1-Plan ist (wird bald gebaut)

| # | Dein Tool | Unser Slug | Katalog-ID | Build-h |
|---|---|---|---|---|
| 1 | Prozentrechner | `prozentrechner` | Ca-1 | 2h |
| 34 | Zinseszins | `zinseszinsrechner` | Ca-5 | 5h |
| 38 | Mehrwertsteuer | `mehrwertsteuer-rechner` | Ca-4 | 3h |
| 43 | Brutto-Netto | `brutto-netto-rechner` | Ca-6 | 7h |
| 58 | Zoll zu Zentimeter | `zoll-zu-zentimeter` | C-1 | 1h |
| 75 | PS zu Kilowatt | `ps-zu-kw` | C-2 | 2h |
| 90 | Zeichenzähler | `zeichenzaehler` | A-1 | 2h |
| 96 | Lorem Ipsum | `lorem-ipsum-generator` | G-3 | 2h |
| 100 | Base64 | `base64-encoder` | C-3 | 1h |
| 101 | URL-Encoder/Decoder | `url-encoder-decoder` | C-4 | 1h |
| 104 | Text-Diff | `text-diff` | Co-1 | 4h |
| 113 | Passwort-Generator | `passwort-generator` | G-1 | 3h |
| 117/119 | Hex↔RGB | `hex-rgb-konverter` | C-7 | 3h |
| 125 | Unix-Timestamp | `unix-timestamp` | C-6 | 2h |
| 126 | JSON-Formatter | `json-formatter` | F-1 | 3h |
| 128 | SQL-Formatter | `sql-formatter` | F-2 | 4h |
| 129 | RegEx-Tester | `regex-tester` | V-3 | 4h |
| 132 | QR-Code | `qr-code-generator` | G-5 | 5h |
| 135 | BMI | `bmi-rechner` | Ca-2 | 2h |
| 142 | Ovulation | `eisprungrechner` | I-3 | 4h |
| 174 | Alter-Rechner | `altersrechner` | I-1 | 3h |
| 176 | Zeitzonen | `zeitzonen-rechner` | C-8 | 3h |
| 183/184 | Römische Zahlen ↔ | `roemische-zahlen` | C-5 | 2h |

---

## 4. Was in Backlog / Reserve-20 ist

**Backlog-Queue (bereits dispatch-ready):**
| # | Dein Tool | Unser Slug |
|---|---|---|
| 59 | Yard zu Meter | `yard-zu-meter` |
| 60 | Seemeilen zu Kilometer | `seemeile-zu-kilometer` |
| 64 | Gramm zu Unzen | `gramm-zu-unzen` |
| 67/68 | Liter zu Gallonen | `liter-zu-gallonen` |
| 69 | Milliliter zu Fluid Ounces | `milliliter-zu-unzen` |
| 70 | Kubikmeter zu Kubikfuß | `kubikmeter-zu-kubikfuss` |
| 72 | Kelvin zu Celsius | `kelvin-zu-celsius` |

**Reserve-20:**
| # | Dein Tool | Reserve-Slug |
|---|---|---|
| 23 | Zufallszahlen-Generator | `zufallszahlen-generator` |
| 39 | Rabatt-Rechner | `rabattrechner` |
| 103 | Markdown zu HTML | `markdown-zu-html` |
| 105 | Wort-Häufigkeits-Analyse | `wortfrequenz` |
| 114 | Passwort-Stärke | `passwort-staerke` |
| 133 | Barcode-Generator | `barcode-generator` |
| 141 | Geburtstermin | `geburtstermin-rechner` |
| 178 | Datums-Addierer | `datumsrechner` |

---

## 5. Parking-Lot — Enum-Extension nötig

Diese Tools kommen aus deiner Liste UND sind technisch fit, aber ihre Kategorien fehlen in `src/lib/tools/categories.ts`. **Einmaliger User-Decision-Ticket** zur Enum-Erweiterung unlockt all diese Slugs auf einen Schlag.

| # | Dein Tool | Fehlende Category |
|---|---|---|
| 16 | Bogenmaß zu Grad | `angle` |
| 73 | Joule zu Kalorien | `energy` |
| 74 | Kilowattstunden zu Megajoule | `energy` |
| 76 | Bar zu PSI | `pressure` |
| 77 | Pascal zu Bar | `pressure` |
| 78 | km/h zu mph | `speed` |
| 79 | Knoten zu km/h | `speed` |
| 80 | Mach zu km/h | `speed` |
| 81 | Newtonmeter zu Fuß-Pfund | `torque` (neu!) |
| 123 | MB zu MiB | `data` |
| 124 | TB zu GB | `data` |
| 161 | l/100km zu mpg | `fuel` |
| 166 | Beaufort zu km/h | `speed` |
| 200 | Schallgeschwindigkeit | `speed` |

**Empfehlung:** Enum um `speed, data, pressure, energy, power, fuel, angle, torque` erweitern (8 neue Values → 22 total). Unlockt sofort 14+ Tools aus deiner Liste + weitere aus Parking-Lot.

---

## 6. 🟢 Net-New-Kandidaten — gruppiert & priorisiert

**Bewertung:** A = SEO-HIGH + Build < 4h · B = SEO-MED + Build < 6h · C = Nische aber Unique · D = unsicher (weiter evaluieren)

### 6.1 Mathematik & Geometrie Cluster (28 neue Tools)

**Priorität A — Schul-/Alltag-Traffic, Build < 3h:**
| Tool | Typ | Build |
|---|---|---|
| Bruchrechner | Calculator | 3h |
| Brüche ↔ Dezimalzahlen | Converter | 2h |
| Quadratwurzel-Rechner | Calculator | 1h |
| Logarithmus-Rechner | Calculator | 2h |
| GGT-Rechner | Calculator | 2h |
| KGV-Rechner | Calculator | 2h |
| Kreisrechner (Fläche/Umfang) | Calculator | 2h |
| Dreieckrechner (Pythagoras) | Calculator | 2h |
| Rechteckrechner | Calculator | 1h |

**Priorität B — Formel-basiert, Build < 5h:**
| Tool | Typ | Build |
|---|---|---|
| Prozentuale Steigerung/Senkung | Calculator | 2h |
| Kubikwurzel / n-te Wurzel | Calculator | 2h |
| Fakultät-Rechner | Calculator | 2h |
| Primzahl-Prüfer | Validator | 2h |
| Primfaktorzerlegung | Calculator | 3h |
| Sin/Cos/Tan-Rechner | Calculator | 3h |
| Durchschnitt (Mittelwert/Median/Modalwert) | Analyzer | 3h |
| Standardabweichung | Analyzer | 3h |
| Varianz | Analyzer | 3h |
| Kombinatorik (n über k) | Calculator | 2h |
| Fibonacci-Folge | Generator | 2h |
| Kugelrechner | Calculator | 2h |
| Zylinderrechner | Calculator | 2h |
| Kegelrechner | Calculator | 2h |
| Pyramidenrechner | Calculator | 2h |
| Ellipsenrechner | Calculator | 2h |
| Parallelogrammrechner | Calculator | 1h |
| Trapezrechner | Calculator | 1h |
| Wahrscheinlichkeits-Rechner | Calculator | 4h |

### 6.2 Finanzen & Business Cluster (15 neue Tools)

**Priorität A — DE-Business-Pflicht:**
| Tool | Typ | Build |
|---|---|---|
| Einfacher Zinsrechner | Calculator | 2h |
| Kredit-Monatsraten | Calculator | 3h |
| Tilgungsplan | Calculator | 5h |
| Skonto-Rechner | Calculator | 2h |
| Trinkgeld-Rechner | Calculator | 1h |
| Stundenlohn zu Jahresgehalt | Calculator | 2h |

**Priorität B — Evergreen-Finanzthemen:**
| Tool | Typ | Build |
|---|---|---|
| ROI-Rechner | Calculator | 3h |
| Inflationsrechner | Calculator | 4h |
| Break-Even-Point | Calculator | 4h |
| Leasing-Faktor | Calculator | 3h |
| Dividenden-Rendite | Calculator | 3h |
| KGV (Kurs-Gewinn-Verhältnis) | Calculator | 2h |
| Cashflow-Rechner | Calculator | 4h |

**Priorität B — DE-Steuer-Spezifika (hoher Traffic):**
| Tool | Typ | Build |
|---|---|---|
| Grunderwerbsteuer | Calculator | 4h |
| Erbschaftssteuer | Calculator | 6h |

### 6.3 Text & Sprache Cluster (16 neue Tools)

**Priorität A — Dev-Utility + Schul-Traffic:**
| Tool | Typ | Build |
|---|---|---|
| Wortzähler (über Zeichenzähler hinaus) | Analyzer | 1h |
| Zeilen/Absatz-Zähler | Analyzer | 1h |
| Text umkehren | Formatter | 1h |
| Groß/Kleinschreibung-Konverter | Formatter | 2h |
| Suchen & Ersetzen | Formatter | 2h |
| HTML-Entities ↔ Text | Converter | 2h |
| Binär zu Text | Converter | 1h |
| Text zu Hexadezimal | Converter | 2h |

**Priorität B — Wortspiel/Nische:**
| Tool | Typ | Build |
|---|---|---|
| Anagramm-Generator | Generator | 3h |
| Wort-Scrambler | Generator | 2h |
| Morsecode-Übersetzer | Converter | 2h |
| Leet-Speak-Konverter | Converter | 1h |
| NATO-Alphabet-Buchstabierer | Converter | 2h |
| Palindrom-Prüfer | Validator | 1h |
| Silbenzähler | Analyzer | 3h |
| Reimgenerator | Generator | 5h |
| Braille-Konverter | Converter | 4h |

### 6.4 IT & Digitales Cluster (8 neue Tools)

**Priorität A:**
| Tool | Typ | Build |
|---|---|---|
| Binär zu Dezimal | Converter | 1h |
| Dezimal zu Hexadezimal | Converter | 1h |
| Aspect-Ratio-Rechner | Calculator | 2h |
| Download-Zeit-Rechner | Calculator | 2h |
| XML zu JSON (Converter, nicht Formatter) | Converter | 3h |
| CSS-Box-Shadow-Generator | Generator | 4h |

**Priorität B:**
| Tool | Typ | Build |
|---|---|---|
| RGB zu CMYK | Converter | 3h |
| IP-Subnetz-Rechner | Calculator | 5h |
| Favicon-Generator | FileTool | 6h |

### 6.5 Gesundheit & Fitness Cluster (15 neue Tools)

**Priorität A — Privacy-USP (Gesundheitsdaten bleiben lokal):**
| Tool | Typ | Build |
|---|---|---|
| Kalorienbedarf (Grundumsatz + Leistungsumsatz) | Calculator | 3h |
| Idealgewicht | Calculator | 2h |
| Körperfettanteil (Navy-Methode) | Calculator | 3h |
| Waist-to-Hip Ratio | Calculator | 2h |
| Wasserbedarf pro Tag | Calculator | 2h |
| Blutalkohol (Widmark) | Calculator | 3h |
| Trainingspuls (Karvonen) | Calculator | 2h |
| 1-Rep-Max (Kraftsport) | Calculator | 2h |

**Priorität B:**
| Tool | Typ | Build |
|---|---|---|
| Marathon-Pace-Rechner | Calculator | 3h |
| Schwimm-Pace-Rechner | Calculator | 3h |
| Kalorienverbrauch (MET-Werte) | Calculator | 4h |
| Rauchfrei-Ersparnis | Calculator | 3h |

**Priorität D — Pseudo-Wissenschaft (evaluieren):**
| Tool | Typ | Build |
|---|---|---|
| Biorhythmus | Interactive | 4h |
| Lebenserwartung | Interactive | 6h |

### 6.6 Lifestyle, Hobby & Kochen Cluster (19 neue Tools)

**Priorität A — High-Volume-Suche:**
| Tool | Typ | Build |
|---|---|---|
| Schuhgrößen (EU/US/UK/CM) | Converter | 3h |
| Kleidergrößen international | Converter | 4h |
| Ringgrößen | Converter | 2h |
| Ofentemperaturen (Gasstufe) | Converter | 2h |
| Gramm ↔ Tassen (nach Zutat) | Converter | 5h |
| Hundejahre zu Menschenjahre | Calculator | 1h |
| Katzenjahre zu Menschenjahre | Calculator | 1h |
| CO2-Fußabdruck (Flug/Auto) | Calculator | 5h |
| Stromkosten Haushaltsgeräte | Calculator | 3h |
| Papierformate (A-Serie in Pixel) | Calculator | 2h |
| Maßstab-Rechner (Modellbau) | Calculator | 2h |

**Priorität C — Nische mit loyalem Traffic:**
| Tool | Typ | Build |
|---|---|---|
| BH-Größen | Calculator | 3h |
| Hutgrößen | Converter | 2h |
| Fliesenbedarf | Calculator | 3h |
| Wandfarben-Bedarf | Calculator | 2h |
| Aquarium-Volumen | Calculator | 2h |
| Haustier-Futter | Calculator | 3h |
| Rasenaussaat | Calculator | 2h |
| Pflanzen-Dünge | Calculator | 3h |

### 6.7 Zeit & Astronomie Cluster (9 neue Tools)

**Priorität A:**
| Tool | Typ | Build |
|---|---|---|
| Countdown-Timer | Interactive | 3h |
| Arbeitstage-Rechner | Calculator | 3h |
| Zeitstempel-Differenz | Calculator | 2h |
| Sternzeichen | Calculator | 2h |

**Priorität B — Nische + Fun:**
| Tool | Typ | Build |
|---|---|---|
| Mondphasen-Kalender | Interactive | 5h |
| Sonnenaufgang/-untergang | Calculator | 4h |
| Chinesisches Horoskop | Calculator | 2h |
| Planeten-Gewichtsrechner | Interactive | 2h |

### 6.8 Nischen-Spezial (9 neue Tools)

**Priorität C — kleine aber dedizierte Zielgruppen:**
| Tool | Typ | Build | Hinweis |
|---|---|---|---|
| dB-Addierer | Calculator | 2h | Akustik-Community |
| Belichtungszeit-Rechner | Calculator | 3h | Fotografie |
| Schärfentiefe (DoF) | Calculator | 3h | Fotografie |
| Edelstein-Gewichtsschätzer | Calculator | 3h | Schmuck-Nische |
| Heizöl-Verbrauchsprognose | Calculator | 3h | DE-Haushalt |
| Brennholz-Energiewert | Calculator | 4h | Nische |
| Brauwasser (Hobby-Brauer) | Calculator | 5h | Community-lock |
| E-Liquid-Mischer | Calculator | 3h | Vaping-Community |
| Häkel-Nadelstärken | Converter | 2h | Handarbeit |
| Garn-Lauflängen | Calculator | 3h | Handarbeit |
| Teichpumpen | Calculator | 3h | Garten-Nische |
| Interstellare Entfernung | Converter | 3h | Edutainment |

---

## 7. 🔴 Out-of-Scope — mit Begründung

| # | Dein Tool | Begründung |
|---|---|---|
| 45 | Währungsrechner live | NN #7: keine Network-Runtime-Deps. Phase-3+ mit tagesaktuellem Snapshot-Pattern möglich. |
| 46 | Krypto-Konverter | NN #7: live-rates. Selbe Logik wie Währungen. |
| 47 | Aktien-Gewinn/Verlust | OK als reiner Calculator (User-Input-only), **NICHT** als Live-Kurse. Re-klassifizieren als 🟢. |
| 191/192 | Gold-/Silberpreis | NN #7: live-rates. Phase-3+ mit tagesaktuellem Snapshot. |
| 87 | Strahlendosis Sievert ↔ Rem | Technisch OK, aber braucht `radiation`-Category. Enum-Extension. |
| 86 | Viskositäts-Konverter | Technisch OK, aber braucht `viscosity`-Category. Sehr nische — lohnt neue Kategorie? |

**Nicht in deiner Liste, aber wichtig zu wissen (Phase-1-Katalog §9 Nicht-Ziele):**
youtube-zu-mp3 (Urheberrecht), audio-zu-text / plagiatspruefer / ki-detector (Modell-Größe), ip-lookup / dns-check (Server-API), online-signatur (Zertifikate), kreditkarten-generator (Reputation), mp4-zu-webm (LGPL), pdf-ocr (Tesseract-Footprint).

---

## 8. Empfehlung — die nächsten 20 Tools für Backlog-Seed

Nach Phase-1-Plan (aktuell 41 geplant), wenn Auto-Refill weiter gefüttert werden soll, wären diese 20 aus deiner Liste die besten Next-Shots (niedrige Build-Kosten × hoher SEO-Signal × keine Enum-Blocker):

```
bruchrechner                   | calculator
quadratwurzel-rechner          | calculator
kreisrechner                   | calculator
dreieckrechner                 | calculator
rechteckrechner                | calculator
einfacher-zinsrechner          | calculator
kredit-monatsraten             | calculator
trinkgeld-rechner              | calculator
stundenlohn-zu-jahresgehalt    | calculator
wortzaehler                    | text
gross-klein-konverter          | text
suchen-ersetzen                | text
binaer-zu-dezimal              | dev
dezimal-zu-hex                 | dev
aspect-ratio-rechner           | calculator
download-zeit-rechner          | calculator
idealgewicht-rechner           | calculator
wasserbedarf-rechner           | calculator
schuhgroessen-konverter        | text (oder neue category: sizes)
countdown-timer                | time
```

Kann CEO als Patch-6-Seed direkt ins `differenzierung-queue.md` appendieren (aber ACHTUNG: einige brauchen Enum-Extension — `text`, `dev` sind drin, aber `calculator` hat keine eigene Category-Sub-Klassifizierung → OK wenn wir generisch mit Type-Field arbeiten).

---

## 9. Offene Entscheidungen

1. **Enum-Extension ja/nein?** Wenn ja: welche 8 Categories? Unlockt ~14 deiner Parking-Lot-Tools sofort + weitere zukünftige.
2. **Aktien-Gewinn/Verlust #47 re-klassifizieren?** Als reiner User-Input-Calculator OK, als Live-Rate-Tool nicht.
3. **Priorität C-Tools (Nischen):** lohnt sich Brauwasser, E-Liquid, Häkel-Nadel etc.? Diese haben kleine aber SEHR loyale Zielgruppen + fast keine DE-Konkurrenz — könnten Traffic-Flag-Ship werden. Oder Phase-2-Batch nach Launch-Analytics.
4. **Pseudo-Wissenschaft (Biorhythmus, Lebenserwartung):** baust du die? SEO stark, aber pseudo-wissenschaftlich.
5. **Gramm ↔ Tassen (Zutat-spezifisch):** hoher Aufwand (Density-DB pro Zutat), aber extrem hohe Koch-Nachfrage DE. Lohnt?

---

**Bindende Referenzen:**
- `docs/superpowers/plans/2026-04-20-phase-1-tool-catalog.md` — Scoring-Framework, Reserve-20, §9 Nicht-Ziele
- `tasks/backlog/differenzierung-queue.md` — aktuelle Auto-Refill-Queue
- `src/lib/tools/categories.ts` — aktuelles 14-Category-Enum
- `CLAUDE.md` §6 Non-Negotiables — Network-Runtime, Privacy, Content-Quality
