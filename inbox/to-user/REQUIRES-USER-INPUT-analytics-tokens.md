# T11 partial-block: Analytics Tokens benötigt

Code-Änderungen in `src/layouts/BaseLayout.astro` sind live (fail-safe — kein Snippet
wird gerendert solange die env-Vars fehlen). Zwei manuelle Schritte nötig:

---

## 1. Cloudflare Web Analytics Token

Das aktuelle API-Token hat keine Account Analytics-Berechtigung (nur Zone-Permissions).

**Schritte:**
1. Öffne: [dash.cloudflare.com](https://dash.cloudflare.com) → dein Account → **Web Analytics**
2. Klicke **Add a site** → Host: `kittokit.com` → **Done**
3. Kopiere den **Beacon Token** (sieht aus wie: `abc123...`)
4. Trage in `.env` ein:
   ```
   CF_RUM_TOKEN=<dein_token>
   ```
5. Außerdem in Cloudflare Pages → kittokit → Settings → Environment variables:
   `CF_RUM_TOKEN=<dein_token>` (für Production build)

**Alternativ via neuem API-Token** (Account Analytics: Edit Permission):
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/336e173af1e84eea40d5e68cb540d49d/rum/site_info" \
  -H "Authorization: Bearer <TOKEN_MIT_ACCOUNT_ANALYTICS_PERMISSION>" \
  -H "Content-Type: application/json" \
  --data '{"host":"kittokit.com","auto_install":false}' | python -c "import sys,json; print(json.load(sys.stdin)['result']['siteTag'])"
```

---

## 2. Microsoft Clarity Project ID

Clarity hat keine öffentliche API für Project-Create.

**Schritte:**
1. Öffne: [clarity.microsoft.com](https://clarity.microsoft.com) → Sign in
2. **New project** → Name: `kittokit` → URL: `https://kittokit.com`
3. Kopiere die **Project ID** (6-stellig, z.B. `abc123`)
4. Trage in `.env` ein:
   ```
   PUBLIC_CLARITY_PROJECT_ID=<deine_project_id>
   ```
5. Außerdem in Cloudflare Pages → Environment variables:
   `PUBLIC_CLARITY_PROJECT_ID=<deine_project_id>`

---

Wenn beide Werte gesetzt sind, sag im Chat:
- "T11 CF token gesetzt" und/oder "T11 Clarity ID gesetzt"

Das Snippet für CF Web Analytics lädt **ohne Consent** (privacy-first).
Das Clarity-Snippet lädt **nur wenn Statistik-Consent erteilt** (DSGVO-konform).
