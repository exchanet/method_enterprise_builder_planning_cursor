# Agent Adapter: Claude Code (Anthropic)

Method Enterprise Builder Planning v2.0.0 — Claude Code Edition.

## Installation

```bash
# Copy CLAUDE.md to your project root (Claude Code reads it automatically)
cp agents/claude-code/CLAUDE.md /path/to/your-project/CLAUDE.md

# Copy commands for slash command support
cp -r agents/claude-code/.claude /path/to/your-project/.claude
```

## Available commands

| Command | Description |
|---|---|
| `/plan-enterprise [description]` | Start the full 8-phase planning cycle |
| `/design-critical [system]` | Mission-critical design (Phase 3+) |
| `/build-ha [component]` | High-availability build (Phase 4+) |
| `/validate-adr [path]` | Validate ADRs against enterprise rules |
| `/lint-task [file]` | Check micro-task line count |

## Differences from Cursor

| Aspect | Cursor | Claude Code |
|---|---|---|
| Activation | `/method-enterprise_builder` rule | `/plan-enterprise` command |
| Configuration | `.cursor/rules/` + `.cursor/skills/` | `CLAUDE.md` + `.claude/commands/` |
| Hook system | Interpreted by Cursor agent | Explicit commands per action |
| Validation | Inline in rules | `/validate-adr`, `/lint-task` commands |

## Example workflow

1. **Activate the method:**
   ```
   /plan-enterprise
   
   Payment authorization module for retail banking.
   Stack: Node.js + TypeScript + PostgreSQL + Kafka.
   Compliance: PCI-DSS, GDPR.
   SLA: 99.999%, p95 ≤ 800ms.
   ```

2. **I will ask clarifying questions** about missing context, then execute Phase 1, saving output to `docs/enterprise-context.md`. I'll ask for confirmation before proceeding to Phase 2.

3. **Phase 5 — After generating ADRs**, validate them:
   ```
   /validate-adr docs/adr/ADR-001-isolation.md
   ```
   I'll run the validator and report violations, if any.

4. **Phase 4/7 — After implementing micro-tasks**, validate line count:
   ```
   /lint-task src/payments/domain/money.ts
   ```
   I'll check effective lines and provide split suggestions if over 50.

5. **Phase 8 — Delivery report** generated with all test evidence, coverage metrics, and compliance sign-off.
