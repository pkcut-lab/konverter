---
toolId: "jpg-to-pdf"
language: "de"
title: "JPG zu PDF — Bilder lokal in PDF konvertieren"
metaDescription: "JPG, PNG und WebP zu PDF konvertieren — vollständig im Browser, kein Upload, kein Tracking. DSGVO-konform durch Architektur, nicht durch Policy."
tagline: "Bewerbungsfotos, Belege und Ausweise lokal zu PDF zusammenfügen — ohne Server-Upload"
intro: "Konvertiere JPG, PNG und WebP-Bilder direkt in deinem Browser zu PDF. Kein Upload auf fremde Server, kein Tracking, keine Anmeldung. Die Datei verlässt dein Gerät niemals — DSGVO-konform durch Architektur, nicht durch Datenschutz-Policy."
category: "document"
contentVersion: 1
headingHtml: "JPG zu <em>PDF</em> umwandeln"
howToUse:
  - "Wähle eine JPG-, PNG- oder WebP-Datei per Klick, Drag-and-Drop oder Strg+V aus der Zwischenablage."
  - "Optional auf Mobilgeräten: Direkt mit der Kamera ein Foto aufnehmen — der Browser ruft die Kamera auf."
  - "Das PDF wird sofort lokal erzeugt — JPEGs werden verlustfrei eingebettet, PNG und WebP werden vor dem Einbetten zu JPEG konvertiert."
  - "Lade das fertige PDF herunter — die Quelldatei verlässt nie deinen Browser."
faq:
  - q: "Werden meine Bilder auf einen Server hochgeladen?"
    a: "Nein. Die Konvertierung passiert vollständig in deinem Browser via JavaScript und WebAssembly. Es gibt keinen Server-Upload, kein Backend, das deine Datei sieht. Du kannst dein WLAN nach dem Laden der Seite ausschalten und das Tool funktioniert weiter — der beste Beweis für lokale Verarbeitung."
  - q: "Welche Bildformate werden unterstützt?"
    a: "JPG/JPEG, PNG und WebP werden unterstützt. JPEGs werden ohne Qualitätsverlust direkt in das PDF eingebettet — die Original-Bytes wandern unverändert in die Datei. PNG und WebP werden vor dem Einbetten zu JPEG konvertiert, da PDF kein natives PNG-Streaming kennt."
  - q: "Bleibt die Bildqualität erhalten?"
    a: "Bei JPEG-Eingabe ja — kein Re-Encoding, die Original-JPEG-Bytes werden 1:1 ins PDF übernommen. Bei PNG- oder WebP-Eingabe wird einmalig zu JPEG mit Qualität 90 Prozent konvertiert. Viele Konkurrenten re-komprimieren auch JPEG-Eingaben zusätzlich, was zu Qualitätsverlust führt — wir nicht."
  - q: "Wie groß darf meine Datei sein?"
    a: "Die maximale Dateigröße beträgt 25 Megabyte pro Bild. Das deckt typische Smartphone-Fotos (8–12 Megapixel, 5–15 MB), eingescannte Dokumente (300 DPI bei A4 etwa 2–8 MB) und Bewerbungsfotos vollständig ab. Bei größeren Dateien empfiehlt sich vorherige Komprimierung."
  - q: "Funktioniert das Tool offline?"
    a: "Ja, nach dem ersten Seitenaufruf. Das gesamte JavaScript wird beim ersten Besuch in den Browser-Cache geladen, anschließend funktioniert die Konvertierung auch ohne Internetverbindung. Praktisch unterwegs oder auf Reisen ohne stabile Verbindung."
  - q: "Kann ich mehrere Bilder zu einem PDF zusammenfügen?"
    a: "Aktuell wird ein Bild pro PDF unterstützt. Für mehrseitige PDFs aus mehreren Bildern ist ein erweitertes Multi-Page-Mode geplant. Alternativ einzelne PDFs erstellen und mit dem PDF-Zusammenführen-Tool kombinieren, sobald verfügbar."
relatedTools: ['cashflow-rechner', 'erbschaftsteuer-rechner', 'bild-zu-text']
datePublished: '2026-04-25'
dateModified: '2026-04-25'

---

## Was leistet der JPG-zu-PDF-Konverter?

Das Tool wandelt einzelne JPG-, PNG- oder WebP-Bilder in PDF-Dokumente um — vollständig im Browser, ohne Server-Upload. Die Konvertierung nutzt die native Bildeinbettung der PDF-Spezifikation (ISO 32000): JPEG-Streams werden direkt und verlustfrei eingebettet, PNG und WebP werden vor dem Einbetten lokal in JPEG umgewandelt.

