# Tool-Priority-Masterplan — SEO-getriebene Dispatch-Reihenfolge

**Status:** v2 (2026-04-23) — Finance + Construction Enum freigegeben, Reihenfolge aktualisiert
**Erstellt von:** Claude Opus 4.7 + SEO-Research-Subagent (2026-04-23)
**Gültig für:** Alle bisher ungeplanten oder geplanten, aber noch nicht gebauten Tools
**Supersedes:** Rohes Tier-1→8-FIFO aus `differenzierung-queue.md` — Dispatch-Reihenfolge HIER ist verbindlich

---

## Warum diese Reihenfolge?

Die ursprüngliche Tier-1→8-FIFO-Queue wurde nach **technischer Komplexität** geordnet (Template-Lock → Cluster-Scaling). Diese Liste ordnet nach **Traffic + Revenue-Potenzial** — was uns am schnellsten zu Platz 1 bei Google DE bringt, die höchsten AdSense-CPCs liefert, und wo wir mit unserer „kein Upload, reiner Client" USP am stärksten differenzieren.

### Die 5 strategischen Erkenntnisse (Research-Basis)

1. **Finance + Construction sind jetzt freigeschaltet (2026-04-23).** Enum `finance` + `construction` sind live in `categories.ts`. Beide kommen direkt nach Wave 0 — Finance wegen €2-5 CPC (höchste Klasse), Construction wegen extrem niedrigem Wettbewerb im deutschen DIY-Markt.

2. **PDF-Tools sind das größte Einzel-Traffic-Cluster.** pdf24.de ist eine der meistbesuchten deutschen Webseiten — primär wegen PDF-Tools. Jeder Konkurrent lädt auf Server hoch. Wir nicht. Stärkstes DSGVO-Differenzierungspunkt. `PDF zusammenführen` hat Millionen DE-Suchen/Monat.

3. **Drei Hochvolumen-Tools fehlen komplett im Queue.** `altersrechner`, `arbeitstage-rechner`, `datumsrechner` — alle `time`-Enum, extrem hohes Volumen, fast keine Konkurrenz. In Queue eintragen und sofort dispatchcen.

4. **Dev-Tools (Tier 4) haben niedrigste CPCs (€0.10-0.40)** — obwohl schnell zu bauen sind sie Revenue-mäßig am schwächsten. Kommen nach High-CPC-Kategorien.

5. **Nächste Enum-Freigabe: `math` + `health`.** Nach Finance+Construction-Suite: `math` (76 Tools, Schulkinder+Business) + `health` (71 Tools, aber hohe institutionelle Konkurrenz). User-Approval-Ticket erstellen wenn F+C komplett dispatcht.

---

## Strategische Priorisierungs-Matrix

| Kategorie | Monatliches DE-Volumen | AdSense-CPC | Ranking-Schwierigkeit | Unser USP greift? |
|---|---|---|---|---|
| PDF-Tools | Millionen | €0.30-1.00 | Mittel (upload-Konkurrenz) | ✅ **Stark** (kein Upload) |
| Finance (Kredit, MwSt) | Millionen | **€2-5+** | Mittel | ✅ Stark |
| Health (BMI, Kalorien) | 100k-500k | €0.50-1.50 | Hoch (Krankenkassen) | ✓ Mittel |
| Construction (Fliesen, Tapete) | 50k-200k | €1-2 | **Niedrig** ← | ✅ Stark |
| Math (Prozent, Dreisatz) | 200k-500k | €0.10-0.50 | **Sehr niedrig** ← | ✓ Mittel |
| Date/Time (Alter, Arbeitstage) | 100k-300k | €0.30-0.80 | **Sehr niedrig** ← | ✓ Mittel |
| Video-BG-Remove | 20k-50k | €1-2 | **Sehr niedrig** (Unscreen tot) | ✅ **Einzigartig** |
| Audio Enhancement | 10k-30k | €0.50-1.50 | **Sehr niedrig** | ✅ **Einzigartig** |
| Dev-Tools (CSS, etc.) | 10k-50k | **€0.10-0.40** | Niedrig | ✓ Mittel |
| Image-Compression | 50k-200k | €0.30-0.80 | Mittel | ✅ Stark |

---

## WAVE 0 — Sofort bauen (vollständige Specs vorhanden, Zeit-sensitiv)

**Dependency:** MLFileTool.svelte-Template muss vor diesen Tools existieren (ca. 2 Sessions Setup).

| Prio | Slug | Kategorie | Warum jetzt |
|---|---|---|---|
| **1** | `video-hintergrund-entfernen` | video | Spec 9 Sektionen fertig. Unscreen-Shutdown (01.12.2025) hat Vacuum hinterlassen. Jeder Monat Verzögerung = verlorenes Traffic-Fenster. Einzige 100%-pure-client-Lösung. |
| **2** | `sprache-verbessern` | audio | Spec 9 Sektionen fertig. Adobe Podcast Enhancer V2-Robotik + 4h-Cap treibt Refugee-Pool. DeepFilterNet3 MIT-lizenziert. Kein Konkurrent ist pure-client. |
| **3** | `webcam-hintergrund-unschaerfe` | video | Kurz-Spec nötig (MediaPipe ~0.5 MB, Apache-2.0, live-preview only, kein Export). Nutzt dieselbe MLFileTool-Infrastruktur. Zoom/Teams-Use-Case = Massen-Appeal. |

---

## WAVE 1 — Finance-Suite ✅ ENUM LIVE (höchster CPC, neu freigeschaltet 2026-04-23)

**Enum `finance` ist live.** Alle Tools sofort dispatch-ready. Schnell zu bauen (reine JS-Rechner, 1-2h each). Höchste AdSense-CPCs des gesamten Projekts.

| Prio | Slug | Kategorie | DE-Suchvolumen | CPC | Build |
|---|---|---|---|---|---|
| **4** | `mehrwertsteuer-rechner` | finance | ~500k/Monat | **€3-5** | 2h |
| **5** | `kreditrechner` | finance | ~200k/Monat | **€4-6** | 3h |
| **6** | `tilgungsplan-rechner` | finance | ~100k/Monat | **€3-5** | 4h |
| **7** | `brutto-netto-rechner` | finance | ~150k/Monat | **€2-3** | 3h |
| **8** | `zinsrechner` | finance | ~100k/Monat | **€2-4** | 2h |
| **9** | `zinseszins-rechner` | finance | ~80k/Monat | **€2-3** | 2h |
| **10** | `stundenlohn-jahresgehalt` | finance | ~60k/Monat | €1-2 | 2h |
| **11** | `rabatt-rechner` | finance | ~80k/Monat | €1-2 | 1h |
| **12** | `roi-rechner` | finance | ~40k/Monat | **€2-3** | 2h |
| **13** | `grunderwerbsteuer-rechner` | finance | ~40k/Monat | **€3-4** | 2h |
| **14** | `skonto-rechner` | finance | ~20k/Monat | €1-2 | 1h |
| **15** | `cashflow-rechner` | finance | ~15k/Monat | **€2-3** | 2h |
| **16** | `leasing-faktor-rechner` | finance | ~15k/Monat | **€2-4** | 2h |
| **17** | `erbschaftsteuer-rechner` | finance | ~20k/Monat | **€2-3** | 2h |
| **18** | `kgv-rechner` | finance | ~10k/Monat | **€1-2** | 2h |

---

## WAVE 2 — PDF-Suite (höchstes Einzel-Traffic-Cluster, kein Enum-Gate)

**Warum hier?** pdf24.de ist die am häufigsten besuchte deutsche Tool-Webseite. Alle PDF-Tools bei Konkurrenten = Server-Upload. Wir sind 100% Browser (pdf-lib/pdf.js). Das ist der stärkste DSGVO-Sell in DE. Alle `document`-Enum (existiert bereits).

**Dependency:** 1 Setup-Session für pdf-lib/pdfjs-dist Integration (wiederverwendbar für alle PDF-Tools).

| Prio | Slug | Kategorie | Warum | Est. Build |
|---|---|---|---|---|
| **19** | `pdf-zusammenfuehren` | document | Meistgesuchtes PDF-Tool DE. „PDF zusammenführen kostenlos ohne upload" = direkter Traffic-Magnet. | 3h |
| **20** | `pdf-aufteilen` | document | Zweitgrößtes PDF-Keyword. Steuererklärung / Dokument-Workflows. | 3h |
| **21** | `pdf-komprimieren` | document | E-Mail-Anhänge, Behörden-Uploads. | 3h |
| **22** | `pdf-zu-jpg` | document | Häufigster Konvertierungs-Wunsch. | 3h |
| **23** | `jpg-zu-pdf` | document | Bewerbungen, Rechnungen. Riesiges DE-Keyword. | 2h |
| **24** | `pdf-passwort` | document | „PDF verschlüsseln kostenlos" = Privacy-Zielgruppe. **Kein Konkurrent macht das ohne Upload.** | 4h |
| **25** | `pdf-seiten-loeschen` | document | Kontoauszüge anonymisieren vor Einreichung — massiver Privacy-Use-Case. | 3h |
| **26** | `pdf-zu-text` | document | „PDF text extrahieren" = häufige Recherche-Anfrage. | 3h |
| **27** | `pdf-drehen` | document | Scan-Korrektur, sehr häufig. | 2h |
| **28** | `pdf-wasserzeichen` | document | Dokument-Schutz. Firma + Privat. | 3h |
| **29** | `pdf-seitenzahlen` | document | Verträge, Abschlussarbeiten. | 2h |
| **30** | `pdf-seiten-neu-anordnen` | document | Eidesstattliche Erklärungen, Behörden-Dokumente. | 3h |
| **31** | `pdf-seiten-zaehler` | document | Mini-Tool, 1h Build, nützliches SEO-Sibling. | 1h |
| **32** | `pdf-zu-png` | document | Design-Workflow, Vorschau-Thumbnails. | 3h |

**SEO-Cluster-Effekt:** 14 PDF-Seiten, alle intern verlinkt → starkes topical authority Signal für Google DE.

---

## WAVE 3 — Construction-Suite ✅ ENUM LIVE (niedrigste Konkurrenz, neu freigeschaltet 2026-04-23)

**Enum `construction` ist live.** Extrem schwache Konkurrenz im deutschen DIY-Markt. Bestehende Sites (blitzrechner.de, heimwerker.de) sind alt und mobil-unfriendly. Unser DSGVO-Angle: keine Baupläne hochladen. CPC €1-2 (Baumaterial-Werbung).

| Prio | Slug | Kategorie | DE-Suchvolumen | CPC | Build |
|---|---|---|---|---|---|
| **33** | `fliesen-rechner` | construction | ~80k/Monat | €1.50 | 3h |
| **34** | `tapeten-rechner` | construction | ~60k/Monat | €1.50 | 3h |
| **35** | `laminat-rechner` | construction | ~70k/Monat | €1.50 | 3h |
| **36** | `wandfarbe-rechner` | construction | ~50k/Monat | €1.20 | 3h |
| **37** | `beton-rechner` | construction | ~40k/Monat | €1.20 | 3h |
| **38** | `estrich-rechner` | construction | ~20k/Monat | €1.00 | 2h |
| **39** | `holzmengen-rechner` | construction | ~15k/Monat | €1.00 | 2h |
| **40** | `daemmung-rechner` | construction | ~20k/Monat | €1.50 | 3h |
| **41** | `dach-flaeche-rechner` | construction | ~15k/Monat | €1.20 | 3h |
| **42** | `zaun-rechner` | construction | ~15k/Monat | €1.00 | 2h |
| **43** | `putz-rechner` | construction | ~10k/Monat | €1.00 | 2h |
| **44** | `moertel-rechner` | construction | ~10k/Monat | €1.00 | 2h |
| **45** | `heizkosten-rechner` | construction | ~40k/Monat | €1.50 | 3h |
| **46** | `treppe-rechner` | construction | ~10k/Monat | €1.20 | 3h |
| **47** | `fenster-u-wert-rechner` | construction | ~10k/Monat | €1.20 | 3h |

