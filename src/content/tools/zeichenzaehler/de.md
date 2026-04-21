---
toolId: "character-counter"
language: "de"
title: "Zeichenzähler — Zeichen, Wörter und Lesezeit zählen"
headingHtml: "<em>Zeichenzähler</em> für deutschen Text"
metaDescription: "Zeichen, Wörter und Lesezeit zählen — mit Plattform-Limits für Twitter, Instagram, LinkedIn und SMS. 100 % im Browser, ohne Tracking."
tagline: "Zeichen und Wörter in Echtzeit zählen — kalibriert für deutsche Texte."
intro: "Der Zeichenzähler analysiert deinen Text direkt im Browser. Zeichen mit und ohne Leerzeichen, Wörter, Sätze, Absätze und Lesezeit — alles in Echtzeit, ohne Submit-Button. Die Lesezeit ist auf 250 Wörter pro Minute kalibriert, dem Durchschnitt für deutschsprachige Texte. Kein Server sieht deinen Text, kein Tracking läuft im Hintergrund."
category: "text"
contentVersion: 1
eyebrow: "ZEICHENZÄHLER"
howToUse:
  - "Gib deinen Text in das Eingabefeld ein oder füge ihn per Strg+V ein."
  - "Alle Metriken aktualisieren sich sofort — Zeichen, Wörter, Sätze, Lesezeit."
  - "Prüfe die Plattform-Limits: Twitter, Instagram, LinkedIn und SMS auf einen Blick."
faq:
  - q: "Wie viele Zeichen hat ein Tweet?"
    a: "Ein Standard-Tweet auf X (Twitter) hat maximal 280 Zeichen. X Premium erlaubt bis zu 25.000 Zeichen pro Post."
  - q: "Wie viele Zeichen darf eine Meta-Description haben?"
    a: "Google zeigt in der Regel 150–160 Zeichen an (ca. 920 Pixel Breite). Alles darüber wird abgeschnitten."
  - q: "Warum zeigt der Zeichenzähler eine andere Lesezeit als englische Tools?"
    a: "Deutsche Leser lesen durchschnittlich 250 Wörter pro Minute, nicht 200 wie im Englischen. Dieser Zeichenzähler nutzt den für DE korrekten Wert."
  - q: "Zählen Emojis als ein oder zwei Zeichen?"
    a: "Für die reine Zeichenzahl zählt ein Emoji als 1 Zeichen. Twitter/X allerdings zählt Emojis intern als 2 Zeichen (Astral-Plane-Unicode)."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die gesamte Analyse läuft lokal im Browser. Kein Byte verlässt dein Gerät — kein Logging, kein Tracking, kein Cookie."
  - q: "Wie viele Zeichen hat eine SMS?"
    a: "Eine SMS im GSM-7-Standard hat 160 Zeichen. Enthält die Nachricht Umlaute (ä, ö, ü) oder Emojis, wechselt das Encoding zu Unicode — dann passen nur 70 Zeichen in eine einzelne SMS."
relatedTools: []
---

## Was macht der Zeichenzähler?

Der Zeichenzähler nimmt einen beliebigen Text und liefert sofort die wichtigsten Metriken: Zeichen mit Leerzeichen, Zeichen ohne Leerzeichen, Wörter, Sätze, Absätze und Zeilen. Die Auswertung passiert bei jeder Eingabe — kein Klick, kein Warten.

Zusätzlich schätzt das Tool die Lesezeit. Anders als englischsprachige Tools, die pauschal 200&nbsp;Wörter pro Minute ansetzen, nutzt dieser Zeichenzähler den für deutsche Texte realistischeren Wert von 250&nbsp;wpm. Das ergibt präzisere Angaben für deutschsprachige Inhalte.

## Plattform-Limits auf einen Blick

Wer für Social Media oder SEO schreibt, braucht die Zeichenlimits der jeweiligen Plattform. Statt zwischen verschiedenen Tabs zu wechseln, zeigt der Zeichenzähler die relevanten Grenzen direkt an:

| Plattform | Limit | Typ |
|-----------|-------|-----|
| X (Twitter, Standard) | 280&nbsp;Zeichen | Post |
| X (Twitter, Premium) | 25.000&nbsp;Zeichen | Post |
| Instagram Caption | 2.200&nbsp;Zeichen | Caption |
| Instagram Bio | 150&nbsp;Zeichen | Bio |
| LinkedIn Post | 2.600–3.000&nbsp;Zeichen | Post |
| Google Meta-Title | 50–60&nbsp;Zeichen | SEO |
| Google Meta-Description | 150–160&nbsp;Zeichen | SEO |
| SMS (GSM-7) | 160&nbsp;Zeichen | Nachricht |
| SMS (Unicode) | 70&nbsp;Zeichen | Nachricht |

Die Werte sind auf dem Stand 2026. Bei Plattform-Änderungen wird die Tabelle aktualisiert.

## Wie zählt der Zeichenzähler?

### Zeichen

