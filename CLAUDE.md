# Konverter Webseite — Claude-Context

Dieses File wird von Claude Code automatisch bei jedem Session-Start geladen.

## Projekt-Kontext (1-Liner)

Multilinguale Konverter-Webseite (Astro 5 SSG + Svelte 5 + Tailwind), 1000+ Tools.
Launch-Set: DE only (Phase 1-2), +EN/ES/FR/PT-BR (Phase 3).
Expansion-Gates: bis 13 Sprachen (Phase 5), bis 30 (Phase 6).
Monetarisierung: AdSense ab Phase 2.
Vollständige Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` (v1.1).

## Bindende Referenzen — LIES ZU SESSION-BEGINN

1. `PROGRESS.md` — aktueller Projekt-Status und Next-Session-Plan
2. `PROJECT.md` — gelockte Tech-Stack-Versionen
3. **Task-abhängig:** `CONVENTIONS.md` (Code) · `STYLE.md` (Visual) · `DESIGN.md` (Stitch-Prompts + Approved Baselines) · `CONTENT.md` (SEO-Text) · `TRANSLATION.md` (i18n)

**UI-Task-Extra:** Sobald du eine neue Komponente, ein Tool-Template oder ein Seiten-Layout baust oder redesignst, lies zusätzlich `DESIGN.md` komplett. Dort liegen die 9-Sektionen-Spec (Palette, Typografie, Komponenten, Layout, Motion, Do's/Don'ts) und die Approved Baselines aus Stitch-Generationen. Jede visuelle Entscheidung muss dort hineinpassen oder du begründest die Abweichung. Stitch-Workflow: `npm run stitch:list` testet die Verbindung, `npm run stitch:generate` zieht einen neuen Screen gegen das Referenz-Projekt — Prompt in `scripts/stitch/generate.mjs` anpassen.

## Arbeitsprinzipien (tailored nach Andrej Karpathy)

### 1. Think Before Coding
Bevor du editierst: relevante Rulebooks öffnen, Task-Ziel formulieren, Bite-Size-Steps planen. Kein Code ohne Verständnis von WAS und WARUM. Das ist die deutsche Interpretation von "slow is smooth, smooth is fast".

### 2. Simplicity First
Die einfachste Lösung, die funktioniert. Keine vorausschauenden Abstraktionen, keine Feature-Creep. Drei ähnliche Zeilen schlagen eine voreilige Abstraktion. Wenn du "das wird später nützlich sein" denkst → nicht bauen bis es wirklich gebraucht wird.

### 3. Surgical Changes
Ein Commit = ein logisches Stück (ein Tool, ein Bug-Fix, ein Design-Token). Keine Mix-Commits ("fix X + refactor Y"). Keine opportunistischen Refactors während Bug-Fixes. GitHub Flow: eine Tool-Familie pro Branch.

### 4. Goal-Driven Execution
Jede Session endet mit PROGRESS.md-Update. Task fertig → Commit mit Trailer → stop. Keine "ich mach noch schnell das"-Erweiterungen ohne Plan. Scope-Creep wird aktiv zurückgewiesen.

### 5. Design-Skill-Pflicht (HART)
Sobald eine Session UI erstellt oder überarbeitet (neue Komponente, Tool-Template, Seiten-Layout, Redesign), **muss** der Agent folgende Skill-Sequenz via `Skill` Tool durchlaufen:

1. **`minimalist-ui`** (leonxlnx/taste-skill) — zuerst. Liefert die Form: warm-monochrome Palette, flat Bento-Grids, `1px`-Borders, `8–12px`-Radii, `24–40px`-Padding, Anti-Cliché-Guards (keine rounded-full, keine "Elevate/Seamless"-Copy, keine Emojis).
2. **`frontend-design`** (anthropics/skills) — danach. Verfeinert das Fundament: Typografie-Hierarchie, Whitespace-Rhythmus, dezente Mikro-Interaktionen, Detail-Politur.
3. **Code schreiben.**
4. **`web-design-guidelines`** (vercel-labs) — nach Fertigstellung als Audit-Pass auf die geänderten Dateien.

**Hard-Caps, die ALLE drei Skills überstimmen (nicht verhandelbar):**
- Ästhetik-Direction = **refined minimalism** (keine maximalistischen Varianten, keine Asymmetrie-Experimente, keine Grid-Breaking, keine Noise/Grain/Gradient-Mesh-Hintergründe).
- Palette = **Graphit-Grau-Tokens aus `tokens.css` + 1 warmer Orange-Accent** (gelockert Runde 3 2026-04-20). Orange (`#8F3A0C` Light / `#F0A066` Dark, beide AAA ≥7:1) erscheint NUR auf Links, Focus-Rings, `<em>`-Highlights, Eyebrow-Pulse-Dots, Spinner-Arcs, Dropzone-Active-Borders — NIEMALS als Primary-Button-Fläche (die bleiben `var(--color-text)` graphit-dunkel). Die zwei semantischen Hues (Olive-Success, Rust-Error) bekommen breitere Use-License: auch für Pro/Con-Bullet-Dots in Content-Vergleichen, nicht nur States. Keine weiteren Akzentfarben, keine "bold accent colors", keine Purple-/Colored-Gradients, keine Pastell-Backgrounds (Pill-Tints via `color-mix(in oklch, …)` erlaubt, Hex-Pastelle nicht).
- Fonts = **Inter + JetBrains Mono aus `tokens.css`** (self-hosted, DSGVO). Sowohl `minimalist-ui` als auch `frontend-design` verbieten Inter — das gilt hier NICHT. Font-Wahl ist in Session 2 gelockt, die Skill-Defaults werden explizit überstimmt.
- Motion = nur `var(--dur-*)` + `var(--ease-out)`. Keine ad-hoc-Durations, `prefers-reduced-motion` respektieren.
- Tokens-only: kein Hex, keine arbitrary-px-Werte. Konkrete Numerik-Vorschläge aus `minimalist-ui` (z.B. `#EAEAEA`, `8px`) werden auf unsere `--color-border` / `--r-md`-Tokens gemappt, NICHT als Hex/px übernommen.
- Stack = **Astro 5 SSG + Svelte 5 Runes + Tailwind**. `frontend-design`-Vorschläge mit React/Next.js-Syntax werden auf Svelte-Runes umgeschrieben.
- WCAG-AAA-Contrast (≥7:1) bleibt Pflicht.

