---
queue_name: differenzierung
queue_version: 2
created: 2026-04-21
last_extended: 2026-04-21
maintainer: ceo-agent (auto-refill §6) + user (manual-append + rejection-review)
ordering: top-of-file = next-to-dispatch (FIFO — Tier 1 → Tier 8, innerhalb Tier FIFO)
hard_cap_in_flight: 10
hard_cap_per_heartbeat: 3
pause_threshold_critic_reject_rate_rolling_10: 0.20
enum_source: src/lib/tools/categories.ts (24 values: length, weight, area, volume, distance, temperature, image, video, audio, document, text, dev, color, time, finance, construction, math, health, science, engineering, sport, automotive, education, agriculture)
already_built_skip_list:
  - celsius-zu-fahrenheit
  - hevc-zu-h264
  - hintergrund-entfernen
  - kilogramm-zu-pfund
  - kilometer-zu-meilen
  - meter-zu-fuss
  - quadratmeter-zu-quadratfuss
  - webp-konverter
  - zentimeter-zu-zoll
  - zoll-zu-zentimeter
  - passwort-generator
  - hex-rgb-konverter
  - uuid-generator
  - json-formatter
  - zeichenzaehler
  - regex-tester
  - text-diff
  - unix-timestamp
  - base64-encoder
  - url-encoder-decoder
  - roemische-zahlen
  - zeitzonen-rechner
  - lorem-ipsum-generator
  - hash-generator
  - qr-code-generator
  - sql-formatter
  - xml-formatter
  - css-formatter
  - jwt-decoder
  - kontrast-pruefer
  - json-diff
  - json-zu-csv
  - bild-diff
  - millimeter-zu-zoll
  - yard-zu-meter
  - fuss-zu-meter
  - seemeile-zu-kilometer
  - gramm-zu-unzen
  - pfund-zu-kilogramm
  - stone-zu-kilogramm
  - tonne-zu-pfund
  - hektar-zu-acre
total_tier_1_to_8: 172
total_tier_9_psychology: 79
total_tier_10_to_19: 650 (alle 8 neuen Enums freigegeben 2026-04-23: math, health, science, engineering, sport, automotive, education, agriculture)
total_rejected: ~40 (hard-cap-blocked)
tier_9_enum_gate:
  required_new_enums:
    - persoenlichkeit
    - kognition
    - gesundheit-wellness
    - lernen
    - spass
    - sinne
  approval_ticket: docs/paperclip/CATEGORY_TTL.md §2 (pending)
  source_spec: docs/superpowers/specs/2026-04-18-psychologie-tools-katalog.md
source_analyses:
  - docs/superpowers/plans/2026-04-20-phase-1-tool-catalog.md
  - docs/superpowers/plans/2026-04-21-user-200-list-analysis.md
  - docs/superpowers/plans/2026-04-21-user-800-more-list-analysis.md
  - docs/superpowers/plans/2026-04-21-master-tool-index-1000.md
