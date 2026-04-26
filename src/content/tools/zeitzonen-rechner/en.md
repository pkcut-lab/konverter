---
toolId: timezone-converter
language: en
title: "Time Zone Converter — US & World Time Zones"
headingHtml: "Time Zone Converter — <em>Instant</em> US & Global Time"
metaDescription: "Convert time between any two time zones instantly. Covers all US zones (ET, CT, MT, PT) plus global cities. DST-aware. Free, no account needed."
tagline: "Convert a time between any two time zones in seconds. Covers all US time zones plus hundreds of cities worldwide. Automatically accounts for Daylight Saving Time."
intro: "Scheduling a meeting between New York and Los Angeles, a call with a team in London, or a product launch timed for multiple markets — getting the time right matters. This time zone converter takes a specific time and date in one zone and shows you the exact equivalent in any other zone. Daylight Saving Time transitions are handled automatically based on the selected date, so you never have to remember which zones are currently observing DST."
howToUse:
  - "Select your source time zone from the dropdown — start typing a city name or zone abbreviation to filter the list."
  - "Enter the date and time you want to convert using the date/time picker."
  - "Select your target time zone. The converted time appears immediately."
  - "Click 'Add Zone' to compare the same moment across multiple time zones simultaneously — useful for scheduling multi-location meetings."
  - "The DST indicator shows whether each zone is currently observing Daylight Saving Time on the selected date."
faq:
  - q: "What are the main US time zones and their UTC offsets?"
    a: "The four contiguous US time zones are Eastern (ET, UTC-5 standard / UTC-4 DST), Central (CT, UTC-6 / UTC-5 DST), Mountain (MT, UTC-7 / UTC-6 DST), and Pacific (PT, UTC-8 / UTC-7 DST). Alaska (AKT) is UTC-9 / UTC-8 DST, and Hawaii (HST) is UTC-10 with no DST. Arizona (except the Navajo Nation) does not observe DST and stays at UTC-7 year-round."
  - q: "When does Daylight Saving Time start and end in the US?"
    a: "In 2024 and 2025, US Daylight Saving Time begins on the second Sunday in March (clocks spring forward 1 hour at 2:00 AM local time) and ends on the first Sunday in November (clocks fall back 1 hour at 2:00 AM). Hawaii and most of Arizona do not observe DST."
  - q: "How many hours is New York ahead of Los Angeles?"
    a: "New York (ET) is 3 hours ahead of Los Angeles (PT) — both during standard time and during DST, since both zones observe DST simultaneously. For example, when it's 9:00 AM in Los Angeles, it's 12:00 PM (noon) in New York."
  - q: "What time zone is UTC and how does it relate to EST/EDT?"
    a: "UTC (Coordinated Universal Time) is the world's primary time standard, with no DST offset. Eastern Standard Time (EST) is UTC-5. Eastern Daylight Time (EDT, during summer) is UTC-4. 'ET' (Eastern Time) refers to the zone collectively, switching between EST and EDT as appropriate."
  - q: "How do I schedule a meeting that works across US time zones?"
    a: "The overlap window for all four contiguous US time zones during business hours (9 AM–5 PM) is 12:00 PM–5:00 PM ET (9 AM–2 PM PT). This 5-hour window is the practical sweet spot for all-hands calls. Entering 12:00 PM ET in this converter instantly shows the equivalent in all other zones."
  - q: "Does this tool handle half-hour and 45-minute offset time zones?"
    a: "Yes. Time zones like India (IST, UTC+5:30), Iran (IRST, UTC+3:30), and Nepal (NPT, UTC+5:45) use non-standard offsets. The tool supports the full IANA timezone database, which includes all such zones."
relatedTools:
  - unix-timestamp-converter
  - url-encoder-decoder
  - character-counter
category: time
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This time zone converter translates a specific date and time from one time zone to another. It supports all major world time zones via the IANA timezone database, handles Daylight Saving Time transitions automatically, and lets you view multiple zones simultaneously for meeting scheduling.

The tool is designed for the practical cases that come up most often for US-based users: comparing ET to PT for coast-to-coast coordination, converting to GMT/UTC for API timestamps, and scheduling international calls to London, Berlin, or Tokyo without mental arithmetic.

## How It Works

