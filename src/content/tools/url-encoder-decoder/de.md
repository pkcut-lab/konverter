---
toolId: "url-encoder-decoder"
language: "de"
title: "URL Encoder Decoder — Online kodieren und dekodieren"
headingHtml: "<em>URL</em> Encoder Decoder"
metaDescription: "URL online kodieren und dekodieren mit Percent-Encoding nach RFC 3986. Double-Encoding-Erkennung, UTF-8-Support, Copy-Button. 100&nbsp;% im Browser."
tagline: "URLs kodieren und dekodieren — komplett im Browser, ohne Server-Kontakt."
intro: "Der URL Encoder Decoder wandelt Text in percent-encoded Strings um und dekodiert sie zurück. Die Verarbeitung läuft vollständig im Browser über encodeURIComponent und decodeURIComponent — kein Server sieht deine Daten, kein Logging speichert sie. Du fügst Text oder eine kodierte URL ein, klickst auf Kodieren oder Dekodieren und kopierst das Ergebnis."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge deinen Text oder die kodierte URL in das Eingabefeld ein — per Paste oder Drag & Drop."
  - "Klicke auf Kodieren, um Sonderzeichen in Percent-Encoding umzuwandeln."
  - "Klicke auf Dekodieren, um %XX-Sequenzen zurück in lesbaren Text zu wandeln."
  - "Kopiere das Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Was ist URL-Encoding?"
    a: "Ein Verfahren nach RFC 3986, das reservierte und unsichere Zeichen in %HH-Hex-Sequenzen umwandelt. So werden Sonderzeichen, Leerzeichen und Unicode-Zeichen in URIs sicher transportiert."
  - q: "Was ist der Unterschied zwischen encodeURI und encodeURIComponent?"
    a: "encodeURI lässt URI-Strukturzeichen wie :, /, ? und # unverändert — gedacht für vollständige URLs. encodeURIComponent kodiert alles außer A-Z, a-z, 0-9, -, _, . und ~ — korrekt für einzelne Query-Parameter."
  - q: "Warum werden Leerzeichen mal als %20 und mal als + kodiert?"
    a: "%20 ist der RFC-3986-Standard für Leerzeichen in URLs. Das Plus-Zeichen (+) stammt aus dem älteren application/x-www-form-urlencoded-Format, das HTML-Formulare verwenden. In modernen APIs ist %20 korrekt."
  - q: "Was ist Double-Encoding und wie vermeide ich es?"
    a: "Double-Encoding entsteht, wenn bereits kodierte Sequenzen erneut kodiert werden — aus %20 wird %2520. Prüfe vor dem Kodieren, ob dein Input bereits Percent-Encoding enthält. Dieser Encoder warnt dich automatisch."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Kodierung läuft vollständig im Browser über die JavaScript-Funktionen encodeURIComponent und decodeURIComponent. Kein Byte verlässt dein Gerät, kein Logging, kein Tracking."
relatedTools:
  - base64-encoder
  - json-formatter
  - regex-tester
datePublished: '2026-04-21'
dateModified: '2026-04-24'

---

## Was macht der Konverter?

Der URL Encoder Decoder nimmt beliebigen Text und wandelt ihn in eine percent-encoded Zeichenkette nach RFC 3986 um. Dabei werden alle Zeichen außer den sogenannten Unreserved Characters (A-Z, a-z, 0-9, -, _, ., ~) in ihre UTF-8-Byte-Repräsentation zerlegt und als %HH-Sequenzen dargestellt. Die Rückrichtung dekodiert solche Sequenzen zurück in lesbaren Text.

Das Tool erkennt automatisch, ob der Input bereits percent-encoded Sequenzen enthält, und warnt vor Double-Encoding — dem häufigsten Fehler bei der URL-Kodierung. Leerer Input wird mit einer klaren Meldung abgewiesen, ungültige Percent-Sequenzen wie %2G oder alleinstehende %-Zeichen erzeugen eine verständliche Fehlermeldung.

## Was ist die Umrechnungsformel?

Percent-Encoding arbeitet auf Byte-Ebene. Der Algorithmus:

1. Input-Text wird in UTF-8-Bytes konvertiert.
2. Jedes Byte, das kein Unreserved Character ist, wird als `%` + zwei Hex-Ziffern dargestellt.
3. Unreserved Characters (A-Z, a-z, 0-9, -, _, ., ~) bleiben unverändert.

Beispiel: `Hallo Welt` ergibt `Hallo%20Welt` — nur das Leerzeichen wird kodiert. `ä` (UTF-8-Bytes 0xC3 0xA4) wird zu `%C3%A4`. Ein Emoji wie `😀` (4 Bytes UTF-8) ergibt `%F0%9F%98%80`.

## Welche Anwendungsbeispiele gibt es?

| Input | Encoded | Kontext |
|-------|---------|---------|
| `Hallo Welt` | `Hallo%20Welt` | Leerzeichen in URL-Pfad |
| `key=wert&mehr=ja` | `key%3Dwert%26mehr%3Dja` | Query-Parameter als Wert |
| `münchen` | `m%C3%BCnchen` | Umlaut in URL |
| `100% sicher` | `100%25%20sicher` | Prozentzeichen korrekt escapen |
| `https://example.com/pfad?q=test` | `https%3A%2F%2Fexample.com%2Fpfad%3Fq%3Dtest` | Vollständige URL als Parameter |

Percent-Encoding ist keine Verschlüsselung. Jeder kann eine kodierte URL trivial dekodieren. Für sensible Daten wie API-Keys in URLs ist zusätzliche Absicherung Pflicht.

## Welche Einsatzgebiete gibt es?

**Query-Parameter in APIs** — Wenn Werte Sonderzeichen enthalten (Leerzeichen, &, =, Umlaute), müssen sie kodiert werden, damit die URL-Struktur intakt bleibt. Ein unkodiertes `&` in einem Parameterwert würde als Trennzeichen interpretiert und die Abfrage zerstören.

**Redirect-URLs als Parameter** — Login-Flows und OAuth-Redirects transportieren die Ziel-URL als Query-Parameter. Die eingebettete URL muss percent-encoded sein, damit Slashes, Fragezeichen und Hashes nicht die äußere URL-Struktur brechen.

**Internationalisierte Inhalte** — Deutsche Umlaute (ä, ö, ü), CJK-Zeichen und Emojis erfordern UTF-8-Encoding vor dem Percent-Encoding. Moderne Browser zeigen decodierte Unicode-Zeichen in der Adressleiste an, transportieren aber intern die kodierte Form.

**Formular-Daten und POST-Requests** — HTML-Formulare kodieren Eingaben im application/x-www-form-urlencoded-Format. Dabei werden Leerzeichen als `+` statt `%20` kodiert — ein historisches Erbe, das beim manuellen URL-Bau zu Verwirrung führt.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Welche Entwickler-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Base64 Encoder](/de/base64-encoder)** — Text in Base64 kodieren, für Data-URIs, JWT-Tokens und API-Payloads.
- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit 2-Space-Einrückung lesbar formatieren und validieren.
- **[Regex-Tester](/de/regex-tester)** — Reguläre Ausdrücke live testen mit Echtzeit-Matching und Gruppen-Hervorhebung.
