---
toolId: base64-encoder
language: en
title: "Base64 Encoder and Decoder Online"
headingHtml: "Base64 <em>Encoder</em> and Decoder"
metaDescription: "Encode text or binary data to Base64 and decode Base64 strings back to plain text. Fast, free, and runs entirely in your browser — no data sent to servers."
tagline: "Encode or decode Base64 instantly in your browser. No data leaves your device. Perfect for API payloads, email attachments, and dev debugging."
intro: "Paste text or upload a binary file to encode it as Base64, or paste a Base64 string to decode it back to readable text. Everything runs client-side — no upload, no logging."
howToUse:
  - "Choose Encode or Decode mode using the toggle at the top."
  - "Paste your input text (or Base64 string) into the left panel, or drag and drop a file."
  - "The output appears instantly in the right panel."
  - "Click Copy to copy the result to your clipboard, or Download to save it as a file."
faq:
  - q: "What is Base64 used for?"
    a: "Base64 is used to encode binary data (images, PDFs, audio) as plain ASCII text so it can be safely embedded in JSON payloads, HTML data URLs, email attachments (MIME), and HTTP headers. It is not encryption — anyone can decode it."
  - q: "Does Base64 make data secure?"
    a: "No. Base64 is an encoding scheme, not encryption. It simply converts binary data to a printable text format. For security, always encrypt data before encoding it."
  - q: "What is URL-safe Base64?"
    a: "Standard Base64 uses '+' and '/' characters, which have special meanings in URLs. URL-safe Base64 replaces them with '-' and '_' so the encoded string can be placed directly in a URL query parameter without percent-encoding."
  - q: "Why does Base64 output end with '=' signs?"
    a: "Base64 encodes data in 3-byte groups into 4-character chunks. When the input length isn't divisible by 3, padding characters ('=') are added to complete the last chunk. One or two '=' characters at the end are normal."
  - q: "How much does Base64 increase file size?"
    a: "Base64 encoding increases data size by approximately 33%. A 100 KB image becomes roughly 133 KB when Base64-encoded. For large files this overhead matters — use direct binary transfer (e.g., multipart/form-data) when possible."
relatedTools:
  - url-encoder-decoder
  - hash-generator
  - jwt-decoder
category: dev
contentVersion: 1
---

## What This Tool Does

Base64 Encoder/Decoder converts arbitrary binary or text data into a safe, printable ASCII representation — and converts it back. It runs entirely in your browser using the native `btoa()` / `atob()` APIs, so no data is transmitted to any server.

Two modes are available: **Encode** takes raw text or a binary file and outputs a Base64 string. **Decode** takes a Base64 string and outputs the original text or lets you download the reconstructed binary file.

## Formula / How It Works

Base64 maps every 3 bytes of input to 4 printable characters drawn from a 64-character alphabet (A–Z, a–z, 0–9, +, /):

```
Input bytes:  [xxxxxxxx] [yyyyyyyy] [zzzzzzzz]
Group bits:   [xxxxxx] [xxyyyy] [yyyyzz] [zzzzzz]
Map each group to: A-Z (0–25), a-z (26–51), 0–9 (52–61), + (62), / (63)
```

When the input length is not a multiple of 3, padding (`=`) is added:

```
1 remaining byte  → 2 Base64 chars + "=="
2 remaining bytes → 3 Base64 chars + "="
```

URL-safe variant replaces `+` → `-` and `/` → `_` and omits padding.

## Character Set Reference

| Variant | Characters | Padding | Common Use |
|---|---|---|---|
| Standard | A–Z a–z 0–9 + / | = | JSON, MIME, HTML |
| URL-safe | A–Z a–z 0–9 - _ | omitted | JWT, URL params |
| MIME | Standard + line breaks every 76 chars | = | Email attachments |

## Common Use Cases

**Embedding images in HTML/CSS.** Instead of an external request, small icons and logos can be inlined as `data:image/png;base64,...` data URLs. Useful for single-file HTML exports and CSS background images.

**API debugging.** Many APIs (Stripe webhooks, GitHub Actions secrets, AWS SDK credential files) transmit binary payloads as Base64. Paste the encoded value here to inspect the raw content.

**JWT inspection.** JSON Web Tokens are three Base64url-encoded segments. Decode the header and payload segments to read the claims without needing a dedicated JWT library.

**Email attachment headers.** MIME email encodes attachment content in Base64. If you're hand-crafting a raw email or debugging a mail server, you need to encode the attachment binary here first.

**Local storage workarounds.** `localStorage` only stores strings. Encoding a small binary blob (a user-generated canvas export, for example) as Base64 lets you persist it in `localStorage` until a backend is available.

## Frequently Asked Questions

**What is Base64 used for?**
Base64 allows binary data to travel safely through systems designed to handle text. JSON doesn't support raw binary, so API responses often embed images or file data as Base64 strings. Email (MIME) uses it for attachments. HTML uses it for data URLs. It's a universal text-safe envelope for binary content.

**Does Base64 make data secure?**
No. Encoding is not encryption. Anyone who sees the Base64 string can decode it in seconds with any standard tool. If you need to protect the data, encrypt it (AES-256, for example) before encoding it to Base64.

**What is URL-safe Base64?**
Standard Base64 uses `+` and `/`, which are interpreted as special characters in URLs. URL-safe Base64 (RFC 4648 §5) replaces them with `-` and `_`, making the string safe to include directly in a URL query string or path segment without percent-encoding. JWTs use URL-safe Base64 and also strip the trailing `=` padding.

**Why does Base64 output end with `=` signs?**
Base64 processes input in 3-byte groups and outputs 4-character chunks. If the input has 1 or 2 leftover bytes, the encoder adds `=` padding characters to keep the output length a multiple of 4. This is purely a formatting convention — decoders strip the padding before processing.

**How much does Base64 increase file size?**
Every 3 bytes become 4 characters, so the overhead is exactly 4/3 − 1 ≈ 33.3%. A 1 MB binary becomes approximately 1.37 MB as Base64. For small embedded assets (icons under 2 KB) this is usually acceptable. For larger files, use a proper binary transfer mechanism instead.
