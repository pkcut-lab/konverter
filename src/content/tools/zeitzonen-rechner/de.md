---
toolId: "timezone-converter"
language: "de"
title: "Zeitzonen umrechnen — Uhrzeit weltweit konvertieren"
headingHtml: "Zeitzonen <em>umrechnen</em>"
metaDescription: "Uhrzeit zwischen Zeitzonen umrechnen: Berlin, New York, Tokio und 7 weitere Zonen. Automatische Sommerzeit-Erkennung, kein Tracking, 100&nbsp;% im Browser."
tagline: "Uhrzeit zwischen 10 gängigen Zeitzonen konvertieren — mit automatischer Sommerzeit-Erkennung."
intro: "Rechne Uhrzeiten zwischen Zeitzonen um. Gib eine Uhrzeit und eine IANA-Zeitzone ein — der Rechner zeigt dir sofort die entsprechende Uhrzeit in 10 wichtigen Zeitzonen weltweit. Sommerzeit (DST) wird automatisch berücksichtigt. Kein Server, kein Upload, alles läuft im Browser."
category: "time"
contentVersion: 1
howToUse:
  - "Gib eine Uhrzeit im Format HH:MM ein, gefolgt von der Quell-Zeitzone (z. B. '14:30 Europe/Berlin')."
  - "Das Ergebnis zeigt die umgerechnete Uhrzeit in 10 Zeitzonen — von Berlin bis Sydney."
  - "Kopiere das Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Welches Format erwartet der Zeitzonen-Rechner?"
    a: "HH:MM gefolgt von einer IANA-Zeitzone, z. B. '14:30 Europe/Berlin' oder '09:00 America/New_York'. Sekunden sind optional: '14:30:45 Europe/Berlin'."
  - q: "Was ist eine IANA-Zeitzone?"
    a: "Ein standardisiertes Format wie 'Europe/Berlin' oder 'Asia/Tokyo'. IANA-Zeitzonen berücksichtigen Sommerzeit-Regeln automatisch. Abkürzungen wie 'CET' oder 'EST' sind mehrdeutig und werden nicht unterstützt."
  - q: "Wird Sommerzeit automatisch berücksichtigt?"
    a: "Ja. Der Rechner nutzt Intl.DateTimeFormat, das die aktuellen DST-Regeln deines Browsers verwendet. Wenn Berlin in MESZ (UTC+2) ist, wird das korrekt angezeigt."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die gesamte Umrechnung läuft im Browser über die JavaScript-Intl-API. Kein Netzwerk-Request, kein Logging, kein Tracking."
  - q: "Kann ich eigene Zeitzonen hinzufügen?"
    a: "Aktuell sind 10 Zeitzonen fest konfiguriert: Berlin, London, New York, Los Angeles, Tokio, Shanghai, Dubai, Sydney, São Paulo und Kolkata. Eigene Zonen sind für eine spätere Version geplant."
relatedTools:
  - unix-timestamp
  - json-formatter
  - zeichenzaehler
---

## Was macht der Konverter?

Der Zeitzonen-Rechner konvertiert eine Uhrzeit aus einer beliebigen IANA-Zeitzone in 10 gängige Zeitzonen weltweit. Du gibst eine Uhrzeit und eine Quell-Zeitzone ein — der Rechner zeigt dir sofort, wie spät es in Berlin, New York, Tokio und sieben weiteren Städten ist. Sommerzeit-Regeln (DST) werden automatisch über die Browser-eigene Intl-API berücksichtigt.

Das Problem klingt einfach, ist aber fehleranfällig: UTC-Offsets ändern sich durch Sommerzeit, manche Zonen haben halbe Stunden (Indien: UTC+5:30), und Abkürzungen wie CST stehen je nach Kontinent für unterschiedliche Offsets. Der Rechner löst das, indem er ausschließlich IANA-Zeitzonen verwendet — den internationalen Standard.

## Umrechnungsformel

