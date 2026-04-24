---
toolId: "compound-interest-calculator"
language: "de"
title: "Zinseszinsrechner — Sparplan mit Steuer und Inflation berechnen"
metaDescription: "Zinseszinsrechner: Sparplan berechnen mit Abgeltungssteuer (26,375 %), Sparerpauschbetrag, TER-Kosten und Inflation. 100 % clientseitig, kein Tracking. Kostenlos."
tagline: "Nominal, nach Steuer und in heutiger Kaufkraft — drei ehrliche Zahlen für deinen Sparplan."
intro: "Berechne, wie sich dein Kapital durch den Zinseszinseffekt entwickelt — mit monatlicher Sparrate, Abgeltungssteuer (26,375 %), Sparerpauschbetrag (1.000 €/Jahr), Inflationsrate und Kostenquote (TER). Der Rechner zeigt drei Szenarien parallel: nominales Endkapital, Wert nach Steuern und reale Kaufkraft. Alle Berechnungen laufen ausschließlich in deinem Browser — kein Server-Upload, kein Tracking."
category: "finance"
contentVersion: 1
headingHtml: "Zinseszins <em>berechnen</em>"
howToUse:
  - "Gib dein Anfangskapital ein — 0 ist erlaubt für einen reinen Sparplan ohne Startguthaben."
  - "Trage die monatliche Sparrate und den erwarteten Jahreszinssatz (% p. a.) ein."
  - "Stelle die Laufzeit in Jahren ein (1 bis 80 Jahre)."
  - "Optionale Felder: Inflationsrate (Standard 2 %) und Kostenquote/TER (Standard 0 %)."
  - "Die drei Ergebnisse — nominal, nach Steuer, real — erscheinen sofort ohne Klick."
faq:
  - q: "Was ist der Zinseszinseffekt?"
    a: "Beim Zinseszins werden erzielte Zinsen dem Kapital hinzugefügt und im nächsten Zeitraum erneut verzinst. Das Kapital wächst dadurch exponentiell statt linear. Eine praktische Faustregel ist die Regel der 72: Teile 72 durch den Zinssatz, um die Verdopplungszeit in Jahren zu erhalten — bei 7 % p. a. verdoppelt sich das Kapital in ca. 10,3 Jahren."
  - q: "Wie viel Steuer fällt auf Zinserträge in Deutschland an?"
    a: "Kapitalerträge werden mit Abgeltungssteuer (25 %) zuzüglich Solidaritätszuschlag (5,5 % auf die Steuer) belastet — effektiv 26,375 %. Pro Jahr gilt ein Sparerpauschbetrag von 1.000 € (Alleinstehend) bzw. 2.000 € (Verheiratet). Erträge bis zu dieser Grenze bleiben steuerfrei. Kirchensteuer (8 % oder 9 %) ist optional und wird in diesem Rechner nicht einbezogen."
  - q: "Was ist die Vorabpauschale bei ETF-Sparplänen?"
    a: "Die Vorabpauschale ist eine jährliche Mindestbesteuerung auf thesaurierende Fonds und ETFs. Sie wird im Januar auf den Vorjahreswert berechnet: Fondswert × Basiszins × 70 % (bei Aktienfonds-Teilfreistellung nach InvStG). Der Basiszins 2026 beträgt 3,2 %. Die Vorabpauschale wird direkt vom Verrechnungskonto abgebucht — eine Liquiditätsreserve im Januar ist empfehlenswert."
  - q: "Was ist der Unterschied zwischen nominalem und realem Endkapital?"
    a: "Das nominale Endkapital ist der rechnerische Wert ohne Inflationsbereinigung. Das reale Endkapital zeigt die tatsächliche Kaufkraft in heutigen Preisen, berechnet nach der Fisher-Gleichung: r_real = ((1 + r_nominal) / (1 + Inflation)) − 1. Bei 5 % Nominalzins und 2 % Inflation beträgt die reale Rendite ca. 2,94 % — nicht 3 %. Dieser Unterschied kumuliert über 20 Jahre erheblich."
  - q: "Was bedeutet TER und wie stark beeinflusst sie das Ergebnis?"
    a: "TER (Total Expense Ratio) ist die jährliche Kostenquote eines Fonds oder ETFs. Sie wird nicht explizit abgezogen, sondern mindert direkt die Wertentwicklung. Eine Kostendifferenz von nur 0,5 % p. a. kann über 20 Jahre bei einer monatlichen Sparrate von 200 € bis zu 25.000 € Endkapital-Differenz ausmachen — laut Finanzfluss-Modellrechnung."
  - q: "Warum unterscheidet sich dieses Ergebnis von anderen Rechnern?"
    a: "Viele Rechner zeigen nur den nominalen Bruttowert ohne Steuern und Inflation. Dieser Rechner bezieht standardmäßig Abgeltungssteuer (26,375 %) mit Sparerpauschbetrag und Inflationsbereinigung ein. Zudem rechnet er monatlich (nicht jährlich), was die tatsächliche Dynamik eines Sparplans genauer abbildet. Alle Berechnungen laufen ausschließlich im Browser — kein Datentransfer."
