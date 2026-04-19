---
toolId: png-jpg-to-webp
language: de
title: "PNG und JPG in WebP umwandeln – ohne Upload"
metaDescription: "PNG oder JPG in WebP umwandeln: deutlich kleinere Dateien bei gleicher Qualität. Läuft komplett im Browser, ohne Upload, Anmeldung oder Tracking."
tagline: "Bilder direkt im Browser komprimieren — kein Server, kein Tracking."
intro: "Der Konverter wandelt eine PNG- oder JPG-Datei in das moderne WebP-Format um und reduziert die Dateigröße in den meisten Fällen um 25 bis 35 Prozent — bei vergleichbarer visueller Qualität. Die Verarbeitung passiert ausschließlich in deinem Browser über die Canvas-API, kein Byte verlässt dein Gerät. Ideal für Web-Entwicklerinnen, Blogger und alle, die ihre Seitenladezeit verbessern wollen."
howToUse:
  - "Wähle eine PNG- oder JPG-Datei (max. 10 MB)"
  - "Stelle die Qualität ein (Standard 85 — guter Kompromiss zwischen Größe und Schärfe)"
  - "Lade die konvertierte WebP-Datei herunter"
faq:
  - q: "Was ist WebP?"
    a: "WebP ist ein von Google entwickeltes Bildformat, das gegenüber PNG und JPG bei vergleichbarer Qualität deutlich kleinere Dateien erzeugt. Es unterstützt sowohl verlustbehaftete als auch verlustfreie Kompression sowie Transparenz und Animation."
  - q: "Warum sollte ich PNG oder JPG in WebP umwandeln?"
    a: "Kleinere Bildateien laden schneller, sparen mobilen Datenverbrauch und verbessern Core-Web-Vitals-Metriken. Eine WebP-Datei ist im Schnitt 25 bis 35 Prozent kleiner als die JPG-Variante derselben Qualität — bei PNG-Quellen mit Transparenz oft noch deutlich mehr."
  - q: "Welche Browser unterstützen WebP?"
    a: "Alle aktuellen Versionen von Chrome, Firefox, Safari, Edge und Opera zeigen WebP nativ an. Insgesamt erreichst du damit über 97 Prozent der weltweiten Browser-Reichweite. Für ältere Browser bietet sich das Picture-Element mit JPG-Fallback an."
  - q: "Welche Qualitätsstufe ist die richtige?"
    a: "Für Web-Bilder ist der Standardwert 85 ein guter Kompromiss. Für Hero-Bilder oder Produktfotos kannst du auf 90 erhöhen, für Thumbnails reicht oft 70. Probiere mehrere Stufen und vergleiche das Ergebnis visuell."
  - q: "Wird meine Datei hochgeladen?"
    a: "Nein. Die Konvertierung läuft vollständig in deinem Browser über die Canvas-API. Es gibt weder Upload, noch Server-Verarbeitung, noch Tracking. Du kannst diese Seite sogar offline nutzen, sobald sie einmal geladen wurde."
relatedTools:
  - jpg-zu-png
  - bild-komprimieren
  - bild-groesse-aendern
contentVersion: 1
---

## Was ist WebP?

WebP ist ein 2010 von Google eingeführtes Bildformat, das speziell für das Web
entwickelt wurde. Es unterstützt sowohl verlustbehaftete (lossy) als auch
verlustfreie (lossless) Kompression sowie Transparenz und Animationen. Im
Vergleich zu JPG erzeugt WebP bei gleicher visueller Qualität durchschnittlich
25 bis 35 Prozent kleinere Dateien, gegenüber PNG sind die Einsparungen bei
Grafiken mit Transparenz oft noch deutlicher.

Die WebP-Spezifikation basiert auf dem Video-Codec VP8 und nutzt moderne
Kompressionstechniken wie Prädiktion zwischen Blöcken. Heute unterstützen alle
aktuellen Browser-Versionen das Format nativ — die globale Browser-Reichweite
liegt bei über 97 Prozent.

## Warum PNG/JPG in WebP umwandeln?

