---
toolId: contrast-checker
language: de
title: "Kontrast-Prüfer – WCAG-Kontrastverhältnis berechnen"
headingHtml: "<em>Kontrast</em> prüfen"
metaDescription: "WCAG-Kontrastverhältnis zweier Farben berechnen: AA- und AAA-Konformität für Normal- und Großtext sofort prüfen. Komplett im Browser, ohne Tracking."
tagline: "Zwei Farben eingeben, Kontrastverhältnis und WCAG-Konformität sofort ablesen — client-seitig, ohne Tracking."
intro: "Der Kontrast-Prüfer berechnet das Kontrastverhältnis zweier Hex-Farben nach WCAG 2.1 und zeigt sofort, ob die Kombination die Konformitätsstufen AA und AAA für Normal- und Großtext erfüllt. Die Berechnung läuft vollständig im Browser."
howToUse:
  - "Gib zwei HEX-Farbcodes ein, getrennt durch Leerzeichen oder Komma (z. B. #333333 #FFFFFF)"
  - "Das Kontrastverhältnis und die WCAG-Bewertung erscheinen sofort"
  - "Passe die Farben an, bis die gewünschte Konformitätsstufe erreicht ist"
faq:
  - q: "Was ist ein gutes Kontrastverhältnis?"
    a: "WCAG AA verlangt mindestens 4,5:1 für normalen Text und 3:1 für großen Text. AAA erfordert 7:1 bzw. 4,5:1. Schwarz auf Weiß erreicht das Maximum von 21:1."
  - q: "Wie berechnet man das Kontrastverhältnis?"
    a: "Man ermittelt die relative Luminanz beider Farben nach der WCAG-2.1-Formel, setzt die hellere und dunklere Luminanz ins Verhältnis (L1 + 0,05) / (L2 + 0,05) und erhält einen Wert zwischen 1:1 und 21:1."
  - q: "Was zählt als großer Text?"
    a: "Mindestens 18 pt (24 px) in normaler Schriftstärke oder 14 pt (18,66 px) in Fettschrift. Für großen Text gelten niedrigere Kontrast-Anforderungen."
  - q: "Reicht AA-Konformität aus?"
    a: "AA ist die gängige Mindestanforderung für Webseiten und Apps. AAA bietet höhere Lesbarkeit, ist aber schwieriger einzuhalten und wird seltener als Pflicht verlangt."
  - q: "Werden die Farben an einen Server geschickt?"
    a: "Nein. Die gesamte Berechnung läuft lokal im Browser. Es werden keine Daten übertragen."
relatedTools:
  - hex-rgb-konverter
category: color
contentVersion: 1
datePublished: '2026-04-21'
dateModified: '2026-04-21'

---

## Was macht der Prüfer?

Der Kontrast-Prüfer nimmt zwei Hex-Farbcodes entgegen und berechnet das Kontrastverhältnis nach der WCAG-2.1-Spezifikation. Er zeigt an, ob die Farbkombination die Konformitätsstufen AA und AAA für normalen Text und großen Text erfüllt. So lassen sich Barrierefreiheits-Probleme erkennen, bevor ein Design live geht.

## Was ist die Umrechnungsformel?

Die Berechnung folgt zwei Schritten. Zuerst wird die relative Luminanz jeder Farbe ermittelt. Dazu werden die sRGB-Kanalwerte (0-255) in den linearen Farbraum transformiert und gewichtet summiert:

`L = 0,2126 * R_lin + 0,7152 * G_lin + 0,0722 * B_lin`

Dabei gilt für jeden Kanal: Liegt der normalisierte Wert (0-1) unter 0,04045, wird durch 12,92 geteilt. Sonst gilt die Gamma-Formel `((c + 0,055) / 1,055) ^ 2,4`.

Im zweiten Schritt ergibt sich das Kontrastverhältnis aus den beiden Luminanzen:

