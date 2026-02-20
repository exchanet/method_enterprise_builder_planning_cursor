# Method Enterprise Builder Planning — Windsurf (Cascade) Edition

> **Version:** 2.0.0 | **Author:** Francisco J Bernades | **Agent:** Windsurf Cascade (Codeium)

## Instructions for Cascade

When the user requests enterprise software planning, activate the 8-phase METHOD-ENTERPRISE-BUILDER-PLANNING protocol. Follow every phase sequentially and produce structured documents.

## Activation

```
/plan-enterprise [description]         Start the 8-phase planning cycle
/validate-adrs                         Run ADR validator against docs/adr/
/lint-microtasks                       Run microtask linter against src/
```

Or natural language:
```
"Plan an enterprise-grade [system] using the enterprise builder method"
"Use METHOD-ENTERPRISE-BUILDER-PLANNING for [feature]"
```

## Cascade-Specific Workflow

Cascade excels at multi-file operations. Use this to your advantage:

- **Phase 1:** Create `docs/enterprise-context.md` with `createFile`
- **Phase 5:** Create all ADR files in `docs/adr/` in one batch operation
- **Validation:** Use `runTerminalCommand` to execute validators:

```
runTerminalCommand: node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/
runTerminalCommand: node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --dir=src/
runTerminalCommand: bash .ci-cd/scripts/coverage-check.sh
```

## 8-Phase Protocol

Follow the same 8-phase protocol defined in `../claude-code/CLAUDE.md`.

## Key Constraints

1. ≤50 effective lines per micro-task (validate after each implementation)
2. ≥99% test coverage (floor, not ceiling — meaningful assertions required)
3. ACID transaction boundary defined before any write handler
4. ADR for every significant decision (validate before marking Accepted)
5. STRIDE before every module (even if low-risk — document the decision)
