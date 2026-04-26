# Deploy-Handbuch — Konverter

One-time setup für den ersten Cloudflare-Pages-Deploy. Danach läuft
jeder Push auf `main` automatisch durch CI → Production. Jeder PR bekommt
eine Preview-URL unter `<branch>.konverter-7qc.pages.dev`.

## Reservierte URLs

- **Production:** https://konverter-7qc.pages.dev
- **Preview-Pattern:** https://&lt;branch-name&gt;.konverter-7qc.pages.dev (wird pro PR automatisch gemintet)
- **CF-Projekt-Name:** `konverter-7qc` (hardcoded in `.github/workflows/deploy.yml` — URL-Wechsel = eine Zeile)

## Einmalige Setup-Schritte

### 1. Cloudflare API-Token erstellen

1. Einloggen auf https://dash.cloudflare.com
2. Avatar oben rechts → **My Profile** → **API Tokens**
3. **Create Token** → Template: **Edit Cloudflare Pages**
4. Account-Resources: **Include → &lt;dein Account&gt;**
5. Zone-Resources: **All zones** (oder spezifisch leer lassen, Pages braucht keine Zone)
6. **Create** → Token kopieren (wird nur einmal angezeigt)

### 2. Account-ID kopieren

1. Im Cloudflare-Dashboard: rechte Sidebar auf der Überblick-Seite
2. **Account ID** kopieren

### 3. GitHub-Secrets setzen

Im Repo https://github.com/pkcut-lab/kittokit → **Settings → Secrets and variables → Actions → New repository secret:**

| Name | Wert |
|------|------|
| `CLOUDFLARE_API_TOKEN` | Der API-Token aus Schritt 1 |
| `CLOUDFLARE_ACCOUNT_ID` | Die Account-ID aus Schritt 2 |

Alternativ via `gh` CLI:

```bash
gh secret set CLOUDFLARE_API_TOKEN --body "dein-token"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "deine-account-id"
```

### 4. Cloudflare-Pages-Projekt vorbereiten

Das Projekt `konverter-7qc` wurde in Session 1 manuell reserviert. Einmalig prüfen dass die folgenden Einstellungen im CF-Dashboard stimmen (**Workers & Pages → konverter-7qc → Settings**):

- **Production branch:** `main`
- **Build command:** leer lassen (wir bauen in GitHub Actions, `wrangler pages deploy` lädt nur die fertigen Artefakte hoch)
- **Build output directory:** leer lassen (gleicher Grund)
- **Always Use HTTPS:** an (Default)
- **Custom domains:** leer bis die echte Domain gekauft ist

### 5. Erster Deploy

Sobald die Secrets gesetzt sind:

```bash
# Triggert CI → production deploy auf konverter-7qc.pages.dev
git push origin main
```

CI-Run läuft unter **Actions → Deploy** im Repo. Erwarteter Ablauf:

1. `verify` Job (ca. 3–5 min): npm ci → astro check → vitest → build
2. `deploy` Job (ca. 30 s): wrangler lädt `dist/` nach CF Pages

## Laufender Betrieb

### Neue Features: PR-Workflow

```bash
git switch -c feat/mein-neues-tool
# … arbeiten …
git push -u origin feat/mein-neues-tool
gh pr create
```

CI baut + deployt automatisch auf `feat-mein-neues-tool.konverter-7qc.pages.dev`. Bei Merge nach `main` → production.

### Deploy-Status checken

```bash
gh run list --workflow=deploy.yml --limit 5
gh run watch   # oder eine spezifische Run-ID angeben
```

Oder im Browser: **Actions** Tab im Repo.

### Deploy ohne CI (Hotfix)

Niemals Default-Workflow umgehen außer im Notfall. Wenn doch nötig:

```bash
# Lokal bauen
npm run build
# Lokal deployen (braucht wrangler-Install + CF-Login)
npx wrangler pages deploy dist --project-name=konverter-7qc
```

## After Go-Live

### HSTS Preload List Submission

The `_headers` file already sets:
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
This satisfies all requirements for the Chrome HSTS Preload List.

**Steps (once kittokit.com has a live HTTPS response):**

1. Visit https://hstspreload.org and enter `kittokit.com`
2. All three requirements should be green (2-year max-age ✓, includeSubDomains ✓, preload ✓)
3. Click **Submit** — the domain enters the submission queue
4. Wait **~6–8 weeks** for inclusion in the Chromium source tree (Firefox + Edge pick it up shortly after)
5. Verify inclusion: https://hstspreload.org/?domain=kittokit.com shows "Status: preloaded"

Once preloaded, browsers enforce HTTPS for kittokit.com before any DNS lookup — the strongest HSTS protection available. **Do not submit until HTTPS is confirmed working site-wide** (including all subdomains, since `includeSubDomains` is set).

---

### Search Console + Bing Webmaster Setup (T14)

#### Google Search Console

1. Go to https://search.google.com/search-console
2. Add property → **URL-Prefix** method → enter `https://kittokit.com`
3. Verify via DNS TXT record (add to Cloudflare DNS):
   - Type: `TXT`, Name: `@`, Value: `google-site-verification=<token>`
4. Submit sitemap: **Sitemaps** → enter `https://kittokit.com/sitemap-index.xml`
5. For API access (automated rank tracking, T14 future):
   - Google Cloud Console → create service account → grant it `Search Console → Full`
   - Download JSON key → store as `GOOG_SC_KEY` GitHub secret
   - Reference: `googleapis` npm package with `webmasters` scope

#### Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Sign in with Microsoft account → Add site → `https://kittokit.com`
3. Verify via XML file (upload `BingSiteAuth.xml` to `public/`) OR DNS TXT record
4. Submit sitemap: **Sitemaps** → `https://kittokit.com/sitemap-index.xml`
5. Bing auto-imports from Google Search Console if you grant access (fastest path)

---

## Zukünftige Änderungen (nicht heute)

- **Custom Domain:** CF-Dashboard → Pages-Projekt → **Custom domains** → Domain hinzufügen, DNS CNAME auf `konverter-7qc.pages.dev` zeigen lassen. Nach Propagation: `astro.config.mjs`-`site` + `src/lib/site.ts`-`SITE_URL` auf die neue Domain umstellen.
- **Environment-Variables zur Runtime:** AdSense-Publisher-ID etc. kommen Phase 2. Werden in CF-Dashboard **Pages → Settings → Environment variables** gepflegt und in `astro.config.mjs` via `import.meta.env.PUBLIC_*` gelesen.
- **Preview-Access-Control:** Falls Previews private sein sollen (vor Launch), CF-Dashboard **Access** aktivieren.
- **R2-Proxy für Pagefind-Index:** Phase-5-Trigger (20k-Datei-Limit) — dann wird `HeaderSearch.svelte`s `bundlePath` zur build-time-Konstante. Siehe `CONVENTIONS.md` §Pagefind.