Jedes sichtbare und unsichtbare Zeichen im Text zählt — Buchstaben, Ziffern, Satzzeichen, Leerzeichen, Tabulatoren und Zeilenumbrüche. Deutsche Umlaute (ä, ö, ü) und das ß zählen jeweils als 1&nbsp;Zeichen, nicht als 2&nbsp;Bytes.

Emojis wie 🎉 zählen als 1&nbsp;Zeichen (per Unicode-Codepoint). Twitter/X allerdings wertet Emojis intern als 2&nbsp;Zeichen — ein Unterschied, der bei knappen Tweets relevant wird.

### Wörter

Wörter werden an Whitespace-Grenzen getrennt. Bindestrich-Komposita wie „Zeichenzähler-Tool" zählen als ein Wort. Ein Text mit nur Leerzeichen ergibt 0&nbsp;Wörter.

### Sätze

Satzende-Marker sind `.`, `!`, `?` und `…`. Deutsche Abkürzungen wie „z.&nbsp;B." oder „u.&nbsp;a." können zu Falsch-Positiven führen — die Satzzahl ist eine Schätzung, kein grammatischer Parser.

### Lesezeit

Die Formel: Wörter ÷ 250 = Minuten. Der Wert 250&nbsp;wpm basiert auf Studien zur deutschen Lesegeschwindigkeit und liegt über dem englischen Standard von 200&nbsp;wpm. Der Grund: Deutsche Wörter sind zwar im Schnitt länger, aber geübte Leser kompensieren das durch höhere Leseflüssigkeit.

## Datenschutz — alles bleibt im Browser

Der Zeichenzähler verarbeitet Text ausschließlich im Browser. Kein Server empfängt, speichert oder analysiert deinen Input. Das bedeutet:

- **Vertrauliche Texte** — Verträge, E-Mails, interne Dokumente können bedenkenlos geprüft werden.
- **DSGVO-konform** — Keine Datenverarbeitung auf externen Servern, kein Consent-Banner nötig.
- **Kein Tracking** — Weder Google Analytics noch Piwik, weder Cookies noch Fingerprinting.

Im Vergleich: Die meisten Online-Zeichenzähler setzen Google Analytics oder nutzungsbasierte Werbung ein. Dieser Zeichenzähler verzichtet bewusst darauf.

## Typische Einsatzgebiete

- **Social-Media-Texte** — Instagram-Captions, LinkedIn-Posts und Tweets auf Plattform-Limits prüfen, bevor sie veröffentlicht werden.
- **SEO-Texte** — Meta-Titles und Meta-Descriptions auf die Google-Zeichengrenzen trimmen, ohne in der SERP abgeschnitten zu werden.
- **SMS-Marketing** — Nachrichten auf 160&nbsp;Zeichen (GSM-7) oder 70&nbsp;Zeichen (Unicode mit Umlauten) begrenzen, um Mehrfach-SMS zu vermeiden.
- **Wissenschaftliche Arbeiten** — Abstracts und Paper-Zusammenfassungen auf vorgegebene Zeichenlimits prüfen.
- **Bewerbungen** — Anschreiben und Motivationsschreiben auf empfohlene Längen kontrollieren.

## Warum Emojis manchmal als 2 Zeichen zählen

Unicode-Emojis liegen auf der sogenannten Astral Plane (ab U+10000). In der internen Darstellung von JavaScript belegt ein solches Emoji zwei 16-Bit-Code-Units (ein Surrogate Pair). Die JavaScript-Eigenschaft `.length` zählt Code-Units, nicht Codepoints — daher `"🎉".length === 2`.

Dieser Zeichenzähler nutzt `[...text].length`, das korrekt nach Unicode-Codepoints aufteilt. Für die reine Zeichenzählung ergibt ein Emoji daher 1&nbsp;Zeichen. Twitter/X verwendet intern die `.length`-Methode und zählt Emojis als 2 — wer genau am 280-Zeichen-Limit arbeitet, sollte das einkalkulieren.

## SMS: GSM-7 vs. Unicode

Eine Standard-SMS fasst 160&nbsp;Zeichen im GSM-7-Encoding. Dieses Encoding deckt lateinische Buchstaben, Ziffern und gängige Satzzeichen ab — aber keine Umlaute.

Sobald ein Text ä, ö, ü, ß oder ein Emoji enthält, wechselt das Encoding automatisch zu Unicode (UCS-2). In diesem Modus passen nur noch 70&nbsp;Zeichen in eine einzelne SMS. Wer SMS-Texte für deutsche Empfänger verfasst und Kosten sparen will, sollte auf Umlaute verzichten oder den Text unter 70&nbsp;Zeichen halten.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Text-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — JSON-Code lesbar formatieren, validieren und Syntaxfehler mit Zeilennummer erkennen.
- **[UUID-Generator](/de/uuid-generator)** — Kryptographisch sichere UUIDs (v4 und v7) direkt im Browser erzeugen.
- **[Passwort-Generator](/de/passwort-generator)** — Zufallspasswörter mit konfigurierbarer Länge und Zeichenpool erstellen.
