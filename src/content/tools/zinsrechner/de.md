---
toolId: "interest-calculator"
language: "de"
title: "Zinsrechner — Steuern und echte Rendite berechnen"
metaDescription: "Zinsen berechnen mit Zinseszins, Abgeltungssteuer und Inflationsbereinigung. Brutto, netto und real in einem Schritt. Client-seitig, kein Tracking, kostenlos."
tagline: "Brutto, netto und real — Zinsen in einem Schritt berechnen."
intro: "Berechne Zinsen mit Zinseszins-Formel, Abgeltungssteuer (26,375&nbsp;%) und Realrendite nach Fisher-Gleichung. Statt nur das Endkapital zu zeigen, liefert dieser Rechner drei Ergebniszeilen: was nominell drin ist, was nach Steuern übrig bleibt und was der Betrag kaufkraftbereinigt wert ist."
category: "finance"
contentVersion: 1
headingHtml: "<em>Zinsen</em> berechnen"
howToUse:
  - "Anfangskapital in Euro eingeben (z.&nbsp;B. 10.000)."
  - "Zinssatz in % p.a. eingeben — Dezimalzahlen mit Komma oder Punkt (z.&nbsp;B. 3,5)."
  - "Laufzeit in Jahren eingeben."
  - "Das Ergebnis erscheint sofort: Brutto-Endkapital, Netto-Endkapital (nach Abgeltungssteuer) und Real-Endkapital (nach Inflation)."
  - "Steuer- und Inflationswerte sind voreingestellt und können angepasst werden."
faq:
  - q: "Was ist der Unterschied zwischen einfacher Verzinsung und Zinseszins?"
    a: "Bei einfacher Verzinsung werden Zinsen nur auf das ursprüngliche Kapital berechnet (Z = K0 × p/100 × t). Beim Zinseszins werden die jährlich gutgeschriebenen Zinsen dem Kapital zugeschlagen und im Folgejahr mitverzinst: Kn = K0 × (1 + p/100)^n. Über lange Zeiträume ist der Unterschied erheblich: 10.000&nbsp;€ bei 3&nbsp;% über 20&nbsp;Jahre ergeben mit einfacher Verzinsung 16.000&nbsp;€, mit Zinseszins 18.061&nbsp;€."
  - q: "Wie viel Abgeltungssteuer muss ich auf Zinsen zahlen?"
    a: "In Deutschland gilt ein Abgeltungssteuersatz von 25&nbsp;% plus 5,5&nbsp;% Solidaritätszuschlag = 26,375&nbsp;% auf Kapitalerträge. Der Sparerpauschbetrag beträgt 2026 unverändert 1.000&nbsp;€ (Einzelperson) bzw. 2.000&nbsp;€ (zusammenveranlagte Paare). Zinserträge bis zur Freigrenze sind steuerfrei — erst der darüber liegende Betrag wird versteuert."
  - q: "Was ist die Realrendite und warum ist sie nicht einfach Zinssatz minus Inflation?"
    a: "Die korrekte Berechnung der Realrendite nutzt die Fisher-Gleichung: r_real = (1 + r_nominal) / (1 + r_inflation) − 1. Beispiel: 7&nbsp;% Nominalsatz und 2,5&nbsp;% Inflation ergeben nicht 4,5&nbsp;%, sondern (1,07 / 1,025) − 1 = 4,39&nbsp;%. Der Unterschied klingt klein, summiert sich aber über 20&nbsp;Jahre zu mehreren tausend Euro Planungsfehler."
  - q: "Warum rechnet meine Bank manchmal etwas anders?"
    a: "Banken verwenden unterschiedliche Zinsmethoden für die Tageszählung: 30/360 (deutsche kaufmännische Methode bei Sparkonten), ACT/360 (Eurozins, Tagesgeld) oder ACT/365 (englische Methode). Auf 10.000&nbsp;€ bei 3&nbsp;% über 183&nbsp;Tage ergibt 30/360 rund 152,50&nbsp;€ und ACT/360 rund 152,50&nbsp;€ — die Differenz beträgt meist 1–2&nbsp;€ pro Jahr. Dieser Rechner verwendet jährliche Gutschrift (Standard für Sparbücher und Festgeld)."
  - q: "Können negative Zinssätze eingegeben werden?"
    a: "Ja. Zwischen 2020 und 2022 gaben viele Banken Negativzinsen (Verwahrentgelte bis −0,5&nbsp;%) auf größere Kapitalbeträge weiter. Der Rechner verarbeitet Zinssätze ab −10&nbsp;% und zeigt in diesem Fall den Kapitalverlust korrekt an."
  - q: "Was bedeutet Sparerpauschbetrag und wie wirkt er sich aus?"
    a: "Der Sparerpauschbetrag ist ein Freibetrag auf Kapitalerträge. 2026 beträgt er 1.000&nbsp;€ für Einzelpersonen und 2.000&nbsp;€ für Ehepaare. Zinserträge bis zu diesem Betrag sind vollständig steuerfrei. Erst der darüberliegende Teil wird mit 26,375&nbsp;% (Abgeltungssteuer + SolZ) belastet. Mit einem Freistellungsauftrag bei der Bank wird dieser Betrag automatisch berücksichtigt."
