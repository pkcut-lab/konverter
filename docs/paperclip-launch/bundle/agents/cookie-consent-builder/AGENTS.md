---
agentcompanies: v1
slug: cookie-consent-builder
name: Cookie-Consent-Builder
role: worker
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  Baut den DSGVO-konformen Cookie-Banner als Svelte 5 Component. Refined-
  Minimalism: bottom-right, 1px border, kein Modal-Backdrop. 3 Buttons
  ("Alle akzeptieren", "Auswählen", "Nur notwendige"). Drawer mit 3 Toggles
  (Notwendig/Statistik/Marketing). Persistierung in localStorage.
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - DESIGN.md
  - STYLE.md
  - docs/paperclip-launch/bundle/MISSION.md (T6)
inputs:
  - tasks/dispatch/cookie-consent-builder-T6.md
outputs:
  - src/components/CookieBanner.svelte (neu)
  - src/lib/consent.ts (neu)
  - src/layouts/BaseLayout.astro (Edit: include Banner)
  - tests/unit/consent.test.ts (neu)
  - tasks/awaiting-review/T6/cookie-consent-builder.md (Report)
---

# Cookie-Consent-Builder — Procedure

## 1. Setup

```bash
mkdir -p tasks/awaiting-review/T6
echo "T6 started $(date -Iseconds)" > tasks/awaiting-review/T6/.lock
```

## 2. Build CookieBanner.svelte

Position: fixed bottom + right (~24rem maxwidth), 1px border `var(--color-border)`, padding `var(--space-6)`, BG `var(--color-bg)`, kein Backdrop.

Structure:
- Eyebrow Mono (`var(--font-family-mono)`) + 1-Absatz-Body
- 3 Buttons: "Alle akzeptieren" (primary graphit), "Auswählen" (ghost), "Nur notwendige" (ghost)
- Bei "Auswählen"-Klick: render Drawer (gleiche Card-Position) mit 3 Toggles + "Speichern"

State: Svelte 5 Runes (`$state`, `$derived`, `$effect`).

```svelte
<script lang="ts">
  import { getConsent, setConsent } from '../lib/consent';
  let mode = $state<'banner' | 'drawer' | 'hidden'>('hidden');
  let toggles = $state({ notwendig: true, statistik: false, marketing: false });

  $effect(() => {
    if (!getConsent()) mode = 'banner';
  });

  function acceptAll() { setConsent({ statistik: true, marketing: true, ts: Date.now() }); mode = 'hidden'; }
  function acceptNecessary() { setConsent({ statistik: false, marketing: false, ts: Date.now() }); mode = 'hidden'; }
  function openDrawer() { mode = 'drawer'; }
  function saveDrawer() { setConsent({ statistik: toggles.statistik, marketing: toggles.marketing, ts: Date.now() }); mode = 'hidden'; }
</script>

{#if mode === 'banner'}
  <aside class="banner" role="dialog" aria-label="Cookie-Einstellungen">
    <p class="eyebrow">Datenschutz</p>
    <p>kittokit nutzt nur notwendige Cookies. Mit deiner Zustimmung helfen Statistik-Cookies (Microsoft Clarity) und später Marketing-Cookies (Google AdSense), kittokit zu verbessern. Details in <a href="/de/datenschutz">Datenschutz</a>.</p>
    <div class="buttons">
      <button class="primary" on:click={acceptAll}>Alle akzeptieren</button>
      <button class="ghost" on:click={openDrawer}>Auswählen</button>
      <button class="ghost" on:click={acceptNecessary}>Nur notwendige</button>
    </div>
  </aside>
{:else if mode === 'drawer'}
  <aside class="banner" role="dialog" aria-label="Cookie-Auswahl">
    <p class="eyebrow">Auswahl</p>
    <ul class="toggles">
      <li><label><input type="checkbox" checked disabled /> Notwendig (immer aktiv)</label></li>
      <li><label><input type="checkbox" bind:checked={toggles.statistik} /> Statistik (Microsoft Clarity)</label></li>
      <li><label><input type="checkbox" bind:checked={toggles.marketing} /> Marketing (Google AdSense)</label></li>
    </ul>
    <div class="buttons">
      <button class="primary" on:click={saveDrawer}>Speichern</button>
    </div>
  </aside>
{/if}

<style>
  .banner { position: fixed; bottom: var(--space-6); right: var(--space-6); max-width: 24rem; padding: var(--space-6); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--r-md); z-index: 100; }
  .eyebrow { font-family: var(--font-family-mono); font-size: var(--font-size-xs); text-transform: uppercase; color: var(--color-text-subtle); margin: 0 0 var(--space-2); }
  p { margin: 0 0 var(--space-4); font-size: var(--font-size-small); color: var(--color-text); }
  .buttons { display: flex; flex-direction: column; gap: var(--space-2); }
  .primary { background: var(--color-text); color: var(--color-bg); padding: var(--space-2) var(--space-4); border: none; border-radius: var(--r-sm); cursor: pointer; }
  .ghost { background: transparent; color: var(--color-text-muted); padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--r-sm); cursor: pointer; }
  .ghost:hover { color: var(--color-text); }
  .toggles { list-style: none; padding: 0; margin: 0 0 var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--font-size-small); }
  @media (max-width: 40rem) { .banner { left: var(--space-4); right: var(--space-4); bottom: var(--space-4); max-width: none; } }
  @media (prefers-reduced-motion: no-preference) { .banner { animation: slide-in var(--dur-base) var(--ease-out); } @keyframes slide-in { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } }
</style>
```

