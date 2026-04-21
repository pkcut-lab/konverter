---
toolId: "uuid-generator"
language: "de"
title: "UUID-Generator — Alle Versionen online erstellen"
headingHtml: "<em>UUID</em> Generator"
metaDescription: "UUID v4 und v7 online generieren. Kryptographisch sicher via Web Crypto API, komplett im Browser. Versionen-Vergleich, Entropie-Info, RFC 9562."
tagline: "Kryptographisch sichere UUIDs — direkt im Browser, ohne Server-Kontakt."
intro: "Der UUID-Generator erzeugt universell eindeutige Identifier über die Web Crypto API deines Browsers. Kein Server sieht deine UUIDs, kein Logging speichert sie. Du wählst die Version (v4 Random oder v7 Time-Ordered) — das Ergebnis erscheint sofort zum Kopieren."
category: "dev"
contentVersion: 1
howToUse:
  - "Wähle die UUID-Version: v4 (zufällig) oder v7 (zeitgeordnet)."
  - "Klicke auf Generieren oder drücke die Leertaste — die UUID erscheint sofort."
  - "Kopiere das Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Was ist eine UUID?"
    a: "Ein 128-Bit-Identifier nach RFC 9562, der ohne zentrale Vergabestelle universell eindeutig ist. Format: 32 Hex-Zeichen mit vier Bindestrichen (z. B. 550e8400-e29b-41d4-a716-446655440000)."
  - q: "Welche UUID-Version sollte ich verwenden?"
    a: "UUID v7 für Datenbank-Primary-Keys — die eingebettete Zeitordnung verhindert Index-Fragmentierung. UUID v4 für alle anderen Zwecke, bei denen kein Zeitbezug nötig ist."
  - q: "Ist UUID v4 kollisionssicher?"
    a: "Ja, praktisch. 122 Bit kryptographischer Zufall ergibt eine Kollisionswahrscheinlichkeit von 1:2⁶¹ erst nach 2,7 Trillionen erzeugten UUIDs."
  - q: "Was ist der Unterschied zwischen UUID und GUID?"
    a: "Kein technischer Unterschied. GUID (Globally Unique Identifier) ist der Microsoft-Terminus für dasselbe 128-Bit-Format."
  - q: "Funktioniert der Generator offline?"
    a: "Ja. Nach dem ersten Laden arbeitet er vollständig im Browser. Die Web Crypto API benötigt keine Netzwerkverbindung für die Zufallszahlen-Erzeugung."
relatedTools:
  - passwort-generator
  - unix-timestamp
  - hex-rgb-konverter
---

## Was macht dieser Generator?

Der UUID-Generator erzeugt universell eindeutige Identifier (Universally Unique Identifiers) über `crypto.getRandomValues()` — die kryptographisch sichere Zufallsquelle moderner Browser. Jede generierte UUID ist statistisch unvorhersagbar und unabhängig von vorherigen Ergebnissen. Du wählst zwischen UUID v4 (rein zufällig, 122 Bit Entropie) und UUID v7 (zeitgeordnet nach RFC 9562, 48 Bit Timestamp + 74 Bit Zufall).

Anders als serverseitige UUID-Generatoren verlässt hier kein Byte dein Gerät. Kein Logging, kein Tracking, kein Account.

## UUID-Versionen im Vergleich

Nicht jede UUID-Version eignet sich für jeden Einsatzzweck. Die Wahl hängt von Sortierbarkeit, Privacy und Entropie ab.

| Version | Entropie | Sortierbar | Privacy | Typischer Einsatz |
|---------|----------|------------|---------|-------------------|
| v4 | 122 Bit Zufall | Nein | Hoch — kein Zeitbezug | API-Tokens, Session-IDs, allgemeine Identifier |
| v7 | 74 Bit Zufall + 48 Bit Timestamp | Ja (lexikographisch) | Mittel — Zeitpunkt ableitbar | Datenbank-Primary-Keys, Event-Logs, verteilte Systeme |
| v1 | MAC-Adresse + Timestamp | Ja | Niedrig — MAC-Leak | Legacy-Systeme (nicht empfohlen für Neuprojekte) |
| v5 | Deterministisch (SHA-1) | Nein | Hoch | Reproduzierbare IDs aus Namespace + Name |

