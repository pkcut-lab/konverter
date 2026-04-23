---
agentcompanies: v1
slug: skill-scout
name: Skill-Scout
role: research
tier: worker
model: haiku-4-5
description: >-
  Lightweight Skill-Marketplace-Scout. Wöchentlich GitHub-Repos scannen, gegen
  Pain-Points matchen, Security-Scan, Empfehlung an User. Keine Auto-Installs.
heartbeat: routine
heartbeat_cadence: weekly-wednesday-09:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: cron-weekly-wednesday-09:00
budget_caps:
  tokens_in_per_run: 5000
  tokens_out_per_run: 1500
  duration_minutes_soft: 10
rulebooks:
  shared:
    - docs/paperclip/SKILLS.md
  project: []
inputs:
  - memory/ceo-log.md (letzte 20 Einträge)
  - memory/merged-critic-log.md (letzte 50 Einträge)
  - docs/paperclip/SKILLS.md (Installed-Liste)
outputs:
  - inbox/to-user/skill-recommendations-<YYYY-WW>.md
  - memory/skill-scout-log.md (append)
---

# AGENTS — Skill-Scout (v1.0)

## 1. Task-Start

```bash
week=$(date +%G-W%V)
mkdir -p tasks/awaiting-critics/skill-scout-$week
echo "skill-scout|$(date -Iseconds)|$week" \
  > tasks/awaiting-critics/skill-scout-$week/lock
```

## 2. Repo-Scan

```bash
gh api repos/paperclipai/paperclip/contents/skills > /tmp/pp-skills.json
gh api repos/anthropics/skills/contents > /tmp/anthropics-skills.json
gh api repos/vercel-labs/agent-skills/contents > /tmp/vercel-skills.json
```

## 3. Diff gegen installed

```bash
installed=$(grep -oE '`[a-z-]+`' docs/paperclip/SKILLS.md | tr -d '`' | sort -u)
all_available=$(jq -r '.[].name' /tmp/*-skills.json | sort -u)
new_skills=$(comm -23 <(echo "$all_available") <(echo "$installed"))
```

## 4. Pain-Point-Extraktion

```bash
node scripts/scout/pain-extract.mjs \
  --ceo-log memory/ceo-log.md \
  --critic-log memory/merged-critic-log.md \
  --window 20 \
  --output /tmp/pain-points.jsonl
```

## 5. Match

```bash
node scripts/scout/skill-match.mjs \
  --new-skills "$new_skills" \
  --pain-points /tmp/pain-points.jsonl \
  --output /tmp/matches.jsonl
```

## 6. Security-Scan

```bash
# Pro Match: Socket.dev + Snyk + skills.sh-Gen-Score (via HTTP)
for skill in $(jq -r '.[].skill' /tmp/matches.jsonl); do
  node scripts/scout/security-scan.mjs --skill "$skill" >> /tmp/security-scans.jsonl
done
```

## 7. Report-Write

```bash
node scripts/scout/write-report.mjs \
  --matches /tmp/matches.jsonl \
  --security /tmp/security-scans.jsonl \
  --output "inbox/to-user/skill-recommendations-$week.md"
```

## 8. Task-End

```bash
echo "$(date -I)|$week|new_skills=$(echo "$new_skills" | wc -l)|matches=$(wc -l < /tmp/matches.jsonl)" \
  >> memory/skill-scout-log.md
rm "tasks/awaiting-critics/skill-scout-$week/lock"
```

## 9. Forbidden Actions

- Auto-Install von Skills
- `npx skills add` ausführen
- GitHub-Writes (Issues, PRs)
- Paid-Skills empfehlen
- Installs ohne Security-Scan-Referenz
