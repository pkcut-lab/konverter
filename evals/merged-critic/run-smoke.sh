#!/usr/bin/env bash
# evals/merged-critic/run-smoke.sh — Pre-Review-Pflicht (§2.8 Rubber-Stamping-Guard)
#
# Picks 5 random pass + 5 random fail fixtures, berechnet Binary-F1
# gegen annotations.yaml. Exit 0 iff F1 ≥ 0.85. Ergebnis in
# last-smoke-result.txt (JSON).
#
# Merged-Critic-Agent ruft dieses Script VOR jedem echten Review auf.

set -euo pipefail

ROOT="evals/merged-critic"
FIXTURES_DIR="$ROOT/fixtures"
ANNOTATIONS="$ROOT/annotations.yaml"
RESULT_FILE="$ROOT/last-smoke-result.txt"

N_PER_BUCKET="${1:-5}"

if [[ ! -d "$FIXTURES_DIR" ]]; then
  echo "ERROR: fixtures missing — run: node scripts/eval-fixture-gen.mjs" >&2
  exit 2
fi

node scripts/eval-runner.mjs smoke "$FIXTURES_DIR" "$ANNOTATIONS" "$N_PER_BUCKET" > "$RESULT_FILE"
exit_code=$?

# Pretty-print the metrics block for humans
node -e "
  const j = JSON.parse(require('fs').readFileSync('$RESULT_FILE', 'utf8'));
  const m = j.metrics;
  const t = j.thresholds;
  console.log(\`smoke: binary_f1=\${m.binary.f1.toFixed(3)} micro_f1=\${m.micro.f1.toFixed(3)} macro_f1=\${m.macro.f1.toFixed(3)} (\${m.binary.correct}/\${m.binary.total} verdict-correct)\`);
  console.log(\`thresholds: binary>=\${t.binary_min} macro>=\${t.macro_min}\`);
"

exit $exit_code
