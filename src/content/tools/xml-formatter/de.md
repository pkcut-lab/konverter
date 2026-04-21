---
toolId: "xml-formatter"
language: "de"
title: "XML Formatter — XML-Code einrücken und verschönern"
headingHtml: "<em>XML</em> Formatter"
metaDescription: "XML formatieren und einrücken — direkt im Browser. Tags, Attribute, CDATA-Sektionen und Kommentare werden sauber strukturiert. Kein Server, kein Tracking."
tagline: "XML-Dokumente lesbar formatieren — komplett im Browser, ohne Server-Kontakt."
intro: "Der XML Formatter nimmt rohen oder minifizierten XML-Code und gibt ihn mit korrekter Einrückung zurück. Tags erhalten eigene Zeilen, Verschachtelungen werden sichtbar und Sonderstrukturen wie CDATA, Kommentare und Processing Instructions bleiben erhalten. Die Formatierung läuft vollständig im Browser — kein Server sieht deine Daten."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge deinen XML-Code in das Eingabefeld ein — per Paste oder Drag-and-Drop."
  - "Klicke auf Formatieren — der verschönerte XML-Code erscheint sofort."
  - "Kopiere das Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Welche XML-Varianten werden unterstützt?"
    a: "Der Formatter arbeitet auf Textebene und unterstützt Standard-XML, XHTML, SVG, SOAP-Envelopes und beliebige XML-Dialekte. Spezifische Schema-Validierung findet nicht statt."
  - q: "Werden CDATA-Sektionen verändert?"
    a: "Nein. CDATA-Blöcke bleiben inhaltlich unverändert. Der Formatter erkennt die Begrenzer und setzt den Block als eigene Zeile mit korrekter Einrückung."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Formatierung läuft vollständig im Browser. Kein Byte verlässt dein Gerät, kein Logging, kein Tracking."
  - q: "Kann der Formatter auch minifiziertes XML verarbeiten?"
    a: "Ja. Einzeilige XML-Strings ohne Zeilenumbrüche werden korrekt in eine mehrzeilige Struktur mit 2-Space-Einrückung aufgelöst."
  - q: "Was passiert mit XML-Kommentaren?"
    a: "Kommentare werden als eigene Zeile mit passender Einrückung ausgegeben. Der Inhalt bleibt unverändert."
relatedTools:
  - json-formatter
  - sql-formatter
  - base64-encoder
---

## Was macht der Formatter?

Der XML Formatter nimmt beliebigen XML-Code und strukturiert ihn in ein lesbares Format. Jedes öffnende Tag beginnt auf einer eigenen Zeile, und verschachtelte Elemente werden um zwei Leerzeichen pro Ebene eingerückt. Selbstschließende Tags, Kommentare, CDATA-Sektionen und Processing Instructions wie die XML-Deklaration werden erkannt und korrekt platziert. Überflüssige Leerzeichen zwischen Tags werden normalisiert, während Textinhalte und CDATA-Daten unangetastet bleiben.

Das Ergebnis ist konsistent eingerücktes XML, das sich in Code-Reviews, Konfigurationsdateien und API-Dokumentation direkt verwenden lässt.

## Umrechnungsformel

Der Formatter arbeitet regelbasiert in drei Schritten:

1. **Tokenisierung** — der XML-Code wird in Token zerlegt: öffnende Tags, schließende Tags, selbstschließende Tags, Kommentare, CDATA-Sektionen, Processing Instructions und Textknoten. Jedes Token erhält einen Typ, der die Einrückungslogik steuert.

2. **Strukturerkennung** — öffnende Tags erhöhen die Einrückungstiefe um eine Stufe (2 Leerzeichen). Schließende Tags reduzieren die Tiefe zurück. Selbstschließende Tags ändern die Tiefe nicht. Kommentare und CDATA werden auf der aktuellen Ebene ausgegeben.

3. **Ausgabe** — jedes Token erhält eine eigene Zeile mit der berechneten Einrückung. Leerraum zwischen Tags wird entfernt und durch die strukturierte Ausgabe ersetzt.

Beispiel: `<root><item id="1"><name>Test</name></item></root>` wird zu:

```
<root>
  <item id="1">
    <name>
      Test
    </name>
  </item>
</root>
```

## Anwendungsbeispiele

Typische Eingaben und ihr formatiertes Ergebnis:

| Eingabe | Formatiertes Ergebnis |
|---------|----------------------|
| `<root><a/></root>` | Zwei Zeilen mit `<root>` und eingerücktem `<a />` |
| `<?xml version="1.0"?><data/>` | XML-Deklaration auf eigener Zeile, Tag darunter |
| `<div><!-- Kommentar --><p>Text</p></div>` | Kommentar und `<p>` jeweils eingerückt |
| `<items><item>A</item><item>B</item></items>` | Jedes `<item>` auf eigener Zeile eingerückt |
| `<root><![CDATA[x < 5]]></root>` | CDATA-Block eingerückt, Inhalt unverändert |

Der Formatter eignet sich für XML-Dokumente jeder Größe — von einzeiligen Konfigurationsfragmenten bis zu mehrseitigen SOAP-Envelopes oder SVG-Dateien.

## Häufige Einsatzgebiete

**API-Entwicklung und Debugging** — REST- und SOAP-APIs liefern XML-Antworten oft als kompakten Einzeiler. Ein formatierter Blick auf die Verschachtelung hilft, fehlende Elemente oder falsche Namespaces schnell zu finden. Besonders bei SOAP-Envelopes mit tiefer Verschachtelung spart die Strukturansicht Zeit.

**Konfigurations-Management** — XML-Konfigurationsdateien für Build-Systeme (Maven `pom.xml`, Ant, MSBuild), Application-Server (Tomcat `server.xml`, Spring) und IDE-Settings werden häufig von Tools generiert und sind dann schlecht lesbar. Formatiertes XML macht Änderungen in Diffs sofort sichtbar.

**Content-Verarbeitung** — XHTML, SVG, RSS-Feeds und Sitemaps sind XML-basiert. Beim manuellen Bearbeiten oder Prüfen dieser Formate ist korrekte Einrückung Voraussetzung für effizientes Arbeiten.

**Daten-Import und Export** — Viele ERP- und CRM-Systeme exportieren Daten als XML. Bevor ein Import-Mapping erstellt wird, muss die Struktur verstanden werden. Formatiertes XML macht die Hierarchie auf einen Blick klar.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit 2-Space-Einrückung lesbar formatieren und validieren.
- **[SQL Formatter](/de/sql-formatter)** — SQL-Abfragen verschönern mit automatischer Keyword-Großschreibung und Einrückung.
- **[Base64 Encoder](/de/base64-encoder)** — Text in Base64 kodieren, direkt im Browser ohne Server-Kontakt.