relatedTools: ['mehrwertsteuer-rechner']
---

## Was macht dieser Rechner?

Der Zinseszins-Rechner simuliert die Entwicklung eines Sparplans Monat für Monat — mit Startkapital, regelmäßiger monatlicher Sparrate und einem Jahreszinssatz. Drei Szenarien werden parallel berechnet:

- **Nominal:** Das rechnerische Endkapital vor Steuern und Inflationsbereinigung
- **Nach Steuer:** Abzüglich Abgeltungssteuer (26,375 %) nach Sparerpauschbetrag (1.000 €/Jahr)
- **Real (Kaufkraft):** Der Nettowert bereinigt um Inflation — wie viel ist das Endkapital in heutigen Preisen wert?

Dieser Ansatz adressiert den häufigsten Planungsfehler: wer nur den nominalen Bruttowert kennt, überschätzt sein reales Vermögen systematisch. Bei 3 % Inflation ist ein nominales Endkapital von 200.000 € in 20 Jahren real nur noch ca. 124.000 € in heutiger Kaufkraft wert.

Alle Berechnungen laufen ausschließlich im Browser. Kein Wert wird übertragen, kein Rechenlauf getrackt.

## Berechnungsformel

**Monatlicher Zinsfaktor** aus dem Jahreszinssatz (exakte Umrechnung, nicht lineare Näherung):

`r_monat = (1 + p_eff / 100)^(1/12) − 1`

Dabei ist `p_eff = p_zinssatz − TER` der Nettozinssatz nach Kosten.

**Sparplan-Simulation** Monat für Monat:

`K_{m+1} = K_m × (1 + r_monat) + Sparrate`

**Steuerberechnung** einmal jährlich:

`Steuer_Jahr = max(0, Jahreserträge − 1.000 €) × 0,26375`

**Reale Kaufkraft** nach der Fisher-Gleichung (nicht naive Subtraktion):

`K_real = K_netto / (1 + Inflation/100)^n`

Ein Nominalzins von 5 % bei 2 % Inflation ergibt nach Fisher eine reale Rendite von ca. 2,94 % — nicht 3 %. Die naive Subtraktion überschätzt die Realrendite leicht.

## Rechenbeispiele

**Beispiel 1 — Klassischer ETF-Sparplan:**
Anfangskapital 0 €, Sparrate 200 €/Monat, Zinssatz 7 % p.&nbsp;a., Laufzeit 20 Jahre, TER 0,2 %, Inflation 2 %:
Gesamteinzahlungen ca. 48.000 € — Nominales Endkapital ca. 102.000 € — Nach Steuer ca. 89.000 € — Reale Kaufkraft ca. 73.000 €.

**Beispiel 2 — Einmalanlage (Erbschaft oder Bonus):**
Anfangskapital 10.000 €, Sparrate 0 €, Zinssatz 5 % p.&nbsp;a., Laufzeit 10 Jahre:
Nominales Endkapital ca. 16.289 € — Reale Kaufkraft (2 % Inflation) ca. 13.375 €. Die Differenz von ca. 2.900 € entsteht allein durch Kaufkraftverlust.

**Beispiel 3 — Negativzins (Strafzins 2020–2022):**
Anfangskapital 50.000 €, Sparrate 0 €, Zinssatz −0,5 % p.&nbsp;a., Laufzeit 3 Jahre:
Endkapital ca. 49.254 € — Verlust ca. 746 € durch den Strafzins.

## Häufige Einsatzgebiete

- **ETF-Sparplan-Planung:** Realistische Rentenplanung mit Kosten und Steuern vor Augen — nicht nur der Bruttowert zählt
- **Altersvorsorge-Vergleich:** Festgeld vs. ETF-Sparplan — beide Szenarien mit denselben Parametern durchrechnen
- **Finanzielle Unabhängigkeit (FIRE):** Welches Kapital brauche ich, um bei einem bestimmten Zinssatz von Erträgen zu leben?
- **Kaufkraft-Bewusstsein:** Was sind meine heutigen 200.000 € in 25 Jahren nach 2 % Inflation reell noch wert?
- **TER-Vergleich:** Wie viel kostet mich der Unterschied zwischen einem 0,07&nbsp;%-ETF und einem 0,5&nbsp;%-Fonds über 20 Jahre wirklich?

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Finanz-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Mehrwertsteuer-Rechner](/de/mehrwertsteuer-rechner)** — Netto- und Bruttobeträge bei 19 %, 7 % oder individuellen Steuersätzen sofort berechnen — nützlich für Rechnungen und Finanzplanung.
- **[Brutto-Netto-Rechner](/de/brutto-netto-rechner)** — Monatliches Nettoeinkommen aus dem Bruttogehalt ermitteln — die Grundlage für eine realistische Sparraten-Planung.
- **[Kreditrechner](/de/kreditrechner)** — Monatliche Rate, Zinssumme und Tilgungsplan für Darlehen berechnen — das Gegenstück zum Sparplan auf der Schulden-Seite.
