---
toolId: hevc-to-h264
language: en
title: "HEVC to H.264 Converter — H.265 to MP4"
headingHtml: "HEVC to <em>H.264</em> Converter"
metaDescription: "Convert HEVC/H.265 videos to H.264 MP4 directly in your browser — no upload, no install. Works with iPhone videos and Apple device recordings instantly."
tagline: "Drop your iPhone or Apple video, get a universally compatible H.264 MP4. All conversion runs in your browser — your file never touches a server."
intro: "Since 2017, iPhones and iPads have recorded video in HEVC (H.265) by default — a format that offers better compression than H.264 but isn't supported everywhere. Windows Media Player, older smart TVs, many web players, and some video editing apps still expect H.264. This tool converts HEVC files to broadly compatible H.264 MP4 directly in your browser using WebAssembly-compiled FFmpeg. Your video never leaves your device."
howToUse:
  - "Click or drag your HEVC/H.265 video file into the drop zone (.mov, .mp4, .hevc)."
  - "Adjust output settings if needed: quality (CRF), resolution, or audio codec."
  - "Click Convert — the browser encodes the file locally using WebAssembly."
  - "Download the finished H.264 MP4 file when the progress bar completes."
faq:
  - q: "What is HEVC / H.265?"
    a: "HEVC (High Efficiency Video Coding), also called H.265, is a video compression standard that delivers roughly twice the compression of H.264 at the same quality. Apple adopted it as the default recording format for iPhones in iOS 11 (2017)."
  - q: "Why doesn't my H.265 video play on Windows?"
    a: "Windows requires a paid codec pack or the HEVC Video Extensions from the Microsoft Store to play H.265 natively. Many users haven't installed it. Converting to H.264 ensures playback on any Windows PC without extra software."
  - q: "Will the video quality be worse after conversion?"
    a: "H.264 at a reasonable quality setting (CRF 18–23) produces excellent results. There is a generation loss because the source is decoded and re-encoded, but at high quality settings it's barely perceptible for most content."
  - q: "How large can the input file be?"
    a: "The limit depends on available browser memory. Most modern desktop browsers handle files up to 2–4 GB. For longer footage, consider splitting the video first."
  - q: "Is my video uploaded to any server?"
    a: "No. The entire conversion runs in your browser via WebAssembly. FFmpeg is compiled to WASM and executed locally. No file data is sent over the network."
  - q: "How long does conversion take?"
    a: "Conversion is CPU-bound and depends on video length, resolution, and your device speed. A 1-minute 1080p clip typically takes 1–3 minutes on a modern laptop."
relatedTools:
  - video-background-remover
  - webp-converter
  - webcam-background-blur
category: video
contentVersion: 1
---

## What This Tool Does

This tool converts HEVC (H.265) video files to H.264 MP4 — entirely in your browser. It uses FFmpeg compiled to WebAssembly (WASM), which means the encoding runs on your CPU locally, just like a native app, but without requiring any installation. Supported input formats include `.mov`, `.mp4`, and `.hevc` containers carrying H.265 video streams. The output is a standard H.264 MP4 that plays on virtually any device, platform, or video host.

## Formula / How It Works

The conversion pipeline inside the browser looks like this:

```
Input file (HEVC/H.265 stream)
    ↓
Demux: extract raw video + audio streams
    ↓
Decode: HEVC decoder (software) → raw YUV frames
    ↓
Encode: H.264 encoder (libx264 via FFmpeg WASM) → compressed H.264 stream
    ↓
Mux: wrap in MP4 container
    ↓
Output: .mp4 (H.264 video + AAC audio)
```

### Key Encoding Parameters

| Parameter | Default | What It Controls |
|-----------|---------|-----------------|
| CRF (Constant Rate Factor) | 22 | Quality vs. file size. Lower = better quality, larger file. Range: 0–51 |
| Preset | medium | Speed vs. compression efficiency trade-off |
| Audio codec | AAC 128 kbps | Broad compatibility |
| Resolution | Source | Can be scaled down (e.g., 4K → 1080p) |

```
# Equivalent FFmpeg command (runs inside the browser via WASM):
ffmpeg -i input.mov -c:v libx264 -crf 22 -preset medium -c:a aac -b:a 128k output.mp4
```

