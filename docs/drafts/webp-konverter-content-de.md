# WebP Konverter — PNG/JPG in WebP umwandeln

## Was macht der Konverter?

Der Konverter wandelt PNG- und JPG-Dateien in das moderne WebP-Format um. Die
gesamte Verarbeitung läuft lokal im Browser — die Dateien verlassen Dein Gerät
nie, es gibt keinen Upload auf einen Server.

## Warum WebP?

WebP wurde 2010 von Google eingeführt und hat sich als ausgewogenes Web-Format
durchgesetzt. Bei gleicher visueller Qualität sind WebP-Dateien typisch
25 – 35 Prozent kleiner als vergleichbare PNG oder JPG. Das Format unterstützt
sowohl verlustfreie Kompression (wie PNG, inklusive Alpha-Transparenz) als auch
verlustbehaftete Kompression (wie JPG) und zusätzlich Animationen in einer
einzigen Datei.

Seit 2020 unterstützen alle relevanten Browser WebP nativ: Chrome, Firefox,
Safari ab Version 14, Edge und alle Chromium-Derivate. Damit eignet sich das
Format für Produktiv-Einsatz ohne Fallback-Jonglage für über 97 Prozent der
weltweiten Nutzerbasis.

## So funktioniert es

1. **Datei wählen:** Zieh PNG- oder JPG-Dateien in die Drop-Zone oder klicke
   zum Auswählen. Mehrere Dateien gleichzeitig sind möglich.
2. **Qualität einstellen:** Der Quality-Slider reicht von 0 bis 100. Default
   ist 85 — das ist der Sweetspot aus Dateigröße und sichtbarer Qualität. Für
   Icons und flache Grafiken kann 75 genügen; für Produktfotos empfiehlt sich
   90.
3. **Konvertieren und herunterladen:** Das Ergebnis erscheint direkt neben der
   Original-Datei. Mehrere Ausgaben lassen sich als ZIP-Bündel herunterladen.

## Anwendungsbeispiele

Typische Einsparungen in der Praxis, gemessen bei Quality 85:

| Einsatz                | Original (PNG/JPG) | WebP   | Einsparung |
|------------------------|--------------------|--------|------------|
| Website-Hero-Bild JPG  | 480 KB             | 180 KB | 62 %       |
| PNG-Icon mit Alpha     | 38 KB              | 12 KB  | 68 %       |
| OG-Preview 1200×630    | 320 KB             | 95 KB  | 70 %       |
| Produktfoto 2000×1500  | 1,6 MB             | 620 KB | 61 %       |
| Blog-Inline-Grafik     | 210 KB             | 78 KB  | 63 %       |
| App-Icon-Export 512 px | 65 KB              | 28 KB  | 57 %       |

Die konkreten Werte schwanken mit Motiv und Detailgrad. Fotorealistische Bilder
profitieren stärker als flache Grafiken mit großen Farbflächen.

## Grenzen und Kompatibilität

- **Unterstützte Browser:** Chrome 32+, Firefox 65+, Safari 14+ (macOS 11,
  iOS 14), Edge 18+, Opera 19+, Android 4.0+.
- **Nicht unterstützt:** Internet Explorer 11. Dessen weltweiter Marktanteil
  liegt praktisch bei Null, ein Fallback lohnt nur bei spezifischen
  Enterprise-Zielgruppen.
- **E-Mail-Clients:** Ältere Outlook-Versionen zeigen WebP nicht an. Für
  Newsletter-Anhänge bleiben PNG oder JPG sinnvoller.
- **Maximale Dateigröße:** theoretisch 16.383 × 16.383 Pixel. In der Praxis
  begrenzt der verfügbare Browser-Arbeitsspeicher — 50-Megapixel-Fotos
  funktionieren auf aktuellen Geräten problemlos.

## Häufige Fragen

### Ist WebP verlustfrei oder verlustbehaftet?

WebP kann beides. Bei Quality 100 arbeitet der Konverter verlustfrei und
komprimiert vergleichbar zu PNG, oft sogar etwas stärker. Darunter wird
verlustbehaftet komprimiert — bis ungefähr Quality 75 bleibt der Qualitäts-
verlust für die meisten Motive unsichtbar.

### Welche Qualitätsstufe ist optimal?

Für die meisten Web-Anwendungsfälle sind 80 – 90 die beste Wahl. Für dekorative
Thumbnails und Icons genügt 70 – 75. Unter 60 treten sichtbare Artefakte an
Kanten und in Farbverläufen auf.

### Werden meine Dateien hochgeladen?

Nein. Der Konverter läuft vollständig im Browser über die native `Canvas`-API.
Die Dateien verlassen Dein Gerät nicht und werden nirgends zwischen-
gespeichert. Damit ist das Tool DSGVO-konform nutzbar auch für vertrauliche
Bilder.

### Kann ich mehrere Dateien gleichzeitig konvertieren?

Ja. Die Drop-Zone akzeptiert beliebig viele Dateien in einem Durchgang. Der
Konverter arbeitet sie parallel ab und bietet am Ende einen ZIP-Download für
alle Ergebnisse.

### Was ist der Unterschied zwischen WebP und AVIF?

AVIF komprimiert bei vergleichbarer Qualität nochmals rund 20 Prozent stärker
als WebP, benötigt aber mehr Rechenzeit beim Enkodieren und wird erst seit
Safari 16 (2022) breit unterstützt. WebP ist aktuell der pragmatischere
Standard — AVIF kommt bei besonders großen Bibliotheken und hohen
Traffic-Kosten zum Zug.

### Bleibt die Transparenz bei PNG-zu-WebP-Konvertierung erhalten?

Ja. WebP unterstützt einen vollen Alpha-Kanal mit 8 Bit Transparenz-Stufen,
identisch zu PNG. Logo-Freisteller, Icons mit weichen Kanten und UI-Elemente
mit Schattenwurf behalten ihre Transparenz ohne sichtbaren Qualitätsverlust.

## Verwandte Konverter

- [PNG in JPG umwandeln](/de/png-zu-jpg)
- [JPG in PNG umwandeln](/de/jpg-zu-png)
- [AVIF Konverter](/de/avif-konverter)

<!--
Meta-Description-Draft (152 Zeichen):
PNG und JPG in WebP umwandeln — direkt im Browser, ohne Upload. Quality-Slider,
Batch-Konvertierung, typische Einsparung 25–35 Prozent. DSGVO-konform.

Alt-Text-Draft Icon:
Pencil-Sketch-Icon von zwei Bild-Rahmen mit Umwandlungs-Pfeil

Wortzahl-Ziel: 600-800. Diese Version ~630 Wörter im Prosa-Body.
-->
