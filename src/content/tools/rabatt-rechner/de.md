---
toolId: "discount-calculator"
language: "de"
title: "Rabatt Rechner – Endpreis und Ursprungspreis berechnen"
metaDescription: "Rabatt berechnen: Endpreis, Ursprungspreis oder Rabatt% — alle Richtungen. Kettenrabatt erklärt 10%+10%≠20%. Kein Tracking, 100% im Browser."
tagline: "Alle drei Richtungen, Kettenrabatt-Erklärung und Copy-Button — sofort."
intro: "Rechne Rabatte in alle Richtungen: vom Ursprungspreis zum Endpreis, zurück zum Originalpreis oder ermittle den Rabattsatz aus zwei Preisen. Der Kettenrabatt-Modus zeigt direkt, warum zwei Rabattstufen sich nicht einfach addieren — der meistgenannte Rechenfehler bei Preisnachlässen."
category: "finance"
contentVersion: 1
headingHtml: "<em>Rabatt</em> berechnen"
howToUse:
  - "Wähle den Modus: Standard (Endpreis), Rückrechnung Preis, Rückrechnung Rabatt% oder Kettenrabatt."
  - "Gib die bekannten Werte ein — Berechnung startet sofort beim Tippen."
  - "Kopiere Endpreis oder Rabattbetrag mit dem Kopieren-Button direkt aus dem Ergebnisfeld."
  - "Im Kettenrabatt-Modus siehst du den korrekten Gesamtrabatt und den häufigen Additionsfehler im Vergleich."
faq:
  - q: "Wie berechne ich einen Rabatt?"
    a: "Formel: Endpreis = Ursprungspreis × (1 − Rabatt ÷ 100). Beispiel: 100&nbsp;€ mit 20&nbsp;% Rabatt → 100 × 0,80 = 80&nbsp;€. Der Rabattbetrag beträgt 20&nbsp;€."
  - q: "Wie rechne ich zwei Rabatte hintereinander?"
    a: "Nicht addieren — multiplizieren: Endpreis = Ursprungspreis × (1 − R1÷100) × (1 − R2÷100). Beispiel: 200&nbsp;€ mit 20&nbsp;% dann 10&nbsp;% → 200 × 0,80 × 0,90 = 144&nbsp;€ (Gesamtrabatt 28&nbsp;%, nicht 30&nbsp;%)."
  - q: "Wie berechne ich den Ursprungspreis aus dem Angebotspreis?"
    a: "Formel: Ursprungspreis = Endpreis ÷ (1 − Rabatt÷100). Beispiel: Du zahlst 80&nbsp;€ bei 20&nbsp;% Rabatt → 80 ÷ 0,80 = 100&nbsp;€ Originalpreis."
  - q: "Wie erkenne ich einen Fake-Rabatt?"
    a: "Prüfe, ob der Ursprungspreis kurz vor dem Sale künstlich angehoben wurde. Vergleiche den angegebenen Originalpreis mit dem Preis der Wochen davor. Nutze Preisverlaufs-Dienste und rechne nach: Endpreis ÷ (1 − Rabatt÷100) muss den genannten Listenpreis ergeben."
  - q: "Was ist der Unterschied zwischen Rabatt und Skonto?"
    a: "Rabatt ist ein allgemeiner Preisnachlass — zum Beispiel Saisonschlussverkauf oder Mengenrabatt. Skonto ist ein Nachlass bei vorzeitiger Zahlung (z.&nbsp;B. 2&nbsp;% bei Zahlung innerhalb von 10&nbsp;Tagen) und ist ein separater Rechenfall."
  - q: "Warum addieren sich Kettenrabatte nicht?"
    a: "Weil jeder folgende Rabatt auf den bereits reduzierten Preis angewendet wird, nicht auf den Originalpreis. 20&nbsp;%&nbsp;+ 10&nbsp;% scheinen 30&nbsp;% zu sein, ergeben aber nur 28&nbsp;% Gesamtrabatt, weil der zweite Rabatt von 80&nbsp;€ (nicht 100&nbsp;€) berechnet wird."
relatedTools: []
---

## Was macht dieser Rechner?

Der Rabatt-Rechner arbeitet in vier Modi: Standard-Berechnung (Ursprungspreis und Rabatt% → Endpreis), Rückrechnung des Originalpreises (Endpreis und Rabatt% → Ursprungspreis), Ermittlung des Rabattsatzes (Ursprungspreis und Endpreis → Rabatt%) sowie Kettenrabatt (zwei hintereinandergeschaltete Rabattstufen mit Gesamtrabatt-Anzeige).

