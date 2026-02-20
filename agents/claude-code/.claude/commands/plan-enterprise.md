# Command: /plan-enterprise

Starts the full 8-phase METHOD-ENTERPRISE-BUILDER-PLANNING cycle for a new enterprise system.

## Usage

```
/plan-enterprise [description of the system to build]
```

## What happens

1. I will ask you for any missing context (system type, stack, SLA, compliance requirements)
2. I will run the 8-phase cycle, asking for confirmation at each gate before proceeding
3. I will produce structured documents at each phase:
   - Phase 1 → `docs/enterprise-context.md`
   - Phase 3 → `docs/risk-matrix.md`
   - Phase 5 → `docs/adr/ADR-NNN-*.md`
   - Phase 8 → `docs/delivery-report.md`

## Example

```
/plan-enterprise

Payment authorization module for a retail banking platform.
Stack: Node.js + TypeScript + PostgreSQL + Kafka.
Compliance: PCI-DSS, GDPR.
SLA: 99.999%, p95 ≤ 800ms.
```

## Notes

- You can pause at any gate and resume later with `/plan-enterprise resume phase-N`
- You can validate ADRs at any time with `/validate-adr docs/adr/`
- You can validate micro-task sizes with `/lint-task src/module/file.ts`
