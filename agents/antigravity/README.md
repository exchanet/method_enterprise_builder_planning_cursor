# Agent Adapter: Google Antigravity

> **For:** Google Antigravity IDE (Gemini-powered agent-first development)

## Overview

This adapter provides a progressive-loading, Skills-based architecture optimized for Antigravity's Manager/Editor dual interface and Gemini 3 model family (Pro, Deep Think, Flash).

## Installation

### 1. Copy configuration files to your project

```bash
# From the method repo root
cp agents/antigravity/AGENTS.md /path/to/your-project/AGENTS.md
cp agents/antigravity/GEMINI.md /path/to/your-project/GEMINI.md  # Optional (Gemini-specific)
cp -r agents/antigravity/.agent /path/to/your-project/.agent
```

### 2. Verify installation

```bash
bash agents/validate-installation.sh --agent=antigravity --project=/path/to/your-project
```

Expected output:
```
✅ AGENTS.md config: AGENTS.md
✅ Skills directory: .agent/skills/
✅ Plan skill: .agent/skills/plan-enterprise/SKILL.md
✅ Phase 1 skill: .agent/skills/phase-1-context/SKILL.md
✅ Node.js 22.x.x (required: ≥22)
✅ Installation validated successfully
```

### 3. Activate in Antigravity

Open your project in Antigravity. The IDE auto-detects `AGENTS.md` and loads the method configuration.

To start enterprise planning:
```
@skill plan-enterprise

I need to design a payment authorization module for retail banking.
Stack: Node.js + TypeScript + PostgreSQL + Kafka.
Compliance: PCI-DSS, GDPR.
SLA: 99.999%, p95 ≤ 800ms.
```

Antigravity will load the `plan-enterprise` skill and guide you through the 8-phase protocol.

---

## Key Differences from Other Agents

| Aspect | Antigravity | Cursor / Claude Code |
|---|---|---|
| **Configuration** | `AGENTS.md` + `.agent/skills/` | `.cursor/rules/` or `CLAUDE.md` |
| **Activation** | Skills auto-detected by keywords | `/method-enterprise_builder` command |
| **Phase loading** | Progressive (load skill per phase) | All rules loaded at start |
| **Validation** | Terminal integration via `@terminal` | Inline commands |
| **Model selection** | Gemini 3 Pro (default), Deep Think (ADRs), Flash (simple phases) | Fixed model per agent |
| **Manager Mode** | Asynchronous multi-agent + artifacts | Single synchronous agent |

---

## Skills Available

| Skill | Purpose | When to load |
|---|---|---|
| `plan-enterprise` | Full 8-phase orchestrator | Starting a new planning session |
| `phase-1-context` | Standalone Phase 1 | Context analysis without full cycle |
| `phase-3-risks` | Standalone Phase 3 | STRIDE + risk matrix |
| `phase-5-adr` | Standalone Phase 5 | Architecture decisions only |
| `phase-7-testing` | Standalone Phase 7 | Test strategy only |
| `validate-adr` | ADR validation | After generating any ADR |
| `lint-microtask` | Micro-task line validation | After implementing code |

To load a skill explicitly: `@skill phase-5-adr`

---

## Manager Mode (Antigravity-Specific)

In Manager view, you can run multiple agents asynchronously:

```yaml
# Example: Phase 4 (Decomposition) + Phase 5 (ADR drafting) in parallel
execution_modes:
  manager:
    parallel_agents: true
    phase_4_and_5_parallel: true
```

Artifacts generated:
- **Task List** (Phase 4 backlog)
- **ADR Document** (one per decision in Phase 5)
- **Delivery Report** (Phase 8)

---

## Editor Mode

Synchronous workflow with terminal integration:

```bash
# Validate all ADRs
@terminal node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/

# Lint a single microtask
@terminal node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --task=src/money.ts
```

---

## Gemini-Specific Optimizations (GEMINI.md)

If you use `GEMINI.md` instead of `AGENTS.md`, the following optimizations are enabled:

| Phase | Optimized model | Reason |
|---|---|---|
| Phase 1-2 | **gemini-3-flash** | Classification and NFRs are fast tasks |
| Phase 5 | **gemini-3-deep-think** | Architecture decisions need extended reasoning |
| Phase 7 | **gemini-3-pro** | Balanced speed and quality for test strategy |

Grounding is enabled for compliance standards (PCI-DSS, GDPR, ISO 27001) to retrieve the latest regulation versions.

---

## Example Workflow

1. **Open your project in Antigravity.**

2. **Trigger the method:**
   ```
   @skill plan-enterprise
   
   Payment authorization for SaaS billing platform.
   Stack: Python + FastAPI + PostgreSQL + Redis.
   SLA: 99.95%, p95 ≤ 500ms.
   ```

3. **I execute Phase 1** — classify system, map stakeholders, identify regulations. Output: `docs/enterprise-context.md`.

4. **Phase 4 generates micro-task backlog** — 14 tasks, each ≤50 lines.

5. **I implement PAY-DOM-001 (Money value object) and validate:**
   ```
   @terminal node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --task=src/money.py
   ```
   Output: `✓ src/money.py — PASS (42 effective lines)`

6. **Phase 5 creates ADR-001** (Transaction Isolation). Validation:
   ```
   @skill validate-adr
   @terminal node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/ADR-001-isolation.md
   ```
   Output: `✓ docs/adr/ADR-001-isolation.md — PASS`

7. **Phase 8 delivery report** generated with all test evidence, coverage ≥99%, compliance sign-off.

---

## Troubleshooting

### Skills not loading

**Issue:** `@skill plan-enterprise` not recognized.

**Solution:**
1. Verify `AGENTS.md` is in the project root
2. Check `skills_path` in `AGENTS.md` matches the actual directory (`.agent/skills`)
3. Restart Antigravity

### Validators not found

**Issue:** `node: command not found` when running validators.

**Solution:** Install Node.js ≥22:
```bash
# macOS (Homebrew)
brew install node@22

# Linux (nvm)
nvm install 22
nvm use 22

# Windows (Scoop)
scoop install nodejs-lts
```

### Permission denied for terminal commands

**Issue:** `@terminal` commands fail with "requires approval".

**Solution:** Update `AGENTS.md` safety settings:
```yaml
safety:
  require_approval_for: [file_write]  # Remove terminal_command from this list
  auto_approve_read_operations: true
```

---

## Related Documentation

- [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor)
- [PDCA-T Method](https://github.com/exchanet/method_pdca-t_coding_Cursor)
- [Full 8-Phase Walkthrough](../../examples/banking-walkthrough.md)
