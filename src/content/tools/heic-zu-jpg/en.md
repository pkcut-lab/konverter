---
toolId: "heic-to-jpg"
language: "en"
title: "Convert HEIC to JPG — Free, Local, No Upload"
metaDescription: "Convert HEIC and HEIF files to JPG directly in your browser — no server upload, no tracking, GDPR-compliant by design. Single files, batch conversion, and full folder support for iPhone photos."
tagline: "Convert iPhone HEIC photos to JPG instantly — batch folders, no upload, 100% private"
intro: "Convert HEIC and HEIF files from iPhone, iPad, and Mac directly in your browser to the universal JPG format. No account required, no upload to external servers, no cloud processing. Your images never leave your device — privacy by architecture, not by policy."
category: "image"
contentVersion: 1
headingHtml: "Convert HEIC to <em>JPG</em>"
howToUse:
  - "Drag your HEIC files or an entire folder into the drop zone — or click 'Choose files'. On iPhone, you can select multiple photos at once from your photo library."
  - "Optionally adjust quality, resolution, and EXIF metadata handling. Default: high quality, original size, GPS data removed."
  - "Click 'Convert'. All images are processed locally in your browser — no server contact."
  - "Download individual JPG files or all at once as a ZIP archive."
faq:
  - q: "Are my HEIC images uploaded to a server?"
    a: "No. The entire conversion happens locally in your browser — JavaScript processes the files directly on your device. Not a single byte of your images leaves your computer or smartphone. You can disable WiFi after the page loads and the tool continues to work fully. This is the best proof of genuine offline processing."
  - q: "What is the HEIC format and why does Apple use it?"
    a: "HEIC (High Efficiency Image Container) has been Apple's default photo format since iOS 11 (2017). It's based on the HEIF standard (High Efficiency Image File Format) and stores images at half the file size compared to JPG at the same or better quality. A photo that would be 4 MB as a JPG is typically only 1.5–2 MB as HEIC. The downside: Windows, older Android devices, most websites, and many image editors don't natively support HEIC — making conversion to JPG often necessary."
  - q: "Can I convert multiple HEIC files at once?"
    a: "Yes, fully supported. You can select as many files as you want simultaneously, or drag an entire folder into the drop zone. On desktop systems, folders and subfolders are scanned recursively — all HEIC files are found no matter how deeply nested. On iPhone, multi-selection works through the standard media library picker in the browser."
  - q: "How good is the quality of the converted JPG files?"
    a: "Very good to excellent. The 'High' setting corresponds to JPG quality level 92 — the standard used in professional image editing software, virtually indistinguishable from the original. 'Medium' (quality 82) produces smaller files with minimal visible quality reduction. 'Small' (quality 65) is suitable for email attachments and web graphics where file size matters more than perfection."
  - q: "What happens to the EXIF data in my photos?"
    a: "By default, GPS coordinates are removed from the image data, while other EXIF information like capture date, camera model, and exposure settings are preserved. In 'Advanced options' you can choose between three modes: 'No GPS' (default, recommended for privacy), 'Keep all' (full EXIF data in the JPG), or 'Remove all' (clean output without any metadata)."
  - q: "Are photos output with correct rotation?"
    a: "Yes, always. Many HEIC photos are taken in portrait mode but physically stored in landscape orientation — the rotation is only recorded as an EXIF tag. Our converter reads this orientation information before processing and physically rotates the image during conversion. The result is always a visually upright JPG, regardless of the EXIF mode selected."
  - q: "Does the tool work on iPhone and iPad?"
    a: "Yes. On iOS, open the page in Safari, tap 'Choose files' and select multiple photos from your photo library. Conversion happens directly in the browser without any app installation. Older iOS versions can decode HEIC natively — the converter automatically uses the available browser capability. For desktop users (Windows, Linux), a powerful open-source decoder is used that supports HEIC in all browsers."
  - q: "How many files can I convert at once?"
    a: "There is no fixed limit on the number of files. Processing runs sequentially in your browser — the more files and the higher the resolution, the longer conversion takes. For batch processing vacation photos (50–200 images), we recommend 'Medium' quality and optionally 'Full HD' resolution to save memory and time. With very large batches of over 100 high-resolution HEIC files, the browser may slow down on older devices."
  - q: "What's the difference between HEIC and HEIF?"
    a: "HEIF (High Efficiency Image File Format) is the open container standard; HEIC (High Efficiency Image Container) is Apple's specific implementation. For practical purposes they are identical — both file extensions (.heic and .heif) refer to the same format and are supported equally by this tool. Apple uses .heic; some Android devices and cameras use .heif."
  - q: "What are Live Photos and how are they handled?"
    a: "Live Photos are the short video sequences iPhone automatically saves alongside the HEIC photo. The video is saved as a .MOV file with the same filename (e.g., IMG_0001.heic and IMG_0001.mov). Our converter automatically detects Live Photo pairs and shows a notice — but the .MOV video file is not converted, as this is a pure image converter. For video files, use the appropriate video tools."
  - q: "Can I reduce the resolution when converting?"
    a: "Yes. In the settings section you'll find three options: 'Original' (keeps the full resolution), '4K' (scales to maximum 3840 pixels on the longest side), and 'Full HD' (scales to maximum 1920 pixels). Scaling significantly reduces file size, making images suitable for email attachments, websites, or social networks — without noticeable quality loss at normal viewing size."
  - q: "Can I also convert HEIC files directly to PNG?"
    a: "For PNG output, please use our separate [HEIC to PNG](/en/heic-to-png) tool. PNG is lossless and especially suited for graphics, screenshots, and images with transparency. JPG is more compact and better suited for photos you want to share, send by email, or embed on websites."
