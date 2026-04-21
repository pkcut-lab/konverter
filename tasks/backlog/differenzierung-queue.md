---
queue_name: differenzierung
queue_version: 1
created: 2026-04-21
maintainer: ceo-agent (auto-refill §6) + user (manual-append)
ordering: top-of-file = next-to-dispatch (FIFO — älteste zuerst)
hard_cap_in_flight: 10
hard_cap_per_heartbeat: 3
pause_threshold_critic_reject_rate_rolling_10: 0.20
enum_source: src/lib/tools/categories.ts (14 values: length, weight, area, volume, distance, temperature, image, video, audio, document, text, dev, color, time)
note: >-
  User-Directive Patch 5 erwähnte „14-Category-Enum" mit speed/data/pressure/
  energy/power/fuel/angle/currency. Diese Slugs existieren NICHT in der
  aktuellen TOOL_CATEGORIES-Definition. Dieser Queue-Seed hält sich an den
  realen Enum (7 Converter-Kategorien: length, weight, area, volume, distance,
  temperature, time). Enum-Extension ist ein späterer User-Decision-Ticket;
  solange nicht erweitert → nicht queue-relevant (sonst Zod-Fail bei Content-
  Collection-Build).
---

# Differenzierungs-Queue — Converter-Familie

**Purpose.** Auto-Refill-Backlog für CEO §6. Wenn active queue leer + Tripwires
green → CEO picked die nächsten N (max 3) Tickets von hier, schreibt
`tasks/current_task.md`, dispatcht Researcher + Builder + Critic.

**Format pro Zeile.** `<slug> | <category> | <de-label> | <parent_hint>`

- `parent_hint` zeigt auf Category-Root-Dossier (`dossiers/_categories/<cat>/*.md`).
- Wenn Root fehlt/stale → Researcher baut ihn zuerst (HEARTBEAT.md §3 Parent-Check).

**Dedup-Regel.** Tools, die bereits in `src/content/tools/<slug>/de.md` liegen,
werden vor Dispatch ausgefiltert (CEO Step 9 Backlog-Pick): aktuell **already-built**
(skip) = `celsius-zu-fahrenheit, hevc-zu-h264, hintergrund-entfernen,
kilogramm-zu-pfund, kilometer-zu-meilen, meter-zu-fuss, quadratmeter-zu-
quadratfuss, webp-konverter, zentimeter-zu-zoll`.

---

## Queue (FIFO top→bottom — Phase-1-Katalog §7 Session-Reihenfolge)

**Priorisierung.** Neu-Tool-Typen (Template-Lock) zuerst, dann Converter-
Scaling. Rationale: lockt neue Svelte-Component-Templates (Calculator,
Generator, Formatter, Validator, Analyzer, Comparer), sodass Phase 1b
Cluster-Scaling schnell parallelisieren kann. Quelle: `docs/superpowers/
plans/2026-04-20-phase-1-tool-catalog.md` §7 + §2 Score-Framework.

### Tier 1 — Template-Lock (9 Tool-Typen validieren)

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

### Tier 2 — Cluster-Scaling (enum-kompatible Phase-1-Kandidaten)

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

### Tier 3 — Converter-Scaling (20 Varianten, length/weight/area/volume/temp/time)

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

## Parking-Lot (Enum-Extension nötig — nicht dispatch-fähig)

Diese Slugs sind interessant, aber ihre Kategorien fehlen in `TOOL_CATEGORIES`.
`CATEGORY_TTL.md` §2 macht Enum-Extension explizit zu einem **User-Approval-
Ticket** (nicht agent-autonom). Erst nach Approval wandern sie in Tier 1/2 hoch.

**Kandidaten aus Phase-1-Katalog (13 Tools):**
```
ps-zu-kw                     | power       | PS zu Kilowatt (Score 46)
prozentrechner               | math        | Prozentrechner (Score 47, DE-Top-1)
bmi-rechner                  | math        | BMI-Rechner (Score 46)
dreisatzrechner              | math        | Dreisatz-Rechner (Score 45)
mehrwertsteuer-rechner       | finance     | Mehrwertsteuer-Rechner (Score 44)
zinseszinsrechner            | finance     | Zinseszins-Rechner (Score 40)
brutto-netto-rechner         | finance     | Brutto-Netto-Rechner (Score 38)
iban-pruefer                 | finance     | IBAN-Prüfer (Score 44)
ust-id-pruefer               | finance     | USt-ID-Prüfer (Score 43, White-Space)
altersrechner                | math        | Alters-Rechner (Interactive)
arbeitszeitrechner           | math        | Arbeitszeit-Rechner (Interactive)
eisprungrechner              | math        | Eisprung-Rechner (Interactive, Privacy-USP)
persoenlichkeitstest-16      | math        | 16-Persönlichkeiten (Interactive-Anchor)
```

**Weitere Converter-Kategorien (aus initialem Queue-Seed):**
```
kmh-zu-mph                   | speed       | Kilometer/h zu Meilen/h
knoten-zu-kmh                | speed       | Knoten zu Kilometer/h
gigabyte-zu-gibibyte         | data        | Gigabyte zu Gibibyte
megabit-zu-megabyte          | data        | Megabit zu Megabyte
bar-zu-psi                   | pressure    | Bar zu PSI
kalorien-zu-joule            | energy      | Kalorien zu Joule
liter-pro-100km-zu-mpg       | fuel        | l/100km zu Miles-per-Gallon
grad-zu-radiant              | angle       | Grad zu Radiant
euro-zu-dollar               | currency    | Euro zu Dollar (Phase 3+)
```

## Auto-Refill-Log (wird vom CEO appended)

```
<ISO-timestamp> | ticket=<KON-id> | slug=<slug> | in_flight=<count> | reject_rate_10=<ratio>
```
