#!/usr/bin/env bash
# coverage-check.sh — Validates that test coverage meets the threshold
# Usage: bash coverage-check.sh --threshold=99

set -euo pipefail

THRESHOLD=99

for arg in "$@"; do
  case $arg in
    --threshold=*) THRESHOLD="${arg#*=}" ;;
  esac
done

echo "📊 Checking test coverage (threshold: ${THRESHOLD}%)"

# Check if coverage report exists
if [ ! -f "coverage/coverage-summary.json" ]; then
  echo "❌ Coverage report not found at coverage/coverage-summary.json"
  echo "   Run tests with coverage first: npm test -- --coverage"
  exit 1
fi

# Extract coverage percentages using Node.js (more reliable than jq/grep)
COVERAGE=$(node -e "
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf-8'));
const total = report.total;
const lines = total.lines.pct;
const branches = total.branches.pct;
const functions = total.functions.pct;
const statements = total.statements.pct;

console.log(JSON.stringify({ lines, branches, functions, statements }));
")

LINES=$(echo "$COVERAGE" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).lines)")
BRANCHES=$(echo "$COVERAGE" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).branches)")
FUNCTIONS=$(echo "$COVERAGE" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).functions)")
STATEMENTS=$(echo "$COVERAGE" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).statements)")

echo "Coverage results:"
echo "  Lines:      ${LINES}%"
echo "  Branches:   ${BRANCHES}%"
echo "  Functions:  ${FUNCTIONS}%"
echo "  Statements: ${STATEMENTS}%"
echo ""

FAILED=0

check_threshold() {
  local name=$1
  local value=$2
  local threshold=$3
  
  if (( $(echo "$value < $threshold" | bc -l) )); then
    echo "❌ $name coverage (${value}%) is below threshold (${threshold}%)"
    FAILED=1
  else
    echo "✅ $name coverage (${value}%) meets threshold (${threshold}%)"
  fi
}

check_threshold "Lines" "$LINES" "$THRESHOLD"
check_threshold "Branches" "$BRANCHES" "$THRESHOLD"
check_threshold "Functions" "$FUNCTIONS" "$THRESHOLD"
check_threshold "Statements" "$STATEMENTS" "$THRESHOLD"

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "❌ Coverage check FAILED"
  exit 1
fi

echo ""
echo "✅ Coverage check PASSED — All metrics ≥ ${THRESHOLD}%"
