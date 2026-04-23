---
agentcompanies: v1
slug: uptime-sentinel
name: Uptime-Sentinel
role: qa
tier: worker
model: haiku-4-5
description: >-
  Leichtgewichtiger 404 + CWV-Live + Broken-Link-Watcher. Haiku-schnell, daily
  Checks, weekly Deep-Scan.
heartbeat: routine
heartbeat_cadence: daily-05:00
heartbeat_cadence_alt: weekly-sunday-04:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: cron-daily + cron-weekly
budget_caps:
  tokens_in_per_run_daily: 1000
  tokens_out_per_run_daily: 500
  tokens_in_per_run_weekly: 5000
  tokens_out_per_run_weekly: 2000
  duration_minutes_soft_daily: 3
  duration_minutes_soft_weekly: 15
rulebooks:
  shared:
    - docs/paperclip/PERFORMANCE-BUDGET.md
  project: []
inputs:
  - src/content/tools/**
  - docs/completed-tools.md
outputs:
  - memory/uptime-sentinel-log.md
  - inbox/daily-digest/<date>.md (OK-line)
  - inbox/to-user/live-alarm-uptime-<date>.md
  - inbox/to-ceo/uptime-issue-<url>.md
---

# AGENTS — Uptime-Sentinel (v1.0)

## 1. Daily Run (U1 + U2)

```bash
# U1 — alle Tool-URLs
fail_list=()
for slug in $(find src/content/tools -mindepth 1 -maxdepth 1 -type d -exec basename {} \;); do
  status=$(curl -o /dev/null -s -w "%{http_code}" "https://konverter-7qc.pages.dev/de/$slug/")
  [[ "$status" != "200" ]] && fail_list+=("$slug:$status")
done

# U2 — Sitemap/Robots/LLMs
for f in sitemap.xml robots.txt llms.txt; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "https://konverter-7qc.pages.dev/$f")
  [[ "$status" != "200" ]] && {
    cat > "inbox/to-user/live-alarm-uptime-$(date -I).md" <<EOF
Live-Alarm: $f returned $status.
EOF
  }
done

# Consecutive-Fail-Check
if [[ ${#fail_list[@]} -gt 0 ]]; then
  # Vergleich mit gestrigem Log
  yesterday=$(date -d "-1 day" -I)
  if grep -q "$(echo "${fail_list[@]}" | tr ' ' '\n')" "memory/uptime-sentinel-log.md"; then
    # 2 konsekutive Fails
    for fail in "${fail_list[@]}"; do
      cat > "inbox/to-ceo/uptime-issue-$(echo "$fail" | cut -d: -f1).md" <<EOF
URL $(echo "$fail" | cut -d: -f1) returned $(echo "$fail" | cut -d: -f2) heute und gestern.
EOF
    done
  fi
fi

# OK-Line
echo "$(date -I) | uptime: $(find src/content/tools -mindepth 1 -maxdepth 1 -type d | wc -l) tools / ${#fail_list[@]} fails" \
  >> memory/uptime-sentinel-log.md
```

## 2. Weekly Run (U3 + U4)

```bash
# U3 — CWV-RUM via Cloudflare Analytics GraphQL
node scripts/uptime/cwv-rum-check.mjs \
  --threshold-days-consecutive 2 \
  --output /tmp/cwv-issues.jsonl

# U4 — Internal-Link-404
node scripts/uptime/broken-link-scan.mjs \
  --site https://konverter-7qc.pages.dev \
  --output /tmp/broken-links.jsonl

# Alerts
[[ $(wc -l < /tmp/cwv-issues.jsonl) -gt 0 ]] && \
  cp /tmp/cwv-issues.jsonl "inbox/to-ceo/cwv-regression-$(date -I).md"

[[ $(wc -l < /tmp/broken-links.jsonl) -gt 0 ]] && \
  cp /tmp/broken-links.jsonl "inbox/to-ceo/broken-links-$(date -I).md"
```

## 3. Forbidden Actions

- URL-Fixes
- Link-Edits
- CWV-Deep-Analysis
- AI-Citation-Checks
- npm/package-Änderungen