### Codec Comparison

| Property | H.264 (AVC) | HEVC (H.265) |
|----------|-------------|--------------|
| Compression efficiency | Baseline | ~50% better |
| Browser support | Universal | Partial (Safari, Edge) |
| Hardware decode | Universal | Newer devices only |
| File size at same quality | Larger | Smaller |
| Encoding speed | Fast | Slower |

## Common Use Cases

**Sharing iPhone videos with Windows users.** iPhones record in HEVC by default since iOS 11. When an iPhone user sends a `.mov` file to a Windows user who hasn't installed the HEVC codec pack, they get an error. Converting to H.264 MP4 solves this without any setup on the recipient's end.

**Uploading to video platforms and social media.** Most platforms accept H.264 natively and re-encode to their own formats. While some (YouTube, Vimeo) also accept H.265, others — older social platforms, corporate video portals, learning management systems — still only handle H.264. Converting first ensures the upload succeeds and avoids unexpected transcoding artifacts.

**Editing in older or budget software.** Adobe Premiere Pro and DaVinci Resolve handle HEVC, but older versions, low-end video editors, and lightweight screen recording apps often don't. Converting to H.264 makes footage editable in virtually any video software released in the last 15 years.

**Embedding video on websites.** The HTML5 `<video>` element supports H.264 universally across all major browsers. HEVC browser support is inconsistent — it works in Safari and Edge but not in Firefox. H.264 is the safe choice for web embeds.

**Archiving drone footage for broad access.** Consumer drones (DJI, Autel) offer HEVC recording for more efficient storage. If you're sharing footage with clients or colleagues who may view it on any device, H.264 ensures no compatibility issues.

## Frequently Asked Questions

### What is HEVC / H.265?

HEVC stands for High Efficiency Video Coding. Standardized in 2013 and sometimes called H.265, it's the successor to H.264 (AVC). It delivers roughly the same visual quality as H.264 at about half the bit rate — or equivalent quality in half the file size. Apple adopted HEVC as the default iPhone recording codec in iOS 11 (fall 2017) and macOS High Sierra.

### Why doesn't my H.265 video play on Windows?

Windows 10 and 11 can play HEVC files, but only if you have the correct codec installed. Microsoft distributes the HEVC Video Extensions as a paid add-on from the Microsoft Store ($0.99). Many users don't have it. Additionally, older versions of Windows (7, 8.1) have no HEVC support at all. Converting to H.264 eliminates this dependency entirely.

### Will the video quality be worse after conversion?

Yes, slightly — this is called generation loss, and it's unavoidable when re-encoding video. Every encode introduces minor artifacts because you're compressing an already-compressed signal. However, at a CRF value of 18–22 in libx264, the quality difference compared to the HEVC source is imperceptible for most content on most screens. For archival purposes, keep your original HEVC file and only distribute the H.264 version.

### How large can the input file be?

This depends on your browser and device RAM. Modern Chromium-based browsers (Chrome, Edge) and Firefox typically handle files up to 2 GB comfortably. Files in the 2–4 GB range work on most desktop systems with 8+ GB of RAM. Files larger than 4 GB may cause issues — for those, split the video into segments first using a tool like VLC or FFmpeg natively installed.

### Is my video uploaded to any server?

No. The conversion runs entirely within your browser using FFmpeg compiled to WebAssembly. The WASM binary downloads once when you first load the tool, but your video file is processed entirely in local memory. No upload occurs. You can confirm this by monitoring network activity in browser DevTools — no outbound file transfer will appear during conversion.

### How long does conversion take?

Software H.264 encoding (libx264) is CPU-intensive. Rough benchmarks on a modern laptop (M1 MacBook Air or recent Intel/AMD):

- 1-minute 1080p clip: 1–3 minutes
- 5-minute 1080p clip: 5–15 minutes
- 4K footage: 3–5× longer than 1080p

Encoding speed scales with CPU speed and core count. The browser may use multiple threads via SharedArrayBuffer if your environment supports it. Closing other browser tabs and apps speeds things up on memory-constrained systems.