note: >-
  Queue-v2 bündelt Dispatch-ready Kandidaten aus beiden User-Listen (#1–1000)
  in 8 Tiers + 79-Tool Psychologie-Familie in Tier 9 (Enum-Ext-gated).
  Parking-Lot ist Enum-Extension-blocked (User-Approval-Ticket). Rejected-
  Section dokumentiert Hard-Cap-Ablehnungen mit Begründung — keine
  "irgendwann doch"-Debatte. Master-Tracking aller 1002 User-Tools +
  Tier-9-Roster: siehe `2026-04-21-master-tool-index-1000.md`.
---

# Differenzierungs-Queue v2 — Master-Backlog

**Purpose.** Auto-Refill-Backlog für CEO §6. Wenn active queue leer + Tripwires
green → CEO picked die nächsten N (max 3) Tickets von hier, schreibt
`tasks/current_task.md`, dispatcht Researcher + Builder + Critic.

**Format pro Zeile.** `<slug> | <category> | <de-label> | <parent_hint>`

- `parent_hint` zeigt auf Category-Root-Dossier (`dossiers/_categories/<cat>/*.md`).
- Wenn Root fehlt/stale → Researcher baut ihn zuerst (HEARTBEAT.md §3 Parent-Check).

**Dedup-Regel.** Tools, die in `src/content/tools/<slug>/de.md` bereits existieren,
werden vor Dispatch gefiltert (CEO Step 9 Backlog-Pick). Aktuelle `already_built`
siehe Frontmatter.

**Pflege-Regel (Living-Doc).**
- **Nach Build-Complete:** CEO verschiebt gebautes Tool in Frontmatter-`already_built_skip_list`, entfernt die Queue-Zeile, loggt im Auto-Refill-Log.
- **Nach Rejection (Critic zweimal rot):** CEO verschiebt Tool in Rejected-Section mit `rejected_reason`, entfernt Queue-Zeile.
- **Wenn Tier 8 leer wird:** User-Ping im Daily-Digest ("Queue-Refill nötig, bitte Enum-Approval oder neue Themen").
- **Wöchentlich (Sonntag, via CEO-Heartbeat):** Queue gegen Live-Content-Collection abgleichen — Skew zwischen `already_built_skip_list` und `src/content/tools/` ist ein Tripwire.

---

## Tier F — Finance-Suite (15 Tools, enum `finance` freigegeben 2026-04-23)

**Enum-Status:** `finance` in `src/lib/tools/categories.ts` + `werkzeuge.astro` hinzugefügt. Alle Tools sofort dispatch-ready.
**SEO-Rationale:** Finance-Keywords haben €2-5+ AdSense-CPC (höchste Klasse). `mehrwertsteuer-rechner` + `kreditrechner` zählen zu den meistgesuchten DE-Utility-Keywords (Millionen/Monat). Reihenfolge nach Suchvolumen × CPC.
**Dispatch-Prio:** VOR Tier 1-8. Enum jetzt live, hohe Revenue-Priorität gemäß `docs/superpowers/plans/2026-04-23-tool-priority-masterplan.md`.

```
mehrwertsteuer-rechner       | finance     | Mehrwertsteuer-Rechner (Brutto/Netto MwSt) | finance-root
kreditrechner                | finance     | Kredit-Monatsraten-Rechner                 | finance-root
tilgungsplan-rechner         | finance     | Tilgungsplan-Rechner (Annuitätendarlehen)  | finance-root
zinsrechner                  | finance     | Zinsrechner (einfach + Zinseszins)         | finance-root
brutto-netto-rechner         | finance     | Brutto-Netto-Gehaltsrechner                | finance-root
zinseszins-rechner           | finance     | Zinseszins-Rechner (Sparplan)              | finance-root
stundenlohn-jahresgehalt     | finance     | Stundenlohn zu Jahresgehalt Rechner        | finance-root
rabatt-rechner               | finance     | Rabatt-Rechner (Preis nach X % Rabatt)     | finance-root
roi-rechner                  | finance     | ROI-Rechner (Return on Investment)         | finance-root
skonto-rechner               | finance     | Skonto-Rechner                             | finance-root
cashflow-rechner             | finance     | Cashflow-Rechner                           | finance-root
grunderwerbsteuer-rechner    | finance     | Grunderwerbsteuer-Rechner (nach Bundesland)| finance-root
leasing-faktor-rechner       | finance     | Leasing-Faktor-Rechner                     | finance-root
erbschaftsteuer-rechner      | finance     | Erbschaftsteuer-Rechner                    | finance-root
kgv-rechner                  | finance     | KGV-Rechner (Kurs-Gewinn-Verhältnis)       | finance-root
```

**Wichtige Hinweise:**
- `mehrwertsteuer-rechner`: DE-Standard 19 %, ermäßigt 7 % (Lebensmittel etc.) — beide Richtungen (Netto→Brutto + Brutto→Netto). Keine Live-API nötig, Steuersatz hardcoded.
- `kreditrechner` + `tilgungsplan-rechner`: Annuitätendarlehen-Formel, rein rechnerisch. Kein Live-Zinssatz-Feed (NN #7). Stattdessen: User gibt Zinssatz manuell ein.
- `brutto-netto-rechner`: Vereinfacht (kein vollständiges Steuerrecht-Modul). Disclaimer: *„Näherungsrechnung — keine Steuerberatung."*
- `grunderwerbsteuer-rechner`: Bundesland-Dropdown (3,5 % bis 6,5 %), rein tabellarisch.

---

## Tier C — Construction-Suite (15 Tools, enum `construction` freigegeben 2026-04-23)

**Enum-Status:** `construction` in `src/lib/tools/categories.ts` + `werkzeuge.astro` hinzugefügt. Alle Tools sofort dispatch-ready.
**SEO-Rationale:** Deutsche DIY/Heimwerker-Kultur = sehr hohe Nachfrage für Bau-Rechner. Konkurrenz schwach — spezialisierte Sites (blitzrechner.de, heimwerker.de) sind alt und mobil-unfriendly. Unser DSGVO-Angle: kein Upload von Bauplänen/Fotos. CPC €1-2 (Baumaterial-Werbung).
**Dispatch-Prio:** NACH Finance-Suite, VOR Tier 1-8.

```
fliesen-rechner              | construction | Fliesen-Rechner (m² → Stückzahl + Verschnitt)  | construction-root
tapeten-rechner              | construction | Tapeten-Rechner (Rollen-Bedarf nach Raummaßen) | construction-root
laminat-rechner              | construction | Laminat-Rechner (m² + Verschnitt + Pakete)     | construction-root
wandfarbe-rechner            | construction | Wandfarbe-Rechner (Liter pro m² + Anstriche)   | construction-root
beton-rechner                | construction | Beton-Rechner (Volumen + Zement/Sand/Kies-Mix) | construction-root
estrich-rechner              | construction | Estrich-Rechner (kg Trockenmörtel pro m²)      | construction-root
daemmung-rechner             | construction | Dämmung-Rechner (Wärmedurchgang + U-Wert)      | construction-root
holzmengen-rechner           | construction | Holzmengen-Rechner (Bretter nach Länge/Breite) | construction-root
dach-flaeche-rechner         | construction | Dach-Fläche-Rechner (nach Dachform)            | construction-root
zaun-rechner                 | construction | Zaun-Rechner (Pfähle + Latten nach Länge)      | construction-root
putz-rechner                 | construction | Putz-Rechner (kg Putz pro m² Wandfläche)       | construction-root
moertel-rechner              | construction | Mörtel-Rechner (Mauerwerk-Bedarf)              | construction-root
heizkosten-rechner           | construction | Heizkosten-Rechner (kWh × Energiepreis)        | construction-root
treppe-rechner               | construction | Treppe-Rechner (Steigung + Auftritt nach DIN)  | construction-root
fenster-u-wert-rechner       | construction | Fenster-U-Wert-Rechner (Wärmedurchgang)        | construction-root
```

**Wichtige Hinweise:**
- Alle rein rechnerisch, keine externen APIs, keine Uploads.
- `fliesen-rechner` + `tapeten-rechner` + `laminat-rechner`: Die drei meistgesuchten Baur-Rechner DE. Zuerst dispatchcen.
- `heizkosten-rechner`: Energiepreise manuell eingeben (kein Live-Feed). Disclaimer: *„Schätzrechner, keine Beratung."*
- `treppe-rechner` + `fenster-u-wert-rechner`: Technische Nische, aber treue Zielgruppe (Handwerker + Architekten).

---

## Tier 1 — Template-Lock (9 Tool-Typen validieren)

**Ziel.** Neue Svelte-Component-Templates (Calculator, Generator, Formatter, Validator, Analyzer, Comparer) lock'en, damit Phase 1b Cluster-Scaling schnell parallelisieren kann. Quelle: `docs/superpowers/plans/2026-04-20-phase-1-tool-catalog.md` §7 + §2 Score-Framework.

```
zoll-zu-zentimeter           | length      | Zoll zu Zentimeter            | length-root
hex-rgb-konverter            | color       | Hex zu RGB Konverter          | color-root
passwort-generator           | dev         | Passwort-Generator            | dev-root
uuid-generator               | dev         | UUID-Generator                | dev-root
json-formatter               | dev         | JSON-Formatter                | dev-root
zeichenzaehler               | text        | Zeichenzähler                 | text-root
regex-tester                 | dev         | Regex-Tester                  | dev-root
text-diff                    | text        | Text-Diff Tool                | text-root
unix-timestamp               | time        | Unix-Timestamp-Konverter      | time-root
```

---

## Tier 2 — Cluster-Scaling aus Phase-1-Katalog (18 Tools)

```
base64-encoder               | dev         | Base64-Encoder/Decoder        | dev-root
url-encoder-decoder          | dev         | URL-Encoder/Decoder           | dev-root
roemische-zahlen             | text        | Römische Zahlen Konverter     | text-root
zeitzonen-rechner            | time        | Zeitzonen-Umrechner           | time-root
lorem-ipsum-generator        | text        | Lorem-Ipsum-Generator         | text-root
hash-generator               | dev         | Hash-Generator (MD5/SHA)      | dev-root
qr-code-generator            | image       | QR-Code-Generator             | image-root
sql-formatter                | dev         | SQL-Formatter                 | dev-root
xml-formatter                | dev         | XML-Formatter                 | dev-root
css-formatter                | dev         | CSS-Formatter                 | dev-root
jwt-decoder                  | dev         | JWT-Decoder                   | dev-root
kontrast-pruefer             | color       | Kontrast-Prüfer (WCAG)        | color-root
json-diff                    | dev         | JSON-Diff Tool                | dev-root
bild-diff                    | image       | Bild-Diff Tool                | image-root
pdf-zusammenfuehren          | document    | PDF-Dateien zusammenführen    | document-root
pdf-aufteilen                | document    | PDF aufteilen (Seiten-Ranges) | document-root
pdf-komprimieren             | document    | PDF komprimieren              | document-root
heic-zu-jpg                  | image       | HEIC zu JPG Konverter         | image-root
png-kompressor               | image       | PNG komprimieren (ohne Upload) | image-root
jpg-kompressor               | image       | JPEG komprimieren (ohne Upload) | image-root
bild-groesse-aendern         | image       | Bildgröße ändern (Pixel/Prozent) | image-root
svg-zu-png                   | image       | SVG zu PNG Konverter          | image-root
pdf-zu-jpg                   | document    | PDF zu JPG Konverter          | document-root
jpg-zu-pdf                   | document    | JPG zu PDF Konverter          | document-root
json-zu-csv                  | dev         | JSON zu CSV Konverter         | dev-root
```

---

## Tier 3 — Converter-Scaling (23 Varianten length/weight/area/volume/temp/time)

```
millimeter-zu-zoll           | length      | Millimeter zu Zoll            | length-root
yard-zu-meter                | length      | Yard zu Meter                 | length-root
fuss-zu-meter                | length      | Fuß zu Meter                  | length-root
seemeile-zu-kilometer        | length      | Seemeile zu Kilometer         | length-root
gramm-zu-unzen               | weight      | Gramm zu Unzen                | weight-root
pfund-zu-kilogramm           | weight      | Pfund zu Kilogramm            | weight-root
stone-zu-kilogramm           | weight      | Stone zu Kilogramm            | weight-root
tonne-zu-pfund               | weight      | Tonne zu Pfund                | weight-root
hektar-zu-acre               | area        | Hektar zu Acre                | area-root
quadratkilometer-zu-quadratmeile | area    | Quadratkilometer zu Quadratmeile | area-root
liter-zu-gallonen            | volume      | Liter zu Gallonen             | volume-root
milliliter-zu-unzen          | volume      | Milliliter zu Unzen           | volume-root
kubikmeter-zu-kubikfuss      | volume      | Kubikmeter zu Kubikfuß        | volume-root
barrel-zu-liter              | volume      | Barrel zu Liter               | volume-root
fahrenheit-zu-celsius        | temperature | Fahrenheit zu Celsius         | temperature-root
kelvin-zu-celsius            | temperature | Kelvin zu Celsius             | temperature-root
stunden-zu-minuten           | time        | Stunden zu Minuten            | time-root
tage-zu-stunden              | time        | Tage zu Stunden               | time-root
jahre-zu-tagen               | time        | Jahre zu Tagen                | time-root
monate-zu-tagen              | time        | Monate zu Tagen               | time-root
altersrechner                | time        | Altersrechner (Geburtsdatum → exaktes Alter) | time-root
arbeitstage-rechner          | time        | Arbeitstage-Rechner (Zeitraum → Werktage)    | time-root
datumsrechner                | time        | Datumsrechner (Differenz zwischen zwei Daten) | time-root
```

---

## Tier 4 — IT/Web Mass-Build (25 Tools — aus 800er Cluster 2.5)

**Quelle.** User-Liste #411–470. Alle in bestehendem Enum (`dev`/`color`/`image`/`text`). High-CPM (B2B-Dev-Klicker), Templates bereits gelockt (Generator/Formatter), ∅ 2h/Tool.

```
css-gradient-generator       | dev         | CSS-Gradient-Generator        | dev-root
css-shadow-generator         | dev         | CSS-Shadow-Generator          | dev-root
css-grid-generator           | dev         | CSS-Grid-Generator            | dev-root
css-animation-builder        | dev         | CSS-Animation-Builder         | dev-root
flexbox-playground           | dev         | Flexbox-Playground            | dev-root
box-shadow-generator         | dev         | Box-Shadow-Generator          | dev-root
text-shadow-generator        | dev         | Text-Shadow-Generator         | dev-root
meta-tag-generator           | dev         | Meta-Tag-Generator            | dev-root
opengraph-generator          | dev         | OpenGraph-Tag-Generator       | dev-root
favicon-generator            | image       | Favicon-Generator             | image-root
cron-expression-builder      | dev         | Cron-Expression-Builder       | dev-root
htaccess-generator           | dev         | .htaccess-Generator           | dev-root
robots-txt-generator         | dev         | robots.txt-Generator          | dev-root
gitignore-generator          | dev         | .gitignore-Generator          | dev-root
nginx-config-generator       | dev         | nginx-Config-Generator        | dev-root
htpasswd-generator           | dev         | htpasswd-Generator            | dev-root
yaml-zu-json                 | dev         | YAML zu JSON Konverter        | dev-root
toml-zu-json                 | dev         | TOML zu JSON Konverter        | dev-root
csv-zu-json                  | dev         | CSV zu JSON Konverter         | dev-root
mime-type-finder             | dev         | MIME-Type-Finder              | dev-root
http-status-lookup           | dev         | HTTP-Status-Code-Lookup       | dev-root
color-picker                 | color       | Color-Picker (Hex/RGB/HSL)    | color-root
sitemap-xml-generator        | dev         | Sitemap.xml-Generator         | dev-root
markdown-zu-html             | text        | Markdown zu HTML              | text-root
html-zu-markdown             | text        | HTML zu Markdown              | text-root
```

---

## Tier 5 — Marketing/SEO (10 Tools — aus 800er Cluster 2.10)

**Quelle.** User-Liste #701–750. `dev`/`text`-kompatibel. Hohe B2B-CPM.

```
utm-link-builder             | dev         | UTM-Link-Builder              | dev-root
engagement-rate-rechner      | text        | Engagement-Rate-Rechner       | text-root
cpc-cpm-cpa-rechner          | text        | CPC/CPM/CPA-Rechner           | text-root
ab-test-signifikanz          | text        | A/B-Test-Signifikanz-Rechner  | text-root
roas-rechner                 | text        | ROAS-Rechner                  | text-root
conversion-rate-rechner      | text        | Conversion-Rate-Rechner       | text-root
affiliate-provisions-rechner | text        | Affiliate-Provisions-Rechner  | text-root
flesch-lesbarkeits-index     | text        | Flesch-Lesbarkeits-Index      | text-root
seo-title-length-checker     | text        | SEO-Title-Length-Checker      | text-root
meta-description-checker     | text        | Meta-Description-Checker      | text-root
```

---

## Tier 6 — Text-Kryptographie & Kultur (10 Tools — aus 800er Cluster 2.9)

**Quelle.** User-Liste #641–700. `text`/`time`-kompatibel. Klassische DE-SEO-Keywords („Morsecode Übersetzer" etc.). Pseudo-Wissenschaft explizit ausgenommen (→ Rejected §R2).

```
morsecode-uebersetzer        | text        | Morsecode-Übersetzer          | text-root
caesar-verschluesselung      | text        | Caesar-Verschlüsselung        | text-root
rot13-rot47                  | text        | ROT13/ROT47-Konverter         | text-root
vigenere-chiffre             | text        | Vigenère-Chiffre              | text-root
atbash-chiffre               | text        | Atbash-Chiffre                | text-root
nato-phonetisches-alphabet   | text        | NATO-Phonetisches Alphabet    | text-root
braille-konverter            | text        | Braille-Konverter             | text-root
binaer-text-konverter        | text        | Binär-Text-Konverter          | text-root
kalender-gregorianisch-julianisch | time   | Gregorianisch ↔ Julianisch   | time-root
sternzeichen-lookup          | time        | Sternzeichen-Finder (Datum)   | time-root
```

---

## Tier 7 — Math-Basis als text/dev (5 Tools — aus 800er Cluster 2.1)

**Quelle.** User-Liste #201–250. Ohne `math`-Enum-Ext baubar (notdürftig in `text`/`dev` einklassifiziert — semantisch okay bei Zahlsystemen, Grenzfall bei Statistik-Tools). Nach `math`-Enum-Approval (D6) umziehen.

```
zahlsysteme-konverter        | dev         | Binär/Dezimal/Hex/Oktal-Konverter | dev-root
prozent-differenz-rechner    | text        | Prozent-Differenz-Rechner     | text-root
mittelwert-median-rechner    | text        | Mittelwert/Median-Rechner     | text-root
bruch-dezimal-konverter      | text        | Bruch ↔ Dezimal-Konverter     | text-root
fakultaet-rechner            | text        | Fakultät-Rechner              | text-root
```

---

## Tier 8 — Zusatz-Converter aus beiden Listen (25 Tools)

**Quelle.** Mixed aus 200er + 800er. Alle enum-kompatibel, Resttools nach Dedup gegen Tier 1–7.

### 8a — Audio/Video/Image-Erweiterung (aus 800er Cluster 2.15)
```
bpm-rechner                  | audio       | BPM/Tempo-Rechner             | audio-root
video-bitrate-rechner        | video       | Video-Bitrate-Kalkulator      | video-root
speicherkarten-kapazitaet    | video       | Speicherkarten-Kapazität (4K/8K) | video-root
crop-faktor-rechner          | image       | Crop-Faktor-Rechner (Kamera-Sensor) | image-root
lufs-messer                  | audio       | LUFS-Messer (WebAudio)        | audio-root
delay-reverb-sync            | audio       | Delay/Reverb-Sync zu BPM      | audio-root
```

### 8b — Length/Distance-Erweiterung
```
mikrometer-zu-zoll           | length      | Mikrometer zu Zoll            | length-root
nanometer-zu-angstroem       | length      | Nanometer zu Ångström         | length-root
lichtjahr-zu-kilometer       | distance    | Lichtjahr zu Kilometer        | distance-root
parsec-zu-lichtjahr          | distance    | Parsec zu Lichtjahr           | distance-root
astronomische-einheit        | distance    | AU zu Kilometer               | distance-root
```

### 8c — Weight/Volume-Erweiterung
```
karat-zu-gramm               | weight      | Karat zu Gramm                | weight-root
troy-unze-zu-gramm           | weight      | Troy-Unze zu Gramm            | weight-root
teaspoon-esloeffel           | volume      | Teelöffel/Esslöffel Konverter | volume-root
cup-zu-milliliter            | volume      | Cup zu Milliliter (US/UK)     | volume-root
fluid-ounce-zu-milliliter    | volume      | Fluid Ounce zu Milliliter     | volume-root
```

### 8d — Temperature/Time-Erweiterung
```
celsius-zu-kelvin            | temperature | Celsius zu Kelvin             | temperature-root
rankine-zu-kelvin            | temperature | Rankine zu Kelvin             | temperature-root
reaumur-zu-celsius           | temperature | Réaumur zu Celsius            | temperature-root
minuten-zu-sekunden          | time        | Minuten zu Sekunden           | time-root
wochen-zu-tagen              | time        | Wochen zu Tagen               | time-root
millisekunden-zu-sekunden    | time        | Millisekunden zu Sekunden     | time-root
```

### 8e — Document/Text-Erweiterung
```
pdf-zu-text                  | document    | PDF zu Text (pure-client)     | document-root
pdf-seiten-zaehler           | document    | PDF-Seiten-Zähler             | document-root
pdf-seiten-loeschen          | document    | PDF-Seiten löschen            | document-root
pdf-seiten-neu-anordnen      | document    | PDF-Seiten neu anordnen       | document-root
pdf-drehen                   | document    | PDF-Seiten drehen             | document-root
pdf-wasserzeichen            | document    | PDF Wasserzeichen hinzufügen  | document-root
pdf-seitenzahlen             | document    | PDF Seitenzahlen hinzufügen   | document-root
pdf-passwort                 | document    | PDF Passwort (Verschlüsselung) | document-root
pdf-zu-png                   | document    | PDF zu PNG (Seiten-Vorschau)  | document-root
woerterzaehler               | text        | Wörterzähler                  | text-root
```

### 8f — ML-File-Tools Video (§7a-Ausnahme, architektur-gelockt 2026-04-22)

**Sonderstatus.** Diese Tools fallen unter Non-Negotiable §7a (ML-File-Tools mit Worker-Fallback). Dispatch erfordert Spec mit §2.4 Differenzierungs-Check + §7a-6-Bedingungen-Checkliste. Research-Quellen:
- `docs/superpowers/plans/2026-04-21-video-bg-remover-differenzierungs-check.md` (Markt-Research)
- `docs/superpowers/plans/2026-04-22-video-matting-model-license-research.md` (Lizenz-Research — lückenlos MIT bestätigt)

**Architektur-Stack (gelockt via Double-Research 2026-04-21/22).**
- **Encoding/Decoding:** **Mediabunny** (MPL-2.0, TypeScript, WebCodecs-basiert, ~5 kB, streaming-fähig, Dateigröße unlimitiert durch Frame-by-Frame-Pipeline).
- **ML-Inferenz:** **onnxruntime-web 1.23+** (WebGPU-Backend, CPU-Fallback, MIT).
- **Default-Modell:** **BiRefNet_lite** (onnx-community/BiRefNet_lite-ONNX, ~50 MB, MIT Code + MIT Weights + MIT Training-Data DIS5K). State-of-the-art Haar/Fell-Matting (ACCV 2024). Image-Modell → Frame-Loop mit optionalem Edge-Smoothing-Post-Filter gegen Flicker. §7a(b) „<50 MB ODER lazy-load mit Progress" deckt's ab.
- **Fallback-Modell:** **BEN2 Base** (PramaLLC/BEN2, MIT/MIT, native `segment_video()`-API, Confidence-Guided-Matting-Refiner gegen Kanten-Schwächen). Plan B falls BiRefNet-Flicker User-Feedback triggert.
- **Speed-Toggle-Modell:** **MODNet** (Xenova/modnet, Apache-2.0/Apache-2.0, ~25 MB, bewiesene real-time WebGPU-Performance) für schwache Geräte / lange Videos / Echtzeit-Preview.
- **Alpha-Export:** **WebM+VP9+Alpha** (Chrome/Firefox) + **MP4+Greenscreen-Fallback** (Safari/iOS).
- **Selbst-gehostet** via `/public/models/*.onnx` + R2-CDN, kein Runtime-Network (nach First-Load offline).
- Kein Upload-zu-Server, kein Telemetrie-Ping, keine externen APIs.

**Ausgeschlossen (Lizenz-KO, dokumentiert im Research-Report):** RVM (GPL-3.0), MatAnyone 2 (NTU S-Lab NC), Sapiens (CC-BY-NC), RMBG-2.0/1.4 (CC-BY-NC), @imgly/background-removal (AGPL viral), SAM 3 (Custom License mit Redistributions-Pflicht).

**EU-AI-Act-Anforderung (ab 02.08.2026).** „Background replaced" ist Grenzfall zu „deepfake" → UI-Disclaimer + optionales Metadata-Label im Output-File. Spec muss das in §8 Datenschutz/Recht aufnehmen.

**EU-AI-Act-Anforderung (ab 02.08.2026).** „Background replaced" ist Grenzfall zu „deepfake" → UI-Disclaimer + optionales Metadata-Label im Output-File. Spec muss das in §8 Datenschutz/Recht aufnehmen.

```
video-hintergrund-entfernen  | video       | Video-Hintergrund entfernen (KI, 4K) | video-root
webcam-hintergrund-unschaerfe | video      | Webcam-Hintergrund-Unschärfe (Live)   | video-root
```

**Webcam-Tool-Abweichung.** `webcam-hintergrund-unschaerfe` nutzt **MediaPipe Selfie Segmentation** (~0.5 MB, TFLite-WASM, Apache-2.0) — reines Live-Preview, kein Export, kein File-Upload. Getrenntes Tool, weil Use-Case (Zoom-Call-Blur) fundamental vom File-Upload-Use-Case (Content-Creator-Export) abweicht. **Lizenz unproblematisch** → dispatch-ready sobald Spec mit §2.4 vorliegt.

### 8g — ML-File-Tools Audio/Speech (§7a-Ausnahme, architektur-gelockt 2026-04-22)

**Sonderstatus.** Diese Tools fallen unter Non-Negotiable §7a (ML-File-Tools mit Worker-Fallback). Dispatch erfordert Spec mit §2.4 Differenzierungs-Check + §7a-6-Bedingungen-Checkliste. Research-Quelle: `docs/superpowers/plans/2026-04-22-audio-enhancement-research.md`.

**Architektur-Stack (gelockt via Deep-Research 2026-04-22).**
- **Audio-/Video-Dekodierung:** **ffmpeg.wasm single-threaded** (`@ffmpeg/core`, NICHT `-mt`) für MP4/MOV/MP3/WAV/M4A/OGG/WebM Input — kein COOP/COEP → AdSense-kompatibel.
- **ML-Inferenz:** **onnxruntime-web 1.23+** (`numThreads: 1`, WebGPU-EP primary, WASM-EP Fallback, MIT).
- **Default-Modell:** **DeepFilterNet3** (~10 MB ONNX, **MIT OR Apache-2.0 Dual-License Code+Weights**, 2.3M Params, full-band 48 kHz, deterministischer Time-Frequency-Mask-Filter, kein Vocoder → EU-AI-Act-sauber). Offizieller ONNX-Export vorhanden, Browser-Demos existieren.
- **Fallback-Modell:** **DeepFilterNet2** (gleiche Lizenz, HF Space live, falls v3 Browser-Kompat-Probleme hat).
- **Speed-Toggle-Modell:** **GTCRN** (~200 KB ONNX, MIT, 16 kHz, in sherpa-onnx integriert) für Low-End-Geräte / Mobile.
- **Strength-Slider:** DeepFilterNet3 hat nativen `atten_lim_db`-Parameter → 1:1 auf UI-Slider 0-100% mapbar. Löst den Adobe-V2-Robotik-Pain direkt.
- **Audio-Pipeline:** Web Audio API → Resample 48 kHz → Chunk-Processing ~10s-Blöcke im Worker → DeepFilterNet3 → Concat → WAV-Export via `wavefile` (V1 nur WAV, MP3 erst V1.1).
- **A/B-Playback:** zwei sync-scrubbte `<audio>`-Elemente (Original vs. Enhanced) — Vertrauens-Feature, kein Konkurrent hat das.
- **Selbst-gehostet** via `/public/models/deepfilternet3.onnx` + R2-CDN, kein Runtime-Network.
- Kein Upload-zu-Server, kein Telemetrie-Ping, keine externen APIs.

**Ausgeschlossen (Lizenz-KO + Browser-Inkompatibilität, dokumentiert im Research-Report):** Facebook Denoiser (CC-BY-NC), Resemble Enhance (Weights-Lizenz unklar + kein ONNX + Vocoder = EU-AI-Act-Grenzfall), VoiceFixer (kein ONNX, >100 MB), Miipher/Miipher-2 (Google proprietär), NVIDIA Maxine/Krisp (proprietär), Adobe Podcast (Closed-SaaS).

**EU-AI-Act-Anforderung (Art. 50, wirksam 02.08.2025).** SE-Tools mit deterministischem Filter-Ansatz (DeepFilterNet3) generieren **keine** synthetische Sprache → **nicht von Art. 50 betroffen**. Footer/FAQ-Disclaimer trotzdem: *„Tool verbessert Audio durch Rausch-Entfernung; es generiert keine synthetische Sprache."*

**Performance-Erwartung.** 10 Min Audio ≈ 20-30 Min Processing auf Desktop-CPU (WASM-EP), 2-5× schneller mit WebGPU-EP. → Progress-Bar + „Tab nicht schließen"-Hinweis Pflicht.

```
sprache-verbessern           | audio       | Sprache verbessern (Audio/Video, KI)   | audio-root
```

**SEO-Rationale Slug.** Deutscher Markt, hoher Such-Volumen: `sprache verbessern`, `audio ton verbessern`, `podcast ton verbessern`, `adobe podcast alternative kostenlos`. FAQ-Content adressiert alle Varianten. Video-Input wird im Tool unterstützt (ffmpeg.wasm extrahiert Audio-Spur), aber Slug bleibt bei Audio-Primär-Positionierung — Video-Use-Case ist im Body + FAQ behandelt.

---

## Tier 9 — Psychologie/Kognition/Wellness-Familie (79 Tools)

**Quelle:** `docs/superpowers/specs/2026-04-18-psychologie-tools-katalog.md`.
**Enum-Gate.** Alle Tier-9-Tools erfordern 6 neue Enum-Werte: `persoenlichkeit`, `kognition`, `gesundheit-wellness`, `lernen`, `spass`, `sinne`. CEO darf Tier 9 **erst nach** User-Approval-Ticket (`docs/paperclip/CATEGORY_TTL.md` §2) dispatchen — parallel zu Tier 1-8 ist die Enum-Ext-Diskussion zu eröffnen.
**Pflicht-Schutz für alle:** DisclaimerBanner ("Kein Ersatz für professionelle Diagnostik"), Krisen-Hilfslinks bei 3.1-Tools (Telefonseelsorge, GAD-7/PHQ-9/Burnout).
**Shared-Components:** `LikertScale.svelte`, `RadarChart.svelte`, `ProgressBar.svelte`, `ShareCard.svelte`, `TimedChallenge.svelte`, `GridGame.svelte`, `ScoreCompare.svelte`, `DisclaimerBanner.svelte` — vor 9a-Dispatch lock'en.

### 9a — Power-10 (Launch-Priorität, viral + low-effort)
```
big-five-persoenlichkeitstest | persoenlichkeit | Big Five Persönlichkeitstest   | persoenlichkeit-root
reaktionszeit-test            | kognition       | Reaktionszeit-Test             | kognition-root
tipp-geschwindigkeitstest     | kognition       | Tipp-Geschwindigkeitstest      | kognition-root
zahlengedaechtnis-test        | kognition       | Zahlengedächtnis-Test          | kognition-root
persoenlichkeits-farbtest     | spass           | Persönlichkeits-Farbtest       | spass-root
liebessprachen-test           | persoenlichkeit | Liebessprachen-Test            | persoenlichkeit-root
bindungsstil-test             | persoenlichkeit | Bindungsstil-Test              | persoenlichkeit-root
optimale-schlafzeit-rechner   | gesundheit-wellness | Optimale Schlafzeit         | gesundheit-wellness-root
chronotyp-test                | gesundheit-wellness | Chronotyp (Lerche/Eule)     | gesundheit-wellness-root
lesegeschwindigkeits-test     | kognition       | Lesegeschwindigkeits-Test      | kognition-root
```

### 9b — Persönlichkeit & Psychologie (weitere 14 Tools)
```
enneagramm-test               | persoenlichkeit | Enneagramm-Test                | persoenlichkeit-root
emotionale-intelligenz-test   | persoenlichkeit | EQ-Test (Emotionale Intelligenz) | persoenlichkeit-root
introversion-extraversion     | persoenlichkeit | Introversion-Extraversion-Spektrum | persoenlichkeit-root
empathie-quotient-test        | persoenlichkeit | Empathie-Quotient-Test         | persoenlichkeit-root
resilienz-test                | persoenlichkeit | Resilienz-Test                 | persoenlichkeit-root
werte-kompass                 | persoenlichkeit | Werte-Kompass (Schwartz)       | persoenlichkeit-root
selbstwertgefuehl-skala       | persoenlichkeit | Selbstwertgefühl-Skala (Rosenberg) | persoenlichkeit-root
optimismus-pessimismus-test   | persoenlichkeit | Optimismus-Pessimismus-Test    | persoenlichkeit-root
dark-triad-test               | persoenlichkeit | Dark Triad Test (SD3)          | persoenlichkeit-root
kommunikationsstil-test       | persoenlichkeit | Kommunikationsstil-Test        | persoenlichkeit-root
humor-stil-test               | persoenlichkeit | Humor-Stil-Test (HSQ)          | persoenlichkeit-root
konfliktloesungs-stil-test    | persoenlichkeit | Konfliktlösungs-Stil-Test      | persoenlichkeit-root
liebessprachen-paar-vergleich | persoenlichkeit | Liebessprachen-Paar-Modus      | persoenlichkeit-root
freundschafts-kompatibilitaet | persoenlichkeit | Freundschafts-Kompatibilitätstest | persoenlichkeit-root
soziale-batterie-rechner      | persoenlichkeit | Soziale-Batterie-Rechner       | persoenlichkeit-root
```

### 9c — Kognition & Gehirn-Benchmarks (weitere 13 Tools, Humanbenchmark-Stil)
```
aim-trainer                   | kognition       | Aim-Trainer                    | kognition-root
stroop-test                   | kognition       | Farbwechsel-Reaktion (Stroop)  | kognition-root
visuelles-gedaechtnis-test    | kognition       | Visuelles Gedächtnis (Kachel)  | kognition-root
sequenz-gedaechtnis           | kognition       | Sequenz-Gedächtnis (Simon)     | kognition-root
wort-gedaechtnis-test         | kognition       | Wort-Gedächtnis-Test           | kognition-root
gesichter-gedaechtnis         | kognition       | Gesichter-Gedächtnis-Test      | kognition-root
farb-iq-test                  | kognition       | Farb-IQ (Farnsworth-Munsell)   | kognition-root
farbblindheits-test           | kognition       | Farbblindheits-Test (Ishihara) | kognition-root
periphere-sicht-test          | kognition       | Periphere-Sicht-Test           | kognition-root
change-blindness-test         | kognition       | Veränderungsblindheit-Test     | kognition-root
multitasking-test             | kognition       | Multitasking-Test              | kognition-root
konzentrationstest-d2         | kognition       | Konzentrationstest (d2-Stil)   | kognition-root
muster-erkennungs-test        | kognition       | Muster-Erkennungs-Test         | kognition-root
```

### 9d — Logik & Problemlösung + Mathematik-Training (7 Tools)
```
raeumliches-vorstellungsvermoegen | kognition   | Räumliches Vorstellungsvermögen | kognition-root
logik-raetsel-generator       | kognition       | Logik-Rätsel-Generator (Einstein) | kognition-root
zahlenfolgen-erkenner         | kognition       | Zahlenfolgen-Erkenner          | kognition-root
kopfrechen-challenge          | kognition       | Kopfrechen-Challenge           | kognition-root
schaetz-quiz                  | kognition       | Schätz-Quiz                    | kognition-root
prozent-im-kopf-trainer       | kognition       | Prozent-im-Kopf-Trainer        | kognition-root
visueller-vergleich-test      | kognition       | Visueller Vergleich (ANS)      | kognition-root
```

### 9e — Gesundheit & Wellness (14 Tools, Screener — YMYL-Disclaimer Pflicht)
```
stress-level-test             | gesundheit-wellness | Stress-Level-Test (PSS-10)   | gesundheit-wellness-root
burnout-risiko-check          | gesundheit-wellness | Burnout-Risiko-Check (MBI)   | gesundheit-wellness-root
angst-selbsttest              | gesundheit-wellness | Angst-Selbsttest (GAD-7)     | gesundheit-wellness-root
depressions-selbsttest        | gesundheit-wellness | Depressions-Selbsttest (PHQ-9) | gesundheit-wellness-root
achtsamkeits-score            | gesundheit-wellness | Achtsamkeits-Score (MAAS)    | gesundheit-wellness-root
work-life-balance-rechner     | gesundheit-wellness | Work-Life-Balance-Rechner    | gesundheit-wellness-root
schlafqualitaets-rechner      | gesundheit-wellness | Schlafqualität (PSQI)        | gesundheit-wellness-root
koffein-halbwertszeit-rechner | gesundheit-wellness | Koffein-Halbwertszeit         | gesundheit-wellness-root
jetlag-rechner                | gesundheit-wellness | Jetlag-Rechner                | gesundheit-wellness-root
biologisches-alter-rechner    | gesundheit-wellness | Biologisches Alter            | gesundheit-wellness-root
kalorienverbrauch-rechner     | gesundheit-wellness | Kalorienverbrauch (MET)       | gesundheit-wellness-root
trinkerinnerungs-rechner      | gesundheit-wellness | Trinkerinnerung               | gesundheit-wellness-root
herzfrequenzzonen-rechner     | gesundheit-wellness | Herzfrequenz-Zonen (Karvonen) | gesundheit-wellness-root
```

### 9f — Lernen & Karriere (11 Tools)
```
lerntyp-test-vak              | lernen          | Lerntyp-Test (VAK)             | lernen-root
links-rechts-gehirn-test      | lernen          | Linke/Rechte-Gehirnhälfte      | lernen-root
multiple-intelligenzen-test   | lernen          | Multiple Intelligenzen (Gardner) | lernen-root
wortschatz-niveau-test        | lernen          | Wortschatz-Niveau (B1/B2/C1)   | lernen-root
staerken-finder-lite          | lernen          | Stärken-Finder (VIA-Lite)      | lernen-root
riasec-test                   | lernen          | Karriere-Interesse (RIASEC)    | lernen-root
fuehrungsstil-test            | lernen          | Führungsstil-Test              | lernen-root
prokrastinations-profil       | lernen          | Prokrastinations-Profil        | lernen-root
gehalts-vergleichs-rechner    | lernen          | Gehalts-Vergleich (Destatis)   | lernen-root
meeting-kosten-rechner        | lernen          | Meeting-Kosten-Rechner         | lernen-root
```

### 9g — Spaß/Viral + Sinne/Wahrnehmung (11 Tools)
```
welches-tier-bist-du          | spass           | Welches Tier bist du?          | spass-root
historische-epoche-test       | spass           | Welche Epoche passt zu dir?    | spass-root
kreativitaets-profil          | spass           | Kreativitäts-Profil            | spass-root
welcher-superheld-test        | spass           | Welcher Superheld wärst du?    | spass-root
mental-age-test               | spass           | Mental Age Test                | spass-root
selbstwahrnehmungs-test       | spass           | Wie gut kennst du dich?        | spass-root
hoeralter-test                | sinne           | Höralter-Test (8kHz-20kHz)     | sinne-root
tonhoehen-unterscheidung      | sinne           | Tonhöhen-Unterscheidung        | sinne-root
farbdifferenz-finder          | sinne           | Farbdifferenz-Finder           | sinne-root
zeitgefuehl-test              | sinne           | Zeitgefühl-Test                | sinne-root
geschwindigkeits-schaetztest  | sinne           | Geschwindigkeits-Schätztest    | sinne-root
```

---

## Tier 10 — Health-Suite (71 Tools, enum `health` live 2026-04-23)

**Enum-Status:** `health` in `categories.ts` freigegeben. Alle Tools sofort dispatch-ready.
**SEO-Rationale:** €1.80-2.50 CPC (zweithöchste Klasse). Konkurrenz: Krankenkassen-Sites (alt, kein Tool-Fokus). Privacy-USP: kein Account, kein Upload.
**Policy:** Nur Screening-Charakter. Disclaimer sichtbar oberhalb Ergebnis-Panel (CONTENT.md §14).
**Dispatch-Prio:** Masterplan Wave 13, Prios 140-210.

```
kalorienbedarf-rechner       | health | Kalorienbedarf-Rechner (Harris-Benedict)        | health-root
grundumsatz-rechner          | health | Grundumsatz-Rechner (Mifflin-St-Jeor)          | health-root
tdee-rechner                 | health | TDEE-Rechner (Gesamtkalorienbedarf)             | health-root
schwangerschaftswoche-rechner| health | Schwangerschaftswoche-Rechner                   | health-root
zyklus-kalender              | health | Zyklus-Kalender (Menstruationskalender)         | health-root
blutdruck-kategorisierung    | health | Blutdruck-Kategorisierung (WHO-Stufen)          | health-root
kalorienverbrauch-workout    | health | Kalorienverbrauch beim Sport (MET)              | health-root
protein-bedarf-rechner       | health | Protein-Bedarf-Rechner (g/kg Körpergewicht)     | health-root
vitamin-d-mangel-test        | health | Vitamin-D-Mangel-Test (Risiko-Screening)        | health-root
ernaehrungsplan-rechner      | health | Ernährungsplan-Rechner (Makros + Kalorien)      | health-root
wasserbedarf-rechner         | health | Wasserbedarf-Rechner (Körpergewicht + Aktivität) | health-root
impf-intervall-rechner       | health | Impf-Intervall-Rechner (STIKO-Abstände)         | health-root
ideal-gewicht-rechner        | health | Ideal-Gewicht-Rechner (Broca/BMI)               | health-root
puls-zonen-rechner           | health | Puls-Zonen-Rechner (Karvonen-Formel)            | health-root
schlafzyklus-rechner         | health | Schlafzyklus-Rechner (90-min-Phasen)            | health-root
makronaehrstoff-rechner      | health | Makronährstoff-Rechner (Protein/Fett/Carbs)     | health-root
koerperfett-navy-rechner     | health | Körperfett-Rechner (US-Navy-Formel)             | health-root
cholesterin-ratio-rechner    | health | Cholesterin-Ratio-Rechner (LDL/HDL)             | health-root
muskelaufbau-kalorien        | health | Muskelaufbau-Kalorien-Rechner (Bulk-Surplus)    | health-root
fettabbau-rate-rechner       | health | Fettabbau-Rate-Rechner (wöchentlich)            | health-root
lean-body-mass-rechner       | health | Lean-Body-Mass-Rechner (fettfreie Masse)        | health-root
body-surface-area-rechner    | health | Körperoberflächen-Rechner (DuBois-Formel)       | health-root
herzratenvariabilitaet       | health | Herzratenvariabilität-Rechner (HRV)             | health-root
vo2max-rechner               | health | VO2max-Rechner (Cooper-Test-Schätzer)           | health-root
basaltemperatur-tracker      | health | Basaltemperatur-Tracker (NFP-Methode)           | health-root
taille-huefte-verhaeltnis    | health | Taille-Hüfte-Verhältnis-Rechner                 | health-root
calcium-bedarf-rechner       | health | Calcium-Bedarf-Rechner (Alter + Geschlecht)     | health-root
magnesium-bedarf-rechner     | health | Magnesium-Bedarf-Rechner                        | health-root
eisen-bedarf-rechner         | health | Eisen-Bedarf-Rechner (Alter + Geschlecht)       | health-root
ernaehrungsbedarfs-rechner   | health | Ernährungsbedarfs-Rechner (Vollständig)         | health-root
hydration-sport-rechner      | health | Hydration-Sport-Rechner (Schweißverlust)        | health-root
recovery-time-rechner        | health | Erholungszeit-Rechner nach Training             | health-root
menopause-symptom-tracker    | health | Menopause-Symptom-Tracker                       | health-root
wundheilung-dauer-rechner    | health | Wundheilung-Dauer-Rechner (Wundtyp)             | health-root
zahnersatz-kosten-rechner    | health | Zahnersatz-Kosten-Rechner (Kassenleistung)      | health-root
karies-risikotest            | health | Karies-Risiko-Test (Selbsteinschätzung)         | health-root
sehschaerfe-berechnung       | health | Sehschärfe-Berechnung (Dezimal ↔ dpt)           | health-root
brille-dioptrienrechner      | health | Brillen-Dioptrien-Rechner                       | health-root
kontaktlinsen-dioptrien      | health | Kontaktlinsen-Dioptrien-Rechner                 | health-root
ansteckungsrisiko-rechner    | health | Ansteckungsrisiko-Rechner (R₀-Modell)           | health-root
erholungszeit-rechner        | health | Erholungszeit-Rechner (Krankheit)               | health-root
hauttyp-klassifizierung      | health | Hauttyp-Klassifizierung (Fitzpatrick-Skala)     | health-root
nahrungsmittelunvertraeglichkeit | health | Nahrungsmittelunverträglichkeit-Checker      | health-root
allergen-tracker             | health | Allergen-Tracker (Top-14 EU-Allergene)          | health-root
medikamenten-interaktion     | health | Medikamenten-Interaktion-Checker (Basis)        | health-root
supplement-timing            | health | Supplement-Timing-Guide (Einnahme-Zeitfenster)  | health-root
low-carb-kalkulator          | health | Low-Carb-Kalkulator (Kohlenhydrate/Tag)         | health-root
keto-makro-rechner           | health | Keto-Makro-Rechner (Fett/Protein/Carbs)         | health-root
hormonzyklus-rechner         | health | Hormonzyklus-Rechner (Östrogen/Progesteron)     | health-root
bmi-kinder-rechner           | health | BMI-Kinder-Rechner (Alters-Perzentilen)         | health-root
knochendichte-risikotest     | health | Knochendichte-Risiko-Test (Osteoporose)         | health-root
intermittierendes-fasten-timer | health | Intermittierendes-Fasten-Timer (16:8/5:2)     | health-root
fiber-tagesbedarf            | health | Ballaststoff-Tagesbedarf-Rechner                | health-root
elektrolyt-balance           | health | Elektrolyt-Balance-Rechner (Na/K/Mg)            | health-root
trinkmenge-persoenlich        | health | Trinkmenge-Persönlich-Rechner                  | health-root
zahnreinigung-intervall      | health | Zahnreinigung-Intervall-Rechner                 | health-root
haarwachstum-rechner         | health | Haarwachstum-Rechner (cm/Monat)                 | health-root
schrittlaenge-rechner        | health | Schrittlänge-Rechner (Körpergröße)              | health-root
quarantaene-dauer-rechner    | health | Quarantäne-Dauer-Rechner (Inkubationszeit)      | health-root
augendruck-normwert          | health | Augendruck-Normwert-Checker (IOD)               | health-root
immunsystem-staerkungsguide  | health | Immunsystem-Stärkungs-Guide (Nährstoff-Check)   | health-root
blutgruppen-vertraeglichkeit | health | Blutgruppen-Verträglichkeit (Transfusion)       | health-root
blutzucker-hba1c-rechner     | health | Blutzucker-HbA1c-Rechner (mmol/mol ↔ %)        | health-root
diabetes-risiko-rechner      | health | Diabetes-Risiko-Rechner (Typ-2-Screening)       | health-root
herzerkrankungs-risiko       | health | Herzerkrankungs-Risiko-Rechner (Framingham)     | health-root
stroke-risiko-rechner        | health | Schlaganfall-Risiko-Rechner (CHA₂DS₂-VASc)     | health-root
burnout-risiko-test          | health | Burnout-Risiko-Test (MBI-Screening)             | health-root
stress-level-rechner         | health | Stress-Level-Rechner (PSS-10)                   | health-root
schlafqualitaet-index        | health | Schlafqualität-Index (PSQI-Screening)           | health-root
nierenfunktion-gfr-rechner   | health | Nierenfunktion-GFR-Rechner (CKD-EPI)            | health-root
schilddruesentest-rechner    | health | Schilddrüsentest-Rechner (TSH-Einordnung)       | health-root
```

---

## Tier 11 — Math-Suite (76 Tools, enum `math` live 2026-04-23)

**Enum-Status:** `math` in `categories.ts` freigegeben. Alle Tools sofort dispatch-ready.
**SEO-Rationale:** ~1-5M DE-Suchen/Monat (Schüler, Studenten, Business). Konkurrenz: mathe.de, mathebibel.de — alt, keine interaktiven Rechner.
**Dispatch-Prio:** Masterplan Wave 14, Prios 211-286.

```
prozentrechner               | math | Prozentrechner (DE-Platz 1)                      | math-root
dreisatzrechner              | math | Dreisatz-Rechner (direkt/indirekt)               | math-root
kreisflaeche-umfang-rechner  | math | Kreisfläche + Umfang Rechner                     | math-root
mittelwert-median-rechner    | math | Mittelwert/Median/Modus-Rechner                  | math-root
potenzen-rechner             | math | Potenzen-Rechner (aⁿ)                            | math-root
quadratische-gleichung-rechner | math | Quadratische Gleichung Rechner (abc-Formel)    | math-root
wahrscheinlichkeits-rechner  | math | Wahrscheinlichkeits-Rechner                      | math-root
primzahl-checker             | math | Primzahl-Checker (Sieb des Eratosthenes)         | math-root
pythagoras-rechner           | math | Pythagoras-Rechner (a²+b²=c²)                   | math-root
dreieck-flaeche-rechner      | math | Dreieck-Fläche-Rechner (Heron/Grundformel)       | math-root
fibonacci-rechner            | math | Fibonacci-Folge-Rechner                          | math-root
binomische-formeln           | math | Binomische Formeln (1./2./3. Binomische)         | math-root
rechteck-flaeche-umfang      | math | Rechteck Fläche + Umfang Rechner                 | math-root
normalverteilung-rechner     | math | Normalverteilung-Rechner (Gaußsche Glockenkurve) | math-root
logarithmus-rechner          | math | Logarithmus-Rechner (lg/ln/log_b)                | math-root
kugelvolumen-rechner         | math | Kugelvolumen-Rechner (V = 4/3πr³)               | math-root
ggt-rechner                  | math | GGT-Rechner (Größter Gemeinsamer Teiler)         | math-root
kgv-rechner                  | math | KGV-Rechner (Kleinstes Gemeinsames Vielfaches)   | math-root
zylindervolumen-rechner      | math | Zylindervolumen-Rechner                          | math-root
exponentialfunktion-rechner  | math | Exponentialfunktion-Rechner (a·bˣ)              | math-root
z-score-rechner              | math | Z-Score-Rechner (Standardisierung)               | math-root
kombinatorik-rechner         | math | Kombinatorik-Rechner (K, P, V mit/ohne WH)       | math-root
konfidenzintervall-rechner   | math | Konfidenzintervall-Rechner                       | math-root
trapez-flaeche-rechner       | math | Trapez-Fläche-Rechner                            | math-root
kegelvolumen-rechner         | math | Kegelvolumen-Rechner                             | math-root
quadervolumen-rechner        | math | Quadervolumen-Rechner                            | math-root
varianz-rechner              | math | Varianz-Rechner (Stichproben/Grundgesamtheit)    | math-root
p-wert-rechner               | math | P-Wert-Rechner (Hypothesentest)                  | math-root
ellipse-flaeche-rechner      | math | Ellipse-Fläche-Rechner (π·a·b)                  | math-root
pyramidenvolumen-rechner     | math | Pyramidenvolumen-Rechner                         | math-root
permutationen-rechner        | math | Permutationen-Rechner (n!)                       | math-root
lineare-gleichung-rechner    | math | Lineare Gleichung Rechner (ax+b=0)               | math-root
standardabweichung-rechner   | math | Standardabweichung-Rechner                       | math-root
t-test-rechner               | math | T-Test-Rechner (Student's t-Test)                | math-root
chi-quadrat-rechner          | math | Chi-Quadrat-Rechner (Anpassungstest)             | math-root
ableitungsrechner            | math | Ableitungsrechner (Differenziation)              | math-root
integralrechner              | math | Integralrechner (bestimmtes/unbestimmtes Integral)| math-root
rhombus-flaeche-rechner      | math | Rhombus-Fläche-Rechner                           | math-root
binomialverteilung-rechner   | math | Binomialverteilung-Rechner                       | math-root
korrelation-rechner          | math | Korrelations-Rechner (Pearson r)                 | math-root
lineare-regression-rechner   | math | Lineare Regression Rechner                       | math-root
standardfehler-rechner       | math | Standardfehler-Rechner                           | math-root
faktorisierung-rechner       | math | Faktorisierung-Rechner (Primfaktoren)            | math-root
modulo-rechner               | math | Modulo-Rechner (a mod n)                         | math-root
vektor-rechner               | math | Vektor-Rechner (2D/3D Operationen)               | math-root
matrix-determinante-rechner  | math | Matrix-Determinante-Rechner (2×2/3×3)            | math-root
matrix-inversion-rechner     | math | Matrix-Inversion-Rechner                         | math-root
polar-kartesisch-rechner     | math | Polar ↔ Kartesisch-Rechner                      | math-root
trigonometrie-rechner        | math | Trigonometrie-Rechner (Sin/Cos/Tan/Winkel)       | math-root
bogengrad-radiant-rechner    | math | Bogengrad ↔ Radiant Rechner                     | math-root
quartile-rechner             | math | Quartile-Rechner (Q1/Q2/Q3/IQR)                  | math-root
effektstaerke-rechner        | math | Effektstärke-Rechner (Cohen's d)                 | math-root
grenzwert-rechner            | math | Grenzwert-Rechner (lim x→∞)                     | math-root
spearman-korrelation         | math | Spearman-Korrelation-Rechner                     | math-root
binomialkoeffizient-rechner  | math | Binomialkoeffizient-Rechner (n über k)           | math-root
wahrscheinlichkeitsbaum      | math | Wahrscheinlichkeitsbaum-Generator                | math-root
schiefe-kurtosis-rechner     | math | Schiefe + Kurtosis Rechner                       | math-root
fourieranalyse               | math | Fourier-Analyse-Rechner (DFT/FFT-Approximation)  | math-root
laplace-transformation       | math | Laplace-Transformation-Rechner                   | math-root
quadratwurzel-rechner        | math | Quadratwurzel-Rechner (√n)                       | math-root
kubikwurzel-rechner          | math | Kubikwurzel-Rechner (∛n)                        | math-root
n-te-wurzel-rechner          | math | N-te Wurzel Rechner                              | math-root
dreieck-rechner              | math | Dreieck-Rechner (Seiten/Winkel/Fläche komplett)  | math-root
kreis-rechner                | math | Kreis-Rechner (r/d/Umfang/Fläche)               | math-root
kegel-rechner                | math | Kegel-Rechner (Volumen/Oberfläche/Mantelfläche)  | math-root
zylinder-rechner             | math | Zylinder-Rechner (Volumen/Oberfläche)            | math-root
kugel-rechner                | math | Kugel-Rechner (Volumen/Oberfläche)               | math-root
parallelogramm-rechner       | math | Parallelogramm-Rechner (Fläche/Seiten/Winkel)    | math-root
komplexe-zahlen-rechner      | math | Komplexe Zahlen Rechner (a+bi Operationen)       | math-root
primfaktorzerlegung          | math | Primfaktorzerlegung-Rechner                      | math-root
reihenkonvergenz-rechner     | math | Reihenkonvergenz-Rechner (Konvergenz-Tests)      | math-root
matrix-multiplikation-rechner| math | Matrix-Multiplikation-Rechner                    | math-root
viereck-rechner              | math | Viereck-Rechner (alle Viereck-Typen)             | math-root
pyramide-rechner             | math | Pyramide-Rechner (Volumen/Oberfläche)            | math-root
vektor-skalarprodukt         | math | Vektor-Skalarprodukt-Rechner                     | math-root
eigenvektor-rechner          | math | Eigenvektor-Rechner (2×2-Matrix)                 | math-root
```

---

## Tier 12 — Automotive-Suite (50 Tools, enum `automotive` live 2026-04-23)

**Enum-Status:** `automotive` in `categories.ts` freigegeben.
**SEO-Rationale:** €0.75-1.15 CPC. Deutsche Autofahrer-Kultur = starke Nachfrage für KFZ-Rechner.
**Dispatch-Prio:** Masterplan Wave 15, Prios 287-336.

```
spritverbrauch-rechner       | automotive | Spritverbrauch-Rechner (l/100km ↔ mpg)         | automotive-root
fahrkosten-rechner           | automotive | Fahrkosten-Rechner (km × l/100km × Preis)       | automotive-root
kfz-steuer-rechner           | automotive | KFZ-Steuer-Rechner (BJ + CO2 + Hubraum)         | automotive-root
fahrtzeit-rechner            | automotive | Fahrtzeit-Rechner (km ÷ Durchschnittstempo)      | automotive-root
elektroauto-reichweite       | automotive | Elektroauto-Reichweite-Rechner (kWh/100km)       | automotive-root
reifen-groesse-rechner       | automotive | Reifengröße-Rechner (205/55 R16 Umrechnung)      | automotive-root
winterreifen-checker         | automotive | Winterreifen-Checker (O-O-Regel + MFS)           | automotive-root
ladezeit-elektroauto         | automotive | Ladezeit-Elektroauto-Rechner (kW × kWh)          | automotive-root
oelwechsel-intervall         | automotive | Ölwechsel-Intervall-Rechner (km oder Monate)     | automotive-root
reifendruck-rechner          | automotive | Reifendruck-Rechner (Last + Strecke)             | automotive-root
kfz-versicherung-rechner     | automotive | KFZ-Versicherung-Rechner (Typklasse-Schätzer)    | automotive-root
tuev-intervall-rechner       | automotive | TÜV-Intervall-Rechner (nächste HU-Fälligkeit)    | automotive-root
bremsweg-rechner             | automotive | Bremsweg-Rechner (v² / 2a Formel)                | automotive-root
reifenprofil-rechner         | automotive | Reifenprofil-Rechner (Profiltiefe → Sicherheit)  | automotive-root
rpm-drehzahl-rechner         | automotive | RPM/Drehzahl-Rechner (Gang + Übersetzung)        | automotive-root
zahnriemen-intervall         | automotive | Zahnriemen-Intervall-Rechner                     | automotive-root
co2-bilanz-auto              | automotive | CO2-Bilanz-Rechner (Verbrenner vs. E-Auto)       | automotive-root
motorleistung-rechner        | automotive | Motorleistung-Rechner (PS ↔ kW)                 | automotive-root
drehmoment-kw-rechner        | automotive | Drehmoment-kW-Rechner (Nm ↔ PS bei RPM)         | automotive-root
leasing-vs-kauf-auto         | automotive | Leasing vs. Kauf-Rechner (TCO-Vergleich)         | automotive-root
auto-kaufpreis-rechner       | automotive | Auto-Kaufpreis-Rechner (Finanzierung + Nebenkosten)| automotive-root
auto-restwert-rechner        | automotive | Auto-Restwert-Rechner (lineare Abschreibung)     | automotive-root
mietwagen-kosten-rechner     | automotive | Mietwagen-Kosten-Rechner (Tage + Versicherung)   | automotive-root
carsharing-vs-kauf           | automotive | Carsharing vs. Kauf-Vergleich                    | automotive-root
motorenoel-viskositaet       | automotive | Motorenöl-Viskosität-Finder (Außentemperatur)    | automotive-root
reifen-durchmesser-rechner   | automotive | Reifen-Durchmesser-Rechner (Außendurchmesser mm) | automotive-root
felgen-einpresstiefe         | automotive | Felgen-Einpresstiefe-Rechner (ET-Wert)           | automotive-root
zuendkerzen-lebensdauer      | automotive | Zündkerzen-Lebensdauer-Rechner                   | automotive-root
luftfilter-wechsel           | automotive | Luftfilter-Wechsel-Intervall-Rechner             | automotive-root
batterie-zustand-checker     | automotive | Batterie-Zustand-Checker (CCA + Alter)           | automotive-root
umweltzone-checker           | automotive | Umweltzone-Checker (Euro-Norm → Plakette)        | automotive-root
sommerreifen-wechsel         | automotive | Sommerreifen-Wechsel-Datum-Rechner               | automotive-root
reifenabrieb-rechner         | automotive | Reifenabrieb-Rechner (mm/10.000km)               | automotive-root
autobahn-kosten-rechner      | automotive | Autobahn-Kosten-Rechner (Kraftstoff + Zeit)      | automotive-root
hybrid-batterie-zustand      | automotive | Hybrid-Batterie-Zustand-Rechner (Degradation)    | automotive-root
elektrobus-reichweite        | automotive | Elektrobus-Reichweite-Rechner                    | automotive-root
wasserstoff-tank-rechner     | automotive | Wasserstoff-Tank-Rechner (kg H2 → km)            | automotive-root
biokraftstoff-check          | automotive | Biokraftstoff-Check (E10/B7-Verträglichkeit)     | automotive-root
turbo-boost-rechner          | automotive | Turbo-Boost-Rechner (Ladedruckanstieg)           | automotive-root
bremseninspektion-rechner    | automotive | Bremsen-Inspektions-Intervall-Rechner            | automotive-root
stossdaempfer-pruefung       | automotive | Stoßdämpfer-Prüfungs-Intervall                   | automotive-root
felgen-traglast              | automotive | Felgen-Traglast-Rechner (Lastindex)              | automotive-root
bremsflussigkeit-test        | automotive | Bremsflüssigkeit-Test-Intervall (DOT-Klasse)     | automotive-root
kuehlmittel-check            | automotive | Kühlmittel-Check-Intervall-Rechner               | automotive-root
scheibenwaschanlage          | automotive | Scheibenwaschanlage-Frostschutz-Rechner          | automotive-root
pannenkits-check             | automotive | Pannenkits-Check (Reifenreparatur-Set Eignung)   | automotive-root
scheinwerfer-justierung      | automotive | Scheinwerfer-Justierungs-Rechner                 | automotive-root
treibstoffadditiv-rechner    | automotive | Treibstoffadditiv-Dosierungs-Rechner             | automotive-root
getriebeoel-test             | automotive | Getriebeöl-Wechsel-Intervall-Rechner             | automotive-root
abgasanlage-check            | automotive | Abgasanlage-Check-Intervall                      | automotive-root
```

---

## Tier 13 — Sport-Suite (60 Tools, enum `sport` live 2026-04-23)

**Enum-Status:** `sport` in `categories.ts` freigegeben.
**SEO-Rationale:** €0.72-1.15 CPC. Breite Zielgruppe: Läufer, Radfahrer, Sportler aller Art.
**Dispatch-Prio:** Masterplan Wave 16, Prios 337-396.

```
pace-rechner-laufen          | sport | Lauf-Pace-Rechner (min/km ↔ km/h)               | sport-root
dart-wertung-rechner         | sport | Dart-Wertungs-Rechner (X01-Spielstand)           | sport-root
fahrrad-geschwindigkeit      | sport | Fahrrad-Geschwindigkeits-Rechner (Kadenz × Übersetzung) | sport-root
schach-elo-rechner           | sport | Schach-Elo-Rechner (FIDE-Formel)                 | sport-root
marathonzeit-prognose        | sport | Marathonzeit-Prognose (aus Halbmarathon-Zeit)    | sport-root
golf-handicap-rechner        | sport | Golf-Handicap-Rechner (World Handicap System)    | sport-root
tennis-serve-geschwindigkeit | sport | Tennis-Serve-Geschwindigkeit-Rechner             | sport-root
squat-one-rep-max            | sport | Kniebeuge 1RM-Rechner (Epley-Formel)             | sport-root
triathlon-rechner            | sport | Triathlon-Gesamtzeit-Rechner                     | sport-root
bankdruecken-max-rechner     | sport | Bankdrücken-Max-Rechner (1RM-Schätzer)           | sport-root
kreuzheben-max-rechner       | sport | Kreuzheben-Max-Rechner (1RM-Schätzer)            | sport-root
halbmarathon-prognose        | sport | Halbmarathon-Prognose (aus 10km-Zeit)            | sport-root
5k-pace-rechner              | sport | 5km-Pace-Rechner (Zielzeit → Pace)               | sport-root
10k-prognose-rechner         | sport | 10km-Prognose-Rechner                            | sport-root
kampfsport-gewichtsklasse    | sport | Kampfsport-Gewichtsklasse-Finder                 | sport-root
motorsport-bremsweg          | sport | Motorsport-Bremsweg-Rechner (Racing-Formel)      | sport-root
dart-checkout-rechner        | sport | Dart-Checkout-Rechner (beste Kombination X01)    | sport-root
fitness-progressive-load     | sport | Fitness-Progressive-Load-Rechner                 | sport-root
drohnen-akkulaufzeit         | sport | Drohnen-Akkulaufzeit-Rechner (mAh × C-Rate)      | sport-root
crossfit-analyzer            | sport | CrossFit-WOD-Analyzer (Gewicht × Wiederholungen) | sport-root
fussball-schussgeschwindigkeit| sport | Fußball-Schussgeschwindigkeit-Rechner            | sport-root
schwimmen-pace-rechner       | sport | Schwimmen-Pace-Rechner (min/100m)                | sport-root
fahrrad-trittfrequenz        | sport | Fahrrad-Trittfrequenz-Rechner (Kadenz-Optimum)   | sport-root
boxen-kraft-rechner          | sport | Boxen-Schlagkraft-Rechner (Masse × Beschleunigung)| sport-root
bodybuilding-volumen         | sport | Bodybuilding-Trainingsvolumen-Rechner (Sätze×WDH)| sport-root
gewichtheben-max             | sport | Gewichtheben-Max-Rechner (Snatch/Clean)          | sport-root
powerlifting-total           | sport | Powerlifting-Total-Rechner (SBD + Wilks-Score)   | sport-root
basketball-dreierquote       | sport | Basketball-Dreierquoten-Rechner                  | sport-root
basketball-freiwurf          | sport | Basketball-Freiwurf-Prozent-Rechner              | sport-root
klettern-koerpergewicht      | sport | Klettern-Kraft-Gewicht-Verhältnis                | sport-root
ski-schwierigkeitsgrad       | sport | Ski-Schwierigkeitsgrad-Finder (FIS-Klassifikation)| sport-root
tischtennis-geschwindigkeit  | sport | Tischtennis-Ballgeschwindigkeit-Rechner          | sport-root
mountainbike-federung        | sport | Mountainbike-Federwege-Rechner (Sag-Einstellung) | sport-root
rennrad-gewicht              | sport | Rennrad-Gewicht-Leistungs-Rechner (W/kg)         | sport-root
volleyball-schlagkraft       | sport | Volleyball-Schlagkraft-Rechner                   | sport-root
golf-driving-analyse         | sport | Golf-Driving-Analyse (Smash-Factor)              | sport-root
yoga-kalorienverbrauch       | sport | Yoga-Kalorienverbrauch-Rechner (Stil + Dauer)    | sport-root
tauchen-sicherheitsstopp     | sport | Tauchen-Sicherheitsstopp-Tiefe-Rechner           | sport-root
sprint-analyse               | sport | Sprint-Analyse (Split-Zeiten → Topspeed)         | sport-root
springen-weite-hoch          | sport | Springer-Weite/Höhe-Analyse (Biomechanik)        | sport-root
zehnkampf-punkte             | sport | Zehnkampf-Punkte-Rechner (IAAF-Formel)           | sport-root
surf-wellenhoehe             | sport | Surf-Wellenhöhe-Rechner (Beaufort → Wellen)      | sport-root
rudern-pace-rechner          | sport | Rudern-Pace-Rechner (500m-Split)                 | sport-root
pilates-kalorienverbrauch    | sport | Pilates-Kalorienverbrauch-Rechner                | sport-root
langlauf-tempo               | sport | Langlauf-Tempo-Rechner (Klassisch/Skating)       | sport-root
bogenschiessen-rechner       | sport | Bogenschießen-Rechner (Zuggewicht + Pfeillänge)  | sport-root
schiessen-ballistik          | sport | Schießen-Ballistik-Rechner (Luftdruck + Elevation)| sport-root
billiard-winkel              | sport | Billard-Winkel-Rechner (Reflexion + Stoß)        | sport-root
kegeln-durchschnitt          | sport | Kegeln-Durchschnitt-Rechner                      | sport-root
karate-graduierung           | sport | Karate-Graduierung-Rechner (Gürtel-Stufen)       | sport-root
taekwondo-gurt-pruefung      | sport | Taekwondo-Gurt-Prüfungs-Rechner                  | sport-root
ringen-gewichtsklasse        | sport | Ringen-Gewichtsklasse-Finder (UWW)               | sport-root
skispringen-distanz          | sport | Skispringen-Distanz-Punkte-Rechner               | sport-root
eislaufen-sprunghoehe        | sport | Eislaufen-Sprunghöhe-Rechner                     | sport-root
snowboard-neigung            | sport | Snowboard-Bindungsneigung-Rechner                | sport-root
stabhochsprung-analyse       | sport | Stabhochsprung-Analyse (Energie + Höhe)          | sport-root
diskus-wurf-kurve            | sport | Diskuswurf-Kurven-Rechner (Abwurfwinkel)         | sport-root
kajakpaddel-rate             | sport | Kajak-Paddelfrequenz-Rechner                     | sport-root
modellflugzeug-flugzeit      | sport | Modellflugzeug-Flugzeit-Rechner (LiPo-Kapazität) | sport-root
rc-auto-topspeed             | sport | RC-Auto-Topspeed-Rechner (Motor + Übersetzung)   | sport-root
```

---

## Tier 14 — Science-Suite (61 Tools, enum `science` live 2026-04-23)

**Enum-Status:** `science` in `categories.ts` freigegeben.
**SEO-Rationale:** €0.15-0.60 CPC. MINT-Zielgruppe: Schüler, Studenten, Ingenieure. Niedrige Konkurrenz für Physik/Chemie-Rechner.
**Dispatch-Prio:** Masterplan Wave 17, Prios 397-457.

```
energieverbrauch-rechner     | science | Energieverbrauch-Rechner (kWh/Jahr)             | science-root
stromkostenrechner           | science | Stromkosten-Rechner (Verbrauch × Preis)         | science-root
ph-wert-rechner              | science | pH-Wert-Rechner (Säure/Base/Neutral)            | science-root
ohmsches-gesetz              | science | Ohmsches Gesetz Rechner (U=R·I)                 | science-root
molmasse-rechner             | science | Molmasse-Rechner (Summenformel → g/mol)         | science-root
kinetische-energie-rechner   | science | Kinetische Energie Rechner (Ekin = ½mv²)        | science-root
elektrische-leistung-rechner | science | Elektrische Leistung Rechner (P=U·I)            | science-root
schallgeschwindigkeit-rechner| science | Schallgeschwindigkeit-Rechner (Medium + Temp)    | science-root
dezibel-umrechner            | science | Dezibel-Umrechner (dB ↔ Intensität/Schalldruck) | science-root
frequenz-wellenlaenge-rechner| science | Frequenz ↔ Wellenlänge Rechner (c=λf)          | science-root
gravitation-rechner          | science | Gravitations-Rechner (F=G·m1·m2/r²)            | science-root
potentielle-energie-rechner  | science | Potentielle Energie Rechner (Epot = mgh)        | science-root
molare-konzentration-rechner | science | Molare Konzentration Rechner (c = n/V)          | science-root
gasgesetz-rechner            | science | Gasgesetz-Rechner (pV=nRT)                      | science-root
drehmoment-rechner           | science | Drehmoment-Rechner (M = F·r)                    | science-root
pendel-schwingung-rechner    | science | Pendel-Schwingung-Rechner (T = 2π√l/g)         | science-root
impuls-rechner               | science | Impuls-Rechner (p = m·v)                        | science-root
kondensator-energie-rechner  | science | Kondensator-Energie-Rechner (E = ½CV²)          | science-root
radioaktiver-zerfall-rechner | science | Radioaktiver Zerfall Rechner (Halbwertszeit)    | science-root
photonenenergie-rechner      | science | Photonenenergie-Rechner (E = hf)                | science-root
magnetfeld-rechner           | science | Magnetfeld-Rechner (Spule + Leiter)             | science-root
orbitalgeschwindigkeit-rechner| science | Orbitalgeschwindigkeit-Rechner (v = √GM/r)     | science-root
saeure-base-rechner          | science | Säure-Base-Rechner (Henderson-Hasselbalch)      | science-root
coulomb-kraft-rechner        | science | Coulomb-Kraft-Rechner (F = kq1q2/r²)            | science-root
stromstaerke-rechner         | science | Stromstärke-Rechner (I = U/R)                   | science-root
spannungsteiler-rechner      | science | Spannungsteiler-Rechner (R1/R2-Netzwerk)        | science-root
impedanz-rechner             | science | Impedanz-Rechner (R, L, C Schaltung)            | science-root
linsengleichung-rechner      | science | Linsengleichung-Rechner (1/f = 1/g + 1/b)       | science-root
lichtbrechung-rechner        | science | Lichtbrechung-Rechner (Snell's Gesetz)          | science-root
doppler-effekt-rechner       | science | Doppler-Effekt-Rechner (Frequenzverschiebung)   | science-root
zentrifugalkraft-rechner     | science | Zentrifugalkraft-Rechner (F = mω²r)             | science-root
fluchtgeschwindigkeit-rechner| science | Fluchtgeschwindigkeit-Rechner (v = √2GM/r)      | science-root
redoxgleichung-rechner       | science | Redoxgleichung-Rechner (Oxidationszahlen)       | science-root
puffer-rechner               | science | Puffer-Rechner (Henderson-Hasselbalch Puffer)   | science-root
elastische-energie-rechner   | science | Elastische Energie Rechner (E = ½kx²)           | science-root
dampfdruck-rechner           | science | Dampfdruck-Rechner (Antoine-Gleichung)          | science-root
leistungsfaktor-rechner      | science | Leistungsfaktor-Rechner (cos φ)                 | science-root
effektivwert-rechner         | science | Effektivwert-Rechner (RMS von Sinusspannung)    | science-root
molenbruch-rechner           | science | Molenbruch-Rechner (x = n/n_ges)               | science-root
faraday-induktion-rechner    | science | Faraday-Induktions-Rechner (EMK = -dΦ/dt)       | science-root
traegheitsmoment-rechner     | science | Trägheitsmoment-Rechner (Massenverteilung)      | science-root
co2-fussabdruck-rechner      | science | CO2-Fußabdruck-Rechner (Strom/Heizung/Flug)     | science-root
solarertrag-rechner          | science | Solarertrag-Rechner (kWp × Volllaststunden)     | science-root
windkraft-ertrag-rechner     | science | Windkraft-Ertrag-Rechner (Betz-Grenze)          | science-root
waermedaemmung-rechner       | science | Wärmedämmung-Rechner (U-Wert + Heizenergie)     | science-root
kuehlleistung-rechner        | science | Kühlleistung-Rechner (BTU ↔ kW)                | science-root
vergroesserung-mikroskop     | science | Vergrößerung-Mikroskop-Rechner                  | science-root
spektroskopie-rechner        | science | Spektroskopie-Rechner (Wellenlänge → Farbe)     | science-root
plancks-gesetz-rechner       | science | Plancksches Gesetz Rechner (Schwarzkörper)      | science-root
induktivitaet-rechner        | science | Induktivität-Rechner (Spulen-Berechnung)        | science-root
gauss-gesetz-rechner         | science | Gauß-Gesetz-Rechner (elektrischer Fluss)        | science-root
harmonische-schwingung       | science | Harmonische Schwingung Rechner                  | science-root
widerstand-temp-koeff        | science | Widerstand-Temperatur-Koeffizient-Rechner       | science-root
regenwasser-speicher         | science | Regenwasser-Speicher-Rechner (Dachfläche × mm)  | science-root
pumpenleistung-rechner       | science | Pumpenleistung-Rechner (P = ρgQh)              | science-root
kompressorleistung-rechner   | science | Kompressorleistung-Rechner                      | science-root
entfeuchter-kapazitaet       | science | Entfeuchter-Kapazität-Rechner (Raumvolumen)     | science-root
lc-resonanz-rechner          | science | LC-Resonanz-Rechner (f = 1/2π√LC)              | science-root
reaktanz-rechner             | science | Reaktanz-Rechner (XL, XC)                       | science-root
van-der-waals-rechner        | science | Van-der-Waals-Rechner (reales Gasgesetz)        | science-root
photovoltaik-rechner         | science | Photovoltaik-Rechner (Ertrag + Amortisation)    | science-root
```

---

## Tier 15 — Engineering-Suite (50 Tools, enum `engineering` live 2026-04-23)

**Enum-Status:** `engineering` in `categories.ts` freigegeben.
**SEO-Rationale:** €0.20-0.68 CPC. B2B-Zielgruppe: Maschinenbauer, Bauingenieure, Elektriker. Sehr niedrige Konkurrenz für Fach-Rechner.
**Dispatch-Prio:** Masterplan Wave 18, Prios 458-507.

```
duebel-auswaehler            | engineering | Dübel-Auswähler (Untergrund + Last)             | engineering-root
federsteifigkeit-rechner     | engineering | Federsteifigkeit-Rechner (k = F/x)              | engineering-root
toleranzen-paarung           | engineering | Toleranzen-Paarungs-Rechner (ISO-Passungen)     | engineering-root
stahlprofile-rechner         | engineering | Stahlprofile-Rechner (I/U/T-Träger Kennwerte)   | engineering-root
draht-querschnitt-rechner    | engineering | Draht-Querschnitt-Rechner (Strom + Länge → mm²) | engineering-root
maschinenelemente-rechner    | engineering | Maschinenelemente-Rechner (Schrauben/Federn)    | engineering-root
hydraulik-druck-rechner      | engineering | Hydraulik-Druck-Rechner (p = F/A)               | engineering-root
pumpen-volumenstrom          | engineering | Pumpen-Volumenstrom-Rechner                     | engineering-root
rohrdurchmesser-rechner      | engineering | Rohrdurchmesser-Rechner (Durchfluss + Geschw.)  | engineering-root
zahnrad-uebersetzung         | engineering | Zahnrad-Übersetzungs-Rechner (i = z2/z1)        | engineering-root
eigenfrequenz-rechner        | engineering | Eigenfrequenz-Rechner (mechanische Systeme)     | engineering-root
grundbau-tragfaehigkeit      | engineering | Grundbau-Tragfähigkeit-Rechner                  | engineering-root
schwungrad-energie           | engineering | Schwungrad-Energie-Rechner (E = ½Iω²)          | engineering-root
verschraubung-anzugmoment    | engineering | Verschraubung-Anzugmoment-Rechner               | engineering-root
zahnstange-ritzel            | engineering | Zahnstange-Ritzel-Rechner (Übersetzung + Kraft) | engineering-root
bolzen-berechnung            | engineering | Bolzen-Berechnungs-Rechner (Abscherung + Trag.) | engineering-root
balkenbiegung-rechner        | engineering | Balkenbiegung-Rechner (Durchbiegung + Spannung) | engineering-root
hydraulik-durchfluss         | engineering | Hydraulik-Durchfluss-Rechner (Q = A·v)          | engineering-root
kompressor-leistung          | engineering | Kompressor-Leistungs-Rechner                    | engineering-root
turbinen-drehzahl            | engineering | Turbinen-Drehzahl-Rechner (Spezifische Drehzahl)| engineering-root
lagerkraefte-rechner         | engineering | Lagerkräfte-Rechner (statisch bestimmtes System)| engineering-root
warmausdehnung-rechner       | engineering | Wärmeausdehnung-Rechner (ΔL = α·L·ΔT)          | engineering-root
schwingungsanalyse           | engineering | Schwingungsanalyse-Rechner (FFT-Annäherung)     | engineering-root
daempfungskoeffizient        | engineering | Dämpfungskoeffizient-Rechner                    | engineering-root
schneckengetriebe-rechner    | engineering | Schneckengetriebe-Rechner (Übersetzung + Wirkung)| engineering-root
keilriemen-laenge            | engineering | Keilriemen-Längen-Rechner                       | engineering-root
riemenantrieb-rechner        | engineering | Riemenantrieb-Rechner (Übersetzung + Spannung)  | engineering-root
lager-traglast-rechner       | engineering | Lager-Traglast-Rechner (C/P-Lebensdauer)        | engineering-root
kupfer-widerstand-rechner    | engineering | Kupfer-Widerstand-Rechner (ρ·L/A)               | engineering-root
ventil-durchfluss            | engineering | Ventil-Durchfluss-Rechner (Kv-Wert)             | engineering-root
scherspannung-rechner        | engineering | Scherspannung-Rechner (τ = F/A)                 | engineering-root
kettenantrieb-rechner        | engineering | Kettenantrieb-Rechner (Teilung + Übersetzung)   | engineering-root
oberflaechen-rauhheit        | engineering | Oberflächen-Rauheit-Rechner (Ra/Rz Umrechnung)  | engineering-root
flaechen-traegheitsmoment    | engineering | Flächenträgheitsmoment-Rechner (I für Profile)  | engineering-root
stahlbeton-bewehrung         | engineering | Stahlbeton-Bewehrungs-Rechner                   | engineering-root
pfahlgruendung-rechner       | engineering | Pfahlgründung-Tragfähigkeit-Rechner             | engineering-root
stuetzmauer-rechner          | engineering | Stützmauer-Standsicherheits-Rechner             | engineering-root
spannstahl-kraft             | engineering | Spannstahl-Vorspannkraft-Rechner                | engineering-root
filter-durchfluss            | engineering | Filter-Durchfluss-Rechner (Δp + Viskosität)     | engineering-root
bremsenergieabsorption       | engineering | Bremsenergie-Absorptions-Rechner                | engineering-root
rohrbiegung-kraft            | engineering | Rohrbiegung-Kraft-Rechner                       | engineering-root
flanschen-rechner            | engineering | Flansch-Verschraubungs-Rechner                  | engineering-root
kupplungsmoment              | engineering | Kupplungsmoment-Rechner                         | engineering-root
druckspannung-rechner        | engineering | Druckspannung-Rechner (σ = F/A)                 | engineering-root
vickers-haerte-rechner       | engineering | Vickers-Härte-Rechner (HV → HB → HRC)          | engineering-root
materialkenndaten            | engineering | Materialkenndaten-Finder (E-Modul, Festigkeit)  | engineering-root
kernhaertetiefe              | engineering | Kernhärtetiefe-Rechner (Einsatzhärtung)         | engineering-root
schrauben-auswaehler         | engineering | Schrauben-Auswähler (DIN/ISO Normtabelle)       | engineering-root
lueftungsanlage-rechner      | engineering | Lüftungsanlage-Rechner (Luftwechselrate)         | engineering-root
elektroinstallation-rechner  | engineering | Elektroinstallation-Rechner (Leitungsquerschnitt)| engineering-root
```

---

## Tier 16 — Education-Suite (50 Tools, enum `education` live 2026-04-23)

**Enum-Status:** `education` in `categories.ts` freigegeben.
**SEO-Rationale:** €0.22-0.72 CPC. Schüler, Studenten, Eltern in DE sind riesige Zielgruppe (5-13M potentielle Nutzer).
**Dispatch-Prio:** Masterplan Wave 19, Prios 508-557.

```
notenschnitt-rechner         | education | Notenschnitt-Rechner (Abitur DE-System)          | education-root
abitur-punkte-rechner        | education | Abitur-Punkte-Rechner (0–15 ↔ Noten 1–6)        | education-root
bafoeg-rechner               | education | BAföG-Rechner (Freibeträge + Bedarfssätze)       | education-root
pomodoro-timer               | education | Pomodoro-Timer (25/5-min Lernintervalle)         | education-root
klausurnote-rechner          | education | Klausurnote-Rechner (Punkte → Note)              | education-root
punkte-zu-noten-rechner      | education | Punkte-zu-Noten-Rechner (Notenschlüssel)         | education-root
studentenkosten-rechner      | education | Studentenkosten-Rechner (Monat + Ort)            | education-root
lesegeschwindigkeit-test     | education | Lesegeschwindigkeit-Test (Wörter/Minute)         | education-root
wortschatz-frequenz          | education | Wortschatz-Frequenz-Analyse                      | education-root
stundenplan-optimierer       | education | Stundenplan-Optimierer                           | education-root
gpa-konverter                | education | GPA-Konverter (DE ↔ US ↔ UK)                    | education-root
noten-simulator              | education | Noten-Simulator (Was brauche ich noch?)          | education-root
semester-planer              | education | Semester-Planer (ECTS + Zeitplanung)             | education-root
lernziel-planer              | education | Lernziel-Planer (SMART-Methode)                  | education-root
pruefungsplan-rechner        | education | Prüfungsplan-Rechner (Verteilung der Lernzeit)   | education-root
konzentrations-timer         | education | Konzentrations-Timer (Lern-Pausen-Rhythmus)      | education-root
sprachlevel-tester           | education | Sprachlevel-Tester (A1-C2 Selbsteinschätzung)    | education-root
fremdsprachen-lernpfad       | education | Fremdsprachen-Lernpfad-Planer                    | education-root
studienkredit-rechner        | education | Studienkredit-Rechner (KfW-Annuitäten)           | education-root
ects-punkte-rechner          | education | ECTS-Punkte-Rechner (Workload ↔ Credits)         | education-root
gewichtete-note-rechner      | education | Gewichtete-Note-Rechner (ECTS-gewichtet)         | education-root
spaced-repetition-planer     | education | Spaced-Repetition-Planer (SM-2-Algorithmus)      | education-root
karrierepfad-simulator       | education | Karrierepfad-Simulator (Abschluss → Jobs)        | education-root
anwesenheitsquote-rechner    | education | Anwesenheitsquote-Rechner (Fehlstunden)          | education-root
akzent-trainer               | education | Akzent-Trainer (IPA-Lautschrift-Guide)           | education-root
klausurtermin-planer         | education | Klausurtermin-Planer (Pufferzeit-Berechnung)     | education-root
modul-bestehenscheck         | education | Modul-Bestehens-Check (Mindestpunkte)            | education-root
worte-seiten-rechner         | education | Wörter-Seiten-Rechner (DIN A4-Normseiten)        | education-root
schreibtempo-rechner         | education | Schreibtempo-Rechner (Wörter/Stunde)             | education-root
abschluss-wert-rechner       | education | Abschluss-Wert-Rechner (Abschlussnote)           | education-root
leistungsentwicklung         | education | Leistungsentwicklung-Tracker (Note über Zeit)    | education-root
vorlesungsfehlquote          | education | Vorlesungsfehlquote-Rechner (Stunden + Limit)    | education-root
grammatik-tracker            | education | Grammatik-Fehler-Tracker                         | education-root
idiomatische-ausdruecke      | education | Idiomatische Ausdrücke Quiz (DE/EN/ES)           | education-root
pruefungsangst-index         | education | Prüfungsangst-Index (Screening)                  | education-root
mind-map-helper              | education | Mind-Map-Helper (Struktur-Generator)             | education-root
studiendauer-rechner         | education | Studiendauer-Rechner (ECTS ÷ Semester-Load)      | education-root
stipendium-rechner           | education | Stipendium-Rechner (Förderhöhe Abschätzung)      | education-root
masterprogramm-vergleich     | education | Masterprogramm-Vergleichs-Tool                   | education-root
lerngruppen-rechner          | education | Lerngruppen-Rechner (optimale Gruppengröße)      | education-root
schriftsystem-lernplan       | education | Schriftsystem-Lernplan (Hiragana/Kyrillik etc.)  | education-root
phonetisches-ipa             | education | Phonetisches IPA-Alphabet-Tool                   | education-root
doktoranden-finanzierung     | education | Doktoranden-Finanzierungs-Rechner                | education-root
buecherbudget-planer         | education | Bücher-Budget-Planer (Semester)                  | education-root
plagiat-checker-guide        | education | Plagiat-Checker-Guide (Zitierstil-Prüfliste)     | education-root
wissenschaft-zitation        | education | Wissenschaft-Zitations-Formatter (APA/MLA/Chicago)| education-root
laborprotokoll-vorlage       | education | Laborprotokoll-Vorlage-Generator                 | education-root
pruefungsgebueahr-rechner    | education | Prüfungsgebühr-Rechner (Hochschule)              | education-root
schreiben-wordcount-ziel     | education | Schreiben-Wordcount-Ziel-Tracker                 | education-root
perspektiven-wechsel         | education | Perspektiven-Wechsel-Tool (Argumentations-Übung) | education-root
```

---

## Tier 17 — Agriculture-Suite (50 Tools, enum `agriculture` live 2026-04-23)

**Enum-Status:** `agriculture` in `categories.ts` freigegeben.
**SEO-Rationale:** €0.14-0.45 CPC. Landwirte, Hobbygärtner, Kleingärtner. Kaum digitale Konkurrenz für Agrar-Rechner.
**Dispatch-Prio:** Masterplan Wave 20, Prios 558-607.

```
duengerbedarf-rechner        | agriculture | Düngerbedarf-Rechner (NPK-Berechnung)           | agriculture-root
bewaesserung-rechner         | agriculture | Bewässerungs-Rechner (l/m² + Pflanzenbedarf)    | agriculture-root
saatgut-aussaat-rechner      | agriculture | Saatgut-Aussaat-Rechner (kg/ha + Pflanzabstand) | agriculture-root
nmin-duengung-rechner        | agriculture | Nmin-Düngungs-Rechner (Bodenstickstoff)          | agriculture-root
traktorleistung-rechner      | agriculture | Traktorleistung-Rechner (PS + Zugkraft)          | agriculture-root
subventions-rechner          | agriculture | Subventions-Rechner (GAP-Direktzahlungen)        | agriculture-root
agrar-foerderung-rechner     | agriculture | Agrar-Förderungs-Rechner (ELER + nationale Mittel)| agriculture-root
bodentemperatur-rechner      | agriculture | Bodentemperatur-Rechner (Saatgut-Keimung)       | agriculture-root
ph-boden-optimierung         | agriculture | pH-Boden-Optimierungs-Rechner (Kalkung)          | agriculture-root
fruchtwechsel-planer         | agriculture | Fruchtwechsel-Planer (Fruchtfolge-Optimizer)     | agriculture-root
feldflaeche-rechner          | agriculture | Feldfläche-Rechner (Hektar aus GPS-Punkten)      | agriculture-root
ernte-zeitpunkt-rechner      | agriculture | Ernte-Zeitpunkt-Rechner (Wachstumsgradtage)      | agriculture-root
bodenfeuchte-rechner         | agriculture | Bodenfeuchte-Rechner (pF-Wert)                   | agriculture-root
frosttage-rechner            | agriculture | Frosttage-Rechner (Standort + Jahreszeit)        | agriculture-root
vegetationstage-rechner      | agriculture | Vegetationstage-Rechner (Klimastation)           | agriculture-root
pflanzenschutz-dosierung     | agriculture | Pflanzenschutz-Dosierungs-Rechner (l/ha)         | agriculture-root
fungizid-rechner             | agriculture | Fungizid-Rechner (Wirkstoff-Konzentration)       | agriculture-root
tierfutter-ration            | agriculture | Tierfutter-Rations-Rechner (GE/ME + Gewicht)     | agriculture-root
viehtransport-rechner        | agriculture | Viehtransport-Rechner (Ladefläche + Tierschutz)  | agriculture-root
insektizid-wartezeit         | agriculture | Insektizid-Wartezeit-Rechner (Applikation → Ernte)| agriculture-root
sort-ertragsindex            | agriculture | Sorten-Ertrags-Index-Rechner                     | agriculture-root
agrar-versicherung-praemie   | agriculture | Agrar-Versicherungs-Prämien-Rechner              | agriculture-root
direktzahlungen-hektar       | agriculture | Direktzahlungen-Hektar-Rechner (GAP 2024)        | agriculture-root
kompost-reifezeit            | agriculture | Kompost-Reifezeit-Rechner (C/N-Verhältnis)       | agriculture-root
saatgutbehandlung-rechner    | agriculture | Saatgutbehandlung-Rechner (Beizmittel-Dosierung) | agriculture-root
spurenelement-rechner        | agriculture | Spurenelement-Rechner (Fe/Mn/Zn/Cu-Bedarf)       | agriculture-root
kalium-phosphor-rechner      | agriculture | Kalium-Phosphor-Rechner (K/P Grunddüngung)       | agriculture-root
herbizid-abstandsregel       | agriculture | Herbizid-Abstandsregel-Rechner (Gewässer/Saum)   | agriculture-root
bienenfreundlich-check       | agriculture | Bienenfreundlich-Check (PSM + Blühzeitraum)      | agriculture-root
pflanzendichte-rechner       | agriculture | Pflanzendichte-Rechner (Pflanzen/m² + Reihe)     | agriculture-root
schaedlingsbefall-index      | agriculture | Schädlingsbefall-Index-Rechner (Schadschwelle)   | agriculture-root
krankheitsrisiko-pflanzen    | agriculture | Krankheitsrisiko-Pflanzen-Rechner (Witterung)    | agriculture-root
bodenverdichtung-rechner     | agriculture | Bodenverdichtung-Rechner (Achslast + Reifendruck)| agriculture-root
bodenverbesserung-rechner    | agriculture | Bodenverbesserungs-Rechner (Organik + Sand)      | agriculture-root
biogasanlage-rechner         | agriculture | Biogasanlage-Rechner (Substrat → kWh/a)          | agriculture-root
energiepflanzen-ertrag       | agriculture | Energiepflanzen-Ertrag-Rechner                   | agriculture-root
heuqualitaet-tester          | agriculture | Heuqualität-Tester (XF/XP/ME-Schätzung)          | agriculture-root
lagerverluste-rechner        | agriculture | Lagerverluste-Rechner (Atemverlust + Bruch)      | agriculture-root
marktpreis-rechner           | agriculture | Marktpreis-Rechner (Erzeuger → Handel → VK)      | agriculture-root
trocknungskosten-rechner     | agriculture | Trocknungskosten-Rechner (kWh/t Feuchteentzug)   | agriculture-root
bestaeubungs-rechner         | agriculture | Bestäubungs-Rechner (Bienenvölker/ha)            | agriculture-root
mulch-schichtdicke           | agriculture | Mulch-Schichtdicke-Rechner (cm + Material)       | agriculture-root
spritdruck-kalibrierung      | agriculture | Spritzdruck-Kalibrierungs-Rechner (l/ha)         | agriculture-root
viehgewicht-prognose         | agriculture | Viehgewicht-Prognose-Rechner (Herzgurtmaß)       | agriculture-root
gewaechshaus-heizung         | agriculture | Gewächshaus-Heizungs-Rechner (kWh + U-Wert)      | agriculture-root
belueftung-halle-rechner     | agriculture | Belüftungs-Halle-Rechner (Luftwechselrate)       | agriculture-root
bewasserung-troepfchen       | agriculture | Tröpfchen-Bewässerungs-Rechner (l/h pro Linie)   | agriculture-root
erntemengen-rechner          | agriculture | Erntemengen-Rechner (dt/ha × Fläche)             | agriculture-root
hagelschaden-rechner         | agriculture | Hagelschaden-Rechner (Ertragsausfall-Schätzung)  | agriculture-root
lagerhaltungs-rechner        | agriculture | Lagerhaltungs-Rechner (Lagerkosten/t/Monat)      | agriculture-root
```

---

## Tier 18 — AV-Suite (47 Tools, Audio/Video Creator Tools, 2026-04-23)

**Enum-Status:** Nutzt bestehende `audio` + `video` Enums.
**SEO-Rationale:** Content-Creator-Zielgruppe. Hohe Engagement-Rate, gute Linkbuilding-Chancen.
**Dispatch-Prio:** Masterplan Waves 21-22, Prios 608-654.

```
youtube-bitrate-rechner      | video | YouTube-Bitrate-Rechner (Auflösung + FPS)        | video-root
video-bitrate-speicher       | video | Video-Bitrate-Speicher-Rechner (GB/Stunde)       | video-root
video-kompression-rechner    | video | Video-Kompression-Rechner (Codec-Vergleich)      | video-root
streaming-bitrate-rechner    | video | Streaming-Bitrate-Rechner (Internet-Anforderung) | video-root
tiktok-video-format          | video | TikTok-Video-Format-Guide (Auflösung + Länge)    | video-root
fps-rechner                  | video | FPS-Rechner (Framerate + Bewegungsunschärfe)     | video-root
aspect-ratio-rechner         | video | Aspect-Ratio-Rechner (16:9/4:3/2.39:1)          | video-root
iso-belichtungs-rechner      | video | ISO-Belichtungs-Rechner (Exposure-Dreieck)       | video-root
brennweiten-rechner          | video | Brennweiten-Rechner (APS-C/m4/3/FF-Äquivalent)  | video-root
videospeicher-rechner        | video | Videospeicher-Rechner (Bitrate × Aufnahmedauer)  | video-root
belichtungswinkel-rechner    | video | Belichtungswinkel-Rechner (180°-Regel)           | video-root
tiefenschaerfe-rechner       | video | Tiefenschärfe-Rechner (DOF aus Blende + Abstand) | video-root
video-frame-dauer            | video | Video-Frame-Dauer-Rechner (ms pro Frame)         | video-root
twitch-bitrate-rechner       | video | Twitch-Bitrate-Rechner (Upload-Speed Check)      | video-root
licht-verhaeltnis-rechner    | video | Licht-Verhältnis-Rechner (Key/Fill-Ratio)        | video-root
motion-blur-rechner          | video | Motion-Blur-Rechner (Shutter-Speed + FPS)        | video-root
farbraum-konverter           | video | Farbraum-Konverter (sRGB/Rec.709/Rec.2020)       | video-root
stream-codec-vergleich       | video | Stream-Codec-Vergleich (H.264/H.265/AV1)         | video-root
chroma-subsampling           | video | Chroma-Subsampling-Guide (4:2:0/4:2:2/4:4:4)    | video-root
gimbal-einstellungen         | video | Gimbal-Einstellungen-Rechner (Motorstärke + Gewicht)| video-root
slider-geschwindigkeit       | video | Slider-Geschwindigkeits-Rechner (cm/s)           | video-root
bpm-tempo-rechner            | audio | BPM-Tempo-Rechner (Beats per Minute)             | audio-root
dezibel-rechner              | audio | Dezibel-Rechner (dB Addition/Subtraktion)        | audio-root
audio-bitrate-rechner        | audio | Audio-Bitrate-Rechner (kbps × Dauer → MB)        | audio-root
pitch-shift-cents            | audio | Pitch-Shift-Cents-Rechner (Halbton-Intervalle)   | audio-root
eq-frequenz-guide            | audio | EQ-Frequenz-Guide (Hz-Bereich → Klang-Effekt)    | audio-root
podcast-laenge-rechner       | audio | Podcast-Länge-Rechner (Wörter ÷ Sprechtempo)     | audio-root
frequenz-wellenlaenge-audio  | audio | Frequenz ↔ Wellenlänge Audio-Rechner            | audio-root
sample-rate-rechner          | audio | Sample-Rate-Rechner (kHz + Bit-Tiefe → MB/s)     | audio-root
lufs-normalisierung          | audio | LUFS-Normalisierung-Rechner (Ziel-LUFS)          | audio-root
kompressor-einstellungen     | audio | Kompressor-Einstellungen-Guide (Threshold/Ratio) | audio-root
limiter-rechner              | audio | Limiter-Rechner (True Peak + Ceiling)            | audio-root
delay-sync-rechner           | audio | Delay-Sync-Rechner (ms ↔ BPM)                   | audio-root
mastering-headroom           | audio | Mastering-Headroom-Rechner (-14 LUFS Standard)   | audio-root
crossfade-zeit-rechner       | audio | Crossfade-Zeit-Rechner (Bars + BPM)              | audio-root
expander-gate-rechner        | audio | Expander/Gate-Rechner (Threshold + Ratio)        | audio-root
sidechain-filter             | audio | Sidechain-Filter-Guide (Frequenzband-Auswahl)    | audio-root
mic-placement-guide          | audio | Mikrofon-Placement-Guide (Abstand + Winkel)      | audio-root
reverb-predelay-rechner      | audio | Reverb-Predelay-Rechner (ms = BPM-Sync)          | audio-root
vocal-formant-rechner        | audio | Vokal-Formant-Rechner (F1/F2-Frequenzen)         | audio-root
chorus-einstellungen         | audio | Chorus-Einstellungen-Guide (Rate/Depth/Mix)      | audio-root
phaser-lfo-rechner           | audio | Phaser-LFO-Rechner (Hz ↔ BPM-Sync)             | audio-root
flanger-rechner              | audio | Flanger-Rechner (Delay + Modulation)             | audio-root
loudness-gate-rechner        | audio | Loudness-Gate-Rechner (Hintergrundgeräusch)      | audio-root
vu-meter-rechner             | audio | VU-Meter-Rechner (VU ↔ dBFS Umrechnung)         | audio-root
audio-fade-rechner           | audio | Audio-Fade-Rechner (Dauer + Kurventyp)           | audio-root
mixed-reference-guide        | audio | Mixed-Reference-Guide (Referenz-Track-Analyse)   | audio-root
```

---

## Tier 19 — Niche-Suite (135 Tools, gemischte Enums, sortiert nach CPC × Vol)

**Enum-Status:** Nutzt ausschließlich bestehende 24 Enums. Keine weiteren Enum-Approvals nötig.
**SEO-Rationale:** Hohe Themen-Diversität. Finance-Nische (Immobilien €2+), Health-Nische, Lifestyle, Hobbyisten.
**Dispatch-Prio:** Masterplan Waves 23-25, Prios 655-789.

```
hauswert-schaetzung          | finance     | Hauswert-Schätzungs-Rechner                     | finance-root
immobilien-rendite           | finance     | Immobilien-Rendite-Rechner (Brutto/Netto)        | finance-root
mietpreisbremse-check        | finance     | Mietpreisbremse-Check (Ortsübliche Vergleichsmiete)| finance-root
kaution-rueckzahlung         | finance     | Kaution-Rückzahlungs-Rechner (Zinsen + Fristen)  | finance-root
nebenkosten-verteilung       | finance     | Nebenkosten-Verteilungs-Rechner (Betriebskosten) | finance-root
diabetes-blutzucker-check    | health      | Diabetes-Blutzucker-Check (Kategorisierung)      | health-root
herzerkrankungs-risiko-2     | health      | Herzerkrankungs-Risiko-Rechner (WHO-Modell)      | health-root
zahnersatz-kosten-2          | health      | Zahnersatz-Kosten-Planer (Festzuschuss + Bonus)  | health-root
krebs-vorsorge-guide         | health      | Krebs-Vorsorge-Guide (Alters-Screening-Plan)     | health-root
stroke-risiko-rechner-2      | health      | Schlaganfall-Risiko (ABCD²-Score)                | health-root
ernaehrungsplan-generator    | health      | Ernährungsplan-Generator (Woche + Kalorien)      | health-root
burnout-risiko-test-2        | health      | Burnout-Risiko-Test (Detailliert, 22 Fragen)     | health-root
stress-level-rechner-2       | health      | Stress-Level-Rechner (Detailliert, PSS-14)       | health-root
nahrungsmittel-naehrstoffe   | health      | Nahrungsmittel-Nährstoffe-Checker                | health-root
pollen-belastungs-check      | health      | Pollen-Belastungs-Check (Kalender + Region)      | health-root
allergie-saison-kalender     | health      | Allergie-Saison-Kalender (Pollenflug DE)         | health-root
schilddruesentest-rechner-2  | health      | Schilddrüsentest-Rechner (T3/T4/TSH-Einordnung) | health-root
blutfett-wert-checker        | health      | Blutfett-Wert-Checker (LDL/HDL/Triglyzheride)   | health-root
gicht-risiko-test            | health      | Gicht-Risiko-Test (Harnsäure + Ernährung)        | health-root
osteoporose-risiko           | health      | Osteoporose-Risiko-Rechner (FRAX-Screening)      | health-root
arthrose-risiko              | health      | Arthrose-Risiko-Rechner                          | health-root
hauttyp-test                 | health      | Hauttyp-Test (Fitzpatrick + Pflegebedarf)        | health-root
kontaktlinsen-typ-finder     | health      | Kontaktlinsen-Typ-Finder                         | health-root
zahnwechsel-plan-kind        | health      | Zahnwechsel-Plan-Kind (Milchzahn → Bleibend)     | health-root
sonnencreme-spf-rechner      | health      | Sonnencreme-SPF-Rechner (UV-Index + Hauttyp)     | health-root
medikamenten-dosierung       | health      | Medikamenten-Dosierungs-Rechner (Körpergewicht)  | health-root
haarwachstum-prognose        | health      | Haarwachstum-Prognose-Rechner (Biologie)         | health-root
narben-heilung               | health      | Narben-Heilungs-Zeitraum-Rechner                 | health-root
diabetes-risiko-rechner-2    | health      | Diabetes-Risiko-Rechner (FINDRISC-Score)         | health-root
heizkosten-rechner-2         | finance     | Heizkosten-Rechner (kWh × Brennstoffpreis)       | finance-root
stromkosten-jahres-rechner   | finance     | Stromkosten-Jahres-Rechner (kWh × ct/kWh)        | finance-root
solaranlage-amortisation     | finance     | Solaranlage-Amortisations-Rechner                | finance-root
waermedaemmung-kosten        | finance     | Wärmedämmung-Kosten-Rechner                      | finance-root
gas-jahresrechnung           | finance     | Gas-Jahresrechnung-Schätzer                      | finance-root
heizoel-prognose             | finance     | Heizöl-Prognose-Rechner (Bedarf + Kosten)        | finance-root
umzugskosten-rechner         | finance     | Umzugskosten-Rechner (km + m² + Etagen)          | finance-root
kleidergroessen-rechner      | text        | Kleidergrößen-Rechner (EU/US/UK/FR)              | text-root
schuhgroessen-rechner        | text        | Schuhgrößen-Rechner (EU ↔ US ↔ UK ↔ JP)         | text-root
social-media-bildformat      | image       | Social-Media-Bildformat-Guide (alle Plattformen) | image-root
youtube-thumbnail-format     | image       | YouTube-Thumbnail-Format-Rechner                 | image-root
pizza-teig-rechner           | volume      | Pizza-Teig-Rechner (Hydration/Hefe/Salz)         | volume-root
ringgroesse-rechner          | text        | Ringgrößen-Rechner (mm ↔ EU ↔ US ↔ UK)          | text-root
bh-groesse-rechner           | text        | BH-Größen-Rechner (Unterbrustumfang + Bustenweite)| text-root
garzeit-rechner              | time        | Garzeit-Rechner (Gewicht + Garmethode)           | time-root
hundejahre-rechner           | time        | Hundejahre-Rechner (Rasse × Alter)               | time-root
brot-skalierung              | volume      | Brot-Skalierungs-Rechner (Portionen + Backform)  | volume-root
katzenjahre-rechner          | time        | Katzenjahre-Rechner                              | time-root
instagram-bildformat         | image       | Instagram-Bildformat-Guide (Feed/Stories/Reels)  | image-root
fotobuch-seitenzahl          | image       | Fotobuch-Seitenzahl-Rechner                      | image-root
bildaufloesung-rechner       | image       | Bildauflösungs-Rechner (PPI + Druckformat)       | image-root
kaffee-ratio-rechner         | volume      | Kaffee-Ratio-Rechner (g/ml nach Brühmethode)     | volume-root
ofentemperatur-konverter     | temperature | Ofentemperatur-Konverter (Gas/Umluft/Ober-Unter) | temperature-root
banner-groessen-rechner      | image       | Banner-Größen-Rechner (Print + Digital)          | image-root
haarfarbe-mix-rechner        | color       | Haarfarbe-Misch-Rechner (Tonung + Oxidation)     | color-root
e-liquid-misch-rechner       | volume      | E-Liquid-Misch-Rechner (VG/PG + Nikotin)         | volume-root
massstab-rechner             | distance    | Maßstab-Rechner (1:50 / 1:100 Umrechnung)        | distance-root
papierformat-pixel-rechner   | image       | Papierformat-Pixel-Rechner (A4/A3 + DPI)         | image-root
rezept-portionierung         | text        | Rezept-Portionierungs-Rechner                    | text-root
bier-brauen-rechner          | volume      | Bier-Brauen-Rechner (IBU/OG/ABV/SRM)             | volume-root
windstaerke-beaufort         | science     | Windstärke-Beaufort-Umrechner                    | science-root
aquarium-volumen             | volume      | Aquarium-Volumen-Rechner                         | volume-root
pool-chlor-rechner           | volume      | Pool-Chlor-Rechner (l Pool → g Chlor)            | volume-root
twitch-overlay-format        | image       | Twitch-Overlay-Format-Guide                      | image-root
photo-belichtung-rechner     | image       | Foto-Belichtungs-Rechner (EV-Tabelle)            | image-root
leinwand-seitenverhaeltnis   | image       | Leinwand-Seitenverhältnis-Rechner                | image-root
tattoo-groessen-rechner      | image       | Tattoo-Größen-Rechner (cm² + Körperstelle)       | image-root
hautpflege-verbrauch         | health      | Hautpflege-Verbrauchs-Rechner (ml/Tag)           | health-root
bodenheizung-rechner         | construction| Bodenheizung-Rechner (W/m² + Hydraulik)          | construction-root
trockenbau-rechner           | construction| Trockenbau-Rechner (Platten + Profile)           | construction-root
mauerwerk-rechner            | construction| Mauerwerk-Rechner (Steine + Mörtel)              | construction-root
fenster-groesse-rechner      | construction| Fenster-Größen-Rechner (Glasfläche + Lüftung)    | construction-root
bodenbelag-rechner           | construction| Bodenbelag-Rechner (m² + Verschnitt)             | construction-root
tuer-einbau-rechner          | construction| Tür-Einbau-Rechner (Lichtmaß + Zarge)            | construction-root
kamin-schornstein-rechner    | construction| Kamin-Schornstein-Rechner (Querschnitt + Höhe)   | construction-root
dachrinne-rechner            | construction| Dachrinne-Rechner (Dachfläche → Rinnenquerschnitt)| construction-root
dach-wasser-rechner          | construction| Dach-Wasser-Rechner (Regen l/m² → Abfluss)      | construction-root
betonsockel-rechner          | construction| Betonsockel-Rechner (m³ + Bewehrung)             | construction-root
trocknungszeit-rechner       | construction| Trocknungszeit-Rechner (Estrich/Putz/Beton)      | construction-root
decken-anstrich-rechner      | construction| Decken-Anstrich-Rechner (m² + Anstriche)         | construction-root
photovoltaik-anlage-rechner  | science     | Photovoltaik-Anlage-Rechner (kWp + Dachfläche)  | science-root
waermepumpe-rechner          | science     | Wärmepumpe-Rechner (COP + Jahresarbeitszahl)     | science-root
cocktail-ratio-rechner       | volume      | Cocktail-Ratio-Rechner (cl-Anteile)              | volume-root
parfum-dosier-rechner        | volume      | Parfüm-Dosier-Rechner (ml + Duftkonzentration)   | volume-root
kosmetik-mix-rechner         | volume      | Kosmetik-Misch-Rechner (INCI-Anteile)            | volume-root
foto-bilderrahmen-rechner    | image       | Foto-Bilderrahmen-Rechner (Passpartout)          | image-root
co2-kompensation-rechner     | science     | CO2-Kompensations-Rechner (Reise + Bäume)        | science-root
energie-batterie-rechner     | science     | Energie-Batterie-Rechner (kWh + Entladetiefe)    | science-root
discord-bildformat           | image       | Discord-Bildformat-Guide (Avatar/Banner/Emoji)   | image-root
wohnung-qm-rechner           | area        | Wohnungs-m²-Rechner (Grundriss-Flächen)          | area-root
twitter-bildformat           | image       | Twitter/X-Bildformat-Guide                       | image-root
garn-lauflaenge-rechner      | length      | Garn-Lauflängen-Rechner (g + m/100g)             | length-root
strick-nadelstaerke          | text        | Strick-Nadelstärke-Guide (Garn-Gewicht)          | text-root
nagellack-mix-rechner        | color       | Nagellack-Misch-Rechner (Farb-Kombination)       | color-root
hautton-foundation-finder    | color       | Hautton-Foundation-Finder (Undertone)            | color-root
wasserverbrauch-rechner      | volume      | Wasserverbrauch-Rechner (Haushalt m³/Jahr)       | volume-root
holzpellets-rechner          | volume      | Holzpellets-Rechner (kWh → kg → m³)              | volume-root
teich-pumpe-rechner          | volume      | Teich-Pumpe-Rechner (l/h für Teichgröße)         | volume-root
bier-ibu-rechner             | volume      | Bier-IBU-Rechner (Hopfen-Bitternheit)            | volume-root
whisky-verdueunnung          | volume      | Whisky-Verdünnungs-Rechner (Cask-Strength → %)   | volume-root
fermentation-rechner         | volume      | Fermentation-Rechner (Zucker → Alkohol/CO2)      | volume-root
zuckersaft-konzentration     | volume      | Zuckersaft-Konzentrations-Rechner (Brix)         | volume-root
zisterne-volumen-rechner     | volume      | Zisterne-Volumen-Rechner (Zylindrisch/Quader)    | volume-root
kartons-anzahl-rechner       | volume      | Karton-Anzahl-Rechner (m³ Umzug)                 | volume-root
hutgroesse-rechner           | text        | Hutgrößen-Rechner (Kopfumfang cm → EU)           | text-root
modellbau-massstab           | distance    | Modellbau-Maßstab-Rechner (1:87/1:160 etc.)      | distance-root
lager-flaeche-rechner        | area        | Lager-Flächen-Rechner (Palettenplätze)           | area-root
gesichtsform-haarschnitt     | text        | Gesichtsform-Haarschnitt-Guide                   | text-root
make-up-pinsel-guide         | text        | Make-up-Pinsel-Guide (Form + Funktion)           | text-root
co2-bilanz-flugreise         | science     | CO2-Bilanz-Flugreise-Rechner                     | science-root
innenraum-co2-monitor        | science     | Innenraum-CO2-Monitor-Guide (ppm + Lüftung)      | science-root
luftqualitaet-rechner        | science     | Luftqualität-Rechner (AQI-Kategorien)            | science-root
drainage-rechner             | engineering | Drainage-Rechner (Rohrquerschnitt + Gefälle)     | engineering-root
sanitaer-rohre-rechner       | engineering | Sanitär-Rohre-Rechner (DN-Norm + Durchfluss)     | engineering-root
abwasser-rohre-rechner       | engineering | Abwasser-Rohre-Rechner (Gefälle + DN)            | engineering-root
grauwasser-rechner           | science     | Grauwasser-Rechner (Badezimmer-Wiederverwendung) | science-root
sickerschacht-rechner        | science     | Sickerschacht-Rechner (l/s + Versickerungsrate)  | science-root
nagelgroesse-rechner         | engineering | Nagelgröße-Rechner (Materialdicke → Nagellänge)  | engineering-root
kettensaege-kette-rechner    | engineering | Kettensägen-Kette-Rechner (Schwertlänge + Pitch) | engineering-root
bohrmaschinen-bit-rechner    | engineering | Bohrmaschinen-Bit-Rechner (Material + Durchm.)   | engineering-root
holzverbindungen-rechner     | engineering | Holzverbindungen-Rechner (Zapfen/Nut/Dübel)      | engineering-root
schleifpapier-koernung       | engineering | Schleifpapier-Körnung-Guide (FEPA + CAMI)        | engineering-root
silikon-fuge-rechner         | engineering | Silikon-Fugen-Rechner (m + Fugenprofil → ml)     | engineering-root
edelstahl-gewicht-rechner    | engineering | Edelstahl-Gewicht-Rechner (Profil + Länge → kg)  | engineering-root
aluminium-profil-rechner     | engineering | Aluminium-Profil-Rechner (Systemprofile)         | engineering-root
glas-gewicht-rechner         | engineering | Glas-Gewicht-Rechner (m² + Stärke → kg)          | engineering-root
kleber-festigkeit-rechner    | engineering | Kleber-Festigkeits-Rechner (Klebefläche + N)     | engineering-root
dichtmittel-rechner          | engineering | Dichtmittel-Rechner (Fugenlänge → ml)            | engineering-root
messing-kupfer-rechner       | engineering | Messing/Kupfer-Legierungs-Rechner                | engineering-root
grundierung-schichtdicke     | engineering | Grundierungs-Schichtdicken-Rechner               | engineering-root
brauwasser-rechner           | volume      | Brauwasser-Rechner (Hauptguss + Nachguss)        | volume-root
zahnfleisch-rechner          | health      | Zahnfleisch-Gesundheits-Rechner (Taschentiefe)   | health-root
knochen-kalzium-rechner      | health      | Knochen-Kalzium-Rechner (Tagesbedarf)            | health-root
schlafqualitaet-index-2      | health      | Schlafqualität-Index (Ausführlich, PSQI-Komplett)| health-root
intermittierendes-fasten-2   | health      | Intermittierendes-Fasten-2 (Kalorienplan + Timer)| health-root
allergen-datenbank           | health      | Allergen-Datenbank-Suche (Top-14 EU-Lebensmittel)| health-root
```

---

## Rejected — Out-of-Scope (Hard-Cap-Blocker, nicht bauen)

**Regel.** Diese Tool-Klassen werden **kategorisch nicht** gebaut. Unabhängig von User-Wunsch, weil sie Non-Negotiables aus [CLAUDE.md §18](../../CLAUDE.md) verletzen. User kann entfernen — dann Dokumentation, warum Non-Negotiable überschrieben wird.

### R1 — Live-Marktdaten (verletzt „keine Network-Runtime-Deps" §7)

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `aktienkurs-live` | 800er #537 | Live-Marktdaten via API — pure-client unmöglich, Rate-Limits. |
| `krypto-preis-live` | 800er #543 | Wie Aktien — keine Live-API. |
| `wechselkurs-live` | 800er #551 | ECB-API wäre möglich, aber Runtime-Dep. Alternative: Tool mit manuellem Kurs-Input erlaubt. |
| `sprit-preise` | 800er #767 | Tankerkönig-API = Runtime-Dep. |
| `fluginfo-live` | 800er #774 | FlightAware-API = Runtime-Dep. |
| `wetter-live` | 800er #813 | OpenWeather-API = Runtime-Dep. |

### R2 — Pseudo-Wissenschaft (verletzt Brand-Trust + AdSense-Policy-Risiko)

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `numerologie-lebenszahl` | 641-700er | Mathematisch trivial, aber esoterische Deutung = Pseudo. |
| `persoenliches-horoskop` | 641-700er | Astrologische „Vorhersage" = Pseudo. Lookup-Tool (Datum → Sternzeichen) in Tier 6 okay. |
| `mayakalender-prognose` | 641-700er | Wahrsagerei — nicht Lookup. |
| `bach-blueten-auswahl` | 641-700er | Alternativmedizin-Pseudo. |
| `engel-zahlen` | 641-700er | Esoterik. |
| `kompatibilitaets-numerologie` | 641-700er | Partner-Namens-Summen-Pseudo. |
| `aszendent-rechner` | 641-700er | Grenzfall — Datum+Uhrzeit+Ort → Astrologische Deutung. Raus. |

### R3 — Medizinische Behandlungs-Tools (verletzt Privacy-First + juristisches Risiko)

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `insulin-korrektur` | 471-530er | Dosierungs-Tool → Patientensicherheit. Fehler potenziell lebensbedrohlich. |
| `medikamenten-dosierung-kg` | 471-530er | Pädiatrische Dosierung nach Gewicht → Arzt only. |
| `apgar-score-neonatologie` | 471-530er | Neonatale Klinik-Bewertung → keine Laien. |
| `gfr-interpretation` | 471-530er | Rechnen okay (auch in PL-4 nicht). Interpretation = Arzt-Advice. |
| `krebs-risiko-score-gail` | 471-530er | Gail-Modell braucht Klinik-Kontext + Familienanamnese. |
| `phq-9-depression` | 471-530er | Psychiatric Scale ohne klinisches Setting → Schaden-Risiko. |
| `gad-7-angststoerung` | 471-530er | Siehe PHQ-9. |
| `chemo-dosierung-flaeche` | 471-530er | Onkologie-Dosierung. |
| `taucher-deko-tabelle` | 581-640er | Lebensgefährlich bei Fehlnutzung (Dekompressionskrankheit). |

### R4 — Copyright-sensitiv

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `plagiat-checker` | 200er + 800er | DB-Abgleich = Server-Side oder externe API. Beides raus. |
| `lyrics-finder` | 800er #694 | Songtext-Datenbank = Copyright. |
| `youtube-zu-mp3` | Phase-1-Ziele §9 | Rechtlich heikel (ToS-Bruch), auch pure-client. |
| `stream-ripper` | Phase-1-Ziele §9 | Wie YouTube-zu-MP3. |
| `e-book-drm-entferner` | 800er-Niche | Copyright. |

### R5 — Security-Dual-Use

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `port-scanner` | 411-470er Niche | Dual-Use → Missbrauch. |
| `password-cracker` | 411-470er Niche | Dual-Use. |
| `exploit-lookup` | 411-470er Niche | Dual-Use. |
| `ip-geolocation-tracker` | 411-470er Niche | Privacy-Risiko + Dual-Use. |
| `whois-scanner-live` | 411-470er | Live-API + Privacy-Grauzone. |

### R6 — Server-seitige Datei-Manipulation (verletzt privacy-first + Cloud-Kosten)

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `pdf-editor-voll` | 800er #492 | Volle PDF-Edit braucht Server-Parser (PDF.js geht nur für Display/simple Ops). |
| `video-transcoder-full` | 800er #958 | Langer CPU-Job — pure-client geht nur für kurze Clips (siehe hevc-zu-h264 §2.4 Limits). |
| `ocr-massen` | 800er #497 | Tesseract-WASM okay für einzelne Bilder; Batch-OCR = Server-Kosten. |

### R7 — Regulierte Glücksspiel-Tools (DACH-Glücksspielregulierung)

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `poker-odds-rechner` | 581-640er | Glücksspiel-Werkzeug — DACH-Regulierung heikel. |
| `sportwetten-odds-konverter` | 581-640er | Wett-Regulierung. |
| `lotto-gewinnchance-rechner` | 641-700er | Formal Mathematik, praktisch Glücksspiel-Nähe. Grenzfall — erstmal raus, später review. |

### R8 — Live-Social-Media-API (proprietär)

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `instagram-follower-tracker` | 701-750er | IG-API erfordert Business-Auth + Rate-Limits. |
| `hashtag-ranking-live` | 701-750er | Braucht Live-Index. |
| `engagement-history-analyse` | 701-750er | Historical Data = API-Zugang. |
| `twitter-x-scheduler` | 701-750er | Posting-Tool = Auth + Server. |

### R9 — Unseriös/Low-Value-Content

| Slug-Kandidat | User-# | Reason |
|---|---|---|
| `nickname-generator-fake` | Niche | Fake-Identity-Tool → Abuse-Risiko (Social Engineering). |
| `fake-ausweis-generator` | Niche | Identitätsfälschung — illegal. |
| `zufalls-luegen-generator` | Niche | Low-Value, schadet Brand. |

---

## Summary-Tabelle (Stand 2026-04-23)

| Tier/Section | Count | Status |
|---|---:|---|
| Already-built (Frontmatter-Skip) | ~42 | ✅ Live |
| **Tier F — Finance-Suite** | **15** | **🟢 Dispatch-ready (enum `finance` live 2026-04-23)** |
| **Tier C — Construction-Suite** | **15** | **🟢 Dispatch-ready (enum `construction` live 2026-04-23)** |
| Tier 1 — Template-Lock | 9 | 🟢 Dispatch-ready |
| Tier 2 — Cluster-Scaling | 21 | 🟢 Dispatch-ready |
| Tier 3 — Converter-Scaling | 23 | 🟢 Dispatch-ready |
| Tier 4 — IT/Web Mass-Build | 25 | 🟢 Dispatch-ready |
| Tier 5 — Marketing/SEO | 10 | 🟢 Dispatch-ready |
| Tier 6 — Text-Krypto/Kultur | 10 | 🟢 Dispatch-ready |
| Tier 7 — Math-Basis als text/dev | 5 | 🟢 Dispatch-ready |
| Tier 8 — Zusatz-Converter | 28 | 🟢 Dispatch-ready (inkl. 8f Video-BG + 8g Sprache-Verbessern) |
| Tier 9 — Psychologie/Kognition/Wellness | 79 | 🟡 Enum-Ext-Ticket pending (6 neue Enums) |
| **Tier 10 — Health-Suite** | **71** | **🟢 Dispatch-ready (enum `health` live 2026-04-23)** |
| **Tier 11 — Math-Suite** | **76** | **🟢 Dispatch-ready (enum `math` live 2026-04-23)** |
| **Tier 12 — Automotive-Suite** | **50** | **🟢 Dispatch-ready (enum `automotive` live 2026-04-23)** |
| **Tier 13 — Sport-Suite** | **60** | **🟢 Dispatch-ready (enum `sport` live 2026-04-23)** |
| **Tier 14 — Science-Suite** | **61** | **🟢 Dispatch-ready (enum `science` live 2026-04-23)** |
| **Tier 15 — Engineering-Suite** | **50** | **🟢 Dispatch-ready (enum `engineering` live 2026-04-23)** |
| **Tier 16 — Education-Suite** | **50** | **🟢 Dispatch-ready (enum `education` live 2026-04-23)** |
| **Tier 17 — Agriculture-Suite** | **50** | **🟢 Dispatch-ready (enum `agriculture` live 2026-04-23)** |
| **Tier 18 — AV-Suite** | **47** | **🟢 Dispatch-ready (Enums `audio`/`video` bestehen)** |
| **Tier 19 — Niche-Suite** | **135** | **🟢 Dispatch-ready (nur bestehende 24 Enums)** |
| **Subtotal Dispatch-ready (TF+TC+T1–T8, T10–T19)** | **736** | — |
| **Subtotal inkl. Tier 9 (nach Enum-Approval)** | **815** | — |
| Rejected (Hard-Cap) | ~40 | 🔴 Nicht bauen |

**Dispatch-Reihenfolge.** Verbindliche Priorität: `docs/superpowers/plans/2026-04-23-tool-priority-masterplan.md`. SEO+Revenue-optimiert: Wave 0 (ML) → Tier F (Finance, €2-5 CPC) → Wave PDF → Tier C (Construction) → Wave 4 (Quick-wins) → Tier 10 (Health, €1.80-2.50 CPC) → Tier 11 (Math) → Tier 12 (Automotive) → … → Tier 19 (Niche).

**Build-Throughput-Projektion.** 736 Dispatch-ready-Kandidaten. Bei ∅ 3h/Tool + 8h/Tag = ~2-3 Tools/Tag = **~250 Tage bei Einzel-Agent** oder **~50 Tage bei 5 parallelen Agents**. Masterplan-Prios 1-789 sind vollständig befüllt.

**Enum-Status: ABGESCHLOSSEN.** Alle 24 Enums in `categories.ts` live (2026-04-23). Tier 9 (Psychologie) wartet noch auf eigene 6 Enums (`persoenlichkeit`, `kognition`, `gesundheit-wellness`, `lernen`, `spass`, `sinne`) — separates Approval-Ticket.

---

## Auto-Refill-Log (wird vom CEO appended)

```
<ISO-timestamp> | ticket=<KON-id> | slug=<slug> | in_flight=<count> | reject_rate_10=<ratio>
```
