---
toolId: pdf-split
language: en
title: "PDF Splitter — Extract or Split Pages Free"
headingHtml: "Split PDFs <em>instantly</em> in your browser"
metaDescription: "Split a PDF into individual pages or extract a specific page range — free, browser-based, no upload required, no account needed. Instant download."
tagline: "Extract a single page, split by range, or burst every page into separate files — all processed locally, never uploaded."
intro: "Need just pages 3–7 from a 40-page report? Or want to break a merged contract into individual documents? The kittokit PDF Splitter handles both in seconds — entirely inside your browser. No file ever leaves your device."
howToUse:
  - "Click 'Choose PDF' or drag and drop your file onto the upload zone."
  - "Preview the page thumbnails and select which pages or ranges to extract."
  - "Choose a split mode: extract a range, extract individual pages, or burst all pages into separate files."
  - "Click 'Split' and download the resulting file(s) as a ZIP or individual PDFs."
faq:
  - q: "Does my PDF get uploaded to a server?"
    a: "No. Processing runs entirely in your browser using PDF-lib. Your file never leaves your device."
  - q: "Can I extract non-consecutive pages?"
    a: "Yes. Enter a comma-separated list such as 1, 3, 7–10 and the tool will extract exactly those pages."
  - q: "What is the maximum file size?"
    a: "There is no hard server limit because the file stays on your device. Performance depends on your browser and available RAM; files up to ~200 MB work well on modern hardware."
  - q: "Can I split a password-protected PDF?"
    a: "You need to unlock the PDF first using our PDF Password Remover tool, then split it here."
  - q: "Will split PDFs retain fonts, images, and hyperlinks?"
    a: "Yes. The splitter copies pages as-is, so all embedded fonts, images, and links are preserved."
relatedTools:
  - pdf-merger
  - pdf-compressor
  - pdf-to-jpg
category: document
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

The kittokit PDF Splitter lets you divide any PDF into smaller pieces without sending the file to a server. Whether you need to extract a single invoice page from a 200-page bank statement, isolate slides from a deck, or break a merged document into its original components, this tool covers every scenario.

Three split modes are available:

| Mode | What it does |
|------|-------------|
| **Range extract** | Pull out pages 5–12 as one new PDF |
| **Page pick** | Select any combination of pages (e.g., 1, 4, 9) |
| **Burst all** | Export every page as its own numbered PDF |

All output files can be downloaded as individual PDFs or bundled into a single ZIP archive.

## How It Works

The tool uses a pure-JavaScript PDF manipulation library, running entirely in your browser via a Web Worker. When you open a file:

1. The library parses the PDF structure in memory.
2. Page thumbnails are rendered so you can visually confirm your selection.
3. On split, the selected pages are copied into new PDF documents with all embedded resources (fonts, images, form fields) intact.
4. The resulting files are made available for download — nothing is stored on any server.

Because computation happens locally, the tool works offline after the initial page load.

## What Are Common Use Cases?

**Legal and contracts.** Attorneys frequently receive multi-contract bundles from opposing counsel. Splitting out individual agreements makes them easier to route for review.

**Medical records.** Patients often download large PDF summaries from patient portals. Splitting lets them share only the relevant lab results with a specialist.

**Tax documents.** W-2s, 1099s, and other tax forms sometimes arrive in a single merged PDF from an employer or financial institution. Burst all pages to get separate files for each form.

**Academic papers.** Extract the methodology section (pages 8–14) from a 60-page research paper for quick reference during a presentation.

**Real estate.** US property disclosure packets routinely run 50–80 pages. Agents can split them into logical sections (inspection report, HOA docs, title report) before forwarding to clients.

**Print-on-demand.** Many POD services require single-page PDF uploads. Burst a chapter PDF into individual pages ready for upload.

## Häufige Fragen?

**Can I reorder pages before splitting?** The current version focuses on extraction. For reordering before merging, use our PDF Merger tool, which supports drag-and-drop page ordering.

**Does splitting reduce image quality?** No. Pages are copied at their original resolution; no re-encoding or compression is applied during the split operation.

**What browsers are supported?** Any modern browser with WebAssembly support works: Chrome 90+, Firefox 88+, Safari 15.2+, Edge 90+.

**Is this tool free?** Yes, completely free with no limits on the number of splits per session.
