---
toolId: "pdf-to-jpg"
language: "de"
title: "PDF in JPG umwandeln — Kostenlos, ohne Upload, bis 300 DPI"
metaDescription: "PDF als JPG exportieren direkt im Browser — kein Upload, keine Registrierung. Einzelne Seiten auswählen, DPI frei wählen (72/150/300). 100% client-seitig."
tagline: "Seiten auswählen, DPI wählen, sofort herunterladen"
intro: "PDF-Seiten in hochwertige JPG-Bilder konvertieren — komplett in deinem Browser. Keine Datei verlässt dein Gerät. Wähle einzelne Seiten, stelle die Auflösung bis 300&nbsp;DPI ein und lade die Bilder einzeln oder als ZIP herunter."
category: "document"
contentVersion: 1
headingHtml: "PDF in <em>JPG</em> umwandeln"
howToUse:
  - "PDF-Datei per Drag & Drop oder Klick auswählen."
  - "Im Vorschau-Grid die gewünschten Seiten per Checkbox markieren."
  - "Auflösung wählen: 72 DPI für Web, 150 DPI als Standard oder 300 DPI für Druck."
  - "Auf 'Konvertieren' klicken — jede Seite wird direkt im Browser gerendert."
  - "Seiten einzeln oder alle auf einmal als ZIP herunterladen."
faq:
  - q: "Wird mein PDF auf einen Server hochgeladen?"
    a: "Nein. Das Tool läuft vollständig in deinem Browser via PDF.js. Deine Datei verlässt dein Gerät zu keinem Zeitpunkt — technisch ist kein Upload möglich."
  - q: "Welche DPI-Einstellung brauche ich?"
    a: "72 DPI reicht für Web-Vorschauen und E-Mails. 150 DPI ist der Standard für Bildschirme und Präsentationen. 300 DPI ist Druckqualität — ideal für Visitenkarten, Poster oder Bewerbungsunterlagen."
  - q: "Kann ich einzelne Seiten aus einem mehrseitigen PDF auswählen?"
    a: "Ja. Nach dem Laden des PDFs siehst du ein Vorschau-Grid aller Seiten. Wähle per Checkbox aus, welche Seiten du als JPG exportieren möchtest."
  - q: "Was passiert bei passwortgeschützten PDFs?"
    a: "PDF.js zeigt einen Passwort-Dialog. Gib das korrekte Passwort ein und die Konvertierung läuft wie gewohnt ab."
  - q: "Warum ist JPG und nicht PNG sinnvoll?"
    a: "JPG ist kompakter und geeignet für farbige Dokumente, Fotos und Präsentationen. PNG wäre besser für reine Texte oder Screenshots mit scharfen Kanten. Für den typischen Dokumenten-Export ist JPG bei 300 DPI die bessere Wahl."
  - q: "Gibt es ein Datei-Limit?"
    a: "Kein künstliches Limit. Die Grenze ist der Arbeitsspeicher deines Geräts. Bei sehr großen PDFs (30+ Seiten, 300 DPI) empfehlen wir seitenweise Verarbeitung."
relatedTools:
  - jpg-zu-pdf
  - pdf-zusammenfuehren
  - pdf-aufteilen
---

## Was macht dieser Konverter?

Dieser PDF-zu-JPG-Konverter rasterisiert jede PDF-Seite direkt in deinem Browser — ohne Server, ohne Upload, ohne Datenschutz-Kompromisse. Die Konvertierung basiert auf PDF.js, der Open-Source-Rendering-Engine von Mozilla (Apache-2.0-Lizenz), die intern denselben Render-Stack nutzt wie Firefox.

Jede Seite wird auf ein Canvas-Element gerendert und als JPEG-Blob exportiert. Deine Dateien werden niemals an externe Server übertragen — ein klarer technischer Unterschied zu den 9&nbsp;anderen Anbietern, die alle auf Server-Upload angewiesen sind.

## DPI-Einstellungen erklärt

PDF verwendet intern 72 Punkte pro Zoll (pt/inch) als Basismaß. Der Render-Skalierungsfaktor wird aus deiner DPI-Wahl berechnet:

