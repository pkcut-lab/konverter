---
toolId: "unix-timestamp"
language: "de"
title: "Unix-Timestamp umrechnen — Sekunden und Millisekunden"
headingHtml: "Unix-<em>Timestamp</em> umrechnen"
metaDescription: "Unix-Timestamp in Sekunden und Millisekunden umrechnen. Formel, Referenztabelle, Y2038-Erklärung und FAQ. 100 % im Browser, kein Upload, kein Tracking."
tagline: "Sekunden und Millisekunden zwischen POSIX- und JavaScript-Timestamps konvertieren."
intro: "Rechne Unix-Timestamps zwischen Sekunden (POSIX) und Millisekunden (JavaScript Date.now()) um. Der Konverter nutzt den Faktor 1000 — kein Runden, kein Offset. Ideal für Log-Analyse, API-Debugging und Daten-Migration."
category: "time"
contentVersion: 1
howToUse:
  - "Gib einen Unix-Timestamp in Sekunden in das Eingabefeld ein."
  - "Das Ergebnis in Millisekunden erscheint sofort — kein Klick nötig."
  - "Kopiere das Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Was ist ein Unix-Timestamp?"
    a: "Eine Zahl, die Sekunden seit dem 1. Januar 1970 00:00:00 UTC zählt. Auch bekannt als Epoch-Time oder POSIX-Time. Zeitzonen spielen keine Rolle — der Wert ist immer UTC-basiert."
  - q: "Warum brauche ich die Umrechnung in Millisekunden?"
    a: "JavaScript verwendet Millisekunden seit der Epoch (Date.now() liefert 13 Stellen). POSIX-Systeme, Python und C verwenden Sekunden (10 Stellen). Beim Datenaustausch zwischen diesen Welten ist der Faktor 1000 die häufigste Fehlerquelle."
  - q: "Was passiert am 19. Januar 2038?"
    a: "An diesem Datum erreicht ein 32-Bit-Signed-Integer seinen Maximalwert (2.147.483.647). Systeme, die Timestamps in 32 Bit speichern, laufen über. 64-Bit-Systeme sind nicht betroffen — sie reichen bis ca. Jahr 292 Milliarden."
  - q: "Wie erkenne ich, ob ein Timestamp in Sekunden oder Millisekunden vorliegt?"
    a: "An der Stellenzahl: 10 Stellen = Sekunden (POSIX), 13 Stellen = Millisekunden (JavaScript/Java). 16 Stellen = Mikrosekunden (PostgreSQL), 19 Stellen = Nanosekunden (Go/Rust)."
  - q: "Sind negative Timestamps gültig?"
    a: "Ja. Negative Werte repräsentieren Zeitpunkte vor dem 1. Januar 1970. Beispiel: −86400 entspricht dem 31. Dezember 1969. Viele Online-Tools behandeln negative Werte fälschlicherweise als Fehler."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Umrechnung läuft vollständig im Browser — Multiplikation mit 1000, kein Netzwerk-Request. Kein Logging, kein Tracking. Besonders relevant, wenn Timestamps aus Produktions-Logs stammen."
relatedTools: []
---

## Was macht dieser Konverter?

Ein Unix-Timestamp zählt Sekunden seit dem 1.&nbsp;Januar 1970 00:00:00&nbsp;UTC — der sogenannten Epoch. POSIX-Systeme, C und Python verwenden Sekunden (10&nbsp;Stellen). JavaScript, Java und Kafka verwenden Millisekunden (13&nbsp;Stellen). Der Konverter rechnet zwischen beiden Darstellungen um: Sekunden × 1000 = Millisekunden, Millisekunden ÷ 1000 = Sekunden.

Die Umrechnung klingt trivial, ist aber eine der häufigsten Fehlerquellen beim Datenaustausch zwischen Backend und Frontend. Wer einen 10-stelligen Timestamp in `new Date()` steckt, landet im Januar 1970 statt im aktuellen Jahr.

## Umrechnungsformel

Die Formel ist exakt, ohne Rundung:

`Sekunden (s) × 1000 = Millisekunden (ms)`

`Millisekunden (ms) ÷ 1000 = Sekunden (s)`

Beispiel: Der Unix-Timestamp `1745230000` (Sekunden) entspricht `1745230000000` (Millisekunden). In JavaScript: `new Date(1745230000000)` ergibt den 21.&nbsp;April 2025, 12:26:40&nbsp;UTC.

## Anwendungsbeispiele

Gängige Werte und ihre Umrechnung:

