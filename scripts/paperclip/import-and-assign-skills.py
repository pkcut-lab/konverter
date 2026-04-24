#!/usr/bin/env python3
"""Import 23 community skills into the Paperclip company library and assign them per agent.

Usage: python scripts/paperclip/import-and-assign-skills.py
Requires: PAPERCLIP_* env vars sourced from ~/.paperclip-local-env/ceo-exports.sh
          CEO agent must have permissions.canCreateAgents = true
"""
import json
import os
import sys
import urllib.request
import urllib.error

API = os.environ["PAPERCLIP_API_URL"].rstrip("/")
KEY = os.environ["PAPERCLIP_API_KEY"]
COMPANY_ID = os.environ["PAPERCLIP_COMPANY_ID"]

HEADERS = {
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}

# All 23 skills to import: (source_string, short_key)
SKILLS_TO_IMPORT = [
    ("anthropics/knowledge-work-plugins/competitive-brief",          "competitive-brief"),
    ("astrolicious/agent-skills/astro",                              "astro"),
    ("sveltejs/ai-tools/svelte-code-writer",                         "svelte-code-writer"),
    ("obra/superpowers/test-driven-development",                     "test-driven-development"),
    ("obra/superpowers/systematic-debugging",                        "systematic-debugging"),
    ("wshobson/agents/code-review-excellence",                       "code-review-excellence"),
    ("tommygeoco/ui-audit/ui-audit",                                 "ui-audit"),
    ("addyosmani/web-quality-skills/accessibility",                  "accessibility"),
    ("addyosmani/web-quality-skills/performance",                    "performance"),
    ("hoodini/ai-agents-skills/owasp-security",                      "owasp-security"),
    ("github/awesome-copilot/gdpr-compliant",                        "gdpr-compliant"),
    ("coreyhaines31/marketingskills/seo-audit",                      "seo-audit"),
    ("coreyhaines31/marketingskills/competitor-profiling",           "competitor-profiling"),
    ("coreyhaines31/marketingskills/schema-markup",                  "schema-markup"),
    ("resciencelab/opc-skills/seo-geo",                              "seo-geo"),
    ("kostja94/marketing-skills/google-search-console",              "google-search-console"),
    ("kostja94/marketing-skills/keyword-research",                   "keyword-research"),
    ("mindrally/skills/analytics-data-analysis",                     "analytics-data-analysis"),
    ("secondsky/claude-skills/seo-keyword-cluster-builder",          "seo-keyword-cluster-builder"),
    ("secondsky/claude-skills/image-optimization",                   "image-optimization"),
    ("aaron-he-zhu/seo-geo-claude-skills/content-refresher",         "content-refresher"),
    ("dangeles/claude/consistency-auditor",                          "consistency-auditor"),
    ("aj-geddes/useful-ai-prompts/uptime-monitoring",                "uptime-monitoring"),
]

# Per-agent skill assignment (agent name -> list of short keys from above)
AGENT_SKILLS = {
    "Tool-Dossier-Researcher":        ["competitive-brief"],
    "differenzierungs-researcher":    ["competitive-brief"],
    "Tool-Builder":                   ["astro", "svelte-code-writer", "test-driven-development"],
    "merged-critic":                  ["code-review-excellence"],
    "design-critic":                  ["ui-audit"],
    "a11y-auditor":                   ["accessibility"],
    "performance-auditor":            ["performance"],
    "security-auditor":               ["owasp-security"],
    "legal-auditor":                  ["gdpr-compliant"],
    "seo-auditor":                    ["seo-audit"],
    "platform-engineer":              ["systematic-debugging"],
    "seo-geo-strategist":             ["seo-geo"],
    "seo-geo-monitor":                ["google-search-console"],
    "analytics-interpreter":          ["analytics-data-analysis"],
    "competitor-watcher":             ["competitor-profiling"],
    "faq-gap-finder":                 ["keyword-research"],
    "internal-linking-strategist":    ["seo-keyword-cluster-builder"],
    "schema-markup-enricher":         ["schema-markup"],
    "image-optimizer":                ["image-optimization"],
    "content-refresher":              ["content-refresher"],
    "cross-tool-consistency-auditor": ["consistency-auditor"],
    "uptime-sentinel":                ["uptime-monitoring"],
}

SKIP_AGENTS = {"translator", "i18n-specialist", "brand-voice-auditor", "cto"}


def req(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(f"{API}{path}", data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode()[:500]
        print(f"  HTTP {e.code} on {method} {path}: {body_txt}", file=sys.stderr)
        return None


def main():
    # Step 1: Check existing company skills to skip already-imported
    print("=== Step 1: Checking existing company skills ===")
    existing = req("GET", f"/api/companies/{COMPANY_ID}/skills")
    existing_keys = set()
    if existing:
        skills_list = existing.get("skills", existing) if isinstance(existing, dict) else existing
        existing_keys = {s.get("key") for s in skills_list if s.get("key")}
    print(f"  Already imported: {len(existing_keys)} skills")

    # Step 2: Import each skill (skip existing)
    print("\n=== Step 2: Importing 23 community skills ===")
    key_by_short = {}  # short_key -> canonical company key
    imported_count = 0
    for source, short in SKILLS_TO_IMPORT:
        if source in existing_keys:
            key_by_short[short] = source
            print(f"  [skip-exists] {short:30s} ({source})")
            continue
        resp = req("POST", f"/api/companies/{COMPANY_ID}/skills/import", {"source": source})
        if resp and resp.get("imported"):
            canonical = resp["imported"][0]["key"]
            key_by_short[short] = canonical
            imported_count += 1
            print(f"  [ok]          {short:30s} -> {canonical}")
        else:
            print(f"  [FAIL]        {short:30s} source={source}")
    print(f"  Imported: {imported_count}/{len(SKILLS_TO_IMPORT)}")

    # Step 3: Fetch agents
    print("\n=== Step 3: Fetching agents ===")
    agents_resp = req("GET", f"/api/companies/{COMPANY_ID}/agents")
    agents = agents_resp.get("agents", agents_resp) if isinstance(agents_resp, dict) else agents_resp
    by_name = {a["name"]: a for a in agents}
    print(f"  {len(by_name)} agents total, skipping {len(SKIP_AGENTS)} deferred")

    # Step 4: Sync skills per agent
    print("\n=== Step 4: Syncing desiredSkills per agent ===")
    updated = failed = no_match = 0
    for name, short_keys in AGENT_SKILLS.items():
        if name in SKIP_AGENTS:
            continue
        if name not in by_name:
            print(f"  [no_match] {name}")
            no_match += 1
            continue
        canonical = [key_by_short[s] for s in short_keys if s in key_by_short]
        if not canonical:
            print(f"  [no_skills] {name:35s} (none of {short_keys} imported)")
            failed += 1
            continue
        agent_id = by_name[name]["id"]
        resp = req("POST", f"/api/agents/{agent_id}/skills/sync", {"desiredSkills": canonical})
        if resp is not None:
            print(f"  [ok] {name:35s} -> {canonical}")
            updated += 1
        else:
            failed += 1

    print(f"\nSummary: agents updated={updated} failed={failed} no_match={no_match}")


if __name__ == "__main__":
    main()
