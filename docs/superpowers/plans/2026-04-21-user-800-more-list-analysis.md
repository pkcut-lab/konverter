---
title: User-Liste #201–1000 — Cluster-Analyse & Skalierungs-Strategie
status: Draft
created: 2026-04-21
input: User-Liste mit weiteren 800 Tools (15 Themenblöcke, Nr. 201–1000)
companion_to: 2026-04-21-user-200-list-analysis.md
scope: Cluster-Level statt Per-Tool (800 × Per-Tool-Mapping wäre ~3000 Zeilen)
---

# User-Liste #201–1000 — Cluster-Analyse & Skalierungs-Strategie

**Kontext.** Die ersten 200 Tools sind in [2026-04-21-user-200-list-analysis.md](./2026-04-21-user-200-list-analysis.md) Tool-für-Tool gemappt. Für die nächsten 800 wechsle ich auf **Cluster-Granularität** — pro Themenblock eine Triage-Tabelle, eine Priorisierungs-Empfehlung, Enum-Gap-Flag und Out-of-Scope-Ausschlüsse. Die Einzel-Slug-Liste bleibt der Rohstoff; gebaut wird aus Batches, die der CEO-Agent aus `tasks/backlog/differenzierung-queue.md` zieht.

---

## 1. TL;DR (Strategisch)

