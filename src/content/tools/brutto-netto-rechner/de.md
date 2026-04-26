---
toolId: "gross-net-calculator"
language: "de"
title: "Brutto-Netto-Rechner 2026 – Lohnsteuer & Sozialabzüge"
metaDescription: "Brutto-Netto-Rechner 2026: Lohnsteuer, SV-Beiträge und Kirchensteuer berechnen. Alle Steuerklassen, Midijob, Minijob. Kein Tracking — nur im Browser."
tagline: "Netto-Gehalt berechnen — mit Transparenz, warum jeder Euro abgezogen wird."
intro: "Berechne dein monatliches Netto-Gehalt für 2026 — mit aktualisierten Beitragssätzen (Grundfreibetrag 12.348&nbsp;€, Minijob-Grenze 603&nbsp;€, Midijob-F-Faktor 0,6619) und allen sechs Steuerklassen. Der Rechner erklärt inline, warum jeder Abzugsposten in genau dieser Höhe anfällt — der meistgenannte Nutzer-Pain bei Gehaltsrechnern ist der Gap-Shock: 35–45&nbsp;% des Bruttolohns verschwinden, ohne dass dies beim Einstieg kommuniziert wird."
category: "finance"
stats:
  - label: "Steuerklassen"
    value: "6"
  - label: "Bundesländer"
    value: "16"
  - label: "Genauigkeit"
    value: "±0,01"
    unit: "EUR"
contentVersion: 1
headingHtml: "Brutto-<em>Netto</em> berechnen"
howToUse:
  - "Wähle deine Beschäftigungsart: Vollzeit, Midijob (603–2.000&nbsp;€) oder Minijob (≤&nbsp;603&nbsp;€)."
  - "Gib dein monatliches Bruttogehalt ein — z.&nbsp;B. 3.500&nbsp;€."
  - "Wähle Steuerklasse (I–VI), Bundesland und ob Kirchensteuer anfällt."
  - "Das Netto erscheint sofort. Klappe einzelne Posten auf, um die Formel dahinter zu sehen."
faq:
  - q: "Wie viel Netto bleibt von 3.500&nbsp;€ Brutto?"
    a: "Bei Steuerklasse I, NRW, ohne Kirchensteuer bleiben bei 3.500&nbsp;€ Brutto ca. 2.141&nbsp;€ Netto. Der genaue Betrag hängt von Bundesland, Steuerklasse und Krankenkassenzusatzbeitrag ab — nutze den Rechner für deine individuellen Werte."
  - q: "Was ändert sich 2026 beim Nettogehalt?"
    a: "Der Grundfreibetrag steigt auf 12.348&nbsp;€ (+252&nbsp;€ ggü. 2025), der Kinderfreibetrag auf 9.756&nbsp;€. Die neue Aktivrente sieht einen Freibetrag von 2.000&nbsp;€/Monat vor. Die Minijob-Grenze beträgt 603&nbsp;€, der Midijob-Übergangsbereich reicht bis 2.000&nbsp;€."
  - q: "Was ist der Unterschied zwischen Steuerklasse III und V?"
    a: "Steuerklasse III gilt für den besserverdienenden Ehepartner und nutzt das Splitting-Verfahren — monatlich deutlich weniger Lohnsteuer, dafür Pflicht zur Einkommensteuererklärung. Steuerklasse V gilt für den Partner mit dem niedrigeren Einkommen und führt zu den höchsten monatlichen Abzügen. Zusammen ergeben III+V dieselbe Jahressteuer wie zweimal IV."
  - q: "Warum zahle ich Pflegeversicherungs-Zuschlag?"
    a: "Kinderlose Arbeitnehmer ab 23&nbsp;Jahren zahlen seit 2023 einen Zuschlag: 2,40&nbsp;% statt 1,80&nbsp;%. Eltern mit mindestens einem Kind zahlen 1,80&nbsp;%, bei weiteren Kindern gibt es Abstufungen. In Sachsen gilt eine Sonderregel: Arbeitnehmer zahlen 2,30&nbsp;%, Arbeitgeber nur 1,30&nbsp;%."
  - q: "Zahle ich als Expat automatisch Kirchensteuer?"
    a: "Ja — wer bei der Anmeldung Konfessionszugehörigkeit angibt, wird automatisch kirchensteuerpflichtig (8&nbsp;% in Bayern und Baden-Württemberg, 9&nbsp;% in allen anderen Bundesländern). Der Kirchenaustritt beendet die Pflicht ab dem Folgemonat. Der Rechner bietet einen An/Aus-Schalter, um den Unterschied sofort zu sehen."
  - q: "Sind die Ergebnisse exakt wie der Gehaltszettel?"
    a: "Annähernd — systembedingte Abweichungen von ±10–20&nbsp;€ sind üblich und beruhen auf unterschiedlichen Rundungsmethoden nach Steuerrecht (§32a EStG). Gehaltszettel-Software nutzt den exakten PAP-Algorithmus des BMF; dieser Rechner verwendet den vereinfachten §32a-Tarif. Für verbindliche Zahlen empfehlen wir deinen Arbeitgeber oder einen Steuerberater."
