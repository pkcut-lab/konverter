---
toolId: "pdf-merge"
language: "de"
title: "PDF zusammenführen — kostenlos & ohne Upload verbinden"
metaDescription: "Mehrere PDFs kostenlos zusammenführen — direkt im Browser, ohne Upload, ohne Anmeldung. Reihenfolge per Drag & Drop festlegen, sofort herunterladen."
tagline: "PDFs zusammenführen ohne Upload — alles bleibt auf deinem Gerät."
intro: "Führe mehrere PDF-Dateien zu einem einzigen Dokument zusammen — verlustfrei, vollständig im Browser und ohne Server-Upload. Reihenfolge per Drag&nbsp;&amp;&nbsp;Drop anpassen, Merge starten, fertig. Im Gegensatz zu iLovePDF, Smallpdf oder PDF24 verlassen deine Dokumente deinen Computer nie."
category: "document"
contentVersion: 1
headingHtml: "PDF <em>zusammenführen</em>"
howToUse:
  - "Dateien auswählen (Drag & Drop oder Datei-Browser, mehrere PDFs gleichzeitig möglich)"
  - "Reihenfolge per Drag & Drop anpassen — das Ergebnis folgt exakt dieser Reihenfolge"
  - "„Zusammenführen“ klicken und die fertige Datei herunterladen"
faq:
  - q: "Werden meine PDFs auf einen Server hochgeladen?"
    a: "Nein. Die gesamte Verarbeitung findet im Browser statt. Deine Dateien verlassen deinen Computer zu keinem Zeitpunkt. Es gibt keinen Server, keinen Upload und kein Tracking."
  - q: "Wie viele PDF-Dateien kann ich zusammenführen?"
    a: "So viele wie dein Arbeitsspeicher erlaubt — es gibt kein künstliches Limit. Auf einem normalen Desktop-Gerät sind 50 Dateien mit je mehreren Megabyte problemlos möglich."
  - q: "Gehen Schriften, Bilder und Formularfelder beim Merge verloren?"
    a: "Nein. Das Tool kopiert die Seiten verlustfrei — Schriften, eingebettete Bilder, Formularfelder und Annotations bleiben vollständig erhalten."
  - q: "Was passiert bei passwortgeschützten PDFs?"
    a: "Verschlüsselte PDFs werden mit einer klaren Fehlermeldung übersprungen — die zugrundeliegende Bibliothek pdf-lib kann verschlüsselte Inhalte nicht öffnen. Entsperre die Datei vorher in deinem PDF-Reader (z.&nbsp;B. Adobe Acrobat oder Vorschau) und lade sie dann erneut."
  - q: "Werden die Metadaten (Autor, Erstellungsdatum) aus den Quelldateien übernommen?"
    a: "Das zusammengeführte Dokument erhält ein neues Erstellungsdatum. Über die Option „Metadaten bereinigen“ kannst du Autor, Titel und Erstellungsinfo aus dem Output entfernen — kein anderes kostenloses Tool bietet diese Kontrolle."
relatedTools:
  - jpg-zu-pdf
aside:
  steps:
    - title: "PDFs auswählen"
      description: "Ziehe mehrere PDF-Dateien per Drag&nbsp;&amp;&nbsp;Drop in den Bereich oder wähle sie über den Datei-Browser aus. Alle gängigen PDF-Versionen werden unterstützt."
    - title: "Reihenfolge festlegen"
      description: "Schiebe die Dateikarten in die gewünschte Reihenfolge. Was oben steht, landet zuerst im Ergebnis."
    - title: "Zusammenführen & herunterladen"
      description: "Klicke auf „Zusammenführen“. Die fertige PDF-Datei wird sofort als Download bereitgestellt — keine Wartezeit, kein Cloud-Speicher."
  privacy: "Deine PDFs verlassen den Browser nicht. Die gesamte Verarbeitung läuft lokal mit pdf-lib (MIT-Lizenz). Kein Upload, kein Server, keine Anmeldung erforderlich."
datePublished: '2026-04-25'
dateModified: '2026-04-25'

---

## Wie funktioniert das Tool?

Das Tool nutzt **pdf-lib**, eine quelloffene JavaScript-Bibliothek (MIT-Lizenz),
um PDF-Dateien direkt im Browser zusammenzuführen. Die Bibliothek läuft vollständig
lokal — es gibt keine Serververbindung, keinen Upload und keine Verarbeitung durch
Dritte.

Technisch gesehen kopiert das Tool die Seiten jeder Quelldatei mit der Methode
`PDFDocument.copyPages()` in ein neues Zieldokument. Dabei werden alle
Einbettungen übernommen: Schriften, Rasterbilder, Vektorgrafiken,
Formularfelder und Annotations — verlustfrei und ohne Neuenkodierung. Die
Seitengrößen (A4, Letter, A5 etc.) bleiben unverändert; gemischte Formate
in einer Datei sind kein Problem.

Vor dem Laden wird jede Datei auf einen gültigen `%PDF-`-Magic-Header geprüft.
Beschädigte oder umbenannte Nicht-PDF-Dateien werden mit einer Fehlermeldung
übersprungen, ohne den gesamten Merge-Vorgang zu blockieren.

## Wie führst du PDFs zusammen?

Ziehe die gewünschten Dateien per Drag&nbsp;&amp;&nbsp;Drop auf die Dropzone
oder öffne den Datei-Browser über den Auswahl-Button. Du kannst mehrere
Dateien gleichzeitig auswählen. Jede Datei erscheint als Karte in der Liste,
sortiert nach der Reihenfolge, in der du sie hinzugefügt hast.

