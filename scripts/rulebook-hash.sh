#!/usr/bin/env bash
# rulebook-hash.sh — CEO Heartbeat Step 4 (§7.10 Auto-Snapshot Autonomie)
#
# INVOCATION-ORDER: Pro Heartbeat, nach Kill-Switch-Check + Git-Account-Check.
# Model: Auto-Snapshot + Daily-Digest-Notiz, KEINE Blockade auf Hash-Drift
# (v0.9-Verhalten). Blockade nur bei explizitem rulebook-conflict-Ticket vom
# Builder.
#
# Exit 0 immer (auto-resolve).
set -euo pipefail

HASH_FILE="memory/rulebook-hashes.json"
DIGEST_DIR="inbox/daily-digest"
TODAY=$(date -I)
DIGEST_FILE="${DIGEST_DIR}/${TODAY}.md"

RULEBOOKS=(
  "PROJECT.md"
  "CONVENTIONS.md"
  "STYLE.md"
  "CONTENT.md"
  "TRANSLATION.md"
  "DESIGN.md"
  "BRAND_GUIDE.md"
  "CLAUDE.md"
)

mkdir -p "$(dirname "$HASH_FILE")" "$DIGEST_DIR"

# Initialize hash-file if missing
if [[ ! -f "$HASH_FILE" ]]; then
  echo "{}" > "$HASH_FILE"
fi

# Ensure digest-file exists with header
if [[ ! -f "$DIGEST_FILE" ]]; then
  cat > "$DIGEST_FILE" <<EOF
# Daily-Digest — ${TODAY}

## Rulebook-Snapshots
EOF
fi

snapshots_added=0

for rb in "${RULEBOOKS[@]}"; do
  if [[ ! -f "$rb" ]]; then
    continue
  fi
  current=$(sha256sum "$rb" | cut -d' ' -f1)
  expected=$(node -e "
    const h = JSON.parse(require('fs').readFileSync('$HASH_FILE', 'utf8'));
    process.stdout.write(h['$rb'] ?? '');
  ")
  if [[ "$current" != "$expected" ]]; then
    # Update hash-file
    node -e "
      const fs = require('fs');
      const h = JSON.parse(fs.readFileSync('$HASH_FILE', 'utf8'));
      h['$rb'] = '$current';
      fs.writeFileSync('$HASH_FILE', JSON.stringify(h, null, 2) + '\n');
    "
    echo "- ${rb}: ${current:0:16}… (was: ${expected:0:16}…)" >> "$DIGEST_FILE"
    snapshots_added=$((snapshots_added + 1))
  fi
done

if [[ $snapshots_added -gt 0 ]]; then
  echo "rulebook-hash: ${snapshots_added} snapshots written to ${DIGEST_FILE}" >&2
else
  echo "rulebook-hash: no drift detected" >&2
fi

exit 0
