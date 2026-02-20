# Sub-skill: Testing Strategy

## Purpose

Define and implement the complete enterprise test strategy: pyramid allocation, coverage requirements, test templates per layer, quality gates, and performance test scenarios.

## When to Use

- Phase 7 (Test Strategy) of METHOD-ENTERPRISE-BUILDER-PLANNING
- Before writing any implementation code (TDD approach)
- When configuring CI/CD quality gates
- When defining load test scenarios for SLO validation

## Steps

### Step 1: Define the test pyramid allocation

```markdown
## Test Pyramid: [System/Feature Name]

| Layer | Target % of tests | Coverage requirement | Blocking |
|---|---|---|---|
| Unit | 70% | ≥99% line + branch coverage | YES |
| Integration | 20% | 100% integration points | YES |
| E2E | 7% | 100% critical user journeys | YES |
| Chaos/Load | 3% | All SLO scenarios validated | YES |

### Test toolchain
Unit: [Jest/Vitest (TS) | pytest (Python) | go test (Go)]
Integration: [Supertest + Testcontainers | pytest + docker-compose]
E2E: [Playwright | Cypress]
Load: [k6 | Artillery | Locust]
Security: [OWASP ZAP | Semgrep | Snyk]
Coverage: [c8/Istanbul (TS) | coverage.py (Python)]
```

> **Coverage floor vs quality ceiling:** ≥99% line/branch coverage is required as a minimum, but coverage alone does not equal test quality. Always verify that assertions check meaningful behavior — if introducing a bug in the covered code would not cause a test to fail, the test is not providing value regardless of coverage numbers.

### Step 2: Write unit test specification

For every function/method in the backlog, specify the required tests:

```markdown
## Unit Test Specification: [Function/Class Name]

### Happy path tests
1. [Valid input scenario A] → [expected output]
2. [Valid input scenario B] → [expected output]

### Error / exception tests
1. [Invalid input] → throws [ExceptionType] with message [expected message]
2. [Missing required field] → throws [ValidationError]
3. [Out-of-range value] → throws [RangeError]

### Edge case tests
1. [Minimum valid value] → [expected behavior]
2. [Maximum valid value] → [expected behavior]
3. [Empty collection/string] → [expected behavior]
4. [null / undefined (if applicable)] → [expected behavior]

### Security tests (if applicable)
1. [SQL injection in string field] → rejected, throws ValidationError
2. [XSS payload in text field] → sanitized or rejected
3. [Oversized payload] → rejected, throws PayloadTooLargeError

### Concurrent/race condition tests (if applicable)
1. [Two concurrent writes to same resource] → [only one succeeds / both succeed idempotently]

### Coverage target: ≥99% lines + branches
```

### Step 3: Define integration test scenarios

```markdown
## Integration Test Scenarios: [Service/Module Name]

### Database integration
- [ ] Create entity → persists correctly with all fields
- [ ] Read entity → returns correct data
- [ ] Update entity → modifies correct fields, leaves others unchanged
- [ ] Delete entity → removes record (or soft-deletes correctly)
- [ ] Transaction rollback → no partial writes when step fails
- [ ] Concurrent writes → no data corruption under concurrency
- [ ] DB constraint violation → correct error propagated to application

### Cache integration
- [ ] Cache miss → loads from DB, populates cache
- [ ] Cache hit → returns cached value, DB not called
- [ ] Cache expiry → loads fresh data from DB
- [ ] Cache invalidation → stale data cleared on write
- [ ] Cache unavailable → falls through to DB gracefully

### External API integration
- [ ] Successful response → correctly processed
- [ ] 4xx response → appropriate application error
- [ ] 5xx response → circuit breaker or retry logic activated
- [ ] Timeout → handled within timeout budget, fallback returned
- [ ] Network failure → retry with backoff, circuit breaker if threshold reached

### Message queue integration
- [ ] Message published → arrives in queue with correct schema
- [ ] Message consumed → processed exactly once
- [ ] Message processing fails → message goes to dead-letter queue
- [ ] Dead-letter queue → processed by retry handler
```

### Step 4: Document critical user journeys for E2E