Zum Ändern der Reihenfolge ziehst du eine Karte an die gewünschte Position.
Die Reihenfolge in der Liste entspricht exakt der Seitenreihenfolge im
Ergebnis. Über das Mülleimer-Symbol entfernst du einzelne Dateien aus der
Liste, ohne den Rest zu verlieren.

Sobald mindestens zwei Dateien in der Liste liegen, wird der
„Zusammenführen"-Button aktiv. Nach dem Klick erscheint ein
Fortschrittsbalken — bei großen Dateien dauert der Vorgang einige Sekunden.
Das fertige Dokument wird als `zusammengefuehrt.pdf` zum Download
bereitgestellt.

## Datenschutz — 100 % im Browser

Alle gängigen PDF-Merge-Dienste (iLovePDF, Smallpdf, PDF24, Adobe Acrobat
Online, Sejda) übertragen deine Dateien auf ihre Server. Manche löschen
sie nach zwei Stunden, andere nach einem Tag — aber der Upload selbst
findet immer statt.

Das FBI warnte im März&nbsp;2025 öffentlich davor, dass viele kostenlose
PDF-Konverter als Malware-Fronten operieren: Sie stehlen persönliche Daten,
schleusen Spyware ein oder imitieren bekannte Marken wie Adobe. Auch ohne
böswillige Absicht überträgst du bei jedem Server-Upload vertrauliche Inhalte
— Vertragsseiten, Ausweise, Unternehmensdokumente — an einen Dritten.

Dieses Tool macht das strukturell unmöglich: Die Verarbeitung läuft
ausschließlich im Browser-Tab. Deine PDF-Dateien verlassen deinen Computer
nie, werden nicht gespeichert, nicht analysiert und nicht weitergegeben.
Es gibt kein Cookie-Banner für Werbepartner, keine Anmeldepflicht und
keine Nutzungsstatistiken.

## Welche PDF-Dateien werden unterstützt?

Das Tool verarbeitet alle gängigen PDF-Versionen (1.0 bis 2.0). Folgende
Eingaben werden unterstützt oder behandelt:

**Unterstützt ohne Einschränkung:**
- Standard-PDFs jeder Seitengröße (A4, Letter, A5, Querformat, gemischt)
- PDFs mit eingebetteten Schriften, Rasterbildern und Vektorgrafiken
- PDFs mit interaktiven Formularen und Annotations
- Bis zu beliebig viele Dateien (RAM-Grenze des Browsers)

**Mit Hinweis behandelt:**
- Leere PDFs (0 Seiten): Werden übersprungen, Merge läuft mit den verbleibenden Dateien weiter
- Sehr große Dateien (Gesamt >100&nbsp;MB): Warnung — auf älteren Geräten kann es langsamer sein

**Nicht unterstützt:**
- Dateien ohne gültigen `%PDF-`-Header (umbenannte Nicht-PDFs): Werden mit Fehlermeldung abgewiesen
- Passwortgeschützte PDFs: Werden übersprungen — bitte vorher entsperren und erneut hochladen

## Häufige Fragen

Die häufigsten Rückfragen zur Nutzung und zum Datenschutz des Tools:

### Werden meine PDFs auf einen Server hochgeladen?

Nein. Die gesamte Verarbeitung findet im Browser statt. Deine Dateien
verlassen deinen Computer zu keinem Zeitpunkt. Es gibt keinen Server,
keinen Upload und kein Tracking.

### Wie viele PDF-Dateien kann ich zusammenführen?

So viele wie dein Arbeitsspeicher erlaubt — es gibt kein künstliches Limit.
Auf einem normalen Desktop-Gerät sind 50&nbsp;Dateien mit je mehreren
Megabyte problemlos möglich. Ein Fortschrittsbalken zeigt den Fortschritt
bei größeren Batches an.

### Gehen Schriften, Bilder und Formularfelder beim Merge verloren?

Nein. Das Tool kopiert die Seiten verlustfrei — Schriften, eingebettete
Bilder, Formularfelder und Annotations bleiben vollständig erhalten. Es
wird nicht neu gerendert oder reenkodiert.

### Was passiert bei passwortgeschützten PDFs?

Verschlüsselte PDFs werden mit einer klaren Fehlermeldung übersprungen —
die zugrundeliegende Bibliothek pdf-lib kann verschlüsselte Inhalte nicht
öffnen. Entsperre die Datei vorher in deinem PDF-Reader (z.&nbsp;B. Adobe
Acrobat oder Vorschau) und lade sie dann erneut.

### Werden die Metadaten aus den Quelldateien übernommen?

Das zusammengeführte Dokument erhält ein neues Erstellungsdatum. Über die
Option „Metadaten bereinigen" kannst du Autor, Titel und Erstellungsinfo
aus dem Output entfernen. Kein anderes kostenloses Tool bietet diese Kontrolle.

## Welche Dokumenten-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JPG zu PDF](/de/jpg-zu-pdf)** — Bilder verlustfrei in eine einzige PDF zusammenführen, vollständig im Browser, ohne Upload.
- **[Hintergrund entfernen](/de/hintergrund-entfernen)** — Motiv vom Bildhintergrund freistellen mit KI, lokal im Browser ohne Upload.
- **[Base64-Encoder](/de/base64-encoder)** — Dateien und Text in Base64 kodieren und dekodieren, ideal für eingebettete Ressourcen.
