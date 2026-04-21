---
date_opened: 2026-04-21
source: docs/audits/2026-04-21-full-quality-audit.md
owner: user (pkcut-lab)
status: awaiting-input
---

# Open Questions — Audit 2026-04-21

Drei Entscheidungen, die der Fix-Agent NICHT autonom trifft. Werden geskipped, bis User
einen Pfad wählt. Jede Frage nennt Optionen, Trade-offs und den vom Agent empfohlenen
Default (der aber ohne explizites "OK" nicht implementiert wird).

---

## Q1 — OG-Image-Strategie (Findings M-7-02, M-7-03)

**Status:** blockiert `og:image` und `twitter:image` Meta-Tags. Alle übrigen og:*/twitter:*
Tags (title, description, url, type, card) werden vom Agent schon jetzt gebaut — fehlt nur
das Bild-Asset.

**Optionen:**

1. **Global-Fallback-Bild** — `public/og-image.png` (1200×630), für alle 18 Tools dasselbe.
   - Aufwand: einmal Bild designen (~10 min in Figma/Photoshop), dann statisch referenzieren.
   - Nachteil: SERP-/Social-Preview ist generisch, kein per-Tool-Signal.
2. **Per-Tool Build-Time-Rendering via Satori** (`@vercel/satori` + `satori-html`).
   - Aufwand: ~2 h (Template, Integration in Astro-Build-Hook, pro Tool generieren).
   - Vorteil: einzigartige Preview pro Tool, starkes Social-Signal.
3. **Hybrid:** globales Default + Satori für Priority-Tools (Top-5 nach Analytics später).
   - Aufwand: Option 1 jetzt + Nachrüstung in Phase 2.

**Agent-Empfehlung:** Option 3. Start mit Option 1 (Fallback-Bild) diese Woche, Satori-Rollout
in Phase 2 nach AdSense-Aktivierung.

**Warte auf:** User-Entscheidung 1/2/3.

---

## Q2 — CSP-Scope (Finding M-5-02)

**Status:** blockiert `Content-Security-Policy` in `public/_headers`. Alle übrigen Security-
Header sind bereits gesetzt (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

**Optionen:**

1. **Globale CSP mit whitelisted `connect-src`** für alle ML-Tool-CDNs (Huggingface).
   - Aufwand: ~30 min (Header schreiben, 3-Tool-Sample testen).
   - Policy-Draft:
     ```
     default-src 'self';
     script-src 'self' 'unsafe-inline';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: blob:;
     font-src 'self';
     connect-src 'self' https://cdn-lfs.huggingface.co https://huggingface.co;
     worker-src 'self' blob:;
     frame-ancestors 'none';
     base-uri 'self';
     form-action 'self';
     ```
   - Nachteil: `'unsafe-inline'` für Scripts wegen ThemeScript — schwächt Schutz.
2. **Tool-spezifische CSP via Astro-Middleware** — striktere Policy für reine Tools
   (ohne `connect-src` extern), gelockerte Policy nur für `hintergrund-entfernen` +
   `hevc-zu-h264`.
   - Aufwand: ~90 min (Middleware + Tests).
   - Vorteil: Prinzip Least-Privilege.
3. **Nonce-basierte Policy** — alle inline-Scripts bekommen Nonce.
   - Aufwand: ~3 h (ThemeScript umbauen, alle Inline-Styles prüfen).
   - Vorteil: `'unsafe-inline'` fällt weg.

**Agent-Empfehlung:** Option 1 jetzt (schnell, substantielle Verbesserung gegen Status-quo),
Option 3 in Phase 2 wenn Zeit ist.

**Warte auf:** User-Entscheidung 1/2/3.

---

## Q3 — Secrets-Rotation-Kadenz (Finding N-5-01)

**Status:** keine Build-/Security-Auswirkung, aber `CONVENTIONS.md`-Policy-Eintrag fehlt.

**Optionen:**

1. **90 Tage** — standard-industry-Kadenz, aggressive Rotation.
2. **180 Tage** — Halbjahres-Zyklus, weniger operative Last.
3. **Nur bei Incident / Person-Wechsel** — reaktiv statt proaktiv.

**Betroffene Keys:**
- `STITCH_API_KEY` (design-gen, nur lokal)
- `FIRECRAWL_API_KEY` + `FIRECRAWL_WEBHOOK_SIGNING_KEY` (research-subagent)
- (später) AdSense-Publisher-ID, CF-Pages-API-Token

**Agent-Empfehlung:** 180 Tage für Dev-Tooling (STITCH/FIRECRAWL), 90 Tage für Prod-Credentials
(AdSense/CF) sobald aktiv.

**Warte auf:** User-Entscheidung 1/2/3 (oder split wie empfohlen).

---

---

## Q4 — json-formatter UI gleich ColorConverter (akut sichtbar im Build)

**Status:** Discovered während B-1-01 Verifikation. `[slug].astro:120` routet alle
`type: 'formatter'`-Tools auf `ColorConverter.svelte` — ein hex-spezifisches UI mit
`#FF5733`-Placeholder, Swatch-Preview und 6 Quick-Color-Buttons. Für `json-formatter`
(auch `type: 'formatter'`) ergibt das eine unbenutzbare Seite: ein 20-Zeichen-Input-Feld
statt Textarea, keine Formatierungs-Ausgabe für mehrzeiliges JSON.

**Build-Blocker wurde narrow gefixt** durch `formatJson` → `''` auf Invalid-Input
(statt Throw). Das UX-Problem bleibt: `/de/json-formatter` zeigt aktuell ColorConverter-
UI, nicht JSON-Formatter-UI.

**Optionen:**

1. **`Formatter.svelte` bauen** — generisches Textarea-basiertes Formatter-Component
   (Input-Textarea links, Output-Preformatted rechts). `[slug].astro` routet auf
   `Formatter` oder `ColorConverter` basierend auf `config.id === 'hex-to-rgb'`.
   - Aufwand: ~90 min (Component + Tests + Styling).
2. **ColorConverter hex-only machen** — Komponente in `HexColorConverter.svelte`
   umbenennen, json-formatter aus Auto-Route entfernen, später mit Formatter.svelte
   wiederbeleben.
   - Aufwand: ~30 min, aber User-sichtbarer Regress ("Tool verschwindet").
3. **Status quo + Workaround-Warnung** — `json-formatter`-Route zeigt Banner
   "UI wird überarbeitet", Tool bleibt technisch existent.
   - Aufwand: ~15 min, aber schwaches Signal.

**Agent-Empfehlung:** Option 1 — `Formatter.svelte` bauen. Matches Lego-Block-Strategie
(7 generische Tool-Typen, 1 Component pro Typ).

**Warte auf:** User-Entscheidung 1/2/3.

---

## Answered Questions

_(leer — sobald User eine Q beantwortet, wird der Eintrag hier hin mit Datum + Entscheidung
verschoben, damit die Historie erhalten bleibt.)_
