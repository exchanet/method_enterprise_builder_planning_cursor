# Sub-skill: Scalability Planning

## Purpose

Design high-availability (HA) and scalable architectures, define SLA/SLO targets, select caching strategies, and configure resilience patterns for enterprise systems.

## When to Use

- Phase 2 (NFR — availability section) of METHOD-ENTERPRISE-BUILDER-PLANNING
- When designing systems with 99.9%+ uptime requirements
- When selecting caching, scaling, and resilience patterns
- When defining load test scenarios and SLO thresholds

## Steps

### Step 1: Define SLA / SLO / SLI

```markdown
## SLA/SLO Definition: [System Name]

### SLA (external commitment to customers)
Committed uptime: [99% / 99.9% / 99.99% / 99.999%]
Monthly downtime allowed: [calculate: 100% - SLA% × 43,800 min]
SLA violation compensation: [describe penalty/credit]

### SLO (internal target — must be stricter than SLA)
Target uptime: [SLA + 0.05%]
Target latency p95: [X ms]
Target latency p99: [X ms]
Error rate target: [< X%]
Error budget per month: [SLA% - target uptime × 43,800 min]

### SLIs (measurable metrics)
Availability SLI: (successful_requests / total_requests) × 100%
Latency SLI: p95 of HTTP response time (measured at load balancer)
Error rate SLI: (5xx_responses / total_responses) × 100%

### Monitoring and alerting
Alert at: 50% error budget consumed (warning)
Alert at: 75% error budget consumed (critical — freeze risky deploys)
Alert at: 90% error budget consumed (incident — escalate)
```

### Step 2: Select HA deployment pattern

Based on the SLA requirement:

```markdown
## HA Architecture Selection: [System Name]

SLA required: [99.X%]
Selected pattern: [from list below]

### Available patterns (from ENTERPRISE_SCALABILITY rule):
99.0%:   Single region, health checks, auto-restart
99.9%:   Multi-AZ active-passive, health checks, auto-failover
99.95%:  Multi-AZ active-active, blue-green deployments
99.99%:  Multi-AZ active-active + circuit breakers + canary
99.999%: Multi-region active-active + zero-downtime deploys

### Failover configuration
Primary health check: every [X] seconds
Failover trigger: [N] consecutive failures
Failover time: < [X] seconds (must be within RTO)
Failover test: [monthly / quarterly]
```

### Step 3: Design caching strategy

```markdown
## Caching Strategy: [System Name]

### What to cache (and where)
| Data | Cache level | TTL | Invalidation |
|---|---|---|---|
| User session | Redis (L2) | 30 minutes (sliding) | On logout or explicit invalidation |
| User profile | Redis (L2) | 5 minutes | On profile update event |
| Product catalog | CDN + Redis | CDN: 1 hour, Redis: 10 min | On catalog update event |
| API responses | Redis (L2) | 60 seconds | TTL-only (acceptable staleness) |
| Static assets | CDN | 1 year | Content hash in URL |

### Cache invalidation approach
Strategy: [TTL-only / event-driven / manual / hybrid]
Stampede prevention: [probabilistic early expiration / request coalescing]
Cache miss handling: [load from DB, populate cache, serve]
Cache failure handling: [fall through to DB — never fail request due to cache miss]

### Redis configuration
Eviction policy: allkeys-lru (for general cache)
Max memory: [X GB]
Persistence: [RDB snapshots for session data, AOF disabled for cache]
Clustering: [Sentinel for HA / Redis Cluster for sharding]
```

### Step 4: Configure resilience patterns

```markdown
## Resilience Configuration: [Service Name]

### Circuit Breaker
Applied to: [list all external dependencies]
Library: [Resilience4j / opossum / Polly / Hystrix]

Configuration per dependency:
| Dependency | Failure threshold | Open duration | Half-open calls |
|---|---|---|---|
| Payment API | 5 failures / 60s | 30s | 3 |
| Email service | 10 failures / 60s | 60s | 5 |
| Database | N/A — use connection pool + timeout |

### Retry policy
Applied to: [idempotent operations only]
Strategy: exponential backoff with jitter
Base delay: 100ms | Multiplier: 2.0 | Max delay: 10s | Max attempts: 3
Retry on: connection error, 429, 503
Do NOT retry: 400, 401, 403, 404, 422

### Bulkhead (thread pool isolation)
Isolate: one thread pool per external dependency
Max concurrent calls to [Payment API]: [N]
Max concurrent calls to [Email service]: [N]
Queue capacity: [N] (reject when full)

### Timeout hierarchy
DB query: 5s | Internal service: 10s | External API: 15s | User request: 30s
All timeouts configured in code (never rely on defaults)

### Health check implementation
GET /health/liveness  → 200 if process alive (fast, no I/O)
GET /health/readiness → 200 if DB + cache + queue accessible (full check)
GET /health/startup   → 200 when initialization complete (one-time)
```

### Step 5: Define auto-scaling policy

```markdown
## Auto-scaling Policy: [Service Name]

### Scale-out triggers
CPU utilization > 70% for 2 consecutive minutes
Memory utilization > 80% for 2 consecutive minutes
Request queue depth > 100 for 1 minute
Custom metric: [requests/second] > [target per instance]

### Scale-in triggers
CPU utilization < 30% for 5 consecutive minutes (5-minute stabilization window)
Minimum instances: [N] (never go below — HA requirement)

### Scaling limits
Min instances: [2 for HA]
Max instances: [N — cost protection]
Scale-out step: [+2 instances]
Scale-in step: [-1 instance]

### Stateless verification checklist
- [ ] Sessions stored in Redis (not in-process memory)
- [ ] Uploaded files stored in object storage (not local disk)
- [ ] Rate limit counters stored in Redis
- [ ] Background job state stored in job queue
- [ ] No local disk writes from application code
```

### Step 6: Chaos engineering baseline

```markdown
## Chaos Engineering Runbook: [System Name]

Run before first production release with ≥99.9% SLA:

### Experiment 1: Instance failure
Action: Terminate 50% of application instances
Expected: System continues serving requests within 30s
Pass criteria: Error rate stays below SLO threshold

### Experiment 2: Database failover
Action: Kill primary database instance
Expected: Failover to replica completes within RTO
Pass criteria: No data loss (RPO = 0), service restores within RTO

### Experiment 3: Dependency degradation
Action: Introduce 500ms latency on external API
Expected: Circuit breaker activates, fallback response served
Pass criteria: User-facing latency p99 stays within SLO

### Experiment 4: Cache failure
Action: Take Redis offline for 5 minutes
Expected: Application continues using database as fallback
Pass criteria: No 5xx errors, latency increases but stays within degraded SLO

### Experiment 5: High load
Action: Inject 3x normal load for 10 minutes
Expected: Auto-scaling activates, system handles load
Pass criteria: p99 latency < 2× SLO target, no data corruption
```

## Best Practices

1. **SLO stricter than SLA** — Always give yourself buffer before violating the customer commitment
2. **Cache failure = graceful degradation** — Never let a cache miss or failure cause a 5xx
3. **Test chaos before production** — Chaos experiments are mandatory, not optional
4. **Stateless by default** — Any state in the application process is a scaling liability
5. **Circuit breakers everywhere external** — Never trust that an external service is always up
6. **Retry only idempotent operations** — Retrying a non-idempotent operation can cause double-processing
7. **Document your error budget** — Teams need to know when it's safe to deploy
