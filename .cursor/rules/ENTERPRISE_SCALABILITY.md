# ENTERPRISE_SCALABILITY

Reference guide for high-availability (HA) architecture, scalability patterns, and SLA/SLO definitions in enterprise systems.

---

## SLA / SLO / SLI Definitions

Every enterprise system must define measurable targets before architecture:

| Term | Definition | Example |
|---|---|---|
| **SLA** (Service Level Agreement) | External commitment to customers | "99.9% uptime per month" |
| **SLO** (Service Level Objective) | Internal target (stricter than SLA) | "99.95% uptime per month" |
| **SLI** (Service Level Indicator) | The actual measured metric | "Successful requests / total requests" |
| **Error Budget** | Allowed downtime before SLA breach | "99.9% SLA = 43.8 min/month" |

### Availability tiers and their implications

| SLA | Monthly downtime | Quarterly downtime | Architecture required |
|---|---|---|---|
| 99% | 7.3 hours | 21.9 hours | Single-region, no HA required |
| 99.9% | 43.8 minutes | 2.2 hours | Multi-AZ, health checks, auto-restart |
| 99.95% | 21.9 minutes | 65.7 minutes | Active-passive failover, blue-green |
| 99.99% | 4.4 minutes | 13.1 minutes | Active-active, multi-region, circuit breakers |
| 99.999% | 26.3 seconds | 1.6 minutes | Full active-active, zero-downtime deploys |

### SLO Template

```markdown
## SLOs for [System Name]

### Availability SLO
- Target: 99.99% (measured as successful HTTP responses / total requests)
- Measurement window: rolling 30 days
- Exclusions: Planned maintenance windows (max 4 hours/quarter, announced 48h prior)

### Latency SLO
- p50 (median): ≤ 100ms
- p95: ≤ 300ms
- p99: ≤ 1000ms
- Measurement: API gateway response time, excluding network transit

### Error Rate SLO
- Target: < 0.1% 5xx errors over any 5-minute window
- Alerting threshold: > 0.05% (50% of error budget)

### Throughput SLO
- Sustained: 1000 req/s
- Peak (10-minute burst): 5000 req/s
```

---

## High Availability Architecture Patterns

### Multi-AZ Active-Active (99.99% SLA)

```
                    Load Balancer
                    /            \
            Zone A (Primary)    Zone B (Secondary)
            ├── App Server 1    ├── App Server 3
            ├── App Server 2    └── App Server 4
            └── DB Primary ←──→ DB Replica
                    │
                    └──→ Zone C (DR)
                         └── DB Replica (async)
```

**Requirements:**
- Session state: external (Redis Cluster, not in-memory)
- Database: synchronous replication between AZ-A and AZ-B, async to AZ-C
- Load balancer: health checks every 10s, remove unhealthy instance in 30s
- Auto-scaling: scale out at 70% CPU, scale in at 30% CPU (5-minute cooldown)

### Blue-Green Deployment (zero-downtime releases)

```
Router ──→ BLUE (current production) ──→ 100% traffic
           GREEN (new version)        ──→ 0% traffic (warm up)

After validation:
Router ──→ BLUE                       ──→ 0% traffic (kept for rollback)
           GREEN                      ──→ 100% traffic
```

**Requirements:**
- Both environments identical in capacity
- Database migrations must be backward compatible (old code runs against new schema)
- Feature flags to decouple deployment from release
- Automatic rollback if error rate > threshold within 5 minutes of switch

### Canary Deployment (gradual rollout)

```
Day 1:  Router → v1 (95%) + v2 (5%)   — monitor SLIs
Day 2:  Router → v1 (80%) + v2 (20%)  — expand if healthy
Day 3:  Router → v1 (50%) + v2 (50%)  — expand if healthy
Day 4:  Router → v2 (100%)            — complete rollout
```

---

## Horizontal Scaling Patterns

### Stateless Application Design (prerequisite for horizontal scaling)

```
NEVER store in application memory:
- User sessions (use Redis or distributed cache)
- Uploaded files (use object storage: S3, GCS, Azure Blob)
- Locks (use distributed lock: Redis, ZooKeeper)
- Rate limit counters (use shared store)
- Background job state (use job queue: BullMQ, Celery, Sidekiq)
```

### Auto-scaling configuration template

