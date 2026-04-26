---
toolId: "kgv-calculator"
language: "de"
title: "KGV Rechner — Kurs-Gewinn-Verhältnis mit Kontext berechnen"
metaDescription: "KGV berechnen: Aktienkurs ÷ Gewinn je Aktie, mit Gewinnrendite und historischer Einordnung (günstig/moderat/teuer). Kostenlos, lokal, kein Tracking."
tagline: "KGV und Gewinnrendite sofort — mit historischem Kontext"
intro: "Berechne das Kurs-Gewinn-Verhältnis (KGV) deiner Aktie — inklusive automatischer Gewinnrendite und historischem Kontext-Badge. Kein Konkurrent berechnet beides gleichzeitig. Ideal für Privatanleger, die verstehen wollen, ob ein KGV günstig, moderat oder zu teuer ist."
category: "finance"
contentVersion: 1
headingHtml: "KGV mit <em>Kontext</em> berechnen"
howToUse:
  - "Gib den Aktienkurs in Euro ein (z.&nbsp;B. 120,50). DE-Dezimalkomma und Tausenderpunkte werden automatisch erkannt."
  - "Trage den Gewinn je Aktie (EPS) ein — erkennbar im Geschäftsbericht oder auf Portalen wie finanzen.net oder onvista.de."
  - "KGV, Gewinnrendite und die historische Einordnung (günstig / moderat / teuer) erscheinen sofort — kein Klick nötig."
faq:
  - q: "Was ist ein gutes KGV?"
    a: "Ein 'gutes' KGV hängt von Branche, Wachstum und Marktumfeld ab. Als historische Faustregel gilt: KGV < 15 ist günstig (DAX-Historisch ~14,6), KGV 15–22 ist moderat, KGV > 22 ist teuer. Tech-Wachstumsaktien rechtfertigen KGVs von 30–60+, zyklische Industrie- oder Bankaktien sind bei KGV > 15 oft schon fair bewertet. Wichtiger als ein einzelnes KGV ist der Vergleich: aktuelles KGV vs. historisches KGV desselben Unternehmens und vs. Branchendurchschnitt."
  - q: "Was bedeutet ein negatives KGV?"
    a: "Ein negatives KGV entsteht, wenn das Unternehmen im betrachteten Zeitraum Verluste geschrieben hat (EPS < 0). Mathematisch wäre das Ergebnis negativ, aber es ist inhaltlich nicht interpretierbar — ein KGV von −15 bedeutet nicht 'sehr günstig', sondern 'keine aussagekräftige Bewertungsgrundlage'. Dieser Rechner zeigt in diesem Fall einen klaren Hinweis statt einer irreführenden Zahl. Alternativ-Kennzahlen für Verlustunternehmen: KUV (Kurs-Umsatz-Verhältnis) oder KBV (Kurs-Buch-Wert)."
  - q: "Welchen Gewinn soll ich eingeben — Trailing oder Forward EPS?"
    a: "Das hängt von deinem Analyse-Ziel ab. Trailing EPS (letzte 12&nbsp;Monate, TTM) verwendet tatsächliche Gewinne — stabiler, aber vergangenheitsorientiert. Forward EPS (nächste 12&nbsp;Monate, Analystenschätzung) zeigt Markterwartungen, ist aber unsicherer. Beide Varianten sind gültig; du solltest nur konsistent bleiben und Vergleiche immer mit demselben EPS-Typ durchführen. Tipp: Forward EPS findest du auf finanzen.net unter 'Schätzungen'."
  - q: "Was ist die Gewinnrendite und warum ist sie nützlich?"
    a: "Die Gewinnrendite (Earnings Yield) ist der Kehrwert des KGV: Gewinnrendite (%) = (1 / KGV) × 100. Sie gibt an, welchen prozentualen Anteil des Kaufpreises du als Jahresgewinn erhältst — ähnlich wie ein Zinssatz. Beispiel: KGV 20 → Gewinnrendite 5&nbsp;%. Das ermöglicht den direkten Vergleich mit Anleiherenditen: Wenn 10-jährige Bundesanleihen 4&nbsp;% bringen und die Aktie eine Gewinnrendite von 5&nbsp;% hat, erscheint die Aktie trotz Risiko attraktiver."
  - q: "Wo finde ich den Gewinn je Aktie (EPS)?"
    a: "Den Gewinn je Aktie (EPS) findest du im Jahresabschluss des Unternehmens (Seite 'Ergebnis je Aktie') oder auf kostenlosen deutschen Finanzportalen. Empfehlung: finanzen.net (Unternehmensseite → 'Fundamentaldaten' → 'Gewinn je Aktie') oder onvista.de (Bereich 'Bilanz/GuV'). Achtung: Vergewissere dich, ob der Wert Trailing (letztes Geschäftsjahr) oder Forward (Analystenschätzung) ist, bevor du ihn einträgst."
  - q: "Warum unterscheidet sich das KGV je nach Branche so stark?"
    a: "Branchen wachsen unterschiedlich schnell und haben verschiedene Risikoprofile, was zu strukturell verschiedenen KGV-Niveaus führt. Tech/Software: KGV 25–60+ (hohe Wachstumserwartungen eingepreist). Banken/Versicherungen: KGV 8–15 (reguliert, zinsabhängig). Automobil (VW, BMW): KGV 6–12 (zyklisch, kapitalintensiv). Versorger (E.ON, RWE): KGV 12–18 (stabile Gewinne, wenig Wachstum). Deshalb ist ein Branchenvergleich entscheidend: Ein KGV von 10 ist für eine Bank moderat, für ein Technologieunternehmen ein Warnsignal."
