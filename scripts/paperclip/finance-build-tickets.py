#!/usr/bin/env py
"""One-shot backfill: create 7 Tool-Build tickets for orphaned Finance dossiers.

Prerequisite: source ~/.paperclip-local-env/ceo-exports.sh

Root cause of the gap is fixed separately in CEO AGENTS.md §2.5.
"""
import json
import os
import sys
import urllib.request
import urllib.error
import uuid

API = os.environ["PAPERCLIP_API_URL"].rstrip("/")
KEY = os.environ["PAPERCLIP_API_KEY"]
COMPANY_ID = os.environ["PAPERCLIP_COMPANY_ID"]

TOOL_BUILDER_ID = "deea8a61-3c70-4d41-b43a-bc104b9b45ac"
RUN_ID = str(uuid.uuid4())

# (slug, prio, dossier_path, manifest_path_or_empty, dossier_ticket)
TICKETS = [
    ("kreditrechner",            5,  "tasks/dossiers/_cache/finance/kreditrechner.dossier.md",            "tasks/dossier-output-kreditrechner.md",            "KON-63"),
    ("tilgungsplan-rechner",     6,  "tasks/dossiers/_cache/finance/tilgungsplan-rechner.dossier.md",     "tasks/dossier-output-tilgungsplan-rechner.md",     "KON-64"),
    ("brutto-netto-rechner",     7,  "tasks/dossiers/_cache/finance/brutto-netto-rechner.dossier.md",     "tasks/dossier-output-brutto-netto-rechner.md",     "KON-65"),
    ("zinsrechner",              8,  "tasks/dossiers/_cache/finance/zinsrechner.dossier.md",              "tasks/dossier-output-zinsrechner.md",              "KON-66"),
    ("zinseszins-rechner",       9,  "tasks/dossiers/_cache/finance/zinseszins-rechner.dossier.md",       "",                                                 "KON-67"),
    ("stundenlohn-jahresgehalt", 10, "dossiers/stundenlohn-jahresgehalt/2026-04-24.md",                   "tasks/dossier-output-stundenlohn-jahresgehalt.md", "KON-68"),
    ("rabatt-rechner",           11, "tasks/dossiers/_cache/finance/rabatt-rechner.dossier.md",           "tasks/dossier-output-rabatt-rechner.md",           "KON-69"),
]


def make_description(slug, prio, dossier_path, manifest_path, dossier_ticket):
    manifest_line = (
        f"**Dossier-Output:** {manifest_path}"
        if manifest_path
        else "_(Dossier-Output-Manifest fehlt im Researcher-Output — Builder liest Dossier direkt)_"
    )
    return f"""Dossier ready ({dossier_ticket}, verdict=ready, citation_verify_passed=true).

**Slug:** {slug}
**Category:** finance
**Masterplan-Prio:** {prio}
**Dossier:** {dossier_path}
{manifest_line}

**Task:** Tool implementieren gemäß Dossier-Differenzierungs-Hypothesen + §6 Rulebook-Canon. Standard-Calculator-Pattern (Svelte 5 Runes + `Converter.svelte` oder `Calculator.svelte`-Template).

**Rulebooks (MUST read):** PROJECT.md, CONVENTIONS.md, STYLE.md, CONTENT.md, BRAND_GUIDE.md, DESIGN.md

**Pipeline (downstream, CEO triggert automatisch):**
1. Tool-Build (this ticket)
2. Critic-Audit: merged-critic (15-check rubric)
3. Polish bei Score 80-94%
4. Meta-Review
5. Ship-Gates + §7.5 post-deploy append
"""


def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"_http_error": e.code, "_body": e.read().decode()[:400]}


def main():
    created = []
    for slug, prio, dossier, manifest, ticket in TICKETS:
        body = {
            "title": f"Tool-Build: {slug} (Finance, Masterplan-Prio {prio})",
            "description": make_description(slug, prio, dossier, manifest, ticket),
            "assigneeAgentId": TOOL_BUILDER_ID,
            "priority": "high",
            "status": "todo",
        }
        print(f"Creating Tool-Build: {slug:28s} ", end="", flush=True)
        resp = post(f"/api/companies/{COMPANY_ID}/issues", body)
        if resp.get("identifier"):
            print(f"OK {resp['identifier']}")
            created.append(resp["identifier"])
        else:
            print(f"FAIL {json.dumps(resp)[:300]}")
    print(f"\nCreated: {len(created)}/{len(TICKETS)}  {created}")


if __name__ == "__main__":
    main()
