---
toolId: regex-tester
language: en
title: "Regex Tester — Live Pattern Matching"
headingHtml: "Test <em>Regular Expressions</em> Live"
metaDescription: "Test regex patterns instantly with live match highlighting, capture groups, and flag support. JavaScript engine, runs entirely in your browser. Free."
tagline: "Paste your pattern and test string, see matches highlighted in real time — supports flags g, i, m, s and shows capture groups with index offsets."
intro: "Debugging a regular expression without instant feedback is painful. This tool runs your pattern against any test string in real time using JavaScript's native regex engine, highlights every match, and breaks out capture groups so you can verify each part of your pattern independently."
howToUse:
  - "Type or paste your regular expression into the Pattern field (without surrounding slashes)."
  - "Select any flags you need: g (global), i (case-insensitive), m (multiline), s (dotAll)."
  - "Paste your test string into the input area below."
  - "Matches highlight instantly — hover over a match to see its index and capture groups."
  - "Adjust the pattern and watch the results update with every keystroke."
faq:
  - q: "Which regex engine does this tool use?"
    a: "JavaScript's built-in RegExp engine (ECMAScript standard). This means it supports lookaheads, lookbehinds (ES2018+), named capture groups, and Unicode property escapes — but not PCRE-only features like possessive quantifiers or recursive patterns."
  - q: "What does the 'g' flag do?"
    a: "The global flag tells the engine to find all matches in the string instead of stopping after the first one. Without 'g', only the first match is returned."
  - q: "How do I match a literal dot or parenthesis?"
    a: "Escape it with a backslash: \\. matches a literal period, \\( matches a literal opening parenthesis. Unescaped, . matches any character except newline and ( starts a group."
  - q: "What are capture groups and how do I read them?"
    a: "Parentheses in a regex create capture groups: (\\d+) captures one or more digits. The tool shows each group's matched value alongside the full match. Named groups use (?<name>...) syntax."
  - q: "Why does my pattern match differently in Python or PHP?"
    a: "Different languages use different regex flavors. JavaScript's engine differs from PCRE (Python, PHP) and .NET in subtle ways — atomic groups and possessive quantifiers are not supported in JS. Always test in the language you're deploying to."
  - q: "How do I match across multiple lines?"
    a: "Use the 'm' (multiline) flag so ^ and $ match the start and end of each line, not just the whole string. Use the 's' (dotAll) flag if you need . to match newline characters."
relatedTools:
  - text-diff
  - json-formatter
  - character-counter
category: dev
contentVersion: 1
---

## What This Tool Does

The Regex Tester provides a live sandbox for JavaScript regular expressions. Paste a pattern and a test string, and the tool highlights every match in real time — no page reload, no button press. Capture groups are extracted and labeled so you can inspect each part of a complex pattern independently.

## How It Works

The tool feeds your pattern and flags directly into JavaScript's `RegExp` constructor and runs `String.prototype.matchAll()` (or `exec()` in a loop for stateful iteration). Each match object contains:

- **Full match** — the entire substring that matched
- **Index** — the zero-based position in the source string
- **Capture groups** — numbered (`$1`, `$2`) and named (`groups.name`) sub-matches

Everything runs in your browser. Your pattern and test data never leave your machine.

## Flag Reference

| Flag | Name | Effect |
|---|---|---|
| `g` | Global | Return all matches, not just the first |
| `i` | Case-insensitive | `A` matches `a` |
| `m` | Multiline | `^` / `$` match line boundaries |
| `s` | DotAll | `.` matches `\n` and `\r` |
| `u` | Unicode | Enable full Unicode matching |
| `d` | Indices | Include start/end indices per group (ES2022) |

## Common Use Cases (US-Centric)

**Validating US phone number formats** — US phone numbers appear in dozens of formats: `(555) 867-5309`, `555-867-5309`, `5558675309`. A regex like `\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}` matches all variants. Test every format before deploying to a form validator.

**Parsing log files** — Server logs from Apache, Nginx, AWS CloudFront, and Cloudflare Workers follow structured but messy formats. Build a pattern against a sample line, verify capture groups extract IP, timestamp, status code, and path correctly, then port it to your log-parsing script.

**Extracting data from HTML or CSV** — Quick scraping jobs often start with a regex. Test your pattern against a sample before running it across thousands of rows.

**Form validation** — ZIP code (`\d{5}(-\d{4})?`), SSN (`\d{3}-\d{2}-\d{4}`), email, and credit card patterns all benefit from live testing before going into production code.

**Find-and-replace in editors** — VS Code, JetBrains IDEs, and Sublime Text all support regex find-and-replace. Prototype the pattern here where you can see matches highlighted, then paste it into your editor.

## FAQ Expansion

**What is the difference between `test()` and `match()`?**
`RegExp.prototype.test(str)` returns a boolean — useful when you only need to know if a pattern matches. `String.prototype.match()` returns the match array. This tool uses `matchAll()` to surface all matches and their groups.

**Why does my regex work in one tool but not another?**
Regex syntax is not fully standardized across languages and tools. JavaScript supports named capture groups (`(?<year>\d{4})`), lookbehind assertions (`(?<=@)\w+`), and Unicode property escapes (`\p{L}`) — features absent or syntactically different in older tools. Always validate in the environment where the code will run.
