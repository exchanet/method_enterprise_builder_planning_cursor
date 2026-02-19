# Example Plan: High-Availability Multi-Tenant SaaS

**Method:** METHOD-ENTERPRISE-BUILDER-PLANNING v1.0.0  
**System type:** Enterprise-grade + High-availability + Security-first  
**SLA:** 99.99% (4.4 minutes downtime/month)  
**Compliance:** GDPR, SOC2 Type II, ISO/IEC 25000 (SQuaRE)

---

## Phase 1: Enterprise Context Analysis

### System Classification
- [x] Enterprise-grade (B2B SaaS, 500 tenant companies, 100k end users)
- [x] High-availability (99.99% SLA committed to enterprise customers)
- [x] Security-first (multi-tenant isolation is critical — one tenant cannot see another's data)

### Stakeholder Map
| Stakeholder | Role | Key concern |
|---|---|---|
| Enterprise customers (B2B) | Primary users | Tenant isolation; uptime SLA; data portability (GDPR) |
| Customer success | Internal | Uptime visibility; proactive communication on incidents |
| SOC2 auditors | External | Access logs; change management; availability evidence |
| Platform engineering | Internal | Zero-downtime deploys; on-call burden; observability |
| Legal/compliance | Internal | GDPR data residency; DPA agreements with customers |

### Regulatory Environment
| Regulation | Key obligation |
|---|---|
| GDPR | DPA required with each enterprise customer; data residency in EU; audit log access |
| SOC2 Type II | CC6 (access control), CC7 (monitoring), A1 (availability), CC8 (change management) |
| ISO/IEC 25000 | Quality model compliance for enterprise contract requirements |

---

## Phase 2: Non-Functional Requirements

### Performance
- API throughput: 2000 req/s (steady), 8000 req/s (peak)
- Dashboard load time p95: ≤ 1500ms (with data aggregation)
- API latency p99: ≤ 500ms (simple queries), ≤ 3000ms (reports)

### Availability
- SLA: 99.99% (4.4 minutes/month)
- RTO: ≤ 2 minutes (automated)
- RPO: ≤ 60 seconds (async replication acceptable for non-financial data)
- Maintenance: Blue-green deploys, zero-downtime schema migrations

### Multi-tenancy isolation requirements
- Tenant A cannot access Tenant B's data (enforced at DB query level, not application logic only)
- Tenant storage quotas enforced (prevent noisy-neighbor)
- Per-tenant rate limiting (burst isolation)
- Tenant-specific data residency (EU tenants → EU data only)

### Scalability
- 500 tenants day 1, 5000 tenants at year 3
- Database strategy: shared DB with tenant_id isolation (logical) + row-level security (RLS)
- Upgrade path: physical tenant isolation (dedicated schema/DB) for enterprise tiers

---

## Phase 3: Risk Matrix

### STRIDE Analysis — Multi-Tenant API

| Threat | Attack vector | Impact | Mitigation |
|---|---|---|---|
| Spoofing | Stolen API token used by different tenant | CRITICAL | Token bound to tenant_id; server-side tenant resolution |
| Tampering | API request modifies another tenant's resource | CRITICAL | RLS at DB level; ownership verified at every query |
| Repudiation | Admin action denied | HIGH | Immutable audit log with actor, tenant, timestamp |
| Info Disclosure | Cross-tenant data leak via poorly filtered query | CRITICAL | RLS + middleware tenant context injection |
| DoS | Single tenant floods API, impacts all | HIGH | Per-tenant rate limiting; bulkhead isolation |
| Elevation | Tenant admin escalates to super-admin | HIGH | No client-supplied role claims; RBAC checked server-side |

### Technical Risk Catalog
| Risk | Mitigation |
|---|---|
| Cross-tenant data leak | RLS policies enforced at PostgreSQL level, NOT application level |
| Blue-green deploy fails (DB migration incompatible) | Backward-compatible migration policy; shadow testing |
| Redis cache returns stale tenant data | Cache keys include tenant_id; isolation enforced |
| Noisy tenant degrades shared DB | Per-tenant connection limits; query timeout enforcement |

---

## Phase 4: Micro-task Decomposition

### Domain: Tenancy (cross-cutting concern)

```
tenancy/
├── infrastructure/
│   ├── TEN-INF-001: tenants table migration (id, name, plan, data_residency, status) — 15 lines
│   ├── TEN-INF-002: PostgreSQL RLS policies per table (enable_row_security, policy) — 25 lines
│   ├── TEN-INF-003: TenantRepository.findById() — 15 lines
│   └── TEN-INF-004: TenantContextMiddleware (inject tenant from JWT into DB session var) — 30 lines
│
├── domain/
│   ├── TEN-DOM-001: TenantId value object (UUID, validation) — 15 lines
│   ├── TEN-DOM-002: TenantPlan value object (free/pro/enterprise + feature flags) — 25 lines
│   └── TEN-DOM-003: Tenant entity (status machine: trial→active→suspended→deleted) — 35 lines
│
└── application/
    ├── TEN-APP-001: ProvisionTenantCommand handler (create + seed default data) — 45 lines
    └── TEN-APP-002: SuspendTenantCommand handler (disable access, retain data) — 30 lines
```

### Domain: Availability (infrastructure cross-cutting)

```
availability/
├── AVAIL-INF-001: Health check endpoints (/liveness, /readiness, /startup) — 30 lines
├── AVAIL-INF-002: Circuit breaker configuration (all external dependencies) — 25 lines
├── AVAIL-INF-003: Retry middleware with exponential backoff + jitter — 30 lines
└── AVAIL-INF-004: Structured logger with correlation ID + tenant context — 35 lines
```

**Total domains:** 5 (tenancy, users, billing, core-product, availability)  
**Estimated total micro-tasks:** 85  
**Estimated effort:** ~85 tasks × 35 min avg = ~50 hours

---

## Phase 5: Architecture Decisions

### ADR-001: Shared DB with PostgreSQL Row-Level Security

**Decision:** All tenants share the same PostgreSQL database, isolated via RLS policies  
**Context:** 500 tenants day 1, budget constraints prevent per-tenant DB; RLS provides DB-level enforcement  
**Alternatives rejected:** Separate DB per tenant (operational overhead at scale), schema-per-tenant (migration complexity)  
**Consequences (+):** Single deployment, low operational overhead, DB-enforced isolation  
**Consequences (-):** Noisy-neighbor risk (mitigated: connection limits, query timeouts)  
**Upgrade path:** Enterprise tier customers → dedicated schema/DB (ADR-002 will cover this)

### ADR-002: Blue-Green Deployment with Backward-Compatible Migrations

**Decision:** Blue-green for zero-downtime deploys; all DB migrations must be backward-compatible with N-1 version  
**Rule:** Never remove a column in the same deploy it stops being used (2-step: remove usage → remove column in separate deploy)

### C4 Level 2: Container Diagram

```
[Browser/App] ─HTTPS─→ [CDN (static assets, SPA)]
                              │
                       [API Gateway (rate limiting, TLS)]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           [API Server (Blue)]  [API Server (Green)]
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
[PostgreSQL    [Redis Cluster  [Kafka
 (RLS enabled)] (per-tenant    (events:
 Primary+2      cache keys)]   billing,
 Read Replicas]                audit)]
```

---

## Phase 6: Security & Compliance Mapping

### SOC2 Trust Service Criteria (excerpt)

| Criteria | Control | Evidence |
|---|---|---|
| CC6.1 — Logical access | RBAC + MFA enforcement | Access policy document + MFA enforcement log |
| CC6.6 — Data transmission | TLS 1.3 for all connections | SSL Labs A+ rating screenshot |
| CC7.2 — System monitoring | Structured logging + alerting on anomalies | Monitoring dashboard |
| A1.1 — Availability commitments | 99.99% SLA monitoring | Uptime report (30-day rolling) |
| CC8.1 — Change management | PR review + CI gates + blue-green | CI/CD configuration + deployment log |

### GDPR Multi-Tenant Obligations

- DPA (Data Processing Agreement): one per enterprise customer, referencing their tenant_id
- Data residency: `data_residency` field on tenant record; EU tenants → EU PostgreSQL cluster only
- Right to export: `GET /gdpr/export` scoped to tenant_id
- Right to erasure: `DELETE /tenants/:id` → anonymizes all PII within tenant scope (transaction records retained per contract)

---

## Phase 7: Test Strategy

### Multi-tenancy isolation tests (highest priority)

```typescript
describe('Multi-tenant isolation', () => {
  it('should reject cross-tenant resource access', async () => {
    const tenantAToken = await authenticate('tenant-a');
    const tenantBResourceId = await createResource('tenant-b');
    
    const response = await api
      .get(`/resources/${tenantBResourceId}`)
      .set('Authorization', `Bearer ${tenantAToken}`);
    
    expect(response.status).toBe(404); // Not 403 — don't reveal existence
  });

  it('should not include tenant-b data in tenant-a queries', async () => {
    // Create data for both tenants
    // Query as tenant A — assert zero rows from tenant B
  });
});
```

### SLA compliance test (chaos engineering)

```
Chaos Experiment 1: Kill 1 of 3 API instances
Expected: p95 latency stays below 1500ms, zero 5xx errors

Chaos Experiment 2: DB primary failover
Expected: Failover < 2 min (RTO), p99 recovers within 5 min

Chaos Experiment 3: Redis cache cluster partition
Expected: Cache miss → fallthrough to DB, no 5xx, latency increases < 3×
```

### Load test targets
- 2000 req/s sustained 30 min: p95 ≤ 1500ms, error rate < 0.01%
- 8000 req/s spike 5 min: system recovers in < 3 min
- Multi-tenant fairness: 500 concurrent tenants, no tenant p99 > 5× average

---

## Phase 8: Delivery Report Template

```
DELIVERY REPORT: High-Availability Multi-Tenant SaaS

Micro-tasks completed: 85/85 (100%)
Total tests: 420 | Passed: 420 | Failed: 0
Coverage: 99.4%

Performance:
  2000 rps: p95=1200ms ✓ | p99=3800ms (within 3s report SLO) ✓
  8000 rps spike: recovered in 2.5 min ✓

Security:
  Tenant isolation: 12 isolation tests — all PASS
  STRIDE: ✓ Completed | Critical: 0 | High: 0

SOC2 readiness:
  CC6, CC7, A1, CC8: all criteria addressed
  Evidence artifacts: 8 documents produced

GDPR: DPA template + DSAR endpoint + erasure pipeline — ✓

ADRs: ADR-001 (RLS), ADR-002 (Blue-Green)

STATUS: READY FOR PRODUCTION
```
