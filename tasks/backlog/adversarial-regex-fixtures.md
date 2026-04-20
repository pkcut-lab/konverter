# Adversarial Regex-Fixtures für Eval-Harness

**Status:** Backlog · **Scope:** 1–2h Arbeit · **Owner:** TBD

## Trigger

Nach **erstem post-init Tool-Ship** (= Paperclip hat seinen ersten Konverter durch den 4-Rollen-Pipeline geschleust und das Tool ist live). **Nicht kalendarisch** — wir bauen Evals, wenn wir ein echtes Produktions-Signal haben, nicht präventiv.

## Problem

Die 6 File-Checks in `scripts/eval-runner.mjs` sind pure strukturelle Regex-Regeln. Aktuelle Fixtures (20 synthetic + 5 real-history) treffen die Regex-Kern-Patterns wortwörtlich → F1=1.0 deterministisch, macro_f1 ebenfalls. Das ist korrekt, aber das Eval sagt damit **nichts** über Robustheit gegen ungewöhnliche Formulierungen aus, die Real-World-Content produzieren könnte.

Solange Detection-F1 auf echten pre-fix Blobs exakt stimmt (commit `920751b`), ist das kein Blocker. Aber sobald ein live-Tool durchs Pipeline läuft, sollten wir die Harness mit echten Corner-Cases aus Content-Produktion härten.

## 5 Edge-Case-Kandidaten

Jeder Kandidat testet eine Regex-Lücke, die auf Design-Fixtures nie getriggert wird, aber in organisch geschriebenem Content realistisch vorkommen kann.

### 1. Hex-Code in HTML-Attribut

Aktuell: `c3-hex` excluded nur inline-code-spans (`` ` ... ` ``) und fenced code blocks. Ein `<span style="color:#FF0000">` oder `<img alt="Schloss #A1B2C3">` mitten in Prosa triggert die Regex, sollte aber erlaubt sein (HTML-Kontext, nicht Design-Token-Bruch).

**Fixture:** `<img alt="Icon #FF0000">` in Body → runner reports `c3-hex` → annotation says `failing_checks: []`. Expected: FP → macro-F1 sinkt.

### 2. NBSP in nested Markdown-Table

Aktuell: `c11-nbsp` scannt Body als Plaintext. In einer Tabelle wie `| 12 kg | 26 lb |` (Zelle mit regular space) triggert die Regel — aber manche Autoren bauen Tabellen mit `\u00A0` in manchen Zellen und regular space in anderen, ohne dass das SEO-kritisch ist (Tabellen-Rendering normalisiert).

**Fixture:** Tabelle mit mixed NBSP/regular-space. Annotation: was ist hier richtig? Policy-Decision nötig.

### 3. Unicode-Dash-Varianten in H2-Related-Closer

Aktuell: `c7-related` regex `Verwandte\s+[\p{L}-]+-Tools`. Wenn ein Autor schreibt `## Verwandte Längen–Tools` (en-dash `–` statt Hyphen `-`) → regex matcht nicht → c7-related FP-fail.

**Fixture:** `## Verwandte Längen–Tools` (en-dash). Expected per Policy: pass (ist semantisch identisch). Actual: Runner reports `c7-related` → FP → F1 sinkt.

### 4. Zero-Width-Space / Joiner im Word-Count

Aktuell: `c8-words` zählt Wörter per `.split(/\s+/)`. Zero-width-characters (`\u200B`, `\u200C`, `\u200D`) werden nicht als Word-Separator erkannt — ein Body mit `FooBar` wird als 1 Wort gezählt, auch wenn ein ZWSP drin sitzt. Umgekehrt: Wenn ein Autor NBSP statt Space zwischen zwei Wörtern setzt, split-Regex zerlegt nicht → Word-Count sinkt unter 300 obwohl der Content reichhaltig ist.

**Fixture:** 320-Wort-Body mit 25 NBSPs zwischen Wörtern → runner zählt <300 → report `c8-words` → FP.

### 5. Hex-Code in Code-Fence mit Language-Annotation

Aktuell: `stripCodeSpans` strippt ` ``` ... ``` ` und `` ` ... ` ``. Aber Fenced Blocks mit Language-Tag (` ```css `) werden genauso gestrippt — gut. Edge: Indentation-Code-Blocks (4-space-indent ohne Backticks) werden NICHT gestrippt. Ein `#FF0000` in einem 4-space-indented block triggert `c3-hex`.

**Fixture:** Markdown-Body mit 4-space-indented `    background: #FF0000;`. Runner reports `c3-hex` → FP (es ist Code, nur nicht fenced).

## Expected Outcome

Mit diesen 5 Adversarial-Fixtures sollte `macro_f1` auf dem Suite-Run spürbar unter 1.0 fallen (Schätzung: 0.85–0.92, je nach Anzahl der im Runner gefixten vs. bewusst offengelassenen Edge-Cases). Das macht die Metrik **ehrlich** — sie zeigt die tatsächlichen Regex-Lücken, nicht nur die trivialen Treffer.

## Nicht-Ziel

- **Kein** Neuschreiben der Checks als semantic-LLM-Critic. Das ist ein separater Scope (Phase 2: Merged-Critic-Semantic-Layer) und würde den ganzen 6-Check-Katalog ersetzen, nicht härten.
- **Keine** Adversarial-Generation per LLM — wir kuratieren von Hand, damit jede Fixture einen dokumentierten Real-World-Use-Case hat.
- **Keine** False-Negative-Adversarials — diese 5 sind alle **False-Positive**-Targets (Runner trippt fälschlich). False-Negatives (Runner verschweigt eine echte Verletzung) kommen nur aus Real-History, nicht aus synthetic adversarial.

## Link zu verwandten Commits

- `920751b` — 5 real-history Fail-Fixtures (legit Detection-Test gegen echte pre-fix Blobs)
- `39c701b` — per-check-F1-Metrik (binary + micro + macro + Schwellen 0.85/0.90)