Kleinere Bildateien bedeuten schnellere Ladezeiten, geringeren mobilen
Datenverbrauch und bessere Core-Web-Vitals — insbesondere die Largest
Contentful Paint (LCP). Für SEO ist die Page-Speed seit dem Algorithmus-Update
2021 ein direkter Ranking-Faktor. Wer seine Bilder von JPG auf WebP umstellt,
spart auf typischen Content-Seiten 30 bis 50 Prozent Bandbreite ein.

Auch für PNG-Quellen mit Transparenz lohnt sich die Umstellung: WebP-Lossless
liegt im Schnitt 26 Prozent unter PNG, WebP-Lossy mit Alpha-Kanal sogar bei
nur einem Bruchteil. Für Logos, Icons und UI-Grafiken ist WebP damit das
modernere Format.

## Anwendungsbeispiele

**Blog-Artikel:** Headerbild und Inline-Grafiken von JPG auf WebP umstellen —
typische Einsparung 30 bis 40 Prozent pro Seite.

**E-Commerce:** Produktfotos in WebP ausliefern, mit JPG-Fallback im
Picture-Element. Schnellere Ladezeit erhöht die Conversion-Rate messbar.

**Portfolios:** Hochauflösende Fotografien von 4 MB auf 1 MB reduzieren, ohne
sichtbaren Qualitätsverlust für den Betrachter.

**Social-Media-Vorbereitung:** Vor dem Upload zu Plattformen, die WebP
akzeptieren (z. B. WhatsApp Web, neuere Discord-Versionen), die Datei lokal
komprimieren.

## Datenschutz — 100% im Browser

Die Konvertierung erfolgt vollständig client-seitig über die `OffscreenCanvas`
API deines Browsers. Deine Datei wird zu keinem Zeitpunkt an einen Server
gesendet, gespeichert oder analysiert. Es gibt kein Tracking, kein Cookie-Banner
für Drittanbieter-Cookies und keine Anmeldung.

Du kannst diese Seite nach dem ersten Laden auch offline weiternutzen — die
benötigten Browser-APIs sind seit 2018 in allen modernen Browsern verfügbar.
Für sensible Bilder (Ausweis-Scans, medizinische Aufnahmen, interne
Firmenunterlagen) ist das der entscheidende Vorteil gegenüber webbasierten
Konvertern, die deine Datei zwingend hochladen müssen.

## Häufige Fragen

### Was ist WebP?

WebP ist ein von Google entwickeltes Bildformat, das gegenüber PNG und JPG bei
vergleichbarer Qualität deutlich kleinere Dateien erzeugt. Es unterstützt
sowohl verlustbehaftete als auch verlustfreie Kompression sowie Transparenz
und Animation.

### Warum sollte ich PNG oder JPG in WebP umwandeln?

Kleinere Bildateien laden schneller, sparen mobilen Datenverbrauch und
verbessern Core-Web-Vitals-Metriken. Eine WebP-Datei ist im Schnitt 25 bis 35
Prozent kleiner als die JPG-Variante derselben Qualität — bei PNG-Quellen mit
Transparenz oft noch deutlich mehr.

### Welche Browser unterstützen WebP?

Alle aktuellen Versionen von Chrome, Firefox, Safari, Edge und Opera zeigen
WebP nativ an. Insgesamt erreichst du damit über 97 Prozent der weltweiten
Browser-Reichweite. Für ältere Browser bietet sich das Picture-Element mit
JPG-Fallback an.

### Welche Qualitätsstufe ist die richtige?

Für Web-Bilder ist der Standardwert 85 ein guter Kompromiss zwischen
Dateigröße und Schärfe. Für Hero-Bilder oder Produktfotos kannst du auf 90
erhöhen, für Thumbnails reicht oft 70. Probiere mehrere Stufen und vergleiche
das Ergebnis visuell.

### Wird meine Datei hochgeladen?

Nein. Die Konvertierung läuft vollständig in deinem Browser über die
Canvas-API. Es gibt weder Upload, noch Server-Verarbeitung, noch Tracking. Du
kannst diese Seite sogar offline nutzen, sobald sie einmal geladen wurde.

## Verwandte Konverter

- [JPG in PNG umwandeln](/de/jpg-zu-png)
- [Bild komprimieren](/de/bild-komprimieren)
- [Bildgröße ändern](/de/bild-groesse-aendern)
