---
title: "paperclipai issue-lifecycle — Zombie-Close (status not flipped after run-end)"
date: 2026-04-21
status: upstream-issue-candidate
package: paperclipai@2026.416.0
adapter: "@paperclipai/adapter-claude-local"
severity: medium
audience: konverter-webseite-team + paperclipai-maintainer
related:
  - docs/paperclip/research/2026-04-21-local-cli-destructive-symlink-removal.md
  - tasks/auto-rollback-policy.yaml
---

# Zombie-Close: Issue-Status stays `in_progress` after worker-run ends

## TL;DR

During Phase C smoke-test (2026-04-20), issue **KON-3** (merged-critic content-audit)
had its Evidence-Report file written to disk (`tasks/awaiting-critics/KON-3/merged-critic.md`,
6089 bytes, valid YAML-frontmatter, `verdict: pass`) — but the issue's DB-state stayed
`status: in_progress`, `completedAt: null`, `activeRun: null`. The run ended; the issue
did not close.

CEO's sibling issue (KON-2, tool-dossier-researcher) closed correctly on the same
heartbeat-spawn (`completedAt: 2026-04-20T23:50:35Z`). So the lifecycle path works
sometimes — just not always.

Bridge-fix deployed: **board-admin-close via no-auth-header PATCH** in local_trusted
deployment mode. Hasn't been reproducibly isolated; running overnight queue will
surface more samples for comparison.

## Observed Incident

### KON-3 (zombie)
- Issue assigned to `merged-critic` (agent `6e9e54cc`) at 2026-04-20T23:44:53
- Two sequential runs spawned:
  - `ff929218` (first, started 23:44:53)
  - `b84f1131` (retry, executionLockedAt 23:49:44)
- Report written at 2026-04-20T23:49:00 (timestamp in YAML frontmatter: `audit_completed: 2026-04-21T00:15:00Z` — this is stub/placeholder, real runtime was shorter)
- Post-run DB state: `status: in_progress`, `completedAt: null`, `activeRun: null`
- The critic lock-file exists (`tasks/awaiting-critics/KON-3/merged-critic.lock`) — not cleaned up either
- Comment log on parent issue (KON-1) shows paperclip itself detected the anomaly:
  > "Paperclip automatically retried continuation for this assigned `in_progress`
  >  issue after its live execution disappeared, but it still has no live execution
  >  path. Moving it to `blocked` so it is visible for intervention."
  > (timestamps: 2026-04-20T23:45:44.824Z + 23:46:14.827Z)
- So the system HAS a health-check that moves stale `in_progress` issues to `blocked`
  on the **parent**, but the child-issue (KON-3) was never touched by that sweep
- Report metadata shows `tokens_in: 0, tokens_out: 0, duration_ms: 0` — placeholder
  values, suggesting the agent wrote the report template correctly but didn't fill
  runtime-stats before exit. Still, `verdict: pass` is substantive (line-number-precise
  evidence quotes).

### KON-2 (healthy control)
- Same heartbeat-spawn, same deployment-mode, same no-auth-header flow
- Dossier file written to disk (`tasks/dossiers/_cache/length/meter-zu-fuss.dossier.md`,
  16889 bytes, 14 sources, 8 webfetch calls, PII-scrub v1 applied)
- Post-run DB state: `status: done`, `completedAt: 2026-04-20T23:50:35.055Z` ✓
- Frontmatter metadata includes real tokens (`tokens_in: 52000, tokens_out: 8400`)

## Hypothesis

Two leading candidates:

### H1 — Agent-side: work-product extraction mismatch

When a run's adapter returns `exitCode: 0` + a populated `summary`, the server's
run-completion handler likely inspects the summary or the agent's stdout-events
to decide whether to close the assigned issue. If the merged-critic's output
format (YAML+Markdown body written directly to disk, with no stdout "DONE" marker
or work-product reference in its summary) doesn't match the server's expectation,
the handler may leave status untouched rather than closing.

The tool-dossier-researcher's output is similarly file-based, so this hypothesis
is weak unless merged-critic's stdout differs materially (it writes log-lines
about "Check #1", "Check #2" etc. — closer to CLI-noise than agent-summary).

### H2 — Server-side: per-run idempotency guard misfires on retry

When the first run (`ff929218`) ended in a partial state (did not flip status
to done), paperclip's auto-retry spawned `b84f1131`. The retry run may carry a
different `executionRunId` than the one the completion handler watches, so even
when `b84f1131` exits cleanly, the server's completion-hook sees "a run I don't
own ended" and no-ops.

Evidence for H2: the KON-1 parent comment log shows an explicit
auto-retry-then-block path (`"retried continuation for this assigned in_progress
issue"`). That path operates at the issue-parent level; child-level may have
the same retry logic but without the `move to blocked` escape hatch.

## Evidence-Paths

- Adapter `dist/server/execute.js` returns `exitCode`, `summary`, `usage`,
  `sessionId`, `resultJson`, `errorMessage`. No issue-status field — confirms
  lifecycle is server-side, not adapter-side.
- Server's `@paperclipai/server/dist/routes/agents.js` handles `/api/agents/*`
  but not run-finalization; that's likely in a run-lifecycle module.
- Specific files to inspect (upstream-maintainer):
  - `@paperclipai/server/dist/runs/*` (if exists)
  - `@paperclipai/server/dist/queue/*` (run-queue + retry logic)
  - `@paperclipai/server/dist/lifecycle/*` (issue-status flips)

## Bridge Accepted

Until root-cause is isolated:
- Zombie-closes accepted as a known runtime artifact, NOT a quality signal
- Board/admin closes via no-auth-header PATCH in local_trusted mode
  (documented in `tasks/auto-rollback-policy.yaml` §5 revert_behavior)
- CEO heartbeat should detect zombie children on sweep — candidate follow-up:
  add to CEO AGENTS.md §Health-Sweep a check for "child-issues in_progress
  with no activeRun and file-output-present → admin-close"

## Overnight-Queue Impact

With KON-4/5/6 in-flight + CEO heartbeat compressed to 5m, zombie-close rate
will be directly observable. Daily-Digest 2026-04-22 should report:

- `zombie_close_count_24h`
- `zombie_close_ratio` (zombies / total worker runs)
- `zombie_close_surface` (per-agent breakdown)

If `zombie_close_ratio > 0.10` (10% or more), escalate to user-only-item +
freeze queue-dispatch pending root-cause fix.

## Upstream Recommendation

File issue at paperclipai repo (when maintainer-visible) with:
- Minimal reproducer: dispatch merged-critic against a static audit-target
- Expected: `status: done` + `completedAt` set after run-end
- Actual: `status: in_progress`, `completedAt: null`, `activeRun: null`
- Comparison: tool-dossier-researcher on same heartbeat-spawn closes correctly

Include this research-note body as the issue description. Avoid monkey-patching
the bundle-adjacent server code — server surface is large, patches are fragile
across versions, and board-admin-close is a safe bridge.
