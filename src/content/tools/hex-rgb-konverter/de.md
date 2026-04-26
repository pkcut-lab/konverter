---
toolId: hex-to-rgb
language: de
title: "HEX in RGB umrechnen – Farbcode-Konverter"
headingHtml: "HEX in <em>RGB</em> umrechnen"
metaDescription: "HEX-Farbcode in RGB, HSL und OKLCH umrechnen: sofortige Konvertierung mit Farbvorschau, Contrast-Check und Copy-Buttons. Ohne Tracking, ohne Upload."
tagline: "Farbcode-Umrechnung in Sekunden — client-seitig, ohne Tracking, mit OKLCH-Output."
intro: "Der Konverter wandelt einen HEX-Farbcode in RGB-Dezimalwerte, HSL und OKLCH um. Er akzeptiert 3-, 4-, 6- und 8-stellige Codes (mit oder ohne #) und zeigt die Ergebnisse sofort mit Farbvorschau. Alle Berechnungen laufen lokal im Browser — kein Server sieht deine Farben."
howToUse:
  - "Gib einen HEX-Farbcode ein (z. B. #FF5733)"
  - "Die RGB-, HSL- und OKLCH-Werte erscheinen sofort"
  - "Kopiere einzelne Formate oder alle auf einmal"
faq:
  - q: "Wie rechnet man HEX in RGB um?"
    a: "Jeder HEX-Code besteht aus drei Byte-Paaren (je 2 Hex-Ziffern). Jedes Paar wird von Basis 16 in Basis 10 umgerechnet: #FF5733 ergibt R=255, G=87, B=51."
  - q: "Was ist der Unterschied zwischen HEX und RGB?"
    a: "Beide beschreiben denselben sRGB-Farbraum. HEX ist eine kompakte Hexadezimal-Notation (#RRGGBB), RGB eine Dezimal-Notation mit drei Werten von 0 bis 255. Die Konvertierung ist mathematisch verlustfrei."
  - q: "Kann man HEX mit Transparenz angeben?"
    a: "Ja, mit 8-Digit-HEX (#RRGGBBAA). Die letzten zwei Ziffern definieren den Alpha-Kanal: 00 = vollständig transparent, FF = vollständig deckend. Das CSS-Äquivalent ist rgba()."
  - q: "Was bedeutet #000000?"
    a: "Schwarz. Alle drei Farbkanäle stehen auf 0 (R=0, G=0, B=0). Das Gegenstück #FFFFFF ist Weiß (R=255, G=255, B=255)."
  - q: "Warum OKLCH statt nur RGB?"
    a: "OKLCH ist ein wahrnehmungsgleichmäßiger Farbraum — gleiche numerische Abstände erzeugen gleich empfundene Farbunterschiede. Seit 2024 unterstützen alle Browser oklch() in CSS, was präzisere Farbpaletten und Gradient-Definitionen ermöglicht."
relatedTools:
  - json-formatter
  - regex-tester
  - zeichenzaehler
category: color
stats:
  - label: "Farbformate"
    value: "5"
  - label: "Konvertierung"
    value: "Echtzeit"
  - label: "Farbraum"
    value: "sRGB"
contentVersion: 1
datePublished: '2026-04-21'
dateModified: '2026-04-21'

---

## Was macht der Konverter?

