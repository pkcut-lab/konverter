---
toolId: "sql-formatter"
language: "de"
title: "SQL Formatter — SQL-Code verschönern"
headingHtml: "<em>SQL</em> Formatter"
metaDescription: "SQL formatieren und verschönern — direkt im Browser. Keywords automatisch großgeschrieben, Einrückung ergänzt, String-Literale bleiben erhalten."
tagline: "SQL-Abfragen lesbar formatieren — komplett im Browser, ohne Server-Kontakt."
intro: "Der SQL Formatter nimmt rohen, unformatierten SQL-Code und gibt ihn sauber strukturiert zurück. Keywords werden automatisch großgeschrieben, Klauseln erhalten eigene Zeilen und Einrückungen passen sich der Verschachtelungstiefe an. Die Formatierung läuft vollständig im Browser — kein Server sieht deine Queries."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge deinen SQL-Code in das Eingabefeld ein — per Paste oder Drag-and-Drop."
  - "Klicke auf Formatieren — der verschönerte SQL-Code erscheint sofort."
  - "Kopiere das Ergebnis über den Copy-Button in die Zwischenablage."
faq:
  - q: "Welche SQL-Dialekte werden unterstützt?"
    a: "Der Formatter arbeitet syntax-agnostisch auf Keyword-Ebene. Standard-SQL, MySQL, PostgreSQL, SQLite und SQL Server werden gleich behandelt — dialektspezifische Erweiterungen bleiben erhalten, auch wenn sie nicht speziell erkannt werden."
  - q: "Werden String-Literale verändert?"
    a: "Nein. Inhalte in einfachen Anführungszeichen bleiben unverändert. Der Formatter erkennt auch escaped Quotes innerhalb von Strings und lässt sie intakt."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Formatierung läuft vollständig im Browser. Kein Byte verlässt dein Gerät, kein Logging, kein Tracking."
  - q: "Kann ich mehrere SQL-Statements gleichzeitig formatieren?"
    a: "Ja. Trenne Statements mit Semikolon — der Formatter erkennt die Grenzen und formatiert jedes Statement einzeln."
  - q: "Was passiert mit Kommentaren im SQL-Code?"
    a: "Der aktuelle Formatter behandelt Kommentare als reguläre Token. Einzeilige Kommentare mit -- und Block-Kommentare mit /* */ werden beibehalten, können aber in der Einrückung abweichen."
relatedTools:
  - json-formatter
  - base64-encoder
  - regex-tester
datePublished: '2026-04-21'
dateModified: '2026-04-21'

---

## Was macht der Formatter?

Der SQL Formatter nimmt beliebigen SQL-Code und strukturiert ihn in ein lesbares Format. SQL-Keywords wie SELECT, FROM, WHERE und JOIN werden automatisch großgeschrieben. Jede Hauptklausel beginnt auf einer eigenen Zeile mit passender Einrückung. Überflüssige Leerzeichen und Zeilenumbrüche werden normalisiert, während String-Literale in einfachen Anführungszeichen unangetastet bleiben.

Das Ergebnis ist konsistent eingerückter SQL-Code, der sich in Code-Reviews, Dokumentation und Team-Kommunikation direkt verwenden lässt.

## Was ist die Umrechnungsformel?

Der Formatter arbeitet regelbasiert in drei Schritten:

1. **Tokenisierung** — der SQL-Code wird in Token zerlegt: Keywords, Bezeichner, String-Literale, Klammern, Kommas und Operatoren. String-Literale (einfache Anführungszeichen) werden als opake Blöcke behandelt und nie modifiziert.

2. **Keyword-Erkennung** — jedes Wort-Token wird gegen eine Liste von SQL-Keywords geprüft. Erkannte Keywords werden in Großbuchstaben umgewandelt. Mehrteilige Keywords wie `ORDER BY`, `GROUP BY`, `INSERT INTO` oder `LEFT JOIN` werden als zusammenhängende Einheit erkannt.

3. **Formatierung** — Hauptklauseln (SELECT, FROM, WHERE, JOIN, ORDER BY, GROUP BY, HAVING, LIMIT, UNION) beginnen auf einer neuen Zeile. Kommas erzeugen Zeilenumbrüche für Spaltenlisten. Klammern erhöhen die Einrückungstiefe um eine Stufe (2 Leerzeichen pro Ebene).

Beispiel: `select id,name from users where active=1 order by name` wird zu:

```
SELECT id,
  name
FROM users
WHERE active = 1
ORDER BY name
```

## Welche Anwendungsbeispiele gibt es?

Typische Eingaben und ihr formatiertes Ergebnis:

| Eingabe | Formatiertes Ergebnis |
|---------|----------------------|
| `select * from users` | `SELECT *`<br>`FROM users` |
| `select id,name from users where active=1` | Drei Zeilen mit SELECT, FROM, WHERE |
| `select u.name from users u join orders o on u.id=o.user_id` | JOIN und ON auf eigenen Zeilen |
| `insert into users (name,email) values ('Max','max@test.de')` | INSERT INTO und VALUES getrennt |
| `update users set active=0 where last_login < '2025-01-01'` | UPDATE, SET, WHERE auf eigenen Zeilen |

Der Formatter eignet sich für Queries jeder Länge — von einzeiligen Schnellabfragen bis zu mehrseitigen Reports mit Subqueries und Common Table Expressions.

## Welche Einsatzgebiete gibt es?

**Code-Reviews und Pull-Requests** — unformatiertes SQL in Migrations-Dateien oder gespeicherten Prozeduren erschwert das Review. Ein einheitliches Format macht Änderungen auf einen Blick erkennbar und reduziert Rückfragen im Team.

**Debugging und Fehlersuche** — wenn eine ORM-Bibliothek wie SQLAlchemy, Prisma oder Hibernate ein langes Query-Log ausgibt, ist das Ergebnis oft ein einziger Textblock. Der Formatter zerlegt die Abfrage in lesbare Klauseln und hilft, fehlende JOINs oder falsche WHERE-Bedingungen schnell zu finden.

**Dokumentation und Schulung** — formatierter SQL-Code in Wiki-Seiten, Confluence-Artikeln oder README-Dateien ist deutlich leichter zu lesen als einzeilige Abfragen. Besonders bei Onboarding-Materialien spart sauber eingerücktes SQL Zeit.

**Datenbank-Administration** — bei der Arbeit mit phpMyAdmin, pgAdmin oder DBeaver liegt der SQL-Code oft komprimiert vor. Ein schnelles Formatieren vor dem Ausführen erhöht die Übersicht und senkt das Risiko versehentlicher Fehler.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Welche Entwickler-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit 2-Space-Einrückung lesbar formatieren und validieren.
- **[Base64 Encoder](/de/base64-encoder)** — Text in Base64 kodieren, direkt im Browser ohne Server-Kontakt.
- **[Regex-Tester](/de/regex-tester)** — Reguläre Ausdrücke live testen mit Echtzeit-Matching und Gruppen-Hervorhebung.
