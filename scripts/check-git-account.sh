#!/usr/bin/env bash
set -euo pipefail
EXPECTED="276936739+pkcut-lab@users.noreply.github.com"
ACTUAL="$(git config user.email || echo '')"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "❌ Wrong git account: got '$ACTUAL', expected '$EXPECTED'"
  echo "   This workspace is locked to pkcut-lab via includeIf."
  echo "   Fix: check ~/.gitconfig includeIf rule for this workspace."
  exit 1
fi
echo "✓ Git account correct: $ACTUAL"
