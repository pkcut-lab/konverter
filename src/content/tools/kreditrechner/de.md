---
toolId: "loan-calculator"
language: "de"
title: "Kreditrechner – Monatsrate und Sondertilgung berechnen"
metaDescription: "Kreditrate anonym berechnen: Monatsrate, Gesamtzinsen, Tilgungsplan und Sondertilgungs-Ersparnis — SCHUFA-neutral, ohne Anmeldung, ohne Tracking."
tagline: "Monatsrate, Tilgungsplan und Sondertilgung-Ersparnis — SCHUFA-neutral und ohne Datenweitergabe."
intro: "Berechne deine Kreditrate, Gesamtzinsen und den vollständigen Tilgungsplan — anonym und direkt im Browser. Gibt eine jährliche Sondertilgung ein und sieh sofort, wie viel Zinsen du sparst und um wie viele Monate du früher schuldenfrei bist. Kein Server-Upload, keine SCHUFA-Abfrage, kein Tracking."
category: "finance"
contentVersion: 1
headingHtml: "Kredit <em>berechnen</em>"
howToUse:
  - "Gib Kreditbetrag, Sollzins p.a. und Laufzeit in Monaten ein — die Monatsrate erscheint sofort."
  - "Öffne den Tilgungsplan für eine Jahresübersicht: wie viel Zins- und Tilgungsanteil du monatlich zahlst."
  - "Trage eine jährliche Sondertilgung ein und sieh live, wie viele Zinsen du sparst und wie viele Monate du früher fertig bist."
  - "Das SCHUFA-neutral-Badge unter der Monatsrate bestätigt: Diese Berechnung beeinflusst deinen SCHUFA-Score nicht."
faq:
  - q: "Beeinflusst die Nutzung dieses Rechners meinen SCHUFA-Score?"
    a: "Nein. Dieser Rechner läuft vollständig in deinem Browser — es gibt keine Verbindung zu Auskunfteien, keine Datenweitergabe und keine Bonitätsanfrage. Nur ein echtes Kreditgesuch bei einer Bank erzeugt eine SCHUFA-Anfrage. Die Nutzung unseres Rechners bleibt vollständig unsichtbar für SCHUFA und andere Auskunfteien."
  - q: "Was ist der Unterschied zwischen Nominalzins und Effektivzins?"
    a: "Der Nominalzins (auch Sollzins genannt) ist der reine Zinssatz ohne Nebenkosten. Der Effektivzins schließt alle Kosten ein — Bearbeitungsgebühren, Disagio, Kontoführungsgebühren — und ist gemäß PAngV §6 der gesetzlich vorgeschriebene Vergleichswert. Bei Annuitätendarlehen ohne Nebenkosten sind Nominal- und Effektivzins identisch. Liegt dein Kreditangebot über dem hier berechneten Effektivzins, enthält es versteckte Kosten."
  - q: "Was passiert, wenn ich eine Sondertilgung leiste?"
    a: "Eine Sondertilgung reduziert die Restschuld sofort. Da der Zinsanteil jeder folgenden Rate auf der neuen (niedrigeren) Restschuld berechnet wird, sinkt er proportional — du zahlst in den Folgemonaten weniger Zinsen und tilgst schneller. Der Rechner zeigt dir die Einsparung in Euro und Monaten als direktes Delta: 'Du sparst X € und bist Y Monate früher schuldenfrei.'"
  - q: "Was passiert nach Ende der Zinsbindungsperiode?"
    a: "Nach dem Ablauf der Zinsbindung (z.B. 10 Jahre) läuft der Kredit weiter, aber du musst die Konditionen neu verhandeln — die sogenannte Anschlussfinanzierung. Der neue Zinssatz hängt vom Marktumfeld zum Zeitpunkt des Auslaufens ab. Wer 2016–2021 bei 1–2 % abgeschlossen hat, steht jetzt vor einer Anschlussfinanzierung bei 3,5–4,5 %. Der Rechner zeigt die verbleibende Restschuld zum Ende deiner Zinsbindungsperiode."
  - q: "Wie viel Kredit kann ich mir leisten?"
    a: "Die Faustregel der Kreditwirtschaft lautet: maximale monatliche Rate = 35 % des monatlichen Nettoeinkommens. Bei 3.000 € Netto sind das 1.050 € Rate. Ziehe davon fixe Ausgaben (Miete, Versicherungen) ab. Unser Rechner zeigt dir die Monatsrate für jeden Kreditbetrag — gib iterativ verschiedene Beträge ein, bis die Rate in dein Budget passt."
  - q: "Lohnt sich eine Sondertilgung?"
    a: "Fast immer, wenn du die Möglichkeit hast. Eine Sondertilgung von 5.000 € bei einem 100.000-€-Kredit mit 4 % auf 10 Jahre spart rund 600–800 € Zinsen und verkürzt die Laufzeit um mehrere Monate. Der genaue Wert hängt vom Zeitpunkt der Sondertilgung ab: Je früher, desto mehr sparst du, weil die Zinsersparnis über die restliche Laufzeit kumuliert."
