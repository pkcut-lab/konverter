---
toolId: "json-to-csv"
language: "de"
title: "JSON zu CSV konvertieren — Flattening mit Dot-Notation"
headingHtml: "JSON zu <em>CSV</em> konvertieren"
metaDescription: "JSON online in CSV umwandeln: automatisches Flattening verschachtelter Objekte mit Dot-Notation, RFC-4180-Escaping. 100 % im Browser, DSGVO-konform."
tagline: "Verschachtelte JSON-Strukturen in flache CSV-Tabellen umwandeln — komplett im Browser."
intro: "Der JSON-zu-CSV-Konverter nimmt ein JSON-Array (oder ein einzelnes Objekt) und erzeugt daraus eine CSV-Datei mit Kopfzeile und Datenzeilen. Verschachtelte Objekte werden automatisch mit Dot-Notation geflacht (z. B. address.city), Arrays als kompakte JSON-Strings eingebettet. Alle Felder werden nach RFC 4180 korrekt maskiert. Kein Server empfängt deine Daten — die gesamte Verarbeitung läuft lokal im Browser."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge dein JSON in das Eingabefeld ein — ein Array von Objekten oder ein einzelnes Objekt."
  - "Verschachtelte Strukturen werden automatisch mit Dot-Notation geflacht."
  - "Das Ergebnis erscheint sofort als CSV mit Kopfzeile und Datenzeilen."
  - "Kopiere das CSV über den Copy-Button oder nutze es direkt weiter."
faq:
  - q: "Wie konvertiert man JSON in CSV?"
    a: "JSON in das Eingabefeld einfuegen. Das Tool erkennt automatisch, ob ein Array von Objekten oder ein einzelnes Objekt vorliegt, flacht verschachtelte Strukturen und gibt CSV mit Kopfzeile aus."
  - q: "Was passiert mit verschachtelten JSON-Objekten?"
    a: "Verschachtelte Objekte werden mit Dot-Notation geflacht. Aus {address: {city: Berlin}} wird die Spalte address.city mit dem Wert Berlin."
  - q: "Wie werden Arrays in JSON-Werten behandelt?"
    a: "Arrays innerhalb von Objekten werden als kompakte JSON-Strings in die CSV-Zelle geschrieben, z. B. [1,2,3]. So bleibt die Information erhalten, ohne die Tabellenstruktur zu sprengen."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die gesamte Konvertierung laeuft lokal im Browser ueber JSON.parse() und String-Operationen. Kein Byte verlaesst dein Geraet."
  - q: "Welches CSV-Format wird erzeugt?"
    a: "Standard-CSV nach RFC 4180: Komma als Trennzeichen, doppelte Anfuehrungszeichen fuer Felder mit Sonderzeichen, Zeilenumbruch als Zeilentrenner."
relatedTools:
  - json-formatter
  - json-diff
  - text-diff
---

## Was macht der Konverter?

Der JSON-zu-CSV-Konverter wandelt strukturierte JSON-Daten in tabellarisches CSV-Format um. Er akzeptiert ein Array von Objekten — das typische Format von API-Responses, Datenbank-Exports und Log-Dateien — und erzeugt daraus eine CSV-Datei mit einer Kopfzeile pro Schlüssel und einer Datenzeile pro Objekt.

Verschachtelte Objekte werden dabei automatisch geflacht: Aus `{"user": {"name": "Alice", "address": {"city": "Berlin"}}}` werden die Spalten `user.name` und `user.address.city`. Ein einzelnes JSON-Objekt wird als einzeilige Tabelle behandelt.

## Konvertierungsalgorithmus

Die Umwandlung folgt einem dreistufigen Prozess:

1. **Parsing und Normalisierung.** Der JSON-String wird mit `JSON.parse()` validiert. Ein einzelnes Objekt wird in ein einelementiges Array verpackt, damit der weitere Ablauf einheitlich ist.

2. **Rekursives Flattening.** Jedes Objekt im Array wird rekursiv durchlaufen. Verschachtelte Objekte erzeugen Dot-Notation-Pfade (`address.city`). Arrays werden als kompakte JSON-Strings erhalten (`[1,2,3]`), `null`-Werte als leerer String.

3. **CSV-Erzeugung.** Alle Schlüssel aus allen Objekten bilden die Kopfzeile. Fehlende Schlüssel in einzelnen Zeilen werden als leere Felder ausgegeben. Felder mit Kommas, Anführungszeichen oder Zeilenumbrüchen werden nach RFC 4180 maskiert.

## Anwendungsbeispiele

| Szenario | JSON-Eingabe | CSV-Ergebnis |
|----------|-------------|--------------|
| Flache Objekte | `[{"name": "Alice", "age": 30}]` | `name,age` + `Alice,30` |
| Verschachtelt | `[{"user": {"city": "Berlin"}}]` | `user.city` + `Berlin` |
| Fehlende Schlüssel | `[{"a": 1}, {"b": 2}]` | `a,b` + `1,` + `,2` |
| Array-Werte | `[{"tags": ["js","ts"]}]` | `tags` + `"[""js"",""ts""]"` |
| Sonderzeichen | `[{"note": "Hallo, Welt"}]` | `note` + `"Hallo, Welt"` |

## Häufige Einsatzgebiete

**API-Daten in Tabellen überführen.** REST-APIs liefern Daten typischerweise als JSON-Array. Für die Weiterverarbeitung in Excel, Google Sheets oder Datenbank-Imports wird CSV benötigt. Der Konverter übernimmt die Transformation ohne manuelles Spalten-Mapping.

**Log-Analyse und Reporting.** Server-Logs im JSON-Lines-Format lassen sich zeilenweise zu einem Array zusammenfassen und dann in CSV konvertieren. Das Ergebnis kann direkt in Tabellenkalkulationen gefiltert und sortiert werden — ohne Programmierung.

**Daten-Migration zwischen Systemen.** Viele Legacy-Systeme importieren ausschließlich CSV. Der Konverter übersetzt moderne JSON-Exports in das ältere Format und erhält dabei verschachtelte Strukturen durch Dot-Notation-Spalten.

**Schnelle Datenprüfung.** Entwickler nutzen den Konverter, um API-Responses tabellarisch darzustellen. Spalten mit fehlenden Werten oder unerwarteten Datentypen fallen in der CSV-Ansicht sofort auf — schneller als im verschachtelten JSON-Baum.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — JSON-Code lesbar formatieren, validieren und Syntaxfehler mit Zeilennummer erkennen.
- **[JSON-Diff](/de/json-diff)** — Zwei JSON-Dokumente vergleichen und Unterschiede mit JSON-Path und Typ-Info anzeigen.
- **[Text-Diff](/de/text-diff)** — Zwei Texte vergleichen und Unterschiede auf Wort- und Zeilenebene farblich markieren.
