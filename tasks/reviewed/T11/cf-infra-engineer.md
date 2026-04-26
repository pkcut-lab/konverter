# T11 — CF Web Analytics + Microsoft Clarity Setup — Worker-Output

**Agent:** cf-infra-engineer
**Status:** ready-for-review (mit Restschuld — 2 User-Inputs ausstehend)
**Date:** 2026-04-26

---

## Was wurde geändert

### `src/layouts/BaseLayout.astro` (+35 Zeilen)

- Frontmatter: `cfRumToken` und `clarityId` aus env-Vars gelesen
- Vor `</body>`: CF Web Analytics Beacon-Script (nur wenn `CF_RUM_TOKEN` gesetzt)
- Vor `</body>`: Microsoft Clarity Script (nur wenn `PUBLIC_CLARITY_PROJECT_ID` gesetzt UND `statistik`-Consent erteilt)

### `.env.example` (+8 Zeilen)

- `CF_RUM_TOKEN` und `PUBLIC_CLARITY_PROJECT_ID` als neue Env-Var-Templates dokumentiert

### `inbox/to-user/REQUIRES-USER-INPUT-analytics-tokens.md` (neu)

- Schritt-für-Schritt-Anleitung für User: CF Web Analytics Token + Clarity Project ID

---

## Design-Entscheidungen

| Thema | Entscheidung |
|-------|--------------|
| CF Web Analytics | Privacy-first — kein Consent nötig. Snippet nur wenn Token gesetzt (fail-safe). |
| Clarity | Consent-gated via `kittokit-consent.statistik`. Läuft nur im Browser nach Zustimmung. |
| Snippet-Guard | Beide Snippets werden bei leerem/fehlendem Env-Var **nicht** gerendert — kein broken HTML im Build. |
| Consent-Event | `window.addEventListener('kittokit-consent-change', ...)` — re-prüft bei jeder Consent-Änderung. |

---

## Verifikation

```
Build:  ✓ 157 pages built (npm run build)
Check:  1 pre-existing error in [slug].astro (ts2375, nicht durch T11 verursacht)
Tests:  4 pre-existing failures (hreflang/slug-map/deploy/tools-schema) — T11-Änderungen fügen 0 neue Fehler hinzu
```

---

## Restschuld (User-Input erforderlich)

### 1. CF Web Analytics Token

Das bestehende API-Token (`cfut_...`) hat keine Account Analytics-Berechtigung.
→ User muss Token manuell anlegen: **Cloudflare Dashboard → Web Analytics → Add a site → kittokit.com**
→ Beacon Token in `.env` und Cloudflare Pages Env-Vars eintragen: `CF_RUM_TOKEN=<token>`
→ Details: `inbox/to-user/REQUIRES-USER-INPUT-analytics-tokens.md`

### 2. Microsoft Clarity Project ID

Kein öffentlicher API-Endpoint für Project-Create.
→ User muss Project manuell anlegen: **clarity.microsoft.com → New project → kittokit**
→ Project ID in `.env` und Cloudflare Pages Env-Vars eintragen: `PUBLIC_CLARITY_PROJECT_ID=<id>`
→ Details: `inbox/to-user/REQUIRES-USER-INPUT-analytics-tokens.md`

---

## Übergabe an quality-reviewer

Bitte prüfen:
1. `src/layouts/BaseLayout.astro` diff — CF Analytics Snippet + Clarity Snippet korrekt platziert?
2. Consent-Check Logic: `c && c.statistik && !window.clarity` — DSGVO-konform?
3. Fail-safe bei fehlendem Token/ID: kein leerer `data-cf-beacon`?
4. Restschuld dokumentiert und User-Input-File erstellt?
