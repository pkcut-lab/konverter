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
enum_source: src/lib/tools/categories.ts (14 values: length, weight, area, volume, distance, temperature, image, video, audio, document, text, dev, color, time)
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
total_tier_1_to_8: 122
total_tier_9_psychology: 79
total_parking_lot: ~90 (enum-ext-blocked)
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
heic-zu-jpg                  | image       | HEIC zu JPG Konverter         | image-root
pdf-zu-jpg                   | document    | PDF zu JPG Konverter          | document-root
jpg-zu-pdf                   | document    | JPG zu PDF Konverter          | document-root
json-zu-csv                  | dev         | JSON zu CSV Konverter         | dev-root
```

---

## Tier 3 — Converter-Scaling (20 Varianten length/weight/area/volume/temp/time)

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
woerterzaehler               | text        | Wörterzähler                  | text-root
```

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

## Parking-Lot — Enum-Extension nötig (User-Approval-Ticket)

**Regel.** [CATEGORY_TTL.md §2](../../docs/paperclip/CATEGORY_TTL.md) macht Enum-Extension explizit zu einem **User-Approval-Ticket** (nicht agent-autonom). Erst nach Approval wandern Tools von hier in Tier 1–8 hoch. Gruppiert nach Ziel-Enum.

### PL-1 — Ziel: `math` (Phase-3-Batch-Kandidat, hohe Priorität)

```
prozentrechner               | math        | Prozentrechner (DE-Top-1)
bmi-rechner                  | math        | BMI-Rechner
dreisatzrechner              | math        | Dreisatz-Rechner
altersrechner                | math        | Alters-Rechner
arbeitszeitrechner           | math        | Arbeitszeit-Rechner
eisprungrechner              | math        | Eisprung-Rechner (Privacy-USP)
persoenlichkeitstest-16      | math        | 16-Persönlichkeiten-Test
matrix-determinante          | math        | Matrix-Determinante
matrix-inversion             | math        | Matrix-Inversion (2x2/3x3)
vektor-kreuzprodukt          | math        | Vektor-Kreuzprodukt
vektor-skalarprodukt         | math        | Vektor-Skalarprodukt
gleichungsloeser-2x2         | math        | Lineares 2x2-Gleichungssystem
gleichungsloeser-3x3         | math        | Lineares 3x3-Gleichungssystem
standardabweichung-rechner   | math        | Standardabweichung/Varianz
korrelations-rechner         | math        | Pearson-Korrelation
komplexe-zahlen-rechner      | math        | Komplexe Zahlen (a+bi)
logarithmus-rechner          | math        | Logarithmus-Rechner
fibonacci-generator          | math        | Fibonacci-Folge
primzahl-tester              | math        | Primzahl-Tester
ggt-kgv-rechner              | math        | GGT/KGV-Rechner
trigonometrie-rechner        | math        | Sin/Cos/Tan-Rechner
```

### PL-2 — Ziel: `finance` (Phase-3-Batch-Kandidat, TOP-CPM)

```
zinseszinsrechner            | finance     | Zinseszins-Rechner
brutto-netto-rechner         | finance     | Brutto-Netto-Rechner
mehrwertsteuer-rechner       | finance     | Mehrwertsteuer-Rechner
iban-pruefer                 | finance     | IBAN-Prüfer
ust-id-pruefer               | finance     | USt-ID-Prüfer
erbschaftsteuer-rechner      | finance     | Erbschaftsteuer-Rechner (DE)
dienstwagen-rechner          | finance     | Dienstwagen 1%-Regel
bafoeg-rechner               | finance     | BAföG-Rechner
rentenbeitrag-rechner        | finance     | Rentenbeitrag-Rechner
elterngeld-rechner           | finance     | Elterngeld-Rechner
kurzarbeitergeld-rechner     | finance     | Kurzarbeitergeld-Rechner
abfindungs-rechner           | finance     | Abfindung (Fünftel-Regelung)
grunderwerbsteuer-rechner    | finance     | Grunderwerbsteuer (Bundesland)
kfz-steuer-rechner           | finance     | KFZ-Steuer (BJ + CO2)
etf-sparplan-rechner         | finance     | ETF-Sparplan-Rechner
entnahmeplan-4prozent        | finance     | 4%-Entnahmeregel
tilgungs-rechner             | finance     | Tilgungs-/Annuitäten-Rechner
```

