---
toolId: "cash-discount-calculator"
language: "de"
title: "Skonto-Rechner — Skontobetrag & Jahreszins berechnen"
metaDescription: "Skonto online berechnen: Skontobetrag, Zahlbetrag und effektiver Jahreszins. Brutto/Netto-Toggle, live on typing, kein Tracking. 2 % Skonto = ~37 % p.a."
tagline: "Lohnt sich Skonto? Jetzt in Sekunden sehen"
intro: "Berechne Skontobetrag, Zahlbetrag und effektiven Jahreszins — live beim Tippen. Mit Brutto/Netto-Toggle und Ampel-Empfehlung: 2&nbsp;% Skonto klingen wenig, entsprechen aber rund 37&nbsp;% effektivem Jahreszins."
category: "finance"
contentVersion: 1
headingHtml: "Skonto berechnen — <em>Jahreszins</em> kennen"
howToUse:
  - "Rechnungsbetrag eingeben (Brutto oder Netto — Toggle oben wählen)."
  - "Skontosatz, Skontofrist und Zahlungsziel eintragen."
  - "Ergebnis erscheint sofort: Skontobetrag, Zahlbetrag und effektiver Jahreszins mit Ampel."
  - "Copy-Button neben jedem Wert für die schnelle Weiterverwendung nutzen."
faq:
  - q: "Skonto vom Brutto oder vom Nettobetrag berechnen?"
    a: "In der deutschen Buchhaltung ist Brutto der Standard — das Ergebnis ist mathematisch identisch. Wer den Nettobetrag eingeben möchte, schaltet den Toggle auf 'Netto + MwSt': der Rechner weist dann Vorsteuer-Auswirkung separat aus."
  - q: "Wie hoch ist der effektive Jahreszins bei 2 % Skonto?"
    a: "Bei 2 % Skonto, 10 Tagen Skontofrist und 30 Tagen Zahlungsziel beträgt der effektive Jahreszins rund 36,7 % p.a. Wer Skonto nicht zieht, zahlt de facto diesen Lieferantenkredit-Zinssatz."
  - q: "Wann lohnt sich Skonto wirklich?"
    a: "Fast immer — solange der eigene Kontokorrentzins unter dem effektiven Jahreszins liegt. Bei typischen Skonto-Konditionen (2 %/10 Tage/30 Tage) übersteigt der Lieferantenkredit-Zins jeden normalen Bankkredit deutlich."
  - q: "Was passiert, wenn Skontofrist und Zahlungsziel gleich sind?"
    a: "Der effektive Jahreszins ist in diesem Fall mathematisch undefiniert (Division durch null). Der Rechner zeigt dann keinen Jahreszins an."
  - q: "Wie wirkt sich Skonto auf die Umsatzsteuer aus?"
    a: "Im Netto-Modus berechnet der Rechner die Auswirkung: Netto nach Skonto × MwSt-Satz = reduzierte Mehrwertsteuer. Der Käufer darf nur die tatsächlich gezahlte Vorsteuer abziehen."
  - q: "Welche Formel verwendet der Rechner für den Jahreszins?"
    a: "Die kaufmännische Formel (360-Tage-Basis): Effektiver Jahreszins = (Skontosatz / (100 − Skontosatz)) × (360 / (Zahlungsziel − Skontofrist)) × 100."
relatedTools: ['mehrwertsteuer-rechner', 'rabatt-rechner', 'zinsrechner']
datePublished: '2026-04-25'
dateModified: '2026-04-25'

---

## Was ist Skonto und wie wird es berechnet?

Skonto ist ein prozentualer Preisnachlass, den ein Verkäufer dem Käufer gewährt, wenn die Rechnung innerhalb einer verkürzten Zahlungsfrist beglichen wird. Typische Konditionen in Deutschland: 2&nbsp;% Skonto bei Zahlung innerhalb von 10&nbsp;Tagen, volles Zahlungsziel 30&nbsp;Tage.

Die Grundformel ist denkbar einfach:

- **Skontobetrag** = Rechnungsbetrag × (Skontosatz&nbsp;/&nbsp;100)
- **Zahlbetrag** = Rechnungsbetrag − Skontobetrag

Bei einer Rechnung über 1.000&nbsp;€ und 2&nbsp;% Skonto ergibt sich: 1.000&nbsp;€ × 0,02 = 20&nbsp;€ Skontobetrag, Zahlbetrag 980&nbsp;€.

## Was ist der effektive Jahreszins?