relatedTools: ['webp-converter', 'background-remover', 'hevc-to-h264']
datePublished: '2026-04-29'
dateModified: '2026-04-29'

---

## What Does the HEIC to JPG Converter Do?

This tool converts Apple-format HEIC (and HEIF) photos entirely locally to the universal JPG format. Processing happens exclusively in your browser — no files are transmitted, no server sees your images. This is what fundamentally distinguishes this tool from most online converters.

Single images, large batches via multi-selection, and complete folders via drag-and-drop are all supported. An automatic EXIF parser reads orientation information and metadata before conversion, so portrait photos are output correctly rotated and optional metadata can be preserved or selectively removed.

## Why Do iPhone Photos Need Converting at All?

Apple has photographed in HEIC format by default since iOS 11 — for good reason: HEIC is more efficient than JPG. The same image quality takes up only half the storage space. A typical iPhone photo that occupies 4–6 MB as a JPG is only 1.5–2.5 MB as HEIC.

The problem arises when sharing: Windows cannot open HEIC natively (without separately installing a codec), most websites don't accept HEIC attachments, many email services automatically convert HEIC to JPG — with uncontrolled quality loss — and older image editors like Photoshop CS6 don't know the format.

The solution: convert HEIC to JPG locally once before sharing your photos.

## How Does Local Conversion Work Technically?

Two paths are available in browsers for HEIC decoding. Safari on iPhone, iPad, and Mac can decode HEIC natively via system-level image processing — the converter uses this built-in browser capability directly. Chrome, Firefox, Edge, and other browsers on Windows and Linux don't natively support HEIC; here a proven open-source library processes HEIC entirely in the browser via WebAssembly.

After decoding, the browser's Canvas API handles further processing: orientation correction via physical rotation, optional scaling, and finally JPG encoding with the selected quality level. The result is a standard-compliant JPG that can be opened by any program, website, or service.

## What Quality Levels Are Available?

**High (Quality 92):** Production-ready output virtually indistinguishable from the original. JPG quality 92 is the standard used in professional image editing software like Lightroom or Capture One. Recommended for print, portfolio, and important personal photos.

