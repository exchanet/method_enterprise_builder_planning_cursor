# Usage Guide — Method Enterprise Builder Planning

## Activation

The method activates with `trigger: manual`. The fastest way is the slash command:

```
/method-enterprise_builder
```

Alternatively, use any of these natural-language phrases:

```
"Activate METHOD-ENTERPRISE-BUILDER-PLANNING"
"Plan enterprise feature: [description]"
"Design mission-critical [system]"
"Create ACID-compliant module for [feature]"
"Build high-availability [component] with [SLA]% uptime"
"Implement security-first [module] with audit trail"
"Plan [system] with GDPR/SOC2/ISO 27001 compliance"
```

After activation, Cursor will begin **Phase 1** (Enterprise Context Analysis) and ask you to describe your system. The 8-phase builder cycle runs automatically from there.

---

## Common Workflows

### Workflow 1: Plan a new feature from scratch

Start with the full 8-phase cycle:

```
You: Plan enterprise feature: user authentication system with MFA, RBAC,
     GDPR compliance, and 99.9% SLA.

Cursor: [Phase 1 begins — asks about system classification and stakeholders]
```

The method will guide you through all 8 phases in order. Do not skip phases.

**Estimated time for a medium feature (15-20 micro-tasks):**
- Phases 1-3 (context, NFR, risk): 30-45 minutes
- Phase 4 (decomposition): 20-30 minutes
- Phases 5-6 (architecture, security): 45-60 minutes
- Phase 7 (test strategy): 20-30 minutes
- Implementation (per micro-task): 20-40 minutes each
- Phase 8 (delivery report): 15-20 minutes

---

### Workflow 2: Plan just the architecture for an existing project

Skip to Phase 5:

```
You: I have a system already defined (describe it). Apply METHOD-ENTERPRISE-BUILDER-PLANNING
     Phase 5 (Architecture Decisions). I need ADRs for: database selection,
     deployment pattern, and caching strategy.

Cursor: [Reads architecture-planning.md sub-skill]
        [Applies decision trees from ENTERPRISE_ARCHITECTURE rule]
        [Generates ADR-001, ADR-002, ADR-003]
```

---

### Workflow 3: Decompose a large task into micro-tasks

```
You: I need to implement [feature description]. Break it into micro-tasks
     using METHOD-ENTERPRISE-BUILDER-PLANNING Phase 4.

Cursor: [Reads microtask-decomposition.md sub-skill]
        [Identifies domains and layers]
        [Produces numbered backlog table with dependencies]
```

---

### Workflow 4: Security review before release

```
You: Before releasing [module name], do a full security review using
     METHOD-ENTERPRISE-BUILDER-PLANNING Phase 6.

Cursor: [Reads security-planning.md sub-skill]
        [Completes STRIDE matrix]
        [Generates RBAC permission matrix]
        [Produces OWASP Top 10 checklist]
        [Generates compliance matrix section]
```

---

### Workflow 5: Generate a delivery report

```
You: I've completed all micro-tasks for [feature]. Generate the delivery
     report using METHOD-ENTERPRISE-BUILDER-PLANNING Phase 8.

Cursor: [Reads delivery-report.md sub-skill]
        [Asks for: total tests, coverage %, security scan results]
        [Generates full delivery report with all sections]
        [Verifies Definition of Done checklist]
```

---

### Workflow 6: Check ACID compliance for a transaction

```
You: I have this operation: [describe operation that writes to multiple tables/services].
     Apply the ACID compliance analysis from the acid-compliance-pack.

Cursor: [Activates acid-compliance-pack hooks]
        [Walks through ACID checklist]
        [Recommends Saga pattern if needed]
        [Designs idempotency key strategy]
```

---

## Using Individual Sub-skills

You can activate individual sub-skills without the full 8-phase cycle:

### Architecture planning only

```
You: Use the architecture-planning sub-skill to create ADRs for:
     1. Should we use PostgreSQL or MongoDB?
     2. Should this be Modular Monolith or Microservices?
```

### Security review only

```
You: Use the security-planning sub-skill to do a STRIDE analysis on
     the [payment/auth/API] module.
```

### Testing strategy only

```
You: Use the testing-strategy sub-skill to define the test pyramid
     and CI quality gates for the [project/module].
```

### Compliance mapping only

```
You: Use the compliance-planning sub-skill to map our GDPR + ISO 27001
     obligations to technical controls for [module name].
```

---

## Tips for Best Results

### Be specific in system descriptions

Good:
```
"Plan a payment processing API handling 500 TPS, ACID-compliant, 
with PCI-DSS compliance, 99.99% SLA, used by 20 third-party integrations."
```

Not enough context:
```
"Plan a payment system."
```

### Confirm classifications before proceeding

At Phase 1, Cursor asks you to confirm the system classification. Do not skip this — it determines the default quality requirements for all subsequent phases.

### Use the backlog table format

When Phase 4 produces the micro-task backlog, keep it in the structured table format. Reference task IDs when implementing (`You: Implement task PAY-APP-001`).

### Don't skip the STRIDE analysis

Even for "small" modules, the STRIDE analysis in Phase 3/6 is where the most critical security decisions are made. Skipping it is the most common cause of security incidents.

### Always show test output, not summaries

When PDCA-T validation requires test results, paste the actual test runner output:
```
Good: "12 tests pass, coverage report shows 99.4%"
Better: [paste actual output from vitest/pytest]
Not acceptable: "I believe the tests pass"
```

---

## Integration with Other Methods

### With Method Modular Design

When Phase 4 decomposes micro-tasks, Cursor automatically assigns each to a pack following the Core + Packs pattern. When you implement a micro-task, reference the pack:

```
You: Implement task PAY-APP-001. This belongs to the payments pack.
     Use the method-modular-design skill to structure the pack correctly.
```

### With PDCA-T Method

Each micro-task runs through the PDCA-T cycle. If coverage drops below 99%, the task is not done:

```
You: Complete task PAY-DOM-001 using the PDCA-T cycle.
     Show me the test results before marking it done.
```

---

## Troubleshooting

### "Cursor doesn't activate the method"

Verify the rule file exists at `.cursor/rules/METHOD-ENTERPRISE-BUILDER-PLANNING.md`.  
Try: `"Read and activate the METHOD-ENTERPRISE-BUILDER-PLANNING rule."`

### "Phase outputs are too brief"

Explicitly request the structured output: `"Use the exact template from the rule for Phase [N] output."`

### "Sub-skills aren't being applied"

Explicitly reference them: `"Read the security-planning.md sub-skill and apply it now."`

### "Coverage is below 99% and I can't find the gap"

```
You: My current coverage is [N]%. Help me identify which paths are not covered
     and write the missing tests to reach ≥99%.
```
