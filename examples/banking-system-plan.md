# Example Plan: Banking Transaction System

**Method:** METHOD-ENTERPRISE-BUILDER-PLANNING v1.0.0  
**System type:** Mission-critical + ACID-required + Security-first + High-availability  
**SLA:** 99.999% (26 seconds downtime/month)  
**Compliance:** PCI-DSS, ISO 27001, GDPR (EU customers), ACID full compliance

---

## Phase 1: Enterprise Context Analysis

### System Classification
- [x] Mission-critical (failure = financial loss, regulatory breach)
- [x] High-availability (99.999% SLA required)
- [x] Security-first (financial data, PII, PCI-DSS regulated)
- [x] ACID-required (all transactions must be atomic and durable)

### Stakeholder Map
| Stakeholder | Role | Key concern |
|---|---|---|
| Bank customers | End users | Transactions must never fail silently; money must always be where expected |
| Compliance officer | Regulatory | PCI-DSS certification; audit trail for all transactions |
| Risk team | Internal | Fraud detection; transaction rollback capability |
| Operations | SRE | System availability; alerting; incident response < 5 min |
| Regulators | External | Full transaction audit trail; data residency in EU |

### Regulatory Environment
| Regulation | Scope | Key obligation |
|---|---|---|
| PCI-DSS v4.0 | All payment card data processing | Req. 3: No raw PAN storage; Req. 7: Access control; Req. 10: Logging |
| GDPR | EU customer personal data | Art. 32: Encryption; Art. 17: Erasure (except transaction records) |
| ISO 27001 | Information security management | A.9 Access control; A.12 Operations; A.16 Incident management |
| EBA PSD2 | Payment services directive | Strong customer authentication (SCA); open banking APIs |

### Integration Points
| System | Protocol | SLA dependency |
|---|---|---|
| Core banking system | gRPC (internal mTLS) | Critical — transaction cannot complete without it |
| Card network (Visa/MC) | ISO 8583 / REST | Critical — payment authorization |
| Fraud detection service | REST (async) | High — pre-authorization check, 200ms budget |
| Audit logging service | Event (Kafka) | High — every transaction must be audited |
| Notification service | Event (Kafka) | Medium — customer notification, async |

---

## Phase 2: Non-Functional Requirements

### Performance
- Throughput: 500 transactions/second (steady), 2000 TPS (peak)
- Latency p95: ≤ 800ms (end-to-end, including card network)
- Latency p99: ≤ 2000ms
- Fraud check budget: ≤ 200ms (pre-authorization)

### Availability
- SLA: 99.999% (5 nines — 26 seconds/month downtime allowed)
- RTO: ≤ 30 seconds (automatic failover)
- RPO: 0 (zero data loss — synchronous replication mandatory)
- Planned maintenance: Zero downtime deploys only

### Scalability
- Initial: 500 TPS, 10M transactions/month
- Peak (holiday season): 2000 TPS, 50M transactions/month
- Growth: 30% annually
- Scaling strategy: Horizontal (stateless services) + Read replicas

### Security
- Authentication: OAuth 2.0 + SCA (Strong Customer Authentication) for customer-facing; mTLS for service-to-service
- Authorization: RBAC with ABAC for transaction ownership
- Data classification: All payment data = RESTRICTED
- Encryption at rest: AES-256-GCM with HSM key management
- Encryption in transit: TLS 1.3 (external), mTLS (internal)

### Compliance
- PCI-DSS: Cardholder data tokenized (never stored raw)
- GDPR: Transaction records retained 7 years; PII data subject to erasure (PII anonymized, transaction amounts retained)
- Audit retention: 10 years (regulatory requirement)

---

## Phase 3: Risk Matrix

### STRIDE Analysis — Payment API

