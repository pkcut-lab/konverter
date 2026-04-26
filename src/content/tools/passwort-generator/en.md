---
toolId: password-generator
language: en
title: "Secure Password Generator — Configurable & Private"
headingHtml: "Generate a <em>strong, random password</em> — entirely in your browser"
metaDescription: "Generate secure, random passwords with configurable length and character sets. Runs 100% in your browser — no server, no storage, no tracking. Free."
tagline: "Set your length and character rules — uppercase, lowercase, numbers, symbols — and get a cryptographically random password instantly. Nothing leaves your browser. Ever."
intro: "A strong password is your first line of defense for any account. This generator uses your browser's built-in cryptographically secure random number generator to produce passwords that are statistically unpredictable — and since everything runs locally, no password is ever transmitted to any server or logged anywhere."
howToUse:
  - "Set the desired password length using the slider or number field (8–128 characters)."
  - "Toggle which character sets to include: uppercase letters, lowercase letters, numbers, and symbols."
  - "Click Generate — a new password appears instantly."
  - "Click the copy button to copy to clipboard, then paste into your password manager or the registration form."
  - "Click Generate again anytime to create a new password without changing your settings."
faq:
  - q: "Is this password generator truly secure?"
    a: "Yes. It uses the Web Crypto API (window.crypto.getRandomValues), which is the same cryptographically secure random number generator that browsers use for TLS and other security-critical operations. It is not the same as Math.random(), which is predictable."
  - q: "Does this tool send my passwords anywhere?"
    a: "No. The generator runs entirely in your browser using client-side JavaScript. No password, setting, or usage data is sent to any server. You can verify this by going offline before generating a password — it works identically."
  - q: "How long should a password be?"
    a: "NIST guidelines (SP 800-63B) recommend at least 8 characters, but 16+ is better practice in 2025. For high-value accounts (banking, email, primary cloud accounts), use 20+ characters. Length matters more than complexity — a random 16-character lowercase string has more entropy than a short mixed-character password."
  - q: "What is the difference between a generated password and a passphrase?"
    a: "A generated password is a random string of characters (e.g. kQ8!m#Rv2LpZ). A passphrase is a sequence of random words (e.g. correct-horse-battery-staple). Passphrases are equally secure when long enough and easier to type and remember. Use this tool for system-generated passwords; use a passphrase generator for passwords you type manually."
  - q: "Should I use a password manager?"
    a: "Yes. Reusing passwords across sites is the leading cause of account compromise after phishing. A password manager (1Password, Bitwarden, Dashlane, Apple Keychain, Google Password Manager) stores unique, random passwords for every site so you only remember one master password."
  - q: "What special characters are included in the symbols set?"
    a: "The default symbol set includes: ! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : ' \" , . < > ? /  \\ `. Some sites block certain symbols — if a registration form rejects your password, regenerate with a narrower character set."
relatedTools:
  - hash-generator
  - uuid-generator
  - base64-encoder
category: dev
stats:
  - label: "Charset"
    value: "94"
    unit: "chars"
  - label: "Max entropy"
    value: "512"
    unit: "bit"
  - label: "Security"
    value: "cryptographic"
featureList:
  - "Cryptographically secure random generator"
  - "Configurable character sets (upper/lower/digits/symbols)"
  - "Password length 4–128 characters"
  - "Entropy display in bits"
  - "No transmission — everything stays in the browser"
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This password generator produces random, configurable passwords using the Web Crypto API — the same cryptographic primitives that secure HTTPS connections. You control the length (8–128 characters) and which character sets are included. Nothing is stored, logged, or transmitted.

## How Cryptographic Randomness Works

Most programming languages offer two types of random number generation:

**Pseudorandom (Math.random()):** Fast, but seeded — meaning a sufficiently powerful attacker who knows the seed could predict the output. Not safe for passwords.

**Cryptographically secure (crypto.getRandomValues()):** Uses entropy collected from hardware events (mouse movement, keyboard timing, CPU jitter) combined with OS-level randomness pools. The output is statistically indistinguishable from true randomness. This is what this generator uses.

The Web Crypto API is standardized across all modern browsers (Chrome, Firefox, Safari, Edge) and is audited as part of browser security reviews.

## What Is Password Entropy?

Entropy measures how unpredictable a password is. Higher entropy = harder to crack.

**Entropy (bits) = log₂(pool_size^length) = length × log₂(pool_size)**

| Character Set | Pool Size |
|--------------|-----------|
| Lowercase only (a–z) | 26 |
| + Uppercase (A–Z) | 52 |
| + Numbers (0–9) | 62 |
| + 32 common symbols | 94 |

