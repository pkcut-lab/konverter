---
toolId: json-diff
language: en
title: "JSON Diff — Compare Two JSON Documents"
headingHtml: "JSON Diff — <em>Compare Two JSON Documents</em>"
metaDescription: "Compare two JSON documents and highlight added, removed, and changed keys. Instant diff view for developers debugging API responses, config files, and data."
tagline: "Paste two JSON documents, see exactly what changed — added keys in green, removed in red, changed values highlighted. Runs entirely in your browser."
intro: "Debugging an API response that changed between releases, comparing two config file versions, or verifying that a data migration produced the expected output — all of these require comparing two JSON documents precisely. This tool performs a deep diff of two JSON structures and highlights every difference: added keys, removed keys, and changed values. It runs entirely in the browser; no data leaves your machine."
howToUse:
  - "Paste your original JSON into the left panel."
  - "Paste the updated or comparison JSON into the right panel."
  - "The diff result appears automatically — green for additions, red for deletions, yellow for changes."
  - "Use the tree view to collapse/expand nested objects and focus on specific sections."
  - "Copy or export the diff result as a structured JSON patch if needed."
faq:
  - q: "What counts as a difference in JSON diff?"
    a: "Three types: added keys (present in the right document but not the left), removed keys (present in the left but not the right), and changed values (key exists in both but the value differs — by type, numeric value, string content, or structure)."
  - q: "Does key order matter in JSON diff?"
    a: "No. JSON objects are unordered by spec. Two objects {\"a\":1,\"b\":2} and {\"b\":2,\"a\":1} are identical and will show no diff. Array order does matter — arrays are ordered, so a reordered array shows differences."
  - q: "Does this tool handle nested JSON?"
    a: "Yes. The diff is recursive — it descends into nested objects and arrays at any depth, reporting differences wherever they occur in the tree."
  - q: "What if my JSON is invalid?"
    a: "The tool validates both inputs and highlights JSON syntax errors before running the diff. Fix the indicated errors and the diff resumes automatically."
  - q: "Can I compare JSON arrays at the top level?"
    a: "Yes. Top-level arrays, objects, strings, numbers, and booleans are all valid JSON values and can be diffed."
  - q: "Is this tool private? Does it send my JSON to a server?"
    a: "No data leaves your browser. Both the JSON parsing and diff algorithm run locally in JavaScript. Your data is not transmitted anywhere."
relatedTools:
  - json-formatter
  - json-to-csv
  - text-diff
category: dev
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This tool performs a deep, recursive diff of two JSON documents. It compares them key-by-key (for objects) and index-by-index (for arrays), reporting three types of differences: added entries, removed entries, and changed values. The result is shown as a color-coded side-by-side view and an optional tree view. No data leaves your browser — both parsing and diffing run in local JavaScript.

## How Does It Work?

The JSON diff algorithm traverses both documents simultaneously using depth-first recursion:

```
function diff(left, right, path = ""):
    if type(left) ≠ type(right):
        → report: CHANGED at path (type mismatch)
        return

    if isPrimitive(left):
        if left ≠ right:
            → report: CHANGED at path (value differs)
        return

    if isObject(left):
        allKeys = union(keys(left), keys(right))
        for key in allKeys:
            if key not in left: → report: ADDED at path.key
            if key not in right: → report: REMOVED at path.key
            else: diff(left[key], right[key], path + "." + key)

    if isArray(left):
        for i in 0..max(left.length, right.length):
            if i >= left.length: → report: ADDED at path[i]
            if i >= right.length: → report: REMOVED at path[i]
            else: diff(left[i], right[i], path + "[" + i + "]")
```

### Difference Types and Display

| Diff Type | Display Color | Meaning |
|-----------|--------------|---------|
| Added | Green | Key/value exists in right but not in left |
| Removed | Red | Key/value exists in left but not in right |
| Changed | Yellow/orange | Key exists in both, value differs |
| Unchanged | Gray/neutral | Identical in both documents |