relatedTools: []
datePublished: '2026-04-24'
dateModified: '2026-04-24'

---

## Was macht dieser Rechner?

Der Brutto-Netto-Rechner 2026 berechnet dein monatliches Netto-Gehalt auf Basis der aktuellen deutschen Lohnsteuer- und Sozialversicherungssätze. Er berücksichtigt alle sechs Steuerklassen, die Kirchensteuer nach Bundesland (8&nbsp;% in Bayern und Baden-Württemberg, 9&nbsp;% in allen anderen Bundesländern), den Solidaritätszuschlag sowie die Besonderheiten von Midijob- und Minijob-Beschäftigungen.

Das Differenzierungs-Merkmal gegenüber anderen Rechnern: Jeder Abzugsposten ist mit einer Formel-Erklärung hinterlegt. Statt nur „Rentenversicherung: 325,50&nbsp;€" zeigt der Rechner: „9,30&nbsp;% × 3.500&nbsp;€ = 325,50&nbsp;€ — wird für deine spätere Rente angespart." Das adressiert den häufigsten Pain bei Berufseinsteigern und Expats: den Gap-Shock zwischen verhandeltem Brutto und ausgezahltem Netto.

Alle Berechnungen laufen ausschließlich im Browser. Kein Cent deiner Gehaltsdaten verlässt dein Gerät — kein Server-Upload, kein Tracking, keine Werbecookies.

## Welche Berechnungsformeln gibt es?

Die monatlichen Abzüge setzen sich aus Lohnsteuer, Solidaritätszuschlag, Kirchensteuer (optional) und den vier Sozialversicherungszweigen zusammen.

**Rentenversicherung (AN-Anteil 2026):**
`9,30 % × min(Brutto, 8.450 €)` — Beitragsbemessungsgrenze RV/AV: 8.450&nbsp;€/Monat

**Krankenversicherung gesetzlich (AN-Anteil 2026):**
`(7,30 % + ½ × Ø-Zusatzbeitrag 1,45 %) × min(Brutto, 5.812,50 €)` ≈ 8,025&nbsp;% × Brutto bis zur BBG

**Pflegeversicherung (AN-Anteil 2026):**
- Mit Kind: 1,80&nbsp;% × min(Brutto, 5.812,50&nbsp;€)
- Kinderlos ab 23: 2,40&nbsp;% × min(Brutto, 5.812,50&nbsp;€)
- Sachsen-Sonderregel: AN 2,30&nbsp;%, AG 1,30&nbsp;%

**Arbeitslosenversicherung (AN-Anteil 2026):**
`1,30 % × min(Brutto, 8.450 €)`

**Lohnsteuer nach §32a EStG 2026 (Jahrestarif, monatlich /12):**
Vereinfachte Progressionszonen auf Basis des zu versteuernden Einkommens (zvE) je Steuerklasse:
- SK I/IV: zvE = Jahresbrutto − 1.230&nbsp;€ (AN-Pauschbetrag) − 36&nbsp;€
- SK II: zvE − 4.260&nbsp;€ (Entlastungsbetrag Alleinerziehende)
- SK III: Splitting — Tarif auf zvE/2, dann ×2
- SK V: kein Grundfreibetrag (zvE nach oben verschoben)
- SK VI: kein Grundfreibetrag, kein AN-Pauschbetrag

