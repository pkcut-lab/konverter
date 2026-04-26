---
toolId: image-diff
language: en
title: "Image Diff — Visual Comparison Tool"
headingHtml: "Image Diff — <em>Visual Comparison</em>"
metaDescription: "Compare two images side by side and highlight pixel-level differences. Free browser tool — no upload, no account. Ideal for design QA and screenshot testing."
tagline: "Upload two images and instantly see every pixel that changed. Side-by-side view plus a highlighted diff overlay — all processed locally in your browser."
intro: "Drop two images into the tool and get a pixel-accurate difference map in seconds. Changed pixels are highlighted in a configurable color; unchanged areas are dimmed. Nothing is sent to a server."
howToUse:
  - "Upload Image A (the reference or 'before' image) on the left panel."
  - "Upload Image B (the changed or 'after' image) on the right panel."
  - "The diff overlay renders automatically — changed pixels are highlighted in red by default."
  - "Adjust the sensitivity threshold slider to suppress compression artifacts or minor anti-aliasing noise."
  - "Use the view toggle to switch between side-by-side, overlay, and diff-only modes. Download the diff image if needed."
faq:
  - q: "What types of differences does the tool detect?"
    a: "It compares images pixel by pixel, flagging any pixel where the color values differ beyond the sensitivity threshold. This catches layout shifts, missing elements, color changes, text differences, and icon swaps."
  - q: "My images are the same size but the diff shows noise everywhere. Why?"
    a: "JPEG and WebP compression introduces small color shifts even between visually identical images. Raise the sensitivity threshold slider — a value of 10–20 usually eliminates compression noise while preserving meaningful changes."
  - q: "Do both images need to be the same size?"
    a: "Yes. The comparison is pixel-indexed, so both images must have the same width and height. If they differ, the tool will prompt you to resize before comparing."
  - q: "What color is used to highlight differences?"
    a: "Red by default, but you can change the highlight color in the settings panel. Yellow or magenta can be easier to see on images with a lot of red content."
  - q: "Can I compare screenshots taken at different device pixel ratios?"
    a: "Not directly. A 1x screenshot and a 2x screenshot of the same layout will have different dimensions and must be scaled to match before comparing. Export both at the same resolution, then run the diff."
  - q: "Is the diff image downloadable?"
    a: "Yes. Click the Download button to save the diff overlay as a PNG. The diff-only mode (colored pixels on a black background) is especially useful for attaching to bug reports."
relatedTools:
  - background-remover
  - webp-converter
  - contrast-checker
category: image
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

Image Diff highlights every pixel that differs between two images and renders the result as a color-coded overlay. It is designed for design QA, visual regression testing, screenshot comparison, and before/after content audits.

Three view modes are available:
- **Side-by-side** — original images displayed next to each other with synchronized zoom.
- **Overlay** — Image B rendered on top of Image A at adjustable opacity.
- **Diff-only** — only the changed pixels shown against a black background, useful for bug reports.

All processing uses the Canvas API directly in your browser. Images are never uploaded.

## How Does It Work?

The comparison algorithm computes a perceptual difference score for each pixel pair using the YIQ color model (which better reflects human color sensitivity than raw RGB):

```
For each pixel at (x, y):
  ΔR = R_a − R_b
  ΔG = G_a − G_b
  ΔB = B_a − B_b

  ΔY = 0.2126·ΔR + 0.7152·ΔG + 0.0722·ΔB   (luminance delta)
  ΔI = 0.5959·ΔR − 0.2746·ΔG − 0.3213·ΔB   (chroma I)
  ΔQ = 0.2115·ΔR − 0.5227·ΔG + 0.3112·ΔB   (chroma Q)

  delta = sqrt(0.5053·ΔY² + 0.299·ΔI² + 0.1957·ΔQ²)

  if delta > threshold → mark pixel as different
```

This approach is based on the same perceptual model used in the widely adopted `pixelmatch` library. The threshold value (0–255) is user-adjustable.

## How Does the Sensitivity Threshold Work?

| Threshold | What It Filters |
|---|---|
| 0 | Every single bit difference — maximum sensitivity |
| 10–20 | JPEG/WebP compression artifacts |
| 30–50 | Minor anti-aliasing and sub-pixel rendering differences |
| 70+ | Only significant structural or color changes |

## What Are Common Use Cases?

**UI regression testing.** Compare a staging screenshot against the production baseline after a deployment. Even a 1px layout shift shows up immediately in the diff overlay.

**Design handoff QA.** Verify that a developer's implementation matches the Figma/Sketch mockup by exporting both at the same resolution and running a diff.

**A/B test visual audits.** Screenshot both variants of a landing page and confirm that only the intended element changed — useful when the change should be invisible to users.

**Content change tracking.** Compare PDF page exports or website screenshots between two dates to document what changed for compliance or legal records.

**Print pre-flight checking.** Compare a client-approved proof against the production-ready file to catch last-minute text or color changes before sending to the printer.

## Frequently Asked Questions

**What types of differences does the tool detect?**
Any pixel-level change: moved elements, color tweaks, text rewrites, icon replacements, missing images, shadow changes, border adjustments. If it changed how it looks, the diff will catch it. The one thing it doesn't do is tell you *why* something changed — for that, you need to inspect the source code.

**My images are the same size but the diff shows noise everywhere. Why?**
JPEG and WebP encoders introduce lossy compression that shifts individual pixel values even when the image looks identical to the human eye. Increasing the threshold to 10–20 eliminates most of this noise. If you need zero-noise diffs, compare PNG exports instead of JPEG.

**Do both images need to be the same size?**
Yes. The comparison maps pixel (x, y) in Image A to pixel (x, y) in Image B. If the dimensions don't match, the coordinates don't align and the diff is meaningless. Export both images at the same exact pixel dimensions before comparing.

**What color is used to highlight differences?**
Red by default. You can change the highlight color in the settings panel. For images with predominantly red content (product photos with red backgrounds, for example), switch the highlight to yellow or magenta so changed pixels remain visible.

**Can I compare screenshots taken at different device pixel ratios?**
Not directly. A standard 1x screenshot at 1280×800 and a Retina 2x screenshot at 2560×1600 of the same page will differ in dimensions. Scale one of them down (or the other up) to match before running the diff.

**Is the diff image downloadable?**
Yes. The Download button saves the current diff overlay as a PNG. Use diff-only mode when attaching to a GitHub issue, Jira ticket, or Slack thread — the colored pixels on a black background are immediately legible without context.
