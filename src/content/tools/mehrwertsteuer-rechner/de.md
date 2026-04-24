---
toolId: "vat-calculator"
language: "de"
title: "Mehrwertsteuer Rechner – Netto, MwSt und Brutto berechnen"
metaDescription: "Mehrwertsteuer sofort berechnen: Netto, MwSt-Betrag und Brutto — alle Felder editierbar. Formeln inline, Gastronomie-2026-Update, kein Tracking. Kostenlos."
tagline: "Netto, MwSt und Brutto — alle Felder editierbar, Formeln inline erklärt."
intro: "Rechne Mehrwertsteuer in beide Richtungen: vom Nettobetrag zum Brutto, vom Brutto zurück zum Netto oder gib den MwSt-Betrag direkt ein. Der Rechner erklärt inline, welche Formel er verwendet — damit du den häufigsten Rechenfehler (Brutto × 0,19 statt ÷ 1,19) sofort erkennst."
category: "finance"
contentVersion: 1
headingHtml: "Mehrwertsteuer <em>berechnen</em>"
howToUse:
  - "Wähle den Steuersatz: 19 %, 7 %, 0 % oder einen individuellen Wert."
  - "Gib Nettobetrag, MwSt-Betrag oder Bruttobetrag in das entsprechende Feld ein."
  - "Die anderen beiden Felder berechnen sich sofort — tippe (i) neben dem Ergebnis für die verwendete Formel."
  - "Kopiere einzelne Werte mit dem Kopieren-Button direkt aus dem Feld."
faq:
  - q: "Wie berechnet man die enthaltene Mehrwertsteuer aus dem Bruttopreis?"
    a: "Korrekte Formel: Netto = Brutto ÷ 1,19 (bei 19 %). MwSt-Betrag = Brutto − Netto. Der häufige Fehler ist Brutto × 0,19 — das ergibt 22,61 € statt der tatsächlich enthaltenen 19,00 € bei einem Brutto von 119 €."
  - q: "Was gilt ab Januar 2026 für die Gastronomie?"
    a: "Ab dem 1.&nbsp;Januar 2026 gilt dauerhaft 7 % Mehrwertsteuer für Restaurantspeisen in jeder Form — Verzehr vor Ort, Takeaway und Lieferung. Ausnahme: Getränke bleiben bei 19 %. Dies ist eine gesetzliche Regelung (§&nbsp;12 Abs. 2 UStG), keine zeitlich begrenzte Maßnahme."
  - q: "Welche Produkte und Leistungen haben 7 % MwSt?"
    a: "Lebensmittel (außer Alkohol und Getränke), Bücher und Zeitschriften (Print und digital), ÖPNV-Tickets, Hotelübernachtungen, Kulturveranstaltungen, Zahnwerkstätten sowie ab Januar 2026 auch Restaurantspeisen. Photovoltaik-Anlagen bis 30 kW fallen seit Januar 2023 unter den 0 %-Nullsteuersatz."
  - q: "Was ist die Kleinunternehmerregelung bei der Mehrwertsteuer?"
    a: "Selbstständige und Freiberufler mit einem Vorjahresumsatz unter 25.000 € und einem laufenden Jahresumsatz unter 100.000 € können nach §&nbsp;19 UStG die Kleinunternehmerregelung nutzen. Sie weisen dann keine Mehrwertsteuer auf Rechnungen aus und haben keinen Vorsteuerabzug. Die Grenzen wurden 2025 erhöht (zuvor: 17.500 € / 50.000 €)."
  - q: "Was bedeutet Netto und Brutto?"
    a: "Netto ist der Betrag ohne Mehrwertsteuer — der Preis, den der Unternehmer verlangt, bevor die Steuer aufgeschlagen wird. Brutto ist der Endpreis inklusive Mehrwertsteuer, den du als Verbraucher an der Kasse zahlst. Kassenpreise in Deutschland sind grundsätzlich Bruttopreise."
  - q: "Gilt dieser Rechner auch für Österreich oder die Schweiz?"
    a: "Nein. Dieser Rechner ist auf deutsche Steuersätze ausgelegt (19 %, 7 %, 0 %). Österreich verwendet 20 % und 10 % als Hauptsätze, die Schweiz 8,1 % und 2,6 %. Über das Individuell-Feld kannst du jeden anderen Steuersatz manuell eingeben."
