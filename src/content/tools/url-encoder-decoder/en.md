---
toolId: url-encoder-decoder
language: en
title: "URL Encoder & Decoder — Percent-Encode Online"
headingHtml: "Encode and <em>Decode URLs</em> — Percent-Encoding Online"
metaDescription: "Encode special characters in URLs to percent-encoded format, or decode encoded URLs back to plain text. Free, instant, runs in your browser."
tagline: "Paste any text or URL — encode it for safe use in query strings, or decode a percent-encoded URL back to readable form. Covers encodeURIComponent and encodeURI modes."
intro: "URLs can only contain a limited set of characters. Everything else — spaces, non-ASCII letters, symbols like &, =, #, and ? — must be percent-encoded before being placed in a URL. This tool encodes and decodes in both directions, and clearly distinguishes between the two JavaScript encoding functions developers frequently confuse."
howToUse:
  - "Paste your text or URL into the input field."
  - "Click 'Encode' to convert special characters to percent-encoded form."
  - "Click 'Decode' to convert a percent-encoded string back to readable text."
  - "Select the encoding mode: 'Component' (for query values) or 'Full URI' (for complete URLs)."
  - "Copy the result with one click."
faq:
  - q: "What is percent-encoding?"
    a: "Percent-encoding (also called URL encoding) replaces characters that are not allowed in URLs with a % followed by the two-digit hexadecimal code for the character's byte value. For example, a space becomes %20 and & becomes %26."
  - q: "What is the difference between encodeURIComponent and encodeURI?"
    a: "encodeURIComponent encodes everything except letters, digits, and - _ . ! ~ * ' ( ). Use it for individual query parameter values. encodeURI leaves URL-structural characters (/ : @ ? & = # $ , ;) intact — use it for a full URL where you want to preserve the structure."
  - q: "When should I use URL encoding?"
    a: "Any time you're putting user-supplied text into a URL — especially query string values, search terms, redirect URLs, or file path segments. Skipping encoding causes broken links and potential security issues."
  - q: "Why does a space sometimes appear as + and sometimes as %20?"
    a: "The + notation for spaces is part of the HTML form encoding standard (application/x-www-form-urlencoded). In standard percent-encoding (RFC 3986), a space is always %20. Both are common; which to use depends on the receiving system."
  - q: "Does URL encoding handle Unicode characters?"
    a: "Yes. Unicode characters are first converted to UTF-8 bytes, then each byte is percent-encoded. For example, the emoji 😀 encodes as %F0%9F%98%80 (four UTF-8 bytes)."
  - q: "Is URL decoding safe to run on untrusted input?"
    a: "Decoding is generally safe for display purposes. However, never pass a decoded URL directly to eval(), a database query, or a filesystem path without additional sanitization — decoding can reveal injection payloads that were hidden by encoding."
relatedTools:
  - base64-encoder
  - hash-generator
  - jwt-decoder
category: dev
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This URL encoder/decoder converts text to percent-encoded format for safe inclusion in URLs — and decodes percent-encoded strings back to human-readable text. It supports two encoding modes that match JavaScript's built-in `encodeURIComponent` and `encodeURI` functions.

## How It Works

The URL specification (RFC 3986) defines which characters are allowed in a URL without encoding:

- **Unreserved:** `A–Z a–z 0–9 - _ . ~`
- **Reserved (structural):** `: / ? # [ ] @ ! $ & ' ( ) * + , ; =`

Any character outside this set must be percent-encoded. The encoder converts each byte to `%XX` where `XX` is the uppercase hexadecimal byte value.

## How Do Encoding Modes Work?

| Mode | Leaves Unencoded | Encodes | Use Case |
|---|---|---|---|
| `encodeURIComponent` | Unreserved chars only | All reserved chars including `/ ? & = # :` | Query parameter values, form fields |
| `encodeURI` | Unreserved + all reserved | Only characters outside both sets (e.g., spaces, non-ASCII) | Complete URLs where structure must be preserved |

**Example — the difference matters:**

Input: `https://example.com/search?q=hello world&lang=en`

- `encodeURIComponent` → `https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den`
  (The entire URL becomes a single encoded blob — correct when passing this URL as a *value* inside another URL.)

- `encodeURI` → `https://example.com/search?q=hello%20world&lang=en`
  (Structure preserved, only the space encoded — correct when you want the URL to remain functional.)

## What Are Common Use Cases?

**Query string parameters.** A search term like `C++ programming` must be encoded as `C%2B%2B%20programming` before appending to a URL. Unencoded `+` characters are interpreted as spaces by some servers.

**Redirect URLs in OAuth.** OAuth flows pass a `redirect_uri` parameter that itself contains a URL. The inner URL must be fully encoded with `encodeURIComponent`: `?redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback`.

**API endpoint construction.** When building a REST API call that includes user-provided search terms, file names, or IDs, always encode the dynamic segments before concatenating them into the URL.

**Decoding obfuscated links.** Phishing emails and spam often use heavily encoded URLs to hide the destination. Paste the encoded URL here to decode it and inspect the actual target before clicking.

**Debugging HTTP requests.** When inspecting network traffic in browser DevTools, URLs in request logs are often percent-encoded. Decode them to read query parameters clearly.

**File path encoding.** File names with spaces or special characters in web URLs must be encoded. `My Report (Final).pdf` becomes `My%20Report%20(Final).pdf` — parentheses are safe in paths but encoded in query values.

## What Are Common Encodings?

| Character | Encoded | Context |
|---|---|---|
| Space | `%20` | All contexts |
| `&` | `%26` | Query values |
| `=` | `%3D` | Query values |
| `+` | `%2B` | Query values |
| `#` | `%23` | Query values |
| `/` | `%2F` | Query values |
| `?` | `%3F` | Query values |
| `@` | `%40` | Query values |

## Frequently Asked Questions

**Is URL encoding the same as HTML encoding?**
No. HTML encoding (also called HTML entity encoding) replaces characters like `<`, `>`, and `&` with `&lt;`, `&gt;`, and `&amp;` for safe display in HTML. URL encoding is a separate standard for safe transmission in URLs. The two serve different purposes and should not be conflated.

**Can I encode an entire JSON object for a query parameter?**
Yes. Serialize the JSON to a string with `JSON.stringify()`, then encode the result with `encodeURIComponent`. The encoded string can be used as a query parameter value. Decode and parse on the receiving end.

**What if my URL is already partially encoded?**
Use the decode function first to bring it back to plain text, verify it looks correct, then re-encode cleanly. Applying encoding to an already-encoded string produces double-encoding (`%2520` instead of `%20`).
