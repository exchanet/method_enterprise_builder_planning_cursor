---
name: method-enterprise-builder-planning
version: 2.0.0
author: Francisco J Bernades (@exchanet)
description: Enterprise Builder Planning — 8-phase systematic methodology for mission-critical, high-availability software
model_preference: gemini-3-pro
skills_path: .agent/skills
safety:
  require_approval_for:
    - file_write
    - terminal_command
    - delete_file
  auto_approve_read_operations: true
  block_on_critical_errors: true
execution_modes:
  manager:
    parallel_agents: true
    artifact_types:
      - task_list
      - implementation_plan
      - adr_document
      - risk_matrix
      - delivery_report
    phase_concurrency:
      phase_1_and_2_sequential: true
      phase_4_and_5_parallel: true
  editor:
    synchronous: true
    sidebar_commands:
      - plan-enterprise
      - validate-adr
      - lint-task
---

# Method Enterprise Builder Planning — Antigravity Edition

> **Version:** 2.0.0 | **Author:** Francisco J Bernades | **Agent:** Google Antigravity (Gemini 3)

## System Nature

This is a **hybrid framework**: you interpret structured planning instructions (the 8-phase protocol) and generate actionable outputs at each step. The method also includes standalone executable tools (adr-validator, microtask-linter, CI/CD scripts) that run independently via terminal commands.

You apply judgment within the structured protocol — outputs are consistent but not character-identical across runs. This is the intended behavior.

---

## Skills Available

Antigravity loads skills progressively to prevent context saturation. Use metadata to discover the right skill, then load it on-demand.

| Skill | When to load |
|---|---|
| `plan-enterprise` | User requests enterprise system planning |
| `phase-1-context` | Phase 1 only (enterprise context analysis) |
| `phase-5-adr` | Phase 5 only (architecture decisions) |
| `phase-7-testing` | Phase 7 only (test strategy) |
| `validate-adr` | After generating any ADR in Phase 5 |
| `lint-microtask` | After implementing any micro-task in Phase 4/7 |

Load a skill: `@skill plan-enterprise`

---

## 8-Phase Protocol (Summary)

**Phase 1: Enterprise Context Analysis**
- Classify system (enterprise/mission-critical/HA/security-first)
- Build stakeholder map, regulatory environment, integration points
- Output: `docs/enterprise-context.md`
- Gate: User confirms classification before Phase 2

**Phase 2: Non-Functional Requirements**
- Performance SLOs (TPS, latency p95/p99)
- Availability SLA (%, RTO, RPO)
- Security baseline (auth, encryption)
- Gate: All SLOs numeric and measurable

**Phase 3: Risk Matrix**
- STRIDE analysis (6 threat categories)
- Technical risk catalog
- Gate: No CRITICAL risk unmitigated

**Phase 4: Micro-task Decomposition**
- Domain → Layer → ≤50-line micro-tasks
- Dependency DAG
- Gate: Validate each task with `@skill lint-microtask`

**Phase 5: Architecture Decisions (ADR)**
- Pattern selection (Monolith/Microservices/Hexagonal/CQRS/Event Sourcing)
- One ADR per decision (Context, Decision, ≥2 Alternatives, Consequences, Compliance)
- C4 diagrams (L1 + L2 minimum)
- Gate: Validate with `@skill validate-adr` before marking Accepted

**Phase 6: Security & Compliance Mapping**
- ACID transaction boundaries
- Compliance matrix per regulation
- RBAC + ABAC rules

**Phase 7: Test Strategy**
- Test pyramid (Unit 70% / Integration 20% / E2E 7% / Chaos 3%)
- ≥99% coverage requirement (floor, not ceiling)
- Load test scenarios (baseline, spike, soak)

**Phase 8: Delivery Report**
- Evidence-based sign-off
- Test results, coverage, security scan, compliance checklist
- STATUS: READY FOR PRODUCTION or BLOCKED

---

## Antigravity-Specific Features

### Manager Mode

In Manager view, you can execute multiple phases asynchronously:
- Phase 1 (Context) + Phase 2 (NFRs) can run in parallel if context is clear
- Phase 4 (Decomposition) + Phase 5 (ADR drafting) can run in parallel

Generate Artifacts for each phase completion:
- **Task List artifact** for Phase 4 backlog
- **ADR Document artifact** for each decision in Phase 5
- **Delivery Report artifact** for Phase 8

### Editor Mode

Synchronous workflow with sidebar commands. Use terminal integration:

```bash
# Validate ADRs
@terminal node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/

# Lint microtasks
@terminal node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --task=src/file.ts
```

---

## Key Constraints (always enforce)

1. **≤50 effective lines per micro-task** — validate with `@skill lint-microtask`
2. **≥99% test coverage** — floor, not ceiling; assertions must verify behavior
3. **ACID for all writes** — define transaction boundary in Phase 6
4. **ADR for every significant decision** — validate with `@skill validate-adr`
5. **STRIDE before every module** — document threats in Phase 3

---

## Related Methods

- [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) — Core + Packs architecture
- [PDCA-T Method](https://github.com/exchanet/method_pdca-t_coding_Cursor) — Quality cycle (≥99% coverage)
