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
3. **Task-abhängig:** `CONVENTIONS.md` (Code) · `STYLE.md` (Visual) · `CONTENT.md` (SEO-Text) · `TRANSLATION.md` (i18n)

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
- Palette = **Graphit-Grau-Tokens aus `tokens.css`**. Keine "bold accent colors", keine Purple-/Colored-Gradients. Die zwei semantischen Hues (Olive-Success, Rust-Error) bleiben sparsam. Die Pastell-Akzente aus `minimalist-ui` werden NICHT übernommen — unsere Palette ist Graphit-only.
- Fonts = **Inter + JetBrains Mono aus `tokens.css`** (self-hosted, DSGVO). Sowohl `minimalist-ui` als auch `frontend-design` verbieten Inter — das gilt hier NICHT. Font-Wahl ist in Session 2 gelockt, die Skill-Defaults werden explizit überstimmt.
- Motion = nur `var(--dur-*)` + `var(--ease-out)`. Keine ad-hoc-Durations, `prefers-reduced-motion` respektieren.
- Tokens-only: kein Hex, keine arbitrary-px-Werte. Konkrete Numerik-Vorschläge aus `minimalist-ui` (z.B. `#EAEAEA`, `8px`) werden auf unsere `--color-border` / `--r-md`-Tokens gemappt, NICHT als Hex/px übernommen.
- Stack = **Astro 5 SSG + Svelte 5 Runes + Tailwind**. `frontend-design`-Vorschläge mit React/Next.js-Syntax werden auf Svelte-Runes umgeschrieben.
- WCAG-AAA-Contrast (≥7:1) bleibt Pflicht.

Die Skills liefern Qualität (Form, Hierarchie, Detail) — die Rulebooks liefern die Leitplanken (Palette, Fonts, Tokens, Stack). Beides gleichzeitig.

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