---

## WAVE 4 — Fehlende Hochvolumen-Tools + Converter-Cluster komplettieren

### 4a — Drei Tools die NICHT im Queue waren (jetzt in queue.md eingetragen)

Diese haben extrem hohes DE-Suchvolumen + sind mit `time`-Enum (existiert) baubar.

| Prio | Slug | Kategorie | Warum | Volumen | Est. Build |
|---|---|---|---|---|---|
| **48** | `altersrechner` | time | **Top-5 meistgesuchter Rechner DE.** Geburtstag eingeben → exaktes Alter in Jahren/Monaten/Tagen. Rente, Ausweisantrag, Kindergeld-Berechnung. | ~200k/Monat | 2h |
| **49** | `arbeitstage-rechner` | time | „Hidden gem" laut Research. Steuerberater, HR, Projektmanager. Besonders: Homeoffice-Tage für Steuererklärung 2025/2026. Sehr niedrige Konkurrenz. | ~80k/Monat | 3h |
| **50** | `datumsrechner` | time | Differenz zwischen zwei Daten berechnen. Schwangerschaft, Fristen, Vertragsende. Perennial-Evergreen. | ~100k/Monat | 2h |

### 4b — HEIC zu JPG (iPhone-Priorität)

| Prio | Slug | Kategorie | Warum | Est. Build |
|---|---|---|---|---|
| **51** | `heic-zu-jpg` | image | iPhone ist marktführendes Smartphone in DE (45%+ Marktanteil). HEIC = Standard iPhone-Format seit iOS 11. „HEIC to JPG" = eines der meistgesuchten Bildkonvertierungs-Keywords. Riesige Zielgruppe: iPhone-Nutzer die Fotos für Formulare/Bewerbungen brauchen. | 3h |

### 4c — Converter-Cluster komplettieren (Tier 3 Rest)

Jedes fehlende Converter-Paar schwächt das topical authority Signal für die ganze Kategorie.

| Prio | Slug | Kategorie | Warum | Est. Build |
|---|---|---|---|---|
| **52** | `fahrenheit-zu-celsius` | temperature | Reverse von bereits gebautem celsius-zu-fahrenheit. Internationale Rezepte, US-Reisende. | 1h |
| **53** | `kelvin-zu-celsius` | temperature | Physik-Unterricht, Naturwissenschaften. | 1h |
| **54** | `celsius-zu-kelvin` | temperature | Komplettiert Temperatur-Cluster (8d). | 1h |
| **55** | `rankine-zu-kelvin` | temperature | Nische aber komplettiert Cluster für SEO. | 1h |
| **56** | `reaumur-zu-celsius` | temperature | Historisch/Bildung. Komplettiert Cluster. | 1h |
| **57** | `liter-zu-gallonen` | volume | US-Rezepte, Tanken USA, Importautos. Hohes Volumen. | 1h |
| **58** | `milliliter-zu-unzen` | volume | Cocktails, Kosmetik, Medikamente. | 1h |
| **59** | `kubikmeter-zu-kubikfuss` | volume | Bau, Möbel-Import. | 1h |
| **60** | `barrel-zu-liter` | volume | Öl/Energie, Finanzrechner-Sibling. | 1h |
| **61** | `stunden-zu-minuten` | time | Arbeitszeit-Erfassung, Schüler. | 1h |
| **62** | `tage-zu-stunden` | time | Urlaubstage umrechnen, Projektplanung. | 1h |
| **63** | `jahre-zu-tagen` | time | Geburtstage, Jubiläen. | 1h |
| **64** | `monate-zu-tagen` | time | Vertragsfristen, Abo-Dauer. | 1h |
| **65** | `wochen-zu-tagen` | time | Schwangerschaft (SSW), Lieferzeiten. | 1h |
| **66** | `minuten-zu-sekunden` | time | Mathematik, Sport-Zeiten. | 1h |
| **67** | `millisekunden-zu-sekunden` | time | Entwickler, Performance-Tests. | 1h |
| **68** | `quadratkilometer-zu-quadratmeile` | area | Geographie, Länder vergleichen. | 1h |

---

## WAVE 5 — Math-Basis (Tier 7 + ergänzte Tools)

Sehr hohes Suchvolumen, sehr niedrige Konkurrenz in DE, `text`/`dev`-Enum kompatibel.

| Prio | Slug | Kategorie | Warum | Volumen | Est. Build |
|---|---|---|---|---|---|
| **69** | `prozent-differenz-rechner` | text | **Top-3 Mathe-Rechner DE.** Preis-Vergleich, Rabatte, Gehaltserhöhung. „Prozentualer Unterschied" ist Schul+Business-Evergreen. | ~300k/Monat | 2h |
| **70** | `mittelwert-median-rechner` | text | Statistik-Grundlage. Schulaufgaben, Datenanalyse. | ~80k/Monat | 2h |
| **71** | `bruch-dezimal-konverter` | text | Schüler, Rezepte (1/3 Tasse...), Mathe-Nachhilfe. | ~60k/Monat | 2h |
| **72** | `zahlsysteme-konverter` | dev | Binär/Dezimal/Hex/Oktal — Informatik-Schüler, Entwickler. Schnelle Build auf dev-enum. | ~50k/Monat | 2h |
| **73** | `fakultaet-rechner` | text | Mathe-Studenten, Kombinatorik. Nische aber einfach. | ~20k/Monat | 1h |

---

## WAVE 6 — Image-Cluster komplettieren

| Prio | Slug | Kategorie | Warum | Est. Build |
|---|---|---|---|---|
| **74** | `png-kompressor` | image | Massiv gesucht. Web-Entwickler, Blogger. Squoosh-Alternative die keine Daten hochlädt. | 3h |
| **75** | `jpg-kompressor` | image | Gleicher Use-Case wie PNG, gleich hohe Nachfrage. | 2h |
| **76** | `bild-groesse-aendern` | image | Passbild-Format, Social-Media-Thumbnails. | 3h |
| **77** | `favicon-generator` | image | Jeder Website-Betreiber braucht das. | 3h |
| **78** | `color-picker` | color | Brücken-Tool zu hex-rgb-konverter. Kreative, Webentwickler. | 3h |
| **79** | `crop-faktor-rechner` | image | Fotografie-Nische, aber sehr treu. Kamera-Sensor-Enum passt. | 2h |
| **80** | `svg-zu-png` | image | Designer, Frontend-Entwickler. | 3h |

---

## WAVE 7 — Dev-Tools (Tier 4) — Schnell zu bauen, Dev-Audience

Niedrigste CPCs, aber wichtig für Domain-Breite und Dev-Community-Traffic.

| Prio | Slug | Kategorie | Est. Build |
|---|---|---|---|
| **81** | `yaml-zu-json` | dev | 2h |
| **82** | `toml-zu-json` | dev | 2h |
| **83** | `csv-zu-json` | dev | 2h |
| **84** | `markdown-zu-html` | text | 2h |
| **85** | `html-zu-markdown` | text | 2h |
| **86** | `http-status-lookup` | dev | 1h |
| **87** | `mime-type-finder` | dev | 2h |
| **88** | `cron-expression-builder` | dev | „Hidden gem" laut Research — sehr wenig DE-Konkurrenz. 3h |
| **89** | `meta-tag-generator` | dev | 2h |
| **90** | `opengraph-generator` | dev | 2h |
| **91** | `sitemap-xml-generator` | dev | 2h |
| **92** | `robots-txt-generator` | dev | 2h |
| **93** | `gitignore-generator` | dev | 2h |
| **94** | `htaccess-generator` | dev | 2h |
| **95** | `nginx-config-generator` | dev | 3h |
| **96** | `htpasswd-generator` | dev | 2h |

---

## WAVE 8 — CSS Visual Tools (Tier 4)

| Prio | Slug | Kategorie | Est. Build |
|---|---|---|---|
| **97** | `css-gradient-generator` | dev | 3h |
| **98** | `css-shadow-generator` | dev | 3h |
| **99** | `box-shadow-generator` | dev | 2h |
| **100** | `text-shadow-generator` | dev | 2h |
| **101** | `css-grid-generator` | dev | 4h |
| **102** | `flexbox-playground` | dev | 4h |
| **103** | `css-animation-builder` | dev | 5h |

---

## WAVE 9 — Marketing/SEO Tools (Tier 5)

Guter B2B-CPM (~€1-2). Werbefachleute, Content-Creator.

| Prio | Slug | Kategorie | Est. Build |
|---|---|---|---|
| **104** | `seo-title-length-checker` | text | 2h |
| **105** | `meta-description-checker` | text | 2h |
| **106** | `utm-link-builder` | dev | 2h |
| **107** | `flesch-lesbarkeits-index` | text | 3h |
| **108** | `conversion-rate-rechner` | text | 2h |
| **109** | `cpc-cpm-cpa-rechner` | text | 2h |
| **110** | `roas-rechner` | text | 2h |
| **111** | `engagement-rate-rechner` | text | 2h |
| **112** | `ab-test-signifikanz` | text | 3h |
| **113** | `affiliate-provisions-rechner` | text | 2h |

---

## WAVE 10 — Text/Kryptographie/Kultur Tools (Tier 6)

Viral-Potential (Morsecode, NATO-Alphabet) trotz mittlerem Volumen.

| Prio | Slug | Kategorie | Est. Build |
|---|---|---|---|
| **114** | `morsecode-uebersetzer` | text | Viral-Potential, Schul-Projekt. 2h |
| **115** | `binaer-text-konverter` | text | Informatik-Unterricht. 2h |
| **116** | `nato-phonetisches-alphabet` | text | Telefonie, Sicherheit. 2h |
| **117** | `caesar-verschluesselung` | text | Schüler, Escape-Rooms. 2h |
| **118** | `rot13-rot47` | text | Entwickler-Classic. 1h |
| **119** | `braille-konverter` | text | Barrierefreiheit-Nische, Link-Magnet. 3h |
| **120** | `vigenere-chiffre` | text | Krypto-Enthusiasten. 2h |
| **121** | `atbash-chiffre` | text | 1h |
| **122** | `sternzeichen-lookup` | time | Social-Sharing-Potential. 1h |
| **123** | `kalender-gregorianisch-julianisch` | time | Geschichte/Bildung. 2h |

---

## WAVE 11 — Restliche Converter-Extensions (Tier 8a-d)

