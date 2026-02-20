#!/usr/bin/env bash
# adr-validator-ci.sh — CI wrapper for the ADR Validator tool.
# Runs the validator, outputs JUnit XML, and exits with appropriate code.
#
# Usage:
#   ./adr-validator-ci.sh                    Validate ./docs/adr/ (default)
#   ./adr-validator-ci.sh --dir=docs/adr     Custom directory
#   ./adr-validator-ci.sh --strict           Treat warnings as errors

set -euo pipefail

ADR_DIR="docs/adr"
STRICT=""
OUTPUT_FILE="reports/adr-validation.xml"
VALIDATOR="packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts"

for arg in "$@"; do
  case $arg in
    --dir=*) ADR_DIR="${arg#*=}" ;;
    --strict) STRICT="--strict" ;;
    --output=*) OUTPUT_FILE="${arg#*=}" ;;
  esac
done

mkdir -p "$(dirname "$OUTPUT_FILE")"

if [ ! -d "$ADR_DIR" ]; then
  echo "⚠️  ADR directory not found: $ADR_DIR"
  echo "   Create at least one ADR at $ADR_DIR/ADR-001-*.md before enabling this gate."
  exit 0
fi

ADR_COUNT=$(find "$ADR_DIR" -name "*.md" | wc -l | tr -d ' ')
if [ "$ADR_COUNT" -eq 0 ]; then
  echo "ℹ️  No ADR files found in $ADR_DIR — skipping validation."
  exit 0
fi

echo "🔍 Validating $ADR_COUNT ADR(s) in $ADR_DIR ..."

node --experimental-strip-types "$VALIDATOR" \
  $STRICT \
  --format=junit \
  --output="$OUTPUT_FILE" \
  "$ADR_DIR"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All ADRs passed enterprise validation."
else
  echo "❌ ADR validation FAILED. Fix errors before marking ADRs as Accepted."
  echo "   Report: $OUTPUT_FILE"
fi

exit $EXIT_CODE
