---
toolId: "roman-numerals"
language: "de"
title: "Römische Zahlen umrechnen — Arabisch und Römisch"
headingHtml: "<em>Römische Zahlen</em> umrechnen"
metaDescription: "Römische Zahlen umrechnen: bidirektionaler Konverter mit Schritt-für-Schritt-Aufschlüsselung. Arabisch zu Römisch und zurück — 100 % im Browser."
tagline: "Arabische und römische Zahlen bidirektional umwandeln — mit Aufschlüsselung und Validierung."
intro: "Der Konverter wandelt arabische Zahlen (1–3999) in römische Ziffern um und umgekehrt. Die Erkennung erfolgt automatisch: Ziffern werden als arabische Zahl interpretiert, Buchstaben als römische. Bei jeder Umrechnung zeigt das Tool die Schritt-für-Schritt-Zerlegung. Ungültige Eingaben wie IC oder VX werden mit einer Erklärung der verletzten Regel abgelehnt. Alles läuft lokal im Browser — kein Server, kein Tracking."
category: "text"
contentVersion: 1
eyebrow: "KONVERTER"
howToUse:
  - "Gib eine arabische Zahl (1–3999) oder römische Ziffern (z. B. MCMXCIX) in das Eingabefeld ein."
  - "Das Ergebnis erscheint sofort — inklusive Aufschlüsselung der einzelnen Stellenwerte."
  - "Ungültige Eingaben werden mit einer Erklärung abgelehnt, z. B. warum IC keine gültige römische Zahl ist."
faq:
  - q: "Wie schreibt man 2026 in römischen Zahlen?"
    a: "2026 = MMXXVI. Aufschlüsselung: MM = 2000, XX = 20, VI = 6."
  - q: "Was bedeutet MCMXCIX?"
    a: "MCMXCIX = 1999. M = 1000, CM = 900, XC = 90, IX = 9."
  - q: "Warum steht auf Uhren IIII statt IV?"
    a: "Die sogenannte Uhrmacher-Vier (IIII) ist eine historische Konvention. Sie schafft ein visuelles Gleichgewicht zum gegenüberliegenden VIII auf dem Zifferblatt. Mathematisch korrekt ist IV."
  - q: "Warum ist IC keine gültige Schreibweise für 99?"
    a: "I darf in der Subtraktionsregel nur vor V oder X stehen — nicht vor C. Die korrekte Schreibweise für 99 ist XCIX (XC = 90, IX = 9)."
  - q: "Was ist die größte darstellbare römische Zahl?"
    a: "In der Standard-Notation ist MMMCMXCIX (3999) die größte darstellbare Zahl. Höhere Werte erfordern die Vinculum-Notation mit Überstrichen."
relatedTools:
  - zeichenzaehler
  - text-diff
  - base64-encoder
---

## Was macht der Konverter?

Der Konverter rechnet bidirektional zwischen arabischen Dezimalzahlen und römischen Ziffern um. Du gibst eine Zahl oder eine Zeichenfolge ein, das Tool erkennt automatisch das Format und liefert das Ergebnis. Der Bereich umfasst 1 bis 3999 — den klassischen Bereich der römischen Standardnotation.

Bei der Umrechnung von Arabisch nach Römisch wird jeder Stellenwert einzeln aufgeschlüsselt. So siehst du nicht nur das Ergebnis, sondern verstehst die Zusammensetzung: 1984 zerfällt in M (1000) + CM (900) + LXXX (80) + IV (4) = MCMLXXXIV.

## Umrechnungsformel

Römische Zahlen basieren auf sieben Grundzeichen mit festen Werten:

| Zeichen | Wert |
|---------|------|
| I | 1 |
| V | 5 |
| X | 10 |
| L | 50 |
| C | 100 |
| D | 500 |
| M | 1.000 |

Die drei Kernregeln:

1. **Additionsregel:** Gleiche oder absteigende Zeichen werden addiert. XVI = 10 + 5 + 1 = 16.
2. **Subtraktionsregel:** Ein kleineres Zeichen vor einem größeren wird subtrahiert. IV = 5 − 1 = 4. Erlaubt sind nur: I vor V/X, X vor L/C, C vor D/M.
3. **Wiederholungsregel:** Ein Zeichen darf maximal dreimal hintereinander stehen. 40 ist XL, nicht XXXX.

## Anwendungsbeispiele

Häufig nachgefragte Umrechnungen auf einen Blick:

| Arabisch | Römisch | Aufschlüsselung |
|----------|---------|-----------------|
| 4 | IV | 5 − 1 |
| 9 | IX | 10 − 1 |
| 49 | XLIX | XL (40) + IX (9) |
| 99 | XCIX | XC (90) + IX (9) |
| 490 | CDXC | CD (400) + XC (90) |
| 999 | CMXCIX | CM (900) + XC (90) + IX (9) |
| 2026 | MMXXVI | MM (2000) + XX (20) + VI (6) |
| 3999 | MMMCMXCIX | MMM (3000) + CM (900) + XC (90) + IX (9) |

Besonders bei Jahreszahlen und Geburtstagen in römischer Schreibweise — etwa für Tattoos, Gravuren oder Hochzeitseinladungen — hilft die Tabelle als Schnellreferenz.

## Häufige Einsatzgebiete

- **Tattoos und Gravuren** — Geburtsdaten oder Jahreszahlen in römischen Ziffern sind ein beliebtes Motiv. Der Konverter liefert die korrekte Schreibweise, die Aufschlüsselung dient als Gegenprobe vor dem Stechen.
- **Schulaufgaben und Prüfungen** — Die Subtraktionsregel ist ein häufiges Thema im Mathematikunterricht. Die Schritt-für-Schritt-Zerlegung hilft beim Verständnis.
- **Typografie und Design** — Kapitel-, Band- und Seitennummerierungen in Büchern, Filmen und Spielen verwenden römische Zahlen. Für korrekte Darstellung im Satz ist die Validierung nützlich.
- **Historische Jahreszahlen** — Inschriften auf Gebäuden, Denkmälern und Münzen tragen oft römische Jahreszahlen. Wer MDCCLXXVI auf einem Denkmal liest, kann mit dem Konverter schnell 1776 ermitteln.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Text-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Zeichenzähler](/de/zeichenzaehler)** — Zeichen, Wörter und Lesezeit für deutsche Texte in Echtzeit zählen.
- **[Text-Diff](/de/text-diff)** — Zwei Texte Zeile für Zeile vergleichen und Unterschiede farblich markieren.
- **[Base64-Encoder](/de/base64-encoder)** — Text in Base64 kodieren und dekodieren, direkt im Browser.
