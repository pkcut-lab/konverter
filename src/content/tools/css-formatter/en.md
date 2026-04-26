---
toolId: css-formatter
language: en
title: "CSS Formatter, Beautifier & Minifier"
headingHtml: "CSS <em>Formatter</em> & Minifier"
metaDescription: "Format messy CSS into clean, indented code or minify it for production. Free browser tool — paste your CSS and get beautified or minified output instantly."
tagline: "Paste raw or minified CSS and get it back clean and indented — or switch to minify mode to strip whitespace for production. No server, no signup."
intro: "Paste your CSS into the editor and choose Beautify or Minify. The formatter parses and reformats your stylesheet with consistent indentation, one-property-per-line style, and sorted or original property order. The minifier removes all whitespace and comments to shrink file size."
howToUse:
  - "Paste your CSS code into the input panel on the left."
  - "Click Beautify to format the code with clean indentation and line breaks."
  - "Or click Minify to strip all whitespace and comments for production use."
  - "Review the output in the right panel. The byte count and reduction percentage are shown below the output."
  - "Click Copy or Download to save the formatted or minified CSS."
faq:
  - q: "What is the difference between beautify and minify?"
    a: "Beautify (format) expands compressed CSS into human-readable code with indentation, line breaks, and spacing. Minify compresses CSS by removing all unnecessary whitespace, comments, and redundant semicolons to produce the smallest possible file for production delivery."
  - q: "Does the formatter change my CSS logic?"
    a: "No. The formatter only changes whitespace and formatting — it does not reorder selectors, modify property values, or alter specificity. The output is semantically identical to the input. The only exception is comment removal in minify mode."
  - q: "Can I use this to format SCSS or Less?"
    a: "Partially. Standard CSS syntax in SCSS/Less files (nested rules, variables, mixins) will be partially formatted, but SCSS-specific syntax like nesting, `@mixin`, `@extend`, and Less variable syntax may not be parsed correctly. For full SCSS formatting, use a dedicated SCSS formatter or your IDE's built-in formatter."
  - q: "How much does minification reduce file size?"
    a: "Typical CSS files see 15–30% size reduction from minification alone. Files with many comments or heavy whitespace can see reductions up to 40–50%. For maximum compression, combine minification with gzip or Brotli compression on your web server — that typically reduces CSS by an additional 60–80%."
  - q: "Should I ship minified or beautified CSS to production?"
    a: "Always minify for production. Ship a source map alongside the minified file so browser DevTools can show the original formatted code when debugging. Most build tools (Vite, webpack, Parcel) handle this automatically."
  - q: "Does the tool sort CSS properties?"
    a: "An optional 'sort properties' mode alphabetizes properties within each rule block. This is a style preference — it makes diffs cleaner and helps enforce consistency in team codebases, but it does not affect rendering."
relatedTools:
  - json-formatter
  - sql-formatter
  - xml-formatter
category: dev
contentVersion: 1
---

## What This Tool Does

The CSS Formatter parses a stylesheet and outputs it in one of two modes:

- **Beautify** — expands minified or messy CSS into clean, consistently indented code. One property per line, one space after colons, rules separated by blank lines.
- **Minify** — strips all whitespace, comments, and unnecessary syntax to produce the smallest possible CSS for production delivery.

The tool handles standard CSS3, including media queries, custom properties (CSS variables), `@keyframes`, `@layer`, `@supports`, and `calc()` expressions.

## Formula / How It Works

The formatter uses a tokenizer-based parser — not a simple regex replacement — which means it correctly handles edge cases like strings containing braces or colons:

```
Input CSS
  → Tokenize (identify: selectors, at-rules, properties, values, strings, comments)
  → Build AST (Abstract Syntax Tree of rules and declarations)
  → Beautify mode:
      for each rule:
        write selector + " {"
        indent each declaration with 2 or 4 spaces
        write property + ": " + value + ";"
        close "}"
  OR Minify mode:
      strip all whitespace tokens
      remove all comment tokens
      remove last semicolon in each rule block
      collapse adjacent selectors
  → Output string
```

## Beautify Output Format

The default formatting style follows common CSS conventions:

```css
/* Before */
.card{display:flex;flex-direction:column;padding:1rem;background:var(--color-surface)}

/* After (Beautify) */
.card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--color-surface);
}
```

## Minify Comparison

```css
/* Before (formatted, 412 bytes) */
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.nav__link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
}

/* After (minified, 118 bytes — 71% smaller before gzip) */
.nav{display:flex;align-items:center;gap:1rem;padding:0 1.5rem}.nav__link{color:var(--color-text);text-decoration:none;font-size:.9rem}
```

## Common Use Cases

**Debugging minified third-party CSS.** When inspecting a library's stylesheet in browser DevTools, the code is often minified. Paste it here to beautify it before reading or modifying it.

**Cleaning up copy-pasted snippets.** Code snippets from Stack Overflow, documentation, or AI assistants often have inconsistent indentation. Run them through the formatter before adding to your codebase.

**Pre-commit code cleanup.** Before committing CSS to a team repository, format it to ensure consistent style — especially useful when the project doesn't have a CSS linter configured.

**Reducing page load time.** Minify your stylesheet before deploying. A 50 KB formatted CSS file minifies to roughly 40 KB, and with Brotli compression on the server, it delivers as roughly 10–12 KB over the wire.

**Auditing an inherited codebase.** Beautify a minified legacy stylesheet to read, understand, and refactor it. The formatted output is much easier to navigate in a text editor.

## Frequently Asked Questions

**What is the difference between beautify and minify?**
Beautify is for humans — it formats code so developers can read and edit it easily. Minify is for machines — it removes everything unnecessary so browsers load the file faster. Minified CSS is not intended to be edited directly; always keep the formatted source and minify as a build step.

**Does the formatter change my CSS logic?**
No. The formatter is purely cosmetic — it changes whitespace, line breaks, and indentation only. The cascade, specificity, property values, and selector order are all preserved exactly. In minify mode, comments are removed (which is expected), but all functional CSS remains intact.

**Can I use this to format SCSS or Less?**
Standard CSS inside SCSS or Less files formats correctly. SCSS-specific syntax like `@mixin`, `@include`, `@extend`, and nested parent selectors (`&:hover`) may not be handled perfectly by a CSS-only parser. For full SCSS/Less support, use Prettier with the appropriate plugin, or your IDE's built-in formatter (VS Code, for example, formats SCSS natively).

**How much does minification reduce file size?**
Removing whitespace and comments typically saves 15–30% of the raw file size. Combining minification with Brotli compression (used by all major CDNs and modern web servers) reduces CSS payloads by 75–85% compared to the original formatted file. Always enable Brotli or at minimum gzip on your server — minification alone is not enough.

**Should I ship minified or beautified CSS to production?**
Always minify production assets. Include a source map (`.css.map` file) so DevTools can map minified code back to the original formatted source for debugging. Build tools like Vite, webpack, and Parcel generate source maps automatically when you enable minification in their config.

**Does the tool sort CSS properties?**
Alphabetical sorting is available as an opt-in setting. Sorted properties make code reviews easier because reviewers can instantly spot added or removed properties by position rather than scanning line by line. The trade-off is that logical groupings (e.g., positioning properties together) are lost. Decide on a team convention and stick to it consistently.
