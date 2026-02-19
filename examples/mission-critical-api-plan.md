# Example Plan: Mission-Critical Public API

**Method:** METHOD-ENTERPRISE-BUILDER-PLANNING v1.0.0  
**System type:** Mission-critical + High-availability + Scalable system engineering  
**SLA:** 99.99% (4.4 minutes downtime/month)  
**Context:** Public REST API serving 50 third-party integrations in financial services sector

---

## Phase 1: Enterprise Context Analysis

### System Classification
- [x] Mission-critical (50 integrations depend on this API; downtime = cascading failures for all partners)
- [x] High-availability (99.99% SLA — 4.4 minutes downtime/month)
- [x] Scalable system engineering (traffic grows 200% on quarter-end financial reporting days)

### Stakeholder Map
| Stakeholder | Key concern |
|---|---|
| API consumers (50 integrations) | Backward compatibility; no breaking changes; degraded mode support |
| Internal product teams | Fast iteration without breaking external consumers |
| Platform SRE | On-call burden reduction; automated recovery; observability |
| Security team | API abuse prevention; DDoS protection; credential rotation |
| Legal | API terms of service; SLA penalties; liability limits |

### Integration Points
| System | Criticality | SLA dependency |
|---|---|---|
| Primary database | Critical | API cannot serve without it |
| Read replica (2x) | High | Used for all read endpoints |
| Redis cache | High | Graceful degradation if unavailable |
| Auth service | Critical | No requests served without token validation |
| Webhook dispatcher | Medium | Async, can queue if unavailable |

---

## Phase 2: Non-Functional Requirements

### Performance
- Sustained: 5000 req/s
- Peak (quarter-end): 25000 req/s (5x multiplier, 2-hour windows, predictable)
- p95 latency: ≤ 200ms (simple reads), ≤ 800ms (aggregations)
- p99 latency: ≤ 500ms (simple reads), ≤ 2000ms (aggregations)

### Availability
- SLA: 99.99% (4.4 minutes/month)
- Scheduled downtime: Not allowed — zero-downtime deploys mandatory
- Degraded mode: When non-critical dependencies fail, serve cached/partial data with HTTP 206

### API Contract Stability
- Semantic versioning: Major version in URL (`/v1/`, `/v2/`)
- Deprecation policy: 18 months notice before removing a version
- Breaking changes: Never in minor/patch versions
- Consumer-driven contract tests: Pact tests for all 50 consumers (critical)

---

## Phase 3: Risk Matrix

### STRIDE Analysis — Public API Gateway

| Threat | Attack vector | Impact | Mitigation |
|---|---|---|---|
| Spoofing | API key theft or replay attack | HIGH | Short-lived tokens + per-consumer API key rotation |
| Tampering | Request body modification in transit | HIGH | TLS 1.3 + HMAC request signing for critical endpoints |
| Repudiation | Consumer denies making a call | MEDIUM | Signed audit log with consumer ID + request hash |
| Info Disclosure | Error message exposes schema or internal details | HIGH | Generic error codes + correlation ID only in errors |
| DoS | Single consumer floods API | CRITICAL | Per-consumer rate limiting (token bucket) |
| Elevation | Consumer accesses data they shouldn't | CRITICAL | Scoped API keys (read-only / read-write / admin) |

### Technical Risk Catalog
| Risk | Mitigation |
|---|---|
| Breaking change deployed accidentally | Consumer-driven contract tests (Pact) in CI |
| Quarter-end traffic spike causes cascading failure | Pre-scaling triggered by calendar event + circuit breakers |
| Auth service unavailable | Token validation cache (5-minute local cache of valid tokens) |
| DB write latency spike degrades read endpoints | Read/write split — reads from replica, writes to primary |

---

## Phase 4: Micro-task Decomposition

### Domain: API Gateway (cross-cutting)

```
gateway/
├── infrastructure/
│   ├── GW-INF-001: Rate limiter middleware (token bucket, per-consumer key) — 40 lines
│   ├── GW-INF-002: API key validation middleware (with 5-min cache) — 35 lines
│   ├── GW-INF-003: Request correlation ID middleware — 20 lines
│   ├── GW-INF-004: Structured error response formatter — 25 lines
│   └── GW-INF-005: Request/response logger (no sensitive fields) — 30 lines
│
└── domain/
    ├── GW-DOM-001: ApiKey value object (key + scope + consumer ID) — 25 lines
    └── GW-DOM-002: RateLimit value object (bucket + refill rate + burst) — 30 lines
```

### Domain: Resources (example: data endpoint)

```
resources/
├── infrastructure/
│   ├── RES-INF-001: Resource read from replica with cache-aside — 30 lines
│   ├── RES-INF-002: Resource write to primary + cache invalidation — 25 lines
│   └── RES-INF-003: Webhook outbox publisher — 30 lines
│
├── domain/
│   ├── RES-DOM-001: Resource entity with versioning (for optimistic lock) — 40 lines
│   └── RES-DOM-002: ResourceDiff value object (for webhook payload) — 25 lines
│
├── application/
│   ├── RES-APP-001: GetResourceQuery (read from cache → replica) — 30 lines
│   ├── RES-APP-002: UpdateResourceCommand (write + outbox + invalidate cache) — 45 lines
│   └── RES-APP-003: ResourceUpdatedWebhookHandler — 25 lines
│
└── interface/
    ├── RES-INT-001: GET /v1/resources/:id — 20 lines
    ├── RES-INT-002: PATCH /v1/resources/:id — 20 lines
    └── RES-INT-003: GET /v1/resources (paginated list) — 25 lines
```

