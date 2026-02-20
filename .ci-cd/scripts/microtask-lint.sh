#!/usr/bin/env bash
# microtask-lint.sh — Validates that code files comply with the ≤N effective lines rule
# Usage: bash microtask-lint.sh --dir=src --max-lines=50

set -euo pipefail

DIR="src"
MAX_LINES=50
RECURSIVE=""

for arg in "$@"; do
  case $arg in
    --dir=*) DIR="${arg#*=}" ;;
    --max-lines=*) MAX_LINES="${arg#*=}" ;;
    --recursive) RECURSIVE="--recursive" ;;
    -r) RECURSIVE="--recursive" ;;
  esac
done

echo "🔍 Running microtask linter on: $DIR (max: ${MAX_LINES} effective lines)"

# Check if directory exists
if [ ! -d "$DIR" ]; then
  echo "⚠️  Directory not found: $DIR — skipping microtask linting"
  exit 0
fi

# Get absolute path to the microtask linter
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LINTER="$SCRIPT_DIR/packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts"

if [ ! -f "$LINTER" ]; then
  echo "❌ Microtask linter not found at: $LINTER"
  exit 1
fi

# Run the linter
echo "Running: node --experimental-strip-types $LINTER --dir=$DIR --max-lines=$MAX_LINES $RECURSIVE"
node --experimental-strip-types "$LINTER" --dir="$DIR" --max-lines="$MAX_LINES" $RECURSIVE

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All files comply with the ≤${MAX_LINES} effective lines rule"
else
  echo "❌ Some files exceed the ${MAX_LINES} effective lines limit"
  echo "   Review the output above and split oversized files into smaller micro-tasks"
fi

exit $EXIT_CODE