relatedTools: ['mehrwertsteuer-rechner']
---

## Was macht dieser Rechner?

Der Kreditrechner berechnet die monatliche Annuitätenrate für ein Darlehen — also den gleichbleibenden Betrag, den du jeden Monat zahlst, bestehend aus einem sinkenden Zinsanteil und einem steigenden Tilgungsanteil. Du gibst Kreditbetrag, Sollzins und Laufzeit ein; der Rechner liefert sofort Monatsrate, Gesamtzinskosten und einen vollständigen Tilgungsplan.

Alle Berechnungen laufen ausschließlich in deinem Browser. Kein Server empfängt deine Daten, keine Auskunftei wird kontaktiert, kein Cookie speichert deine Eingaben. Die Nutzung ist vollständig SCHUFA-neutral.

Der Rechner ist auf das **Annuitätendarlehen** ausgelegt — der Standardtyp für Baufinanzierungen und Konsumkredite in Deutschland. Die monatliche Rate bleibt konstant; im Laufe der Zeit verschiebt sich das Verhältnis von Zins- zu Tilgungsanteil zugunsten der Tilgung.

## Annuitätenformel

Die monatliche Rate eines Annuitätendarlehens folgt einer exakten mathematischen Formel:

**Monatsrate = K × (q^n × (q − 1)) / (q^n − 1)**

Dabei ist:
- `K` = Kreditbetrag in Euro
- `q` = monatlicher Zinsfaktor: `1 + (Sollzins p.a. / 100 / 12)`
- `n` = Laufzeit in Monaten

**Beispielrechnung aus dem Dossier:**
Kreditbetrag 200.000&nbsp;€, Sollzins 3,80&nbsp;% p.a., Laufzeit 20&nbsp;Jahre (240&nbsp;Monate):
- `q = 1 + 0,038 / 12 = 1,003167`
- `q^240 ≈ 2,136`
- Monatsrate ≈ **1.191,99&nbsp;€**
- Gesamtzinsen ≈ **86.077&nbsp;€**
- Gesamtkosten (Rückzahlung) ≈ **286.077&nbsp;€**

**Restschuld nach t Monaten:**
`Restschuld_t = Monatsrate × (1 − q^(t−n)) / (q − 1)`

Diese Formel ist entscheidend für die Anschlussfinanzierungsplanung: Sie zeigt, wie viel Restschuld nach dem Ende der Zinsbindungsperiode übrig bleibt.

**Effektivzins:** Bei reinen Annuitätendarlehen ohne Bearbeitungsgebühren entspricht der Effektivzins dem Sollzins. Enthält dein Kreditangebot Nebenkosten (Disagio, Bearbeitungsgebühr), liegt der Effektivzins darüber — der gesetzliche Vergleichswert gemäß PAngV&nbsp;§6.

