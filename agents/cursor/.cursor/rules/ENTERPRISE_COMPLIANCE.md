# ENTERPRISE_COMPLIANCE

Reference guide for ACID compliance, regulatory standards, and compliance mapping in enterprise systems.

---

## ACID Compliance

Every transactional operation in an enterprise system must be evaluated against ACID properties.

### ACID Properties

| Property | Definition | Violation consequence |
|---|---|---|
| **Atomicity** | All operations in a transaction succeed or all are rolled back | Partial writes → data corruption |
| **Consistency** | Transaction brings DB from one valid state to another valid state | Invariant violations → integrity issues |
| **Isolation** | Concurrent transactions do not interfere with each other | Race conditions → incorrect results |
| **Durability** | Committed transactions survive system failures | Lost commits → data loss |

### Transaction Boundary Checklist

For each operation that modifies data, complete this checklist:

```markdown
## Transaction: [Operation Name]

### Atomicity
- [ ] All writes to all tables/services happen within a single transaction scope
- [ ] If any step fails, all previous steps are rolled back
- [ ] External side effects (emails, webhooks) are deferred until after commit

### Consistency
- [ ] All foreign key constraints enforced
- [ ] All check constraints validated before commit
- [ ] Business invariants verified at domain layer (not just DB constraints)
- [ ] Unique constraints prevent duplicate writes

### Isolation
- [ ] Isolation level selected: READ UNCOMMITTED / READ COMMITTED / REPEATABLE READ / SERIALIZABLE
- [ ] Justification: [why this level is sufficient]
- [ ] Phantom read risk assessed: [yes/no, mitigation if yes]
- [ ] Optimistic vs pessimistic locking decision documented

### Durability
- [ ] WAL (Write-Ahead Log) enabled on database
- [ ] Synchronous replication to at least one replica before acknowledging commit
- [ ] Backup and point-in-time recovery tested
- [ ] Recovery time objective (RTO) for this transaction's data: [X minutes]
```

### Distributed Transaction Strategies

When a transaction spans multiple services or databases:

```
Option 1: Saga Pattern (preferred for microservices)
- Compensating transactions for each step
- No distributed lock, eventual consistency
- Use when: data can be temporarily inconsistent

Option 2: Two-Phase Commit (2PC)
- Coordinator + participants, blocking protocol
- Use when: strong consistency required, ≤5 participants
- Avoid when: high throughput required (2PC is slow)

Option 3: Outbox Pattern (for event publishing)
- Write event to outbox table in same transaction as data change
- Separate process reads outbox and publishes to event bus
- Guarantees at-least-once delivery without distributed transaction
```

### Idempotency Requirements

Every mutation endpoint (POST, PUT, PATCH, DELETE) MUST be idempotent:

```typescript
// Idempotency key pattern
interface IdempotencyKey {
  key: string;        // Client-generated unique key (UUID)
  expiresAt: Date;    // TTL: 24 hours for most operations
  response?: unknown; // Cached response for duplicate requests
}

// Implementation pattern:
// 1. Check if idempotency key exists in store
// 2. If exists: return cached response (no re-execution)
// 3. If not: execute operation, store result with key, return result
```

---

## ISO/IEC 25000 (SQuaRE) Quality Model

The SQuaRE standard defines 8 quality characteristics for software products.

### Quality Characteristic Mapping

| Characteristic | Sub-characteristics | Verification method |
|---|---|---|
| **Functional Suitability** | Completeness, Correctness, Appropriateness | Feature tests, acceptance tests |
| **Performance Efficiency** | Time behavior, Resource utilization, Capacity | Load tests, profiling |
| **Compatibility** | Co-existence, Interoperability | Integration tests, API contract tests |
| **Usability** | Learnability, Operability, Accessibility | UX testing, WCAG audit |
| **Reliability** | Maturity, Fault tolerance, Recoverability | Chaos engineering, failover tests |
| **Security** | Confidentiality, Integrity, Non-repudiation, Authenticity | Penetration tests, security audit |
| **Maintainability** | Modularity, Reusability, Analyzability, Modifiability, Testability | Code review, metrics |
| **Portability** | Adaptability, Installability, Replaceability | Deployment tests, environment parity |

### SQuaRE Assessment Template

```markdown
## SQuaRE Assessment: [System/Module Name]

| Characteristic | Target | Current | Gap | Action |
|---|---|---|---|---|
| Functional Suitability | 100% acceptance tests pass | [%] | [delta] | [action] |
| Performance Efficiency | p95 < 300ms at 1000 rps | [measured] | [delta] | [action] |
| Compatibility | 100% API contract tests pass | [%] | [delta] | [action] |
| Usability | WCAG 2.1 AA compliant | [status] | [delta] | [action] |
| Reliability | 99.95% uptime last 30 days | [%] | [delta] | [action] |
| Security | 0 critical/high vulnerabilities | [count] | [delta] | [action] |
| Maintainability | Cyclomatic complexity < 10 avg | [avg] | [delta] | [action] |
| Portability | Deploys to 3 environments without change | [status] | [delta] | [action] |
```