| Threat | Component | Attack vector | Impact | Mitigation |
|---|---|---|---|---|
| Spoofing | Payment API | Stolen JWT | HIGH | Short-lived tokens (5 min) + SCA |
| Tampering | Transaction data | Man-in-middle on DB write | CRITICAL | TLS 1.3 + signed payloads |
| Repudiation | Transaction | Customer denies authorizing | HIGH | Digital signature + audit log |
| Info Disclosure | Transaction history | IDOR: see other users' transactions | CRITICAL | Strict ownership check + account isolation |
| DoS | Payment endpoint | Flood with requests | HIGH | Rate limiting + auto-scaling + circuit breaker |
| Elevation of Privilege | Admin API | RBAC bypass | CRITICAL | All permissions checked server-side, no client trust |

### Technical Risk Catalog
| Risk | Prob | Impact | Score | Mitigation |
|---|---|---|---|---|
| Card network timeout mid-authorization | M | CRITICAL | HIGH | Saga with compensation; idempotency keys |
| DB primary failure | L | CRITICAL | HIGH | Synchronous multi-AZ replication, RTO ≤ 30s |
| Distributed transaction partial failure | M | CRITICAL | HIGH | Saga-Orchestration pattern throughout |
| PCI-DSS audit failure | L | CRITICAL | HIGH | Quarterly internal audit, automated compliance scan |
| Fraud detection false positive spike | M | HIGH | HIGH | Fallback: manual review queue, configurable threshold |

---

## Phase 4: Micro-task Decomposition

### Domain: Payments

```
payments/
├── infrastructure/
│   ├── PAY-INF-001: transactions table migration (id, account_id, amount, currency, status, idempotency_key, created_at) — 18 lines
│   ├── PAY-INF-002: transaction_outbox table migration (event publishing) — 12 lines
│   ├── PAY-INF-003: TransactionRepository.create() — 22 lines
│   ├── PAY-INF-004: TransactionRepository.findById() with ownership check — 18 lines
│   ├── PAY-INF-005: IdempotencyKeyRepository.findOrCreate() — 20 lines
│   └── PAY-INF-006: CardNetworkClient.authorize() with circuit breaker — 35 lines
│
├── domain/
│   ├── PAY-DOM-001: Money value object (amount + currency + arithmetic, no float) — 40 lines
│   ├── PAY-DOM-002: TransactionStatus state machine (PENDING→AUTHORIZED→CAPTURED→FAILED→REFUNDED) — 30 lines
│   ├── PAY-DOM-003: Transaction entity (invariants: amount > 0, valid currency, valid account) — 45 lines
│   └── PAY-DOM-004: PaymentDomainService.validateTransaction() — 25 lines
│
├── application/
│   ├── PAY-APP-001: AuthorizePaymentCommand handler (Saga step 1) — 40 lines
│   ├── PAY-APP-002: CapturePaymentCommand handler (Saga step 2) — 35 lines
│   ├── PAY-APP-003: RefundPaymentCommand handler (Saga with compensation) — 45 lines
│   ├── PAY-APP-004: PaymentFailedEventHandler (trigger compensation saga) — 30 lines
│   └── PAY-APP-005: OutboxProcessor (poll outbox, publish events) — 35 lines
│
└── interface/
    ├── PAY-INT-001: POST /payments/authorize controller — 25 lines
    ├── PAY-INT-002: POST /payments/:id/capture controller — 20 lines
    └── PAY-INT-003: POST /payments/:id/refund controller — 20 lines
```

**Total: 19 micro-tasks | Estimated: ~47.5 hours**

### Dependency order (topological)
INF-001 → INF-002 → INF-003 → INF-004 → INF-005 → INF-006 (parallel with INF-003..5)
→ DOM-001 → DOM-002 → DOM-003 → DOM-004
→ APP-001 → APP-002 → APP-003 → APP-004 → APP-005
→ INT-001 → INT-002 → INT-003

---

## Phase 5: Architecture Decisions

### ADR-001: Transaction isolation level

**Decision:** SERIALIZABLE isolation for payment transactions  
**Context:** Financial transactions require zero phantom reads or lost updates  
**Consequences (+):** Zero data integrity issues  
**Consequences (-):** Lower throughput — mitigated with connection pooling and short transaction windows  

### ADR-002: Saga-Orchestration for payment flow

