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
  const t = j.thresholds;
  console.log(\`full: binary_f1=\${m.binary.f1.toFixed(3)} micro_f1=\${m.micro.f1.toFixed(3)} macro_f1=\${m.macro.f1.toFixed(3)} (\${m.binary.correct}/\${m.binary.total} verdict-correct)\`);
  console.log(\`thresholds: binary>=\${t.binary_min} macro>=\${t.macro_min}\`);

  // Verdict-Mismatches (binär)
  const mismatches = j.rows.filter((r) => r.expected !== r.actual);
  if (mismatches.length) {
    console.log(\`\nVerdict-Mismatches (\${mismatches.length}):\`);
    for (const r of mismatches) {
      console.log(\`  \${r.fixture}: expected=\${r.expected} actual=\${r.actual} failing=\${JSON.stringify(r.actual_failing)}\`);
    }
  }

  // Per-Check-Mismatches (actual vs expected Set-Diff)
  const perCheckIssues = j.rows
    .filter((r) => Array.isArray(r.expected_failing))
    .map((r) => {
      const eSet = new Set(r.expected_failing);
      const aSet = new Set(r.actual_failing);
      const missed = [...eSet].filter((c) => !aSet.has(c));
      const spurious = [...aSet].filter((c) => !eSet.has(c));
      return { fixture: r.fixture, missed, spurious };
    })
    .filter((r) => r.missed.length > 0 || r.spurious.length > 0);
  if (perCheckIssues.length) {
    console.log(\`\nPer-Check-Mismatches (\${perCheckIssues.length}):\`);
    for (const r of perCheckIssues) {
      const parts = [];
      if (r.missed.length) parts.push(\`missed=\${JSON.stringify(r.missed)}\`);
      if (r.spurious.length) parts.push(\`spurious=\${JSON.stringify(r.spurious)}\`);
      console.log(\`  \${r.fixture}: \${parts.join(' ')}\`);
    }
  }

  // Per-Check-F1-Breakdown
  console.log(\`\nPer-Check-F1:\`);
  for (const [cid, cm] of Object.entries(m.macro.per_check)) {
    if (cm.support === 0) continue;
    console.log(\`  \${cid.padEnd(12)} f1=\${cm.f1.toFixed(3)} P=\${cm.precision.toFixed(3)} R=\${cm.recall.toFixed(3)} support=\${cm.support}\`);
  }

  // Source-Breakdown (real-history vs synthetic)
  const buckets = { 'real-history': [], 'synthetic': [] };
  for (const r of j.rows) {
    if (r.source === 'real-history' || r.source === 'synthetic') buckets[r.source].push(r);
  }
  for (const [name, rows] of Object.entries(buckets)) {
    if (!rows.length) continue;
    let tp = 0, fp = 0, fn = 0;
    for (const r of rows) {
      const eSet = new Set(r.expected_failing || []);
      const aSet = new Set(r.actual_failing || []);
      for (const c of eSet) { if (aSet.has(c)) tp++; else fn++; }
      for (const c of aSet) { if (!eSet.has(c)) fp++; }
    }
    const p = tp + fp === 0 ? 1 : tp / (tp + fp);
    const r = tp + fn === 0 ? 1 : tp / (tp + fn);
    const f1 = p + r === 0 ? 0 : (2 * p * r) / (p + r);
    console.log(\`\nBucket \${name} (\${rows.length} fixtures): micro_f1=\${f1.toFixed(3)} tp=\${tp} fp=\${fp} fn=\${fn}\`);
  }
"

exit $exit_code
