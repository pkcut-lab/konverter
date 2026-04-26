---
toolId: unix-timestamp
language: en
title: "Unix Timestamp Converter — Epoch to Date"
headingHtml: "Convert <em>Unix Timestamps</em> to Human-Readable Dates"
metaDescription: "Convert Unix epoch timestamps to readable dates and times — and back. Supports seconds and milliseconds. Instant, browser-based, no sign-up needed."
tagline: "Paste a Unix timestamp and get a human-readable date. Or pick a date and get the epoch value. Handles both seconds and milliseconds automatically."
intro: "Unix timestamps — seconds (or milliseconds) elapsed since January 1, 1970, 00:00:00 UTC — appear everywhere in software development: API responses, log files, database records, JWT tokens, and cookie expiration headers. This tool converts them in both directions without requiring you to do the mental math."
howToUse:
  - "Paste a Unix timestamp (seconds or milliseconds) into the input field."
  - "The tool auto-detects whether it's in seconds or milliseconds based on magnitude."
  - "Read the converted date and time in UTC, your local timezone, and ISO 8601 format."
  - "To convert a date to a Unix timestamp, use the date picker and click 'To Epoch'."
  - "Copy the result to clipboard with one click."
faq:
  - q: "What is a Unix timestamp?"
    a: "A Unix timestamp is the number of seconds that have elapsed since the Unix epoch — midnight, January 1, 1970, UTC. It's a timezone-independent way to represent a specific moment in time."
  - q: "How do I tell if a timestamp is in seconds or milliseconds?"
    a: "Timestamps in seconds are typically 10 digits (e.g., 1,714,000,000 for April 2024). Millisecond timestamps are 13 digits (e.g., 1,714,000,000,000). The tool detects this automatically."
  - q: "What is the maximum Unix timestamp value?"
    a: "32-bit signed integers overflow at 2,147,483,647 seconds — January 19, 2038, 03:14:07 UTC (the 'Year 2038 problem'). 64-bit systems extend the range to the year 292 billion CE."
  - q: "What is the Unix timestamp for January 1, 2025?"
    a: "January 1, 2025 00:00:00 UTC = Unix timestamp 1,735,689,600. In milliseconds: 1,735,689,600,000."
  - q: "How do I get the current Unix timestamp in JavaScript?"
    a: "Use Date.now() for milliseconds, or Math.floor(Date.now() / 1000) for seconds. In Unix shell: date +%s. In Python: import time; int(time.time())."
  - q: "Is Unix timestamp affected by time zones?"
    a: "No. Unix timestamps are always UTC-based. Time zones only affect how you display or interpret the timestamp as a human-readable date."
relatedTools:
  - timezone-converter
  - url-encoder-decoder
  - base64-encoder
category: time
contentVersion: 1
---

## What This Tool Does

This tool converts Unix epoch timestamps to human-readable dates and times — and converts dates back to Unix timestamps. It displays results in UTC, your browser's local timezone, and ISO 8601 format simultaneously.

## How It Works

The Unix epoch is defined as 00:00:00 Coordinated Universal Time (UTC) on Thursday, January 1, 1970. All Unix timestamps count forward from that moment:

| Timestamp (seconds) | Date (UTC) |
|---|---|
| 0 | 1970-01-01 00:00:00 |
| 86,400 | 1970-01-02 00:00:00 |
| 1,000,000,000 | 2001-09-08 21:46:40 |
| 1,700,000,000 | 2023-11-14 22:13:20 |
| 2,000,000,000 | 2033-05-18 03:33:20 |

The conversion is purely arithmetic. For millisecond timestamps, the tool divides by 1,000 first, then applies the same logic.

## Common Use Cases

**API response debugging.** REST APIs often return dates as Unix timestamps in JSON. Seeing `"expires_at": 1740000000` is meaningless at a glance — convert it to `2025-02-19 21:20:00 UTC` to confirm the expiry is as expected.

**Log file analysis.** Web server and application logs frequently store timestamps as epoch values for compact storage and easy sorting. Convert specific log entries to confirm when an error or event occurred in your local time.

**Database timestamps.** PostgreSQL, MySQL, and SQLite can store timestamps as integer epoch values. When debugging a query result, paste the value here to see the human-readable date without writing a conversion query.

**JWT token inspection.** JSON Web Tokens include `iat` (issued at) and `exp` (expires) claims as Unix timestamps. Converting the `exp` value tells you immediately whether a token is still valid.

**Cookie expiration.** HTTP `Set-Cookie` headers use `Max-Age` in seconds from now, or an explicit `Expires` date. Tools that return the raw epoch value for `Expires` can be decoded here.

**JavaScript Date debugging.** JavaScript's `Date` object operates in milliseconds. When `console.log(Date.now())` returns `1714000000000`, this tool converts it instantly without mental division.

## Format Reference

The tool outputs the timestamp in multiple formats:

| Format | Example |
|---|---|
| UTC | 2025-04-26 14:30:00 UTC |
| Local time | 2025-04-26 10:30:00 EDT (UTC−4) |
| ISO 8601 | 2025-04-26T14:30:00.000Z |
| RFC 2822 | Sat, 26 Apr 2025 14:30:00 +0000 |
| Day of week | Saturday |

## FAQ

**What happens with negative Unix timestamps?**
Negative values represent dates before January 1, 1970. For example, -86,400 = December 31, 1969, 00:00:00 UTC. Most systems support negative timestamps, though some older APIs may not.

**Why do some APIs use milliseconds instead of seconds?**
JavaScript popularized millisecond-precision timestamps because `Date.now()` returns milliseconds natively. APIs designed for JavaScript clients (REST, GraphQL, web hooks) often adopt milliseconds for consistency with the client-side environment.

**How precise is this conversion?**
To millisecond precision — the maximum resolution of standard Unix timestamps. Sub-millisecond precision (microseconds, nanoseconds) requires specialized high-resolution timers not covered by the standard epoch format.