Im Gegensatz zu allen sieben großen Online-Konkurrenten findet keine Übertragung an einen externen Server statt. Die Datei verlässt nie dein Gerät. Das ist DSGVO-Konformität durch Architektur, nicht durch Datenschutz-Versprechen.

## Warum lokal konvertieren statt hochladen?

Bewerbungsfotos, Einkommensnachweise, Mietverträge, Ausweisdokumente — typische Anwendungsfälle für JPG-zu-PDF enthalten oft sensible personenbezogene Daten. Server-basierte Konverter zwingen dich, diese Daten an einen Drittanbieter zu übertragen. Auch bei DSGVO-konformer Verarbeitung gilt: Was nicht hochgeladen wird, kann nicht geleakt, gespeichert oder zum AI-Training verwendet werden.

Drei Vorteile gegenüber Server-Tools:

- **Keine Datenpannen-Exposition.** Konverter wie iLovePDF, Smallpdf oder PDF24 hatten in den vergangenen Jahren mehrere Vorfälle, bei denen hochgeladene Dateien temporär für Dritte einsehbar waren.
- **Keine AI-Training-Verwertung.** Cloud-Anbieter dürfen — sofern in den AGB versteckt — hochgeladene Dateien für Modell-Training verwenden. Lokale Verarbeitung schließt das aus.
- **Offline-Fähigkeit.** Nach dem ersten Laden der Seite funktioniert das Tool ohne Internet.

## Was ist verlustfreie JPEG-Einbettung?

Die meisten browser- und server-basierten Konkurrenten re-komprimieren JPEG-Eingaben intern. Das führt zu zusätzlichem Qualitätsverlust durch Doppel-Kompression — die Original-JPEG ist bereits lossy, eine zweite JPEG-Codierung addiert sichtbare Artefakte.

Unser Konverter bettet JPEG-Streams stattdessen direkt und unverändert ins PDF ein. Das bedeutet: deine 5-MB-JPEG-Datei landet als 5-MB-JPEG-Stream im PDF, byte-identisch zur Eingabe. Kein Qualitätsverlust, kein zusätzliches Speicher-Overhead.

## Welche Anwendungsbeispiele gibt es?

**Bewerbungsfoto:** Du fotografierst dein Bewerbungsfoto mit dem Smartphone, öffnest die Seite mobil und tippst „Foto aufnehmen" — die Browser-Kamera startet, du löst aus, das PDF ist fertig. Für die meisten Bewerbungs-Onlineformulare wird PDF statt JPG verlangt.

**Einkommensbeleg-Scan:** Du hast eine Gehaltsabrechnung als JPG (vom Smartphone-Scan) und brauchst sie als PDF für den Vermieter. Drag-and-Drop, Download — fertig in unter zwei Sekunden.

**Ausweisdokument:** Bank, Versicherung oder Behörde verlangt Ausweis-Vorder- und Rückseite als PDF. Datenschutz ist hier hochkritisch — lokale Konvertierung verhindert, dass Pass- und Personalausweisdaten je deinen Browser verlassen.

**Quittungs-Archivierung:** Belege für Steuererklärung sammeln, jeweils als PDF speichern. Lokal funktioniert das auch ohne WLAN — z.B. unterwegs nach dem Tankstellenbesuch.

## Welche Einsatzgebiete gibt es?

- Bewerbungs-Onlineformulare (LinkedIn, Stepstone, indeed) verlangen PDF statt Bild
- Vermieter-Anfragen (Schufa, Einkommensnachweis, Mietschuldenfreiheitsbescheinigung)
- Bank- und Versicherungs-Onboarding (Ausweiskopie, Adressnachweis)
- Behördenanträge (BAföG, Wohngeld, Eltern­geld) mit PDF-Pflichtfeldern
- Steuerbeleg-Archivierung im DATEV-, ELSTER- oder Sevdesk-Workflow

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Welche Dokumenten-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Cashflow Rechner](/de/cashflow-rechner)** — Liquidität nach direkter, indirekter und Free-Cashflow-Methode mit live Formel-Aufschlüsselung berechnen.
- **[Erbschaftsteuer Rechner](/de/erbschaftsteuer-rechner)** — Erbschaftsteuer 2026 mit Freibetrag, Steuerklasse und Härteausgleich §24 ErbStG ermitteln.
- **[Bild zu Text](/de/bild-zu-text)** — Text aus Bildern lokal im Browser extrahieren, ohne Server-Upload.