relatedTools: ['zinsrechner', 'roi-rechner', 'cashflow-rechner']
datePublished: '2026-04-25'
dateModified: '2026-04-25'

---

## Was macht dieser Rechner?

Das Kurs-Gewinn-Verhältnis (KGV) ist die meistgenutzte Kennzahl zur Bewertung von Aktien. Es setzt den aktuellen Aktienkurs ins Verhältnis zum Gewinn je Aktie (Earnings per Share, EPS) und zeigt, wie viel Anleger bereit sind, für einen Euro Unternehmensgewinn zu bezahlen.

Dieser Rechner berechnet nicht nur das KGV, sondern liefert direkt drei Zusatz-Informationen, die kein deutscher Konkurrent automatisch mitberechnet: die **Gewinnrendite** als Kehrwert des KGV (direkter Vergleichswert für Anleiherenditen), einen **historischen Kontext-Badge** (günstig / moderat / teuer im Vergleich zu DAX-Historisch ~14,6 und S&P‑Historisch ~17,5) sowie eine **Formel-Aufschlüsselung**, die zeigt, wie das Ergebnis zustande kommt.

Bei negativem EPS erscheint ein klar verständlicher Hinweis anstelle einer irreführenden negativen Zahl — ein Edge-Case, den alle sieben analysierten deutschen Konkurrenten ignorieren.

## Was ist die Berechnungsformel?

Das KGV berechnet sich nach der Formel:

**KGV = Aktienkurs (€) ÷ Gewinn je Aktie (€)**

Die Gewinnrendite — auch Earnings Yield genannt — ist der Kehrwert:

**Gewinnrendite (%) = (1 ÷ KGV) × 100**

**Beispiel:** Aktienkurs 120&nbsp;€, EPS 6&nbsp;€ → KGV = 120 ÷ 6 = **20** → Gewinnrendite = (1 ÷ 20) × 100 = **5,00&nbsp;%**

Das bedeutet: Du bezahlst heute 20&nbsp;€ für jeden Euro Gewinn, den das Unternehmen erwirtschaftet. Umgekehrt entspricht das einem Ertrag von 5&nbsp;% auf den eingesetzten Kaufpreis — vergleichbar mit einer Anleihe, die 5&nbsp;% Zins zahlt.

## Interpretation: Wann ist ein KGV günstig oder teuer?

Das KGV allein sagt wenig — der historische Kontext entscheidet. Als Referenzwerte gelten:

| Markt / Index | Historischer Ø KGV | Einordnung |
|---|---|---|
| DAX (seit 1990) | ~14,6 | KGV < 15 → günstig |
| S&P&nbsp;500 (seit 1872) | ~17,5 | KGV 15–22 → moderat |
| Shiller-KGV (Median) | ~17 | KGV > 22 → teuer |

**Wichtig:** Diese Schwellen sind branchenunabhängig. Tech-Aktien handeln oft bei KGV 30–60+, weil hohe Wachstumserwartungen eingepreist sind. Automobil- oder Bankaktien gelten bei KGV 15 bereits als fair bewertet. Ein KGV < 5 kann eine Value-Trap signalisieren (Gewinne könnten kurzfristig einbrechen), KGV > 60 ein Wachstumspremium oder eine Blase.

Dieser Rechner zeigt einen nicht-blockierenden Hinweis-Badge bei Extremwerten (unter 5 oder über 60), damit du diese Interpretationsschritte direkt im Blick hast.

## Welche Anwendungsbeispiele gibt es?

**Beispiel 1 — Günstige DAX-Aktie:**
Volkswagen-Kurs: 90&nbsp;€, EPS: 15&nbsp;€ → KGV = 6,00 (günstig, Value-Trap-Hinweis aktiv)

**Beispiel 2 — Moderat bewertete Konsumgüter-Aktie:**
Henkel-Kurs: 72&nbsp;€, EPS: 4&nbsp;€ → KGV = 18,00 (moderat, kein Extrem-Badge)

**Beispiel 3 — Hoch bewertete Tech-Aktie:**
Software-Unternehmen, Kurs: 500&nbsp;€, EPS: 6&nbsp;€ → KGV = 83,33 (teuer, Growth-Premium-Hinweis)

**Beispiel 4 — Verlustjahr:**
EPS = −2,50&nbsp;€ → Kein KGV möglich; Rechner zeigt einen erklärenden Hinweis statt eines sinnlosen negativen Wertes. Empfehlung: Stattdessen KUV oder KBV als Bewertungsgrundlage nutzen.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Welche Finanz-Tools sind verwandt?

Weitere Tools aus dem Finanz-Ökosystem, die zum Thema passen:

- **[Zinsrechner](/de/zinsrechner)** — Zinsen, Zeitraum und Zinsbetrag für Sparkonten, Festgeld und Anleihen berechnen und mit Aktienrenditen vergleichen.
- **[ROI-Rechner](/de/roi-rechner)** — Return on Investment mit annualisierter Rendite und DuPont-Schema in drei Modi berechnen.
- **[Cashflow-Rechner](/de/cashflow-rechner)** — Operativen, investiven und freien Cashflow eines Unternehmens analysieren und bewerten.
