# Agent Adapter: Cursor AI

This directory contains the Cursor-specific implementation of Method Enterprise Builder Planning.

## Installation

### Express (recommended)

1. Download the repository as `.zip` from [GitHub](https://github.com/exchanet/method_enterprise_builder_planning_cursor) and unzip it
2. Open Cursor → New Agent chat
3. Paste the path to the unzipped folder and type:

```
Install this method so I can use it in Cursor: C:\Users\your-name\Downloads\method-enterprise_builder_planning
```

4. Close and reopen Cursor
5. Activate with: `/method-enterprise_builder`

### Manual

```bash
# Copy the Cursor adapter files to your project
cp -r agents/cursor/.cursor /path/to/your-project/
```

On Windows (PowerShell):
```powershell
Copy-Item -Recurse agents\cursor\.cursor C:\path\to\your-project\.cursor
```

## Activation

```
/method-enterprise_builder
"Plan enterprise feature: [description]"
"Design mission-critical [system]"
```

## Contents

```
.cursor/
├── rules/
│   ├── METHOD-ENTERPRISE-BUILDER-PLANNING.md  ← main rule (8-phase cycle)
│   ├── ENTERPRISE_ARCHITECTURE.md
│   ├── ENTERPRISE_SECURITY.md
│   ├── ENTERPRISE_SCALABILITY.md
│   ├── ENTERPRISE_COMPLIANCE.md
│   ├── ENTERPRISE_TESTING.md
│   └── ENTERPRISE_MICROTASK_PLANNER.md
└── skills/
    └── method-enterprise-builder-planning/
        ├── SKILL.md
        ├── architecture-planning.md
        ├── microtask-decomposition.md
        ├── testing-strategy.md
        └── ... (5 more sub-skills)
```

## Example workflow

1. **Activate the method:**
   ```
   /method-enterprise_builder
   
   Project: Payment authorization module for retail banking.
   Stack: Node.js + TypeScript + PostgreSQL + Kafka.
   Compliance: PCI-DSS, GDPR.
   SLA: 99.999%, p95 ≤ 800ms.
   ```

2. **The agent guides you through Phase 1** — generates `docs/enterprise-context.md` with system classification, stakeholder map, regulatory environment, integration points. Asks for confirmation before Phase 2.

3. **Phase 4 outputs the micro-task backlog** — 19 tasks, each ≤50 lines, with dependency order. Agent implements PAY-DOM-001 (Money value object), then validates:
   ```bash
   node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
     --task=src/payments/domain/money.ts
   ```
   Output: `✓ src/payments/domain/money.ts — PASS (38 effective lines)`

4. **Phase 5 creates ADRs** — agent generates `docs/adr/ADR-001-isolation.md`, validates:
   ```bash
   node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts \
     docs/adr/ADR-001-isolation.md
   ```
   Output: `✓ docs/adr/ADR-001-isolation.md — PASS`

5. **Phase 8 produces delivery report** with test evidence, coverage ≥99%, ADR status, compliance checklist.
