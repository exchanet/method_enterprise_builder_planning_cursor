# SKILL: METHOD-ENTERPRISE-BUILDER-PLANNING

## Purpose

Orchestrate the full enterprise software planning methodology. Activates the 8-phase planning cycle for mission-critical, high-availability, and enterprise-grade systems. Integrates Method Modular Design (Core + Packs) with PDCA-T quality cycle.

## When to Use

Use this skill when:
- Building any system with enterprise-grade requirements (high load, complex transactions, regulated data)
- Designing mission-critical software (failure has catastrophic consequences)
- Planning high-availability architecture (99.9%+ uptime SLA)
- Working on systems requiring compliance (GDPR, ISO 27001, SOC2, PCI-DSS, HIPAA)
- Implementing ACID-compliant transactional features
- Building security-first modules with audit trail
- Starting any feature that involves >1000 concurrent users

## Integration with Other Methods

This skill MUST be used in combination with:

| Method | Role in this skill |
|---|---|
| `method-modular-design` | All code generated follows Core + Packs pattern |
| `metodo-pdca-t` | PDCA-T cycle applied to EVERY micro-task |
| `ENTERPRISE_ARCHITECTURE` rule | Architecture decisions and ADR format |
| `ENTERPRISE_SECURITY` rule | STRIDE, RBAC, audit trail, OWASP checklist |
| `ENTERPRISE_SCALABILITY` rule | HA patterns, SLA/SLO, caching, circuit breakers |
| `ENTERPRISE_COMPLIANCE` rule | ACID, ISO 27001, SQuaRE, GDPR, CMMI |
| `ENTERPRISE_TESTING` rule | Test pyramid, coverage gates, performance tests |
| `ENTERPRISE_MICROTASK_PLANNER` rule | Decomposition algorithm and backlog format |

## Trigger Commands

This skill activates when the user says:

```
"Plan enterprise feature: [description]"
"Design mission-critical [system type]"
"Create ACID-compliant module for [feature]"
"Build high-availability [component]"
"Implement security-first [module] with audit trail"
"Plan [system] with GDPR / SOC2 / ISO 27001 compliance"
"Activate METHOD-ENTERPRISE-BUILDER-PLANNING"
"Design scalable [system] for [N] concurrent users"
```

## The 8-Phase Orchestration Cycle

When this skill is active, execute phases IN ORDER. Never skip a phase.

### PHASE 1: Enterprise Context Analysis

**Sub-skill:** Built into this skill (no separate file needed)

**Execute:**
1. Ask the user to classify the system: enterprise-grade / mission-critical / HA / security-first / ACID-required
2. Map stakeholders and their concerns
3. Identify the regulatory environment (GDPR, SOC2, ISO 27001, PCI-DSS, HIPAA)
4. List all external integration points and their SLA dependencies

**Output:** Completed System Classification + Stakeholder Map + Regulatory Environment table

**Gate:** Do not proceed to Phase 2 without explicit confirmation of system classification.

---

### PHASE 2: Non-Functional Requirements

**Sub-skill:** None (use `ENTERPRISE_SCALABILITY` rule for HA patterns)

**Execute:**
1. Define performance SLOs (throughput, p95/p99 latency)
2. Define availability SLA (99% / 99.9% / 99.99% / 99.999%)
3. Define scalability targets (initial + peak + growth projection)
4. Define security requirements (auth scheme, RBAC model, data classification)
5. Map compliance obligations to measurable requirements

**Output:** Completed NFR document (use template from `METHOD-ENTERPRISE-BUILDER-PLANNING` rule Phase 2)

---

### PHASE 3: Risk Matrix

**Sub-skill:** Read `security-planning.md` for STRIDE template

**Execute:**
1. Complete STRIDE matrix for each identified module/boundary
2. Build technical risk catalog (infrastructure, integration, deployment risks)
3. Rate each risk: Probability (H/M/L) × Impact (H/M/L)
4. Define mitigation strategy for every HIGH risk before proceeding

**Output:** STRIDE matrix + Technical risk catalog with mitigations

**Gate:** All HIGH risks must have a mitigation strategy before Phase 4.

---

### PHASE 4: Micro-Task Decomposition

**Sub-skill:** Read `microtask-decomposition.md`