relatedTools: ['mehrwertsteuer-rechner', 'kreditrechner']
---

## Was macht dieser Rechner?

Der Zinsrechner berechnet Zinseszins, Abgeltungssteuer und Realrendite in einem Schritt. Statt nur das nominelle Endkapital auszugeben, liefert er drei Ergebniszeilen:

1. **Brutto-Endkapital** — das nominelle Endkapital nach Zinseszins-Formel
2. **Netto-Endkapital** — nach Abgeltungssteuer (26,375&nbsp;%) und Sparerpauschbetrag (1.000&nbsp;€)
3. **Real-Endkapital** — kaufkraftbereinigt nach Fisher-Gleichung

Damit beantwortet er die drei Fragen, die beim privaten Sparen am häufigsten unbeantwortet bleiben: Was kommt nominell raus? Was bleibt nach Steuern? Was ist das Endkapital wirklich wert?

Alle Berechnungen laufen ausschließlich im Browser. Kein Server-Upload, kein Tracking.

## Umrechnungsformel

**Zinseszins:**

```
Kn = K0 × (1 + p/100)^n
```

- `K0` = Anfangskapital, `p` = Zinssatz in % p.a., `n` = Laufzeit in Jahren, `Kn` = Endkapital

**Abgeltungssteuer:**

```
Steuerpflichtig = max(0, Zinsen − Sparerpauschbetrag)
Steuer = Steuerpflichtig × 26,375 %
Kn_netto = K0 + Zinsen − Steuer
```

**Realrendite (Fisher-Gleichung):**

```
r_real = (1 + r_nominal) / (1 + r_inflation) − 1
```

Die naive Subtraktion (z.&nbsp;B. 7&nbsp;% − 2,5&nbsp;% = 4,5&nbsp;%) ist mathematisch falsch. Die Fisher-Gleichung liefert das korrekte Ergebnis: 4,39&nbsp;% — ein Unterschied, der über 20&nbsp;Jahre zu einem Planungsfehler von mehreren tausend Euro führen kann.

## Anwendungsbeispiele

**Beispiel 1 — Festgeld 10.000&nbsp;€, 3&nbsp;%, 10&nbsp;Jahre:**
- Brutto-Endkapital: 13.439,16&nbsp;€ (Zinsertrag: 3.439,16&nbsp;€)
- Steuer: ca. 643,33&nbsp;€ (auf 2.439,16&nbsp;€ über Freibetrag)
- Netto-Endkapital: ca. 12.795,83&nbsp;€
- Real-Endkapital (bei 2,5&nbsp;% Inflation): ca. 10.498,65&nbsp;€

**Beispiel 2 — Tagesgeld 5.000&nbsp;€, 4&nbsp;%, 1&nbsp;Jahr:**
- Zinsertrag: 200,00&nbsp;€ — unter dem Sparerpauschbetrag von 1.000&nbsp;€
- Steuer: 0&nbsp;€
- Netto = Brutto: 5.200,00&nbsp;€

**Beispiel 3 — Negativzins −0,5&nbsp;%, 20.000&nbsp;€, 2&nbsp;Jahre:**
- Endkapital: 19.800,50&nbsp;€ (Kapitalverlust: 199,50&nbsp;€)
- Realrendite bei 2,5&nbsp;% Inflation: noch stärker negativ

## Häufige Einsatzgebiete

- **Tagesgeld- und Festgeld-Vergleiche:** Welches Angebot bringt netto mehr?
- **ETF-Sparplan-Planung:** Wie viel bleibt nach 20&nbsp;Jahren tatsächlich übrig — nach Steuer und Inflation?
- **Schulische und akademische Anwendungen:** Zinseszins-Beispiele, Fisher-Gleichung, Kaufkraft-Illustration.
- **Rentenlücken-Abschätzung:** Wie weit trägt mein Sparkapital bei angenommener Rendite und Inflation?
- **Negativzins-Dokumentation:** Exakten Verwahrentgelt-Verlust berechnen für Steuererklärung oder Bankgespräch.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Finanz-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Mehrwertsteuer-Rechner](/de/mehrwertsteuer-rechner)** — Netto-, MwSt- und Bruttobeträge bidirektional berechnen, z.&nbsp;B. für die Steuerplanung rund um Kapitalerträge.
- **[Kreditrechner](/de/kreditrechner)** — Monatliche Rate, Gesamtzinsen und Tilgungsplan für Darlehen berechnen — das Gegenstück zum Zinsrechner für die Kreditseite.
- **[Rabatt-Rechner](/de/rabatt-rechner)** — Preisnachlässe und Sparquoten sofort ausrechnen, nützlich für Rendite-Vergleiche und Kaufentscheidungen.