Time zone conversion works by normalizing both times to UTC and then applying the target zone's offset. The complication is Daylight Saving Time: the UTC offset for a zone changes twice a year, and the transition date varies by country (and even by state in the US). This tool uses the IANA timezone database — the same database used by operating systems, programming languages, and browsers — which stores the full historical and future DST transition schedule for every time zone. Given a specific date, it looks up the correct offset for that date rather than assuming a fixed offset.

## What Are the US Time Zones?

| Zone | Abbreviation | UTC Standard | UTC Summer (DST) | Example Cities |
|------|-------------|--------------|------------------|----------------|
| Eastern | ET | UTC-5 | UTC-4 | New York, Miami, Atlanta, Boston |
| Central | CT | UTC-6 | UTC-5 | Chicago, Dallas, Houston, Minneapolis |
| Mountain | MT | UTC-7 | UTC-6 | Denver, Phoenix*, Salt Lake City |
| Pacific | PT | UTC-8 | UTC-7 | Los Angeles, Seattle, Las Vegas, Portland |
| Alaska | AKT | UTC-9 | UTC-8 | Anchorage, Fairbanks |
| Hawaii | HST | UTC-10 | UTC-10 (no DST) | Honolulu |

*Phoenix and most of Arizona remain at UTC-7 year-round (no DST).

## What Are Common Use Cases?

**Scheduling coast-to-coast US meetings.** A 9:00 AM PT meeting is 12:00 PM ET — comfortable for both coasts. A 3:00 PM ET meeting is 12:00 PM PT — still reasonable. Meetings after 5:00 PM ET (2:00 PM PT) start cutting into afternoon availability on the West Coast. This converter shows the full picture before you send the calendar invite.

**International coordination with UK and Europe.** London (GMT/BST) is 5 hours ahead of ET in winter and 6 hours ahead in summer, because the US and UK change their clocks on different dates. A weekly call that works well in February may fall outside working hours for London in March if you don't check the DST transition dates. This tool uses the actual dates to avoid that mistake.

**Coordinating with remote teams in Asia.** Tokyo (JST, UTC+9) does not observe DST, making it a stable reference. New York to Tokyo spans 14 hours (standard) or 13 hours (EDT). A 9:00 AM ET standup is 10:00 PM or 11:00 PM in Tokyo — generally not feasible for synchronous meetings. This converter makes the overlap window (or lack of one) immediately visible.

**Setting launch times for multiple markets.** Product launches, sale events, and content releases that need to go live at a specific local time in multiple regions require careful time zone math. Convert once, verify for every target market, and schedule confidently.

**Reading API timestamps and log files.** Server logs and API responses often use UTC. Converting a UTC timestamp to local time — or to the time zone of a specific user — is a daily developer task. Enter the UTC value here and pick any IANA zone as the target.

**Understanding daylight saving transitions.** The day of a DST transition is tricky: clocks skip an hour in spring, creating a non-existent 2:00–3:00 AM window, and repeat an hour in fall. Entering a time in that window shows whether it is ambiguous or invalid for the selected date.

## Häufige Fragen?

**Why do some US states not observe DST?**
Congress grants states the right to opt out of DST under the Uniform Time Act. Hawaii has never observed DST (its proximity to the equator makes seasonal light variation minor). Arizona opted out in 1968, citing the extreme summer heat — an extra hour of daylight in 110°F temperatures was seen as a burden rather than a benefit. The Navajo Nation within Arizona does observe DST, creating a zone-within-a-zone situation.

**What is the difference between GMT and UTC?**
GMT (Greenwich Mean Time) and UTC (Coordinated Universal Time) are equivalent for everyday scheduling purposes — both sit at zero offset. The technical difference is that GMT is a time zone (used in the UK during winter) while UTC is a time standard maintained by atomic clocks. For web scheduling and API work, UTC is preferred because it is unambiguous.

**How does "ET" differ from "EST" and "EDT"?**
ET is the colloquial name for the Eastern Time zone. EST (Eastern Standard Time, UTC-5) applies from November to March. EDT (Eastern Daylight Time, UTC-4) applies from March to November. Using "ET" avoids specifying which offset applies — most business communications use "ET" and rely on context (i.e., today's date) to resolve whether DST is active.
