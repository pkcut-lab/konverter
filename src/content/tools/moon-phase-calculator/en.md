---
toolId: "moon-phase"
language: "en"
title: "Moon Phase Calculator — Find the Moon Phase for Any Date"
metaDescription: "Calculate the moon phase for any date: new moon, full moon, illumination %, lunar age, next moon events. Runs entirely in your browser, no upload."
tagline: "Pick a date — instantly see the moon phase, illumination, and upcoming lunar events."
intro: "Calculate the moon phase for any date you choose: new moon, full moon, waxing or waning crescent. The calculator displays the illumination percentage, lunar age in days, and the dates of the next full moon and new moon. Everything runs directly in your browser — no location input required, no server, no tracking."
category: "nature"
stats:
  - label: "Moon phases"
    value: "8"
  - label: "Accuracy"
    value: "±1"
    unit: "day"
  - label: "Processing"
    value: "Local"
contentVersion: 1
headingHtml: "Calculate the <em>Moon Phase</em>"
howToUse:
  - "Select a date — today's date is pre-filled."
  - "The moon is instantly shown visually: the bright side represents the illuminated portion."
  - "Below the moon you'll see the phase name, illumination percentage, lunar age in days, and the date and countdown to the next full moon and new moon."
  - "Change the date for any past or future day — the result updates in real time."
faq:
  - q: "How is the moon phase calculated?"
    a: "The moon phase is based on the synodic month — the time between two new moons, which averages 29.53 days. The Julian Day Number is computed for the selected date, and the difference from a known new moon (January 6, 2000) gives the current lunar age. Illumination follows the formula: illumination = 0.5 × (1 − cos(lunar age × 2π / 29.53))."
  - q: "Do I need to enter my location?"
    a: "No. The eight moon phases (new moon, crescent, quarter, gibbous, full moon, etc.) are the same everywhere on Earth at the same time — they are independent of location. Location data is only needed to calculate moonrise and moonset times, which this calculator does not cover."
  - q: "What do waxing and waning mean?"
    a: "Waxing means the moon is getting brighter — the illuminated portion grows from new moon to full moon. Waning means the opposite: the illuminated portion shrinks from full moon back to new moon. In the northern hemisphere, the waxing moon is lit on the right side; in the southern hemisphere it is lit on the left."
  - q: "How accurate is the calculation?"
    a: "The Julian Date formula achieves an accuracy of approximately ±1 day for phase events like full moon or new moon. This is fully sufficient for gardening by the moon calendar, fishing planning, photography, and general scheduling. Astronomically precise calculations (to the hour) require perturbation computations with ephemeris tables."
  - q: "What date range does the calculator support?"
    a: "The calculator works for all dates in the Gregorian calendar — from October 15, 1582 onward. There is no upper limit for future dates, though accuracy decreases slightly over very long time spans (centuries) because the synodic month itself varies slowly."
  - q: "What is the difference between a crescent and a quarter moon?"
    a: "A crescent is less than 50% illuminated, while a quarter moon is exactly 50% illuminated. 'First quarter' and 'last quarter' refer astronomically to the moon completing one quarter or three quarters of its cycle — not to the shape. Visually, the first quarter shows the right half lit (northern hemisphere); the last quarter shows the left half."
relatedTools:
  - unix-timestamp-converter
  - timezone-converter
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What does this calculator do?

The moon phase calculator computes the current moon phase, illumination percentage, and lunar age for any date you enter. It also shows whether the moon is waxing or waning, and gives the date and countdown to the next full moon and new moon.

The calculation uses the synodic month (29.53 days) and a Julian Day Number reference. No location required, no server upload — everything runs directly in your browser.

## How is the moon phase calculated?

**Synodic month:** The moon takes an average of 29.530588853 days to travel from new moon to new moon. This is called the synodic month.

**Lunar age:**

```
Lunar age = (JD − 2451550.26) mod 29.53
```

`JD` = Julian Day Number of the selected date. The value 2451550.26 corresponds to the new moon of January 6, 2000.

**Illumination:**

```
Illumination = 0.5 × (1 − cos(lunar age × 2π / 29.53))
```

This yields 0 at new moon (0% lit) and 1 at full moon (100% lit).

## What are the 8 moon phases?

| Phase | Lunar age | Illumination |
|-------|-----------|--------------|
| New Moon | 0–1.85 days | ~0% |
| Waxing Crescent | 1.85–7.38 days | 1–49% |
| First Quarter | 7.38–9.22 days | ~50% |
| Waxing Gibbous | 9.22–14.77 days | 51–99% |
| Full Moon | 14.77–16.61 days | ~100% |
| Waning Gibbous | 16.61–22.15 days | 99–51% |
| Last Quarter | 22.15–23.99 days | ~50% |
| Waning Crescent | 23.99–29.53 days | 49–1% |

## What is moon phase data used for?

- **Moon calendar gardening:** Many gardeners plant leafy vegetables during the waxing moon and harvest during the waning moon — a practice rooted in long-standing observation.
- **Fishing:** Full moon and new moon are traditionally considered the best fishing times, as the tidal pull tends to make fish more active.
- **Photography and night observation:** Astronomers and nature photographers plan shoots around new moon (darkest sky) or full moon (maximum moonlight).
- **Calendar planning and festivals:** Many religious and cultural events — Easter, Ramadan, Chinese New Year — are tied to the lunar calendar.

## What are the most frequently asked questions about moon phases?

(FAQ is rendered from frontmatter as FAQPage schema.)

## Which related tools are available?

- **[Unix Timestamp Converter](/en/unix-timestamp-converter)** — Convert dates and times to Unix timestamps, useful for querying databases around specific lunar events.
- **[Timezone Converter](/en/timezone-converter)** — Convert times between time zones, helpful when planning moon phase events across locations.