**Solidaritätszuschlag 2026:**
Freigrenze: Jahres-LSt ≤ 18.130&nbsp;€ → kein Soli. Gleitzone: 11,9&nbsp;% × (LSt − Freigrenze), gedeckelt bei 5,5&nbsp;% × LSt.

**Midijob-Gleitzonenformel:**
`SV-Basis = Brutto × [F + (1 − F) × (Brutto − 603) / (2.000 − 603)]`
Mit F&nbsp;= 0,6619. Am unteren Ende (603,01&nbsp;€) beträgt der Faktor ca. 0,6619; am oberen Ende (2.000&nbsp;€) erreicht er 1,0 (volle SV-Last).

**Quellen 2026:** Beitragssätze und BBG: lohn-info.de; Steuerliche Größen (Grundfreibetrag, Soli-Freigrenze): Bundesfinanzministerium (BMF); Midijob-F-Faktor: §&nbsp;20 SGB IV / Deutsche Rentenversicherung.

## Welche Anwendungsbeispiele gibt es?

Drei typische Berechnungen für 2026:

### Beispiel 1 — Vollzeit SK I, NRW, 3.500&nbsp;€ Brutto

Rentenversicherung: 325,50&nbsp;€ · Krankenversicherung: 280,88&nbsp;€ · Pflegeversicherung (mit Kind): 63,00&nbsp;€ · Arbeitslosenversicherung: 45,50&nbsp;€ · Lohnsteuer SK I: 644,42&nbsp;€ · Soli: 0&nbsp;€ · **Netto: 2.140,70&nbsp;€**

### Beispiel 2 — Vollzeit SK III, NRW, 3.500&nbsp;€ Brutto (Splitting)

Lohnsteuer SK III: ca. 308&nbsp;€ (Splitting-Vorteil). **Netto: ca. 2.477&nbsp;€** — rund 336&nbsp;€ mehr als SK I durch Ehegattensplitting.

### Beispiel 3 — Midijob, 1.200&nbsp;€ Brutto

F-Faktor greift; SV-Basis ≈ 968&nbsp;€. Rentenversicherung: 90&nbsp;€ (Gleitzone reduziert von 112&nbsp;€ ohne F-Faktor). **Netto: ca. 993&nbsp;€** — ca. 8&nbsp;% weniger Abzüge als bei regulärer Vollzeitstelle.

## Welche Einsatzgebiete gibt es?

- **Berufseinsteiger und Jobwechsler:** Gehaltsangebot realistisch einschätzen — 3.800&nbsp;€ Brutto in SK I ergeben ca. 2.450&nbsp;€ Netto, nicht 3.800&nbsp;€.
- **Verheiratete Paare:** Steuerklasse III+V vs. zweimal IV vergleichen; der Rechner zeigt, welche Kombination monatlich günstiger ist.
- **Studierende und Werkstudierende:** Midijob-Grenze im Blick behalten — bei 603,01&nbsp;€ beginnt die reduzierte SV-Pflicht.
- **Expats und Zuzügler:** Kirchensteuer verstehen — wer bei der Anmeldung Konfessionszugehörigkeit angibt, zahlt automatisch 8–9&nbsp;% auf die Lohnsteuer.
- **Rentner mit Zuverdienst:** Aktivrente 2026 — neuer Freibetrag 2.000&nbsp;€/Monat für Beschäftigung über das Rentenalter hinaus.
- **Freelancer und Selbstständige:** Gehaltsvergleich Anstellung vs. Selbstständigkeit — Netto als Referenzpunkt für Tagessatz-Kalkulation.

## Häufige Fragen

## Welche Finanz-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Stundenlohn-Jahresgehalt-Rechner](/de/stundenlohn-jahresgehalt)** — Stundenlohn in Jahresgehalt und Monatsbrutto umrechnen — sinnvoller erster Schritt vor der Netto-Berechnung.
- **[Kreditrechner](/de/kreditrechner)** — Monatliche Kreditrate und Zinskosten berechnen — baut auf dem Netto auf, das dieser Rechner liefert.
- **[Mehrwertsteuer-Rechner](/de/mehrwertsteuer-rechner)** — Netto und Brutto mit MwSt umrechnen — ergänzend für Freiberufler, die Rechnungen netto schreiben.