**Total estimated micro-tasks:** 45  
**Estimated effort:** ~45 × 35 min = ~26 hours

---

## Phase 5: Architecture Decisions

### ADR-001: Read/Write Split with Cache-Aside

**Decision:** All GET endpoints read from replica with Redis cache-aside (60s TTL); POST/PATCH/DELETE write to primary and invalidate cache  
**Justification:** Reduces primary DB load for 85% of requests (read-heavy workload); enables independent scaling of read capacity

### ADR-002: Consumer-Driven Contract Tests (Pact)

**Decision:** All 50 API consumers provide Pact contracts; CI blocks deploys that break any contract  
**Justification:** 50 consumers × manual testing = impossible; Pact enables automated breaking-change detection

### ADR-003: Pre-scaling for Predictable Peak Events

**Decision:** Calendar-triggered auto-scaling (scale out 15 minutes before quarter-end windows)  
**Justification:** Cold start time (2 min) makes reactive scaling too slow for the predictable 5x peak

### ADR-004: Graceful Degradation (HTTP 206 Partial Content)

**Decision:** When non-critical enrichment services fail, return available data with `X-Partial-Response: true` header  
**Justification:** 50 consumers prefer partial data over a complete 503; defined in API contract

### C4 Level 2: Container Diagram

```
[50 Consumers] ─TLS─→ [API Gateway (DDoS protection, rate limiting)]
                            │
                    [Auth Service (token validation)]
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
        [API Servers   [Redis Cache    [PostgreSQL
         (stateless,    (session +      Primary (writes) +
         auto-scaled)]  resource        2 Read Replicas
                        cache)]         (reads)]
              │
        [Kafka (webhook events → dispatcher)]
```

---

## Phase 6: Security & Compliance Mapping

### API Security Checklist

```
Authentication & authorization:
✓ API key scoped (read / read-write / admin) — no over-privileged keys
✓ Token validation cached 5 min (with blacklist check on cache hit)
✓ Rate limiting: 1000 req/min per consumer (default), configurable per tier

Input validation:
✓ All path parameters: UUID validation
✓ All query parameters: type + range validation
✓ Request body: JSON Schema validation
✓ Pagination: max page size = 100 (prevent DB overload)

Error handling:
✓ Generic error codes (4xxx, 5xxx) — no internal details
✓ Correlation ID in every response (for support)
✓ No stack traces in production responses

Rate limiting response:
✓ HTTP 429 with Retry-After header
✓ Consumer-specific limit headers: X-RateLimit-Limit, X-RateLimit-Remaining
```

---

## Phase 7: Test Strategy

### Consumer-Driven Contract Tests (Pact) — top priority

```
For each of the 50 consumers:
1. Consumer generates Pact file (describes expected requests/responses)
2. API provider verifies all Pact files in CI
3. Deploy blocked if any consumer's Pact verification fails
```

### API versioning test

```typescript
describe('API versioning backward compatibility', () => {
  it('v1 endpoints still respond correctly after v2 deployment', async () => {
    // v1 consumer request → v1 response schema (unchanged)
    const v1Response = await api.get('/v1/resources/test-id');
    expect(v1Response.body).toMatchSchema(v1ResourceSchema);
  });

  it('v2 adds new fields but does not remove v1 fields', async () => {
    const v2Response = await api.get('/v2/resources/test-id');
    // v1 fields still present, new v2 fields added
    expect(v2Response.body).toMatchSchema(v2ResourceSchema);
    expect(v2Response.body).toContainAllKeys(Object.keys(v1ResourceSchema.properties));
  });
});
```

### Load test: Quarter-end simulation

```javascript
// k6 script
export const options = {
  stages: [
    { duration: '5m', target: 5000 },   // Normal operating load
    { duration: '15m', target: 5000 },  // Sustained
    { duration: '5m', target: 25000 },  // Quarter-end spike
    { duration: '30m', target: 25000 }, // Quarter-end sustained (2h simulated as 30m)
    { duration: '5m', target: 5000 },   // Recovery
  ],
  thresholds: {
    'http_req_duration{endpoint:simple}': ['p(95)<200', 'p(99)<500'],
    'http_req_duration{endpoint:aggregation}': ['p(95)<800', 'p(99)<2000'],
    'http_req_failed': ['rate<0.001'],
  },
};
```

---

## Phase 8: Delivery Report Template

```
DELIVERY REPORT: Mission-Critical Public API

Micro-tasks completed: 45/45 (100%)
Total tests: 310 | Passed: 310 | Failed: 0
Coverage: 99.6%

Pact contract tests: 50/50 consumer contracts verified ✓

Performance at 25000 rps (quarter-end):
  Simple reads p95: 185ms ✓ (target: 200ms)
  Aggregations p95: 720ms ✓ (target: 800ms)
  Error rate: 0.0008% ✓

Security:
  Rate limiting: Verified per consumer
  STRIDE: ✓ Completed | Critical: 0 | High: 0
  No breaking changes: ✓ All Pact files passing

ADRs: ADR-001 (Read/Write Split), ADR-002 (Pact), ADR-003 (Pre-scaling), ADR-004 (Graceful Degradation)

STATUS: READY FOR PRODUCTION
```
