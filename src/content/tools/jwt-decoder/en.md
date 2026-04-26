---
toolId: jwt-decoder
language: en
title: "JWT Decoder — Decode JSON Web Tokens"
headingHtml: "JWT Decoder — <em>Instant Token Inspection</em>"
metaDescription: "Paste any JWT and instantly decode the header, payload, and signature. Inspect claims like exp, iat, and sub — runs in your browser, no server required."
tagline: "Decode any JSON Web Token in the browser. See the header, payload, and signature in a readable format — and check expiry at a glance."
intro: "JWTs appear everywhere in modern web apps — as auth tokens in Authorization headers, session cookies, and OAuth flows. When something goes wrong with authentication, the fastest way to debug is to inspect the token's claims directly. Paste your JWT here and the tool immediately decodes all three parts: header (algorithm and type), payload (claims like `exp`, `iat`, `sub`, `roles`), and the raw signature bytes. Everything runs in your browser — the token never leaves your device."
howToUse:
  - "Paste the full JWT string (three base64url segments separated by dots) into the input field."
  - "The header and payload sections decode and display automatically as formatted JSON."
  - "Check the Expiry row — the tool converts the `exp` Unix timestamp to a human-readable date and flags expired tokens in red."
  - "Review other standard claims: `iat` (issued-at), `nbf` (not-before), `sub` (subject), `aud` (audience), `iss` (issuer)."
  - "The signature section shows the raw bytes and the algorithm used — note that signature verification requires the secret key."
faq:
  - q: "Can this tool verify the JWT signature?"
    a: "Signature verification requires the secret (for HS256/HS384/HS512) or the public key (for RS256/ES256 and other asymmetric algorithms). This tool decodes the payload without verifying — it is a debugging aid, not a security gate."
  - q: "Is it safe to paste my JWT here?"
    a: "Decoding runs entirely in your browser — no data is sent to any server. That said, never paste production tokens that carry sensitive user data into any online tool if you can avoid it. For high-security environments, decode offline using jwt.io/libraries or the `jwt` CLI."
  - q: "What JWT algorithms are supported?"
    a: "All standard algorithms defined in RFC 7518 can be decoded: HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512, and PS256/PS384/PS512. Decoding is algorithm-agnostic — the header and payload are plain base64url."
  - q: "Why does my exp timestamp show as a long number?"
    a: "The `exp` claim is a Unix timestamp (seconds since 1970-01-01T00:00:00Z). The tool automatically converts it to a local date/time string so you can read it immediately."
  - q: "What does 'token expired' mean?"
    a: "If the current time is past the `exp` claim, the token is no longer valid. The server should reject it with a 401 Unauthorized response. You need to refresh or re-issue the token."
  - q: "My JWT has only two parts. Is that valid?"
    a: "A JWT with an empty signature (unsecured JWT, alg: none) has two parts separated by a single dot. This format is valid per RFC 7519 but is rejected by most production servers for security reasons."
relatedTools:
  - base64-encoder
  - hash-generator
  - url-encoder-decoder
category: dev
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

A JSON Web Token (JWT) is a compact, URL-safe string used to transmit claims between parties. It is the standard token format for OAuth 2.0, OpenID Connect, and most modern session systems. Understanding what is inside a token is essential for debugging authentication failures, checking permission scopes, and auditing expiry windows.

This decoder splits the token at the two dot separators, base64url-decodes each segment, and presents the header and payload as formatted, color-highlighted JSON. The signature segment is displayed as raw bytes and is clearly marked as unverified.

## How Does It Work?

A JWT has the structure: `Base64url(Header) . Base64url(Payload) . Base64url(Signature)`

| Part | Content | Example |
|---|---|---|
| Header | Algorithm + token type | `{"alg":"RS256","typ":"JWT"}` |
| Payload | Claims (registered + custom) | `{"sub":"u_123","exp":1777000000}` |
| Signature | HMAC or RSA/EC signature of header+payload | Raw bytes (unverifiable without key) |

**Registered claim names (RFC 7519):**

| Claim | Full Name | Meaning |
|---|---|---|
| `iss` | Issuer | Who issued the token |
| `sub` | Subject | User or entity the token refers to |
| `aud` | Audience | Intended recipients |
| `exp` | Expiration Time | Unix timestamp after which token is invalid |
| `nbf` | Not Before | Unix timestamp before which token is invalid |
| `iat` | Issued At | Unix timestamp when the token was issued |
| `jti` | JWT ID | Unique identifier for the token |

## What Are Common Use Cases?

- **Auth debugging:** A user reports they are being logged out unexpectedly. Grab their token from the browser's cookies or localStorage and check the `exp` claim to see if it expired.
- **RBAC inspection:** Your app uses role-based access. Decode the token to verify the `roles` or `permissions` claim is present and correct after a login.
- **Third-party API integration:** An external API returns a JWT. Decode it to understand the claims structure before writing parsing code.
- **OAuth flow debugging:** Inspect `id_token` payloads from Google, GitHub, or Microsoft to confirm the `sub` and `email` fields are populated correctly.
- **Security audit:** Review tokens in your system to confirm they use RS256 or ES256 (asymmetric), not HS256 with a weak shared secret.
- **Developer onboarding:** Show new team members what is inside the auth token your API issues.

## Frequently Asked Questions

**Should I use this tool in production debugging?**
Yes, with caution. The tool runs in your browser and sends nothing to a server. However, avoid pasting tokens that contain PII (email, phone, SSN) if your organization has data-handling policies that restrict it. Use a local decoder or the JWT CLI for strict environments.

**What is the difference between decoding and verifying?**
Decoding reads the payload without checking authenticity — anyone can read a JWT. Verification checks that the signature matches the header and payload, proving the token was issued by a trusted party. Always verify on the server before trusting claims.

**Why does alg: none appear in some tokens?**
Unsecured JWTs (alg: none) skip the signature step entirely. They are valid by the spec but should never be accepted by a real server. If you see them in production, it is a critical security misconfiguration.
