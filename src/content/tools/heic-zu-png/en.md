---
toolId: "heic-to-png"
language: "en"
title: "Convert HEIC to PNG — Lossless, Local, No Upload"
metaDescription: "Convert HEIC and HEIF files to lossless PNG in your browser — no upload, GDPR-compliant. Perfect for web design, screenshots, and images with transparency."
tagline: "Convert iPhone HEIC photos to lossless PNG — batch folders, no upload, 100% private"
intro: "Convert HEIC and HEIF files from iPhone, iPad, and Mac directly in your browser to the lossless PNG format. Ideal for web design, screenshots, images requiring transparency, and applications that require exact pixel accuracy. No upload, no account required, fully offline-capable."
category: "image"
contentVersion: 1
headingHtml: "Convert HEIC to <em>PNG</em>"
howToUse:
  - "Drag your HEIC files or an entire folder into the drop zone — or click 'Choose files'. On iPhone, you can select multiple photos from your photo library at once."
  - "Optionally adjust resolution and EXIF metadata handling. Default: original size, GPS data removed."
  - "Click 'Convert'. Processing happens entirely locally in your browser — no network access."
  - "Download individual PNG files or all at once as a ZIP archive."
faq:
  - q: "Are my images uploaded to a server?"
    a: "No. All images are processed exclusively locally in your browser. There is no server connection for conversion — you can disable WiFi after the page loads and the tool continues to work fully. Not a single image leaves your device."
  - q: "Why PNG instead of JPG for HEIC conversion?"
    a: "PNG is a lossless format — converting HEIC to PNG adds no quality loss through compression artifacts. This is especially important for: screenshots (text must remain pixel-sharp), images for websites with transparent backgrounds (PNG supports transparency, JPG does not), graphics and illustrations with clean edges, and photos that will be further edited after conversion (multiple processing steps without accumulated quality loss). For compact photos to share, JPG is usually better — the HEIC to JPG converter provides optimal results for that."
  - q: "Is PNG truly lossless when the input is HEIC?"
    a: "The PNG output itself is stored losslessly. However, the HEIC source file is already a lossy format (similar to JPG). The conversion process adds no further quality losses — the result is a PNG file that represents the decoded HEIC image exactly and losslessly. So if you start with a high-quality HEIC source, you get a pixel-accurate PNG output."
  - q: "How large will PNG files be compared to HEIC?"
    a: "PNG files are significantly larger than HEIC or JPG. While HEIC's highly efficient compression produces files of 1–3 MB, the same photo as PNG can be 8–25 MB — depending on image content, resolution, and color depth. PNG uses lossless compression (DEFLATE), which compresses photos with many colors and details much less efficiently than JPG. For most photo sharing purposes, JPG is therefore the better choice."
  - q: "Are photos output with correct rotation?"
    a: "Yes, always. The converter reads the EXIF orientation information from the HEIC file and physically rotates the image during conversion. The result is a PNG file that is visually correctly oriented — regardless of the selected EXIF mode."
  - q: "What happens to GPS data and other EXIF information?"
    a: "By default, GPS coordinates are removed from the image data while other metadata (capture date, camera model) is retained. Note: PNG output has more technically limited EXIF embedding capabilities compared to JPG. GPS data is removed in all modes, as PNG lacks a standardized GPS metadata structure like JPEG EXIF."
  - q: "Can I convert an entire folder of HEIC files?"
    a: "Yes. On desktop systems (Windows, Mac, Linux), you can drag a complete folder into the drop zone. All subfolders are scanned recursively. Results are available as individual downloads or as a ZIP archive."
  - q: "Does the tool work on iPhone?"
    a: "Yes. In Safari on iPhone and iPad, tap 'Choose files' and select multiple photos from your photo library. Conversion runs directly in the browser. Since Safari supports HEIC natively, images are processed particularly quickly."
  - q: "Can I reduce the resolution when converting?"
    a: "Yes. Three options are available in the settings section: 'Original' (full resolution), '4K' (max. 3840 pixels on the longest side), and 'Full HD' (max. 1920 pixels). For PNG especially, we recommend reducing resolution — PNG files at full smartphone resolution can become very large."
  - q: "What is HEIC to PNG best suited for?"
    a: "Recommended use cases: UI screenshots from iPhones for design presentations (pixel accuracy matters), product photos for websites with cutouts and transparent backgrounds (PNG transparency after background removal), images for further editing steps in professional software, and QR code scans or text screenshots where JPG artifacts would be disruptive."
  - q: "What's the difference between HEIC to PNG and HEIC to JPG?"
    a: "PNG is lossless, JPG is lossy. PNG files are significantly larger. For photos you want to share or send, JPG is almost always better. For graphics, screenshots, design assets, and images with transparency, PNG is the right choice. Both tools are available on kittokit."
  - q: "Are Live Photos supported?"
    a: "Only the HEIC image portion is converted. Live Photos consist of a .heic image file and a .mov video file. The tool automatically detects Live Photo pairs and shows a notice. The video file is not converted."