```markdown
## Critical User Journeys (CUJ): [System Name]

| CUJ ID | Journey Name | Priority | Steps | E2E Test |
|---|---|---|---|---|
| CUJ-001 | [User registration → first login] | Critical | [N steps] | [ ] |
| CUJ-002 | [Core business transaction] | Critical | [N steps] | [ ] |
| CUJ-003 | [Data export / GDPR request] | Compliance | [N steps] | [ ] |
| CUJ-004 | [Admin: user management] | High | [N steps] | [ ] |
| CUJ-005 | [Error recovery scenario] | High | [N steps] | [ ] |

All Critical and Compliance journeys: mandatory before production release
High priority journeys: mandatory before production release
Medium priority journeys: nice-to-have
```

### Step 5: Define load test scenarios

```markdown
## Load Test Plan: [System Name]

### Test environment
- Target: staging environment (production-equivalent infrastructure)
- Tool: [k6 / Artillery / Locust]
- Data: anonymized production-scale dataset OR generated test data

### Scenario 1: Baseline (normal load)
Duration: 5 minutes
Users: [N] (normal operating load)
Pass criteria:
  - p95 latency < [X ms] (SLO threshold)
  - p99 latency < [X ms] (SLO threshold)
  - Error rate < 0.1%
  - All instances healthy at end

### Scenario 2: Sustained load
Duration: 30 minutes
Users: [target load] (SLO-defined throughput)
Pass criteria: Same as baseline, no performance degradation over time

### Scenario 3: Spike test
Ramp: normal → 5× normal in 2 minutes
Duration: 5 minutes at peak
Pass criteria: Error rate stays < 1%, system recovers to baseline within 5 minutes

### Scenario 4: Soak test
Duration: 8 hours
Users: 70% of target load
Pass criteria: No memory leak (memory stable), no performance degradation

### Scenario 5: Stress test (find the breaking point)
Ramp: increase load until failure
Pass criteria: Failure is graceful (circuit breakers, queue backpressure — NOT crashes), system recovers when load drops
```

### Step 6: Configure CI quality gates

```markdown
## CI Quality Gate Configuration: [Project]

### Gates (all must pass — blocks merge on failure)

unit_tests:
  coverage_minimum: 99%
  fail_on: test_failure OR coverage_below_threshold

integration_tests:
  required: true
  fail_on: any_failure

security_scan:
  tools: [snyk, semgrep]
  fail_on: critical OR high severity

static_analysis:
  max_cyclomatic_complexity: 10
  max_duplication: 3%
  fail_on: threshold_exceeded

secrets_scan:
  fail_on: any_secret_detected

dependency_audit:
  fail_on: critical severity

### Gates (warn only — does not block merge)
performance_benchmark:
  warn_if: regression > 10% vs baseline

accessibility:
  warn_if: WCAG AA violations found
```

## Test Report Format

After every feature completion, produce this report:

```markdown
## Test Report: [Feature/Module Name]
**Date:** [YYYY-MM-DD]
**Commit:** [hash]

### Summary
| Category | Tests | Passed | Failed | Coverage |
|---|---|---|---|---|
| Unit | [N] | [N] | 0 | ≥99% |
| Integration | [N] | [N] | 0 | 100% of integration points |
| E2E | [N] | [N] | 0 | 100% of CUJs |
| Security | [N] | [N] | 0 | All OWASP surfaces |
| Performance | [N scenarios] | [N] | 0 | All SLOs met |

### Coverage detail
[Paste coverage tool output here]

### Performance results
| Scenario | p50 | p95 | p99 | Error rate | Pass? |
|---|---|---|---|---|---|
| Baseline | [X ms] | [X ms] | [X ms] | [X%] | YES |
| Spike | [X ms] | [X ms] | [X ms] | [X%] | YES |

### Security scan results
Critical: 0 | High: 0 | Medium: [N] (accepted/mitigated)

### Status: PASSED / FAILED
```

## Best Practices

1. **Tests before code (TDD)** — Write the test specification before implementation
2. **Real infrastructure in integration tests** — Use Testcontainers or docker-compose; mock only external third-party APIs
3. **E2E tests for journeys, not features** — E2E tests verify user value, not technical implementation
4. **Load test on staging with production scale** — Testing on an undersized environment is worthless
5. **Never delete a test** — If a test is no longer needed, mark it skipped with a comment explaining why
6. **Flaky tests are bugs** — A flaky test is worse than no test; fix or delete immediately
7. **Coverage is a floor, not a ceiling** — 99% means nothing if the tests don't assert meaningful behavior
