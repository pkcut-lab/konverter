---
toolId: "password-generator"
language: "de"
title: "Passwort-Generator — Sichere Passwörter erstellen"
headingHtml: "Sichere <em>Passwörter</em> erstellen"
metaDescription: "Passwort-Generator mit Web Crypto API: Zufallspasswort und Passphrase sofort erstellen. Entropie-Anzeige, DSGVO-konform, 100 % client-seitig."
tagline: "Kryptographisch sichere Passwörter — direkt im Browser, ohne Server-Kontakt."
intro: "Der Passwort-Generator erzeugt kryptographisch sichere Zufallspasswörter über die Web Crypto API deines Browsers. Kein Server sieht dein Passwort, kein Logging speichert es. Du wählst Länge, Zeichentypen und Modus — das Ergebnis erscheint sofort mit Live-Entropie-Anzeige in Bits."
category: "dev"
contentVersion: 1
howToUse:
  - "Stelle die gewünschte Passwort-Länge über den Slider oder das Eingabefeld ein."
  - "Aktiviere oder deaktiviere Zeichengruppen (Groß-/Kleinbuchstaben, Ziffern, Sonderzeichen)."
  - "Das Passwort generiert sich sofort bei jeder Änderung — kopiere es über den Copy-Button."
faq:
  - q: "Ist ein Online-Passwort-Generator sicher?"
    a: "Ja, wenn er client-seitig arbeitet. Dieser Generator nutzt die Web Crypto API deines Browsers — kein Passwort verlässt dein Gerät, kein Server loggt den Output."
  - q: "Wie lang sollte ein Passwort 2026 sein?"
    a: "NIST SP 800-63B Rev. 4 empfiehlt mindestens 15 Zeichen. Für Hochsicherheits-Konten (Banking, Master-Passwort) sind 20+ Zeichen oder eine 6-Wort-Passphrase sinnvoll."
  - q: "Was bedeutet Entropie bei Passwörtern?"
    a: "Entropie misst den Zufallsgehalt in Bits. Formel: Länge × log₂(Poolgröße). 16 Zeichen aus 94 möglichen ergeben ~105 Bit — ein Brute-Force-Angriff bräuchte astronomisch viele Versuche."
  - q: "Was ist der Unterschied zwischen Passwort und Passphrase?"
    a: "Ein Passwort ist eine zufällige Zeichenkette, eine Passphrase besteht aus mehreren zufälligen Wörtern. Sechs Wörter ergeben ~77 Bit Entropie — merkbar und sicher zugleich."
  - q: "Funktioniert der Generator offline?"
    a: "Ja. Nach dem ersten Laden arbeitet er vollständig im Browser. Die Web Crypto API benötigt keine Netzwerkverbindung für die Zufallszahlen-Erzeugung."
relatedTools:
  - uuid-generator
  - zeichenzaehler
  - regex-tester
---

## Was macht dieser Generator?

Der Passwort-Generator erzeugt Zufallspasswörter über `crypto.getRandomValues()` — die kryptographisch sichere Zufallsquelle moderner Browser. Jedes generierte Passwort ist statistisch unvorhersagbar und unabhängig von vorherigen Ergebnissen. Du bestimmst Länge und Zeichenpool, das Tool liefert sofort ein Passwort mit berechneter Entropie in Bits.

Anders als KI-generierte Passwörter, die nachweislich Muster wiederholen und erratbar sind, nutzt dieser Generator echten kryptographischen Zufall ohne algorithmische Vorhersagbarkeit.

## Wie funktioniert die Generierung?

Die Web Crypto API (`crypto.getRandomValues()`) liefert kryptographisch sichere Pseudozufallszahlen direkt aus dem Betriebssystem-Entropie-Pool. Der Generator wählt pro Zeichenposition einen zufälligen Index aus dem konfigurierten Zeichenpool.

Entropie-Berechnung: `E = L × log₂(C)`, wobei L die Passwort-Länge und C die Poolgröße ist. Bei 16 Zeichen aus allen vier Gruppen (94 Zeichen): `16 × 6,55 = ~105 Bit`.

| Zeichen | Pool | 12 Zeichen | 16 Zeichen | 20 Zeichen |
|---------|------|-----------|-----------|-----------|
| a–z     | 26   | 56,4 Bit  | 75,2 Bit  | 94,0 Bit  |
| a–z, A–Z | 52 | 68,4 Bit  | 91,2 Bit  | 114,0 Bit |
| a–z, A–Z, 0–9 | 62 | 71,4 Bit | 95,3 Bit | 119,1 Bit |
| Alle (94) | 94 | 78,7 Bit | 104,9 Bit | 131,1 Bit |

NIST SP 800-63B Rev. 4 (2024) empfiehlt mindestens 15 Zeichen. Die frühere Pflicht zur Zeichenklassen-Mischung wurde abgeschafft — Länge schlägt Komplexität.

## Anwendungsbeispiele

- **Online-Konten** — 16 Zeichen mit allen Zeichengruppen für E-Mail, Social Media, Shopping.
- **WLAN-Passwörter** — 20+ Zeichen (WPA2/WPA3 erlaubt bis 63), Sonderzeichen optional für Gerätekompatibilität.
- **Server und API-Tokens** — 32–64 Zeichen, alle Zeichengruppen, maximale Entropie.
- **PIN-Codes** — nur Ziffern, 6–8 Stellen für Geräte-Sperren oder Zwei-Faktor-Backup.
- **Master-Passwort** — 20+ Zeichen oder 6-Wort-Passphrase als Zugang zum Passwort-Manager.

## Datenschutz — 100 % im Browser

Kein Byte verlässt dein Gerät. Der Generator arbeitet vollständig client-seitig:

- Keine Server-Anfrage bei der Generierung
- Kein Logging, kein Analytics auf den generierten Output
- Kein Account nötig, keine Cookies für die Kernfunktion
- Offline-fähig nach erstem Laden (Service Worker)
- Quellcode auditierbar — keine Black-Box

Das unterscheidet diesen Generator von Vault-Anbietern, die den Generator als Upsell-Funnel nutzen und dabei Session-Daten erheben.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Zentimeter in Zoll](/de/zentimeter-zu-zoll)** — Maßeinheiten zwischen metrisch und imperial umrechnen.
- **[Kilometer zu Meilen](/de/kilometer-zu-meilen)** — Distanzen für internationale Datenblätter konvertieren.
- **[Celsius zu Fahrenheit](/de/celsius-zu-fahrenheit)** — Temperaturwerte zwischen SI und US-System umwandeln.
