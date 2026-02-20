# Migration Guide: v1.x → v2.0.0

## Breaking changes

### 1. Rules and skills moved to `agents/cursor/.cursor/`

**v1.x installation:**
```bash
cp -r .cursor /path/to/your-project/
```

**v2.0.0 installation (Cursor):**
```bash
cp -r agents/cursor/.cursor /path/to/your-project/
```

The root `.cursor/` directory still exists in the repo for backwards compatibility and direct Cursor usage within the method repo itself. However, for installing into your own project, always use `agents/cursor/.cursor/`.

### 2. New `agents/` directory structure

All agent adapters are now organized under `agents/`:

```
agents/
├── cursor/          ← Cursor AI (.cursor/rules + .cursor/skills)
├── claude-code/     ← Claude Code (CLAUDE.md + .claude/commands/)
├── kimi-code/       ← Kimi Code (KIMI.md)
└── windsurf/        ← Windsurf Cascade (WINDSURF.md)
```

### 3. System nature updated

The project is now documented as a **hybrid framework** (structured prompts + standalone executable tools), not a pure prompt system. The `System nature` note in the main rule has been updated accordingly.

---

## Migration steps

### For existing Cursor users (v1.x → v2.0.0)

**Option A — Automated (recommended):**

```bash
# From the method-enterprise_builder_planning directory:

# macOS / Linux
bash scripts/migrate-to-v2.sh --project=/path/to/your-project --agent=cursor

# Windows (PowerShell)
.\scripts\migrate-to-v2.ps1 -ProjectPath "C:\path\to\your-project" -Agent cursor
```

**Option B — Manual:**

```bash
# Remove old v1.x files
rm -rf /path/to/your-project/.cursor/rules/METHOD-ENTERPRISE-BUILDER-PLANNING.md
rm -rf /path/to/your-project/.cursor/rules/ENTERPRISE_*.md
rm -rf /path/to/your-project/.cursor/skills/method-enterprise-builder-planning/

# Install v2.0.0 Cursor adapter
cp -r agents/cursor/.cursor /path/to/your-project/
```

**Close and reopen Cursor after migration.**

### For new installations

Follow the installation guide in `docs/INSTALLATION.md`.

---

## New features in v2.0.0

| Feature | Location | Description |
|---|---|---|
| ADR Validator | `packs/enterprise-architecture-pack/validators/adr-validator/` | CLI tool validating ADRs against 11 enterprise rules |
| Microtask Linter | `packs/enterprise-microtask-planner-pack/validators/microtask-linter/` | Validates ≤50 effective lines per file, with split suggestions |
| CI/CD Templates | `.ci-cd/` | GitHub Actions, GitLab CI, Azure DevOps, Jenkins quality gate templates |
| Claude Code adapter | `agents/claude-code/` | Full 8-phase protocol for Claude Code |
| Kimi Code adapter | `agents/kimi-code/` | Keyword-triggered 8-phase protocol for Kimi Code |
| Windsurf adapter | `agents/windsurf/` | 8-phase protocol for Windsurf Cascade |
| Migration scripts | `scripts/` | Automated migration helpers for bash (macOS/Linux) and PowerShell (Windows) |

---

## Rollback to v1.x

If you need to revert to v1.x behaviour:

```bash
git checkout v1.x -- .cursor/
```

Or reinstall from the v1.x release tag on GitHub:
```bash
git checkout tags/v1.0.0 agents/cursor/.cursor/
cp -r agents/cursor/.cursor /path/to/your-project/
```