**Execute:**
1. Break feature into domains
2. For each domain, identify layers: infrastructure → domain → application → interface
3. Create micro-task for each unit (≤50 lines each)
4. Build the dependency DAG
5. Order tasks in topological order
6. Present full backlog in tabular format

**Output:** Numbered micro-task backlog with dependencies, layers, and pack assignments

---

### PHASE 5: Architecture Decisions

**Sub-skill:** Read `architecture-planning.md`

**Execute:**
1. For each significant architectural decision (data store, pattern, framework), create an ADR
2. Use the decision trees in `ENTERPRISE_ARCHITECTURE` rule
3. Map each architectural component to a pack (modular design)
4. Produce C4 Level 1 and Level 2 diagrams (text/mermaid)

**Output:** ADR documents + C4 diagrams + Pack mapping

---

### PHASE 6: Security & Compliance Mapping

**Sub-skill:** Read `security-planning.md` and `compliance-planning.md`

**Execute:**
1. Apply STRIDE to each module identified in Phase 4
2. Map RBAC permission matrix
3. Identify all ACID transaction boundaries
4. Map regulatory requirements to implementing controls
5. Define audit log schema and auditable events

**Output:** Security checklist per module + Compliance matrix + ACID boundary document

---

### PHASE 7: Test Strategy

**Sub-skill:** Read `testing-strategy.md`

**Execute:**
1. Define unit test scope and tools
2. List all integration points to be tested
3. Document critical user journeys (CUJ) for E2E tests
4. Define load test scenarios and SLO thresholds
5. Create the quality gate configuration for CI/CD

**Output:** Test strategy document + CUJ list + Load test scenarios + CI quality gate config

---

### PHASE 8: Delivery Report

**Sub-skill:** Read `delivery-report.md`

**Execute:**
1. As each micro-task is completed (PDCA-T cycle), accumulate test results
2. On feature completion, generate the full delivery report
3. Verify all quality gates pass
4. Confirm Definition of Done checklist complete

**Output:** Delivery report with test metrics, security sign-off, compliance checklist, and ADR summary

---

## Available Packs

When generating code, assign each micro-task to the appropriate pack:

| Pack | Use for |
|---|---|
| `enterprise-architecture-pack` | ADR templates, C4 generation, pattern implementation |
| `security-compliance-pack` | Auth, RBAC, audit trail, encryption, STRIDE |
| `high-availability-pack` | HA patterns, circuit breakers, health checks, SLA config |
| `testing-coverage-pack` | Test templates, coverage config, load test scripts |
| `acid-compliance-pack` | Transaction boundaries, idempotency, rollback handlers |

## Output Format Standards

### For Phase outputs:

Always use the structured templates from the corresponding rule files. Never produce free-form prose where a template exists.

### For micro-task implementations (PDCA-T):

```
Micro-task [ID]: [Name]
Status: In Progress → Done
Lines: [N]/50
Coverage: [N]%

Tests executed: [N]
Passed: [N] (100%)
Failed: 0
```

### For delivery report:

```
DELIVERY REPORT: [Feature Name]
────────────────────────────────
Total micro-tasks: [N]
Completed: [N] (100%)
Total tests: [N]
Coverage: ≥99%
Security: STRIDE completed, 0 critical/high
Compliance: [Standards] all requirements met
ADRs: [N] decisions recorded
────────────────────────────────
Status: READY FOR PRODUCTION
```

## Language Support

Respond in the user's preferred language. All documentation and code comments follow the project's primary language. This skill is available in both English and Spanish (see `metodo-pdca-t` skill for Spanish equivalents).

## Best Practices

1. **Never skip Phase 1-3** — Context, NFR, and risk analysis are non-negotiable prerequisites
2. **Never start coding without a backlog** — All micro-tasks must be defined before implementation begins
3. **ADR every significant decision** — No undocumented architecture decisions
4. **Security review before delivery** — STRIDE + OWASP checklist mandatory
5. **Compliance mapping is not optional** — Map every obligation to a control
6. **Test evidence, not promises** — Show actual test output, not "tests will be added"
7. **Pack assignment for every task** — All code belongs to a pack (modular design)
8. **PDCA-T per micro-task** — Quality cycle runs on every single micro-task
