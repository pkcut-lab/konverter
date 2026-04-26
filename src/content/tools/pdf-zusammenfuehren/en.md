---
toolId: pdf-merge
language: en
title: "PDF Merger — Combine PDF Files Into One"
headingHtml: "Merge multiple PDFs <em>in any order</em>"
metaDescription: "Combine multiple PDF files into one document — drag to reorder pages before merging. Fully browser-based, no upload to any server, no account needed."
tagline: "Add as many PDFs as you need, drag them into the right order, and merge them into a single document — all locally in your browser."
intro: "Assembling a loan application, compiling a client presentation, or combining chapters into one file? The kittokit PDF Merger lets you add multiple PDFs, reorder them by drag-and-drop, and produce a single merged document in seconds — entirely in your browser, with no file ever leaving your device."
howToUse:
  - "Click 'Add PDFs' or drag multiple files onto the upload zone at once."
  - "Rearrange the PDFs in the desired order by dragging the file cards."
  - "Optionally remove any file you decide not to include by clicking the X on its card."
  - "Click 'Merge' and download the combined PDF when processing finishes."
faq:
  - q: "How many PDFs can I merge at once?"
    a: "There is no hard limit. Because merging runs locally, the practical ceiling is your browser's available memory. Merging 20–30 standard PDFs works smoothly on modern hardware."
  - q: "Is there a file size limit?"
    a: "No server-side limit exists. Large files simply require more browser memory. For best performance, keep total combined input size under 500 MB."
  - q: "Are files uploaded to a server?"
    a: "No. Everything runs in your browser using PDF-lib. Your files never leave your device."
  - q: "Will bookmarks and hyperlinks survive the merge?"
    a: "Hyperlinks within pages are preserved. Top-level bookmarks from individual PDFs are retained as sections in the merged document's outline where the PDF structure allows."
  - q: "Can I merge password-protected PDFs?"
    a: "No. Password-protected PDFs must be unlocked first using our PDF Password Remover, then merged here."
relatedTools:
  - pdf-splitter
  - pdf-compressor
  - pdf-to-jpg
category: document
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

The kittokit PDF Merger combines any number of PDF files into a single document. You control the final page order through a visual drag-and-drop interface — just pick up a file card and drop it where it belongs. When you click Merge, the tool concatenates all pages in the order you set and produces one cohesive PDF ready to download.

Typical workflow at a glance:

| Step | What you do |
|------|-------------|
| Add files | Drag-and-drop or file picker, batch selection supported |
| Reorder | Drag file cards into the desired sequence |
| Exclude | Click X on any card to remove a file before merging |
| Download | One click to get the merged PDF |

There are no page count limits, no watermarks, and no requirement to create an account.

## How It Works

The merger uses [PDF-lib](https://pdf-lib.js.org/), a pure-JavaScript PDF manipulation library, running in a browser Web Worker to avoid blocking the UI:

1. **Parse** — each uploaded PDF is parsed independently to extract its page tree, embedded resources (fonts, images, ICC profiles), and metadata.
2. **Collate** — pages from all documents are appended in sequence to a new PDF document, with embedded resources deduplicated to keep the output file size efficient.
3. **Finalize** — the merged PDF's cross-reference table and trailer are written, and the complete file is made available for download.

The entire operation runs in memory on your device. No temporary files are created on any server.

## What Are Common Use Cases?

**Loan and mortgage applications.** Lenders typically require a bundled PDF of supporting documents: W-2s, pay stubs, bank statements, tax returns. Merge them into one file before uploading to the lender's portal.

**Legal filings.** Attorneys preparing exhibits for court e-filing often need to combine a brief, supporting declarations, and exhibits A through G into one PDF package. Drag-and-drop reordering makes it easy to match the required exhibit order.

**Job applications.** Applicants who want to submit a resume, cover letter, and portfolio samples as a single PDF can merge them here in 30 seconds.

**Academic submissions.** Graduate students submitting a thesis often must combine the main manuscript with appendices, IRB approval forms, and signature pages into one file per university requirements.

**Small business invoicing.** Freelancers and consultants who send multiple invoices or deliverable reports in one batch can merge them for a cleaner client experience.

**Real estate transactions.** Buyers and sellers routinely exchange large document packages — purchase agreements, counter-offers, disclosures, and addenda. Merging into one ordered PDF simplifies review and e-signature workflows in DocuSign or Dotloop.

**Medical record compilation.** Patients gathering records from multiple providers (primary care, specialist, lab) can merge individual report PDFs into one organized file before a referral appointment.

## Häufige Fragen?

**Can I set a specific page order within a single PDF?** The current version merges whole files in the order you arrange them. For rearranging individual pages from a single PDF, split it first using the PDF Splitter, then re-merge the extracted single-page PDFs in the desired sequence.

**Does merging increase file size significantly?** The output size is roughly the sum of the input file sizes. The tool does not re-compress images or re-encode content, so no quality is lost, but there is also no size reduction. If the merged file is too large, run it through the PDF Compressor afterward.

**Are form fields in merged PDFs still interactive?** Form fields from individual PDFs are included in the merge. However, if two source PDFs contain fields with the same name, they may conflict. For complex form merges, consider flattening the forms first.

**What browsers are supported?** Chrome 90+, Firefox 88+, Safari 15.2+, and Edge 90+. The tool requires WebAssembly support, which all modern browsers provide.