- **72&nbsp;DPI** — Skalierung 1,0×. Geeignet für Web-Thumbnails, E-Mail-Anhänge und schnelle Vorschauen.
- **150&nbsp;DPI** — Skalierung ≈&nbsp;2,08×. Standardqualität für Bildschirme und digitale Präsentationen. Eine DIN-A4-Seite ergibt 1.240&nbsp;×&nbsp;1.754&nbsp;Pixel.
- **300&nbsp;DPI** — Skalierung ≈&nbsp;4,17×. Druckqualität, empfohlen für Visitenkarten, Poster und Bewerbungsunterlagen. Eine DIN-A4-Seite ergibt 2.480&nbsp;×&nbsp;3.508&nbsp;Pixel (~26&nbsp;MB unkomprimiert, ~200–500&nbsp;KB als JPG).

Wichtig: "Hochskalieren" verbessert nur Vektorgrafiken und eingebetteten Text. Bei reinen Scan-PDFs (eingebettete Bitmaps) bleibt die Bildschärfe ab einem gewissen Punkt konstant — die Quelldatei bestimmt die Auflösung.

## Seiten-Auswahl per Vorschau-Grid

Statt das gesamte PDF zu konvertieren, kannst du präzise steuern, welche Seiten exportiert werden sollen. Nach dem Laden erscheinen alle Seiten als Thumbnail-Vorschauen. Wähle per Checkbox aus — etwa nur Seite&nbsp;1 für ein Angebot-Deckblatt oder Seiten 3–5 für eine Präsentation.

Dieses Feature fehlt bei 7 von 9&nbsp;Konkurrenten — der häufigste Use-Case (einzelne Seite aus einem längeren Dokument) war bisher nur durch "alles konvertieren und dann löschen" lösbar.

## Datenschutz bei sensiblen Dokumenten

Gehaltsabrechnungen, Verträge, Ausweise: Diese Dokumente sollten nie auf fremde Server geladen werden. Die Rechtslage in der DSGVO ist eindeutig — das Hochladen auf Drittanbieter-Server kann bereits eine Datenübermittlung darstellen.

Dieser Konverter macht Server-Upload technisch unmöglich. PDF.js läuft als JavaScript-Modul direkt im Browser-Sandbox. Die einzige Netzwerkanfrage beim Besuch dieser Seite ist das Laden der Seite selbst — danach ist alles lokal.

## Anwendungsbeispiele

- **Bewerbungsunterlagen als JPG:** Deckblatt oder Zeugnisseite als hochaufgelöstes Bild für Online-Formulare exportieren.
- **Präsentations-Slide extrahieren:** Einzelne Seite aus einer PDF-Präsentation als JPG für Thumbnails oder Social Media.
- **Scan-Seite weiterverarbeiten:** Gescannte Dokumente seitenweise als JPG für OCR oder Bildbearbeitungs-Software aufbereiten.
- **Vorschau-Thumbnails generieren:** Erste Seite eines Berichts als Vorschaubild für eine Dokumentenübersicht.

## Technische Hinweise

**Passwortgeschützte PDFs:** PDF.js löst eine `PasswordException` und zeigt einen Eingabe-Dialog. Bei falschem Passwort folgt eine klare Fehlermeldung.

**Transparente Ebenen:** JPEG unterstützt keinen Alpha-Kanal. Transparente PDF-Elemente werden auf weißem Hintergrund gerendert — dies ist bei Dokumenten-PDFs nahezu immer das gewünschte Ergebnis.

**Sehr große PDFs:** Ab 30&nbsp;Seiten bei 300&nbsp;DPI empfiehlt sich seitenweise Verarbeitung, da jede A4-Seite im Canvas ca.&nbsp;26&nbsp;MB Arbeitsspeicher benötigt.

## Häufige Fragen

Die häufigsten Fragen zur PDF-zu-JPG-Konvertierung sind oben in der FAQ-Sektion beantwortet.

## Verwandte Dokumenten-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JPG in PDF umwandeln](/de/jpg-zu-pdf)** — Bilder zu einem PDF zusammenführen, ohne Software.
- **[PDF zusammenführen](/de/pdf-zusammenfuehren)** — Mehrere PDF-Dateien zu einem einzigen Dokument kombinieren.
- **[PDF aufteilen](/de/pdf-aufteilen)** — Einzelne Seiten oder Seitenbereiche als separate PDFs extrahieren.
