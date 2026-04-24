---
toolId: "amortization-calculator"
language: "de"
title: "Tilgungsplan Rechner — Annuitätendarlehen berechnen"
metaDescription: "Tilgungsplan für Annuitätendarlehen berechnen: Monatsrate, Gesamtzinsen, Restschuld nach Zinsbindung, Sondertilgung-Effekt. 100 % lokal, kein Tracking."
tagline: "Tilgungsplan, Sondertilgung-Effekt und Anschlussfinanzierung — alles in einem Rechner."
intro: "Berechne deinen individuellen Tilgungsplan für Annuitätendarlehen: Gib Darlehensbetrag, Zinssatz und Anfangstilgung ein — der Rechner zeigt Monatsrate, Gesamtzinsen, Restschuld nach Zinsbindungsende und den vollständigen Jahrestilgungsplan. Optional: Sondertilgungseffekt und Anschlussfinanzierungs-Vorschau direkt im Tool. Alle Berechnungen laufen lokal in deinem Browser — kein Server kennt deine Finanzdaten."
category: "finance"
contentVersion: 1
headingHtml: "Tilgungsplan <em>berechnen</em>"
howToUse:
  - "Wähle deinen Berechnungsmodus: Monatsrate aus Tilgungssatz, Laufzeit aus Monatsrate oder Monatsrate aus Laufzeit."
  - "Gib Darlehensbetrag, Sollzinssatz und den modusabhängigen Wert (Anfangstilgung %, Monatsrate oder Laufzeit) ein."
  - "Stelle die Zinsbindungsdauer ein (Standard: 10 Jahre) — der Rechner zeigt die Restschuld nach Ablauf."
  - "Optional: Trage eine jährliche Sondertilgung ein — der Effekt (gesparte Zinsen + verkürzte Laufzeit) erscheint sofort."
  - "Nutze den Anschlussfinanzierungs-Rechner am Ende der Tabelle, um die neue Monatsrate nach der Zinsbindung zu planen."
faq:
  - q: "Was ist der Unterschied zwischen Annuitätendarlehen und Tilgungsdarlehen?"
    a: "Beim Annuitätendarlehen bleibt die monatliche Rate (Annuität) konstant. Innerhalb der Rate verschiebt sich das Verhältnis: Der Zinsanteil sinkt mit jeder Rate, weil die Restschuld abnimmt — der Tilgungsanteil steigt entsprechend. Beim Tilgungsdarlehen (lineare Tilgung) bleibt der Tilgungsanteil konstant, die Rate sinkt über die Laufzeit. In Deutschland ist das Annuitätendarlehen bei Baufinanzierungen die dominierende Form."
  - q: "Wie hoch sollte die Anfangstilgung sein?"
    a: "Fachexperten empfehlen mindestens 2 % Anfangstilgung p.a. Bei aktuellen Zinsen (3–4 %) und nur 1 % Anfangstilgung beträgt die vollständige Tilgungsdauer oft 40–50 Jahre. Mit 2 % Anfangstilgung verkürzt sich die Laufzeit auf ca. 25–30 Jahre. Der Rechner zeigt eine Warnung, wenn die Anfangstilgung unter 1,5 % liegt (Tilgungsparadoxon)."
  - q: "Was passiert nach dem Ende der Zinsbindung?"
    a: "Nach Ablauf der Zinsbindungsfrist muss der Kredit entweder vollständig abgelöst oder zu neuen Konditionen fortgeführt werden (Anschlussfinanzierung). Die Restschuld nach Zinsbindungsende ist ein kritischer Planungswert: Sie zeigt, wie viel Kapital zum neuen Zinssatz refinanziert werden muss. Der Rechner zeigt die Restschuld prominent und bietet direkt einen Anschlussfinanzierungs-Rechner an."
  - q: "Wie wirkt Sondertilgung auf den Tilgungsplan?"
    a: "Eine Sondertilgung reduziert die Restschuld sofort — nicht die monatliche Rate. Das hat zwei Effekte: Der Zinsanteil aller Folgezahlungen sinkt, weil weniger Kapital verzinst wird. Und die Gesamtlaufzeit verkürzt sich. Der Rechner berechnet beide Effekte: gesparte Gesamtzinsen und Laufzeitverkürzung in Monaten. Sondertilgungen müssen vertraglich vereinbart sein (typisch: 5–10 % des Ursprungsbetrags p.a.)."
  - q: "Was ist das Tilgungsparadoxon?"
    a: "Das Tilgungsparadoxon beschreibt den Effekt, dass bei niedrigen Zinsen (z.B. 1 %) und niedriger Anfangstilgung (1 %) eine Tilgungsdauer von über 60 Jahren entsteht. Dies liegt daran, dass der Tilgungsanteil in frühen Jahren minimal ist — der Kredit wächst kaum. Bei 3,5 % Zins und 1 % Anfangstilgung beträgt die Laufzeit immer noch 45–50 Jahre. Der Rechner warnt automatisch, wenn Anfangstilgung unter 1,5 % und Zinssatz über 3 % liegt."
  - q: "Ist die Berechnung exakt wie bei meiner Bank?"
    a: "Der Rechner verwendet die standard-konforme Annuitätenformel (exakt wie in Banksoftware). Minimale Abweichungen können entstehen durch: unterschiedliche Rundungsregeln, den genauen Auszahlungstermin (Monatsanfang vs. -ende) oder bankspezifische Berechnungskonventionen. Der Rechner ist für Planungszwecke konzipiert — verbindliche Angaben liefert dein Kreditvertrag (Effektivzins gem. PAngV ist Pflichtangabe der Bank)."
