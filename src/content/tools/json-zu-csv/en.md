---
toolId: json-to-csv
language: en
title: "JSON to CSV Converter — Free Online"
headingHtml: "JSON to <em>CSV</em> Converter"
metaDescription: "Convert JSON arrays to CSV instantly. Flatten nested objects, pick your delimiter, and download a file ready for Excel or Google Sheets — runs in-browser."
tagline: "Turn any JSON array into a clean CSV file in seconds. Nested objects are flattened automatically — no scripting needed."
intro: "Exporting data from a REST API often means dealing with nested JSON arrays that spreadsheet apps can't open directly. This tool flattens JSON arrays into comma-separated rows, maps keys to column headers, and lets you download a .csv file ready for Excel, Google Sheets, or any data pipeline. Nested objects are dot-notated (e.g. `address.city`) so no data is lost."
howToUse:
  - "Paste your JSON array (or upload a .json file) into the input panel."
  - "The tool auto-detects all keys and previews the column headers."
  - "Choose your delimiter: comma (default), semicolon, or tab."
  - "Toggle 'Flatten nested objects' on or off depending on your needs."
  - "Click Download CSV to save the file, or copy the raw CSV text."
faq:
  - q: "What JSON input formats are supported?"
    a: "The tool expects a JSON array of objects (e.g. [{...}, {...}]). A single object is also accepted and becomes one CSV row. Plain values like strings or numbers are not supported."
  - q: "How are nested objects handled?"
    a: "By default, nested objects are flattened using dot notation. For example, {\"user\":{\"name\":\"Ann\"}} becomes a column named user.name. Arrays within objects are serialized as JSON strings in the cell."
  - q: "Does this tool upload my data to a server?"
    a: "No. All conversion happens in your browser. Your JSON never leaves your device."
  - q: "Can I open the CSV in Microsoft Excel?"
    a: "Yes. Excel on Windows uses semicolons as the default delimiter in some locales. If columns appear merged, switch to the semicolon delimiter option before downloading."
  - q: "What happens if different objects have different keys?"
    a: "The tool takes the union of all keys across all objects. Missing values are output as empty cells."
  - q: "Is there a size limit?"
    a: "Files up to about 10 MB convert without issue in modern browsers. For larger datasets, consider a server-side tool or jq."
relatedTools:
  - json-formatter
  - json-diff
  - xml-formatter
category: dev
contentVersion: 1
---

## What This Tool Does

REST APIs, NoSQL databases, and SaaS exports all speak JSON. But analysts, project managers, and finance teams live in spreadsheets. This converter bridges the gap: it reads a JSON array and writes a properly structured CSV file that opens cleanly in Excel, Google Sheets, or any BI tool.

The converter handles the most common friction point — nested objects — by flattening them into additional columns using dot-path keys. An object like `{"order": {"id": 42, "total": 19.99}}` becomes two columns: `order.id` and `order.total`. Nothing is silently dropped.

## Formula or How It Works

| Step | What Happens |
|---|---|
| Parse | Input string is parsed with `JSON.parse()` |
| Schema inference | All keys across all objects are unioned to build the header row |
| Flattening | Nested objects are recursively flattened; nested arrays become JSON strings |
| Serialization | Each object is mapped to a row, missing keys emit empty cells |
| Encoding | Output is UTF-8 with a BOM so Excel detects the encoding correctly |

**Delimiter options:** comma (RFC 4180), semicolon (common in European locales), tab (TSV — useful for pasting directly into Google Sheets).

## Common Use Cases

- **Salesforce / HubSpot exports:** API responses are JSON arrays. Convert to CSV and open in Excel for reporting.
- **Airtable / Notion data migration:** Export as JSON, convert to CSV, import into the target app.
- **Log analysis:** Server log exports from AWS CloudWatch or Datadog often arrive as JSON arrays.
- **Google Sheets import:** Paste the CSV output directly into a sheet or use File → Import.
- **Database seed files:** Generate a CSV from a JSON fixture to seed a SQL database via COPY or LOAD DATA.
- **Finance teams:** Accounting exports from Stripe, Square, or Shopify sometimes return JSON — convert to CSV for reconciliation.

## Frequently Asked Questions

**Can I convert CSV back to JSON?**
Not with this tool — that direction is handled by a dedicated CSV-to-JSON converter. This tool is JSON-in, CSV-out only.

**Why does my CSV have extra quotes around some cells?**
RFC 4180 requires quoting any cell that contains the delimiter character, a newline, or a double-quote. This is correct behavior and Excel/Sheets parse it correctly.

**How do I handle a JSON object at the top level, not an array?**
Wrap it in brackets: `[{ ...your object... }]`. The tool will treat it as a one-row table.

**What encoding does the output use?**
UTF-8 with BOM (byte order mark). The BOM tells Excel to open the file in UTF-8 mode, which prevents garbled characters in names or addresses with accented letters.
