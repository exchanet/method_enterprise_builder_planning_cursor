# Enterprise Standards Reference

Quick reference for all standards, frameworks, and terminology used in Method Enterprise Planning.

---

## Software Quality Standards

### ISO/IEC 25000 — SQuaRE (Systems and Software Quality Requirements and Evaluation)

The international standard for software product quality. Defines 8 quality characteristics:

| Characteristic | What it measures | Key metrics |
|---|---|---|
| Functional Suitability | Does it do what it should? | Acceptance test pass rate |
| Performance Efficiency | Speed, resource use, capacity | Latency p95/p99, throughput |
| Compatibility | Works with other systems? | Integration test pass rate, API compatibility |
| Usability | Easy to use? | WCAG compliance, user error rate |
| Reliability | Works without failing? | Uptime %, MTBF, recovery time |
| Security | Protected against threats? | Vulnerability count, auth coverage |
| Maintainability | Easy to change? | Cyclomatic complexity, duplication %, test coverage |
| Portability | Works in different environments? | Environment parity, deploy success rate |

**Reference:** `ENTERPRISE_COMPLIANCE` rule → SQuaRE Assessment Template

---

### CMMI — Capability Maturity Model Integration

Maturity model for software development processes. 5 levels:

| Level | Name | Description |
|---|---|---|
| 1 | Initial | Unpredictable, reactive. Success depends on individuals. |
| 2 | Managed | Basic project management. Requirements and processes tracked. |
| 3 | Defined | Proactive. Standard processes across the organization. |
| 4 | Quantitatively Managed | Process performance measured statistically. Predictable. |
| 5 | Optimizing | Continuous improvement. Innovation and root cause analysis. |

**Target for enterprise software:** Level 3 minimum.

**Level 3 required process areas (relevant to this method):**

| Process Area | How this method addresses it |
|---|---|
| Requirements Management | Traceability matrix, micro-task acceptance criteria |
| Project Planning | Micro-task backlog, dependency DAG, effort estimates |
| Configuration Management | Git + branch policies, ADR versioning |
| Process and Product QA | PDCA-T quality cycle, delivery report |
| Risk Management | Phase 3 risk matrix, STRIDE analysis |
| Decision Analysis | ADR for every significant decision |
| Measurement and Analysis | Coverage %, performance metrics, SLO tracking |

---

## Security Standards

### ISO 27001 — Information Security Management System (ISMS)

Framework for managing information security risks.

**Structure:**
- Clauses 4-10: Management system requirements (mandatory)
- Annex A: 114 controls in 14 sections (select applicable controls via SoA)

**Most relevant Annex A sections for software development:**

| Section | Controls | Addressed by |
|---|---|---|
| A.9 Access control | User access management, RBAC, MFA | `security-compliance-pack` |
| A.10 Cryptography | Encryption policy, key management | `ENTERPRISE_SECURITY` rule |
| A.12 Operations security | Change management, capacity management | Testing + deployment |
| A.14 System acquisition and development | Secure development lifecycle (SDL) | All 8 phases |
| A.16 Incident management | Incident response, post-mortem | `high-availability-pack` runbook |
| A.17 Business continuity | DR plan, RTO/RPO | `high-availability-pack` |

**Reference:** `ENTERPRISE_COMPLIANCE` rule → ISO 27001 Annex A Controls checklist

---

### OWASP Top 10 (2021)

Most critical web application security risks:

| # | Risk | Primary control |
|---|---|---|
| A01 | Broken Access Control | RBAC enforced on every endpoint; IDOR prevention |
| A02 | Cryptographic Failures | AES-256 at rest; TLS 1.3 in transit; bcrypt for passwords |
| A03 | Injection | Parameterized queries; input allowlist validation |
| A04 | Insecure Design | STRIDE threat modeling before implementation |
| A05 | Security Misconfiguration | Configuration review; debug mode off in production |
| A06 | Vulnerable and Outdated Components | Automated dependency scanning (Snyk/Dependabot) |
| A07 | Identification and Authentication Failures | Rate limiting; account lockout; secure session management |
| A08 | Software and Data Integrity Failures | CI/CD pipeline integrity; signed artifacts |
| A09 | Security Logging and Monitoring Failures | Audit trail implementation; SIEM alerting |
| A10 | Server-Side Request Forgery (SSRF) | Allowlist outbound URLs; block internal IP ranges |

**Reference:** `ENTERPRISE_SECURITY` rule → OWASP Top 10 Checklist

---

### STRIDE Threat Model

Mnemonic for systematically enumerating threats:

| Letter | Threat | Violates | Example attack |
|---|---|---|---|
| S | Spoofing | Authentication | Stolen credentials, replay attack |
| T | Tampering | Integrity | Man-in-middle, SQL injection, request body modification |
| R | Repudiation | Non-repudiation | Denying an action was performed |
| I | Information Disclosure | Confidentiality | Data breach, error messages exposing internals |
| D | Denial of Service | Availability | Flood attack, resource exhaustion |
| E | Elevation of Privilege | Authorization | RBAC bypass, IDOR, privilege escalation |

**Reference:** `ENTERPRISE_SECURITY` rule → STRIDE Analysis template

---

## Transaction Standards

### ACID Properties