```yaml
# Kubernetes HorizontalPodAutoscaler example
minReplicas: 2       # Never go below 2 (HA requirement)
maxReplicas: 20      # Limit cost exposure
metrics:
  cpu:
    targetUtilization: 70%     # Scale out before saturation
  memory:
    targetUtilization: 80%
  custom:
    requests_per_second:
      target: 500              # Application-level metric
scaleDown:
  stabilizationWindowSeconds: 300  # Wait 5 min before scaling in
```

---

## Caching Strategy

### Cache hierarchy

```
L1: In-process cache (10ms, limited size)
  └─ L2: Distributed cache — Redis / Memcached (1-5ms, large)
       └─ L3: CDN / Edge cache (0ms for static/semi-static)
            └─ L4: Database (10-100ms, source of truth)
```

### Cache decision matrix

| Data type | Cache level | TTL | Invalidation strategy |
|---|---|---|---|
| Static config | L1 + L2 | 1 hour | Manual flush on config change |
| User session | L2 | Session duration | Evict on logout/expiry |
| API responses | L2 + CDN | 60 seconds | Event-driven invalidation |
| Database query | L2 | 30 seconds | Write-through on mutation |
| Static assets | CDN | 1 year | Content-hash versioning |

### Cache invalidation patterns

```
Write-through: Write to cache AND DB simultaneously
  ✓ Cache always consistent  ✗ Higher write latency

Write-behind (write-back): Write to cache first, flush to DB async
  ✓ Lower write latency  ✗ Risk of data loss on crash

Cache-aside (lazy loading): Read from DB on miss, populate cache
  ✓ Simple, resilient  ✗ Cache miss penalty, potential stampede

Event-driven invalidation: Publish event on write → subscribers invalidate
  ✓ Fine-grained, efficient  ✗ More complex infrastructure
```

**Stampede prevention:** Use probabilistic early expiration or request coalescing (single origin request for concurrent cache misses on the same key).

---

## Database Scaling Patterns

### Read scaling (read replicas)

```
Writes → Primary DB
           │
           ├──→ Read Replica 1 (reports, analytics)
           ├──→ Read Replica 2 (API read endpoints)
           └──→ Read Replica 3 (search, exports)
```

Lag monitoring: Alert if replica lag > 1 second. Route to primary if lag is unacceptable for the use case.

### Sharding (horizontal partitioning)

**When to consider:** Single-node DB cannot handle the write throughput or storage volume.

```
Sharding strategies:
├── Range-based: users 1–1M → shard 1, 1M–2M → shard 2 (hot spot risk)
├── Hash-based: hash(user_id) % N_shards (uniform distribution)
└── Directory-based: lookup table maps entity → shard (flexible, extra hop)
```

**Avoid sharding** until genuinely necessary — it adds significant operational complexity. First exhaust: vertical scaling, connection pooling, query optimization, read replicas, archiving.

### Connection pooling

```
Application → PgBouncer (transaction mode) → PostgreSQL
              └─ Pool size: (CPU cores × 2) + spindle count
              └─ Max client connections: pool_size × replicas
              └─ Server connections: optimized for PostgreSQL max_connections
```

---

## Resilience Patterns

### Health check endpoints (mandatory)

Every service MUST expose:

```
GET /health/liveness   → 200 OK if process is alive (used by restart policy)
GET /health/readiness  → 200 OK if ready to receive traffic (used by load balancer)
GET /health/startup    → 200 OK when initialization is complete
```

Liveness checks: minimal (is the process responding?)
Readiness checks: thorough (are DB connections, cache, dependencies healthy?)

### Timeout hierarchy

```
Network timeout < Service timeout < Request timeout < User-facing timeout

Example:
├── DB query timeout: 5 seconds
├── Internal service call timeout: 10 seconds
├── External API timeout: 15 seconds
└── User request timeout: 30 seconds
```

### Retry policy with backoff

```
Base delay: 100ms
Multiplier: 2.0 (exponential)
Max delay: 10 seconds
Jitter: ±20% of calculated delay (prevents thundering herd)
Max attempts: 3

Retry only on: connection errors, 429 (rate limited), 503 (unavailable)
Do NOT retry: 400 (bad request), 401 (auth), 403 (forbidden), 404 (not found)
```

### Chaos Engineering baseline

Before a system reaches production with ≥99.9% SLA, it must survive:

```
Chaos experiments (minimum set):
├── Kill 50% of application instances → system continues serving requests
├── Introduce 500ms latency on DB → p99 stays below SLO
├── Kill primary database → failover completes in < RTO
├── Fill disk to 95% → system alerts and degrades gracefully
└── Inject 10% packet loss → circuit breakers engage, no cascading failure
```
