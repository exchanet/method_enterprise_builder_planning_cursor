---
name: METHOD-ENTERPRISE-BUILDER-PLANNING
trigger: manual
activation: "/method-enterprise_builder | /method-enterprise-builder-planning | enterprise feature | mission-critical | high-availability | ACID-compliant | security by design | RegTech | CMMI | ISO 27001 | 99.999%"
version: 1.0.0
integrates_with:
  - METHOD_MODULAR_DESIGN
  - METODO-PDCA-T
  - ENTERPRISE_ARCHITECTURE
  - ENTERPRISE_SECURITY
  - ENTERPRISE_SCALABILITY
  - ENTERPRISE_COMPLIANCE
  - ENTERPRISE_TESTING
  - ENTERPRISE_MICROTASK_PLANNER
---

# METHOD-ENTERPRISE-BUILDER-PLANNING

## Purpose

A systematic 8-phase planning methodology for designing and building enterprise-grade, mission-critical, and high-availability software systems. Every output follows the Core + Packs modular pattern (Method Modular Design) and is validated through the PDCA-T quality cycle (≥99% test coverage).

## When to Activate

Activate this method when any of the following apply:
- Building systems with >1000 concurrent users
- Payment, financial, or regulated data processing
- Zero-downtime or HA (99.9%+) requirements
- Compliance obligations (GDPR, SOC2, ISO 27001, PCI-DSS)
- Audit trail or traceability requirements
- Multi-tenant SaaS or B2B enterprise products
- Any system classified as mission-critical

---

## The 8-Phase Enterprise Planning Cycle

```
PHASE 1: ENTERPRISE CONTEXT ANALYSIS
         │
         ▼
PHASE 2: NON-FUNCTIONAL REQUIREMENTS (NFR)
         │
         ▼
PHASE 3: RISK MATRIX (STRIDE + Technical)
         │
         ▼
PHASE 4: MICRO-TASK DECOMPOSITION (PDCA-T)
         │
         ▼
PHASE 5: ARCHITECTURE DECISIONS (ADR)
         │
         ▼
PHASE 6: SECURITY & COMPLIANCE MAPPING
         │
         ▼
PHASE 7: TEST STRATEGY
         │
         ▼
PHASE 8: DELIVERY REPORT WITH METRICS
```

---

## Phase 1: Enterprise Context Analysis

**Purpose:** Understand the full enterprise context before writing a single line of code.

**Required outputs:**

```markdown
### System Classification
- [ ] Enterprise-grade (high load, complex transactions)
- [ ] Mission-critical (failure = catastrophic financial/operational impact)
- [ ] High-availability (99.9% / 99.99% / 99.999% SLA required)
- [ ] Security-first (regulated data, PII, financial data)
- [ ] ACID-required (transactional integrity mandatory)

### Stakeholder Map
| Stakeholder | Role | Key concern |
|---|---|---|
| [name] | [role] | [main concern] |

### Regulatory Environment
| Regulation | Scope | Requirement |
|---|---|---|
| [GDPR/SOC2/ISO27001/PCI-DSS/...] | [what it covers] | [key obligation] |

### Integration Points
| System | Protocol | SLA dependency |
|---|---|---|
| [external system] | [REST/gRPC/event] | [dependency criticality] |
```

---

## Phase 2: Non-Functional Requirements (NFR)

**Purpose:** Define measurable non-functional requirements before architecture decisions.

**Required NFR template per system:**

```markdown
### Performance
- Throughput target: [X requests/second]
- Latency target (p95): [X ms]
- Latency target (p99): [X ms]
- Data volume: [X GB/TB at year 1, Y GB/TB at year 3]

### Availability
- Required SLA: [99% / 99.9% / 99.99% / 99.999%]
- Planned downtime window: [X minutes/month]
- RTO (Recovery Time Objective): [X minutes]
- RPO (Recovery Point Objective): [X minutes]

### Scalability
- Initial load: [X users / Y transactions]
- Peak load: [X users / Y transactions]
- Growth projection: [X% per quarter]
- Scaling strategy: [horizontal / vertical / both]

### Security
- Authentication: [OAuth2 / SAML / custom]
- Authorization model: [RBAC / ABAC / ACL]
- Data classification: [public / internal / confidential / restricted]
- Encryption at rest: [AES-256 / none]
- Encryption in transit: [TLS 1.3 / TLS 1.2]

### Compliance
- Standards: [ISO 27001 / SOC2 / GDPR / PCI-DSS / HIPAA]
- Audit log retention: [X years]
- Data residency: [region / country]
```

