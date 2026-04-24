#!/usr/bin/env py
"""Bootstrap missing pipeline tickets after Consumer-Loop gap.

Creates:
  - 8 Round-1 critic tickets each for: zinsrechner, zinseszins-rechner, stundenlohn-jahresgehalt
  - 4 Meta-Review tickets for: tilgungsplan-rechner, kreditrechner, rabatt-rechner, brutto-netto-rechner

Run once. Idempotent check: skips tools that already have relevant tickets.
"""
import json, os, urllib.request, urllib.error

API = os.environ["PAPERCLIP_API_URL"].rstrip("/")
COMPANY_ID = os.environ["PAPERCLIP_COMPANY_ID"]
HEADERS = {"Content-Type": "application/json"}


def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else b""
    r = urllib.request.Request(f"{API}{path}", data=data, method=method, headers=HEADERS)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {"_error": e.read().decode()[:400]}


# Agent IDs
CRITICS = {
    "merged-critic":       "6e9e54cc-77b7-439c-b535-2cc6eccdc0ca",
    "content-critic":      "5e3d37d3-ebd5-41eb-98c7-1b356f5a99f3",
    "design-critic":       "4d37a3ac-dcbe-4ee9-8a50-ccbd9afbd2d2",
    "a11y-auditor":        "2bb73bc2-93cf-4524-8494-e40fa3824942",
    "performance-auditor": "0eadd722-298e-4d11-93f4-e7bdff458106",
    "security-auditor":    "58a46453-6b82-4bd2-b78f-8339d131e0f3",
    "conversion-critic":   "7de6eaad-9ebf-4a05-b80c-88d753d9b08c",
    "platform-engineer":   "08447ccc-1d37-4ea1-b720-ba8c99b3a77e",
}
META_REVIEWER_ID = "46ba39a7-3d4a-4659-8ba6-0f2b3babae1f"

# New builds needing Round-1 critics
NEW_BUILDS = [
    {"slug": "zinsrechner",           "id": "77763d6e-6586-44a0-9cda-3ee21f4828d2", "ticket": "KON-87"},
    {"slug": "zinseszins-rechner",    "id": "f87dffd5-e7e5-497c-bc7b-09e76fc7075a", "ticket": "KON-88"},
    {"slug": "stundenlohn-jahresgehalt","id":"8444ccfc-695d-4017-ac2c-ecc1fa6094dc","ticket": "KON-89"},
]

# Round-3-done tools needing meta-review
META_REVIEW_TOOLS = [
    "tilgungsplan-rechner",
    "kreditrechner",
    "rabatt-rechner",
    "brutto-netto-rechner",
]


def get_all_issues():
    s, data = req("GET", f"/api/companies/{COMPANY_ID}/issues?limit=300")
    if isinstance(data, list):
        return data
    return data.get("issues", data.get("items", []))


def ticket_exists(items, title_fragment):
    return any(title_fragment.lower() in i.get("title", "").lower() for i in items)


def create_issue(title, description, priority, assignee_id, parent_id=None):
    body = {
        "title": title,
        "description": description,
        "priority": priority,
        "status": "todo",
        "assigneeAgentId": assignee_id,
        "companyId": COMPANY_ID,
    }
    if parent_id:
        body["parentId"] = parent_id
    return req("POST", f"/api/companies/{COMPANY_ID}/issues", body)


def main():
    print("=== Fetching all issues for idempotency check ===")
    all_issues = get_all_issues()
    print(f"  Loaded {len(all_issues)} issues")

    # === Part 1: Round-1 Critics for new builds ===
    print()
    print("=== 1) Round-1 Critics for new tool builds ===")
    created_critics = 0
    for build in NEW_BUILDS:
        slug = build["slug"]
        build_id = build["id"]
        build_ticket = build["ticket"]

        # Check if Round-1 critics already exist for this slug
        existing = [i for i in all_issues
                    if f"Critic-Review-Round-1: {slug}" in i.get("title", "")]
        if len(existing) >= 8:
            print(f"  [{slug}] Round-1 critics already exist ({len(existing)}), skip")
            continue

        print(f"  [{slug}] Creating 8 Round-1 critics (parent={build_ticket})...")
        for critic, agent_id in CRITICS.items():
            title = f"Critic-Review-Round-1: {slug} ({critic})"
            desc = (
                f"Review-Round 1 parallel fan-out nach Build-done.\n\n"
                f"**target_slug:** {slug}\n"
                f"**upstream_build_ticket_id:** {build_ticket}\n"
                f"**critic:** {critic}\n"
                f"**expected_output:** tasks/awaiting-critics/{build_ticket}/{critic}.md\n\n"
                f"Lies das Tool vollständig (`src/lib/tools/{slug}.ts`, "
                f"`src/content/tools/{slug}/de.md`, Svelte-Component) und schreibe "
                f"deinen Review-Report gemäß deinem AGENTS.md."
            )
            s, r = create_issue(title, desc, "high", agent_id, parent_id=build_id)
            status_ok = 200 <= s < 300
            ident = r.get("identifier", "?") if isinstance(r, dict) else "?"
            mark = "ok" if status_ok else "FAIL"
            print(f"    [{mark}] {ident} {critic} http={s}")
            if status_ok:
                created_critics += 1

    print(f"  Created {created_critics} critic tickets")

    # === Part 2: Meta-Review for Round-3-done tools ===
    print()
    print("=== 2) Meta-Review tickets for Round-3-complete tools ===")
    created_meta = 0
    for slug in META_REVIEW_TOOLS:
        title = f"Meta-Review: {slug}"
        if ticket_exists(all_issues, f"Meta-Review: {slug}"):
            print(f"  [{slug}] Meta-Review already exists, skip")
            continue
        desc = (
            f"Post-Critic-Round-3 Meta-Audit.\n\n"
            f"**target_slug:** {slug}\n\n"
            f"Prüft Critics-Konsistenz, Rubric-Ambiguität und Hidden-Success-Patterns "
            f"für **{slug}**.\n\n"
            f"- Lies alle Round-3 Critic-Reports (tasks/awaiting-critics/ Verzeichnisse)\n"
            f"- Identifiziere Widersprüche zwischen Critics\n"
            f"- Erstelle Konsistenz-Summary\n"
            f"- Wenn konsistent + alle Pass: status=done (CEO dispatcht dann End-Review Pass 1)\n"
            f"- Wenn inkonsistent: kommentiere Konflikt für CEO"
        )
        s, r = create_issue(title, desc, "high", META_REVIEWER_ID)
        status_ok = 200 <= s < 300
        ident = r.get("identifier", "?") if isinstance(r, dict) else "?"
        mark = "ok" if status_ok else "FAIL"
        print(f"  [{mark}] {ident} Meta-Review: {slug} http={s}")
        if status_ok:
            created_meta += 1

    print(f"  Created {created_meta} meta-review tickets")

    print()
    print(f"=== Summary ===")
    print(f"  Critics created: {created_critics}")
    print(f"  Meta-Reviews created: {created_meta}")
    print(f"  Total new tickets: {created_critics + created_meta}")


if __name__ == "__main__":
    main()
