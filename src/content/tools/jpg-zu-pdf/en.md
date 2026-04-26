---
toolId: jpg-to-pdf
language: en
title: "JPG to PDF Converter — Merge Images to PDF"
headingHtml: "JPG to <em>PDF</em> Converter"
metaDescription: "Convert JPG and PNG images to a PDF document in your browser — no upload needed. Merge multiple images into one PDF, set page size, and download instantly."
tagline: "Drop your JPG or PNG photos, arrange them, and download a single PDF. Everything runs in your browser — no upload, no account required."
intro: "Converting photos and scanned images to PDF is a routine task — submitting receipts, creating a photo book, bundling document scans, or turning a whiteboard photo into a shareable file. This tool converts JPG and PNG images to PDF directly in your browser. You can add multiple images, reorder them, choose page size and orientation, and download the combined PDF instantly. No file leaves your device."
howToUse:
  - "Click or drag one or more JPG or PNG images into the drop zone."
  - "Reorder images by dragging them in the preview grid."
  - "Choose your page size (Letter, A4, or fit-to-image) and orientation."
  - "Adjust margin and image fit settings if needed."
  - "Click Create PDF and download your file."
faq:
  - q: "Can I combine multiple images into one PDF?"
    a: "Yes. Add as many images as you need — each image becomes one page in the PDF. Drag to reorder pages before generating."
  - q: "Does my image get uploaded to a server?"
    a: "No. All PDF generation runs in your browser using a JavaScript PDF library. Your images never leave your device."
  - q: "What page sizes are supported?"
    a: "US Letter (8.5 × 11 in), A4 (210 × 297 mm), Legal (8.5 × 14 in), and fit-to-image (page size matches image dimensions). Portrait and landscape are both available."
  - q: "Can I convert PNG images too?"
    a: "Yes. Both JPG and PNG are supported. Transparent PNG backgrounds are filled with white in the PDF output, since PDF pages are opaque."
  - q: "How large can my images be?"
    a: "The tool processes images up to approximately 50 MB each. Very large images (e.g., high-res scans) may take a few seconds to embed. The resulting PDF file size is primarily determined by the embedded image sizes."
  - q: "Will the image quality be reduced in the PDF?"
    a: "By default, images are embedded at full quality. An optional compression setting is available if you need a smaller file size."
relatedTools:
  - pdf-merger
  - pdf-splitter
  - pdf-compressor
category: document
contentVersion: 1
---

## What This Tool Does

This tool packages one or more JPG or PNG images into a PDF document, running entirely in your browser. Each image becomes one page in the output PDF. You control page size, orientation, margins, and image fit. The PDF is assembled using a client-side JavaScript library — no server receives your files.

## Formula / How It Works

PDF generation in the browser follows this process:

```
Input images (JPG / PNG)
    ↓
Read as ArrayBuffer via FileReader API
    ↓
Decode image dimensions (width × height in pixels)
    ↓
Calculate target page dimensions:
    - Letter: 612 × 792 pt  (8.5 × 11 in at 72 DPI)
    - A4:     595 × 842 pt  (210 × 297 mm at 72 DPI)
    - Fit:    image px → pt at 96 DPI
    ↓
Scale image to fit page (contain or fill mode)
    ↓
Embed image data in PDF JPEG/Flate stream
    ↓
Write PDF structure (header, object catalog, pages, content streams)
    ↓
Output: Blob URL → user download
```

### Page Size Reference

| Page Format | Width × Height | Common Use |
|-------------|---------------|------------|
| US Letter | 8.5 × 11 in (612 × 792 pt) | Standard US documents |
| US Legal | 8.5 × 14 in (612 × 1008 pt) | Legal documents |
| A4 | 8.27 × 11.69 in (595 × 842 pt) | Standard outside US |
| Fit to image | Matches image ratio | Photo output |

### DPI and Image Quality in PDF

```
Embedded image DPI = (image pixels / page size in inches)

Example: 3,000 px wide image on 8.5 in page
DPI = 3,000 / 8.5 ≈ 353 DPI  (print quality)

Example: 800 px wide image on 8.5 in page
DPI = 800 / 8.5 ≈ 94 DPI  (screen quality, may appear soft in print)
```

For crisp printed output, use source images at least 150 DPI at the target page size. For screen-only PDFs, 72–96 DPI is fine.

## Common Use Cases

**Submitting scanned documents and receipts.** Many US government agencies, employers, and financial institutions require documents in PDF format. If you took photos of a signed form, insurance document, or set of receipts with your phone, this tool bundles them into a single PDF ready for email or upload.

**Creating a shareable photo album or report.** A real estate agent photographing a property, a contractor documenting work progress, or a parent putting together a school project can turn a folder of photos into a clean, paginated PDF that's easy to share and print.

**Academic submissions.** Colleges and universities often require scanned handwritten assignments or lab reports as PDF. Students who photograph pages with a phone can quickly combine the images into a single PDF per assignment.

**Bundling whiteboard or chalkboard photos.** Meeting notes photographed on a whiteboard — common in US office and classroom settings — are easily shared as a multi-page PDF rather than a messy ZIP of individual photos.

**Converting smartphone scans to PDF without an app.** Scanning apps on iOS and Android save scans as images or proprietary formats. This tool accepts those exported images and produces a standard PDF, compatible with any viewer, without requiring a subscription app.

## Frequently Asked Questions

### Can I combine multiple images into one PDF?

Yes — that's one of the core use cases. Drop all the images at once, or add them individually. Each image becomes one page in the output document. Drag the thumbnails in the preview grid to reorder pages before generating. The output is a single PDF file containing all pages in the order you specify.

### Does my image get uploaded to a server?

No. PDF generation is handled entirely by a JavaScript library running in your browser tab. Your image data is read from local disk memory and converted to PDF bytes locally. No network request carries your file. You can verify this with browser DevTools — no outbound upload requests occur during processing.

### What page sizes are supported?

The tool supports US Letter (8.5 × 11 inches), US Legal (8.5 × 14 inches), A4 (210 × 297 mm), and a fit-to-image mode that sets the page dimensions to match each image's aspect ratio. Both portrait and landscape orientations are selectable. For most US document submissions, Letter is the correct choice. A4 is the standard in Europe and is increasingly accepted by US institutions for international contexts.

### Can I convert PNG images too?

Yes. PNG files work the same as JPG. One note: if your PNG has a transparent background (alpha channel), the transparency is filled with white in the PDF output. This is correct behavior — PDF page backgrounds are opaque white by default. If you need the transparency preserved visually, place the PNG on the background color you want before converting.

### Will the image quality be reduced in the PDF?

By default, JPEG images are embedded in the PDF at full quality (no additional re-compression). PNG images are embedded as-is or losslessly compressed. An optional "reduce file size" mode applies additional JPEG compression at a configurable quality level — useful when the PDF is for email or web use and file size matters more than maximum quality.

### How large can my images be?

Individual images up to approximately 50 MB are processed without issue. Very large images — such as 50-megapixel DSLR shots or high-resolution flatbed scans — may take a few seconds to process in the browser. The total number of images per PDF is not strictly limited, but very large PDFs (100+ pages of high-res photos) may be slow to generate and produce large file sizes. For print-quality photo books, consider whether the recipient's PDF viewer can handle the file size.
