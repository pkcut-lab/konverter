#!/usr/bin/env python3
"""One-shot backfill: create 3 Tool-Build tickets for the orphaned ML dossiers.

Tool-builder reads docs/paperclip/ml-tool-defaults.md for D1/D2/D3 sane defaults
— no user escalation needed.

Prerequisite: source ~/.paperclip-local-env/ceo-exports.sh
"""
import json
import os
import urllib.request
import urllib.error

API = os.environ["PAPERCLIP_API_URL"].rstrip("/")
KEY = os.environ["PAPERCLIP_API_KEY"]
COMPANY_ID = os.environ["PAPERCLIP_COMPANY_ID"]

TOOL_BUILDER_ID = "deea8a61-3c70-4d41-b43a-bc104b9b45ac"

# (slug, prio, category, dossier_path, manifest_path, dossier_ticket)
TICKETS = [
    ("video-hintergrund-entfernen", 1, "video", "tasks/dossiers/KON-60/dossier.md",
     "tasks/dossier-output-video-hintergrund-entfernen.md", "KON-60"),
    ("sprache-verbessern", 2, "audio", "tasks/dossiers/_cache/audio/sprache-verbessern.dossier.md",
     "tasks/dossier-output-sprache-verbessern.md", "KON-61"),
    ("webcam-hintergrund-unschaerfe", 3, "video", "tasks/dossiers/KON-62/dossier.md",
     "tasks/dossier-output-webcam-hintergrund-unschaerfe.md", "KON-62"),
]


def make_description(slug, prio, category, dossier, manifest, dossier_ticket):
    return f"""Dossier ready ({dossier_ticket}, verdict=ready, citation_verify_passed=true).

**Slug:** {slug}
**Category:** {category} (ML-File-Tool, requires_external_model=true)
**Masterplan-Prio:** {prio}
**Dossier:** {dossier}
**Dossier-Output:** {manifest}

**ML-Tool-Defaults (PFLICHT):** `docs/paperclip/ml-tool-defaults.md`
Blocker D1/D2/D3 haben dokumentierte Sane Defaults — keine User-Eskalation nötig:
- **D1 WebCodecs-Safari:** `BrowserCompatibilityNotice.svelte` + Feature-Detection, kein Polyfill
- **D2 EU-AI-Act:** UI-Badge "AI-verarbeitet" + File-Metadata-Tag (Software=kittokit.de) + Footer-Hinweis
- **D3 4K-Cap:** UI-Reject bei >1920px Width/Height, Copy auf FullHD anpassen (kein 4K-Claim)

Neuer Blocker außerhalb D1-D3 → Daily-Digest-Notiz, NICHT Live-Alarm (§3.4.1 Autonomy-First).

**Task:** ML-Tool implementieren gemäß Dossier-Differenzierungs-Hypothesen + §6 Rulebook-Canon + ml-tool-defaults.md. Pure-Client-ML via Transformers.js / MediaPipe (7a-Ausnahme vom Kein-Network-Dependencies-Gate).

**Rulebooks (MUST read):** PROJECT.md, CONVENTIONS.md, STYLE.md, CONTENT.md, BRAND_GUIDE.md, DESIGN.md, docs/paperclip/ml-tool-defaults.md

**Pipeline (downstream, CEO §3.4 triggert automatisch):**
1. Tool-Build (this ticket)
2. Critic-Audit: 8 parallele Critics via §3.5 Fan-Out
3. Polish bei Score 80-94%
4. Meta-Review
5. Ship-Gates + §7.5 post-deploy append
"""


def post(path, body):
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(body).encode(),
        method="POST",
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"_http_error": e.code, "_body": e.read().decode()[:400]}


def main():
    for slug, prio, category, dossier, manifest, ticket in TICKETS:
        body = {
            "title": f"Tool-Build: {slug} (ML-File-Tool, Masterplan-Prio {prio})",
            "description": make_description(slug, prio, category, dossier, manifest, ticket),
            "assigneeAgentId": TOOL_BUILDER_ID,
            "priority": "high",
            "status": "todo",
        }
        print(f"Creating Tool-Build: {slug:32s} ", end="", flush=True)
        resp = post(f"/api/companies/{COMPANY_ID}/issues", body)
        if resp.get("identifier"):
            print(f"OK {resp['identifier']}")
        else:
            print(f"FAIL {json.dumps(resp)[:300]}")


if __name__ == "__main__":
    main()
