---
agentcompanies: v1
slug: cf-infra-engineer
name: Cloudflare-Infra-Engineer
role: worker
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  3-in-1 Cloudflare Setup: T11 Web Analytics + Microsoft Clarity (consent-
  gated), T13 Email Routing @kittokit.com, T14 Search Console + Bing
  Webmaster Verification (conditional auf kittokit.com live). Nutzt
  CLOUDFLARE_API_TOKEN aus .env.
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - DEPLOY.md
inputs:
  - tasks/dispatch/cf-infra-engineer-T11.md
  - tasks/dispatch/cf-infra-engineer-T13.md
  - tasks/dispatch/cf-infra-engineer-T14.md
  - .env (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
outputs:
  - src/layouts/BaseLayout.astro (Edit: Analytics-Snippets consent-gated)
  - .env.example (Update: CLARITY_PROJECT_ID Placeholder)
  - DEPLOY.md (Edit: Setup-Sequenzen dokumentiert)
  - inbox/to-user/REQUIRES-USER-INPUT-clarity-id.md (Email-Schritt)
  - tasks/awaiting-review/T11/cf-infra-engineer.md
  - tasks/awaiting-review/T13/cf-infra-engineer.md
  - tasks/awaiting-review/T14/cf-infra-engineer.md (conditional)
---

# Cloudflare-Infra-Engineer — Procedure

## T11 — Cloudflare Web Analytics + Microsoft Clarity

### Cloudflare Web Analytics (kein Consent nötig — privacy-first)

```bash
source .env
# Create Web Analytics site via API
TOKEN_ID=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/rum/site_info" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"host":"kittokit.com","auto_install":false}' | python -c "import sys,json; print(json.load(sys.stdin)['result']['siteTag'])")

echo "Cloudflare Web Analytics Token: $TOKEN_ID"
```

Edit `src/layouts/BaseLayout.astro`: add Analytics-Snippet vor `</body>`:
```astro
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon={`{"token": "${import.meta.env.CF_RUM_TOKEN}"}`}></script>
```

### Microsoft Clarity (consent-gated)

Clarity setup: NICHT API-able (kein offizieller API für Project-Create). Schreibe `inbox/to-user/REQUIRES-USER-INPUT-clarity-id.md`:
```markdown
T11 partial-block: Microsoft Clarity-Project muss MANUELL angelegt werden.

Schritt:
1. https://clarity.microsoft.com → Sign in (Google/Microsoft)
2. Create new project: "kittokit"
3. URL eintragen: https://kittokit.com (oder kittokit.pages.dev während prelaunch)
4. Copy Project-ID
5. Tippe in .env: CLARITY_PROJECT_ID=<id>
6. Sag im Chat "T11 Clarity-ID gesetzt"

Cloudflare Web Analytics ist bereits live (Token: ${TOKEN_ID}).
```

Im BaseLayout.astro vorbereiten (auch wenn ID noch fehlt — fail-safe):
```astro
---
import { getConsent } from '../lib/consent';
const clarityId = import.meta.env.PUBLIC_CLARITY_PROJECT_ID;
---
{clarityId && (
  <script is:inline define:vars={{clarityId}}>
    // Lazy-load Clarity nur wenn Statistik-Consent
    if (typeof window !== 'undefined') {
      const check = () => {
        try {
          const c = JSON.parse(localStorage.getItem('kittokit-consent') || 'null');
          if (c?.statistik && !window.clarity) {
            (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window, document, "clarity", "script", clarityId);
          }
        } catch(e){}
      };
      check();
      window.addEventListener('kittokit-consent-change', check);
    }
  </script>
)}
```

## T13 — Email Routing @kittokit.com

```bash
source .env
ZONE_COM="754c2f2c6089f081c6b8864904079c9a"

# Enable Email Routing
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_COM}/email/routing/enable" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

# Create destination address (User-Email)
# WARNING: Required user input — schreibe inbox/to-user/REQUIRES-USER-INPUT-email-target.md
cat > inbox/to-user/REQUIRES-USER-INPUT-email-target.md <<EOF
T13 partial-block: ZIEL-EMAIL für Forwarding gesucht.

Cloudflare Email Routing braucht eine echte Inbox-Adresse als Forward-Target.
Empfehlung: deine private Email (paulkuhn.cut@gmail.com).

Bestätigen via Chat ("T13 forward to paulkuhn.cut@gmail.com") — dann lege ich
6 Aliases an: hello@, support@, dmca@, dpo@, adsense@, postmaster@.
EOF
```

## T14 — Search Console + Bing (CONDITIONAL)

Skip wenn kittokit.com nicht live:
```bash
if ! curl -sf -o /dev/null https://kittokit.com; then
  echo "T14 skipped — kittokit.com noch nicht live, dokumentiere als pending"
  cat > tasks/awaiting-review/T14/cf-infra-engineer.md <<EOF
T14 — Search Console + Bing — DEFERRED
Reason: kittokit.com noch nicht als Custom Domain live (Option-C aus User-Decision)
Action: User-Trigger sobald Domain live, dann re-dispatch
EOF
  exit 0
fi

# Wenn live: Verification via DNS-TXT Record
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_COM}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"type":"TXT","name":"@","content":"google-site-verification=PLACEHOLDER","ttl":1}'
# (User muss vorher Property anlegen + TXT-Wert holen — schreibe inbox/to-user/...)
```

## Reports (3 separate, da 3 sub-tasks)

```bash
mkdir -p tasks/awaiting-review/{T11,T13,T14}
# T11
cat > tasks/awaiting-review/T11/cf-infra-engineer.md <<EOF
T11 — CF Web Analytics + Clarity — Worker-Output
Status: ready-for-review (mit Restschuld)

Done:
- CF Web Analytics enabled (Token: <token>)
- BaseLayout.astro: Analytics-Snippet eingebaut
- Clarity-Snippet eingebaut (consent-gated, läuft nur bei statistik:true)

Restschuld:
- Clarity-Project-ID muss User manuell anlegen → inbox/to-user/REQUIRES-USER-INPUT-clarity-id.md
EOF

# T13 analog (Email)
# T14 analog (deferred)
```