| Sekunden (POSIX) | Millisekunden (JS) | Bedeutung |
|---|---|---|
| 0 | 0 | Epoch: 1.&nbsp;Jan 1970 00:00:00&nbsp;UTC |
| 86.400 | 86.400.000 | Exakt ein Tag (24 × 60 × 60) |
| 604.800 | 604.800.000 | Exakt eine Woche |
| 2.629.746 | 2.629.746.000 | Durchschnittlicher Monat (30,44&nbsp;Tage) |
| 31.556.952 | 31.556.952.000 | Durchschnittliches Jahr (365,2425&nbsp;Tage) |
| 1.745.230.000 | 1.745.230.000.000 | April 2025 (Referenzwert) |
| 2.147.483.647 | 2.147.483.647.000 | Y2038-Grenze (32-Bit-Maximum) |

Merke: Ein Tag hat exakt 86.400&nbsp;Sekunden, eine Woche 604.800. Diese Werte sind konstant, weil Unix-Timestamps keine Schaltsekunden zählen.

## Häufige Einsatzgebiete

**Log-Analyse und Debugging:** Server-Logs, Kafka-Events und Datenbank-Einträge speichern Zeitpunkte als Unix-Timestamps. Beim Vergleich zwischen Python-Backend (Sekunden) und JavaScript-Frontend (Millisekunden) ist der Faktor 1000 entscheidend. Ohne korrekte Umrechnung zeigen Dashboards Zeitpunkte im Jahr 1970 statt im aktuellen Monat.

**API-Entwicklung:** REST-APIs und Webhooks transportieren Timestamps in unterschiedlichen Präzisionen. Stripe verwendet Sekunden, Discord Millisekunden, InfluxDB Nanosekunden. Wer APIs integriert, braucht die Umrechnung regelmäßig — nicht als Kopfrechnung, sondern als verlässliches Werkzeug.

**Daten-Migration:** Beim Import von CSV- oder JSON-Daten in eine neue Datenbank muss die Timestamp-Präzision stimmen. PostgreSQL erwartet Mikrosekunden, MongoDB Millisekunden. Falsche Umrechnung führt zu kaputten Zeitreihen, die erst Wochen später in Reports auffallen.

**Y2038-Assessment:** Unternehmen mit Legacy-Systemen prüfen aktuell, welche Komponenten noch 32-Bit-Timestamps verwenden. Der Maximalwert 2.147.483.647 (19.&nbsp;Januar 2038, 03:14:07&nbsp;UTC) ist die harte Grenze. Wer Timestamps über diesen Wert hinaus speichern muss, braucht 64-Bit-Integer.

## Präzisions-Varianten im Überblick

Neben Sekunden und Millisekunden existieren zwei weitere Präzisionsstufen:

| Einheit | Stellen | Beispiel | Verbreitung |
|---|---|---|---|
| Sekunden (s) | 10 | `1745230000` | POSIX, C, Python, Unix |
| Millisekunden (ms) | 13 | `1745230000000` | JavaScript, Java, Kafka |
| Mikrosekunden (µs) | 16 | `1745230000000000` | PostgreSQL, Python `time.time_ns()` |
| Nanosekunden (ns) | 19 | `1745230000000000000` | Go, Rust, `Temporal.Instant` |

Die Stellenzahl ist das zuverlässigste Erkennungsmerkmal: 10&nbsp;Stellen = Sekunden, 13&nbsp;Stellen = Millisekunden, 16&nbsp;Stellen = Mikrosekunden, 19&nbsp;Stellen = Nanosekunden.

## Das Y2038-Problem

Am 19.&nbsp;Januar 2038 um 03:14:07&nbsp;UTC erreicht der Wert `2147483647` das Maximum eines 32-Bit-Signed-Integer. Systeme, die Timestamps in 32&nbsp;Bit speichern, interpretieren den nächsten Wert als −2.147.483.648 — ein Sprung zurück ins Jahr 1901.

64-Bit-Timestamps lösen das Problem: Sie reichen bis ca. Jahr 292&nbsp;Milliarden. Alle modernen Betriebssysteme und Programmiersprachen verwenden 64&nbsp;Bit. Gefährdet sind Embedded-Systeme, alte Datenbank-Schemata und Firmware, die seit Jahrzehnten nicht aktualisiert wurde.

Die Temporal-API (ES2026, seit März 2026 Stage 4) verwendet intern Nanosekunden als `BigInt` — das Y2038-Problem existiert dort nicht.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Zeit-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — API-Responses mit Timestamps lesbar formatieren und Syntaxfehler erkennen.
- **[Zeichenzähler](/de/zeichenzaehler)** — Stellenzahl von Timestamps prüfen, um Sekunden von Millisekunden zu unterscheiden.
- **[Text-Diff](/de/text-diff)** — Zwei Log-Dateien mit Timestamps vergleichen und Unterschiede hervorheben.
