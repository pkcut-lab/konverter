---
toolId: "pdf-split"
language: "de"
title: "PDF aufteilen — Seiten extrahieren ohne Upload"
metaDescription: "PDF im Browser aufteilen — Seiten extrahieren ohne Upload, ohne Anmeldung. Bereiche wie 1-3, 5, 7-9 angeben und sofort als PDF herunterladen."
tagline: "PDF in einzelne Bereiche aufteilen — vollständig im Browser, kein Server."
intro: "Teile ein PDF in einzelne Seiten oder Seitenbereiche auf — verlustfrei, vollständig im Browser und ohne Server-Upload. Gib Bereiche wie „1-3, 5, 7-9“ an und entscheide, ob alle ausgewählten Seiten in einer Datei oder pro Bereich getrennt heruntergeladen werden. Im Gegensatz zu PDF24, Sejda oder iLovePDF verlässt deine Datei deinen Computer nie."
category: "document"
contentVersion: 1
headingHtml: "PDF <em>aufteilen</em>"
howToUse:
  - "PDF auswählen (Drag & Drop oder Datei-Browser)"
  - "Seitenbereiche eingeben — z.&nbsp;B. „1-3, 5, 7-9“ für Seiten 1 bis 3, 5 und 7 bis 9"
  - "Modus wählen — eine Ergebnis-Datei oder pro Bereich getrennt"
  - "„Aufteilen“ klicken und die fertige PDF (oder PDFs) herunterladen"
faq:
  - q: "Wird meine PDF auf einen Server hochgeladen?"
    a: "Nein. Die Verarbeitung läuft vollständig im Browser. Deine Datei verlässt deinen Computer zu keinem Zeitpunkt — kein Server, kein Upload, kein Tracking."
  - q: "Welche Syntax kann ich für die Seitenbereiche verwenden?"
    a: "Komma-separierte Liste aus Einzelseiten und Bereichen. Beispiele: „5“ (nur Seite 5), „1-3“ (Seiten 1 bis 3), „1-3, 5, 7-9“ (kombiniert). Leerzeichen werden ignoriert. Reihenfolge im Output entspricht der Reihenfolge deiner Eingabe."
  - q: "Wie groß darf das PDF sein?"
    a: "Es gibt kein künstliches Limit — die Grenze ist dein Browser-Arbeitsspeicher. Auf einem normalen Desktop-Gerät sind PDFs bis 200&nbsp;MB problemlos. Bei deutlich größeren Dateien zeigt das Tool eine Hinweis-Warnung."
  - q: "Was passiert bei passwortgeschützten PDFs?"
    a: "Verschlüsselte PDFs werden mit einer klaren Fehlermeldung übersprungen — die zugrundeliegende Bibliothek pdf-lib kann verschlüsselte Inhalte nicht öffnen. Entsperre die Datei vorher in deinem PDF-Reader (z.&nbsp;B. Adobe Acrobat oder Vorschau) und lade sie dann erneut."
  - q: "Was ist der Unterschied zwischen „eine Datei“ und „pro Bereich“?"
    a: "Bei „eine Datei“ landen alle ausgewählten Seiten in einer einzigen Output-PDF. Bei „pro Bereich“ wird für jeden Komma-Eintrag eine separate PDF erzeugt — z.&nbsp;B. liefert „1-3, 5, 7-9“ drei getrennte Dateien."
relatedTools:
  - pdf-zusammenfuehren
  - jpg-zu-pdf
aside:
  steps:
    - title: "PDF auswählen"
      description: "Ziehe eine PDF-Datei per Drag&nbsp;&amp;&nbsp;Drop in den Bereich oder wähle sie über den Datei-Browser aus. Das Tool zeigt sofort die Gesamtseitenzahl."
    - title: "Bereiche festlegen"
      description: "Gib die gewünschten Seitenbereiche ein, z.&nbsp;B. „1-3, 5, 7-9“. Das Tool prüft live, ob alle Bereiche gültig sind."
    - title: "Aufteilen & herunterladen"
      description: "Klicke auf „Aufteilen“. Bei „eine Datei“ entsteht eine PDF, bei „pro Bereich“ erscheint eine Liste mit einem Download-Link pro Bereich."
  privacy: "Deine PDF verlässt den Browser nicht. Die gesamte Verarbeitung läuft lokal mit pdf-lib (MIT-Lizenz). Kein Upload, kein Server, keine Anmeldung erforderlich."
datePublished: '2026-04-25'
dateModified: '2026-04-25'

---

## Wie funktioniert das Tool?

Das Tool nutzt **pdf-lib**, eine quelloffene JavaScript-Bibliothek (MIT-Lizenz),
um PDF-Dateien direkt im Browser zu zerlegen. Die Bibliothek läuft vollständig
lokal — es gibt keine Serververbindung, keinen Upload und keine Verarbeitung
durch Dritte.

Technisch gesehen kopiert das Tool die ausgewählten Seiten mit
`PDFDocument.copyPages()` in ein neues Zieldokument. Schriften, eingebettete
Bilder, Vektorgrafiken, Formularfelder und Annotations bleiben dabei
verlustfrei erhalten — es wird nicht neu gerendert oder reenkodiert. Die
Seitengrößen (A4, Letter, A5 etc.) werden 1:1 übernommen.

Vor dem Laden wird die Datei auf einen gültigen `%PDF-`-Magic-Header geprüft.
Beschädigte oder umbenannte Nicht-PDF-Dateien werden mit einer Fehlermeldung
abgewiesen, ohne dass die Bibliothek geladen werden muss.

## Wie teilst du ein PDF auf?