### Array Diffing

Arrays are diffed positionally — index 0 in the left document is compared to index 0 in the right document. This means if an array is reordered (same elements, different order), the tool will report differences at each affected index, not recognize it as a "reorder." For sorted sets stored as arrays, this is expected behavior — the order is semantically significant in JSON arrays.

## What Are Common Use Cases?

**Debugging API response changes between versions.** A backend service is updated and its API response JSON structure changes. Log the response before and after the update, paste both into this tool, and immediately see which fields were added, removed, or changed. This is faster than reading a long diff in a git commit or searching console logs manually.

**Comparing config files across environments.** Development, staging, and production environments often share a base JSON config that diverges slightly. Pasting the `dev.json` and `prod.json` files into this tool instantly shows which keys differ — a critical step before a deployment or incident investigation.

**Verifying data migrations.** After running a database migration, extract a sample document in the old and new schemas and compare them here. Confirm that fields were renamed, transformed, or added correctly and that no expected data was dropped.

**Code review for data contract changes.** API contracts defined in JSON (OpenAPI specs, JSON Schema, package manifests) change over time. During code review, diffing the old and new contract versions reveals breaking changes — removed fields, changed types, or shifted array structures — that might break clients.

**Package.json change analysis.** Node.js projects use `package.json` to track dependencies. Comparing the `package.json` before and after a dependency update shows exactly which packages changed versions, which were added as new dependencies, and which were removed.

## Frequently Asked Questions

### What counts as a difference in JSON diff?

The tool identifies three categories:

1. **Added** — a key exists in the right (updated) document but is absent from the left (original). This includes entirely new objects, new array elements, or new scalar fields.
2. **Removed** — a key exists in the left (original) document but is absent from the right. This catches deprecated fields, dropped array elements, or deleted sections.
3. **Changed** — a key exists in both documents, but the value differs. This catches type changes (string → number), value changes (true → false, "v1" → "v2"), and structural changes (a string field that became an array).

Unchanged keys are shown in neutral gray to provide context around the differences.

### Does key order matter in JSON diff?

For objects: no. JSON objects are inherently unordered by the JSON specification (RFC 8259). `{"a":1,"b":2}` and `{"b":2,"a":1}` are semantically identical, and the diff correctly reports no differences between them.

For arrays: yes. JSON arrays are ordered sequences. `[1,2,3]` and `[3,2,1]` are different arrays, and the diff reports three changed values at indices 0, 1, and 2. If your use case involves unordered sets stored as arrays, you'll need to sort them before diffing.

### Does this tool handle nested JSON?

Yes, with no depth limit. The diff algorithm is recursive — it descends into objects nested inside arrays nested inside objects, at any depth. Each difference is reported with its full path from the root (e.g., `response.data[2].user.address.zip`), making it easy to locate exactly where in the structure the change occurred.

### What if my JSON is invalid?

Both inputs are validated as they're typed. If either document contains a JSON syntax error — an unclosed bracket, a trailing comma, an unquoted key, or any other malformation — the tool highlights the error location and pauses the diff. Fix the syntax error and the diff runs automatically. Common mistakes: trailing commas after the last item (invalid in JSON, valid in JavaScript), single-quoted strings instead of double-quoted, and comments (JSON does not support comments — use JSON5 or strip them first).

### Can I compare JSON arrays at the top level?

Yes. Any valid JSON value is accepted as a top-level input: an object `{...}`, an array `[...]`, a string `"hello"`, a number `42`, a boolean, or `null`. Two top-level arrays are diffed index-by-index as described above.

### Is this tool private? Does it send my JSON to a server?

No data is transmitted. Both JSON parsing and the diff algorithm are implemented in JavaScript and execute locally within your browser tab. You can verify this by opening the browser DevTools Network panel — no requests carrying your JSON payload will appear. This is important for teams working with sensitive data such as production API responses, authentication tokens in config files, or personally identifiable information in data exports.
