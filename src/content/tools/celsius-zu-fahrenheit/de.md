---
toolId: celsius-to-fahrenheit
language: de
title: "Celsius in Fahrenheit umrechnen – Formel & Tabelle"
headingHtml: "Celsius in <em>Fahrenheit</em> umrechnen"
metaDescription: "Celsius in Fahrenheit umrechnen: affine Formel (°F = °C × 1,8 + 32), Tabelle für Wetter, Kochen und Fiebermessung. Ohne Anmeldung, ohne Tracking."
tagline: "Schnelle °C-zu-°F-Umrechnung mit affiner Formel — client-seitig, ohne Tracking."
intro: "Der Konverter wandelt einen Wert in Grad Celsius (°C) in die entsprechende Angabe in Grad Fahrenheit (°F) um und zeigt gleichzeitig den Rückweg. Er eignet sich für US-Wetterberichte, Kochrezepte mit Ofen-Temperaturen, Fieber-Werte aus amerikanischen Arztunterlagen und für jeden Kontext, in dem die beiden Temperatur-Skalen aufeinandertreffen. Die Umrechnung ist nicht rein multiplikativ — sie braucht einen Offset, weil beide Skalen unterschiedliche Nullpunkte haben."
howToUse:
  - "Gib den Wert in Grad Celsius ein"
  - "Das Ergebnis erscheint automatisch in Grad Fahrenheit"
  - "Kopiere oder tausche die Richtung mit einem Klick"
faq:
  - q: "Warum reicht kein einfacher Multiplikator für Temperaturen?"
    a: "Weil Celsius und Fahrenheit unterschiedliche Nullpunkte haben: 0 °C ist der Gefrierpunkt von Wasser, 0 °F liegt bei −17,78 °C. Eine reine Multiplikation würde diesen Versatz ignorieren. Deshalb nutzt die Formel zusätzlich einen Offset von 32 — das ist der Fahrenheit-Wert des Celsius-Nullpunkts."
  - q: "Bei welcher Temperatur sind °C und °F gleich?"
    a: "Bei −40 Grad treffen sich beide Skalen: −40 °C entsprechen exakt −40 °F. Das ist der einzige Schnittpunkt und eine beliebte Eselsbrücke, weil sie sich auch ohne Taschenrechner merken lässt."
  - q: "Wie rechne ich Körpertemperatur um?"
    a: "37 °C Normaltemperatur entsprechen 98,6 °F. Ein Fieber von 38,5 °C sind 101,3 °F. US-Arzt-Apps und Thermometer zeigen Fahrenheit — die Schwelle für „high fever\" liegt dort meist bei 103 °F (39,4 °C)."
  - q: "Welche Temperaturen sind in der Küche relevant?"
    a: "Ofen-Angaben in US-Rezepten bewegen sich meist zwischen 300 °F (149 °C) und 450 °F (232 °C). 350 °F (177 °C) gilt als Standard-Backtemperatur. Wer mit einem EU-Ofen kocht, rundet auf die nächsten 10 °C — die Toleranz ist groß genug."
  - q: "Wie funktioniert die Faustregel im Kopf?"
    a: "Für schnelle Schätzungen: Celsius verdoppeln und 30 addieren. 20 °C × 2 + 30 = 70 °F (exakt 68 °F). Die Abweichung bleibt unter 3 Grad im Alltagsbereich. Für präzise Werte — vor allem bei Fieber oder Ofen-Temperaturen — die exakte Formel nutzen."
relatedTools:
  - kilogramm-zu-pfund
  - meter-zu-fuss
  - zentimeter-zu-zoll
contentVersion: 1
---

## Was macht der Konverter?

Der Konverter wandelt einen Wert in Grad Celsius (°C) in die entsprechende
Angabe in Grad Fahrenheit (°F) um und zeigt gleichzeitig den Rückweg. Er
eignet sich für US-Wetterberichte, Kochrezepte mit Ofen-Temperaturen,
Fieber-Werte aus amerikanischen Arztunterlagen und für jeden Kontext, in dem
die beiden Temperatur-Skalen aufeinandertreffen.

## Umrechnungsformel

Im Gegensatz zu Längen- oder Gewichts-Umrechnungen ist die Temperatur-Formel
nicht rein multiplikativ. Beide Skalen haben unterschiedliche Nullpunkte:
`0 °C` ist der Gefrierpunkt von Wasser, `0 °F` entspricht −17,78 °C (Daniel
Fahrenheit wählte die tiefste im Winter 1708/09 gemessene Temperatur als
Nullpunkt seiner Skala). Deshalb braucht die Formel zusätzlich einen Offset.

Formeln:

`Fahrenheit = Celsius × 1,8 + 32`
`Celsius = (Fahrenheit − 32) ÷ 1,8`

