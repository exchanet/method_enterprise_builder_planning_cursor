#!/usr/bin/env bash
# validate-installation.sh — Verifies that an agent adapter installation is complete and functional.
#
# Usage:
#   bash agents/validate-installation.sh --agent=cursor --project=/path/to/project
#   bash agents/validate-installation.sh --agent=antigravity --project=/path/to/project

set -euo pipefail

AGENT=""
PROJECT_PATH=""

for arg in "$@"; do
  case $arg in
    --agent=*) AGENT="${arg#*=}" ;;
    --project=*) PROJECT_PATH="${arg#*=}" ;;
  esac
done

if [ -z "$AGENT" ] || [ -z "$PROJECT_PATH" ]; then
  echo "Usage: bash agents/validate-installation.sh --agent=<name> --project=<path>"
  echo "Agents: cursor, claude-code, kimi-code, windsurf, antigravity"
  exit 1
fi

if [ ! -d "$PROJECT_PATH" ]; then
  echo "❌ Project path not found: $PROJECT_PATH"
  exit 1
fi

cd "$PROJECT_PATH"
echo "🔍 Validating $AGENT installation in: $PROJECT_PATH"
echo ""

FAILED=0

check_file() {
  local label=$1
  local path=$2
  if [ -f "$path" ]; then
    echo "✅ $label: $path"
  else
    echo "❌ MISSING: $label ($path)"
    FAILED=1
  fi
}

check_dir() {
  local label=$1
  local path=$2
  if [ -d "$path" ]; then
    echo "✅ $label: $path/"
  else
    echo "❌ MISSING: $label ($path/)"
    FAILED=1
  fi
}

# ── Agent-specific validation ──────────────────────────────────────────────

case $AGENT in
  cursor)
    echo "--- Cursor AI ---"
    check_dir "Rules directory" ".cursor/rules"
    check_file "Main rule" ".cursor/rules/METHOD-ENTERPRISE-BUILDER-PLANNING.md"
    check_dir "Skills directory" ".cursor/skills/method-enterprise-builder-planning"
    check_file "Main skill" ".cursor/skills/method-enterprise-builder-planning/SKILL.md"
    ;;

  claude-code)
    echo "--- Claude Code ---"
    check_file "Main config" "CLAUDE.md"
    check_dir "Commands directory" ".claude/commands"
    check_file "Plan command" ".claude/commands/plan-enterprise.md"
    check_file "Validate command" ".claude/commands/validate-adr.md"
    ;;

  kimi-code)
    echo "--- Kimi Code ---"
    check_file "Main config" "KIMI.md"
    ;;

  windsurf)
    echo "--- Windsurf Cascade ---"
    check_file "Main config" "WINDSURF.md"
    ;;

  antigravity)
    echo "--- Google Antigravity ---"
    check_file "AGENTS.md config" "AGENTS.md"
    check_file "GEMINI.md config (optional)" "GEMINI.md"
    check_dir "Skills directory" ".agent/skills"
    check_file "Plan skill" ".agent/skills/plan-enterprise/SKILL.md"
    check_file "Phase 1 skill" ".agent/skills/phase-1-context/SKILL.md"
    ;;

  *)
    echo "❌ Unknown agent: $AGENT"
    echo "   Valid: cursor, claude-code, kimi-code, windsurf, antigravity"
    exit 1
    ;;
esac

# ── Shared validators (required for all agents) ────────────────────────────

echo ""
echo "--- Shared Validators ---"

VALIDATOR_BASE="packs/enterprise-architecture-pack/validators/adr-validator"
LINTER_BASE="packs/enterprise-microtask-planner-pack/validators/microtask-linter"

# Paths can be absolute or relative to method repo
if [ -d "$VALIDATOR_BASE" ]; then
  check_file "ADR Validator" "$VALIDATOR_BASE/src/index.ts"
elif [ -d "../$VALIDATOR_BASE" ]; then
  check_file "ADR Validator" "../$VALIDATOR_BASE/src/index.ts"
else
  echo "⚠️  ADR Validator not found (expected at $VALIDATOR_BASE)"
  echo "   Validators are part of the method repo, not copied to the project."
fi

if [ -d "$LINTER_BASE" ]; then
  check_file "Microtask Linter" "$LINTER_BASE/src/index.ts"
elif [ -d "../$LINTER_BASE" ]; then
  check_file "Microtask Linter" "../$LINTER_BASE/src/index.ts"
else
  echo "⚠️  Microtask Linter not found (expected at $LINTER_BASE)"
fi

# ── Node.js version check ──────────────────────────────────────────────────

echo ""
echo "--- Runtime Requirements ---"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 22 ]; then
    echo "✅ Node.js $NODE_VERSION (required: ≥22)"
  else
    echo "❌ Node.js $NODE_VERSION is too old (required: ≥22)"
    FAILED=1
  fi
else
  echo "❌ Node.js not found — required for validators"
  FAILED=1
fi

# ── Final result ───────────────────────────────────────────────────────────

echo ""
echo "─────────────────────────────────────────────"
if [ $FAILED -eq 0 ]; then
  echo "✅ Installation validated successfully"
  echo "   Agent: $AGENT"
  echo "   Project: $PROJECT_PATH"
  exit 0
else
  echo "❌ Installation validation FAILED"
  echo "   Review missing files above and re-run the installation."
  exit 1
fi
