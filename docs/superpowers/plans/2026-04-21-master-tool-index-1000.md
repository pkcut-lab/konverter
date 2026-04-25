# Master Tool Index (1000) — Status-Klassifikation

**Stand:** 2026-04-21
**Scope:** Alle 1002 Tools der zwei User-Input-Listen (#1–200 + #201–1002) mit Status, Slug-Vorschlag, Enum-Kategorie, Notiz.
**Querverweise:** `tasks/backlog/differenzierung-queue.md` (aktive Tier-Backlog) · `docs/superpowers/plans/2026-04-21-user-200-list-analysis.md` · `docs/superpowers/plans/2026-04-21-user-800-more-list-analysis.md` · `docs/superpowers/specs/2026-04-18-psychologie-tools-katalog.md` (79 Tools, Tier 9).

---

## Status-Legende

| Code | Bedeutung |
|------|-----------|
| `BUILT` | Bereits in `src/content/tools/<slug>/de.md` (11 Tools) |
| `T1`–`T8` | Im aktiven Tier-Backlog — CEO Auto-Refill FIFO |
| `T9` | Psychologie/Kognition-Familie — Enum-Ext-Ticket gleichzeitig |
| `NEW` | Net-New — in Enum `text/time/color/dev` baubar, noch nicht im Tier-Backlog |
| `PL-<key>` | Parking-Lot — Enum-Extension-Ticket (User-Approval) prerequisite |
| `R-1`…`R-9` | Rejected — Hard-Cap-Begruendung |
| `UNMAPPED` | Manueller Review noetig |

**Parking-Lot-Keys:** `PL-math` · `PL-finance` · `PL-construction` · `PL-health` · `PL-marketing` · `PL-science` · `PL-engineering` · `PL-sport` · `PL-automotive` · `PL-education` · `PL-agriculture` · `PL-converter` · `PL-av` · `PL-niche`

**Reject-Codes:**

| Code | Hard-Cap |
|------|----------|
| R-1 | Live-Rates / Realtime-API (Non-Negotiable #7) |
| R-2 | Pseudowissenschaft (E-E-A-T-inkompatibel) |
| R-3 | Medizinische Diagnose (YMYL) |
| R-4 | Copyrighted Content |
| R-5 | Security-Misuse-Enabler |
| R-6 | Server-File-Processing > 500MB |
| R-7 | Gluecksspiel |
| R-8 | Live-Social-Daten |
| R-9 | Low-Value / Gimmick |

---

## Status-Summary (alle 1002 Tools)

| Status | Anzahl | Anteil |
|--------|--------|--------|
| `BUILT` | 7 | 0.7% |
| `T1` | 8 | 0.8% |
| `T2` | 14 | 1.4% |
| `T4` | 66 | 6.6% |
| `T5` | 56 | 5.6% |
| `T6` | 10 | 1.0% |
| `T7` | 5 | 0.5% |
| `T8` | 3 | 0.3% |
| `NEW` | 33 | 3.3% |
| `PL-math` | 76 | 7.6% |
| `PL-finance` | 68 | 6.8% |
| `PL-construction` | 59 | 5.9% |
| `PL-health` | 71 | 7.1% |
| `PL-science` | 61 | 6.1% |
| `PL-engineering` | 50 | 5.0% |
| `PL-sport` | 60 | 6.0% |
| `PL-automotive` | 50 | 5.0% |
| `PL-education` | 50 | 5.0% |
| `PL-agriculture` | 50 | 5.0% |
| `PL-converter` | 1 | 0.1% |
| `PL-av` | 47 | 4.7% |
| `PL-niche` | 146 | 14.6% |
| `R-1` | 1 | 0.1% |
| `R-2` | 3 | 0.3% |
| `R-3` | 6 | 0.6% |
| `R-5` | 1 | 0.1% |
| **TOTAL** | **1002** | **100%** |

- **Gebaut:** 7
- **Tier-Queue (dispatch-ready):** 162
- **Net-New (ohne Enum-Ext):** 33
- **Parking-Lot (Enum-Ext-Gate):** 789
- **Rejected (Hard-Cap):** 11

**Zusaetzlich (nicht in diesen 1002):** 79 Psychologie-Tools aus `docs/superpowers/specs/2026-04-18-psychologie-tools-katalog.md` — alle `T9` (Enum-Ext `persoenlichkeit/kognition/gesundheit-wellness/lernen/spass/sinne` pending).

---

## Detail — Liste A (User #1–200)

### Mathematik & Geometrie (1–33)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 1 | Prozentrechner (X von Y) | `T7` | `text` | prozent-rechner — verwandt zu Tier 7 |
| 2 | Prozentuale Steigerung/Senkung | `T7` | `text` | prozentuale Differenz — Tier 7 |
| 3 | Bruchrechner (Addieren, Subtrahieren, Multiplizieren, Dividieren) | `PL-math` | `—` | Dreisatz — enum "math" noetig |
| 4 | Brüche in Dezimalzahlen umwandeln | `PL-math` | `—` | Bruchrechner — enum "math" |
| 5 | Dezimalzahlen in Brüche umwandeln | `T7` | `text` | bruch-dezimal — Tier 7 |
| 6 | Quadratwurzel-Rechner | `PL-math` | `—` | Dezimal zu Bruch — enum "math" |
| 7 | Kubikwurzel-Rechner | `PL-math` | `—` | ggT — enum "math" |
| 8 | n-te Wurzel Rechner | `PL-math` | `—` | kgV — enum "math" |
| 9 | Logarithmus-Rechner (Basis 10, e, 2) | `PL-math` | `—` | Primzahl-Checker — enum "math" |
| 10 | Fakultät-Rechner (n!) | `PL-math` | `—` | Quadratwurzel — enum "math" |
| 11 | Primzahl-Prüfer | `T7` | `text` | Fakultaet — Tier 7 |
| 12 | Primfaktorzerlegung | `PL-math` | `—` | Fibonacci — enum "math" |
| 13 | GGT-Rechner (Größter gemeinsamer Teiler) | `PL-math` | `—` | Pythagoras — enum "math" |
| 14 | KGV-Rechner (Kleinstes gemeinsames Vielfaches) | `PL-math` | `—` | Kreis-Umfang/Flaeche — enum "math" |
| 15 | Sinus, Cosinus, Tangens Rechner | `PL-math` | `—` | Kugel-Volumen — enum "math" |
| 16 | Bogenmaß zu Grad (Radiant zu Degree) | `PL-math` | `—` | Quader-Volumen — enum "math" |
| 17 | Durchschnittswert-Rechner (Mittelwert, Median, Modalwert) | `PL-math` | `—` | Dreiecksflaeche — enum "math" |
| 18 | Standardabweichung-Rechner | `PL-math` | `—` | Binomische Formeln — enum "math" |
| 19 | Varianz-Rechner | `PL-math` | `—` | Quadratische Gleichung — enum "math" |
| 20 | Wahrscheinlichkeits-Rechner (Lotto, Würfel) | `PL-math` | `—` | Lineare Gleichung — enum "math" |
| 21 | Kombinatorik (n über k) | `T7` | `text` | Mittelwert/Median — Tier 7 |
| 22 | Fibonacci-Folge Generator | `PL-math` | `—` | Standardabweichung — enum "math" |
| 23 | Zufallszahlen-Generator | `PL-math` | `—` | Varianz — enum "math" |
| 24 | Kreisrechner (Fläche, Umfang, Durchmesser) | `PL-math` | `—` | Wahrscheinlichkeits-Rechner — enum "math" |
| 25 | Dreieckrechner (Fläche & Hypotenuse nach Pythagoras) | `PL-math` | `—` | Kombinatorik — enum "math" |
| 26 | Rechteckrechner (Fläche & Umfang) | `PL-math` | `—` | Permutationen — enum "math" |
| 27 | Kugelrechner (Volumen & Oberfläche) | `PL-finance` | `—` | Zinseszins — enum "finance" |
| 28 | Zylinderrechner (Volumen & Mantelfläche) | `PL-finance` | `—` | Zinseszins-Rechner — enum "finance" |
| 29 | Kegelrechner (Volumen) | `PL-math` | `—` | Einheitenumrechner-Universal — UX-Pattern |
| 30 | Pyramidenrechner (Volumen) | `PL-math` | `—` | Logarithmus — enum "math" |
| 31 | Ellipsenrechner (Fläche) | `PL-math` | `—` | Exponent/Potenz — enum "math" |
| 32 | Parallelogrammrechner (Fläche) | `PL-math` | `—` | Trigonometrie — enum "math" |
| 33 | Trapezrechner (Fläche) | `PL-math` | `—` | Grad/Radiant — enum "math" |

### Finanzen & Business (34–55)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 34 | Zinseszins-Rechner | `PL-finance` | `—` | Kreditrechner — enum "finance" |
| 35 | Einfacher Zinsrechner | `PL-finance` | `—` | Darlehenstilgung — enum "finance" |
| 36 | Kredit-Monatsraten-Rechner | `PL-finance` | `—` | Mehrwertsteuer — enum "finance" |
| 37 | Tilgungsplan-Ersteller (Annuitätendarlehen) | `PL-finance` | `—` | Brutto/Netto — enum "finance" |
| 38 | Mehrwertsteuer-Rechner (Brutto/Netto) | `PL-finance` | `—` | Steuerrechner — enum "finance" |
| 39 | Rabatt-Rechner (Preis nach X % Rabatt) | `PL-finance` | `—` | Rentenrechner — enum "finance" |
| 40 | Skonto-Rechner | `PL-finance` | `—` | Sparplan — enum "finance" |
| 41 | ROI-Rechner (Return on Investment) | `PL-finance` | `—` | Waehrungsrechner — enum "finance" offline-Stichtag |
| 42 | Inflationsrechner (Kaufkraftverlust über Jahre) | `R-1` | `—` | Live-Aktien — Non-Negotiable #7 |
| 43 | Brutto-Netto-Gehaltsrechner | `PL-finance` | `—` | Inflation — enum "finance" |
| 44 | Stundenlohn zu Jahresgehalt Rechner | `PL-finance` | `—` | Rendite — enum "finance" |
| 45 | Währungsrechner (Echtzeit-Kurse) | `PL-finance` | `—` | ROI — enum "finance" |
| 46 | Kryptowährungs-Konverter (BTC, ETH etc.) | `T5` | `text` | Break-Even — Tier 5 |
| 47 | Aktien-Gewinn/Verlust-Rechner | `T5` | `text` | ROAS — Tier 5 |
| 48 | Dividenden-Rendite Rechner | `T5` | `text` | CPC/CPM/CPA — Tier 5 |
| 49 | Break-Even-Point Rechner | `T5` | `text` | Conversion-Rate — Tier 5 |
| 50 | Trinkgeld-Rechner (Split-Bill Funktion) | `T5` | `text` | A/B-Signifikanz — Tier 5 |
| 51 | Leasing-Faktor Rechner | `PL-finance` | `—` | Gehaltsrechner — enum "finance" |
| 52 | Grunderwerbsteuer-Rechner | `PL-finance` | `—` | Stundenlohn — enum "finance" |
| 53 | Erbschaftssteuer-Rechner | `PL-finance` | `—` | Trinkgeld — enum "finance" |
| 54 | KGV-Rechner (Kurs-Gewinn-Verhältnis) | `PL-finance` | `—` | Rabatt — enum "finance" |
| 55 | Cashflow-Rechner | `PL-finance` | `—` | Preisvergleich — enum "finance" |

### Physik & Einheiten (56–87)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 56 | Längen: Meter zu Fuß (Feet) | `BUILT` | `length` | meter-zu-fuss |
| 57 | Längen: Kilometer zu Meilen | `BUILT` | `length` | zentimeter-zu-zoll |
| 58 | Längen: Zoll (Inch) zu Zentimeter | `BUILT` | `distance` | kilometer-zu-meilen |
| 59 | Längen: Yard zu Meter | `T2` | `length` | fuss-zu-meter |
| 60 | Längen: Seemeilen zu Kilometer | `T2` | `length` | yard-zu-meter |
| 61 | Längen: Lichtjahre zu Kilometer | `T2` | `length` | millimeter-zu-zoll |
| 62 | Gewicht: Kilogramm zu Pfund (lbs) | `BUILT` | `weight` | kilogramm-zu-pfund |
| 63 | Gewicht: Gramm zu Unzen (oz) | `T2` | `weight` | pfund-zu-kilogramm |
| 64 | Gewicht: Milligramm zu Mikrogramm | `T2` | `weight` | gramm-zu-unze |
| 65 | Gewicht: Tonnen zu Kilogramm | `T2` | `weight` | stone-zu-kilogramm |
| 66 | Gewicht: Karat zu Gramm | `T2` | `volume` | liter-zu-gallonen |
| 67 | Volumen: Liter zu Gallonen (US) | `T2` | `volume` | gallonen-zu-liter |
| 68 | Volumen: Liter zu Gallonen (UK) | `PL-converter` | `—` | Kubikmeter zu Liter — volume-sub |
| 69 | Volumen: Milliliter zu Fluid Ounces | `BUILT` | `area` | quadratmeter-zu-quadratfuss |
| 70 | Volumen: Kubikmeter zu Kubikfuß | `T2` | `area` | hektar-zu-acre |
| 71 | Temperatur: Celsius zu Fahrenheit | `T2` | `area` | acre-zu-hektar |
| 72 | Temperatur: Kelvin zu Celsius | `BUILT` | `temperature` | celsius-zu-fahrenheit |
| 73 | Energie: Joule zu Kalorien | `T2` | `temperature` | fahrenheit-zu-celsius |
| 74 | Energie: Kilowattstunden zu Megajoule | `PL-science` | `—` | Kelvin-Rechner — enum "science" |
| 75 | Leistung: PS (Pferdestärke) zu Kilowatt (kW) | `T2` | `distance` | knoten-zu-kmh |
| 76 | Druck: Bar zu PSI | `T2` | `distance` | kmh-zu-mph |
| 77 | Druck: Pascal zu Bar | `T2` | `distance` | mph-zu-kmh |
| 78 | Geschwindigkeit: km/h zu mph | `PL-science` | `—` | Lichtgeschwindigkeit — enum "science" |
| 79 | Geschwindigkeit: Knoten zu km/h | `PL-science` | `—` | Druck (bar/psi) — enum "science" |
| 80 | Geschwindigkeit: Mach zu km/h | `PL-science` | `—` | Energie (J/kWh) — enum "science" |
| 81 | Drehmoment: Newtonmeter zu Fuß-Pfund | `PL-science` | `—` | Leistung (PS/kW) — enum "science" |
| 82 | Fläche: Hektar zu Quadratmeter | `PL-science` | `—` | Kraft (N/kgf) — enum "science" |
| 83 | Fläche: Acre zu Quadratmeter | `PL-science` | `—` | Drehmoment — enum "science" |
| 84 | Dichte-Rechner (Masse/Volumen) | `PL-science` | `—` | Frequenz — enum "science" |
| 85 | Kraft-Rechner (Masse * Beschleunigung) | `PL-science` | `—` | Wellenlaenge — enum "science" |
| 86 | Viskositäts-Konverter | `PL-science` | `—` | Elektrizitaet — enum "science" |
| 87 | Strahlendosis (Sievert zu Rem) | `PL-science` | `—` | Ohm-Gesetz — enum "science" |

### Text & Sprache (88–112)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 88 | Wort-Scrambler (Buchstabensalat lösen) | `T1` | `text` | zeichenzaehler |
| 89 | Anagramm-Generator | `NEW` | `text` | wortzaehler — net-new |
| 90 | Zeichenzähler (mit/ohne Leerzeichen) | `T1` | `text` | text-diff |
| 91 | Wortzähler | `NEW` | `text` | text-reverse — net-new |
| 92 | Zeilen- / Absatz-Zähler | `NEW` | `text` | gross-klein — net-new |
| 93 | Text umkehren (Rückwärts schreiben) | `NEW` | `text` | leerzeichen-entferner — net-new |
| 94 | Groß-/Kleinschreibung-Konverter (UPPERCASE, lowercase, Title Case) | `NEW` | `text` | zeilen-sortierer — net-new |
| 95 | Suchen & Ersetzen Tool | `NEW` | `text` | duplikate-entfernen — net-new |
| 96 | Lorem Ipsum Generator | `T6` | `text` | morsecode |
| 97 | Morsecode-Übersetzer | `T6` | `text` | caesar |
| 98 | Leet-Speak-Konverter | `T6` | `text` | rot13-rot47 |
| 99 | Phonetisches Alphabet Übersetzer (NATO) | `T6` | `text` | vigenere |
| 100 | Base64 En-/Decoder | `T6` | `text` | atbash |
| 101 | URL-Encoder / Decoder | `T6` | `text` | nato-phonetisch |
| 102 | HTML-Entities Konverter | `T6` | `text` | braille |
| 103 | Markdown zu HTML Konverter | `T6` | `text` | binaer-text |
| 104 | Text-Differenz-Checker (Diff-Tool) | `NEW` | `text` | base64-text |
| 105 | Wort-Häufigkeits-Analyse | `NEW` | `text` | url-encode-decode |
| 106 | Reimgenerator | `NEW` | `text` | html-entities |
| 107 | Palindrom-Prüfer | `NEW` | `text` | lorem-ipsum |
| 108 | Silbenzähler | `T5` | `text` | flesch |
| 109 | NATO-Alphabet Buchstabierer | `NEW` | `text` | silbenzaehler |
| 110 | Blindenschrift (Braille) Konverter | `NEW` | `text` | satz-zerlegung |
| 111 | Binär zu Text Konverter | `PL-niche` | `—` | Sprache erkennen — ML-nlp |
| 112 | Text zu Hexadezimal | `PL-niche` | `—` | Sentiment — ML-nlp |

### IT & Digitales (113–134)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 113 | Passwort-Generator (Spezialzeichen, Länge) | `T1` | `dev` | json-formatter |
| 114 | Passwort-Stärke-Checker | `NEW` | `dev` | json-minify |
| 115 | Binär zu Dezimal Rechner | `NEW` | `dev` | json-zu-xml |
| 116 | Dezimal zu Hexadezimal Rechner | `NEW` | `dev` | xml-zu-json |
| 117 | Hex zu RGB Konverter (Farben) | `T4` | `dev` | yaml-zu-json |
| 118 | RGB zu CMYK Konverter | `T4` | `dev` | toml-zu-json |
| 119 | RGB zu HEX Konverter | `T4` | `dev` | csv-zu-json |
| 120 | IP-Subnetz-Rechner | `T1` | `dev` | regex-tester |
| 121 | Bild-Seitenverhältnis (Aspect Ratio) Rechner | `T1` | `dev` | uuid-generator |
| 122 | Download-Zeit-Rechner (Bandbreite) | `T1` | `color` | hex-rgb |
| 123 | Datenmengen: MB zu MiB (1000 vs 1024) | `NEW` | `color` | rgb-hsl |
| 124 | Speicherplatz: Terabyte in Gigabyte | `NEW` | `color` | hex-zu-hsl |
| 125 | Unix-Timestamp zu Datum Konverter | `T4` | `color` | color-picker |
| 126 | JSON-Formatter / Validator | `NEW` | `dev` | jwt-decoder |
| 127 | XML zu JSON Konverter | `NEW` | `dev` | base64-encoder |
| 128 | SQL-Query-Formatter | `NEW` | `dev` | md5-hash |
| 129 | RegEx-Tester | `NEW` | `dev` | sha256-hash |
| 130 | Screen-Resolution-Checker (PPI/DPI) | `T4` | `dev` | htpasswd-generator |
| 131 | Favicon-Generator | `T4` | `dev` | cron-expression-builder |
| 132 | QR-Code Generator | `T4` | `dev` | gitignore-generator |
| 133 | Barcode-Generator | `T1` | `time` | unix-timestamp |
| 134 | CSS-Box-Shadow Generator | `BUILT` | `dev` | passwort-generator |

### Gesundheit & Fitness (135–151)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 135 | BMI (Body Mass Index) Rechner | `NEW` | `text` | bmi-rechner — einfach, enum "health" idealer |
| 136 | Kalorienbedarf-Rechner (Grundumsatz & Leistungsumsatz) | `PL-health` | `—` | Kalorienbedarf |
| 137 | Idealgewicht-Rechner | `PL-health` | `—` | Grundumsatz |
| 138 | Körperfettanteil-Rechner (Navy-Methode) | `PL-health` | `—` | Koerperfett |
| 139 | Waist-to-Hip Ratio Rechner | `PL-health` | `—` | Wasserbedarf |
| 140 | Wasserbedarf-Rechner (pro Tag) | `PL-health` | `—` | Schrittrechner |
| 141 | Schwangerschafts-Rechner (Geburtstermin) | `PL-health` | `—` | Laufzeit |
| 142 | Ovulations-Kalender | `PL-health` | `—` | Herzfrequenz-Zonen |
| 143 | Blutalkohol-Promille-Rechner (Widmark) | `PL-health` | `—` | Idealgewicht |
| 144 | Rauchfrei-Ersparnis-Rechner | `PL-health` | `—` | Schwangerschaftsrechner |
| 145 | Lebenserwartung-Schätzer | `PL-health` | `—` | Eisprung |
| 146 | Biorhythmus-Rechner | `R-3` | `—` | Medikamenten-Dosis — YMYL |
| 147 | Kalorienverbrauch nach Sportart (MET-Werte) | `R-3` | `—` | Blutdruck-Interpretation — YMYL |
| 148 | Trainingspuls-Rechner (Karvonen-Formel) | `PL-health` | `—` | Schlafrechner |
| 149 | 1-Rep-Max Rechner (Kraftsport) | `PL-health` | `—` | Trinkerinnerung |
| 150 | Marathon-Zielzeit-Rechner (Pace-Rechner) | `PL-health` | `—` | Promille |
| 151 | Schwimmzeit-Pace-Rechner | `R-3` | `—` | Alkohol-Abbau — forensisch/YMYL |

### Lifestyle, Hobby & Kochen (152–173)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 152 | Koch-Konverter: Gramm zu Tassen (Zutatenabhängig) | `NEW` | `volume` | tassen-zu-ml |
| 153 | Ofentemperaturen: Gasstufe zu Celsius/Fahrenheit | `NEW` | `volume` | essloeffel-zu-ml |
| 154 | Schuhgrößen-Konverter (EU, US, UK, CM) | `NEW` | `weight` | gramm-zu-tassen |
| 155 | Kleidergrößen international (Damen/Herren) | `PL-niche` | `—` | Ofentemperatur — enum "cooking" |
| 156 | Ringgrößen-Konverter | `PL-niche` | `—` | Garzeit — enum "cooking" |
| 157 | BH-Größen-Rechner | `PL-niche` | `—` | Rezept-Skalierer — enum "cooking" |
| 158 | Hutgrößen-Konverter | `PL-niche` | `—` | Pizza-Teig — enum "cooking" |
| 159 | Hundejahre zu Menschenjahre Rechner | `PL-niche` | `—` | Brot-Hydration — enum "cooking" |
| 160 | Katzenjahre zu Menschenjahre Rechner | `PL-niche` | `—` | Kaffee-Wasser — enum "cooking" |
| 161 | Kraftstoffverbrauch (l/100km zu mpg) | `PL-niche` | `—` | Cocktail — enum "cooking" |
| 162 | Stromkosten-Rechner für Haushaltsgeräte | `PL-niche` | `—` | Joule-Kalorien — "cooking"/"health" |
| 163 | CO2-Fußabdruck-Rechner (Flug/Auto) | `PL-niche` | `—` | Strick-Maschen — enum "niche" |
| 164 | Papierformate: A-Serie in Pixel (DPI-Wahl) | `PL-niche` | `—` | Naeh-Stoffverbrauch — enum "niche" |
| 165 | Maßstab-Rechner (z.B. Modellbau 1:43) | `PL-niche` | `—` | Garten-Flaeche — enum "niche" |
| 166 | Windstärke: Beaufort zu km/h | `PL-niche` | `—` | Pflanzabstand — enum "niche" |
| 167 | Brauwasser-Rechner (Hobby-Brauer) | `PL-niche` | `—` | Aquarium-Liter — enum "niche" |
| 168 | E-Liquid-Mischrechner (Vaping) | `PL-niche` | `—` | Pool-Chemie — enum "niche" |
| 169 | Häkel-Nadelstärken-Konverter | `PL-niche` | `—` | Heizkosten — enum "niche" |
| 170 | Garn-Lauflängen-Rechner | `PL-niche` | `—` | Stromkosten — enum "niche" |
| 171 | Aquarium-Volumen-Rechner | `PL-niche` | `—` | Spritverbrauch — enum "automotive" |
| 172 | Teichpumpen-Leistungsrechner | `PL-niche` | `—` | Reise-Distanz — enum "niche" |
| 173 | Pflanzen-Dünge-Rechner | `PL-niche` | `—` | Tanken-EU — enum "niche" |

### Zeit & Astronomie (174–187)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 174 | Alter-Rechner (in Tagen, Wochen, Monaten) | `T1` | `time` | unix-timestamp |
| 175 | Countdown-Timer-Ersteller | `NEW` | `time` | zeitzonen-konverter |
| 176 | Zeitzonen-Konverter (Weltzeituhr) | `NEW` | `time` | datumsdifferenz |
| 177 | Arbeitstage-Rechner (zwischen zwei Daten) | `NEW` | `time` | alters-rechner |
| 178 | Datums-Addierer (Datum + X Tage) | `NEW` | `time` | arbeitstage-rechner |
| 179 | Mondphasen-Kalender | `NEW` | `time` | countdown |
| 180 | Sonnenaufgang / Sonnenuntergang Rechner | `NEW` | `time` | stunden-minuten |
| 181 | Sternzeichen-Rechner | `T6` | `time` | kalender-greg-jul |
| 182 | Chinesisches Horoskop Rechner | `PL-niche` | `—` | Mondphasen — "science" |
| 183 | Römische Zahlen zu Dezimal | `PL-niche` | `—` | Sonnenauf/untergang — "science" |
| 184 | Dezimal zu Römische Zahlen | `PL-niche` | `—` | Sternbilder — "niche" |
| 185 | Zeitstempel-Differenz (Stunden:Minuten zwischen zwei Zeiten) | `T6` | `text` | sternzeichen |
| 186 | Planeten-Gewichtsrechner (Dein Gewicht auf dem Mars etc.) | `PL-niche` | `—` | Chin. Sternzeichen — "niche" |
| 187 | Interstellare Entfernungsrechner | `PL-niche` | `—` | Namenstag — "niche" |

### Nischen & Spezial-Tools (188–200)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 188 | Schallpegel (dB) Addierer | `PL-niche` | `—` | IBAN — "finance"/"validator" |
| 189 | Belichtungszeit-Rechner (Fotografie) | `PL-niche` | `—` | BIC-Validator — "finance" |
| 190 | Schärfentiefe-Rechner (DoF für Kameras) | `PL-niche` | `—` | Kreditkarten-Luhn — "validator" |
| 191 | Goldpreis-Rechner (nach Gramm & Karat) | `PL-niche` | `—` | VIN-Decoder — "automotive" |
| 192 | Silberpreis-Rechner | `PL-niche` | `—` | ISBN — "validator" |
| 193 | Edelstein-Gewichtsschätzer (nach Abmessung) | `PL-niche` | `—` | EAN-Barcode — "validator" |
| 194 | Fliesenbedarf-Rechner (für Räume) | `PL-niche` | `—` | QR-Code — "generator" |
| 195 | Wandfarben-Bedarfsrechner (Liter pro m²) | `PL-niche` | `—` | Barcode — "generator" |
| 196 | Heizöl-Verbrauchsprognose | `PL-niche` | `—` | Slugify — "text" |
| 197 | Brennholz-Energiewert-Vergleicher | `NEW` | `text` | zahlwort |
| 198 | Haustier-Futter-Rechner (nach Gewicht) | `NEW` | `text` | roemische-zahlen |
| 199 | Rasenaussaat-Mengenrechner | `PL-niche` | `—` | Telefon-Vorwahl |
| 200 | Schallgeschwindigkeit-Konverter (in verschiedenen Medien) | `PL-niche` | `—` | PLZ-Lookup |

---

## Detail — Liste B (User #201–1002)

### Erweiterte Mathematik & Algebra (201–250)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 201 | Determinantenrechner (2x2, 3x3) | `PL-math` | `—` | Enum-Ext "math" |
| 202 | Vektor-Kreuzprodukt-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 203 | Vektor-Skalarprodukt-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 204 | Betrag eines Vektors (Länge) | `PL-math` | `—` | Enum-Ext "math" |
| 205 | Matrix-Multiplikations-Tool | `PL-math` | `—` | Enum-Ext "math" |
| 206 | Matrix-Invertierungs-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 207 | Lineare Gleichungssysteme Löser (2 Unbekannte) | `PL-math` | `—` | Enum-Ext "math" |
| 208 | Lineare Gleichungssysteme Löser (3 Unbekannte) | `PL-math` | `—` | Enum-Ext "math" |
| 209 | Quadratische Gleichungen (Mitternachtsformel) | `PL-math` | `—` | Enum-Ext "math" |
| 210 | Kubische Gleichungen Löser | `PL-math` | `—` | Enum-Ext "math" |
| 211 | Logarithmus Dualis (Basis 2) | `PL-math` | `—` | Enum-Ext "math" |
| 212 | Natürlicher Logarithmus (ln) | `PL-math` | `—` | Enum-Ext "math" |
| 213 | Exponentieller Wachstumsrechner | `PL-math` | `—` | Enum-Ext "math" |
| 214 | Halbwertszeit-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 215 | Arithmetische Folgen-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 216 | Geometrische Folgen-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 217 | Komplexe Zahlen: Addition/Subtraktion | `PL-math` | `—` | Enum-Ext "math" |
| 218 | Komplexe Zahlen: Polar- in kartesische Form | `PL-math` | `—` | Enum-Ext "math" |
| 219 | Hexagonalzahlen-Generator | `PL-math` | `—` | Enum-Ext "math" |
| 220 | Dreieckszahlen-Generator | `PL-math` | `—` | Enum-Ext "math" |
| 221 | Primzahlzwillinge-Finder | `PL-math` | `—` | Enum-Ext "math" |
| 222 | Modulo-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 223 | Umrechner: Römisch zu Arabisch (erweitert) | `PL-math` | `—` | Enum-Ext "math" |
| 224 | Umrechner: Ägyptische Hieroglyphen-Zahlen | `PL-math` | `—` | Enum-Ext "math" |
| 225 | Umrechner: Maya-Zahlen | `PL-math` | `—` | Enum-Ext "math" |
| 226 | Permutationen-Rechner (ohne Wiederholung) | `PL-math` | `—` | Enum-Ext "math" |
| 227 | Permutationen-Rechner (mit Wiederholung) | `PL-math` | `—` | Enum-Ext "math" |
| 228 | Lineare Regression-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 229 | Korrelationskoeffizient-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 230 | Chi-Quadrat-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 231 | Normalverteilungs-Rechner (Z-Score) | `PL-math` | `—` | Enum-Ext "math" |
| 232 | Konfidenzintervall-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 233 | Binomialverteilung-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 234 | Poisson-Verteilung-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 235 | Bayes-Theorem-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 236 | Goldener Schnitt (Proportions-Rechner) | `PL-math` | `—` | Enum-Ext "math" |
| 237 | Silver Ratio Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 238 | Überprüfung auf perfekte Zahlen | `PL-math` | `—` | Enum-Ext "math" |
| 239 | Quersummen-Rechner | `PL-math` | `—` | Enum-Ext "math" |
| 240 | Zahl in Worten Generator (Deutsch) | `PL-math` | `—` | Enum-Ext "math" |
| 241 | Zahl in Worten Generator (Englisch) | `PL-math` | `—` | Enum-Ext "math" |
| 242 | Zahl in Worten Generator (Französisch) | `PL-math` | `—` | Enum-Ext "math" |
| 243 | Bogenlänge eines Kreissegments | `PL-math` | `—` | Enum-Ext "math" |
| 244 | Kreissektor-Flächenrechner | `PL-math` | `—` | Enum-Ext "math" |
| 245 | Ellipsoid-Volumenrechner | `PL-math` | `—` | Enum-Ext "math" |
| 246 | Torus-Volumenrechner | `PL-math` | `—` | Enum-Ext "math" |
| 247 | Ikosaeder-Oberflächenrechner | `PL-math` | `—` | Enum-Ext "math" |
| 248 | Tetraeder-Volumenrechner | `PL-math` | `—` | Enum-Ext "math" |
| 249 | Sehnenlänge am Kreis | `PL-math` | `—` | Enum-Ext "math" |
| 250 | Radiant zu Neugrad (Gon) | `PL-math` | `—` | Enum-Ext "math" |

### Naturwissenschaften: Physik & Chemie (251–300)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 251 | Ideales Gasgesetz-Rechner (pV=nR*T) | `PL-science` | `—` | Enum-Ext "science" |
| 252 | Molmassen-Rechner (Molekulargewicht) | `PL-science` | `—` | Enum-Ext "science" |
| 253 | Molalität zu Molarität Konverter | `PL-science` | `—` | Enum-Ext "science" |
| 254 | pH-Wert Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 255 | pOH-Wert Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 256 | Stoffmengenkonzentration-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 257 | Verdünnungsrechner (C1V1 = C2V2) | `PL-science` | `—` | Enum-Ext "science" |
| 258 | Barometrische Höhenformel (Luftdruck) | `PL-science` | `—` | Enum-Ext "science" |
| 259 | Kinetische Energie Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 260 | Potenzielle Energie Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 261 | Zentripetalkraft-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 262 | Reibungskraft-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 263 | Ohmsches Gesetz (U, I, R) | `PL-science` | `—` | Enum-Ext "science" |
| 264 | Elektrische Arbeit (Wh) zu Leistung (W) | `PL-science` | `—` | Enum-Ext "science" |
| 265 | Widerstandsberechnung (Reihe/Parallel) | `PL-science` | `—` | Enum-Ext "science" |
| 266 | Kondensatorkapazität-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 267 | Induktivitäts-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 268 | Schallgeschwindigkeit in Wasser | `PL-science` | `—` | Enum-Ext "science" |
| 269 | Schallgeschwindigkeit in Stahl | `PL-science` | `—` | Enum-Ext "science" |
| 270 | Dopplereffekt-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 271 | Lichtbrechung (Snelliussches Gesetz) | `PL-science` | `—` | Enum-Ext "science" |
| 272 | Photonenenergie-Rechner (Planck) | `PL-science` | `—` | Enum-Ext "science" |
| 273 | Spezifische Wärmekapazität | `PL-science` | `—` | Enum-Ext "science" |
| 274 | Wärmeausdehnung (Längenänderung) | `PL-science` | `—` | Enum-Ext "science" |
| 275 | Newton'sches Abkühlungsgesetz | `PL-science` | `—` | Enum-Ext "science" |
| 276 | Periodensystem-Element-Suche | `PL-science` | `—` | Enum-Ext "science" |
| 277 | Dichte-Konverter (g/cm³ zu kg/m³) | `PL-science` | `—` | Enum-Ext "science" |
| 278 | Radioaktiver Zerfall (Restmenge) | `PL-science` | `—` | Enum-Ext "science" |
| 279 | Elektrische Feldstärke | `PL-science` | `—` | Enum-Ext "science" |
| 280 | Magnetische Flussdichte | `PL-science` | `—` | Enum-Ext "science" |
| 281 | Drehmoment-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 282 | Trägheitsmoment-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 283 | Wurfbewegung (Schiefer Wurf) | `PL-science` | `—` | Enum-Ext "science" |
| 284 | Freier Fall (Zeit/Geschwindigkeit) | `PL-science` | `—` | Enum-Ext "science" |
| 285 | Schwingungsdauer (Pendel) | `PL-science` | `—` | Enum-Ext "science" |
| 286 | Federkonstante (Hookesches Gesetz) | `PL-science` | `—` | Enum-Ext "science" |
| 287 | Reynolds-Zahl (Strömungslehre) | `PL-science` | `—` | Enum-Ext "science" |
| 288 | Auftriebskraft (Archimedes) | `PL-science` | `—` | Enum-Ext "science" |
| 289 | Kapillardruck-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 290 | Photon-Wellenlänge zu Frequenz | `PL-science` | `—` | Enum-Ext "science" |
| 291 | Schwarzkörperstrahlung (Wien'sches Gesetz) | `PL-science` | `—` | Enum-Ext "science" |
| 292 | Brechungsindex-Konverter | `PL-science` | `—` | Enum-Ext "science" |
| 293 | Gravitationskraft zwischen zwei Körpern | `PL-science` | `—` | Enum-Ext "science" |
| 294 | Fluchtgeschwindigkeit (Planeten) | `PL-science` | `—` | Enum-Ext "science" |
| 295 | Astronomische Einheit zu Kilometer | `PL-science` | `—` | Enum-Ext "science" |
| 296 | Parsec zu Lichtjahre | `PL-science` | `—` | Enum-Ext "science" |
| 297 | Absolute Helligkeit (Sterne) | `PL-science` | `—` | Enum-Ext "science" |
| 298 | Hubble-Gesetz (Expansion) | `PL-science` | `—` | Enum-Ext "science" |
| 299 | Massendefekt-Rechner | `PL-science` | `—` | Enum-Ext "science" |
| 300 | Lorentz-Faktor (Relativität) | `PL-science` | `—` | Enum-Ext "science" |

### Ingenieurwesen & Technik (301–350)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 301 | Getriebeübersetzung-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 302 | Riemenlängen-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 303 | Kettenlängen-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 304 | Biegespannung-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 305 | Torsionsspannung-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 306 | Rohrfluss-Rechner (Hazen-Williams) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 307 | Drahtquerschnitt zu Durchmesser | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 308 | AWG (American Wire Gauge) zu mm² | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 309 | Zulässige Belastung (Sicherheitsfaktor) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 310 | Wärmeübergangskoeffizient | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 311 | Hydraulikzylinder-Kraft | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 312 | Pneumatik-Luftverbrauch | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 313 | CNC-Schnittgeschwindigkeit (U/min) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 314 | CNC-Vorschubgeschwindigkeit | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 315 | Schrauben-Anziehdrehmoment | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 316 | Passungsrechner (ISO-Toleranzen) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 317 | Oberflächenrauheit (Ra zu Rz) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 318 | Schwingungsisolierung-Wirkungsgrad | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 319 | Wirkungsgrad von Motoren | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 320 | Pumpenleistung-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 321 | Lüfter-Gesetze (Volumenstrom) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 322 | Wärmetauscher-Effizienz | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 323 | Kältemittel-Druck/Temperatur-Tabelle | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 324 | Dampfdruck-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 325 | Taupunkt-Rechner (Spezialisiert) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 326 | Luftfeuchtigkeit (Relativ zu Absolut) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 327 | Enthalpie-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 328 | Schallabsorptionsgrad | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 329 | Widerstand von Leiterbahnen (PCB) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 330 | Impedanz-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 331 | Spannungsabfall am Kabel | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 332 | Batterielaufzeit (Ah zu Stunden) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 333 | USV-Laufzeit (Back-up) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 334 | Transformator-Windungszahl | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 335 | Schrittmotor-Auflösung | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 336 | Förderband-Kapazität | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 337 | Lagerlebensdauer (L10) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 338 | Zahnrad-Modul-Rechner | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 339 | Zahnrad-Teilkreisdurchmesser | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 340 | Keilnuten-Abmessungen | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 341 | Federkraft-Rechner (Zug/Druck) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 342 | Erwärmung von Schaltschränken | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 343 | Druckverlust in Armaturen | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 344 | Durchflusskoeffizient (Kv-Wert) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 345 | Tankinhalt (liegender Zylinder) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 346 | Tankinhalt (ovaler Tank) | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 347 | Schweißnaht-Festigkeit | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 348 | Klebeflächen-Belastung | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 349 | Nietverbindungs-Scherkraft | `PL-engineering` | `—` | Enum-Ext "engineering" |
| 350 | Wellen-Kritische Drehzahl | `PL-engineering` | `—` | Enum-Ext "engineering" |

### Bauwesen & Heimwerken (351–410)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 351 | Betonmischungs-Verhältnis (Zement/Sand/Kies) | `PL-construction` | `—` | Enum-Ext "construction" |
| 352 | Zementbedarfs-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 353 | Estrich-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 354 | Mauermörtel-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 355 | Steinbedarf für Mauern (pro m²) | `PL-construction` | `—` | Enum-Ext "construction" |
| 356 | Putzverbrauch-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 357 | Gipskartonplatten-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 358 | Trockenbau-Profile (Ständerwerk) | `PL-construction` | `—` | Enum-Ext "construction" |
| 359 | Dachneigung (Grad in Prozent) | `PL-construction` | `—` | Enum-Ext "construction" |
| 360 | Dachneigung (Steigung in mm/m) | `PL-construction` | `—` | Enum-Ext "construction" |
| 361 | Dachziegel-Bedarf | `PL-construction` | `—` | Enum-Ext "construction" |
| 362 | Sparrenlängen-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 363 | Treppen-Steigungsverhältnis (Schrittmaßregel) | `PL-construction` | `—` | Enum-Ext "construction" |
| 364 | Treppenwangen-Länge | `PL-construction` | `—` | Enum-Ext "construction" |
| 365 | Bodenbelag: Parkett/Laminat Verschnitt-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 366 | Fugenmörtel-Bedarf (Fliesen) | `PL-construction` | `—` | Enum-Ext "construction" |
| 367 | Fliesengrößen-Optimierer | `PL-construction` | `—` | Enum-Ext "construction" |
| 368 | Dämmwert-Rechner (U-Wert) | `PL-construction` | `—` | Enum-Ext "construction" |
| 369 | Heizlast-Rechner pro Raum | `PL-construction` | `—` | Enum-Ext "construction" |
| 370 | Heizkörper-Dimensionierung | `PL-construction` | `—` | Enum-Ext "construction" |
| 371 | Fußbodenheizung-Rohrlänge | `PL-construction` | `—` | Enum-Ext "construction" |
| 372 | Klimaanlagen-BTU-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 373 | Lichtbedarf (Lux zu Lumen) | `PL-construction` | `—` | Enum-Ext "construction" |
| 374 | Anzahl LED-Spots pro Raum | `PL-construction` | `—` | Enum-Ext "construction" |
| 375 | Zaunpfosten-Abstand-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 376 | Maschendrahtzaun-Länge | `PL-construction` | `—` | Enum-Ext "construction" |
| 377 | Holzzaun-Materialliste | `PL-construction` | `—` | Enum-Ext "construction" |
| 378 | Erdaushub-Volumen (Baugrube) | `PL-construction` | `—` | Enum-Ext "construction" |
| 379 | Schotter/Kies-Gewicht (nach Volumen) | `PL-construction` | `—` | Enum-Ext "construction" |
| 380 | Pflasterstein-Bedarf | `PL-construction` | `—` | Enum-Ext "construction" |
| 381 | Terrassen-Dielen-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 382 | Unterkonstruktion-Hölzer-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 383 | Pool-Füllzeit-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 384 | Pool-Chemie (Chlor-Dosierung) | `R-3` | `—` | YMYL — Medizin |
| 385 | Pool-Salzgehalt-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 386 | Farbmisch-Rechner (CMYK zu RAL) | `PL-construction` | `—` | Enum-Ext "construction" |
| 387 | Tapezier-Rollen-Rechner (mit Musterversatz) | `PL-construction` | `—` | Enum-Ext "construction" |
| 388 | Heizöl-Restmengen-Rechner (Peilstab) | `PL-construction` | `—` | Enum-Ext "construction" |
| 389 | Holzfeuchte-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 390 | Balken-Traglast-Rechner (Holz) | `PL-construction` | `—` | Enum-Ext "construction" |
| 391 | Stahlträger-Gewichtsrechner (HEB/HEA) | `PL-construction` | `—` | Enum-Ext "construction" |
| 392 | Bewehrungsstahl-Gewicht (kg/m) | `PL-construction` | `—` | Enum-Ext "construction" |
| 393 | Schraubendübel-Auszugskraft | `PL-construction` | `—` | Enum-Ext "construction" |
| 394 | Belastung von Dübeln in Porenbeton | `PL-construction` | `—` | Enum-Ext "construction" |
| 395 | Glasgewicht-Rechner (ESG/VSG) | `PL-construction` | `—` | Enum-Ext "construction" |
| 396 | Fenster-U-Wert (Glas + Rahmen) | `PL-construction` | `—` | Enum-Ext "construction" |
| 397 | Silikonverbrauch (Laufmeter Fuge) | `PL-construction` | `—` | Enum-Ext "construction" |
| 398 | Regenrinnen-Dimensionierung | `PL-construction` | `—` | Enum-Ext "construction" |
| 399 | Versickerungs-Rechner (Rigole) | `PL-construction` | `—` | Enum-Ext "construction" |
| 400 | Solarthermie-Ertragsschätzung | `PL-construction` | `—` | Enum-Ext "construction" |
| 401 | Photovoltaik-Eigenverbrauchsanteil | `PL-construction` | `—` | Enum-Ext "construction" |
| 402 | Batterie-Speichergröße für PV | `PL-construction` | `—` | Enum-Ext "construction" |
| 403 | Schornstein-Zug-Rechner | `PL-construction` | `—` | Enum-Ext "construction" |
| 404 | Kaminholz-Trocknungsdauer | `PL-construction` | `—` | Enum-Ext "construction" |
| 405 | Brennholz-Raummeter zu Festmeter | `PL-construction` | `—` | Enum-Ext "construction" |
| 406 | Pellets-Lagerraum-Volumen | `PL-construction` | `—` | Enum-Ext "construction" |
| 407 | Erdkabel-Verlegetiefe-Check | `PL-construction` | `—` | Enum-Ext "construction" |
| 408 | Strombelastbarkeit (Verlegeart) | `PL-construction` | `—` | Enum-Ext "construction" |
| 409 | FI-Schalter-Prüfstrom | `PL-construction` | `—` | Enum-Ext "construction" |
| 410 | Blitzschutz-Schutzradius | `PL-construction` | `—` | Enum-Ext "construction" |

### IT & Web-Entwicklung (411–470)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 411 | SHA-1 Hash Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 412 | SHA-256 Hash Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 413 | SHA-512 Hash Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 414 | MD5 Hash Generator (für Legacy) | `T4` | `dev` | IT-Cluster — Tier 4 |
| 415 | Bcrypt Passwort-Hasher | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 416 | Argon2 Hasher | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 417 | HMAC Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 418 | AES Verschlüsselung/Entschlüsselung (Text) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 419 | RSA Schlüsselpaar-Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 420 | UUID/GUID Generator (V1, V4) | `T4` | `dev` | IT-Cluster — Tier 4 |
| 421 | Nanoid Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 422 | JWT (JSON Web Token) Debugger | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 423 | Cron-Job-Ausdruck-Erklärer | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 424 | Cron-Job-Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 425 | .htaccess Redirect-Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 426 | .htaccess Passwortschutz (.htpasswd) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 427 | Robots.txt Generator | `T4` | `dev` | in queue als robots-txt-generator |
| 428 | Sitemap.xml Generator | `T4` | `dev` | in queue als sitemap-xml-generator |
| 429 | Open Graph Meta Tag Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 430 | Twitter Card Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 431 | Schema.org (JSON-LD) Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 432 | Canonical Link Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 433 | Hreflang Tag Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 434 | Favicon-Set Generator (Alle Größen) | `T4` | `dev` | IT-Cluster — Tier 4 |
| 435 | CSS-Gradient Generator | `T4` | `dev` | in queue als css-gradient-generator |
| 436 | CSS-Flexbox Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 437 | CSS-Grid Layout Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 438 | CSS-Border-Radius (Fancy Shapes) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 439 | CSS-Text-Shadow Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 440 | CSS-Filter-Effekte (Blur, Sepia etc.) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 441 | CSS-Animation Keyframes Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 442 | JavaScript EventListener Code-Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 443 | jQuery zu Vanilla JS Konverter | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 444 | SQL Escape String Tool | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 445 | PHP Serialized Data zu JSON | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 446 | YAML zu JSON Konverter | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 447 | TOML zu JSON Konverter | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 448 | CSV zu HTML Table Konverter | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 449 | CSV zu JSON Konverter | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 450 | JSON zu CSV Konverter | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 451 | Excel/XLSX zu JSON | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 452 | XML-Formatter (Pretty Print) | `T4` | `dev` | IT-Cluster — Tier 4 |
| 453 | GraphQL Schema Visualizer | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 454 | Regex Cheat-Sheet Tool | `R-5` | `—` | Security-Misuse |
| 455 | ASCII-Art Text-Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 456 | Unicode-Zeichen-Finder | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 457 | HTML Canvas Code-Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 458 | SVG Path Generator | `T4` | `dev` | IT-Cluster — Tier 4 |
| 459 | SVG zu PNG Konverter (Browser-seitig) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 460 | Lottie-Animation Vorschau | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 461 | Web-Safe-Fonts Check | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 462 | Google Fonts Pairings Empfehlungen | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 463 | HTTP Header Checker | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 464 | DNS Lookup (A, MX, CNAME, TXT) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 465 | WHOIS Abfrage | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 466 | Port-Scanner (Standard-Ports) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 467 | Website-Ladezeit-Simulator (3G/4G) | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 468 | Ping-Test Tool | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 469 | Traceroute-Visualisierer | `T4` | `dev` | IT-Cluster — default Tier 4 |
| 470 | E-Mail-Header-Analysator | `T4` | `dev` | IT-Cluster — default Tier 4 |

### Gesundheit, Medizin & Pharmazie (471–530)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 471 | Grundumsatz (Harris-Benedict) | `PL-health` | `—` | Enum-Ext "health" |
| 472 | Grundumsatz (Mifflin-St Jeor) | `PL-health` | `—` | Enum-Ext "health" |
| 473 | Körperoberfläche-Rechner (Mosteller) | `PL-health` | `—` | Enum-Ext "health" |
| 474 | Körperoberfläche-Rechner (DuBois) | `PL-health` | `—` | Enum-Ext "health" |
| 475 | Kreatinin-Clearance (Cockcroft-Gault) | `PL-health` | `—` | Enum-Ext "health" |
| 476 | GFR-Rechner (Nierenfunktion) | `PL-health` | `—` | Enum-Ext "health" |
| 477 | LDL-Cholesterin-Rechner (Friedewald) | `PL-health` | `—` | Enum-Ext "health" |
| 478 | MAP (Mittlerer Arterieller Blutdruck) | `PL-health` | `—` | Enum-Ext "health" |
| 479 | Pulsdruck-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 480 | Ankle-Brachial-Index (ABI) | `PL-health` | `—` | Enum-Ext "health" |
| 481 | Burn-out-Risiko-Selbsttest (Indikator) | `PL-health` | `—` | Enum-Ext "health" |
| 482 | Koffein-Halbwertszeit-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 483 | Abbauzeit von Medikamenten (Allgemein) | `R-3` | `—` | YMYL — Medizin |
| 484 | Nikotin-Abhängigkeit-Test (Fagerström) | `PL-health` | `—` | Enum-Ext "health" |
| 485 | Schlafzyklus-Wecker (Wann aufstehen?) | `PL-health` | `—` | Enum-Ext "health" |
| 486 | Power-Nap-Timer | `PL-health` | `—` | Enum-Ext "health" |
| 487 | Flüssigkeitsbilanz-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 488 | Blutzucker-Konverter (mg/dl zu mmol/l) | `PL-health` | `—` | Enum-Ext "health" |
| 489 | HbA1c-Umrechner (Durchschnittszucker) | `PL-health` | `—` | Enum-Ext "health" |
| 490 | Insulin-Dosis-Rechner (Korrekturfaktor) | `PL-health` | `—` | Enum-Ext "health" |
| 491 | BE-Rechner (Broteinheiten für Diabetiker) | `PL-health` | `—` | Enum-Ext "health" |
| 492 | KE-Rechner (Kohlenhydrateinheiten) | `PL-health` | `—` | Enum-Ext "health" |
| 493 | Makronährstoff-Verteilung (Low Carb/High Protein) | `PL-health` | `—` | Enum-Ext "health" |
| 494 | Omega-3 zu Omega-6 Verhältnis | `PL-health` | `—` | Enum-Ext "health" |
| 495 | Aminosäuren-Profil-Checker | `PL-health` | `—` | Enum-Ext "health" |
| 496 | Vitamin-D-Bedarf-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 497 | Magnesium-Dosierungs-Rechner | `R-3` | `—` | YMYL — Medizin |
| 498 | Zink-Kupfer-Verhältnis | `PL-health` | `—` | Enum-Ext "health" |
| 499 | Eisen-Sättigung (Transferrin) | `PL-health` | `—` | Enum-Ext "health" |
| 500 | Sehstärke-Konverter (Dioptrien zu Prozent) | `PL-health` | `—` | Enum-Ext "health" |
| 501 | Sehschärfe-Umrechner (Snellen zu LogMAR) | `PL-health` | `—` | Enum-Ext "health" |
| 502 | Brillen-Scheitelbrechwert | `PL-health` | `—` | Enum-Ext "health" |
| 503 | Kontaktlinsen-Radius-Konverter | `PL-health` | `—` | Enum-Ext "health" |
| 504 | Hörverlust-Prozentrechner | `PL-health` | `—` | Enum-Ext "health" |
| 505 | Menstruationszyklus-Prognose | `PL-health` | `—` | Enum-Ext "health" |
| 506 | Fruchtbare Tage Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 507 | Menopause-Indikator-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 508 | Kinder-Größen-Prognose (Elternformel) | `PL-health` | `—` | Enum-Ext "health" |
| 509 | APGAR-Score Rechner (Neugeborene) | `PL-health` | `—` | Enum-Ext "health" |
| 510 | Milchmenge-Rechner (Säuglinge) | `PL-health` | `—` | Enum-Ext "health" |
| 511 | Perzentilenrechner (Wachstum Kind) | `PL-health` | `—` | Enum-Ext "health" |
| 512 | Impf-Erinnerungs-Planer | `PL-health` | `—` | Enum-Ext "health" |
| 513 | Pollenflug-Vorhersage (API-Anbindung) | `PL-health` | `—` | Enum-Ext "health" |
| 514 | UV-Index-Schutzzeit (nach Hauttyp) | `PL-health` | `—` | Enum-Ext "health" |
| 515 | Vitamin-C-Gehalt in Obst (Vergleich) | `PL-health` | `—` | Enum-Ext "health" |
| 516 | Ballaststoff-Zähler | `PL-health` | `—` | Enum-Ext "health" |
| 517 | Glykämischer Index Suche | `PL-health` | `—` | Enum-Ext "health" |
| 518 | Glykämische Last Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 519 | Purin-Rechner (Gicht-Prävention) | `PL-health` | `—` | Enum-Ext "health" |
| 520 | Oxalsäure-Checker (Nierensteine) | `PL-health` | `—` | Enum-Ext "health" |
| 521 | Alkohol-Kalorienrechner | `PL-health` | `—` | Enum-Ext "health" |
| 522 | Promille-Abbauzeit-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 523 | Raucher-Lungen-Alter-Schätzer | `PL-health` | `—` | Enum-Ext "health" |
| 524 | Schrittzähler in Kilometer | `PL-health` | `—` | Enum-Ext "health" |
| 525 | Schrittzähler in Kalorien | `PL-health` | `—` | Enum-Ext "health" |
| 526 | Sitz-Zeit-Kompensations-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 527 | Haltungsschaden-Risiko (Monitorhöhe) | `PL-health` | `—` | Enum-Ext "health" |
| 528 | Ergonomie-Rechner (Schreibtisch/Stuhl) | `PL-health` | `—` | Enum-Ext "health" |
| 529 | Atemfrequenz-Rechner | `PL-health` | `—` | Enum-Ext "health" |
| 530 | Ruhepuls-Klassifizierer | `PL-health` | `—` | Enum-Ext "health" |

### Finanzen, Recht & Steuern (531–580)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 531 | Erbschaftsteuer-Rechner (nach Verwandtschaftsgrad) | `PL-finance` | `—` | Enum-Ext "finance" |
| 532 | Schenkungsteuer-Freibetrag-Checker | `PL-finance` | `—` | Enum-Ext "finance" |
| 533 | Kirchensteuer-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 534 | Solidaritätszuschlag-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 535 | Dienstwagen-Versteuerung (1%-Regel) | `PL-finance` | `—` | Enum-Ext "finance" |
| 536 | Fahrtenbuch vs. Pauschale | `PL-finance` | `—` | Enum-Ext "finance" |
| 537 | Pendlerpauschale-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 538 | Homeoffice-Pauschale-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 539 | Arbeitszimmer-Absetzbarkeit | `PL-finance` | `—` | Enum-Ext "finance" |
| 540 | Einkommensteuer-Progressionsrechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 541 | Kalte Progression Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 542 | Abgeltungsteuer-Rechner (Kapitalerträge) | `PL-finance` | `—` | Enum-Ext "finance" |
| 543 | Kündigungsfrist-Rechner (Arbeitnehmer) | `PL-finance` | `—` | Enum-Ext "finance" |
| 544 | Kündigungsfrist-Rechner (Vermieter) | `PL-finance` | `—` | Enum-Ext "finance" |
| 545 | Abfindungsrechner (Netto nach Fünftelregelung) | `PL-finance` | `—` | Enum-Ext "finance" |
| 546 | Elterngeld-Rechner (Basiselterngeld) | `PL-finance` | `—` | Enum-Ext "finance" |
| 547 | ElterngeldPlus-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 548 | Kindergeld-Auszahlungstermine | `PL-finance` | `—` | Enum-Ext "finance" |
| 549 | Unterhaltsrechner (Düsseldorfer Tabelle) | `PL-finance` | `—` | Enum-Ext "finance" |
| 550 | Selbstbehalt-Rechner (Unterhalt) | `PL-finance` | `—` | Enum-Ext "finance" |
| 551 | Pfändungsrechner (Pfändungstabelle) | `PL-finance` | `—` | Enum-Ext "finance" |
| 552 | Restschuldbefreiung-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 553 | Verzugszinsen-Rechner (Basiszinssatz) | `PL-finance` | `—` | Enum-Ext "finance" |
| 554 | Notarkosten-Rechner (Immobilienkauf) | `PL-finance` | `—` | Enum-Ext "finance" |
| 555 | Grundbuchkosten-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 556 | Maklerprovision-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 557 | Rendite einer Eigentumswohnung | `PL-finance` | `—` | Enum-Ext "finance" |
| 558 | Mietrendite (Brutto vs. Netto) | `PL-finance` | `—` | Enum-Ext "finance" |
| 559 | Annuitätendarlehen vs. Tilgungsdarlehen | `PL-finance` | `—` | Enum-Ext "finance" |
| 560 | Vorfälligkeitsentschädigung-Schätzer | `PL-finance` | `—` | Enum-Ext "finance" |
| 561 | Bausparsummen-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 562 | Riester-Zulagen-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 563 | Rürup-Rente-Steuervorteil | `PL-finance` | `—` | Enum-Ext "finance" |
| 564 | Rentenschätzrechner (Gesetzlich) | `PL-finance` | `—` | Enum-Ext "finance" |
| 565 | Rentenlücke-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 566 | 401k/IRA-Äquivalent (US-Markt Fokus) | `PL-finance` | `—` | Enum-Ext "finance" |
| 567 | Kurzarbeitergeld-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 568 | Arbeitslosengeld I Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 569 | Bürgergeld-Rechner (Indikator) | `PL-finance` | `—` | Enum-Ext "finance" |
| 570 | Wohngeld-Anspruch-Check | `PL-finance` | `—` | Enum-Ext "finance" |
| 571 | Rundfunkbeitrag-Befreiung-Check | `PL-finance` | `—` | Enum-Ext "finance" |
| 572 | Vereinsbeitrag-Jahreskosten | `PL-finance` | `—` | Enum-Ext "finance" |
| 573 | Hundesteuer-Rechner (nach Stadt) | `PL-finance` | `—` | Enum-Ext "finance" |
| 574 | KFZ-Steuer (nach CO2-Ausstoß) | `PL-finance` | `—` | Enum-Ext "finance" |
| 575 | LKW-Maut-Rechner (Deutschland) | `PL-finance` | `—` | Enum-Ext "finance" |
| 576 | Reisekostenabrechnung (Verpflegungspauschale) | `PL-finance` | `—` | Enum-Ext "finance" |
| 577 | Übernachtungspauschale (Inland/Ausland) | `PL-finance` | `—` | Enum-Ext "finance" |
| 578 | Währungsumrechner Historisch (z.B. DM zu Euro) | `PL-finance` | `—` | Enum-Ext "finance" |
| 579 | Gold-An- und Verkauf Spread-Rechner | `PL-finance` | `—` | Enum-Ext "finance" |
| 580 | ETF-Sparplan-Rechner (mit TER-Berücksichtigung) | `PL-finance` | `—` | Enum-Ext "finance" |

### Sport, Freizeit & Hobbies (581–640)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 581 | Golf-Handicap-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 582 | Golf-Stableford-Punkte | `PL-sport` | `—` | Enum-Ext "sport" |
| 583 | Bowling-Schnitt-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 584 | Billard-Winkel-Rechner (Reflektion) | `PL-sport` | `—` | Enum-Ext "sport" |
| 585 | Dart-Checkout-Vorschlag (3-Dart-Finish) | `PL-sport` | `—` | Enum-Ext "sport" |
| 586 | Poker-Wahrscheinlichkeiten (Texas Hold'em) | `PL-sport` | `—` | Enum-Ext "sport" |
| 587 | Poker-Pot-Odds-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 588 | Schachturnier-Elo-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 589 | Tischtennis-Punkte-Rechner (TTR) | `PL-sport` | `—` | Enum-Ext "sport" |
| 590 | Fußball-Tabellenrechner (Was wäre wenn?) | `PL-sport` | `—` | Enum-Ext "sport" |
| 591 | Torquote-Rechner (Stürmer-Statistik) | `PL-sport` | `—` | Enum-Ext "sport" |
| 592 | Basketball-Effizienz-Rating (PER) | `PL-sport` | `—` | Enum-Ext "sport" |
| 593 | Running-Pace-Konverter (min/km zu km/h) | `PL-sport` | `—` | Enum-Ext "sport" |
| 594 | Cooper-Test-Auswertung | `PL-sport` | `—` | Enum-Ext "sport" |
| 595 | VO2max-Schätzer (Rockport-Test) | `PL-sport` | `—` | Enum-Ext "sport" |
| 596 | Triathlon-Split-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 597 | Radsport-Watt-Leistungsrechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 598 | FTP-Test-Auswerter (Radfahren) | `PL-sport` | `—` | Enum-Ext "sport" |
| 599 | Klettergrad-Konverter (UIAA, Französisch, Boulder) | `PL-sport` | `—` | Enum-Ext "sport" |
| 600 | Tauch-Nullzeit-Rechner (Dekompressions-Indikator) | `PL-sport` | `—` | Enum-Ext "sport" |
| 601 | Tauchflaschen-Atemgas-Vorrat | `PL-sport` | `—` | Enum-Ext "sport" |
| 602 | Modellbau-Maßstabsrechner (1:87, 1:160 etc.) | `PL-sport` | `—` | Enum-Ext "sport" |
| 603 | RC-Car-Geschwindigkeitsrechner (Motor/Übersetzung) | `PL-sport` | `—` | Enum-Ext "sport" |
| 604 | Drohnen-Flugzeit-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 605 | Angelschnur-Kapazität (Rolle) | `PL-sport` | `—` | Enum-Ext "sport" |
| 606 | Bleigießen-Mengenrechner (Vorfächer) | `PL-sport` | `—` | Enum-Ext "sport" |
| 607 | Strickmuster-Zunahme-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 608 | Häkel-Runden-Zähler | `PL-sport` | `—` | Enum-Ext "sport" |
| 609 | Stickgarn-Längen-Schätzer | `PL-sport` | `—` | Enum-Ext "sport" |
| 610 | Origami-Papier-Größenrechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 611 | Fotografie: Schärfentiefe (Depth of Field) | `PL-sport` | `—` | Enum-Ext "sport" |
| 612 | Fotografie: Hyperfokale Distanz | `PL-sport` | `—` | Enum-Ext "sport" |
| 613 | Fotografie: Belichtungskorrektur (ND-Filter) | `PL-sport` | `—` | Enum-Ext "sport" |
| 614 | Fotografie: Zeitraffer-Intervall-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 615 | Video: Bitrate-Rechner (Dateigröße) | `PL-sport` | `—` | Enum-Ext "sport" |
| 616 | Video: Bildrate-Zeitlupen-Konverter | `PL-sport` | `—` | Enum-Ext "sport" |
| 617 | Audio: BPM (Beats Per Minute) Tapper | `PL-sport` | `—` | Enum-Ext "sport" |
| 618 | Audio: Delay-Zeit zu Millisekunden (nach BPM) | `PL-sport` | `—` | Enum-Ext "sport" |
| 619 | Audio: Notenfrequenz-Rechner (A4=440Hz) | `PL-sport` | `—` | Enum-Ext "sport" |
| 620 | Audio: Samples zu Zeit (Samplerate) | `PL-sport` | `—` | Enum-Ext "sport" |
| 621 | Astronomie: Teleskop-Vergrößerung | `PL-sport` | `—` | Enum-Ext "sport" |
| 622 | Astronomie: Austrittspupille (Okular) | `PL-sport` | `—` | Enum-Ext "sport" |
| 623 | Garten: Pflanzenanzahl pro m² | `PL-sport` | `—` | Enum-Ext "sport" |
| 624 | Garten: Saatgutbedarf (Gramm pro m²) | `PL-sport` | `—` | Enum-Ext "sport" |
| 625 | Garten: Rasendünger-Menge | `PL-sport` | `—` | Enum-Ext "sport" |
| 626 | Garten: Kompost-Volumenrechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 627 | Gewächshaus-Heizbedarf | `PL-sport` | `—` | Enum-Ext "sport" |
| 628 | Bewässerungs-Dauer (Tropfsystem) | `PL-sport` | `—` | Enum-Ext "sport" |
| 629 | Wetter: Windchill-Effekt (Gefühlte Kälte) | `PL-sport` | `—` | Enum-Ext "sport" |
| 630 | Wetter: Hitze-Index (Gefühlte Wärme) | `PL-sport` | `—` | Enum-Ext "sport" |
| 631 | Wetter: Luftdruck-Umrechner (hPa, mmHg, inHg) | `PL-sport` | `—` | Enum-Ext "sport" |
| 632 | Wetter: Blitz-Entfernung (Sekunden zu km) | `PL-sport` | `—` | Enum-Ext "sport" |
| 633 | Reisen: Flugdauer-Rechner | `PL-sport` | `—` | Enum-Ext "sport" |
| 634 | Reisen: Jetlag-Erholungsplaner | `PL-sport` | `—` | Enum-Ext "sport" |
| 635 | Reisen: Koffer-Gewichts-Check (lbs zu kg) | `PL-sport` | `—` | Enum-Ext "sport" |
| 636 | Kochen: Backform-Größen-Umrechner (Rund zu Eckig) | `PL-sport` | `—` | Enum-Ext "sport" |
| 637 | Kochen: Eierkochzeit-Rechner (nach Höhenlage) | `PL-sport` | `—` | Enum-Ext "sport" |
| 638 | Kochen: Hefemengen-Umrechner (Frisch zu Trocken) | `PL-sport` | `—` | Enum-Ext "sport" |
| 639 | Kochen: Alkoholgehalt-Rechner (Mischgetränke) | `PL-sport` | `—` | Enum-Ext "sport" |
| 640 | Kochen: Fleisch-Garzeiten (Kerntemperatur) | `PL-sport` | `—` | Enum-Ext "sport" |

### Kurioses, Kultur & Diverses (641–702)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 641 | Morsecode-Audio-Generator | `PL-niche` | `—` | Nischen-Cluster |
| 642 | Flaggen-Alphabet-Übersetzer | `PL-niche` | `—` | Nischen-Cluster |
| 643 | Semaphor-Winkeralphabet-Anzeige | `PL-niche` | `—` | Nischen-Cluster |
| 644 | Blindenschrift-Vorschau (Braille) | `PL-niche` | `—` | Nischen-Cluster |
| 645 | Fingeralphabet (Gebärdensprache) Visualisierer | `PL-niche` | `—` | Nischen-Cluster |
| 646 | Tieralter: Hamsterjahre | `PL-niche` | `—` | Nischen-Cluster |
| 647 | Tieralter: Meerschweinchenjahre | `PL-niche` | `—` | Nischen-Cluster |
| 648 | Tieralter: Kaninchenjahre | `PL-niche` | `—` | Nischen-Cluster |
| 649 | Tieralter: Pferdejahre | `PL-niche` | `—` | Nischen-Cluster |
| 650 | Papierflieger-Faltanleitungs-Finder | `PL-niche` | `—` | Nischen-Cluster |
| 651 | Glücksrad-Generator | `PL-niche` | `—` | Nischen-Cluster |
| 652 | Münzwurf-Simulator (Kopf oder Zahl) | `PL-niche` | `—` | Nischen-Cluster |
| 653 | Würfel-Simulator (W6, W10, W20) | `PL-niche` | `—` | Nischen-Cluster |
| 654 | Namen-Generator (Fantasy) | `PL-niche` | `—` | Nischen-Cluster |
| 655 | Namen-Generator (Baby) | `PL-niche` | `—` | Nischen-Cluster |
| 656 | Wort-Anzahl in Büchern (Schätzung nach Seiten) | `PL-niche` | `—` | Nischen-Cluster |
| 657 | Lesedauer-Rechner (nach WPM) | `PL-niche` | `—` | Nischen-Cluster |
| 658 | Sprechdauer-Rechner (für Reden/Vorträge) | `PL-niche` | `—` | Nischen-Cluster |
| 659 | Schreibmaschinen-Simulator | `PL-niche` | `—` | Nischen-Cluster |
| 660 | Verschlüsselung: Caesar-Chiffre | `PL-niche` | `—` | Nischen-Cluster |
| 661 | Verschlüsselung: Vigenère-Chiffre | `PL-niche` | `—` | Nischen-Cluster |
| 662 | Verschlüsselung: Enigma-Simulator (Basis) | `PL-niche` | `—` | Nischen-Cluster |
| 663 | Numerologie-Zahl-Rechner | `R-2` | `—` | Pseudowissenschaft |
| 664 | Edelstein-Bedeutungs-Suche | `PL-niche` | `—` | Nischen-Cluster |
| 665 | Sternzeichen-Kompatibilität (Prozentual) | `PL-niche` | `—` | Nischen-Cluster |
| 666 | Chinesisches Element-Rechner (Holz, Feuer etc.) | `PL-niche` | `—` | Nischen-Cluster |
| 667 | Maya-Tzolkin-Datum-Rechner | `PL-niche` | `—` | Nischen-Cluster |
| 668 | Islamischer Kalender-Konverter (Hidschra) | `PL-niche` | `—` | Nischen-Cluster |
| 669 | Jüdischer Kalender-Konverter | `PL-niche` | `—` | Nischen-Cluster |
| 670 | Französischer Revolutionskalender-Konverter | `PL-niche` | `—` | Nischen-Cluster |
| 671 | Julianisches Datum (Astronomie) | `PL-niche` | `—` | Nischen-Cluster |
| 672 | Unix-Timestamp zu Menschenlesbar (Lokal/UTC) | `PL-niche` | `—` | Nischen-Cluster |
| 673 | Hexadezimal-Farbpaletten-Generator | `PL-niche` | `—` | Nischen-Cluster |
| 674 | Komplementärfarben-Finder | `PL-niche` | `—` | Nischen-Cluster |
| 675 | Triadische Farbharmonien | `PL-niche` | `—` | Nischen-Cluster |
| 676 | Wort-Wolke (Word Cloud) Generator | `PL-niche` | `—` | Nischen-Cluster |
| 677 | Zufälliger Fakten-Generator | `PL-niche` | `—` | Nischen-Cluster |
| 678 | Passwort-Entropie-Rechner (Sicherheit in Bits) | `PL-niche` | `—` | Nischen-Cluster |
| 679 | QR-Code-Scanner (Datei-Upload) | `PL-niche` | `—` | Nischen-Cluster |
| 680 | Barcode-Inhalt-Reader | `PL-niche` | `—` | Nischen-Cluster |
| 681 | Wein-Jahrgangs-Bewertungs-Suche | `PL-niche` | `—` | Nischen-Cluster |
| 682 | Kaffee-Wasser-Verhältnis (Brew Ratio) | `PL-niche` | `—` | Nischen-Cluster |
| 683 | Espresso-Extraktions-Rechner | `PL-niche` | `—` | Nischen-Cluster |
| 684 | Tea-Steeping-Timer (nach Sorte) | `PL-niche` | `—` | Nischen-Cluster |
| 685 | Zigarren-Format-Finder (Ringmaß zu mm) | `PL-niche` | `—` | Nischen-Cluster |
| 686 | Schuh-Größentabelle (Mondopoint) | `PL-niche` | `—` | Nischen-Cluster |
| 687 | Handschuhgrößen-Rechner | `PL-niche` | `—` | Nischen-Cluster |
| 688 | Gürtellängen-Rechner | `PL-niche` | `—` | Nischen-Cluster |
| 689 | Krawattenknoten-Anleitungs-Wähler | `PL-niche` | `—` | Nischen-Cluster |
| 690 | CO2-Ersparnis (Fahrrad statt Auto) | `PL-niche` | `—` | Nischen-Cluster |
| 691 | Plastikmüll-Fußabdruck-Rechner | `PL-niche` | `—` | Nischen-Cluster |
| 692 | Wasser-Fußabdruck eines Produkts | `PL-niche` | `—` | Nischen-Cluster |
| 693 | Stromverbrauch im Standby-Modus | `PL-niche` | `—` | Nischen-Cluster |
| 694 | Kerzen-Brenndauer-Rechner | `PL-niche` | `—` | Nischen-Cluster |
| 695 | Distanz-Rechner (Luftlinie zwischen Städten) | `PL-niche` | `—` | Nischen-Cluster |
| 696 | GPS-Koordinaten Konverter (DD zu DMS) | `PL-niche` | `—` | Nischen-Cluster |
| 697 | What3Words zu Koordinaten Konverter | `PL-niche` | `—` | Nischen-Cluster |
| 698 | Maidenhead-Locator (Amateurfunk) | `PL-niche` | `—` | Nischen-Cluster |
| 699 | Morsealphabet-Lern-Trainer | `PL-niche` | `—` | Nischen-Cluster |
| 700 | Der "Wie viele Tools hat diese Seite"-Zähler (Meta-Tool) | `PL-niche` | `—` | Nischen-Cluster |
| 701 | Diese Liste gibt dir eine massive Bandbreite. Wenn du die alle umsetzt, hast du eine der umfangreichsten Tool-Sammlungen im deutschsprachigen Raum. Viel Erfolg beim Programmieren! | `PL-niche` | `—` | Nischen-Cluster |
| 702 | Das ist ein beeindruckendes Ziel. Mit 1000 spezialisierten Unterseiten baust du ein wahres „Schweizer Taschenmesser“ des Internets auf. Um die 1000 vollzumachen, dringen wir nun in sehr spezifische Fachbereiche, Nischen-Hobbys und industrielle Standards vor. | `PL-niche` | `—` | Nischen-Cluster |

### Social Media & Digitales Marketing (703–752)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 703 | Engagement-Rate-Rechner (Instagram) | `T5` | `text` | Marketing — Tier 5 |
| 704 | Engagement-Rate-Rechner (TikTok) | `T5` | `text` | Marketing — Tier 5 |
| 705 | YouTube-Einnahmen-Schätzer (basierend auf Views/CPM) | `T5` | `text` | Marketing — default Tier 5 |
| 706 | Video-Längen-Rechner (Frames in Sekunden) | `T5` | `text` | Marketing — default Tier 5 |
| 707 | Instagram-Grid-Planer (Bild-Splitter) | `T5` | `text` | Marketing — default Tier 5 |
| 708 | Zeichenzähler für Google Meta-Titles (Pixel-basiert) | `T5` | `text` | Marketing — default Tier 5 |
| 709 | Zeichenzähler für Google Meta-Descriptions | `T5` | `text` | Marketing — default Tier 5 |
| 710 | CPC-Rechner (Cost-per-Click) | `T5` | `text` | Marketing — default Tier 5 |
| 711 | CPM-Rechner (Cost-per-Mille) | `T5` | `text` | Marketing — default Tier 5 |
| 712 | CTR-Rechner (Click-Through-Rate) | `T5` | `text` | Marketing — Tier 5 |
| 713 | CPA-Rechner (Cost-per-Acquisition) | `T5` | `text` | Marketing — default Tier 5 |
| 714 | ROAS-Rechner (Return on Ad Spend) | `T5` | `text` | Marketing — default Tier 5 |
| 715 | Konversionsraten-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 716 | E-Mail-Öffnungsraten-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 717 | UTM-Parameter-Generator | `T5` | `dev` | Marketing — Tier 5 |
| 718 | Affiliate-Provisions-Rechner | `T5` | `text` | in queue als affiliate-provisions-rechner |
| 719 | Hashtag-Generator (Themenbasiert) | `T5` | `text` | Marketing — Tier 5 |
| 720 | Link-Shortener-Vorschau | `T5` | `text` | Marketing — default Tier 5 |
| 721 | Facebook-Werbebudget-Planer | `T5` | `text` | Marketing — default Tier 5 |
| 722 | Influencer-Preis-Schätzer | `T5` | `text` | Marketing — default Tier 5 |
| 723 | Podcast-Download-Schätzer | `T5` | `text` | Marketing — default Tier 5 |
| 724 | Lesezeit-Rechner für Blogartikel | `T5` | `text` | Marketing — default Tier 5 |
| 725 | Newsletter-Abonnenten-Wachstumsrechner | `T5` | `text` | Marketing — default Tier 5 |
| 726 | Kundenlebenszyklus-Wert (CLV) Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 727 | Abwanderungsrate-Rechner (Churn Rate) | `T5` | `text` | Marketing — default Tier 5 |
| 728 | PayPal-Gebühren-Rechner (Privat/Business) | `T5` | `text` | Marketing — default Tier 5 |
| 729 | eBay-Gebühren-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 730 | Etsy-Gebühren-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 731 | Amazon FBA-Gebühren-Schätzer | `T5` | `text` | Marketing — default Tier 5 |
| 732 | Stripe-Gebühren-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 733 | Crowdfunding-Ziel-Rechner (inkl. Gebühren) | `T5` | `text` | Marketing — default Tier 5 |
| 734 | Online-Kurs-Preis-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 735 | Webinar-Teilnehmer-Konversionsrechner | `T5` | `text` | Marketing — default Tier 5 |
| 736 | QR-Code für WLAN-Zugang Generator | `T5` | `text` | Marketing — default Tier 5 |
| 737 | QR-Code für VCard (Visitenkarte) Generator | `T5` | `text` | Marketing — default Tier 5 |
| 738 | Passwort-Entropy-Bit-Rechner | `T5` | `text` | Marketing — default Tier 5 |
| 739 | Bildschirm-Seitenverhältnis-Rechner (21:9, 16:9, 4:3) | `T5` | `text` | Marketing — default Tier 5 |
| 740 | Pixeldichte-Rechner (PPI) | `T5` | `text` | Marketing — default Tier 5 |
| 741 | Bandbreiten-Rechner (Video-Streaming-Bedarf) | `T5` | `text` | Marketing — default Tier 5 |
| 742 | Cloud-Speicher-Kosten-Vergleicher | `T5` | `text` | Marketing — default Tier 5 |
| 743 | Domain-Namen-Generator (Kombinatorik) | `T5` | `text` | Marketing — default Tier 5 |
| 744 | Website-Verfügbarkeits-Rechner (99,9% SLA in Minuten) | `T5` | `text` | Marketing — default Tier 5 |
| 745 | Schriftgrößen-Konverter (pt zu px zu em) | `T5` | `text` | Marketing — default Tier 5 |
| 746 | Zeilenhöhen-Rechner (Goldener Schnitt) | `T5` | `text` | Marketing — default Tier 5 |
| 747 | Kontrast-Verhältnis-Prüfer (WCAG Barrierefreiheit) | `T5` | `text` | Marketing — default Tier 5 |
| 748 | SVG-Filter-Code-Generator | `T5` | `text` | Marketing — default Tier 5 |
| 749 | CSS-Glasmorphismus-Generator | `T5` | `text` | Marketing — default Tier 5 |
| 750 | CSS-Neumorphismus-Generator | `T5` | `text` | Marketing — default Tier 5 |
| 751 | Favicon-Generator für Mobile Apps | `T5` | `text` | Marketing — default Tier 5 |
| 752 | App-Store-Screenshot-Größen-Rechner | `T5` | `text` | Marketing — default Tier 5 |

### Logistik, Transport & Automotive (753–802)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 753 | Frachtgewicht-Rechner (Volumengewicht) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 754 | Paletten-Stapel-Rechner (Euro-Paletten im LKW) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 755 | Container-Füllrechner (20ft vs. 40ft) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 756 | Lieferzeit-Rechner (Versanddatum + Werktage) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 757 | Kraftstoffkosten-Rechner (Fahrtstrecke) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 758 | CO2-Ausstoß-Rechner (PKW nach Kraftstoffart) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 759 | Reifen-Durchmesser-Rechner (Reifenkennzeichnung) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 760 | Tacho-Abweichung-Rechner (bei Reifenwechsel) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 761 | Einpresstiefe-Rechner (Felgen) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 762 | Motorrad-Übersetzungsrechner (Kettenblatt/Ritzel) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 763 | Elektroauto-Ladegeschwindigkeit (kW zu km pro Stunde) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 764 | Ladekosten-Rechner (Elektroauto) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 765 | Reichweiten-Rechner (Batteriekapazität/Verbrauch) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 766 | Anhängelast-Rechner (Zulässiges Gesamtgewicht) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 767 | Bremsweg-Rechner (Gefahrenbremsung vs. Normal) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 768 | Anhalteweg-Rechner (Reaktionszeit + Bremsweg) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 769 | Fliehkraft-Rechner (Kurvenfahrt) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 770 | Drehmoment-Leistung-Konverter (U/min Einbezug) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 771 | Hubraum-Rechner (Bohrung/Hub/Zylinder) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 772 | Verdichtungsverhältnis-Rechner (Motor) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 773 | Öl-Mischrechner (Zweitakter 1:25, 1:50) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 774 | Frostschutz-Mischrechner (Kühlwasser) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 775 | KFZ-Wertverlust-Schätzer | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 776 | Leasing-Restwert-Rechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 777 | Wohnmobil-Zuladungsrechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 778 | Achslast-Rechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 779 | Fahrtenbuch-Kilometer-Checker | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 780 | Maut-Rechner (Vignette vs. Streckenmaut) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 781 | Flugdistanz-Rechner (Großkreis-Entfernung) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 782 | Kerosin-Verbrauchs-Schätzer (pro Passagier) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 783 | Schifffahrts-Container-Checkziffer-Prüfer | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 784 | Seefracht-Laufzeit-Schätzer | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 785 | Eisenbahn-Spurweiten-Konverter | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 786 | Taxi-Fahrpreis-Schätzer (nach Stadt-Tarif) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 787 | Parkgebühren-Rechner (Zeitdauer) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 788 | Mitfahrgelegenheit-Preisvorschlag-Rechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 789 | Fahrrad-Rahmenhöhe-Rechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 790 | E-Bike-Reichweiten-Simulator | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 791 | Kalorienverbrauch-E-Bike vs. Fahrrad | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 792 | Segelboot-Rumpfgeschwindigkeit-Rechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 793 | Ankerkette-Längen-Rechner (Wassertiefe/Wind) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 794 | Krängungswinkel-Rechner (Segeln) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 795 | Drift-Rechner (Strömung/Wind) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 796 | Steigrate-Rechner (Flugzeug) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 797 | Landestrecke-Rechner (Luftfahrt) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 798 | Barometrische Höhenkorrektur (QNH/QFE) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 799 | Ladefaktor-Rechner (Logistik) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 800 | Lagerumschlagshäufigkeit-Rechner | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 801 | Sicherheitsbestand-Rechner (Lagerhaltung) | `PL-automotive` | `—` | Enum-Ext "automotive" |
| 802 | Just-in-Time Lieferfenster-Planer | `PL-automotive` | `—` | Enum-Ext "automotive" |

### Landwirtschaft, Umwelt & Garten (803–852)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 803 | Viehbesatzdichte-Rechner (Großvieheinheiten pro Hektar) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 804 | Düngemittel-Bedarfsrechner (Stickstoff/Phosphor/Kali) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 805 | Gülle-Lagerkapazität-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 806 | Saatgutstärke-Rechner (Körner pro m²) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 807 | Ertragsprognose (Getreide nach Ährenzahl) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 808 | Bodenfeuchte-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 809 | Beregnungsdauer-Rechner (mm Niederschlag) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 810 | Treibhausgas-Emissionen (Landwirtschaft) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 811 | Tierfutter-Rationsrechner (Proteingehalt) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 812 | Trächtigkeitskalender (Rind, Schwein, Schaf) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 813 | Holzeinschlag-Volumenrechner (nach Durchmesser/Höhe) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 814 | Waldbrandgefahr-Index-Check | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 815 | Photosynthese-Effizienz-Schätzer | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 816 | Kompostierungs-Dauer-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 817 | CO2-Speicherung pro Baum (nach Baumart) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 818 | Solarpumpen-Leistungsrechner (Brunnen) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 819 | Windkraft-Ertragsrechner (Rotordurchmesser) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 820 | Biogas-Ausbeute-Rechner (Substrat-Eingabe) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 821 | Teichfilter-Größenrechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 822 | Fischanzahl-Rechner (pro m³ Wasser) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 823 | Algenwachstums-Prognose | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 824 | Frosttage-Statistik-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 825 | Sonnenstunden-Rechner (nach Standort) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 826 | Regenwasser-Sammelpotenzial (Dachfläche/Region) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 827 | Zisternengrößen-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 828 | pH-Wert Korrektur (Boden kalken) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 829 | Mulch-Bedarfsrechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 830 | Unkrautdruck-Schätzer | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 831 | Bienenstock-Honigertrag-Schätzer | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 832 | Varroa-Milben-Befallsrechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 833 | Lichtverschmutzung-Skala (Bortle-Skala) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 834 | Luftqualitäts-Index-Umrechner (AQI) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 835 | Feinstaub-Belastungs-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 836 | Ozon-Grenzwert-Check | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 837 | Wasserhärte-Konverter (dH zu mmol/l) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 838 | Nitratwert-Check (Trinkwasser) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 839 | Recycling-Quote-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 840 | Ökologischer Rucksack-Rechner (Produkte) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 841 | Meat-Free-Days CO2-Ersparnis | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 842 | Wasserverbrauch-Rechner (Haushalt) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 843 | Stromkosten-Ersparnis (LED vs. Halogen) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 844 | Standby-Vampir-Rechner (Gerätekosten) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 845 | Wärmepumpen-Jahresarbeitszahl (JAZ) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 846 | Vorlauftemperatur-Optimierer (Heizung) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 847 | Holzpellet-Lagerraum-Berechnung | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 848 | Brennholz-Feuchtigkeits-Energie-Verlust | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 849 | Solar-Eigenverbrauchs-Quote | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 850 | Windkraft-Abstands-Check | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 851 | Erdwärme-Sonden-Längen-Rechner | `PL-agriculture` | `—` | Enum-Ext "agriculture" |
| 852 | Dach-Ausrichtungs-Effizienz (Azimut/Neigung) | `PL-agriculture` | `—` | Enum-Ext "agriculture" |

### Bildung, Studium & Wissenschaft (853–902)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 853 | Notenschnitt-Rechner (Abitur/Matura) | `PL-education` | `—` | Enum-Ext "education" |
| 854 | Uni-ECTS-Punkterechner | `PL-education` | `—` | Enum-Ext "education" |
| 855 | Master-Zulassungs-Chancen-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 856 | BAföG-Anspruch-Vorabrechner | `PL-education` | `—` | Enum-Ext "education" |
| 857 | Lernzeit-Planer (Stoffmenge vs. Tage) | `PL-education` | `—` | Enum-Ext "education" |
| 858 | Vokabel-Lernfortschritts-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 859 | Bibliographie-Generator (APA Style) | `PL-education` | `—` | Enum-Ext "education" |
| 860 | Bibliographie-Generator (Harvard Style) | `PL-education` | `—` | Enum-Ext "education" |
| 861 | Bibliographie-Generator (MLA Style) | `PL-education` | `—` | Enum-Ext "education" |
| 862 | Plagiats-Risiko-Indikator (Wort-Übereinstimmung) | `PL-education` | `—` | Enum-Ext "education" |
| 863 | Text-Schwierigkeits-Grad (Flesch-Reading-Ease) | `PL-education` | `—` | Enum-Ext "education" |
| 864 | Gunning-Fog-Index (Lesbarkeit) | `PL-education` | `—` | Enum-Ext "education" |
| 865 | Wortschatz-Dichte-Analyse | `PL-education` | `—` | Enum-Ext "education" |
| 866 | Lesegeschwindigkeits-Test (WPM) | `PL-education` | `—` | Enum-Ext "education" |
| 867 | Schreibgeschwindigkeits-Test (Anschläge pro Minute) | `PL-education` | `—` | Enum-Ext "education" |
| 868 | Gedächtnistrainings-Statistik | `PL-education` | `—` | Enum-Ext "education" |
| 869 | IQ-Test-Ergebnis-Normierung | `PL-education` | `—` | Enum-Ext "education" |
| 870 | Perzentilen-Rechner (Statistik-Auswertung) | `PL-education` | `—` | Enum-Ext "education" |
| 871 | t-Test Rechner (Signifikanz) | `PL-education` | `—` | Enum-Ext "education" |
| 872 | p-Wert Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 873 | Stichprobengröße-Rechner (Repräsentativität) | `PL-education` | `—` | Enum-Ext "education" |
| 874 | Fehlerquote-Rechner (Margin of Error) | `PL-education` | `—` | Enum-Ext "education" |
| 875 | Halbwertszeit-Rechner (Isotope) | `PL-education` | `—` | Enum-Ext "education" |
| 876 | Radioaktive Zerfallsreihen-Visualisierer | `PL-education` | `—` | Enum-Ext "education" |
| 877 | Molmassen-Rechner (Spezialisierte Proteine) | `PL-education` | `—` | Enum-Ext "education" |
| 878 | DNA-Schmelzpunkt-Rechner (PCR) | `PL-education` | `—` | Enum-Ext "education" |
| 879 | Enzym-Aktivitäts-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 880 | Mikroskop-Maßstabsbalken-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 881 | Sternenzeit-Rechner (Siderische Zeit) | `PL-education` | `—` | Enum-Ext "education" |
| 882 | Deklination/Rektaszension-Konverter | `PL-education` | `—` | Enum-Ext "education" |
| 883 | Planetenkonjunktion-Vorhersage | `PL-education` | `—` | Enum-Ext "education" |
| 884 | Schwerkraft-Zeitdilatations-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 885 | Lorentz-Kontraktion (Längenverkürzung) | `PL-education` | `—` | Enum-Ext "education" |
| 886 | Dopplereffekt (Licht/Rotverschiebung) | `PL-education` | `—` | Enum-Ext "education" |
| 887 | Schwarzschild-Radius-Rechner (Schwarze Löcher) | `PL-education` | `—` | Enum-Ext "education" |
| 888 | Newton-Fraktal-Generator | `PL-education` | `—` | Enum-Ext "education" |
| 889 | Julia-Menge-Simulator | `PL-education` | `—` | Enum-Ext "education" |
| 890 | Mandelbrot-Menge-Explorer | `PL-education` | `—` | Enum-Ext "education" |
| 891 | Pi-Stellen-Suche (Wo ist mein Geburtstag in Pi?) | `PL-education` | `—` | Enum-Ext "education" |
| 892 | Eulersche Zahl e-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 893 | Primzahl-Generator (Sieb des Eratosthenes) | `PL-education` | `—` | Enum-Ext "education" |
| 894 | Perfect-Number-Checker | `PL-education` | `—` | Enum-Ext "education" |
| 895 | Magische Quadrate Generator | `PL-education` | `—` | Enum-Ext "education" |
| 896 | Sudoku-Löser (Schritt-für-Schritt) | `PL-education` | `—` | Enum-Ext "education" |
| 897 | Logik-Gatter-Simulator (AND, OR, XOR) | `PL-education` | `—` | Enum-Ext "education" |
| 898 | Wahrheitstabellen-Generator | `PL-education` | `—` | Enum-Ext "education" |
| 899 | Binär-Baum-Visualisierer | `PL-education` | `—` | Enum-Ext "education" |
| 900 | Sortier-Algorithmen-Visualisierer | `PL-education` | `—` | Enum-Ext "education" |
| 901 | Huffman-Codierung-Rechner | `PL-education` | `—` | Enum-Ext "education" |
| 902 | Komplexitätsklassen-Check (O-Notation) | `PL-education` | `—` | Enum-Ext "education" |

### Spezial-Hobbys, Haushalt & Kurioses (903–952)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 903 | Zigarren-Humidor-Feuchtigkeitsrechner | `PL-niche` | `—` | Spezial-Hobby |
| 904 | Whisky-Verdünnungsrechner (Fassstärke auf Trinkstärke) | `PL-niche` | `—` | Spezial-Hobby |
| 905 | Wein-Alkoholgehalt (Zuckermessung/Oechsle) | `PL-niche` | `—` | Spezial-Hobby |
| 906 | Bier-Stammwürze zu Alkoholgehalt | `PL-niche` | `—` | Spezial-Hobby |
| 907 | Kaffee-Extraktionszeit-Rechner | `PL-niche` | `—` | Spezial-Hobby |
| 908 | Pizza-Teig-Hydrationsrechner (Mehl/Wasser/Hefe) | `PL-niche` | `—` | Spezial-Hobby |
| 909 | Sauerteig-Fütterungs-Zeitplaner | `PL-niche` | `—` | Spezial-Hobby |
| 910 | Einmach-Zucker-Rechner (Fruchtgewicht) | `PL-niche` | `—` | Spezial-Hobby |
| 911 | Pökel-Salz-Rechner (Fleischgewicht) | `PL-niche` | `—` | Spezial-Hobby |
| 912 | Grillfleisch-Mengen-Planer (Personenanzahl) | `PL-niche` | `—` | Spezial-Hobby |
| 913 | Party-Getränke-Planer (Promille-Limitierung) | `PL-niche` | `—` | Spezial-Hobby |
| 914 | Schachturnier-Auslosung (Schweizer System) | `PL-niche` | `—` | Spezial-Hobby |
| 915 | Modellbahn-Gleisradius-Rechner | `PL-niche` | `—` | Spezial-Hobby |
| 916 | RC-Lipo-Akku-Laderechner | `PL-niche` | `—` | Spezial-Hobby |
| 917 | Paracord-Längen-Rechner (Knüpfprojekte) | `PL-niche` | `—` | Spezial-Hobby |
| 918 | Stoffverbrauch-Rechner (Schneidern) | `PL-niche` | `—` | Spezial-Hobby |
| 919 | Nähmaschinen-Stichdichte-Konverter | `PL-niche` | `—` | Spezial-Hobby |
| 920 | Farbmisch-Rechner (Pigmente) | `PL-niche` | `—` | Spezial-Hobby |
| 921 | Gold-Feingehalt-Umrechner (Karat in Tausendstel) | `PL-niche` | `—` | Spezial-Hobby |
| 922 | Münzsammler-Erhaltungsgrad-Check | `PL-niche` | `—` | Spezial-Hobby |
| 923 | Briefmarken-Zähnungsschlüssel-Digital | `PL-niche` | `—` | Spezial-Hobby |
| 924 | Geocaching-Koordinaten-Projektion | `PL-niche` | `—` | Spezial-Hobby |
| 925 | Escape-Room-Zeit-Statistik | `PL-niche` | `—` | Spezial-Hobby |
| 926 | Pen & Paper Würfel-Wahrscheinlichkeiten | `PL-niche` | `—` | Spezial-Hobby |
| 927 | Rollenspiel-Charakter-Namens-Generator (Race/Class) | `PL-niche` | `—` | Spezial-Hobby |
| 928 | Tarot-Karten-Zieher (Zufall) | `R-2` | `—` | Pseudowissenschaft |
| 929 | I-Ging-Orakel-Generator | `PL-niche` | `—` | Spezial-Hobby |
| 930 | Enneagramm-Typ-Indikator | `PL-niche` | `—` | Spezial-Hobby |
| 931 | Biorhythmus-Kompatibilität (Partnerschaft) | `PL-niche` | `—` | Spezial-Hobby |
| 932 | Mondkalender (Garten/Haare/Haushalt) | `PL-niche` | `—` | Spezial-Hobby |
| 933 | Feng-Shui Bagua-Karten-Rechner | `R-2` | `—` | Pseudowissenschaft |
| 934 | Edelstein-Härte-Vergleich (Mohs-Skala) | `PL-niche` | `—` | Spezial-Hobby |
| 935 | Frequenz-Therapie-Rechner (Solfeggio) | `PL-niche` | `—` | Spezial-Hobby |
| 936 | Meditationstimer mit Intervallen | `PL-niche` | `—` | Spezial-Hobby |
| 937 | Gebärdensprache-Video-Suche (Wörterbuch-Linker) | `PL-niche` | `—` | Spezial-Hobby |
| 938 | Blindenschrift-Druck-Vorschau | `PL-niche` | `—` | Spezial-Hobby |
| 939 | Flaggen-Proportionen-Rechner | `PL-niche` | `—` | Spezial-Hobby |
| 940 | Heraldik-Wappen-Generator (Blasonierung) | `PL-niche` | `—` | Spezial-Hobby |
| 941 | Ahnenforschungs-Verwandtschaftsgrad-Rechner | `PL-niche` | `—` | Spezial-Hobby |
| 942 | Stammbaum-Generationen-Zähler | `PL-niche` | `—` | Spezial-Hobby |
| 943 | Heiratsjubiläen-Rechner (Wann ist Goldene Hochzeit?) | `PL-niche` | `—` | Spezial-Hobby |
| 944 | Namenstage-Suche | `PL-niche` | `—` | Spezial-Hobby |
| 945 | Feiertags-Rechner (Osterdatum bis 2099) | `PL-niche` | `—` | Spezial-Hobby |
| 946 | Ramadan-Zeiten-Rechner | `PL-niche` | `—` | Spezial-Hobby |
| 947 | Zeit-Differenz-Rechner (Stunden/Minuten/Sekunden) | `PL-niche` | `—` | Spezial-Hobby |
| 948 | "Wie lange bis zum Wochenende?"-Countdown | `PL-niche` | `—` | Spezial-Hobby |
| 949 | "Was geschah an meinem Geburtstag?"-Historie | `PL-niche` | `—` | Spezial-Hobby |
| 950 | Weltbevölkerungs-Echtzeit-Schätzer | `PL-niche` | `—` | Spezial-Hobby |
| 951 | Staatsverschuldung-pro-Kopf-Rechner | `PL-niche` | `—` | Spezial-Hobby |
| 952 | CO2-Budget-Restlaufzeit-Uhr | `PL-niche` | `—` | Spezial-Hobby |

### Audio, Musik & Video-Produktion (953–1002)

| # | Tool | Status | Enum | Notiz |
|---|------|--------|------|-------|
| 953 | BPM-zu-Millisekunden-Rechner (für Delays) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 954 | Reverb-Pre-Delay-Rechner (nach Songtempo) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 955 | Audio-Sample-Rate-Konverter (44.1 zu 48 kHz etc.) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 956 | Audio-Bittiefe-Dynamik-Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 957 | Noten zu Frequenz (Hz) Konverter | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 958 | Synthesizer-ADSR-Hüllkurven-Planer | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 959 | Harmonic Mixing (Camelot Wheel Konverter) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 960 | DJ-Set-Längen-Planer (Trackanzahl vs. Zeit) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 961 | Schallplatten-Laufzeit-Rechner (33/45 RPM) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 962 | Lautsprecher-Impedanz (Reihe/Parallel) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 963 | Verstärker-Leistung (Watt/Ohm) Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 964 | Schalldruckpegel-Verlust über Distanz | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 965 | Raummoden-Rechner (Akustik-Optimierung) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 966 | Nachhallzeit-Rechner (RT60) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 967 | Mikrofon-Empfindlichkeit (mV/Pa zu dBV) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 968 | Video-Aspekt-Ratio-Padding (Letterbox-Rechner) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 969 | Video-Dateigrößen-Rechner (Codec/Bitrate/Zeit) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 970 | Zeitraffer-Intervall-Rechner (Echtzeit vs. Filmdauer) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 971 | Zeitlupe-Berechnung (FPS-Verhältnis) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 972 | Kamera-Sensor-Crop-Faktor-Konverter | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 973 | Äquivalente Brennweite (Vollformat-Vergleich) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 974 | Schärfentiefe-Rechner (Bokeh-Simulator) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 975 | Belichtungszeit-Rechner (ND-Filter Verlängerung) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 976 | Blitzleitzahl-Rechner (Blende/Distanz/ISO) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 977 | Akku-Laufzeit für Video-Lichter (Wh/W) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 978 | Speicherkarten-Kapazität (RAW vs. JPEG) | `T8` | `image` | Image (jpeg) |
| 979 | Farbkorrektur-LUT-Vorschau-Logik | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 980 | Untertitel-Lesegeschwindigkeits-Prüfer | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 981 | Voice-Over-Skript-Zeit-Rechner (Wortanzahl) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 982 | Musik-GEMA-Gebühren-Schätzer (Events) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 983 | Spotify-Stream-Einnahmen-Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 984 | CD-Speicherplatz-Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 985 | Audio-Phase-Interferenz-Simulator | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 986 | Gitarrensaiten-Zugkraft-Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 987 | Kapodaster-Transponier-Tabelle | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 988 | Klavier-Stimmkurve (Inharmonizität) | `T8` | `video` | Video (avi) |
| 989 | MIDI-Velocity zu Dezibel Konverter | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 990 | Synthesizer-Filter-Cutoff-Frequenz | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 991 | Audio-Kompressor-Threshold-Gain-Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 992 | Surround-Sound-Lautsprecher-Winkel | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 993 | Dithering-Rausch-Simulator (Theoretisch) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 994 | Audio-Aliasing-Frequenz-Rechner | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 995 | MP3-VBR vs. CBR Qualitätsvergleich | `T8` | `audio` | Audio (mp3) |
| 996 | Schallgeschwindigkeit-Höhenkorrektur | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 997 | Hörbereich-Test (Frequenz-Generator) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 998 | Stereobreite-Rechner (MS-Matrix) | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 999 | Pink-Noise vs. White-Noise Spektrum | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 1000 | Peak-zu-RMS Konverter | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 1001 | LUFS-Loudness-Normalisierungs-Check | `PL-av` | `—` | A/V-Cluster — Nischen-Format |
| 1002 | Der "1000. Tool" Jubiläums-Zufalls-Generator | `PL-av` | `—` | A/V-Cluster — Nischen-Format |

---

## Psychologie-Familie (Tier 9, separate Quelle)

**Quelle:** `docs/superpowers/specs/2026-04-18-psychologie-tools-katalog.md` (79 Tools).
**Status fuer alle:** `T9` — vollstaendig im Tier-Backlog abgelegt (`tasks/backlog/differenzierung-queue.md` Tier 9a-9g).
**Enum-Extension-Gate:** Pflicht — neue Enums `persoenlichkeit`, `kognition`, `gesundheit-wellness`, `lernen`, `spass`, `sinne` muessen vor Dispatch per User-Approval-Ticket (`docs/paperclip/CATEGORY_TTL.md` §2) angelegt werden.
**Power-10 (hoechste Prio):** Big Five, Reaktionszeit-Test, Tipp-Speed, Zahlengedaechtnis, Persoenlichkeits-Farbtest, Liebessprachen, Bindungsstil, Optimale-Schlafzeit-Rechner, Chronotyp-Test, Lesegeschwindigkeit.

---

## Pflege-Regel (Living-Doc)

- **Nach Build-Complete:** Status-Zelle auf `BUILT`, Notiz mit Build-Datum + Slug. Queue-Zeile entfernen, `already_built_skip_list` erweitern.
- **Nach Critic-Rejection (2× rot):** Status auf `R-9` (oder spezifischen R-Code), Notiz mit Rejection-Reason.
- **Nach Enum-Extension-Approval:** Betroffene Parking-Lot-Zeilen von `PL-<key>` auf Tier hochstufen, in Tier-Backlog uebertragen.
- **Woechentlich (Sonntag CEO-Heartbeat):** Status-Summary-Tabelle regenerieren, Diff zu Vorwoche im Daily-Digest protokollieren.

---

## Cross-References

- `docs/paperclip/CATEGORY_TTL.md` — Enum-Extension-Ticket-Template
- `src/lib/tools/categories.ts` — 14-Enum-Quelle
- `tasks/backlog/differenzierung-queue.md` — Aktive Tier-Queue
- `docs/superpowers/plans/2026-04-21-user-200-list-analysis.md`
- `docs/superpowers/plans/2026-04-21-user-800-more-list-analysis.md`
- `docs/superpowers/specs/2026-04-18-psychologie-tools-katalog.md`

