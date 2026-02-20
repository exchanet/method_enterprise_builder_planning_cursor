# Agent Adapter: Windsurf (Cascade)

Method Enterprise Builder Planning v2.0.0 — Windsurf Cascade Edition.

## Installation

```bash
cp agents/windsurf/WINDSURF.md /path/to/your-project/WINDSURF.md
```

Cascade reads `WINDSURF.md` from the project root as a global instruction file.

## Activation

```
/plan-enterprise [description]
"Plan an enterprise-grade payment system using the enterprise builder method"
```

## Cascade advantages

- Batch multi-file creation (Phase 5 ADRs created in one step)
- `runTerminalCommand` for in-context validator execution
- Persistent context across the full 8-phase cycle

## Example workflow

1. **Activate the method:**
   ```
   /plan-enterprise
   
   Build a high-availability SaaS billing system.
   Stack: Python + FastAPI + PostgreSQL + Redis.
   SLA: 99.95%, p95 ≤ 500ms.
   ```

2. **Cascade executes Phase 1** — generates `docs/enterprise-context.md` using `createFile`. Asks for confirmation.

3. **Phase 5 batch ADR creation** — Cascade creates all ADRs in `docs/adr/` in one multi-file operation, then validates:
   ```
   runTerminalCommand: node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/
   ```

4. **Phase 7 microtask lint** — validates all source files:
   ```
   runTerminalCommand: node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --dir=src/ --recursive
   ```

5. **Phase 8 delivery report** with full test evidence and compliance checklist.