---

## ISO 27001 Information Security

### Annex A Controls — Minimum set for enterprise software

```
A.5  Information security policies        → [ ] Security policy documented and approved
A.6  Organization of information security → [ ] Roles and responsibilities defined
A.8  Asset management                     → [ ] Data assets inventoried and classified
A.9  Access control                       → [ ] RBAC implemented, access reviewed quarterly
A.10 Cryptography                         → [ ] Encryption standards documented
A.12 Operations security                  → [ ] Change management process defined
A.13 Communications security              → [ ] Network security controls in place
A.14 System acquisition and development   → [ ] Secure development lifecycle (SDL) followed
A.16 Information security incident mgmt  → [ ] Incident response plan documented
A.17 Business continuity                  → [ ] DR plan tested annually
A.18 Compliance                           → [ ] Legal and regulatory requirements mapped
```

### Statement of Applicability (SoA) template

```markdown
## SoA: [System Name]

For each applicable Annex A control:

| Control ID | Control Name | Applicable? | Implemented? | Evidence |
|---|---|---|---|---|
| A.9.1.1 | Access control policy | Yes | Yes | RBAC matrix v2.0 |
| A.9.2.3 | Management of privileged access | Yes | Yes | JIT access policy |
| A.10.1.1 | Policy on the use of cryptographic controls | Yes | Yes | Encryption standard doc |
```

---

## CMMI (Capability Maturity Model Integration) Level 3

### Level 3 Process Areas — Required practices

| Process Area | Key Practices | Verification |
|---|---|---|
| Requirements Management | Trace requirements to tests, manage changes | Traceability matrix |
| Project Planning | Estimate effort, plan iterations, track progress | Sprint plans + velocity |
| Project Monitoring | Track against plan, take corrective action | Burndown + retrospectives |
| Configuration Management | Version all artifacts, control changes | Git + branch policies |
| Process and Product QA | Audit processes and products against standards | QA reports |
| Measurement and Analysis | Define measures, collect data, analyze | Dashboards + KPIs |
| Organizational Process Focus | Assess and improve organizational processes | Process reviews |
| Training Program | Train team on defined processes | Training records |
| Integrated Project Management | Use organization's standard processes | Adapted process docs |
| Risk Management | Identify, analyze, mitigate risks | Risk register |
| Decision Analysis | Use formal evaluation for significant decisions | ADR documents |

---

## GDPR / Data Privacy Compliance

### Data Processing Inventory (Article 30)

```markdown
## Record of Processing Activity: [Processing Activity Name]

| Field | Value |
|---|---|
| Name of processing | [e.g., "User account management"] |
| Controller | [Organization name] |
| Purposes | [e.g., "Provide service, billing, communication"] |
| Legal basis | [Consent / Contract / Legitimate Interest / Legal obligation] |
| Data categories | [e.g., "Name, email, IP address, payment data"] |
| Data subjects | [e.g., "Registered users"] |
| Recipients | [e.g., "Payment processor, email service"] |
| International transfers | [Countries, safeguards] |
| Retention period | [e.g., "Account data: duration of contract + 3 years"] |
| Security measures | [Encryption, access controls, etc.] |
```

### GDPR Rights Implementation

| Right | Article | Implementation required |
|---|---|---|
| Right to access | Art. 15 | Export all user data endpoint (DSAR) |
| Right to rectification | Art. 16 | User profile editing |
| Right to erasure | Art. 17 | Account deletion + anonymization pipeline |
| Right to restriction | Art. 18 | Freeze processing flag on user record |
| Right to portability | Art. 20 | Machine-readable data export (JSON/CSV) |
| Right to object | Art. 21 | Opt-out mechanism for marketing, profiling |

### Privacy by Design (Art. 25)

```
Data minimization:     Collect only what is strictly necessary
Purpose limitation:    Use data only for declared purpose
Storage limitation:    Delete when purpose is fulfilled
Accuracy:              Keep data accurate, provide correction mechanism
Integrity/confidentiality: Encrypt, access-control, audit all access
```

---

## RegTech Compliance Mapping Template

For each regulatory requirement, map to the implementing control:

```markdown
## Compliance Matrix: [System Name]

| Regulation | Article/Section | Requirement | Implementing Control | Owner | Status |
|---|---|---|---|---|---|
| GDPR | Art. 32 | Security of processing | AES-256 encryption, TLS 1.3, RBAC | Security team | Implemented |
| GDPR | Art. 17 | Right to erasure | Anonymization pipeline, 30-day SLA | Engineering | In progress |
| ISO 27001 | A.9.2 | User access management | IAM system, quarterly review | IT Ops | Implemented |
| PCI-DSS | Req. 3 | Protect stored cardholder data | Tokenization, no raw PAN storage | Engineering | Implemented |
| SOC 2 | CC6.1 | Logical access controls | RBAC + MFA enforcement | Security | Implemented |
```