### Entropy at Different Length/Complexity Combinations

| Length | Lowercase | Alphanumeric | Full (94 chars) |
|--------|-----------|-------------|-----------------|
| 8 | 37.6 bits | 47.6 bits | 52.4 bits |
| 12 | 56.4 bits | 71.4 bits | 78.6 bits |
| 16 | 75.2 bits | 95.3 bits | 104.9 bits |
| 20 | 94.0 bits | 119.1 bits | 131.1 bits |
| 32 | 150.5 bits | 190.5 bits | 209.7 bits |

**Target: 80+ bits for general accounts; 100+ bits for high-value accounts.**

At 16 characters using the full character set, a password has ~105 bits of entropy. Cracking it at 100 billion guesses per second (an aggressive GPU array) would take longer than the age of the universe.

## What Are Common Use Cases?

### Account Registration

When creating a new account anywhere — social media, shopping sites, forums — generate a unique 16+ character password rather than recycling an existing one. Paste it directly into your password manager to store it.

### Replacing Weak or Reused Passwords

Credential stuffing attacks work because people reuse passwords. If your email address and password from a breached site (check haveibeenpwned.com) are in attacker databases, every other account using the same password is compromised. Generate unique replacements for each.

### API Keys and Service Passwords

System administrators generating shared secrets, database passwords, or API key seeds can use this tool to create high-entropy values quickly. For machine-to-machine secrets, use 32+ characters from the full character set, or use UUID generator for a standard format.

### Wi-Fi Network Passwords (WPA2/WPA3)

WPA2 passphrases support up to 63 characters. A randomly generated 20-character password is far stronger than a memorable word-based passphrase and is typically entered once per device (saved in the keychain). WPA3 SAE raises the bar further, but password length still matters.

### Employee Onboarding and IT Provisioning

IT teams creating initial passwords for new employees should use random generation rather than patterns (FirstName+Year, Company+Random). Initial passwords should be marked as requiring change on first login.

## What Are Password Security Best Practices?

**Use a password manager.** The only way to have unique, random passwords on every site without memorizing them is a password manager. Bitwarden is open-source and free; 1Password and Dashlane offer premium features. Apple Keychain and Google Password Manager work for less complex needs.

**Enable multi-factor authentication (MFA).** A strong password combined with MFA (TOTP app, hardware key, or passkey) means a breached password alone is insufficient to access your account. Enable MFA on email, banking, and any account that stores payment information.

**Do not email or paste passwords in plaintext.** Sending a password over email, SMS, or chat exposes it to interception and logging. Use a secure sharing tool (1Password shared vaults, Bitwarden Send) for temporary sharing.

**Change passwords after a breach.** Monitor haveibeenpwned.com and enable breach alerts in your password manager. When a site you use appears in a breach, change that password immediately — and any other account where you reused it.

**Longer beats complex.** A random 20-character lowercase password (75 bits of entropy) is harder to crack than an 8-character mixed-case password with symbols (52 bits). NIST's current guidance deprioritizes mandatory complexity rules in favor of length and avoiding known breached passwords.

## What Characters Are Supported?

| Set | Characters | Count |
|-----|-----------|-------|
| Lowercase | a b c d e f g h i j k l m n o p q r s t u v w x y z | 26 |
| Uppercase | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z | 26 |
| Numbers | 0 1 2 3 4 5 6 7 8 9 | 10 |
| Symbols | ! @ # $ % ^ & * ( ) _ + - = [ ] { } \| ; : ' " , . < > ? / \\ ` | 32 |
| **Full combined** | | **94** |

Note: Some password policies exclude ambiguous characters (l, 1, I, O, 0) to prevent transcription errors. If you need to read or type the password manually, consider enabling an "exclude ambiguous" option.

## Häufige Fragen?

**What is the maximum secure password length?**

Most password managers and authentication systems support at least 64 characters; many support 128 or more. NIST recommends that sites allow passwords up to at least 64 characters. Longer passwords are strictly better — there is no security downside to a 64-character password.

**Can I trust a browser-based password generator?**

Yes, if it uses window.crypto.getRandomValues and does not transmit data. Browser-based generators have one key advantage: no installation required and no third-party executable to trust. The trade-off is that you need to verify the tool uses crypto APIs rather than Math.random(). This generator does.

**What is the difference between a password and a passkey?**

A passkey is a newer FIDO2/WebAuthn credential stored on your device (phone, laptop, hardware key). It uses public-key cryptography — no password is ever transmitted to the server. Passkeys are increasingly supported by Google, Apple, Microsoft, and major websites. For sites that support passkeys, they are more secure than even a random password.