**Decision:** Orchestration Saga for Authorize → Capture → Notify  
**Context:** 4+ steps across 3 services (card network, core banking, notification); PCI-DSS audit requires traceable coordinator  
**Alternatives rejected:** Choreography (hard to audit), 2PC (blocking, performance impact)  

### ADR-003: HSM for encryption key management

**Decision:** Hardware Security Module (HSM) for master encryption keys  
**Context:** PCI-DSS Req. 3 mandates secure key management for cardholder data  

### C4 Level 1: System Context

```
[Bank Customer] ─HTTPS─→ [Banking Transaction System]
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
           [Card Network] [Core Banking] [Fraud Engine]
```

### C4 Level 2: Containers

```
[API Gateway (TLS termination + rate limiting)]
    │
    ▼
[Payment Service (stateless, 4 instances minimum)]
    │──→ [PostgreSQL Primary — AZ-A] ←sync-repl→ [PostgreSQL Replica — AZ-B]
    │──→ [Redis Sentinel (session + idempotency keys)]
    │──→ [Kafka (transaction events → audit, notifications)]
    └──→ [Card Network API (circuit breaker + retry)]
```

---

## Phase 6: Security & Compliance Mapping

### ACID Boundary: AuthorizePayment

```
Transaction scope: payments table + idempotency_keys table (single DB)
External effects: card_network.authorize() → deferred via Outbox
Isolation: SERIALIZABLE
Idempotency: idempotency_key required per request, 24h TTL
Rollback: Saga compensation → refund card authorization if capture fails
```

### Compliance Matrix (excerpt)

| Regulation | Requirement | Control | Status |
|---|---|---|---|
| PCI-DSS Req. 3 | No raw PAN storage | Tokenization via Vault | Implemented |
| PCI-DSS Req. 10 | Audit log all access | Immutable audit log (Kafka + append-only DB) | Implemented |
| GDPR Art. 32 | Security of processing | AES-256-GCM + HSM + TLS 1.3 | Implemented |
| GDPR Art. 17 | Right to erasure | PII anonymized; transaction amounts retained | Implemented |
| ISO 27001 A.9.4 | Access control | RBAC + ABAC (account ownership) | Implemented |

---

## Phase 7: Test Strategy

### Test pyramid
- Unit: 145 tests (70%) — Money VO, TransactionStatus SM, domain validation
- Integration: 40 tests (20%) — DB transactions, Outbox processor, CardNetworkClient mock
- E2E: 15 tests (7%) — Full payment flows: authorize→capture, refund, failed authorization
- Load: 3 scenarios (baseline 500 TPS, spike 2000 TPS, soak 8h at 350 TPS)

### Critical User Journeys
1. CUJ-001: Customer authorizes and captures payment — end-to-end
2. CUJ-002: Payment authorization fails (card declined) — graceful error
3. CUJ-003: Customer requests refund — saga with compensation
4. CUJ-004: Duplicate payment attempt — idempotency key deduplication
5. CUJ-005: Card network timeout — circuit breaker, retry, fallback

### Load test pass criteria
- 500 TPS sustained 30 min: p95 ≤ 800ms, error rate < 0.01%
- 2000 TPS spike 2 min: system recovers in < 60s, no data corruption
- Soak 8h at 350 TPS: no memory leak, performance stable

---

## Phase 8: Delivery Report Template

```
DELIVERY REPORT: Banking Transaction System — Payment Module

Micro-tasks completed: 19/19 (100%)
Total tests: 200 | Passed: 200 | Failed: 0
Coverage: 99.7%
Performance: 500 TPS p95=650ms ✓ | 2000 TPS p95=1850ms ✓

Security:
  STRIDE: ✓ Completed (6 threats identified, all mitigated)
  Critical vulnerabilities: 0
  High vulnerabilities: 0
  PCI-DSS Req. 3, 7, 10, 12: ✓ All met

ACID compliance:
  19 write operations analyzed
  Saga-Orchestration: 3 Sagas with compensation tested
  Idempotency: Implemented and tested (duplicate rejection in 4 CUJs)

ADRs: ADR-001 (isolation), ADR-002 (Saga), ADR-003 (HSM)

STATUS: READY FOR PRODUCTION
```