Alle Berechnungen laufen ausschließlich im Browser — kein Server-Upload, kein Tracking by Default. Eingaben in Komma- und Punkt-Schreibweise werden beide akzeptiert (`5,48` und `5.48`).

## Umrechnungsformeln

Die drei Grundformeln für Rabattberechnungen:

**Standard — Endpreis berechnen:**
`Endpreis = Ursprungspreis × (1 − Rabatt÷100)`

**Rückrechnung — Ursprungspreis ermitteln:**
`Ursprungspreis = Endpreis ÷ (1 − Rabatt÷100)`

**Rückrechnung — Rabattsatz ermitteln:**
`Rabatt% = (1 − Endpreis÷Ursprungspreis) × 100`

**Kettenrabatt — zwei Stufen:**
`Endpreis = Ursprungspreis × (1 − R1÷100) × (1 − R2÷100)`

Gesamtrabatt: `R_gesamt = (1 − (1 − R1÷100) × (1 − R2÷100)) × 100`

**Warum nicht R1&nbsp;+ R2?** Der zweite Rabatt bezieht sich auf den bereits reduzierten Preis. 20&nbsp;%&nbsp;+ 10&nbsp;% scheinen 30&nbsp;% zu sein, ergeben aber nur 28&nbsp;% — weil der zweite Abzug auf 80&nbsp;€ (nicht 100&nbsp;€) berechnet wird.

## Anwendungsbeispiele

Vier typische Rechnungen aus dem Alltag:

**Beispiel 1 — Standard:**
200&nbsp;€ Jacke, 20&nbsp;% Rabatt → 200&nbsp;× 0,80 = 160&nbsp;€ Endpreis, Ersparnis 40&nbsp;€

**Beispiel 2 — Rückrechnung Originalpreis:**
Endpreis 80&nbsp;€ bei 20&nbsp;% Rabatt → 80&nbsp;÷ 0,80 = 100&nbsp;€ Ursprungspreis

**Beispiel 3 — Rückrechnung Rabattsatz:**
Ursprungspreis 150&nbsp;€, jetzt 120&nbsp;€ → Rabatt = (1&nbsp;−&nbsp;120÷150) × 100 = 20&nbsp;%

**Beispiel 4 — Kettenrabatt:**
200&nbsp;€ mit 20&nbsp;% Grundrabatt, dann 10&nbsp;% Zusatzrabatt → 200&nbsp;× 0,80&nbsp;× 0,90 = 144&nbsp;€ (Gesamtrabatt 28&nbsp;%, nicht 30&nbsp;%)

## Häufige Einsatzgebiete

- **Einkauf und Verbraucher:** Schnell prüfen, wie viel ein Saisonschlussverkauf oder Black-Friday-Angebot tatsächlich spart. Rückrechnung zeigt, ob der genannte Originalpreis plausibel ist.
- **Händler und Selbstständige:** Mengenrabatte staffeln, Angebotspreise aus Listenpreisen berechnen, Kettenrabatte für Großhandels- und Einzelhandelskonditionen kombinieren.
- **B2B-Preisverhandlungen:** Zwei hintereinandergeschaltete Rabattsätze (z.&nbsp;B. Händlerrabatt + Sonderrabatt) korrekt auf den Einstandspreis umrechnen und den effektiven Gesamtrabatt für Angebotsdokumente nennen.
- **Verbraucherschutz und Fake-Rabatt-Check:** Ursprungspreis zurückrechnen und mit dem tatsächlichen Vorpreis vergleichen — Basispreismanipulation vor Saisonverkäufen ist ein bekanntes Muster.
- **Lernende und Schüler:** Prozentrechnung verstehen; der Kettenrabatt-Modus demonstriert visuell, warum Prozente sich multiplizieren und nicht addieren.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Finanz-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Mehrwertsteuer Rechner](/de/mehrwertsteuer-rechner)** — Netto, MwSt und Brutto bidirektional berechnen — ideal wenn du nach dem Rabatt noch die Umsatzsteuer ausweisen musst.
- **[Zeichenzähler](/de/zeichenzaehler)** — Angebots- und Rechnungstexte auf Zeichenlimits prüfen, etwa für EDI-Exportfelder oder Produktbeschreibungen in Shop-Systemen.
- **[Zeitzonen-Rechner](/de/zeitzonen-rechner)** — Internationale Angebotsfristen und Zahlungsziele über Zeitzonen hinweg korrekt berechnen.