| Cluster (User-#) | Tool-Count | Passt ohne Enum-Ext | Enum-Ext nötig | Out-of-Scope | Empfohlene Phase |
|---|---:|---:|---:|---:|---|
| Erweiterte Mathematik & Algebra (201–250) | 50 | ~35 | ~10 (`math`) | ~5 | Phase 2 |
| Physik & Chemie (251–300) | 50 | ~10 | ~30 (`physics`, `chemistry`) | ~10 | Phase 3 |
| Ingenieurwesen (301–350) | 50 | ~5 | ~35 (`engineering`) | ~10 | Phase 4 |
| Bauwesen & Heimwerken (351–410) | 60 | ~10 | ~40 (`construction`, `energy`) | ~10 | Phase 3 |
| IT & Web-Entwicklung (411–470) | 60 | ~50 (`dev`) | ~5 | ~5 | **Phase 2** |
| Gesundheit/Medizin (471–530) | 60 | ~15 | ~30 (`medical`) | ~15 (Arzt-Advice) |  Phase 3 mit Disclaimer |
| Finanzen/Steuern (531–580) | 50 | ~15 | ~25 (`finance`) | ~10 (Live-Rates) | Phase 2–3 |
| Sport/Hobbies (581–640) | 60 | ~15 | ~40 (diverse) | ~5 | Phase 4 |
| Kurioses/Kultur (641–700) | 60 | ~30 (`text`, `time`) | ~15 | ~15 (Pseudo-Wissenschaft) | Phase 2 gemischt |
| Social Media/Marketing (701–750) | 50 | ~35 (`finance`, `text`) | ~10 | ~5 (Live-API) | **Phase 2** |
| Logistik/Automotive (751–800) | 50 | ~5 | ~40 (`automotive`, `logistics`) | ~5 | Phase 4 |
| Landwirtschaft/Umwelt (801–850) | 50 | ~5 | ~40 (`agriculture`, `environment`) | ~5 | Phase 4 |
| Bildung/Wissenschaft (851–900) | 50 | ~20 (`math`, `text`) | ~25 (`education`, `science`) | ~5 | Phase 3 |
| Spezial-Hobbys (901–950) | 50 | ~10 | ~30 (diverse Niche) | ~10 | Phase 4–5 |
| Audio/Musik/Video (951–1000) | 50 | ~25 (`audio`, `video`) | ~20 (`music`) | ~5 (Live-Stream) | Phase 3 |
| **Summe** | **~800** | **~285 (≈36%)** | **~395 (≈49%)** | **~120 (≈15%)** | — |

**Kernaussagen:**

1. **Nur ~36% der 800 Tools sind ohne Enum-Extension baubar.** Der Rest hängt an einer Entscheidung, die in [CATEGORY_TTL.md §2](../../paperclip/CATEGORY_TTL.md) explizit als **User-Approval-Ticket** (nicht agent-autonom) definiert ist.
2. **~15% (≈120 Tools) sind Out-of-Scope** durch Hard-Caps (Live-Rates, Server-API, Pseudo-Wissenschaft, regulierte Medizin-Advice). Diese filtern wir BEFORE Backlog-Seed raus.
3. **Größter Low-Hanging-Block: IT & Web (411–470) + Social Media/Marketing (701–750).** Beide fallen in existierende Enum-Werte (`dev`, `text`, `finance`) und sind pure-client trivial — ideal für Phase-2-Mass-Build.
4. **Größter Blocker: Ingenieurwesen / Physik / Bauwesen.** Diese 160+ Tools brauchen 4–5 neue Enum-Werte UND haben hohen Build-Cost (komplexe Formeln, Domain-Validation). Nicht vor Phase 3/4.
5. **Gesundheit/Medizin (471–530) ist der heikelste Block.** 15 pro bauar (BMI-artige Rechner), 30 brauchen `medical`-Enum, 15 sind explizit Arzt-Advice (GFR-Interpretation, APGAR-Klinik-Score, Insulin-Dosierung) — die MÜSSEN mit klarem Disclaimer oder gar nicht gebaut werden.

**Aus Sicht Mass-Build-Strategie:** Von 800 sind **~280 in Phase 2 baubar** (bestehender Enum), **~290 nach einmaliger Enum-Extension** in Phase 3 baubar, **~110 in Phase 4+** (hoher Build-Cost oder Niche-Enum), **~120 Out-of-Scope**.

---

## 2. Cluster-Analyse im Detail

Pro Cluster: (a) was wir schon haben / planen, (b) was neu und baubar ist, (c) Enum-Gaps, (d) Out-of-Scope, (e) Top-5-Picks für nächste Queue-Extension.

### 2.1 Erweiterte Mathematik & Algebra (201–250) — 50 Tools

**Bestand-Match.** Basis-Mathe (Prozentrechner, BMI, Alter, Dreisatz) liegt schon im Phase-1-Katalog (Ca-1 bis Ca-6, I-1). Dieser Block geht deutlich tiefer: Determinanten, Vektor-Kreuzprodukt, Matrix-Inversion, Gleichungssysteme (Gauß), komplexe Zahlen, Zahlsysteme-Konverter (binär/hex/oktal), Statistik-Funktionen (Mittelwert, Median, Standardabweichung, Korrelation, Regression).

**Baubar ohne Enum-Ext (`math` existiert NICHT, aber vieles passt in `text` oder `dev`):**
- Zahlsysteme-Konverter (binär↔dezimal↔hex↔oktal) → `dev` (passt, ist wie Base64)
- Statistik-Calculator (Mittelwert/Median/Stdabw/Varianz) → braucht `math` ODER in `text` einklassifizieren
- Boolean-Algebra-Rechner → `dev`

**Enum-Ext nötig (`math`):** Determinanten, Vektoren, Matrizen, Trigonometrie, Komplexe Zahlen, Logarithmen, Fakultät, Fibonacci, Primzahl-Tester, GCD/LCM. Das sind klassische SEO-Keywords ("Determinante berechnen", "Matrix invertieren") mit solidem DE-Volumen.

**Out-of-Scope:** Keine — Mathe ist deterministic, pure-client, offline.

**Top-5-Picks (nach Enum-Ext `math`):**
1. `matrix-determinante` — SEO-stark, deterministic, 3h-Build
2. `vektor-kreuzprodukt` — Ingenieurs-Zielgruppe
3. `gleichungsloeser-2x2` / `-3x3` — Schüler-Traffic
4. `zahlsysteme-konverter` (bin/dez/hex/okt 1-Shot) — kann auch unter `dev`
5. `standardabweichung-rechner` — Statistik-Student-Traffic

---

### 2.2 Physik & Chemie (251–300) — 50 Tools

**Bestand-Match.** Null. Neu-Cluster.

**Typische Tools.** Ideales Gasgesetz (pV=nRT), pH-Rechner, Ohmsches Gesetz (U=R·I), Fallhöhe/Wurfparabel, kinetische Energie, Photonen-Energie, Molmassen-Rechner, Molarität/Verdünnung, Astronomie (Planetenabstand, Lichtjahr-Umrechnung).

**Baubar ohne Enum-Ext:** Ohm/Gas/Fallhöhe gehen notfalls als `math`, aber semantisch falsch. Besser: Enum-Ext.

**Enum-Ext nötig:** `physics` + `chemistry` (2 neue Slugs). Alternativ 1 kombinierter Slug `science` — schmaler aber hinreichend für Phase 1.

**Out-of-Scope:**
- Radioaktiver-Zerfall-Halbwertszeit → baubar, aber Vorsicht mit "Dosis-Rechner" (medizinische Advice).
- Drogen-Dosis-Rechner (falls in Liste) → **hart raus**.
- Live-Wetter-Formeln (Windchill mit API) → pure-client nur mit Manual-Input.

**Top-5-Picks (nach Enum-Ext `physics`+`chemistry`):**
1. `ohmsches-gesetz` — Elektriker/Schüler, DE-Top-Keyword
2. `molmassen-rechner` — Chemie-Studenten
3. `ph-rechner` — Aquaristik + Chemie + Kosmetik
4. `kinetische-energie-rechner` — Physik-Hausaufgaben
5. `fallhoehe-rechner` — Freier-Fall-Formel (v = √(2gh))

---

### 2.3 Ingenieurwesen (301–350) — 50 Tools

**Bestand-Match.** Null.

**Typische Tools.** Getriebe-Übersetzung, Drehmoment↔Leistung, CNC-Vorschub/Spindel-Drehzahl, Hydraulik-Zylinderkraft, PCB-Leiterbahn-Breite (IPC-2221), Motoren-Leistungsrechner, Schrauben-Anzugsmoment, Lager-Lebensdauer (ISO 281).

**Enum-Ext nötig:** `engineering` (1 breiter Slug — Spezifikation zu feingranular wäre YAGNI-Verletzung).

**Out-of-Scope:** Keine per se, aber **Build-Cost hoch** — Formeln komplex, Input-Validation nicht-trivial, Zielgruppe klein → SEO-ROI schlechter als Mathe.

**Empfehlung:** **Zurückstellen auf Phase 4.** Dieser Cluster lohnt sich erst, wenn Phase 2+3 Template-Durchsatz etabliert ist und wir aus Analytics sehen, welche Sub-Nischen Traffic bringen.

**Top-3-Picks falls früher angefasst:**
1. `pcb-leiterbahn-rechner` (IPC-2221) — unterversorgt im DACH-Raum
2. `getriebe-uebersetzung` — Modellbau + Auto-Tuning-Szene
3. `schrauben-anzugsmoment` — Heimwerker + Mechaniker

---

### 2.4 Bauwesen & Heimwerken (351–410) — 60 Tools

**Bestand-Match.** Null.

**Typische Tools.** Beton-Mischverhältnis, Beton-Volumen, Dachneigung, Dachfläche, Treppen-Steigung/Auftritt, Dämm-Stärke (U-Wert), Tapeten-Rechner, Farbverbrauch, Fliesen-Bedarf, Photovoltaik-Ertrag, Wärmebedarf (kWh/m²), Heizkörper-Dimensionierung, Fensterflächen-Anteil.

**Enum-Ext nötig:** `construction` (primär) + `energy` (für PV/Heiz).

**Baubar ohne Enum-Ext (notdürftig):** Tapeten/Fliesen/Farbverbrauch als `area` einklassifizieren geht formal, ist aber semantisch falsch.

**Out-of-Scope:**
- Energiepass-Rechner → regulatorisch heikel (GEG/EnEV), eigene Rechtsberatung-Gefahr.
- Baurichtpreise mit Live-Daten → keine Live-APIs.

**Hoher SEO-Wert.** „Fliesen-Rechner" / „Photovoltaik-Ertrag" / „Beton-Rechner" sind DE-Top-Keywords mit klarem DIY-Intent — pure Commercial-Intent, AdSense-freundlich.

**Top-5-Picks (nach Enum-Ext `construction`):**
1. `fliesen-rechner` — klassischer DIY-SEO-Winner
2. `beton-rechner` (Volumen + Mischverhältnis) — Heimwerker
3. `photovoltaik-ertrag` — 2026 Top-Thema (Energie-Transition)
4. `dachneigung-rechner` — Dach-Sanierer
5. `tapeten-rechner` — Renovierer

---

### 2.5 IT & Web-Entwicklung (411–470) — 60 Tools — **PHASE-2-SWEET-SPOT**

**Bestand-Match.** Phase-1-Katalog bereits stark: JSON/SQL/XML/CSS-Formatter, RegEx-Tester, Base64, URL-Encoder, UUID, Passwort-Gen, Hash (MD5/SHA), JWT-Decoder, Text-Diff, JSON-Diff.

**Neu und baubar in `dev`:** MIME-Type-Finder, HTTP-Status-Code-Lookup, DNS-Record-Lookup (nur Manual-Input, kein Live), Cron-Expression-Builder, .htaccess-Generator, robots.txt-Generator, .gitignore-Template, CSS-Gradient-Generator, CSS-Shadow-Generator, CSS-Grid-Generator, Flexbox-Playground, Box-Shadow-Generator, Text-Shadow-Generator, Color-Picker, CSS-Animation-Builder, Favicon-Generator, Meta-Tag-Generator, OpenGraph-Generator, Sitemap-Generator, htpasswd-Generator, nginx-Config-Generator, YAML↔JSON, TOML↔JSON, CSV↔JSON (bereits geplant).

**Enum-Ext nötig:** Minimal — `color` deckt CSS-Farben ab, `dev` alles andere. Vielleicht `web` als Sub-Cluster, aber YAGNI.

**Out-of-Scope:**
- Live-DNS-Lookup mit API → nur manuelle Record-Parser
- Live-HTTP-Header-Checker → nur Paste-in
- Port-Scanner / Whois → Security-/Privacy-Risiko

**Empfehlung:** **Nach dem 200-Seed den ENTIRE IT-Cluster zum ersten Mass-Build-Batch machen.** 40+ Tools lassen sich mit 4–6 Templates (Formatter / Generator / Validator / Converter) in 2 Wochen durchbauen. SEO-Volumen solide (DE-Dev-Community), Monetarisierung top (B2B-Klicker).

**Top-10-Picks für Phase-2-Mass-Build:**
1. `css-gradient-generator`
2. `css-shadow-generator`
3. `css-grid-generator`
4. `flexbox-playground`
5. `meta-tag-generator`
6. `opengraph-generator`
7. `favicon-generator`
8. `cron-expression-builder`
9. `htaccess-generator`
10. `yaml-json-konverter`

---

### 2.6 Gesundheit/Medizin (471–530) — 60 Tools — **DISCLAIMER-CLUSTER**

**Bestand-Match.** BMI (Ca-2), Alter (I-1), Ovulation (I-3), Arbeitszeit (I-2), Eisprung (I-3) schon geplant.

**Baubar + harmlos (Lifestyle/Selbst-Check):**
- Kalorienbedarf (BMR / Harris-Benedict / Mifflin-St-Jeor)
- Grundumsatz-Rechner
- Körperfett-Rechner (Navy-Formel)
- Wasserbedarf-Rechner
- Puls-Zonen-Rechner
- Schwangerschafts-Wochen-Rechner
- Schlafzyklus-Rechner

**Enum-Ext (`medical`) + Disclaimer-Pflicht:**
- GFR (Nierenfunktion) — ärztlich zu interpretieren
- LDL/HDL-Verhältnis — Labor-Werte
- APGAR-Score — Neonatologie, KEIN Laien-Tool
- Insulin-Korrektur — **hart raus**
- Medikamenten-Dosierung → **hart raus**
- Schwangerschafts-Diabetes-Score — Labor + Arzt

**Out-of-Scope (Hard-No):**
- Arzneimittel-Dosierungen für Kinder nach Gewicht
- Krebs-Risiko-Scores (Gail, Tyrer-Cuzick)
- Psychiatric Scales (PHQ-9, GAD-7 ohne klinischen Kontext)
- Insulin/Blutzucker-Korrektur

**Regel (Hard-Cap-Ergänzung):** Jedes `medical`-Tool bekommt Standard-Disclaimer "Kein Arztersatz. Ergebnis ersetzt keine medizinische Diagnose. Bei Beschwerden Arzt/Ärztin konsultieren." — sichtbar oberhalb des Ergebnis-Panels, nicht nur im Footer. Wird in [CONTENT.md](../../../CONTENT.md) §14 (neu) verankert, sobald Enum-Ext genehmigt.

**Top-5-Picks (Lifestyle, kein `medical`-Enum nötig):**
1. `kalorienbedarf-rechner` (unter `math` oder nach `health`-Enum)
2. `wasserbedarf-rechner`
3. `puls-zonen-rechner`
4. `koerperfett-marinerechner`
5. `schwangerschaftswoche-rechner` (SSW aus letzter Periode)

---

### 2.7 Finanzen/Steuern (531–580) — 50 Tools

**Bestand-Match.** Brutto-Netto (Ca-6), MwSt (Ca-4), Zinseszins (Ca-5), IBAN-Prüfer, USt-ID-Prüfer in Katalog.

**Baubar in `finance` (nach Enum-Ext):**
- Erbschaftsteuer-Rechner (deutsche Freibeträge)
- Dienstwagen-Rechner (1%-Regel)
- BAföG-Rechner (Elternbeitrag)
- Rentenbeitrag-Rechner
- Elterngeld-Rechner
- Kurzarbeitergeld-Rechner
- Abfindungs-Rechner (Fünftel-Regelung)
- Grunderwerbsteuer nach Bundesland
- Kfz-Steuer nach BJ/CO2
- ETF-Sparplan-Rechner
- Entnahmeplan (4%-Regel)

**Out-of-Scope:**
- Live-Aktienkurse / Fonds-Performance → keine Live-APIs
- Steuerbescheid-Rechner-Full (zu umfangreich, juristisch) → eher Finanzamt-Tool
- Krypto-Gewinn-Rechner mit Live-Kurs → **Hard-Cap**

**Enum-Ext nötig:** `finance` (1 Slug reicht).

**SEO-Qualität.** DE-Finanzen-Keywords sind geldwert — AdSense-CPM im Finanzsektor ist 3–5x höher als Hobby. **Hohe Priorität für Phase 2.**

**Top-5-Picks (nach Enum-Ext `finance`):**
1. `dienstwagen-rechner` (1%-Regel) — breite Zielgruppe
2. `elterngeld-rechner`
3. `abfindungs-rechner` (Fünftel-Regelung)
4. `etf-sparplan-rechner`
5. `kfz-steuer-rechner`

---

### 2.8 Sport/Hobbies (581–640) — 60 Tools

**Bestand-Match.** Null.

**Typische Tools.** Golf-Handicap, Dart-Checkout-Finder (X01), Schach-Elo-Rechner, Laufzeit-Pace (min/km↔km/h), Lauf-Trainingsplan-Generator, Taucher-Dekompressionszeit (nicht für Praxis!), Modellbau-Maßstäbe (1:87 ↔ 1:72 ↔ ...), Audio-BPM-Tempo, RC-Car-Getriebe, Angler-Wetter-Einschätzung.

**Enum-Ext nötig:** Viele Niche-Slugs oder **1 breiter `sport`-Slug** (empfohlen — YAGNI).

**Out-of-Scope:**
- Taucher-Deko-Tabellen (lebensgefährlich bei Fehlnutzung) → **Hard-No oder Big-Red-Disclaimer "Nicht für Tauchpraxis"**.
- Glücksspiel-Wahrscheinlichkeiten (Poker-Odds, Lotto-Gewinnchance) → Glücksspiel-Regulatorik DACH → vorsichtig.

**Top-5-Picks (nach Enum-Ext `sport`):**
1. `pace-rechner` (min/km ↔ km/h) — Läufer-Standard
2. `dart-checkout` (X01-Finisher) — Hobby-Darter
3. `schach-elo-rechner` — Hobby-Schach
4. `modellbau-massstab-konverter` — Modellbau-Szene
5. `golf-handicap-rechner` — Hohe AdSense-CPM (Premium-Zielgruppe)

---

### 2.9 Kurioses/Kultur (641–700) — 60 Tools

**Bestand-Match.** Null (außer Römische Zahlen C-5 = geplant).

**Typische Tools.** Morsecode↔Text, Caesar-Verschlüsselung, ROT13/ROT47, Atbash, Vigenère, Braille-Konverter, Binär-Text, Phonetisches Alphabet (NATO), Kalender-Konverter (Gregorianisch↔Julianisch↔Islamisch↔Hebräisch), Chinesische Tierkreiszeichen, Numerologie, Lebenszahl, Sternzeichen-Lookup, Mayakalender.

**Baubar ohne Enum-Ext (in `text`):** Morse, ROT13, Caesar, Atbash, Vigenère, Braille, Binär-Text, Phonetisches Alphabet — **sehr baubar** in `text`.

**Enum-Ext (`calendar`-Slug optional):** Kalender-Konverter.

**Out-of-Scope (Pseudo-Wissenschaft):**
- Numerologie (Lebenszahl, Namens-Zahl)
- Astrologie (persönliche Horoskope, Aszendent-Berechnung als "Wahrsagung")
- Mayakalender-Prognose
- Bach-Blüten-Wahl
- Engel-Zahlen

**Policy-Empfehlung.** Kalender-Konverter (Gregorianisch↔Julianisch) und Tierkreiszeichen-**Lookup** (Datum→Tierkreis) sind harmlos und faktisch korrekt → baubar. **Lebenszahl-Berechnung und Numerologie-Kompatibilität sind Pseudo-Wissenschaft** → vermeiden (verletzt implizit Brand-Trust + würde bei AdSense-Prüfung negativ auffallen). Alternative: "Sternzeichen-Finder" als reines Datums-Lookup (nicht als Wahrsage-Tool formuliert) ist okay.

**Top-5-Picks (`text` + 1× Ext):**
1. `morsecode-uebersetzer` — klassisches DE-SEO-Keyword
2. `caesar-verschluesselung`
3. `vigenere-chiffre`
4. `kalender-konverter` (Gregorianisch↔Julianisch)
5. `nato-phonetisches-alphabet`

---

### 2.10 Social Media/Marketing (701–750) — 50 Tools — **PHASE-2-KANDIDAT**

**Bestand-Match.** Null.

**Typische Tools.** Engagement-Rate-Rechner (Likes+Comments/Followers), CPC/CPM/CPA-Rechner, ROAS, CTR, Conversion-Rate, A/B-Test-Signifikanz, UTM-Link-Builder, Affiliate-Commission-Rechner, TikTok-Like-Ratio, YouTube-CPM-Schätzer, Twitch-Subs-Revenue, Instagram-Hashtag-Generator (nur Listen, keine Live-Analyse), SEO-Title-Length-Checker, Meta-Description-Checker, Readability-Score (Flesch, Lix).

**Baubar ohne Enum-Ext:** Die Rechen-Tools passen in `finance` oder `text`. UTM-Builder und SEO-Length-Checker in `dev`.

**Enum-Ext nötig:** `marketing` (optional — 1 Slug reicht wenn wir es ausbauen).

**Out-of-Scope:**
- Live-Follower-Tracker (Instagram/Twitter-API)
- Hashtag-Ranking-Analyse (braucht Live-API)
- Plagiatsprüfer → bereits in Phase-1-Nicht-Ziele

**Empfehlung.** Dieser Cluster ist **Phase-2-Mass-Build-Sweet-Spot #2** nach IT. B2B-Zielgruppe (Marketer), gute CPM, pure-client trivial, kurze Build-Zeit.

**Top-10-Picks:**
1. `utm-link-builder`
2. `engagement-rate-rechner`
3. `cpc-cpm-cpa-rechner` (1-Shot)
4. `a-b-test-signifikanz-rechner`
5. `roas-rechner`
6. `flesch-lesbarkeits-index`
7. `seo-title-length-checker`
8. `meta-description-checker`
9. `conversion-rate-rechner`
10. `affiliate-provisions-rechner`

---

### 2.11 Logistik/Automotive (751–800) — 50 Tools

**Bestand-Match.** Null.

**Typische Tools.** Fracht-Volumengewicht (IATA), Paletten-Rechner (Europalette/Industrie), Container-Füllrate, KFZ-Steuer (→ Finanzen, doppelt), Elektroauto-Reichweite, Ladezeit-Rechner (Wh/kW), Spritverbrauch (l/100km), Flug-CO2, Flug-Meilen-Rechner, Mautkosten.

**Enum-Ext nötig:** `automotive` + `logistics` (oder 1 breiter `vehicle`-Slug).

**Out-of-Scope:**
- Live-Spritpreise → keine Live-APIs
- Live-Fluginfos → keine Live-APIs

**SEO-Wert.** Solide für Automotive (DE-starke-Autonation). Logistik schwächer (B2B-Niche).

**Top-5-Picks (nach Enum-Ext):**
1. `elektroauto-reichweite` (2026 Top-Thema)
2. `ladezeit-rechner`
3. `spritverbrauch-rechner`
4. `paletten-rechner`
5. `flug-co2-rechner`

---

### 2.12 Landwirtschaft/Umwelt (801–850) — 50 Tools

**Bestand-Match.** Null.

**Typische Tools.** Düngerbedarf (Stickstoff, Phosphor, Kalium), Saatgut-Bedarf (kg/ha), Feldgröße-Rechner, Bodenfeuchte, Solar-Ertrag (→ Bauwesen, Doppelung), CO2-Fußabdruck (Flug, Heizung, Ernährung), Regenmenge (l/m² ↔ mm), Wassermenge-Garten.

**Enum-Ext nötig:** `agriculture` + `environment`.

**SEO-Qualität.** Nische, aber 2026 aktuell durch Klima-Diskurs. CO2-Rechner besonders stark (Jahres-Trend).

**Out-of-Scope:**
- Klima-Live-Daten
- Erntemengen-Prognosen (agrarwirtschaftliche Daten proprietär)

**Top-5-Picks:**
1. `co2-fussabdruck-rechner` (Flug/Heizung/Ernährung) — AdSense-attraktiv
2. `duengerbedarf-rechner`
3. `regenmenge-rechner` (l/m² ↔ mm)
4. `saatgut-bedarf-rechner`
5. `bodenfeuchte-rechner`

---

### 2.13 Bildung/Wissenschaft (851–900) — 50 Tools

**Bestand-Match.** Null (Notenschnitt NEU).

**Typische Tools.** Notenschnitt (DE Abitur 1-6 + Abi-Punkte 0-15), GPA-Konverter (DE↔US), Zensur-Umrechner (DE↔UK), ECTS-Rechner, Studienleistung-Punkte, Prüfungs-Notwendig-Rechner ("was brauch ich in der Klausur"), Statistik-p-Wert, Korrelations-Koeffizient (Pearson/Spearman), Regressions-Gleichung.

**Baubar in `math` (nach Ext) oder `text`:**
- Notenschnitt-Rechner (in `text` einklassifizieren geht formal)
- GPA-Konverter
- Was-brauch-ich-in-der-Klausur-Rechner

**Enum-Ext nötig:** `education` + `science` (oder 1 `academic`).

**Top-5-Picks:**
1. `notenschnitt-rechner` (Abitur DE) — Schüler-Traffic hoch
2. `abitur-punkte-rechner`
3. `gpa-konverter` (DE↔US)
4. `klausur-notwendig-rechner`
5. `ects-rechner`

---

### 2.14 Spezial-Hobbys (901–950) — 50 Tools

**Bestand-Match.** Null.

**Typische Tools.** Whisky-Verdünnung (Cask-Strength auf Ziel-%), Pizza-Teig-Rechner (Hydration, Hefe, Salz), Modellbahn-Maßstäbe (H0/N/TT, → Modellbau doppelt), Schach-Taktik-Trainings-Timer, Numerologie (→ Pseudo, raus), Foto-Belichtungs-Reziproken, Brauen-Rechner (IBU, OG, ABV, SRM), Aquarium-Liter-Rechner, Terrarium-Heizleistung.

**Enum-Ext nötig:** Diverse Niche. Empfehlung: **nicht für Niche-Enum erweitern** — baue die besten 5–10 als `math` oder `text`.

**Top-5-Picks (als `text` oder `math`, Niche-Traffic aber loyal):**
1. `pizza-teig-rechner` — virale Food-Niche
2. `brauen-rechner` (IBU/OG/ABV/SRM) — Hobby-Brauer
3. `whisky-verduennung-rechner`
4. `aquarium-liter-rechner`
5. `foto-belichtungs-rechner`

---

### 2.15 Audio/Musik/Video (951–1000) — 50 Tools

**Bestand-Match.** WebP (Session 7), Hintergrund-Entfernen (Session 9), HEVC→H264 (in Arbeit) → Bildbearbeitung abgedeckt.

**Typische Tools.** BPM-Tempo-Rechner, ADSR-Envelope-Visualizer, LUFS-Messer (browser-basiert, WebAudio), Speicherkarten-Kapazität (1080p/4K/8K/Raw), Kamera-Sensor-Größe ↔ Crop-Faktor, Video-Bitrate-Kalkulator, Audio-Samplerate-Konverter (nur Berechnung, keine Re-Encoding-Deep-Magic), Blitzdauer-Rechner, Cinemagraph-Generator.

**Baubar in `audio` (existiert) / `video` (existiert) / `image` (existiert):** Viele.

**Enum-Ext (`music`) nötig für:** Notenwert-Konverter, Oktaven-Transponieren, Intervalle-Lookup, Tonleiter-Generator. 1 neuer Slug reicht.

**Out-of-Scope:**
- Live-Audio-Stream-Analyse
- DAW-Plugin-Emulationen
- Copyright-Check-Tools

**Top-5-Picks:**
1. `bpm-rechner` (Tempo-Berechnung + Reverb-Delay-Sync)
2. `video-bitrate-rechner` (für Streaming-Upload)
3. `speicherkarten-kapazitaet-rechner` (4K/8K/Raw)
4. `crop-faktor-rechner`
5. `lufs-messer` (WebAudio-basiert, Privacy-USP)

---

## 3. Zusammengeführter Phase-2-Mass-Build-Seed (50 Tools, enum-kompatibel)

**Warum.** Wenn wir in Phase 2 ohne Enum-Extension starten und trotzdem 50 neue Tools bauen wollen: folgende Auswahl ist komplett mit existierendem 14-Enum baubar und deckt die SEO-stärksten Cluster ab (IT + Marketing + Text-Kryptographie + basale Rechner).

**Aus Cluster 2.5 IT & Web (25 Tools):**
1. `css-gradient-generator` (`dev`)
2. `css-shadow-generator` (`dev`)
3. `css-grid-generator` (`dev`)
4. `css-animation-builder` (`dev`)
5. `flexbox-playground` (`dev`)
6. `meta-tag-generator` (`dev`)
7. `opengraph-generator` (`dev`)
8. `favicon-generator` (`image`)
9. `cron-expression-builder` (`dev`)
10. `htaccess-generator` (`dev`)
11. `robots-txt-generator` (`dev`)
12. `gitignore-generator` (`dev`)
13. `nginx-config-generator` (`dev`)
14. `htpasswd-generator` (`dev`)
15. `yaml-json-konverter` (`dev`)
16. `toml-json-konverter` (`dev`)
17. `mime-type-finder` (`dev`)
18. `http-status-lookup` (`dev`)
19. `color-picker` (`color`)
20. `box-shadow-generator` (`dev`)
21. `text-shadow-generator` (`dev`)
22. `sitemap-generator` (`dev`)
23. `jwt-decoder` (`dev`, schon im Katalog — skip)
24. `markdown-preview` (`text`)
25. `markdown-to-html` (`text`)

**Aus Cluster 2.10 Social/Marketing (10 Tools):**
26. `utm-link-builder` (`dev`)
27. `engagement-rate-rechner` (`math` → notfalls `text` oder Enum-Ext)
28. `cpc-cpm-cpa-rechner` (`finance`)
29. `a-b-test-signifikanz` (`math`/`text`)
30. `roas-rechner` (`finance`)
31. `flesch-lesbarkeits-index` (`text`)
32. `seo-title-length-checker` (`text`)
33. `meta-description-checker` (`text`)
34. `conversion-rate-rechner` (`finance`)
35. `affiliate-provisions-rechner` (`finance`)

**Aus Cluster 2.9 Kultur (10 Tools, kompromisslos in `text`):**
36. `morsecode-uebersetzer` (`text`)
37. `caesar-verschluesselung` (`text`)
38. `rot13-rot47` (`text`)
39. `vigenere-chiffre` (`text`)
40. `atbash-chiffre` (`text`)
41. `nato-phonetisches-alphabet` (`text`)
42. `braille-konverter` (`text`)
43. `binaer-text-konverter` (`text`)
44. `kalender-konverter-gregorianisch-julianisch` (`time`)
45. `sternzeichen-lookup` (`time`)

**Aus Cluster 2.1 Mathe-Basis (5 Tools, als `text` oder `dev` einklassifizierbar):**
46. `zahlsysteme-konverter` (`dev`)
47. `prozent-differenz-rechner` (`text` → eher Phase 2 mit `math`-Ext)
48. `mittelwert-rechner` (`text` notdürftig)
49. `bruch-dezimal-konverter` (`text`)
50. `fakultaet-rechner` (`text`/`dev`)

**Bau-Zeit-Schätzung:** Templates vorhanden → ∅ 2h/Tool → **~100h = 2.5 Wochen reine Bauzeit** bei 40h/Woche mit 1 Agent. Mit max_per_heartbeat=3 + cadence=5m + night-batch ≈ 7–10 Tage bei mixed-Complexity.

---

## 4. Enum-Extension-Roadmap (für Phase 3+)

Reihenfolge nach **ROI** (Traffic-Potenzial × Build-Throughput × CPM):

| Reihenfolge | Neuer Enum-Slug | Tool-Count (aus 800) | Priorisierung |
|---:|---|---:|---|
| 1 | `finance` | ~40 | **Hoch** — AdSense-CPM top, DE-Pflicht-Rechner |
| 2 | `math` | ~40 | Hoch — Schüler/Student-Traffic, stabil |
| 3 | `construction` | ~45 | Hoch — DIY-SEO stark, PV-Trend 2026 |
| 4 | `health` / `medical` | ~40 (+ 15 Disclaimer-Pflicht) | Mittel — Disclaimer-Regel first etablieren |
| 5 | `marketing` | ~15 | Mittel — sweet B2B-CPM |
| 6 | `automotive` | ~20 | Mittel — E-Auto-Trend |
| 7 | `science` (Physik+Chemie kombiniert) | ~40 | Mittel — Schüler/Student |
| 8 | `sport` | ~30 | Mittel-Niedrig — Niche aber loyal |
| 9 | `agriculture` / `environment` | ~30 | Niedrig — schmal, aber CO2-Rechner top |
| 10 | `engineering` | ~40 | Niedrig — hoher Build-Cost |
| 11 | `music` | ~15 | Niedrig — Niche |
| 12 | `academic` / `education` | ~30 | Mittel — Notenschnitt stark |

**Empfehlung.** Phase 3 mit **`finance` + `math` + `construction` + `marketing`** starten. Das entspricht ~140 neuen Tools und deckt die SEO-/CPM-stärksten Blöcke ab. Die restlichen 5–6 Slugs nach Analytics-Daten in Phase 4 sortieren.

---

## 5. Out-of-Scope-Masterliste (Hard-Caps, nicht bauen)

Diese Tool-Klassen werden **kategorisch nicht** gebaut — unabhängig von User-Wunsch, weil sie gegen Non-Negotiables aus [CLAUDE.md §18](../../../CLAUDE.md) verstoßen:

1. **Live-Marktdaten** (Aktienkurse, Fonds, Krypto-Preise, Wechselkurse, Fluginfos, Spritpreise, Baupreise) — verletzt `keine-Network-Runtime-Deps`.
2. **Pseudo-Wissenschaft** (Numerologie, persönliche Horoskope, Engel-Zahlen, Bach-Blüten, Mayakalender-Prognose) — verletzt Brand-Trust + AdSense-Policy-Risiko.
3. **Medizinische Behandlungs-Tools** (Insulin-Dosierung, Arzneimittel-Dosierung nach KG, Chemotherapie-Zyklen, psychiatrische Klinik-Scores ohne Arzt-Kontext) — verletzt Privacy-First + juristisches Risiko.
4. **Copyright-sensitive Tools** (Plagiat-Check mit DB-Abgleich, Lyrics-Finder, YouTube-zu-MP3, Stream-Ripper) — bereits in Phase-1-Nicht-Ziele §9.
5. **Security-/Penetrations-Tools** (Port-Scanner, Password-Cracker, Exploit-Lookup) — Dual-Use-Risiko + Abuse-Potential.
6. **Regulierte Glücksspiel-Tools** (Poker-Odds-Live, Sportwetten-Odds) — DACH-Glücksspielregulierung heikel.
7. **Server-seitige Datei-Manipulation** (PDF-Editor mit Server-Parsing, Video-Transcode mit Server-CPU) — verletzt privacy-first + verursacht Cloud-Kosten.
8. **Live-Social-Media-Analyse** (Follower-Tracker, Hashtag-Ranking, Engagement-History) — braucht proprietäre APIs.

**Ausnahme-Klausel:** Alle Medical-Tools mit Screening-Charakter (BMI, Kalorienbedarf, Puls-Zonen) sind OK, aber **Disclaimer-Pflicht**: sichtbar oberhalb des Ergebnis-Panels, nicht nur im Footer.

---

## 6. Offene User-Entscheidungen (aus 200-Liste carried over + NEU)

Aus [2026-04-21-user-200-list-analysis.md](./2026-04-21-user-200-list-analysis.md) noch offen:

- D1: Enum-Extension für `speed`, `data`, `pressure`, `energy`, `power`, `fuel`, `angle`, `currency` — ja/nein/welche zuerst
- D2: Aktien-Rechner als `finance` re-klassifizieren oder Live-Daten-Exclusion
- D3: Niche-C-Tools (Persönlichkeitstest-16) Build-Order
- D4: Pseudo-Wissenschafts-Cutoff konkretisieren
- D5: Gramm↔Tassen (volume? weight? mess-Kontext)

**NEU aus 800er-Liste:**

- **D6:** Enum-Extension für **`math`** + **`finance`** + **`construction`** als Phase-3-Batch? Oder einzeln rollen?
- **D7:** **`medical`/`health`**-Enum: ja oder als Unterklasse von `text` laufen lassen? (Impact: Disclaimer-Regel in CONTENT.md §14 neu).
- **D8:** **Pseudo-Wissenschaft-Policy** konkretisiert: Sternzeichen-**Lookup** (Datum→Zeichen) erlaubt, Horoskop-Text-Generator nicht? Numerologie komplett raus?
- **D9:** **Science-Cluster** (Physik + Chemie): 1 kombinierter `science`-Enum oder 2 getrennte?
- **D10:** **Engineering-Cluster** (Cluster 2.3 + 2.4 Technik-Teil): auf Phase 4 schieben oder früh einzelne Picks?
- **D11:** **Taucher-Deko-Tabellen** (Sport-Cluster) — definitiv raus ODER mit rotem Klinik-Disclaimer (lebensgefährlich bei Fehlnutzung)?
- **D12:** **Niche-Slug-Policy**: Für Cluster 2.14 (Whisky/Pizza/Aquarium) einen `niche`-Catchall-Slug oder in `text`/`math` einklassifizieren?

---

## 7. Empfohlene nächste Schritte

1. **Sofort (kein User-Input nötig):** Die 50 Phase-2-Mass-Build-Kandidaten aus §3 in `tasks/backlog/differenzierung-queue.md` als Tier-2-Block einhängen. Damit ist der CEO-Agent für die nächsten ~2 Wochen versorgt.
2. **Mit User-Input (heute/morgen):** D6+D7 entscheiden — `math`/`finance`/`construction`/`health` als Phase-3-Enum-Batch. Das unlockt ~160 weitere Tools.
3. **Nach Phase-A-Review 2026-04-28:** Basierend auf ersten 10 Build-Results: Science / Marketing / Sport als Phase-3-Tail entscheiden.
4. **Phase 4 (nach ~100 Live-Tools):** Engineering / Automotive / Agriculture / Music / Education mit Analytics-Daten priorisieren — welche Niche bringt echten Traffic?

---

## Quellen

- `docs/superpowers/plans/2026-04-20-phase-1-tool-catalog.md` — 50-Tool-Phase-1-Katalog
- `docs/superpowers/plans/2026-04-21-user-200-list-analysis.md` — 200er-Liste Detail-Match
- `tasks/backlog/differenzierung-queue.md` — Auto-Refill-Queue (20 + 13 Parking-Lot)
- `src/lib/tools/categories.ts` — 14-Enum (length/weight/area/volume/distance/temperature/image/video/audio/document/text/dev/color/time)
- `docs/paperclip/CATEGORY_TTL.md` §2 — Enum-Extension = User-Approval-Ticket
- `CLAUDE.md` §18 — Non-Negotiables (privacy-first, pure-client, kein Thin-Content)
