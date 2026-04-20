#!/usr/bin/env bash
# evals/merged-critic/run-full.sh — volle Suite (40 Fixtures)
#
# Für Trend-Check nach je 10 Reviews (siehe agents/merged-critic.md §5).
# Ergebnis in last-full-result.txt (JSON).

set -euo pipefail

ROOT="evals/merged-critic"
FIXTURES_DIR="$ROOT/fixtures"
ANNOTATIONS="$ROOT/annotations.yaml"
RESULT_FILE="$ROOT/last-full-result.txt"

if [[ ! -d "$FIXTURES_DIR" ]]; then
  echo "ERROR: fixtures missing — run: node scripts/eval-fixture-gen.mjs" >&2
  exit 2
fi

node scripts/eval-runner.mjs suite "$FIXTURES_DIR" "$ANNOTATIONS" > "$RESULT_FILE"
exit_code=$?

node -e "
  const j = JSON.parse(require('fs').readFileSync('$RESULT_FILE', 'utf8'));
  const m = j.metrics;
  console.log(\`full: F1=\${m.f1.toFixed(3)} P=\${m.precision.toFixed(3)} R=\${m.recall.toFixed(3)} (\${m.correct}/\${m.total})\`);
  const mismatches = j.rows.filter((r) => r.expected !== r.actual);
  if (mismatches.length) {
    console.log(\`\nMismatches (\${mismatches.length}):\`);
    for (const r of mismatches) {
      console.log(\`  \${r.fixture}: expected=\${r.expected} actual=\${r.actual} failing=\${JSON.stringify(r.actual_failing)}\`);
    }
  }
"

exit $exit_code
