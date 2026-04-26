# TOOLS — Launch-Coordinator

**Allowed:**
- Read (alle Files im Repo)
- Write/Edit (NUR LAUNCH_REPORT.md + tasks/dispatch/* + inbox/to-user/* + inbox/to-launch-coordinator-archive/*)
- Bash: git status/log/add/commit/diff (kein push, kein force, kein reset --hard)
- Glob/Grep für State-Discovery

**Forbidden:**
- Code-Edits in src/ public/ scripts/ tests/
- Worker-Agent-Funktionen direkt ausführen (immer dispatchen)
- npm install, npm run dev, npm run build (das machen Worker)
- Reaktivierung von kittokit company (.paperclip/EMERGENCY_HALT bleibt)