| Property | Guarantee | Without it |
|---|---|---|
| **Atomicity** | All steps succeed or all are rolled back | Partial writes → data corruption |
| **Consistency** | DB transitions from one valid state to another | Invariant violations → corrupt data |
| **Isolation** | Concurrent transactions don't interfere | Race conditions → incorrect results |
| **Durability** | Committed data survives crashes | Lost committed data |

### Transaction Isolation Levels (SQL standard)

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Use when |
|---|---|---|---|---|
| READ UNCOMMITTED | Possible | Possible | Possible | Never in production |
| READ COMMITTED | Prevented | Possible | Possible | Default (PostgreSQL, SQL Server) |
| REPEATABLE READ | Prevented | Prevented | Possible | Default (MySQL/InnoDB) |
| SERIALIZABLE | Prevented | Prevented | Prevented | Financial/payment transactions |

**Reference:** `ENTERPRISE_COMPLIANCE` rule → ACID Transaction Checklist; `acid-compliance-pack`

---

## Availability and Reliability

### SLA / SLO / SLI / Error Budget

| Term | Definition | Set by |
|---|---|---|
| SLA | External contractual commitment to customers | Legal/Business |
| SLO | Internal target (stricter than SLA) | Engineering |
| SLI | Actual measured metric | Monitoring system |
| Error Budget | Allowed downtime = 100% − SLO% × period | Engineering |

### Availability Reference Table

| SLA | Monthly downtime | Quarterly downtime | Typical use case |
|---|---|---|---|
| 99% | 7.3 hours | 21.9 hours | Internal tools, dev environments |
| 99.5% | 3.65 hours | 10.9 hours | Non-critical B2C applications |
| 99.9% | 43.8 minutes | 2.2 hours | Standard SaaS products |
| 99.95% | 21.9 minutes | 65.7 minutes | Enterprise SaaS |
| 99.99% | 4.4 minutes | 13.1 minutes | Financial services, healthcare |
| 99.999% | 26.3 seconds | 1.6 minutes | Core banking, payment networks |

### Resilience Patterns Quick Reference

| Pattern | Purpose | Use when |
|---|---|---|
| Circuit Breaker | Stop calling failing service | External service degrading |
| Retry + Backoff | Recover from transient failures | Idempotent operations |
| Bulkhead | Isolate failures | Multiple downstream services |
| Timeout | Prevent unbounded waits | All external calls |
| Health Check | Detect and remove unhealthy instances | Load balancer + auto-healing |
| Blue-Green | Zero-downtime deployment | Any production deployment |
| Canary | Gradual rollout with automatic rollback | High-risk changes |
| Circuit Breaker + Fallback | Graceful degradation | Cached/default response acceptable |

**Reference:** `ENTERPRISE_SCALABILITY` rule → Resilience Patterns; `high-availability-pack`

---

## Compliance Frameworks

### PCI-DSS v4.0 (Payment Card Industry Data Security Standard)

12 requirements for any entity handling cardholder data:

| Req. | Topic | Key control |
|---|---|---|
| 3 | Protect stored cardholder data | Tokenization, no raw PAN storage |
| 4 | Protect data in transit | TLS 1.2+ for all transmissions |
| 7 | Restrict access | Need-to-know RBAC |
| 8 | Identify and authenticate access | MFA for admin, unique IDs |
| 10 | Log and monitor all access | Immutable audit log |
| 12 | Information security policy | Documented, approved, maintained |

### GDPR Key Articles

| Article | Title | Key obligation |
|---|---|---|
| 5 | Principles | Data minimization, purpose limitation, storage limitation |
| 6 | Lawfulness | Legal basis required for all processing |
| 15 | Right of access | Provide copy of personal data on request (DSAR) |
| 17 | Right to erasure | Delete data when no longer needed (with exceptions) |
| 20 | Data portability | Machine-readable export |
| 25 | Privacy by design | Default settings privacy-protective |
| 32 | Security | Encryption, pseudonymization, resilience |
| 33 | Breach notification | Notify DPA within 72 hours of becoming aware |

### SOC 2 Trust Services Criteria

| Criteria Family | Covers |
|---|---|
| Security (CC) | Access controls, threat detection, incident response |
| Availability (A) | System uptime, performance, backup |
| Processing Integrity (PI) | Complete, valid, accurate, timely processing |
| Confidentiality (C) | Protection of confidential information |
| Privacy (P) | Personal information collection, use, retention, disposal |

**Type I:** Controls are designed effectively (point-in-time audit)  
**Type II:** Controls operate effectively over a period (6-12 month audit) — required for enterprise sales

---

## Methodology Quick Reference

### PDCA-T Cycle (per micro-task)

```
PLAN → DO (≤50 lines) → CHECK (self-review) → ACT (write tests) → TEST (≥99% coverage)
```

### Core + Packs Pattern

```
Core = Infrastructure only (no business logic)
Packs = Business modules (auto-discoverable, independently deployable)
Integration = Through hooks and events (never direct imports across packs)
```

### 8-Phase Enterprise Planning Cycle

```
1. Enterprise Context  → System classification, stakeholders, regulations
2. NFR                 → Performance, availability, security, compliance requirements
3. Risk Matrix         → STRIDE + technical risks with mitigations
4. Micro-task Decomposition → Feature → Domain → Layer → ≤50-line tasks
5. Architecture Decisions → ADRs + C4 diagrams + Pack mapping
6. Security & Compliance → Controls mapped to obligations
7. Test Strategy       → Pyramid + coverage gates + load tests
8. Delivery Report     → Evidence-based sign-off with metrics
```
