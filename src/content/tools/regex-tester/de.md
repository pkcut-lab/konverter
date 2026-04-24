---
toolId: "regex-tester"
language: "de"
title: "Regex Tester — Reguläre Ausdrücke online testen"
headingHtml: "<em>Regex</em> Tester"
metaDescription: "Reguläre Ausdrücke im Browser testen. Live-Highlighting, Flags, Capture Groups, Fehleranzeige. 100&nbsp;% clientseitig, kein Server-Upload, kein Tracking."
tagline: "Patterns testen, Treffer hervorheben — komplett im Browser, ohne Server-Kontakt."
intro: "Der Regex Tester prüft reguläre Ausdrücke direkt im Browser gegen beliebige Test-Strings. Treffer werden live hervorgehoben, Capture Groups einzeln aufgeschlüsselt, Syntaxfehler sofort gemeldet. Kein Server sieht dein Pattern oder deine Testdaten — alles läuft lokal."
category: "dev"
contentVersion: 1
howToUse:
  - "Gib dein Regex-Pattern in das obere Eingabefeld ein."
  - "Füge den Test-String in das untere Feld ein — Treffer werden sofort farblich markiert."
  - "Aktiviere Flags wie g, i, m oder s über die Checkbox-Leiste."
  - "Kopiere das Ergebnis oder teile es über die Share-URL."
faq:
  - q: "Was ist ein regulärer Ausdruck?"
    a: "Ein Pattern aus Zeichen und Metasymbolen, das Zeichenketten beschreibt. Regex wird in nahezu jeder Programmiersprache für Suche, Validierung und Textersetzung eingesetzt."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Pattern und Test-String werden ausschließlich im Browser verarbeitet — über das native JavaScript-RegExp-Objekt. Kein Byte verlässt dein Gerät."
  - q: "Was bedeuten die Flags g, i, m, s, u und v?"
    a: "g = alle Treffer statt nur der erste. i = Groß-/Kleinschreibung ignorieren. m = Zeilenstart/-ende (^/$) pro Zeile. s = Punkt matcht auch Zeilenumbruch. u = Unicode-Modus. v = Unicode-Sets (ES2024)."
  - q: "Warum funktioniert mein Regex in regex101, aber nicht in meinem Code?"
    a: "regex101 nutzt standardmäßig PCRE — JavaScript hat Unterschiede bei Lookbehind-Länge, POSIX-Klassen und Features wie atomaren Gruppen. Teste direkt im JS-Dialekt, um Überraschungen zu vermeiden."
  - q: "Was ist katastrophales Backtracking?"
    a: "Ein Pattern wie (a+)+$ kann bei bestimmten Inputs exponentiell viele Pfade durchprobieren. Das führt zu Sekunden- oder minutenlangem Stillstand. Vermeidung: atomare Gruppen oder possessive Quantifier, in JS alternativ Pattern umschreiben."
  - q: "Unterstützt der Tester das /v-Flag?"
    a: "Ja, sofern dein Browser ES2024-kompatibel ist (Chrome 112+, Safari 17+, Firefox 116+). Das /v-Flag aktiviert Unicode-Set-Notation und schließt /u ein — beide zusammen sind ungültig."
relatedTools:
  - json-formatter
  - text-diff
  - zeichenzaehler
---

## Was macht dieser Regex Tester?

Ein regulärer Ausdruck (Regex) beschreibt ein Suchmuster für Zeichenketten. Der Tester nimmt dein Pattern, wendet es auf einen Test-String an und zeigt alle Treffer sofort farblich hervorgehoben an. Capture Groups — benannt und unbenannt — werden einzeln aufgeschlüsselt, sodass du siehst, welcher Teil des Patterns welchen Abschnitt des Strings matcht.

Die Ausführung nutzt das native JavaScript-`RegExp`-Objekt direkt im Browser. Kein Server empfängt dein Pattern oder deine Testdaten. Das ist besonders relevant, wenn du mit Produktionsdaten arbeitest: Log-Zeilen, Request-Paths, Auth-Tokens oder IP-Adressen gehören nicht auf fremde Server — auch nicht zum Regex-Testen.

## Regex-Flags im Überblick

JavaScript kennt sechs relevante Flags, die das Matching-Verhalten steuern:

| Flag | Name | Wirkung |
|------|------|---------|
| `g` | Global | Findet alle Treffer statt nur den ersten. |
| `i` | Case-Insensitive | Ignoriert Groß-/Kleinschreibung. |
| `m` | Multiline | `^` und `$` matchen Zeilenanfang/-ende statt String-Anfang/-ende. |
| `s` | DotAll | `.` matcht auch `\n` (Zeilenumbruch). |
| `u` | Unicode | Aktiviert Unicode-Erkennung (`\p{...}`-Escapes, korrektes Surrogat-Handling). |
| `v` | UnicodeSets | ES2024: Unicode-Set-Operationen (`[\p{Lu}&&\p{Script=Latin}]`). Schließt `/u` ein. |

Wichtig: `/u` und `/v` zusammen sind ungültig — `/v` ist der Nachfolger von `/u` und schließt dessen Funktionalität ein. Der Tester zeigt einen Hinweis an, wenn beide gleichzeitig aktiviert werden.

## Capture Groups und Backreferences

