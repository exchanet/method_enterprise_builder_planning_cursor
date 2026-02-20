# Method Enterprise Builder Planning — Claude Code Edition

> **Version:** 2.0.0 | **Author:** Francisco J Bernades | **Agent:** Claude Code (Anthropic)

When the user requests enterprise software planning, follow EXACTLY the 8-phase protocol below.
Do not skip phases. Do not combine phases. Produce structured output at every step.

## Available Commands

- `/plan-enterprise [description]` — Start the full 8-phase planning cycle
- `/design-critical [system]` — Mission-critical design (start at Phase 3, reference Phase 1 context)
- `/build-ha [component]` — High-availability build (start at Phase 4, reference Phase 2 NFRs)
- `/validate-adr [file-path]` — Run the ADR validator against a file
- `/lint-task [file-path]` — Run the microtask linter against a file

## System Nature

This method is a **hybrid framework**: structured prompts interpreted by you (the LLM agent) + standalone executable tools (adr-validator, microtask-linter) that can be run independently.

Your job is to follow the structured 8-phase protocol and produce consistent, actionable outputs at each step. You apply judgment within the structure — outputs will be consistent but not character-identical across runs.

---

## 8-Phase Protocol

### Phase 1: Enterprise Context Analysis

**When activated by:** `/plan-enterprise [description]`

**Actions:**
1. Classify the system (enterprise-grade / mission-critical / high-availability / security-first / ACID-required)
2. Build stakeholder map (end users, compliance, operations, external regulators)
3. Map regulatory environment (GDPR, PCI-DSS, ISO 27001, SOC2, HIPAA — as applicable)
4. List integration points with protocol and SLA dependency level
5. Save output as `docs/enterprise-context.md`

**Output format:**
```markdown
## System Classification
[checkboxes]

## Stakeholder Map
[table: Stakeholder | Role | Key concern]

## Regulatory Environment
[table: Regulation | Scope | Key obligation]

## Integration Points
[table: System | Protocol | Dependency level]
```

**Gate:** Ask user to confirm classification before proceeding to Phase 2.

---

### Phase 2: Non-Functional Requirements

**Actions:**
1. Define Performance SLOs (throughput TPS, latency p95/p99)
2. Define Availability SLA (%, RTO, RPO, deploy strategy)
3. Define Scalability targets (initial, peak, growth rate)
4. Define Security baseline (auth, authz, encryption at rest/transit)
5. Define Compliance requirements per standard

**Gate:** All SLOs must be numeric and measurable before proceeding.

---

### Phase 3: Risk Matrix

**Actions:**
1. Run STRIDE analysis on primary API surface (all 6 threat categories)
2. Identify technical risks with probability, impact, and mitigation
3. Flag any CRITICAL risk without mitigation — this blocks Phase 4

**Output format:**
```markdown
## STRIDE Analysis — [Component]
[table: Threat | Component | Attack vector | Severity | Mitigation]

## Technical Risk Catalog
[table: Risk | Probability | Impact | Mitigation]
```

**Gate:** No CRITICAL risk may be unmitigated. All HIGH risks must have mitigations.

---

### Phase 4: Micro-task Decomposition

**Actions:**
1. Identify business domains
2. Map each domain to layers (infrastructure → domain → application → interface)
3. Create one micro-task per file/unit, each ≤50 effective lines
4. Assign task IDs (DOMAIN-LAYER-NNN format)
5. Define dependency order (topological sort)

**Constraint:** After implementing each micro-task, validate with:
```bash
node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
  --task=<file> --max-lines=50
```

**Gate:** All micro-tasks estimated ≤50 lines. If a task exceeds 50, split it.

---

### Phase 5: Architecture Decisions (ADR)

**Actions:**
1. Apply the architecture decision tree (Monolith vs Microservices vs Hexagonal vs CQRS vs Event Sourcing)
2. Create one ADR per significant decision
3. Each ADR must include: Context, Decision, ≥2 Alternatives with rejection reasons, Consequences, Compliance Impact
4. Validate each ADR:
```bash
node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts \
  --format=console docs/adr/ADR-NNN-*.md
```
5. Generate C4 diagrams (L1 System Context + L2 Container minimum)

**Gate:** All ADRs must pass the validator before being marked Accepted.

---

### Phase 6: Security & Compliance Mapping

**Actions:**
1. Define ACID transaction boundaries for all write operations
2. Map each compliance requirement to a concrete control implementation
3. Define RBAC roles and ABAC ownership rules
4. Define audit event schema (what is logged, where, retention)

**Gate:** Every CRITICAL data field has encryption and access control defined.

---

### Phase 7: Test Strategy

**Actions:**
1. Define test pyramid (Unit 70% / Integration 20% / E2E 7% / Chaos 3%)
2. List Critical User Journeys for E2E tests
3. Define load test scenarios (baseline, spike, soak) with pass criteria
4. Define CI/CD quality gates

**Coverage requirement:** ≥99% line + branch (floor, not ceiling — meaningful assertions required)

**Gate:** Load test pass criteria are numeric (TPS, latency p95, error rate).

---

### Phase 8: Delivery Report

**Actions:**
Generate a delivery report with:
- Micro-tasks completed/total
- Test results (unit/integration/E2E/load)
- Coverage percentage per layer
- STRIDE analysis status
- Critical/High vulnerabilities: 0
- ADR status
- Compliance matrix status
- Final STATUS: READY FOR PRODUCTION or BLOCKED (with reasons)

```bash
# Run delivery gate
bash .ci-cd/scripts/validate-delivery.sh
```

---

## Key Constraints (always enforce)

1. **≤50 effective lines per micro-task** — effective = code lines (excludes blank, comment, import)
2. **≥99% test coverage** — minimum floor; assertions must verify behavior, not just execution
3. **ACID for all writes** — define transaction boundary before writing any write handler
4. **ADR for all significant decisions** — definition: if the team discussed it for >10 minutes, it needs an ADR
5. **Security by default** — STRIDE before every module; OWASP Top 10 checklist before every release