| Prio | Slug | Kategorie | Est. Build |
|---|---|---|---|
| **124** | `cup-zu-milliliter` | volume | US-Rezepte. 1h |
| **125** | `fluid-ounce-zu-milliliter` | volume | Cocktails, Import. 1h |
| **126** | `teaspoon-esloeffel` | volume | Backen. 1h |
| **127** | `troy-unze-zu-gramm` | weight | Gold/Silber-Preis-Umrechnung. Hobby-Investor. 1h |
| **128** | `karat-zu-gramm` | weight | Schmuck. 1h |
| **129** | `lichtjahr-zu-kilometer` | distance | Astronomie-Interesse. 1h |
| **130** | `bpm-rechner` | audio | Musik-Produktion. 2h |
| **131** | `lufs-messer` | audio | Podcast/YouTube-Loudness. 3h |
| **132** | `delay-reverb-sync` | audio | Musik-Produktion. 2h |
| **133** | `video-bitrate-rechner` | video | Videoproduktion. 2h |
| **134** | `speicherkarten-kapazitaet` | video | Fotografie/Video. 2h |
| **135** | `woerterzaehler` | text | Aufsätze, Bewerbungen. 1h |
| **136** | `mikrometer-zu-zoll` | length | Technik/Präzision. 1h |
| **137** | `nanometer-zu-angstroem` | length | Physik/Chemie-Nische. 1h |
| **138** | `parsec-zu-lichtjahr` | distance | Astronomie. 1h |
| **139** | `astronomische-einheit` | distance | Astronomie. 1h |

---

## WAVE 12 — Psychologie-Tools (Tier 9, nach Enum-Approval)

79 Tools. Warten auf User-Approval für 6 neue Enums: `persoenlichkeit`, `kognition`, `gesundheit-wellness`, `lernen`, `spass`, `sinne`.

Power-10 zuerst (höchstes virales Potenzial):
- big-five-persoenlichkeitstest · reaktionszeit-test · tipp-geschwindigkeitstest
- zahlengedaechtnis-test · persoenlichkeits-farbtest · liebessprachen-test
- bindungsstil-test · optimale-schlafzeit-rechner · chronotyp-test · lesegeschwindigkeits-test

---

## ⚠️ KRITISCHE STRATEGISCHE ENTSCHEIDUNG: Enum-Extension

**Das ist die wichtigste ungetroffene Entscheidung im gesamten Projekt.**

Mit der Freigabe von 4 neuen Enums werden **274 Hochvolumen-Tools** sofort dispatch-ready:

| Enum | Tools im PL | Traffic-Potential | CPC-Klasse |
|---|---|---|---|
| `math` | 76 | Sehr hoch (Schüler + Business) | €0.10-0.50 |
| `finance` | 68 | Sehr hoch (Millionen Suchen/Monat) | **€2-5+** |
| `construction` | 59 | Hoch (German DIY-Kultur stark) | €1-2 |
| `health` | 71 | Sehr hoch (aber Institution-Konkurrenz) | €0.50-1.50 |
| **Gesamt** | **274** | — | — |

**Top 10 sofort bauen nach Freigabe:**

| Priorität nach Enum-Freigabe | Slug | Enum | Monatl. DE-Suchen | CPC |
|---|---|---|---|---|
| A1 | `mehrwertsteuer-rechner` | finance | ~500k | **€3-5** |
| A2 | `bmi-rechner` | health | ~300k | €1.50 |
| A3 | `prozentrechner` (breiter als T7) | math | ~400k | €0.30 |
| A4 | `kreditrechner` | finance | ~200k | **€4-6** |
| A5 | `tilgungsrechner` | finance | ~100k | **€3-5** |
| A6 | `zinsrechner` | finance | ~100k | **€2-4** |
| A7 | `kalorienrechner` | health | ~150k | €1.00 |
| A8 | `fliesen-rechner` | construction | ~80k | €1.50 |
| A9 | `tapeten-rechner` | construction | ~60k | €1.50 |
| A10 | `gehaltsrechner` | finance | ~150k | **€2-3** |

**Empfehlung:** Enum-Freigabe für `finance` + `construction` sofort beantragen. Diese zwei Enums allein = 127 neue Tools mit den höchsten CPCs des gesamten Projekts.

---

## Hinweise für Paperclip CEO-Agent

### Dispatch-Reihenfolge
Dieses Dokument ist die verbindliche Dispatch-Reihenfolge. Ignoriere die Tier-1→8-FIFO aus `differenzierung-queue.md` für die Dispatch-Priorisierung. Nutze die Prioritäts-Nummern hier.

### Wichtige Abhängigkeiten
- **Priorität 1-3 (Wave 0):** Benötigen `MLFileTool.svelte`-Template. Dieser muss **vor** diesen Tools in `src/components/tools/` existieren. Setup-Session ca. 2-3h.
- **Priorität 19-32 (Wave 2 PDF):** Benötigen `pdf-lib` oder `pdfjs-dist` Integration. Setup-Session ca. 1-2h, dann alle PDF-Tools auf demselben Code-Fundament.
- **Priorität 48-50 (Wave 4a):** `altersrechner`, `arbeitstage-rechner`, `datumsrechner` sind in `differenzierung-queue.md` Tier 3 eingetragen (2026-04-23).

### Neue Tools — Queue-Status (2026-04-23)

Alle 7 fehlenden Tools wurden in `differenzierung-queue.md` eingetragen:
- `altersrechner`, `arbeitstage-rechner`, `datumsrechner` → Tier 3 (time-root)
- `png-kompressor`, `jpg-kompressor`, `bild-groesse-aendern`, `svg-zu-png` → Tier 2 (image-root)

