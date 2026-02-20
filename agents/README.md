# Agent Adapters — Method Enterprise Builder Planning v2.0.0

The method supports 5 coding agents. Each adapter implements the same 8-phase protocol in the agent's native format.

## Quick comparison

| Agent | Activation | Install file | Validation command |
|---|---|---|---|
| **Cursor** | `/method-enterprise_builder` | `agents/cursor/.cursor/` → copy to project root | Inline in rules |
| **Claude Code** | `/plan-enterprise [desc]` | `CLAUDE.md` + `.claude/commands/` | `/validate-adr`, `/lint-task` |
| **Kimi Code** | Auto-detect keywords | `KIMI.md` → project root | `@terminal node ...` |
| **Windsurf** | `/plan-enterprise [desc]` | `WINDSURF.md` → project root | `runTerminalCommand` |
| **Antigravity** | Skill auto-detect | `AGENTS.md` + `.agent/skills/` | Agent command palette |

## Installation by agent

### Cursor AI

```bash
# macOS / Linux
cp -r agents/cursor/.cursor /path/to/your-project/

# Windows (PowerShell)
Copy-Item -Recurse agents\cursor\.cursor C:\path\to\your-project\.cursor
```

### Claude Code

```bash
cp agents/claude-code/CLAUDE.md /path/to/your-project/
cp -r agents/claude-code/.claude /path/to/your-project/
```

### Kimi Code

```bash
cp agents/kimi-code/KIMI.md /path/to/your-project/
```

### Windsurf

```bash
cp agents/windsurf/WINDSURF.md /path/to/your-project/
```

### Google Antigravity

```bash
cp agents/antigravity/AGENTS.md /path/to/your-project/
cp agents/antigravity/GEMINI.md /path/to/your-project/  # Optional (Gemini-specific)
cp -r agents/antigravity/.agent /path/to/your-project/
```

## Shared resources (agent-independent)

The following work with all agents without modification:

- `packs/` — 6 planning packs (content interpreted by any agent)
- `packs/enterprise-architecture-pack/validators/adr-validator/` — ADR Validator CLI
- `packs/enterprise-microtask-planner-pack/validators/microtask-linter/` — Microtask Linter CLI
- `.ci-cd/` — CI/CD templates for GitHub Actions, GitLab, Azure DevOps, Jenkins
- `examples/banking-walkthrough.md` — Complete executed walkthrough (all agents produce same structure)
