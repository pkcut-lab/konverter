---
toolId: "json-diff"
language: "de"
title: "JSON vergleichen — Unterschiede mit Pfad-Anzeige finden"
headingHtml: "JSON vergleichen und <em>Unterschiede</em> finden"
metaDescription: "Zwei JSON-Dokumente online vergleichen: JSON-Path pro Änderung, Typ-Erkennung und Array-Order-Option. 100&nbsp;% im Browser, ohne Upload, DSGVO-konform."
tagline: "Zwei JSON-Dokumente nebeneinander vergleichen — jede Abweichung mit JSON-Path und Typ-Info."
intro: "Der JSON-Diff analysiert zwei JSON-Dokumente und zeigt dir sofort, welche Schlüssel hinzugefügt, entfernt oder geändert wurden. Jede Abweichung erhält ihren JSON-Path (z. B. $.items[0].name), damit du die Stelle im Dokument direkt findest. Typ-Wechsel wie String zu Number werden explizit markiert. Kein Server empfängt deine Daten — die gesamte Verarbeitung läuft lokal im Browser."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge das erste JSON-Dokument in das Eingabefeld ein."
  - "Setze eine Trennzeile mit === darunter."
  - "Füge das zweite JSON-Dokument unter der Trennzeile ein."
  - "Die Unterschiede erscheinen automatisch mit JSON-Path, Wert und Typ-Info."
faq:
  - q: "Wie vergleicht man zwei JSON-Dateien?"
    a: "Erstes JSON oben einfügen, Trennzeile === setzen, zweites JSON darunter. Das Tool zeigt jede Abweichung mit dem zugehörigen JSON-Path an."
  - q: "Was ist ein JSON-Path?"
    a: "Ein JSON-Path beschreibt den Weg zu einem Wert im Dokument, z. B. $.users[0].name. So findest du die Stelle sofort, ohne manuell suchen zu müssen."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Der gesamte Vergleich läuft lokal im Browser. Kein Byte verlässt dein Gerät."
  - q: "Was passiert bei unterschiedlichen Array-Reihenfolgen?"
    a: "Standardmäßig vergleicht das Tool Arrays positionsbasiert. Mit der Direktive // ignore-array-order in der ersten Zeile wird die Reihenfolge ignoriert und nach Wert-Gleichheit gematcht."
  - q: "Erkennt das Tool Typ-Wechsel?"
    a: "Ja. Wenn ein Wert z. B. von String zu Number wechselt, wird das als Typ-Wechsel markiert — nicht nur als Wertänderung."
relatedTools:
  - json-formatter
  - text-diff
  - xml-formatter
datePublished: '2026-04-21'
dateModified: '2026-04-24'

---

## Was macht der JSON-Diff?

Der JSON-Diff nimmt zwei JSON-Dokumente — Original und geänderte Version — und listet alle Unterschiede strukturiert auf. Jede Differenz enthält den vollständigen JSON-Path, den alten und neuen Wert sowie die Art der Änderung: hinzugefügt, entfernt, geändert oder Typ-Wechsel.

Das Ergebnis ist eine kompakte Übersicht mit Zusammenfassung (Anzahl der Änderungen pro Kategorie) und Detailzeilen. Keine Registrierung, kein Login, kein Server-Upload.

## Wie funktioniert der Vergleich?

Der Algorithmus durchläuft beide JSON-Bäume rekursiv. Auf jeder Ebene wird geprüft:

- **Objekte:** Schlüssel werden verglichen. Fehlende Schlüssel gelten als entfernt, neue als hinzugefügt, vorhandene werden rekursiv weiter verglichen.
- **Arrays:** Standardmäßig positionsbasiert — Element an Index 0 links wird mit Element an Index 0 rechts verglichen. Mit der Direktive `// ignore-array-order` in der ersten Zeile wechselt der Algorithmus auf Wert-Gleichheit: Elemente werden unabhängig von ihrer Position zugeordnet.
- **Primitive:** Werte werden direkt verglichen. Stimmt der Typ nicht überein (z. B. `"42"` vs. `42`), wird ein Typ-Wechsel gemeldet, nicht nur eine Wertänderung.

Vor dem Vergleich wird jedes Dokument mit `JSON.parse()` validiert. Syntaxfehler werden mit Zeilennummer gemeldet.

## Welche Anwendungsbeispiele gibt es?

| Szenario | Beschreibung |
|----------|-------------|
| API-Response-Vergleich | Zwei Antworten desselben Endpoints vergleichen, um Schema-Drift zu erkennen. |
| Konfigurations-Diff | `package.json`, `tsconfig.json` oder CI-Konfigurationen vor und nach einer Änderung prüfen. |
| Datenbank-Export-Abgleich | Zwei JSON-Exports einer Datenbank vergleichen, um geänderte Datensätze zu identifizieren. |
| Code-Review-Hilfe | JSON-Fixtures in Tests vergleichen, um unbeabsichtigte Änderungen zu finden. |
| Feature-Flag-Audit | Zwei Versionen einer Feature-Flag-Konfiguration vergleichen, um aktivierte oder deaktivierte Flags zu erkennen. |
| Lokalisierungs-Check | Zwei Sprach-JSON-Dateien vergleichen, um fehlende oder überschüssige Übersetzungsschlüssel zu finden. |

## Welche Einsatzgebiete gibt es?

**API-Entwicklung und Debugging.** Backend-Teams vergleichen API-Responses vor und nach einem Deployment. Der JSON-Path jeder Änderung erleichtert das Auffinden der betroffenen Stelle im Code. Typ-Wechsel (z. B. `"price": "9.99"` → `"price": 9.99`) werden explizit markiert — ein häufiger Fehler bei Serialisierungs-Änderungen.

**DevOps und Konfigurationsmanagement.** Terraform-State-Dateien, Docker-Compose-Configs oder Kubernetes-Manifeste in JSON-Form lassen sich schnell vergleichen. Die Array-Order-Option ist besonders nützlich bei Listen von Umgebungsvariablen, deren Reihenfolge semantisch irrelevant ist.

**Datenqualitäts-Prüfung.** Datenanalysten vergleichen JSON-Exports aus verschiedenen Quellen oder Zeitpunkten. Der Diff zeigt nicht nur geänderte Werte, sondern auch strukturelle Abweichungen wie fehlende Felder oder Typ-Inkonsistenzen.

**Frontend-Entwicklung.** Mock-Daten, i18n-JSON-Dateien und Fixture-Dateien für Tests ändern sich häufig. Der JSON-Diff hilft, unbeabsichtigte Änderungen in Pull-Requests zu erkennen, bevor sie gemergt werden.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Welche Entwickler-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — JSON-Code lesbar formatieren, validieren und Syntaxfehler mit Zeilennummer erkennen.
- **[Text-Diff](/de/text-diff)** — Zwei Texte vergleichen und Unterschiede auf Wort- und Zeilenebene farblich markieren.
- **[XML Formatter](/de/xml-formatter)** — XML-Code einrücken, validieren und übersichtlich formatieren.
