---
toolId: hash-generator
language: en
title: "Hash Generator — MD5, SHA-256, SHA-512"
headingHtml: "Hash Generator — <em>MD5, SHA-256, SHA-512</em>"
metaDescription: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text. Runs entirely in your browser — no data is ever sent to a server. Fast, private, free."
tagline: "Paste text, pick an algorithm, copy your hash. All computation stays in your browser — nothing leaves your machine."
intro: "A cryptographic hash function takes any input — a password, a file's content, an API token, or a log entry — and produces a fixed-length fingerprint called a hash or digest. This tool generates MD5, SHA-1, SHA-256, and SHA-512 hashes directly in your browser. No data is transmitted to any server. The computation runs locally using the Web Crypto API."
howToUse:
  - "Type or paste your text into the input field."
  - "Select the hash algorithm you need: MD5, SHA-1, SHA-256, or SHA-512."
  - "The hash updates in real time as you type."
  - "Click the copy button to copy the hex-encoded hash to your clipboard."
  - "Toggle uppercase/lowercase output if needed for your use case."
faq:
  - q: "What is a hash function?"
    a: "A hash function takes arbitrary input and produces a fixed-size output (the hash or digest). The same input always produces the same hash; even a tiny change in the input produces a completely different hash."
  - q: "Is MD5 safe to use?"
    a: "MD5 is not collision-resistant and should not be used for security purposes such as password storage or document signing. It's still useful for non-security checksums like verifying a file download."
  - q: "Which algorithm should I use?"
    a: "For security-sensitive applications, use SHA-256 or SHA-512. SHA-256 is the most widely adopted standard today — used in TLS certificates, Bitcoin, and most modern software verification."
  - q: "Is my data safe? Does it get uploaded?"
    a: "Your input never leaves your browser. Hashing runs locally via the Web Crypto API — a built-in browser standard. No server receives your data."
  - q: "Can I hash a file?"
    a: "This tool hashes text input. To hash a file, you can paste the file's text contents into the input, or use a command-line tool like sha256sum (Linux/macOS) or CertUtil (Windows)."
  - q: "Why is the hash always the same length for the same algorithm?"
    a: "By design. SHA-256 always outputs 256 bits (64 hex characters). SHA-512 always outputs 512 bits (128 hex characters). This fixed length is what makes hashes useful as fingerprints."
relatedTools:
  - base64-encoder
  - uuid-generator
  - password-generator
category: dev
stats:
  - label: "Algorithms"
    value: "5"
  - label: "Max input"
    value: "unlimited"
  - label: "Processing"
    value: "local"
featureList:
  - "SHA-256, SHA-512, SHA-1, MD5, SHA-3 algorithms"
  - "Real-time hashing while typing"
  - "Large inputs up to several MB supported"
  - "Hex and Base64 output"
  - "No upload — fully client-side"
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This tool computes cryptographic hash digests from text input, supporting four algorithms: MD5, SHA-1, SHA-256, and SHA-512. All computation happens locally using the browser's built-in Web Crypto API — no server receives your input, ever. Results are displayed as lowercase hex strings and can be toggled to uppercase.

## How Does It Work?

A cryptographic hash function H maps an input of arbitrary length to a fixed-length output:

```
H(input) → fixed-length digest
```

The four supported algorithms produce digests of these lengths:

| Algorithm | Output Length | Hex Characters | Status |
|-----------|--------------|----------------|--------|
| MD5 | 128 bits | 32 chars | Broken (not for security) |
| SHA-1 | 160 bits | 40 chars | Deprecated for security use |
| SHA-256 | 256 bits | 64 chars | Standard (recommended) |
| SHA-512 | 512 bits | 128 chars | Stronger, slightly slower |

### Properties of Cryptographic Hash Functions

```
Deterministic:    same input → always same output
One-way:          cannot reverse the hash to get the input
Avalanche effect: one bit changed → completely different output
Collision resistant (SHA-2): infeasible to find two inputs with the same hash
```