---

## Phase 3: Risk Matrix (STRIDE + Technical)

**Purpose:** Identify and mitigate all risks before decomposition.

### STRIDE Threat Matrix (per module)

For each module, complete the STRIDE analysis:

```markdown
| Threat | Component | Attack Vector | Impact (H/M/L) | Mitigation |
|---|---|---|---|---|
| Spoofing | [component] | [how] | H/M/L | [control] |
| Tampering | [component] | [how] | H/M/L | [control] |
| Repudiation | [component] | [how] | H/M/L | [control] |
| Information Disclosure | [component] | [how] | H/M/L | [control] |
| Denial of Service | [component] | [how] | H/M/L | [control] |
| Elevation of Privilege | [component] | [how] | H/M/L | [control] |
```

### Technical Risk Catalog

```markdown
| Risk | Probability (H/M/L) | Impact (H/M/L) | Risk Score | Mitigation Strategy |
|---|---|---|---|---|
| Database single point of failure | M | H | HIGH | Multi-AZ replication |
| Cache invalidation inconsistency | H | M | HIGH | TTL + event-driven invalidation |
| Third-party API degradation | M | H | HIGH | Circuit Breaker + fallback |
| Schema migration failure | L | H | MEDIUM | Blue-green migration + rollback |
```

---

## Phase 4: Micro-Task Decomposition (PDCA-T)

**Purpose:** Break the feature into testable micro-tasks of ≤50 lines each. Apply PDCA-T per micro-task.

### Decomposition algorithm

```
Feature
  └─ Domain 1
      └─ Layer: Infrastructure
          └─ Micro-task 1.1 (≤50 lines) → PDCA-T cycle
          └─ Micro-task 1.2 (≤50 lines) → PDCA-T cycle
      └─ Layer: Domain/Business
          └─ Micro-task 1.3 (≤50 lines) → PDCA-T cycle
      └─ Layer: Application/API
          └─ Micro-task 1.4 (≤50 lines) → PDCA-T cycle
  └─ Domain 2
      └─ [same structure]
```

### Micro-task template

```markdown
## Micro-task [ID]: [name]

**Objective:** [what this task achieves, one sentence]
**Layer:** [infrastructure / domain / application / interface]
**Depends on:** [micro-task IDs that must complete first]
**Max lines:** 50
**Pack:** [which pack this belongs to]

### Functional requirements
- [ ] [requirement 1]
- [ ] [requirement 2]

### Acceptance criteria
- [ ] [criterion 1 — measurable]
- [ ] [criterion 2 — measurable]

### Test coverage required
- [ ] Happy path test
- [ ] Error/exception test
- [ ] Edge case test
- [ ] Security test (if applicable)
- [ ] Performance test (if applicable)
- Minimum coverage: **≥99%**

### PDCA-T sub-cycle
- [ ] Plan: requirements understood
- [ ] Do: implementation ≤50 lines
- [ ] Check: auto-review passed
- [ ] Act: tests written and passing
- [ ] Test: coverage ≥99% confirmed
```

---

## Phase 5: Architecture Decisions (ADR)

**Purpose:** Document every significant architecture decision with context, alternatives, and rationale.

**Reference:** See `ENTERPRISE_ARCHITECTURE.md` for patterns and decision trees.

### ADR template

```markdown
## ADR-[NNN]: [Decision Title]

**Date:** [YYYY-MM-DD]
**Status:** Proposed | Accepted | Deprecated | Superseded

### Context
[What forces led to this decision? What problem are we solving?]

### Decision
[The decision made, stated clearly.]

### Alternatives considered
| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|
| [option A] | [pros] | [cons] | [reason] |

### Consequences
- **Positive:** [what becomes easier]
- **Negative:** [what becomes harder or is accepted as trade-off]
- **Risks:** [what could go wrong]

### Compliance impact
- [ ] No compliance impact
- [ ] Requires compliance review: [specify standard]
```

---

## Phase 6: Security & Compliance Mapping

**Purpose:** Map security controls and compliance obligations to each module and micro-task.

