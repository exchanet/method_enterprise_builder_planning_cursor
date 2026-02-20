# Sub-skill: Compliance Planning

## Purpose

Map regulatory and standards compliance obligations to implementing controls, define ACID transaction boundaries, and ensure systems meet ISO/IEC 25000, ISO 27001, CMMI, and GDPR requirements.

## When to Use

- Phase 6 (Security & Compliance Mapping) of METHOD-ENTERPRISE-BUILDER-PLANNING
- When implementing ACID-compliant transactions
- When building systems subject to GDPR, SOC2, ISO 27001, PCI-DSS, or HIPAA
- When CMMI process maturity is required

## Steps

### Step 1: Identify applicable standards

```markdown
## Compliance Scope: [System Name]

Answer these questions:

1. Does the system process EU personal data? → GDPR applies
2. Is there a SaaS product for enterprise customers? → SOC2 Type II likely required
3. Does it process payment card data? → PCI-DSS applies
4. Does it process health information? → HIPAA applies (US) / GDPR health data category (EU)
5. Is the organization seeking ISO 27001 certification? → ISO 27001 applies
6. Does a government contract require process maturity? → CMMI may apply

Applicable standards: [list]
```

### Step 2: Complete ACID boundary analysis

For each operation that writes data:

```markdown
## ACID Analysis: [Operation/Use Case Name]

### Transaction scope
Data stores involved: [list all tables/collections/services modified]
Is this a single-DB transaction? [YES → use native ACID / NO → Saga/Outbox required]

### Atomicity
All-or-nothing operations:
  Step 1: [write operation] — if fails → rollback all
  Step 2: [write operation] — if fails → rollback step 1 + step 2
  Step 3: [write operation] — if fails → rollback all previous

External side effects (emails, webhooks, notifications):
  → MUST be deferred until AFTER transaction commits
  → Use Outbox pattern: write to outbox table inside same transaction
  → Separate process reads outbox and dispatches external calls

### Consistency
Invariants that must hold:
  - [business rule 1]: [enforcement mechanism]
  - [business rule 2]: [enforcement mechanism]
  - [constraint 1]: [DB constraint / domain validation]

### Isolation
Isolation level selected: READ COMMITTED | REPEATABLE READ | SERIALIZABLE
Justification: [why this level is sufficient]
Concurrent write risk: [identified race conditions and mitigations]
Locking strategy: [optimistic with version column / pessimistic SELECT FOR UPDATE]

### Durability
Synchronous replication to: [N] replicas before acknowledging commit
WAL enabled: YES (mandatory)
Backup tested: [last test date]
PITR (Point-in-Time Recovery) configured: YES/NO

### Idempotency
Is this operation idempotent by nature? [YES/NO]
If NO: idempotency key mechanism: [describe]
Idempotency window: [24 hours / operation-specific]
```

### Step 3: Build the compliance matrix

```markdown
## Compliance Matrix: [System Name]

| Regulation | Article/Section | Requirement | Implementing Control | Evidence | Status |
|---|---|---|---|---|---|
| GDPR | Art. 5(1)(b) | Purpose limitation | Data processing agreement + field tagging | DPA document | ✓ |
| GDPR | Art. 5(1)(e) | Storage limitation | Automated deletion job per retention policy | Retention config | In Progress |
| GDPR | Art. 17 | Right to erasure | Anonymization pipeline on account deletion | Unit test | Pending |
| GDPR | Art. 25 | Privacy by design | Data minimization enforced in schema | Schema review | ✓ |
| GDPR | Art. 32 | Security of processing | TLS 1.3 + AES-256 + RBAC | Security audit | ✓ |
| ISO 27001 | A.9.2 | User access management | RBAC + quarterly access review | Access review log | ✓ |
| ISO 27001 | A.12.4 | Logging and monitoring | Structured audit log + SIEM alerts | Log config | ✓ |
| SOC2 | CC6.1 | Logical access | RBAC + MFA enforcement | Security policy | ✓ |
| SOC2 | CC7.2 | Change management | PR review + CI gates + deployment approval | CI/CD config | ✓ |
```

### Step 4: GDPR-specific implementation checklist

```markdown
## GDPR Implementation Checklist: [System Name]

### Data minimization (Art. 5)
- [ ] Schema reviewed: no PII field collected without documented purpose
- [ ] API responses: only necessary fields returned (no over-fetching PII)
- [ ] Logs: PII masked or excluded

### Consent management (Art. 7)
- [ ] Consent recorded with timestamp, IP, and consent text version
- [ ] Consent withdrawal mechanism implemented
- [ ] Consent renewed when consent text changes significantly

### Data subject rights (Arts. 15–22)
- [ ] DSAR (Data Subject Access Request) endpoint: GET /gdpr/export (returns all user data as JSON/CSV)
- [ ] Erasure endpoint: DELETE /gdpr/account (anonymizes PII, retains non-PII records)
- [ ] Rectification: existing profile editing covers this
- [ ] Portability: machine-readable export format (JSON preferred)

### Data breach notification (Art. 33)
- [ ] Incident response plan documented (72-hour notification window to DPA)
- [ ] Breach detection alerting configured
- [ ] DPA contact information documented

### International transfers (Art. 46)
- [ ] All data processing locations documented
- [ ] Transfers outside EEA: Standard Contractual Clauses (SCC) or adequacy decision
```

### Step 5: ISO/IEC 25000 (SQuaRE) quality targets

```markdown
## SQuaRE Quality Targets: [System Name]

| Characteristic | Metric | Target | Verification |
|---|---|---|---|
| Functional Suitability | Acceptance test pass rate | 100% | CI test results |
| Performance Efficiency | API latency p95 | < 300ms at target load | Load test report |
| Compatibility | Contract test pass rate | 100% | Pact/OpenAPI tests |
| Usability | WCAG 2.1 AA violations | 0 critical | Accessibility audit |
| Reliability | 30-day uptime | ≥ 99.95% | Monitoring dashboard |
| Security | Critical/high CVEs | 0 | Dependency scan |
| Maintainability | Avg cyclomatic complexity | < 10 | Static analysis |
| Portability | Deploy without env changes | 3 envs (dev/staging/prod) | Deploy test |
```

### Step 6: CMMI Level 3 process evidence

```markdown
## CMMI Level 3 Evidence: [Project/System]

| Process Area | Required Evidence | Owner | Status |
|---|---|---|---|
| Requirements Management | Traceability matrix (req → test) | Engineering | [ ] |
| Project Planning | Sprint plans + velocity tracking | PM | [ ] |
| Configuration Management | All artifacts in Git + branch policies | Engineering | [ ] |
| Process and Product QA | QA report per sprint | QA | [ ] |
| Risk Management | Risk register updated monthly | PM | [ ] |
| Decision Analysis | ADR for all significant decisions | Architecture | [ ] |
| Measurement and Analysis | KPI dashboard with trends | Engineering | [ ] |
```

## Best Practices

1. **Map obligations before building** — Compliance requirements change architecture; discover them early
2. **Compliance matrix is living document** — Update it with every feature and release
3. **Automate what can be automated** — Data deletion jobs, retention enforcement, dependency scans
4. **Evidence over assertion** — "We implemented RBAC" is not compliance evidence; an access review log is
5. **Separate ACID from distributed** — Never try to do distributed ACID without explicit Saga/Outbox design
6. **Idempotency is not optional** — Any payment or financial operation without idempotency is a bug
7. **Test compliance scenarios** — GDPR right-to-erasure must have a test; SOC2 access review must produce a log
