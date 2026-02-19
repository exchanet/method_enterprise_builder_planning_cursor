# Enterprise Architecture Pack — Hook Implementations

## onPhaseComplete (Phase 5)

When Phase 5 (Architecture Decisions) triggers, this pack provides:

1. **Pattern selection** — Walk through the decision tree from `ENTERPRISE_ARCHITECTURE` rule
2. **ADR generation** — Create ADR documents for all significant decisions identified
3. **C4 diagram** — Generate Level 1 + Level 2 diagrams in the configured format
4. **Pack mapping** — Map each domain/module to the appropriate pack in the `packs/` directory

Output format for Phase 5:

```markdown
## Phase 5 Output: Architecture Decisions

### Pattern selected
[pattern name] — [justification]

### ADRs created
- ADR-001: [title] — [status]
- ADR-002: [title] — [status]

### C4 Diagram (Level 1 — System Context)
[mermaid diagram]

### C4 Diagram (Level 2 — Container)
[mermaid diagram]

### Module → Pack mapping
| Domain/Module | Pack | Justification |
|---|---|---|
| [module] | [pack-name] | [why this pack] |
```

## onDeliveryReportGenerate

Contributes this section to the delivery report:

```markdown
## Architecture Section

### ADRs recorded
| ADR | Decision | Status | Date |
|---|---|---|---|
| ADR-[NNN] | [title] | Accepted | [date] |

### Architecture smell check
- [ ] No circular dependencies between packs
- [ ] Core contains no business logic
- [ ] Each pack's domain is clearly bounded
- [ ] No cross-pack direct imports (hooks/events only)

### Pattern conformance
[Primary pattern]: [conformance status]
Violations found: [N] | Resolved: [N]
```

## adrTemplate

Standard ADR template provided by this pack:

```markdown
## ADR-[NNN]: [Decision Title]

**Date:** [YYYY-MM-DD]
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-[NNN]
**Pack:** [which pack this decision affects]

### Context
[Forces, constraints, and the problem this decision addresses]

### Decision
[The decision, stated clearly and unambiguously]

### Alternatives considered
| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|

### Consequences
- **Positive:** [what becomes easier or possible]
- **Negative:** [accepted trade-offs]
- **Risks:** [what could go wrong, with mitigation]

### Compliance impact
- [ ] No compliance impact
- [ ] Requires compliance review: [standard]
- [ ] Data residency implications: [yes/no]
```
