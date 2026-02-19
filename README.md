# Method Enterprise Builder Planning — Cursor AI

> **A granular planning and building methodology for enterprise-grade, mission-critical, and high-availability software systems, designed for Cursor AI agents.**

License: MIT | Cursor Compatible | Language: ES/EN

**Author:** Francisco J Bernades  
**GitHub:** [@exchanet](https://github.com/exchanet)  
**Repository:** [method_enterprise_builder_planning_cursor](https://github.com/exchanet/method_enterprise_builder_planning_cursor)

---

## Recommended to use in combination with

- [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) — Core + Packs architecture pattern
- [PDCA-T Method](https://github.com/exchanet/method_pdca-t_coding_Cursor) — Quality assurance cycle (≥99% test coverage)

---

## What is this?

**Method Enterprise Builder Planning** is a Cursor AI module (Rules + Skills + Packs) that provides a **systematic, granular planning and building framework** for enterprise software development.

The name **Builder** reflects the method's dual purpose: it does not only *plan* — it guides the complete *construction* of enterprise software, from initial context analysis through architecture decisions, security hardening, test strategy, and evidence-based delivery.

### Target software quality levels

| Standard | Description |
|---|---|
| Enterprise-grade | Large-scale, high-user-load, complex transactions, strict security |
| Mission-critical | Failure has catastrophic financial or operational impact |
| High-availability | 99.999% uptime architecture (5 nines HA design) |
| Security by design | Security integrated from architecture, not bolted on after |
| Scalable system engineering | Handles massive data and transaction growth without performance loss |
| ACID Compliance | Atomicity, Consistency, Isolation, Durability for all transactions |
| RegTech / Compliance | ISO 27001, ISO/IEC 25000 (SQuaRE), CMMI level 3+, GDPR, SOC2, PCI-DSS |

---

## Quick Start

### Express installation (recommended)

1. Download this repository as `.zip` from [GitHub](https://github.com/exchanet/method_enterprise_builder_planning_cursor) and unzip it
2. Copy the path to the unzipped folder — for example: `C:\Users\your-name\Downloads\method-enterprise_builder_planning`
3. Open Cursor → New Agent chat
4. Paste the path and write:

```
Install this method so I can use it in Cursor: C:\Users\your-name\Downloads\method-enterprise_builder_planning
```

5. Close and reopen Cursor
6. To use it, type in any chat: `/method-enterprise_builder`

### Manual installation

```bash
# Clone repository
git clone https://github.com/exchanet/method_enterprise_builder_planning_cursor.git
cd method_enterprise_builder_planning_cursor

# Copy to your project
cp -r .cursor /path/to/your/project/
```

Also install the companion methods:

```bash
# Method Modular Design (Core + Packs pattern)
git clone https://github.com/exchanet/method_modular_design_cursor.git
cp -r method_modular_design_cursor/.cursor /path/to/your/project/

# PDCA-T Method (quality assurance cycle)
git clone https://github.com/exchanet/method_pdca-t_coding_Cursor.git
cp -r method_pdca-t_coding_Cursor/.cursor/rules/METODO-PDCA-T.md /path/to/your/project/.cursor/rules/
cp -r method_pdca-t_coding_Cursor/.cursor/skills/metodo-pdca-t /path/to/your/project/.cursor/skills/
```

---

## Activation

Once installed, activate with any of these phrases:

```
/method-enterprise_builder

"Plan enterprise feature: [description]"
"Design mission-critical [system type]"
"Create ACID-compliant module for [feature]"
"Build high-availability [component] with 99.99% SLA"
"Implement security-first [module] with audit trail and GDPR compliance"
```

Cursor will guide you through the complete 8-phase cycle automatically.

---

## The 8-Phase Builder Cycle

```
PHASE 1: Enterprise Context Analysis
         │  System classification · Stakeholders · Regulatory environment
         ▼
PHASE 2: Non-Functional Requirements (NFR)
         │  Performance SLOs · Availability SLA · Scalability · Security · Compliance
         ▼
PHASE 3: Risk Matrix
         │  STRIDE threat model · Technical risk catalog · Mitigations
         ▼
PHASE 4: Micro-Task Decomposition (PDCA-T)
         │  Feature → Domain → Layer → ≤50-line micro-tasks with dependency DAG
         ▼
PHASE 5: Architecture Decisions (ADR)
         │  Pattern selection · C4 diagrams · Pack mapping · ADR per decision
         ▼
PHASE 6: Security & Compliance Mapping
         │  STRIDE per module · RBAC matrix · ACID boundaries · Compliance matrix
         ▼
PHASE 7: Test Strategy
         │  Test pyramid · Coverage gates · Load tests · CI quality gates
         ▼
PHASE 8: Delivery Report
         │  Evidence-based sign-off · Test metrics · Security · Compliance checklist
```

---

## Repository Structure

```
method-enterprise_builder_planning/
├── .cursor/
│   ├── rules/
│   │   ├── METHOD-ENTERPRISE-BUILDER-PLANNING.md  ← main rule (trigger: manual)
│   │   ├── ENTERPRISE_ARCHITECTURE.md
│   │   ├── ENTERPRISE_SECURITY.md
│   │   ├── ENTERPRISE_SCALABILITY.md
│   │   ├── ENTERPRISE_COMPLIANCE.md
│   │   ├── ENTERPRISE_TESTING.md
│   │   └── ENTERPRISE_MICROTASK_PLANNER.md
│   └── skills/
│       └── method-enterprise-builder-planning/
│           ├── SKILL.md                        ← main orchestrator skill
│           ├── architecture-planning.md
│           ├── security-planning.md
│           ├── scalability-planning.md
│           ├── compliance-planning.md
│           ├── microtask-decomposition.md
│           ├── testing-strategy.md
│           └── delivery-report.md
├── core/
│   └── planning-engine/                        ← core layer (infrastructure only)
├── packs/
│   ├── enterprise-architecture-pack/
│   ├── security-compliance-pack/
│   ├── high-availability-pack/
│   ├── testing-coverage-pack/
│   └── acid-compliance-pack/
├── examples/
│   ├── banking-system-plan.md
│   ├── high-availability-saas-plan.md
│   └── mission-critical-api-plan.md
├── docs/
│   ├── INSTALLATION.md
│   ├── USAGE.md
│   └── ENTERPRISE-STANDARDS-REFERENCE.md
├── README.md
└── README.es.md
```

---

## Available Packs

| Pack | Activated in phase | Provides |
|---|---|---|
| `enterprise-architecture-pack` | Phase 5 | ADR templates, C4 diagrams, pattern decision trees |
| `security-compliance-pack` | Phase 3, 6 | STRIDE templates, RBAC matrices, audit checklists |
| `high-availability-pack` | Phase 2, 5 | SLA/SLO definitions, failover strategies, chaos engineering |
| `testing-coverage-pack` | Phase 4, 7 | Test pyramid, coverage requirements, load test templates |
| `acid-compliance-pack` | Phase 4, 6 | Transaction boundaries, rollback strategies, idempotency |

---

## Related Methods

| Method | Role |
|---|---|
| [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) | Architecture pattern (Core + Packs) used for all generated code |
| [PDCA-T Method](https://github.com/exchanet/method_pdca-t_coding_Cursor) | Quality cycle (≥99% coverage) applied to every micro-task |

---

## License

MIT — see [LICENSE](LICENSE) file.

---

## Author

**Francisco J Bernades**  
GitHub: [@exchanet](https://github.com/exchanet)
