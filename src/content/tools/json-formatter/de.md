---
toolId: "json-formatter"
language: "de"
title: "JSON Formatter — Online formatieren und validieren"
headingHtml: "<em>JSON</em> Formatter"
metaDescription: "JSON online formatieren, validieren und minifizieren. Syntaxfehler mit Zeilennummer, 2-Space-Einrückung, Copy-Button. 100 % im Browser, ohne Tracking."
tagline: "JSON lesbar machen — komplett im Browser, ohne Server-Kontakt."
intro: "Der JSON Formatter nimmt rohen JSON-Code und gibt ihn mit sauberer Einrückung und Zeilenumbrüchen zurück. Syntaxfehler werden mit Position gemeldet, Copy-Button liefert das Ergebnis in die Zwischenablage. Kein Server sieht deine Daten — alles läuft lokal im Browser."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge deinen JSON-Code in das Eingabefeld ein — per Paste oder Drag & Drop."
  - "Klicke auf Formatieren — das Ergebnis erscheint sofort mit 2-Space-Einrückung."
  - "Kopiere das formatierte JSON über den Copy-Button in die Zwischenablage."
faq:
  - q: "Was ist ein JSON Formatter?"
    a: "Ein Tool, das rohen JSON-Code mit Einrückung und Zeilenumbrüchen lesbar macht. Verschachtelte Objekte und Arrays werden visuell aufgelöst, sodass Strukturen auf einen Blick erkennbar sind."
  - q: "Wie validiere ich JSON online?"
    a: "JSON in das Eingabefeld einfügen und Formatieren klicken. Enthält der Code einen Syntaxfehler, zeigt das Tool die Fehlerstelle mit Beschreibung an — kein separater Validator nötig."
  - q: "Was ist der Unterschied zwischen JSON und JSON5?"
    a: "Standard-JSON (RFC 8259) erlaubt keine Kommentare, keine Trailing Commas und nur doppelte Anführungszeichen. JSON5 lockert diese Regeln — beliebt in Config-Dateien wie tsconfig.json oder .babelrc."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Formatierung läuft vollständig im Browser über JSON.parse() und JSON.stringify(). Kein Byte verlässt dein Gerät, kein Logging, kein Tracking."
  - q: "Was passiert bei ungültigem JSON?"
    a: "Das Tool zeigt eine Fehlermeldung mit Beschreibung des Syntaxfehlers. Häufige Ursachen: fehlende Anführungszeichen, Trailing Commas oder Kommentare im Standard-JSON-Modus."
  - q: "Wie minifiziere ich JSON?"
    a: "Minifizierung entfernt alle Whitespaces und Zeilenumbrüche — spart Bandwidth bei API-Transfers. Nutze dafür den Minify-Modus, der den JSON auf eine einzige Zeile komprimiert."
relatedTools:
  - regex-tester
  - text-diff
  - unix-timestamp
---

## Was macht dieser Formatter?

Der JSON Formatter nimmt einen beliebigen JSON-String — ob kompakt auf einer Zeile oder unübersichtlich verschachtelt — und gibt ihn mit konsistenter 2-Space-Einrückung zurück. Dabei validiert er gleichzeitig die Syntax: Fehlt ein Komma, steht ein Trailing Comma oder fehlen Anführungszeichen, meldet das Tool die Fehlerstelle mit Beschreibung.

Standard-JSON nach RFC 8259 ist das Eingabeformat. Objekte, Arrays, Strings, Zahlen, Booleans und `null` sind als Root-Element erlaubt. Leerer Input wird mit einer klaren Meldung abgewiesen — kein stilles Scheitern.

## Warum JSON formatieren?

Roher JSON-Code aus APIs, Logs oder Konfigurationsdateien ist oft auf eine einzige Zeile komprimiert. Das spart Bytes, macht den Inhalt aber für Menschen unlesbar. Ein Formatter löst verschachtelte Strukturen visuell auf:

- **Debugging:** Fehlerhafte API-Responses werden auf einen Blick erkennbar, statt in einer Zeichenkette nach fehlenden Klammern zu suchen.
- **Code-Reviews:** Formatierter JSON in Pull-Requests zeigt Datenstrukturen klar — Reviewer erkennen Schema-Änderungen sofort.
- **Dokumentation:** Beispiel-Payloads in Wikis und READMEs profitieren von lesbarer Einrückung.
- **Validierung:** Syntaxfehler werden beim Formatieren automatisch erkannt. Kein separater Linter nötig.

