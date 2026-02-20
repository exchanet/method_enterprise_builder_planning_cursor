#!/usr/bin/env bash
# migrate-to-v2.sh — Migrates a project from Method Enterprise Builder Planning v1.x to v2.0.0
#
# BREAKING CHANGE in v2.0.0:
#   Rules and skills are now distributed per agent adapter:
#   - Cursor: agents/cursor/.cursor/
#   - Claude Code: agents/claude-code/CLAUDE.md
#   - Kimi Code: agents/kimi-code/KIMI.md
#   - Windsurf: agents/windsurf/WINDSURF.md
#
# Usage:
#   # From within the method-enterprise_builder_planning directory:
#   bash scripts/migrate-to-v2.sh --project=/path/to/your-project --agent=cursor

set -euo pipefail

PROJECT_PATH=""
AGENT="cursor"
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --project=*) PROJECT_PATH="${arg#*=}" ;;
    --agent=*) AGENT="${arg#*=}" ;;
    --dry-run) DRY_RUN=true ;;
  esac
done

if [ -z "$PROJECT_PATH" ]; then
  echo "Usage: bash scripts/migrate-to-v2.sh --project=/path/to/project [--agent=cursor|claude-code|kimi-code|windsurf|antigravity] [--dry-run]"
  exit 1
fi

METHOD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Method directory: $METHOD_DIR"
echo "Project path:     $PROJECT_PATH"
echo "Agent adapter:    $AGENT"
echo "Dry run:          $DRY_RUN"
echo ""

case $AGENT in
  cursor)
    SRC="$METHOD_DIR/agents/cursor/.cursor"
    DST="$PROJECT_PATH/.cursor"
    if [ "$DRY_RUN" = true ]; then
      echo "[DRY RUN] Would copy: $SRC → $DST"
    else
      echo "Copying Cursor adapter..."
      cp -r "$SRC" "$DST"
      echo "✅ Cursor rules and skills installed at $DST"
    fi
    ;;

  claude-code)
    if [ "$DRY_RUN" = true ]; then
      echo "[DRY RUN] Would copy: CLAUDE.md → $PROJECT_PATH/CLAUDE.md"
      echo "[DRY RUN] Would copy: .claude/ → $PROJECT_PATH/.claude/"
    else
      cp "$METHOD_DIR/agents/claude-code/CLAUDE.md" "$PROJECT_PATH/CLAUDE.md"
      cp -r "$METHOD_DIR/agents/claude-code/.claude" "$PROJECT_PATH/.claude"
      echo "✅ Claude Code adapter installed at $PROJECT_PATH"
    fi
    ;;

  kimi-code)
    if [ "$DRY_RUN" = true ]; then
      echo "[DRY RUN] Would copy: KIMI.md → $PROJECT_PATH/KIMI.md"
    else
      cp "$METHOD_DIR/agents/kimi-code/KIMI.md" "$PROJECT_PATH/KIMI.md"
      echo "✅ Kimi Code adapter installed at $PROJECT_PATH"
    fi
    ;;

  windsurf)
    if [ "$DRY_RUN" = true ]; then
      echo "[DRY RUN] Would copy: WINDSURF.md → $PROJECT_PATH/WINDSURF.md"
    else
      cp "$METHOD_DIR/agents/windsurf/WINDSURF.md" "$PROJECT_PATH/WINDSURF.md"
      echo "✅ Windsurf adapter installed at $PROJECT_PATH"
    fi
    ;;

  antigravity)
    if [ "$DRY_RUN" = true ]; then
      echo "[DRY RUN] Would copy: AGENTS.md → $PROJECT_PATH/AGENTS.md"
      echo "[DRY RUN] Would copy: GEMINI.md → $PROJECT_PATH/GEMINI.md"
      echo "[DRY RUN] Would copy: .agent/skills/ → $PROJECT_PATH/.agent/skills/"
    else
      cp "$METHOD_DIR/agents/antigravity/AGENTS.md" "$PROJECT_PATH/AGENTS.md"
      cp "$METHOD_DIR/agents/antigravity/GEMINI.md" "$PROJECT_PATH/GEMINI.md"
      cp -r "$METHOD_DIR/agents/antigravity/.agent" "$PROJECT_PATH/.agent"
      echo "✅ Antigravity adapter installed at $PROJECT_PATH"
    fi
    ;;

  *)
    echo "❌ Unknown agent: $AGENT. Use: cursor, claude-code, kimi-code, windsurf, antigravity"
    exit 1
    ;;
esac

if [ "$DRY_RUN" = false ]; then
  echo ""
  echo "Migration complete. Next steps:"
  echo "1. Close and reopen your editor"
  echo "2. See docs/MIGRATION-v2.md for full v2.0.0 breaking changes"

  if [ "$AGENT" = "cursor" ]; then
    echo "3. Activate with: /method-enterprise_builder"
  elif [ "$AGENT" = "claude-code" ]; then
    echo "3. Activate with: /plan-enterprise [description]"
  elif [ "$AGENT" = "antigravity" ]; then
    echo "3. Activate with: @skill plan-enterprise"
  fi
fi
