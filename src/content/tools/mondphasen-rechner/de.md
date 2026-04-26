---
toolId: "moon-phase"
language: "de"
title: "Mondphasen Rechner — Mondphase für jedes Datum berechnen"
metaDescription: "Mondphase für jedes Datum berechnen: Neumond, Vollmond, Beleuchtungsgrad, Mondalter und nächste Mondphasen. Läuft komplett im Browser, kein Upload."
tagline: "Datum eingeben — Mondphase, Beleuchtung und nächste Ereignisse sofort anzeigen."
intro: "Berechne die Mondphase für jedes beliebige Datum: ob Vollmond, Neumond, zunehmende oder abnehmende Sichel. Der Rechner zeigt den Beleuchtungsgrad in Prozent, das Mondalter in Tagen sowie die Daten des nächsten Vollmonds und Neumond. Alles läuft direkt im Browser — keine Standortangabe nötig, kein Server, kein Tracking."
category: "nature"
stats:
  - label: "Mondphasen"
    value: "8"
  - label: "Genauigkeit"
    value: "±1"
    unit: "Tag"
  - label: "Verarbeitung"
    value: "Lokal"
contentVersion: 1
headingHtml: "<em>Mondphase</em> berechnen"
howToUse:
  - "Datum auswählen — das heutige Datum ist voreingestellt."
  - "Der Mond wird sofort grafisch angezeigt: die helle Seite zeigt die beleuchtete Fläche."
  - "Darunter erscheinen Phasenname, Beleuchtungsgrad in %, Mondalter in Tagen sowie Datum und Countdown zum nächsten Vollmond und Neumond."
  - "Für vergangene oder zukünftige Daten einfach das Datum ändern — die Berechnung aktualisiert sich in Echtzeit."
faq:
  - q: "Wie wird die Mondphase berechnet?"
    a: "Die Mondphase basiert auf dem synodischen Monat — dem Zeitraum zwischen zwei Neumonden, der im Durchschnitt 29,53 Tage beträgt. Aus dem gewählten Datum wird die Julianische Tagesnummer berechnet, die Differenz zu einem bekannten Neumond (6. Januar 2000) bestimmt das aktuelle Mondalter. Aus dem Mondalter ergibt sich der Beleuchtungsgrad nach der Formel: Beleuchtung = 0,5 × (1 − cos(Mondalter × 2π / 29,53))."
  - q: "Brauche ich meinen Standort für die Mondphasen-Berechnung?"
    a: "Nein. Die acht Mondphasen (Neumond, Sichel, Viertel, Gibbons, Vollmond usw.) sind standortunabhängig — sie gelten gleichzeitig für die gesamte Erde. Standortdaten werden nur bei der Berechnung von Mondaufgang und Monduntergang benötigt, die dieser Rechner nicht umfasst. Du musst also keinen Ort angeben."
  - q: "Was bedeutet zunehmend und abnehmend?"
    a: "Zunehmend (Waxing) bedeutet, dass der Mond heller wird — die beleuchtete Fläche wächst vom Neumond zum Vollmond. Abnehmend (Waning) bedeutet das Gegenteil: die beleuchtete Fläche schrumpft vom Vollmond zurück zum Neumond. In der Nordhemisphäre ist der zunehmende Mond rechts beleuchtet, der abnehmende links — auf der Südhemisphäre ist es umgekehrt."
  - q: "Wie genau ist die Berechnung?"
    a: "Die verwendete Formel auf Basis des Julianischen Datums und des synodischen Monats erreicht eine Genauigkeit von ±1 Tag für Mondphasen-Ereignisse wie Vollmond oder Neumond. Für Gartenarbeit, Angeln, Kochen nach Mondkalender oder allgemeine Planung ist diese Genauigkeit vollständig ausreichend. Für astronomisch präzise Berechnungen (auf die Stunde genau) werden Störungsrechnungen mit Ephemeridentabellen benötigt."
  - q: "Für welche Daten funktioniert der Rechner?"
    a: "Der Rechner funktioniert für alle Daten im Gregorianischen Kalender — also ab dem 15. Oktober 1582. Für historische Daten davor (Julianischer Kalender) wäre eine andere Referenz nötig. Für Zukunftsdaten gibt es keine obere Grenze; die Genauigkeit nimmt über sehr lange Zeiträume (Jahrhunderte) leicht ab, da der synodische Monat selbst langsam variiert."
  - q: "Was ist der Unterschied zwischen Sichel und Halbmond?"
    a: "Eine Sichel (Crescent) ist weniger als 50 % beleuchtet, ein Halbmond (Quarter) genau 50 %. 'Erstes Viertel' und 'Letztes Viertel' bezeichnen astronomisch nicht die Form des Monds, sondern dass der Mond ein Viertel bzw. drei Viertel seines Zyklus vollendet hat. Visuell sieht man beim ersten Viertel die rechte Hälfte beleuchtet, beim letzten Viertel die linke Hälfte."