## 3. Build src/lib/consent.ts

```typescript
export type Consent = { statistik: boolean; marketing: boolean; ts: number };
const KEY = 'kittokit-consent';

export function getConsent(): Consent | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Consent; } catch { return null; }
}

export function setConsent(c: Consent): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent('kittokit-consent-change', { detail: c }));
}

export function hasStatistikConsent(): boolean { return getConsent()?.statistik === true; }
export function hasMarketingConsent(): boolean { return getConsent()?.marketing === true; }

export function subscribeConsent(cb: (c: Consent | null) => void): () => void {
  const handler = () => cb(getConsent());
  window.addEventListener('kittokit-consent-change', handler);
  handler();
  return () => window.removeEventListener('kittokit-consent-change', handler);
}
```

## 4. Wire BaseLayout.astro

Edit `src/layouts/BaseLayout.astro`: import + include CookieBanner with `client:idle` directive.

## 5. Test

`tests/unit/consent.test.ts` — getConsent/setConsent/hasStatistikConsent/hasMarketingConsent edge-cases (null localStorage, malformed JSON).

## 6. Verifikation

```bash
npm run check  # 0/0/0
npx vitest run  # alle pass
npm run dev &  # smoke test
sleep 5
curl -s http://localhost:4321/de | grep -q "CookieBanner" || echo "WARN: SSR-render check"
```

## 7. Report

```bash
cat > tasks/awaiting-review/T6/cookie-consent-builder.md <<EOF
T6 — Cookie-Banner — Worker-Output
Status: ready-for-review

Dateien geändert:
- src/components/CookieBanner.svelte (NEU, ~80 LoC)
- src/lib/consent.ts (NEU, ~25 LoC)
- src/layouts/BaseLayout.astro (Edit: include Banner)
- tests/unit/consent.test.ts (NEU, 4 Test-Cases)

Verifikation:
- npm run check: <output>
- npx vitest run consent.test.ts: <output>
- localStorage clear → Banner erscheint: confirmed via dev-server screenshot

Restschulden:
- Microsoft Clarity Snippet wird in T11 conditional geladen (nicht hier)

Übergabe an: quality-reviewer
EOF

git add -A
bash scripts/check-git-account.sh
git commit -m "feat(consent): T6 — DSGVO-konformer Cookie-Banner + consent lib

CookieBanner.svelte (Svelte 5 Runes, refined-minimalism, bottom-right Card,
3 Buttons + Auswahl-Drawer). consent.ts mit getter/setter/subscriber.
BaseLayout.astro inkludiert via client:idle.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, DESIGN

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