### Verworfen: Was NICHT gebaut werden soll (Rejected)
Diese Tools könnten naheliegend wirken, sind aber wegen Hard-Caps ausgeschlossen:
- Krypto-Kurse / Wechselkurs-Live (R-1: Live-API)
- BMI als Diagnose-Tool mit Empfehlungen (R-3: Medizinische Diagnose)
- Passwort-Vault / Password-Manager (Server-Storage = NN #2 bricht)
- Fotobearbeitung mit Server-Roundtrip (NN #7)

---

## Schnelle Wins — Was bringt erste 10k+ Besucher/Monat am schnellsten?

Basierend auf Ranking-Geschwindigkeit (neue Seite) + Suchvolumen:

1. **`arbeitstage-rechner`** — Extrem niedrige Konkurrenz, hohes Volumen, #1 in 6-8 Wochen möglich
2. **`altersrechner`** — Sehr niedriger Wettbewerb in DE, #1 in 8-10 Wochen
3. **`pdf-zusammenfuehren`** — Höchstes Volumen, aber mittlere Konkurrenz. USP „kein Upload" kann das kippen.
4. **`heic-zu-jpg`** — iPhone-Wachstum = wachsende Zielgruppe, niedrige DE-Konkurrenz
5. **`video-hintergrund-entfernen`** — Unscreen-Vacuum noch offen, einziger pure-client Anbieter

---

**Version:** v3 · 2026-04-23
**Nächste Review:** Nach Wave 15 (Automotive komplett) — Enum-Approval für `persoenlichkeit`/`kognition` (Wave 12) prüfen.

---

## WAVE 13 — Health-Suite (71 Tools, €1.80-2.50 CPC, Enum `health` live)

Höchster CPC nach Finance. Millionen DE-Suchen. Konkurrenz: Krankenkassen-Sites, alt + kein Tool-Fokus. USP: privacy-first, kein Account.

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **140** | `kalorienbedarf-rechner` | health | ~500k | €2.50 | 3h |
| **141** | `grundumsatz-rechner` | health | ~400k | €2.30 | 2h |
| **142** | `tdee-rechner` | health | ~350k | €2.20 | 3h |
| **143** | `schwangerschaftswoche-rechner` | health | ~300k | €2.20 | 2h |
| **144** | `zyklus-kalender` | health | ~380k | €2.15 | 3h |
| **145** | `blutdruck-kategorisierung` | health | ~280k | €2.10 | 2h |
| **146** | `kalorienverbrauch-workout` | health | ~190k | €1.95 | 3h |
| **147** | `protein-bedarf-rechner` | health | ~200k | €2.00 | 2h |
| **148** | `vitamin-d-mangel-test` | health | ~200k | €2.00 | 2h |
| **149** | `ernaehrungsplan-rechner` | health | ~210k | €2.00 | 4h |
| **150** | `wasserbedarf-rechner` | health | ~180k | €1.90 | 2h |
| **151** | `impf-intervall-rechner` | health | ~185k | €2.05 | 2h |
| **152** | `ideal-gewicht-rechner` | health | ~160k | €1.85 | 2h |
| **153** | `puls-zonen-rechner` | health | ~160k | €1.90 | 3h |
| **154** | `schlafzyklus-rechner` | health | ~220k | €1.85 | 2h |
| **155** | `makronaehrstoff-rechner` | health | ~140k | €1.75 | 3h |
| **156** | `koerperfett-navy-rechner` | health | ~250k | €2.00 | 3h |
| **157** | `cholesterin-ratio-rechner` | health | ~150k | €1.80 | 2h |
| **158** | `muskelaufbau-kalorien` | health | ~130k | €1.75 | 2h |
| **159** | `fettabbau-rate-rechner` | health | ~95k | €1.65 | 2h |
| **160** | `lean-body-mass-rechner` | health | ~50k | €1.42 | 2h |
| **161** | `body-surface-area-rechner` | health | ~60k | €1.48 | 2h |
| **162** | `herzratenvariabilitaet` | health | ~55k | €1.45 | 3h |
| **163** | `vo2max-rechner` | health | ~140k | €1.75 | 3h |
| **164** | `basaltemperatur-tracker` | health | ~120k | €1.70 | 3h |
| **165** | `taille-huefte-verhaeltnis` | health | ~120k | €1.70 | 2h |
| **166** | `calcium-bedarf-rechner` | health | ~85k | €1.60 | 2h |
| **167** | `magnesium-bedarf-rechner` | health | ~45k | €1.38 | 1h |
| **168** | `eisen-bedarf-rechner` | health | ~55k | €1.45 | 2h |
| **169** | `ernaehrungsbedarfs-rechner` | health | ~110k | €1.75 | 3h |
| **170** | `hydration-sport-rechner` | health | ~95k | €1.65 | 2h |
| **171** | `recovery-time-rechner` | health | ~55k | €1.45 | 2h |
| **172** | `menopause-symptom-tracker` | health | ~140k | €1.80 | 3h |
| **173** | `wundheilung-dauer-rechner` | health | ~165k | €1.88 | 2h |
| **174** | `zahnersatz-kosten-rechner` | health | ~185k | €2.10 | 2h |
| **175** | `karies-risikotest` | health | ~165k | €2.00 | 3h |
| **176** | `sehschaerfe-berechnung` | health | ~175k | €1.82 | 2h |
| **177** | `brille-dioptrienrechner` | health | ~165k | €1.80 | 2h |
| **178** | `kontaktlinsen-dioptrien` | health | ~185k | €1.85 | 2h |
| **179** | `ansteckungsrisiko-rechner` | health | ~185k | €1.95 | 3h |
| **180** | `erholungszeit-rechner` | health | ~85k | €1.60 | 2h |
| **181** | `hauttyp-klassifizierung` | health | ~210k | €1.95 | 3h |
| **182** | `nahrungsmittelunvertraeglichkeit` | health | ~110k | €1.70 | 3h |
| **183** | `allergen-tracker` | health | ~75k | €1.55 | 3h |
| **184** | `medikamenten-interaktion` | health | ~125k | €1.75 | 3h |
| **185** | `supplement-timing` | health | ~42k | €1.32 | 2h |
| **186** | `low-carb-kalkulator` | health | ~175k | €1.85 | 2h |
| **187** | `keto-makro-rechner` | health | ~165k | €1.82 | 2h |
| **188** | `hormonzyklus-rechner` | health | ~95k | €1.65 | 3h |
| **189** | `bmi-kinder-rechner` | health | ~85k | €1.60 | 2h |
| **190** | `knochendichte-risikotest` | health | ~95k | €1.65 | 2h |
| **191** | `intermittierendes-fasten-timer` | health | ~185k | €1.88 | 2h |
| **192** | `fiber-tagesbedarf` | health | ~65k | €1.50 | 1h |
| **193** | `elektrolyt-balance` | health | ~58k | €1.47 | 2h |
| **194** | `trinkmenge-persoenlich` | health | ~180k | €1.90 | 2h |
| **195** | `zahnreinigung-intervall` | health | ~145k | €1.90 | 2h |
| **196** | `haarwachstum-rechner` | health | ~145k | €1.85 | 2h |
| **197** | `schrittlaenge-rechner` | health | ~100k | €1.60 | 2h |
| **198** | `quarantaene-dauer-rechner` | health | ~165k | €1.88 | 2h |
| **199** | `augendruck-normwert` | health | ~145k | €1.75 | 2h |
| **200** | `immunsystem-staerkungsguide` | health | ~145k | €1.85 | 3h |
| **201** | `blutgruppen-vertraeglichkeit` | health | ~95k | €1.65 | 2h |
| **202** | `blutzucker-hba1c-rechner` | health | ~150k | €2.20 | 2h |
| **203** | `diabetes-risiko-rechner` | health | ~185k | €2.15 | 3h |
| **204** | `herzerkrankungs-risiko` | health | ~165k | €2.10 | 3h |
| **205** | `stroke-risiko-rechner` | health | ~95k | €2.05 | 3h |
| **206** | `burnout-risiko-test` | health | ~210k | €2.00 | 3h |
| **207** | `stress-level-rechner` | health | ~210k | €2.00 | 3h |
| **208** | `schlafqualitaet-index` | health | ~185k | €1.90 | 3h |
| **209** | `nierenfunktion-gfr-rechner` | health | ~85k | €1.85 | 2h |
| **210** | `schilddruesentest-rechner` | health | ~125k | €1.95 | 2h |

---

## WAVE 14 — Math-Suite (76 Tools, Schulkinder + Studenten, Enum `math` live)

Riesige DE-Zielgruppe (5-13 Mio. Schüler). Konkurrenz: mathe.de, mathebibel.de — alt, keine interaktiven Rechner.

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **211** | `prozentrechner` | math | ~1.2M | €0.45 | 2h |
| **212** | `dreisatzrechner` | math | ~800k | €0.40 | 2h |
| **213** | `kreisflaeche-umfang-rechner` | math | ~520k | €0.38 | 2h |
| **214** | `mittelwert-median-rechner` | math | ~420k | €0.36 | 2h |
| **215** | `potenzen-rechner` | math | ~450k | €0.35 | 1h |
| **216** | `quadratische-gleichung-rechner` | math | ~380k | €0.33 | 2h |
| **217** | `wahrscheinlichkeits-rechner` | math | ~320k | €0.31 | 3h |
| **218** | `primzahl-checker` | math | ~310k | €0.31 | 1h |
| **219** | `pythagoras-rechner` | math | ~290k | €0.30 | 2h |
| **220** | `dreieck-flaeche-rechner` | math | ~240k | €0.29 | 2h |
| **221** | `fibonacci-rechner` | math | ~220k | €0.28 | 2h |
| **222** | `binomische-formeln` | math | ~210k | €0.28 | 2h |
| **223** | `rechteck-flaeche-umfang` | math | ~195k | €0.27 | 1h |
| **224** | `normalverteilung-rechner` | math | ~175k | €0.26 | 3h |
| **225** | `logarithmus-rechner` | math | ~185k | €0.26 | 2h |
| **226** | `kugelvolumen-rechner` | math | ~180k | €0.26 | 2h |
| **227** | `ggt-rechner` | math | ~175k | €0.26 | 1h |
| **228** | `kgv-rechner` | math | ~165k | €0.25 | 1h |
| **229** | `zylindervolumen-rechner` | math | ~165k | €0.25 | 2h |
| **230** | `exponentialfunktion-rechner` | math | ~135k | €0.24 | 2h |
| **231** | `z-score-rechner` | math | ~145k | €0.24 | 2h |
| **232** | `kombinatorik-rechner` | math | ~165k | €0.25 | 2h |
| **233** | `konfidenzintervall-rechner` | math | ~105k | €0.21 | 3h |
| **234** | `trapez-flaeche-rechner` | math | ~105k | €0.21 | 1h |
| **235** | `kegelvolumen-rechner` | math | ~110k | €0.22 | 2h |
| **236** | `quadervolumen-rechner` | math | ~140k | €0.24 | 1h |
| **237** | `varianz-rechner` | math | ~95k | €0.20 | 2h |
| **238** | `p-wert-rechner` | math | ~88k | €0.19 | 3h |
| **239** | `ellipse-flaeche-rechner` | math | ~85k | €0.19 | 1h |
| **240** | `pyramidenvolumen-rechner` | math | ~95k | €0.20 | 2h |
| **241** | `permutationen-rechner` | math | ~140k | €0.24 | 2h |
| **242** | `lineare-gleichung-rechner` | math | ~320k | €0.32 | 2h |
| **243** | `standardabweichung-rechner` | math | ~165k | €0.25 | 2h |
| **244** | `t-test-rechner` | math | ~98k | €0.20 | 3h |
| **245** | `chi-quadrat-rechner` | math | ~75k | €0.18 | 3h |
| **246** | `ableitungsrechner` | math | ~185k | €0.26 | 3h |
| **247** | `integralrechner` | math | ~165k | €0.25 | 3h |
| **248** | `rhombus-flaeche-rechner` | math | ~75k | €0.18 | 1h |
| **249** | `binomialverteilung-rechner` | math | ~130k | €0.23 | 2h |
| **250** | `korrelation-rechner` | math | ~125k | €0.23 | 2h |
| **251** | `lineare-regression-rechner` | math | ~110k | €0.22 | 3h |
| **252** | `standardfehler-rechner` | math | ~72k | €0.17 | 2h |
| **253** | `faktorisierung-rechner` | math | ~145k | €0.24 | 2h |
| **254** | `modulo-rechner` | math | ~120k | €0.23 | 1h |
| **255** | `vektor-rechner` | math | ~72k | €0.17 | 3h |
| **256** | `matrix-determinante-rechner` | math | ~65k | €0.16 | 2h |
| **257** | `matrix-inversion-rechner` | math | ~42k | €0.12 | 3h |
| **258** | `polar-kartesisch-rechner` | math | ~45k | €0.12 | 2h |
| **259** | `trigonometrie-rechner` | math | ~165k | €0.25 | 3h |
| **260** | `bogengrad-radiant-rechner` | math | ~125k | €0.23 | 1h |
| **261** | `quartile-rechner` | math | ~95k | €0.20 | 2h |
| **262** | `effektstaerke-rechner` | math | ~65k | €0.16 | 2h |
| **263** | `grenzwert-rechner` | math | ~125k | €0.23 | 3h |
| **264** | `spearman-korrelation` | math | ~38k | €0.11 | 2h |
| **265** | `binomialkoeffizient-rechner` | math | ~125k | €0.23 | 2h |
| **266** | `wahrscheinlichkeitsbaum` | math | ~110k | €0.22 | 3h |
| **267** | `schiefe-kurtosis-rechner` | math | ~42k | €0.12 | 2h |
| **268** | `fourieranalyse` | math | ~48k | €0.13 | 4h |
| **269** | `laplace-transformation` | math | ~35k | €0.10 | 4h |
| **270** | `quadratwurzel-rechner` | math | ~320k | €0.31 | 1h |
| **271** | `kubikwurzel-rechner` | math | ~125k | €0.23 | 1h |
| **272** | `n-te-wurzel-rechner` | math | ~75k | €0.18 | 1h |
| **273** | `dreieck-rechner` | math | ~185k | €0.26 | 3h |
| **274** | `kreis-rechner` | math | ~280k | €0.29 | 2h |
| **275** | `kegel-rechner` | math | ~95k | €0.20 | 2h |
| **276** | `zylinder-rechner` | math | ~125k | €0.23 | 2h |
| **277** | `kugel-rechner` | math | ~105k | €0.21 | 2h |
| **278** | `parallelogramm-rechner` | math | ~75k | €0.18 | 1h |
| **279** | `komplexe-zahlen-rechner` | math | ~95k | €0.20 | 3h |
| **280** | `primfaktorzerlegung` | math | ~165k | €0.25 | 2h |
| **281** | `reihenkonvergenz-rechner` | math | ~65k | €0.16 | 3h |
| **282** | `matrix-multiplikation-rechner` | math | ~85k | €0.19 | 3h |
| **283** | `viereck-rechner` | math | ~85k | €0.19 | 2h |
| **284** | `pyramide-rechner` | math | ~90k | €0.19 | 2h |
| **285** | `vektor-skalarprodukt` | math | ~58k | €0.15 | 2h |
| **286** | `eigenvektor-rechner` | math | ~35k | €0.10 | 4h |

---

## WAVE 15 — Automotive-Suite (50 Tools, €0.75-1.15 CPC, Enum `automotive` live)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **287** | `spritverbrauch-rechner` | automotive | ~650k | €1.10 | 2h |
| **288** | `fahrkosten-rechner` | automotive | ~450k | €1.00 | 3h |
| **289** | `kfz-steuer-rechner` | automotive | ~380k | €1.05 | 3h |
| **290** | `fahrtzeit-rechner` | automotive | ~380k | €0.95 | 2h |
| **291** | `elektroauto-reichweite` | automotive | ~380k | €0.95 | 3h |
| **292** | `reifen-groesse-rechner` | automotive | ~310k | €0.90 | 2h |
| **293** | `winterreifen-checker` | automotive | ~185k | €0.82 | 2h |
| **294** | `ladezeit-elektroauto` | automotive | ~220k | €0.85 | 3h |
| **295** | `oelwechsel-intervall` | automotive | ~250k | €0.88 | 2h |
| **296** | `reifendruck-rechner` | automotive | ~140k | €0.75 | 2h |
| **297** | `kfz-versicherung-rechner` | automotive | ~200k | €1.15 | 3h |
| **298** | `tuev-intervall-rechner` | automotive | ~110k | €0.72 | 2h |
| **299** | `bremsweg-rechner` | automotive | ~185k | €0.95 | 2h |
| **300** | `reifenprofil-rechner` | automotive | ~125k | €0.74 | 2h |
| **301** | `rpm-drehzahl-rechner` | automotive | ~185k | €1.15 | 2h |
| **302** | `zahnriemen-intervall` | automotive | ~145k | €0.80 | 2h |
| **303** | `co2-bilanz-auto` | automotive | ~160k | €0.82 | 3h |
| **304** | `motorleistung-rechner` | automotive | ~165k | €0.95 | 2h |
| **305** | `drehmoment-kw-rechner` | automotive | ~125k | €0.88 | 2h |
| **306** | `leasing-vs-kauf-auto` | automotive | ~145k | €0.95 | 3h |
| **307** | `auto-kaufpreis-rechner` | automotive | ~125k | €0.85 | 2h |
| **308** | `auto-restwert-rechner` | automotive | ~95k | €0.80 | 2h |
| **309** | `mietwagen-kosten-rechner` | automotive | ~165k | €0.92 | 2h |
| **310** | `carsharing-vs-kauf` | automotive | ~85k | €0.75 | 3h |
| **311** | `motorenoel-viskositaet` | automotive | ~120k | €0.75 | 2h |
| **312** | `reifen-durchmesser-rechner` | automotive | ~185k | €0.80 | 2h |
| **313** | `felgen-einpresstiefe` | automotive | ~55k | €0.62 | 2h |
| **314** | `zuendkerzen-lebensdauer` | automotive | ~95k | €0.70 | 2h |
| **315** | `luftfilter-wechsel` | automotive | ~95k | €0.70 | 2h |
| **316** | `batterie-zustand-checker` | automotive | ~85k | €0.68 | 2h |
| **317** | `umweltzone-checker` | automotive | ~95k | €0.70 | 2h |
| **318** | `sommerreifen-wechsel` | automotive | ~140k | €0.75 | 2h |
| **319** | `reifenabrieb-rechner` | automotive | ~75k | €0.65 | 2h |
| **320** | `autobahn-kosten-rechner` | automotive | ~120k | €0.78 | 2h |
| **321** | `hybrid-batterie-zustand` | automotive | ~65k | €0.65 | 2h |
| **322** | `elektrobus-reichweite` | automotive | ~80k | €0.68 | 2h |
| **323** | `wasserstoff-tank-rechner` | automotive | ~35k | €0.57 | 2h |
| **324** | `biokraftstoff-check` | automotive | ~45k | €0.61 | 2h |
| **325** | `turbo-boost-rechner` | automotive | ~55k | €0.62 | 2h |
| **326** | `bremseninspektion-rechner` | automotive | ~55k | €0.60 | 2h |
| **327** | `stossdaempfer-pruefung` | automotive | ~42k | €0.58 | 2h |
| **328** | `felgen-traglast` | automotive | ~48k | €0.60 | 2h |
| **329** | `bremsflussigkeit-test` | automotive | ~32k | €0.56 | 2h |
| **330** | `kuehlmittel-check` | automotive | ~28k | €0.54 | 1h |
| **331** | `scheibenwaschanlage` | automotive | ~15k | €0.48 | 1h |
| **332** | `pannenkits-check` | automotive | ~55k | €0.62 | 2h |
| **333** | `scheinwerfer-justierung` | automotive | ~32k | €0.56 | 2h |
| **334** | `treibstoffadditiv-rechner` | automotive | ~35k | €0.57 | 2h |
| **335** | `getriebeoel-test` | automotive | ~25k | €0.53 | 1h |
| **336** | `abgasanlage-check` | automotive | ~42k | €0.60 | 2h |

---

## WAVE 16 — Sport-Suite (60 Tools, €0.72-1.15 CPC, Enum `sport` live)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **337** | `pace-rechner-laufen` | sport | ~480k | €1.10 | 2h |
| **338** | `dart-wertung-rechner` | sport | ~320k | €1.08 | 2h |
| **339** | `fahrrad-geschwindigkeit` | sport | ~280k | €1.05 | 2h |
| **340** | `schach-elo-rechner` | sport | ~200k | €1.05 | 2h |
| **341** | `marathonzeit-prognose` | sport | ~210k | €1.05 | 3h |
| **342** | `golf-handicap-rechner` | sport | ~185k | €1.12 | 3h |
| **343** | `tennis-serve-geschwindigkeit` | sport | ~185k | €1.10 | 2h |
| **344** | `squat-one-rep-max` | sport | ~185k | €1.10 | 2h |
| **345** | `triathlon-rechner` | sport | ~110k | €1.15 | 3h |
| **346** | `bankdruecken-max-rechner` | sport | ~165k | €1.08 | 2h |
| **347** | `kreuzheben-max-rechner` | sport | ~145k | €1.06 | 2h |
| **348** | `halbmarathon-prognose` | sport | ~165k | €1.00 | 2h |
| **349** | `5k-pace-rechner` | sport | ~185k | €1.00 | 2h |
| **350** | `10k-prognose-rechner` | sport | ~140k | €0.95 | 2h |
| **351** | `kampfsport-gewichtsklasse` | sport | ~165k | €1.10 | 2h |
| **352** | `motorsport-bremsweg` | sport | ~95k | €0.95 | 2h |
| **353** | `dart-checkout-rechner` | sport | ~180k | €1.02 | 3h |
| **354** | `fitness-progressive-load` | sport | ~125k | €1.02 | 3h |
| **355** | `drohnen-akkulaufzeit` | sport | ~125k | €1.02 | 2h |
| **356** | `crossfit-analyzer` | sport | ~105k | €0.98 | 2h |
| **357** | `fussball-schussgeschwindigkeit` | sport | ~185k | €0.98 | 3h |
| **358** | `schwimmen-pace-rechner` | sport | ~145k | €0.90 | 2h |
| **359** | `fahrrad-trittfrequenz` | sport | ~165k | €0.92 | 2h |
| **360** | `boxen-kraft-rechner` | sport | ~95k | €0.92 | 2h |
| **361** | `bodybuilding-volumen` | sport | ~95k | €0.95 | 2h |
| **362** | `gewichtheben-max` | sport | ~140k | €1.05 | 2h |
| **363** | `powerlifting-total` | sport | ~110k | €1.00 | 2h |
| **364** | `basketball-dreierquote` | sport | ~140k | €1.05 | 2h |
| **365** | `basketball-freiwurf` | sport | ~95k | €0.88 | 2h |
| **366** | `klettern-koerpergewicht` | sport | ~85k | €0.88 | 2h |
| **367** | `ski-schwierigkeitsgrad` | sport | ~95k | €0.88 | 2h |
| **368** | `tischtennis-geschwindigkeit` | sport | ~75k | €0.85 | 2h |
| **369** | `mountainbike-federung` | sport | ~85k | €0.85 | 3h |
| **370** | `rennrad-gewicht` | sport | ~55k | €0.82 | 2h |
| **371** | `volleyball-schlagkraft` | sport | ~65k | €0.82 | 2h |
| **372** | `golf-driving-analyse` | sport | ~65k | €0.82 | 2h |
| **373** | `yoga-kalorienverbrauch` | sport | ~75k | €0.85 | 2h |
| **374** | `tauchen-sicherheitsstopp` | sport | ~85k | €0.90 | 3h |
| **375** | `sprint-analyse` | sport | ~95k | €0.85 | 2h |
| **376** | `springen-weite-hoch` | sport | ~125k | €0.95 | 2h |
| **377** | `zehnkampf-punkte` | sport | ~55k | €0.80 | 2h |
| **378** | `surf-wellenhoehe` | sport | ~65k | €0.82 | 2h |
| **379** | `rudern-pace-rechner` | sport | ~55k | €0.80 | 2h |
| **380** | `pilates-kalorienverbrauch` | sport | ~45k | €0.78 | 2h |
| **381** | `langlauf-tempo` | sport | ~48k | €0.78 | 2h |
| **382** | `bogenschiessen-rechner` | sport | ~45k | €0.78 | 2h |
| **383** | `schiessen-ballistik` | sport | ~85k | €0.88 | 3h |
| **384** | `billiard-winkel` | sport | ~95k | €0.90 | 2h |
| **385** | `kegeln-durchschnitt` | sport | ~75k | €0.85 | 2h |
| **386** | `karate-graduierung` | sport | ~55k | €0.80 | 2h |
| **387** | `taekwondo-gurt-pruefung` | sport | ~48k | €0.78 | 2h |
| **388** | `ringen-gewichtsklasse` | sport | ~38k | €0.72 | 2h |
| **389** | `skispringen-distanz` | sport | ~35k | €0.72 | 2h |
| **390** | `eislaufen-sprunghoehe` | sport | ~42k | €0.75 | 2h |
| **391** | `snowboard-neigung` | sport | ~42k | €0.75 | 2h |
| **392** | `stabhochsprung-analyse` | sport | ~55k | €0.80 | 2h |
| **393** | `diskus-wurf-kurve` | sport | ~38k | €0.72 | 2h |
| **394** | `kajakpaddel-rate` | sport | ~38k | €0.72 | 2h |
| **395** | `modellflugzeug-flugzeit` | sport | ~65k | €0.82 | 2h |
| **396** | `rc-auto-topspeed` | sport | ~75k | €0.85 | 2h |

---

## WAVE 17 — Science-Suite (61 Tools, Physik/Chemie/MINT, Enum `science` live)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **397** | `energieverbrauch-rechner` | science | ~450k | €0.52 | 2h |
| **398** | `stromkostenrechner` | science | ~320k | €0.48 | 2h |
| **399** | `ph-wert-rechner` | science | ~450k | €0.52 | 2h |
| **400** | `ohmsches-gesetz` | science | ~380k | €0.55 | 2h |
| **401** | `molmasse-rechner` | science | ~320k | €0.50 | 2h |
| **402** | `kinetische-energie-rechner` | science | ~285k | €0.48 | 2h |
| **403** | `elektrische-leistung-rechner` | science | ~290k | €0.50 | 2h |
| **404** | `schallgeschwindigkeit-rechner` | science | ~195k | €0.42 | 2h |
| **405** | `dezibel-umrechner` | science | ~280k | €0.48 | 2h |
| **406** | `frequenz-wellenlaenge-rechner` | science | ~210k | €0.45 | 2h |
| **407** | `gravitation-rechner` | science | ~185k | €0.42 | 2h |
| **408** | `potentielle-energie-rechner` | science | ~220k | €0.44 | 2h |
| **409** | `molare-konzentration-rechner` | science | ~185k | €0.42 | 2h |
| **410** | `gasgesetz-rechner` | science | ~225k | €0.45 | 2h |
| **411** | `drehmoment-rechner` | science | ~165k | €0.40 | 2h |
| **412** | `pendel-schwingung-rechner` | science | ~165k | €0.40 | 2h |
| **413** | `impuls-rechner` | science | ~140k | €0.38 | 2h |
| **414** | `kondensator-energie-rechner` | science | ~105k | €0.35 | 2h |
| **415** | `radioaktiver-zerfall-rechner` | science | ~180k | €0.41 | 3h |
| **416** | `photonenenergie-rechner` | science | ~125k | €0.38 | 2h |
| **417** | `magnetfeld-rechner` | science | ~125k | €0.38 | 3h |
| **418** | `orbitalgeschwindigkeit-rechner` | science | ~110k | €0.36 | 2h |
| **419** | `saeure-base-rechner` | science | ~165k | €0.40 | 3h |
| **420** | `coulomb-kraft-rechner` | science | ~95k | €0.32 | 2h |
| **421** | `stromstaerke-rechner` | science | ~210k | €0.45 | 2h |
| **422** | `spannungsteiler-rechner` | science | ~165k | €0.40 | 2h |
| **423** | `impedanz-rechner` | science | ~125k | €0.38 | 3h |
| **424** | `linsengleichung-rechner` | science | ~75k | €0.28 | 2h |
| **425** | `lichtbrechung-rechner` | science | ~95k | €0.32 | 2h |
| **426** | `doppler-effekt-rechner` | science | ~125k | €0.38 | 2h |
| **427** | `zentrifugalkraft-rechner` | science | ~125k | €0.38 | 2h |
| **428** | `fluchtgeschwindigkeit-rechner` | science | ~95k | €0.32 | 2h |
| **429** | `redoxgleichung-rechner` | science | ~95k | €0.32 | 3h |
| **430** | `puffer-rechner` | science | ~75k | €0.28 | 3h |
| **431** | `elastische-energie-rechner` | science | ~95k | €0.32 | 2h |
| **432** | `dampfdruck-rechner` | science | ~85k | €0.30 | 2h |
| **433** | `leistungsfaktor-rechner` | science | ~110k | €0.36 | 2h |
| **434** | `effektivwert-rechner` | science | ~85k | €0.30 | 2h |
| **435** | `molenbruch-rechner` | science | ~95k | €0.32 | 2h |
| **436** | `faraday-induktion-rechner` | science | ~75k | €0.28 | 3h |
| **437** | `traegheitsmoment-rechner` | science | ~85k | €0.30 | 3h |
| **438** | `co2-fussabdruck-rechner` | science | ~220k | €0.45 | 3h |
| **439** | `solarertrag-rechner` | science | ~185k | €0.45 | 3h |
| **440** | `windkraft-ertrag-rechner` | science | ~165k | €0.42 | 3h |
| **441** | `waermedaemmung-rechner` | science | ~145k | €0.40 | 3h |
| **442** | `kuehlleistung-rechner` | science | ~185k | €0.42 | 3h |
| **443** | `vergroesserung-mikroskop` | science | ~85k | €0.30 | 2h |
| **444** | `spektroskopie-rechner` | science | ~55k | €0.24 | 3h |
| **445** | `plancks-gesetz-rechner` | science | ~45k | €0.19 | 3h |
| **446** | `induktivitaet-rechner` | science | ~75k | €0.28 | 3h |
| **447** | `gauss-gesetz-rechner` | science | ~52k | €0.22 | 3h |
| **448** | `harmonische-schwingung` | science | ~75k | €0.28 | 3h |
| **449** | `widerstand-temp-koeff` | science | ~85k | €0.30 | 2h |
| **450** | `regenwasser-speicher` | science | ~145k | €0.38 | 3h |
| **451** | `pumpenleistung-rechner` | science | ~165k | €0.42 | 2h |
| **452** | `kompressorleistung-rechner` | science | ~155k | €0.40 | 2h |
| **453** | `entfeuchter-kapazitaet` | science | ~95k | €0.35 | 2h |
| **454** | `lc-resonanz-rechner` | science | ~95k | €0.32 | 3h |
| **455** | `reaktanz-rechner` | science | ~65k | €0.26 | 2h |
| **456** | `van-der-waals-rechner` | science | ~65k | €0.26 | 3h |
| **457** | `photovoltaik-rechner` | science | ~225k | €0.52 | 3h |

---

## WAVE 18 — Engineering-Suite (50 Tools, B2B, Enum `engineering` live)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **458** | `duebel-auswaehler` | engineering | ~185k | €0.65 | 2h |
| **459** | `federsteifigkeit-rechner` | engineering | ~145k | €0.62 | 3h |
| **460** | `toleranzen-paarung` | engineering | ~155k | €0.65 | 3h |
| **461** | `stahlprofile-rechner` | engineering | ~165k | €0.62 | 3h |
| **462** | `draht-querschnitt-rechner` | engineering | ~165k | €0.68 | 2h |
| **463** | `maschinenelemente-rechner` | engineering | ~155k | €0.65 | 4h |
| **464** | `hydraulik-druck-rechner` | engineering | ~145k | €0.62 | 3h |
| **465** | `pumpen-volumenstrom` | engineering | ~155k | €0.65 | 3h |
| **466** | `rohrdurchmesser-rechner` | engineering | ~125k | €0.60 | 2h |
| **467** | `zahnrad-uebersetzung` | engineering | ~125k | €0.60 | 3h |
| **468** | `eigenfrequenz-rechner` | engineering | ~125k | €0.60 | 3h |
| **469** | `grundbau-tragfaehigkeit` | engineering | ~125k | €0.60 | 3h |
| **470** | `schwungrad-energie` | engineering | ~125k | €0.60 | 3h |
| **471** | `verschraubung-anzugmoment` | engineering | ~125k | €0.60 | 2h |
| **472** | `zahnstange-ritzel` | engineering | ~95k | €0.52 | 3h |
| **473** | `bolzen-berechnung` | engineering | ~95k | €0.52 | 3h |
| **474** | `balkenbiegung-rechner` | engineering | ~95k | €0.52 | 3h |
| **475** | `hydraulik-durchfluss` | engineering | ~125k | €0.60 | 3h |
| **476** | `kompressor-leistung` | engineering | ~115k | €0.57 | 3h |
| **477** | `turbinen-drehzahl` | engineering | ~105k | €0.53 | 3h |
| **478** | `lagerkraefte-rechner` | engineering | ~110k | €0.55 | 3h |
| **479** | `warmausdehnung-rechner` | engineering | ~95k | €0.52 | 2h |
| **480** | `schwingungsanalyse` | engineering | ~105k | €0.53 | 3h |
| **481** | `daempfungskoeffizient` | engineering | ~95k | €0.52 | 3h |
| **482** | `schneckengetriebe-rechner` | engineering | ~75k | €0.45 | 3h |
| **483** | `keilriemen-laenge` | engineering | ~85k | €0.48 | 2h |
| **484** | `riemenantrieb-rechner` | engineering | ~85k | €0.48 | 3h |
| **485** | `lager-traglast-rechner` | engineering | ~85k | €0.48 | 3h |
| **486** | `kupfer-widerstand-rechner` | engineering | ~85k | €0.48 | 2h |
| **487** | `ventil-durchfluss` | engineering | ~75k | €0.45 | 3h |
| **488** | `scherspannung-rechner` | engineering | ~75k | €0.45 | 2h |
| **489** | `kettenantrieb-rechner` | engineering | ~75k | €0.45 | 2h |
| **490** | `oberflaechen-rauhheit` | engineering | ~75k | €0.45 | 2h |
| **491** | `flaechen-traegheitsmoment` | engineering | ~55k | €0.38 | 3h |
| **492** | `stahlbeton-bewehrung` | engineering | ~95k | €0.52 | 3h |
| **493** | `pfahlgruendung-rechner` | engineering | ~55k | €0.38 | 3h |
| **494** | `stuetzmauer-rechner` | engineering | ~65k | €0.42 | 3h |
| **495** | `spannstahl-kraft` | engineering | ~75k | €0.45 | 3h |
| **496** | `filter-durchfluss` | engineering | ~95k | €0.52 | 3h |
| **497** | `bremsenergieabsorption` | engineering | ~85k | €0.48 | 3h |
| **498** | `rohrbiegung-kraft` | engineering | ~55k | €0.38 | 2h |
| **499** | `flanschen-rechner` | engineering | ~65k | €0.42 | 3h |
| **500** | `kupplungsmoment` | engineering | ~65k | €0.42 | 3h |
| **501** | `druckspannung-rechner` | engineering | ~85k | €0.48 | 2h |
| **502** | `vickers-haerte-rechner` | engineering | ~45k | €0.32 | 2h |
| **503** | `materialkenndaten` | engineering | ~75k | €0.45 | 3h |
| **504** | `kernhaertetiefe` | engineering | ~55k | €0.38 | 2h |
| **505** | `schrauben-auswaehler` | engineering | ~145k | €0.60 | 2h |
| **506** | `lueftungsanlage-rechner` | engineering | ~145k | €0.58 | 3h |
| **507** | `elektroinstallation-rechner` | engineering | ~125k | €0.55 | 3h |

---

## WAVE 19 — Education-Suite (50 Tools, Schüler/Studenten, Enum `education` live)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **508** | `notenschnitt-rechner` | education | ~580k | €0.72 | 2h |
| **509** | `abitur-punkte-rechner` | education | ~320k | €0.60 | 2h |
| **510** | `bafoeg-rechner` | education | ~320k | €0.60 | 3h |
| **511** | `pomodoro-timer` | education | ~210k | €0.52 | 2h |
| **512** | `klausurnote-rechner` | education | ~220k | €0.52 | 2h |
| **513** | `punkte-zu-noten-rechner` | education | ~185k | €0.48 | 2h |
| **514** | `studentenkosten-rechner` | education | ~185k | €0.48 | 3h |
| **515** | `lesegeschwindigkeit-test` | education | ~185k | €0.48 | 2h |
| **516** | `wortschatz-frequenz` | education | ~185k | €0.48 | 3h |
| **517** | `stundenplan-optimierer` | education | ~185k | €0.48 | 3h |
| **518** | `gpa-konverter` | education | ~185k | €0.48 | 2h |
| **519** | `noten-simulator` | education | ~145k | €0.42 | 2h |
| **520** | `semester-planer` | education | ~145k | €0.42 | 3h |
| **521** | `lernziel-planer` | education | ~145k | €0.42 | 3h |
| **522** | `pruefungsplan-rechner` | education | ~145k | €0.42 | 2h |
| **523** | `konzentrations-timer` | education | ~145k | €0.42 | 2h |
| **524** | `sprachlevel-tester` | education | ~165k | €0.45 | 3h |
| **525** | `fremdsprachen-lernpfad` | education | ~145k | €0.42 | 3h |
| **526** | `studienkredit-rechner` | education | ~165k | €0.45 | 3h |
| **527** | `ects-punkte-rechner` | education | ~125k | €0.40 | 2h |
| **528** | `gewichtete-note-rechner` | education | ~125k | €0.40 | 2h |
| **529** | `spaced-repetition-planer` | education | ~125k | €0.40 | 3h |
| **530** | `karrierepfad-simulator` | education | ~125k | €0.40 | 3h |
| **531** | `anwesenheitsquote-rechner` | education | ~125k | €0.40 | 2h |
| **532** | `akzent-trainer` | education | ~125k | €0.40 | 3h |
| **533** | `klausurtermin-planer` | education | ~105k | €0.38 | 2h |
| **534** | `modul-bestehenscheck` | education | ~105k | €0.38 | 2h |
| **535** | `worte-seiten-rechner` | education | ~165k | €0.45 | 1h |
| **536** | `schreibtempo-rechner` | education | ~125k | €0.40 | 2h |
| **537** | `abschluss-wert-rechner` | education | ~85k | €0.34 | 2h |
| **538** | `leistungsentwicklung` | education | ~85k | €0.34 | 3h |
| **539** | `vorlesungsfehlquote` | education | ~95k | €0.36 | 2h |
| **540** | `grammatik-tracker` | education | ~95k | €0.36 | 3h |
| **541** | `idiomatische-ausdruecke` | education | ~95k | €0.36 | 3h |
| **542** | `pruefungsangst-index` | education | ~125k | €0.40 | 3h |
| **543** | `mind-map-helper` | education | ~95k | €0.35 | 3h |
| **544** | `studiendauer-rechner` | education | ~95k | €0.35 | 2h |
| **545** | `stipendium-rechner` | education | ~75k | €0.32 | 2h |
| **546** | `masterprogramm-vergleich` | education | ~75k | €0.32 | 3h |
| **547** | `lerngruppen-rechner` | education | ~65k | €0.30 | 2h |
| **548** | `schriftsystem-lernplan` | education | ~65k | €0.30 | 3h |
| **549** | `phonetisches-ipa` | education | ~75k | €0.32 | 3h |
| **550** | `doktoranden-finanzierung` | education | ~55k | €0.28 | 3h |
| **551** | `buecherbudget-planer` | education | ~55k | €0.28 | 2h |
| **552** | `plagiat-checker-guide` | education | ~125k | €0.40 | 2h |
| **553** | `wissenschaft-zitation` | education | ~85k | €0.34 | 3h |
| **554** | `laborprotokoll-vorlage` | education | ~45k | €0.25 | 2h |
| **555** | `pruefungsgebueahr-rechner` | education | ~45k | €0.25 | 2h |
| **556** | `schreiben-wordcount-ziel` | education | ~95k | €0.36 | 2h |
| **557** | `perspektiven-wechsel` | education | ~65k | €0.30 | 2h |

---

## WAVE 20 — Agriculture-Suite (50 Tools, Enum `agriculture` live)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **558** | `duengerbedarf-rechner` | agriculture | ~185k | €0.45 | 3h |
| **559** | `bewaesserung-rechner` | agriculture | ~145k | €0.42 | 3h |
| **560** | `saatgut-aussaat-rechner` | agriculture | ~125k | €0.38 | 2h |
| **561** | `nmin-duengung-rechner` | agriculture | ~110k | €0.35 | 3h |
| **562** | `traktorleistung-rechner` | agriculture | ~105k | €0.34 | 2h |
| **563** | `subventions-rechner` | agriculture | ~85k | €0.30 | 3h |
| **564** | `agrar-foerderung-rechner` | agriculture | ~105k | €0.34 | 3h |
| **565** | `bodentemperatur-rechner` | agriculture | ~85k | €0.30 | 2h |
| **566** | `ph-boden-optimierung` | agriculture | ~95k | €0.32 | 2h |
| **567** | `fruchtwechsel-planer` | agriculture | ~75k | €0.28 | 3h |
| **568** | `feldflaeche-rechner` | agriculture | ~75k | €0.28 | 2h |
| **569** | `ernte-zeitpunkt-rechner` | agriculture | ~95k | €0.32 | 2h |
| **570** | `bodenfeuchte-rechner` | agriculture | ~65k | €0.24 | 2h |
| **571** | `frosttage-rechner` | agriculture | ~125k | €0.38 | 2h |
| **572** | `vegetationstage-rechner` | agriculture | ~85k | €0.30 | 2h |
| **573** | `pflanzenschutz-dosierung` | agriculture | ~95k | €0.32 | 3h |
| **574** | `fungizid-rechner` | agriculture | ~85k | €0.30 | 3h |
| **575** | `tierfutter-ration` | agriculture | ~85k | €0.30 | 3h |
| **576** | `viehtransport-rechner` | agriculture | ~105k | €0.34 | 2h |
| **577** | `insektizid-wartezeit` | agriculture | ~75k | €0.28 | 2h |
| **578** | `sort-ertragsindex` | agriculture | ~125k | €0.38 | 3h |
| **579** | `agrar-versicherung-praemie` | agriculture | ~95k | €0.32 | 3h |
| **580** | `direktzahlungen-hektar` | agriculture | ~105k | €0.34 | 3h |
| **581** | `kompost-reifezeit` | agriculture | ~65k | €0.24 | 2h |
| **582** | `saatgutbehandlung-rechner` | agriculture | ~55k | €0.20 | 2h |
| **583** | `spurenelement-rechner` | agriculture | ~45k | €0.17 | 2h |
| **584** | `kalium-phosphor-rechner` | agriculture | ~55k | €0.20 | 2h |
| **585** | `herbizid-abstandsregel` | agriculture | ~65k | €0.24 | 2h |
| **586** | `bienenfreundlich-check` | agriculture | ~45k | €0.17 | 2h |
| **587** | `pflanzendichte-rechner` | agriculture | ~65k | €0.24 | 2h |
| **588** | `schaedlingsbefall-index` | agriculture | ~75k | €0.28 | 3h |
| **589** | `krankheitsrisiko-pflanzen` | agriculture | ~75k | €0.28 | 3h |
| **590** | `bodenverdichtung-rechner` | agriculture | ~35k | €0.14 | 2h |
| **591** | `bodenverbesserung-rechner` | agriculture | ~45k | €0.17 | 2h |
| **592** | `biogasanlage-rechner` | agriculture | ~55k | €0.20 | 3h |
| **593** | `energiepflanzen-ertrag` | agriculture | ~45k | €0.17 | 3h |
| **594** | `heuqualitaet-tester` | agriculture | ~45k | €0.17 | 2h |
| **595** | `lagerverluste-rechner` | agriculture | ~45k | €0.17 | 2h |
| **596** | `marktpreis-rechner` | agriculture | ~65k | €0.24 | 2h |
| **597** | `trocknungskosten-rechner` | agriculture | ~55k | €0.20 | 2h |
| **598** | `bestaeubungs-rechner` | agriculture | ~35k | €0.14 | 2h |
| **599** | `mulch-schichtdicke` | agriculture | ~35k | €0.14 | 1h |
| **600** | `spritdruck-kalibrierung` | agriculture | ~65k | €0.24 | 2h |
| **601** | `viehgewicht-prognose` | agriculture | ~75k | €0.28 | 2h |
| **602** | `gewaechshaus-heizung` | agriculture | ~65k | €0.24 | 3h |
| **603** | `belueftung-halle-rechner` | agriculture | ~55k | €0.20 | 2h |
| **604** | `bewasserung-tröpfchen` | agriculture | ~75k | €0.28 | 3h |
| **605** | `erntemengen-rechner` | agriculture | ~75k | €0.28 | 2h |
| **606** | `hagelschaden-rechner` | agriculture | ~35k | €0.14 | 2h |
| **607** | `lagerhaltungs-rechner` | agriculture | ~45k | €0.17 | 2h |

---

## WAVE 21-22 — AV-Suite (47 Tools, Audio/Video Creator Tools)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **608** | `youtube-bitrate-rechner` | video | ~385k | €0.72 | 2h |
| **609** | `video-bitrate-speicher` | video | ~285k | €0.60 | 2h |
| **610** | `video-kompression-rechner` | video | ~225k | €0.55 | 3h |
| **611** | `streaming-bitrate-rechner` | video | ~215k | €0.53 | 2h |
| **612** | `tiktok-video-format` | video | ~225k | €0.50 | 1h |
| **613** | `fps-rechner` | video | ~195k | €0.48 | 2h |
| **614** | `aspect-ratio-rechner` | video | ~185k | €0.50 | 2h |
| **615** | `iso-belichtungs-rechner` | video | ~185k | €0.50 | 2h |
| **616** | `brennweiten-rechner` | video | ~165k | €0.48 | 2h |
| **617** | `videospeicher-rechner` | video | ~165k | €0.45 | 2h |
| **618** | `belichtungswinkel-rechner` | video | ~155k | €0.42 | 2h |
| **619** | `tiefenschaerfe-rechner` | video | ~145k | €0.45 | 3h |
| **620** | `video-frame-dauer` | video | ~195k | €0.48 | 2h |
| **621** | `twitch-bitrate-rechner` | video | ~165k | €0.48 | 2h |
| **622** | `licht-verhaeltnis-rechner` | video | ~125k | €0.40 | 2h |
| **623** | `motion-blur-rechner` | video | ~105k | €0.40 | 2h |
| **624** | `farbraum-konverter` | video | ~95k | €0.38 | 3h |
| **625** | `stream-codec-vergleich` | video | ~125k | €0.42 | 3h |
| **626** | `chroma-subsampling` | video | ~75k | €0.32 | 2h |
| **627** | `gimbal-einstellungen` | video | ~85k | €0.35 | 2h |
| **628** | `slider-geschwindigkeit` | video | ~95k | €0.38 | 2h |
| **629** | `bpm-tempo-rechner` | audio | ~320k | €0.65 | 2h |
| **630** | `dezibel-rechner` | audio | ~210k | €0.52 | 2h |
| **631** | `audio-bitrate-rechner` | audio | ~185k | €0.50 | 2h |
| **632** | `pitch-shift-cents` | audio | ~185k | €0.50 | 2h |
| **633** | `eq-frequenz-guide` | audio | ~185k | €0.50 | 3h |
| **634** | `podcast-laenge-rechner` | audio | ~210k | €0.52 | 2h |
| **635** | `frequenz-wellenlaenge-audio` | audio | ~145k | €0.45 | 2h |
| **636** | `sample-rate-rechner` | audio | ~145k | €0.45 | 2h |
| **637** | `lufs-normalisierung` | audio | ~125k | €0.42 | 3h |
| **638** | `kompressor-einstellungen` | audio | ~145k | €0.45 | 3h |
| **639** | `limiter-rechner` | audio | ~125k | €0.42 | 2h |
| **640** | `delay-sync-rechner` | audio | ~110k | €0.40 | 2h |
| **641** | `mastering-headroom` | audio | ~110k | €0.40 | 3h |
| **642** | `crossfade-zeit-rechner` | audio | ~95k | €0.38 | 2h |
| **643** | `expander-gate-rechner` | audio | ~95k | €0.38 | 2h |
| **644** | `sidechain-filter` | audio | ~85k | €0.35 | 3h |
| **645** | `mic-placement-guide` | audio | ~95k | €0.38 | 2h |
| **646** | `reverb-predelay-rechner` | audio | ~85k | €0.35 | 2h |
| **647** | `vocal-formant-rechner` | audio | ~75k | €0.32 | 3h |
| **648** | `chorus-einstellungen` | audio | ~75k | €0.32 | 2h |
| **649** | `phaser-lfo-rechner` | audio | ~55k | €0.28 | 2h |
| **650** | `flanger-rechner` | audio | ~65k | €0.30 | 2h |
| **651** | `loudness-gate-rechner` | audio | ~95k | €0.38 | 2h |
| **652** | `vu-meter-rechner` | audio | ~65k | €0.30 | 2h |
| **653** | `audio-fade-rechner` | audio | ~95k | €0.38 | 2h |
| **654** | `mixed-reference-guide` | audio | ~75k | €0.32 | 2h |

---

## WAVE 23-25 — Niche-Suite (135 Tools, diverse Enums, sortiert nach CPC × Vol)

| Prio | Slug | Enum | DE-Vol | CPC | Build |
|---|---|---|---|---|---|
| **655** | `hauswert-schaetzung` | finance | ~280k | €2.50 | 3h |
| **656** | `immobilien-rendite` | finance | ~210k | €2.60 | 3h |
| **657** | `mietpreisbremse-check` | finance | ~185k | €2.40 | 3h |
| **658** | `kaution-rueckzahlung` | finance | ~145k | €2.30 | 2h |
| **659** | `nebenkosten-verteilung` | finance | ~125k | €2.35 | 3h |
| **660** | `diabetes-blutzucker-check` | health | ~150k | €2.20 | 3h |
| **661** | `herzerkrankungs-risiko` | health | ~165k | €2.10 | 3h |
| **662** | `zahnersatz-kosten-rechner` | health | ~185k | €2.10 | 2h |
| **663** | `krebs-vorsorge-guide` | health | ~125k | €2.10 | 3h |
| **664** | `stroke-risiko-rechner` | health | ~95k | €2.05 | 3h |
| **665** | `ernaehrungsplan-generator` | health | ~210k | €2.00 | 4h |
| **666** | `burnout-risiko-test` | health | ~210k | €2.00 | 3h |
| **667** | `stress-level-rechner` | health | ~210k | €2.00 | 3h |
| **668** | `nahrungsmittel-naehrstoffe` | health | ~145k | €1.80 | 3h |
| **669** | `pollen-belastungs-check` | health | ~145k | €1.85 | 2h |
| **670** | `allergie-saison-kalender` | health | ~125k | €1.80 | 2h |
| **671** | `schilddruesentest-rechner` | health | ~125k | €1.95 | 2h |
| **672** | `blutfett-wert-checker` | health | ~95k | €1.85 | 2h |
| **673** | `gicht-risiko-test` | health | ~85k | €1.78 | 2h |
| **674** | `osteoporose-risiko` | health | ~95k | €1.80 | 2h |
| **675** | `arthrose-risiko` | health | ~85k | €1.75 | 2h |
| **676** | `hauttyp-test` | health | ~210k | €1.95 | 3h |
| **677** | `kontaktlinsen-typ-finder` | health | ~185k | €1.85 | 2h |
| **678** | `zahnwechsel-plan-kind` | health | ~125k | €1.85 | 2h |
| **679** | `sonnencreme-spf-rechner` | health | ~95k | €1.72 | 2h |
| **680** | `medikamenten-dosierung` | health | ~125k | €1.80 | 3h |
| **681** | `haarwachstum-prognose` | health | ~145k | €1.85 | 2h |
| **682** | `narben-heilung` | health | ~75k | €1.55 | 2h |
| **683** | `diabetes-risiko-rechner` | health | ~185k | €2.15 | 3h |
| **684** | `heizkosten-rechner` | finance | ~220k | €1.50 | 2h |
| **685** | `stromkosten-jahres-rechner` | finance | ~195k | €1.35 | 2h |
| **686** | `solaranlage-amortisation` | finance | ~165k | €1.45 | 3h |
| **687** | `waermedaemmung-kosten` | finance | ~145k | €1.40 | 3h |
| **688** | `gas-jahresrechnung` | finance | ~165k | €1.25 | 2h |
| **689** | `heizoel-prognose` | finance | ~125k | €1.30 | 2h |
| **690** | `umzugskosten-rechner` | finance | ~185k | €0.42 | 2h |
| **691** | `kleidergroessen-rechner` | text | ~320k | €0.52 | 2h |
| **692** | `schuhgroessen-rechner` | text | ~280k | €0.48 | 2h |
| **693** | `social-media-bildformat` | image | ~245k | €0.48 | 2h |
| **694** | `youtube-thumbnail-format` | image | ~285k | €0.52 | 1h |
| **695** | `pizza-teig-rechner` | volume | ~280k | €0.48 | 2h |
| **696** | `ringgroesse-rechner` | text | ~165k | €0.42 | 2h |
| **697** | `bh-groesse-rechner` | text | ~185k | €0.45 | 2h |
| **698** | `garzeit-rechner` | time | ~220k | €0.45 | 2h |
| **699** | `hundejahre-rechner` | time | ~210k | €0.45 | 1h |
| **700** | `brot-skalierung` | volume | ~210k | €0.42 | 2h |
| **701** | `katzenjahre-rechner` | time | ~195k | €0.42 | 1h |
| **702** | `instagram-bildformat` | image | ~210k | €0.45 | 2h |
| **703** | `fotobuch-seitenzahl` | image | ~185k | €0.42 | 2h |
| **704** | `bildaufloesung-rechner` | image | ~185k | €0.42 | 2h |
| **705** | `kaffee-ratio-rechner` | volume | ~185k | €0.40 | 1h |
| **706** | `ofentemperatur-konverter` | temperature | ~185k | €0.40 | 1h |
| **707** | `banner-groessen-rechner` | image | ~165k | €0.40 | 2h |
| **708** | `haarfarbe-mix-rechner` | color | ~165k | €0.40 | 2h |
| **709** | `e-liquid-misch-rechner` | volume | ~185k | €0.42 | 3h |
| **710** | `massstab-rechner` | distance | ~185k | €0.42 | 2h |
| **711** | `papierformat-pixel-rechner` | image | ~165k | €0.40 | 2h |
| **712** | `rezept-portionierung` | text | ~165k | €0.38 | 2h |
| **713** | `bier-brauen-rechner` | volume | ~155k | €0.42 | 3h |
| **714** | `windstaerke-beaufort` | science | ~145k | €0.38 | 2h |
| **715** | `aquarium-volumen` | volume | ~185k | €0.42 | 2h |
| **716** | `pool-chlor-rechner` | volume | ~145k | €0.38 | 2h |
| **717** | `twitch-overlay-format` | image | ~145k | €0.40 | 1h |
| **718** | `photo-belichtung-rechner` | image | ~165k | €0.40 | 3h |
| **719** | `leinwand-seitenverhaeltnis` | image | ~125k | €0.38 | 1h |
| **720** | `tattoo-groessen-rechner` | image | ~165k | €0.40 | 2h |
| **721** | `hautpflege-verbrauch` | health | ~95k | €1.70 | 2h |
| **722** | `bodenheizung-rechner` | construction | ~125k | €1.25 | 3h |
| **723** | `trockenbau-rechner` | construction | ~125k | €1.20 | 2h |
| **724** | `mauerwerk-rechner` | construction | ~125k | €1.20 | 2h |
| **725** | `fenster-groesse-rechner` | construction | ~145k | €1.25 | 2h |
| **726** | `bodenbelag-rechner` | construction | ~165k | €1.30 | 2h |
| **727** | `tuer-einbau-rechner` | construction | ~95k | €1.10 | 2h |
| **728** | `kamin-schornstein-rechner` | construction | ~95k | €1.15 | 3h |
| **729** | `dachrinne-rechner` | construction | ~85k | €1.05 | 2h |
| **730** | `dach-wasser-rechner` | construction | ~75k | €1.00 | 2h |
| **731** | `betonsockel-rechner` | construction | ~65k | €1.00 | 2h |
| **732** | `trocknungszeit-rechner` | construction | ~85k | €1.00 | 2h |
| **733** | `decken-anstrich-rechner` | construction | ~95k | €1.10 | 2h |
| **734** | `photovoltaik-anlage-rechner` | science | ~225k | €0.52 | 3h |
| **735** | `waermepumpe-rechner` | science | ~185k | €0.48 | 3h |
| **736** | `cocktail-ratio-rechner` | volume | ~125k | €0.38 | 2h |
| **737** | `parfum-dosier-rechner` | volume | ~85k | €0.32 | 2h |
| **738** | `kosmetik-mix-rechner` | volume | ~105k | €0.36 | 2h |
| **739** | `foto-bilderrahmen-rechner` | image | ~145k | €0.40 | 2h |
| **740** | `co2-kompensation-rechner` | science | ~125k | €0.38 | 2h |
| **741** | `energie-batterie-rechner` | science | ~125k | €0.35 | 2h |
| **742** | `discord-bildformat` | image | ~95k | €0.35 | 1h |
| **743** | `wohnung-qm-rechner` | area | ~185k | €0.42 | 1h |
| **744** | `twitter-bildformat` | image | ~165k | €0.40 | 1h |
| **745** | `garn-lauflaenge-rechner` | length | ~85k | €0.32 | 2h |
| **746** | `strick-nadelstaerke` | text | ~55k | €0.25 | 2h |
| **747** | `nagellack-mix-rechner` | color | ~75k | €0.30 | 2h |
| **748** | `hautton-foundation-finder` | color | ~155k | €0.40 | 3h |
| **749** | `wasserverbrauch-rechner` | volume | ~125k | €0.38 | 2h |
| **750** | `holzpellets-rechner` | volume | ~85k | €0.32 | 2h |
| **751** | `teich-pumpe-rechner` | volume | ~75k | €0.30 | 2h |
| **752** | `bier-ibu-rechner` | volume | ~155k | €0.42 | 3h |
| **753** | `whisky-verdueunnung` | volume | ~95k | €0.32 | 2h |
| **754** | `fermentation-rechner` | volume | ~55k | €0.24 | 2h |
| **755** | `zuckersaft-konzentration` | volume | ~45k | €0.20 | 2h |
| **756** | `zisterne-volumen-rechner` | volume | ~95k | €0.35 | 2h |
| **757** | `kartons-anzahl-rechner` | volume | ~125k | €0.38 | 2h |
| **758** | `hutgroesse-rechner` | text | ~75k | €0.30 | 1h |
| **759** | `modellbau-massstab` | distance | ~110k | €0.38 | 2h |
| **760** | `lager-flaeche-rechner` | area | ~75k | €0.30 | 2h |
| **761** | `gesichtsform-haarschnitt` | text | ~185k | €0.42 | 3h |
| **762** | `make-up-pinsel-guide` | text | ~125k | €0.36 | 2h |
| **763** | `co2-bilanz-flugreise` | science | ~165k | €0.42 | 3h |
| **764** | `innenraum-co2-monitor` | science | ~95k | €0.35 | 3h |
| **765** | `luftqualitaet-rechner` | science | ~125k | €0.38 | 3h |
| **766** | `drainage-rechner` | engineering | ~85k | €0.45 | 3h |
| **767** | `sanitaer-rohre-rechner` | engineering | ~95k | €0.48 | 3h |
| **768** | `abwasser-rohre-rechner` | engineering | ~85k | €0.45 | 3h |
| **769** | `grauwasser-rechner` | science | ~75k | €0.30 | 3h |
| **770** | `sickerschacht-rechner` | science | ~65k | €0.25 | 2h |
| **771** | `nagelgroesse-rechner` | engineering | ~85k | €0.45 | 2h |
| **772** | `kettensaege-kette-rechner` | engineering | ~125k | €0.55 | 2h |
| **773** | `bohrmaschinen-bit-rechner` | engineering | ~95k | €0.48 | 2h |
| **774** | `holzverbindungen-rechner` | engineering | ~75k | €0.42 | 2h |
| **775** | `schleifpapier-koernung` | engineering | ~85k | €0.45 | 2h |
| **776** | `silikon-fuge-rechner` | engineering | ~95k | €0.48 | 2h |
| **777** | `edelstahl-gewicht-rechner` | engineering | ~85k | €0.45 | 2h |
| **778** | `aluminium-profil-rechner` | engineering | ~95k | €0.48 | 2h |
| **779** | `glas-gewicht-rechner` | engineering | ~65k | €0.38 | 2h |
| **780** | `kleber-festigkeit-rechner` | engineering | ~55k | €0.35 | 2h |
| **781** | `dichtmittel-rechner` | engineering | ~75k | €0.42 | 2h |
| **782** | `messing-kupfer-rechner` | engineering | ~55k | €0.35 | 2h |
| **783** | `grundierung-schichtdicke` | engineering | ~65k | €0.40 | 2h |
| **784** | `brauwasser-rechner` | volume | ~125k | €0.38 | 2h |
| **785** | `zahnfleisch-rechner` | health | ~105k | €1.75 | 2h |
| **786** | `knochen-kalzium-rechner` | health | ~95k | €1.68 | 2h |
| **787** | `schlafqualitaet-index` | health | ~185k | €1.90 | 3h |
| **788** | `intermittierendes-fasten-2` | health | ~125k | €1.85 | 2h |
| **789** | `allergen-datenbank` | health | ~185k | €1.90 | 3h |

---

**Gesamtprioritäten: 1–789**
**Waves 0–25: vollständige Dispatch-Reihenfolge für alle ~800 Tools aus Parking Lot + Queue**
**Wave 12 (Psychologie, 79 Tools): wartet noch auf Enum-Approval für 6 neue Enums**
