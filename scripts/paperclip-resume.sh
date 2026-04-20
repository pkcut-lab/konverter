#!/usr/bin/env bash
# scripts/paperclip-resume.sh — Resume nach EMERGENCY_HALT
#
# Usage:  bash scripts/paperclip-resume.sh "<rationale>"
# Entfernt .paperclip/EMERGENCY_HALT + loggt Resume in memory/halt-history.md.
# Nur User soll dieses Script aufrufen — CEO-Agent darf NICHT self-resumen.
#
# Siehe docs/paperclip/EMERGENCY_HALT.md für Post-Resume-Verhalten
# (killed-locks Re-Dispatch beim ersten Heartbeat danach).

set -euo pipefail

if [[ $# -lt 1 || -z "$1" ]]; then
  echo "Usage: bash scripts/paperclip-resume.sh \"<rationale>\"" >&2
  echo "Beispiel: bash scripts/paperclip-resume.sh \"critic-rerun passed after regex fix\"" >&2
  exit 2
fi

rationale="$1"
halt_file=".paperclip/EMERGENCY_HALT"
history_file="memory/halt-history.md"
timestamp="$(date -Iseconds)"
initiator="${PAPERCLIP_RESUME_INITIATOR:-user (manual)}"

if [[ ! -f "$halt_file" ]]; then
  echo "INFO: Paperclip not currently halted — nothing to resume." >&2
  exit 0
fi

halt_reason="$(cat "$halt_file" 2>/dev/null || echo 'unknown')"
rm -f "$halt_file"

# Leere .paperclip/ aufräumen wenn nichts drin ist (clean state)
if [[ -d .paperclip ]] && [[ -z "$(ls -A .paperclip 2>/dev/null)" ]]; then
  rmdir .paperclip 2>/dev/null || true
fi

mkdir -p "$(dirname "$history_file")"
if [[ ! -f "$history_file" ]]; then
  printf '# Paperclip Halt-History\n\n' > "$history_file"
fi

{
  printf '## %s | resume | %s\n' "$timestamp" "$rationale"
  printf 'Initiator: %s\n' "$initiator"
  printf 'Previous halt-reason: %s\n' "$halt_reason"
  printf '\n'
} >> "$history_file"

echo "Paperclip resumed."
echo "  rationale         : $rationale"
echo "  previous-reason   : $halt_reason"
echo "  log               : $history_file"
echo ""
echo "Next CEO heartbeat will process tasks/killed-locks/ — expect rework_counter++."