Capture Groups erlauben dir, Teile eines Treffers einzeln zu extrahieren. Benannte Gruppen (`(?<name>...)`) verbessern die Lesbarkeit und machen Code robuster als nummerierte Referenzen:

```
Pattern:  (?<jahr>\d{4})-(?<monat>\d{2})-(?<tag>\d{2})
Input:    2026-04-21
Treffer:  jahr=2026, monat=04, tag=21
```

Der Tester zeigt jede Gruppe mit Name und Position an — du siehst sofort, ob dein Pattern die richtigen Teile extrahiert.

## Häufige Stolperfallen

### Vergessenes g-Flag

Ohne `g` liefert `.match()` nur den ersten Treffer. In vielen Anwendungsfällen (Log-Parsing, Bulk-Validierung) ist das ein Fehler, der erst in Produktion auffällt.

### Backslash-Escaping

In einem JavaScript-String-Literal brauchst du doppelte Backslashes: `new RegExp("\\d+")` statt `new RegExp("\d+")`. Bei Regex-Literalen (`/\d+/`) entfällt das. Der Tester arbeitet mit dem Literal-Format — beim Portieren in String-Argumente musst du die Backslashes verdoppeln.

### Dialekt-Unterschiede

Ein Pattern, das in regex101 (PCRE-Engine) funktioniert, scheitert in JavaScript unter Umständen an:

- **POSIX-Klassen** (`[:alpha:]`, `[:digit:]`) — in JS nicht verfügbar, stattdessen `\p{Letter}` mit `/u`-Flag.
- **Atomare Gruppen** (`(?>...)`) — in JS nicht nativ unterstützt.
- **Variable Lookbehind-Länge** — in JS seit ES2018 unterstützt, in Go/RE2 gar nicht.
- **Rekursive Patterns** (`(?R)`) — nur in PCRE, nicht in JS.

Wer Patterns zwischen Sprachen portiert, sollte direkt in der Zielsprache testen.

### Katastrophales Backtracking

Das Pattern `(a+)+$` kann bei Input `aaaaaaaaaaaaaab` exponentiell viele Pfade durchprobieren. In Produktion führt das zu hängenden Requests oder blockierten Event-Loops. Gegenmittel:

- Possessive Quantifier (`a++`) — in PCRE verfügbar, in JS nicht.
- Atomare Gruppen — in JS nicht nativ, aber durch Umschreiben mit Lookahead simulierbar.
- Pattern-Vereinfachung: `a+$` statt `(a+)+$` liefert das gleiche Ergebnis ohne Backtracking-Risiko.

## ES2024/2025-Features

JavaScript-Regex entwickelt sich weiter. Drei Features sind 2026 besonders relevant:

**`/v`-Flag (Unicode Sets):** Erlaubt Set-Operationen in Zeichenklassen. `[\p{Script=Latin}&&\p{Lu}]` matcht nur lateinische Großbuchstaben. Verfügbar in Chrome 112+, Safari 17+, Firefox 116+.

**Pattern Modifiers `(?i:...)`:** Erlaubt Flag-Wechsel mitten im Pattern. `foo(?i:bar)baz` matcht `fooBarBaz`, aber nicht `FOOBarBaz`. Verfügbar in Chrome 125+, Edge 125+. Firefox-Support steht noch aus (Stand April 2026).

**`RegExp.escape()`:** Maskiert Sonderzeichen in einem String, damit er als Regex-Literal sicher einsetzbar ist. Aktuell Stage 3 (TC39), noch kein Browser-Support — aber das Feature löst einen häufigen Fehler (unescapte Punkte, Klammern, Sterne in dynamischen Patterns).

## Datenschutz — 100&nbsp;% im Browser

regex101.com — der bekannteste Regex-Tester — sendet Pattern und Test-String an einen Backend-Server. Das ist problematisch, wenn du mit Produktionsdaten arbeitest:

> „those logs contained client IPs, user agents, and request paths from production. All of it, shipped off to someone else's server."

Dieser Tester verarbeitet alles lokal über das native JavaScript-`RegExp`-Objekt. Kein Logging, kein Tracking, kein Server-Kontakt. DSGVO-konform, weil keine Verarbeitung auf externen Servern stattfindet.

## Anwendungsbeispiele

- **Log-Parsing:** Server-Logs nach IP-Adressen, Statuscodes oder Timestamps filtern — direkt im Browser, ohne Daten hochzuladen.
- **Formular-Validierung:** E-Mail-, PLZ- oder IBAN-Patterns testen, bevor sie in den Produktivcode wandern.
- **Daten-Extraktion:** Capture Groups für CSV-Zeilen, JSON-Felder oder Markdown-Links definieren und sofort gegen Beispieldaten prüfen.
- **Code-Migration:** Patterns zwischen PCRE und JavaScript portieren und Dialekt-Unterschiede sofort erkennen.
- **Lernzwecke:** Regex-Syntax interaktiv ausprobieren, Flags verstehen und Backtracking-Fallen erkennen.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit sauberer Einrückung lesbar machen und Syntaxfehler erkennen.
- **[UUID-Generator](/de/uuid-generator)** — Kryptographisch sichere UUIDs (v4 und v7) direkt im Browser erzeugen.
- **[Zeichenzähler](/de/zeichenzaehler)** — Zeichen, Wörter und Zeilen in beliebigen Texten zählen und analysieren.