relatedTools: ['background-remover', 'webp-converter', 'heic-to-jpg']
datePublished: '2026-04-29'
dateModified: '2026-04-29'

---

## What Does the HEIC to PNG Converter Do?

This tool converts Apple-format HEIC and HEIF images directly in the browser to lossless PNG. Unlike JPG conversion, PNG stores no compression artifacts — the output file represents the input image as accurately as possible. Ideal for all applications where image quality and pixel accuracy are absolute priorities.

## PNG or JPG — When to Use Which Format?

The choice between PNG and JPG when converting HEIC depends on the intended use:

**Choose PNG when:**
- The image will be further edited after conversion (multiple processing steps without artifact accumulation)
- Transparency is needed (PNG alpha channel; JPG doesn't support transparency)
- Text in the image must be rendered sharply (screenshots, scans)
- The image will be used as an asset in a design project
- Pixel-accurate reproduction is more important than compact file size

**Choose JPG when:**
- The image is shared via email or chat (compact file size)
- The image is embedded on a website (fast load times)
- It's a photo without transparency (JPG is more efficient for photos)
- Storage space or transfer volume is limited

## How Does the HEIC-to-PNG Conversion Work Technically?

The conversion process runs in four steps in the browser:

1. **EXIF Analysis:** Before decoding, an EXIF parser reads the orientation information and optionally other metadata from the HEIC file.

2. **HEIC Decoding:** Safari (iPhone, Mac) uses the native browser capability for HEIC decoding. All other browsers use a decoding library running in the browser via WebAssembly.

3. **Canvas Processing:** The decoded image is drawn onto an HTML Canvas element. Orientation correction and optional scaling happen here.

4. **PNG Export:** `canvas.toBlob('image/png')` exports the result as lossless PNG. No external library is needed for export — this is a native browser function.

## How Large Are PNG Files and How Long Does Conversion Take?

PNG is a storage-intensive format for photos. A typical 12-megapixel iPhone photo results in a PNG file of 15–25 MB. For comparison: as HEIC 1.5–2 MB, as JPG (quality 85) 3–5 MB.

This has practical implications:

- **Batch processing:** With many high-resolution photos, browser processing can take considerable time. Recommendation: reduce resolution to "Full HD" or "4K".
- **ZIP download:** 100 HEIC photos as PNG can result in a ZIP archive of 1–2 GB. Ensure sufficient storage space is available.
- **Web design use:** PNG for websites should be as small as possible. Consider further optimization with a PNG optimization tool after HEIC-to-PNG conversion.

## How Do I Use PNG Transparency After Conversion?

PNG supports a true transparency channel (alpha) as one of the few formats. HEIC photos contain no transparency by default — all pixels are opaque. However, conversion to PNG lays the groundwork for a typical workflow:

1. HEIC → PNG (with this tool)
2. PNG → Remove background (with the [Background Remover](/en/background-remover) tool)
3. PNG with transparent background → continue processing in Photoshop, Figma, GIMP

This workflow is especially relevant for product photography: iPhone photos of products often against a white background, followed by background removal for shop integration.

## What Happens to EXIF Data with PNG Output?

PNG has a technically different metadata structure than JPEG. While JPEG has a standardized EXIF APP1 section, PNG stores metadata in tEXt and iTXt chunks without a unified standard for EXIF data.

In practice this means:

- **Capture date and camera model** are stored in PNG metadata (where technically possible)
- **GPS data** is always removed for privacy reasons — there is no universal EXIF GPS standard for PNG
- **Orientation** is physically corrected in the pixel matrix, not as a metadata tag

## What Are the Best Use Cases for HEIC to PNG?

**UI design and mockups:** Exporting iPhone screenshots in HEIC format for Figma or Sketch — PNG is the standard import there, pixel-accurate display is important.

**Product photography:** Exporting iPhone product photos as PNG, followed by background removal for transparent backgrounds on Shopify or WooCommerce.

**Scientific documentation:** Screenshots of measurement curves, diagrams, or microscope images — JPG artifacts could be misinterpreted as measurement noise; PNG avoids this.

**Quality-conscious archiving:** When HEIC photos should be stored long-term in a format readable by all common programs without introducing further quality losses.

**QR codes and text documents:** A photo of a QR code or document as PNG is sharper than JPG at comparable output size.

## Which Related Tools Are Available?

- **[HEIC to JPG](/en/heic-to-jpg)** — More compact format for photos, perfect for sharing and sending.
- **[Background Remover](/en/background-remover)** — AI background removal for PNG files, locally in the browser.
- **[WebP Converter](/en/webp-converter)** — Convert PNG and JPG to WebP for optimized web display.