Der Konverter wandelt einen HEX-Farbcode in RGB-Dezimalwerte um und zeigt zusätzlich die HSL- und OKLCH-Entsprechung. Er akzeptiert alle gängigen HEX-Formate: 3-Digit-Shorthand (#F0A), 6-Digit-Standard (#FF00AA) und 8-Digit mit Alpha-Kanal (#FF00AA88). Leerzeichen und Hash-Symbol werden automatisch bereinigt.

## Was ist die Umrechnungsformel?

Ein HEX-Farbcode codiert drei Farbkanäle (Rot, Grün, Blau) als jeweils zwei Hexadezimalziffern. Die Umrechnung zerlegt den Code in Byte-Paare und konvertiert jedes von Basis 16 in Basis 10:

`R = parseInt(hex[0:2], 16)` → Wert 0–255
`G = parseInt(hex[2:4], 16)` → Wert 0–255
`B = parseInt(hex[4:6], 16)` → Wert 0–255

Beispiel: #FF5733 → R = FF₁₆ = 255, G = 57₁₆ = 87, B = 33₁₆ = 51 → `rgb(255, 87, 51)`.

Bei 3-Digit-Shorthand wird jede Ziffer verdoppelt: #F0A → #FF00AA. Bei 8-Digit-HEX codieren die letzten zwei Ziffern den Alpha-Kanal: AA₁₆ = 170, normalisiert auf 170/255 ≈ 0,67.

Die Konvertierung ist mathematisch verlustfrei — HEX und RGB beschreiben denselben sRGB-Farbraum in unterschiedlicher Notation. Beide stammen aus der Frühzeit des Web: HEX aus HTML 2.0 (1995), rgb() aus CSS1 (1996).

## Welche Anwendungsbeispiele gibt es?

| HEX       | RGB              | HSL               |
|-----------|------------------|-------------------|
| #000000   | rgb(0, 0, 0)     | hsl(0, 0%, 0%)    |
| #FFFFFF   | rgb(255, 255, 255)| hsl(0, 0%, 100%) |
| #FF0000   | rgb(255, 0, 0)   | hsl(0, 100%, 50%) |
| #00FF00   | rgb(0, 255, 0)   | hsl(120, 100%, 50%)|
| #0000FF   | rgb(0, 0, 255)   | hsl(240, 100%, 50%)|
| #FF5733   | rgb(255, 87, 51) | hsl(11, 100%, 60%)|
| #8F3A0C   | rgb(143, 58, 12) | hsl(21, 85%, 30%) |

Zusätzlich berechnet der Konverter für jede Eingabe den OKLCH-Wert — relevant für modernes CSS-Authoring und Farbpaletten-Generierung.

## Welche Einsatzgebiete gibt es?

**Figma-Export nach CSS:** Design-Tools exportieren Farben als HEX. Für Tailwind-Config, CSS-Custom-Properties oder OKLCH-basierte Paletten braucht man die Dezimalwerte.

**Brand-Guidelines übersetzen:** Corporate-Design-PDFs definieren Farben meist als HEX. Wer daraus ein Web-Stylesheet baut, konvertiert systematisch in rgb() oder oklch() — je nach gewünschtem Farbraum.

**Accessibility-Prüfung:** Die RGB-Werte sind Eingabe für WCAG-Contrast-Berechnungen. Wer weiß, dass #FF5733 dem RGB-Tripel (255, 87, 51) entspricht, kann die relative Luminanz berechnen und den Contrast-Ratio gegen Schwarz oder Weiß bestimmen.

**E-Mail-Template-Debugging:** Viele E-Mail-Clients unterstützen nur HEX oder rgb() — kein HSL, kein OKLCH. Zum Debuggen wandelt man den Code zwischen den Formaten hin und her.

## Häufige Fragen

### Wie rechnet man HEX in RGB um?

Jeder HEX-Code besteht aus drei Byte-Paaren (je 2 Hex-Ziffern). Jedes Paar wird von Basis 16 in Basis 10 umgerechnet: #FF5733 ergibt R=255, G=87, B=51.

### Was ist der Unterschied zwischen HEX und RGB?

Beide beschreiben denselben sRGB-Farbraum. HEX ist eine kompakte Hexadezimal-Notation (#RRGGBB), RGB eine Dezimal-Notation mit drei Werten von 0 bis 255. Die Konvertierung ist mathematisch verlustfrei.

### Kann man HEX mit Transparenz angeben?

Ja, mit 8-Digit-HEX (#RRGGBBAA). Die letzten zwei Ziffern definieren den Alpha-Kanal: 00 = vollständig transparent, FF = vollständig deckend. Das CSS-Äquivalent ist rgba().

### Was bedeutet #000000?

Schwarz. Alle drei Farbkanäle stehen auf 0 (R=0, G=0, B=0). Das Gegenstück #FFFFFF ist Weiß (R=255, G=255, B=255).

### Warum OKLCH statt nur RGB?

OKLCH ist ein wahrnehmungsgleichmäßiger Farbraum — gleiche numerische Abstände erzeugen gleich empfundene Farbunterschiede. Seit 2024 unterstützen alle Browser oklch() in CSS, was präzisere Farbpaletten und Gradient-Definitionen ermöglicht.

## Welche Farb-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Zentimeter in Zoll](/de/zentimeter-zu-zoll)** — Längen-Umrechnung mit Schritt-für-Schritt-Rechenweg und Tabelle gängiger Werte.
- **[Meter zu Fuß](/de/meter-zu-fuss)** — Metrisch-zu-Imperial-Umrechnung für Körpergrößen, Architektur und DIY.
- **[Kilogramm zu Pfund](/de/kilogramm-zu-pfund)** — Gewichts-Umrechnung mit exaktem Faktor und Anwendungsbeispielen.
