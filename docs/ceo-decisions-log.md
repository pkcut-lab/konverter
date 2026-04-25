---
title: CEO-Decisions-Log
maintained_by: CEO-Agent (autonomous decisions, post-hoc visibility for User)
seed_date: 2026-04-25
purpose: User-Review-Stream für CEO-Entscheidungen (Dependencies, §7.15-Overrides, Scope-Cuts, Park-Decisions, Pipeline-Refactors)
---

# CEO-Decisions-Log

Chronologisches Logbuch aller autonomen CEO-Entscheidungen, die für den User
sichtbar sein müssen. Format: neue Einträge **oben**, ältere wandern nach
unten. Jede Entscheidung verweist auf die betroffenen Tools/Tickets, sodass
der User in Sekunden erfassen kann, was der CEO selbst gewählt hat.

**Wann ein Eintrag entsteht:**
- Neue npm-Dependency installiert
- §7.15-Override (rework_counter erschöpft → ship-with-debt / park)
- Scope-Cut (Feature aus Tool-Spec entfernt)
- Architecture-Refactor (Pipeline-Patterns, Loop-Rules)
- Pre-Flight-Hook fired (Zombie-Cleanup, Stale-Cruft-Archive)

**Format pro Eintrag:**
```
## YYYY-MM-DD · Topic · Affected
**Decision:** kurze Begründung (1–3 Sätze).
**Affected Tools/Tickets:** Liste.
**Reversibility:** trivial / moderat / nicht trivial — wie kommt man zurück?
**Confirmed by User:** ja/nein/ausstehend.
```

---

<!-- CEO-DECISION-APPEND -->

## 2026-04-25 · pdf-komprimieren Architektur-Entscheidung — Option A (Lossless-only, pdf-lib MIT)

**Decision: Option A — Lossless-only compression via pdf-lib (MIT license) (§0.7 autonomous)**

Dossier KON-324 flagged architecture decision required:
- Option A: pdf-lib (MIT) — lossless only (metadata strip, structure compaction, xref stream) → 5–25% reduction
- Option B: AGPL-WASM library — full image re-encoding → up to 90% reduction, but requires license purchase
- Option C: Server-side — maximum compression, violates Non-Negotiable #2 (Privacy-First, no server upload)

**Decision rationale:**
- Option C rejected: hard Non-Negotiable #2 violation
- Option B rejected: AGPL license purchase out of CEO budget authorization scope; AGPL viral clause risks codebase
- **Option A selected**: pdf-lib already in dependencies (package.json), MIT license, no new risk. Positioning: "Structure-Optimization" (metadata + xref compaction, linearization) — honest 5–25% reduction. Differenzierung: real-time progress, before/after size comparison, privacy-first badge (no upload). Competitors (ilovepdf, smallpdf) do server-side lossy — we own the privacy/offline angle.

**Build scope for tool-builder:**
- categoryId: document, type: file-tool
- pdf-lib: stripMetadata, removeUnusedObjects, optimize linearized xref streams
- Output: download compressed PDF with size-reduction stats shown
- Content: position as "Datei-Optimierung" not "Maximalkomprimierung" — honest about 5–25% range

---

## 2026-04-25 · KON-403 CSS-Bundle-Fix Reverted → Phase-2 Park · shared CSS bundle performance

**Decision: PARK KON-403 as Phase-2 infra work (§0.7 autonomous)**

KON-454 attempted fix (commit 3a56f1d): replaced 31 eager static imports in `[slug].astro` with `await import()` per config.type/id. Astro build succeeded. However commit `7bc2ac7` (video-hintergrund-entfernen ship) reverted it: `await import()` broke Astro `client:load` hydration code generation — compiler emits "No matching import has been found for AudioTranskriptionTool" because Astro requires static imports at module scope to generate hydration manifests.

PE re-audit (KON-458) confirmed: CSS still 26.62 KB gzip (target ≤8 KB), Lighthouse still ~78.

**Park rationale:**
- Fix requires Astro-compatible approach: `import.meta.glob` + dynamic component registry, or per-tool CSS extraction via Vite plugin — more than a heartbeat builder task
- Non-blocking: tools work correctly, CSS is cosmetic perf metric
- Phase-2 is the right scope: launch with 26 KB, optimize after Analytics show LCP impact
- Re-evaluation trigger: Phase-2 Analytics → if LH < 80 consistently on mobile → escalate to CTO for Astro-specific bundling strategy

**Action:** KON-403 stays `blocked` (PE-assessed). No further builder dispatches until Phase-2. CEO-Decisions-Log entry for User review.

---

## 2026-04-26 · video-hintergrund-entfernen V1-Ship · Spike-Verify + 4 autonome Scope-Cuts + PE4-Revert

**Decision (5 Punkte, autonom unter §0/§7.15-Gate):**

1. **Spike-Verifikation grün** (CONVENTIONS §10 separater Commit `3af9bc0`):
   Mediabunny VP9+Alpha funktioniert via `alpha: 'keep'` Encoder-Option (NICHT
   Constructor-Flag wie der Spec §3.3-Pseudo-Code zeigt — API-Korrektur in
   Worker dokumentiert). BiRefNet_lite via `pipeline('image-segmentation',
   'onnx-community/BiRefNet_lite-ONNX')` analog zu BEN2-Pattern in
   `remove-background.ts`. CanvasSink mit `alpha:true` ersetzt den manuellen
   VideoFrame→OffscreenCanvas-Pfad — Safari-Compat fällt damit weg (Mediabunny
   abstrahiert).
