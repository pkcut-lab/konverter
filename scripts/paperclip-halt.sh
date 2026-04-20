#!/usr/bin/env bash
# scripts/paperclip-halt.sh — Kill-Switch für Paperclip-Pipeline
#
# Usage:  bash scripts/paperclip-halt.sh "<grund>"
# Erzeugt .paperclip/EMERGENCY_HALT mit dem grund als Inhalt.
# Nächster CEO-Heartbeat sieht die Datei und halted (siehe
# docs/paperclip/EMERGENCY_HALT.md + HEARTBEAT.md §4).

set -euo pipefail

if [[ $# -lt 1 || -z "$1" ]]; then
  echo "Usage: bash scripts/paperclip-halt.sh \"<grund>\"" >&2
  echo "Beispiel: bash scripts/paperclip-halt.sh \"critic-drift-suspected\"" >&2
  exit 2
fi

reason="$1"
halt_dir=".paperclip"
halt_file="$halt_dir/EMERGENCY_HALT"
history_file="memory/halt-history.md"
timestamp="$(date -Iseconds)"
initiator="${PAPERCLIP_HALT_INITIATOR:-user (manual)}"

mkdir -p "$halt_dir"
mkdir -p "$(dirname "$history_file")"

if [[ -f "$halt_file" ]]; then
  existing="$(cat "$halt_file" 2>/dev/null || echo 'unknown')"
  echo "WARN: Paperclip already halted (reason: $existing)" >&2
  echo "      New halt-request ignored. Resume first via:" >&2
  echo "      bash scripts/paperclip-resume.sh \"<rationale>\"" >&2
  exit 1
fi

printf '%s\n' "$reason" > "$halt_file"

if [[ ! -f "$history_file" ]]; then
  printf '# Paperclip Halt-History\n\n' > "$history_file"
fi

{
  printf '## %s | halt | %s\n' "$timestamp" "$reason"
  printf 'Initiator: %s\n' "$initiator"
  printf '\n'
} >> "$history_file"

echo "Paperclip halted."
echo "  reason : $reason"
echo "  flag   : $halt_file"
echo "  log    : $history_file"
echo ""
echo "Resume via: bash scripts/paperclip-resume.sh \"<rationale>\""