Was viele unterschätzen: Wer Skonto nicht zieht, nimmt faktisch einen Lieferantenkredit auf — und zahlt dafür einen Zinssatz, der jeden normalen Bankkredit übertrifft.

Die kaufmännische Formel (360-Tage-Basis):

**Effektiver Jahreszins = (Skontosatz / (100 − Skontosatz)) × (360 / (Zahlungsziel − Skontofrist)) × 100**

Beispielrechnung bei 2&nbsp;% / 10&nbsp;Tage / 30&nbsp;Tage:

- (2&nbsp;/&nbsp;98) × (360&nbsp;/&nbsp;20) × 100 = **36,7&nbsp;% p.a.**

2&nbsp;% Skonto klingen nach wenig. Aber 36,7&nbsp;% Jahreszins sind mehr als das Zehnfache eines typischen Kontokorrentkredits. Wer liquide ist, sollte Skonto daher fast immer ziehen.

## Brutto oder Netto — die häufigste Frage?

In der deutschen Buchhaltung gilt: Skonto wird vom **Bruttobetrag** berechnet. Das Ergebnis ist mathematisch identisch mit der Netto-Basis, aber der buchhalterische Standard ist eindeutig Brutto.

Für Buchhalter, die den Nettobetrag eingeben möchten, bietet dieser Rechner den Netto-Modus: Einfach den Toggle auf „Netto&nbsp;+&nbsp;MwSt" stellen und den MwSt-Satz eingeben. Der Rechner weist dann separat aus:

- Netto nach Skonto
- Mehrwertsteuer nach Skonto
- Brutto nach Skonto

Wichtig: Durch den Skontoabzug reduziert sich der vorsteuerrelevante Nettobetrag. Der Käufer kann nur die tatsächlich gezahlte Mehrwertsteuer als Vorsteuer abziehen.

## Wann lohnt sich Skonto?

Die Faustregel: Wenn der effektive Jahreszins des Skontos höher ist als der eigene Finanzierungszins, lohnt sich Skonto. Bei typischen deutschen Konditionen (2&nbsp;%&nbsp;/&nbsp;10&nbsp;Tage&nbsp;/&nbsp;30&nbsp;Tage) sind das rund 37&nbsp;% p.a. — ein Kontokorrentkredit müsste unfassbar teuer sein, damit sich das Nicht-Ziehen von Skonto rechnet.

Die Ampel-Empfehlung in diesem Rechner hilft dabei:

- **Grün** (> 10&nbsp;% p.a.): Skonto lohnt sich — günstiger als praktisch jeder Bankkredit
- **Gelb** (5–10&nbsp;% p.a.): Abhängig vom eigenen Finanzierungszins
- **Rot** (< 5&nbsp;% p.a.): Selten — in diesem Fall kann Liquidität Vorrang haben

## Welche Anwendungsbeispiele gibt es?

**Klassische B2B-Rechnung:**
1.000&nbsp;€ Brutto, 2&nbsp;% Skonto, 10&nbsp;Tage Frist, 30&nbsp;Tage Ziel → 20&nbsp;€ Skonto, 980&nbsp;€ zahlen, 36,7&nbsp;% Jahreszins.

**Höherer Skontosatz:**
5.000&nbsp;€ Brutto, 3&nbsp;% Skonto, 7&nbsp;Tage Frist, 30&nbsp;Tage Ziel → 150&nbsp;€ Skonto, 4.850&nbsp;€ zahlen, ~48&nbsp;% Jahreszins.

**Netto-Buchhalter-Modus:**
840&nbsp;€ Netto, 2&nbsp;% Skonto, 19&nbsp;% MwSt → 16,80&nbsp;€ Skonto auf Netto, MwSt sinkt von 159,60&nbsp;€ auf 156,41&nbsp;€, Brutto nach Skonto: 979,61&nbsp;€.

## Häufige Fragen

(Die FAQ-Einträge werden oben als strukturierte Daten für Suchmaschinen gerendert.)

## Welche Finanz-Tools sind verwandt?

Weitere Tools für Buchhaltung und Unternehmensfinanzen:

- **[Mehrwertsteuer berechnen](/de/mehrwertsteuer-rechner)** — Brutto-Netto-Umrechnung mit MwSt, inkl. 7&nbsp;% und 19&nbsp;% Satz.
- **[Rabatt berechnen](/de/rabatt-rechner)** — Endpreis, Ursprungspreis und Rabatt-Prozentsatz bidirektional ermitteln.
- **[Zinsen berechnen](/de/zinsrechner)** — Einfache und monatliche Zinsrechnung mit Zinsbetrag und Gesamtbetrag.
