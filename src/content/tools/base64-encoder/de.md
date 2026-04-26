---
toolId: "base64-encoder"
language: "de"
title: "Base64 Encoder — Text online kodieren"
headingHtml: "<em>Base64</em> Encoder"
metaDescription: "Text in Base64 kodieren — direkt im Browser, ohne Server. Standard-Base64 und URL-safe Base64url, UTF-8-Support, Copy-Button. 100&nbsp;% client-side."
tagline: "Text in Base64 kodieren — komplett im Browser, ohne Server-Kontakt."
intro: "Der Base64 Encoder wandelt beliebigen Text in Base64-Zeichenketten um. Die Kodierung läuft vollständig im Browser über die Web-API — kein Server sieht deine Daten, kein Logging speichert sie. Du fügst Text ein, klickst auf Kodieren und kopierst das Ergebnis."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge deinen Text in das Eingabefeld ein — per Paste oder Drag & Drop."
  - "Klicke auf Kodieren — das Base64-Ergebnis erscheint sofort."
  - "Kopiere das kodierte Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Was ist Base64?"
    a: "Ein Kodierungsverfahren nach RFC 4648, das beliebige Binärdaten in einen ASCII-String aus 64 druckbaren Zeichen (A–Z, a–z, 0–9, +, /) umwandelt. Das Ergebnis ist etwa 33&nbsp;% größer als das Original."
  - q: "Wofür braucht man Base64-Kodierung?"
    a: "Überall dort, wo Binärdaten über textbasierte Kanäle transportiert werden: E-Mail-Anhänge (MIME), Data-URIs in HTML/CSS, JWT-Tokens, API-Payloads und Konfigurationsdateien wie .env oder YAML."
  - q: "Was ist der Unterschied zwischen Base64 und Base64url?"
    a: "Base64url ersetzt + durch - und / durch _, damit die Ausgabe direkt in URLs und Dateinamen verwendbar ist. JWT-Tokens nutzen ausschließlich Base64url (RFC 7515)."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Kodierung läuft vollständig im Browser über btoa() und TextEncoder. Kein Byte verlässt dein Gerät, kein Logging, kein Tracking."
  - q: "Unterstützt der Encoder Unicode und Umlaute?"
    a: "Ja. Der Encoder konvertiert den Text zuerst in UTF-8-Bytes und kodiert diese dann in Base64. Umlaute (ä, ö, ü), Emojis und alle Unicode-Zeichen werden korrekt verarbeitet."
relatedTools:
  - uuid-generator
  - json-formatter
  - regex-tester
datePublished: '2026-04-21'
dateModified: '2026-04-24'

---

## Was macht der Konverter?

Der Base64 Encoder nimmt einen beliebigen Text-String und wandelt ihn in eine Base64-Zeichenkette um. Base64 kodiert jeden 3-Byte-Block des Inputs in vier ASCII-Zeichen aus einem 64-Zeichen-Alphabet (A–Z, a–z, 0–9, +, /). Am Ende wird bei Bedarf mit `=`-Zeichen aufgefüllt (Padding), damit die Ausgabe immer ein Vielfaches von vier Zeichen lang ist.

Der Encoder verarbeitet UTF-8-Text korrekt: Umlaute, Sonderzeichen und Emojis werden zuerst in ihre UTF-8-Byte-Sequenzen zerlegt, bevor die Base64-Kodierung greift. Leerer Input wird mit einer klaren Meldung abgewiesen — kein stilles Scheitern.

## Was ist die Umrechnungsformel?

Base64 arbeitet auf Byte-Ebene, nicht auf Zeichen-Ebene. Der Algorithmus:

1. Input-Text wird in UTF-8-Bytes konvertiert.
2. Je drei Bytes (24 Bit) werden in vier 6-Bit-Gruppen aufgeteilt.
3. Jede 6-Bit-Gruppe wird auf ein Zeichen aus dem Base64-Alphabet abgebildet.
4. Bei unvollständigen 3-Byte-Blöcken am Ende wird mit `=` aufgefüllt.

Beispiel: `Hallo` (5 Bytes UTF-8) ergibt `SGFsbG8=` (8 Zeichen Base64). Die Ausgabe ist immer ca. 33&nbsp;% größer als der Input: `ceil(n / 3) * 4` Zeichen für `n` Eingabe-Bytes.

## Welche Anwendungsbeispiele gibt es?

| Input-Text | Base64-Ergebnis | Anwendung |
|------------|-----------------|-----------|
| `Hallo` | `SGFsbG8=` | Einfacher ASCII-Test |
| `Ü` | `w5w=` | UTF-8-Umlaut (2 Bytes) |
| `{"user":"admin"}` | `eyJ1c2VyIjoiYWRtaW4ifQ==` | JSON-Payload in API |
| `username:password` | `dXNlcm5hbWU6cGFzc3dvcmQ=` | HTTP Basic Auth Header |
| `<svg>...</svg>` | (langer String) | Data-URI für Inline-SVG |

Base64-Kodierung ist keine Verschlüsselung. Jeder kann eine Base64-Zeichenkette trivial dekodieren. Für sensible Daten wie Passwörter ist zusätzliche Verschlüsselung Pflicht.

## Welche Einsatzgebiete gibt es?

**E-Mail und MIME** — Der SMTP-Standard transportiert nur 7-Bit-ASCII. Binäre Anhänge (Bilder, PDFs, Archive) werden per Base64 in druckbare Zeichen kodiert, damit sie den Transportweg unbeschadet überstehen. Jeder E-Mail-Client dekodiert automatisch.

**JWT und API-Authentifizierung** — JSON Web Tokens bestehen aus drei Base64url-kodierten Segmenten: Header, Payload und Signatur. Base64url (ohne + und /) ist URL-sicher und wird in Authorization-Headern transportiert. Entwickler, die JWTs debuggen, dekodieren die Segmente einzeln.

**Data-URIs in HTML und CSS** — Kleine Bilder oder SVGs lassen sich als `data:image/png;base64,...` direkt ins Markup einbetten. Das spart HTTP-Requests, erhöht aber die Dateigröße um ein Drittel. Sinnvoll für Icons unter 2&nbsp;KB.

**Konfigurationsdateien** — Kubernetes-Secrets, Docker-Compose-Umgebungsvariablen und CI/CD-Pipelines speichern sensible Werte häufig Base64-kodiert. Das ist kein Sicherheitsgewinn, sondern verhindert Parsing-Probleme bei Sonderzeichen in YAML und JSON.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Welche Entwickler-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[UUID-Generator](/de/uuid-generator)** — Kryptographisch sichere UUIDs (v4 und v7) direkt im Browser erzeugen.
- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit 2-Space-Einrückung lesbar formatieren und validieren.
- **[Regex-Tester](/de/regex-tester)** — Reguläre Ausdrücke live testen mit Echtzeit-Matching und Gruppen-Hervorhebung.