**Empfehlung 2026:** UUID v7 für alles mit Datenbank-Bezug. Bei 100 Millionen Rows kann der Wechsel von v4 zu zeitgeordneten IDs die Insert-Performance um das Fünffache steigern und die Index-Größe um 30 % senken.

## Aufbau einer UUID

Eine UUID besteht aus 128 Bit, dargestellt als 32 Hexadezimalzeichen mit vier Bindestrichen:

`xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`

- **M** (Bit 48–51): Versionsnummer (4 = v4, 7 = v7)
- **N** (Bit 64–65): Variante (immer `10` bei RFC 9562)
- **Rest**: kryptographisch sichere Zufallsbits (v4) oder Timestamp + Zufall (v7)

Bei UUID v7 enthalten die ersten 48 Bit (Bytes 0–5) den Unix-Timestamp in Millisekunden. Dadurch sind v7-UUIDs chronologisch sortierbar — ein entscheidender Vorteil für B-Tree-Indizes in Datenbanken.

## Anwendungsbeispiele

- **Datenbank-Primary-Keys** — UUID v7 verhindert Index-Fragmentierung bei großen Tabellen und ermöglicht chronologisches Sortieren ohne zusätzliche Spalte.
- **API-Tokens und Session-IDs** — UUID v4 liefert 122 Bit Zufall ohne Zeitbezug. Für Auth-Tokens ist eine UUID allein nicht ausreichend — kombiniere sie mit HMAC oder nutze dedizierte Token-Formate.
- **Verteilte Systeme** — UUIDs erlauben ID-Vergabe ohne zentrale Koordination. Jeder Knoten generiert lokal, Kollisionen sind statistisch ausgeschlossen.
- **Datei- und Ressourcen-Benennung** — Eindeutige Dateinamen ohne Konfliktrisiko bei parallelen Uploads.
- **Event-Logs und Audit-Trails** — UUID v7 macht Einträge sortierbar und nachvollziehbar, ohne separate Timestamp-Spalte.

## UUID vs. Alternativen

| Format | Länge | Sortierbar | Standard | Nativer DB-Typ |
|--------|-------|------------|----------|----------------|
| UUID v4 | 36 Zeichen | Nein | RFC 9562 | Ja (PostgreSQL, MySQL 8) |
| UUID v7 | 36 Zeichen | Ja | RFC 9562 | Ja |
| ULID | 26 Zeichen | Ja | Kein RFC | Nein |
| NanoID | 21 Zeichen | Nein | Kein RFC | Nein |
| CUID v2 | 24 Zeichen | Ja | Proprietär | Nein |

UUID bleibt 2026 der Standard für die meisten Anwendungsfälle: breiteste DB-Unterstützung, RFC-standardisiert, native Typen in PostgreSQL und MySQL. ULID und NanoID sind kompakter, erfordern aber Custom-Handling in Datenbanken.

## Sicherheitshinweise

- UUID v4 nutzt `crypto.getRandomValues()` (CSPRNG) — niemals `Math.random()` als Fallback.
- UUIDs sind **keine Auth-Tokens**. 122 Bit Zufall machen sie eindeutig, aber nicht geheim genug für Authentifizierung. Nutze dedizierte Token-Formate (JWT, Opaque Tokens) für Zugangskontrollen.
- UUID v1 leakt die MAC-Adresse des erzeugenden Geräts — in privacy-sensitiven Kontexten vermeiden.
- UUID v7 verrät den Erzeugungszeitpunkt auf Millisekundenebene. Bei öffentlich sichtbaren IDs kann das ein Information-Leak sein.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Passwort-Generator](/de/passwort-generator)** — Kryptographisch sichere Zufallspasswörter mit konfigurierbarer Länge und Zeichenpool erstellen.
- **[HEX-RGB-Konverter](/de/hex-rgb-konverter)** — Farbwerte zwischen Hexadezimal- und RGB-Notation umrechnen.
- **[Zentimeter in Zoll](/de/zentimeter-zu-zoll)** — Maßeinheiten zwischen metrisch und imperial umrechnen.
