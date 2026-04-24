---
toolId: "qr-code-generator"
language: "de"
title: "QR-Code Generator — QR-Code aus Text erstellen"
headingHtml: "<em>QR-Code</em> Generator"
metaDescription: "QR-Code Generator: Text oder URL in einen QR-Code umwandeln und als SVG herunterladen. 100&nbsp;% im Browser, kein Upload, DSGVO-konform und kostenlos."
tagline: "Beliebigen Text oder eine URL als QR-Code im SVG-Format erzeugen — direkt im Browser, ohne Server."
intro: "Der QR-Code Generator wandelt Text, URLs oder beliebige Zeichenketten in einen scannbaren QR-Code um. Die Ausgabe erfolgt als SVG-Grafik, die sich verlustfrei skalieren laesst. Die gesamte Kodierung laeuft lokal im Browser — kein Upload, kein Tracking, kein Server-Kontakt."
category: "image"
contentVersion: 1
eyebrow: "GENERATOR"
howToUse:
  - "Gib einen Text oder eine URL in das Eingabefeld ein."
  - "Der QR-Code erscheint sofort als SVG-Vorschau in der Ausgabe."
  - "Kopiere den SVG-Code oder nutze die Vorschau direkt in deinem Projekt."
faq:
  - q: "Welche Inhalte kann ich als QR-Code kodieren?"
    a: "Beliebiger Text bis ca. 200 Zeichen, URLs, E-Mail-Adressen oder WLAN-Zugangsdaten. Bei laengeren Texten steigt die QR-Version automatisch mit."
  - q: "Werden meine Daten an einen Server gesendet?"
    a: "Nein. Die gesamte QR-Kodierung laeuft im Browser. Es werden keine Daten uebertragen — weder an den Seitenbetreiber noch an Dritte."
  - q: "Warum SVG statt PNG?"
    a: "SVG ist ein Vektorformat. Der QR-Code laesst sich auf jede Groesse skalieren, ohne dass Pixel sichtbar werden. Ideal fuer Druck, Poster und responsives Webdesign."
  - q: "Welches Fehlerkorrektur-Level wird verwendet?"
    a: "Der Generator nutzt Error Correction Level M (ca. 15&nbsp;% Wiederherstellung). Damit bleibt der Code auch bei leichten Beschaedigungen oder Verschmutzungen lesbar."
  - q: "Kann ich den QR-Code fuer kommerzielle Zwecke verwenden?"
    a: "Ja. QR-Codes unterliegen keiner Lizenzpflicht. Du darfst den generierten Code frei auf Visitenkarten, Flyern, Verpackungen oder Webseiten einsetzen."
relatedTools:
  - webp-konverter
  - hintergrund-entfernen
---

## Was macht der Generator?

Der QR-Code Generator kodiert beliebigen Text in ein zweidimensionales Muster aus schwarzen und weissen Modulen. Scanner-Apps auf Smartphones oder Tablets lesen dieses Muster und geben den gespeicherten Inhalt wieder — typischerweise eine URL, die sich direkt im Browser oeffnet. Die Ausgabe erfolgt als SVG, das sich verlustfrei in jeder Groesse darstellen laesst. Die Kodierung nutzt den Byte-Modus mit UTF-8 und Error Correction Level M, sodass der Code auch bei leichter Beschaedigung lesbar bleibt.

## Umrechnungsformel

QR-Codes basieren auf dem ISO/IEC-18004-Standard. Die Kodierung folgt einem mehrstufigen Prozess:

1. **Modus-Wahl:** Der Byte-Modus (Indikator `0100`) kodiert beliebige UTF-8-Zeichen.
2. **Versions-Wahl:** Die QR-Version bestimmt die Matrixgroesse — Version 1 hat 21 x 21 Module, jede weitere Version addiert 4 Module pro Seite.
3. **Fehlerkorrektur:** Reed-Solomon-Codes ergaenzen redundante Codewoerter. Level M stellt ca. 15&nbsp;% der Daten wieder her.
4. **Maskierung:** Acht Masken werden getestet, die mit dem niedrigsten Penalty-Score wird angewandt — das verhindert grosse einfarbige Flaechen, die Scanner irritieren.

Beispiel: Der Text `https://example.com` (20 Bytes) passt in Version 1 (Kapazitaet 14 Bytes wird ueberschritten) — der Generator waehlt automatisch Version 2 mit 25 x 25 Modulen.

## Anwendungsbeispiele

Typische Eingaben und ihre Verwendung:

| Eingabe | Verwendung |
|---------|------------|
| `https://example.com` | Website-Link auf Visitenkarte |
| `mailto:info@firma.de` | E-Mail-Kontakt auf Flyer |
| `WIFI:T:WPA;S:MeinNetz;P:geheim;;` | WLAN-Zugang fuer Gaeste |
| `tel:+4930123456` | Telefonnummer auf Plakat |
| `BEGIN:VCARD...` | Kontaktdaten als vCard |
| Freitext (bis ca. 200 Zeichen) | Notizen, Codes, Seriennummern |

Je kuerzer der Text, desto kleiner und robuster der resultierende QR-Code.

## Haeufige Einsatzgebiete

- **Marketing und Print** — QR-Codes auf Visitenkarten, Flyern, Plakaten und Produktverpackungen verlinken direkt auf Landingpages oder Kontaktformulare. Das SVG-Format stellt sicher, dass der Code auch im Grossformat gestochen scharf bleibt.

- **Gastronomie und Einzelhandel** — Speisekarten, Tischaufsteller und Schaufenster-Displays nutzen QR-Codes fuer kontaktlose Bestellungen, Bewertungslinks oder Oeffnungszeiten.

- **Veranstaltungen und Tickets** — Eintrittskarten mit QR-Code ersetzen gedruckte Barcodes. Der Byte-Modus kodiert Buchungsnummern oder URLs zu digitalen Wallets.

- **IT und Netzwerk** — WLAN-Zugangsdaten als QR-Code aushaengen, statt Passwoerter muendlich weiterzugeben. Gaeste scannen den Code und verbinden sich automatisch.

## Haeufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) fuer Suchmaschinen ausgegeben.

## Verwandte Bild-Tools

Weitere Tools aus dem Konverter-Oekosystem, die zum Thema passen:

- **[WebP-Konverter](/de/webp-konverter)** — PNG- und JPG-Bilder verlustfrei oder verlustbehaftet ins WebP-Format umwandeln.
- **[Hintergrund entfernen](/de/hintergrund-entfernen)** — Bildhintergrund per KI-Modell direkt im Browser transparent machen.
- **[HEX-RGB-Konverter](/de/hex-rgb-konverter)** — Hex-Farbwerte und RGB-Tripel bidirektional umrechnen.