## Sondertilgung: Wie viel spare ich?

Viele Kreditverträge erlauben eine jährliche Sondertilgung — eine außerordentliche Zahlung zusätzlich zur regulären Rate. Diese reduziert die Restschuld sofort, was zwei Effekte hat:

1. **Niedrigere Zinslast** in allen folgenden Monaten (Zinsanteil = Restschuld × Monatszins)
2. **Kürzere Laufzeit** bei gleichbleibender Monatsrate

Unser Rechner zeigt dir das Delta direkt: „Du sparst **X&nbsp;€** Zinsen und bist **Y&nbsp;Monate** früher schuldenfrei." Das ist die Differenzierung gegenüber anderen Rechnern, die nur den neuen Gesamtbetrag anzeigen — ohne den Einsparungs-Kontext.

**Beispiel — Sondertilgung 5.000&nbsp;€ p.a.:**
- Kredit: 100.000&nbsp;€, Sollzins: 4&nbsp;%, Laufzeit: 10&nbsp;Jahre
- Ohne Sondertilgung: Gesamtzinsen ca. 21.494&nbsp;€, Laufzeit 120&nbsp;Monate
- Mit 5.000&nbsp;€ Sondertilgung p.a.: Einsparung ca. 3.000&nbsp;€ Zinsen, Laufzeit kürzer um mehrere Monate

Die Höhe der Einsparung hängt vom Zeitpunkt der Sondertilgung ab: Je früher im Kreditverlauf, desto größer die Zinseinsparung, weil der Effekt über mehr verbleibende Monate kumuliert.

## Anschlussfinanzierung verstehen

Viele Immobilienkredite haben eine Zinsbindungsperiode von 10 oder 15&nbsp;Jahren — danach muss die verbleibende Restschuld zu neuen Konditionen refinanziert werden. Wer 2016–2021 bei Bauzinsen von 1–2&nbsp;% abgeschlossen hat, steht 2026–2031 vor einer Anschlussfinanzierung zum aktuellen Marktlevel (ca. 3,5–4,5&nbsp;%).

**Aktuelle Bauzinsen (Referenz Dr. Klein-Index, April 2026):**
- 5&nbsp;Jahre Zinsbindung: ca. 3,72&nbsp;%
- 10&nbsp;Jahre Zinsbindung: ca. 3,65&nbsp;%
- 15&nbsp;Jahre Zinsbindung: ca. 3,89&nbsp;%
- 20&nbsp;Jahre Zinsbindung: ca. 4,03&nbsp;%

Der Rechner zeigt dir die **Restschuld nach deiner Zinsbindungsperiode** — trage Laufzeit und gewünschte Zinsbindung ein und lies im Tilgungsplan die Restschuld zum Ende der Bindung ab. Diese Restschuld musst du anschließend zu neuen Zinsen refinanzieren.

**Risiko-Szenario:** Bei einer Restschuld von 150.000&nbsp;€ nach 10&nbsp;Jahren und einem Zinssatz von 4,0&nbsp;% (statt bisher 1,5&nbsp;%) steigt deine Monatsrate für die Anschlussfinanzierung erheblich an. Der Rechner erlaubt dir, dieses Szenario jederzeit durchzurechnen.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Finanz-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Mehrwertsteuer-Rechner](/de/mehrwertsteuer-rechner)** — Netto, MwSt und Brutto bidirektional berechnen — für Kreditnebenkosten und Rechnungsbeträge.
- **[Zeitzonen-Rechner](/de/zeitzonen-rechner)** — Internationale Zahlungsfristen und Banktermine korrekt in andere Zeitzonen umrechnen.
- **[Zeichenzähler](/de/zeichenzaehler)** — Kreditantragstext und Vertragsbeschreibungen auf Zeichenlimits für Online-Formulare prüfen.
