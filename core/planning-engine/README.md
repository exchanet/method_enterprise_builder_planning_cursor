# Core: Planning Engine

The Planning Engine is the Core layer of Method Enterprise Planning. It contains only planning infrastructure — no business logic, no domain-specific rules, no compliance knowledge.

## Responsibilities

- Load and validate pack configurations (`pack.json` + `config.schema.json`)
- Orchestrate the 8-phase enterprise planning cycle
- Enforce quality gates before marking any phase or task as complete
- Manage the micro-task backlog state throughout a planning session
- Accumulate PDCA-T results from all micro-tasks
- Generate delivery reports from accumulated evidence

## What this Core does NOT do

- Does NOT know about specific compliance standards (that is `security-compliance-pack`)
- Does NOT contain architecture decision trees (that is `enterprise-architecture-pack`)
- Does NOT contain test templates (that is `testing-coverage-pack`)
- Does NOT contain HA patterns (that is `high-availability-pack`)
- Does NOT contain ACID guidance (that is `acid-compliance-pack`)

## Hooks exposed

| Hook | Triggered when |
|---|---|
| `onPlanningStart` | User activates METHOD-ENTERPRISE-BUILDER-PLANNING |
| `onPhaseComplete` | Any of the 8 planning phases completes |
| `onMicrotaskComplete` | A micro-task finishes PDCA-T cycle with ≥99% coverage |
| `onQualityGateCheck` | A quality gate is evaluated (pass or fail) |
| `onDeliveryReportGenerate` | Phase 8 is triggered to produce the delivery report |

## Slots exposed

| Slot | Used by |
|---|---|
| `phase-output` | All packs can contribute output sections to each phase |
| `microtask-template` | Packs can provide micro-task template extensions |
| `adr-template` | Architecture pack contributes ADR format |
| `delivery-report-section` | Each pack contributes its section to the delivery report |

## Configuration

See `config.schema.json` for the full configuration schema. Key settings:

- `project.type` — System classification (determines default quality requirements)
- `quality_gates` — Thresholds for coverage, complexity, vulnerability severity
- `sla` — Availability and latency targets
- `compliance` — Active compliance standards
- `packs` — Which enterprise packs are active
