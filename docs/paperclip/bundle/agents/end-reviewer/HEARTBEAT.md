# Heartbeat — End-Reviewer (v1.0)

Event-driven: wach wenn CEO ein `tasks/end-review-<slug>-pass<N>.md`-Ticket dispatcht. Ein Tick = ein Review-Pass (1, 2 oder 3) für ein Tool. Typische Dauer: 15–30 min (Sonnet 4.6 + Ultrathinking, max thinking budget). Parallele Reviews sind erlaubt für UNTERSCHIEDLICHE Tools — aber: per CEO §0.1 Sequential-Pipeline läuft sowieso nur 1 Tool gleichzeitig in der Pipeline, also ist das de-facto immer 1 End-Review pro Tick.

## Tick-Procedure (5 Steps)

### 1. Identity + Pass-Number lesen

`SOUL.md` lesen, drei Werte reaktivieren (User-Test-Pflicht, Build-SHA-Pin, Evidence-over-Vibes). Dann Dispatcher-Ticket parsen:

```bash
TICKET_FILE="tasks/end-review-${SLUG}-pass${PASS}.md"
TARGET_SLUG=$(grep -oP '(?<=target_slug:\s)[a-z0-9-]+' "$TICKET_FILE")
PASS_NUMBER=$(grep -oP '(?<=pass_number:\s)\d' "$TICKET_FILE")
BUILD_SHA=$(grep -oP '(?<=build_commit_sha:\s)[a-f0-9]+' "$TICKET_FILE")
TOOL_ID=$(grep -oP '(?<=tool_id:\s)[a-z0-9-]+' "$TICKET_FILE")
```

Bei Pass 2 + 3: zusätzlich `previous_pass_ref` lesen (= Pass-1-Verdict), um Regression-Basis zu haben.

### 2. Build-SHA-Pin (v1.1 STALE-SNAPSHOT-FIX, Pflicht)

**Bevor du irgendetwas reviewest:**

```bash
ORIG_HEAD=$(git rev-parse HEAD)
trap 'git checkout "$ORIG_HEAD" >/dev/null 2>&1' EXIT INT TERM
git checkout "$BUILD_SHA"  # detached HEAD ok
```

Reason: ohne Pin reviewst du HEAD statt des Build-Snapshots, den die Critics gesehen haben. Incident-Reference in SOUL.md.

### 3. Pflicht-Checks durchführen

Reihenfolge fest. Jeder Check schreibt in einen lokalen Counter (Blocker/Improvement/Observation).

**A. Functional + Edge-Cases** (User-Test, Pflicht):
```bash
# Production-Preview starten (NICHT dev — wegen Vite-Transform-Phantom-Regressions)
npm run build
npx http-server dist -p 4399 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null; git checkout "$ORIG_HEAD" >/dev/null 2>&1' EXIT INT TERM
```
Tool-Page öffnen unter `http://localhost:4399/de/<slug>`. Realistische Inputs durchprobieren (mind. 5 Cases: typisch + edge + leer + ungültig + groß). Console-Errors checken.

**B. UX + A11y**: Keyboard-Nav (Tab + Shift+Tab), Focus-Ring sichtbar?, ARIA-Labels da?, Mobile-Touch-Größen ≥44×44 (DevTools). Contrast-Check: AAA ≥7:1 für alle Text-Pärchen.

**C. Performance** (auf prod-preview, nie auf dev):
```bash
npx lighthouse "http://localhost:4399/de/<slug>" --only-categories=performance --output=json --output-path=lh-${SLUG}-pass${PASS}.json --quiet
```
LCP ≤2500 ms, TBT ≤300 ms, CLS ≤0.1, Score ≥0.90.

**D. Security**: 
```bash
grep -E 'innerHTML|eval\(|new Function\(|dangerouslySetInnerHTML' src/lib/tools/${TOOL_ID}.ts src/components/tools/*${SLUG}*.svelte 2>/dev/null
# Erwartung: leer
```

**E. Content + SEO**:
- DE-Locale durchgängig (keine englischen Mischtexte)?
- Disclaimer da wenn Tool sensitiv (Steuer/Recht/Medizin)?
- JSON-LD x4 im rendered HTML?
- Title 30–60, MetaDesc 140–160?

**F. Differenzierung-Check**:
```bash
# Dossier §9 (oder §2.4) Versprechungen lesen — wirklich erfüllt?
DOSSIER="dossiers/${SLUG}/$(ls -1 dossiers/${SLUG}/ 2>/dev/null | sort | tail -1)"
grep -A20 -E "^## 9\\.|§2\\.4 Differenzierung" "$DOSSIER" 2>/dev/null | head -30
```
Wenn Differenzierung versprochen aber nicht implementiert → Blocker.

### 4. Verdict-Datei schreiben

Überschreibe das Dispatcher-Ticket mit deinem Verdict-Body (siehe SOUL.md Output-Kontrakt). YAML-Frontmatter zuerst, dann Markdown-Sections.

Bei Pass 2 + 3: vorherigen Verdict lesen, prüfen ob alle Blocker aus Pass N-1 wirklich gefixt sind. Regressions-Check: wurden Side-Effects in anderen Bereichen erzeugt?

### 5. Routing nach Verdict

| Pass | Verdict | Action |
|---|---|---|
| 1 | clean | Ticket schreiben mit `next_pass: 2`. CEO dispatcht Pass 2. |
| 1 | blockers_found | Ticket schreiben. CEO dispatcht Builder-Rework, dann Pass 1 erneut (max 2 Wiederholungen). |
| 2 | clean | Ticket schreiben mit `next_pass: 3`. CEO dispatcht Pass 3. |
| 2 | blockers_found | Wie 1-blockers, aber rework_counter ist exhausted bei 2/2 → CEO §0.2 escalation. |
| 3 | clean | **Ship-Path:** `freigabe-liste.md` appenden + committen. CEO routet zu §7.5 Ship-Append in completed-tools.md. |
| 3 | blockers_after_3_passes | KEIN Append. Eskalation an User via `inbox/to-ceo/end-review-eskalation-${SLUG}.md`. CEO entscheidet (Park / §7.15 / Refactor). |

### 6. Cleanup (immer, auch bei Fehler)

```bash
kill $SERVER_PID 2>/dev/null
git checkout "$ORIG_HEAD" >/dev/null 2>&1
```

(Wird bereits über `trap` gehandhabt, aber explizit nochmal vor Exit als Belt-and-Suspenders.)

## Tick-Ende

- Verdict-File geschrieben
- Bei Pass-3-clean: freigabe-liste.md committed (`chore(end-reviewer): freigabe <slug> (Pass 3 clean)`)
- Bei Eskalation: inbox/to-ceo/-Eintrag geschrieben
- Status auf `done` setzen via `scripts/paperclip-issue-update.sh --issue-id "$PAPERCLIP_TASK_ID" --status done`

Tick zu Ende. Nächster Tick wartet auf nächsten CEO-Dispatch.