**Medium (Quality 82):** A good compromise between file size and quality. Visible artifacts only at heavy magnification or in uniformly colored areas (sky, walls). Recommended for email attachments, WhatsApp, and social networks that apply their own compression.

**Small (Quality 65):** Maximum compression for minimum file size. Clearly visible JPG artifacts at 100% zoom, but well-suited for thumbnails, preview images, and web graphics with flat areas. Not ideal for photos with fine detail or skin tone nuances.

## Why Is This Converter More Private Than Online Alternatives?

The decisive difference from cloud-based converters lies not in the privacy policy but in the architecture: there is no upload endpoint. The website is a pure static site — static HTML, CSS, and JavaScript files without a server backend. When you click "Convert", there is literally no server that could receive your image.

This is especially important for sensitive photos like ID documents, medical records, private holiday photos, or images containing GPS coordinates you don't want to share. GPS data is filtered out by default during conversion — you decide whether metadata is preserved.

## EXIF Data: What's Inside Your Photos?

EXIF metadata (Exchangeable Image File Format) is additional information that your camera or smartphone writes into every image file. This includes:

- **Date and time of capture** — when the photo was taken
- **Camera model** — e.g., "iPhone 15 Pro"
- **GPS coordinates** — the exact location where the photo was taken
- **Exposure settings** — aperture, shutter speed, ISO
- **Image orientation** — portrait, landscape, or rotation

GPS coordinates are particularly privacy-sensitive. If you take a photo of your home with location services enabled, the image contains your exact address to within a few meters. Sending this photo to an unknown recipient shares that information — often without either party realizing it.

Our default "No GPS" mode removes these coordinates before saving, but retains date, camera model, and technical parameters. The "Remove all" mode delivers a clean JPG without any metadata.

## How Do I Convert Hundreds of Photos at Once?

On desktop systems (Windows, Mac, Linux), you can drag a complete folder of HEIC photos into the drop zone. The converter automatically scans the folder and all subfolders, finds all HEIC files — no matter how deeply nested — and presents the complete list for processing.

After conversion, a separate download is offered for each file. With more than one file, the "Download as ZIP" button appears, bundling all converted JPGs in a single compressed archive.

Practical tips for large batches:

- Choose "Medium" quality for batches over 50 photos — this halves processing time
- Use "Full HD" for photos destined for social media, "Original" for archiving
- Progress is shown individually for each file — failed conversions show an error message while successfully processed files can already be downloaded

## What Are the Main Use Cases?

**Job application photos:** iPhone shoots HEIC, the application portal expects JPG. No need to install a separate program: drop the file, convert, done — in under ten seconds.

**Sharing vacation photos:** 300 HEIC photos from a trip — family on Windows can't open them. Drop the folder, click "Convert," download the ZIP, done.

**WhatsApp and social networks:** Although these platforms internally convert HEIC, they do so with quality losses and no control over the parameters. Converting yourself to JPG gives you control over output quality.

**Legal documents with privacy requirements:** Legal correspondence, medical records, ID documents — sending HEIC with GPS data to external tools is a privacy risk. Local conversion eliminates this risk.

**Photo editing:** Older versions of Photoshop, GIMP, Affinity Photo, and Lightroom cannot open HEIC directly. JPG conversion as the first step in an editing workflow.

**E-commerce and websites:** Product photos from iPhone need to be converted to JPG for Shopify, WooCommerce, and WordPress uploads — no cloud service, no privacy issues.

## Which Related Tools Are Available?

- **[HEIC to PNG](/en/heic-to-png)** — Lossless conversion for graphics, screenshots, and images with transparency.
- **[WebP Converter](/en/webp-converter)** — Convert JPG and PNG to WebP for optimized web display.
- **[Background Remover](/en/background-remover)** — Remove image backgrounds locally via AI, without upload.
- **[HEVC to H264](/en/hevc-to-h264)** — Convert iPhone videos in HEVC format to H264 locally.
