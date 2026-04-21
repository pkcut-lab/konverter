---
queue_name: differenzierung
queue_version: 1
created: 2026-04-21
maintainer: ceo-agent (auto-refill §6) + user (manual-append)
ordering: top-of-file = next-to-dispatch (FIFO — älteste zuerst)
hard_cap_in_flight: 10
hard_cap_per_heartbeat: 3
pause_threshold_critic_reject_rate_rolling_10: 0.20
enum_source: src/lib/tools/categories.ts (14 values: length, weight, area, volume, distance, temperature, image, video, audio, document, text, dev, color, time)
note: >-
  User-Directive Patch 5 erwähnte „14-Category-Enum" mit speed/data/pressure/
  energy/power/fuel/angle/currency. Diese Slugs existieren NICHT in der
  aktuellen TOOL_CATEGORIES-Definition. Dieser Queue-Seed hält sich an den
  realen Enum (7 Converter-Kategorien: length, weight, area, volume, distance,
  temperature, time). Enum-Extension ist ein späterer User-Decision-Ticket;
  solange nicht erweitert → nicht queue-relevant (sonst Zod-Fail bei Content-
  Collection-Build).
---

# Differenzierungs-Queue — Converter-Familie

**Purpose.** Auto-Refill-Backlog für CEO §6. Wenn active queue leer + Tripwires
green → CEO picked die nächsten N (max 3) Tickets von hier, schreibt
`tasks/current_task.md`, dispatcht Researcher + Builder + Critic.

**Format pro Zeile.** `<slug> | <category> | <de-label> | <parent_hint>`

- `parent_hint` zeigt auf Category-Root-Dossier (`dossiers/_categories/<cat>/*.md`).
- Wenn Root fehlt/stale → Researcher baut ihn zuerst (HEARTBEAT.md §3 Parent-Check).

**Dedup-Regel.** Tools, die bereits in `src/content/tools/<slug>/de.md` liegen,
werden vor Dispatch ausgefiltert (CEO Step 9 Backlog-Pick): aktuell **already-built**
(skip) = `celsius-zu-fahrenheit, hevc-zu-h264, hintergrund-entfernen,
kilogramm-zu-pfund, kilometer-zu-meilen, meter-zu-fuss, quadratmeter-zu-
quadratfuss, webp-konverter, zentimeter-zu-zoll`.

---

## Queue (20 Kandidaten, FIFO top→bottom)

```
millimeter-zu-zoll           | length      | Millimeter zu Zoll            | length-root
yard-zu-meter                | length      | Yard zu Meter                 | length-root
fuss-zu-meter                | length      | Fuß zu Meter                  | length-root
seemeile-zu-kilometer        | length      | Seemeile zu Kilometer         | length-root
gramm-zu-unzen               | weight      | Gramm zu Unzen                | weight-root
pfund-zu-kilogramm           | weight      | Pfund zu Kilogramm            | weight-root
stone-zu-kilogramm           | weight      | Stone zu Kilogramm            | weight-root
tonne-zu-pfund               | weight      | Tonne zu Pfund                | weight-root
hektar-zu-acre               | area        | Hektar zu Acre                | area-root
quadratkilometer-zu-quadratmeile | area    | Quadratkilometer zu Quadratmeile | area-root
liter-zu-gallonen            | volume      | Liter zu Gallonen             | volume-root
milliliter-zu-unzen          | volume      | Milliliter zu Unzen           | volume-root
kubikmeter-zu-kubikfuss      | volume      | Kubikmeter zu Kubikfuß        | volume-root
barrel-zu-liter              | volume      | Barrel zu Liter               | volume-root
fahrenheit-zu-celsius        | temperature | Fahrenheit zu Celsius         | temperature-root
kelvin-zu-celsius            | temperature | Kelvin zu Celsius             | temperature-root
stunden-zu-minuten           | time        | Stunden zu Minuten            | time-root
tage-zu-stunden              | time        | Tage zu Stunden               | time-root
jahre-zu-tagen               | time        | Jahre zu Tagen                | time-root
monate-zu-tagen              | time        | Monate zu Tagen               | time-root
```

## Parking-Lot (Enum-Extension nötig — nicht dispatch-fähig)

Diese Slugs sind interessant, aber ihre Kategorien fehlen in `TOOL_CATEGORIES`.
Erst nach User-Decision-Ticket für Enum-Extension in die Queue oben verschieben:

```
kmh-zu-mph                   | speed       | Kilometer/h zu Meilen/h
knoten-zu-kmh                | speed       | Knoten zu Kilometer/h
gigabyte-zu-gibibyte         | data        | Gigabyte zu Gibibyte
megabit-zu-megabyte          | data        | Megabit zu Megabyte
bar-zu-psi                   | pressure    | Bar zu PSI
pascal-zu-bar                | pressure    | Pascal zu Bar
kilowattstunden-zu-joule     | energy      | Kilowattstunden zu Joule
kalorien-zu-joule            | energy      | Kalorien zu Joule
ps-zu-kilowatt               | power       | Pferdestärke zu Kilowatt
kilowatt-zu-btu              | power       | Kilowatt zu BTU/h
liter-pro-100km-zu-mpg       | fuel        | l/100km zu Miles-per-Gallon
grad-zu-radiant              | angle       | Grad zu Radiant
euro-zu-dollar               | currency    | Euro zu Dollar (live-rate, Phase 3+)
```

## Auto-Refill-Log (wird vom CEO appended)

```
<ISO-timestamp> | ticket=<KON-id> | slug=<slug> | in_flight=<count> | reject_rate_10=<ratio>
```