### PL-3 — Ziel: `construction` (Phase-3-Batch-Kandidat, DIY-SEO)

```
fliesen-rechner              | construction| Fliesen-Bedarf
beton-rechner                | construction| Beton-Volumen + Mischverhältnis
photovoltaik-ertrag          | construction| PV-Ertrag (kWh/Jahr)
dachneigung-rechner          | construction| Dachneigung/Dachfläche
tapeten-rechner              | construction| Tapeten-Bedarf
farbverbrauch-rechner        | construction| Farbverbrauch (Liter/m²)
treppensteigung-rechner      | construction| Treppen-Steigungsverhältnis
u-wert-rechner               | construction| U-Wert/Dämmstärke
heizlast-rechner             | construction| Heizlast-Rechner (kWh/m²)
heizkoerper-dimensionierung  | construction| Heizkörper-Watt-Bedarf
```

### PL-4 — Ziel: `health` / `medical` (Phase-3, Disclaimer-Pflicht)

**Policy.** Nur Screening-Charakter. Arzt-Dosierungs-/Klinik-Scores → Rejected §R3. Disclaimer sichtbar oberhalb Ergebnis-Panel (CONTENT.md §14 neu nach Approval).

```
kalorienbedarf-rechner       | health      | Kalorienbedarf (Harris-Benedict)
grundumsatz-rechner          | health      | Grundumsatz (Mifflin-St-Jeor)
koerperfett-navy             | health      | Körperfett (Navy-Formel)
wasserbedarf-rechner         | health      | Wasserbedarf-Rechner
puls-zonen-rechner           | health      | Puls-Zonen (220-Alter)
schwangerschaftswoche-rechner| health      | SSW aus letzter Periode
schlafzyklus-rechner         | health      | Schlafzyklus (90min)
vo2max-rechner               | health      | VO2max-Schätzer (Cooper-Test)
taille-huefte-verhaeltnis    | health      | Taille-Hüfte-Quotient
schrittlaenge-rechner        | health      | Schrittlänge aus Körpergröße
```

### PL-5 — Ziel: `marketing` (optional — Phase-3 alt: in `text`)

```
youtube-cpm-schaetzer        | marketing   | YouTube-CPM-Schätzer
twitch-revenue-schaetzer     | marketing   | Twitch-Sub-Revenue
instagram-reichweiten-index  | marketing   | IG-Reichweiten-Schätzung
```

### PL-6 — Ziel: `science` (Physik+Chemie kombiniert — Phase-3/4)

```
ohmsches-gesetz              | science     | Ohmsches Gesetz (U=R·I)
molmassen-rechner            | science     | Molmassen-Rechner
ph-rechner                   | science     | pH-Rechner
kinetische-energie-rechner   | science     | Ekin = ½mv²
fallhoehe-rechner            | science     | Freier Fall (v = √2gh)
gasgesetz-rechner            | science     | pV=nRT
photonen-energie-rechner     | science     | E = hf
molaritaet-rechner           | science     | Molarität/Verdünnung
radioaktiver-zerfall         | science     | Halbwertszeit-Rechner
```

### PL-7 — Ziel: `automotive` (Phase-4)

```
elektroauto-reichweite       | automotive  | E-Auto-Reichweite
ladezeit-rechner             | automotive  | EV-Ladezeit (Wh/kW)
spritverbrauch-rechner       | automotive  | l/100km ↔ mpg
reifen-durchmesser-rechner   | automotive  | Reifen-Size-Konverter
flug-co2-rechner             | automotive  | Flug-CO2-Fußabdruck
```

### PL-8 — Ziel: `sport` (Phase-4, breiter Catchall)

```
pace-rechner                 | sport       | Pace (min/km ↔ km/h)
dart-checkout                | sport       | Dart-Checkout (X01)
schach-elo-rechner           | sport       | Schach-Elo-Rechner
golf-handicap-rechner        | sport       | Golf-Handicap
modellbau-massstab           | sport       | Modellbau-Maßstabs-Konverter
```

### PL-9 — Ziel: `education` / `academic` (Phase-3)

```
notenschnitt-rechner         | education   | Notenschnitt (Abitur DE)
abitur-punkte-rechner        | education   | Abi-Punkte (0–15 ↔ 1–6)
gpa-konverter                | education   | GPA (DE ↔ US)
klausur-notwendig-rechner    | education   | „Was brauch ich in der Klausur"
ects-rechner                 | education   | ECTS-Punkte
```

