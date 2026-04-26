---
toolId: "hash-generator"
language: "de"
title: "Hash-Generator — Text-Hashes online erzeugen"
headingHtml: "<em>Hash</em>-Generator"
metaDescription: "MD5-, SHA-1-, SHA-256-, SHA-384- und SHA-512-Hashes direkt im Browser erzeugen. Kein Server-Upload, kein Tracking. Alle Algorithmen auf einen Blick."
tagline: "MD5, SHA-1, SHA-256, SHA-384 und SHA-512 auf einen Blick — komplett im Browser."
intro: "Der Hash-Generator berechnet kryptographische Hash-Werte aus beliebigem Text. Du gibst einen String ein und erhältst sofort die Digests aller fünf gängigen Algorithmen. Die Berechnung läuft vollständig im Browser — kein Byte verlässt dein Gerät, kein Server loggt deine Eingabe."
category: "dev"
stats:
  - label: "Algorithmen"
    value: "5"
  - label: "Max. Eingabe"
    value: "unbegrenzt"
  - label: "Verarbeitung"
    value: "lokal"
contentVersion: 1
howToUse:
  - "Füge deinen Text in das Eingabefeld ein — per Paste oder Tippen."
  - "Die Hashes für MD5, SHA-1, SHA-256, SHA-384 und SHA-512 erscheinen sofort."
  - "Kopiere den gewünschten Hash über den Copy-Button in die Zwischenablage."
faq:
  - q: "Was ist ein Hash?"
    a: "Ein Hash ist ein Fingerabdruck fester Länge, den ein Algorithmus aus beliebig langen Daten berechnet. Gleicher Input ergibt immer denselben Hash, aber aus dem Hash lässt sich der Input nicht rekonstruieren."
  - q: "Welcher Algorithmus ist der sicherste?"
    a: "SHA-256, SHA-384 und SHA-512 gelten 2026 als kryptographisch sicher. SHA-1 ist seit 2017 gebrochen (SHAttered-Angriff). MD5 ist seit 2004 unsicher und nur noch für Prüfsummen ohne Sicherheitsanspruch geeignet."
  - q: "Wie lang ist ein SHA-256-Hash?"
    a: "Ein SHA-256-Digest hat immer 256 Bit, dargestellt als 64 Hex-Zeichen. Die Länge ist unabhängig von der Eingabegröße."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Alle Algorithmen laufen als reines JavaScript im Browser. Kein Upload, kein Logging, kein Tracking."
  - q: "Kann ich aus einem Hash den Originaltext berechnen?"
    a: "Nein. Hash-Funktionen sind Einwegfunktionen. Der einzige Weg, einen Hash zu einem Text zuzuordnen, ist Brute-Force oder Rainbow-Tables — bei langen Inputs praktisch unmöglich."
relatedTools:
  - base64-encoder
  - uuid-generator
  - passwort-generator
datePublished: '2026-04-21'
dateModified: '2026-04-21'

---

## Was macht der Generator?

Der Hash-Generator nimmt einen beliebigen Text-String und berechnet daraus fünf kryptographische Digests: MD5 (128 Bit), SHA-1 (160 Bit), SHA-256 (256 Bit), SHA-384 (384 Bit) und SHA-512 (512 Bit). Alle Ergebnisse erscheinen gleichzeitig als hexadezimale Zeichenketten. Die Berechnung ist deterministisch — identischer Input liefert immer identischen Output.

Der Generator verarbeitet UTF-8 korrekt: Umlaute, Sonderzeichen und Emojis werden in ihre Byte-Sequenzen zerlegt, bevor der Hash-Algorithmus greift. Leerer Input wird mit einer klaren Meldung abgewiesen.

## Was ist die Umrechnungsformel?

Hash-Funktionen sind keine Umrechnungen im klassischen Sinn, sondern Einweg-Transformationen. Der Algorithmus (am Beispiel SHA-256):

1. Input-Text wird in UTF-8-Bytes konvertiert.
2. Die Nachricht wird auf ein Vielfaches von 512 Bit aufgefüllt (Padding).
3. Der Algorithmus verarbeitet die Nachricht in 512-Bit-Blöcken durch 64 Runden bitweiser Operationen (Rotation, XOR, Addition modulo 2^32).
4. Das Ergebnis ist ein 256-Bit-Digest, dargestellt als 64 Hex-Zeichen.

Beispiel: `Hallo` ergibt den SHA-256-Hash `d3751d33f9cd5049c4af2b462735457e907ef1f17e8b4e3bfc5e319bce4b6543`. Ändert sich auch nur ein Zeichen, ändert sich der gesamte Hash (Lawineneffekt).

## Welche Anwendungsbeispiele gibt es?

| Input-Text | Algorithmus | Hash-Digest (gekürzt) | Volle Länge |
|------------|-------------|----------------------|-------------|
| `Hallo` | MD5 | `d1bf93299...` | 32 Zeichen |
| `Hallo` | SHA-1 | `59d9a6df0...` | 40 Zeichen |
| `Hallo` | SHA-256 | `d3751d33f...` | 64 Zeichen |
| `test` | SHA-256 | `9f86d081...` | 64 Zeichen |
| `password` | SHA-512 | `b109f3bbc...` | 128 Zeichen |

Hashes dienen der Integritätsprüfung, nicht der Verschlüsselung. Wer einen Hash kennt, kann den Originaltext nicht rekonstruieren — aber er kann prüfen, ob ein gegebener Text denselben Hash erzeugt.

## Welche Einsatzgebiete gibt es?

**Software-Integrität und Downloads** — Entwickler veröffentlichen SHA-256-Checksummen neben ihren Releases. Nach dem Download berechnest du den Hash der Datei und vergleichst ihn mit dem publizierten Wert. Stimmen beide überein, ist die Datei unverändert.

**Passwort-Speicherung** — Datenbanken speichern keine Klartext-Passwörter, sondern deren Hash-Werte (idealerweise mit Salt und einem langsamen Algorithmus wie bcrypt oder Argon2). Beim Login wird der eingegebene Hash mit dem gespeicherten verglichen.

**Git und Versionskontrolle** — Git identifiziert Commits, Trees und Blobs über SHA-1-Hashes. Jeder Commit-Hash ist ein Fingerabdruck des gesamten Repository-Zustands zu diesem Zeitpunkt. Git migriert schrittweise zu SHA-256.

**API-Signaturen und Webhooks** — Webhooks nutzen HMAC-SHA-256, um Payloads zu signieren. Der Empfänger berechnet den Hash mit einem geteilten Secret und vergleicht ihn mit dem mitgelieferten Wert. Manipulation wird sofort erkannt.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Welche Entwickler-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Base64 Encoder](/de/base64-encoder)** — Text in Base64 kodieren, direkt im Browser ohne Server-Kontakt.
- **[UUID-Generator](/de/uuid-generator)** — Kryptographisch sichere UUIDs (v4 und v7) direkt im Browser erzeugen.
- **[Passwort-Generator](/de/passwort-generator)** — Sichere Zufallspasswörter mit konfigurierbarer Länge und Zeichenklassen generieren.