### Example — SHA-256

```
Input:  "hello"
SHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

Input:  "Hello"  (capital H)
SHA-256: 185f8db32921bd46d35abb6f5f5b8d57290a3b17cf8f9d9a9e20d949c5d00e3
```

One character change produces an entirely different 64-character hash. This is the avalanche effect.

## What Are Common Use Cases?

**Verifying file downloads.** Software distributors publish SHA-256 checksums alongside their downloads. After downloading, you hash the file and compare against the published checksum. If they match, the file is intact and unmodified. This is standard practice for Linux ISO files, developer SDK downloads, and security-sensitive packages.

**Password storage (understanding the concept).** Modern password systems never store your actual password. Instead they hash it (ideally with a slow adaptive function like bcrypt or Argon2 built on SHA-2 primitives). When you log in, the entered password is hashed and compared to the stored hash. This tool illustrates the concept — use a proper password hashing library for actual authentication systems.

**Data deduplication.** If you're building a system that ingests documents or images, hashing the content gives each unique file a unique identifier. Two files with the same SHA-256 hash are almost certainly identical — this lets you skip storing duplicates.

**API request signing.** Many REST APIs (AWS Signature V4, Stripe webhook verification, GitHub webhooks) use HMAC-SHA-256 to sign requests. Understanding how SHA-256 works helps debug signing issues. You can verify individual components of a signature chain using this tool.

**Quick integrity checks during development.** When copying configuration strings, environment variables, or API tokens between systems, hashing them confirms that the copy-paste transferred correctly — a mismatch in even one character produces a completely different hash.

## Frequently Asked Questions

### What is a hash function?

A hash function takes an input of any length — a single character, a novel, or a raw binary file — and produces a fixed-length output called a digest or hash. The function is deterministic (same input always gives the same output), one-way (you cannot reverse-engineer the input from the hash), and sensitive to small changes (one different character produces a completely different hash). These properties make hashes useful as digital fingerprints.

### Is MD5 safe to use?

MD5 is no longer considered secure for cryptographic purposes. Researchers have demonstrated practical collision attacks — meaning it's possible (with enough computation) to craft two different inputs that produce the same MD5 hash. This breaks integrity guarantees in security-critical contexts like document signing or certificate validation.

MD5 is still fine for non-security use cases like checksumming a file to detect accidental corruption, or generating a cache key where collision resistance isn't required.

### Which algorithm should I use?

For any security-sensitive application (signing, verification, integrity checks in production), use **SHA-256** as your default. It is the current industry standard, used in TLS certificates, Bitcoin mining, JWT signatures, and virtually all modern secure protocols. SHA-512 provides a larger margin but is rarely necessary unless you're working with high-security cryptographic systems.

Avoid SHA-1 for new work — it has known weaknesses and has been deprecated by major CAs and browsers. Avoid MD5 entirely for security purposes.

### Is my data safe? Does it get uploaded?

Your input is never sent anywhere. The tool uses the `crypto.subtle` API — a W3C standard built into all modern browsers — to perform the hash computation locally on your device. No network request is made. You can verify this by turning off your internet connection and using the tool; it will still work.

### Can I hash a file?

This tool accepts text input. For short text files, pasting the contents works directly. For binary files or large files, use a command-line tool:

```bash
# macOS / Linux
sha256sum filename.zip
shasum -a 256 filename.zip

# Windows (PowerShell)
Get-FileHash filename.zip -Algorithm SHA256

# Windows (Command Prompt)
CertUtil -hashfile filename.zip SHA256
```

### Why is the hash always the same length for the same algorithm?

This is a defining property of hash functions — the output length is fixed regardless of input size. SHA-256 always produces 256 bits = 32 bytes = 64 hex characters. SHA-512 always produces 512 bits = 64 bytes = 128 hex characters. Hashing the empty string and hashing a 4 GB file produce the same output length. This predictability is what makes hashes useful as fingerprints and identifiers.
