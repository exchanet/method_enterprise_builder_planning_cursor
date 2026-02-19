# ACID Compliance Pack — Hook Implementations

## validateTransactionBoundary (onMicrotaskComplete)

For every micro-task that involves writing data, validate ACID compliance:

```markdown
## ACID Gate: Micro-task [ID] — [Name]

### Does this task write data? YES / NO
(If NO: skip this gate)

### Atomicity check
- [ ] What tables/services are written?
  - [table/service 1]: write operation
  - [table/service 2]: write operation
- [ ] Are all writes within a single DB transaction? YES / NO
- [ ] If NO: Saga or Outbox pattern applied? YES / NO
- [ ] External side effects (email/webhook): deferred to after commit? YES / NO / N/A

### Consistency check
- [ ] All business invariants enforced before commit?
- [ ] DB constraints cover the remaining invariants?
- [ ] No orphaned records possible after this operation?

### Isolation check
- [ ] Isolation level: [READ_COMMITTED / REPEATABLE_READ / SERIALIZABLE]
- [ ] Justification: [why this level is sufficient]
- [ ] Race condition risk: [identified / none] — [mitigation if identified]

### Durability check
- [ ] WAL enabled on database: YES (required)
- [ ] Synchronous replica acknowledgment: [N replicas]

### Idempotency check
- [ ] Is this operation idempotent by nature? YES / NO
- [ ] If NO: idempotency key mechanism implemented? YES / NO

### ACID Gate Result: PASS / FAIL
```

## onPhaseComplete (Phase 4 — Micro-task Decomposition)

When decomposing micro-tasks, identify all transactional boundaries:

```markdown
## Transaction Boundary Map (Phase 4 Output)

For each write operation in the backlog:

| Task ID | Operation | Tables written | Single-DB? | Pattern needed |
|---|---|---|---|---|
| DOM1-APP-001 | CreateOrder | orders, inventory, payments | NO (3 services) | Saga-Orchestration |
| DOM1-INF-002 | UpdateUserProfile | users | YES | Native ACID |
| DOM1-APP-003 | ProcessPayment | payments, audit_log | YES | Native ACID + Outbox |

Saga required: [N operations]
Outbox required: [N operations]
Native ACID sufficient: [N operations]
```

## onPhaseComplete (Phase 6 — Security & Compliance)

Contribute ACID compliance details to Phase 6:

```markdown
## ACID Compliance Details (Phase 6 Output)

### Transaction inventory
[Full list of all transactional operations with ACID analysis]

### Saga designs
For each Saga:

#### Saga: [Name]
Steps:
  1. [Step 1] → Compensation: [undo step 1]
  2. [Step 2] → Compensation: [undo step 2]
  3. [Step 3] → Compensation: [undo step 3]
Coordinator: [service name or "event-driven"]
Failure handling: [describe what happens when step N fails]

### Idempotency key implementation
Storage: [Redis / DB table]
TTL: [N hours]
Key format: [describe]
Duplicate handling: [return cached response without re-execution]

### Outbox configuration
Table: [outbox table name]
Processor: [background job name, polling interval]
Delivery guarantee: at-least-once
Deduplication: [idempotency key at consumer]
```

## deliveryReportSection (onDeliveryReportGenerate)

ACID section of the delivery report:

```markdown
## ACID Compliance Sign-off

### Transaction boundaries
Total write operations: [N]
Native ACID: [N] operations
Saga pattern: [N] Sagas implemented
Outbox pattern: [N] event publishers

### ACID analysis completed
- [ ] All [N] write operations have completed ACID checklist
- [ ] All [N] Sagas have compensation logic documented and tested
- [ ] Idempotency keys implemented for all non-idempotent mutations
- [ ] Isolation levels documented and justified

### Distributed transaction risks
Risk: [description] | Mitigation: [description] | Status: [mitigated/accepted]

### ACID sign-off: [APPROVED / BLOCKED]
```