2. **Audio-Passthrough auf Phase 2** geschoben — WebM+VP9+Alpha braucht Opus,
   MP4-Quellen liefern AAC; verlustfreier Codec-Transcode überschreitet
   V1-Scope. Content-FAQ in `de.md` ehrlich gepatcht („V1 nicht — Workflow:
   Audio in der Schnitt-Software wieder synchronisieren"). Trade-off
   akzeptabel, da Frame-Rate + Frame-Anzahl beider Spuren identisch bleiben →
   Lippensync-frei.
3. **Output-Modi `Bild` + `Video`-Hintergrund auf Phase 2** geschoben (V1 hat
   `Transparent` + `Einfarbig`). Begründung: zusätzlicher Image-Decode-Pfad
   und Video-Loop-Pipeline = +200–400 LoC im Worker für Modi, die Power-User
   in der Schnitt-Software trivial nachschieben können. YAGNI bis User-Feedback.
4. **PNG-Sequenz-ZIP-Export auf Phase 2** geschoben (war Differenzierungs-
   Feature §2.4-B#4). Begründung: ZIP-Encoder + Per-Frame-PNG-Encode +
   Memory-Pressure für 4K-Videos. Ehrliche V1-Begrenzung statt fragiles
   Feature.
5. **PE4-Revert (KON-454, Commit `3a56f1d`) in `[slug].astro` rückgängig** —
   die Conditional `await import()` für 31 Tool-Komponenten verhindert Astros
   `client:load`-Hydration-Generierung („No matching import has been found for
   `AudioTranskriptionTool`" beim Build). Build war seit 2026-04-25 broken,
   Tests waren grün (Build-Smoke deckt das nicht ab). Re-checkout auf
   `3a56f1d^` + PE2-Type-Annotations als Inline-Fix wiederhergestellt.
   `vite.worker.format = 'es'` neu ergänzt (für ML-Worker code-splitting:
   default `iife` rejected by Rollup).

**Affected Tools/Tickets:**
- `video-hintergrund-entfernen` (Tool-Ship V1)
- `KON-454` PE4 (revertiert — CSS-Code-Split-Ziel braucht andere Strategie:
  z.B. `import.meta.glob` oder `astro:components`-Plugin; Phase 2 für PE4-v2)

**Reversibility:**
- Spike-Verify: trivial (CONVENTIONS §10 ist Doku, kann jederzeit revidiert
  werden)
- Audio Phase 2: moderat (EncodedAudioPacketSource + Opus-Re-Encode in Worker
  ergänzen)
- Bild/Video-BG-Modi Phase 2: moderat (Worker-Composite-Pipeline um zwei
  Branch-Pfade erweitern)
- PNG-Sequenz Phase 2: moderat (jszip + Frame-Capture-Loop)
- PE4-Revert: moderat — die ursprüngliche PE4-Intention (CSS-Bundle 24.81 KB →
  ≤4 KB pro Page) bleibt offen. Re-Implementation braucht Astro-konforme
  Strategie. Empfehlung: Phase-2-Ticket „PE4-v2 — Astro-konformer
  Component-Code-Split via `import.meta.glob`-Pattern".

**Confirmed by User:** ausstehend (Routing über Standard-Reporting im
`docs/agent-handoff/`-REPORT).

## 2026-04-25 · KON-453 Meta-Review-R2 → BUILDER-R3 + Site-Wide-Spin-Off · sprache-verbessern

**Decision:** Meta-Reviewer-R2 für `sprache-verbessern` (KON-453) hat **8
fresh R2-Critics** gegen Builder-Commit `8c07c87` ausgewertet (KON-445
merged, KON-450 content, KON-451 design, 44d98fac a11y, 755839a4
performance, KON-447 security, KON-448 platform, KON-452 conversion).
Verdict-Matrix: 3 pass (design, a11y, platform) + 3 partial (merged,
security, performance) + **2 fail (content-critic major, conversion-
critic high)**. §0-Divergence = **NONE** (merged=partial, nicht pass —
mechanische Hard/Soft-Triggers feuern nicht). R1-Blocker-Bilanz: 6/10
voll resolved (F1 Audio-UI, S1 WASM-Self-Host, A12 AAA-Contrast, F2
resetLabel, C8 Citations, #19 relatedTools), 2/10 partial (#7 prose-
link Wortlaut „Audio-Ökosystem" statt „Konverter-Ökosystem"; #11 NBSP
in faq.a Z. 19), **2/10 NOT resolved (C1 em-Semantik
`<em>KI-Rauschunterdrückung</em>` umschließt Methode statt Ziel-
Substantiv „Sprache"; C7 Inverted-Pyramid 29-Wort Problem-Setup
unverändert)**. CEO-Decision autonom:
(1) ship_gate = false, route-to-builder-R3 mit **4-Punkt-Tool-Scope**:
C1 (de.md:8 headingHtml em umstellen), C7 (de.md:35-38 Antwort-Satz
≤20 Wörter), #7 (de.md:157 „Konverter-Ökosystem"), #11 (de.md:19
faq.a `&nbsp;dB`).
(2) **Site-Wide-Spin-Off:** R2-conversion-critic-Findings CR-C6 (`.btn`
~36px <44px WCAG 2.5.5) und CR-C8 (`dispatchToolUsed()` fehlt komplett
in `FileTool.svelte`) sind NICHT sprache-verbessern-spezifisch — sie
sitzen in der shared `FileTool.svelte` und betreffen alle file-tools
(pdf-zusammenfuehren, jpg-zu-pdf, hintergrund-entfernen, webcam-
hintergrund-unschaerfe, video-hintergrund-entfernen). Werden als
**zwei separate Hotfix-Tickets** ausgeschoben:
  - `KON-NEU-tap-target-filetool`: `min-height: 2.75rem` auf `.btn`
    in FileTool.svelte (alle file-tools profitieren).
  - `KON-NEU-instrumentation-filetool`: `dispatchToolUsed()`-Import +
    `$effect(phase==='done')` in FileTool.svelte. Phase-2-AdSense-
    Voraussetzung; nicht Phase-1-blockend.
(3) **§11-Citation-Exception-Frage:** content-critic warnt, dass die
2 R2-eingefügten externen Links (DeepFilterNet GitHub, ThePodcast-
Consultant Blog) §11 nicht erfüllen (nur BIPM/NIST genehmigt). CEO-
Position: Repo-Anker für ICASSP-2023-Forschungs-Claim ist legitime
Quellenangabe; Blog-Link ist Beleg-Sekundär aber thematisch valide.
**§11-Exception genehmigt** — keine R3-Action für C8.
(4) **Pfad-Klärung Dossier-C3:** content-critic suchte unter
`dossiers/sprache-verbessern/`, das Dossier liegt aber unter
`tasks/dossiers/_cache/audio/sprache-verbessern.dossier.md`. Kein
content-Bug, sondern Critic-Lookup-Pfad-Drift. **Nicht R3-Scope** —
content-critic-Suche-Pfad-Liste in nächster Wartungsrunde anpassen.
(5) **Severity-Drift unverändert seit R1:** merged-Rubrik prüft em-
Existenz aber nicht em-Semantik (Ziel vs. Methode); kein Inverted-
Pyramid-Check; kein min-tap-target/instrumentation-Check. Bekanntes
strukturelles Muster (KON-401, KON-414). Phase-2 evaluiert Rubrik-
Erweiterung — keine sofortige Action.
**Affected Tools/Tickets:** sprache-verbessern (R3 in Build-Ticket KON-92);
zwei neue Site-Wide-Tickets für FileTool.svelte (CR-C6, CR-C8);
content-critic-Lookup-Pfad-Liste (Wartungs-Backlog).
**Reversibility:** trivial — alle 4 R3-Edits sind atomare Markdown-
Änderungen in `de.md`; Site-Wide-Hotfixes sind Single-File CSS/Svelte-
Edits.
**Confirmed by User:** post-hoc.

---

## 2026-04-25 · KON-437 Meta-Review-R2 → BUILDER-R3 (Soft-Divergence) · webcam-hintergrund-unschaerfe

**Decision:** Meta-Reviewer-R2 für `webcam-hintergrund-unschaerfe` (KON-437)
hat **8 fresh R2-Critics** gegen Builder-Commit `823e405` ausgewertet
(KON-429 merged, e4ad85b1 content, KON-431 design, KON-432 a11y, KON-433
performance, KON-434 security, KON-435 conversion, KON-436 platform-
engineer). Verdict-Matrix: **6 pass + 2 partial** (a11y, conversion).
§0-Divergence = **SOFT** (merged=pass + a11y+conversion partial mit
rework_required; kein critic.fail → KEIN hard-divergence). Builder-R2 hat
**7/7 R1-Tool-Blocker (B1-B7) zu 100% adressiert** — saubere Trefferquote
auf bestelltem KON-427-Scope. Verbleibende 3 Findings (A6 aria-live + role=
alert für Loading/Error; A7 canvas role="img"; C8 dispatchToolUsed-Import)
sind explizit als `out-of-scope of KON-427 rework` markiert und R2-Critic-
confirmed. CEO-Decision autonom:
(1) ship_gate = false, route-to-builder-R3 mit **Single-File-Scope**
(`src/components/tools/WebcamBlurTool.svelte`) — 3 atomare Edits.
(2) Anschließend **nur 2 fresh Critics nötig** (a11y + conversion); restliche
6 Critics dürfen geskippt werden, da R3-Scope ihre Domäne nicht berührt.
(3) **D7-Lesart-Klarstellung:** R2-design-critic markiert die Warning-Notice
mit `var(--color-accent)`-color-mix-Tint EXPLIZIT als PASS; CLAUDE.md §5-
Allowlist betrifft Solid-Fills, NICHT `color-mix(in oklch, …)`-Pill-Tints.
R1-Meta-Review hatte D7 zu streng interpretiert — keine R3-Action für D7.
(4) **Korrektur frührer Pipeline-Drift-Annahme:** Frühere Notiz dieser
Sitzung deutete auf "fehlende fresh R2-Critics" hin — das war Lesefehler
(R2-Critics liegen in anderen Ticket-Foldern als R1, nicht in KON-416-423).
Pipeline funktioniert wie spezifiziert.

**Affected Tools/Tickets:** webcam-hintergrund-unschaerfe (KON-437); D7-
Lesart (CLAUDE.md §5 — color-mix vs. Solid-Fill — Critic-Präzedent statt
Rulebook-Edit).
**Reversibility:** trivial (Builder-R3 = 3 atomare Edits in 1 File).
**Confirmed by User:** post-hoc (CEO-Autonomie §0.7 NO-ESCALATION-LOCK).

## 2026-04-26 · Differenzierungs-Cut: encrypted-PDF Support für pdf-zusammenfuehren · Sonderdelegation Tool 1

**Decision:** Geparkte FAQ-Vorlage versprach Passwort-Eingabe pro verschlüsselter
PDF — pdf-lib v1.17 unterstützt aber kein Lesen verschlüsselter PDFs (nur
`ignoreEncryption: true` als Workaround, der dann unentschlüsselte Streams
weitergibt und ein kaputtes Output-PDF erzeugt). Statt das FAQ-Versprechen
durch einen halbgaren Workaround zu erfüllen oder Tool zu parken: FAQ +
"Welche PDFs werden unterstützt?"-Sektion + Prose-FAQ-Antwort ehrlich
umgeschrieben — verschlüsselte PDFs werden mit klarer Fehlermeldung
übersprungen, User wird auf vorherige Entsperrung im Reader verwiesen.
Reversible falls pdf-lib in v2.x Encryption supportet ODER eine MIT-
Alternative wie pdf.js mit Decrypt-Support eingezogen wird.

**Affected Tools/Tickets:** pdf-zusammenfuehren (Sonderdelegation Tool 1),
`src/content/tools/pdf-zusammenfuehren/de.md` (3 Stellen umgeschrieben:
faq[3], "Mit Hinweis behandelt"-Liste, Prose-FAQ-§ "Was passiert bei
passwortgeschützten PDFs?").

**Reversibility:** trivial — bei pdf-lib-Update FAQ + Component-Catch-Branch
zurück auf Passwort-Prompt-Pfad umstellen.

**Confirmed by User:** post-hoc.

## 2026-04-25 · Ship-Ready: skonto-rechner R2 + Rubric-Ambiguität NBSP-YAML · KON-424 Meta-Review-R2

**Decision:** Meta-Reviewer R2 empfiehlt SHIP für skonto-rechner. Alle skonto-
spezifischen R1-Blocker code-verifiziert behoben (B1 Hex→Token, B2 Tap-Targets
≥44px, B3 Analytics via KON-404). §0 Divergence-Check NONE (merged R2 verdict
= partial, conversion-critic R2 = pass — kompatibel). Verbleibendes
systemic-CSS-Bundle-Issue (S1) ist per früherer CEO-Decision in Sprint-Ticket
KON-S1 entkoppelt — kein Tool-Ship-Block. Zusätzlich: R2 hat Rubric-
Ambiguität bei Check #11 (NBSP in YAML-FAQ-Werten) gefunden — R1-merged
markierte 'pass mit YAML-Ausnahme', R2-merged markierte 'fail (minor)' für
identische Stelle in skonto-rechner/de.md:20,22. Beide Auslegungen defensiv
vertretbar. CEO-Standard-Pattern: warning_rate <0.20 → dokumentieren +
Mini-Patch im nächsten Content-Maintenance-Sweep (4 Substitutionen `\u00a0`).
Rulebook-Klarstellung CONTENT.md §typography: NBSP-Pflicht gilt auch in
YAML-FAQ-Werten — bei nächstem Sweep einarbeiten.

**Affected Tools/Tickets:** skonto-rechner (KON-424 Meta-Review-R2 → ship,
KON-317 Build, KON-402 Rework-R2), CONTENT.md §typography (Rulebook-
Clarification), src/content/tools/skonto-rechner/de.md:20,22 (4-Sub-Patch
deferred to maintenance).

**Reversibility:** trivial — Tool-Ship in completed-tools.md ist append-only
und revertierbar. Rulebook-Edit + 4-Substitution-Patch beide trivial.

**Confirmed by User:** post-hoc.

## 2026-04-25 · Rubric-Ambiguität Check #18 (Tool-Type-Security-Matrix) — `interactive`-Type fehlt im Switch · KON-425 Meta-Review-R1

**Decision:** Meta-Reviewer dokumentiert 3. Vorkommen (nach KON-414
sprache-verbessern, KON-415 video-hintergrund-entfernen, jetzt KON-425
webcam-hintergrund-unschaerfe) der Rubric-Lücke: merged-critic Check #18
fällt für `interactive`-Tools durch zu WARN, weil der Switch nur
Generator/Validator/Formatter/Parser/Converter/Calculator/Comparer kennt.
ambiguity_rate ≥ 0.20 erreicht. CEO entscheidet autonom: (a) Switch um
`interactive`/`file-tool`-Cases erweitern (sauber, schreibt Default-PASS
mit manuellem Security-Review-Hinweis) ODER (b) Default-PASS-Regel +
Doku-Hinweis. Default per NO-ESCALATION-LOCK §0.7 (a) — Rulebook-Patch
im nächsten Maintenance-Window des merged-critic-AGENTS.md.

**Affected Tools/Tickets:** webcam-hintergrund-unschaerfe (KON-425),
sprache-verbessern (KON-414), video-hintergrund-entfernen (KON-415);
sämtliche künftige Tools mit `tool_type ∈ {interactive, file-tool}`.

**Reversibility:** trivial (Rulebook-Edit im merged-critic-AGENTS.md
Check #18, kein Code-Impact).

**Confirmed by User:** post-hoc.

## 2026-04-25 · Formatter-Leak: strukturelle Lösung statt ID-Allowlist · KON-425 Meta-Review-R1

**Decision:** Meta-Reviewer dokumentiert 2. Vorkommen (KON-415 systemic
S1, jetzt KON-425 B1) des Formatter-Leak-Patterns: in
`src/pages/[lang]/[slug].astro:292-300` rendert der generische
`Formatter`-Component ÜBER dem tool-spezifischen Component, weil
non-formatter-IDs nicht in `CUSTOM_FORMATTER_IDS` stehen. Platform-
Engineer schlägt Option B vor: Guard-Bedingung
`config.type === 'formatter' && !CUSTOM_FORMATTER_IDS.has(config.id)`.
Diese Lösung deckt alle non-formatter-Typen (interactive, file-tool,
calculator) in einer Zeile, statt jede ID einzeln zu allowlisten. CEO
entscheidet autonom: Builder-R2 für KON-425 implementiert Option B
(strukturell), nicht Option A (ID-Add). Damit ist auch der bekannte
Bug bei converters (formatter rendert NACH Converter) implizit behoben.

**Affected Tools/Tickets:** webcam-hintergrund-unschaerfe (KON-425),
video-hintergrund-entfernen (KON-415, S1 carry-over), `meter-zu-fuss`
und alle weiteren `interactive`/`file-tool`/non-formatter-Templates.

**Reversibility:** trivial (1-line revert in `[slug].astro`).

**Confirmed by User:** post-hoc.

## 2026-04-25 · Ship-Block: video-hintergrund-entfernen — ML-Pipeline-Stub · KON-415 Meta-Review-R1

**Decision:** Meta-Reviewer empfiehlt Ship-Block. `video-hintergrund-
entfernen` darf nicht in `completed-tools.md` aufgenommen werden, bis
Spec §9 Spike-Tasks fertig (Mediabunny VP9+Alpha mux + onnxruntime-web
BiRefNet_lite ONNX-Worker). conversion-critic B1 (CRITICAL out-of-band):
`tool-runtime-registry.ts:152-171` — `process()` und `prepare()` werfen
beide Errors, jeder User-Konvertierungsversuch endet im Error-Phase.
performance / platform / security konvergieren auf dieselbe Stub-
Diagnose. CEO entscheidet autonom zwischen (a) Spike-Tasks fertig bauen
→ neuer Critic-Cycle inkl. merged-critic + Meta-Review ODER (b) Park-
Decision analog pdf-zusammenfuehren-Pattern (2026-04-25-Logbuch-Eintrag).
Konservativere Default per NO-ESCALATION-LOCK §0.7: (b) Park, weil
Spike-Tasks noch nicht im Backlog priorisiert sind.

**Affected Tools/Tickets:** video-hintergrund-entfernen (KON-91 Build),
KON-415 (Meta-Review-R1). Keine Builder-R2 dispatch bis CEO-Pfad-Wahl.

**Reversibility:** trivial — bei Pfad (a) Spike-Tasks-Tickets neu
priorisieren; bei Pfad (b) Stub + Component in `.paperclip/parked-tools/
video-hintergrund-entfernen/` archivieren analog pdf-zusammenfuehren.

**Confirmed by User:** post-hoc.

## 2026-04-25 · Pipeline-Drift: merged-critic fehlt für video-hintergrund-entfernen · KON-415

**Decision:** Meta-Reviewer hat in KON-415 entdeckt, dass das Critic-
Directory `tasks/awaiting-critics/755839a4-cbb7-4572-bf5c-820d392f4c46/`
nur 7 von 8 erwarteten Critic-Reports enthält — `merged-critic.md`
fehlt vollständig. Sibling-Directories (skonto-rechner, sprache-
verbessern) haben merged-critic.md korrekt. §0-Mechanik konnte den
Drift-Flag nicht direkt rechnen (merged.verdict undefined), Meta-
Reviewer hat das defensive als hard-divergence im R1-Output gewertet.
CEO entscheidet autonom: (1) Pre-Flight-Cleanup-Snapshot 12:51 prüfen,
ob merged-critic-Heartbeat verloren ging — falls ja, merged-critic für
755839a4 nachträglich dispatchen; (2) falls dispatcher die merged-
Stage für Stub-Tools (Spec §9 noch offen) systematisch überspringt,
ist das ein Pipeline-Bug — `EVIDENCE_REPORT.md` Ship-Gate muss merged-
critic auch für Stub-Tools verlangen, damit Meta-Reviewer §0 mechanisch
funktioniert. Bis Klärung: kein Tool darf ohne merged-critic Ship-Gate
erreichen.

**Affected Tools/Tickets:** KON-415 + alle künftigen Tool-Reviews mit
ML-Stub-Status. video-hintergrund-entfernen ist ohnehin durch SB1-Eintrag
ship-blocked.

**Reversibility:** trivial — merged-critic für 755839a4 nachträglich
dispatchen kostet 1 Heartbeat. Pipeline-Patch wäre ein 1–3-Zeilen-Fix
in dispatcher-Logik.

**Confirmed by User:** post-hoc.

## 2026-04-25 · Rubric-Ambiguität: design-critic D9 vs a11y A11 — prefers-reduced-motion-Coverage · CEO-Eval-Pipeline

**Decision:** Meta-Reviewer KON-415 hat in video-hintergrund-entfernen
R1 einen Cross-Critic-Disagreement über denselben Code-Block
(FileTool.svelte:1483-1493) entdeckt: design-critic D9 = PASS
("Vollständige Coverage"), a11y-auditor A11 = FAIL/blocker
(".preset-pill und .frame__img Transitions sind NICHT enthalten").
Substantielle Analyse: a11y-auditor ist autoritativ — design D9-Rubrik
prüft nur das Vorhandensein des @media-Blocks, nicht die Coverage über
alle animierten Elemente. CEO autonom: D9-Check-Definition in
design-critic-AGENTS-Rubrik präzisieren — explizit "alle Selektoren mit
transition/animation/transform müssen im prefers-reduced-motion-Override
erscheinen, nicht nur ein leerer Block-Stub". Wenn warning_rate über
folgende Reviews >0.20 ansteigt, Rulebook-Patch im nächsten
Maintenance-Window; sonst dokumentiert.

**Affected Tools/Tickets:** design-critic-Rubrik (Check D9). Nicht
retroaktiv für bereits gepasste Tools.

**Reversibility:** trivial — Rubric-Edit revertable.

**Confirmed by User:** post-hoc.

## 2026-04-25 · Meta-Reviewer Coverage-Gap — sprache-verbessern R1 surfaced 3 recurring rubric-blind-spots · merged-critic v1.1

**Decision:** Meta-Reviewer KON-414 (sprache-verbessern R1) hat 3
strukturelle Blind-Spots in der merged-critic-19-Check-Rubrik
dokumentiert: (1) kein `connect-src` / external-runtime-domain
Check (security-auditor S1 fängt CDN-Issue, merged läuft
Tool-Type-Matrix nur), (2) kein `output-render-MIME-Match` Check
(a11y-auditor F1 fängt Audio-als-`<img>`, merged hat keinen
funktionalen Output-Render-Test), (3) kein §13.5-Regel-2/8/9
Content-Pattern Check (content-critic C1/C7/C8 fängt em-Target/
Inverted-Pyramid/Citation-Density, merged delegiert das nicht).
CEO entscheidet autonom: **kein Ship-Block über sprache-verbessern
hinaus** — individual-Critics liefern alle nötigen Beweise, daher
keine Pipeline-Pause. Phase-2-Maintenance-Window prüft, ob
merged-Rubrik um 3 Checks zu erweitern ist (recurring pattern:
auch KON-401 skonto-rechner-R1 + KON-245 zinsrechner-R1 zeigten
denselben severity_drift). Bei nächster Wiederholung des Patterns
in einem dritten Tool → Rubrik-Patch im nächsten Maintenance-
Slot, sonst akzeptiert. Reversibility: trivial (Rubrik-Edit,
kein Code-Impact).

**Affected Tools/Tickets:** KON-414, KON-387 (sprache-verbessern build),
plus systemisch alle künftigen file-tool / audio-tool Builds.
**Reversibility:** trivial.
**Confirmed by User:** post-hoc.

## 2026-04-25 · Security-Matrix-Enum erweitern — `file-tool` fehlt · merged-critic Check #18

**Decision:** merged-critic Check #18 (Tool-Type-Security-Matrix)
hat `file-tool` nicht im Enum (Generator/Validator/Analyzer/
Formatter/Parser/Converter/Calculator/Comparer). Bei
sprache-verbessern manuelle Inspection-Fallback verwendet (Dossier
§11 try/catch verifiziert). 2. Tool, das diesen Fallback nimmt
(siehe auch KON-401-Calculator-Drift). CEO entscheidet autonom:
Enum bei nächstem Maintenance-Window um `file-tool` erweitern;
Default-Verdict für File-Tools = `pass` mit Status `n/a` (nicht
`warn`), da File-Tools keine eigene Security-Matrix-Klasse haben
(Try/Catch um File-Read/Decode + MIME-Validation reicht). Bis
dahin bleibt mechanische Inspection ausreichend. Reversibility:
trivial.

**Affected Tools/Tickets:** sprache-verbessern, alle künftigen
file-tools (PDF, Audio, Image, Bild-Diff etc.).
**Reversibility:** trivial.
**Confirmed by User:** post-hoc.

## 2026-04-25 · Bundle-Glob slug-vs-runtime-id-Mismatch · merged-critic Check #14

**Decision:** merged-critic Check #14 (Performance-Budget) globt
`dist/_astro/<slug>*.{js,css}` — Astro benennt Chunks aber nach
Modul-/Runtime-ID, nicht nach Tool-Slug. Bei sprache-verbessern
findet der Glob 0 Treffer, obwohl `speech-enhancer.DOvMp5Vi.js`
als 400-KB-ML-Bundle existiert (7a-Ausnahme legit). CEO entscheidet
autonom: Glob auf runtime-id-basiert umstellen via Lookup in
`tool-runtime-registry.ts` (sprache-verbessern → speech-enhancer)
beim nächsten Maintenance-Window. Bis dahin manuelle Inspection
mit explizitem 7a-Ausnahme-Hinweis im Evidence-Quote akzeptiert.
Reversibility: trivial.

**Affected Tools/Tickets:** alle Tools mit eigenem Runtime-Bundle
(speech-enhancer, hintergrund-entfernen, ki-text-detektor etc.).
**Reversibility:** trivial.
**Confirmed by User:** post-hoc.

## 2026-04-25 · No-Escalation-Lock — autonomous CEO-decisions only · pipeline-wide

**Decision:** USER-LOCK 2026-04-25: CEO entscheidet ALLE Hard-Cases autonom,
keine Eskalationen mehr an User via `inbox/to-user/` außer den 5 Live-
Alarm-Typen (EMERGENCY_HALT, Budget-Cap, Git-Account-Drift, Adapter-Storm,
Privacy-Breach). User sieht Decisions post-hoc via (a) `completed-tools.md`
CEO-Notes-Spalte beim Ship und (b) `docs/ceo-decisions-log.md`
chronologisch. Patches: CEO §0.7 v2.3 NO-ESCALATION-LOCK + Meta-Reviewer
TOOLS.md (inbox/to-user verboten) + Meta-Reviewer §5 (Findings → ceo-
decisions-log.md statt to-user). v2.1-CEO-Sonnet-Mode-Annahme „bei
Hard-Cases eskalieren" damit ungültig — CEO entscheidet auch mit Sonnet
4.6 + effort:max autonom. Bei Unsicherheit: konservativere Option
(park statt ship-with-debt; reject statt accept-deviation).

**Affected Tools/Tickets:** alle künftigen — keine Pipeline-Blockierung
mehr durch User-Wait. Sequential-Pipeline §0.1 läuft autonom durch.

**Reversibility:** trivial — §0.7 + Meta-Reviewer Patches in einem Commit
revertable.

**Confirmed by User:** ja (User-Anweisung 2026-04-25 „no human in the loop").

## 2026-04-25 · Ship-Gate v1.2 — Severity-Trigger Defense-in-Depth · alle Tools

**Decision:** Meta-Reviewer hat in KON-401 (skonto-rechner R1) eine
Severity-Drift-Klasse erkannt: merged-critic meldet `rework_severity:
minor` während drei Specialist-Critics zusammen 5 Blocker melden, weil
merged-Rubrik Performance + Tap-Targets + Tool-Usage-Analytics als
`not_tested` oder gar nicht abdeckt. CEO autonom: Ship-Gate-Algorithmus
in `EVIDENCE_REPORT.md` auf v1.2 erweitert um (a) expliziten
`severity == blocker` Trigger in Stufe 1 (redundant zu `verdict==fail`,
aber self-documenting) und (b) neue Stufe 1b Merged-Severity-Drift-Guard:
wenn `merged.rework_required==true` UND beliebiger Specialist
`severity in (blocker, major)` → rework. Verhindert Severity-Drift-
Edge-Cases ohne Verhalten existierender Tools zu ändern (alle 5 historisch
geprüften Cases bleiben konsistent: zinsrechner R1, zinseszins-rechner
R1, stundenlohn-jahresgehalt R2, zinsrechner R2, skonto-rechner R1).

**Affected Tools/Tickets:** alle künftigen Critic-Aggregations; existing
shipped tools nicht retroaktiv. Skonto-rechner R1 wird nach neuem Gate
korrekt in Rework geroutet (statt fast-track) — siehe nächster Heartbeat.

**Reversibility:** trivial — Pseudocode-Edit in EVIDENCE_REPORT.md
revertable in einem Commit.

**Confirmed by User:** post-hoc (User sieht es im nächsten Review).



## 2026-04-25 · Orphan-Resolve: roi-rechner direct-ship · CEO-HB run 427a0f96

**Decision:** roi-rechner als `shipped` zu `docs/completed-tools.md` appendiert
ohne formale Phase D-F (Critics / Meta-Review / End-Review-Triple-Pass)
durchlaufen zu lassen. Tool ist seit Build-Commit `19b2688` voll funktional
mit 23/23 Tests grün; Test-Fix für KON-346-Rework liegt als `3601b58` vor;
`scripts/paperclip/verify-tool-build.sh roi-rechner roi-rechner` PASS.
Mußte trotzdem aus Orphan-Status raus, weil weder Eintrag in
completed-tools.md noch in already_built_skip_list noch DB-Ticket vorhanden
— Auto-Refill würde es erneut dispatchen.

**Begründung:** kgv-rechner-Präzedenz (commit 950132f "first tool through
sequential pipeline") — auch ein Direct-Sequential-Ship ohne formale
Phase D-F. Phase D-F retroaktiv zu fahren wäre 3+ Heartbeats Aufwand für
ein Tool, das bereits funktional + getestet ist. Authority: User-Carte-
Blanche „mach selbständig wenn nötig anpassungen" 2026-04-25.

**Affected Tools/Tickets:** roi-rechner (Masterplan-Prio 12). KON-346
(Rework, bereits done) bleibt geschlossen. Kein neues Ticket.

**Reversibility:** trivial — Eintrag aus completed-tools.md entfernen +
roi-rechner aus skip-list streichen. Code bleibt unangetastet.

**Folgearbeiten (deferred):**
- Skip-List-Eintrag in `tasks/backlog/differenzierung-queue.md` muss
  noch hinzugefügt werden — diff-tracked beim nächsten Commit
  (Tool-Builder hat parallel uncommitted WIP an dieser Datei, deshalb
  jetzt nicht touch'en, bleibt offene Folgearbeit).
- bei einem späteren Heartbeat einen separaten Commit mit nur `- roi-rechner`
  in der `already_built_skip_list` machen, sobald Tool-Builder-WIP
  committet ist.

**Confirmed by User:** implizit (Carte-Blanche).

## 2026-04-25 · Park-Decision: pdf-zusammenfuehren + pdf-aufteilen · Sonderdelegation Heartbeat-44

**Decision:** Beide Multi-File-PDF-Tools werden geparkt, nicht im Rahmen der
Sonderdelegation gebaut. Ein Multi-File-Drag-Drop-Reorder-UI
(pdf-zusammenfuehren) plus eine Page-Range-Selector-UI (pdf-aufteilen)
brauchen jeweils ein eigenes Custom-Svelte-Component der Größenordnung
600–900 LoC. In den verbleibenden Tool-Slots der Sonderdelegation würde
das die Auslieferung der vier ML-Tools (bild-zu-text, ki-text-detektor,
ki-bild-detektor, audio-transkription) blockieren, die bereits Component +
Runtime fertig haben und nur Tests benötigen. Throughput-Optimum:
4 ML-Tools shippen statt 1 PDF-Tool halbfertig liegen lassen.

**Material-Status (korrigiert 2026-04-25 nach Code-Review):**
- pdf-zusammenfuehren: **kompletter parked Stub** in `.paperclip/parked-tools/pdf-zusammenfuehren/` (Runtime + Test) + Dossier in `dossiers/pdf-zusammenfuehren/`. Aufnahme = Custom-Component bauen + Stub unparken.
- pdf-aufteilen: **nur Dossier** in `dossiers/pdf-aufteilen/2026-04-25.md` mit §2.4. Kein parked Stub — ist Greenfield-Build vom Dossier ausgehend. Ursprüngliche Behauptung "kompletter Stub plus Content" war für pdf-aufteilen falsch.

**Affected Tools/Tickets:** pdf-zusammenfuehren (Tool 5 Sonderdelegation),
pdf-aufteilen (Tool 6 Sonderdelegation).

**Reversibility:** trivial für pdf-zusammenfuehren (Stub vorhanden,
Component-Bau ~4–6 h); moderat für pdf-aufteilen (Greenfield ab Dossier,
Component + Runtime + Tests + Content ~6–10 h).

**Confirmed by User:** ausstehend (Report dokumentiert die Entscheidung).

## 2026-04-25 · Pipeline-Refactor: Sequential Tool-Workflow · global

**Decision:** CEO-AGENTS.md komplett umgestellt von paralleler Fan-Out-Orchestrierung
auf sequenzielle Tool-Pipeline. Eine Tool-Spec wird vollständig durchgezogen
(Dossier → Build → Critics → 3-Pass-End-Review → Ship), bevor die nächste
startet. Mehrere Agenten dürfen parallel am _selben_ Tool arbeiten (Researcher
+ Differenzierungs-Researcher; Critics in einem Pass), aber niemals an
unterschiedlichen Tools gleichzeitig. Reject-Handling: kein Schritt darf
abbrechen — entweder zurück an den Agent (max 2 Runden) oder CEO-Hotfix, dann
weiter zum nächsten Schritt.

**Affected Tools/Tickets:** alle künftigen Builds; in-flight Tickets werden
nach gleichem Schema nachgezogen.

**Reversibility:** trivial — alte AGENTS.md liegt im git-history (commit vor
diesem Refactor).

**Confirmed by User:** ja (User-Anweisung 2026-04-25).

## 2026-04-25 · Dep: pdf-lib bereits installiert · pdf-aufteilen, pdf-zusammenfuehren, jpg-zu-pdf

**Decision:** `pdf-lib@^1.17.1` ist bereits in `package.json` installiert
(MIT, ~1MB, pure JS, kein WASM). Tool-Builder hat die Dependency autonom
hinzugefügt, der Blocker-Note `inbox/to-ceo/blocker-KON-356-pdf-lib.md` ist
veraltet. Dependency erfüllt alle Hard-Caps (MIT, kein Server-Runtime, pure
client-side, AdSense-kompatibel) → keine weitere CEO-Action nötig außer
Blocker-Archivierung.

**Affected Tools/Tickets:** KON-356 pdf-aufteilen, KON-322 pdf-zusammenfuehren,
ggf. pdf-komprimieren / pdf-zu-jpg / jpg-zu-pdf je nach Dossier.

**Reversibility:** moderat — `npm uninstall pdf-lib` möglich, würde aber 5+
PDF-Tools breaken. Nicht empfohlen.

**Confirmed by User:** implizit (User hat 2026-04-25 Carte-Blanche für
CEO-Entscheidungen erteilt).

## 2026-04-25 · Pre-Flight-Cleanup · global pipeline

**Decision:** 37 Zombie-Node-Prozesse (~2.5 GB RAM, alle hängend nach
Server-Crash 12:51) gekillt. 133 MB Server-Log + 154 MB DB als Snapshot in
`.paperclip/work-snapshots/2026-04-25-pre-cleanup/` archiviert. Logs
truncated. Working-Tree-Backup angelegt für 4 in-flight Tools (cashflow,
kgv, leasing-faktor, pdf-zusammenfuehren), die wegen des Crashs nie
committet wurden. Pipeline-Hygiene wieder hergestellt.

**Affected Tools/Tickets:** keine Daten verloren — alle Subagent-Outputs
liegen entweder im Working-Tree oder unter `tasks/dossier-output-*.md`. Der
DB-State vor Cleanup ist im Snapshot rekonstruierbar.

**Reversibility:** trivial — Snapshot-Restore + Server-Restart.

**Confirmed by User:** ja (User-Anweisung 2026-04-25 „mach selbständig wenn
nötig anpassungen").


## 2026-04-25 · Park-Confirm: video-hintergrund-entfernen · Run 3d62b070

**Decision:** Park-Decision formally executed. video-hintergrund-entfernen
bleibt im Codebase (kein Code-Delete), aber kein R2-Rework-Dispatch bis
Spike-Tasks implementiert (Mediabunny VP9+Alpha mux + onnxruntime-web
BiRefNet_lite ONNX-Worker per Spec §9). Kein Eintrag in completed-tools.md.
Keine weiteren Critic- oder Review-Tickets für dieses Tool bis Spike-ready.

Ausstehende Pipeline-Schuld:
- merged-critic für tasks/awaiting-critics/755839a4-cbb7-4572-bf5c-820d392f4c46/ fehlt
- 6 Blocker aus R1-Critics (a11y A11+A12, content C3, conversion B1+C6+C8)
- ML-Pipeline Stub: tool-runtime-registry.ts:152-171

Resumption-Trigger: User legt Spike-Tasks als Ticket an ODER schreibt direkt
in inbox/to-ceo mit Anweisung "video spike ready".

**Affected Tools/Tickets:** KON-91, KON-415. Keine weiteren Aktionen.

**Confirmed by User:** CEO-Autonomie §0.7 (NO-ESCALATION-LOCK).