relatedTools: ['zeichenzaehler', 'base64-encoder', 'zeitzonen-rechner']
---

## Was macht dieser Rechner?

Der Mehrwertsteuer-Rechner arbeitet bidirektional: Du kannst jeden der drei Beträge — Netto, MwSt-Betrag oder Brutto — eingeben, und die anderen beiden werden sofort berechnet. Ein kleines (i)-Symbol neben jedem Ergebnisfeld zeigt dir, welche Formel verwendet wurde. Das adressiert den meistgenannten Rechenfehler: viele multiplizieren den Bruttobetrag mit dem Steuersatz, anstatt ihn durch den Faktor zu dividieren.

Alle Berechnungen laufen ausschließlich im Browser — kein Server-Upload, kein Tracking.

## Umrechnungsformeln

Die deutschen Mehrwertsteuer-Formeln sind seit 2007 unverändert:

**Netto zu Brutto:**
`Brutto = Netto × 1,19` (bei 19&nbsp;%)

**Brutto zu Netto (MwSt herausrechnen):**
`Netto = Brutto ÷ 1,19`

**MwSt-Betrag aus dem Brutto:**
`MwSt = Brutto − Netto = Brutto × (0,19 ÷ 1,19)`

**Warum nicht Brutto × 0,19?**
119&nbsp;€ × 0,19 = 22,61&nbsp;€ — das ist falsch. Die enthaltene Mehrwertsteuer in 119&nbsp;€ beträgt nur 19,00&nbsp;€. Der korrekte Weg: 119&nbsp;€ ÷ 1,19 = 100&nbsp;€ (Netto), dann 119&nbsp;€ − 100&nbsp;€ = 19&nbsp;€ (MwSt). Oder direkt: 119&nbsp;€ × (0,19 ÷ 1,19) = 19,00&nbsp;€.

## Anwendungsbeispiele

Drei typische Rechnungen mit deutschen Standardsätzen:

**Beispiel 1 — Regelsteuersatz 19&nbsp;%:**
Netto 100,00&nbsp;€ → MwSt 19,00&nbsp;€ → Brutto 119,00&nbsp;€

**Beispiel 2 — Ermäßigter Satz 7&nbsp;%:**
Netto 50,00&nbsp;€ → MwSt 3,50&nbsp;€ → Brutto 53,50&nbsp;€

**Beispiel 3 — Rückrechnung aus Brutto:**
Brutto 238,00&nbsp;€ bei 19&nbsp;% → Netto 200,00&nbsp;€ → MwSt 38,00&nbsp;€

## Häufige Einsatzgebiete

- **Selbstständige und Freiberufler:** Rechnungsbeträge korrekt ausweisen; Netto-Angebote in Brutto-Preise für Verbraucher umrechnen.
- **Buchhalter und Steuerberater:** Vorsteuerbeträge aus Eingangsrechnungen herausrechnen.
- **Gastronomie und Handel:** Seit Januar 2026 gelten für Restaurantspeisen 7&nbsp;%, für Getränke weiterhin 19&nbsp;% — der Rechner zeigt den aktuellen Hinweis automatisch bei Auswahl von 7&nbsp;%.
- **Verbraucher:** Verstehen, wie viel Mehrwertsteuer im Kassenbon-Betrag steckt. Der Kassenpreis in Deutschland ist immer ein Bruttobetrag.
- **Photovoltaik:** Seit 2023 gilt für PV-Anlagen bis 30&nbsp;kW der Nullsteuersatz (0&nbsp;%). Über das Individuell-Feld oder die 0&nbsp;%-Schnellwahl abbildbar.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Finanz-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Zeitzonern-Rechner](/de/zeitzonen-rechner)** — Internationale Geschäftszeiten schnell umrechnen, wenn Rechnungen über Ländergrenzen versendet werden.
- **[Zeichenzähler](/de/zeichenzaehler)** — Rechnungstext auf Zeichenlimits prüfen, etwa für EDI-Exportfelder mit fest definierter Feldlänge.
- **[Base64-Encoder](/de/base64-encoder)** — Rechnungsdaten für elektronischen Datenaustausch (ZUGFeRD, XRechnung) korrekt kodieren.
