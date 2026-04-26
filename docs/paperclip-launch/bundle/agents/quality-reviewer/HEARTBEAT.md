# HEARTBEAT — Quality-Reviewer

**Cadence:** 15 Minuten

**Per-Tick:**
1. Scan tasks/awaiting-review/ — pick oldest
2. 4-Layer-Review (~10min worst-case mit Build + Test-Run)
3. Verdict + Action: ✅/🟡/❌
4. Update LAUNCH_REPORT.md + write inbox/to-launch-coordinator/
5. Commit doc + (bei 🟡) auto-fix

**Skip-Tick wenn:** tasks/awaiting-review/ leer.