relatedTools: ['unix-timestamp', 'zeitzonen-rechner']
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## Was macht dieser Rechner?

Der Mondphasen-Rechner berechnet für jedes eingegebene Datum die aktuelle Mondphase, den Beleuchtungsgrad und das Mondalter. Er zeigt außerdem an, ob der Mond zunimmt oder abnimmt, und liefert Datum und Countdown zum nächsten Vollmond und Neumond.

Die Berechnung basiert auf dem synodischen Monat (29,53 Tage) und einer Julianischen Tagesnummer-Referenz. Kein Standort nötig, kein Server-Upload — alles läuft direkt im Browser.

## Wie wird die Mondphase berechnet?

**Synodischer Monat:** Der Mond braucht im Durchschnitt 29,530588853 Tage, um von Neumond zu Neumond zu gelangen. Dieser Wert heißt synodischer Monat.

**Mondalter:**

```
Mondalter = (JD − 2451550,26) mod 29,53
```

`JD` = Julianische Tagesnummer des gewählten Datums. Der Wert 2451550,26 entspricht dem Neumond vom 6. Januar 2000.

**Beleuchtungsgrad:**

```
Beleuchtung = 0,5 × (1 − cos(Mondalter × 2π / 29,53))
```

Ergibt 0 bei Neumond (0 % beleuchtet) und 1 bei Vollmond (100 % beleuchtet).

## Welche 8 Mondphasen gibt es?

| Phase | Mondalter | Beleuchtung |
|-------|-----------|-------------|
| Neumond | 0–1,85 Tage | ~0 % |
| Zunehmende Sichel | 1,85–7,38 Tage | 1–49 % |
| Erstes Viertel | 7,38–9,22 Tage | ~50 % |
| Zunehmender Mond | 9,22–14,77 Tage | 51–99 % |
| Vollmond | 14,77–16,61 Tage | ~100 % |
| Abnehmender Mond | 16,61–22,15 Tage | 99–51 % |
| Letztes Viertel | 22,15–23,99 Tage | ~50 % |
| Abnehmende Sichel | 23,99–29,53 Tage | 49–1 % |

## Wozu wird die Mondphase verwendet?

- **Gartenarbeit nach Mondkalender:** Viele Gärtner pflanzen Blattgemüse bei zunehmendem Mond und ernten bei abnehmendem Mond — ein Praxis, die auf überlieferten Beobachtungen basiert.
- **Angeln:** Vollmond und Neumond gelten traditionell als günstigste Angelzeiten, da der Gezeitenzug der Gezeiten Fische aktiver macht.
- **Fotografie und Nachtbeobachtung:** Astronomen und Naturfotografen planen Aufnahmen rund um Neumond (dunkler Himmel) oder Vollmond (maximales Mondlicht).
- **Kalenderplanung und Feste:** Viele religiöse und kulturelle Feste (Ostern, Ramadan, chinesisches Neujahr) richten sich nach dem Mondkalender.

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Welche verwandten Werkzeuge gibt es?

- **[Unix Timestamp Converter](/de/unix-timestamp)** — Datum und Uhrzeit in Unix-Timestamps umrechnen, z.&nbsp;B. für Datenbankabfragen zu bestimmten Mondphasen-Ereignissen.
- **[Zeitzonen-Rechner](/de/zeitzonen-rechner)** — Uhrzeiten zwischen Zeitzonen umrechnen, hilfreich wenn du Mondphasen-Ereignisse für verschiedene Standorte planst.