**Reference:** See `ENTERPRISE_SECURITY.md` and `ENTERPRISE_COMPLIANCE.md`.

### Security controls checklist per module

```markdown
### Module: [name]

#### Authentication & Authorization
- [ ] Authentication mechanism defined
- [ ] RBAC roles mapped
- [ ] Permission matrix documented
- [ ] Token expiry and refresh policy defined

#### Data Protection
- [ ] PII data fields identified
- [ ] Encryption at rest specified
- [ ] Encryption in transit verified (TLS 1.3)
- [ ] Data masking in logs confirmed

#### Audit Trail
- [ ] Auditable actions listed
- [ ] Audit log schema defined
- [ ] Tamper-proof storage specified
- [ ] Retention period set

#### ACID Compliance (if transactional)
- [ ] Transaction boundaries defined
- [ ] Rollback strategy documented
- [ ] Idempotency keys implemented
- [ ] Isolation level specified
```

---

## Phase 7: Test Strategy

**Purpose:** Define the complete test pyramid before writing any implementation code.

**Reference:** See `ENTERPRISE_TESTING.md` for templates.

### Enterprise test pyramid

```
         /\
        /  \
       / E2E \       7%  — Full workflow, critical paths only
      /--------\
     / Integration\  20% — Service boundaries, DB, external APIs
    /──────────────\
   /     Unit       \ 70% — Pure functions, business logic, edge cases
  /──────────────────\
 /  Chaos / Load      \ 3%  — Resilience, performance, failure injection
/──────────────────────\
```

### Coverage requirements

| Layer | Minimum coverage | Tools |
|---|---|---|
| Unit | 99% | Jest / Vitest / pytest / Go test |
| Integration | 95% of integration points | Supertest / httptest |
| E2E | 100% of critical user journeys | Playwright / Cypress |
| Security | 100% of OWASP Top 10 surface | OWASP ZAP / custom |
| Performance | All p95/p99 SLAs validated | k6 / Artillery / Locust |

---

## Phase 8: Delivery Report

**Purpose:** Produce an evidence-based delivery report before marking any work as complete.

**Reference:** See `delivery-report.md` skill for templates.

### Required delivery artifacts

```markdown
## Delivery Report: [Feature/Module Name]

### Implementation summary
[2-3 sentences describing what was built]

### Micro-task completion
| ID | Task | Status | Coverage |
|---|---|---|---|
| 1.1 | [name] | ✓ Complete | 99.5% |

### Test report
- Total tests: [N]
- Passed: [N] (100%)
- Failed: 0
- Coverage: ≥99%

### Security validation
- [ ] STRIDE review completed
- [ ] No critical/high vulnerabilities
- [ ] All inputs validated
- [ ] All outputs sanitized
- [ ] No hardcoded secrets
- [ ] Audit trail implemented

### Compliance checklist
- [ ] [Standard 1] requirements met
- [ ] [Standard 2] requirements met

### Architecture decisions recorded
- ADR-001: [title]
- ADR-002: [title]

### Next steps
1. [Suggested follow-up]
```

---

## Absolute Rules

1. **No feature starts without completing Phases 1–3** — Context, NFR, and risk analysis are mandatory prerequisites.
2. **Every micro-task ≤50 lines** — If a task exceeds 50 lines, it must be split.
3. **PDCA-T cycle is non-negotiable** — No micro-task is "done" without passing tests with ≥99% coverage.
4. **ADR for every significant decision** — Architecture decisions without ADRs are not acceptable.
5. **Security review before delivery** — No module ships without completing the STRIDE matrix and security checklist.
6. **Compliance mapping is mandatory** — Every module must map its obligations to applicable standards.
7. **Delivery report required** — No work is complete without a delivery report showing test metrics and compliance status.

---

## Pack integration

This method uses the following packs (see `packs/` directory):

| Pack | Activated in phase |
|---|---|
| `enterprise-architecture-pack` | Phase 5 — Architecture Decisions |
| `security-compliance-pack` | Phase 6 — Security & Compliance Mapping |
| `high-availability-pack` | Phase 2 — NFR (availability section) |
| `testing-coverage-pack` | Phase 7 — Test Strategy |
| `acid-compliance-pack` | Phase 6 — ACID transaction boundaries |
