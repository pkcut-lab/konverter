---
toolId: "xml-formatter"
language: "de"
title: "XML Formatter — XML-Code einruecken und verschoenern"
headingHtml: "<em>XML</em> Formatter"
metaDescription: "XML formatieren und einruecken — direkt im Browser. Tags, Attribute, CDATA-Sektionen und Kommentare werden sauber strukturiert. Kein Server, kein Tracking."
tagline: "XML-Dokumente lesbar formatieren — komplett im Browser, ohne Server-Kontakt."
intro: "Der XML Formatter nimmt rohen oder minifizierten XML-Code und gibt ihn mit korrekter Einrueckung zurueck. Tags erhalten eigene Zeilen, Verschachtelungen werden sichtbar und Sonderstrukturen wie CDATA, Kommentare und Processing Instructions bleiben erhalten. Die Formatierung laeuft vollstaendig im Browser — kein Server sieht deine Daten."
category: "dev"
contentVersion: 1
howToUse:
  - "Fuege deinen XML-Code in das Eingabefeld ein — per Paste oder Drag-and-Drop."
  - "Klicke auf Formatieren — der verschoenerte XML-Code erscheint sofort."
  - "Kopiere das Ergebnis ueber den Copy-Button in die Zwischenablage."
faq:
  - q: "Welche XML-Varianten werden unterstuetzt?"
    a: "Der Formatter arbeitet auf Textebene und unterstuetzt Standard-XML, XHTML, SVG, SOAP-Envelopes und beliebige XML-Dialekte. Spezifische Schema-Validierung findet nicht statt."
  - q: "Werden CDATA-Sektionen veraendert?"
    a: "Nein. CDATA-Bloecke bleiben inhaltlich unveraendert. Der Formatter erkennt die Begrenzer und setzt den Block als eigene Zeile mit korrekter Einrueckung."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Formatierung laeuft vollstaendig im Browser. Kein Byte verlaesst dein Geraet, kein Logging, kein Tracking."
  - q: "Kann der Formatter auch minifiziertes XML verarbeiten?"
    a: "Ja. Einzeilige XML-Strings ohne Zeilenumbrueche werden korrekt in eine mehrzeilige Struktur mit 2-Space-Einrueckung aufgeloest."
  - q: "Was passiert mit XML-Kommentaren?"
    a: "Kommentare werden als eigene Zeile mit passender Einrueckung ausgegeben. Der Inhalt bleibt unveraendert."
relatedTools:
  - json-formatter
  - sql-formatter
  - base64-encoder
---

## Was macht der Formatter?

Der XML Formatter nimmt beliebigen XML-Code und strukturiert ihn in ein lesbares Format. Jedes oeffnende Tag beginnt auf einer eigenen Zeile, und verschachtelte Elemente werden um zwei Leerzeichen pro Ebene eingerueckt. Selbstschliessende Tags, Kommentare, CDATA-Sektionen und Processing Instructions wie die XML-Deklaration werden erkannt und korrekt platziert. Ueberflussige Leerzeichen zwischen Tags werden normalisiert, waehrend Textinhalte und CDATA-Daten unangetastet bleiben.

Das Ergebnis ist konsistent eingeruecktes XML, das sich in Code-Reviews, Konfigurationsdateien und API-Dokumentation direkt verwenden laesst.

## Umrechnungsformel

Der Formatter arbeitet regelbasiert in drei Schritten:

1. **Tokenisierung** — der XML-Code wird in Token zerlegt: oeffnende Tags, schliessende Tags, selbstschliessende Tags, Kommentare, CDATA-Sektionen, Processing Instructions und Textknoten. Jedes Token erhaelt einen Typ, der die Einrueckungslogik steuert.

2. **Strukturerkennung** — oeffnende Tags erhoehen die Einrueckungstiefe um eine Stufe (2 Leerzeichen). Schliessende Tags reduzieren die Tiefe zurueck. Selbstschliessende Tags aendern die Tiefe nicht. Kommentare und CDATA werden auf der aktuellen Ebene ausgegeben.

3. **Ausgabe** — jedes Token erhaelt eine eigene Zeile mit der berechneten Einrueckung. Leerraum zwischen Tags wird entfernt und durch die strukturierte Ausgabe ersetzt.

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
| `<root><a/></root>` | Zwei Zeilen mit `<root>` und eingeruecktem `<a />` |
| `<?xml version="1.0"?><data/>` | XML-Deklaration auf eigener Zeile, Tag darunter |
| `<div><!-- Kommentar --><p>Text</p></div>` | Kommentar und `<p>` jeweils eingerueckt |
| `<items><item>A</item><item>B</item></items>` | Jedes `<item>` auf eigener Zeile eingerueckt |
| `<root><![CDATA[x < 5]]></root>` | CDATA-Block eingerueckt, Inhalt unveraendert |

Der Formatter eignet sich fuer XML-Dokumente jeder Groesse — von einzeiligen Konfigurationsfragmenten bis zu mehrseitigen SOAP-Envelopes oder SVG-Dateien.

## Haeufige Einsatzgebiete

**API-Entwicklung und Debugging** — REST- und SOAP-APIs liefern XML-Antworten oft als kompakten Einzeiler. Ein formatierter Blick auf die Verschachtelung hilft, fehlende Elemente oder falsche Namespaces schnell zu finden. Besonders bei SOAP-Envelopes mit tiefer Verschachtelung spart die Strukturansicht Zeit.

**Konfigurations-Management** — XML-Konfigurationsdateien fuer Build-Systeme (Maven `pom.xml`, Ant, MSBuild), Application-Server (Tomcat `server.xml`, Spring) und IDE-Settings werden haeufig von Tools generiert und sind dann schlecht lesbar. Formatiertes XML macht Aenderungen in Diffs sofort sichtbar.

**Content-Verarbeitung** — XHTML, SVG, RSS-Feeds und Sitemaps sind XML-basiert. Beim manuellen Bearbeiten oder Pruefen dieser Formate ist korrekte Einrueckung Voraussetzung fuer effizientes Arbeiten.

**Daten-Import und Export** — Viele ERP- und CRM-Systeme exportieren Daten als XML. Bevor ein Import-Mapping erstellt wird, muss die Struktur verstanden werden. Formatiertes XML macht die Hierarchie auf einen Blick klar.

## Haeufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) fuer Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Oekosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit 2-Space-Einrueckung lesbar formatieren und validieren.
- **[SQL Formatter](/de/sql-formatter)** — SQL-Abfragen verschoenern mit automatischer Keyword-Grossschreibung und Einrueckung.
- **[Base64 Encoder](/de/base64-encoder)** — Text in Base64 kodieren, direkt im Browser ohne Server-Kontakt.