Die Umrechnung basiert auf UTC als Referenzpunkt:

`Zielzeit = Quellzeit − Offset(Quellzone) + Offset(Zielzone)`

Beispiel: 14:30 in Berlin (UTC+2 im Sommer) entspricht 08:30 in New York (UTC−4 im Sommer). Die Differenz beträgt 6&nbsp;Stunden. Im Winter verschiebt sich die Differenz, weil beide Zonen unterschiedliche Umstellungstermine haben.

Entscheidend ist, dass die Offsets nicht statisch sind. Berlin wechselt zwischen UTC+1 (MEZ) und UTC+2 (MESZ). New York wechselt zwischen UTC−5 (EST) und UTC−4 (EDT). Der Rechner bezieht die aktuellen Offsets über `Intl.DateTimeFormat` — das stellt sicher, dass Sommerzeit-Wechsel korrekt abgebildet werden.

## Anwendungsbeispiele

Gängige Umrechnungen zwischen Zeitzonen:

| Quellzeit | Quellzone | Berlin | New York | Tokio |
|---|---|---|---|---|
| 09:00 | Europe/Berlin | 09:00 | 03:00 | 16:00 |
| 14:30 | America/New_York | 20:30 | 14:30 | 03:30+1 |
| 08:00 | Asia/Tokyo | 01:00 | 19:00−1 | 08:00 |
| 12:00 | America/Los_Angeles | 21:00 | 15:00 | 05:00+1 |
| 10:00 | Asia/Kolkata | 06:30 | 00:30 | 13:30 |

Die Werte gelten für die Sommerzeit-Periode (MESZ/EDT). Im Winter verschieben sich die Offsets. Das `+1` bzw. `−1` kennzeichnet den Folge- bzw. Vortag.

## Häufige Einsatzgebiete

**Remote-Team-Koordination:** Verteilte Teams über mehrere Zeitzonen planen Meetings, Standups und Deadlines. Statt manuell UTC-Offsets zu addieren, gibt ein Teammitglied die gewünschte Uhrzeit in seiner Zone ein und sieht sofort, ob der Termin für Kolleginnen und Kollegen in anderen Zeitzonen zumutbar ist.

**Reiseplanung und Flugzeiten:** Flugpläne zeigen Abflug- und Ankunftszeiten in lokaler Zeit. Wer einen Flug von Frankfurt nach New York bucht, muss die Zeitverschiebung kennen, um Anschlussflüge, Hotelcheck-ins und Transfers korrekt zu planen. Der Rechner liefert die Antwort ohne Kopfrechnung.

**Internationale Geschäftskommunikation:** Anrufe, Webinare und Vertragsfristen über Ländergrenzen hinweg erfordern präzise Zeitumrechnung. Besonders kritisch: die zweiwöchige Phase im März, wenn die USA bereits auf Sommerzeit umgestellt haben, Europa aber noch nicht — die Differenz Berlin-New York beträgt dann 5 statt 6&nbsp;Stunden.

**Entwickler und DevOps:** Server-Logs, Cron-Jobs und Monitoring-Alerts arbeiten oft in UTC. Entwickler müssen UTC-Zeitstempel in ihre lokale Zeit übersetzen, um Incidents zeitlich einzuordnen. Der Rechner ergänzt das [Unix-Timestamp-Tool](/de/unix-timestamp) um die Zeitzonen-Dimension.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Zeit-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Unix-Timestamp umrechnen](/de/unix-timestamp)** — Sekunden und Millisekunden zwischen POSIX- und JavaScript-Timestamps konvertieren.
- **[JSON Formatter](/de/json-formatter)** — API-Responses mit Zeitzonen-Daten lesbar formatieren und Syntaxfehler erkennen.
- **[Zeichenzähler](/de/zeichenzaehler)** — Textlängen prüfen, z. B. für IANA-Zeitzonen-Strings in Konfigurationsdateien.