## JSON vs. JSON5 vs. JSONC

Entwickler stolpern regelmäßig über Varianten des JSON-Formats, die sich in Details unterscheiden:

| Merkmal | JSON (RFC 8259) | JSON5 | JSONC |
|---------|----------------|-------|-------|
| Kommentare | Nicht erlaubt | `//` und `/* */` | `//` und `/* */` |
| Trailing Commas | Nicht erlaubt | Erlaubt | Erlaubt |
| Einfache Anführungszeichen | Nicht erlaubt | Erlaubt | Nicht erlaubt |
| Unzitierte Schlüssel | Nicht erlaubt | Erlaubt | Nicht erlaubt |
| Hex-Zahlen | Nicht erlaubt | Erlaubt (`0xFF`) | Nicht erlaubt |
| Verbreitung | Universal | npm: 65 Mio.+ Downloads/Woche | VS Code, TypeScript |

**tsconfig.json**, **.eslintrc**, **renovate.json** — viele Config-Dateien nutzen JSONC-Syntax mit Kommentaren. Ein Standard-JSON-Parser wertet diese als Fehler. Wer regelmäßig mit Config-Dateien arbeitet, braucht ein Tool, das beide Varianten versteht.

## Typische Stolperfallen

### Trailing Commas

```json
{
  "name": "Alice",
  "age": 30,
}
```

Das letzte Komma nach `30` ist in Standard-JSON ein Syntaxfehler. JSON5 und JSONC tolerieren es — Standard-JSON nicht. Der Formatter meldet die Position klar.

### Zahlen jenseits von 2⁵³

JavaScript nutzt IEEE 754 Double-Precision für alle Zahlen. Ab `9.007.199.254.740.992` (2⁵³) gehen Nachkommastellen verloren. Wer JSON mit großen Integer-IDs verarbeitet (z.&nbsp;B. Twitter-Snowflake-IDs), sollte diese als Strings kodieren.

### Kommentare im Standard-Modus

```
// API-Config
{"endpoint": "https://api.example.com"}
```

Standard-JSON kennt keine Kommentare. Der Formatter lehnt diesen Input ab und erklärt warum — kein kryptischer Fehler, sondern ein klarer Hinweis auf die JSON5-Alternative.

## Datenschutz — 100 % im Browser

Der JSON Formatter verarbeitet alles lokal über `JSON.parse()` und `JSON.stringify()`. Kein Server empfängt deine Daten, kein Logging speichert sie, kein Tracking analysiert dein Verhalten. Das ist besonders relevant für:

- **API-Keys und Secrets:** Produktionsdaten gehören nicht auf fremde Server — auch nicht zum Formatieren.
- **Personenbezogene Daten:** DSGVO-konform, weil keine Verarbeitung auf externen Servern stattfindet.
- **Firmen-interne Payloads:** Sensible Business-Logik bleibt lokal.

Anders als viele Online-JSON-Formatter, die Google Analytics und Werbe-Tracking einsetzen, setzt dieses Tool auf vollständige Client-Verarbeitung ohne Kompromisse.

## Anwendungsbeispiele

- **API-Response debuggen** — Kopiere die kompakte Response aus curl oder Postman, formatiere sie und erkenne die Struktur sofort.
- **Config-Dateien prüfen** — Validiere package.json, tsconfig.json oder Terraform-Variablen auf Syntaxfehler.
- **Log-Analyse** — JSON-Zeilen aus Server-Logs lesbar machen, um Fehler schneller zu identifizieren.
- **Daten-Migration** — Vor dem Import in eine Datenbank sicherstellen, dass das JSON-Schema korrekt ist.
- **Payload-Dokumentation** — Formatierte Beispiele für API-Dokumentation erstellen.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[UUID-Generator](/de/uuid-generator)** — Kryptographisch sichere UUIDs (v4 und v7) direkt im Browser erzeugen.
- **[Passwort-Generator](/de/passwort-generator)** — Zufallspasswörter mit konfigurierbarer Länge und Zeichenpool erstellen.
- **[HEX-RGB-Konverter](/de/hex-rgb-konverter)** — Farbwerte zwischen Hexadezimal- und RGB-Notation umrechnen.
