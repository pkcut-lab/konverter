---
toolId: image-to-text
language: en
title: "Image to Text — OCR Converter Online"
headingHtml: "Image to Text — <em>OCR Converter</em>"
metaDescription: "Extract text from images, screenshots, and scanned documents using OCR — free, browser-based, no uploads. Supports JPG, PNG, WebP, and PDF page images."
tagline: "Drop an image and get editable text in seconds. Optical character recognition runs entirely on your device — your images never leave the browser."
intro: "Upload a photo, screenshot, or scanned page and this tool extracts all readable text using optical character recognition (OCR). Processing happens locally in your browser — no file is ever sent to a server."
howToUse:
  - "Click the upload area or drag and drop a JPG, PNG, WebP, or TIFF image."
  - "Select the document language to improve recognition accuracy (default: English)."
  - "Click Extract Text and wait a few seconds while OCR processes the image."
  - "Review the extracted text in the output panel. Click to edit inline if corrections are needed."
  - "Copy all text to clipboard or download as a plain .txt file."
faq:
  - q: "Which image formats are supported?"
    a: "JPG, PNG, WebP, TIFF, and BMP. For best results use high-contrast images at 150 DPI or higher. Very small text (below 10pt equivalent) may not be recognized reliably."
  - q: "Can it read handwriting?"
    a: "Printed text is recognized well. Neat cursive or block handwriting is partially supported, but recognition accuracy drops significantly compared to printed text. For handwritten documents, expect to do more manual correction."
  - q: "My image has text in multiple columns. Will it read them in order?"
    a: "The OCR engine attempts to detect column layout and reads left-to-right, top-to-bottom within each column. Complex multi-column layouts (newspapers, academic papers) may produce text out of reading order and require manual rearrangement."
  - q: "Does the tool preserve formatting like bold or tables?"
    a: "The output is plain text only — no fonts, no table structure, no bold/italic. If you need structured output (Word, HTML, or a re-created table), copy the plain text and reformat it manually."
  - q: "Why is some text missing from the output?"
    a: "Low image resolution, poor lighting, skewed perspective, or decorative fonts reduce OCR accuracy. Try increasing brightness and contrast in your phone's photo editor before running OCR, or re-scan at a higher DPI."
  - q: "Is the tool free for commercial use?"
    a: "Yes. The tool is free with no usage limits, and the underlying OCR engine is open-source under a permissive license — making it suitable for both personal and commercial workflows."
relatedTools:
  - audio-transcription
  - ai-text-detector
  - character-counter
category: text
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This OCR tool reads the pixels of an image and converts recognizable text characters into a plain-text string you can copy, search, and edit. It handles printed documents, screenshots, photos of signs, book pages, receipts, business cards, and more.

The OCR engine is a WebAssembly build of a battle-tested open-source recognition pipeline. It runs entirely in your browser, so image data never leaves your device.

## How Does It Work?

OCR works in a pipeline of image processing stages before any character recognition begins:

```
Image input
  → Grayscale conversion
  → Binarization (Otsu thresholding: separate text pixels from background)
  → Deskew (detect and correct page tilt up to ±15°)
  → Layout analysis (detect paragraphs, columns, text blocks)
  → Line segmentation (split into individual text lines)
  → Word segmentation (split lines into words)
  → Character classification (LSTM neural network → Unicode codepoints)
  → Language model post-processing (word-frequency scoring)
  → Plain text output
```

Language models are loaded on-demand. Selecting "English" loads an ~8 MB LSTM model trained on printed English text. Other languages load separate model files.

## How Does DPI Affect Image Quality?

Image resolution is the single biggest factor in OCR accuracy:

| Source | Typical DPI | Expected Accuracy |
|---|---|---|
| Phone photo (well-lit) | 200–300 | 92–97% |
| Scanner (document mode) | 300 | 96–99% |
| Screenshot (Retina 2x) | 144–288 | 95–98% |
| Screenshot (1x) | 72–96 | 85–93% |
| Scanned fax | 100–150 | 75–88% |

For printed documents, 300 DPI is the practical minimum for reliable accuracy. Scanning at 600 DPI rarely improves accuracy further but increases processing time.

## What Are Common Use Cases?

**Digitizing receipts and invoices.** Photograph a paper receipt and extract the line items and totals to paste into a spreadsheet — much faster than manual retyping, especially for expense reports.

**Copying text from screenshots.** When a website, PDF, or app doesn't allow text selection, take a screenshot and run it through OCR to get selectable, searchable text.

**Extracting quotes from books.** Photograph a page and get the exact quote text in seconds instead of transcribing it by hand. Useful for researchers, students, and writers.

**Making scanned PDFs searchable.** Extract the text from each page image, then use the text to create searchable content or to index the document.

**Reading text in images for accessibility.** Convert image-based text to plain text so it can be read aloud by screen readers or translated by language tools.

## Frequently Asked Questions

**Which image formats are supported?**
JPG, PNG, WebP, TIFF, and BMP. PNG and TIFF are lossless formats that preserve text sharpness, which is why scanned documents saved as PNG generally produce better OCR results than JPEG exports from the same scan. Avoid JPEG quality settings below 80 for documents.

**Can it read handwriting?**
Printed text is where OCR excels. The engine has limited support for neat, well-spaced handwriting — especially block letters — but cursive and informal handwriting produce unreliable results. For important handwritten documents, treat the OCR output as a first draft and expect significant manual correction.

**My image has text in multiple columns. Will it read them in order?**
The layout analysis step detects obvious two-column layouts, but complex magazine or academic paper layouts with multiple interleaved columns, sidebars, and captions often confuse the reading-order logic. For these documents, extract the text and rearrange paragraphs manually.

**Does the tool preserve formatting like bold or tables?**
No. The output is pure plain text — no styling, no table grid, no font attributes. If you need table data, the numbers will appear in the output but without column alignment. Recreating the table structure in Excel or Google Sheets requires manual arrangement.

**Why is some text missing from the output?**
Common causes: resolution too low (under 100 DPI effective), image is blurry or out of focus, text is printed on a dark background without sufficient contrast, or the font is highly decorative. Try increasing the image contrast and brightness before running OCR again.

**Is the tool free for commercial use?**
Yes. There are no usage limits and no account required. The underlying OCR engine is released under a permissive open-source license, which permits commercial use without royalties or attribution requirements.