Rechen-Beispiel: 20 °C × 1,8 = 36, plus 32 = 68 °F — das ist eine angenehme
Raumtemperatur im amerikanischen Kontext.

Der Schnittpunkt beider Skalen liegt bei −40 Grad: `−40 °C = −40 °F`. Das
funktioniert als Sanity-Check für jede Temperatur-Rechnung — wer diesen Wert
nicht trifft, hat einen Formel-Fehler.

Faustregel ohne Taschenrechner: Celsius verdoppeln und 30 dazu. 25 °C × 2 + 30
= 80 °F (exakt 77 °F). Die Abweichung liegt unter 3 Grad im Alltagsbereich —
für Wetter reicht das, für Fieber oder Ofen nicht.

## Anwendungsbeispiele

Die folgende Tabelle zeigt gängige Werte in beiden Richtungen, gerundet auf
zwei Nachkommastellen.

| Celsius | Fahrenheit | Fahrenheit | Celsius |
|---------|------------|------------|---------|
| −40     | −40        | −40        | −40     |
| 0       | 32         | 32         | 0       |
| 20      | 68         | 68         | 20      |
| 37      | 98,6       | 98,6       | 37      |
| 100     | 212        | 212        | 100     |
| 177     | 350,6      | 350        | 176,67  |

Normaltemperatur von 37 °C entspricht 98,6 °F. Ein US-Rezept mit „bake at
350 °F" meint 177 °C.

## Häufige Einsatzgebiete

**Wetter und Reise:** US-Nachrichten, Apps und Thermostate nutzen Fahrenheit.
Wer Reiseziele plant oder US-Prognosen liest, rechnet laufend um. 80 °F
bedeutet 27 °C — warmer Sommertag, nicht extrem.

**Kochen und Backen:** US-Kochbücher geben Ofen-Temperaturen in Fahrenheit an,
oft in 25-Grad-Stufen (325, 350, 375, 400 °F). Europäische Öfen haben
Celsius-Markierungen — eine Umrechnungstabelle am Backofen hilft beim Kochen
nach US-Rezepten.

**Medizin und Fieber:** US-Thermometer und Fitness-Tracker zeigen Fahrenheit.
Die Fieber-Schwelle liegt bei rund 100,4 °F (38 °C), hohes Fieber bei 103 °F
(39,4 °C). Wer Werte aus US-Arzt-Apps übernimmt, rechnet auf Celsius zurück.

## Häufige Fragen

### Warum reicht kein einfacher Multiplikator für Temperaturen?

Weil Celsius und Fahrenheit unterschiedliche Nullpunkte haben: 0 °C ist der
Gefrierpunkt von Wasser, 0 °F liegt bei −17,78 °C. Eine reine Multiplikation
würde diesen Versatz ignorieren. Deshalb nutzt die Formel zusätzlich einen
Offset von 32 — das ist der Fahrenheit-Wert des Celsius-Nullpunkts.

### Bei welcher Temperatur sind °C und °F gleich?

Bei −40 Grad treffen sich beide Skalen: −40 °C entsprechen exakt −40 °F. Das
ist der einzige Schnittpunkt und eine beliebte Eselsbrücke, weil sie sich
auch ohne Taschenrechner merken lässt.

### Wie rechne ich Körpertemperatur um?

37 °C Normaltemperatur entsprechen 98,6 °F. Ein Fieber von 38,5 °C sind
101,3 °F. US-Arzt-Apps und Thermometer zeigen Fahrenheit — die Schwelle für
„high fever" liegt dort meist bei 103 °F (39,4 °C).

### Welche Temperaturen sind in der Küche relevant?

Ofen-Angaben in US-Rezepten bewegen sich meist zwischen 300 °F (149 °C) und
450 °F (232 °C). 350 °F (177 °C) gilt als Standard-Backtemperatur. Wer mit
einem EU-Ofen kocht, rundet auf die nächsten 10 °C — die Toleranz ist groß
genug.

### Wie funktioniert die Faustregel im Kopf?

Für schnelle Schätzungen: Celsius verdoppeln und 30 addieren. 20 °C × 2 + 30
= 70 °F (exakt 68 °F). Die Abweichung bleibt unter 3 Grad im Alltagsbereich.
Für präzise Werte — vor allem bei Fieber oder Ofen-Temperaturen — die exakte
Formel nutzen.

## Verwandte Temperatur-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Kilogramm zu Pfund](/de/kilogramm-zu-pfund)** — Gewichts-Umrechnung zwischen kg und Pfund, präzise Formel seit 1959.
- **[Meter zu Fuß](/de/meter-zu-fuss)** — Längen-Umrechnung mit Schritt-für-Schritt-Rechenweg und Beispielen.
- **[Zentimeter zu Zoll](/de/zentimeter-zu-zoll)** — Längen-Umrechnung für Körpergrößen, Bildschirm-Diagonalen und DIY-Maße.