`Kontrast = (L_hell + 0,05) / (L_dunkel + 0,05)`

Das Ergebnis liegt zwischen 1:1 (identische Farben) und 21:1 (Schwarz auf Weiß). WCAG AA verlangt mindestens 4,5:1 für normalen Text und 3:1 für großen Text. AAA erfordert 7:1 bzw. 4,5:1.

## Welche Anwendungsbeispiele gibt es?

| Vordergrund | Hintergrund | Verhältnis | AA Normal | AAA Normal |
|-------------|-------------|------------|-----------|------------|
| #000000     | #FFFFFF     | 21:1       | Ja        | Ja         |
| #767676     | #FFFFFF     | 4,54:1     | Ja        | Nein       |
| #AAAAAA     | #FFFFFF     | 2,32:1     | Nein      | Nein       |
| #333333     | #FFFFFF     | 12,63:1    | Ja        | Ja         |
| #0000FF     | #FFFFFF     | 8,59:1     | Ja        | Ja         |
| #FF0000     | #FFFFFF     | 4:1        | Nein      | Nein       |
| #FFFFFF     | #FFFFFF     | 1:1        | Nein      | Nein       |

Die Farbe #767676 ist ein bekannter Grenzwert: Sie erreicht auf weißem Hintergrund gerade noch die AA-Schwelle für normalen Text.

## Welche Einsatzgebiete gibt es?

**Webdesign und UI-Entwicklung:** Vor jedem Release prüfen Designer und Entwickler, ob Textfarben auf ihren Hintergründen ausreichend Kontrast bieten. Der Prüfer liefert die Antwort in Sekunden, ohne externes Tool oder Browser-Extension.

**Corporate-Design-Audits:** Brand-Guidelines definieren Primär- und Sekundärfarben als Hex-Codes. Wer Compliance-Berichte für BITV oder EN 301 549 erstellt, braucht die WCAG-Bewertung für jede Farbkombination.

**Barrierefreiheits-Tests:** Automatische Audit-Tools wie Lighthouse markieren Kontrastfehler, erklären aber nicht, wie nah eine Farbe an der Schwelle liegt. Der Prüfer zeigt den exakten Wert und macht die Entscheidung transparent.

**E-Mail-Templates:** Viele Clients rendern nur Inline-Styles. Ein schneller Kontrastcheck vor dem Versand verhindert, dass heller Text auf hellem Hintergrund für einen Teil der Empfänger unlesbar wird.

## Häufige Fragen

### Was ist ein gutes Kontrastverhältnis?

WCAG AA verlangt mindestens 4,5:1 für normalen Text und 3:1 für großen Text. AAA erfordert 7:1 bzw. 4,5:1. Schwarz auf Weiß erreicht das Maximum von 21:1.

### Wie berechnet man das Kontrastverhältnis?

Man ermittelt die relative Luminanz beider Farben nach der WCAG-2.1-Formel, setzt die hellere und dunklere Luminanz ins Verhältnis (L1 + 0,05) / (L2 + 0,05) und erhält einen Wert zwischen 1:1 und 21:1.

### Was zählt als großer Text?

Mindestens 18 pt (24 px) in normaler Schriftstärke oder 14 pt (18,66 px) in Fettschrift. Für großen Text gelten niedrigere Kontrast-Anforderungen.

### Reicht AA-Konformität aus?

AA ist die gängige Mindestanforderung für Webseiten und Apps. AAA bietet höhere Lesbarkeit, ist aber schwieriger einzuhalten und wird seltener als Pflicht verlangt.

### Werden die Farben an einen Server geschickt?

Nein. Die gesamte Berechnung läuft lokal im Browser. Es werden keine Daten übertragen.

## Welche Farb-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[HEX in RGB umrechnen](/de/hex-rgb-konverter)** — Hex-Farbcodes in RGB, HSL und OKLCH konvertieren für CSS-Authoring und Design-Workflows.
