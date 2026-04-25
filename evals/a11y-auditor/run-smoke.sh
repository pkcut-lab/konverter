#!/usr/bin/env bash
# evals/a11y-auditor/run-smoke.sh — Pre-Audit Pflicht (A11y-Auditor Agent)
#
# Führt die Playwright-A11y-Tests auf den Smoke-Slugs aus und prüft,
# ob F1 ≥ 0.85. Exit 0 iff threshold erfüllt. Ergebnis in
# last-smoke-result.txt (JSON).
#
# Voraussetzung: dist/ muss existieren (npm run build).
# a11y-auditor ruft dieses Script VOR jedem echten Audit auf.
#
# Usage:
#   bash evals/a11y-auditor/run-smoke.sh
#   bash evals/a11y-auditor/run-smoke.sh meter-zu-fuss

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RESULT_FILE="evals/a11y-auditor/last-smoke-result.txt"
THRESHOLD_F1="0.85"

# Smoke slugs — representative set; add more as specs are created.
SMOKE_SLUGS=("meter-zu-fuss")

# Allow override via args: bash run-smoke.sh slug1 slug2
if [[ $# -gt 0 ]]; then
  SMOKE_SLUGS=("$@")
fi

# --------------------------------------------------------------------------
# Pre-flight
# --------------------------------------------------------------------------

if [[ ! -d "$ROOT/dist" ]]; then
  echo "ERROR: dist/ missing — run: npm run build" >&2
  exit 2
fi

if [[ ! -d "$ROOT/tests/a11y" ]]; then
  echo "ERROR: tests/a11y/ missing — a11y infra not installed" >&2
  exit 2
fi

# --------------------------------------------------------------------------
# Run audits
# --------------------------------------------------------------------------

PASS=0
FAIL=0
DETAILS=()

for slug in "${SMOKE_SLUGS[@]}"; do
  spec="$ROOT/tests/a11y/${slug}.spec.ts"
  if [[ ! -f "$spec" ]]; then
    echo "WARN: No spec for slug '${slug}' — skipping" >&2
    continue
  fi

  echo "a11y-smoke: testing ${slug}..." >&2
  set +e
  npx --yes playwright test "tests/a11y/${slug}.spec.ts" \
    --reporter=list \
    --project=chromium \
    2>&1
  exit_code=$?
  set -e

  if [[ $exit_code -eq 0 ]]; then
    PASS=$((PASS + 1))
    DETAILS+=("{\"slug\":\"${slug}\",\"pass\":true}")
  else
    FAIL=$((FAIL + 1))
    DETAILS+=("{\"slug\":\"${slug}\",\"pass\":false}")
  fi
done

TOTAL=$((PASS + FAIL))

# --------------------------------------------------------------------------
# F1 calculation (binary: pass = TP, fail = FN+FP)
# --------------------------------------------------------------------------

if [[ $TOTAL -eq 0 ]]; then
  echo "ERROR: no specs were run" >&2
  exit 2
fi

# Use node for float arithmetic since bash only does integers
F1=$(node -e "
  const pass = ${PASS};
  const total = ${TOTAL};
  // For a smoke gate: all tests expected to pass → precision = pass/total, recall = pass/total
  const f1 = total > 0 ? (2 * pass) / (2 * pass + (total - pass)) : 0;
  process.stdout.write(f1.toFixed(4));
")

# --------------------------------------------------------------------------
# Write result file
# --------------------------------------------------------------------------

DETAILS_JSON=$(printf '%s,' "${DETAILS[@]}")
DETAILS_JSON="[${DETAILS_JSON%,}]"

node -e "
  const result = {
    timestamp: new Date().toISOString(),
    smoke_slugs: ${TOTAL},
    pass: ${PASS},
    fail: ${FAIL},
    f1: ${F1},
    threshold: ${THRESHOLD_F1},
    passed_gate: ${F1} >= ${THRESHOLD_F1},
    details: ${DETAILS_JSON}
  };
  require('fs').writeFileSync('${RESULT_FILE}', JSON.stringify(result, null, 2));
  console.log('smoke: f1=' + result.f1.toFixed(3) + ' (' + result.pass + '/' + result.smoke_slugs + ' slugs passed)');
  console.log('threshold: f1>=' + result.threshold + '  gate=' + (result.passed_gate ? 'PASS' : 'FAIL'));
"

# Exit based on threshold
node -e "
  const r = JSON.parse(require('fs').readFileSync('${RESULT_FILE}', 'utf8'));
  process.exit(r.passed_gate ? 0 : 1);
"