Lade dein PDF per Drag&nbsp;&amp;&nbsp;Drop oder über den Datei-Browser hoch.
Das Tool zeigt sofort die Gesamtseitenzahl an. Im Eingabefeld „Seitenbereiche“
kannst du eine Komma-separierte Liste aus Einzelseiten und Bereichen
angeben — etwa `1-3, 5, 7-9` für die Seiten 1 bis 3, Seite 5 und die
Seiten 7 bis 9.

Mit dem Modus-Toggle entscheidest du, wie das Ergebnis ausgeliefert wird:

- **Eine Datei** — alle ausgewählten Seiten landen in einer einzigen PDF.
  Reihenfolge im Output entspricht der Reihenfolge deiner Eingabe.
- **Pro Bereich** — für jeden Komma-Eintrag entsteht eine separate PDF.
  Aus `1-3, 5, 7-9` werden drei Dateien.

Klicke auf „Aufteilen“ — die Verarbeitung läuft direkt im Browser-Tab. Die
fertigen Dateien stehen sofort als Download zur Verfügung.

## Datenschutz — 100 % im Browser

Alle gängigen PDF-Aufteilen-Dienste (PDF24, Sejda, iLovePDF, Smallpdf,
PDF2Go, SodaPDF) übertragen deine Datei auf ihre Server. Manche löschen
sie nach zwei Stunden, andere nach einem Tag — aber der Upload selbst
findet immer statt.

Das FBI warnte im März&nbsp;2025 öffentlich davor, dass viele kostenlose
PDF-Tools als Malware-Fronten operieren: Sie stehlen persönliche Daten,
schleusen Spyware ein oder imitieren bekannte Marken wie Adobe. Auch ohne
böswillige Absicht überträgst du bei jedem Server-Upload vertrauliche
Inhalte — Vertragsseiten, Ausweise, Steuerunterlagen — an einen Dritten.

Dieses Tool macht das strukturell unmöglich: Die Verarbeitung läuft
ausschließlich im Browser-Tab. Deine PDF verlässt deinen Computer nie,
wird nicht gespeichert, nicht analysiert und nicht weitergegeben. Es gibt
kein Cookie-Banner für Werbepartner, keine Anmeldepflicht und keine
Nutzungsstatistiken.

## Welche Eingaben werden akzeptiert?

Das Tool verarbeitet alle gängigen PDF-Versionen (1.0 bis 2.0) und
folgende Bereich-Notationen:

**Unterstützt ohne Einschränkung:**
- Einzelseiten: `5`
- Bereiche: `1-3`
- Kombinationen: `1-3, 5, 7-9`
- Leerzeichen um Trennzeichen: `1 - 3 , 5 , 7-9`
- Wiederholungen: `1, 1, 1` erzeugt drei Kopien derselben Seite

**Mit Hinweis behandelt:**
- Sehr große Dateien (>100&nbsp;MB): Warnung — auf älteren Geräten kann
  es etwas dauern
- Trailing Komma: `1-3,` wird wie `1-3` behandelt

**Nicht unterstützt:**
- Dateien ohne gültigen `%PDF-`-Header: werden mit Fehlermeldung abgewiesen
- Passwortgeschützte PDFs: bitte vorher im Reader entsperren
- Umgekehrte Bereiche wie `5-3`: Fehlermeldung mit Hinweis
- Seitenzahlen größer als die Gesamtseitenzahl: Fehlermeldung

## Häufige Fragen

Die häufigsten Rückfragen zur Nutzung und zum Datenschutz des Tools:

### Wird meine PDF auf einen Server hochgeladen?

Nein. Die Verarbeitung läuft vollständig im Browser. Deine Datei verlässt
deinen Computer zu keinem Zeitpunkt — kein Server, kein Upload, kein
Tracking.

### Welche Syntax kann ich für die Seitenbereiche verwenden?

Eine Komma-separierte Liste aus Einzelseiten und Bereichen. Beispiele:
`5` (nur Seite 5), `1-3` (Seiten 1 bis 3), `1-3, 5, 7-9` (kombiniert).
Leerzeichen werden ignoriert. Die Reihenfolge im Output entspricht
exakt der Reihenfolge deiner Eingabe.

### Wie groß darf das PDF sein?

Es gibt kein künstliches Limit — die Grenze ist dein Browser-Arbeitsspeicher.
Auf einem normalen Desktop-Gerät sind PDFs bis 200&nbsp;MB problemlos.
Bei deutlich größeren Dateien zeigt das Tool eine Hinweis-Warnung.

### Was ist der Unterschied zwischen „eine Datei“ und „pro Bereich“?

Bei „eine Datei“ landen alle ausgewählten Seiten in einer einzigen
Output-PDF. Bei „pro Bereich“ wird für jeden Komma-Eintrag eine separate
PDF erzeugt — z.&nbsp;B. liefert `1-3, 5, 7-9` drei getrennte Dateien.

### Was passiert bei passwortgeschützten PDFs?

Verschlüsselte PDFs werden mit einer klaren Fehlermeldung übersprungen —
die zugrundeliegende Bibliothek pdf-lib kann verschlüsselte Inhalte nicht
öffnen. Entsperre die Datei vorher in deinem PDF-Reader (z.&nbsp;B. Adobe
Acrobat oder Vorschau) und lade sie dann erneut.

## Welche Dokumenten-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[PDF zusammenführen](/de/pdf-zusammenfuehren)** — mehrere PDFs verlustfrei zu einem Dokument verbinden, vollständig im Browser, ohne Upload.
- **[JPG zu PDF](/de/jpg-zu-pdf)** — Bilder in eine einzige PDF-Datei zusammenführen, lokal im Browser ohne Server-Kontakt.
- **[Base64-Encoder](/de/base64-encoder)** — Dateien und Text in Base64 kodieren und dekodieren, ideal für eingebettete Ressourcen.