Die Skills liefern Qualität (Form, Hierarchie, Detail) — die Rulebooks liefern die Leitplanken (Palette, Fonts, Tokens, Stack). Beides gleichzeitig.

### 6. Differenzierungs-Check (HART)

Jede Tool-Spec (egal welcher Größe) **muss** vor dem Architektur-Block eine Sektion `§2.4 Differenzierung` enthalten. Sie wird nach einer dreistufigen Recherche ausgefüllt — die Recherche delegiert der Agent an einen Subagenten via `Agent`-Tool, damit die Konkurrenz-/Nutzer-/Trend-Daten parallel zur Spec-Arbeit erhoben werden und der Hauptkontext frei bleibt.

**Pflicht-Recherche-Output (vom Subagenten geliefert, in §2.4 zitiert):**

1. **Competitor Feature Matrix** — Top 5–7 Konkurrenten (URL + 1-Zeilen-USP). Pro Konkurrent: Input-Methoden, Input/Output-Formate, Free-Tier-Limits, Privacy-Posture, Quality/Modell-Info, Differentiating Extras. Daraus ableiten:
   - **Baseline-Pflicht:** Features, die JEDER Konkurrent hat → unser Mindest-Scope.
   - **White-Space:** Features, die KEINER gut macht → unsere Kandidaten.

2. **User Wishes (jetzt)** — Aus Reddit, Hacker News, Trustpilot, G2, Capterra, ProductHunt: Was beschweren sich Nutzer aktuell? Mindestens 3 wörtlich zitierte Pain-Points. Kategorisiert in Quality / UX / Privacy / Missing-Features.

3. **2026-Trends & Future Importance** — Was kommt? Browser-ML-Reife, neue Modell-Architekturen, Format-Adoption (HEIC/AVIF/etc.), Mobile-First, AI-Workflow-Integration, Privacy-as-a-Feature, AEO/Voice-Search-Patterns. Filter: nur Trends, die mit unseren Hard-Constraints (pure-client, MIT, AdSense, multilingual, Refined-Minimalism) kompatibel sind.

**§2.4 Spec-Pflichtfelder (knapp, zitierfähig):**
- A. **Baseline-Features** (was wir mindestens liefern müssen) — ≤6 Bullet-Punkte.
- B. **Differenzierungs-Features** (was uns hebt) — 3–5 Bullet-Punkte mit Begründung „weil keiner / weil Trend X".
- C. **Bewusste Lücken** (was wir NICHT bauen + warum) — verhindert künftige Scope-Diskussionen.
- D. **Re-Evaluation-Trigger** — wann (Phase 2 Analytics, User-Feedback-Threshold) checken wir, ob die Differenzierungs-Wahl noch stimmt.

**Hard-Caps gegen Differenzierungs-Eifer:**
- Kein Feature, das die Non-Negotiables verletzt (kein Server-Upload, kein Tracking-without-Consent, kein Hex-Code).
- Kein Feature, das den Refined-Minimalism-Look bricht (keine Maximalismus-Effekte, keine Animation-Spektakel).
- YAGNI bleibt: Differenzierungs-Features brauchen einen klaren User-Pain oder Trend-Beleg — nicht „könnte cool sein".
- Recherche-Subagent läuft parallel zur Brainstorming-Phase, NICHT als Blocker davor — Spec-Iteration startet mit Best-Guess-Annahmen, Subagent-Report patcht §2.4 nach.

## Git-Account-Lock (HART)

Nur `pkcut-lab` darf in diesem Workspace committen. Vor jedem Commit:
```bash
bash scripts/check-git-account.sh
```
Muss green sein. `DennisJedlicka` ist in diesem Workspace **verboten**.

## Session-Ritual

**Start (~60 Sek):**
1. `PROGRESS.md` lesen
2. `PROJECT.md` prüfen (Dep-Versionen unverändert?)
3. Task-relevante Rulebooks
4. `bash scripts/check-git-account.sh`
5. Arbeiten beginnen

**Ende (~60 Sek):**
1. `PROGRESS.md` aktualisieren (welche Tools jetzt in welchem Zustand)
2. Commit mit Trailer: `Rulebooks-Read: PROJECT, CONVENTIONS[, STYLE][, CONTENT][, TRANSLATION]`
3. Stop

## Non-Negotiables (siehe Spec Section 18)

1. Session-Continuity: Rulebooks werden befolgt
2. Privacy-First: kein Tracking ohne Consent, kein Server-Upload (Ausnahme: 7a ML-File-Tools)
3. Quality-Gates: Build bricht ab bei fehlender Struktur
4. Git-Account: pkcut-lab only
5. AdSense erst Phase 2
6. Design-Approval vor Template-Extraction
7. Keine externen Network-Dependencies zur Runtime (Ausnahme 7a: ML-File-Tools mit Worker-Fallback, 6 Bedingungen)
8. Kein thin Content (<300 Wörter abgelehnt)
