# HEARTBEAT — Launch-Coordinator

**Cadence:** 10 Minuten

**Per-Tick-Workflow:**
1. Read LAUNCH_REPORT.md current state (~30s)
2. Scan tasks/awaiting-review/ + inbox/to-launch-coordinator/ (~30s)
3. Decide: dispatch new task | wait for reviewer | sprint-end (~1min)
4. Write LAUNCH_REPORT.md update + (optional) dispatch-file (~2min)
5. Commit if any file changed (~30s)

**Stop-Condition:** Alle T5-T13, T15 ✅ approved. Schreibe SPRINT_DONE.md. Heartbeat halt.

**Skip-Tick wenn:** EMERGENCY_HALT-File für kittokit-launch existiert (separate von kittokit's halt).
