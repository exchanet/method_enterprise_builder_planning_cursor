# High Availability Pack — Hook Implementations

## detectHARequirements (onPlanningStart)

At planning start, extract HA requirements from the system description:

```markdown
## HA Requirements Detection

Questions to answer from the system description or by asking the user:

1. What is the required SLA? (99% / 99.9% / 99.99% / 99.999%)
2. What is the RTO (Recovery Time Objective)?
3. What is the RPO (Recovery Point Objective)?
4. Is this a multi-region deployment? (yes/no)
5. What are the peak load expectations? (users, requests/second)
6. Are there known traffic patterns? (steady / bursty / seasonal)

Output: Completed SLA/SLO document attached to Phase 2
```

## onPhaseComplete (Phase 2 — NFR)

Contribute the availability and scalability NFR section:

```markdown
## HA / Scalability NFRs (Phase 2 Output)

### SLA/SLO definition
SLA (customer commitment): [X]%
SLO (internal target): [X+0.05]%
Error budget (monthly): [calculated minutes]

### Availability design
Pattern selected: [deployment pattern]
RTO target: [X minutes]
RPO target: [X minutes]

### Scalability targets
Steady state: [N] users / [N] req/s
Peak: [N] users / [N] req/s (burst factor: [N]x)
Scaling strategy: horizontal / vertical / both

### Key HA components
- Load balancer: [provider/type]
- Session storage: Redis (external, not in-process)
- Health checks: /health/liveness, /health/readiness, /health/startup
- Auto-scaling: min=[N], max=[N], scale-out at [N]% CPU
```

## onPhaseComplete (Phase 5 — Architecture)

Contribute HA architectural decisions:

```markdown
## HA Architecture Decisions (Phase 5 Output)

### Resilience components to implement
- [ ] Circuit breaker on all external dependencies
- [ ] Retry with exponential backoff + jitter (idempotent operations only)
- [ ] Bulkhead: isolated thread pools per downstream service
- [ ] Timeout hierarchy: DB [5s] → internal [10s] → external [15s] → user [30s]

### Caching architecture
Strategy: [cache-aside / write-through / event-driven]
Cache: Redis [Sentinel for HA / Cluster for sharding]
Key data cached: [list with TTLs]

### Deployment architecture (ADR)
→ ADR-00N: [Deployment Pattern] selected for [N]% SLA
[C4 L2 diagram with HA topology]

### Chaos engineering runbook
[5 required experiments with pass criteria]
Scheduled: Before first production release with HA SLA
```

## deliveryReportSection (onDeliveryReportGenerate)

HA section of the delivery report:

```markdown
## High Availability Sign-off

### SLA/SLO compliance
Target SLA: [X]% | Measured (staging): [X]%
p95 latency: [X]ms (target: [X]ms) ✓/✗
p99 latency: [X]ms (target: [X]ms) ✓/✗
Error rate: [X]% (target: [X]%) ✓/✗

### Resilience patterns implemented
- [ ] Circuit breaker: ✓ configured for [N] dependencies
- [ ] Retry policy: ✓ idempotent operations only
- [ ] Health checks: ✓ all 3 endpoints implemented
- [ ] Auto-scaling: ✓ min=[N], max=[N]

### Chaos experiments completed
- [ ] Instance failure: PASS/FAIL
- [ ] Database failover: PASS/FAIL
- [ ] Dependency degradation: PASS/FAIL
- [ ] Cache failure: PASS/FAIL
- [ ] High load spike: PASS/FAIL

### HA sign-off: [APPROVED / BLOCKED]
```