### PL-10 — Ziel: `agriculture` / `environment` (Phase-4)

```
co2-fussabdruck-rechner      | environment | CO2-Fußabdruck (Flug/Heiz/Essen)
duengerbedarf-rechner        | agriculture | Düngerbedarf (NPK)
regenmenge-rechner           | environment | Regenmenge (l/m² ↔ mm)
saatgut-bedarf-rechner       | agriculture | Saatgut-Bedarf (kg/ha)
```

### PL-11 — Converter-Einheiten (ursprüngliche Parking-Lot-Einträge)

```
kmh-zu-mph                   | speed       | Kilometer/h zu Meilen/h
knoten-zu-kmh                | speed       | Knoten zu Kilometer/h
gigabyte-zu-gibibyte         | data        | Gigabyte zu Gibibyte
megabit-zu-megabyte          | data        | Megabit zu Megabyte
bar-zu-psi                   | pressure    | Bar zu PSI
kalorien-zu-joule            | energy      | Kalorien zu Joule
liter-pro-100km-zu-mpg       | fuel        | l/100km zu Miles-per-Gallon
grad-zu-radiant              | angle       | Grad zu Radiant
ps-zu-kw                     | power       | PS zu Kilowatt
euro-zu-dollar               | currency    | Euro zu Dollar (Phase 3+)
```

### PL-12 — Kuriose/Niche (Phase-4/5, `niche` oder spezifisch)

```
pizza-teig-rechner           | niche       | Pizza-Teig (Hydration/Hefe/Salz)
brauen-rechner               | niche       | Bier brauen (IBU/OG/ABV/SRM)
whisky-verduennung-rechner   | niche       | Whisky-Verdünnung (Cask-Strength)
aquarium-liter-rechner       | niche       | Aquarium-Volumen
foto-belichtungs-rechner     | niche       | Belichtungs-Reziproken
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

## Summary-Tabelle (Stand 2026-04-21)

| Tier/Section | Count | Status |
|---|---:|---|
| Already-built (Frontmatter-Skip) | 9 | ✅ Live |
| Tier 1 — Template-Lock | 9 | 🟢 Dispatch-ready |
| Tier 2 — Cluster-Scaling | 18 | 🟢 Dispatch-ready |
| Tier 3 — Converter-Scaling | 20 | 🟢 Dispatch-ready |
| Tier 4 — IT/Web Mass-Build | 25 | 🟢 Dispatch-ready |
| Tier 5 — Marketing/SEO | 10 | 🟢 Dispatch-ready |
| Tier 6 — Text-Krypto/Kultur | 10 | 🟢 Dispatch-ready |
| Tier 7 — Math-Basis als text/dev | 5 | 🟢 Dispatch-ready |
| Tier 8 — Zusatz-Converter | 25 | 🟢 Dispatch-ready |
| Tier 9 — Psychologie/Kognition/Wellness | 79 | 🟡 Enum-Ext-Ticket pending (6 neue Enums) |
| **Subtotal Dispatch-ready (T1–T8)** | **122** | — |
| **Subtotal inkl. Tier 9 (nach Enum-Approval)** | **201** | — |
| Parking-Lot (enum-ext blocked) | ~90 | 🟠 User-Approval pending |
| Rejected (Hard-Cap) | ~40 | 🔴 Nicht bauen |

**Build-Throughput-Projektion.** Bei Heartbeat-5min + max_per_heartbeat=3 + ∅ 3h/Tool + Nacht-Batch erreicht der CEO-Agent theoretisch ~15–25 Tools/Tag. 122 Tier-1-bis-8-Kandidaten reichen damit für **~7 Tage bei Full-Throttle** oder **~3 Wochen bei moderatem Tempo** (mit Critic-Reject-Puffer + Heartbeat-Warmup).

**Danach.** Enum-Extension-Entscheidung (D6 in 800er-Analysis) unlockt ~90 weitere Tools + 79 Psychologie-Tools (Tier 9) → gesamt ~290 baubar bis zum Out-of-Scope-Hard-Cap.

---

## Auto-Refill-Log (wird vom CEO appended)

```
<ISO-timestamp> | ticket=<KON-id> | slug=<slug> | in_flight=<count> | reject_rate_10=<ratio>
```