relatedTools: []
---

## Was macht dieser Rechner?

Der Tilgungsplan-Rechner berechnet Annuitätendarlehen — die in Deutschland bei Baufinanzierungen dominierende Kreditform. Die Monatsrate bleibt dabei konstant; innerhalb jeder Rate verschiebt sich das Verhältnis von Zins und Tilgung: Der Zinsanteil sinkt mit jeder gezahlten Rate, weil die Restschuld abnimmt. Der Tilgungsanteil steigt entsprechend.

Drei Berechnungsmodi stehen zur Wahl: Die Monatsrate aus einem Tilgungssatz berechnen (Standardfall), die Laufzeit aus einer gewünschten Monatsrate ermitteln oder die Monatsrate für eine fixe Laufzeit berechnen. Alle Berechnungen laufen lokal im Browser — kein Server-Upload, kein Tracking, keine Finanzdaten verlassen dein Gerät.

## Annuitäten-Formel

Die monatliche Rate (Annuität) A ergibt sich aus:

**A = K &times; (q^n &times; i) &divide; (q^n &minus; 1)**

- **K** = Darlehensbetrag (Loan Principal)
- **i** = Monatszins = Sollzinssatz&nbsp;p.a. &divide; 12
- **q** = 1 + i (Aufzinsungsfaktor)
- **n** = Gesamtlaufzeit in Monaten

**Beispiel:** 300.000&nbsp;€ Darlehensbetrag, 3,5&nbsp;% Sollzins, 2&nbsp;% Anfangstilgung ergibt eine Monatsrate von 1.375&nbsp;€. Bei einer Zinsbindung von 10&nbsp;Jahren beträgt die Restschuld nach 120&nbsp;Monaten rund 247.000&nbsp;€. Die vollständige Tilgung dauert bei dieser Rate ca. 29&nbsp;Jahre.

**Restschuld nach m Monaten:**

Restschuld\_m = K &times; q^m &minus; A &times; (q^m &minus; 1) &divide; i

Diese Formel wird intern für jeden Monat des Tilgungsplans berechnet.

## Anwendungsbeispiele

**Beispiel 1 — Neubaufinanzierung (300.000&nbsp;€, 3,5&nbsp;% Zins, 2&nbsp;% Anfangstilgung):**
Monatsrate: 1.375&nbsp;€ | Gesamtzinsen: ca. 148.000&nbsp;€ | Laufzeit: ca. 29&nbsp;Jahre | Restschuld nach 10&nbsp;Jahren: ca. 247.000&nbsp;€

**Beispiel 2 — Umschuldung (180.000&nbsp;€, 4,2&nbsp;% Zins, Laufzeit 20&nbsp;Jahre):**
Monatsrate: 1.115&nbsp;€ | Gesamtzinsen: ca. 87.000&nbsp;€ | vollständige Tilgung in 240&nbsp;Monaten

**Beispiel 3 — Mit Sondertilgung (300.000&nbsp;€, 3,5&nbsp;% Zins, 2&nbsp;% Anfangstilgung, 5.000&nbsp;€/Jahr Sondertilgung):**
Einsparung: ca. 18.000&nbsp;€ Zinsen | Laufzeitverkürzung: ca. 30&nbsp;Monate | Die Einsparung durch Sondertilgung ist besonders hoch in den ersten Jahren, wenn die Restschuld noch groß ist.

## Häufige Einsatzgebiete

- **Baufinanzierungsplanung:** Monatsrate im Verhältnis zu verfügbarem Einkommen planen, Zinsbindungsdauer optimieren.
- **Vergleich von Angeboten:** Unterschiedliche Zinssätze, Anfangstilgungen und Zinsbindungsfristen direkt nebeneinander rechnen.
- **Sondertilgungs-Entscheidung:** Bewertung, ob verfügbares Kapital besser als Sondertilgung oder anderweitig eingesetzt werden sollte.
- **Anschlussfinanzierungs-Vorbereitung:** Restschuld nach Zinsbindungsende kennen und die neue Rate bei veränderten Zinsen planen — bevor das Angebot der Bank eintrifft.
- **Bankgespräch vorbereiten:** Eigene Berechnungen vor dem Beratungstermin validieren. Bankberater sind zu verbindlichen Angaben verpflichtet (Effektivzins gem. PAngV) — dieser Rechner liefert die Planungsgrundlage.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Finanz-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Mehrwertsteuer Rechner](/de/mehrwertsteuer-rechner)** — Netto, MwSt und Brutto bidirektional berechnen, wenn Bau- oder Handwerkerrechnungen geprüft werden sollen.
- **[Zeitzonern-Rechner](/de/zeitzonen-rechner)** — Internationale Banktermine und Fristen bei grenzüberschreitenden Finanzierungen schnell koordinieren.
- **[Zeichenzähler](/de/zeichenzaehler)** — Kreditantrags-Texte auf Zeichenlimits prüfen, etwa für Online-Formulare mit festen Feldbegrenzungen.
