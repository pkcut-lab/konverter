---
toolId: text-diff
language: en
title: "Text Diff Tool — Compare Two Texts Online"
headingHtml: "Compare Two Texts — <em>Highlight Differences</em> Instantly"
metaDescription: "Paste two text versions and see additions, deletions, and changes highlighted line by line. Free, private, no upload — runs entirely in your browser."
tagline: "Compare any two texts side-by-side or in unified view. Additions in green, deletions in red — instantly, without uploading anything."
intro: "Paste two versions of any text — a contract draft, a code snippet, an email, a document revision — and this tool highlights every addition and deletion. The diff runs locally in your browser, so your content never leaves your device."
howToUse:
  - "Paste or type your original text in the left panel."
  - "Paste your revised text in the right panel."
  - "Choose unified view (single column) or split view (side-by-side)."
  - "Review highlighted changes: green for additions, red for deletions."
  - "Copy the diff output or export it as plain text."
faq:
  - q: "What diff algorithm does this tool use?"
    a: "The tool uses a line-based LCS (Longest Common Subsequence) algorithm — the same approach as the Unix diff command. It identifies the minimal set of changes between two texts."
  - q: "Can I compare code as well as prose?"
    a: "Yes. The tool treats all input as plain text, so it works equally well for source code, JSON, CSV, Markdown, HTML, and any other text-based format."
  - q: "Does my text get sent to a server?"
    a: "No. The entire diff computation runs in your browser using JavaScript. Nothing is transmitted to any server."
  - q: "What is the difference between unified and split view?"
    a: "Unified view shows a single column with additions and deletions interleaved — similar to git diff output. Split view shows original and revised text side-by-side with changes aligned."
  - q: "Can I ignore whitespace differences?"
    a: "Yes — enable the 'Ignore whitespace' toggle to skip differences caused only by spaces, tabs, or line endings. Useful when formatting has changed but content has not."
  - q: "Is there a character or line limit?"
    a: "The tool handles texts up to approximately 500,000 characters without performance issues. For very large files, performance depends on your device's processing power."
relatedTools:
  - character-counter
  - json-diff
  - regex-tester
category: text
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This text diff tool accepts two blocks of text and produces a visual difference report: which lines were added, which were removed, and which stayed the same. It's the browser equivalent of running `diff file1.txt file2.txt` in a terminal — no installation, no account, no upload.

## How It Works

The tool applies a line-based LCS (Longest Common Subsequence) algorithm to find the shortest edit path between your two texts. Each line is classified as:

| Symbol | Color | Meaning |
|---|---|---|
| `+` | Green | Added in the revised version |
| `-` | Red | Removed from the original |
| (none) | Gray | Unchanged in both versions |

For character-level changes within a line, the tool optionally highlights the exact words or characters that changed — useful for spotting single-word edits in long paragraphs.

## What Are Common Use Cases?

**Contract and document review.** Legal teams and editors frequently receive "Track Changes" documents, but not all workflows support Word. Paste the old and new clause text to see exactly what changed — no formatting dependencies.

**Code snippet comparison.** When a colleague sends a revised function or config file in Slack, paste both versions here to see the exact delta before applying the change. Works for any language: Python, SQL, YAML, shell scripts.

**Email and communication drafts.** Collaborating on an important client email? Paste the two draft versions and confirm which sentences changed before sending.

**Before/after SEO content comparison.** Compare two versions of a web page's body copy to verify that all agreed revisions were applied correctly — useful for agencies and content teams.

**API response debugging.** If an API starts returning different JSON, paste two response samples to isolate which fields changed. Combined with the JSON diff tool for structured output.

**Academic writing.** Students and researchers can compare draft versions of papers to ensure advisor feedback was fully incorporated.

## What Output Formats Are Available?

The diff output can be read in two views:

- **Unified view:** A single scrollable list, additions and deletions interleaved. Mirrors the output of `git diff` — familiar to developers.
- **Split view:** Two columns side-by-side, with original on the left and revised on the right. Easier for prose review and non-technical users.

## Häufige Fragen?

**Can I diff more than two versions?**
This tool compares exactly two inputs at a time. For multi-version history, use a version control system like Git, which stores every revision and lets you diff any two commits.

**Why does the tool show the whole line as changed when only one word differs?**
At the line level, any change to a line marks the entire line as modified. Enable word-level or character-level highlighting in the settings panel to see the precise change within the line.

**How does this compare to `git diff`?**
Functionally identical for line-based text comparison. The main difference is that `git diff` operates on committed files, while this tool works on any text you paste — including text that has never been in a version control system.
